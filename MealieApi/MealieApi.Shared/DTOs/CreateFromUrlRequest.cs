using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for creating a recipe from URL
/// </summary>
public class CreateFromUrlRequest
{
    [Required]
    [Url]
    public string Url { get; set; } = string.Empty;

    public bool IncludeNutrition { get; set; } = true;
}
