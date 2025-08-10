using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Content;

/// <summary>
/// Category implementation for TPH - recipe categories
/// </summary>
public class Category : ContentItem
{
    public Category()
    {
        ContentItemType = ContentItemType.Category;
    }
    
    // Category-specific properties
    public Guid? ParentCategoryId { get; set; }
    
    public virtual Category? ParentCategory { get; set; }
    
    public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();
    
    public bool IsMainCategory { get; set; } = false;
    
    public string? ImageUrl { get; set; }
    
    public int RecipeCount { get; set; } = 0; // Denormalized for performance
}
