using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class ChangeEmailRequest
    {
        //[Required]
        //public Guid UserId { get; set; }
        [Required, EmailAddress]
        public string NewEmail { get; set; }
    }
}
