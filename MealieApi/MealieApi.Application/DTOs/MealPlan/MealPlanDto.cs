using System;

namespace MealieApi.Application.DTOs.MealPlan
{
    public class MealPlanDto
    {
        public Guid Id { get; set; }
        public DateTime Date { get; set; }
        public string EntryType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public Guid? RecipeId { get; set; }
        public object? Recipe { get; set; } // Will be populated with RecipeDto when needed
        public Guid GroupId { get; set; }
        public Guid? HouseholdId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateMealPlanDto
    {
        public DateTime Date { get; set; }
        public string EntryType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public Guid? RecipeId { get; set; }
    }

    public class UpdateMealPlanDto
    {
        public DateTime? Date { get; set; }
        public string? EntryType { get; set; }
        public string? Title { get; set; }
        public string? Text { get; set; }
        public Guid? RecipeId { get; set; }
    }

    public class MealPlanQueryDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? HouseholdId { get; set; }
        public Guid? GroupId { get; set; }
        public string? EntryType { get; set; }
    }

    public class BulkCreateMealPlansDto
    {
        public List<CreateMealPlanDto> MealPlans { get; set; } = new();
    }

    public class CopyMealPlanDto
    {
        public DateTime TargetDate { get; set; }
    }
}