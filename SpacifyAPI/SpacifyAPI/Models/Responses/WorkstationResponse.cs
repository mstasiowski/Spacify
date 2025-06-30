using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class WorkstationResponse
    {
        public int Id { get; set; }
        public int DeskNumber { get; set; } = 0;
        public float PositionX { get; set; }
        public float PositionY { get; set; }
        public int FloorId { get; set; }

        public List<WorkstationReservationResponse>? WorkstationReservations { get; set; } = new List<WorkstationReservationResponse>();
    }
}
