using SpacifyAPI.Entities;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IUserService
    {
        Task<List<UserResponseForAdmin>> GetAllUsersAdminAsync();
        Task<List<UserResponse>> GetAllUsersAsync();
        Task<UserResponseForAdmin> GetUserByIdAdminAsync(Guid userId);
        Task<UserResponse> GetUserByIdAsync(Guid userId);
        Task<UserResponseForAdmin> GetUserByEmailAsync(string email);
        Task<UserResponseForAdmin> GetUserByUsernameAsync(string username);
        Task<UserResponseForAdmin> ModifyUserAsync(Guid userId, ModifyUserRequest request);
        //Task<UserResponse> ModifyUserAsync(Guid userId, User request);
        Task DeleteUserAsync(Guid userId);
        
        Task<UserResponseForAdmin> BlockUserUntilAsync(Guid userId, BlockUserRequest request);
        Task<UserResponseForAdmin> UnblockUserAsync(Guid userId);
        //Task<User?> ChangeUserPassword(Guid userId, string newPassoword);

        Task<UserResponse> ChangeUserEmailAsync(Guid userId, string newEmail);
        Task ChangeUserPasswordAsync(Guid userId, ChangePasswordRequest request);


    }
}
