using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Helpers;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using System.Security.Claims;

namespace SpacifyAPI.Controllers
{
    [Route("user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpGet("/users/admin")]
        public async Task<ActionResult<List<UserResponseForAdmin>>> GetAllUsersAdmin()
        {
            var dbUsers = await _userService.GetAllUsersAdminAsync();
            return Ok(dbUsers);
        }

        [Authorize]
        [HttpGet("/users")]
        public async Task<ActionResult<List<UserResponse>>> GetAllUsers()
        {
            var dbUsers = await _userService.GetAllUsersAsync();
            return Ok(dbUsers);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpGet("{userId}/admin")]
        public async Task<ActionResult<UserResponseForAdmin>> GetUserByIdAdmin(Guid userId)
        {
            var dbUser = await _userService.GetUserByIdAdminAsync(userId);
            return Ok(dbUser);
        }

        [Authorize]
        [HttpGet("{userId}")]
        public async Task<ActionResult<UserResponse>> GetUserById(Guid userId)
        {
            var dbUser = await _userService.GetUserByIdAsync(userId);
            return Ok(dbUser);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserResponseForAdmin>> GetUserByEmail(string email)
        {
            var dbUser = await _userService.GetUserByEmailAsync(email);
            return Ok(dbUser);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpGet("username/{username}")]
        public async Task<ActionResult<UserResponseForAdmin>> GetUserByUsername(string username)
        {
            var dbUser = await _userService.GetUserByUsernameAsync(username);
            return Ok(dbUser);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPatch("{userId}")]
        public async Task<ActionResult<UserResponseForAdmin>> ModifyUser(Guid userId, ModifyUserRequest request)
        {
            var dbUser = await _userService.ModifyUserAsync(userId, request);
            return Ok(dbUser);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpDelete("{userId}")]
        public async Task<ActionResult> DeleteUser(Guid userId)
        {
            await _userService.DeleteUserAsync(userId);
            return NoContent();
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPatch("{userId}/block")]
        public async Task<ActionResult<UserResponseForAdmin>> BlockUserUntil(Guid userId, [FromBody] BlockUserRequest request)
        {
            var dbUser = await _userService.BlockUserUntilAsync(userId, request);
            return Ok(dbUser);
        }

        [Authorize(Roles = RoleNames.Administrator)]
        [HttpPatch("{userId}/unblock")]
        public async Task<ActionResult<UserResponseForAdmin>> UnblockUser(Guid userId)
        {
            var dbUser = await _userService.UnblockUserAsync(userId);
            return Ok(dbUser);
        }

        [Authorize]
        [HttpPatch("{userId}/email")]
        public async Task<ActionResult<UserResponse>> ChangeUserEmail(Guid userId, [FromBody] ChangeEmailRequest request)
        {
            ValidateUserIdClaim(userId);
            var dbUser = await _userService.ChangeUserEmailAsync(request);
            return Ok(dbUser);
        }

        [Authorize]
        [HttpPatch("{userId}/password")]
        public async Task<ActionResult> ChangeUserPassword(Guid userId, [FromBody] ChangePasswordRequest request)
        {
            ValidateUserIdClaim(userId);
            await _userService.ChangeUserPasswordAsync(request);
            return NoContent();
        }

        private void ValidateUserIdClaim(Guid targetUserId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessToDataException("User ID not found in token.");
            }

            var currentUserId = Guid.Parse(userIdClaim);
            var isAdmin = User.IsInRole(RoleNames.Administrator);

            if (!isAdmin && currentUserId != targetUserId)
            {
                throw new ForbiddenAccessToData("You do not have permission to modify this user.");
            }

        }

    }
}
