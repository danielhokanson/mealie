using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for updating a household
/// </summary>
public class UpdateHouseholdDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }
}
