using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for user preferences
/// </summary>
public class UserPreferencesDto
{
    public Guid UserId { get; set; }
    public bool DarkMode { get; set; } = false;
    public string Language { get; set; } = "en-US";
    public string Theme { get; set; } = "default";
    public bool EnableNotifications { get; set; } = true;
    public string? DefaultUnitSystem { get; set; }
}
