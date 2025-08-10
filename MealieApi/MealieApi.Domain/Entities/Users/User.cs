using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Users;

/// <summary>
/// Base User entity for TPH (Table-Per-Hierarchy) implementation
/// </summary>
public abstract class User : AuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? FirstName { get; set; }
    
    [StringLength(100)]
    public string? LastName { get; set; }
    
    public string? Avatar { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool EmailVerified { get; set; } = false;
    
    public DateTime? LastLoginAt { get; set; }
    
    /// <summary>
    /// Discriminator property for TPH
    /// </summary>
    [Required]
    public UserType UserType { get; set; }
    
    // Navigation properties
    public virtual UserPreferences? Preferences { get; set; }
    public virtual ICollection<Recipe.Recipe> Recipes { get; set; } = new List<Recipe.Recipe>();
    public virtual ICollection<ShoppingList.ShoppingList> ShoppingLists { get; set; } = new List<ShoppingList.ShoppingList>();
    public virtual ICollection<Comment.Comment> Comments { get; set; } = new List<Comment.Comment>();
    public virtual ICollection<Timeline.TimelineEvent> TimelineEvents { get; set; } = new List<Timeline.TimelineEvent>();
}
