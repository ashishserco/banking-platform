using Banking.Shared.Models;
using System.Text.Json;
using System.Text;
using Polly;
using Polly.Extensions.Http;

namespace TransactionService.Services;

public class AccountServiceClient : IAccountServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AccountServiceClient> _logger;
    private readonly IAsyncPolicy<HttpResponseMessage> _retryPolicy;

    public AccountServiceClient(HttpClient httpClient, ILogger<AccountServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        // Configure retry policy with exponential backoff
        _retryPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryCount, context) =>
                {
                    _logger.LogWarning("Account service call failed. Retry {RetryCount} in {Delay}ms",
                        retryCount, timespan.TotalMilliseconds);
                });
    }

    public async Task<Result<AccountBalanceDto>> GetAccountBalanceAsync(string accountNumber)
    {
        try
        {
            var response = await _retryPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.GetAsync($"/api/account/balance/{accountNumber}");
            });

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var balance = JsonSerializer.Deserialize<AccountBalanceDto>(content, GetJsonOptions());
                return Result<AccountBalanceDto>.Success(balance!);
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Account service returned error for balance check: {StatusCode} - {Error}",
                response.StatusCode, errorContent);
            
            return Result<AccountBalanceDto>.Failure($"Account service error: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling account service for balance: {AccountNumber}", accountNumber);
            return Result<AccountBalanceDto>.Failure("Failed to get account balance");
        }
    }

    public async Task<Result> ReserveFundsAsync(string accountNumber, decimal amount, string transactionId)
    {
        try
        {
            var request = new
            {
                AccountNumber = accountNumber,
                Amount = amount,
                TransactionId = transactionId,
                ReservationType = "TRANSFER_RESERVE"
            };

            var json = JsonSerializer.Serialize(request, GetJsonOptions());
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _retryPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.PostAsync($"/api/account/{accountNumber}/reserve", content);
            });

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Funds reserved successfully: {Amount} for transaction {TransactionId}",
                    amount, transactionId);
                return Result.Success();
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Failed to reserve funds: {StatusCode} - {Error}", response.StatusCode, errorContent);
            
            return Result.Failure($"Failed to reserve funds: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reserving funds for account: {AccountNumber}", accountNumber);
            return Result.Failure("Failed to reserve funds");
        }
    }

    public async Task<Result> DebitAccountAsync(string accountNumber, decimal amount, string transactionId, string description)
    {
        try
        {
            var request = new
            {
                Amount = amount,
                TransactionId = transactionId,
                Description = description,
                TransactionType = "DEBIT"
            };

            var json = JsonSerializer.Serialize(request, GetJsonOptions());
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _retryPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.PostAsync($"/api/account/{accountNumber}/debit", content);
            });

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Account debited successfully: {Amount} from {AccountNumber} for transaction {TransactionId}",
                    amount, accountNumber, transactionId);
                return Result.Success();
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Failed to debit account: {StatusCode} - {Error}", response.StatusCode, errorContent);
            
            return Result.Failure($"Failed to debit account: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error debiting account: {AccountNumber}", accountNumber);
            return Result.Failure("Failed to debit account");
        }
    }

    public async Task<Result> CreditAccountAsync(string accountNumber, decimal amount, string transactionId, string description)
    {
        try
        {
            var request = new
            {
                Amount = amount,
                TransactionId = transactionId,
                Description = description,
                TransactionType = "CREDIT"
            };

            var json = JsonSerializer.Serialize(request, GetJsonOptions());
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _retryPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.PostAsync($"/api/account/{accountNumber}/credit", content);
            });

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Account credited successfully: {Amount} to {AccountNumber} for transaction {TransactionId}",
                    amount, accountNumber, transactionId);
                return Result.Success();
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Failed to credit account: {StatusCode} - {Error}", response.StatusCode, errorContent);
            
            return Result.Failure($"Failed to credit account: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error crediting account: {AccountNumber}", accountNumber);
            return Result.Failure("Failed to credit account");
        }
    }

    public async Task<Result> ReleaseFundsAsync(string accountNumber, decimal amount, string transactionId)
    {
        try
        {
            var request = new
            {
                AccountNumber = accountNumber,
                Amount = amount,
                TransactionId = transactionId
            };

            var json = JsonSerializer.Serialize(request, GetJsonOptions());
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _retryPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.PostAsync($"/api/account/{accountNumber}/release", content);
            });

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Funds released successfully: {Amount} for transaction {TransactionId}",
                    amount, transactionId);
                return Result.Success();
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Failed to release funds: {StatusCode} - {Error}", response.StatusCode, errorContent);
            
            return Result.Failure($"Failed to release funds: {response.StatusCode}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing funds for account: {AccountNumber}", accountNumber);
            return Result.Failure("Failed to release funds");
        }
    }

    private static JsonSerializerOptions GetJsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }
}