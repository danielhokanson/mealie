using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for bulk category operations
/// </summary>
public class BulkCategoryRequest
{
    [Required]
    [MinLength(1)]
    public List<Guid> RecipeIds { get; set; } = new();

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    public string Action { get; set; } = string.Empty; // "add" or "remove"
}
