using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Azure.Messaging.ServiceBus;
using Serilog;
using System.Text;
using TransactionService.Data;
using TransactionService.Services;
using FluentValidation.AspNetCore;
using Polly;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddControllers()
    .AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<Program>());

// Database
builder.Services.AddDbContext<TransactionDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Business Services
builder.Services.AddScoped<ITransactionService, TransactionServiceImpl>();

// HTTP Clients with Polly for resilience
builder.Services.AddHttpClient<IAccountServiceClient, AccountServiceClient>(client =>
{
    var accountServiceUrl = builder.Configuration["Services:AccountService:BaseUrl"] ?? "http://localhost:8001";
    client.BaseAddress = new Uri(accountServiceUrl);
    client.DefaultRequestHeaders.Add("User-Agent", "TransactionService/1.0");
    client.Timeout = TimeSpan.FromSeconds(30);
})
.AddPolicyHandler(GetRetryPolicy())
.AddPolicyHandler(GetCircuitBreakerPolicy());

// Azure Service Bus
builder.Services.AddSingleton(provider =>
{
    var connectionString = builder.Configuration.GetConnectionString("ServiceBus");
    var client = new ServiceBusClient(connectionString);
    return client.CreateSender("transaction-events");
});

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")))
        };
    });

// Authorization
builder.Services.AddAuthorization();

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Transaction Service API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContext<TransactionDbContext>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("BankingPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://banking-ui.azurewebsites.net")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TransactionDbContext>();
    context.Database.Migrate();
}

app.UseHttpsRedirection();
app.UseCors("BankingPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseRouting();
app.MapControllers();
app.MapHealthChecks("/health");

// Global exception handler
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError("Unhandled exception occurred");
        
        await context.Response.WriteAsync(
            System.Text.Json.JsonSerializer.Serialize(new { Error = "An unexpected error occurred" }));
    });
});

Log.Information("Transaction Service starting up...");
app.Run();

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return Policy
        .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
        .Or<HttpRequestException>()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}

static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return Policy
        .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
        .Or<HttpRequestException>()
        .CircuitBreakerAsync(
            exceptionsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromSeconds(30));
}

public partial class Program { } // For testing