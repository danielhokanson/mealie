using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.ShoppingList;
using MealieApi.Domain.Entities.Label;
using MealieApi.Domain.Entities.Food;
using MealieApi.Domain.Entities.Unit;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing shopping lists
/// </summary>
[ApiController]
[Route("api/shopping-lists")]
public class ShoppingListsController : BaseController
{
    private readonly IRepository<ShoppingList> _shoppingListRepository;
    private readonly IRepository<ShoppingListItem> _shoppingListItemRepository;
    private readonly IRepository<Label> _labelRepository;
    private readonly IRepository<Food> _foodRepository;
    private readonly IRepository<Unit> _unitRepository;
    private readonly IRecipeRepository _recipeRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ShoppingListsController> _logger;

    public ShoppingListsController(
        IRepository<ShoppingList> shoppingListRepository,
        IRepository<ShoppingListItem> shoppingListItemRepository,
        IRepository<Label> labelRepository,
        IRepository<Food> foodRepository,
        IRepository<Unit> unitRepository,
        IRecipeRepository recipeRepository,
        IMapper mapper,
        ILogger<ShoppingListsController> logger)
    {
        _shoppingListRepository = shoppingListRepository;
        _shoppingListItemRepository = shoppingListItemRepository;
        _labelRepository = labelRepository;
        _foodRepository = foodRepository;
        _unitRepository = unitRepository;
        _recipeRepository = recipeRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all shopping lists
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShoppingListDto>>> GetShoppingLists(
        [FromQuery] Guid? userId,
        [FromQuery] Guid? organizationId,
        [FromQuery] bool? isCompleted,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingLists = await _shoppingListRepository.GetAllAsync(cancellationToken);

            // Apply filters
            if (userId.HasValue)
            {
                shoppingLists = shoppingLists.Where(sl => sl.UserId == userId.Value);
            }

            if (organizationId.HasValue)
            {
                shoppingLists = shoppingLists.Where(sl => sl.OrganizationId == organizationId.Value);
            }

            if (isCompleted.HasValue)
            {
                shoppingLists = shoppingLists.Where(sl => sl.IsCompleted == isCompleted.Value);
            }

            var shoppingListDtos = _mapper.Map<IEnumerable<ShoppingListDto>>(shoppingLists);
            return Ok(shoppingListDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving shopping lists");
            return StatusCode(500, "An error occurred while retrieving shopping lists");
        }
    }

    /// <summary>
    /// Get a specific shopping list by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShoppingListDto>> GetShoppingList(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (shoppingList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            var shoppingListDto = _mapper.Map<ShoppingListDto>(shoppingList);
            return Ok(shoppingListDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while retrieving the shopping list");
        }
    }

    /// <summary>
    /// Create a new shopping list
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ShoppingListDto>> CreateShoppingList([FromBody] CreateShoppingListDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingList = new ShoppingList
            {
                Name = createDto.Name,
                Description = createDto.Description,
                ShoppingDate = createDto.ShoppingDate,
                OrganizationId = createDto.OrganizationId,
                UserId = GetCurrentUserId()
            };

            var createdShoppingList = await _shoppingListRepository.AddAsync(shoppingList, cancellationToken);
            await _shoppingListRepository.SaveChangesAsync(cancellationToken);

            var shoppingListDto = _mapper.Map<ShoppingListDto>(createdShoppingList);
            return CreatedAtAction(nameof(GetShoppingList), new { id = shoppingListDto.Id }, shoppingListDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating shopping list");
            return StatusCode(500, "An error occurred while creating the shopping list");
        }
    }

    /// <summary>
    /// Update an existing shopping list
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShoppingListDto>> UpdateShoppingList(Guid id, [FromBody] UpdateShoppingListDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (shoppingList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.Name)) shoppingList.Name = updateDto.Name;
            if (updateDto.Description != null) shoppingList.Description = updateDto.Description;
            if (updateDto.IsCompleted.HasValue) 
            {
                shoppingList.IsCompleted = updateDto.IsCompleted.Value;
                if (updateDto.IsCompleted.Value)
                {
                    shoppingList.CompletedAt = DateTime.UtcNow;
                }
            }
            if (updateDto.ShoppingDate.HasValue) shoppingList.ShoppingDate = updateDto.ShoppingDate;
            if (updateDto.EstimatedTotal.HasValue) shoppingList.EstimatedTotal = updateDto.EstimatedTotal;
            if (updateDto.ActualTotal.HasValue) shoppingList.ActualTotal = updateDto.ActualTotal;

            shoppingList.UpdatedAt = DateTime.UtcNow;

            await _shoppingListRepository.UpdateAsync(shoppingList, cancellationToken);
            await _shoppingListRepository.SaveChangesAsync(cancellationToken);

            var shoppingListDto = _mapper.Map<ShoppingListDto>(shoppingList);
            return Ok(shoppingListDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while updating the shopping list");
        }
    }

    /// <summary>
    /// Delete a shopping list
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteShoppingList(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (shoppingList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            await _shoppingListRepository.DeleteAsync(shoppingList, cancellationToken);
            await _shoppingListRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while deleting the shopping list");
        }
    }

    /// <summary>
    /// Get items for a specific shopping list
    /// </summary>
    [HttpGet("{id:guid}/items")]
    public async Task<ActionResult<IEnumerable<ShoppingListItemDto>>> GetShoppingListItems(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var items = await _shoppingListItemRepository.FindAsync(item => item.ShoppingListId == id, cancellationToken);
            var itemDtos = _mapper.Map<IEnumerable<ShoppingListItemDto>>(items.OrderBy(i => i.SortOrder));
            return Ok(itemDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving shopping list items for list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while retrieving shopping list items");
        }
    }

    /// <summary>
    /// Add an item to a shopping list
    /// </summary>
    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<ShoppingListItemDto>> AddShoppingListItem(Guid id, [FromBody] CreateShoppingListItemDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Verify shopping list exists
            var shoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (shoppingList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            var item = new ShoppingListItem
            {
                Name = createDto.Name,
                Note = createDto.Note,
                Quantity = createDto.Quantity,
                Unit = createDto.Unit,
                EstimatedPrice = createDto.EstimatedPrice,
                SortOrder = createDto.SortOrder,
                ShoppingListId = id,
                RecipeId = createDto.RecipeId
            };

            var createdItem = await _shoppingListItemRepository.AddAsync(item, cancellationToken);
            await _shoppingListItemRepository.SaveChangesAsync(cancellationToken);

            var itemDto = _mapper.Map<ShoppingListItemDto>(createdItem);
            return CreatedAtAction(nameof(GetShoppingListItem), new { id = id, itemId = itemDto.Id }, itemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding item to shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while adding the item to the shopping list");
        }
    }

    /// <summary>
    /// Get a specific shopping list item
    /// </summary>
    [HttpGet("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ShoppingListItemDto>> GetShoppingListItem(Guid id, Guid itemId, CancellationToken cancellationToken = default)
    {
        try
        {
            var item = await _shoppingListItemRepository.FirstOrDefaultAsync(
                item => item.Id == itemId && item.ShoppingListId == id, 
                cancellationToken);

            if (item == null)
            {
                return NotFound($"Shopping list item with ID {itemId} not found in shopping list {id}");
            }

            var itemDto = _mapper.Map<ShoppingListItemDto>(item);
            return Ok(itemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving shopping list item {ItemId} from list {ShoppingListId}", itemId, id);
            return StatusCode(500, "An error occurred while retrieving the shopping list item");
        }
    }

    /// <summary>
    /// Update a shopping list item
    /// </summary>
    [HttpPut("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ShoppingListItemDto>> UpdateShoppingListItem(
        Guid id, 
        Guid itemId, 
        [FromBody] UpdateShoppingListItemDto updateDto, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var item = await _shoppingListItemRepository.FirstOrDefaultAsync(
                item => item.Id == itemId && item.ShoppingListId == id, 
                cancellationToken);

            if (item == null)
            {
                return NotFound($"Shopping list item with ID {itemId} not found in shopping list {id}");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.Name)) item.Name = updateDto.Name;
            if (updateDto.Note != null) item.Note = updateDto.Note;
            if (updateDto.Quantity.HasValue) item.Quantity = updateDto.Quantity;
            if (updateDto.Unit != null) item.Unit = updateDto.Unit;
            if (updateDto.IsChecked.HasValue) 
            {
                item.IsChecked = updateDto.IsChecked.Value;
                if (updateDto.IsChecked.Value)
                {
                    item.CheckedAt = DateTime.UtcNow;
                }
            }
            if (updateDto.EstimatedPrice.HasValue) item.EstimatedPrice = updateDto.EstimatedPrice;
            if (updateDto.ActualPrice.HasValue) item.ActualPrice = updateDto.ActualPrice;
            if (updateDto.SortOrder.HasValue) item.SortOrder = updateDto.SortOrder.Value;

            item.UpdatedAt = DateTime.UtcNow;

            await _shoppingListItemRepository.UpdateAsync(item, cancellationToken);
            await _shoppingListItemRepository.SaveChangesAsync(cancellationToken);

            var itemDto = _mapper.Map<ShoppingListItemDto>(item);
            return Ok(itemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating shopping list item {ItemId} from list {ShoppingListId}", itemId, id);
            return StatusCode(500, "An error occurred while updating the shopping list item");
        }
    }

    /// <summary>
    /// Delete a shopping list item
    /// </summary>
    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> DeleteShoppingListItem(Guid id, Guid itemId, CancellationToken cancellationToken = default)
    {
        try
        {
            var item = await _shoppingListItemRepository.FirstOrDefaultAsync(
                item => item.Id == itemId && item.ShoppingListId == id, 
                cancellationToken);

            if (item == null)
            {
                return NotFound($"Shopping list item with ID {itemId} not found in shopping list {id}");
            }

            await _shoppingListItemRepository.DeleteAsync(item, cancellationToken);
            await _shoppingListItemRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting shopping list item {ItemId} from list {ShoppingListId}", itemId, id);
            return StatusCode(500, "An error occurred while deleting the shopping list item");
        }
    }

    /// <summary>
    /// Patch a shopping list item (for partial updates like checking/unchecking)
    /// </summary>
    [HttpPatch("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ShoppingListItemDto>> PatchShoppingListItem(
        Guid id, 
        Guid itemId, 
        [FromBody] Dictionary<string, object> updates, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var item = await _shoppingListItemRepository.FirstOrDefaultAsync(
                item => item.Id == itemId && item.ShoppingListId == id, 
                cancellationToken);

            if (item == null)
            {
                return NotFound($"Shopping list item with ID {itemId} not found in shopping list {id}");
            }

            // Apply updates
            foreach (var update in updates)
            {
                switch (update.Key.ToLower())
                {
                    case "checked":
                        if (bool.TryParse(update.Value?.ToString(), out bool isChecked))
                        {
                            item.IsChecked = isChecked;
                            item.CheckedAt = isChecked ? DateTime.UtcNow : null;
                        }
                        break;
                    case "labelid":
                        if (update.Value == null)
                        {
                            item.LabelId = null;
                        }
                        else if (Guid.TryParse(update.Value.ToString(), out Guid labelId))
                        {
                            item.LabelId = labelId;
                        }
                        break;
                    case "quantity":
                        if (decimal.TryParse(update.Value?.ToString(), out decimal quantity))
                        {
                            item.Quantity = quantity;
                        }
                        break;
                }
            }

            item.UpdatedAt = DateTime.UtcNow;

            await _shoppingListItemRepository.UpdateAsync(item, cancellationToken);
            await _shoppingListItemRepository.SaveChangesAsync(cancellationToken);

            var itemDto = _mapper.Map<ShoppingListItemDto>(item);
            return Ok(itemDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error patching shopping list item {ItemId} from list {ShoppingListId}", itemId, id);
            return StatusCode(500, "An error occurred while updating the shopping list item");
        }
    }

    /// <summary>
    /// Add recipe to shopping list
    /// </summary>
    [HttpPost("{id:guid}/recipe")]
    public async Task<ActionResult<ShoppingListDto>> AddRecipeToShoppingList(
        Guid id, 
        [FromBody] AddRecipeToShoppingListRequest request, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (shoppingList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            var recipe = await _recipeRepository.GetBySlugAsync(request.RecipeSlug, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with slug '{request.RecipeSlug}' not found");
            }

            // Parse recipe ingredients and add them as shopping list items
            await AddRecipeIngredientsToShoppingList(recipe, id, request.Scale, cancellationToken);

            var updatedShoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            var shoppingListDto = _mapper.Map<ShoppingListDto>(updatedShoppingList);
            return Ok(shoppingListDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding recipe to shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while adding recipe to shopping list");
        }
    }

    /// <summary>
    /// Get shopping list labels
    /// </summary>
    [HttpGet("labels")]
    public async Task<ActionResult<List<LabelDto>>> GetLabels(CancellationToken cancellationToken = default)
    {
        try
        {
            var labels = await _labelRepository.GetAllAsync(cancellationToken);
            var labelDtos = _mapper.Map<List<LabelDto>>(labels);
            return Ok(labelDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving shopping list labels");
            return StatusCode(500, "An error occurred while retrieving labels");
        }
    }

    /// <summary>
    /// Create a new label
    /// </summary>
    [HttpPost("labels")]
    public async Task<ActionResult<LabelDto>> CreateLabel([FromBody] CreateLabelDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var label = new Label
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                SortOrder = createDto.SortOrder
            };

            var createdLabel = await _labelRepository.AddAsync(label, cancellationToken);
            await _labelRepository.SaveChangesAsync(cancellationToken);

            var labelDto = _mapper.Map<LabelDto>(createdLabel);
            return CreatedAtAction(nameof(GetLabels), labelDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating label");
            return StatusCode(500, "An error occurred while creating the label");
        }
    }

    /// <summary>
    /// Update a label
    /// </summary>
    [HttpPut("labels/{labelId:guid}")]
    public async Task<ActionResult<LabelDto>> UpdateLabel(Guid labelId, [FromBody] UpdateLabelDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var label = await _labelRepository.GetByIdAsync(labelId, cancellationToken);
            if (label == null)
            {
                return NotFound($"Label with ID {labelId} not found");
            }

            if (!string.IsNullOrEmpty(updateDto.Name)) label.Name = updateDto.Name;
            if (updateDto.Description != null) label.Description = updateDto.Description;
            if (!string.IsNullOrEmpty(updateDto.Color)) label.Color = updateDto.Color;
            if (updateDto.SortOrder.HasValue) label.SortOrder = updateDto.SortOrder.Value;

            label.UpdatedAt = DateTime.UtcNow;

            await _labelRepository.UpdateAsync(label, cancellationToken);
            await _labelRepository.SaveChangesAsync(cancellationToken);

            var labelDto = _mapper.Map<LabelDto>(label);
            return Ok(labelDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating label {LabelId}", labelId);
            return StatusCode(500, "An error occurred while updating the label");
        }
    }

    /// <summary>
    /// Delete a label
    /// </summary>
    [HttpDelete("labels/{labelId:guid}")]
    public async Task<IActionResult> DeleteLabel(Guid labelId, CancellationToken cancellationToken = default)
    {
        try
        {
            var label = await _labelRepository.GetByIdAsync(labelId, cancellationToken);
            if (label == null)
            {
                return NotFound($"Label with ID {labelId} not found");
            }

            await _labelRepository.DeleteAsync(label, cancellationToken);
            await _labelRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting label {LabelId}", labelId);
            return StatusCode(500, "An error occurred while deleting the label");
        }
    }

    /// <summary>
    /// Clear all checked items from shopping list
    /// </summary>
    [HttpDelete("{id:guid}/items/checked")]
    public async Task<ActionResult<ShoppingListDto>> ClearCheckedItems(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var shoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (shoppingList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            var checkedItems = await _shoppingListItemRepository.FindAsync(
                item => item.ShoppingListId == id && item.IsChecked, 
                cancellationToken);

            await _shoppingListItemRepository.DeleteRangeAsync(checkedItems, cancellationToken);
            await _shoppingListItemRepository.SaveChangesAsync(cancellationToken);

            var updatedShoppingList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            var shoppingListDto = _mapper.Map<ShoppingListDto>(updatedShoppingList);
            return Ok(shoppingListDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing checked items from shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while clearing checked items");
        }
    }

    /// <summary>
    /// Duplicate shopping list
    /// </summary>
    [HttpPost("{id:guid}/duplicate")]
    public async Task<ActionResult<ShoppingListDto>> DuplicateShoppingList(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var originalList = await _shoppingListRepository.GetByIdAsync(id, cancellationToken);
            if (originalList == null)
            {
                return NotFound($"Shopping list with ID {id} not found");
            }

            var duplicateList = new ShoppingList
            {
                Name = $"{originalList.Name} (Copy)",
                Description = originalList.Description,
                ShoppingDate = null, // Reset shopping date
                EstimatedTotal = originalList.EstimatedTotal,
                OrganizationId = originalList.OrganizationId,
                UserId = originalList.UserId
            };

            var createdList = await _shoppingListRepository.AddAsync(duplicateList, cancellationToken);
            await _shoppingListRepository.SaveChangesAsync(cancellationToken);

            // Copy items
            var originalItems = await _shoppingListItemRepository.FindAsync(
                item => item.ShoppingListId == id, 
                cancellationToken);

            foreach (var originalItem in originalItems)
            {
                var duplicateItem = new ShoppingListItem
                {
                    Name = originalItem.Name,
                    Note = originalItem.Note,
                    Quantity = originalItem.Quantity,
                    Unit = originalItem.Unit,
                    EstimatedPrice = originalItem.EstimatedPrice,
                    SortOrder = originalItem.SortOrder,
                    ShoppingListId = createdList.Id,
                    RecipeId = originalItem.RecipeId,
                    LabelId = originalItem.LabelId
                };

                await _shoppingListItemRepository.AddAsync(duplicateItem, cancellationToken);
            }

            await _shoppingListItemRepository.SaveChangesAsync(cancellationToken);

            var shoppingListDto = _mapper.Map<ShoppingListDto>(createdList);
            return CreatedAtAction(nameof(GetShoppingList), new { id = createdList.Id }, shoppingListDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating shopping list {ShoppingListId}", id);
            return StatusCode(500, "An error occurred while duplicating the shopping list");
        }
    }

    /// <summary>
    /// Add recipe ingredients to shopping list
    /// </summary>
    private async Task AddRecipeIngredientsToShoppingList(MealieApi.Domain.Entities.Recipe.Recipe recipe, Guid shoppingListId, decimal scale, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(recipe.Ingredients))
        {
            // If no ingredients, add a general recipe item
            var recipeItem = new ShoppingListItem
            {
                Name = $"Ingredients for {recipe.Name}",
                Note = $"Recipe: {recipe.Name} (Scale: {scale})",
                Quantity = 1,
                Unit = "recipe",
                ShoppingListId = shoppingListId,
                RecipeId = recipe.Id
            };

            await _shoppingListItemRepository.AddAsync(recipeItem, cancellationToken);
            return;
        }

        // Parse ingredients (simple implementation - in production, use more sophisticated parsing)
        var ingredientLines = recipe.Ingredients.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var sortOrder = 0;

        foreach (var line in ingredientLines)
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrEmpty(trimmedLine) || trimmedLine.StartsWith('#') || trimmedLine.StartsWith("//"))
                continue;

            // Simple ingredient parsing - extract quantity, unit, and name
            var (quantity, unit, name) = ParseIngredientLine(trimmedLine, scale);

            var ingredient = new ShoppingListItem
            {
                Name = name,
                Note = $"From recipe: {recipe.Name}",
                Quantity = quantity,
                Unit = unit,
                SortOrder = sortOrder++,
                ShoppingListId = shoppingListId,
                RecipeId = recipe.Id
            };

            await _shoppingListItemRepository.AddAsync(ingredient, cancellationToken);
        }
    }

    /// <summary>
    /// Parse ingredient line to extract quantity, unit, and name
    /// </summary>
    private static (decimal quantity, string? unit, string name) ParseIngredientLine(string line, decimal scale)
    {
        // Simple regex-based parsing (in production, use more sophisticated NLP)
        var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        
        if (parts.Length == 0)
            return (1, null, line);

        // Try to parse quantity from first part
        if (decimal.TryParse(parts[0], out var quantity))
        {
            var scaledQuantity = quantity * scale;
            
            // If we have a unit (second part), extract it
            if (parts.Length > 2)
            {
                var unit = parts[1];
                var name = string.Join(" ", parts.Skip(2));
                return (scaledQuantity, unit, name);
            }
            else if (parts.Length == 2)
            {
                // Just quantity and name, no unit
                var name = parts[1];
                return (scaledQuantity, null, name);
            }
        }

        // If no quantity found, treat as single item
        return (scale, null, line);
    }
}

/// <summary>
/// Request DTO for adding recipe to shopping list
/// </summary>
public class AddRecipeToShoppingListRequest
{
    public string RecipeSlug { get; set; } = string.Empty;
    public decimal Scale { get; set; } = 1;
}
