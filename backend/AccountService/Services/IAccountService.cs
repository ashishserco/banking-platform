using Banking.Shared.Models;
using AccountService.DTOs;

namespace AccountService.Services;

public interface IAccountService
{
    Task<Result<AccountDto>> CreateAccountAsync(CreateAccountRequest request);
    Task<Result<AccountDto>> GetAccountAsync(Guid accountId);
    Task<Result<AccountDto>> GetAccountByNumberAsync(string accountNumber);
    Task<Result<BalanceDto>> GetBalanceAsync(string accountNumber);
    Task<Result<List<AccountDto>>> GetAccountsByCustomerAsync(Guid customerId);
    Task<Result> UpdateAccountStatusAsync(string accountNumber, string status);
    Task<Result<List<AccountTransactionDto>>> GetTransactionHistoryAsync(string accountNumber, int pageSize = 50, int pageNumber = 1);
}

public interface ICustomerService
{
    Task<Result<CustomerDto>> CreateCustomerAsync(CreateCustomerRequest request);
    Task<Result<CustomerDto>> GetCustomerAsync(Guid customerId);
    Task<Result<CustomerDto>> GetCustomerByEmailAsync(string email);
    Task<Result> UpdateKycStatusAsync(Guid customerId, string kycStatus);
}