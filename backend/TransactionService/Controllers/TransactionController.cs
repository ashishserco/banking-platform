using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TransactionService.Services;
using TransactionService.DTOs;
using System.ComponentModel.DataAnnotations;

namespace TransactionService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly ILogger<TransactionController> _logger;

    public TransactionController(ITransactionService transactionService, ILogger<TransactionController> logger)
    {
        _transactionService = transactionService;
        _logger = logger;
    }

    /// <summary>
    /// Transfer money between accounts
    /// </summary>
    [HttpPost("transfer")]
    public async Task<IActionResult> TransferMoney([FromBody] TransferMoneyRequest request)
    {
        _logger.LogInformation("Processing money transfer: {Amount} {Currency} from {From} to {To}",
            request.Amount, request.Currency, request.FromAccountNumber, request.ToAccountNumber);

        var result = await _transactionService.TransferMoneyAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Deposit money to an account
    /// </summary>
    [HttpPost("deposit")]
    public async Task<IActionResult> DepositMoney([FromBody] DepositMoneyRequest request)
    {
        _logger.LogInformation("Processing deposit: {Amount} {Currency} to {AccountNumber}",
            request.Amount, request.Currency, request.AccountNumber);

        var result = await _transactionService.DepositMoneyAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Withdraw money from an account
    /// </summary>
    [HttpPost("withdraw")]
    public async Task<IActionResult> WithdrawMoney([FromBody] WithdrawMoneyRequest request)
    {
        _logger.LogInformation("Processing withdrawal: {Amount} {Currency} from {AccountNumber}",
            request.Amount, request.Currency, request.AccountNumber);

        var result = await _transactionService.WithdrawMoneyAsync(request);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Get transaction by ID
    /// </summary>
    [HttpGet("{transactionId}")]
    public async Task<IActionResult> GetTransaction([FromRoute] Guid transactionId)
    {
        var result = await _transactionService.GetTransactionAsync(transactionId);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get transaction by idempotency key
    /// </summary>
    [HttpGet("idempotency/{idempotencyKey}")]
    public async Task<IActionResult> GetTransactionByIdempotencyKey([FromRoute] string idempotencyKey)
    {
        var result = await _transactionService.GetTransactionByIdempotencyKeyAsync(idempotencyKey);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Search transactions with filters
    /// </summary>
    [HttpPost("search")]
    public async Task<IActionResult> SearchTransactions([FromBody] TransactionSearchRequest request)
    {
        // Validate page parameters
        if (request.PageSize > 100) request.PageSize = 100;
        if (request.PageNumber < 1) request.PageNumber = 1;

        var result = await _transactionService.SearchTransactionsAsync(request);

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
    /// Get transactions for a specific account
    /// </summary>
    [HttpGet("account/{accountNumber}")]
    public async Task<IActionResult> GetAccountTransactions(
        [FromRoute] string accountNumber,
        [FromQuery] int pageSize = 50,
        [FromQuery] int pageNumber = 1)
    {
        if (pageSize > 100) pageSize = 100;
        if (pageNumber < 1) pageNumber = 1;

        var result = await _transactionService.GetAccountTransactionsAsync(accountNumber, pageSize, pageNumber);

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
    /// Cancel a transaction
    /// </summary>
    [HttpPost("{transactionId}/cancel")]
    public async Task<IActionResult> CancelTransaction(
        [FromRoute] Guid transactionId,
        [FromBody] CancelTransactionRequest request)
    {
        var result = await _transactionService.CancelTransactionAsync(transactionId, request.Reason);

        if (result.IsSuccess)
        {
            return NoContent();
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
        return Ok(new { Status = "Healthy", Service = "TransactionService", Timestamp = DateTime.UtcNow });
    }
}

public class CancelTransactionRequest
{
    [Required]
    [StringLength(500, MinimumLength = 5)]
    public string Reason { get; set; } = string.Empty;
}