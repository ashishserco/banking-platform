# Duplicate Prevention Strategy

## Overview

This document outlines comprehensive duplicate prevention mechanisms for the banking platform, ensuring exactly-once processing of financial transactions and preventing data inconsistencies that could lead to financial losses.

## 🔑 Idempotency Implementation

### API-Level Idempotency

#### Idempotency Key Strategy
```csharp
[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly IIdempotencyService _idempotencyService;
    private readonly ITransactionService _transactionService;
    
    [HttpPost("transfer")]
    public async Task<IActionResult> CreateTransfer(
        [FromBody] TransferRequest request,
        [FromHeader(Name = "Idempotency-Key")] string idempotencyKey)
    {
        if (string.IsNullOrEmpty(idempotencyKey))
        {
            return BadRequest("Idempotency-Key header is required");
        }
        
        // Check if this operation has already been processed
        var existingResult = await _idempotencyService.GetResult(idempotencyKey);
        if (existingResult != null)
        {
            return Ok(existingResult); // Return cached result
        }
        
        try
        {
            var result = await _transactionService.ProcessTransfer(request);
            
            // Cache the result for future duplicate requests
            await _idempotencyService.StoreResult(idempotencyKey, result, TimeSpan.FromHours(24));
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transfer failed for idempotency key {IdempotencyKey}", idempotencyKey);
            return StatusCode(500, "Transfer processing failed");
        }
    }
}
```

#### Redis-Based Idempotency Service
```csharp
public class RedisIdempotencyService : IIdempotencyService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<RedisIdempotencyService> _logger;
    
    public async Task<T> GetResult<T>(string idempotencyKey) where T : class
    {
        try
        {
            var cached = await _cache.GetStringAsync($"idempotency:{idempotencyKey}");
            return cached != null ? JsonSerializer.Deserialize<T>(cached) : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to retrieve idempotency result for key {Key}", idempotencyKey);
            return null;
        }
    }
    
    public async Task StoreResult<T>(string idempotencyKey, T result, TimeSpan expiry)
    {
        try
        {
            var serialized = JsonSerializer.Serialize(result);
            await _cache.SetStringAsync($"idempotency:{idempotencyKey}", serialized, 
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = expiry });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to store idempotency result for key {Key}", idempotencyKey);
        }
    }
}
```

### Database-Level Duplicate Prevention

#### Unique Constraints Strategy
```sql
-- Transaction table with duplicate prevention
CREATE TABLE Transactions (
    TransactionId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IdempotencyKey VARCHAR(100) NOT NULL,
    FromAccountId UNIQUEIDENTIFIER NOT NULL,
    ToAccountId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Prevent duplicate transactions
    CONSTRAINT UK_Transactions_IdempotencyKey UNIQUE (IdempotencyKey),
    
    -- Prevent duplicate transfers between same accounts with same amount in short time
    CONSTRAINT UK_Transactions_DuplicateTransfer UNIQUE (FromAccountId, ToAccountId, Amount, CAST(CreatedAt AS DATE))
);

-- Payment table with comprehensive duplicate prevention
CREATE TABLE Payments (
    PaymentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IdempotencyKey VARCHAR(100) NOT NULL,
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    ExternalTransactionId VARCHAR(100) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- Multiple layers of duplicate prevention
    CONSTRAINT UK_Payments_IdempotencyKey UNIQUE (IdempotencyKey),
    CONSTRAINT UK_Payments_ExternalTxn UNIQUE (ExternalTransactionId),
    
    -- Prevent rapid duplicate payments
    INDEX IX_Payments_DuplicateCheck (CustomerId, Amount, PaymentMethod, CreatedAt)
);
```

## 🔒 Message Deduplication

### Service Bus Duplicate Detection

#### Azure Service Bus Configuration
```csharp
public class ServiceBusConfiguration
{
    public static ServiceBusClient CreateClient(string connectionString)
    {
        var options = new ServiceBusClientOptions
        {
            RetryOptions = new ServiceBusRetryOptions
            {
                Mode = ServiceBusRetryMode.Exponential,
                MaxRetries = 3,
                Delay = TimeSpan.FromSeconds(1),
                MaxDelay = TimeSpan.FromSeconds(10)
            }
        };
        
        return new ServiceBusClient(connectionString, options);
    }
    
    public static async Task CreateTopicWithDuplication(ServiceBusAdministrationClient adminClient, 
        string topicName)
    {
        var topicOptions = new CreateTopicOptions(topicName)
        {
            RequiresDuplicateDetection = true,
            DuplicateDetectionHistoryTimeWindow = TimeSpan.FromMinutes(10),
            MaxSizeInMegabytes = 5120,
            EnablePartitioning = true
        };
        
        await adminClient.CreateTopicAsync(topicOptions);
    }
}
```

#### Message Publishing with Deduplication
```csharp
public class EventPublisher : IEventPublisher
{
    private readonly ServiceBusSender _sender;
    
    public async Task PublishAsync<T>(T @event) where T : IEvent
    {
        var message = new ServiceBusMessage
        {
            MessageId = @event.EventId.ToString(), // Unique message ID for deduplication
            Body = BinaryData.FromObjectAsJson(@event),
            ContentType = "application/json",
            Subject = typeof(T).Name,
            CorrelationId = @event.CorrelationId
        };
        
        // Set custom properties for additional deduplication
        message.ApplicationProperties["EventType"] = typeof(T).Name;
        message.ApplicationProperties["Timestamp"] = @event.Timestamp;
        message.ApplicationProperties["SourceSystem"] = "BankingPlatform";
        
        try
        {
            await _sender.SendMessageAsync(message);
            _logger.LogInformation("Event published: {EventType} with ID {EventId}", 
                typeof(T).Name, @event.EventId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish event: {EventType} with ID {EventId}", 
                typeof(T).Name, @event.EventId);
            throw;
        }
    }
}
```

## ⚡ At-Least-Once Processing

### Consumer Idempotency

#### Event Processing with Duplicate Detection
```csharp
public class TransactionEventHandler : IEventHandler<TransactionCreatedEvent>
{
    private readonly IEventStore _eventStore;
    private readonly INotificationService _notificationService;
    
    public async Task Handle(TransactionCreatedEvent @event)
    {
        var processingKey = $"processed:{@event.EventId}";
        
        // Check if event has already been processed
        if (await _eventStore.HasBeenProcessed(processingKey))
        {
            _logger.LogInformation("Event {EventId} already processed, skipping", @event.EventId);
            return;
        }
        
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Mark as processing to prevent concurrent processing
            await _eventStore.MarkAsProcessing(processingKey);
            
            // Process the event
            await _notificationService.SendTransactionNotification(@event.CustomerId, @event);
            
            // Mark as completed
            await _eventStore.MarkAsCompleted(processingKey);
            
            await transaction.CommitAsync();
            
            _logger.LogInformation("Successfully processed event {EventId}", @event.EventId);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            await _eventStore.MarkAsFailed(processingKey, ex.Message);
            
            _logger.LogError(ex, "Failed to process event {EventId}", @event.EventId);
            throw;
        }
    }
}
```

This duplicate prevention strategy ensures financial data integrity through multiple layers of protection at the API, database, and messaging levels.