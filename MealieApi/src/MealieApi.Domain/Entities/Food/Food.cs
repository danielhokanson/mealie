using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Food;

/// <summary>
/// Food/Ingredient entity
/// </summary>
public class Food : AuditableEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? Category { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Whether this is a commonly used food item
    /// </summary>
    public bool IsCommon { get; set; } = false;
    
    /// <summary>
    /// Additional properties stored as JSON
    /// </summary>
    public string? Properties { get; set; }
}
