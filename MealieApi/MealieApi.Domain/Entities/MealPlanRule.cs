using System;
using System.Collections.Generic;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Entities.Recipe;

namespace MealieApi.Domain.Entities
{
    public class MealPlanRule : BaseEntity
    {
        public Guid GroupId { get; set; }
        public virtual Group? Group { get; set; }
        
        public Guid? HouseholdId { get; set; }
        public virtual Household? Household { get; set; }
        
        public string Day { get; set; } = "unset"; // MONDAY, TUESDAY, WEDNESDAY, etc.
        public string EntryType { get; set; } = string.Empty; // breakfast, lunch, dinner, snack, side
        public string QueryFilterString { get; set; } = string.Empty;
        
        // Navigation properties for many-to-many relationships
        public virtual ICollection<RecipeCategory> Categories { get; set; } = new List<RecipeCategory>();
        public virtual ICollection<RecipeTag> Tags { get; set; } = new List<RecipeTag>();
        public virtual ICollection<Household> Households { get; set; } = new List<Household>();
    }
}