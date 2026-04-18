// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Auth Controller
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
public class AuthController(AppDbContext db, IAuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new ApiError("E-mail e senha são obrigatórios"));

        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == req.Email.Trim().ToLower());

        if (user == null || !auth.ValidatePassword(req.Password, user.PasswordHash))
            return Unauthorized(new ApiError("E-mail ou senha incorretos"));

        if (user.Status == "inactive")
            return Unauthorized(new ApiError("Usuário desativado. Contate o administrador."));

        if (user.Status == "blocked")
            return Unauthorized(new ApiError("Usuário bloqueado. Contate o administrador."));

        // Log
        db.ActionLogs.Add(new ActionLog
        {
            Type = "login", Message = $"Login: {user.Name}",
            UserId = user.Id, UserName = user.Name, UserRole = user.Role
        });
        await db.SaveChangesAsync();

        return Ok(new AuthResponse(
            auth.GenerateToken(user),
            user.Name, user.Email, user.Role, user.Id));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new ApiError("Todos os campos são obrigatórios"));

        if (req.Password.Length < 6)
            return BadRequest(new ApiError("A senha deve ter no mínimo 6 caracteres"));

        var email = req.Email.Trim().ToLower();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new ApiError("E-mail já cadastrado"));

        var user = new User
        {
            Name = req.Name.Trim(),
            Email = email,
            PasswordHash = auth.HashPassword(req.Password),
            Role = req.Role,
            Status = "active"
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new AuthResponse(
            auth.GenerateToken(user),
            user.Name, user.Email, user.Role, user.Id));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        return Ok(new UserResponse(user.Id, user.Name, user.Email, user.Role, user.Status, user.CreatedAt));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var id = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();

        if (!auth.ValidatePassword(req.CurrentPassword, user.PasswordHash))
            return BadRequest(new ApiError("Senha atual incorreta"));

        if (req.NewPassword.Length < 6)
            return BadRequest(new ApiError("A nova senha deve ter no mínimo 6 caracteres"));

        user.PasswordHash = auth.HashPassword(req.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { message = "Senha alterada com sucesso" });
    }
}
