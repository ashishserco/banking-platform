using System.ComponentModel.DataAnnotations;

namespace AccountService.DTOs;

public class AccountDto
{
    public Guid AccountId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public CustomerDto? Customer { get; set; }
}

public class CreateAccountRequest
{
    [Required]
    public Guid CustomerId { get; set; }
    
    [Required]
    [RegularExpression("^(SAVINGS|CURRENT|LOAN)$", ErrorMessage = "Account type must be SAVINGS, CURRENT, or LOAN")]
    public string AccountType { get; set; } = string.Empty;
    
    [Range(0, double.MaxValue, ErrorMessage = "Initial deposit must be non-negative")]
    public decimal InitialDeposit { get; set; } = 0.00m;
    
    [StringLength(3, MinimumLength = 3)]
    public string Currency { get; set; } = "USD";
}

public class BalanceDto
{
    public string AccountNumber { get; set; } = string.Empty;
    public decimal AvailableBalance { get; set; }
    public decimal PendingBalance { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
}

public class AccountTransactionDto
{
    public Guid TransactionId { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? Description { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CustomerDto
{
    public Guid CustomerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string KycStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateCustomerRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Phone]
    public string? PhoneNumber { get; set; }
    
    [Required]
    public DateTime DateOfBirth { get; set; }
}