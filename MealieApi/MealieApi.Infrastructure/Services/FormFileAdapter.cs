using Microsoft.AspNetCore.Http;
using MealieApi.Shared.Interfaces;

namespace MealieApi.Infrastructure.Services
{
    public class FormFileAdapter : IFileUpload
    {
        private readonly IFormFile _formFile;

        public FormFileAdapter(IFormFile formFile)
        {
            _formFile = formFile;
        }

        public string FileName => _formFile.FileName;
        public string ContentType => _formFile.ContentType;
        public long Length => _formFile.Length;

        public Task<Stream> OpenReadStreamAsync()
        {
            return Task.FromResult(_formFile.OpenReadStream());
        }

        public Task CopyToAsync(Stream destination)
        {
            return _formFile.CopyToAsync(destination);
        }
    }
}
