// Simplified Banking API for Free Hosting Demo
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? builder.Configuration.GetConnectionString("DefaultConnection");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "demo-secret-key-for-development-only";
var corsOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',') ?? new[] { "http://localhost:3000" };

// Add services
builder.Services.AddDbContext<BankingDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Banking Platform API", 
        Version = "v1",
        Description = "Enterprise Banking Platform Demo API"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Banking Platform API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BankingDbContext>();
    context.Database.EnsureCreated();
    
    // Seed demo data
    if (!context.Customers.Any())
    {
        var customer = new Customer
        {
            CustomerId = Guid.NewGuid().ToString(),
            Email = "demo@bankingplatform.com",
            FirstName = "Demo",
            LastName = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!")
        };
        context.Customers.Add(customer);
        
        context.Accounts.AddRange(
            new Account
            {
                AccountId = Guid.NewGuid().ToString(),
                CustomerId = customer.CustomerId,
                AccountNumber = "CHK-001",
                AccountType = "CHECKING",
                Balance = 5000.00m,
                Currency = "USD"
            },
            new Account
            {
                AccountId = Guid.NewGuid().ToString(),
                CustomerId = customer.CustomerId,
                AccountNumber = "SAV-001",
                AccountType = "SAVINGS",
                Balance = 15000.00m,
                Currency = "USD"
            }
        );
        
        context.SaveChanges();
    }
}

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Auth endpoints
app.MapPost("/api/auth/login", async (LoginRequest request, BankingDbContext context) =>
{
    var customer = await context.Customers.FirstOrDefaultAsync(c => c.Email == request.Email);
    
    if (customer == null || !BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash))
    {
        return Results.Unauthorized();
    }
    
    var token = GenerateJwtToken(customer.CustomerId, jwtSecret);
    return Results.Ok(new { token, customerId = customer.CustomerId, email = customer.Email });
});

// Account endpoints
app.MapGet("/api/accounts", async (BankingDbContext context, HttpContext httpContext) =>
{
    var customerId = GetCustomerIdFromToken(httpContext);
    if (customerId == null) return Results.Unauthorized();
    
    var accounts = await context.Accounts
        .Where(a => a.CustomerId == customerId)
        .ToListAsync();
    
    return Results.Ok(accounts);
}).RequireAuthorization();

app.MapGet("/api/accounts/{accountId}/balance", async (string accountId, BankingDbContext context, HttpContext httpContext) =>
{
    var customerId = GetCustomerIdFromToken(httpContext);
    if (customerId == null) return Results.Unauthorized();
    
    var account = await context.Accounts
        .FirstOrDefaultAsync(a => a.AccountId == accountId && a.CustomerId == customerId);
    
    if (account == null) return Results.NotFound();
    
    return Results.Ok(new { balance = account.Balance, currency = account.Currency });
}).RequireAuthorization();

// Transaction endpoints
app.MapPost("/api/transactions/transfer", async (TransferRequest request, BankingDbContext context, HttpContext httpContext) =>
{
    var customerId = GetCustomerIdFromToken(httpContext);
    if (customerId == null) return Results.Unauthorized();
    
    using var transaction = await context.Database.BeginTransactionAsync();
    try
    {
        var fromAccount = await context.Accounts
            .FirstOrDefaultAsync(a => a.AccountId == request.FromAccountId && a.CustomerId == customerId);
        var toAccount = await context.Accounts
            .FirstOrDefaultAsync(a => a.AccountId == request.ToAccountId);
        
        if (fromAccount == null || toAccount == null)
            return Results.BadRequest("Invalid account");
        
        if (fromAccount.Balance < request.Amount)
            return Results.BadRequest("Insufficient funds");
        
        // Update balances
        fromAccount.Balance -= request.Amount;
        toAccount.Balance += request.Amount;
        
        // Create transaction record
        var txn = new Transaction
        {
            TransactionId = Guid.NewGuid().ToString(),
            FromAccountId = request.FromAccountId,
            ToAccountId = request.ToAccountId,
            Amount = request.Amount,
            Currency = "USD",
            Status = "COMPLETED",
            Description = request.Description
        };
        
        context.Transactions.Add(txn);
        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        
        return Results.Ok(new { transactionId = txn.TransactionId, status = "COMPLETED" });
    }
    catch
    {
        await transaction.RollbackAsync();
        return Results.Problem("Transfer failed");
    }
}).RequireAuthorization();

app.MapGet("/api/transactions", async (BankingDbContext context, HttpContext httpContext) =>
{
    var customerId = GetCustomerIdFromToken(httpContext);
    if (customerId == null) return Results.Unauthorized();
    
    var accountIds = await context.Accounts
        .Where(a => a.CustomerId == customerId)
        .Select(a => a.AccountId)
        .ToListAsync();
    
    var transactions = await context.Transactions
        .Where(t => accountIds.Contains(t.FromAccountId) || accountIds.Contains(t.ToAccountId))
        .OrderByDescending(t => t.CreatedAt)
        .Take(50)
        .ToListAsync();
    
    return Results.Ok(transactions);
}).RequireAuthorization();

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

// Helper methods
static string GenerateJwtToken(string customerId, string jwtSecret)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.ASCII.GetBytes(jwtSecret);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[] { new Claim("customerId", customerId) }),
        Expires = DateTime.UtcNow.AddDays(7),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}

static string? GetCustomerIdFromToken(HttpContext context)
{
    return context.User.FindFirst("customerId")?.Value;
}

// Data Models
public class BankingDbContext : DbContext
{
    public BankingDbContext(DbContextOptions<BankingDbContext> options) : base(options) { }
    
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
}

public class Customer
{
    [Key] public string CustomerId { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Account
{
    [Key] public string AccountId { get; set; }
    public string CustomerId { get; set; }
    public string AccountNumber { get; set; }
    public string AccountType { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Transaction
{
    [Key] public string TransactionId { get; set; }
    public string FromAccountId { get; set; }
    public string ToAccountId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; }
    public string Status { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Request Models
public record LoginRequest(string Email, string Password);
public record TransferRequest(string FromAccountId, string ToAccountId, decimal Amount, string Description);