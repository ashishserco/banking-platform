using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Azure.Messaging.ServiceBus;
using Serilog;
using System.Text;
using PaymentService.Data;
using PaymentService.Services;
using FluentValidation.AspNetCore;

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
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Redis Cache for idempotency
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Business Services
builder.Services.AddScoped<IPaymentService, PaymentServiceImpl>();
builder.Services.AddScoped<IBeneficiaryService, BeneficiaryServiceImpl>();
builder.Services.AddScoped<IExternalPaymentGateway, MockExternalPaymentGateway>();

// Azure Service Bus
builder.Services.AddSingleton(provider =>
{
    var connectionString = builder.Configuration.GetConnectionString("ServiceBus");
    var client = new ServiceBusClient(connectionString);
    return client.CreateSender("payment-events");
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
    c.SwaggerDoc("v1", new() { Title = "Payment Service API", Version = "v1" });
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
    .AddDbContext<PaymentDbContext>();

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
    var context = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
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

Log.Information("Payment Service starting up...");
app.Run();

public partial class Program { } // For testing