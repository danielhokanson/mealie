using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Enums;
using MealieApi.Domain.Entities.Users;

namespace MealieApi.Domain.Entities.Organization;

/// <summary>
/// Base Organization entity for TPH (Table-Per-Hierarchy) implementation
/// </summary>
public abstract class Organization : AuditableEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? Image { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int MaxMembers { get; set; } = 10;
    
    public string? Settings { get; set; } // JSON string for flexible settings
    
    /// <summary>
    /// Discriminator property for TPH
    /// </summary>
    [Required]
    public OrganizationType OrganizationType { get; set; }
    
    // Navigation properties
    public virtual ICollection<User> Members { get; set; } = new List<User>();
    public virtual ICollection<Recipe.Recipe> Recipes { get; set; } = new List<Recipe.Recipe>();
    public virtual ICollection<ShoppingList.ShoppingList> ShoppingLists { get; set; } = new List<ShoppingList.ShoppingList>();
}
