using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Enums;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Entities.Comment;
using MealieApi.Domain.Entities.Timeline;

namespace MealieApi.Domain.Entities.Recipe;

/// <summary>
/// Base Recipe entity for TPH (Table-Per-Hierarchy) implementation
/// </summary>
public abstract class Recipe : AuditableEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
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
    
    public int RatingCount { get; set; } = 0;
    
    public bool IsFavorite { get; set; } = false;
    
    public DateTime? LastMadeAt { get; set; }
    
    /// <summary>
    /// Discriminator property for TPH
    /// </summary>
    [Required]
    public RecipeType RecipeType { get; set; }
    
    // Foreign keys
    public Guid UserId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public virtual ICollection<Tool> Tools { get; set; } = new List<Tool>();
    public virtual ICollection<Comment.Comment> Comments { get; set; } = new List<Comment.Comment>();
    public virtual ICollection<TimelineEvent> TimelineEvents { get; set; } = new List<TimelineEvent>();
}
