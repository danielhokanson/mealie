using Microsoft.EntityFrameworkCore;
using MealieApi.Domain.Entities.Recipe;
using MealieApi.Domain.Interfaces;
using MealieApi.Infrastructure.Data;

namespace MealieApi.Infrastructure.Repositories;

/// <summary>
/// Recipe repository implementation with TPH-specific methods
/// </summary>
public class RecipeRepository : Repository<Recipe>, IRecipeRepository
{
    public RecipeRepository(MealieDbContext context) : base(context)
    {
    }

    public async Task<Recipe?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .FirstOrDefaultAsync(r => r.Slug == slug, cancellationToken);
    }

    public async Task<IEnumerable<PublicRecipe>> GetPublicRecipesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PublicRecipes
            .Include(r => r.User)
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .Where(r => r.IsPublished)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<PrivateRecipe>> GetPrivateRecipesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.PrivateRecipes
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .Where(r => r.UserId == userId && !r.IsArchived)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recipe>> GetRecipesByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .Where(r => r.Categories.Any(c => c.Id == categoryId))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recipe>> GetRecipesByTagAsync(Guid tagId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .Where(r => r.Tags.Any(t => t.Id == tagId))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recipe>> GetRecipesByToolAsync(Guid toolId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .Where(r => r.Tools.Any(t => t.Id == toolId))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recipe>> GetRandomRecipesAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .OrderBy(r => Guid.NewGuid()) // Simple random ordering - not efficient for large datasets
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Recipe>> SearchRecipesAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        
        return await _dbSet
            .Include(r => r.User)
            .Include(r => r.Categories)
            .Include(r => r.Tags)
            .Include(r => r.Tools)
            .Where(r => 
                r.Name.ToLower().Contains(lowerSearchTerm) ||
                (r.Description != null && r.Description.ToLower().Contains(lowerSearchTerm)) ||
                (r.Ingredients != null && r.Ingredients.ToLower().Contains(lowerSearchTerm)) ||
                r.Categories.Any(c => c.Name.ToLower().Contains(lowerSearchTerm)) ||
                r.Tags.Any(t => t.Name.ToLower().Contains(lowerSearchTerm)))
            .ToListAsync(cancellationToken);
    }
}
