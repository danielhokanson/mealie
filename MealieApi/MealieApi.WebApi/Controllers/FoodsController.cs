using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Food;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing foods
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class FoodsController : ControllerBase
{
    private readonly IRepository<Food> _foodRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FoodsController> _logger;

    public FoodsController(
        IRepository<Food> foodRepository,
        IMapper mapper,
        ILogger<FoodsController> logger)
    {
        _foodRepository = foodRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all foods with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<object>> GetFoods(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 50,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var foods = await _foodRepository.GetAllAsync(cancellationToken);

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                foods = foods.Where(f => f.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                        (f.Description != null && f.Description.Contains(search, StringComparison.OrdinalIgnoreCase)));
            }

            if (!string.IsNullOrEmpty(category))
            {
                foods = foods.Where(f => f.Category != null && f.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            var total = foods.Count();
            var pagedFoods = foods
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToList();

            var foodDtos = _mapper.Map<List<FoodDto>>(pagedFoods);

            var response = new
            {
                items = foodDtos,
                total,
                page,
                perPage,
                totalPages = (int)Math.Ceiling((double)total / perPage)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving foods");
            return StatusCode(500, "An error occurred while retrieving foods");
        }
    }

    /// <summary>
    /// Get food by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FoodDto>> GetFood(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null)
            {
                return NotFound($"Food with ID {id} not found");
            }

            var foodDto = _mapper.Map<FoodDto>(food);
            return Ok(foodDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving food {FoodId}", id);
            return StatusCode(500, "An error occurred while retrieving the food");
        }
    }

    /// <summary>
    /// Create a new food
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<FoodDto>> CreateFood([FromBody] CreateFoodDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var food = new Food
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Category = createDto.Category,
                IsCommon = createDto.IsCommon
            };

            var createdFood = await _foodRepository.AddAsync(food, cancellationToken);
            await _foodRepository.SaveChangesAsync(cancellationToken);

            var foodDto = _mapper.Map<FoodDto>(createdFood);
            return CreatedAtAction(nameof(GetFood), new { id = foodDto.Id }, foodDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating food");
            return StatusCode(500, "An error occurred while creating the food");
        }
    }

    /// <summary>
    /// Update a food
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FoodDto>> UpdateFood(Guid id, [FromBody] UpdateFoodDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null)
            {
                return NotFound($"Food with ID {id} not found");
            }

            if (!string.IsNullOrEmpty(updateDto.Name)) food.Name = updateDto.Name;
            if (updateDto.Description != null) food.Description = updateDto.Description;
            if (updateDto.Category != null) food.Category = updateDto.Category;
            if (updateDto.IsCommon.HasValue) food.IsCommon = updateDto.IsCommon.Value;

            food.UpdatedAt = DateTime.UtcNow;

            await _foodRepository.UpdateAsync(food, cancellationToken);
            await _foodRepository.SaveChangesAsync(cancellationToken);

            var foodDto = _mapper.Map<FoodDto>(food);
            return Ok(foodDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating food {FoodId}", id);
            return StatusCode(500, "An error occurred while updating the food");
        }
    }

    /// <summary>
    /// Delete a food
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteFood(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var food = await _foodRepository.GetByIdAsync(id, cancellationToken);
            if (food == null)
            {
                return NotFound($"Food with ID {id} not found");
            }

            await _foodRepository.DeleteAsync(food, cancellationToken);
            await _foodRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting food {FoodId}", id);
            return StatusCode(500, "An error occurred while deleting the food");
        }
    }

    /// <summary>
    /// Get food categories
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetFoodCategories(CancellationToken cancellationToken = default)
    {
        try
        {
            var foods = await _foodRepository.GetAllAsync(cancellationToken);
            var categories = foods
                .Where(f => !string.IsNullOrEmpty(f.Category))
                .Select(f => f.Category!)
                .Distinct()
                .OrderBy(c => c)
                .ToList();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving food categories");
            return StatusCode(500, "An error occurred while retrieving food categories");
        }
    }

    /// <summary>
    /// Search foods
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<List<FoodDto>>> SearchFoods(
        [FromQuery] string q,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(q))
            {
                return BadRequest("Search query is required");
            }

            var foods = await _foodRepository.GetAllAsync(cancellationToken);
            var matchingFoods = foods
                .Where(f => f.Name.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                           (f.Description != null && f.Description.Contains(q, StringComparison.OrdinalIgnoreCase)))
                .Take(limit)
                .ToList();

            var foodDtos = _mapper.Map<List<FoodDto>>(matchingFoods);
            return Ok(foodDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching foods");
            return StatusCode(500, "An error occurred while searching foods");
        }
    }
}