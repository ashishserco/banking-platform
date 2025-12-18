using Microsoft.EntityFrameworkCore;
using Banking.Shared.Models;
using Banking.Shared.Events;
using AccountService.Data;
using AccountService.DTOs;
using AccountService.Models;
using Azure.Messaging.ServiceBus;
using System.Text.Json;

namespace AccountService.Services;

public class AccountServiceImpl : IAccountService
{
    private readonly AccountDbContext _context;
    private readonly ServiceBusSender _eventPublisher;
    private readonly ILogger<AccountServiceImpl> _logger;

    public AccountServiceImpl(
        AccountDbContext context, 
        ServiceBusSender eventPublisher,
        ILogger<AccountServiceImpl> logger)
    {
        _context = context;
        _eventPublisher = eventPublisher;
        _logger = logger;
    }

    public async Task<Result<AccountDto>> CreateAccountAsync(CreateAccountRequest request)
    {
        try
        {
            // Validate customer exists and is KYC verified
            var customer = await _context.Customers.FindAsync(request.CustomerId);
            if (customer == null)
            {
                return Result<AccountDto>.Failure("Customer not found");
            }

            if (customer.KycStatus != "VERIFIED")
            {
                return Result<AccountDto>.Failure("Customer KYC must be verified before account creation");
            }

            // Generate unique account number
            var accountNumber = GenerateAccountNumber();

            // Create account
            var account = new Account
            {
                AccountNumber = accountNumber,
                CustomerId = request.CustomerId,
                AccountType = request.AccountType,
                Balance = request.InitialDeposit,
                Currency = request.Currency,
                Status = "ACTIVE"
            };

            _context.Accounts.Add(account);

            // Record initial transaction if there's a deposit
            if (request.InitialDeposit > 0)
            {
                var initialTransaction = new AccountTransaction
                {
                    AccountId = account.AccountId,
                    TransactionType = "CREDIT",
                    Amount = request.InitialDeposit,
                    BalanceAfter = request.InitialDeposit,
                    Description = "Initial deposit",
                    ReferenceNumber = $"INIT-{account.AccountNumber}"
                };
                _context.AccountTransactions.Add(initialTransaction);
            }

            await _context.SaveChangesAsync();

            // Publish account created event
            var accountCreatedEvent = new AccountCreatedEvent
            {
                AccountId = account.AccountId,
                AccountNumber = account.AccountNumber,
                CustomerId = customer.CustomerId.ToString(),
                AccountType = account.AccountType,
                InitialBalance = account.Balance,
                Currency = account.Currency
            };

            await PublishEventAsync(accountCreatedEvent);

            _logger.LogInformation("Account created successfully: {AccountNumber} for customer {CustomerId}", 
                account.AccountNumber, customer.CustomerId);

            var accountDto = MapToAccountDto(account, customer);
            return Result<AccountDto>.Success(accountDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating account for customer {CustomerId}", request.CustomerId);
            return Result<AccountDto>.Failure("Failed to create account");
        }
    }

    public async Task<Result<AccountDto>> GetAccountAsync(Guid accountId)
    {
        try
        {
            var account = await _context.Accounts
                .Include(a => a.Customer)
                .FirstOrDefaultAsync(a => a.AccountId == accountId);

            if (account == null)
            {
                return Result<AccountDto>.Failure("Account not found");
            }

            var accountDto = MapToAccountDto(account, account.Customer!);
            return Result<AccountDto>.Success(accountDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving account {AccountId}", accountId);
            return Result<AccountDto>.Failure("Failed to retrieve account");
        }
    }

    public async Task<Result<AccountDto>> GetAccountByNumberAsync(string accountNumber)
    {
        try
        {
            var account = await _context.Accounts
                .Include(a => a.Customer)
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null)
            {
                return Result<AccountDto>.Failure("Account not found");
            }

            var accountDto = MapToAccountDto(account, account.Customer!);
            return Result<AccountDto>.Success(accountDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving account {AccountNumber}", accountNumber);
            return Result<AccountDto>.Failure("Failed to retrieve account");
        }
    }

    public async Task<Result<BalanceDto>> GetBalanceAsync(string accountNumber)
    {
        try
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null)
            {
                return Result<BalanceDto>.Failure("Account not found");
            }

            var balanceDto = new BalanceDto
            {
                AccountNumber = account.AccountNumber,
                AvailableBalance = account.Balance,
                PendingBalance = 0, // TODO: Calculate pending transactions
                Currency = account.Currency,
                LastUpdated = account.UpdatedAt
            };

            return Result<BalanceDto>.Success(balanceDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving balance for account {AccountNumber}", accountNumber);
            return Result<BalanceDto>.Failure("Failed to retrieve balance");
        }
    }

    public async Task<Result<List<AccountDto>>> GetAccountsByCustomerAsync(Guid customerId)
    {
        try
        {
            var accounts = await _context.Accounts
                .Include(a => a.Customer)
                .Where(a => a.CustomerId == customerId)
                .ToListAsync();

            var accountDtos = accounts.Select(a => MapToAccountDto(a, a.Customer!)).ToList();
            return Result<List<AccountDto>>.Success(accountDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving accounts for customer {CustomerId}", customerId);
            return Result<List<AccountDto>>.Failure("Failed to retrieve accounts");
        }
    }

    public async Task<Result> UpdateAccountStatusAsync(string accountNumber, string status)
    {
        try
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null)
            {
                return Result.Failure("Account not found");
            }

            var validStatuses = new[] { "ACTIVE", "INACTIVE", "FROZEN", "CLOSED" };
            if (!validStatuses.Contains(status))
            {
                return Result.Failure("Invalid account status");
            }

            account.Status = status;
            account.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Account status updated: {AccountNumber} -> {Status}", accountNumber, status);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating account status for {AccountNumber}", accountNumber);
            return Result.Failure("Failed to update account status");
        }
    }

    public async Task<Result<List<AccountTransactionDto>>> GetTransactionHistoryAsync(string accountNumber, int pageSize = 50, int pageNumber = 1)
    {
        try
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null)
            {
                return Result<List<AccountTransactionDto>>.Failure("Account not found");
            }

            var transactions = await _context.AccountTransactions
                .Where(t => t.AccountId == account.AccountId)
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new AccountTransactionDto
                {
                    TransactionId = t.TransactionId,
                    TransactionType = t.TransactionType,
                    Amount = t.Amount,
                    BalanceAfter = t.BalanceAfter,
                    Description = t.Description,
                    ReferenceNumber = t.ReferenceNumber,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();

            return Result<List<AccountTransactionDto>>.Success(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction history for account {AccountNumber}", accountNumber);
            return Result<List<AccountTransactionDto>>.Failure("Failed to retrieve transaction history");
        }
    }

    private static string GenerateAccountNumber()
    {
        // Generate account number with banking format: ACC + 12 digits
        var random = new Random();
        var accountNumber = "ACC" + random.Next(100000000, 999999999).ToString() + random.Next(100, 999).ToString();
        return accountNumber;
    }

    private static AccountDto MapToAccountDto(Account account, Customer customer)
    {
        return new AccountDto
        {
            AccountId = account.AccountId,
            AccountNumber = account.AccountNumber,
            CustomerId = account.CustomerId,
            AccountType = account.AccountType,
            Balance = account.Balance,
            Currency = account.Currency,
            Status = account.Status,
            CreatedAt = account.CreatedAt,
            UpdatedAt = account.UpdatedAt,
            Customer = new CustomerDto
            {
                CustomerId = customer.CustomerId,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                DateOfBirth = customer.DateOfBirth,
                KycStatus = customer.KycStatus,
                CreatedAt = customer.CreatedAt
            }
        };
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
            // Don't fail the operation if event publishing fails
        }
    }
}