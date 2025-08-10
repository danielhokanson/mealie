using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for creating a recipe comment
/// </summary>
public class CreateCommentRequest
{
    [Required]
    [StringLength(1000)]
    public string Text { get; set; } = string.Empty;

    [Range(1, 5)]
    public int? Rating { get; set; }
}
