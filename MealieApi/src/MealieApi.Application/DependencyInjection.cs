using Microsoft.Extensions.DependencyInjection;
using MealieApi.Application.Mapping;

namespace MealieApi.Application;

/// <summary>
/// Dependency injection configuration for the Application layer
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Add AutoMapper
        services.AddAutoMapper(typeof(MappingProfile));

        return services;
    }
}
