using System.ComponentModel.DataAnnotations;

namespace SupportService.Models;

public class SupportTicket
{
    [Key]
    public Guid Id { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public TicketStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum TicketStatus
{
    Open,
    InProgress,
    Resolved,
    Closed
}

public class ChatMessage
{
    [Key]
    public Guid Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public string MessageText { get; set; } = string.Empty;
    public string SenderType { get; set; } = string.Empty; // "User" or "Bot"
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
