namespace MealieApi.Shared.Interfaces
{
    /// <summary>
    /// Abstract interface for file uploads to decouple from ASP.NET Core
    /// </summary>
    public interface IFileUpload
    {
        string FileName { get; }
        string ContentType { get; }
        long Length { get; }
        Task<Stream> OpenReadStreamAsync();
        Task CopyToAsync(Stream destination);
    }
}
