using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SpacifyAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController(IAuthService _authService) : ControllerBase
    {

        [HttpPost("register")]
        public async Task<ActionResult<RegisterUserResponse>> Register([FromBody] RegisterUserRequest request)
        {

            var newUser = await _authService.RegisterAsync(request);

            return  Ok(newUser);
        }


        [HttpPost("login")]
        public async Task<ActionResult<TokenResponse>> Login(LoginUserRequest request)
        {
           var tokens = await _authService.LoginAsync(request);

            return Ok(tokens);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponse>> RefreshToken(RefreshTokenRequest request)
        {
            var result = await _authService.RefreshTokensAsync(request);

            if(result is null || result.AccessToken is null || result.RefreshToken is null)
            {
                throw new UnauthorizedAccessException("Invalid token");
            }

            return Ok(result);
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout([FromBody] Guid userId)
        {
            await _authService.LogoutAsync(userId);
            return Ok("Logged out successfully");
        }


    }
}
