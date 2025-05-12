using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class LoginUserRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
