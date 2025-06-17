using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class CreateWorkstationReservationRequest
    {
        [Required]
        public Guid UserId { get; set; }
        [Required]
        public int WorkstationId { get; set; }
        [Required]
        public DateTimeOffset ReservationStart { get; set; }
        [Required]
        public DateTimeOffset ReservationEnd { get; set; }

    }
}
