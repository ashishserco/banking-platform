using Microsoft.EntityFrameworkCore;
using NotificationService.Models;

namespace NotificationService.Data;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
    {
    }
    
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<NotificationTemplate> NotificationTemplates { get; set; }
    public DbSet<NotificationEvent> NotificationEvents { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.NotificationType);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.Recipient);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.NextRetryAt);
            entity.HasIndex(e => e.CorrelationId);
            entity.HasIndex(e => e.Priority);
        });
        
        // NotificationTemplate configuration
        modelBuilder.Entity<NotificationTemplate>(entity =>
        {
            entity.HasKey(e => e.TemplateId);
            entity.HasIndex(e => new { e.TemplateCode, e.NotificationType, e.Language }).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });
        
        // NotificationEvent configuration
        modelBuilder.Entity<NotificationEvent>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.HasIndex(e => e.NotificationId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.OccurredAt);
            
            entity.HasOne(e => e.Notification)
                .WithMany()
                .HasForeignKey(e => e.NotificationId);
        });
        
        // Seed templates
        SeedTemplates(modelBuilder);
    }
    
    private static void SeedTemplates(ModelBuilder modelBuilder)
    {
        var templates = new[]
        {
            // Account templates
            new NotificationTemplate
            {
                TemplateId = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                TemplateCode = "ACCOUNT_WELCOME",
                NotificationType = "EMAIL",
                Subject = "Welcome to Banking Platform",
                ContentTemplate = @"
                    <h1>Welcome {{CustomerName}}!</h1>
                    <p>Your account {{AccountNumber}} has been successfully created.</p>
                    <p>Thank you for choosing our banking platform.</p>
                ",
                Language = "EN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Description = "Welcome email for new account creation"
            },
            new NotificationTemplate
            {
                TemplateId = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                TemplateCode = "ACCOUNT_WELCOME",
                NotificationType = "SMS",
                Subject = "Account Created",
                ContentTemplate = "Welcome {{CustomerName}}! Your account {{AccountNumber}} is now active. Thank you for banking with us.",
                Language = "EN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Description = "Welcome SMS for new account creation"
            },
            
            // Transaction templates
            new NotificationTemplate
            {
                TemplateId = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                TemplateCode = "TRANSACTION_ALERT",
                NotificationType = "EMAIL",
                Subject = "Transaction Alert - {{TransactionType}}",
                ContentTemplate = @"
                    <h2>Transaction Notification</h2>
                    <p>A {{TransactionType}} transaction has been processed on your account {{AccountNumber}}.</p>
                    <ul>
                        <li><strong>Amount:</strong> {{Amount}} {{Currency}}</li>
                        <li><strong>Date:</strong> {{TransactionDate}}</li>
                        <li><strong>Reference:</strong> {{ReferenceNumber}}</li>
                    </ul>
                    <p>If you did not authorize this transaction, please contact us immediately.</p>
                ",
                Language = "EN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Description = "Transaction alert email"
            },
            new NotificationTemplate
            {
                TemplateId = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                TemplateCode = "TRANSACTION_ALERT",
                NotificationType = "SMS",
                Subject = "Transaction Alert",
                ContentTemplate = "{{TransactionType}} of {{Amount}} {{Currency}} processed on account {{AccountNumber}}. Ref: {{ReferenceNumber}}",
                Language = "EN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Description = "Transaction alert SMS"
            },
            
            // Payment templates
            new NotificationTemplate
            {
                TemplateId = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                TemplateCode = "PAYMENT_CONFIRMATION",
                NotificationType = "EMAIL",
                Subject = "Payment Confirmation - {{PaymentType}}",
                ContentTemplate = @"
                    <h2>Payment Confirmation</h2>
                    <p>Your {{PaymentType}} payment has been successfully processed.</p>
                    <ul>
                        <li><strong>Amount:</strong> {{Amount}} {{Currency}}</li>
                        <li><strong>Beneficiary:</strong> {{BeneficiaryName}}</li>
                        <li><strong>Date:</strong> {{PaymentDate}}</li>
                        <li><strong>Reference:</strong> {{ReferenceNumber}}</li>
                    </ul>
                    <p>Thank you for using our payment services.</p>
                ",
                Language = "EN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Description = "Payment confirmation email"
            },
            new NotificationTemplate
            {
                TemplateId = Guid.Parse("10000000-0000-0000-0000-000000000006"),
                TemplateCode = "PAYMENT_CONFIRMATION",
                NotificationType = "SMS",
                Subject = "Payment Confirmed",
                ContentTemplate = "{{PaymentType}} payment of {{Amount}} {{Currency}} to {{BeneficiaryName}} completed. Ref: {{ReferenceNumber}}",
                Language = "EN",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Description = "Payment confirmation SMS"
            }
        };
        
        modelBuilder.Entity<NotificationTemplate>().HasData(templates);
    }
}