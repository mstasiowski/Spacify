using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class Tag
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public string color { get; set; }

        public ICollection<AnnouncementTag> AnnouncementTags { get; set; } = new HashSet<AnnouncementTag>();
    }
}
