using Microsoft.EntityFrameworkCore;
using AccountService.Models;

namespace AccountService.Data;

public class AccountDbContext : DbContext
{
    public AccountDbContext(DbContextOptions<AccountDbContext> options) : base(options)
    {
    }
    
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<AccountTransaction> AccountTransactions { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Account configuration
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.AccountId);
            entity.HasIndex(e => e.AccountNumber).IsUnique();
            entity.HasIndex(e => e.CustomerId);
            
            entity.Property(e => e.Balance)
                .HasPrecision(18, 2);
                
            entity.HasOne(e => e.Customer)
                .WithMany(c => c.Accounts)
                .HasForeignKey(e => e.CustomerId);
        });
        
        // Customer configuration
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId);
            entity.HasIndex(e => e.Email).IsUnique();
        });
        
        // AccountTransaction configuration
        modelBuilder.Entity<AccountTransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
            entity.HasIndex(e => e.AccountId);
            entity.HasIndex(e => e.CreatedAt);
            
            entity.Property(e => e.Amount)
                .HasPrecision(18, 2);
            entity.Property(e => e.BalanceAfter)
                .HasPrecision(18, 2);
                
            entity.HasOne(e => e.Account)
                .WithMany(a => a.AccountTransactions)
                .HasForeignKey(e => e.AccountId);
        });
        
        // Seed data
        SeedData(modelBuilder);
    }
    
    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed sample customer
        var customerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        modelBuilder.Entity<Customer>().HasData(
            new Customer
            {
                CustomerId = customerId,
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@email.com",
                PhoneNumber = "+1234567890",
                DateOfBirth = new DateTime(1990, 1, 1),
                KycStatus = "VERIFIED",
                CreatedAt = DateTime.UtcNow
            }
        );
        
        // Seed sample account
        modelBuilder.Entity<Account>().HasData(
            new Account
            {
                AccountId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                AccountNumber = "ACC001234567890",
                CustomerId = customerId,
                AccountType = "SAVINGS",
                Balance = 1000.00m,
                Currency = "USD",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }
}