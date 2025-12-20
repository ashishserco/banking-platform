using SupportService.Models;
using SupportService.DTOs;
using Microsoft.EntityFrameworkCore;

namespace SupportService.Services;

public interface IChatbotService
{
    Task<ChatResponse> ProcessMessageAsync(ChatRequest request);
}

public interface ISupportService
{
    Task<IEnumerable<SupportTicket>> GetTicketsAsync(string customerId);
    Task<SupportTicket> CreateTicketAsync(CreateTicketRequest request);
}

public class ChatbotServiceImpl : IChatbotService
{
    private readonly ILogger<ChatbotServiceImpl> _logger;

    public ChatbotServiceImpl(ILogger<ChatbotServiceImpl> logger)
    {
        _logger = logger;
    }

    public async Task<ChatResponse> ProcessMessageAsync(ChatRequest request)
    {
        _logger.LogInformation("Processing chat message: {Message}", request.Text);
        
        // Simulate processing delay
        await Task.Delay(500);

        var responseText = GetRuleBasedResponse(request.Text);
        
        return new ChatResponse
        {
            Id = Guid.NewGuid(),
            Text = responseText,
            Sender = "bot",
            Timestamp = DateTime.UtcNow,
            QuickReplies = GetQuickReplies(responseText)
        };
    }

    private string GetRuleBasedResponse(string message)
    {
        var lower = message.ToLowerInvariant();
        if (lower.Contains("balance")) return "Your current balance across all accounts is $125,750.50. Would you like a breakdown?";
        if (lower.Contains("transfer")) return "I can help with transfers. You'll need the recipient's account number and IFSC code.";
        if (lower.Contains("loan")) return "We offer Home Loans at 8.4% and Personal Loans from 10.5%. Want to check eligibility?";
        return "I'm Aadhya, your AI assistant. How can I help you with your banking today?";
    }

    private List<QuickReply> GetQuickReplies(string response)
    {
        if (response.Contains("balance"))
        {
            return new List<QuickReply> 
            { 
                new() { Id = "1", Text = "Show Breakdown", Action = "show_balance" },
                new() { Id = "2", Text = "Back", Action = "main_menu" }
            };
        }
        return new List<QuickReply> 
        { 
            new() { Id = "1", Text = "Check Balance", Action = "balance_inquiry" },
            new() { Id = "2", Text = "Support Ticket", Action = "create_ticket" }
        };
    }
}

public class SupportServiceImpl : ISupportService
{
    private readonly Data.SupportDbContext _context;

    public SupportServiceImpl(Data.SupportDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SupportTicket>> GetTicketsAsync(string customerId)
    {
        return await _context.SupportTickets
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<SupportTicket> CreateTicketAsync(CreateTicketRequest request)
    {
        var ticket = new SupportTicket
        {
            Id = Guid.NewGuid(),
            CustomerId = request.CustomerId,
            Subject = request.Subject,
            Description = request.Description,
            Status = TicketStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _context.SupportTickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }
}
