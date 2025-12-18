namespace Banking.Shared.Events;

public interface IEvent
{
    Guid EventId { get; }
    DateTime OccuredAt { get; }
    string EventType { get; }
}