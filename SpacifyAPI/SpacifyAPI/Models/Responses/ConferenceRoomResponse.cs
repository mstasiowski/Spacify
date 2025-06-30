using SpacifyAPI.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SpacifyAPI.Models.Responses
{
    public class ConferenceRoomResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string EquipmentDetails { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int FloorId { get; set; }

        public List<ConferenceRoomReservationResponse>? ConferenceRoomReservations { get; set; } = new List<ConferenceRoomReservationResponse>();

    }
}
