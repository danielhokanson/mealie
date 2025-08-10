using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Entities.Recipe;

namespace MealieApi.Domain.Entities.Timeline;

/// <summary>
/// Timeline event entity for recipes
/// </summary>
public class TimelineEvent : AuditableEntity
{
    [Required]
    [StringLength(100)]
    public string EventType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public DateTime EventDate { get; set; }
    
    /// <summary>
    /// Additional event data stored as JSON
    /// </summary>
    public string? EventData { get; set; }
    
    // Foreign keys
    public Guid UserId { get; set; }
    public Guid? RecipeId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Recipe.Recipe? Recipe { get; set; }
}