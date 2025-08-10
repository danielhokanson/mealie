using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Entities.Recipe;

namespace MealieApi.Domain.Entities.Comment;

/// <summary>
/// Comment entity for recipes
/// </summary>
public class Comment : AuditableEntity
{
    [Required]
    [StringLength(1000)]
    public string Text { get; set; } = string.Empty;
    
    public int Rating { get; set; } = 0;
    
    // Foreign keys
    public Guid UserId { get; set; }
    public Guid RecipeId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Recipe.Recipe Recipe { get; set; } = null!;
}