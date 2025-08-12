using MealieApi.Shared.DTOs;
using MealieApi.Shared.Interfaces;

namespace MealieApi.Shared.Interfaces
{
    public interface IMediaService
    {
        /// <summary>
        /// Uploads a recipe image and generates different sizes
        /// </summary>
        Task<MediaUploadResponse> UploadRecipeImageAsync(string recipeId, IFileUpload file);

        /// <summary>
        /// Uploads a user profile image
        /// </summary>
        Task<MediaUploadResponse> UploadUserProfileImageAsync(string userId, IFileUpload file);

        /// <summary>
        /// Gets the file path for a recipe image by type
        /// </summary>
        Task<string> GetRecipeImagePathAsync(string recipeId, string imageType);

        /// <summary>
        /// Gets the file path for a user profile image
        /// </summary>
        Task<string> GetUserProfileImagePathAsync(string userId);

        /// <summary>
        /// Gets the file path for a recipe asset
        /// </summary>
        Task<string> GetRecipeAssetPathAsync(string recipeId, string fileName);

        /// <summary>
        /// Deletes a recipe image
        /// </summary>
        Task DeleteRecipeImageAsync(string recipeId, string imageType);

        /// <summary>
        /// Validates if a file is a valid image
        /// </summary>
        bool IsValidImageFile(IFileUpload file);

        /// <summary>
        /// Generates thumbnail versions of an image
        /// </summary>
        Task GenerateImageThumbnailsAsync(string originalImagePath, string outputDirectory);
    }
}
