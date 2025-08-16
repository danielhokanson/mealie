using MealieApi.Domain.Enums;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Base DTO for Organization entities (Groups and Households)
/// </summary>
public class OrganizationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public bool IsActive { get; set; }
    public int MaxMembers { get; set; }
    public string? Settings { get; set; }
    public OrganizationType OrganizationType { get; set; }
    public List<UserDto> Members { get; set; } = new();
    public List<RecipeDto> Recipes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for Group entities
/// </summary>
public class GroupDto : OrganizationDto
{
    public string? GroupType { get; set; }
    public bool IsPublic { get; set; }
    public string? JoinCode { get; set; }
    public DateTime? JoinCodeExpiresAt { get; set; }
    public bool RequiresApproval { get; set; }
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// DTO for Household entities
/// </summary>
public class HouseholdDto : OrganizationDto
{
    public string? Address { get; set; }
    public string? TimeZone { get; set; }
    public string? PreferredUnits { get; set; }
    public decimal? WeeklyBudget { get; set; }
    public List<string> DietaryRestrictions { get; set; } = new();
    public int? DefaultServings { get; set; }
    public string? ShoppingDay { get; set; }
}

/// <summary>
/// DTO for creating organizations
/// </summary>
public class CreateOrganizationDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public OrganizationType OrganizationType { get; set; }
    public int MaxMembers { get; set; } = 10;
}

/// <summary>
/// DTO for updating organizations
/// </summary>
public class UpdateOrganizationDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
    public bool? IsActive { get; set; }
    public int? MaxMembers { get; set; }
}
