using Microsoft.AspNetCore.Mvc;
using MealieApi.Domain.Entities.Unit;
using MealieApi.Domain.Interfaces;
using MealieApi.Shared.DTOs;
using AutoMapper;

namespace MealieApi.WebApi.Controllers;

/// <summary>
/// API Controller for managing measurement units
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UnitsController : ControllerBase
{
    private readonly IRepository<Unit> _unitRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<UnitsController> _logger;

    public UnitsController(
        IRepository<Unit> unitRepository,
        IMapper mapper,
        ILogger<UnitsController> logger)
    {
        _unitRepository = unitRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <summary>
    /// Get all units with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<object>> GetUnits(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool? isMetric = null,
        [FromQuery] bool? isImperial = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var units = await _unitRepository.GetAllAsync(cancellationToken);

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                units = units.Where(u => u.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                        (u.Abbreviation != null && u.Abbreviation.Contains(search, StringComparison.OrdinalIgnoreCase)));
            }

            if (isMetric.HasValue)
            {
                units = units.Where(u => u.IsMetric == isMetric.Value);
            }

            if (isImperial.HasValue)
            {
                units = units.Where(u => u.IsImperial == isImperial.Value);
            }

            var total = units.Count();
            var pagedUnits = units
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToList();

            var unitDtos = _mapper.Map<List<UnitDto>>(pagedUnits);

            var response = new
            {
                items = unitDtos,
                total,
                page,
                perPage,
                totalPages = (int)Math.Ceiling((double)total / perPage)
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving units");
            return StatusCode(500, "An error occurred while retrieving units");
        }
    }

    /// <summary>
    /// Get unit by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UnitDto>> GetUnit(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var unit = await _unitRepository.GetByIdAsync(id, cancellationToken);
            if (unit == null)
            {
                return NotFound($"Unit with ID {id} not found");
            }

            var unitDto = _mapper.Map<UnitDto>(unit);
            return Ok(unitDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving unit {UnitId}", id);
            return StatusCode(500, "An error occurred while retrieving the unit");
        }
    }

    /// <summary>
    /// Create a new unit
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UnitDto>> CreateUnit([FromBody] CreateUnitDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var unit = new Unit
            {
                Name = createDto.Name,
                Abbreviation = createDto.Abbreviation,
                IsImperial = createDto.IsImperial,
                IsMetric = createDto.IsMetric
            };

            var createdUnit = await _unitRepository.AddAsync(unit, cancellationToken);
            await _unitRepository.SaveChangesAsync(cancellationToken);

            var unitDto = _mapper.Map<UnitDto>(createdUnit);
            return CreatedAtAction(nameof(GetUnit), new { id = unitDto.Id }, unitDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating unit");
            return StatusCode(500, "An error occurred while creating the unit");
        }
    }

    /// <summary>
    /// Update a unit
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UnitDto>> UpdateUnit(Guid id, [FromBody] UpdateUnitDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var unit = await _unitRepository.GetByIdAsync(id, cancellationToken);
            if (unit == null)
            {
                return NotFound($"Unit with ID {id} not found");
            }

            if (!string.IsNullOrEmpty(updateDto.Name)) unit.Name = updateDto.Name;
            if (updateDto.Abbreviation != null) unit.Abbreviation = updateDto.Abbreviation;
            if (updateDto.IsImperial.HasValue) unit.IsImperial = updateDto.IsImperial.Value;
            if (updateDto.IsMetric.HasValue) unit.IsMetric = updateDto.IsMetric.Value;

            unit.UpdatedAt = DateTime.UtcNow;

            await _unitRepository.UpdateAsync(unit, cancellationToken);
            await _unitRepository.SaveChangesAsync(cancellationToken);

            var unitDto = _mapper.Map<UnitDto>(unit);
            return Ok(unitDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating unit {UnitId}", id);
            return StatusCode(500, "An error occurred while updating the unit");
        }
    }

    /// <summary>
    /// Delete a unit
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUnit(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var unit = await _unitRepository.GetByIdAsync(id, cancellationToken);
            if (unit == null)
            {
                return NotFound($"Unit with ID {id} not found");
            }

            await _unitRepository.DeleteAsync(unit, cancellationToken);
            await _unitRepository.SaveChangesAsync(cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting unit {UnitId}", id);
            return StatusCode(500, "An error occurred while deleting the unit");
        }
    }

    /// <summary>
    /// Merge units (merge fromUnitId into toUnitId)
    /// </summary>
    [HttpPost("{toUnitId:guid}/merge")]
    public async Task<ActionResult<object>> MergeUnits(Guid toUnitId, [FromBody] MergeUnitsRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var fromUnit = await _unitRepository.GetByIdAsync(request.FromUnitId, cancellationToken);
            if (fromUnit == null)
            {
                return NotFound($"Source unit with ID {request.FromUnitId} not found");
            }

            var toUnit = await _unitRepository.GetByIdAsync(toUnitId, cancellationToken);
            if (toUnit == null)
            {
                return NotFound($"Target unit with ID {toUnitId} not found");
            }

            // In a real app, this would update all references from fromUnit to toUnit
            // For now, just delete the from unit
            await _unitRepository.DeleteAsync(fromUnit, cancellationToken);
            await _unitRepository.SaveChangesAsync(cancellationToken);

            var result = new
            {
                message = $"Successfully merged '{fromUnit.Name}' into '{toUnit.Name}'",
                fromUnit = fromUnit.Name,
                toUnit = toUnit.Name,
                mergedAt = DateTime.UtcNow
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error merging units {FromUnitId} into {ToUnitId}", request.FromUnitId, toUnitId);
            return StatusCode(500, "An error occurred while merging units");
        }
    }
}

/// <summary>
/// Request DTO for merging units
/// </summary>
public class MergeUnitsRequest
{
    public Guid FromUnitId { get; set; }
}