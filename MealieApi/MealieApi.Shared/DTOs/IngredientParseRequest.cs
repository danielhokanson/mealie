using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs
{
    public class IngredientParseRequest
    {
        public string Ingredient { get; set; } = string.Empty;
        public string? Parser { get; set; }
    }

    public static class ParserTypes
    {
        public const string NLP = "nlp";
        public const string Brute = "brute";
        public const string OpenAI = "openai";
    }
}

