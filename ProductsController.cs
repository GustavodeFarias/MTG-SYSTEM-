// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Products Controller
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
public class ProductsController(AppDbContext db) : ControllerBase
{
    private string CurrentUser => User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";
    private string CurrentRole => User.FindFirst(ClaimTypes.Role)?.Value ?? "";
    private bool CanWrite => CurrentRole is "admin" or "estoquista";

    static string GetStockStatus(int qty) => qty switch
    {
        0 => "critical",
        < 5 => "critical",
        < 10 => "low",
        _ => "ok"
    };

    static ProductResponse ToResponse(Product p) => new(
        p.Id, p.Sku, p.Name, p.Category, p.Quantity,
        p.Price, p.PricePounds, p.Supplier,
        p.CreatedAt, p.UpdatedAt, GetStockStatus(p.Quantity));

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? stockStatus,
        [FromQuery] string? sortBy = "createdAt",
        [FromQuery] string? sortDir = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 10)
    {
        var query = db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(q) ||
                p.Sku.ToLower().Contains(q) ||
                p.Supplier.ToLower().Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        // Apply sorting
        query = (sortBy?.ToLower(), sortDir?.ToLower()) switch
        {
            ("name",      "asc")  => query.OrderBy(p => p.Name),
            ("name",      _)      => query.OrderByDescending(p => p.Name),
            ("quantity",  "asc")  => query.OrderBy(p => p.Quantity),
            ("quantity",  _)      => query.OrderByDescending(p => p.Quantity),
            ("price",     "asc")  => query.OrderBy(p => p.Price),
            ("price",     _)      => query.OrderByDescending(p => p.Price),
            ("category",  "asc")  => query.OrderBy(p => p.Category),
            ("category",  _)      => query.OrderByDescending(p => p.Category),
            ("sku",       "asc")  => query.OrderBy(p => p.Sku),
            ("sku",       _)      => query.OrderByDescending(p => p.Sku),
            _                     => query.OrderByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * perPage)
            .Take(perPage)
            .ToListAsync();

        // Filter by stock status after fetching (can't do in SQL easily)
        if (!string.IsNullOrWhiteSpace(stockStatus))
            items = items.Where(p => GetStockStatus(p.Quantity) == stockStatus).ToList();

        return Ok(new PagedResponse<ProductResponse>(
            items.Select(ToResponse).ToList(),
            total, page,
            (int)Math.Ceiling(total / (double)perPage),
            perPage));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await db.Products.FindAsync(id);
        return p == null ? NotFound() : Ok(ToResponse(p));
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await db.Products
            .Select(p => p.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
        return Ok(cats);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        if (!CanWrite) return Forbid();

        // Generate SKU
        var count = await db.Products.CountAsync();
        var sku = $"MTG-{(count + 1):D5}";
        while (await db.Products.AnyAsync(p => p.Sku == sku))
        {
            count++;
            sku = $"MTG-{count:D5}";
        }

        var product = new Product
        {
            Sku = sku,
            Name = req.Name.Trim(),
            Category = req.Category,
            Quantity = req.Quantity,
            Price = req.Price,
            PricePounds = req.PricePounds,
            Supplier = req.Supplier.Trim()
        };

        db.Products.Add(product);
        db.ActionLogs.Add(new ActionLog
        {
            Type = "product_create",
            Message = $"Produto criado: {product.Name} ({sku})",
            UserName = CurrentUser, UserRole = CurrentRole
        });

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ToResponse(product));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductRequest req)
    {
        if (!CanWrite) return Forbid();

        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = req.Name.Trim();
        product.Category = req.Category;
        product.Quantity = req.Quantity;
        product.Price = req.Price;
        product.PricePounds = req.PricePounds;
        product.Supplier = req.Supplier.Trim();
        product.UpdatedAt = DateTime.UtcNow;

        db.ActionLogs.Add(new ActionLog
        {
            Type = "product_update",
            Message = $"Produto atualizado: {product.Name}",
            UserName = CurrentUser, UserRole = CurrentRole
        });

        await db.SaveChangesAsync();
        return Ok(ToResponse(product));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!CanWrite) return Forbid();

        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound();

        db.ActionLogs.Add(new ActionLog
        {
            Type = "product_delete",
            Message = $"Produto removido: {product.Name} ({product.Sku})",
            UserName = CurrentUser, UserRole = CurrentRole
        });

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
