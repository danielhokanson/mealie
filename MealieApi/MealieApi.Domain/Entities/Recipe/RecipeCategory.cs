using System;
using System.Collections.Generic;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Recipe
{
    public class RecipeCategory : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        
        // Navigation properties
        public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
        public virtual ICollection<MealPlanRule> MealPlanRules { get; set; } = new List<MealPlanRule>();
    }
}