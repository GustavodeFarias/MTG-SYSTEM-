// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Stock Movements Controller
// ═══════════════════════════════════════════════════

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MtgSystem.Data;
using MtgSystem.DTOs;
using MtgSystem.Models;

namespace MtgSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockController(AppDbContext db) : ControllerBase
{
    private string CurrentUser => User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanWrite => CurrentRole is "admin" or "estoquista";

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20)
    {
        var query = db.StockMovements.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(m => m.Type == type);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(m =>
                m.ProductName.ToLower().Contains(q) ||
                m.Sku.ToLower().Contains(q));
        }

        query = query.OrderByDescending(m => m.CreatedAt);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .ToListAsync();

        return Ok(new PagedResponse<StockMovementResponse>(
            items.Select(ToResponse).ToList(),
            total, page,
            (int)Math.Ceiling(total / (double)perPage),
            perPage));
    }

    [HttpPost("{productId:int}")]
    public async Task<IActionResult> Register(int productId, [FromBody] StockMovementRequest req)
    {
        if (!CanWrite) return Forbid();

        var product = await db.Products.FindAsync(productId);
        if (product == null) return NotFound(new ApiError("Produto não encontrado"));

        if (req.Quantity <= 0)
            return BadRequest(new ApiError("Quantidade deve ser maior que zero"));

        if (req.Type == "saida" && product.Quantity < req.Quantity)
            return BadRequest(new ApiError($"Estoque insuficiente. Disponível: {product.Quantity}"));

        var qtdBefore = product.Quantity;
        product.Quantity = req.Type == "entrada"
            ? product.Quantity + req.Quantity
            : product.Quantity - req.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            ProductId   = productId,
            ProductName = product.Name,
            Sku         = product.Sku,
            Type        = req.Type,
            Quantity    = req.Quantity,
            QtdBefore   = qtdBefore,
            QtdAfter    = product.Quantity,
            Reason      = req.Reason,
            UserName    = CurrentUser
        };

        db.StockMovements.Add(movement);
        db.ActionLogs.Add(new ActionLog
        {
            Type = req.Type == "entrada" ? "stock_in" : "stock_out",
            Message = $"{(req.Type == "entrada" ? "Entrada" : "Saída")}: {req.Quantity}x {product.Name} — {req.Reason}",
            UserName = CurrentUser, UserRole = CurrentRole
        });

        await db.SaveChangesAsync();
        return Ok(new { movement = ToResponse(movement), newQuantity = product.Quantity });
    }

    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var items = await db.StockMovements
            .Where(m => m.ProductId == productId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
        return Ok(items.Select(ToResponse));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var total = await db.StockMovements.CountAsync();
        var entradas = await db.StockMovements.Where(m => m.Type == "entrada").SumAsync(m => (int?)m.Quantity) ?? 0;
        var saidas   = await db.StockMovements.Where(m => m.Type == "saida").SumAsync(m => (int?)m.Quantity) ?? 0;
        var hoje = await db.StockMovements
            .Where(m => m.CreatedAt.Date == DateTime.UtcNow.Date)
            .CountAsync();

        return Ok(new { total, entradas, saidas, hoje });
    }

    static StockMovementResponse ToResponse(StockMovement m) => new(
        m.Id, m.ProductId, m.ProductName, m.Sku,
        m.Type, m.Quantity, m.QtdBefore, m.QtdAfter,
        m.Reason, m.UserName, m.CreatedAt);
}
