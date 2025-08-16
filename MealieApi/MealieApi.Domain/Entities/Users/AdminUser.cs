using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Users;

/// <summary>
/// Admin user implementation for TPH
/// </summary>
public class AdminUser : User
{
    public AdminUser()
    {
        UserType = UserType.Admin;
    }
    
    // Admin-specific properties
    public bool CanManageUsers { get; set; } = true;
    
    public bool CanManageSystem { get; set; } = true;
    
    public bool CanViewAuditLogs { get; set; } = true;
    
    public DateTime? LastAdminActionAt { get; set; }
    
    public string? AdminPermissions { get; set; } // JSON string for flexible permissions
}
