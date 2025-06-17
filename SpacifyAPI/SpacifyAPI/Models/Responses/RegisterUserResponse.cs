using SpacifyAPI.Entities;
using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class RegisterUserResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Employee;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
