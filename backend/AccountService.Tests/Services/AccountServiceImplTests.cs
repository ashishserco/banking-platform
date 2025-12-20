using AccountService.Data;
using AccountService.DTOs;
using AccountService.Models;
using AccountService.Services;
using Azure.Messaging.ServiceBus;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace AccountService.Tests.Services;

public class AccountServiceImplTests
{
    private readonly DbContextOptions<AccountDbContext> _dbOptions;
    private readonly Mock<ServiceBusSender> _mockEventPublisher;
    private readonly Mock<ILogger<AccountServiceImpl>> _mockLogger;

    public AccountServiceImplTests()
    {
        _dbOptions = new DbContextOptionsBuilder<AccountDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mockEventPublisher = new Mock<ServiceBusSender>();
        _mockLogger = new Mock<ILogger<AccountServiceImpl>>();
    }

    [Fact]
    public async Task CreateAccountAsync_ShouldReturnSuccess_WhenCustomerIsVerified()
    {
        // Arrange
        using var context = new AccountDbContext(_dbOptions);
        var customerId = Guid.NewGuid();
        var customer = new Customer
        {
            CustomerId = customerId,
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            KycStatus = "VERIFIED"
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var service = new AccountServiceImpl(context, _mockEventPublisher.Object, _mockLogger.Object);
        var request = new CreateAccountRequest
        {
            CustomerId = customerId,
            AccountType = "SAVINGS",
            InitialDeposit = 1000,
            Currency = "USD"
        };

        // Act
        var result = await service.CreateAccountAsync(request);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Balance.Should().Be(1000);
        result.Data.AccountType.Should().Be("SAVINGS");
        
        var account = await context.Accounts.FirstOrDefaultAsync(a => a.CustomerId == customerId);
        account.Should().NotBeNull();
        account!.Balance.Should().Be(1000);
    }

    [Fact]
    public async Task CreateAccountAsync_ShouldReturnFailure_WhenCustomerNotFound()
    {
        // Arrange
        using var context = new AccountDbContext(_dbOptions);
        var service = new AccountServiceImpl(context, _mockEventPublisher.Object, _mockLogger.Object);
        var request = new CreateAccountRequest
        {
            CustomerId = Guid.NewGuid(),
            AccountType = "SAVINGS",
            InitialDeposit = 1000,
            Currency = "USD"
        };

        // Act
        var result = await service.CreateAccountAsync(request);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Customer not found");
    }

    [Fact]
    public async Task CreateAccountAsync_ShouldReturnFailure_WhenCustomerNotVerified()
    {
        // Arrange
        using var context = new AccountDbContext(_dbOptions);
        var customerId = Guid.NewGuid();
        var customer = new Customer
        {
            CustomerId = customerId,
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            KycStatus = "PENDING"
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var service = new AccountServiceImpl(context, _mockEventPublisher.Object, _mockLogger.Object);
        var request = new CreateAccountRequest
        {
            CustomerId = customerId,
            AccountType = "SAVINGS",
            InitialDeposit = 1000,
            Currency = "USD"
        };

        // Act
        var result = await service.CreateAccountAsync(request);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Customer KYC must be verified before account creation");
    }

    [Fact]
    public async Task GetAccountByNumberAsync_ShouldReturnAccount_WhenExists()
    {
        // Arrange
        using var context = new AccountDbContext(_dbOptions);
        var customerId = Guid.NewGuid();
        var customer = new Customer { CustomerId = customerId, FirstName = "Test", LastName = "User", KycStatus = "VERIFIED" };
        var account = new Account
        {
            AccountNumber = "ACC123456789",
            CustomerId = customerId,
            AccountType = "CHECKING",
            Balance = 500,
            Status = "ACTIVE",
            Customer = customer
        };
        context.Customers.Add(customer);
        context.Accounts.Add(account);
        await context.SaveChangesAsync();

        var service = new AccountServiceImpl(context, _mockEventPublisher.Object, _mockLogger.Object);

        // Act
        var result = await service.GetAccountByNumberAsync("ACC123456789");

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccountNumber.Should().Be("ACC123456789");
        result.Data.Balance.Should().Be(500);
    }

    [Fact]
    public async Task UpdateAccountStatus_ShouldUpdateSuccessfully()
    {
        // Arrange
        using var context = new AccountDbContext(_dbOptions);
        var account = new Account
        {
            AccountNumber = "ACC999",
            CustomerId = Guid.NewGuid(),
            Balance = 100,
            Status = "ACTIVE"
        };
        context.Accounts.Add(account);
        await context.SaveChangesAsync();

        var service = new AccountServiceImpl(context, _mockEventPublisher.Object, _mockLogger.Object);

        // Act
        var result = await service.UpdateAccountStatusAsync("ACC999", "FROZEN");

        // Assert
        result.IsSuccess.Should().BeTrue();
        var updatedAccount = await context.Accounts.FirstAsync(a => a.AccountNumber == "ACC999");
        updatedAccount.Status.Should().Be("FROZEN");
    }
}
