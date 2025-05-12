using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SpacifyAPI.Entities
{
    public class ConferenceRoom
    {

        public int Id { get; set; }
        [Required, StringLength(50)]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string EquipmentDetails { get; set; } = string.Empty;
        [Required, StringLength(150)]
        public string ImageUrl { get; set; } = string.Empty;
        [Required, Range(10, 50)]
        public int Capacity { get; set; }

        [Required]
        public int FloorId { get; set; }
        //[JsonIgnore]
        public Floor? Floor { get; set; }

        public List<ConferenceRoomReservation>? ConferenceRoomReservations { get; set; } = new List<ConferenceRoomReservation>();
    }
}
