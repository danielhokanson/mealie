using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing groups
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class GroupsController : BaseController
{
    private readonly IRepository<Group> _groupRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<GroupsController> _logger;

    public GroupsController(
        IRepository<Group> groupRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<GroupsController> logger)
    {
        _groupRepository = groupRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's group
    /// </summary>
    [HttpGet("self")]
    public async Task<ActionResult<GroupDto>> GetCurrentUserGroup(CancellationToken cancellationToken = default)
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

            // Find the group this user belongs to
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            var groupDto = _mapper.Map<GroupDto>(group);
            return Ok(groupDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user's group");
            return StatusCode(500, "An error occurred while retrieving the group");
        }
    }

    /// <summary>
    /// Get group members
    /// </summary>
    [HttpGet("members")]
    public async Task<ActionResult<object>> GetGroupMembers(
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

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            var members = group.Users.AsEnumerable();
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
            _logger.LogError(ex, "Error retrieving group members");
            return StatusCode(500, "An error occurred while retrieving group members");
        }
    }

    /// <summary>
    /// Add member to group
    /// </summary>
    [HttpPost("members")]
    public async Task<ActionResult<UserDto>> AddMember([FromBody] AddGroupMemberRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            // Find user to add by email
            var userToAdd = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
            if (userToAdd == null)
            {
                return NotFound($"User with email '{request.Email}' not found");
            }

            // Check if user is already a member
            if (group.Users.Any(u => u.Id == userToAdd.Id))
            {
                return BadRequest("User is already a member of this group");
            }

            // Add user to group
            group.Users.Add(userToAdd);
            group.UpdatedAt = DateTime.UtcNow;

            await _groupRepository.UpdateAsync(group, cancellationToken);
            await _groupRepository.SaveChangesAsync(cancellationToken);

            var userDto = _mapper.Map<UserDto>(userToAdd);
            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding member to group");
            return StatusCode(500, "An error occurred while adding member to group");
        }
    }

    /// <summary>
    /// Update member permissions in group
    /// </summary>
    [HttpPut("members/{memberId:guid}/permissions")]
    public async Task<ActionResult<UserDto>> UpdateMemberPermissions(
        Guid memberId, 
        [FromBody] UpdateGroupMemberPermissionsRequest request, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            // Find member to update
            var member = group.Users.FirstOrDefault(u => u.Id == memberId);
            if (member == null)
            {
                return NotFound("Member not found in group");
            }

            // In a real app, update permissions based on request
            _logger.LogInformation("Updating permissions for member {MemberId} in group {GroupId}", memberId, group.Id);

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
    /// Remove member from group
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

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            // Find member to remove
            var member = group.Users.FirstOrDefault(u => u.Id == memberId);
            if (member == null)
            {
                return NotFound("Member not found in group");
            }

            // Remove user from group
            group.Users.Remove(member);
            group.UpdatedAt = DateTime.UtcNow;

            await _groupRepository.UpdateAsync(group, cancellationToken);
            await _groupRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing member from group");
            return StatusCode(500, "An error occurred while removing member from group");
        }
    }

    /// <summary>
    /// Get group preferences
    /// </summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<object>> GetGroupPreferences(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            // Return group preferences (in a real app, this would be stored)
            var preferences = new
            {
                groupId = group.Id,
                name = group.Name,
                allowPublicRecipes = true,
                defaultRecipeVisibility = "group",
                collaborativeEditing = true,
                memberInvitePermissions = "admin",
                recipeApprovalRequired = false
            };

            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving group preferences");
            return StatusCode(500, "An error occurred while retrieving group preferences");
        }
    }

    /// <summary>
    /// Update group preferences
    /// </summary>
    [HttpPut("preferences")]
    public async Task<ActionResult<object>> UpdateGroupPreferences([FromBody] Dictionary<string, object> preferences, CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            // In a real app, save preferences to database
            _logger.LogInformation("Updating preferences for group {GroupId}: {@Preferences}", group.Id, preferences);

            group.UpdatedAt = DateTime.UtcNow;
            await _groupRepository.UpdateAsync(group, cancellationToken);
            await _groupRepository.SaveChangesAsync(cancellationToken);

            return Ok(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating group preferences");
            return StatusCode(500, "An error occurred while updating group preferences");
        }
    }

    /// <summary>
    /// Get group storage information
    /// </summary>
    [HttpGet("storage")]
    public async Task<ActionResult<object>> GetGroupStorage(CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User not authenticated");
            }

            // Find user's group
            var group = await _groupRepository.FirstOrDefaultAsync(
                g => g.Users.Any(u => u.Id == userId), 
                cancellationToken);

            if (group == null)
            {
                return NotFound("User is not associated with any group");
            }

            // Calculate storage information
            var storage = new
            {
                groupId = group.Id,
                name = group.Name,
                storageUsed = CalculateGroupStorageUsed(group),
                storageLimit = GetGroupStorageLimit(group),
                usagePercentage = CalculateStoragePercentage(group),
                breakdown = new
                {
                    recipes = "1.2 GB",
                    images = "800 MB",
                    backups = "500 MB"
                },
                memberCount = group.Users.Count,
                lastCalculated = DateTime.UtcNow
            };

            return Ok(storage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving group storage information");
            return StatusCode(500, "An error occurred while retrieving group storage information");
        }
    }

    /// <summary>
    /// Calculate storage used by group
    /// </summary>
    private static string CalculateGroupStorageUsed(Group group)
    {
        // In a real implementation, this would calculate actual storage usage
        var estimatedMB = group.Users.Count * 50 + group.Users.Sum(u => u.Recipes.Count) * 5;
        return estimatedMB > 1024 ? $"{estimatedMB / 1024.0:F1} GB" : $"{estimatedMB} MB";
    }

    /// <summary>
    /// Get storage limit for group
    /// </summary>
    private static string GetGroupStorageLimit(Group group)
    {
        // In a real implementation, this would be based on group plan/settings
        return group.Users.Count <= 10 ? "5 GB" : "20 GB";
    }

    /// <summary>
    /// Calculate storage usage percentage
    /// </summary>
    private static int CalculateStoragePercentage(Group group)
    {
        // Simple calculation based on user count and recipes
        var estimatedUsage = group.Users.Count * 5 + group.Users.Sum(u => u.Recipes.Count) * 2;
        var limit = group.Users.Count <= 10 ? 100 : 400; // Simplified limit calculation
        return Math.Min(100, (estimatedUsage * 100) / limit);
    }
}

/// <summary>
/// Request DTO for adding member to group
/// </summary>
public class AddGroupMemberRequest
{
    public string Email { get; set; } = string.Empty;
    public bool Admin { get; set; } = false;
}

/// <summary>
/// Request DTO for updating group member permissions
/// </summary>
public class UpdateGroupMemberPermissionsRequest
{
    public Dictionary<string, object> Permissions { get; set; } = new();
}
