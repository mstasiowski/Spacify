using SpacifyAPI.Entities;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IConferenceRoomService
    {
        Task<List<ConferenceRoomResponse>> GetAllConferenceRoomsAsync();

        Task<ConferenceRoomResponse> GetConferenceRoomByIdAsync(int id);
        Task<List<ConferenceRoomResponse>> GetConfRoomsByFloorAsync(int floorId);
        Task<ConferenceRoomResponse> CreateConferenceRoomAsync(CreateConferenceRoomRequest conferenceRoom);
        Task<ConferenceRoomResponse> UpdateConferenceRoomAsync(int id, CreateConferenceRoomRequest conferenceRoom);
        Task DeleteConferenceRoomAsync(int id);
    }
}
