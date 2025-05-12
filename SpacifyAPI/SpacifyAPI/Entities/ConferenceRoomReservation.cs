using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class ConferenceRoomReservation
    {
        public int Id { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public User? User { get; set; }
        [Required]
        public int ConferenceRoomId { get; set; }
        public ConferenceRoom? ConferenceRoom { get; set; }
        [Required]
        public DateTime ReservationStart { get; set; }
        [Required]
        public DateTime ReservationEnd { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsConfirmed { get; set; } = false;


    }
}
