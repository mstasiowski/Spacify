using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class ModifyUserRequest
    {
        [MaxLength(50)]
        public string? Name { get; set; }
        [MaxLength(50)]
        public string? Surname { get; set; }
        [EmailAddress,MaxLength(100)]
        public string? Email { get; set; }
        [MaxLength(100)]
        public string? Username { get; set; }
        public UserRole? Role { get; set; }
    }
}
