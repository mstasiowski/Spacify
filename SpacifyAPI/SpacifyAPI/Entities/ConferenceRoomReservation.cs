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
        public DateTimeOffset ReservationStart { get; set; }
        [Required]
        public DateTimeOffset ReservationEnd { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
        public bool IsConfirmed { get; set; } = false;


    }
}
