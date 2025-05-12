using SpacifyAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Requests
{
    public class BlockUserRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "DurationValue must be greater than 0.")]
        public int DurationValue { get; set; }

        [Required]
        public DurationType DurationType { get; set; }
    }
}
