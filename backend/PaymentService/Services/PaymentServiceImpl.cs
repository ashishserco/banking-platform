using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Banking.Shared.Models;
using Banking.Shared.Events;
using PaymentService.Data;
using PaymentService.DTOs;
using PaymentService.Models;
using Azure.Messaging.ServiceBus;
using System.Text.Json;

namespace PaymentService.Services;

public class PaymentServiceImpl : IPaymentService
{
    private readonly PaymentDbContext _context;
    private readonly IExternalPaymentGateway _paymentGateway;
    private readonly IDistributedCache _cache;
    private readonly ServiceBusSender _eventPublisher;
    private readonly ILogger<PaymentServiceImpl> _logger;

    public PaymentServiceImpl(
        PaymentDbContext context,
        IExternalPaymentGateway paymentGateway,
        IDistributedCache cache,
        ServiceBusSender eventPublisher,
        ILogger<PaymentServiceImpl> logger)
    {
        _context = context;
        _paymentGateway = paymentGateway;
        _cache = cache;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task<Result<PaymentDto>> ProcessPaymentAsync(ProcessPaymentRequest request)
    {
        // Check for duplicate payment using idempotency key
        var existingPayment = await _context.Payments
            .Include(p => p.Beneficiary)
            .FirstOrDefaultAsync(p => p.IdempotencyKey == request.IdempotencyKey);

        if (existingPayment != null)
        {
            _logger.LogInformation("Duplicate payment detected: {IdempotencyKey}", request.IdempotencyKey);
            return Result<PaymentDto>.Success(MapToPaymentDto(existingPayment));
        }

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Validate beneficiary
            var beneficiary = await _context.PaymentBeneficiaries
                .FirstOrDefaultAsync(b => b.BeneficiaryId == request.BeneficiaryId && b.IsActive);

            if (beneficiary == null)
            {
                return Result<PaymentDto>.Failure("Beneficiary not found or inactive");
            }

            // Create payment record
            var payment = new Payment
            {
                IdempotencyKey = request.IdempotencyKey,
                SourceAccountNumber = request.SourceAccountNumber,
                PaymentType = request.PaymentType,
                Amount = request.Amount,
                Currency = request.Currency,
                Description = request.Description ?? $"{request.PaymentType} to {beneficiary.Name}",
                ReferenceNumber = GenerateReferenceNumber(),
                CorrelationId = request.CorrelationId,
                BeneficiaryId = beneficiary.BeneficiaryId,
                ExternalGateway = "PRIMARY_GATEWAY"
            };

            _context.Payments.Add(payment);
            
            // Record payment event
            await RecordEventAsync(payment.PaymentId, "PaymentCreated", new
            {
                PaymentId = payment.PaymentId,
                Type = payment.PaymentType,
                Amount = payment.Amount,
                Source = payment.SourceAccountNumber,
                Beneficiary = beneficiary.Name
            });

            payment.MarkAsProcessing();
            await _context.SaveChangesAsync();

            // Check for duplicate external gateway call
            var gatewayIdempotencyKey = $"{request.IdempotencyKey}_GATEWAY";
            var existingGatewayCall = await GetOrCreateExternalCallIdempotency(
                gatewayIdempotencyKey, "PRIMARY_GATEWAY", "PAYMENT");

            ExternalPaymentResponse? gatewayResponse = null;

            if (existingGatewayCall.Status == "COMPLETED")
            {
                // Use cached response
                gatewayResponse = JsonSerializer.Deserialize<ExternalPaymentResponse>(existingGatewayCall.Response!);
                _logger.LogInformation("Using cached gateway response for payment {PaymentId}", payment.PaymentId);
            }
            else
            {
                // Call external gateway
                var gatewayRequest = new ExternalPaymentRequest
                {
                    IdempotencyKey = gatewayIdempotencyKey,
                    SourceAccount = request.SourceAccountNumber,
                    DestinationAccount = beneficiary.AccountNumber ?? beneficiary.BeneficiaryId.ToString(),
                    Amount = request.Amount,
                    Currency = request.Currency,
                    PaymentType = request.PaymentType,
                    Description = payment.Description,
                    AdditionalData = request.PaymentDetails
                };

                var gatewayResult = await _paymentGateway.ProcessPaymentAsync(gatewayRequest);
                
                if (!gatewayResult.IsSuccess)
                {
                    payment.MarkAsFailed($"Gateway error: {gatewayResult.ErrorMessage}");
                    existingGatewayCall.Status = "FAILED";
                    existingGatewayCall.Response = JsonSerializer.Serialize(new { Error = gatewayResult.ErrorMessage });
                    existingGatewayCall.CompletedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    await dbTransaction.RollbackAsync();
                    
                    return Result<PaymentDto>.Failure($"Payment processing failed: {gatewayResult.ErrorMessage}");
                }

                gatewayResponse = gatewayResult.Data!;
                
                // Cache gateway response
                existingGatewayCall.Status = "COMPLETED";
                existingGatewayCall.Response = JsonSerializer.Serialize(gatewayResponse);
                existingGatewayCall.CompletedAt = DateTime.UtcNow;
            }

            // Process gateway response
            if (gatewayResponse.IsSuccess && gatewayResponse.Status == "COMPLETED")
            {
                payment.MarkAsCompleted(gatewayResponse.TransactionId);
                payment.ExternalTransactionId = gatewayResponse.TransactionId;
                payment.ExternalResponse = JsonSerializer.Serialize(gatewayResponse);

                await RecordEventAsync(payment.PaymentId, "PaymentCompleted", new
                {
                    PaymentId = payment.PaymentId,
                    ExternalTransactionId = gatewayResponse.TransactionId,
                    Status = "COMPLETED"
                });

                // Publish payment completed event
                var paymentCompletedEvent = new PaymentCompletedEvent
                {
                    PaymentId = payment.PaymentId,
                    SourceAccountNumber = payment.SourceAccountNumber,
                    Amount = payment.Amount,
                    Currency = payment.Currency,
                    PaymentType = payment.PaymentType,
                    BeneficiaryName = beneficiary.Name,
                    ExternalTransactionId = gatewayResponse.TransactionId,
                    CompletedAt = payment.CompletedAt!.Value
                };

                await PublishEventAsync(paymentCompletedEvent);
            }
            else
            {
                payment.MarkAsFailed($"Gateway processing failed: {gatewayResponse.ErrorMessage}");
                payment.ExternalResponse = JsonSerializer.Serialize(gatewayResponse);
            }

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            _logger.LogInformation("Payment processed: {PaymentId} - Status: {Status} - External ID: {ExternalId}",
                payment.PaymentId, payment.Status, payment.ExternalTransactionId);

            return Result<PaymentDto>.Success(MapToPaymentDto(payment));
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            _logger.LogError(ex, "Error processing payment: {IdempotencyKey}", request.IdempotencyKey);
            return Result<PaymentDto>.Failure("Failed to process payment");
        }
    }

    public async Task<Result<PaymentDto>> ProcessBillPaymentAsync(BillPaymentRequest request)
    {
        // Check for duplicate payment
        var existingPayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.IdempotencyKey == request.IdempotencyKey);

        if (existingPayment != null)
        {
            return Result<PaymentDto>.Success(MapToPaymentDto(existingPayment));
        }

        try
        {
            // Create bill payment record
            var payment = new Payment
            {
                IdempotencyKey = request.IdempotencyKey,
                SourceAccountNumber = request.SourceAccountNumber,
                PaymentType = "BILL_PAYMENT",
                Amount = request.Amount,
                Currency = request.Currency,
                Description = request.Description ?? $"Bill payment for {request.BillNumber}",
                ReferenceNumber = GenerateReferenceNumber(),
                ExternalGateway = "BILL_GATEWAY"
            };

            _context.Payments.Add(payment);
            payment.MarkAsProcessing();
            await _context.SaveChangesAsync();

            // Process bill payment through external gateway
            var gatewayRequest = new ExternalBillPaymentRequest
            {
                IdempotencyKey = $"{request.IdempotencyKey}_BILL",
                SourceAccount = request.SourceAccountNumber,
                BillerId = request.BillerId,
                BillNumber = request.BillNumber,
                Amount = request.Amount,
                Currency = request.Currency,
                Description = payment.Description
            };

            var gatewayResult = await _paymentGateway.ProcessBillPaymentAsync(gatewayRequest);
            
            if (!gatewayResult.IsSuccess)
            {
                payment.MarkAsFailed($"Bill payment failed: {gatewayResult.ErrorMessage}");
                await _context.SaveChangesAsync();
                return Result<PaymentDto>.Failure($"Bill payment failed: {gatewayResult.ErrorMessage}");
            }

            var gatewayResponse = gatewayResult.Data!;
            payment.MarkAsCompleted(gatewayResponse.TransactionId);
            payment.ExternalTransactionId = gatewayResponse.TransactionId;
            payment.ExternalResponse = JsonSerializer.Serialize(gatewayResponse);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Bill payment completed: {PaymentId} - Bill: {BillNumber}",
                payment.PaymentId, request.BillNumber);

            return Result<PaymentDto>.Success(MapToPaymentDto(payment));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing bill payment: {IdempotencyKey}", request.IdempotencyKey);
            return Result<PaymentDto>.Failure("Failed to process bill payment");
        }
    }

    public async Task<Result<PaymentDto>> ProcessMobileRechargeAsync(MobileRechargeRequest request)
    {
        // Check for duplicate payment
        var existingPayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.IdempotencyKey == request.IdempotencyKey);

        if (existingPayment != null)
        {
            return Result<PaymentDto>.Success(MapToPaymentDto(existingPayment));
        }

        try
        {
            // Create mobile recharge record
            var payment = new Payment
            {
                IdempotencyKey = request.IdempotencyKey,
                SourceAccountNumber = request.SourceAccountNumber,
                PaymentType = "MOBILE_RECHARGE",
                Amount = request.Amount,
                Currency = request.Currency,
                Description = $"Mobile recharge for {request.MobileNumber} ({request.Operator})",
                ReferenceNumber = GenerateReferenceNumber(),
                ExternalGateway = "TELECOM_GATEWAY"
            };

            _context.Payments.Add(payment);
            payment.MarkAsProcessing();
            await _context.SaveChangesAsync();

            // Process mobile recharge through external gateway
            var gatewayRequest = new ExternalMobileRechargeRequest
            {
                IdempotencyKey = $"{request.IdempotencyKey}_MOBILE",
                SourceAccount = request.SourceAccountNumber,
                MobileNumber = request.MobileNumber,
                Operator = request.Operator,
                Amount = request.Amount,
                Currency = request.Currency
            };

            var gatewayResult = await _paymentGateway.ProcessMobileRechargeAsync(gatewayRequest);
            
            if (!gatewayResult.IsSuccess)
            {
                payment.MarkAsFailed($"Mobile recharge failed: {gatewayResult.ErrorMessage}");
                await _context.SaveChangesAsync();
                return Result<PaymentDto>.Failure($"Mobile recharge failed: {gatewayResult.ErrorMessage}");
            }

            var gatewayResponse = gatewayResult.Data!;
            payment.MarkAsCompleted(gatewayResponse.TransactionId);
            payment.ExternalTransactionId = gatewayResponse.TransactionId;
            payment.ExternalResponse = JsonSerializer.Serialize(gatewayResponse);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Mobile recharge completed: {PaymentId} - Mobile: {MobileNumber}",
                payment.PaymentId, request.MobileNumber);

            return Result<PaymentDto>.Success(MapToPaymentDto(payment));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing mobile recharge: {IdempotencyKey}", request.IdempotencyKey);
            return Result<PaymentDto>.Failure("Failed to process mobile recharge");
        }
    }

    public async Task<Result<PaymentDto>> GetPaymentAsync(Guid paymentId)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Beneficiary)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null)
            {
                return Result<PaymentDto>.Failure("Payment not found");
            }

            return Result<PaymentDto>.Success(MapToPaymentDto(payment));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment {PaymentId}", paymentId);
            return Result<PaymentDto>.Failure("Failed to retrieve payment");
        }
    }

    public async Task<Result<PaymentDto>> GetPaymentByIdempotencyKeyAsync(string idempotencyKey)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Beneficiary)
                .FirstOrDefaultAsync(p => p.IdempotencyKey == idempotencyKey);

            if (payment == null)
            {
                return Result<PaymentDto>.Failure("Payment not found");
            }

            return Result<PaymentDto>.Success(MapToPaymentDto(payment));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payment by idempotency key {IdempotencyKey}", idempotencyKey);
            return Result<PaymentDto>.Failure("Failed to retrieve payment");
        }
    }

    public async Task<Result<List<PaymentDto>>> SearchPaymentsAsync(PaymentSearchRequest request)
    {
        try
        {
            var query = _context.Payments.Include(p => p.Beneficiary).AsQueryable();

            if (!string.IsNullOrEmpty(request.SourceAccountNumber))
            {
                query = query.Where(p => p.SourceAccountNumber == request.SourceAccountNumber);
            }

            if (!string.IsNullOrEmpty(request.PaymentType))
            {
                query = query.Where(p => p.PaymentType == request.PaymentType);
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                query = query.Where(p => p.Status == request.Status);
            }

            if (request.BeneficiaryId.HasValue)
            {
                query = query.Where(p => p.BeneficiaryId == request.BeneficiaryId.Value);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(p => p.CreatedAt <= request.ToDate.Value);
            }

            if (request.MinAmount.HasValue)
            {
                query = query.Where(p => p.Amount >= request.MinAmount.Value);
            }

            if (request.MaxAmount.HasValue)
            {
                query = query.Where(p => p.Amount <= request.MaxAmount.Value);
            }

            var payments = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var paymentDtos = payments.Select(MapToPaymentDto).ToList();
            return Result<List<PaymentDto>>.Success(paymentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching payments");
            return Result<List<PaymentDto>>.Failure("Failed to search payments");
        }
    }

    public async Task<Result> CancelPaymentAsync(Guid paymentId, string reason)
    {
        try
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                return Result.Failure("Payment not found");
            }

            payment.Cancel(reason);
            await _context.SaveChangesAsync();

            await RecordEventAsync(paymentId, "PaymentCancelled", new { Reason = reason });

            _logger.LogInformation("Payment cancelled: {PaymentId} - {Reason}", paymentId, reason);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling payment {PaymentId}", paymentId);
            return Result.Failure("Failed to cancel payment");
        }
    }

    public async Task<Result<List<PaymentDto>>> GetAccountPaymentsAsync(string accountNumber, int pageSize = 50, int pageNumber = 1)
    {
        try
        {
            var payments = await _context.Payments
                .Include(p => p.Beneficiary)
                .Where(p => p.SourceAccountNumber == accountNumber)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var paymentDtos = payments.Select(MapToPaymentDto).ToList();
            return Result<List<PaymentDto>>.Success(paymentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving payments for account {AccountNumber}", accountNumber);
            return Result<List<PaymentDto>>.Failure("Failed to retrieve account payments");
        }
    }

    public async Task<Result<PaymentDto>> RefundPaymentAsync(Guid paymentId, string reason)
    {
        try
        {
            var originalPayment = await _context.Payments.FindAsync(paymentId);
            if (originalPayment == null)
            {
                return Result<PaymentDto>.Failure("Original payment not found");
            }

            if (originalPayment.Status != "COMPLETED")
            {
                return Result<PaymentDto>.Failure("Can only refund completed payments");
            }

            // Call external gateway for refund
            var refundRequest = new ExternalRefundRequest
            {
                IdempotencyKey = $"REFUND_{paymentId}_{DateTime.UtcNow.Ticks}",
                OriginalTransactionId = originalPayment.ExternalTransactionId!,
                RefundAmount = originalPayment.Amount,
                Reason = reason
            };

            var gatewayResult = await _paymentGateway.RefundPaymentAsync(refundRequest);
            
            if (!gatewayResult.IsSuccess)
            {
                return Result<PaymentDto>.Failure($"Refund failed: {gatewayResult.ErrorMessage}");
            }

            // Create refund payment record
            var refundPayment = new Payment
            {
                IdempotencyKey = refundRequest.IdempotencyKey,
                SourceAccountNumber = originalPayment.SourceAccountNumber,
                PaymentType = "REFUND",
                Amount = originalPayment.Amount,
                Currency = originalPayment.Currency,
                Description = $"Refund for payment {originalPayment.PaymentId}: {reason}",
                ReferenceNumber = GenerateReferenceNumber(),
                ExternalGateway = originalPayment.ExternalGateway,
                ExternalTransactionId = gatewayResult.Data!.TransactionId,
                Status = "COMPLETED",
                CompletedAt = DateTime.UtcNow
            };

            _context.Payments.Add(refundPayment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment refunded: {OriginalPaymentId} -> {RefundPaymentId}",
                paymentId, refundPayment.PaymentId);

            return Result<PaymentDto>.Success(MapToPaymentDto(refundPayment));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for payment {PaymentId}", paymentId);
            return Result<PaymentDto>.Failure("Failed to process refund");
        }
    }

    private static string GenerateReferenceNumber()
    {
        return $"PAY{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(100000, 999999)}";
    }

    private async Task<ExternalCallIdempotency> GetOrCreateExternalCallIdempotency(
        string idempotencyKey, string gateway, string callType)
    {
        var existing = await _context.ExternalCallIdempotencies
            .FirstOrDefaultAsync(e => e.IdempotencyKey == idempotencyKey);

        if (existing == null)
        {
            existing = new ExternalCallIdempotency
            {
                IdempotencyKey = idempotencyKey,
                Gateway = gateway,
                CallType = callType,
                Status = "PENDING"
            };

            _context.ExternalCallIdempotencies.Add(existing);
            await _context.SaveChangesAsync();
        }

        return existing;
    }

    private async Task RecordEventAsync(Guid paymentId, string eventType, object eventData)
    {
        try
        {
            var paymentEvent = new PaymentEvent
            {
                PaymentId = paymentId,
                EventType = eventType,
                EventData = JsonSerializer.Serialize(eventData)
            };

            _context.PaymentEvents.Add(paymentEvent);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record event {EventType} for payment {PaymentId}", 
                eventType, paymentId);
        }
    }

    private async Task PublishEventAsync(IEvent @event)
    {
        try
        {
            var message = new ServiceBusMessage(JsonSerializer.Serialize(@event))
            {
                Subject = @event.EventType,
                MessageId = @event.EventId.ToString(),
                ContentType = "application/json"
            };

            await _eventPublisher.SendMessageAsync(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish event {EventType}", @event.EventType);
        }
    }

    private static PaymentDto MapToPaymentDto(Payment payment)
    {
        return new PaymentDto
        {
            PaymentId = payment.PaymentId,
            IdempotencyKey = payment.IdempotencyKey,
            SourceAccountNumber = payment.SourceAccountNumber,
            PaymentType = payment.PaymentType,
            Amount = payment.Amount,
            Currency = payment.Currency,
            Status = payment.Status,
            Description = payment.Description,
            ReferenceNumber = payment.ReferenceNumber,
            CorrelationId = payment.CorrelationId,
            CreatedAt = payment.CreatedAt,
            ProcessedAt = payment.ProcessedAt,
            CompletedAt = payment.CompletedAt,
            FailureReason = payment.FailureReason,
            ExternalTransactionId = payment.ExternalTransactionId,
            ExternalGateway = payment.ExternalGateway,
            Beneficiary = payment.Beneficiary != null ? new PaymentBeneficiaryDto
            {
                BeneficiaryId = payment.Beneficiary.BeneficiaryId,
                Name = payment.Beneficiary.Name,
                BeneficiaryType = payment.Beneficiary.BeneficiaryType,
                AccountNumber = payment.Beneficiary.AccountNumber,
                BankCode = payment.Beneficiary.BankCode,
                Email = payment.Beneficiary.Email,
                PhoneNumber = payment.Beneficiary.PhoneNumber,
                Address = payment.Beneficiary.Address,
                CreatedAt = payment.Beneficiary.CreatedAt,
                IsActive = payment.Beneficiary.IsActive
            } : null
        };
    }
}

// Payment events for messaging
public class PaymentCompletedEvent : IEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid();
    public DateTime OccuredAt { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = nameof(PaymentCompletedEvent);
    
    public Guid PaymentId { get; set; }
    public string SourceAccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentType { get; set; } = string.Empty;
    public string BeneficiaryName { get; set; } = string.Empty;
    public string? ExternalTransactionId { get; set; }
    public DateTime CompletedAt { get; set; }
}