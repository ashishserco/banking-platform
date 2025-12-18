using Banking.Shared.Models;

namespace NotificationService.Services;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;
    private readonly Random _random = new();

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public async Task<Result<string>> SendEmailAsync(string to, string subject, string content, bool isHtml = true)
    {
        _logger.LogInformation("Sending email to {To} with subject '{Subject}'", to, subject);

        // Simulate processing delay
        await Task.Delay(_random.Next(500, 2000));

        // Simulate occasional failures (2% failure rate)
        if (_random.NextDouble() < 0.02)
        {
            var errorMessage = "SMTP server temporarily unavailable";
            _logger.LogWarning("Email delivery failed: {Error}", errorMessage);
            return Result<string>.Failure(errorMessage);
        }

        // Generate mock message ID
        var messageId = $"email_{DateTime.UtcNow:yyyyMMddHHmmss}_{_random.Next(1000, 9999)}@banking-platform.com";

        _logger.LogInformation("Email sent successfully: {MessageId} to {To}", messageId, to);
        
        // In production, this would integrate with SendGrid, AWS SES, etc.
        return Result<string>.Success(messageId);
    }
}

public class MockSmsService : ISmsService
{
    private readonly ILogger<MockSmsService> _logger;
    private readonly Random _random = new();

    public MockSmsService(ILogger<MockSmsService> logger)
    {
        _logger = logger;
    }

    public async Task<Result<string>> SendSmsAsync(string phoneNumber, string message)
    {
        _logger.LogInformation("Sending SMS to {PhoneNumber}: {Message}", phoneNumber, message);

        // Simulate processing delay
        await Task.Delay(_random.Next(300, 1500));

        // Validate phone number format (basic validation)
        if (!IsValidPhoneNumber(phoneNumber))
        {
            return Result<string>.Failure("Invalid phone number format");
        }

        // Simulate occasional failures (3% failure rate)
        if (_random.NextDouble() < 0.03)
        {
            var errorMessage = "SMS gateway temporarily unavailable";
            _logger.LogWarning("SMS delivery failed: {Error}", errorMessage);
            return Result<string>.Failure(errorMessage);
        }

        // Generate mock message SID
        var messageSid = $"SMS{_random.Next(100000000, 999999999)}";

        _logger.LogInformation("SMS sent successfully: {MessageSid} to {PhoneNumber}", messageSid, phoneNumber);
        
        // In production, this would integrate with Twilio, AWS SNS, etc.
        return Result<string>.Success(messageSid);
    }

    private static bool IsValidPhoneNumber(string phoneNumber)
    {
        // Basic validation - starts with + and contains only digits and spaces
        return !string.IsNullOrEmpty(phoneNumber) && 
               phoneNumber.StartsWith('+') && 
               phoneNumber.Length >= 10 &&
               phoneNumber.Skip(1).All(c => char.IsDigit(c) || char.IsWhiteSpace(c));
    }
}

public class MockPushNotificationService : IPushNotificationService
{
    private readonly ILogger<MockPushNotificationService> _logger;
    private readonly Random _random = new();

    public MockPushNotificationService(ILogger<MockPushNotificationService> logger)
    {
        _logger = logger;
    }

    public async Task<Result<string>> SendPushNotificationAsync(string deviceToken, string title, string message, Dictionary<string, string>? data = null)
    {
        _logger.LogInformation("Sending push notification to device {DeviceToken}: {Title} - {Message}", 
            deviceToken, title, message);

        // Simulate processing delay
        await Task.Delay(_random.Next(200, 1000));

        // Simulate occasional failures (1% failure rate)
        if (_random.NextDouble() < 0.01)
        {
            var errorMessage = "Push notification service temporarily unavailable";
            _logger.LogWarning("Push notification delivery failed: {Error}", errorMessage);
            return Result<string>.Failure(errorMessage);
        }

        // Generate mock notification ID
        var notificationId = $"push_{DateTime.UtcNow:yyyyMMddHHmmss}_{_random.Next(1000, 9999)}";

        _logger.LogInformation("Push notification sent successfully: {NotificationId} to device {DeviceToken}", 
            notificationId, deviceToken);
        
        // In production, this would integrate with Firebase, Apple Push Notification Service, etc.
        return Result<string>.Success(notificationId);
    }
}