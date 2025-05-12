using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SpacifyAPI.Services
{
    public class AuthService(SpacifyDbContext _context, IConfiguration _configuration) : IAuthService
    {
        public async Task<RegisterUserResponse?> RegisterAsync(RegisterUserRequest request)
        {
            if (request == null)
            {
                throw new BadRequestException("Request cannot be null");
            }

            string normalizedEmail = NormalizeEmail(request.Email);

            if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
            {
                throw new BadRequestException("Registration failed");
            }

            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Surname) ||
                string.IsNullOrWhiteSpace(normalizedEmail) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                throw new BadRequestException("All fields are required");
            }

            if (!IsPasswordValid(request.Password))
            {
                throw new BadRequestException("Registration failed");
            }

            var newUser = new User();

            var hashedPassword = new PasswordHasher<User>()
                  .HashPassword(newUser, request.Password);

            newUser.Name = FormatName(request.Name);
            newUser.Surname = FormatName(request.Surname);
            newUser.Email = normalizedEmail;

            string createdUsername = $"{newUser.Name[0]}{newUser.Surname}".ToLower();

            string finalUsername = createdUsername;
            int suffix = 1;

            while (await _context.Users.AnyAsync(u => u.Username == finalUsername))
            {
                finalUsername = $"{createdUsername}{suffix}";
                suffix++;
            }


            newUser.Username = finalUsername;
            newUser.PasswordHash = hashedPassword;

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var registerUserResponse = new RegisterUserResponse
            {
                Id = newUser.Id,
                Name = newUser.Name,
                Surname = newUser.Surname,
                Email = newUser.Email,
                Username = newUser.Username,
                Role = newUser.Role,
                CreatedAt = newUser.CreatedAt
            };

            //return newUser;
            return registerUserResponse;
        }

        public async Task<TokenResponse?> LoginAsync(LoginUserRequest request)
        {
            var dbUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (dbUser == null)
            {
                throw new BadRequestException("username or password is invalid");
            }

            if (dbUser.LastFailedLoginAt != null && dbUser.LastFailedLoginAt < DateTime.UtcNow.AddMinutes(-15))
            { 
                dbUser.FailedLoginAttempts = 0;
                dbUser.LastFailedLoginAt = null;
            }

            if (dbUser.IsBlocked && dbUser.AccountBlockedUntil > DateTime.UtcNow)
            {
                throw new BadRequestException("Account is blocked. Please try again later.");
            }

            if (dbUser.AccountBlockedUntil != null && dbUser.AccountBlockedUntil < DateTime.UtcNow)
            {
                dbUser.FailedLoginAttempts = 0;
                dbUser.AccountBlockedUntil = null;
                dbUser.IsBlocked = false;
            }


            if (new PasswordHasher<User>().VerifyHashedPassword(dbUser, dbUser.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            {

                dbUser.FailedLoginAttempts++;
               // dbUser.LastLoginAt = DateTime.UtcNow;
                dbUser.LastFailedLoginAt = DateTime.UtcNow;
                dbUser.IsBlocked = dbUser.FailedLoginAttempts == 5;

                dbUser.AccountBlockedUntil = dbUser.IsBlocked ? DateTime.UtcNow.AddMinutes(5) : null;

                await _context.SaveChangesAsync();

                throw new BadRequestException("username or password is invalid");
            }


            dbUser.LastLoginAt = DateTime.UtcNow;
            dbUser.LastFailedLoginAt = null;
            dbUser.FailedLoginAttempts = 0;
            dbUser.AccountBlockedUntil = null;
            dbUser.IsBlocked = false;

            await _context.SaveChangesAsync();
            

            return await CreateTokenResponse(dbUser);
        }


        public async Task<TokenResponse?> RefreshTokensAsync(RefreshTokenRequest request)
        {
            var user = await ValidateRefreshTokenAsync(request.UserId, request.RefreshToken);

            if (user == null)
            {
                throw new BadRequestException("Invalid refresh token");
            }

            return await CreateTokenResponse(user);
        }

        public async Task LogoutAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpirationTime = null;
                await _context.SaveChangesAsync();
            }
        }


        private async Task<TokenResponse> CreateTokenResponse(User? dbUser)
        {
           if(dbUser == null)
            {
                throw new BadRequestException("Problem with creating a response with a token");
            }


            return new TokenResponse
            {
                AccessToken = CreateToken(dbUser),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(dbUser)
            };
        }


        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetValue<string>("AppSettings:Token")!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new JwtSecurityToken(
               issuer: _configuration.GetValue<string>("AppSettings:Issuer"),
               audience: _configuration.GetValue<string>("AppSettings:Audience"),
               claims: claims,
               expires: DateTime.UtcNow.AddMinutes(15),
               signingCredentials: creds
               );

            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            //Kod bez hasha
            //var refreshToken = GenerateRefreshToken();
            //user.RefreshToken = refreshToken;
            //user.RefreshTokenExpirationTime = DateTime.UtcNow.AddDays(7);
            //await _context.SaveChangesAsync();
            //return refreshToken;

            var refreshToken = GenerateRefreshToken();
            var hashedRefreshToken = HashRefreshToken(refreshToken);

            user.RefreshToken = hashedRefreshToken;
            user.RefreshTokenExpirationTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        private async Task<User?> ValidateRefreshTokenAsync(Guid userId ,string refreshToken)
        {
            var user = await _context.Users.FindAsync(userId);

            //if (user is null || user.RefreshToken != refreshToken || user.RefreshTokenExpirationTime <= DateTime.UtcNow)
            //{
            //    return null;
            //}

            if (user is null || user.RefreshToken != HashRefreshToken(refreshToken) || user.RefreshTokenExpirationTime <= DateTime.UtcNow)
            {
                return null;
            }

            return user;
        }

        private string HashRefreshToken(string input)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
                return Convert.ToBase64String(bytes);
            }
        }

        public string FormatName(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return string.Empty;
            }

            input = input.Trim().ToLower();

            return char.ToUpper(input[0]) + input.Substring(1);
        }

        public bool IsPasswordValid(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return false;
            }

            if (password.Length < 12)
            {
                return false;
            }

            if (!password.Any(char.IsUpper))
            {
                return false;
            }

            if (!password.Any(char.IsLower))
            {
                return false;
            }

            if (!password.Any(char.IsDigit))
            {
                return false;
            }

            if (!password.Any(ch => !char.IsLetterOrDigit(ch))) return false;


            return true;
        }

        public string NormalizeEmail(string email)
        {
            return string.IsNullOrWhiteSpace(email)? string.Empty: email.Trim().ToLowerInvariant();
        }


    }
}
