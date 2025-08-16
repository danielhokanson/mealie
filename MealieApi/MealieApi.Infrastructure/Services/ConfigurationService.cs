using Microsoft.Extensions.Configuration;
using MealieApi.Shared.Interfaces;

namespace MealieApi.Infrastructure.Services
{
    public class ConfigurationService : IConfigurationService
    {
        private readonly IConfiguration _configuration;

        public ConfigurationService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GetValue(string key)
        {
            return _configuration[key] ?? string.Empty;
        }

        public string GetValue(string key, string defaultValue)
        {
            return _configuration[key] ?? defaultValue;
        }

        public T GetValue<T>(string key)
        {
            var value = _configuration[key];
            if (string.IsNullOrEmpty(value))
            {
                return default(T)!;
            }

            try
            {
                return (T)Convert.ChangeType(value, typeof(T));
            }
            catch
            {
                return default(T)!;
            }
        }

        public T GetValue<T>(string key, T defaultValue)
        {
            var value = _configuration[key];
            if (string.IsNullOrEmpty(value))
            {
                return defaultValue;
            }

            try
            {
                return (T)Convert.ChangeType(value, typeof(T));
            }
            catch
            {
                return defaultValue;
            }
        }

        public string GetConnectionString(string name)
        {
            return _configuration.GetConnectionString(name) ?? string.Empty;
        }
    }
}
