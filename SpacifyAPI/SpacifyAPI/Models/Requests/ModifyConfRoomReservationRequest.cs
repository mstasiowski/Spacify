using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class ModifyConfRoomReservationRequest
    {
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public int ConferenceRoomId { get; set; }
        [Required]
        public DateTimeOffset ReservationStart { get; set; }
        [Required]
        public DateTimeOffset ReservationEnd { get; set; }

        [Required]
        public bool IsConfirmed { get; set; }

    }
}
