using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class Floor
    {
        public int Id { get; set; }
        [Required, StringLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required, StringLength(150)]
        public string ImageUrl { get; set; } = string.Empty;

        public List<Workstation>? Workstations { get; set; } = new List<Workstation>();
        public List<ConferenceRoom>? ConferenceRooms { get; set; } = new List<ConferenceRoom>();

    }
}
