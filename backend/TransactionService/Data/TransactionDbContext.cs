using Microsoft.EntityFrameworkCore;
using TransactionService.Models;

namespace TransactionService.Data;

public class TransactionDbContext : DbContext
{
    public TransactionDbContext(DbContextOptions<TransactionDbContext> options) : base(options)
    {
    }
    
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<TransactionEntry> TransactionEntries { get; set; }
    public DbSet<TransactionEvent> TransactionEvents { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Transaction configuration
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId);
            entity.HasIndex(e => e.IdempotencyKey).IsUnique();
            entity.HasIndex(e => e.FromAccountNumber);
            entity.HasIndex(e => e.ToAccountNumber);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.CorrelationId);
            
            entity.Property(e => e.Amount)
                .HasPrecision(18, 2);
        });
        
        // TransactionEntry configuration
        modelBuilder.Entity<TransactionEntry>(entity =>
        {
            entity.HasKey(e => e.EntryId);
            entity.HasIndex(e => e.TransactionId);
            entity.HasIndex(e => e.AccountNumber);
            entity.HasIndex(e => e.CreatedAt);
            
            entity.Property(e => e.Amount)
                .HasPrecision(18, 2);
                
            entity.HasOne(e => e.Transaction)
                .WithMany(t => t.TransactionEntries)
                .HasForeignKey(e => e.TransactionId);
        });
        
        // TransactionEvent configuration
        modelBuilder.Entity<TransactionEvent>(entity =>
        {
            entity.HasKey(e => e.EventId);
            entity.HasIndex(e => e.TransactionId);
            entity.HasIndex(e => e.EventType);
            entity.HasIndex(e => e.OccurredAt);
            
            entity.HasOne(e => e.Transaction)
                .WithMany()
                .HasForeignKey(e => e.TransactionId);
        });
    }
}