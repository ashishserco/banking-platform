using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransactionService.Models;

public class Transaction
{
    [Key]
    public Guid TransactionId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? FromAccountNumber { get; set; }
    
    [StringLength(20)]
    public string? ToAccountNumber { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [Required]
    [StringLength(20)]
    public string TransactionType { get; set; } = string.Empty; // TRANSFER, DEPOSIT, WITHDRAWAL
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "PENDING"; // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? ReferenceNumber { get; set; }
    
    public Guid? CorrelationId { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? ProcessedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public string? FailureReason { get; set; }
    
    // Double-entry bookkeeping entries
    public List<TransactionEntry> TransactionEntries { get; set; } = new();
    
    // Business methods
    public void MarkAsProcessing()
    {
        if (Status != "PENDING")
            throw new InvalidOperationException($"Cannot process transaction in {Status} state");
            
        Status = "PROCESSING";
        ProcessedAt = DateTime.UtcNow;
    }
    
    public void MarkAsCompleted()
    {
        if (Status != "PROCESSING")
            throw new InvalidOperationException($"Cannot complete transaction in {Status} state");
            
        Status = "COMPLETED";
        CompletedAt = DateTime.UtcNow;
    }
    
    public void MarkAsFailed(string reason)
    {
        Status = "FAILED";
        FailureReason = reason;
        CompletedAt = DateTime.UtcNow;
    }
    
    public void Cancel(string reason)
    {
        if (Status == "COMPLETED")
            throw new InvalidOperationException("Cannot cancel completed transaction");
            
        Status = "CANCELLED";
        FailureReason = reason;
        CompletedAt = DateTime.UtcNow;
    }
}

// Double-entry bookkeeping implementation
public class TransactionEntry
{
    [Key]
    public Guid EntryId { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid TransactionId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string AccountNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string EntryType { get; set; } = string.Empty; // DEBIT, CREDIT
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [StringLength(100)]
    public string? Description { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Transaction? Transaction { get; set; }
}

// Event store for audit trail
public class TransactionEvent
{
    [Key]
    public Guid EventId { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid TransactionId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string EventType { get; set; } = string.Empty;
    
    [Required]
    public string EventData { get; set; } = string.Empty; // JSON
    
    [Required]
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    
    [StringLength(100)]
    public string? UserId { get; set; }
    
    public Transaction? Transaction { get; set; }
}