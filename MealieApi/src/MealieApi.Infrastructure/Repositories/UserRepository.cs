using Microsoft.EntityFrameworkCore;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Interfaces;
using MealieApi.Infrastructure.Data;

namespace MealieApi.Infrastructure.Repositories;

/// <summary>
/// User repository implementation with TPH-specific methods
/// </summary>
public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(MealieDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<IEnumerable<StandardUser>> GetStandardUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.StandardUsers.ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<AdminUser>> GetAdminUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.AdminUsers.ToListAsync(cancellationToken);
    }

    public async Task<bool> IsUsernameAvailableAsync(string username, CancellationToken cancellationToken = default)
    {
        return !await _dbSet.AnyAsync(u => u.Username == username, cancellationToken);
    }

    public async Task<bool> IsEmailAvailableAsync(string email, CancellationToken cancellationToken = default)
    {
        return !await _dbSet.AnyAsync(u => u.Email == email, cancellationToken);
    }
}
