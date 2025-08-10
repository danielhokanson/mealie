using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing cooking tools
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ToolsController : ControllerBase
{
    private readonly IRepository<Tool> _toolRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ToolsController> _logger;

    public ToolsController(
        IRepository<Tool> toolRepository,
        IMapper mapper,
        ILogger<ToolsController> logger)
    {
        _toolRepository = toolRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all tools
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ToolDto>>> GetTools(CancellationToken cancellationToken = default)
    {
        try
        {
            var tools = await _toolRepository.GetAllAsync(cancellationToken);
            var toolDtos = _mapper.Map<IEnumerable<ToolDto>>(tools);
            return Ok(toolDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tools");
            return StatusCode(500, "An error occurred while retrieving tools");
        }
    }

    /// <summary>
    /// Get a specific tool by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ToolDto>> GetTool(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var tool = await _toolRepository.GetByIdAsync(id, cancellationToken);
            if (tool == null)
            {
                return NotFound($"Tool with ID {id} not found");
            }

            var toolDto = _mapper.Map<ToolDto>(tool);
            return Ok(toolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tool {ToolId}", id);
            return StatusCode(500, "An error occurred while retrieving the tool");
        }
    }

    /// <summary>
    /// Create a new tool
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ToolDto>> CreateTool([FromBody] CreateContentItemDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (createDto.ContentItemType != Domain.Enums.ContentItemType.Tool)
            {
                return BadRequest("ContentItemType must be Tool");
            }

            var tool = new Tool
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                Icon = createDto.Icon,
                SortOrder = createDto.SortOrder,
                Slug = createDto.Name.ToLowerInvariant().Replace(" ", "-")
            };

            var createdTool = await _toolRepository.AddAsync(tool, cancellationToken);
            await _toolRepository.SaveChangesAsync(cancellationToken);

            var toolDto = _mapper.Map<ToolDto>(createdTool);
            return CreatedAtAction(nameof(GetTool), new { id = toolDto.Id }, toolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tool");
            return StatusCode(500, "An error occurred while creating the tool");
        }
    }

    /// <summary>
    /// Update an existing tool
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ToolDto>> UpdateTool(Guid id, [FromBody] UpdateContentItemDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var tool = await _toolRepository.GetByIdAsync(id, cancellationToken);
            if (tool == null)
            {
                return NotFound($"Tool with ID {id} not found");
            }

            // Update properties if provided
            if (!string.IsNullOrEmpty(updateDto.Name))
            {
                tool.Name = updateDto.Name;
                tool.Slug = updateDto.Name.ToLowerInvariant().Replace(" ", "-");
            }
            if (updateDto.Description != null) tool.Description = updateDto.Description;
            if (updateDto.Color != null) tool.Color = updateDto.Color;
            if (updateDto.Icon != null) tool.Icon = updateDto.Icon;
            if (updateDto.SortOrder.HasValue) tool.SortOrder = updateDto.SortOrder.Value;
            if (updateDto.IsActive.HasValue) tool.IsActive = updateDto.IsActive.Value;

            tool.UpdatedAt = DateTime.UtcNow;

            await _toolRepository.UpdateAsync(tool, cancellationToken);
            await _toolRepository.SaveChangesAsync(cancellationToken);

            var toolDto = _mapper.Map<ToolDto>(tool);
            return Ok(toolDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tool {ToolId}", id);
            return StatusCode(500, "An error occurred while updating the tool");
        }
    }

    /// <summary>
    /// Delete a tool
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTool(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var tool = await _toolRepository.GetByIdAsync(id, cancellationToken);
            if (tool == null)
            {
                return NotFound($"Tool with ID {id} not found");
            }

            await _toolRepository.DeleteAsync(tool, cancellationToken);
            await _toolRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tool {ToolId}", id);
            return StatusCode(500, "An error occurred while deleting the tool");
        }
    }
}
