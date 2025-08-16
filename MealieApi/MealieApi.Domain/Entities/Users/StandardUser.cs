using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Users;

/// <summary>
/// Standard user implementation for TPH
/// </summary>
public class StandardUser : User
{
    public StandardUser()
    {
        UserType = UserType.Standard;
    }
    
    // Standard user specific properties
    public int? DailyCalorieGoal { get; set; }
    
    public string? DietaryRestrictions { get; set; }
    
    public string? PreferredUnits { get; set; } = "metric";
}
