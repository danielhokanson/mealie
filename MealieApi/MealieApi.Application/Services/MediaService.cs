using Microsoft.Extensions.Logging;
using MealieApi.Shared.Interfaces;
using MealieApi.Shared.DTOs;
using System.Drawing;
using System.Drawing.Imaging;

namespace MealieApi.Application.Services
{
    public class MediaService : IMediaService
    {
        private readonly ILogger<MediaService> _logger;
        private readonly string _baseMediaPath;
        private readonly string[] _allowedImageTypes = { "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif" };

        public MediaService(ILogger<MediaService> logger, IConfigurationService configurationService)
        {
            _logger = logger;
            _baseMediaPath = configurationService.GetValue("MediaSettings:BasePath", Path.Combine(Directory.GetCurrentDirectory(), "Media"));
            
            // Ensure media directories exist
            EnsureDirectoriesExist();
        }

        public async Task<MediaUploadResponse> UploadRecipeImageAsync(string recipeId, IFileUpload file)
        {
            try
            {
                if (!IsValidImageFile(file))
                {
                    return new MediaUploadResponse
                    {
                        Success = false,
                        Message = "Invalid file type. Only images are allowed."
                    };
                }

                var recipeMediaPath = Path.Combine(_baseMediaPath, "Recipes", recipeId, "Images");
                Directory.CreateDirectory(recipeMediaPath);

                var fileName = $"original{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(recipeMediaPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Generate thumbnails
                await GenerateImageThumbnailsAsync(filePath, recipeMediaPath);

                return new MediaUploadResponse
                {
                    Success = true,
                    Message = "Recipe image uploaded successfully",
                    FilePath = filePath,
                    FileName = fileName,
                    FileSize = file.Length,
                    ContentType = file.ContentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading recipe image for recipe {RecipeId}", recipeId);
                return new MediaUploadResponse
                {
                    Success = false,
                    Message = "An error occurred while uploading the image"
                };
            }
        }

        public async Task<MediaUploadResponse> UploadUserProfileImageAsync(string userId, IFileUpload file)
        {
            try
            {
                if (!IsValidImageFile(file))
                {
                    return new MediaUploadResponse
                    {
                        Success = false,
                        Message = "Invalid file type. Only images are allowed."
                    };
                }

                var userMediaPath = Path.Combine(_baseMediaPath, "Users", userId);
                Directory.CreateDirectory(userMediaPath);

                var fileName = $"profile{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(userMediaPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return new MediaUploadResponse
                {
                    Success = true,
                    Message = "User profile image uploaded successfully",
                    FilePath = filePath,
                    FileName = fileName,
                    FileSize = file.Length,
                    ContentType = file.ContentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading user profile image for user {UserId}", userId);
                return new MediaUploadResponse
                {
                    Success = false,
                    Message = "An error occurred while uploading the image"
                };
            }
        }

        public async Task<string> GetRecipeImagePathAsync(string recipeId, string imageType)
        {
            var imagePath = Path.Combine(_baseMediaPath, "Recipes", recipeId, "Images", imageType);
            return await Task.FromResult(File.Exists(imagePath) ? imagePath : string.Empty);
        }

        public async Task<string> GetUserProfileImagePathAsync(string userId)
        {
            var imagePath = Path.Combine(_baseMediaPath, "Users", userId, "profile.webp");
            return await Task.FromResult(File.Exists(imagePath) ? imagePath : string.Empty);
        }

        public async Task<string> GetRecipeAssetPathAsync(string recipeId, string fileName)
        {
            var assetPath = Path.Combine(_baseMediaPath, "Recipes", recipeId, "Assets", fileName);
            return await Task.FromResult(File.Exists(assetPath) ? assetPath : string.Empty);
        }

        public async Task DeleteRecipeImageAsync(string recipeId, string imageType)
        {
            var imagePath = Path.Combine(_baseMediaPath, "Recipes", recipeId, "Images", imageType);
            if (File.Exists(imagePath))
            {
                File.Delete(imagePath);
            }
            await Task.CompletedTask;
        }

        public bool IsValidImageFile(IFileUpload file)
        {
            return _allowedImageTypes.Contains(file.ContentType.ToLower());
        }

        public async Task GenerateImageThumbnailsAsync(string originalImagePath, string outputDirectory)
        {
            try
            {
                using var originalImage = Image.FromFile(originalImagePath);
                
                // Generate small thumbnail (300x300)
                var smallThumbnail = ResizeImage(originalImage, 300, 300);
                var smallPath = Path.Combine(outputDirectory, "small.webp");
                smallThumbnail.Save(smallPath, ImageFormat.Webp);
                smallThumbnail.Dispose();

                // Generate tiny thumbnail (150x150)
                var tinyThumbnail = ResizeImage(originalImage, 150, 150);
                var tinyPath = Path.Combine(outputDirectory, "tiny.webp");
                tinyThumbnail.Save(tinyPath, ImageFormat.Webp);
                tinyThumbnail.Dispose();

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating thumbnails for {OriginalImagePath}", originalImagePath);
                throw;
            }
        }

        private void EnsureDirectoriesExist()
        {
            var directories = new[]
            {
                Path.Combine(_baseMediaPath, "Recipes"),
                Path.Combine(_baseMediaPath, "Users")
            };

            foreach (var directory in directories)
            {
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }
            }
        }

        private string GetImageFileName(string imageType)
        {
            return imageType switch
            {
                "original" => "original.webp",
                "small" => "small.webp",
                "tiny" => "tiny.webp",
                _ => "original.webp"
            };
        }

        private Image ResizeImage(Image image, int width, int height)
        {
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
                graphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                graphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(System.Drawing.Drawing2D.WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }
    }
}

