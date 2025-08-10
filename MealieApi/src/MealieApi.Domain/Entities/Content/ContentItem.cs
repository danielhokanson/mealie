using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Content;

/// <summary>
/// Base ContentItem entity for TPH (Table-Per-Hierarchy) implementation
/// </summary>
public abstract class ContentItem : AuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(100)]
    public string? Slug { get; set; }
    
    public string? Color { get; set; }
    
    public string? Icon { get; set; }
    
    public int SortOrder { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Discriminator property for TPH
    /// </summary>
    [Required]
    public ContentItemType ContentItemType { get; set; }
    
    // Navigation properties
    public virtual ICollection<Recipe.Recipe> Recipes { get; set; } = new List<Recipe.Recipe>();
}
