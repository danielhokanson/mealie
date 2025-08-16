namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for ShoppingList entities
/// </summary>
public class ShoppingListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ShoppingDate { get; set; }
    public decimal? EstimatedTotal { get; set; }
    public decimal? ActualTotal { get; set; }
    public Guid UserId { get; set; }
    public Guid? OrganizationId { get; set; }
    public UserDto? User { get; set; }
    public OrganizationDto? Organization { get; set; }
    public List<ShoppingListItemDto> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for ShoppingListItem entities
/// </summary>
public class ShoppingListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Note { get; set; }
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public bool IsChecked { get; set; }
    public DateTime? CheckedAt { get; set; }
    public decimal? EstimatedPrice { get; set; }
    public decimal? ActualPrice { get; set; }
    public int SortOrder { get; set; }
    public Guid ShoppingListId { get; set; }
    public Guid? RecipeId { get; set; }
    public RecipeDto? Recipe { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating shopping lists
/// </summary>
public class CreateShoppingListDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? ShoppingDate { get; set; }
    public Guid? OrganizationId { get; set; }
}

/// <summary>
/// DTO for updating shopping lists
/// </summary>
public class UpdateShoppingListDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsCompleted { get; set; }
    public DateTime? ShoppingDate { get; set; }
    public decimal? EstimatedTotal { get; set; }
    public decimal? ActualTotal { get; set; }
}

/// <summary>
/// DTO for creating shopping list items
/// </summary>
public class CreateShoppingListItemDto
{
    public string Name { get; set; } = string.Empty;
    public string? Note { get; set; }
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public decimal? EstimatedPrice { get; set; }
    public int SortOrder { get; set; } = 0;
    public Guid? RecipeId { get; set; }
}

/// <summary>
/// DTO for updating shopping list items
/// </summary>
public class UpdateShoppingListItemDto
{
    public string? Name { get; set; }
    public string? Note { get; set; }
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public bool? IsChecked { get; set; }
    public decimal? EstimatedPrice { get; set; }
    public decimal? ActualPrice { get; set; }
    public int? SortOrder { get; set; }
}
