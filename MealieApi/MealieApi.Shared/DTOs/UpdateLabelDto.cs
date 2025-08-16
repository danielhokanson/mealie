using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for updating a label
/// </summary>
public class UpdateLabelDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(255)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? Color { get; set; }

    public int? SortOrder { get; set; }
}
