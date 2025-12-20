using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SupportService.Services;
using SupportService.DTOs;

namespace SupportService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatbotService _chatbotService;

    public ChatController(IChatbotService chatbotService)
    {
        _chatbotService = chatbotService;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessMessage([FromBody] ChatRequest request)
    {
        var response = await _chatbotService.ProcessMessageAsync(request);
        return Ok(new { Data = response });
    }
}
