using Microsoft.EntityFrameworkCore;
using Banking.Shared.Models;
using AccountService.Data;
using AccountService.DTOs;
using AccountService.Models;

namespace AccountService.Services;

public class CustomerServiceImpl : ICustomerService
{
    private readonly AccountDbContext _context;
    private readonly ILogger<CustomerServiceImpl> _logger;

    public CustomerServiceImpl(AccountDbContext context, ILogger<CustomerServiceImpl> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CustomerDto>> CreateCustomerAsync(CreateCustomerRequest request)
    {
        try
        {
            // Check if customer with email already exists
            var existingCustomer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == request.Email);

            if (existingCustomer != null)
            {
                return Result<CustomerDto>.Failure("Customer with this email already exists");
            }

            // Validate age (must be 18 or older)
            var age = DateTime.UtcNow.Year - request.DateOfBirth.Year;
            if (request.DateOfBirth.Date > DateTime.UtcNow.AddYears(-age)) age--;
            
            if (age < 18)
            {
                return Result<CustomerDto>.Failure("Customer must be at least 18 years old");
            }

            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                KycStatus = "PENDING"
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Customer created successfully: {CustomerId} - {Email}", 
                customer.CustomerId, customer.Email);

            var customerDto = MapToCustomerDto(customer);
            return Result<CustomerDto>.Success(customerDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating customer with email {Email}", request.Email);
            return Result<CustomerDto>.Failure("Failed to create customer");
        }
    }

    public async Task<Result<CustomerDto>> GetCustomerAsync(Guid customerId)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(customerId);

            if (customer == null)
            {
                return Result<CustomerDto>.Failure("Customer not found");
            }

            var customerDto = MapToCustomerDto(customer);
            return Result<CustomerDto>.Success(customerDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer {CustomerId}", customerId);
            return Result<CustomerDto>.Failure("Failed to retrieve customer");
        }
    }

    public async Task<Result<CustomerDto>> GetCustomerByEmailAsync(string email)
    {
        try
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email == email);

            if (customer == null)
            {
                return Result<CustomerDto>.Failure("Customer not found");
            }

            var customerDto = MapToCustomerDto(customer);
            return Result<CustomerDto>.Success(customerDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving customer by email {Email}", email);
            return Result<CustomerDto>.Failure("Failed to retrieve customer");
        }
    }

    public async Task<Result> UpdateKycStatusAsync(Guid customerId, string kycStatus)
    {
        try
        {
            var customer = await _context.Customers.FindAsync(customerId);

            if (customer == null)
            {
                return Result.Failure("Customer not found");
            }

            var validStatuses = new[] { "PENDING", "VERIFIED", "REJECTED" };
            if (!validStatuses.Contains(kycStatus))
            {
                return Result.Failure("Invalid KYC status");
            }

            customer.KycStatus = kycStatus;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Customer KYC status updated: {CustomerId} -> {KycStatus}", 
                customerId, kycStatus);
                
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating KYC status for customer {CustomerId}", customerId);
            return Result.Failure("Failed to update KYC status");
        }
    }

    private static CustomerDto MapToCustomerDto(Customer customer)
    {
        return new CustomerDto
        {
            CustomerId = customer.CustomerId,
            FirstName = customer.FirstName,
            LastName = customer.LastName,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber,
            DateOfBirth = customer.DateOfBirth,
            KycStatus = customer.KycStatus,
            CreatedAt = customer.CreatedAt
        };
    }
}