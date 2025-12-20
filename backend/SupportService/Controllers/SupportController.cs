using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SupportService.Services;
using SupportService.DTOs;
using System.Security.Claims;

namespace SupportService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly ISupportService _supportService;

    public SupportController(ISupportService supportService)
    {
        _supportService = supportService;
    }

    [HttpGet("tickets")]
    public async Task<IActionResult> GetTickets()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "demo_user";
        var tickets = await _supportService.GetTicketsAsync(userId);
        return Ok(new { Data = tickets });
    }

    [HttpPost("tickets")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        if (string.IsNullOrEmpty(request.CustomerId))
        {
            request.CustomerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "demo_user";
        }
        
        var ticket = await _supportService.CreateTicketAsync(request);
        return Ok(new { Data = ticket });
    }
}
