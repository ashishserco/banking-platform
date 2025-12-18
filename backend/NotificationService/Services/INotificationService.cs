using Banking.Shared.Models;
using NotificationService.DTOs;

namespace NotificationService.Services;

public interface INotificationService
{
    Task<Result<NotificationDto>> SendNotificationAsync(SendNotificationRequest request);
    Task<Result<NotificationDto>> SendTemplatedNotificationAsync(SendTemplatedNotificationRequest request);
    Task<Result<NotificationDto>> GetNotificationAsync(Guid notificationId);
    Task<Result<List<NotificationDto>>> GetNotificationsAsync(string? recipient = null, string? status = null, int pageSize = 50, int pageNumber = 1);
    Task<Result> ProcessPendingNotificationsAsync();
    Task<Result> RetryFailedNotificationsAsync();
}

public interface IEmailService
{
    Task<Result<string>> SendEmailAsync(string to, string subject, string content, bool isHtml = true);
}

public interface ISmsService
{
    Task<Result<string>> SendSmsAsync(string phoneNumber, string message);
}

public interface IPushNotificationService
{
    Task<Result<string>> SendPushNotificationAsync(string deviceToken, string title, string message, Dictionary<string, string>? data = null);
}

public interface ITemplateService
{
    Task<Result<string>> RenderTemplateAsync(string templateCode, string notificationType, Dictionary<string, string> templateData, string language = "EN");
    Task<Result<NotificationTemplateDto>> GetTemplateAsync(string templateCode, string notificationType, string language = "EN");
    Task<Result<List<NotificationTemplateDto>>> GetTemplatesAsync();
}