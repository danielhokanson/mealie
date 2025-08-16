namespace MealieApi.Shared.Interfaces
{
    /// <summary>
    /// Abstract interface for configuration to decouple from ASP.NET Core
    /// </summary>
    public interface IConfigurationService
    {
        string GetValue(string key);
        string GetValue(string key, string defaultValue);
        T GetValue<T>(string key);
        T GetValue<T>(string key, T defaultValue);
        string GetConnectionString(string name);
    }
}
