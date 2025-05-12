using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class ChangePasswordRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        public string NewPassword { get; set; }
    }
}
