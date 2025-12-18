using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NotificationService.Models;

public class Notification
{
    [Key]
    public Guid NotificationId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(20)]
    public string NotificationType { get; set; } = string.Empty; // EMAIL, SMS, PUSH
    
    [Required]
    [StringLength(50)]
    public string EventType { get; set; } = string.Empty; // ACCOUNT_CREATED, TRANSACTION_COMPLETED, PAYMENT_PROCESSED, etc.
    
    [Required]
    [StringLength(200)]
    public string Recipient { get; set; } = string.Empty; // Email address, phone number, or device token
    
    [Required]
    [StringLength(200)]
    public string Subject { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty; // HTML or text content
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "PENDING"; // PENDING, SENT, FAILED, RETRYING
    
    [Required]
    [StringLength(10)]
    public string Priority { get; set; } = "NORMAL"; // LOW, NORMAL, HIGH, URGENT
    
    public int AttemptCount { get; set; } = 0;
    
    public int MaxAttempts { get; set; } = 3;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? SentAt { get; set; }
    
    public DateTime? NextRetryAt { get; set; }
    
    public string? FailureReason { get; set; }
    
    // Event correlation
    public Guid? CorrelationId { get; set; }
    public string? SourceEvent { get; set; } // Original event data
    
    // External provider details
    public string? ExternalMessageId { get; set; }
    public string? ExternalProvider { get; set; }
    public string? ExternalResponse { get; set; }
    
    // Template and personalization
    public string? TemplateId { get; set; }
    public string? TemplateData { get; set; } // JSON data for template variables
    
    // Business methods
    public void MarkAsSent(string? externalMessageId = null, string? externalProvider = null)
    {
        Status = "SENT";
        SentAt = DateTime.UtcNow;
        ExternalMessageId = externalMessageId;
        ExternalProvider = externalProvider;
        NextRetryAt = null;
    }
    
    public void MarkAsFailed(string reason, string? externalResponse = null)
    {
        AttemptCount++;
        FailureReason = reason;
        ExternalResponse = externalResponse;
        
        if (AttemptCount >= MaxAttempts)
        {
            Status = "FAILED";
            NextRetryAt = null;
        }
        else
        {
            Status = "RETRYING";
            NextRetryAt = CalculateNextRetryTime();
        }
    }
    
    public bool ShouldRetry()
    {
        return Status == "RETRYING" && 
               NextRetryAt.HasValue && 
               NextRetryAt.Value <= DateTime.UtcNow &&
               AttemptCount < MaxAttempts;
    }
    
    private DateTime CalculateNextRetryTime()
    {
        // Exponential backoff: 1 min, 5 min, 15 min
        var delayMinutes = AttemptCount switch
        {
            1 => 1,
            2 => 5,
            _ => 15
        };
        
        return DateTime.UtcNow.AddMinutes(delayMinutes);
    }
}

public class NotificationTemplate
{
    [Key]
    public Guid TemplateId { get; set; } = Guid.NewGuid();
    
    [Required]
    [StringLength(50)]
    public string TemplateCode { get; set; } = string.Empty; // ACCOUNT_WELCOME, TRANSACTION_ALERT, etc.
    
    [Required]
    [StringLength(20)]
    public string NotificationType { get; set; } = string.Empty; // EMAIL, SMS, PUSH
    
    [Required]
    [StringLength(200)]
    public string Subject { get; set; } = string.Empty;
    
    [Required]
    public string ContentTemplate { get; set; } = string.Empty; // Template with placeholders
    
    [Required]
    [StringLength(10)]
    public string Language { get; set; } = "EN";
    
    [Required]
    public bool IsActive { get; set; } = true;
    
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? UpdatedAt { get; set; }
    
    public string? Description { get; set; }
}

public class NotificationEvent
{
    [Key]
    public Guid EventId { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid NotificationId { get; set; }
    
    [Required]
    [StringLength(30)]
    public string EventType { get; set; } = string.Empty; // CREATED, SENT, FAILED, RETRIED
    
    [Required]
    public string EventData { get; set; } = string.Empty; // JSON
    
    [Required]
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    
    public Notification? Notification { get; set; }
}