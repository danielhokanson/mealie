namespace MealieApi.Shared.DTOs
{
    public class ParsedIngredient
    {
        public string? Input { get; set; }
        public IngredientConfidence? Confidence { get; set; }
        public RecipeIngredient Ingredient { get; set; } = new();
    }

    public class IngredientConfidence
    {
        public double? Average { get; set; }
        public double? Comment { get; set; }
        public double? Name { get; set; }
        public double? Unit { get; set; }
        public double? Quantity { get; set; }
        public double? Food { get; set; }
    }

    public class RecipeIngredient
    {
        public double? Quantity { get; set; }
        public IngredientUnit? Unit { get; set; }
        public IngredientFood? Food { get; set; }
        public string? Note { get; set; }
        public bool? IsFood { get; set; }
        public bool DisableAmount { get; set; }
        public string Display { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? OriginalText { get; set; }
        public string? ReferenceId { get; set; }
    }

    public class IngredientUnit
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? PluralName { get; set; }
        public string? Description { get; set; }
        public bool Fraction { get; set; }
        public string? Abbreviation { get; set; }
        public string? PluralAbbreviation { get; set; }
        public bool UseAbbreviation { get; set; }
        public List<IngredientUnitAlias> Aliases { get; set; } = new();
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class IngredientUnitAlias
    {
        public string Name { get; set; } = string.Empty;
    }

    public class IngredientFood
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? PluralName { get; set; }
        public string? Description { get; set; }
        public string? LabelId { get; set; }
        public List<IngredientFoodAlias> Aliases { get; set; } = new();
        public List<string> HouseholdsWithIngredientFood { get; set; } = new();
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class IngredientFoodAlias
    {
        public string Name { get; set; } = string.Empty;
    }
}
