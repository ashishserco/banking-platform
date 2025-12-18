using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AccountService.Services;
using AccountService.DTOs;

namespace AccountService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly ILogger<CustomerController> _logger;

    public CustomerController(ICustomerService customerService, ILogger<CustomerController> logger)
    {
        _customerService = customerService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new customer
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        _logger.LogInformation("Creating customer with email {Email}", request.Email);
        
        var result = await _customerService.CreateCustomerAsync(request);
        
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetCustomer), new { customerId = result.Data!.CustomerId }, result.Data);
        }
        
        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Get customer by ID
    /// </summary>
    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetCustomer([FromRoute] Guid customerId)
    {
        var result = await _customerService.GetCustomerAsync(customerId);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get customer by email
    /// </summary>
    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetCustomerByEmail([FromRoute] string email)
    {
        var result = await _customerService.GetCustomerByEmailAsync(email);
        
        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }
        
        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Update customer KYC status
    /// </summary>
    [HttpPatch("{customerId}/kyc-status")]
    public async Task<IActionResult> UpdateKycStatus(
        [FromRoute] Guid customerId,
        [FromBody] UpdateKycStatusRequest request)
    {
        var result = await _customerService.UpdateKycStatusAsync(customerId, request.KycStatus);
        
        if (result.IsSuccess)
        {
            return NoContent();
        }
        
        return BadRequest(new { Error = result.ErrorMessage });
    }
}

public class UpdateKycStatusRequest
{
    public string KycStatus { get; set; } = string.Empty;
}