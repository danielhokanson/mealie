using Microsoft.AspNetCore.Mvc;
using MealieApi.Shared.Interfaces;
using MealieApi.Shared.DTOs.Auth;

namespace MealieApi.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate a user and return JWT tokens
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.LoginAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            
            return Unauthorized(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user {Username}", request.Username);
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "An internal server error occurred"
            });
        }
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.RegisterAsync(request);
            
            if (response.Success)
            {
                return CreatedAtAction(nameof(Login), response);
            }
            
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for user {Username}", request.Username);
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "An internal server error occurred"
            });
        }
    }

    /// <summary>
    /// Refresh an access token using a refresh token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.RefreshTokenAsync(request.RefreshToken);
            
            if (response.Success)
            {
                return Ok(response);
            }
            
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "An internal server error occurred"
            });
        }
    }

    /// <summary>
    /// Logout a user by invalidating their refresh token
    /// </summary>
    [HttpPost("logout")]
    public async Task<ActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var success = await _authService.LogoutAsync(request.RefreshToken);
            
            if (success)
            {
                return Ok(new { message = "Logged out successfully" });
            }
            
            return BadRequest(new { message = "Failed to logout" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new { message = "An internal server error occurred" });
        }
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("change-password")]
    public async Task<ActionResult<AuthResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get user ID from JWT token (you'll need to implement this)
            // For now, we'll use a placeholder
            var userId = Guid.NewGuid(); // This should come from the authenticated user's token
            
            var response = await _authService.ChangePasswordAsync(userId, request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "An internal server error occurred"
            });
        }
    }

    /// <summary>
    /// Request a password reset
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<ActionResult<AuthResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.ForgotPasswordAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error requesting password reset for email {Email}", request.Email);
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "An internal server error occurred"
            });
        }
    }

    /// <summary>
    /// Reset password using a reset token
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.ResetPasswordAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "An internal server error occurred"
            });
        }
    }

    /// <summary>
    /// Validate a JWT token
    /// </summary>
    [HttpPost("validate")]
    public async Task<ActionResult> ValidateToken([FromBody] ValidateTokenRequest request)
    {
        try
        {
            var isValid = await _authService.ValidateTokenAsync(request.Token);
            
            if (isValid)
            {
                return Ok(new { valid = true });
            }
            
            return Unauthorized(new { valid = false });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating token");
            return StatusCode(500, new { valid = false, error = "An internal server error occurred" });
        }
    }
} 