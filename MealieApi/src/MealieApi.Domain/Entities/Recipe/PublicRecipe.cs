using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Recipe;

/// <summary>
/// Public recipe implementation for TPH - recipes that can be shared publicly
/// </summary>
public class PublicRecipe : Recipe
{
    public PublicRecipe()
    {
        RecipeType = RecipeType.Public;
    }
    
    // Public recipe specific properties
    public bool IsPublished { get; set; } = false;
    
    public DateTime? PublishedAt { get; set; }
    
    public int ViewCount { get; set; } = 0;
    
    public int ShareCount { get; set; } = 0;
    
    public string? PublicUrl { get; set; }
    
    public bool AllowComments { get; set; } = true;
    
    public bool AllowRating { get; set; } = true;
    
    public string? License { get; set; } // Creative Commons, etc.
}
