using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Unit;

/// <summary>
/// Measurement unit entity
/// </summary>
public class Unit : AuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Abbreviation { get; set; }
    
    [StringLength(300)]
    public string? Description { get; set; }
    
    [StringLength(50)]
    public string? Category { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Conversion factor to base unit (if applicable)
    /// </summary>
    public decimal? ConversionFactor { get; set; }
}