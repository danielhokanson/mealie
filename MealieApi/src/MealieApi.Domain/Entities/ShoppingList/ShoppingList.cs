using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Entities.Organization;

namespace MealieApi.Domain.Entities.ShoppingList;

/// <summary>
/// Shopping list entity
/// </summary>
public class ShoppingList : AuditableEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public bool IsCompleted { get; set; } = false;
    
    public DateTime? CompletedAt { get; set; }
    
    public DateTime? ShoppingDate { get; set; }
    
    public decimal? EstimatedTotal { get; set; }
    
    public decimal? ActualTotal { get; set; }
    
    // Foreign keys
    public Guid UserId { get; set; }
    public Guid? OrganizationId { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Organization.Organization? Organization { get; set; }
    public virtual ICollection<ShoppingListItem> Items { get; set; } = new List<ShoppingListItem>();
}
