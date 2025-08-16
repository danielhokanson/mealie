using System.Security.Claims;
using MealieApi.Domain.Entities.Users;

namespace MealieApi.Shared.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(User user, bool rememberMe = false);
        string GenerateRefreshToken();
        ClaimsPrincipal? ValidateToken(string token);
        Guid? GetUserIdFromToken(string token);
        string? GetUsernameFromToken(string token);
    }
}
