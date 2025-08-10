using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for merging units
/// </summary>
public class MergeUnitsRequest
{
    [Required]
    public Guid FromUnitId { get; set; }
    
    [Required]
    public Guid ToUnitId { get; set; }
}
