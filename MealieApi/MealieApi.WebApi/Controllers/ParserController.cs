using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MealieApi.Shared.Interfaces;
using MealieApi.Shared.DTOs;

namespace MealieApi.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ParserController : BaseController
    {
        private readonly IIngredientParserService _ingredientParserService;
        private readonly ILogger<ParserController> _logger;

        public ParserController(IIngredientParserService ingredientParserService, ILogger<ParserController> logger)
        {
            _ingredientParserService = ingredientParserService;
            _logger = logger;
        }

        /// <summary>
        /// Parse a single ingredient
        /// </summary>
        [HttpPost("ingredient")]
        public async Task<ActionResult<ParsedIngredient>> ParseIngredient([FromBody] IngredientParseRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Ingredient))
                {
                    return BadRequest("Ingredient text is required");
                }

                var result = await _ingredientParserService.ParseIngredientAsync(request.Ingredient, request.Parser);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing ingredient: {Ingredient}", request.Ingredient);
                return StatusCode(500, "An error occurred while parsing the ingredient");
            }
        }

        /// <summary>
        /// Parse multiple ingredients
        /// </summary>
        [HttpPost("ingredients")]
        public async Task<ActionResult<List<ParsedIngredient>>> ParseIngredients([FromBody] IngredientsParseRequest request)
        {
            try
            {
                if (request.Ingredients == null || !request.Ingredients.Any())
                {
                    return BadRequest("Ingredients list is required");
                }

                var results = await _ingredientParserService.ParseIngredientsAsync(request.Ingredients, request.Parser);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing ingredients");
                return StatusCode(500, "An error occurred while parsing the ingredients");
            }
        }

        /// <summary>
        /// Get available parser types
        /// </summary>
        [HttpGet("types")]
        public ActionResult<List<string>> GetParserTypes()
        {
            try
            {
                var parserTypes = _ingredientParserService.GetAvailableParserTypes();
                return Ok(parserTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting parser types");
                return StatusCode(500, "An error occurred while getting parser types");
            }
        }
    }
}

