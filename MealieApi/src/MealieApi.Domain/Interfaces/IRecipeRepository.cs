using MealieApi.Domain.Entities.Recipe;

namespace MealieApi.Domain.Interfaces;

/// <summary>
/// Repository interface for Recipe entities with TPH-specific methods
/// </summary>
public interface IRecipeRepository : IRepository<Recipe>
{
    Task<Recipe?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<IEnumerable<PublicRecipe>> GetPublicRecipesAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<PrivateRecipe>> GetPrivateRecipesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recipe>> GetRecipesByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recipe>> GetRecipesByTagAsync(Guid tagId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recipe>> GetRecipesByToolAsync(Guid toolId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recipe>> GetRandomRecipesAsync(int count, CancellationToken cancellationToken = default);
    Task<IEnumerable<Recipe>> SearchRecipesAsync(string searchTerm, CancellationToken cancellationToken = default);
}
