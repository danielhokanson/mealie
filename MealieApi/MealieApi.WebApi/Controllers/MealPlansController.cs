using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MealieApi.Application.DTOs.MealPlan;
using MealieApi.Domain.Entities;
using MealieApi.Domain.Entities.Recipe;
using MealieApi.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MealieApi.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/meal-plans")]
    public class MealPlansController : BaseController
    {
        private readonly MealieDbContext _context;

        public MealPlansController(MealieDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MealPlanDto>>> GetMealPlans([FromQuery] MealPlanQueryDto query)
        {
            var queryable = _context.MealPlans
                .Include(mp => mp.Recipe)
                .Where(mp => mp.GroupId == GetGroupId());

            if (query.StartDate.HasValue)
                queryable = queryable.Where(mp => mp.Date >= query.StartDate.Value);

            if (query.EndDate.HasValue)
                queryable = queryable.Where(mp => mp.Date <= query.EndDate.Value);

            if (query.HouseholdId.HasValue)
                queryable = queryable.Where(mp => mp.HouseholdId == query.HouseholdId.Value);

            if (!string.IsNullOrEmpty(query.EntryType))
                queryable = queryable.Where(mp => mp.EntryType == query.EntryType);

            var mealPlans = await queryable.OrderBy(mp => mp.Date).ThenBy(mp => mp.EntryType).ToListAsync();

            return Ok(mealPlans.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MealPlanDto>> GetMealPlan(Guid id)
        {
            var mealPlan = await _context.MealPlans
                .Include(mp => mp.Recipe)
                .FirstOrDefaultAsync(mp => mp.Id == id && mp.GroupId == GetGroupId());

            if (mealPlan == null)
                return NotFound();

            return Ok(MapToDto(mealPlan));
        }

        [HttpGet("today")]
        public async Task<ActionResult<IEnumerable<MealPlanDto>>> GetTodaysMealPlans()
        {
            var today = DateTime.UtcNow.Date;
            var mealPlans = await _context.MealPlans
                .Include(mp => mp.Recipe)
                .Where(mp => mp.GroupId == GetGroupId() && mp.Date == today)
                .OrderBy(mp => mp.EntryType)
                .ToListAsync();

            return Ok(mealPlans.Select(MapToDto));
        }

        [HttpGet("week")]
        public async Task<ActionResult<IEnumerable<MealPlanDto>>> GetWeeklyMealPlans([FromQuery] int weekOffset = 0)
        {
            var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek + (weekOffset * 7));
            var endOfWeek = startOfWeek.AddDays(6);

            var mealPlans = await _context.MealPlans
                .Include(mp => mp.Recipe)
                .Where(mp => mp.GroupId == GetGroupId() && mp.Date >= startOfWeek && mp.Date <= endOfWeek)
                .OrderBy(mp => mp.Date)
                .ThenBy(mp => mp.EntryType)
                .ToListAsync();

            return Ok(mealPlans.Select(MapToDto));
        }

        [HttpPost]
        public async Task<ActionResult<MealPlanDto>> CreateMealPlan(CreateMealPlanDto dto)
        {
            var mealPlan = new MealPlan
            {
                Id = Guid.NewGuid(),
                Date = dto.Date,
                EntryType = dto.EntryType,
                Title = dto.Title,
                Text = dto.Text,
                RecipeId = dto.RecipeId,
                GroupId = GetGroupId(),
                HouseholdId = GetHouseholdId(),
                UserId = GetUserId()
            };

            _context.MealPlans.Add(mealPlan);
            await _context.SaveChangesAsync();

            await _context.Entry(mealPlan).Reference(mp => mp.Recipe).LoadAsync();

            return CreatedAtAction(nameof(GetMealPlan), new { id = mealPlan.Id }, MapToDto(mealPlan));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MealPlanDto>> UpdateMealPlan(Guid id, UpdateMealPlanDto dto)
        {
            var mealPlan = await _context.Set<MealPlan>()
                .FirstOrDefaultAsync(mp => mp.Id == id && mp.GroupId == GetGroupId());

            if (mealPlan == null)
                return NotFound();

            if (dto.Date.HasValue)
                mealPlan.Date = dto.Date.Value;
            if (!string.IsNullOrEmpty(dto.EntryType))
                mealPlan.EntryType = dto.EntryType;
            if (!string.IsNullOrEmpty(dto.Title))
                mealPlan.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Text))
                mealPlan.Text = dto.Text;
            if (dto.RecipeId.HasValue)
                mealPlan.RecipeId = dto.RecipeId.Value;

            mealPlan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _context.Entry(mealPlan).Reference(mp => mp.Recipe).LoadAsync();

            return Ok(MapToDto(mealPlan));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMealPlan(Guid id)
        {
            var mealPlan = await _context.Set<MealPlan>()
                .FirstOrDefaultAsync(mp => mp.Id == id && mp.GroupId == GetGroupId());

            if (mealPlan == null)
                return NotFound();

            _context.Set<MealPlan>().Remove(mealPlan);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<MealPlanDto>>> BulkCreateMealPlans(BulkCreateMealPlansDto dto)
        {
            var mealPlans = new List<MealPlan>();
            var groupId = GetGroupId();
            var householdId = GetHouseholdId();
            var userId = GetUserId();
            var now = DateTime.UtcNow;

            foreach (var planDto in dto.MealPlans)
            {
                var mealPlan = new MealPlan
                {
                    Id = Guid.NewGuid(),
                    Date = planDto.Date,
                    EntryType = planDto.EntryType,
                    Title = planDto.Title,
                    Text = planDto.Text,
                    RecipeId = planDto.RecipeId,
                    GroupId = groupId,
                    HouseholdId = householdId,
                    UserId = userId,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                mealPlans.Add(mealPlan);
            }

            _context.Set<MealPlan>().AddRange(mealPlans);
            await _context.SaveChangesAsync();

            // Load recipes
            var mealPlanIds = mealPlans.Select(mp => mp.Id).ToList();
            var createdPlans = await _context.Set<MealPlan>()
                .Include(mp => mp.Recipe)
                .Where(mp => mealPlanIds.Contains(mp.Id))
                .ToListAsync();

            return Ok(createdPlans.Select(MapToDto));
        }

        [HttpPost("{id}/copy")]
        public async Task<ActionResult<MealPlanDto>> CopyMealPlan(Guid id, CopyMealPlanDto dto)
        {
            var originalPlan = await _context.Set<MealPlan>()
                .FirstOrDefaultAsync(mp => mp.Id == id && mp.GroupId == GetGroupId());

            if (originalPlan == null)
                return NotFound();

            var copiedPlan = new MealPlan
            {
                Id = Guid.NewGuid(),
                Date = dto.TargetDate,
                EntryType = originalPlan.EntryType,
                Title = originalPlan.Title,
                Text = originalPlan.Text,
                RecipeId = originalPlan.RecipeId,
                GroupId = originalPlan.GroupId,
                HouseholdId = originalPlan.HouseholdId,
                UserId = GetUserId(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Set<MealPlan>().Add(copiedPlan);
            await _context.SaveChangesAsync();

            await _context.Entry(copiedPlan).Reference(mp => mp.Recipe).LoadAsync();

            return CreatedAtAction(nameof(GetMealPlan), new { id = copiedPlan.Id }, MapToDto(copiedPlan));
        }

            [HttpGet("suggestions")]
    public async Task<ActionResult<IEnumerable<object>>> GetRandomMealSuggestions([FromQuery] int count = 5)
    {
        var groupId = GetGroupId();
        var recipes = await _context.Recipes
            .Where(r => r.OwnerId != null) // Filter for recipes with owners
            .OrderBy(r => Guid.NewGuid()) // Random order
            .Take(count)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Description,
                PrepTime = r.PrepTimeMinutes,
                CookTime = r.CookTimeMinutes,
                TotalTime = (r.PrepTimeMinutes ?? 0) + (r.CookTimeMinutes ?? 0)
            })
            .ToListAsync();

        return Ok(recipes);
    }

        private MealPlanDto MapToDto(MealPlan mealPlan)
        {
            return new MealPlanDto
            {
                Id = mealPlan.Id,
                Date = mealPlan.Date,
                EntryType = mealPlan.EntryType,
                Title = mealPlan.Title,
                Text = mealPlan.Text,
                RecipeId = mealPlan.RecipeId,
                Recipe = mealPlan.Recipe != null ? new
                {
                    Id = mealPlan.Recipe.Id,
                    Name = mealPlan.Recipe.Name,
                    Description = mealPlan.Recipe.Description
                } : null,
                GroupId = mealPlan.GroupId,
                HouseholdId = mealPlan.HouseholdId,
                UserId = mealPlan.UserId,
                CreatedAt = mealPlan.CreatedAt,
                UpdatedAt = mealPlan.UpdatedAt
            };
        }

        private Guid GetGroupId()
        {
            // Get from user claims
            var groupIdClaim = User.FindFirst("GroupId")?.Value;
            return groupIdClaim != null ? Guid.Parse(groupIdClaim) : Guid.Empty;
        }

        private Guid? GetHouseholdId()
        {
            // Get from user claims
            var householdIdClaim = User.FindFirst("HouseholdId")?.Value;
            return householdIdClaim != null ? Guid.Parse(householdIdClaim) : null;
        }

        private Guid GetUserId()
        {
            // Get from user claims
            var userIdClaim = User.FindFirst("UserId")?.Value;
            return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
        }
    }
}