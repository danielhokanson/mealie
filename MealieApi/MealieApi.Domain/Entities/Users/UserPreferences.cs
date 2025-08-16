using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Users;

/// <summary>
/// User preferences entity
/// </summary>
public class UserPreferences : BaseEntity
{
    // Foreign key
    public Guid UserId { get; set; }
    
    [StringLength(10)]
    public string? Language { get; set; } = "en";
    
    [StringLength(50)]
    public string? Theme { get; set; } = "light";
    
    [StringLength(100)]
    public string? TimeZone { get; set; }
    
    [StringLength(20)]
    public string? DateFormat { get; set; }
    
    [StringLength(20)]
    public string? TimeFormat { get; set; }
    
    public bool EmailNotifications { get; set; } = true;
    
    public bool PushNotifications { get; set; } = true;
    
    public int DefaultServings { get; set; } = 4;
    
    /// <summary>
    /// Whether to use dark mode
    /// </summary>
    public bool DarkMode { get; set; } = false;
    
    /// <summary>
    /// Whether to enable notifications
    /// </summary>
    public bool EnableNotifications { get; set; } = true;
    
    /// <summary>
    /// Default unit system (metric, imperial)
    /// </summary>
    [StringLength(20)]
    public string? DefaultUnitSystem { get; set; } = "metric";
    
    /// <summary>
    /// Additional preferences stored as JSON
    /// </summary>
    public string? AdditionalSettings { get; set; }
    
    // Navigation property
    public virtual User User { get; set; } = null!;
}
