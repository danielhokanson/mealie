namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for Unit entities
/// </summary>
public class UnitDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; }
    public decimal? ConversionFactor { get; set; }
    public bool IsMetric { get; set; }
    public bool IsImperial { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating units
/// </summary>
public class CreateUnitDto
{
    public string Name { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal? ConversionFactor { get; set; }
    public bool IsMetric { get; set; } = false;
    public bool IsImperial { get; set; } = false;
}

/// <summary>
/// DTO for updating units
/// </summary>
public class UpdateUnitDto
{
    public string? Name { get; set; }
    public string? Abbreviation { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool? IsActive { get; set; }
    public decimal? ConversionFactor { get; set; }
    public bool? IsMetric { get; set; }
    public bool? IsImperial { get; set; }
}
