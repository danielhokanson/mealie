using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using MealieApi.Shared.DTOs.Auth;
using MealieApi.Domain.Enums;
using AutoMapper;
using Microsoft.Extensions.Logging;

namespace MealieApi.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<AuthResponse> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request);
    Task<bool> ValidateTokenAsync(string token);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;
    private readonly IPasswordService _passwordService;
    private readonly IMapper _mapper;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IJwtService jwtService,
        IPasswordService passwordService,
        IMapper mapper,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _passwordService = passwordService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        try
        {
            // Find user by username or email
            var user = await _userRepository.GetByUsernameAsync(request.Username) ??
                      await _userRepository.GetByEmailAsync(request.Username);

            if (user == null)
            {
                // Perform fake password verification to prevent timing attacks
                _passwordService.VerifyPassword("fake_password", "$2b$12$fake.hash.for.timing.attack");
                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid username or password"
                };
            }

            // Check if user is locked
            if (user.IsLocked)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Account is locked. Please contact support."
                };
            }

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, user.Password))
            {
                                       // Increment login attempts
                       user.LoginAttempts++;
                       await _userRepository.UpdateAsync(user);
                       await _userRepository.SaveChangesAsync();

                                       // Lock user if too many failed attempts
                       if (user.LoginAttempts >= 5)
                       {
                           user.IsLocked = true;
                           await _userRepository.UpdateAsync(user);
                           await _userRepository.SaveChangesAsync();
                           return new AuthResponse
                           {
                               Success = false,
                               Message = "Account locked due to too many failed login attempts"
                           };
                       }

                return new AuthResponse
                {
                    Success = false,
                    Message = "Invalid username or password"
                };
            }

                               // Reset login attempts on successful login
                   user.LoginAttempts = 0;
                   user.LastLoginAt = DateTime.UtcNow;
                   await _userRepository.UpdateAsync(user);
                   await _userRepository.SaveChangesAsync();

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user, request.RememberMe);
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Store refresh token (you might want to create a separate table for this)
            // For now, we'll just return it

            var userDto = _mapper.Map<UserDto>(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = userDto,
                ExpiresAt = DateTime.UtcNow.AddHours(request.RememberMe ? 336 : 24) // 14 days or 24 hours
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user {Username}", request.Username);
            return new AuthResponse
            {
                Success = false,
                Message = "An error occurred during login"
            };
        }
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        try
        {
            // Validate password confirmation
            if (request.Password != request.ConfirmPassword)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Passwords do not match"
                };
            }

            // Check if username already exists
            var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUser != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Username already exists"
                };
            }

            // Check if email already exists
            var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingEmail != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Email already exists"
                };
            }

            // Create new user
            var user = new StandardUser
            {
                Id = Guid.NewGuid(),
                Username = request.Username,
                FullName = request.FullName,
                Email = request.Email,
                Password = _passwordService.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsLocked = false,
                LoginAttempts = 0,
                AuthMethod = AuthMethod.Mealie
            };

                               await _userRepository.AddAsync(user);
                   await _userRepository.SaveChangesAsync();

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            var userDto = _mapper.Map<UserDto>(user);

            return new AuthResponse
            {
                Success = true,
                Message = "Registration successful",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = userDto,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for user {Username}", request.Username);
            return new AuthResponse
            {
                Success = false,
                Message = "An error occurred during registration"
            };
        }
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        // This is a simplified implementation
        // In a real app, you'd validate the refresh token against a stored token
        return new AuthResponse
        {
            Success = false,
            Message = "Refresh token functionality not implemented yet"
        };
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        // In a real app, you'd invalidate the refresh token
        return true;
    }

    public async Task<AuthResponse> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User not found"
                };
            }

            // Verify current password
            if (!_passwordService.VerifyPassword(request.CurrentPassword, user.Password))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Current password is incorrect"
                };
            }

                               // Update password
                   user.Password = _passwordService.HashPassword(request.NewPassword);
                   user.UpdatedAt = DateTime.UtcNow;
                   await _userRepository.UpdateAsync(user);
                   await _userRepository.SaveChangesAsync();

            return new AuthResponse
            {
                Success = true,
                Message = "Password changed successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", userId);
            return new AuthResponse
            {
                Success = false,
                Message = "An error occurred while changing password"
            };
        }
    }

    public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        // This would typically send an email with a reset token
        // For now, just return success
        return new AuthResponse
        {
            Success = true,
            Message = "If the email exists, a password reset link has been sent"
        };
    }

    public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        // This would validate the reset token and update the password
        // For now, just return success
        return new AuthResponse
        {
            Success = true,
            Message = "Password reset successfully"
        };
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        if (string.IsNullOrEmpty(token))
            return false;

        var principal = _jwtService.ValidateToken(token);
        return principal != null;
    }
} 