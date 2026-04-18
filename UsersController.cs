// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Users Controller
// ═══════════════════════════════════════════════════

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MtgSystem.Data;
using MtgSystem.DTOs;
using MtgSystem.Models;
using MtgSystem.Services;

namespace MtgSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class UsersController(AppDbContext db, IAuthService authSvc) : ControllerBase
{
    private string CurrentUser => User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema";
    private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? role)
    {
        var query = db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(u => u.Status == status);
        if (!string.IsNullOrWhiteSpace(role))   query = query.Where(u => u.Role == role);

        var users = await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
        return Ok(users.Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Role, u.Status, u.CreatedAt)));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        if (req.Password.Length < 6) return BadRequest(new ApiError("Senha deve ter no mínimo 6 caracteres"));
        var email = req.Email.Trim().ToLower();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new ApiError("E-mail já cadastrado"));

        var user = new User { Name = req.Name.Trim(), Email = email, PasswordHash = authSvc.HashPassword(req.Password), Role = req.Role };
        db.Users.Add(user);
        db.ActionLogs.Add(new ActionLog { Type = "user_create", Message = $"Usuário criado: {user.Name} ({user.Role})", UserName = CurrentUser });
        await db.SaveChangesAsync();
        return Ok(new UserResponse(user.Id, user.Name, user.Email, user.Role, user.Status, user.CreatedAt));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest req)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.Name = req.Name.Trim();
        user.Role = req.Role;
        user.Status = req.Status;
        user.UpdatedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(req.Password))
        {
            if (req.Password.Length < 6) return BadRequest(new ApiError("Senha deve ter no mínimo 6 caracteres"));
            user.PasswordHash = authSvc.HashPassword(req.Password);
        }
        db.ActionLogs.Add(new ActionLog { Type = "user_update", Message = $"Usuário atualizado: {user.Name}", UserName = CurrentUser });
        await db.SaveChangesAsync();
        return Ok(new UserResponse(user.Id, user.Name, user.Email, user.Role, user.Status, user.CreatedAt));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (id == CurrentUserId) return BadRequest(new ApiError("Não é possível excluir o próprio usuário"));
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        db.ActionLogs.Add(new ActionLog { Type = "user_delete", Message = $"Usuário removido: {user.Name}", UserName = CurrentUser });
        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int page = 1, [FromQuery] int perPage = 50)
    {
        var query = db.ActionLogs.OrderByDescending(l => l.CreatedAt);
        var total = await query.CountAsync();
        var items = await query.Skip((page - 1) * perPage).Take(perPage).ToListAsync();
        return Ok(new PagedResponse<ActionLogResponse>(
            items.Select(l => new ActionLogResponse(l.Id, l.Type, l.Message, l.UserName, l.UserRole, l.CreatedAt)).ToList(),
            total, page, (int)Math.Ceiling(total / (double)perPage), perPage));
    }

    [HttpDelete("logs")]
    public async Task<IActionResult> ClearLogs()
    {
        await db.ActionLogs.ExecuteDeleteAsync();
        return NoContent();
    }
}

// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Dashboard Controller
// ═══════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var products = await db.Products.ToListAsync();
        var movements = await db.StockMovements.ToListAsync();
        var logs = await db.ActionLogs.OrderByDescending(l => l.CreatedAt).Take(10).ToListAsync();

        var critical = products.Where(p => p.Quantity < 5).ToList();
        var low      = products.Where(p => p.Quantity >= 5 && p.Quantity < 10).ToList();
        var totalVal = products.Sum(p => p.Price * p.Quantity);

        var byCategory = products
            .GroupBy(p => p.Category)
            .Select(g => new CategoryStats(g.Key, g.Count(), g.Sum(p => p.Price * p.Quantity)))
            .OrderByDescending(c => c.Count)
            .ToList();

        // Monthly stats (last 6 months)
        var now = DateTime.UtcNow;
        var monthly = Enumerable.Range(0, 6).Select(i =>
        {
            var d = now.AddMonths(-5 + i);
            var mMovs = movements.Where(m => m.CreatedAt.Year == d.Year && m.CreatedAt.Month == d.Month);
            return new MonthlyStats(
                d.ToString("MMM", new System.Globalization.CultureInfo("pt-BR")),
                d.Year,
                mMovs.Where(m => m.Type == "entrada").Sum(m => m.Quantity),
                mMovs.Where(m => m.Type == "saida").Sum(m => m.Quantity));
        }).ToList();

        static ProductResponse ToResp(Product p) => new(
            p.Id, p.Sku, p.Name, p.Category, p.Quantity, p.Price, p.PricePounds,
            p.Supplier, p.CreatedAt, p.UpdatedAt,
            p.Quantity switch { 0 => "critical", < 5 => "critical", < 10 => "low", _ => "ok" });

        return Ok(new DashboardResponse(
            products.Count, critical.Count, low.Count, totalVal,
            movements.Count,
            movements.Where(m => m.Type == "entrada").Sum(m => m.Quantity),
            movements.Where(m => m.Type == "saida").Sum(m => m.Quantity),
            byCategory, monthly,
            critical.Select(ToResp).ToList(),
            logs.Select(l => new ActionLogResponse(l.Id, l.Type, l.Message, l.UserName, l.UserRole, l.CreatedAt)).ToList()
        ));
    }
}
