using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs;

/// <summary>
/// Request DTO for testing URL scraping
/// </summary>
public class TestScrapeRequest
{
    [Required]
    [Url]
    public string Url { get; set; } = string.Empty;
}
