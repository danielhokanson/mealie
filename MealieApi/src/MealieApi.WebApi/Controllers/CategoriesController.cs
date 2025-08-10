using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing recipe categories
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IRepository<Category> _categoryRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(
        IRepository<Category> categoryRepository,
        IMapper mapper,
        ILogger<CategoriesController> logger)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all categories
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(CancellationToken cancellationToken = default)
    {
        try
        {
            var categories = await _categoryRepository.GetAllAsync(cancellationToken);
            var categoryDtos = _mapper.Map<IEnumerable<CategoryDto>>(categories);
            return Ok(categoryDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, "An error occurred while retrieving categories");
        }
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            var categoryDto = _mapper.Map<CategoryDto>(category);
            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category {CategoryId}", id);
            return StatusCode(500, "An error occurred while retrieving the category");
        }
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateContentItemDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (createDto.ContentItemType != Domain.Enums.ContentItemType.Category)
            {
                return BadRequest("ContentItemType must be Category");
            }

            var category = new Category
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                Icon = createDto.Icon,
                SortOrder = createDto.SortOrder,
                Slug = createDto.Name.ToLowerInvariant().Replace(" ", "-")
            };

            var createdCategory = await _categoryRepository.AddAsync(category, cancellationToken);
            await _categoryRepository.SaveChangesAsync(cancellationToken);

            var categoryDto = _mapper.Map<CategoryDto>(createdCategory);
            return CreatedAtAction(nameof(GetCategory), new { id = categoryDto.Id }, categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, "An error occurred while creating the category");
        }
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateContentItemDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                category.Name = updateDto.Name;
                category.Slug = updateDto.Name.ToLowerInvariant().Replace(" ", "-");
            }
            if (updateDto.Description != null) category.Description = updateDto.Description;
            if (updateDto.Color != null) category.Color = updateDto.Color;
            if (updateDto.Icon != null) category.Icon = updateDto.Icon;
            if (updateDto.SortOrder.HasValue) category.SortOrder = updateDto.SortOrder.Value;
            if (updateDto.IsActive.HasValue) category.IsActive = updateDto.IsActive.Value;

            category.UpdatedAt = DateTime.UtcNow;

            await _categoryRepository.UpdateAsync(category, cancellationToken);
            await _categoryRepository.SaveChangesAsync(cancellationToken);

            var categoryDto = _mapper.Map<CategoryDto>(category);
            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId}", id);
            return StatusCode(500, "An error occurred while updating the category");
        }
    }

    /// <summary>
    /// Delete a category
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var category = await _categoryRepository.GetByIdAsync(id, cancellationToken);
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }

            await _categoryRepository.DeleteAsync(category, cancellationToken);
            await _categoryRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId}", id);
            return StatusCode(500, "An error occurred while deleting the category");
        }
    }
}
