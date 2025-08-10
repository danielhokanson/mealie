using AutoMapper;
using MealieApi.Domain.Entities.Users;
using MealieApi.Domain.Entities.Recipe;
using MealieApi.Domain.Entities.Content;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Entities.ShoppingList;
using MealieApi.Shared.DTOs;
using System.Text.Json;

namespace MealieApi.Application.Mapping;

/// <summary>
/// AutoMapper profile for mapping between domain entities and DTOs
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateUserMappings();
        CreateRecipeMappings();
        CreateContentMappings();
        CreateOrganizationMappings();
        CreateShoppingListMappings();
    }

    private void CreateUserMappings()
    {
        CreateMap<User, UserDto>();
        CreateMap<StandardUser, UserDto>();
        CreateMap<AdminUser, UserDto>();
        
        CreateMap<CreateUserDto, StandardUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // Password hashing handled separately

        CreateMap<CreateUserDto, AdminUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // Password hashing handled separately
    }

    private void CreateRecipeMappings()
    {
        CreateMap<Recipe, RecipeDto>();
        CreateMap<PublicRecipe, RecipeDto>();
        CreateMap<PrivateRecipe, RecipeDto>();
        
        CreateMap<CreateRecipeDto, PublicRecipe>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Categories, opt => opt.Ignore())
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .ForMember(dest => dest.Tools, opt => opt.Ignore())
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => CreateSlug(src.Name)));

        CreateMap<CreateRecipeDto, PrivateRecipe>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Categories, opt => opt.Ignore())
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .ForMember(dest => dest.Tools, opt => opt.Ignore())
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => CreateSlug(src.Name)));
    }

    private void CreateContentMappings()
    {
        CreateMap<ContentItem, ContentItemDto>();
        
        CreateMap<Category, CategoryDto>();
        
        CreateMap<Tag, TagDto>()
            .ForMember(dest => dest.Aliases, opt => opt.MapFrom(src => 
                DeserializeStringList(src.Aliases)));
        
        CreateMap<Tool, ToolDto>()
            .ForMember(dest => dest.Alternatives, opt => opt.MapFrom(src => 
                DeserializeStringList(src.Alternatives)));
    }

    private static string CreateSlug(string name)
    {
        if (string.IsNullOrEmpty(name))
            return string.Empty;
        
        return name.ToLowerInvariant()
                  .Replace(" ", "-")
                  .Replace("'", "")
                  .Replace("\"", "")
                  .Replace("!", "")
                  .Replace("?", "")
                  .Replace(".", "")
                  .Replace(",", "");
    }

    private void CreateOrganizationMappings()
    {
        CreateMap<Organization, OrganizationDto>();
        CreateMap<Group, GroupDto>()
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                DeserializeStringList(src.Tags)));
        CreateMap<Household, HouseholdDto>()
            .ForMember(dest => dest.DietaryRestrictions, opt => opt.MapFrom(src => 
                DeserializeStringList(src.DietaryRestrictions)));
    }

    private void CreateShoppingListMappings()
    {
        CreateMap<ShoppingList, ShoppingListDto>();
        CreateMap<ShoppingListItem, ShoppingListItemDto>();
    }

    private static List<string> DeserializeStringList(string? jsonString)
    {
        if (string.IsNullOrEmpty(jsonString))
            return new List<string>();
        
        try
        {
            return JsonSerializer.Deserialize<List<string>>(jsonString) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}
