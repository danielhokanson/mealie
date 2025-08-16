using System.ComponentModel.DataAnnotations;

namespace MealieApi.Shared.DTOs
{
    public class IngredientsParseRequest
    {
        [Required]
        public List<string> Ingredients { get; set; } = new();
        
        public string Parser { get; set; } = "nlp";
    }
}

