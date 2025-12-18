using System.ComponentModel.DataAnnotations;

namespace TransactionService.DTOs;

public class TransactionDto
{
    public Guid TransactionId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public string? FromAccountNumber { get; set; }
    public string? ToAccountNumber { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ReferenceNumber { get; set; }
    public Guid? CorrelationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? FailureReason { get; set; }
    public List<TransactionEntryDto> TransactionEntries { get; set; } = new();
}

public class TransactionEntryDto
{
    public Guid EntryId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string EntryType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TransferMoneyRequest
{
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string FromAccountNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string ToAccountNumber { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Amount must be between 0.01 and 1,000,000")]
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public Guid? CorrelationId { get; set; }
}

public class DepositMoneyRequest
{
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Amount must be between 0.01 and 1,000,000")]
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? ReferenceNumber { get; set; }
}

public class WithdrawMoneyRequest
{
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Amount must be between 0.01 and 1,000,000")]
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? ReferenceNumber { get; set; }
}

public class TransactionSearchRequest
{
    public string? AccountNumber { get; set; }
    public string? Status { get; set; }
    public string? TransactionType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public int PageSize { get; set; } = 50;
    public int PageNumber { get; set; } = 1;
}