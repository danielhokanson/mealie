namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for updating user preferences
/// </summary>
public class UpdateUserPreferencesDto
{
    public bool? DarkMode { get; set; }
    public string? Language { get; set; }
    public string? Theme { get; set; }
    public bool? EnableNotifications { get; set; }
    public string? DefaultUnitSystem { get; set; }
}
