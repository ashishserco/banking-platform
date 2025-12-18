using Banking.Shared.Models;
using TransactionService.DTOs;

namespace TransactionService.Services;

public interface ITransactionService
{
    Task<Result<TransactionDto>> TransferMoneyAsync(TransferMoneyRequest request);
    Task<Result<TransactionDto>> DepositMoneyAsync(DepositMoneyRequest request);
    Task<Result<TransactionDto>> WithdrawMoneyAsync(WithdrawMoneyRequest request);
    Task<Result<TransactionDto>> GetTransactionAsync(Guid transactionId);
    Task<Result<TransactionDto>> GetTransactionByIdempotencyKeyAsync(string idempotencyKey);
    Task<Result<List<TransactionDto>>> SearchTransactionsAsync(TransactionSearchRequest request);
    Task<Result> CancelTransactionAsync(Guid transactionId, string reason);
    Task<Result<List<TransactionDto>>> GetAccountTransactionsAsync(string accountNumber, int pageSize = 50, int pageNumber = 1);
}

public interface IAccountServiceClient
{
    Task<Result<AccountBalanceDto>> GetAccountBalanceAsync(string accountNumber);
    Task<Result> ReserveFundsAsync(string accountNumber, decimal amount, string transactionId);
    Task<Result> DebitAccountAsync(string accountNumber, decimal amount, string transactionId, string description);
    Task<Result> CreditAccountAsync(string accountNumber, decimal amount, string transactionId, string description);
    Task<Result> ReleaseFundsAsync(string accountNumber, decimal amount, string transactionId);
}

public class AccountBalanceDto
{
    public string AccountNumber { get; set; } = string.Empty;
    public decimal AvailableBalance { get; set; }
    public decimal PendingBalance { get; set; }
    public string Currency { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}