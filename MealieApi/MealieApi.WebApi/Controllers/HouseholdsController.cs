using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing households
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : BaseController
{
    private readonly IRepository<Household> _householdRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<HouseholdsController> _logger;

    public HouseholdsController(
        IRepository<Household> householdRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<HouseholdsController> logger)
    {
        _householdRepository = householdRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's household
    /// </summary>
    [HttpGet("self")]
    public async Task<ActionResult<HouseholdDto>> GetCurrentUserHousehold(CancellationToken cancellationToken = default)
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

            // In the TPH design, users belong to organizations (households/groups)
            // Find the household this user belongs to
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            var householdDto = _mapper.Map<HouseholdDto>(household);
            return Ok(householdDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user's household");
            return StatusCode(500, "An error occurred while retrieving the household");
        }
    }

    /// <summary>
    /// Get household members
    /// </summary>
    [HttpGet("members")]
    public async Task<ActionResult<object>> GetHouseholdMembers(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            var members = household.Users.AsEnumerable();
            var total = members.Count();
            
            var pagedMembers = perPage > 0 ? 
                members.Skip((page - 1) * perPage).Take(perPage) : 
                members;

            var memberDtos = _mapper.Map<List<UserDto>>(pagedMembers);

            var response = new
            {
                items = memberDtos,
                total,
                page,
                perPage,
                totalPages = perPage > 0 ? (int)Math.Ceiling((double)total / perPage) : 1
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving household members");
            return StatusCode(500, "An error occurred while retrieving household members");
        }
    }

    /// <summary>
    /// Add member to household
    /// </summary>
    [HttpPost("members")]
    public async Task<ActionResult<UserDto>> AddMember([FromBody] AddMemberRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // Find user to add by email
            var userToAdd = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (userToAdd == null)
            {
                return NotFound($"User with email '{request.Email}' not found");
            }

            // Check if user is already a member
            if (household.Users.Any(u => u.Id == userToAdd.Id))
            {
                return BadRequest("User is already a member of this household");
            }

            // Add user to household
            household.Users.Add(userToAdd);
            household.UpdatedAt = DateTime.UtcNow;

            await _householdRepository.UpdateAsync(household, cancellationToken);
            await _householdRepository.SaveChangesAsync(cancellationToken);

            var userDto = _mapper.Map<UserDto>(userToAdd);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding member to household");
            return StatusCode(500, "An error occurred while adding member to household");
        }
    }

    /// <summary>
    /// Update member permissions in household
    /// </summary>
    [HttpPut("members/{memberId:guid}/permissions")]
    public async Task<ActionResult<UserDto>> UpdateMemberPermissions(
        Guid memberId, 
        [FromBody] UpdateMemberPermissionsRequest request, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // Find member to update
            var member = household.Users.FirstOrDefault(u => u.Id == memberId);
            if (member == null)
            {
                return NotFound("Member not found in household");
            }

            // In a real app, update permissions based on request
            _logger.LogInformation("Updating permissions for member {MemberId} in household {HouseholdId}", memberId, household.Id);

            var userDto = _mapper.Map<UserDto>(member);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating member permissions");
            return StatusCode(500, "An error occurred while updating member permissions");
        }
    }

    /// <summary>
    /// Remove member from household
    /// </summary>
    [HttpDelete("members/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid memberId, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // Find member to remove
            var member = household.Users.FirstOrDefault(u => u.Id == memberId);
            if (member == null)
            {
                return NotFound("Member not found in household");
            }

            // Remove user from household
            household.Users.Remove(member);
            household.UpdatedAt = DateTime.UtcNow;

            await _householdRepository.UpdateAsync(household, cancellationToken);
            await _householdRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing member from household");
            return StatusCode(500, "An error occurred while removing member from household");
        }
    }

    /// <summary>
    /// Get household preferences
    /// </summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<object>> GetHouseholdPreferences(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // Return household preferences (in a real app, this would be stored)
            var preferences = new
            {
                householdId = household.Id,
                name = household.Name,
                allowGuestAccess = true,
                defaultRecipeVisibility = "household",
                sharedShoppingLists = true,
                mealPlanningEnabled = true,
                budgetTracking = false
            };

            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving household preferences");
            return StatusCode(500, "An error occurred while retrieving household preferences");
        }
    }

    /// <summary>
    /// Update household preferences
    /// </summary>
    [HttpPut("preferences")]
    public async Task<ActionResult<object>> UpdateHouseholdPreferences([FromBody] Dictionary<string, object> preferences, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // In a real app, save preferences to database
            _logger.LogInformation("Updating preferences for household {HouseholdId}: {@Preferences}", household.Id, preferences);

            household.UpdatedAt = DateTime.UtcNow;
            await _householdRepository.UpdateAsync(household, cancellationToken);
            await _householdRepository.SaveChangesAsync(cancellationToken);

            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating household preferences");
            return StatusCode(500, "An error occurred while updating household preferences");
        }
    }

    /// <summary>
    /// Get household statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetHouseholdStatistics(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // Calculate household statistics
            var statistics = new
            {
                householdId = household.Id,
                name = household.Name,
                memberCount = household.Users.Count,
                totalRecipes = household.Users.Sum(u => u.Recipes.Count),
                totalShoppingLists = household.Users.Sum(u => u.ShoppingLists.Count),
                createdAt = household.CreatedAt,
                lastActivity = household.UpdatedAt,
                storageUsed = CalculateHouseholdStorageUsed(household),
                storageLimit = GetHouseholdStorageLimit(household)
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving household statistics");
            return StatusCode(500, "An error occurred while retrieving household statistics");
        }
    }

    /// <summary>
    /// Create household invitation token
    /// </summary>
    [HttpPost("invitations")]
    public async Task<ActionResult<object>> CreateInvitation([FromBody] CreateInvitationRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's household
            var household = await _householdRepository.FirstOrDefaultAsync(
                h => h.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (household == null)
            {
                return NotFound("User is not associated with any household");
            }

            // Create invitation token
            var invitation = new
            {
                token = Guid.NewGuid().ToString(),
                householdId = household.Id,
                householdName = household.Name,
                createdBy = userId,
                createdAt = DateTime.UtcNow,
                expiresAt = DateTime.UtcNow.AddDays(request.ExpirationDays ?? 7),
                maxUses = request.MaxUses ?? 1,
                uses = 0
            };

            return Ok(invitation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating household invitation");
            return StatusCode(500, "An error occurred while creating household invitation");
        }
    }

    /// <summary>
    /// Calculate storage used by household (placeholder implementation)
    /// </summary>
    private static string CalculateHouseholdStorageUsed(Household household)
    {
        // In a real implementation, this would calculate actual storage usage
        var estimatedMB = household.Users.Count * 25 + household.Users.Sum(u => u.Recipes.Count) * 2;
        return $"{estimatedMB} MB";
    }

    /// <summary>
    /// Get storage limit for household (placeholder implementation)
    /// </summary>
    private static string GetHouseholdStorageLimit(Household household)
    {
        // In a real implementation, this would be based on household plan/settings
        return household.Users.Count <= 5 ? "1 GB" : "5 GB";
    }
}

/// <summary>
/// Request DTO for adding member to household
/// </summary>
public class AddMemberRequest
{
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request DTO for updating member permissions
/// </summary>
public class UpdateMemberPermissionsRequest
{
    public Dictionary<string, object> Permissions { get; set; } = new();
}

/// <summary>
/// Request DTO for creating invitation
/// </summary>
public class CreateInvitationRequest
{
    public int? ExpirationDays { get; set; }
    public int? MaxUses { get; set; }
}
