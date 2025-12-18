using Microsoft.EntityFrameworkCore;
using Banking.Shared.Models;
using Banking.Shared.Events;
using TransactionService.Data;
using TransactionService.DTOs;
using TransactionService.Models;
using Azure.Messaging.ServiceBus;
using System.Text.Json;

namespace TransactionService.Services;

public class TransactionServiceImpl : ITransactionService
{
    private readonly TransactionDbContext _context;
    private readonly IAccountServiceClient _accountServiceClient;
    private readonly ServiceBusSender _eventPublisher;
    private readonly ILogger<TransactionServiceImpl> _logger;

    public TransactionServiceImpl(
        TransactionDbContext context,
        IAccountServiceClient accountServiceClient,
        ServiceBusSender eventPublisher,
        ILogger<TransactionServiceImpl> logger)
    {
        _context = context;
        _accountServiceClient = accountServiceClient;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task<Result<TransactionDto>> TransferMoneyAsync(TransferMoneyRequest request)
    {
        // Check for duplicate transaction using idempotency key
        var existingTransaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.IdempotencyKey == request.IdempotencyKey);

        if (existingTransaction != null)
        {
            _logger.LogInformation("Duplicate transaction detected: {IdempotencyKey}", request.IdempotencyKey);
            return Result<TransactionDto>.Success(MapToTransactionDto(existingTransaction));
        }

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Validate same account transfer
            if (request.FromAccountNumber == request.ToAccountNumber)
            {
                return Result<TransactionDto>.Failure("Cannot transfer money to the same account");
            }

            // Check source account balance and status
            var fromAccountResult = await _accountServiceClient.GetAccountBalanceAsync(request.FromAccountNumber);
            if (!fromAccountResult.IsSuccess)
            {
                return Result<TransactionDto>.Failure($"Source account error: {fromAccountResult.ErrorMessage}");
            }

            var fromAccount = fromAccountResult.Data!;
            if (!fromAccount.IsActive)
            {
                return Result<TransactionDto>.Failure("Source account is not active");
            }

            if (fromAccount.AvailableBalance < request.Amount)
            {
                return Result<TransactionDto>.Failure("Insufficient funds in source account");
            }

            // Check destination account status
            var toAccountResult = await _accountServiceClient.GetAccountBalanceAsync(request.ToAccountNumber);
            if (!toAccountResult.IsSuccess)
            {
                return Result<TransactionDto>.Failure($"Destination account error: {toAccountResult.ErrorMessage}");
            }

            var toAccount = toAccountResult.Data!;
            if (!toAccount.IsActive)
            {
                return Result<TransactionDto>.Failure("Destination account is not active");
            }

            // Create transaction record
            var transaction = new Transaction
            {
                IdempotencyKey = request.IdempotencyKey,
                FromAccountNumber = request.FromAccountNumber,
                ToAccountNumber = request.ToAccountNumber,
                Amount = request.Amount,
                Currency = request.Currency,
                TransactionType = "TRANSFER",
                Description = request.Description ?? $"Transfer from {request.FromAccountNumber} to {request.ToAccountNumber}",
                ReferenceNumber = GenerateReferenceNumber(),
                CorrelationId = request.CorrelationId
            };

            _context.Transactions.Add(transaction);
            
            // Record transaction event
            await RecordEventAsync(transaction.TransactionId, "TransactionCreated", new
            {
                TransactionId = transaction.TransactionId,
                Type = "TRANSFER",
                Amount = transaction.Amount,
                From = transaction.FromAccountNumber,
                To = transaction.ToAccountNumber
            });

            transaction.MarkAsProcessing();

            // Create double-entry bookkeeping entries
            var debitEntry = new TransactionEntry
            {
                TransactionId = transaction.TransactionId,
                AccountNumber = request.FromAccountNumber,
                EntryType = "DEBIT",
                Amount = request.Amount,
                Description = $"Transfer to {request.ToAccountNumber}"
            };

            var creditEntry = new TransactionEntry
            {
                TransactionId = transaction.TransactionId,
                AccountNumber = request.ToAccountNumber,
                EntryType = "CREDIT",
                Amount = request.Amount,
                Description = $"Transfer from {request.FromAccountNumber}"
            };

            _context.TransactionEntries.AddRange(debitEntry, creditEntry);
            await _context.SaveChangesAsync();

            // Execute account operations
            var debitResult = await _accountServiceClient.DebitAccountAsync(
                request.FromAccountNumber,
                request.Amount,
                transaction.TransactionId.ToString(),
                transaction.Description);

            if (!debitResult.IsSuccess)
            {
                transaction.MarkAsFailed($"Failed to debit source account: {debitResult.ErrorMessage}");
                await _context.SaveChangesAsync();
                await dbTransaction.RollbackAsync();
                return Result<TransactionDto>.Failure($"Transfer failed: {debitResult.ErrorMessage}");
            }

            var creditResult = await _accountServiceClient.CreditAccountAsync(
                request.ToAccountNumber,
                request.Amount,
                transaction.TransactionId.ToString(),
                transaction.Description);

            if (!creditResult.IsSuccess)
            {
                // Rollback debit operation
                await _accountServiceClient.CreditAccountAsync(
                    request.FromAccountNumber,
                    request.Amount,
                    transaction.TransactionId.ToString(),
                    "Rollback failed transfer");

                transaction.MarkAsFailed($"Failed to credit destination account: {creditResult.ErrorMessage}");
                await _context.SaveChangesAsync();
                await dbTransaction.RollbackAsync();
                return Result<TransactionDto>.Failure($"Transfer failed: {creditResult.ErrorMessage}");
            }

            // Mark transaction as completed
            transaction.MarkAsCompleted();
            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            // Publish transaction completed event
            var transactionCompletedEvent = new TransactionCompletedEvent
            {
                TransactionId = transaction.TransactionId,
                FromAccountNumber = transaction.FromAccountNumber!,
                ToAccountNumber = transaction.ToAccountNumber!,
                Amount = transaction.Amount,
                Currency = transaction.Currency,
                TransactionType = transaction.TransactionType,
                CompletedAt = transaction.CompletedAt!.Value
            };

            await PublishEventAsync(transactionCompletedEvent);

            _logger.LogInformation("Money transfer completed: {TransactionId} - {Amount} {Currency} from {From} to {To}",
                transaction.TransactionId, transaction.Amount, transaction.Currency,
                transaction.FromAccountNumber, transaction.ToAccountNumber);

            return Result<TransactionDto>.Success(MapToTransactionDto(transaction));
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            _logger.LogError(ex, "Error processing money transfer: {IdempotencyKey}", request.IdempotencyKey);
            return Result<TransactionDto>.Failure("Failed to process money transfer");
        }
    }

    public async Task<Result<TransactionDto>> DepositMoneyAsync(DepositMoneyRequest request)
    {
        // Check for duplicate transaction
        var existingTransaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.IdempotencyKey == request.IdempotencyKey);

        if (existingTransaction != null)
        {
            return Result<TransactionDto>.Success(MapToTransactionDto(existingTransaction));
        }

        try
        {
            // Validate account
            var accountResult = await _accountServiceClient.GetAccountBalanceAsync(request.AccountNumber);
            if (!accountResult.IsSuccess)
            {
                return Result<TransactionDto>.Failure($"Account error: {accountResult.ErrorMessage}");
            }

            if (!accountResult.Data!.IsActive)
            {
                return Result<TransactionDto>.Failure("Account is not active");
            }

            // Create deposit transaction
            var transaction = new Transaction
            {
                IdempotencyKey = request.IdempotencyKey,
                ToAccountNumber = request.AccountNumber,
                Amount = request.Amount,
                Currency = request.Currency,
                TransactionType = "DEPOSIT",
                Description = request.Description ?? $"Deposit to account {request.AccountNumber}",
                ReferenceNumber = request.ReferenceNumber ?? GenerateReferenceNumber()
            };

            _context.Transactions.Add(transaction);
            transaction.MarkAsProcessing();

            // Create credit entry
            var creditEntry = new TransactionEntry
            {
                TransactionId = transaction.TransactionId,
                AccountNumber = request.AccountNumber,
                EntryType = "CREDIT",
                Amount = request.Amount,
                Description = transaction.Description
            };

            _context.TransactionEntries.Add(creditEntry);
            await _context.SaveChangesAsync();

            // Credit account
            var creditResult = await _accountServiceClient.CreditAccountAsync(
                request.AccountNumber,
                request.Amount,
                transaction.TransactionId.ToString(),
                transaction.Description);

            if (!creditResult.IsSuccess)
            {
                transaction.MarkAsFailed($"Failed to credit account: {creditResult.ErrorMessage}");
                await _context.SaveChangesAsync();
                return Result<TransactionDto>.Failure($"Deposit failed: {creditResult.ErrorMessage}");
            }

            transaction.MarkAsCompleted();
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deposit completed: {TransactionId} - {Amount} {Currency} to {AccountNumber}",
                transaction.TransactionId, transaction.Amount, transaction.Currency, transaction.ToAccountNumber);

            return Result<TransactionDto>.Success(MapToTransactionDto(transaction));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing deposit: {IdempotencyKey}", request.IdempotencyKey);
            return Result<TransactionDto>.Failure("Failed to process deposit");
        }
    }

    public async Task<Result<TransactionDto>> WithdrawMoneyAsync(WithdrawMoneyRequest request)
    {
        // Check for duplicate transaction
        var existingTransaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.IdempotencyKey == request.IdempotencyKey);

        if (existingTransaction != null)
        {
            return Result<TransactionDto>.Success(MapToTransactionDto(existingTransaction));
        }

        try
        {
            // Check account balance
            var accountResult = await _accountServiceClient.GetAccountBalanceAsync(request.AccountNumber);
            if (!accountResult.IsSuccess)
            {
                return Result<TransactionDto>.Failure($"Account error: {accountResult.ErrorMessage}");
            }

            var account = accountResult.Data!;
            if (!account.IsActive)
            {
                return Result<TransactionDto>.Failure("Account is not active");
            }

            if (account.AvailableBalance < request.Amount)
            {
                return Result<TransactionDto>.Failure("Insufficient funds");
            }

            // Create withdrawal transaction
            var transaction = new Transaction
            {
                IdempotencyKey = request.IdempotencyKey,
                FromAccountNumber = request.AccountNumber,
                Amount = request.Amount,
                Currency = request.Currency,
                TransactionType = "WITHDRAWAL",
                Description = request.Description ?? $"Withdrawal from account {request.AccountNumber}",
                ReferenceNumber = request.ReferenceNumber ?? GenerateReferenceNumber()
            };

            _context.Transactions.Add(transaction);
            transaction.MarkAsProcessing();

            // Create debit entry
            var debitEntry = new TransactionEntry
            {
                TransactionId = transaction.TransactionId,
                AccountNumber = request.AccountNumber,
                EntryType = "DEBIT",
                Amount = request.Amount,
                Description = transaction.Description
            };

            _context.TransactionEntries.Add(debitEntry);
            await _context.SaveChangesAsync();

            // Debit account
            var debitResult = await _accountServiceClient.DebitAccountAsync(
                request.AccountNumber,
                request.Amount,
                transaction.TransactionId.ToString(),
                transaction.Description);

            if (!debitResult.IsSuccess)
            {
                transaction.MarkAsFailed($"Failed to debit account: {debitResult.ErrorMessage}");
                await _context.SaveChangesAsync();
                return Result<TransactionDto>.Failure($"Withdrawal failed: {debitResult.ErrorMessage}");
            }

            transaction.MarkAsCompleted();
            await _context.SaveChangesAsync();

            _logger.LogInformation("Withdrawal completed: {TransactionId} - {Amount} {Currency} from {AccountNumber}",
                transaction.TransactionId, transaction.Amount, transaction.Currency, transaction.FromAccountNumber);

            return Result<TransactionDto>.Success(MapToTransactionDto(transaction));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing withdrawal: {IdempotencyKey}", request.IdempotencyKey);
            return Result<TransactionDto>.Failure("Failed to process withdrawal");
        }
    }

    public async Task<Result<TransactionDto>> GetTransactionAsync(Guid transactionId)
    {
        try
        {
            var transaction = await _context.Transactions
                .Include(t => t.TransactionEntries)
                .FirstOrDefaultAsync(t => t.TransactionId == transactionId);

            if (transaction == null)
            {
                return Result<TransactionDto>.Failure("Transaction not found");
            }

            return Result<TransactionDto>.Success(MapToTransactionDto(transaction));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction {TransactionId}", transactionId);
            return Result<TransactionDto>.Failure("Failed to retrieve transaction");
        }
    }

    public async Task<Result<TransactionDto>> GetTransactionByIdempotencyKeyAsync(string idempotencyKey)
    {
        try
        {
            var transaction = await _context.Transactions
                .Include(t => t.TransactionEntries)
                .FirstOrDefaultAsync(t => t.IdempotencyKey == idempotencyKey);

            if (transaction == null)
            {
                return Result<TransactionDto>.Failure("Transaction not found");
            }

            return Result<TransactionDto>.Success(MapToTransactionDto(transaction));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction by idempotency key {IdempotencyKey}", idempotencyKey);
            return Result<TransactionDto>.Failure("Failed to retrieve transaction");
        }
    }

    public async Task<Result<List<TransactionDto>>> SearchTransactionsAsync(TransactionSearchRequest request)
    {
        try
        {
            var query = _context.Transactions.Include(t => t.TransactionEntries).AsQueryable();

            if (!string.IsNullOrEmpty(request.AccountNumber))
            {
                query = query.Where(t => t.FromAccountNumber == request.AccountNumber || 
                                        t.ToAccountNumber == request.AccountNumber);
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                query = query.Where(t => t.Status == request.Status);
            }

            if (!string.IsNullOrEmpty(request.TransactionType))
            {
                query = query.Where(t => t.TransactionType == request.TransactionType);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(t => t.CreatedAt <= request.ToDate.Value);
            }

            if (request.MinAmount.HasValue)
            {
                query = query.Where(t => t.Amount >= request.MinAmount.Value);
            }

            if (request.MaxAmount.HasValue)
            {
                query = query.Where(t => t.Amount <= request.MaxAmount.Value);
            }

            var transactions = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var transactionDtos = transactions.Select(MapToTransactionDto).ToList();
            return Result<List<TransactionDto>>.Success(transactionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching transactions");
            return Result<List<TransactionDto>>.Failure("Failed to search transactions");
        }
    }

    public async Task<Result> CancelTransactionAsync(Guid transactionId, string reason)
    {
        try
        {
            var transaction = await _context.Transactions.FindAsync(transactionId);
            if (transaction == null)
            {
                return Result.Failure("Transaction not found");
            }

            transaction.Cancel(reason);
            await _context.SaveChangesAsync();

            await RecordEventAsync(transactionId, "TransactionCancelled", new { Reason = reason });

            _logger.LogInformation("Transaction cancelled: {TransactionId} - {Reason}", transactionId, reason);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling transaction {TransactionId}", transactionId);
            return Result.Failure("Failed to cancel transaction");
        }
    }

    public async Task<Result<List<TransactionDto>>> GetAccountTransactionsAsync(string accountNumber, int pageSize = 50, int pageNumber = 1)
    {
        try
        {
            var transactions = await _context.Transactions
                .Include(t => t.TransactionEntries)
                .Where(t => t.FromAccountNumber == accountNumber || t.ToAccountNumber == accountNumber)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var transactionDtos = transactions.Select(MapToTransactionDto).ToList();
            return Result<List<TransactionDto>>.Success(transactionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for account {AccountNumber}", accountNumber);
            return Result<List<TransactionDto>>.Failure("Failed to retrieve account transactions");
        }
    }

    private static string GenerateReferenceNumber()
    {
        return $"TXN{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(100000, 999999)}";
    }

    private async Task RecordEventAsync(Guid transactionId, string eventType, object eventData)
    {
        try
        {
            var transactionEvent = new TransactionEvent
            {
                TransactionId = transactionId,
                EventType = eventType,
                EventData = JsonSerializer.Serialize(eventData)
            };

            _context.TransactionEvents.Add(transactionEvent);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record event {EventType} for transaction {TransactionId}", 
                eventType, transactionId);
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

    private static TransactionDto MapToTransactionDto(Transaction transaction)
    {
        return new TransactionDto
        {
            TransactionId = transaction.TransactionId,
            IdempotencyKey = transaction.IdempotencyKey,
            FromAccountNumber = transaction.FromAccountNumber,
            ToAccountNumber = transaction.ToAccountNumber,
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            TransactionType = transaction.TransactionType,
            Status = transaction.Status,
            Description = transaction.Description,
            ReferenceNumber = transaction.ReferenceNumber,
            CorrelationId = transaction.CorrelationId,
            CreatedAt = transaction.CreatedAt,
            ProcessedAt = transaction.ProcessedAt,
            CompletedAt = transaction.CompletedAt,
            FailureReason = transaction.FailureReason,
            TransactionEntries = transaction.TransactionEntries.Select(e => new TransactionEntryDto
            {
                EntryId = e.EntryId,
                AccountNumber = e.AccountNumber,
                EntryType = e.EntryType,
                Amount = e.Amount,
                Description = e.Description,
                CreatedAt = e.CreatedAt
            }).ToList()
        };
    }
}

// Event classes for messaging
public class TransactionCompletedEvent : IEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid();
    public DateTime OccuredAt { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = nameof(TransactionCompletedEvent);
    
    public Guid TransactionId { get; set; }
    public string FromAccountNumber { get; set; } = string.Empty;
    public string ToAccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public DateTime CompletedAt { get; set; }
}