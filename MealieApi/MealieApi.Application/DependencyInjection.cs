using Microsoft.Extensions.DependencyInjection;
using MealieApi.Application.Mapping;
using MealieApi.Application.Services;

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

        // Add Application Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordService, PasswordService>();

        return services;
    }
}
