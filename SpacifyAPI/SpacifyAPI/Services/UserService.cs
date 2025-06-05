using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Console;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Enums;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using System.Net.Mail;

namespace SpacifyAPI.Services
{
    public class UserService : IUserService
    {
        private readonly SpacifyDbContext _context;
        private readonly IAuthService _authService;

        public UserService(SpacifyDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }


        public async Task<List<UserResponseForAdmin>> GetAllUsersAdminAsync()
        {
            var dbUsers = await _context.Users.ToListAsync();

            if (dbUsers == null || dbUsers.Count == 0)
            {
                throw new NotFoundException("No users found in the database.");
            }

           return new List<UserResponseForAdmin>(dbUsers.Select(u => new UserResponseForAdmin
           {
               Id = u.Id,
               Name = u.Name,
               Surname = u.Surname,
               Email = u.Email,
               Username = u.Username,
               Role = u.Role.ToString(),
               AccountBlockedUntil = u.AccountBlockedUntil,
               IsBlocked = u.IsBlocked,
               CreatedAt = u.CreatedAt,
               UpdatedAt = u.UpdatedAt,
               LastLoginAt = u.LastLoginAt
           }));
        }

        public async Task<List<UserResponse>> GetAllUsersAsync()
        {
            var dbUsers = await _context.Users.ToListAsync();

            if (dbUsers == null || dbUsers.Count == 0)
            {
                throw new NotFoundException("No users found in the database.");
            }

            return new List<UserResponse>(dbUsers.Select(u => new UserResponse
            {
                Id = u.Id,
                Name = u.Name,
                Surname = u.Surname,
                Email = u.Email,
                Username = u.Username,
                Role = u.Role.ToString(),
            }));
        }

        public async Task<UserResponseForAdmin> GetUserByIdAdminAsync(Guid userId)
        {
            var dbUser = await _context.Users
                .Include(u => u.WorkstationReservations)
                .Include(u => u.ConferenceRoomReservations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            return new UserResponseForAdmin
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
                AccountBlockedUntil = dbUser.AccountBlockedUntil,
                IsBlocked = dbUser.IsBlocked,
                CreatedAt = dbUser.CreatedAt,
                UpdatedAt = dbUser.UpdatedAt,
                LastLoginAt = dbUser.LastLoginAt
            };
        }

        public async Task<UserResponse> GetUserByIdAsync(Guid userId)
        {
            var dbUser = await _context.Users
                //.Include(u => u.WorkstationReservations)
                //.Include(u => u.ConferenceRoomReservations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            return new UserResponse
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
            };
        }

        public async Task<UserResponseForAdmin> GetUserByEmailAsync(string email)
        {
            var dbUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with email {email} not found.");
            }


            return new UserResponseForAdmin
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
                AccountBlockedUntil = dbUser.AccountBlockedUntil,
                IsBlocked = dbUser.IsBlocked,
                CreatedAt = dbUser.CreatedAt,
                UpdatedAt = dbUser.UpdatedAt,
                LastLoginAt = dbUser.LastLoginAt
            };

        }

        public async Task<UserResponseForAdmin> GetUserByUsernameAsync(string username)
        {
            var dbUser = await  _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with username {username} not found.");
            }

            return new UserResponseForAdmin
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
                AccountBlockedUntil = dbUser.AccountBlockedUntil,
                IsBlocked = dbUser.IsBlocked,
                CreatedAt = dbUser.CreatedAt,
                UpdatedAt = dbUser.UpdatedAt,
                LastLoginAt = dbUser.LastLoginAt
            };
        }

        public async Task<UserResponseForAdmin> ModifyUserAsync(Guid userId, ModifyUserRequest user)
        {
            if (user == null)
            {
                throw new BadRequestException("User cannot be null.");
            }

            var dbUser = await _context.Users.FindAsync(userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            if(!string.IsNullOrWhiteSpace(user.Name))
            {
                dbUser.Name = _authService.FormatName(user.Name);
            }

            if (!string.IsNullOrWhiteSpace(user.Surname))
            {
                dbUser.Surname = _authService.FormatName(user.Surname);
            }

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
               var normalizedEmail = _authService.NormalizeEmail(user.Email);

               var dbUserEmailExist = await _context.Users.AnyAsync(u => u.Email == normalizedEmail && u.Id != userId);

                if (dbUserEmailExist)
                {
                    throw new BadRequestException("Email already exists.");
                }

                dbUser.Email = normalizedEmail;
            }

            if (!string.IsNullOrWhiteSpace(user.Username))
            {
               var normalizedUsername = user.Username.Trim().ToLower();
               var dbUsernameExist = await _context.Users.AnyAsync(u => u.Username == normalizedUsername && u.Id != userId);

                if (dbUsernameExist)
                {
                    throw new BadRequestException("Username already exists.");
                }

                dbUser.Username = normalizedUsername;
            }

            //string userRole = user.Role.ToString();

            //if (!string.IsNullOrEmpty(userRole))
            //{
            //    if (userRole != UserRole.Employee.ToString() && userRole != UserRole.Leader.ToString() && userRole != UserRole.Administrator.ToString() )
            //    {
            //        throw new BadRequestException("Invalid role.");
            //    }

            //    dbUser.Role = user.Role;
            //}

            if (user.Role.HasValue)
            {
                var roleValue = user.Role.Value;

                if (!Enum.IsDefined(typeof(UserRole), roleValue))
                {
                    throw new BadRequestException("Invalid role.");
                }   

                dbUser.Role = roleValue;
            }


            dbUser.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new UserResponseForAdmin
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
                AccountBlockedUntil = dbUser.AccountBlockedUntil,
                IsBlocked = dbUser.IsBlocked,
                CreatedAt = dbUser.CreatedAt,
                UpdatedAt = dbUser.UpdatedAt,
                LastLoginAt = dbUser.LastLoginAt
            };
        }

        public async Task DeleteUserAsync(Guid userId)
        {
            var dbUser = await _context.Users.FindAsync(userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            _context.Users.Remove(dbUser);
            await _context.SaveChangesAsync();
        }

        public async Task<UserResponseForAdmin> BlockUserUntilAsync(Guid userId, BlockUserRequest request)
        {
            
            var dbUser = await _context.Users.FindAsync(userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            if (dbUser.IsBlocked && dbUser.AccountBlockedUntil > DateTime.UtcNow)
            {
                throw new BadRequestException("User is already blocked.");
            }

            //Maximum time for blocking the account: 365 days
            const int MAX_MINUTES = 525600;
            const int MAX_HOURS = 8760;
            const int MAX_DAYS = 365;

            switch (request.DurationType)
            {
                case DurationType.Minutes when request.DurationValue > MAX_MINUTES:
                    throw new BadRequestException($"Duration value cannot exceed {MAX_MINUTES} minutes.");

                case DurationType.Hours when request.DurationValue > MAX_HOURS:
                    throw new BadRequestException($"Duration value cannot exceed {MAX_HOURS} hours.");

                case DurationType.Days when request.DurationValue > MAX_DAYS:
                    throw new BadRequestException($"Duration value cannot exceed {MAX_DAYS} days.");

                case not (DurationType.Minutes or DurationType.Hours or DurationType.Days):
                    throw new BadRequestException("Invalid duration type.");
            }

                    DateTime blockUntilDate = request.DurationType switch
            {
                DurationType.Minutes =>DateTime.UtcNow.AddMinutes(request.DurationValue),
                DurationType.Hours => DateTime.UtcNow.AddHours(request.DurationValue),
                DurationType.Days => DateTime.UtcNow.AddDays(request.DurationValue),
                _ => throw new BadRequestException("Invalid duration type.")
            };

            dbUser.IsBlocked = true;
            dbUser.AccountBlockedUntil = blockUntilDate;
            dbUser.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new UserResponseForAdmin
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
                AccountBlockedUntil = dbUser.AccountBlockedUntil,
                IsBlocked = dbUser.IsBlocked
            };
        }

        public async Task<UserResponseForAdmin> UnblockUserAsync(Guid userId)
        {
            var dbUser = await _context.Users.FindAsync(userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            dbUser.IsBlocked = false;
            dbUser.AccountBlockedUntil = null;
            dbUser.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new UserResponseForAdmin
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
                AccountBlockedUntil = dbUser.AccountBlockedUntil,
                IsBlocked = dbUser.IsBlocked
            };

        }

        public async Task<UserResponse> ChangeUserEmailAsync(Guid userId, string newEmail)
        {
            if (userId == Guid.Empty)
            {
                throw new BadRequestException("User ID cannot be empty.");
            }


            var dbUser = await _context.Users.FindAsync(userId);
            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }
            if (string.IsNullOrWhiteSpace(newEmail))
            {
                throw new BadRequestException("Email cannot be empty.");
            }

            var normalizedNewEmail = _authService.NormalizeEmail(newEmail);

            var dbUserEmailExist = await _context.Users.AnyAsync(u => u.Email == normalizedNewEmail && u.Id != userId);
            if (dbUserEmailExist)
            {
                throw new BadRequestException("Email already exists.");
            }
            dbUser.Email = normalizedNewEmail;
            dbUser.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
           
            return new UserResponse
            {
                Id = dbUser.Id,
                Name = dbUser.Name,
                Surname = dbUser.Surname,
                Email = dbUser.Email,
                Username = dbUser.Username,
                Role = dbUser.Role.ToString(),
            };
        }

        public async Task ChangeUserPasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            if (userId == Guid.Empty)
            {
                throw new BadRequestException("User ID cannot be empty.");
            }


            var dbUser = await _context.Users.FindAsync(userId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with id {userId} not found.");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                throw new BadRequestException("Password cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                throw new BadRequestException("Current password cannot be empty.");
            }

            if (dbUser.LastFailedLoginAt != null && dbUser.LastFailedLoginAt < DateTime.UtcNow.AddMinutes(-15))
            { 
             dbUser.FailedLoginAttempts = 0;
             dbUser.LastFailedLoginAt = null;
            }

            if (dbUser.IsBlocked && dbUser.AccountBlockedUntil > DateTime.UtcNow)
            {
                throw new BadRequestException("Account is temporarily blocked due to too many failed attempts.");
            }

            if (dbUser.AccountBlockedUntil != null && dbUser.AccountBlockedUntil < DateTime.UtcNow)
            {
                dbUser.FailedLoginAttempts = 0;
                dbUser.AccountBlockedUntil = null;
                dbUser.IsBlocked = false;
            }

            var passwordVerification = new PasswordHasher<User>()
                .VerifyHashedPassword(dbUser, dbUser.PasswordHash, request.CurrentPassword);

            

            if (passwordVerification == PasswordVerificationResult.Failed)
            {
                dbUser.FailedLoginAttempts++;
                dbUser.LastFailedLoginAt = DateTime.UtcNow;

                if (dbUser.FailedLoginAttempts >= 5)
                {
                    dbUser.IsBlocked = true;
                    dbUser.AccountBlockedUntil = DateTime.UtcNow.AddMinutes(5);
                    await _authService.LogoutAsync();
                }

                await _context.SaveChangesAsync();


                throw new BadRequestException("Current password is incorrect.");
            }

            var passwordVerificationNew = new PasswordHasher<User>()
                .VerifyHashedPassword(dbUser, dbUser.PasswordHash, request.NewPassword);

            if (passwordVerificationNew == PasswordVerificationResult.Success)
            {
                throw new BadRequestException("New password cannot be the same as the current password.");
            }

            if (!_authService.IsPasswordValid(request.NewPassword))
            {
                throw new BadRequestException("New password does not meet security requirements.");
            }

            dbUser.PasswordHash = new PasswordHasher<User>().HashPassword(dbUser, request.NewPassword);
            dbUser.UpdatedAt = DateTime.UtcNow;

            dbUser.FailedLoginAttempts = 0;
            dbUser.LastFailedLoginAt = null;
            dbUser.AccountBlockedUntil = null;
            dbUser.IsBlocked = false;

            await _context.SaveChangesAsync();

        }

        
    }
}
