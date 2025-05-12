using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class LogActivity
    {
        public int Id { get; set; }

        public Guid? UserId { get; set; }

        [Required, StringLength(100)]
        public string ActionType { get; set; } = string.Empty;
        [Required]
        public string ActionDetails { get; set; } = string.Empty;
        [StringLength(150)]
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
