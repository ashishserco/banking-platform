using Microsoft.EntityFrameworkCore;
using Banking.Shared.Models;
using PaymentService.Data;
using PaymentService.DTOs;
using PaymentService.Models;

namespace PaymentService.Services;

public class BeneficiaryServiceImpl : IBeneficiaryService
{
    private readonly PaymentDbContext _context;
    private readonly ILogger<BeneficiaryServiceImpl> _logger;

    public BeneficiaryServiceImpl(PaymentDbContext context, ILogger<BeneficiaryServiceImpl> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<PaymentBeneficiaryDto>> CreateBeneficiaryAsync(CreateBeneficiaryRequest request)
    {
        try
        {
            // Check for duplicate beneficiary by name and account number
            var existingBeneficiary = await _context.PaymentBeneficiaries
                .FirstOrDefaultAsync(b => b.Name == request.Name && 
                                         b.AccountNumber == request.AccountNumber &&
                                         b.IsActive);

            if (existingBeneficiary != null)
            {
                return Result<PaymentBeneficiaryDto>.Failure("Beneficiary with same name and account already exists");
            }

            var beneficiary = new PaymentBeneficiary
            {
                Name = request.Name,
                BeneficiaryType = request.BeneficiaryType,
                AccountNumber = request.AccountNumber,
                BankCode = request.BankCode,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                IsActive = true
            };

            _context.PaymentBeneficiaries.Add(beneficiary);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Beneficiary created: {BeneficiaryId} - {Name}", 
                beneficiary.BeneficiaryId, beneficiary.Name);

            var beneficiaryDto = MapToBeneficiaryDto(beneficiary);
            return Result<PaymentBeneficiaryDto>.Success(beneficiaryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating beneficiary: {Name}", request.Name);
            return Result<PaymentBeneficiaryDto>.Failure("Failed to create beneficiary");
        }
    }

    public async Task<Result<PaymentBeneficiaryDto>> GetBeneficiaryAsync(Guid beneficiaryId)
    {
        try
        {
            var beneficiary = await _context.PaymentBeneficiaries
                .FirstOrDefaultAsync(b => b.BeneficiaryId == beneficiaryId);

            if (beneficiary == null)
            {
                return Result<PaymentBeneficiaryDto>.Failure("Beneficiary not found");
            }

            var beneficiaryDto = MapToBeneficiaryDto(beneficiary);
            return Result<PaymentBeneficiaryDto>.Success(beneficiaryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving beneficiary {BeneficiaryId}", beneficiaryId);
            return Result<PaymentBeneficiaryDto>.Failure("Failed to retrieve beneficiary");
        }
    }

    public async Task<Result<List<PaymentBeneficiaryDto>>> GetBeneficiariesAsync(string? beneficiaryType = null)
    {
        try
        {
            var query = _context.PaymentBeneficiaries.Where(b => b.IsActive);

            if (!string.IsNullOrEmpty(beneficiaryType))
            {
                query = query.Where(b => b.BeneficiaryType == beneficiaryType);
            }

            var beneficiaries = await query
                .OrderBy(b => b.Name)
                .ToListAsync();

            var beneficiaryDtos = beneficiaries.Select(MapToBeneficiaryDto).ToList();
            return Result<List<PaymentBeneficiaryDto>>.Success(beneficiaryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving beneficiaries");
            return Result<List<PaymentBeneficiaryDto>>.Failure("Failed to retrieve beneficiaries");
        }
    }

    public async Task<Result> UpdateBeneficiaryStatusAsync(Guid beneficiaryId, bool isActive)
    {
        try
        {
            var beneficiary = await _context.PaymentBeneficiaries
                .FirstOrDefaultAsync(b => b.BeneficiaryId == beneficiaryId);

            if (beneficiary == null)
            {
                return Result.Failure("Beneficiary not found");
            }

            beneficiary.IsActive = isActive;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Beneficiary status updated: {BeneficiaryId} -> {Status}", 
                beneficiaryId, isActive ? "Active" : "Inactive");

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating beneficiary status {BeneficiaryId}", beneficiaryId);
            return Result.Failure("Failed to update beneficiary status");
        }
    }

    public async Task<Result> DeleteBeneficiaryAsync(Guid beneficiaryId)
    {
        try
        {
            var beneficiary = await _context.PaymentBeneficiaries
                .Include(b => b.Payments)
                .FirstOrDefaultAsync(b => b.BeneficiaryId == beneficiaryId);

            if (beneficiary == null)
            {
                return Result.Failure("Beneficiary not found");
            }

            // Check if beneficiary has any payments
            if (beneficiary.Payments.Any())
            {
                // Soft delete - just mark as inactive
                beneficiary.IsActive = false;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Beneficiary soft deleted: {BeneficiaryId}", beneficiaryId);
            }
            else
            {
                // Hard delete if no payments
                _context.PaymentBeneficiaries.Remove(beneficiary);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Beneficiary hard deleted: {BeneficiaryId}", beneficiaryId);
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting beneficiary {BeneficiaryId}", beneficiaryId);
            return Result.Failure("Failed to delete beneficiary");
        }
    }

    private static PaymentBeneficiaryDto MapToBeneficiaryDto(PaymentBeneficiary beneficiary)
    {
        return new PaymentBeneficiaryDto
        {
            BeneficiaryId = beneficiary.BeneficiaryId,
            Name = beneficiary.Name,
            BeneficiaryType = beneficiary.BeneficiaryType,
            AccountNumber = beneficiary.AccountNumber,
            BankCode = beneficiary.BankCode,
            Email = beneficiary.Email,
            PhoneNumber = beneficiary.PhoneNumber,
            Address = beneficiary.Address,
            CreatedAt = beneficiary.CreatedAt,
            IsActive = beneficiary.IsActive
        };
    }
}