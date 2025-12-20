namespace SupportService.DTOs;

public class ChatRequest
{
    public string Text { get; set; } = string.Empty;
}

public class ChatResponse
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Sender { get; set; } = "bot";
    public DateTime Timestamp { get; set; }
    public List<QuickReply>? QuickReplies { get; set; }
}

public class QuickReply
{
    public string Id { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
}

public class CreateTicketRequest
{
    public string CustomerId { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
