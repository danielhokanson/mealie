using MealieApi.Domain.Enums;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Base DTO for content items (Categories, Tags, Tools)
/// </summary>
public class ContentItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Slug { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public ContentItemType ContentItemType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for Category entities
/// </summary>
public class CategoryDto : ContentItemDto
{
    public Guid? ParentCategoryId { get; set; }
    public CategoryDto? ParentCategory { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = new();
    public bool IsMainCategory { get; set; }
    public string? ImageUrl { get; set; }
    public int RecipeCount { get; set; }
}

/// <summary>
/// DTO for Tag entities
/// </summary>
public class TagDto : ContentItemDto
{
    public string? TagGroup { get; set; }
    public bool IsSystemTag { get; set; }
    public int UsageCount { get; set; }
    public bool IsPopular { get; set; }
    public List<string> Aliases { get; set; } = new();
}

/// <summary>
/// DTO for Tool entities
/// </summary>
public class ToolDto : ContentItemDto
{
    public string? ToolType { get; set; }
    public bool IsEssential { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public decimal? EstimatedPrice { get; set; }
    public string? AffiliateUrl { get; set; }
    public List<string> Alternatives { get; set; } = new();
    public int RecipeCount { get; set; }
}

/// <summary>
/// DTO for creating content items
/// </summary>
public class CreateContentItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; } = 0;
    public ContentItemType ContentItemType { get; set; }
}

/// <summary>
/// DTO for updating content items
/// </summary>
public class UpdateContentItemDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int? SortOrder { get; set; }
    public bool? IsActive { get; set; }
}
