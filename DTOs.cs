// ═══════════════════════════════════════════════════
//  MTG SYSTEM — DTOs (Data Transfer Objects)
// ═══════════════════════════════════════════════════

namespace MtgSystem.DTOs;

// ── AUTH ──
public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Name, string Email, string Password, string Role = "visualizador");
public record AuthResponse(string Token, string Name, string Email, string Role, int Id);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

// ── USERS ──
public record UserResponse(int Id, string Name, string Email, string Role, string Status, DateTime CreatedAt);
public record CreateUserRequest(string Name, string Email, string Password, string Role = "visualizador");
public record UpdateUserRequest(string Name, string Role, string Status, string? Password = null);

// ── PRODUCTS ──
public record ProductResponse(
    int Id, string Sku, string Name, string Category,
    int Quantity, decimal Price, decimal PricePounds,
    string Supplier, DateTime CreatedAt, DateTime? UpdatedAt,
    string StockStatus);

public record CreateProductRequest(
    string Name, string Category, int Quantity,
    decimal Price, decimal PricePounds = 0, string Supplier = "");

public record UpdateProductRequest(
    string Name, string Category, int Quantity,
    decimal Price, decimal PricePounds = 0, string Supplier = "");

// ── STOCK ──
public record StockMovementRequest(string Type, int Quantity, string Reason = "");
public record StockMovementResponse(
    int Id, int ProductId, string ProductName, string Sku,
    string Type, int Quantity, int QtdBefore, int QtdAfter,
    string Reason, string UserName, DateTime CreatedAt);

// ── REPORTS ──
public record DashboardResponse(
    int TotalProducts, int CriticalCount, int LowCount,
    decimal TotalValue, int TotalMovements,
    int TotalEntradas, int TotalSaidas,
    List<CategoryStats> ByCategory,
    List<MonthlyStats> Monthly,
    List<ProductResponse> CriticalProducts,
    List<ActionLogResponse> RecentLogs);

public record CategoryStats(string Category, int Count, decimal TotalValue);
public record MonthlyStats(string Month, int Year, int Entradas, int Saidas);
public record ActionLogResponse(int Id, string Type, string Message, string UserName, string UserRole, DateTime CreatedAt);

// ── PAGINATION ──
public record PagedResponse<T>(List<T> Items, int Total, int Page, int Pages, int PerPage);

// ── GENERIC ──
public record ApiResponse<T>(bool Success, string? Message, T? Data);
public record ApiError(string Message, string? Detail = null);
