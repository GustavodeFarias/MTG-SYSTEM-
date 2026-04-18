// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Database Context + Seed
// ═══════════════════════════════════════════════════

using Microsoft.EntityFrameworkCore;
using MtgSystem.Models;

namespace MtgSystem.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<ActionLog> ActionLogs => Set<ActionLog>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // User
        mb.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Price).HasPrecision(18, 2);
        });

        // Product
        mb.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Sku).IsUnique();
            e.Property(p => p.Price).HasColumnType("decimal(18,2)");
            e.Property(p => p.PricePounds).HasColumnType("decimal(18,2)");
        });

        // Relationships
        mb.Entity<StockMovement>()
            .HasOne(m => m.Product)
            .WithMany(p => p.Movements)
            .HasForeignKey(m => m.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<ActionLog>()
            .HasOne(l => l.User)
            .WithMany(u => u.Logs)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── SEED ──
        var now = new DateTime(2026, 4, 1, 8, 0, 0, DateTimeKind.Utc);

        mb.Entity<User>().HasData(new User
        {
            Id = 1,
            Name = "Administrador",
            Email = "admin@mtg.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "admin",
            Status = "active",
            CreatedAt = now
        });

        mb.Entity<Product>().HasData(
            new Product { Id=1,  Sku="MTG-00001", Name="Pastilha de Freio Dianteira",   Category="Freios",      Quantity=45,  Price=89.90m,   PricePounds=0m,      Supplier="Auto Peças Norte",   CreatedAt=now.AddDays(-10) },
            new Product { Id=2,  Sku="MTG-00002", Name="Disco de Freio Ventilado",       Category="Freios",      Quantity=3,   Price=299.50m,  PricePounds=47.30m,  Supplier="Distribuidora Sul",  CreatedAt=now.AddDays(-9)  },
            new Product { Id=3,  Sku="MTG-00003", Name="Óleo de Motor 5W30 1L",          Category="Motor",       Quantity=120, Price=35.00m,   PricePounds=0m,      Supplier="Importadora Centro", CreatedAt=now.AddDays(-8)  },
            new Product { Id=4,  Sku="MTG-00004", Name="Filtro de Óleo Mahle",           Category="Filtros",     Quantity=7,   Price=22.90m,   PricePounds=0m,      Supplier="Auto Peças Norte",   CreatedAt=now.AddDays(-7)  },
            new Product { Id=5,  Sku="MTG-00005", Name="Bateria 60Ah Heliar",            Category="Elétrica",    Quantity=2,   Price=450.00m,  PricePounds=71.20m,  Supplier="Mega Parts",         CreatedAt=now.AddDays(-7)  },
            new Product { Id=6,  Sku="MTG-00006", Name="Amortecedor Dianteiro Monroe",   Category="Suspensão",   Quantity=18,  Price=380.00m,  PricePounds=60.10m,  Supplier="Distribuidora Sul",  CreatedAt=now.AddDays(-6)  },
            new Product { Id=7,  Sku="MTG-00007", Name="Kit Embreagem Completo",         Category="Embreagem",   Quantity=4,   Price=650.00m,  PricePounds=102.80m, Supplier="Fornecedor ABC",     CreatedAt=now.AddDays(-5)  },
            new Product { Id=8,  Sku="MTG-00008", Name="Correia Dentada Gates",          Category="Motor",       Quantity=22,  Price=95.00m,   PricePounds=15.00m,  Supplier="Auto Peças Norte",   CreatedAt=now.AddDays(-4)  },
            new Product { Id=9,  Sku="MTG-00009", Name="Vela de Ignição NGK",            Category="Motor",       Quantity=0,   Price=18.50m,   PricePounds=0m,      Supplier="Importadora Centro", CreatedAt=now.AddDays(-3)  },
            new Product { Id=10, Sku="MTG-00010", Name="Filtro de Ar K&N",              Category="Filtros",     Quantity=31,  Price=145.00m,  PricePounds=22.90m,  Supplier="Mega Parts",         CreatedAt=now.AddDays(-2)  },
            new Product { Id=11, Sku="MTG-00011", Name="Mola de Suspensão Dianteira",   Category="Suspensão",   Quantity=9,   Price=220.00m,  PricePounds=34.80m,  Supplier="Distribuidora Sul",  CreatedAt=now.AddDays(-2)  },
            new Product { Id=12, Sku="MTG-00012", Name="Silencioso Traseiro Universal", Category="Escapamento", Quantity=12,  Price=180.00m,  PricePounds=28.50m,  Supplier="Fornecedor ABC",     CreatedAt=now.AddDays(-1)  },
            new Product { Id=13, Sku="MTG-00013", Name="Caixa de Câmbio Remanuf. 5M",  Category="Transmissão", Quantity=1,   Price=2800.00m, PricePounds=442.50m, Supplier="Mega Parts",         CreatedAt=now.AddDays(-1)  },
            new Product { Id=14, Sku="MTG-00014", Name="Fluido de Freio DOT 4 500ml",  Category="Freios",      Quantity=55,  Price=28.00m,   PricePounds=0m,      Supplier="Auto Peças Norte",   CreatedAt=now              },
            new Product { Id=15, Sku="MTG-00015", Name="Rolamento de Roda Dianteiro",  Category="Suspensão",   Quantity=6,   Price=155.00m,  PricePounds=24.50m,  Supplier="Distribuidora Sul",  CreatedAt=now              }
        );
    }
}
