using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Organization;

namespace MealieApi.Domain.Entities.Label;

/// <summary>
/// Multi-purpose label entity for shopping lists and other categorization
/// </summary>
public class Label : AuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(300)]
    public string? Description { get; set; }
    
    [StringLength(7)] // Hex color code
    public string? Color { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Sort order for display purposes
    /// </summary>
    public int SortOrder { get; set; } = 0;
    
    // Foreign keys
    public Guid? OrganizationId { get; set; }
    
    // Navigation properties
    public virtual Organization.Organization? Organization { get; set; }
}
