using MealieApi.Domain.Enums;
using MealieApi.Domain.Entities.Users;

namespace MealieApi.Domain.Entities.Organization;

/// <summary>
/// Household implementation for TPH - family/household groups
/// </summary>
public class Household : Organization
{
    public Household()
    {
        OrganizationType = OrganizationType.Household;
        MaxMembers = 10; // Households are typically smaller
    }
    
    // Household-specific properties
    public string? Address { get; set; }
    
    public string? TimeZone { get; set; }
    
    public string? PreferredUnits { get; set; } = "metric";
    
    public decimal? WeeklyBudget { get; set; }
    
    public string? DietaryRestrictions { get; set; } // JSON array of restrictions
    
    public int? DefaultServings { get; set; } = 4;
    
    public string? ShoppingDay { get; set; } // Day of week for shopping
    
    // Convenience property to match controller expectations
    public virtual ICollection<User> Users => Members;
}
