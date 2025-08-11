using BCrypt.Net;

namespace MealieApi.Application.Services;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
    string GenerateSecurePassword();
}

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));

        // Generate a salt and hash the password with BCrypt
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword))
            return false;

        try
        {
            // Verify the password against the hash
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Invalid hash format
            return false;
        }
    }

    public string GenerateSecurePassword()
    {
        // Generate a secure random password
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        var random = new Random();
        var password = new char[16];
        
        for (int i = 0; i < password.Length; i++)
        {
            password[i] = chars[random.Next(chars.Length)];
        }
        
        return new string(password);
    }
} 