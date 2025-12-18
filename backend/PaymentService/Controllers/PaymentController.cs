using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PaymentService.Services;
using PaymentService.DTOs;
using System.ComponentModel.DataAnnotations;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// Process a generic payment to a beneficiary
    /// </summary>
    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest request)
    {
        _logger.LogInformation("Processing payment: {PaymentType} - {Amount} {Currency} from {SourceAccount}",
            request.PaymentType, request.Amount, request.Currency, request.SourceAccountNumber);

        var result = await _paymentService.ProcessPaymentAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Process a bill payment
    /// </summary>
    [HttpPost("bill")]
    public async Task<IActionResult> ProcessBillPayment([FromBody] BillPaymentRequest request)
    {
        _logger.LogInformation("Processing bill payment: {BillerId}/{BillNumber} - {Amount} from {SourceAccount}",
            request.BillerId, request.BillNumber, request.Amount, request.SourceAccountNumber);

        var result = await _paymentService.ProcessBillPaymentAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Process a mobile recharge
    /// </summary>
    [HttpPost("mobile-recharge")]
    public async Task<IActionResult> ProcessMobileRecharge([FromBody] MobileRechargeRequest request)
    {
        _logger.LogInformation("Processing mobile recharge: {MobileNumber}/{Operator} - {Amount} from {SourceAccount}",
            request.MobileNumber, request.Operator, request.Amount, request.SourceAccountNumber);

        var result = await _paymentService.ProcessMobileRechargeAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Get payment by ID
    /// </summary>
    [HttpGet("{paymentId}")]
    public async Task<IActionResult> GetPayment([FromRoute] Guid paymentId)
    {
        var result = await _paymentService.GetPaymentAsync(paymentId);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get payment by idempotency key
    /// </summary>
    [HttpGet("idempotency/{idempotencyKey}")]
    public async Task<IActionResult> GetPaymentByIdempotencyKey([FromRoute] string idempotencyKey)
    {
        var result = await _paymentService.GetPaymentByIdempotencyKeyAsync(idempotencyKey);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Search payments with filters
    /// </summary>
    [HttpPost("search")]
    public async Task<IActionResult> SearchPayments([FromBody] PaymentSearchRequest request)
    {
        // Validate page parameters
        if (request.PageSize > 100) request.PageSize = 100;
        if (request.PageNumber < 1) request.PageNumber = 1;

        var result = await _paymentService.SearchPaymentsAsync(request);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                Data = result.Data,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                Total = result.Data?.Count ?? 0
            });
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get payments for a specific account
    /// </summary>
    [HttpGet("account/{accountNumber}")]
    public async Task<IActionResult> GetAccountPayments(
        [FromRoute] string accountNumber,
        [FromQuery] int pageSize = 50,
        [FromQuery] int pageNumber = 1)
    {
        if (pageSize > 100) pageSize = 100;
        if (pageNumber < 1) pageNumber = 1;

        var result = await _paymentService.GetAccountPaymentsAsync(accountNumber, pageSize, pageNumber);

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
    /// Cancel a payment
    /// </summary>
    [HttpPost("{paymentId}/cancel")]
    public async Task<IActionResult> CancelPayment(
        [FromRoute] Guid paymentId,
        [FromBody] CancelPaymentRequest request)
    {
        var result = await _paymentService.CancelPaymentAsync(paymentId, request.Reason);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Refund a payment
    /// </summary>
    [HttpPost("{paymentId}/refund")]
    public async Task<IActionResult> RefundPayment(
        [FromRoute] Guid paymentId,
        [FromBody] RefundPaymentRequest request)
    {
        var result = await _paymentService.RefundPaymentAsync(paymentId, request.Reason);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
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
        return Ok(new { Status = "Healthy", Service = "PaymentService", Timestamp = DateTime.UtcNow });
    }
}

public class CancelPaymentRequest
{
    [Required]
    [StringLength(500, MinimumLength = 5)]
    public string Reason { get; set; } = string.Empty;
}

public class RefundPaymentRequest
{
    [Required]
    [StringLength(500, MinimumLength = 5)]
    public string Reason { get; set; } = string.Empty;
}