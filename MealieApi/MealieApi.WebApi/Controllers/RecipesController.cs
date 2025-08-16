using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Recipe;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Entities.Comment;
using MealieApi.Domain.Entities.Timeline;
using MealieApi.Domain.Entities.Food;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;
using MealieApi.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing recipes with TPH support
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RecipesController : BaseController
{
    private readonly IRecipeRepository _recipeRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IRepository<Tag> _tagRepository;
    private readonly IRepository<Tool> _toolRepository;
    private readonly IRepository<Comment> _commentRepository;
    private readonly IRepository<TimelineEvent> _timelineRepository;
    private readonly IRepository<Food> _foodRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<RecipesController> _logger;

    public RecipesController(
        IRecipeRepository recipeRepository,
        IRepository<Category> categoryRepository,
        IRepository<Tag> tagRepository,
        IRepository<Tool> toolRepository,
        IRepository<Comment> commentRepository,
        IRepository<TimelineEvent> timelineRepository,
        IRepository<Food> foodRepository,
        IMapper mapper,
        ILogger<RecipesController> logger)
    {
        _recipeRepository = recipeRepository;
        _categoryRepository = categoryRepository;
        _tagRepository = tagRepository;
        _toolRepository = toolRepository;
        _commentRepository = commentRepository;
        _timelineRepository = timelineRepository;
        _foodRepository = foodRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get recipes with search and filtering support
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<RecipeSearchResponse>> GetRecipes(
        [FromQuery] string? search,
        [FromQuery] string? categories,
        [FromQuery] string? tags,
        [FromQuery] int? rating,
        [FromQuery] int? time,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            IEnumerable<Recipe> recipes;

            if (!string.IsNullOrEmpty(search))
            {
                recipes = await _recipeRepository.SearchRecipesAsync(search, cancellationToken);
            }
            else
            {
                recipes = await _recipeRepository.GetAllAsync(cancellationToken);
            }

            // Apply additional filters
            if (!string.IsNullOrEmpty(categories))
            {
                var categoryIds = categories.Split(',').Select(Guid.Parse).ToList();
                recipes = recipes.Where(r => r.Categories.Any(c => categoryIds.Contains(c.Id)));
            }

            if (!string.IsNullOrEmpty(tags))
            {
                var tagIds = tags.Split(',').Select(Guid.Parse).ToList();
                recipes = recipes.Where(r => r.Tags.Any(t => tagIds.Contains(t.Id)));
            }

            if (rating.HasValue)
            {
                recipes = recipes.Where(r => r.Rating >= rating.Value);
            }

            if (time.HasValue)
            {
                recipes = recipes.Where(r => r.TotalTimeMinutes <= time.Value);
            }

            var total = recipes.Count();
            var pagedRecipes = recipes
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToList();

            var recipeDtos = _mapper.Map<List<RecipeDto>>(pagedRecipes);

            var response = new RecipeSearchResponse
            {
                Items = recipeDtos,
                Total = total,
                Page = page,
                PerPage = perPage,
                TotalPages = (int)Math.Ceiling((double)total / perPage)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipes");
            return StatusCode(500, "An error occurred while retrieving recipes");
        }
    }

    /// <summary>
    /// Get a specific recipe by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RecipeDto>> GetRecipe(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetByIdAsync(id, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with ID {id} not found");
            }

            var recipeDto = _mapper.Map<RecipeDto>(recipe);
            return Ok(recipeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipe {RecipeId}", id);
            return StatusCode(500, "An error occurred while retrieving the recipe");
        }
    }

    /// <summary>
    /// Get a recipe by slug
    /// </summary>
    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<RecipeDto>> GetRecipeBySlug(string slug, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetBySlugAsync(slug, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with slug '{slug}' not found");
            }

            var recipeDto = _mapper.Map<RecipeDto>(recipe);
            return Ok(recipeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipe by slug {Slug}", slug);
            return StatusCode(500, "An error occurred while retrieving the recipe");
        }
    }

    /// <summary>
    /// Get random recipes
    /// </summary>
    [HttpGet("random")]
    public async Task<ActionResult<List<RecipeDto>>> GetRandomRecipes(
        [FromQuery] int count = 5, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.GetRandomRecipesAsync(count, cancellationToken);
            var recipeDtos = _mapper.Map<List<RecipeDto>>(recipes);
            return Ok(recipeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving random recipes");
            return StatusCode(500, "An error occurred while retrieving random recipes");
        }
    }

    /// <summary>
    /// Create a new recipe
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RecipeDto>> CreateRecipe([FromBody] CreateRecipeDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            Recipe recipe;
            
            // Create the appropriate recipe type based on TPH
            if (createDto.RecipeType == RecipeType.Public)
            {
                recipe = _mapper.Map<PublicRecipe>(createDto);
            }
            else
            {
                recipe = _mapper.Map<PrivateRecipe>(createDto);
            }

            // Set user ID (in a real app, this would come from authentication)
            // For now, we'll need to pass it or get it from claims
            // recipe.UserId = GetCurrentUserId();

            var createdRecipe = await _recipeRepository.AddAsync(recipe, cancellationToken);
            await _recipeRepository.SaveChangesAsync(cancellationToken);

            var recipeDto = _mapper.Map<RecipeDto>(createdRecipe);
            return CreatedAtAction(nameof(GetRecipe), new { id = recipeDto.Id }, recipeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating recipe");
            return StatusCode(500, "An error occurred while creating the recipe");
        }
    }

    /// <summary>
    /// Update an existing recipe
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RecipeDto>> UpdateRecipe(Guid id, [FromBody] UpdateRecipeDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetByIdAsync(id, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with ID {id} not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                recipe.Name = updateDto.Name;
                recipe.Slug = updateDto.Name.ToLowerInvariant().Replace(" ", "-");
            }
            if (updateDto.Description != null) recipe.Description = updateDto.Description;
            if (updateDto.Instructions != null) recipe.Instructions = updateDto.Instructions;
            if (updateDto.Ingredients != null) recipe.Ingredients = updateDto.Ingredients;
            if (updateDto.PrepTimeMinutes.HasValue) recipe.PrepTimeMinutes = updateDto.PrepTimeMinutes;
            if (updateDto.CookTimeMinutes.HasValue) recipe.CookTimeMinutes = updateDto.CookTimeMinutes;
            if (updateDto.Servings.HasValue) recipe.Servings = updateDto.Servings;
            if (updateDto.IsFavorite.HasValue) recipe.IsFavorite = updateDto.IsFavorite.Value;

            recipe.UpdatedAt = DateTime.UtcNow;

            await _recipeRepository.UpdateAsync(recipe, cancellationToken);
            await _recipeRepository.SaveChangesAsync(cancellationToken);

            var recipeDto = _mapper.Map<RecipeDto>(recipe);
            return Ok(recipeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating recipe {RecipeId}", id);
            return StatusCode(500, "An error occurred while updating the recipe");
        }
    }

    /// <summary>
    /// Delete a recipe
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRecipe(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetByIdAsync(id, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with ID {id} not found");
            }

            await _recipeRepository.DeleteAsync(recipe, cancellationToken);
            await _recipeRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting recipe {RecipeId}", id);
            return StatusCode(500, "An error occurred while deleting the recipe");
        }
    }

    /// <summary>
    /// Get recipes by category
    /// </summary>
    [HttpGet("categories/{categoryId:guid}")]
    public async Task<ActionResult<List<RecipeDto>>> GetRecipesByCategory(Guid categoryId, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.GetRecipesByCategoryAsync(categoryId, cancellationToken);
            var recipeDtos = _mapper.Map<List<RecipeDto>>(recipes);
            return Ok(recipeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipes by category {CategoryId}", categoryId);
            return StatusCode(500, "An error occurred while retrieving recipes by category");
        }
    }

    /// <summary>
    /// Get recipes by tag
    /// </summary>
    [HttpGet("tags/{tagId:guid}")]
    public async Task<ActionResult<List<RecipeDto>>> GetRecipesByTag(Guid tagId, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.GetRecipesByTagAsync(tagId, cancellationToken);
            var recipeDtos = _mapper.Map<List<RecipeDto>>(recipes);
            return Ok(recipeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipes by tag {TagId}", tagId);
            return StatusCode(500, "An error occurred while retrieving recipes by tag");
        }
    }

    /// <summary>
    /// Get recipes by tool
    /// </summary>
    [HttpGet("tools/{toolId:guid}")]
    public async Task<ActionResult<List<RecipeDto>>> GetRecipesByTool(Guid toolId, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.GetRecipesByToolAsync(toolId, cancellationToken);
            var recipeDtos = _mapper.Map<List<RecipeDto>>(recipes);
            return Ok(recipeDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipes by tool {ToolId}", toolId);
            return StatusCode(500, "An error occurred while retrieving recipes by tool");
        }
    }

    /// <summary>
    /// Get all categories used in recipes
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryDto>>> GetRecipeCategories(CancellationToken cancellationToken = default)
    {
        try
        {
            var categories = await _categoryRepository.GetAllAsync(cancellationToken);
            var categoryDtos = _mapper.Map<List<CategoryDto>>(categories);
            return Ok(categoryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipe categories");
            return StatusCode(500, "An error occurred while retrieving recipe categories");
        }
    }

    /// <summary>
    /// Get all tags used in recipes
    /// </summary>
    [HttpGet("tags")]
    public async Task<ActionResult<List<TagDto>>> GetRecipeTags(CancellationToken cancellationToken = default)
    {
        try
        {
            var tags = await _tagRepository.GetAllAsync(cancellationToken);
            var tagDtos = _mapper.Map<List<TagDto>>(tags);
            return Ok(tagDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipe tags");
            return StatusCode(500, "An error occurred while retrieving recipe tags");
        }
    }

    /// <summary>
    /// Get all tools used in recipes
    /// </summary>
    [HttpGet("tools")]
    public async Task<ActionResult<List<ToolDto>>> GetRecipeTools(CancellationToken cancellationToken = default)
    {
        try
        {
            var tools = await _toolRepository.GetAllAsync(cancellationToken);
            var toolDtos = _mapper.Map<List<ToolDto>>(tools);
            return Ok(toolDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipe tools");
            return StatusCode(500, "An error occurred while retrieving recipe tools");
        }
    }

    /// <summary>
    /// Get all foods used in recipes
    /// </summary>
    [HttpGet("foods")]
    public async Task<ActionResult<List<FoodDto>>> GetRecipeFoods(CancellationToken cancellationToken = default)
    {
        try
        {
            var foods = await _foodRepository.GetAllAsync(cancellationToken);
            var foodDtos = _mapper.Map<List<FoodDto>>(foods);
            return Ok(foodDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving recipe foods");
            return StatusCode(500, "An error occurred while retrieving recipe foods");
        }
    }

    /// <summary>
    /// Toggle recipe favorite status
    /// </summary>
    [HttpPost("{slug}/favorite")]
    public async Task<ActionResult<RecipeDto>> ToggleFavorite(string slug, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetBySlugAsync(slug, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with slug '{slug}' not found");
            }

            recipe.IsFavorite = !recipe.IsFavorite;
            recipe.UpdatedAt = DateTime.UtcNow;

            await _recipeRepository.UpdateAsync(recipe, cancellationToken);
            await _recipeRepository.SaveChangesAsync(cancellationToken);

            var recipeDto = _mapper.Map<RecipeDto>(recipe);
            return Ok(recipeDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling favorite for recipe {Slug}", slug);
            return StatusCode(500, "An error occurred while toggling recipe favorite");
        }
    }

    /// <summary>
    /// Get recipe timeline
    /// </summary>
    [HttpGet("{slug}/timeline")]
    public async Task<ActionResult<List<object>>> GetRecipeTimeline(string slug, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetBySlugAsync(slug, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with slug '{slug}' not found");
            }

            var timelineEvents = await _timelineRepository.FindAsync(te => te.RecipeId == recipe.Id, cancellationToken);
            var timeline = timelineEvents.Select(te => new
            {
                id = te.Id,
                eventType = te.EventType,
                title = te.Title,
                description = te.Description,
                eventDate = te.EventDate,
                eventData = te.EventData
            }).OrderByDescending(te => te.eventDate);

            return Ok(timeline);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving timeline for recipe {Slug}", slug);
            return StatusCode(500, "An error occurred while retrieving recipe timeline");
        }
    }

    /// <summary>
    /// Get recipe comments
    /// </summary>
    [HttpGet("{slug}/comments")]
    public async Task<ActionResult<List<object>>> GetRecipeComments(string slug, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetBySlugAsync(slug, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with slug '{slug}' not found");
            }

            var comments = await _commentRepository.FindAsync(c => c.RecipeId == recipe.Id, cancellationToken);
            var commentDtos = comments.Select(c => new
            {
                id = c.Id,
                text = c.Text,
                rating = c.Rating,
                userId = c.UserId,
                createdAt = c.CreatedAt
            }).OrderByDescending(c => c.createdAt);

            return Ok(commentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for recipe {Slug}", slug);
            return StatusCode(500, "An error occurred while retrieving recipe comments");
        }
    }

    /// <summary>
    /// Add comment to recipe
    /// </summary>
    [HttpPost("{slug}/comments")]
    public async Task<ActionResult<object>> CreateRecipeComment(string slug, [FromBody] CreateCommentRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipe = await _recipeRepository.GetBySlugAsync(slug, cancellationToken);
            if (recipe == null)
            {
                return NotFound($"Recipe with slug '{slug}' not found");
            }

            var comment = new Comment
            {
                Text = request.Text,
                Rating = request.Rating ?? 0,
                RecipeId = recipe.Id,
                UserId = GetCurrentUserId()
            };

            var createdComment = await _commentRepository.AddAsync(comment, cancellationToken);
            await _commentRepository.SaveChangesAsync(cancellationToken);

            var commentDto = new
            {
                id = createdComment.Id,
                text = createdComment.Text,
                rating = createdComment.Rating,
                userId = createdComment.UserId,
                createdAt = createdComment.CreatedAt
            };

            return CreatedAtAction(nameof(GetRecipeComments), new { slug }, commentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating comment for recipe {Slug}", slug);
            return StatusCode(500, "An error occurred while creating recipe comment");
        }
    }

    /// <summary>
    /// Create recipe from URL (placeholder)
    /// </summary>
    [HttpPost("create/url")]
    public async Task<ActionResult<string>> CreateRecipeFromUrl([FromBody] CreateFromUrlRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // Placeholder implementation - in a real app this would scrape the URL
            _logger.LogInformation("Recipe creation from URL requested: {Url}", request.Url);
            
            // Return a task ID that could be used to poll for completion
            var taskId = Guid.NewGuid().ToString();
            return Ok(taskId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating recipe from URL");
            return StatusCode(500, "An error occurred while creating recipe from URL");
        }
    }

    /// <summary>
    /// Test scrape URL (placeholder)
    /// </summary>
    [HttpPost("test-scrape-url")]
    public async Task<ActionResult<object>> TestScrapeUrl([FromBody] TestScrapeRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // Placeholder implementation - in a real app this would test scraping the URL
            _logger.LogInformation("Test scrape requested for URL: {Url}", request.Url);
            
            return Ok(new { message = "URL scraping test completed", success = false });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing URL scrape");
            return StatusCode(500, "An error occurred while testing URL scrape");
        }
    }

    /// <summary>
    /// Get recipe suggestions (placeholder)
    /// </summary>
    [HttpGet("suggestions")]
    public async Task<ActionResult<object>> GetRecipeSuggestions([FromQuery] string? query, [FromQuery] string[]? foods, [FromQuery] string[]? tools, CancellationToken cancellationToken = default)
    {
        try
        {
            // Placeholder implementation - in a real app this would provide AI-powered suggestions
            var suggestions = new
            {
                recipes = new List<object>(),
                message = "Recipe suggestions feature coming soon"
            };

            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recipe suggestions");
            return StatusCode(500, "An error occurred while getting recipe suggestions");
        }
    }

    /// <summary>
    /// Create timeline event
    /// </summary>
    [HttpPost("timeline/events")]
    public async Task<ActionResult<object>> CreateTimelineEvent([FromBody] CreateTimelineEventRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var timelineEvent = new TimelineEvent
            {
                EventType = request.EventType,
                Title = request.Title,
                Description = request.Description,
                EventDate = request.EventDate,
                EventData = request.EventData,
                UserId = GetCurrentUserId(),
                RecipeId = request.RecipeId
            };

            var createdEvent = await _timelineRepository.AddAsync(timelineEvent, cancellationToken);
            await _timelineRepository.SaveChangesAsync(cancellationToken);

            var eventDto = new
            {
                id = createdEvent.Id,
                eventType = createdEvent.EventType,
                title = createdEvent.Title,
                description = createdEvent.Description,
                eventDate = createdEvent.EventDate,
                eventData = createdEvent.EventData
            };

            return CreatedAtAction(nameof(GetRecipeTimeline), new { slug = "placeholder" }, eventDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating timeline event");
            return StatusCode(500, "An error occurred while creating timeline event");
        }
    }

    /// <summary>
    /// Bulk delete recipes
    /// </summary>
    [HttpDelete("bulk")]
    public async Task<ActionResult> BulkDeleteRecipes([FromBody] BulkDeleteRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.FindAsync(r => request.Ids.Contains(r.Id), cancellationToken);
            
            foreach (var recipe in recipes)
            {
                await _recipeRepository.DeleteAsync(recipe, cancellationToken);
            }
            
            await _recipeRepository.SaveChangesAsync(cancellationToken);

            return Ok(new { message = $"Deleted {recipes.Count()} recipes", deletedCount = recipes.Count() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk deleting recipes");
            return StatusCode(500, "An error occurred while bulk deleting recipes");
        }
    }

    /// <summary>
    /// Bulk add category to recipes
    /// </summary>
    [HttpPost("bulk/category")]
    public async Task<ActionResult> BulkUpdateRecipeCategory([FromBody] BulkCategoryRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.FindAsync(r => request.RecipeIds.Contains(r.Id), cancellationToken);
            var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);

            if (category == null)
            {
                return BadRequest("Category not found");
            }

            int updatedCount = 0;
            foreach (var recipe in recipes)
            {
                if (request.Action == "add")
                {
                    if (!recipe.Categories.Any(c => c.Id == request.CategoryId))
                    {
                        recipe.Categories.Add(category);
                        updatedCount++;
                    }
                }
                else if (request.Action == "remove")
                {
                    var categoryToRemove = recipe.Categories.FirstOrDefault(c => c.Id == request.CategoryId);
                    if (categoryToRemove != null)
                    {
                        recipe.Categories.Remove(categoryToRemove);
                        updatedCount++;
                    }
                }

                await _recipeRepository.UpdateAsync(recipe, cancellationToken);
            }

            await _recipeRepository.SaveChangesAsync(cancellationToken);

            return Ok(new { message = $"Updated {updatedCount} recipes", updatedCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk updating recipe categories");
            return StatusCode(500, "An error occurred while bulk updating recipe categories");
        }
    }

    /// <summary>
    /// Bulk add tag to recipes
    /// </summary>
    [HttpPost("bulk/tag")]
    public async Task<ActionResult> BulkUpdateRecipeTag([FromBody] BulkTagRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var recipes = await _recipeRepository.FindAsync(r => request.RecipeIds.Contains(r.Id), cancellationToken);
            var tag = await _tagRepository.GetByIdAsync(request.TagId, cancellationToken);

            if (tag == null)
            {
                return BadRequest("Tag not found");
            }

            int updatedCount = 0;
            foreach (var recipe in recipes)
            {
                if (request.Action == "add")
                {
                    if (!recipe.Tags.Any(t => t.Id == request.TagId))
                    {
                        recipe.Tags.Add(tag);
                        updatedCount++;
                    }
                }
                else if (request.Action == "remove")
                {
                    var tagToRemove = recipe.Tags.FirstOrDefault(t => t.Id == request.TagId);
                    if (tagToRemove != null)
                    {
                        recipe.Tags.Remove(tagToRemove);
                        updatedCount++;
                    }
                }

                await _recipeRepository.UpdateAsync(recipe, cancellationToken);
            }

            await _recipeRepository.SaveChangesAsync(cancellationToken);

            return Ok(new { message = $"Updated {updatedCount} recipes", updatedCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk updating recipe tags");
            return StatusCode(500, "An error occurred while bulk updating recipe tags");
        }
    }
}

/// <summary>
/// Response model for recipe search results
/// </summary>
public class RecipeSearchResponse
{
    public List<RecipeDto> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PerPage { get; set; }
    public int TotalPages { get; set; }
}
