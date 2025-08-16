using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Label;

namespace MealieApi.Domain.Entities.ShoppingList;

/// <summary>
/// Shopping list item entity
/// </summary>
public class ShoppingListItem : BaseEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string? Note { get; set; }
    
    public decimal? Quantity { get; set; }
    
    public string? Unit { get; set; }
    
    public bool IsChecked { get; set; } = false;
    
    public DateTime? CheckedAt { get; set; }
    
    public decimal? EstimatedPrice { get; set; }
    
    public decimal? ActualPrice { get; set; }
    
    public int SortOrder { get; set; } = 0;
    
    // Foreign keys
    public Guid ShoppingListId { get; set; }
    public Guid? RecipeId { get; set; }
    public Guid? LabelId { get; set; }
    
    // Navigation properties
    public virtual ShoppingList ShoppingList { get; set; } = null!;
    public virtual Recipe.Recipe? Recipe { get; set; }
    public virtual Label.Label? Label { get; set; }
}
