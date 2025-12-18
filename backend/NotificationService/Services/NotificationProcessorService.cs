using Azure.Messaging.ServiceBus;
using NotificationService.Services;
using System.Text.Json;

namespace NotificationService.Services;

public class NotificationProcessorService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ServiceBusClient _serviceBusClient;
    private readonly ILogger<NotificationProcessorService> _logger;
    private ServiceBusProcessor? _processor;

    public NotificationProcessorService(
        IServiceProvider serviceProvider, 
        ServiceBusClient serviceBusClient,
        ILogger<NotificationProcessorService> logger)
    {
        _serviceProvider = serviceProvider;
        _serviceBusClient = serviceBusClient;
        _logger = logger;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        // Create processor for banking events
        _processor = _serviceBusClient.CreateProcessor("banking-events", new ServiceBusProcessorOptions
        {
            MaxConcurrentCalls = 10,
            AutoCompleteMessages = false,
            ReceiveMode = ServiceBusReceiveMode.PeekLock
        });

        _processor.ProcessMessageAsync += ProcessEventMessage;
        _processor.ProcessErrorAsync += ProcessError;

        await _processor.StartProcessingAsync(cancellationToken);
        _logger.LogInformation("Notification processor started");

        await base.StartAsync(cancellationToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_processor != null)
        {
            await _processor.StopProcessingAsync(cancellationToken);
            await _processor.DisposeAsync();
        }

        await base.StopAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                try
                {
                    // Process pending notifications
                    await notificationService.ProcessPendingNotificationsAsync();
                    
                    // Retry failed notifications
                    await notificationService.RetryFailedNotificationsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in notification processor");
                }
            }

            // Wait before next processing cycle
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task ProcessEventMessage(ProcessMessageEventArgs args)
    {
        try
        {
            var messageBody = args.Message.Body.ToString();
            var eventType = args.Message.Subject;

            _logger.LogInformation("Processing event: {EventType}", eventType);

            using (var scope = _serviceProvider.CreateScope())
            {
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                await ProcessBankingEvent(notificationService, eventType, messageBody);
            }

            await args.CompleteMessageAsync(args.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            await args.AbandonMessageAsync(args.Message);
        }
    }

    private async Task ProcessBankingEvent(INotificationService notificationService, string eventType, string eventData)
    {
        try
        {
            switch (eventType)
            {
                case "AccountCreatedEvent":
                    await HandleAccountCreatedEvent(notificationService, eventData);
                    break;
                case "TransactionCompletedEvent":
                    await HandleTransactionCompletedEvent(notificationService, eventData);
                    break;
                case "PaymentCompletedEvent":
                    await HandlePaymentCompletedEvent(notificationService, eventData);
                    break;
                default:
                    _logger.LogInformation("Unhandled event type: {EventType}", eventType);
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling event {EventType}", eventType);
        }
    }

    private async Task HandleAccountCreatedEvent(INotificationService notificationService, string eventData)
    {
        var accountEvent = JsonSerializer.Deserialize<AccountCreatedEventData>(eventData);
        if (accountEvent == null) return;

        // Send welcome notifications
        var templateData = new Dictionary<string, string>
        {
            ["CustomerName"] = "Valued Customer", // Would get from customer service
            ["AccountNumber"] = accountEvent.AccountNumber,
            ["AccountType"] = accountEvent.AccountType,
            ["InitialBalance"] = accountEvent.InitialBalance.ToString("F2"),
            ["Currency"] = accountEvent.Currency
        };

        // Email notification
        await notificationService.SendTemplatedNotificationAsync(new DTOs.SendTemplatedNotificationRequest
        {
            NotificationType = "EMAIL",
            TemplateCode = "ACCOUNT_WELCOME",
            Recipient = "customer@email.com", // Would get from customer service
            TemplateData = templateData,
            Priority = "HIGH",
            CorrelationId = accountEvent.AccountId
        });

        // SMS notification
        await notificationService.SendTemplatedNotificationAsync(new DTOs.SendTemplatedNotificationRequest
        {
            NotificationType = "SMS",
            TemplateCode = "ACCOUNT_WELCOME",
            Recipient = "+1234567890", // Would get from customer service
            TemplateData = templateData,
            Priority = "NORMAL",
            CorrelationId = accountEvent.AccountId
        });
    }

    private async Task HandleTransactionCompletedEvent(INotificationService notificationService, string eventData)
    {
        var transactionEvent = JsonSerializer.Deserialize<TransactionCompletedEventData>(eventData);
        if (transactionEvent == null) return;

        var templateData = new Dictionary<string, string>
        {
            ["TransactionType"] = transactionEvent.TransactionType,
            ["Amount"] = transactionEvent.Amount.ToString("F2"),
            ["Currency"] = transactionEvent.Currency,
            ["AccountNumber"] = transactionEvent.FromAccountNumber ?? transactionEvent.ToAccountNumber,
            ["TransactionDate"] = transactionEvent.CompletedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            ["ReferenceNumber"] = $"TXN{transactionEvent.TransactionId.ToString()[..8]}"
        };

        // High-value transaction alert (email)
        if (transactionEvent.Amount >= 1000)
        {
            await notificationService.SendTemplatedNotificationAsync(new DTOs.SendTemplatedNotificationRequest
            {
                NotificationType = "EMAIL",
                TemplateCode = "TRANSACTION_ALERT",
                Recipient = "customer@email.com",
                TemplateData = templateData,
                Priority = "HIGH",
                CorrelationId = transactionEvent.TransactionId
            });
        }

        // SMS alert for all transactions
        await notificationService.SendTemplatedNotificationAsync(new DTOs.SendTemplatedNotificationRequest
        {
            NotificationType = "SMS",
            TemplateCode = "TRANSACTION_ALERT",
            Recipient = "+1234567890",
            TemplateData = templateData,
            Priority = "NORMAL",
            CorrelationId = transactionEvent.TransactionId
        });
    }

    private async Task HandlePaymentCompletedEvent(INotificationService notificationService, string eventData)
    {
        var paymentEvent = JsonSerializer.Deserialize<PaymentCompletedEventData>(eventData);
        if (paymentEvent == null) return;

        var templateData = new Dictionary<string, string>
        {
            ["PaymentType"] = paymentEvent.PaymentType,
            ["Amount"] = paymentEvent.Amount.ToString("F2"),
            ["Currency"] = paymentEvent.Currency,
            ["BeneficiaryName"] = paymentEvent.BeneficiaryName,
            ["PaymentDate"] = paymentEvent.CompletedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            ["ReferenceNumber"] = paymentEvent.ExternalTransactionId ?? $"PAY{paymentEvent.PaymentId.ToString()[..8]}"
        };

        // Email confirmation
        await notificationService.SendTemplatedNotificationAsync(new DTOs.SendTemplatedNotificationRequest
        {
            NotificationType = "EMAIL",
            TemplateCode = "PAYMENT_CONFIRMATION",
            Recipient = "customer@email.com",
            TemplateData = templateData,
            Priority = "NORMAL",
            CorrelationId = paymentEvent.PaymentId
        });
    }

    private Task ProcessError(ProcessErrorEventArgs args)
    {
        _logger.LogError(args.Exception, "Service Bus processing error");
        return Task.CompletedTask;
    }

    // Event data models
    private class AccountCreatedEventData
    {
        public Guid AccountId { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public decimal InitialBalance { get; set; }
        public string Currency { get; set; } = string.Empty;
    }

    private class TransactionCompletedEventData
    {
        public Guid TransactionId { get; set; }
        public string? FromAccountNumber { get; set; }
        public string? ToAccountNumber { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public DateTime CompletedAt { get; set; }
    }

    private class PaymentCompletedEventData
    {
        public Guid PaymentId { get; set; }
        public string SourceAccountNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentType { get; set; } = string.Empty;
        public string BeneficiaryName { get; set; } = string.Empty;
        public string? ExternalTransactionId { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}