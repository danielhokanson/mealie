using MealieApi.Domain.Entities.Users;

namespace MealieApi.Domain.Interfaces;

/// <summary>
/// Repository interface for User entities with TPH-specific methods
/// </summary>
public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<StandardUser>> GetStandardUsersAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<AdminUser>> GetAdminUsersAsync(CancellationToken cancellationToken = default);
    Task<bool> IsUsernameAvailableAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> IsEmailAvailableAsync(string email, CancellationToken cancellationToken = default);
}
