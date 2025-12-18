using Microsoft.EntityFrameworkCore;
using Banking.Shared.Models;
using NotificationService.Data;
using NotificationService.DTOs;
using NotificationService.Models;
using System.Text.Json;

namespace NotificationService.Services;

public class NotificationServiceImpl : INotificationService
{
    private readonly NotificationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly IPushNotificationService _pushService;
    private readonly ITemplateService _templateService;
    private readonly ILogger<NotificationServiceImpl> _logger;

    public NotificationServiceImpl(
        NotificationDbContext context,
        IEmailService emailService,
        ISmsService smsService,
        IPushNotificationService pushService,
        ITemplateService templateService,
        ILogger<NotificationServiceImpl> logger)
    {
        _context = context;
        _emailService = emailService;
        _smsService = smsService;
        _pushService = pushService;
        _templateService = templateService;
        _logger = logger;
    }

    public async Task<Result<NotificationDto>> SendNotificationAsync(SendNotificationRequest request)
    {
        try
        {
            // Create notification record
            var notification = new Notification
            {
                NotificationType = request.NotificationType,
                EventType = request.EventType,
                Recipient = request.Recipient,
                Subject = request.Subject,
                Content = request.Content,
                Priority = request.Priority,
                CorrelationId = request.CorrelationId,
                SourceEvent = request.SourceEvent,
                MaxAttempts = GetMaxAttemptsForPriority(request.Priority)
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            await RecordEventAsync(notification.NotificationId, "CREATED", new
            {
                Type = notification.NotificationType,
                EventType = notification.EventType,
                Recipient = notification.Recipient,
                Priority = notification.Priority
            });

            _logger.LogInformation("Notification created: {NotificationId} - {Type} to {Recipient}",
                notification.NotificationId, notification.NotificationType, notification.Recipient);

            // Attempt immediate delivery
            await DeliverNotificationAsync(notification);

            return Result<NotificationDto>.Success(MapToNotificationDto(notification));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating notification");
            return Result<NotificationDto>.Failure("Failed to create notification");
        }
    }

    public async Task<Result<NotificationDto>> SendTemplatedNotificationAsync(SendTemplatedNotificationRequest request)
    {
        try
        {
            // Render template
            var renderResult = await _templateService.RenderTemplateAsync(
                request.TemplateCode, 
                request.NotificationType, 
                request.TemplateData, 
                request.Language);

            if (!renderResult.IsSuccess)
            {
                return Result<NotificationDto>.Failure($"Template rendering failed: {renderResult.ErrorMessage}");
            }

            // Get template for subject
            var templateResult = await _templateService.GetTemplateAsync(
                request.TemplateCode, 
                request.NotificationType, 
                request.Language);

            if (!templateResult.IsSuccess)
            {
                return Result<NotificationDto>.Failure($"Template not found: {templateResult.ErrorMessage}");
            }

            var template = templateResult.Data!;
            var renderedSubject = RenderSimpleTemplate(template.Subject, request.TemplateData);

            // Create notification
            var notification = new Notification
            {
                NotificationType = request.NotificationType,
                EventType = $"TEMPLATED_{request.TemplateCode}",
                Recipient = request.Recipient,
                Subject = renderedSubject,
                Content = renderResult.Data!,
                Priority = request.Priority,
                CorrelationId = request.CorrelationId,
                SourceEvent = request.SourceEvent,
                TemplateId = template.TemplateId.ToString(),
                TemplateData = JsonSerializer.Serialize(request.TemplateData),
                MaxAttempts = GetMaxAttemptsForPriority(request.Priority)
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            await RecordEventAsync(notification.NotificationId, "CREATED", new
            {
                Type = notification.NotificationType,
                TemplateCode = request.TemplateCode,
                Recipient = notification.Recipient,
                Priority = notification.Priority
            });

            _logger.LogInformation("Templated notification created: {NotificationId} - {TemplateCode} to {Recipient}",
                notification.NotificationId, request.TemplateCode, notification.Recipient);

            // Attempt immediate delivery
            await DeliverNotificationAsync(notification);

            return Result<NotificationDto>.Success(MapToNotificationDto(notification));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating templated notification");
            return Result<NotificationDto>.Failure("Failed to create templated notification");
        }
    }

    public async Task<Result<NotificationDto>> GetNotificationAsync(Guid notificationId)
    {
        try
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);

            if (notification == null)
            {
                return Result<NotificationDto>.Failure("Notification not found");
            }

            return Result<NotificationDto>.Success(MapToNotificationDto(notification));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification {NotificationId}", notificationId);
            return Result<NotificationDto>.Failure("Failed to retrieve notification");
        }
    }

    public async Task<Result<List<NotificationDto>>> GetNotificationsAsync(string? recipient = null, string? status = null, int pageSize = 50, int pageNumber = 1)
    {
        try
        {
            var query = _context.Notifications.AsQueryable();

            if (!string.IsNullOrEmpty(recipient))
            {
                query = query.Where(n => n.Recipient.Contains(recipient));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(n => n.Status == status);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var notificationDtos = notifications.Select(MapToNotificationDto).ToList();
            return Result<List<NotificationDto>>.Success(notificationDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications");
            return Result<List<NotificationDto>>.Failure("Failed to retrieve notifications");
        }
    }

    public async Task<Result> ProcessPendingNotificationsAsync()
    {
        try
        {
            var pendingNotifications = await _context.Notifications
                .Where(n => n.Status == "PENDING")
                .OrderBy(n => n.CreatedAt)
                .Take(100) // Process in batches
                .ToListAsync();

            foreach (var notification in pendingNotifications)
            {
                await DeliverNotificationAsync(notification);
            }

            _logger.LogInformation("Processed {Count} pending notifications", pendingNotifications.Count);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing pending notifications");
            return Result.Failure("Failed to process pending notifications");
        }
    }

    public async Task<Result> RetryFailedNotificationsAsync()
    {
        try
        {
            var retryNotifications = await _context.Notifications
                .Where(n => n.Status == "RETRYING" && 
                           n.NextRetryAt.HasValue && 
                           n.NextRetryAt.Value <= DateTime.UtcNow)
                .OrderBy(n => n.NextRetryAt)
                .Take(50) // Process in smaller batches for retries
                .ToListAsync();

            foreach (var notification in retryNotifications)
            {
                if (notification.ShouldRetry())
                {
                    await DeliverNotificationAsync(notification);
                }
            }

            _logger.LogInformation("Processed {Count} retry notifications", retryNotifications.Count);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing retry notifications");
            return Result.Failure("Failed to process retry notifications");
        }
    }

    private async Task DeliverNotificationAsync(Notification notification)
    {
        try
        {
            Result<string> deliveryResult = notification.NotificationType switch
            {
                "EMAIL" => await _emailService.SendEmailAsync(notification.Recipient, notification.Subject, notification.Content, true),
                "SMS" => await _smsService.SendSmsAsync(notification.Recipient, notification.Content),
                "PUSH" => await _pushService.SendPushNotificationAsync(notification.Recipient, notification.Subject, notification.Content),
                _ => Result<string>.Failure($"Unsupported notification type: {notification.NotificationType}")
            };

            if (deliveryResult.IsSuccess)
            {
                notification.MarkAsSent(deliveryResult.Data, GetProviderName(notification.NotificationType));

                await RecordEventAsync(notification.NotificationId, "SENT", new
                {
                    ExternalMessageId = deliveryResult.Data,
                    Provider = notification.ExternalProvider,
                    AttemptCount = notification.AttemptCount + 1
                });

                _logger.LogInformation("Notification delivered: {NotificationId} via {Type} - External ID: {ExternalId}",
                    notification.NotificationId, notification.NotificationType, deliveryResult.Data);
            }
            else
            {
                notification.MarkAsFailed(deliveryResult.ErrorMessage);

                await RecordEventAsync(notification.NotificationId, "FAILED", new
                {
                    Error = deliveryResult.ErrorMessage,
                    AttemptCount = notification.AttemptCount,
                    NextRetryAt = notification.NextRetryAt
                });

                _logger.LogWarning("Notification delivery failed: {NotificationId} - {Error} (Attempt {Attempt})",
                    notification.NotificationId, deliveryResult.ErrorMessage, notification.AttemptCount);
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error delivering notification {NotificationId}", notification.NotificationId);
            
            notification.MarkAsFailed($"Delivery exception: {ex.Message}");
            await _context.SaveChangesAsync();
        }
    }

    private static int GetMaxAttemptsForPriority(string priority)
    {
        return priority switch
        {
            "URGENT" => 5,
            "HIGH" => 4,
            "NORMAL" => 3,
            "LOW" => 2,
            _ => 3
        };
    }

    private static string GetProviderName(string notificationType)
    {
        return notificationType switch
        {
            "EMAIL" => "SendGrid",
            "SMS" => "Twilio",
            "PUSH" => "Firebase",
            _ => "Unknown"
        };
    }

    private static string RenderSimpleTemplate(string template, Dictionary<string, string> data)
    {
        var result = template;
        foreach (var kvp in data)
        {
            result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
        }
        return result;
    }

    private async Task RecordEventAsync(Guid notificationId, string eventType, object eventData)
    {
        try
        {
            var notificationEvent = new NotificationEvent
            {
                NotificationId = notificationId,
                EventType = eventType,
                EventData = JsonSerializer.Serialize(eventData)
            };

            _context.NotificationEvents.Add(notificationEvent);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to record event {EventType} for notification {NotificationId}", 
                eventType, notificationId);
        }
    }

    private static NotificationDto MapToNotificationDto(Notification notification)
    {
        return new NotificationDto
        {
            NotificationId = notification.NotificationId,
            NotificationType = notification.NotificationType,
            EventType = notification.EventType,
            Recipient = notification.Recipient,
            Subject = notification.Subject,
            Content = notification.Content,
            Status = notification.Status,
            Priority = notification.Priority,
            AttemptCount = notification.AttemptCount,
            MaxAttempts = notification.MaxAttempts,
            CreatedAt = notification.CreatedAt,
            SentAt = notification.SentAt,
            NextRetryAt = notification.NextRetryAt,
            FailureReason = notification.FailureReason,
            CorrelationId = notification.CorrelationId,
            ExternalMessageId = notification.ExternalMessageId,
            ExternalProvider = notification.ExternalProvider
        };
    }
}