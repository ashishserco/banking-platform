using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NotificationService.Services;

namespace NotificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TemplateController : ControllerBase
{
    private readonly ITemplateService _templateService;
    private readonly ILogger<TemplateController> _logger;

    public TemplateController(ITemplateService templateService, ILogger<TemplateController> logger)
    {
        _templateService = templateService;
        _logger = logger;
    }

    /// <summary>
    /// Get all available templates
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTemplates()
    {
        var result = await _templateService.GetTemplatesAsync();

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get specific template
    /// </summary>
    [HttpGet("{templateCode}/{notificationType}")]
    public async Task<IActionResult> GetTemplate(
        [FromRoute] string templateCode,
        [FromRoute] string notificationType,
        [FromQuery] string language = "EN")
    {
        var result = await _templateService.GetTemplateAsync(templateCode, notificationType, language);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Preview template rendering with sample data
    /// </summary>
    [HttpPost("{templateCode}/{notificationType}/preview")]
    public async Task<IActionResult> PreviewTemplate(
        [FromRoute] string templateCode,
        [FromRoute] string notificationType,
        [FromBody] Dictionary<string, string> sampleData,
        [FromQuery] string language = "EN")
    {
        var result = await _templateService.RenderTemplateAsync(templateCode, notificationType, sampleData, language);

        if (result.IsSuccess)
        {
            return Ok(new { RenderedContent = result.Data });
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }
}