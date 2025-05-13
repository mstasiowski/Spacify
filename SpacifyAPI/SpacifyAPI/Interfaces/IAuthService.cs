using SpacifyAPI.Entities;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IAuthService
    {
        Task<RegisterUserResponse?> RegisterAsync(RegisterUserRequest request);
        Task<TokenResponse?> LoginAsync(LoginUserRequest request);
        Task<TokenResponse?> RefreshTokensAsync();
        Task LogoutAsync(Guid userId);

        string FormatName(string input);
        bool IsPasswordValid(string password);
        string NormalizeEmail(string email);
    }
}
