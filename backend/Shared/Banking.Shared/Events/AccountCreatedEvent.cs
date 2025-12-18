namespace Banking.Shared.Events;

public class AccountCreatedEvent : IEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid();
    public DateTime OccuredAt { get; set; } = DateTime.UtcNow;
    public string EventType { get; set; } = nameof(AccountCreatedEvent);
    
    public Guid AccountId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public string Currency { get; set; } = "USD";
}