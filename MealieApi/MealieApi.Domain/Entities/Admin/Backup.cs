using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Admin;

/// <summary>
/// Backup entity for system backups
/// </summary>
public class Backup : AuditableEntity
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [StringLength(500)]
    public string FilePath { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    [StringLength(50)]
    public string Status { get; set; } = "Created";
    
    public DateTime? CompletedAt { get; set; }
    
    /// <summary>
    /// Date when the backup was created
    /// </summary>
    public DateTime BackupDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Backup metadata stored as JSON
    /// </summary>
    public string? Metadata { get; set; }
}
