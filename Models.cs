// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Models
// ═══════════════════════════════════════════════════

namespace MtgSystem.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "visualizador"; // admin | estoquista | analista | visualizador
    public string Status { get; set; } = "active";      // active | inactive | blocked
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<ActionLog> Logs { get; set; } = [];
}

public class Product
{
    public int Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal PricePounds { get; set; }
    public string Supplier { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ICollection<StockMovement> Movements { get; set; } = [];
}

public class StockMovement
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string Sku { get; set; } = "";
    public string Type { get; set; } = ""; // entrada | saida
    public int Quantity { get; set; }
    public int QtdBefore { get; set; }
    public int QtdAfter { get; set; }
    public string Reason { get; set; } = "";
    public string UserName { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Product? Product { get; set; }
}

public class ActionLog
{
    public int Id { get; set; }
    public string Type { get; set; } = "";
    public string Message { get; set; } = "";
    public int? UserId { get; set; }
    public string UserName { get; set; } = "";
    public string UserRole { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
}
