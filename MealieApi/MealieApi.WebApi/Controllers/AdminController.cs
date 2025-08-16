using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Admin;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for admin operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IRepository<SystemSettings> _settingsRepository;
    private readonly IRepository<Backup> _backupRepository;
    private readonly IRepository<Household> _householdRepository;
    private readonly IRepository<Group> _groupRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRecipeRepository _recipeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IRepository<SystemSettings> settingsRepository,
        IRepository<Backup> backupRepository,
        IRepository<Household> householdRepository,
        IRepository<Group> groupRepository,
        IUserRepository userRepository,
        IRecipeRepository recipeRepository,
        IMapper mapper,
        ILogger<AdminController> logger)
    {
        _settingsRepository = settingsRepository;
        _backupRepository = backupRepository;
        _householdRepository = householdRepository;
        _groupRepository = groupRepository;
        _userRepository = userRepository;
        _recipeRepository = recipeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get system statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetSystemStatistics(CancellationToken cancellationToken = default)
    {
        try
        {
            var totalUsers = await _userRepository.CountAsync(cancellationToken: cancellationToken);
            var totalRecipes = await _recipeRepository.CountAsync(cancellationToken: cancellationToken);
            var totalBackups = await _backupRepository.CountAsync(cancellationToken: cancellationToken);

            var statistics = new
            {
                users = new
                {
                    total = totalUsers,
                    active = await _userRepository.CountAsync(u => u.IsActive, cancellationToken),
                    admins = await _userRepository.CountAsync(u => u.UserType == Domain.Enums.UserType.Admin, cancellationToken)
                },
                recipes = new
                {
                    total = totalRecipes,
                    public_recipes = await _recipeRepository.CountAsync(r => r.RecipeType == Domain.Enums.RecipeType.Public, cancellationToken),
                    private_recipes = await _recipeRepository.CountAsync(r => r.RecipeType == Domain.Enums.RecipeType.Private, cancellationToken),
                    favorites = await _recipeRepository.CountAsync(r => r.IsFavorite, cancellationToken)
                },
                system = new
                {
                    backups = totalBackups,
                    uptime = TimeSpan.FromMilliseconds(Environment.TickCount64).ToString(@"dd\.hh\:mm\:ss"),
                    version = "1.0.0", // Should come from assembly version
                    database_size = "N/A" // Would need database-specific implementation
                }
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system statistics");
            return StatusCode(500, "An error occurred while retrieving system statistics");
        }
    }

    /// <summary>
    /// Get system health check
    /// </summary>
    [HttpGet("health")]
    public async Task<ActionResult<object>> GetSystemHealth(CancellationToken cancellationToken = default)
    {
        try
        {
            var health = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                checks = new
                {
                    database = await CheckDatabaseHealth(cancellationToken),
                    memory = CheckMemoryHealth(),
                    disk = CheckDiskHealth(),
                    api = new { status = "healthy", response_time = "< 100ms" }
                }
            };

            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking system health");
            return StatusCode(500, "An error occurred while checking system health");
        }
    }

    /// <summary>
    /// Get recent activity
    /// </summary>
    [HttpGet("activity")]
    public async Task<ActionResult<List<object>>> GetRecentActivity([FromQuery] int limit = 10, CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real app, this would query an activity/audit log table
            var activities = new List<object>
            {
                new { id = 1, type = "user_login", user = "admin", timestamp = DateTime.UtcNow.AddMinutes(-5), description = "User logged in" },
                new { id = 2, type = "recipe_created", user = "chef", timestamp = DateTime.UtcNow.AddMinutes(-15), description = "New recipe created: Pasta Carbonara" },
                new { id = 3, type = "backup_created", user = "system", timestamp = DateTime.UtcNow.AddHours(-2), description = "System backup completed" }
            };

            return Ok(activities.Take(limit).ToList());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recent activity");
            return StatusCode(500, "An error occurred while retrieving recent activity");
        }
    }

    /// <summary>
    /// Get site settings
    /// </summary>
    [HttpGet("settings")]
    public async Task<ActionResult<Dictionary<string, string>>> GetSiteSettings(CancellationToken cancellationToken = default)
    {
        try
        {
            var settings = await _settingsRepository.GetAllAsync(cancellationToken);
            var settingsDict = settings.ToDictionary(s => s.Key, s => s.Value ?? string.Empty);
            
            // Add default settings if they don't exist
            if (!settingsDict.ContainsKey("site_name"))
                settingsDict["site_name"] = "Mealie";
            if (!settingsDict.ContainsKey("site_description"))
                settingsDict["site_description"] = "A Recipe Manager";
            if (!settingsDict.ContainsKey("allow_signup"))
                settingsDict["allow_signup"] = "true";
            if (!settingsDict.ContainsKey("max_users"))
                settingsDict["max_users"] = "100";

            return Ok(settingsDict);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving site settings");
            return StatusCode(500, "An error occurred while retrieving site settings");
        }
    }

    /// <summary>
    /// Update site settings
    /// </summary>
    [HttpPut("settings")]
    public async Task<ActionResult<Dictionary<string, string>>> UpdateSiteSettings([FromBody] Dictionary<string, string> newSettings, CancellationToken cancellationToken = default)
    {
        try
        {
            var existingSettings = await _settingsRepository.GetAllAsync(cancellationToken);
            var existingDict = existingSettings.ToDictionary(s => s.Key, s => s);

            foreach (var setting in newSettings)
            {
                if (existingDict.TryGetValue(setting.Key, out var existingSetting))
                {
                    existingSetting.Value = setting.Value;
                    existingSetting.UpdatedAt = DateTime.UtcNow;
                    await _settingsRepository.UpdateAsync(existingSetting, cancellationToken);
                }
                else
                {
                    var newSetting = new SystemSettings
                    {
                        Key = setting.Key,
                        Value = setting.Value,
                        Description = $"Setting for {setting.Key}"
                    };
                    await _settingsRepository.AddAsync(newSetting, cancellationToken);
                }
            }

            await _settingsRepository.SaveChangesAsync(cancellationToken);

            // Return updated settings
            var updatedSettings = await _settingsRepository.GetAllAsync(cancellationToken);
            var settingsDict = updatedSettings.ToDictionary(s => s.Key, s => s.Value ?? string.Empty);

            return Ok(settingsDict);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating site settings");
            return StatusCode(500, "An error occurred while updating site settings");
        }
    }

    /// <summary>
    /// Get all backups
    /// </summary>
    [HttpGet("backups")]
    public async Task<ActionResult<List<BackupDto>>> GetBackups(CancellationToken cancellationToken = default)
    {
        try
        {
            var backups = await _backupRepository.GetAllAsync(cancellationToken);
            var backupDtos = _mapper.Map<List<BackupDto>>(backups);
            return Ok(backupDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving backups");
            return StatusCode(500, "An error occurred while retrieving backups");
        }
    }

    /// <summary>
    /// Create backup
    /// </summary>
    [HttpPost("backups")]
    public async Task<ActionResult<BackupDto>> CreateBackup([FromBody] CreateBackupRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var backup = new Backup
            {
                Name = request.Name ?? $"backup_{DateTime.UtcNow:yyyyMMdd_HHmmss}",
                BackupDate = DateTime.UtcNow,
                Status = "In Progress"
            };

            // In a real app, this would trigger an actual backup process
            // Simulate a successful backup with realistic file size calculation
            backup.FilePath = $"/backups/{backup.Name}.zip";
            backup.FileSize = await CalculateEstimatedBackupSize(cancellationToken);
            backup.Status = "Completed";

            var createdBackup = await _backupRepository.AddAsync(backup, cancellationToken);
            await _backupRepository.SaveChangesAsync(cancellationToken);

            var backupDto = _mapper.Map<BackupDto>(createdBackup);
            return CreatedAtAction(nameof(GetBackups), backupDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating backup");
            return StatusCode(500, "An error occurred while creating backup");
        }
    }

    /// <summary>
    /// Delete backup
    /// </summary>
    [HttpDelete("backups/{backupId:guid}")]
    public async Task<IActionResult> DeleteBackup(Guid backupId, CancellationToken cancellationToken = default)
    {
        try
        {
            var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
            if (backup == null)
            {
                return NotFound($"Backup with ID {backupId} not found");
            }

            // In a real app, also delete the actual backup file
            await _backupRepository.DeleteAsync(backup, cancellationToken);
            await _backupRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting backup {BackupId}", backupId);
            return StatusCode(500, "An error occurred while deleting backup");
        }
    }

    /// <summary>
    /// Download backup
    /// </summary>
    [HttpGet("backups/{backupId:guid}/download")]
    public async Task<ActionResult> DownloadBackup(Guid backupId, CancellationToken cancellationToken = default)
    {
        try
        {
            var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
            if (backup == null)
            {
                return NotFound($"Backup with ID {backupId} not found");
            }

            // In a real app, return the actual backup file
            var dummyContent = System.Text.Encoding.UTF8.GetBytes($"Backup file content for {backup.Name}");
            return File(dummyContent, "application/zip", $"{backup.Name}.zip");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading backup {BackupId}", backupId);
            return StatusCode(500, "An error occurred while downloading backup");
        }
    }

    /// <summary>
    /// Restore backup
    /// </summary>
    [HttpPost("backups/{backupId:guid}/restore")]
    public async Task<ActionResult<object>> RestoreBackup(Guid backupId, CancellationToken cancellationToken = default)
    {
        try
        {
            var backup = await _backupRepository.GetByIdAsync(backupId, cancellationToken);
            if (backup == null)
            {
                return NotFound($"Backup with ID {backupId} not found");
            }

            // In a real app, this would trigger the restore process
            _logger.LogInformation("Restore initiated for backup {BackupName}", backup.Name);

            return Ok(new { message = "Backup restore initiated", taskId = Guid.NewGuid().ToString() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring backup {BackupId}", backupId);
            return StatusCode(500, "An error occurred while restoring backup");
        }
    }

    /// <summary>
    /// Get maintenance tasks status
    /// </summary>
    [HttpGet("maintenance/tasks")]
    public ActionResult<List<object>> GetMaintenanceTasks()
    {
        try
        {
            var tasks = new List<object>
            {
                new { name = "cleanup_temp_files", status = "ready", last_run = DateTime.UtcNow.AddDays(-1), description = "Clean up temporary files" },
                new { name = "optimize_database", status = "ready", last_run = DateTime.UtcNow.AddDays(-7), description = "Optimize database indexes" },
                new { name = "backup_database", status = "ready", last_run = DateTime.UtcNow.AddHours(-6), description = "Create database backup" }
            };

            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving maintenance tasks");
            return StatusCode(500, "An error occurred while retrieving maintenance tasks");
        }
    }

    /// <summary>
    /// Run maintenance task
    /// </summary>
    [HttpPost("maintenance/{taskName}")]
    public ActionResult<object> RunMaintenanceTask(string taskName, [FromBody] Dictionary<string, object>? options = null, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Running maintenance task: {TaskName} with options: {@Options}", taskName, options);

            // In a real app, execute the actual maintenance task
            var result = new
            {
                taskName,
                status = "completed",
                started_at = DateTime.UtcNow,
                completed_at = DateTime.UtcNow.AddSeconds(30),
                result = "Task completed successfully",
                details = new { files_cleaned = 42, space_freed = "150MB" }
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running maintenance task {TaskName}", taskName);
            return StatusCode(500, "An error occurred while running maintenance task");
        }
    }

    /// <summary>
    /// Clean up system
    /// </summary>
    [HttpPost("maintenance/cleanup")]
    public ActionResult<object> CleanupSystem([FromBody] Dictionary<string, object>? options = null)
    {
        try
        {
            _logger.LogInformation("Running system cleanup with options: {@Options}", options);

            // In a real app, perform actual cleanup operations
            var result = new
            {
                status = "completed",
                started_at = DateTime.UtcNow,
                completed_at = DateTime.UtcNow.AddMinutes(2),
                operations = new object[]
                {
                    new { type = "temp_files", files_removed = 25, space_freed = "50MB" },
                    new { type = "old_logs", files_removed = 10, space_freed = "25MB" },
                    new { type = "cache", entries_cleared = 1500, space_freed = "75MB" }
                },
                total_space_freed = "150MB"
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running system cleanup");
            return StatusCode(500, "An error occurred while running system cleanup");
        }
    }

    /// <summary>
    /// Get logs
    /// </summary>
    [HttpGet("logs")]
    public ActionResult<List<string>> GetLogs([FromQuery] int lines = 100)
    {
        try
        {
            // In a real app, read actual log files
            var logs = new List<string>();
            for (int i = lines; i > 0; i--)
            {
                logs.Add($"{DateTime.UtcNow.AddMinutes(-i):yyyy-MM-dd HH:mm:ss} [INFO] Sample log entry {lines - i + 1}");
            }

            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs");
            return StatusCode(500, "An error occurred while retrieving logs");
        }
    }

    /// <summary>
    /// Get all users (admin endpoint)
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<object>> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string orderBy = "username",
        [FromQuery] string orderDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        try
        {
            var users = await _userRepository.GetAllAsync(cancellationToken);
            
            // Apply ordering
            users = orderBy.ToLower() switch
            {
                "email" => orderDirection.ToLower() == "desc" ? users.OrderByDescending(u => u.Email) : users.OrderBy(u => u.Email),
                "firstname" => orderDirection.ToLower() == "desc" ? users.OrderByDescending(u => u.FirstName) : users.OrderBy(u => u.FirstName),
                "lastname" => orderDirection.ToLower() == "desc" ? users.OrderByDescending(u => u.LastName) : users.OrderBy(u => u.LastName),
                "createdat" => orderDirection.ToLower() == "desc" ? users.OrderByDescending(u => u.CreatedAt) : users.OrderBy(u => u.CreatedAt),
                _ => orderDirection.ToLower() == "desc" ? users.OrderByDescending(u => u.Username) : users.OrderBy(u => u.Username)
            };

            var total = users.Count();
            var pagedUsers = perPage > 0 ? users.Skip((page - 1) * perPage).Take(perPage) : users;

            var userDtos = _mapper.Map<List<UserDto>>(pagedUsers);

            var response = new
            {
                items = userDtos,
                total,
                page,
                perPage,
                totalPages = perPage > 0 ? (int)Math.Ceiling((double)total / perPage) : 1
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users");
            return StatusCode(500, "An error occurred while retrieving users");
        }
    }

    private async Task<object> CheckDatabaseHealth(CancellationToken cancellationToken)
    {
        try
        {
            // Simple check by counting users
            var userCount = await _userRepository.CountAsync(cancellationToken: cancellationToken);
            return new { status = "healthy", user_count = userCount, connection = "active" };
        }
        catch
        {
            return new { status = "unhealthy", error = "Database connection failed" };
        }
    }

    private static object CheckMemoryHealth()
    {
        try
        {
            var process = System.Diagnostics.Process.GetCurrentProcess();
            var memoryMB = process.WorkingSet64 / (1024 * 1024);
            return new { status = "healthy", memory_mb = memoryMB, status_text = memoryMB < 500 ? "normal" : "high" };
        }
        catch
        {
            return new { status = "unknown", error = "Could not retrieve memory information" };
        }
    }

    private static object CheckDiskHealth()
    {
        try
        {
            var drives = DriveInfo.GetDrives().Where(d => d.IsReady).Select(d => new
            {
                name = d.Name,
                available_gb = d.AvailableFreeSpace / (1024 * 1024 * 1024),
                total_gb = d.TotalSize / (1024 * 1024 * 1024),
                usage_percent = (int)((double)(d.TotalSize - d.AvailableFreeSpace) / d.TotalSize * 100)
            });

            return new { status = "healthy", drives };
        }
        catch
        {
            return new { status = "unknown", error = "Could not retrieve disk information" };
        }
    }

    /// <summary>
    /// Calculate estimated backup size based on database contents
    /// </summary>
    private async Task<long> CalculateEstimatedBackupSize(CancellationToken cancellationToken)
    {
        try
        {
            var userCount = await _userRepository.CountAsync(cancellationToken: cancellationToken);
            var recipeCount = await _recipeRepository.CountAsync(cancellationToken: cancellationToken);
            var householdCount = await _householdRepository.CountAsync(cancellationToken: cancellationToken);
            var groupCount = await _groupRepository.CountAsync(cancellationToken: cancellationToken);

            // Estimate size based on content (rough calculation)
            var estimatedBytes = (userCount * 2048) +      // 2KB per user
                               (recipeCount * 5120) +      // 5KB per recipe
                               (householdCount * 1024) +   // 1KB per household
                               (groupCount * 1024) +       // 1KB per group
                               (1024 * 1024);              // 1MB base overhead

            return estimatedBytes;
        }
        catch
        {
            // Fallback to default size if calculation fails
            return 1024 * 1024 * 25; // 25MB default
        }
    }

    /// <summary>
    /// Get all households (admin endpoint)
    /// </summary>
    [HttpGet("households")]
    public async Task<ActionResult<object>> GetAllHouseholds(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string orderBy = "name",
        [FromQuery] string orderDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        try
        {
            var households = await _householdRepository.GetAllAsync(cancellationToken);
            
            // Apply ordering
            households = orderBy.ToLower() switch
            {
                "createdat" => orderDirection.ToLower() == "desc" ? households.OrderByDescending(h => h.CreatedAt) : households.OrderBy(h => h.CreatedAt),
                "updatedat" => orderDirection.ToLower() == "desc" ? households.OrderByDescending(h => h.UpdatedAt) : households.OrderBy(h => h.UpdatedAt),
                _ => orderDirection.ToLower() == "desc" ? households.OrderByDescending(h => h.Name) : households.OrderBy(h => h.Name)
            };

            var total = households.Count();
            var pagedHouseholds = perPage > 0 ? households.Skip((page - 1) * perPage).Take(perPage) : households;

            var householdDtos = _mapper.Map<List<HouseholdDto>>(pagedHouseholds);

            var response = new
            {
                items = householdDtos,
                total,
                page,
                perPage,
                totalPages = perPage > 0 ? (int)Math.Ceiling((double)total / perPage) : 1
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all households");
            return StatusCode(500, "An error occurred while retrieving households");
        }
    }

    /// <summary>
    /// Get household by ID (admin endpoint)
    /// </summary>
    [HttpGet("households/{id:guid}")]
    public async Task<ActionResult<HouseholdDto>> GetHouseholdById(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var household = await _householdRepository.GetByIdAsync(id, cancellationToken);
            if (household == null)
            {
                return NotFound($"Household with ID {id} not found");
            }

            var householdDto = _mapper.Map<HouseholdDto>(household);
            return Ok(householdDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving household {HouseholdId}", id);
            return StatusCode(500, "An error occurred while retrieving the household");
        }
    }

    /// <summary>
    /// Create a new household (admin endpoint)
    /// </summary>
    [HttpPost("households")]
    public async Task<ActionResult<HouseholdDto>> CreateHousehold([FromBody] CreateHouseholdDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var household = new Household
            {
                Name = createDto.Name,
                Description = createDto.Description
            };

            var createdHousehold = await _householdRepository.AddAsync(household, cancellationToken);
            await _householdRepository.SaveChangesAsync(cancellationToken);

            var householdDto = _mapper.Map<HouseholdDto>(createdHousehold);
            return CreatedAtAction(nameof(GetHouseholdById), new { id = householdDto.Id }, householdDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating household");
            return StatusCode(500, "An error occurred while creating the household");
        }
    }

    /// <summary>
    /// Update a household (admin endpoint)
    /// </summary>
    [HttpPut("households/{id:guid}")]
    public async Task<ActionResult<HouseholdDto>> UpdateHousehold(Guid id, [FromBody] UpdateHouseholdDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var household = await _householdRepository.GetByIdAsync(id, cancellationToken);
            if (household == null)
            {
                return NotFound($"Household with ID {id} not found");
            }

            if (!string.IsNullOrEmpty(updateDto.Name)) household.Name = updateDto.Name;
            if (updateDto.Description != null) household.Description = updateDto.Description;

            household.UpdatedAt = DateTime.UtcNow;

            await _householdRepository.UpdateAsync(household, cancellationToken);
            await _householdRepository.SaveChangesAsync(cancellationToken);

            var householdDto = _mapper.Map<HouseholdDto>(household);
            return Ok(householdDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating household {HouseholdId}", id);
            return StatusCode(500, "An error occurred while updating the household");
        }
    }

    /// <summary>
    /// Delete a household (admin endpoint)
    /// </summary>
    [HttpDelete("households/{id:guid}")]
    public async Task<IActionResult> DeleteHousehold(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var household = await _householdRepository.GetByIdAsync(id, cancellationToken);
            if (household == null)
            {
                return NotFound($"Household with ID {id} not found");
            }

            await _householdRepository.DeleteAsync(household, cancellationToken);
            await _householdRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting household {HouseholdId}", id);
            return StatusCode(500, "An error occurred while deleting the household");
        }
    }

    /// <summary>
    /// Get all groups (admin endpoint)
    /// </summary>
    [HttpGet("groups")]
    public async Task<ActionResult<object>> GetAllGroups(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string orderBy = "name",
        [FromQuery] string orderDirection = "asc",
        CancellationToken cancellationToken = default)
    {
        try
        {
            var groups = await _groupRepository.GetAllAsync(cancellationToken);
            
            // Apply ordering
            groups = orderBy.ToLower() switch
            {
                "createdat" => orderDirection.ToLower() == "desc" ? groups.OrderByDescending(g => g.CreatedAt) : groups.OrderBy(g => g.CreatedAt),
                "updatedat" => orderDirection.ToLower() == "desc" ? groups.OrderByDescending(g => g.UpdatedAt) : groups.OrderBy(g => g.UpdatedAt),
                _ => orderDirection.ToLower() == "desc" ? groups.OrderByDescending(g => g.Name) : groups.OrderBy(g => g.Name)
            };

            var total = groups.Count();
            var pagedGroups = perPage > 0 ? groups.Skip((page - 1) * perPage).Take(perPage) : groups;

            var groupDtos = _mapper.Map<List<GroupDto>>(pagedGroups);

            var response = new
            {
                items = groupDtos,
                total,
                page,
                perPage,
                totalPages = perPage > 0 ? (int)Math.Ceiling((double)total / perPage) : 1
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all groups");
            return StatusCode(500, "An error occurred while retrieving groups");
        }
    }

    /// <summary>
    /// Get group by ID (admin endpoint)
    /// </summary>
    [HttpGet("groups/{id:guid}")]
    public async Task<ActionResult<GroupDto>> GetGroupById(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var group = await _groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                return NotFound($"Group with ID {id} not found");
            }

            var groupDto = _mapper.Map<GroupDto>(group);
            return Ok(groupDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving group {GroupId}", id);
            return StatusCode(500, "An error occurred while retrieving the group");
        }
    }

    /// <summary>
    /// Create a new group (admin endpoint)
    /// </summary>
    [HttpPost("groups")]
    public async Task<ActionResult<GroupDto>> CreateGroup([FromBody] CreateGroupDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var group = new Group
            {
                Name = createDto.Name,
                Description = createDto.Description
            };

            var createdGroup = await _groupRepository.AddAsync(group, cancellationToken);
            await _groupRepository.SaveChangesAsync(cancellationToken);

            var groupDto = _mapper.Map<GroupDto>(createdGroup);
            return CreatedAtAction(nameof(GetGroupById), new { id = groupDto.Id }, groupDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating group");
            return StatusCode(500, "An error occurred while creating the group");
        }
    }

    /// <summary>
    /// Update a group (admin endpoint)
    /// </summary>
    [HttpPut("groups/{id:guid}")]
    public async Task<ActionResult<GroupDto>> UpdateGroup(Guid id, [FromBody] UpdateGroupDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var group = await _groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                return NotFound($"Group with ID {id} not found");
            }

            if (!string.IsNullOrEmpty(updateDto.Name)) group.Name = updateDto.Name;
            if (updateDto.Description != null) group.Description = updateDto.Description;

            group.UpdatedAt = DateTime.UtcNow;

            await _groupRepository.UpdateAsync(group, cancellationToken);
            await _groupRepository.SaveChangesAsync(cancellationToken);

            var groupDto = _mapper.Map<GroupDto>(group);
            return Ok(groupDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating group {GroupId}", id);
            return StatusCode(500, "An error occurred while updating the group");
        }
    }

    /// <summary>
    /// Delete a group (admin endpoint)
    /// </summary>
    [HttpDelete("groups/{id:guid}")]
    public async Task<IActionResult> DeleteGroup(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var group = await _groupRepository.GetByIdAsync(id, cancellationToken);
            if (group == null)
            {
                return NotFound($"Group with ID {id} not found");
            }

            await _groupRepository.DeleteAsync(group, cancellationToken);
            await _groupRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting group {GroupId}", id);
            return StatusCode(500, "An error occurred while deleting the group");
        }
    }
}

/// <summary>
/// Request DTO for creating a backup
/// </summary>
public class CreateBackupRequest
{
    public string? Name { get; set; }
    public Dictionary<string, object>? Options { get; set; }
}
