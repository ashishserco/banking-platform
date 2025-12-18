using Banking.Shared.Models;

namespace PaymentService.Services;

public class MockExternalPaymentGateway : IExternalPaymentGateway
{
    private readonly ILogger<MockExternalPaymentGateway> _logger;
    private readonly Random _random = new();

    public MockExternalPaymentGateway(ILogger<MockExternalPaymentGateway> logger)
    {
        _logger = logger;
    }

    public async Task<Result<ExternalPaymentResponse>> ProcessPaymentAsync(ExternalPaymentRequest request)
    {
        _logger.LogInformation("Processing external payment: {IdempotencyKey} - {Amount} {Currency}",
            request.IdempotencyKey, request.Amount, request.Currency);

        // Simulate processing delay
        await Task.Delay(_random.Next(500, 2000));

        // Simulate occasional failures (5% failure rate)
        if (_random.NextDouble() < 0.05)
        {
            var errorResponse = new ExternalPaymentResponse
            {
                IsSuccess = false,
                TransactionId = "",
                Status = "FAILED",
                ErrorCode = "GATEWAY_ERROR",
                ErrorMessage = "External gateway temporarily unavailable",
                ProcessedAt = DateTime.UtcNow
            };

            return Result<ExternalPaymentResponse>.Failure("Gateway processing failed");
        }

        // Generate mock successful response
        var response = new ExternalPaymentResponse
        {
            IsSuccess = true,
            TransactionId = $"EXT_{DateTime.UtcNow:yyyyMMddHHmmss}_{_random.Next(1000, 9999)}",
            Status = "COMPLETED",
            ProcessedAt = DateTime.UtcNow,
            AdditionalData = new Dictionary<string, string>
            {
                ["gateway_fee"] = (request.Amount * 0.02m).ToString("F2"),
                ["settlement_date"] = DateTime.UtcNow.AddBusinessDays(1).ToString("yyyy-MM-dd")
            }
        };

        _logger.LogInformation("External payment completed: {TransactionId}", response.TransactionId);
        return Result<ExternalPaymentResponse>.Success(response);
    }

    public async Task<Result<ExternalPaymentResponse>> ProcessBillPaymentAsync(ExternalBillPaymentRequest request)
    {
        _logger.LogInformation("Processing bill payment: {BillerId}/{BillNumber} - {Amount}",
            request.BillerId, request.BillNumber, request.Amount);

        await Task.Delay(_random.Next(1000, 3000));

        // Simulate bill validation failure (3% failure rate)
        if (_random.NextDouble() < 0.03)
        {
            return Result<ExternalPaymentResponse>.Failure("Bill number not found or invalid");
        }

        var response = new ExternalPaymentResponse
        {
            IsSuccess = true,
            TransactionId = $"BILL_{DateTime.UtcNow:yyyyMMddHHmmss}_{_random.Next(1000, 9999)}",
            Status = "COMPLETED",
            ProcessedAt = DateTime.UtcNow,
            AdditionalData = new Dictionary<string, string>
            {
                ["biller_name"] = GetBillerName(request.BillerId),
                ["bill_due_date"] = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd"),
                ["confirmation_number"] = $"CONF_{_random.Next(100000, 999999)}"
            }
        };

        return Result<ExternalPaymentResponse>.Success(response);
    }

    public async Task<Result<ExternalPaymentResponse>> ProcessMobileRechargeAsync(ExternalMobileRechargeRequest request)
    {
        _logger.LogInformation("Processing mobile recharge: {MobileNumber}/{Operator} - {Amount}",
            request.MobileNumber, request.Operator, request.Amount);

        await Task.Delay(_random.Next(500, 1500));

        // Simulate mobile number validation failure (2% failure rate)
        if (_random.NextDouble() < 0.02)
        {
            return Result<ExternalPaymentResponse>.Failure("Invalid mobile number or operator");
        }

        var response = new ExternalPaymentResponse
        {
            IsSuccess = true,
            TransactionId = $"MOB_{DateTime.UtcNow:yyyyMMddHHmmss}_{_random.Next(1000, 9999)}",
            Status = "COMPLETED",
            ProcessedAt = DateTime.UtcNow,
            AdditionalData = new Dictionary<string, string>
            {
                ["recharge_amount"] = request.Amount.ToString("F2"),
                ["validity_days"] = GetValidityDays(request.Amount).ToString(),
                ["operator_ref"] = $"OP_{_random.Next(1000000, 9999999)}"
            }
        };

        return Result<ExternalPaymentResponse>.Success(response);
    }

    public async Task<Result<ExternalPaymentResponse>> RefundPaymentAsync(ExternalRefundRequest request)
    {
        _logger.LogInformation("Processing refund: {OriginalTransactionId} - {RefundAmount}",
            request.OriginalTransactionId, request.RefundAmount);

        await Task.Delay(_random.Next(1000, 2500));

        // Simulate refund failure (1% failure rate)
        if (_random.NextDouble() < 0.01)
        {
            return Result<ExternalPaymentResponse>.Failure("Refund not allowed for this transaction");
        }

        var response = new ExternalPaymentResponse
        {
            IsSuccess = true,
            TransactionId = $"REF_{DateTime.UtcNow:yyyyMMddHHmmss}_{_random.Next(1000, 9999)}",
            Status = "COMPLETED",
            ProcessedAt = DateTime.UtcNow,
            AdditionalData = new Dictionary<string, string>
            {
                ["original_transaction"] = request.OriginalTransactionId,
                ["refund_reason"] = request.Reason,
                ["estimated_settlement"] = DateTime.UtcNow.AddBusinessDays(3).ToString("yyyy-MM-dd")
            }
        };

        return Result<ExternalPaymentResponse>.Success(response);
    }

    public async Task<Result<ExternalPaymentStatusResponse>> GetPaymentStatusAsync(string externalTransactionId)
    {
        _logger.LogInformation("Checking payment status: {ExternalTransactionId}", externalTransactionId);

        await Task.Delay(_random.Next(200, 800));

        var response = new ExternalPaymentStatusResponse
        {
            TransactionId = externalTransactionId,
            Status = "COMPLETED", // For simplicity, all transactions are completed
            LastUpdated = DateTime.UtcNow.AddMinutes(-_random.Next(1, 60)),
            Description = "Transaction processed successfully"
        };

        return Result<ExternalPaymentStatusResponse>.Success(response);
    }

    private static string GetBillerName(string billerId)
    {
        return billerId switch
        {
            "UTIL001" => "Electric Utility Company",
            "UTIL002" => "Water & Sewer Department",
            "UTIL003" => "Natural Gas Company",
            "TEL001" => "City Telecom Services",
            "INS001" => "Auto Insurance Corp",
            _ => "Unknown Biller"
        };
    }

    private static int GetValidityDays(decimal amount)
    {
        return amount switch
        {
            <= 10 => 7,
            <= 25 => 15,
            <= 50 => 30,
            <= 100 => 60,
            _ => 90
        };
    }
}

// Extension method for business days calculation
public static class DateTimeExtensions
{
    public static DateTime AddBusinessDays(this DateTime date, int businessDays)
    {
        var result = date;
        var daysToAdd = 0;
        
        while (daysToAdd < businessDays)
        {
            result = result.AddDays(1);
            if (result.DayOfWeek != DayOfWeek.Saturday && result.DayOfWeek != DayOfWeek.Sunday)
            {
                daysToAdd++;
            }
        }
        
        return result;
    }
}