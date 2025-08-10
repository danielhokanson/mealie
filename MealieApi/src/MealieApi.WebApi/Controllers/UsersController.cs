using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;
using MealieApi.Domain.Enums;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing users with TPH support
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseController
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<UsersController> logger)
    {
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers(CancellationToken cancellationToken = default)
    {
        try
        {
            var users = await _userRepository.GetAllAsync(cancellationToken);
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, "An error occurred while retrieving users");
        }
    }

    /// <summary>
    /// Get a specific user by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, "An error occurred while retrieving the user");
        }
    }

    /// <summary>
    /// Get a user by username
    /// </summary>
    [HttpGet("username/{username}")]
    public async Task<ActionResult<UserDto>> GetUserByUsername(string username, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _userRepository.GetByUsernameAsync(username, cancellationToken);
            if (user == null)
            {
                return NotFound($"User with username '{username}' not found");
            }

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by username {Username}", username);
            return StatusCode(500, "An error occurred while retrieving the user");
        }
    }

    /// <summary>
    /// Get a user by email
    /// </summary>
    [HttpGet("email/{email}")]
    public async Task<ActionResult<UserDto>> GetUserByEmail(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
            if (user == null)
            {
                return NotFound($"User with email '{email}' not found");
            }

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by email {Email}", email);
            return StatusCode(500, "An error occurred while retrieving the user");
        }
    }

    /// <summary>
    /// Get all standard users
    /// </summary>
    [HttpGet("standard")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetStandardUsers(CancellationToken cancellationToken = default)
    {
        try
        {
            var users = await _userRepository.GetStandardUsersAsync(cancellationToken);
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving standard users");
            return StatusCode(500, "An error occurred while retrieving standard users");
        }
    }

    /// <summary>
    /// Get all admin users
    /// </summary>
    [HttpGet("admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAdminUsers(CancellationToken cancellationToken = default)
    {
        try
        {
            var users = await _userRepository.GetAdminUsersAsync(cancellationToken);
            var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);
            return Ok(userDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving admin users");
            return StatusCode(500, "An error occurred while retrieving admin users");
        }
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if username is available
            if (!await _userRepository.IsUsernameAvailableAsync(createDto.Username, cancellationToken))
            {
                return BadRequest($"Username '{createDto.Username}' is already taken");
            }

            // Check if email is available
            if (!await _userRepository.IsEmailAvailableAsync(createDto.Email, cancellationToken))
            {
                return BadRequest($"Email '{createDto.Email}' is already registered");
            }

            User user;
            
            // Create the appropriate user type based on TPH
            if (createDto.UserType == UserType.Admin)
            {
                user = _mapper.Map<AdminUser>(createDto);
            }
            else
            {
                user = _mapper.Map<StandardUser>(createDto);
            }

            // In a real application, you would hash the password here
            user.PasswordHash = HashPassword(createDto.Password);

            var createdUser = await _userRepository.AddAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            var userDto = _mapper.Map<UserDto>(createdUser);
            return CreatedAtAction(nameof(GetUser), new { id = userDto.Id }, userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, "An error occurred while creating the user");
        }
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.FirstName)) user.FirstName = updateDto.FirstName;
            if (!string.IsNullOrEmpty(updateDto.LastName)) user.LastName = updateDto.LastName;
            if (updateDto.Avatar != null) user.Avatar = updateDto.Avatar;
            if (updateDto.IsActive.HasValue) user.IsActive = updateDto.IsActive.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, "An error occurred while updating the user");
        }
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(id, cancellationToken);
            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            await _userRepository.DeleteAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, "An error occurred while deleting the user");
        }
    }

    /// <summary>
    /// Check if username is available
    /// </summary>
    [HttpGet("check-username/{username}")]
    public async Task<ActionResult<bool>> CheckUsernameAvailability(string username, CancellationToken cancellationToken = default)
    {
        try
        {
            var isAvailable = await _userRepository.IsUsernameAvailableAsync(username, cancellationToken);
            return Ok(new { available = isAvailable });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking username availability");
            return StatusCode(500, "An error occurred while checking username availability");
        }
    }

    /// <summary>
    /// Check if email is available
    /// </summary>
    [HttpGet("check-email/{email}")]
    public async Task<ActionResult<bool>> CheckEmailAvailability(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            var isAvailable = await _userRepository.IsEmailAvailableAsync(email, cancellationToken);
            return Ok(new { available = isAvailable });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking email availability");
            return StatusCode(500, "An error occurred while checking email availability");
        }
    }

    /// <summary>
    /// Get current user profile (self)
    /// </summary>
    [HttpGet("self")]
    public async Task<ActionResult<UserDto>> GetCurrentUserProfile(CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real app, get user ID from authentication context
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user profile");
            return StatusCode(500, "An error occurred while retrieving current user profile");
        }
    }

    /// <summary>
    /// Update current user profile (self)
    /// </summary>
    [HttpPut("self")]
    public async Task<ActionResult<UserDto>> UpdateCurrentUserProfile([FromBody] UpdateUserDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.FirstName)) user.FirstName = updateDto.FirstName;
            if (!string.IsNullOrEmpty(updateDto.LastName)) user.LastName = updateDto.LastName;
            if (updateDto.Avatar != null) user.Avatar = updateDto.Avatar;
            if (updateDto.IsActive.HasValue) user.IsActive = updateDto.IsActive.Value;

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating current user profile");
            return StatusCode(500, "An error occurred while updating current user profile");
        }
    }

    /// <summary>
    /// Delete current user account (self)
    /// </summary>
    [HttpDelete("self")]
    public async Task<IActionResult> DeleteCurrentUser(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            await _userRepository.DeleteAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting current user account");
            return StatusCode(500, "An error occurred while deleting current user account");
        }
    }

    /// <summary>
    /// Get user preferences
    /// </summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<UserPreferencesDto>> GetUserPreferences(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user?.Preferences == null)
            {
                // Create default preferences if none exist
                var defaultPreferences = new UserPreferences { UserId = userId };
                var preferences = _mapper.Map<UserPreferencesDto>(defaultPreferences);
                return Ok(preferences);
            }

            var preferencesDto = _mapper.Map<UserPreferencesDto>(user.Preferences);
            return Ok(preferencesDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user preferences");
            return StatusCode(500, "An error occurred while retrieving user preferences");
        }
    }

    /// <summary>
    /// Update user preferences
    /// </summary>
    [HttpPut("preferences")]
    public async Task<ActionResult<UserPreferencesDto>> UpdateUserPreferences([FromBody] UpdateUserPreferencesDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            if (user.Preferences == null)
            {
                user.Preferences = new UserPreferences { UserId = userId };
            }

            // Update preferences
            if (updateDto.DarkMode.HasValue) user.Preferences.DarkMode = updateDto.DarkMode.Value;
            if (!string.IsNullOrEmpty(updateDto.Language)) user.Preferences.Language = updateDto.Language;
            if (!string.IsNullOrEmpty(updateDto.Theme)) user.Preferences.Theme = updateDto.Theme;
            if (updateDto.EnableNotifications.HasValue) user.Preferences.EnableNotifications = updateDto.EnableNotifications.Value;
            if (!string.IsNullOrEmpty(updateDto.DefaultUnitSystem)) user.Preferences.DefaultUnitSystem = updateDto.DefaultUnitSystem;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            var preferencesDto = _mapper.Map<UserPreferencesDto>(user.Preferences);
            return Ok(preferencesDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user preferences");
            return StatusCode(500, "An error occurred while updating user preferences");
        }
    }

    /// <summary>
    /// Change user password
    /// </summary>
    [HttpPost("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            // Verify current password
            if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("Current password is incorrect");
            }

            // Update password
            user.PasswordHash = HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing user password");
            return StatusCode(500, "An error occurred while changing password");
        }
    }

    /// <summary>
    /// Upload user avatar
    /// </summary>
    [HttpPost("avatar")]
    public async Task<ActionResult<UserDto>> UploadAvatar(IFormFile file, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest("Only image files are allowed");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            // In a real app, save file to storage and store path/URL
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream, cancellationToken);
            user.Avatar = Convert.ToBase64String(memoryStream.ToArray());
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading user avatar");
            return StatusCode(500, "An error occurred while uploading avatar");
        }
    }

    /// <summary>
    /// Delete user avatar
    /// </summary>
    [HttpDelete("avatar")]
    public async Task<IActionResult> DeleteAvatar(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            user.Avatar = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Avatar deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user avatar");
            return StatusCode(500, "An error occurred while deleting avatar");
        }
    }

    /// <summary>
    /// Reset user settings to defaults
    /// </summary>
    [HttpPost("settings/reset")]
    public async Task<IActionResult> ResetUserSettings(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            // Reset preferences to defaults
            if (user.Preferences != null)
            {
                user.Preferences.DarkMode = false;
                user.Preferences.Language = "en-US";
                user.Preferences.Theme = "default";
                user.Preferences.EnableNotifications = true;
                user.Preferences.DefaultUnitSystem = null;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "User settings reset to defaults" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting user settings");
            return StatusCode(500, "An error occurred while resetting user settings");
        }
    }

    /// <summary>
    /// Export user data
    /// </summary>
    [HttpGet("export")]
    public async Task<ActionResult> ExportUserData(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            // In a real app, this would export all user data (recipes, lists, etc.)
            var userData = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreatedAt,
                user.UpdatedAt,
                Preferences = user.Preferences,
                ExportDate = DateTime.UtcNow
            };

            var json = System.Text.Json.JsonSerializer.Serialize(userData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
            var bytes = System.Text.Encoding.UTF8.GetBytes(json);

            return File(bytes, "application/json", $"user_data_{user.Username}_{DateTime.UtcNow:yyyyMMdd}.json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting user data");
            return StatusCode(500, "An error occurred while exporting user data");
        }
    }

    /// <summary>
    /// Get user settings (profile and preferences)
    /// </summary>
    [HttpGet("self/settings")]
    public async Task<ActionResult<object>> GetUserSettings(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            var settings = new
            {
                profile = _mapper.Map<UserDto>(user),
                preferences = user.Preferences != null ? _mapper.Map<UserPreferencesDto>(user.Preferences) : new UserPreferencesDto { UserId = userId }
            };

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user settings");
            return StatusCode(500, "An error occurred while retrieving user settings");
        }
    }

    /// <summary>
    /// Update user settings (profile and preferences)
    /// </summary>
    [HttpPut("self/settings")]
    public async Task<ActionResult<object>> UpdateUserSettings([FromBody] UpdateUserSettingsRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return NotFound("Current user not found");
            }

            // Update profile
            if (request.Profile != null)
            {
                if (!string.IsNullOrEmpty(request.Profile.FirstName)) user.FirstName = request.Profile.FirstName;
                if (!string.IsNullOrEmpty(request.Profile.LastName)) user.LastName = request.Profile.LastName;
                if (request.Profile.Avatar != null) user.Avatar = request.Profile.Avatar;
                if (request.Profile.IsActive.HasValue) user.IsActive = request.Profile.IsActive.Value;
            }

            // Update preferences
            if (request.Preferences != null)
            {
                if (user.Preferences == null)
                {
                    user.Preferences = new UserPreferences { UserId = userId };
                }

                if (request.Preferences.DarkMode.HasValue) user.Preferences.DarkMode = request.Preferences.DarkMode.Value;
                if (!string.IsNullOrEmpty(request.Preferences.Language)) user.Preferences.Language = request.Preferences.Language;
                if (!string.IsNullOrEmpty(request.Preferences.Theme)) user.Preferences.Theme = request.Preferences.Theme;
                if (request.Preferences.EnableNotifications.HasValue) user.Preferences.EnableNotifications = request.Preferences.EnableNotifications.Value;
                if (!string.IsNullOrEmpty(request.Preferences.DefaultUnitSystem)) user.Preferences.DefaultUnitSystem = request.Preferences.DefaultUnitSystem;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            var settings = new
            {
                profile = _mapper.Map<UserDto>(user),
                preferences = user.Preferences != null ? _mapper.Map<UserPreferencesDto>(user.Preferences) : new UserPreferencesDto { UserId = userId }
            };

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user settings");
            return StatusCode(500, "An error occurred while updating user settings");
        }
    }

    /// <summary>
    /// Change user password (alternative endpoint)
    /// </summary>
    [HttpPost("self/change-password")]
    public async Task<IActionResult> ChangePasswordAlternative([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        return await ChangePassword(request, cancellationToken);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        // In a real application, use proper password verification with BCrypt
        // For now, use simple comparison for development
        return HashPassword(password) == hash;
    }

    private static string HashPassword(string password)
    {
        // In a real application, use a proper password hashing library like BCrypt
        // For development, use a simple hash
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password + "mealie_salt"));
        return Convert.ToBase64String(hashedBytes);
    }
}
