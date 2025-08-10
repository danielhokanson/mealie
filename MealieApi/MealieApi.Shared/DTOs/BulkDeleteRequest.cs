using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for bulk delete operations
/// </summary>
public class BulkDeleteRequest
{
    [Required]
    [MinLength(1)]
    public List<Guid> Ids { get; set; } = new();
}
