using System.ComponentModel.DataAnnotations;

namespace NotificationService.DTOs;

public class NotificationDto
{
    public Guid NotificationId { get; set; }
    public string NotificationType { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public int MaxAttempts { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? NextRetryAt { get; set; }
    public string? FailureReason { get; set; }
    public Guid? CorrelationId { get; set; }
    public string? ExternalMessageId { get; set; }
    public string? ExternalProvider { get; set; }
}

public class SendNotificationRequest
{
    [Required]
    [RegularExpression("^(EMAIL|SMS|PUSH)$")]
    public string NotificationType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string EventType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Recipient { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Subject { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    [RegularExpression("^(LOW|NORMAL|HIGH|URGENT)$")]
    public string Priority { get; set; } = "NORMAL";
    
    public Guid? CorrelationId { get; set; }
    
    public string? SourceEvent { get; set; }
}

public class SendTemplatedNotificationRequest
{
    [Required]
    [RegularExpression("^(EMAIL|SMS|PUSH)$")]
    public string NotificationType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string TemplateCode { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Recipient { get; set; } = string.Empty;
    
    [Required]
    public Dictionary<string, string> TemplateData { get; set; } = new();
    
    [StringLength(10)]
    public string Language { get; set; } = "EN";
    
    [RegularExpression("^(LOW|NORMAL|HIGH|URGENT)$")]
    public string Priority { get; set; } = "NORMAL";
    
    public Guid? CorrelationId { get; set; }
    
    public string? SourceEvent { get; set; }
}

public class NotificationTemplateDto
{
    public Guid TemplateId { get; set; }
    public string TemplateCode { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string ContentTemplate { get; set; } = string.Empty;
    public string Language { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Description { get; set; }
}

public class NotificationStatsDto
{
    public int TotalNotifications { get; set; }
    public int PendingNotifications { get; set; }
    public int SentNotifications { get; set; }
    public int FailedNotifications { get; set; }
    public int RetryingNotifications { get; set; }
    public Dictionary<string, int> NotificationsByType { get; set; } = new();
    public Dictionary<string, int> NotificationsByStatus { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}