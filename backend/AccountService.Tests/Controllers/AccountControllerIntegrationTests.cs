using System.Net.Http.Json;
using AccountService.Data;
using AccountService.DTOs;
using AccountService.Models;
using Azure.Messaging.ServiceBus;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace AccountService.Tests.Controllers;

public class AccountControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly Mock<ServiceBusSender> _mockEventPublisher;

    public AccountControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _mockEventPublisher = new Mock<ServiceBusSender>();
        
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    {"Jwt:Key", "this_is_a_very_secret_key_for_testing_purposes_only_which_is_long_enough"},
                    {"Jwt:Issuer", "banking-platform"},
                    {"Jwt:Audience", "banking-clients"},
                    {"ConnectionStrings:ServiceBus", "Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=test"}
                });
            });

            builder.ConfigureServices(services =>
            {
                // Remove existing DB context
                var dbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AccountDbContext>));
                if (dbDescriptor != null) services.Remove(dbDescriptor);

                // Add In-Memory DB
                services.AddDbContext<AccountDbContext>(options =>
                {
                    options.UseInMemoryDatabase("IntegrationTestsDb" + Guid.NewGuid().ToString());
                });

                // Mock Service Bus Sender
                var sbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ServiceBusSender));
                if (sbDescriptor != null) services.Remove(sbDescriptor);
                services.AddSingleton(_mockEventPublisher.Object);
            });
        });
    }

    [Fact]
    public async Task CreateAccount_ReturnsOk_WhenRequestIsValid()
    {
        // Arrange
        var client = _factory.CreateClient();
        
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AccountDbContext>();
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();
            
            var customerId = Guid.NewGuid();
            db.Customers.Add(new Customer { CustomerId = customerId, FirstName = "Alice", LastName = "Smith", Email = "alice@test.com", KycStatus = "VERIFIED" });
            await db.SaveChangesAsync();

            var request = new CreateAccountRequest
            {
                CustomerId = customerId,
                AccountType = "CHECKING",
                InitialDeposit = 500,
                Currency = "USD"
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/accounts", request);

            // Assert
            response.EnsureSuccessStatusCode();
            var account = await response.Content.ReadFromJsonAsync<AccountDto>();
            account.Should().NotBeNull();
            account!.Balance.Should().Be(500);
        }
    }

    [Fact]
    public async Task GetBalance_ReturnsBalance_WhenAccountExists()
    {
        // Arrange
        var client = _factory.CreateClient();
        string accountNumber = "ACC-INT-100";

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AccountDbContext>();
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();

            db.Accounts.Add(new Account
            {
                AccountNumber = accountNumber,
                CustomerId = Guid.NewGuid(),
                AccountType = "SAVINGS",
                Balance = 1200,
                Status = "ACTIVE",
                Currency = "USD"
            });
            await db.SaveChangesAsync();
        }

        // Act
        var response = await client.GetAsync($"/api/accounts/{accountNumber}/balance");

        // Assert
        response.EnsureSuccessStatusCode();
        var balance = await response.Content.ReadFromJsonAsync<BalanceDto>();
        balance.Should().NotBeNull();
        balance!.AvailableBalance.Should().Be(1200);
    }
}
