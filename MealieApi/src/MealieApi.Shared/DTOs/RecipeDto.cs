using MealieApi.Domain.Enums;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Data Transfer Object for Recipe entities
/// </summary>
public class RecipeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public string? Ingredients { get; set; }
    public int? PrepTimeMinutes { get; set; }
    public int? CookTimeMinutes { get; set; }
    public int? TotalTimeMinutes { get; set; }
    public int? Servings { get; set; }
    public string? Image { get; set; }
    public string? Slug { get; set; }
    public decimal? Rating { get; set; }
    public int RatingCount { get; set; }
    public bool IsFavorite { get; set; }
    public DateTime? LastMadeAt { get; set; }
    public RecipeType RecipeType { get; set; }
    public Guid UserId { get; set; }
    public UserDto? User { get; set; }
    public List<CategoryDto> Categories { get; set; } = new();
    public List<TagDto> Tags { get; set; } = new();
    public List<ToolDto> Tools { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new recipe
/// </summary>
public class CreateRecipeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public string? Ingredients { get; set; }
    public int? PrepTimeMinutes { get; set; }
    public int? CookTimeMinutes { get; set; }
    public int? Servings { get; set; }
    public RecipeType RecipeType { get; set; } = RecipeType.Private;
    public List<Guid> CategoryIds { get; set; } = new();
    public List<Guid> TagIds { get; set; } = new();
    public List<Guid> ToolIds { get; set; } = new();
}

/// <summary>
/// DTO for updating a recipe
/// </summary>
public class UpdateRecipeDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Instructions { get; set; }
    public string? Ingredients { get; set; }
    public int? PrepTimeMinutes { get; set; }
    public int? CookTimeMinutes { get; set; }
    public int? Servings { get; set; }
    public bool? IsFavorite { get; set; }
    public List<Guid>? CategoryIds { get; set; }
    public List<Guid>? TagIds { get; set; }
    public List<Guid>? ToolIds { get; set; }
}
