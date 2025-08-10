using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Content;

/// <summary>
/// Tool implementation for TPH - cooking tools/equipment
/// </summary>
public class Tool : ContentItem
{
    public Tool()
    {
        ContentItemType = ContentItemType.Tool;
    }
    
    // Tool-specific properties
    public string? ToolType { get; set; } // "appliance", "utensil", "cookware", etc.
    
    public bool IsEssential { get; set; } = false; // Essential vs optional tools
    
    public string? Brand { get; set; }
    
    public string? Model { get; set; }
    
    public decimal? EstimatedPrice { get; set; }
    
    public string? AffiliateUrl { get; set; }
    
    public string? Alternatives { get; set; } // JSON array of alternative tools
    
    public int RecipeCount { get; set; } = 0; // How many recipes use this tool
}
