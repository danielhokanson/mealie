namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for updating user settings (profile and preferences)
/// </summary>
public class UpdateUserSettingsRequest
{
    public UpdateUserDto? Profile { get; set; }
    public UpdateUserPreferencesDto? Preferences { get; set; }
}
