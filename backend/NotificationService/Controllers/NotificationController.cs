using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NotificationService.Services;
using NotificationService.DTOs;

namespace NotificationService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(INotificationService notificationService, ILogger<NotificationController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Send a custom notification
    /// </summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
    {
        _logger.LogInformation("Sending {Type} notification to {Recipient}", 
            request.NotificationType, request.Recipient);

        var result = await _notificationService.SendNotificationAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Send a templated notification
    /// </summary>
    [HttpPost("send-template")]
    public async Task<IActionResult> SendTemplatedNotification([FromBody] SendTemplatedNotificationRequest request)
    {
        _logger.LogInformation("Sending templated {Type} notification using template {TemplateCode} to {Recipient}", 
            request.NotificationType, request.TemplateCode, request.Recipient);

        var result = await _notificationService.SendTemplatedNotificationAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Get notification by ID
    /// </summary>
    [HttpGet("{notificationId}")]
    public async Task<IActionResult> GetNotification([FromRoute] Guid notificationId)
    {
        var result = await _notificationService.GetNotificationAsync(notificationId);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get notifications with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] string? recipient = null,
        [FromQuery] string? status = null,
        [FromQuery] int pageSize = 50,
        [FromQuery] int pageNumber = 1)
    {
        if (pageSize > 100) pageSize = 100;
        if (pageNumber < 1) pageNumber = 1;

        var result = await _notificationService.GetNotificationsAsync(recipient, status, pageSize, pageNumber);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                Data = result.Data,
                PageSize = pageSize,
                PageNumber = pageNumber,
                Total = result.Data?.Count ?? 0
            });
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Process pending notifications (admin endpoint)
    /// </summary>
    [HttpPost("process-pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ProcessPendingNotifications()
    {
        var result = await _notificationService.ProcessPendingNotificationsAsync();

        if (result.IsSuccess)
        {
            return Ok(new { Message = "Pending notifications processed successfully" });
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Retry failed notifications (admin endpoint)
    /// </summary>
    [HttpPost("retry-failed")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RetryFailedNotifications()
    {
        var result = await _notificationService.RetryFailedNotificationsAsync();

        if (result.IsSuccess)
        {
            return Ok(new { Message = "Failed notifications retried successfully" });
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new { Status = "Healthy", Service = "NotificationService", Timestamp = DateTime.UtcNow });
    }
}