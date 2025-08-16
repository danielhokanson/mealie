using System;
using MealieApi.Domain.Common;
using MealieApi.Domain.Entities.Recipe;
using MealieApi.Domain.Entities.Organization;
using MealieApi.Domain.Entities.Users;

namespace MealieApi.Domain.Entities
{
    public class MealPlan : BaseEntity
    {
        public DateTime Date { get; set; }
        public string EntryType { get; set; } = string.Empty; // breakfast, lunch, dinner, snack, side
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        
        public Guid? RecipeId { get; set; }
        public virtual Recipe.Recipe? Recipe { get; set; }
        
        public Guid GroupId { get; set; }
        public virtual Group? Group { get; set; }
        
        public Guid? HouseholdId { get; set; }
        public virtual Household? Household { get; set; }
        
        public Guid UserId { get; set; }
        public virtual User? User { get; set; }
    }
}