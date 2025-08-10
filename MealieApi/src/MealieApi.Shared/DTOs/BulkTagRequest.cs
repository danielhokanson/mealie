using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for bulk tag operations
/// </summary>
public class BulkTagRequest
{
    [Required]
    [MinLength(1)]
    public List<Guid> RecipeIds { get; set; } = new();

    [Required]
    public Guid TagId { get; set; }

    [Required]
    public string Action { get; set; } = string.Empty; // "add" or "remove"
}
