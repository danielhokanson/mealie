using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// Base controller providing common functionality for authentication and user context
/// </summary>
public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Get the current authenticated user's ID from JWT claims
    /// </summary>
    /// <returns>User ID if authenticated, Guid.Empty if not authenticated</returns>
    protected Guid GetCurrentUserId()
    {
        var userIdClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? User?.FindFirst("sub")?.Value 
                         ?? User?.FindFirst("userId")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            // For development/testing - return a fixed user ID if no auth context
            // In production, this should return Guid.Empty and require authentication
            if (IsInDevelopmentMode())
            {
                return new Guid("11111111-1111-1111-1111-111111111111"); // Fixed dev user ID
            }
            return Guid.Empty;
        }

        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    /// <summary>
    /// Get the current authenticated user's email from JWT claims
    /// </summary>
    /// <returns>User email if authenticated, null if not authenticated</returns>
    protected string? GetCurrentUserEmail()
    {
        return User?.FindFirst(ClaimTypes.Email)?.Value 
               ?? User?.FindFirst("email")?.Value;
    }

    /// <summary>
    /// Get the current authenticated user's username from JWT claims
    /// </summary>
    /// <returns>Username if authenticated, null if not authenticated</returns>
    protected string? GetCurrentUsername()
    {
        return User?.FindFirst(ClaimTypes.Name)?.Value 
               ?? User?.FindFirst("username")?.Value;
    }

    /// <summary>
    /// Check if the current user has a specific role
    /// </summary>
    /// <param name="role">Role to check</param>
    /// <returns>True if user has the role, false otherwise</returns>
    protected bool IsInRole(string role)
    {
        return User?.IsInRole(role) ?? false;
    }

    /// <summary>
    /// Check if the current user is an admin
    /// </summary>
    /// <returns>True if user is admin, false otherwise</returns>
    protected bool IsAdmin()
    {
        return IsInRole("Admin") || IsInRole("Administrator");
    }

    /// <summary>
    /// Check if we're running in development mode
    /// </summary>
    /// <returns>True if in development mode</returns>
    private bool IsInDevelopmentMode()
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        return string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Ensure the current user is authenticated
    /// </summary>
    /// <returns>ActionResult with Unauthorized if not authenticated, null if authenticated</returns>
    protected ActionResult? EnsureAuthenticated()
    {
        var userId = GetCurrentUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized("User not authenticated");
        }
        return null;
    }

    /// <summary>
    /// Ensure the current user is an admin
    /// </summary>
    /// <returns>ActionResult with appropriate error if not admin, null if admin</returns>
    protected ActionResult? EnsureAdmin()
    {
        var authCheck = EnsureAuthenticated();
        if (authCheck != null) return authCheck;

        if (!IsAdmin())
        {
            return Forbid("Admin access required");
        }
        return null;
    }
}
