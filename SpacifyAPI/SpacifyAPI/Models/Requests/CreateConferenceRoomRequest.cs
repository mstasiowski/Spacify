using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class CreateConferenceRoomRequest
    {
       
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string EquipmentDetails { get; set; } = string.Empty;
        [Required]
        [StringLength(150)]
        public string ImageUrl { get; set; } = string.Empty;
        [Required]
        [Range(10, 50)]
        public int Capacity { get; set; }

        [Required]
        public int FloorId { get; set; }
       
    }
}
