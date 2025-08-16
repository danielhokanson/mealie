using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Recipe;

/// <summary>
/// Private recipe implementation for TPH - recipes that are private to the user
/// </summary>
public class PrivateRecipe : Recipe
{
    public PrivateRecipe()
    {
        RecipeType = RecipeType.Private;
    }
    
    // Private recipe specific properties
    public string? PersonalNotes { get; set; }
    
    public decimal? PersonalRating { get; set; }
    
    public string? Source { get; set; } // Where the recipe came from
    
    public bool IsArchived { get; set; } = false;
    
    public DateTime? ArchivedAt { get; set; }
    
    public string? FamilyOrigin { get; set; } // Family recipe information
    
    public int TimesCooked { get; set; } = 0;
}
