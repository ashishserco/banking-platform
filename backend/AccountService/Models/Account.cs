using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountService.Models;

public class Account
{
    [Key]
    public Guid AccountId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(20)]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    public Guid CustomerId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string AccountType { get; set; } = string.Empty; // SAVINGS, CURRENT, LOAN
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Balance { get; set; } = 0.00m;
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE, CLOSED, FROZEN
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Customer? Customer { get; set; }
    public List<AccountTransaction> AccountTransactions { get; set; } = new();
    
    // Business methods
    public bool CanDebit(decimal amount)
    {
        return Status == "ACTIVE" && Balance >= amount && amount > 0;
    }
    
    public void Credit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Credit amount must be positive");
        if (Status != "ACTIVE") throw new InvalidOperationException("Cannot credit inactive account");
        
        Balance += amount;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Debit(decimal amount)
    {
        if (!CanDebit(amount))
            throw new InvalidOperationException("Insufficient funds or account not active");
            
        Balance -= amount;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Freeze()
    {
        Status = "FROZEN";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Activate()
    {
        Status = "ACTIVE";
        UpdatedAt = DateTime.UtcNow;
    }
}

public class Customer
{
    [Key]
    public Guid CustomerId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
    
    [Required]
    public DateTime DateOfBirth { get; set; }
    
    [Required]
    [StringLength(20)]
    public string KycStatus { get; set; } = "PENDING"; // PENDING, VERIFIED, REJECTED
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public List<Account> Accounts { get; set; } = new();
}

public class AccountTransaction
{
    [Key]
    public Guid TransactionId { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid AccountId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string TransactionType { get; set; } = string.Empty; // CREDIT, DEBIT
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal BalanceAfter { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? ReferenceNumber { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Account? Account { get; set; }
}