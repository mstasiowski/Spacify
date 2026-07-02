using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class AnnouncementRequest
    {
        [Required, MinLength(10)]
        public string Title { get; set; }
        [Required, MinLength(20), MaxLength(500)]
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAt { get; set; }
        public DateTime? ExpirationDate { get; set; }
        [Required]
        public string AllowedRoles { get; set; } 

        [Required]
        public Guid AuthorId { get; set; }

        public List<AnnouncementTagRequest> Tags { get; set; } = new List<AnnouncementTagRequest>();
    }
}
