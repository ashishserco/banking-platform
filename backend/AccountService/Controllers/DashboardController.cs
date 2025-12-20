using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AccountService.Services;
using System.Security.Claims;

namespace AccountService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IAccountService _accountService;

    public DashboardController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "demo_user";
        
        // Mocking aggregated stats aligned with frontend DashboardStats interface
        var stats = new
        {
            TotalBalance = 125750.50,
            TotalAccounts = 3,
            MonthlyTransactions = 45,
            PendingPayments = 2,
            RecentTransactions = new[]
            {
                new { Id = Guid.NewGuid(), AccountNumber = "1234567890", Amount = 500.0, Type = "Debit", Description = "Rent Payment", Timestamp = DateTime.UtcNow.AddHours(-2), Status = "Completed" },
                new { Id = Guid.NewGuid(), AccountNumber = "1234567890", Amount = 1500.0, Type = "Credit", Description = "Salary Deposit", Timestamp = DateTime.UtcNow.AddDays(-1), Status = "Completed" }
            },
            AccountSummary = new[]
            {
                new { AccountNumber = "1234567890", AccountType = "Savings", Balance = 120000.00, Currency = "INR", Status = "Active" },
                new { AccountNumber = "0987654321", AccountType = "Current", Balance = 5750.50, Currency = "INR", Status = "Active" }
            },
            BalanceTrend = new[]
            {
                new { Date = "2023-01-01", Balance = 95000 },
                new { Date = "2023-02-01", Balance = 102000 },
                new { Date = "2023-03-01", Balance = 98000 },
                new { Date = "2023-04-01", Balance = 110000 },
                new { Date = "2023-05-01", Balance = 115000 },
                new { Date = "2023-06-01", Balance = 125750 }
            }
        };

        return Ok(new { Data = stats });
    }
}
