using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Entities
{
    public class Workstation
    {
        public int Id { get; set; }
        [Required]
        public int DeskNumber { get; set; } = 0;
        [Required]
        public float PositionX { get; set; }
        [Required]
        public float PositionY { get; set; }

        [Required]
        public int FloorId { get; set; }
        public Floor? Floor { get; set; }

        public List<WorkstationReservation>? WorkstationReservations { get; set; } = new List<WorkstationReservation>();
    }
}
