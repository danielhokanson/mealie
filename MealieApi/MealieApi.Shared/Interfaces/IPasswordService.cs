namespace MealieApi.Shared.Interfaces
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        string GenerateSecurePassword();
    }
}
