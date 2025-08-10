using MealieApi.Domain.Enums;
using MealieApi.Domain.Entities.Users;

namespace MealieApi.Domain.Entities.Organization;

/// <summary>
/// Group implementation for TPH - general purpose groups
/// </summary>
public class Group : Organization
{
    public Group()
    {
        OrganizationType = OrganizationType.Group;
        MaxMembers = 50; // Groups can have more members
    }
    
    // Group-specific properties
    public string? GroupType { get; set; } // "cooking-club", "meal-prep", etc.
    
    public bool IsPublic { get; set; } = false;
    
    public string? JoinCode { get; set; }
    
    public DateTime? JoinCodeExpiresAt { get; set; }
    
    public bool RequiresApproval { get; set; } = true;
    
    public string? Tags { get; set; } // JSON array of interest tags
    
    // Convenience property to match controller expectations
    public virtual ICollection<User> Users => Members;
}
