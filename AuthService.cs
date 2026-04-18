// ═══════════════════════════════════════════════════
//  MTG SYSTEM — Auth Service (JWT)
// ═══════════════════════════════════════════════════

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MtgSystem.Models;

namespace MtgSystem.Services;

public interface IAuthService
{
    string GenerateToken(User user);
    bool ValidatePassword(string password, string hash);
    string HashPassword(string password);
}

public class AuthService(IConfiguration config) : IAuthService
{
    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? "MTGSystem_SuperSecret_Key_2026_!!"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("status", user.Status)
        };

        var token = new JwtSecurityToken(
            issuer:   config["Jwt:Issuer"] ?? "MtgSystem",
            audience: config["Jwt:Audience"] ?? "MtgSystemUsers",
            claims:   claims,
            expires:  DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public bool ValidatePassword(string password, string hash)
        => BCrypt.Net.BCrypt.Verify(password, hash);

    public string HashPassword(string password)
        => BCrypt.Net.BCrypt.HashPassword(password);
}
