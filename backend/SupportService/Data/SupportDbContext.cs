using Microsoft.EntityFrameworkCore;
using SupportService.Models;

namespace SupportService.Data;

public class SupportDbContext : DbContext
{
    public SupportDbContext(DbContextOptions<SupportDbContext> options) : base(options) { }

    public DbSet<SupportTicket> SupportTickets { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<SupportTicket>().ToTable("SupportTickets");
        modelBuilder.Entity<ChatMessage>().ToTable("ChatMessages");
    }
}
