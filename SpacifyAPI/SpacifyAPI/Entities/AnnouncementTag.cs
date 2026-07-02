using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class AnnouncementTag
    {
        [Required]
        public int AnnouncementId { get; set; }
        public Announcement Announcement { get; set; }

        [Required]
        public int TagId { get; set; }
        public Tag Tag { get; set; }

        [Required]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow; //statystyka ile razy w danym czasie taki tag był używany
        [Required]
        public int DisplayOrder { get; set; } = 0; //the order in which specific tags are displayed

    }
}
