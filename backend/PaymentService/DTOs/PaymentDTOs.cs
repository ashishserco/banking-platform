using System.ComponentModel.DataAnnotations;

namespace PaymentService.DTOs;

public class PaymentDto
{
    public Guid PaymentId { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public string SourceAccountNumber { get; set; } = string.Empty;
    public string PaymentType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ReferenceNumber { get; set; }
    public Guid? CorrelationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? FailureReason { get; set; }
    public string? ExternalTransactionId { get; set; }
    public string? ExternalGateway { get; set; }
    public PaymentBeneficiaryDto? Beneficiary { get; set; }
}

public class PaymentBeneficiaryDto
{
    public Guid BeneficiaryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BeneficiaryType { get; set; } = string.Empty;
    public string? AccountNumber { get; set; }
    public string? BankCode { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class ProcessPaymentRequest
{
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string SourceAccountNumber { get; set; } = string.Empty;
    
    [Required]
    public Guid BeneficiaryId { get; set; }
    
    [Required]
    [RegularExpression("^(BILL_PAYMENT|MERCHANT_PAYMENT|MOBILE_RECHARGE|INVESTMENT)$")]
    public string PaymentType { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Amount must be between 0.01 and 1,000,000")]
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public Guid? CorrelationId { get; set; }
    
    // Payment-specific details
    public Dictionary<string, string>? PaymentDetails { get; set; }
}

public class CreateBeneficiaryRequest
{
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [RegularExpression("^(INDIVIDUAL|MERCHANT|UTILITY|TELECOM)$")]
    public string BeneficiaryType { get; set; } = string.Empty;
    
    [StringLength(50)]
    public string? AccountNumber { get; set; }
    
    [StringLength(20)]
    public string? BankCode { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    [Phone]
    public string? PhoneNumber { get; set; }
    
    [StringLength(500)]
    public string? Address { get; set; }
}

public class PaymentSearchRequest
{
    public string? SourceAccountNumber { get; set; }
    public string? PaymentType { get; set; }
    public string? Status { get; set; }
    public Guid? BeneficiaryId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public int PageSize { get; set; } = 50;
    public int PageNumber { get; set; } = 1;
}

public class BillPaymentRequest
{
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string SourceAccountNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string BillerId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string BillNumber { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, 100000, ErrorMessage = "Amount must be between 0.01 and 100,000")]
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    [StringLength(500)]
    public string? Description { get; set; }
}

public class MobileRechargeRequest
{
    [Required]
    [StringLength(100)]
    public string IdempotencyKey { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string SourceAccountNumber { get; set; } = string.Empty;
    
    [Required]
    [Phone]
    public string MobileNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Operator { get; set; } = string.Empty;
    
    [Required]
    [Range(1, 1000, ErrorMessage = "Amount must be between 1 and 1,000")]
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
}