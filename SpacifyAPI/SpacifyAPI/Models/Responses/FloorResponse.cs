using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;

namespace SpacifyAPI.Models.Responses
{
    public class FloorResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;        
        public string ImageUrl { get; set; } = string.Empty;

        public List<ConferenceRoomResponse>? ConferenceRooms { get; set; } = new List<ConferenceRoomResponse>();
        public List<WorkstationResponse>? Workstations { get; set; } = new List<WorkstationResponse>();
    }
}
