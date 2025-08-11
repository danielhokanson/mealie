using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MealieApi.Domain.Interfaces;
using MealieApi.Infrastructure.Data;
using MealieApi.Infrastructure.Repositories;

namespace MealieApi.Infrastructure;

/// <summary>
/// Dependency injection configuration for the Infrastructure layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Entity Framework DbContext
        services.AddDbContext<MealieDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Register repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRecipeRepository, RecipeRepository>();

        return services;
    }
}
