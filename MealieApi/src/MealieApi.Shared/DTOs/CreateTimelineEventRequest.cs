using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for creating a timeline event
/// </summary>
public class CreateTimelineEventRequest
{
    [Required]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime EventDate { get; set; } = DateTime.UtcNow;

    public string? EventData { get; set; }

    [Required]
    public Guid RecipeId { get; set; }
}
