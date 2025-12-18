using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PaymentService.Services;
using PaymentService.DTOs;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BeneficiaryController : ControllerBase
{
    private readonly IBeneficiaryService _beneficiaryService;
    private readonly ILogger<BeneficiaryController> _logger;

    public BeneficiaryController(IBeneficiaryService beneficiaryService, ILogger<BeneficiaryController> logger)
    {
        _beneficiaryService = beneficiaryService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new payment beneficiary
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateBeneficiary([FromBody] CreateBeneficiaryRequest request)
    {
        _logger.LogInformation("Creating beneficiary: {Name} - {Type}", request.Name, request.BeneficiaryType);

        var result = await _beneficiaryService.CreateBeneficiaryAsync(request);

        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetBeneficiary), new { beneficiaryId = result.Data!.BeneficiaryId }, result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage, Errors = result.Errors });
    }

    /// <summary>
    /// Get beneficiary by ID
    /// </summary>
    [HttpGet("{beneficiaryId}")]
    public async Task<IActionResult> GetBeneficiary([FromRoute] Guid beneficiaryId)
    {
        var result = await _beneficiaryService.GetBeneficiaryAsync(beneficiaryId);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return NotFound(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Get all beneficiaries, optionally filtered by type
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetBeneficiaries([FromQuery] string? beneficiaryType = null)
    {
        var result = await _beneficiaryService.GetBeneficiariesAsync(beneficiaryType);

        if (result.IsSuccess)
        {
            return Ok(result.Data);
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Update beneficiary status (active/inactive)
    /// </summary>
    [HttpPatch("{beneficiaryId}/status")]
    public async Task<IActionResult> UpdateBeneficiaryStatus(
        [FromRoute] Guid beneficiaryId,
        [FromBody] UpdateBeneficiaryStatusRequest request)
    {
        var result = await _beneficiaryService.UpdateBeneficiaryStatusAsync(beneficiaryId, request.IsActive);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }

    /// <summary>
    /// Delete a beneficiary
    /// </summary>
    [HttpDelete("{beneficiaryId}")]
    public async Task<IActionResult> DeleteBeneficiary([FromRoute] Guid beneficiaryId)
    {
        var result = await _beneficiaryService.DeleteBeneficiaryAsync(beneficiaryId);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return BadRequest(new { Error = result.ErrorMessage });
    }
}

public class UpdateBeneficiaryStatusRequest
{
    public bool IsActive { get; set; }
}