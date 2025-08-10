using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Admin;

/// <summary>
/// System settings entity for admin configuration
/// </summary>
public class SystemSettings : AuditableEntity
{
    [Required]
    [StringLength(100)]
    public string Key { get; set; } = string.Empty;
    
    public string? Value { get; set; }
    
    [StringLength(300)]
    public string? Description { get; set; }
    
    [StringLength(50)]
    public string? Category { get; set; }
    
    public bool IsPublic { get; set; } = false;
}
