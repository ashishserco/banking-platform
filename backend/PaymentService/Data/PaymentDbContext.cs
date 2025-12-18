using Microsoft.EntityFrameworkCore;
using PaymentService.Models;

namespace PaymentService.Data;

public class PaymentDbContext : DbContext
{
    public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options)
    {
    }
    
    public DbSet<Payment> Payments { get; set; }
    public DbSet<PaymentBeneficiary> PaymentBeneficiaries { get; set; }
    public DbSet<PaymentEvent> PaymentEvents { get; set; }
    public DbSet<ExternalCallIdempotency> ExternalCallIdempotencies { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Payment configuration
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId);
            entity.HasIndex(e => e.IdempotencyKey).IsUnique();
            entity.HasIndex(e => e.SourceAccountNumber);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.PaymentType);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.CorrelationId);
            entity.HasIndex(e => e.ExternalTransactionId);
            
            entity.Property(e => e.Amount)
                .HasPrecision(18, 2);
                
            entity.HasOne(e => e.Beneficiary)
                .WithMany(b => b.Payments)
                .HasForeignKey(e => e.BeneficiaryId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        // PaymentBeneficiary configuration
        modelBuilder.Entity<PaymentBeneficiary>(entity =>
        {
            entity.HasKey(e => e.BeneficiaryId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.BeneficiaryType);
            entity.HasIndex(e => e.AccountNumber);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.IsActive);
        });
        
        // PaymentEvent configuration
        modelBuilder.Entity<PaymentEvent>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.HasIndex(e => e.PaymentId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.OccurredAt);
            
            entity.HasOne(e => e.Payment)
                .WithMany()
                .HasForeignKey(e => e.PaymentId);
        });
        
        // ExternalCallIdempotency configuration
        modelBuilder.Entity<ExternalCallIdempotency>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.IdempotencyKey).IsUnique();
            entity.HasIndex(e => e.Gateway);
            entity.HasIndex(e => e.CallType);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
        });
        
        // Seed data
        SeedData(modelBuilder);
    }
    
    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed sample beneficiaries
        var utilityBeneficiaryId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var merchantBeneficiaryId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        
        modelBuilder.Entity<PaymentBeneficiary>().HasData(
            new PaymentBeneficiary
            {
                BeneficiaryId = utilityBeneficiaryId,
                Name = "Electric Utility Company",
                BeneficiaryType = "UTILITY",
                AccountNumber = "UTIL001234567",
                Email = "payments@electricutility.com",
                Address = "123 Utility Street, City, State",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new PaymentBeneficiary
            {
                BeneficiaryId = merchantBeneficiaryId,
                Name = "Online Shopping Mall",
                BeneficiaryType = "MERCHANT",
                AccountNumber = "MERCH987654321",
                Email = "payments@shoppingmall.com",
                Address = "456 Commerce Ave, City, State",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );
    }
}