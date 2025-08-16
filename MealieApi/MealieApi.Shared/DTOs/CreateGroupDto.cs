using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for creating a new group
/// </summary>
public class CreateGroupDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }
}
