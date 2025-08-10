using MealieApi.Domain.Enums;

namespace MealieApi.Domain.Entities.Content;

/// <summary>
/// Tag implementation for TPH - recipe tags
/// </summary>
public class Tag : ContentItem
{
    public Tag()
    {
        ContentItemType = ContentItemType.Tag;
    }
    
    // Tag-specific properties
    public string? TagGroup { get; set; } // "dietary", "cuisine", "difficulty", etc.
    
    public bool IsSystemTag { get; set; } = false; // System vs user-created tags
    
    public int UsageCount { get; set; } = 0; // How many recipes use this tag
    
    public bool IsPopular { get; set; } = false; // Calculated field for popular tags
    
    public string? Aliases { get; set; } // JSON array of alternative names
}
