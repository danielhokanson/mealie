namespace MealieApi.Domain.Common;

/// <summary>
/// Base entity class with audit fields for tracking creation and modification
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public string? CreatedBy { get; set; }
    
    public string? UpdatedBy { get; set; }
    
    public bool IsDeleted { get; set; } = false;
    
    public DateTime? DeletedAt { get; set; }
    
    public string? DeletedBy { get; set; }
}
