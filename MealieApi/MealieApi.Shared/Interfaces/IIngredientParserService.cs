using MealieApi.Shared.DTOs;

namespace MealieApi.Shared.Interfaces
{
    public interface IIngredientParserService
    {
        /// <summary>
        /// Parse a single ingredient
        /// </summary>
        Task<ParsedIngredient> ParseIngredientAsync(string ingredient, string? parser = null);

        /// <summary>
        /// Parse multiple ingredients
        /// </summary>
        Task<List<ParsedIngredient>> ParseIngredientsAsync(List<string> ingredients, string? parser = null);

        /// <summary>
        /// Get available parser types
        /// </summary>
        List<string> GetAvailableParserTypes();
    }
}
