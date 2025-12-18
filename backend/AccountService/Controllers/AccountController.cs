using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AccountService.Services;
using AccountService.DTOs;
using System.ComponentModel.DataAnnotations;

namespace AccountService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Require authentication for all endpoints
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly ILogger<AccountController> _logger;

    public AccountController(IAccountService accountService, ILogger<AccountController> logger)
    {
        _accountService = accountService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new bank account
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        _logger.LogInformation("Creating account for customer {CustomerId}", request.CustomerId);
        
        var result = await _accountService.CreateAccountAsync(request);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetAccount), new { accountId = result.Data!.AccountId }, result.Data);
        }
        
        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Get account by ID
    /// </summary>
    [HttpGet("{accountId}")]
    public async Task<IActionResult> GetAccount([FromRoute] Guid accountId)
    {
        var result = await _accountService.GetAccountAsync(accountId);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get account by account number
    /// </summary>
    [HttpGet("number/{accountNumber}")]
    public async Task<IActionResult> GetAccountByNumber([FromRoute] string accountNumber)
    {
        var result = await _accountService.GetAccountByNumberAsync(accountNumber);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get account balance
    /// </summary>
    [HttpGet("balance/{accountNumber}")]
    public async Task<IActionResult> GetBalance([FromRoute] string accountNumber)
    {
        var result = await _accountService.GetBalanceAsync(accountNumber);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get all accounts for a customer
    /// </summary>
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetAccountsByCustomer([FromRoute] Guid customerId)
    {
        var result = await _accountService.GetAccountsByCustomerAsync(customerId);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Update account status (ACTIVE, INACTIVE, FROZEN, CLOSED)
    /// </summary>
    [HttpPatch("{accountNumber}/status")]
    public async Task<IActionResult> UpdateAccountStatus(
        [FromRoute] string accountNumber,
        [FromBody] UpdateAccountStatusRequest request)
    {
        var result = await _accountService.UpdateAccountStatusAsync(accountNumber, request.Status);
        
        if (result.IsSuccess)
        {
            return NoContent();
        }
        
        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get transaction history for an account
    /// </summary>
    [HttpGet("{accountNumber}/transactions")]
    public async Task<IActionResult> GetTransactionHistory(
        [FromRoute] string accountNumber,
        [FromQuery] int pageSize = 50,
        [FromQuery] int pageNumber = 1)
    {
        if (pageSize > 100) pageSize = 100; // Limit page size
        if (pageNumber < 1) pageNumber = 1;

        var result = await _accountService.GetTransactionHistoryAsync(accountNumber, pageSize, pageNumber);
        
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
}

public class UpdateAccountStatusRequest
{
    [Required]
    [RegularExpression("^(ACTIVE|INACTIVE|FROZEN|CLOSED)$", ErrorMessage = "Status must be ACTIVE, INACTIVE, FROZEN, or CLOSED")]
    public string Status { get; set; } = string.Empty;
}