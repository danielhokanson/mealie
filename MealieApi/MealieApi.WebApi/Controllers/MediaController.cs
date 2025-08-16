using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using System.Threading.Tasks;
using MealieApi.Shared.Interfaces;
using MealieApi.Shared.DTOs;
using MealieApi.Infrastructure.Services;

namespace MealieApi.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MediaController : BaseController
    {
        private readonly IMediaService _mediaService;
        private readonly ILogger<MediaController> _logger;

        public MediaController(IMediaService mediaService, ILogger<MediaController> logger)
        {
            _mediaService = mediaService;
            _logger = logger;
        }

        /// <summary>
        /// Upload a recipe image
        /// </summary>
        [HttpPost("recipes/{recipeId}/images")]
        public async Task<ActionResult<MediaUploadResponse>> UploadRecipeImage(
            string recipeId, 
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file provided");

                if (!IsValidImageFile(file))
                    return BadRequest("Invalid file type. Only images are allowed.");

                var result = await _mediaService.UploadRecipeImageAsync(recipeId, new FormFileAdapter(file));
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading recipe image for recipe {RecipeId}", recipeId);
                return StatusCode(500, "An error occurred while uploading the image");
            }
        }

        /// <summary>
        /// Get a recipe image by type
        /// </summary>
        [HttpGet("recipes/{recipeId}/images/{imageType}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecipeImage(string recipeId, string imageType = "original")
        {
            try
            {
                var imagePath = await _mediaService.GetRecipeImagePathAsync(recipeId, imageType);
                if (string.IsNullOrEmpty(imagePath) || !System.IO.File.Exists(imagePath))
                    return NotFound();

                var contentType = GetContentType(imagePath);
                var fileBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recipe image for recipe {RecipeId}", recipeId);
                return StatusCode(500, "An error occurred while retrieving the image");
            }
        }

        /// <summary>
        /// Upload a user profile image
        /// </summary>
        [HttpPost("users/{userId}/profile-image")]
        public async Task<ActionResult<MediaUploadResponse>> UploadUserProfileImage(
            string userId, 
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file provided");

                if (!IsValidImageFile(file))
                    return BadRequest("Invalid file type. Only images are allowed.");

                var result = await _mediaService.UploadUserProfileImageAsync(userId, new FormFileAdapter(file));
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading user profile image for user {UserId}", userId);
                return StatusCode(500, "An error occurred while uploading the image");
            }
        }

        /// <summary>
        /// Get a user profile image
        /// </summary>
        [HttpGet("users/{userId}/profile-image")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserProfileImage(string userId)
        {
            try
            {
                var imagePath = await _mediaService.GetUserProfileImagePathAsync(userId);
                if (string.IsNullOrEmpty(imagePath) || !System.IO.File.Exists(imagePath))
                    return NotFound();

                var contentType = GetContentType(imagePath);
                var fileBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user profile image for user {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving the image");
            }
        }

        /// <summary>
        /// Delete a recipe image
        /// </summary>
        [HttpDelete("recipes/{recipeId}/images/{imageType}")]
        public async Task<ActionResult> DeleteRecipeImage(string recipeId, string imageType)
        {
            try
            {
                await _mediaService.DeleteRecipeImageAsync(recipeId, imageType);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting recipe image for recipe {RecipeId}", recipeId);
                return StatusCode(500, "An error occurred while deleting the image");
            }
        }

        /// <summary>
        /// Get recipe assets
        /// </summary>
        [HttpGet("recipes/{recipeId}/assets/{fileName}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecipeAsset(string recipeId, string fileName)
        {
            try
            {
                var assetPath = await _mediaService.GetRecipeAssetPathAsync(recipeId, fileName);
                if (string.IsNullOrEmpty(assetPath) || !System.IO.File.Exists(assetPath))
                    return NotFound();

                var contentType = GetContentType(assetPath);
                var fileBytes = await System.IO.File.ReadAllBytesAsync(assetPath);
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recipe asset for recipe {RecipeId}", recipeId);
                return StatusCode(500, "An error occurred while retrieving the asset");
            }
        }

        private bool IsValidImageFile(IFormFile file)
        {
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif" };
            return allowedTypes.Contains(file.ContentType.ToLower());
        }

        private string GetContentType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".webp" => "image/webp",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }
}

