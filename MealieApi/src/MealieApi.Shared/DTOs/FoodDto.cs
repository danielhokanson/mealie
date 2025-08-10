namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for Food/Ingredient entities
/// </summary>
public class FoodDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public bool IsCommon { get; set; }
    public string? Properties { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating foods
/// </summary>
public class CreateFoodDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsCommon { get; set; } = false;
    public string? Properties { get; set; }
}

/// <summary>
/// DTO for updating foods
/// </summary>
public class UpdateFoodDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsCommon { get; set; }
    public string? Properties { get; set; }
}
