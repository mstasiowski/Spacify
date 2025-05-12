using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
  
    public class RegisterUserRequest
    {
        [Required,StringLength(50)]
        public string Name { get; set; } = string.Empty;
        [Required,StringLength(50)]
        public string Surname { get; set; } = string.Empty;
        [Required,EmailAddress,StringLength(100)]
        public string Email { get; set; } = string.Empty;
        //[StringLength(100)]
        //public string Username { get; set; } = string.Empty;
        [Required,StringLength(100)]
        public string Password { get; set; } = string.Empty;
        //[Required]
        //public UserRole Role { get; set; } = UserRole.Employee;
        //public string? RefreshToken { get; set; }
        //public DateTime? RefreshTokenExpirationTime { get; set; }

        //public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        //public DateTime? UpdatedAt { get; set; }
        //public DateTime? LastLoginAt { get; set; }

       
    }
}
