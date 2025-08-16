using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing recipe tags
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly IRepository<Tag> _tagRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<TagsController> _logger;

    public TagsController(
        IRepository<Tag> tagRepository,
        IMapper mapper,
        ILogger<TagsController> logger)
    {
        _tagRepository = tagRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all tags
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagDto>>> GetTags(CancellationToken cancellationToken = default)
    {
        try
        {
            var tags = await _tagRepository.GetAllAsync(cancellationToken);
            var tagDtos = _mapper.Map<IEnumerable<TagDto>>(tags);
            return Ok(tagDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tags");
            return StatusCode(500, "An error occurred while retrieving tags");
        }
    }

    /// <summary>
    /// Get a specific tag by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TagDto>> GetTag(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var tag = await _tagRepository.GetByIdAsync(id, cancellationToken);
            if (tag == null)
            {
                return NotFound($"Tag with ID {id} not found");
            }

            var tagDto = _mapper.Map<TagDto>(tag);
            return Ok(tagDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tag {TagId}", id);
            return StatusCode(500, "An error occurred while retrieving the tag");
        }
    }

    /// <summary>
    /// Create a new tag
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TagDto>> CreateTag([FromBody] CreateContentItemDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (createDto.ContentItemType != Domain.Enums.ContentItemType.Tag)
            {
                return BadRequest("ContentItemType must be Tag");
            }

            var tag = new Tag
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                Icon = createDto.Icon,
                SortOrder = createDto.SortOrder,
                Slug = createDto.Name.ToLowerInvariant().Replace(" ", "-")
            };

            var createdTag = await _tagRepository.AddAsync(tag, cancellationToken);
            await _tagRepository.SaveChangesAsync(cancellationToken);

            var tagDto = _mapper.Map<TagDto>(createdTag);
            return CreatedAtAction(nameof(GetTag), new { id = tagDto.Id }, tagDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tag");
            return StatusCode(500, "An error occurred while creating the tag");
        }
    }

    /// <summary>
    /// Update an existing tag
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TagDto>> UpdateTag(Guid id, [FromBody] UpdateContentItemDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var tag = await _tagRepository.GetByIdAsync(id, cancellationToken);
            if (tag == null)
            {
                return NotFound($"Tag with ID {id} not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                tag.Name = updateDto.Name;
                tag.Slug = updateDto.Name.ToLowerInvariant().Replace(" ", "-");
            }
            if (updateDto.Description != null) tag.Description = updateDto.Description;
            if (updateDto.Color != null) tag.Color = updateDto.Color;
            if (updateDto.Icon != null) tag.Icon = updateDto.Icon;
            if (updateDto.SortOrder.HasValue) tag.SortOrder = updateDto.SortOrder.Value;
            if (updateDto.IsActive.HasValue) tag.IsActive = updateDto.IsActive.Value;

            tag.UpdatedAt = DateTime.UtcNow;

            await _tagRepository.UpdateAsync(tag, cancellationToken);
            await _tagRepository.SaveChangesAsync(cancellationToken);

            var tagDto = _mapper.Map<TagDto>(tag);
            return Ok(tagDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tag {TagId}", id);
            return StatusCode(500, "An error occurred while updating the tag");
        }
    }

    /// <summary>
    /// Delete a tag
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTag(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var tag = await _tagRepository.GetByIdAsync(id, cancellationToken);
            if (tag == null)
            {
                return NotFound($"Tag with ID {id} not found");
            }

            await _tagRepository.DeleteAsync(tag, cancellationToken);
            await _tagRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tag {TagId}", id);
            return StatusCode(500, "An error occurred while deleting the tag");
        }
    }
}
