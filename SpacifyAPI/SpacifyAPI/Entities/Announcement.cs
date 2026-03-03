using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class Announcement
    {
        public int Id { get; set; }
        [Required, MinLength(10)]
        public string Title { get; set; }
        [Required, MinLength(20), MaxLength(500)]
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedAt { get; set; }
        [Required]
        public string AllowedRoles { get; set; } // Comma-separated roles allowed to view this announcement

        [Required]
        public Guid AuthorId {get; set;}
        public User? Author { get; set; }

        [Required]
        public ICollection<AnnouncementTag> AnnouncementTags { get; set; } = new HashSet<AnnouncementTag>();


    }
}
