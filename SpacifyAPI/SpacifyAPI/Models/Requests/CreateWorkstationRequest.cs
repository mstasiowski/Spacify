using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class CreateWorkstationRequest
    {
        [Required]
        public int DeskNumber { get; set; } = 0;
        [Required]
        public float PositionX { get; set; }
        [Required]
        public float PositionY { get; set; }

        [Required]
        public int FloorId { get; set; }

    }
}
