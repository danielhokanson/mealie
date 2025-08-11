using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MealieApi.Domain.Common;

namespace MealieApi.Domain.Entities.Recipe
{
    public class RecipeTag : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? Slug { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(7)]
        public string? Color { get; set; } // Hex color code
        
        // Navigation properties
        public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
        public virtual ICollection<MealPlanRule> MealPlanRules { get; set; } = new List<MealPlanRule>();
    }
}