using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;
using MealieApi.Domain.Enums;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// Authentication controller for user login, registration, and token management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<AuthController> logger,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// User login
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Username and password are required" });
            }

            // Find user by username or email
            var user = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken) ??
                      await _userRepository.GetByEmailAsync(request.Username, cancellationToken);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new AuthResponse { Success = false, Message = "Invalid username or password" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new AuthResponse { Success = false, Message = "Account is disabled" });
            }

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            // Generate tokens
            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            var userDto = _mapper.Map<UserDto>(user);

            return Ok(new AuthResponse
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = userDto,
                Message = "Login successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user {Username}", request.Username);
            return StatusCode(500, new AuthResponse { Success = false, Message = "An error occurred during login" });
        }
    }

    /// <summary>
    /// User registration
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Username, email, and password are required" });
            }

            // Check if username is available
            if (!await _userRepository.IsUsernameAvailableAsync(request.Username, cancellationToken))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Username is already taken" });
            }

            // Check if email is available
            if (!await _userRepository.IsEmailAvailableAsync(request.Email, cancellationToken))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Email is already registered" });
            }

            // Create new user (default to StandardUser)
            var user = new StandardUser
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = HashPassword(request.Password),
                IsActive = true,
                EmailVerified = false
            };

            var createdUser = await _userRepository.AddAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            // Generate tokens
            var accessToken = GenerateAccessToken(createdUser);
            var refreshToken = GenerateRefreshToken();

            var userDto = _mapper.Map<UserDto>(createdUser);

            return Ok(new AuthResponse
            {
                Success = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = userDto,
                Message = "Registration successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for user {Username}", request.Username);
            return StatusCode(500, new AuthResponse { Success = false, Message = "An error occurred during registration" });
        }
    }

    /// <summary>
    /// Refresh access token
    /// </summary>
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Refresh token is required" });
            }

            // In a real implementation, you would validate the refresh token
            // For now, we'll just return an error
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid refresh token" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, new AuthResponse { Success = false, Message = "An error occurred during token refresh" });
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser(CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real implementation, you would get the user ID from the JWT token
            // For now, we'll return an error since authentication middleware is not implemented
            return Unauthorized("Authentication required");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, "An error occurred while getting current user information");
        }
    }

    /// <summary>
    /// User logout
    /// </summary>
    [HttpPost("logout")]
    public ActionResult Logout()
    {
        try
        {
            // In a real implementation, you would invalidate the refresh token
            return Ok(new { message = "Logout successful" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, "An error occurred during logout");
        }
    }

    /// <summary>
    /// Reset password request
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Email is required");
            }

            var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (user == null)
            {
                // Don't reveal whether the email exists or not
                return Ok(new { message = "If the email exists, a password reset link has been sent" });
            }

            // In a real implementation, you would generate a reset token and send an email
            _logger.LogInformation("Password reset requested for user {Email}", request.Email);

            return Ok(new { message = "If the email exists, a password reset link has been sent" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset request");
            return StatusCode(500, "An error occurred during password reset request");
        }
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest("Token and new password are required");
            }

            // In a real implementation, you would validate the reset token
            // For now, we'll just return an error
            return BadRequest("Invalid or expired reset token");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset");
            return StatusCode(500, "An error occurred during password reset");
        }
    }

    private string GenerateAccessToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "default-secret-key-that-should-be-changed"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("user_type", user.UserType.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "MealieApi",
            audience: _configuration["Jwt:Audience"] ?? "MealieApi",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString();
    }

    private static string HashPassword(string password)
    {
        // In a real application, use a proper password hashing library like BCrypt
        // This is just a placeholder
        return Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(password + "salt")));
    }

    private static bool VerifyPassword(string password, string hash)
    {
        // In a real application, use a proper password verification method
        // This is just a placeholder
        return HashPassword(password) == hash;
    }
}

// DTOs for authentication
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class AuthResponse
{
    public bool Success { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public UserDto? User { get; set; }
    public string? Message { get; set; }
}
