using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class CreateConferenceRoomReservationRequest
    {
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public int ConferenceRoomId { get; set; }
        [Required]
        public DateTimeOffset ReservationStart { get; set; }
        [Required]
        public DateTimeOffset ReservationEnd { get; set; }

    }
}
