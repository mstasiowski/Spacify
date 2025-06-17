using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class ModifyWorkstationReservationRequest
    {
        public Guid? UserId { get; set; }
        public int? WorkstationId { get; set; }
        public DateTimeOffset? ReservationStart { get; set; }
        public DateTimeOffset? ReservationEnd { get; set; }
    }
}
