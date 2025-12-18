using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentService.Models;

public class Payment
{
    [Key]
    public Guid PaymentId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string SourceAccountNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string PaymentType { get; set; } = string.Empty; // BILL_PAYMENT, MERCHANT_PAYMENT, MOBILE_RECHARGE, INVESTMENT
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
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
    
    // External gateway details
    public string? ExternalTransactionId { get; set; }
    public string? ExternalGateway { get; set; }
    public string? ExternalResponse { get; set; }
    
    // Beneficiary details
    public PaymentBeneficiary? Beneficiary { get; set; }
    public Guid? BeneficiaryId { get; set; }
    
    // Business methods
    public void MarkAsProcessing()
    {
        if (Status != "PENDING")
            throw new InvalidOperationException($"Cannot process payment in {Status} state");
            
        Status = "PROCESSING";
        ProcessedAt = DateTime.UtcNow;
    }
    
    public void MarkAsCompleted(string? externalTransactionId = null)
    {
        if (Status != "PROCESSING")
            throw new InvalidOperationException($"Cannot complete payment in {Status} state");
            
        Status = "COMPLETED";
        CompletedAt = DateTime.UtcNow;
        ExternalTransactionId = externalTransactionId;
    }
    
    public void MarkAsFailed(string reason, string? externalResponse = null)
    {
        Status = "FAILED";
        FailureReason = reason;
        ExternalResponse = externalResponse;
        CompletedAt = DateTime.UtcNow;
    }
    
    public void Cancel(string reason)
    {
        if (Status == "COMPLETED")
            throw new InvalidOperationException("Cannot cancel completed payment");
            
        Status = "CANCELLED";
        FailureReason = reason;
        CompletedAt = DateTime.UtcNow;
    }
}

public class PaymentBeneficiary
{
    [Key]
    public Guid BeneficiaryId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string BeneficiaryType { get; set; } = string.Empty; // INDIVIDUAL, MERCHANT, UTILITY, TELECOM
    
    [StringLength(50)]
    public string? AccountNumber { get; set; }
    
    [StringLength(20)]
    public string? BankCode { get; set; }
    
    [StringLength(100)]
    public string? Email { get; set; }
    
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
    
    [StringLength(500)]
    public string? Address { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public List<Payment> Payments { get; set; } = new();
}

public class PaymentEvent
{
    [Key]
    public Guid EventId { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid PaymentId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string EventType { get; set; } = string.Empty;
    
    [Required]
    public string EventData { get; set; } = string.Empty; // JSON
    
    [Required]
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    
    [StringLength(100)]
    public string? UserId { get; set; }
    
    public Payment? Payment { get; set; }
}

// Idempotency tracking for external gateway calls
public class ExternalCallIdempotency
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Gateway { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string CallType { get; set; } = string.Empty; // PAYMENT, REFUND, INQUIRY
    
    public string? Response { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty; // PENDING, COMPLETED, FAILED
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
}