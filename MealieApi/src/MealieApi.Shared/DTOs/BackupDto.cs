namespace MealieApi.Shared.DTOs;

/// <summary>
/// DTO for backup information
/// </summary>
public class BackupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public long FileSize { get; set; }
    public DateTime BackupDate { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
