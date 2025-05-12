using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class CreateFloorRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        [Required]
        [StringLength(150)]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
