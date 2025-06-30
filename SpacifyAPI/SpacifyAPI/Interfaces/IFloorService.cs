using SpacifyAPI.Entities;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IFloorService
    {
        Task<List<FloorResponse>> GetAllFloorsAsync();
        Task<FloorResponse> GetFloorByIdAsync(int id);
        Task<List<FloorResponse>> GetAllFloorsWithUserReservationsAsync(string userIdClaim);
        Task<FloorResponse> CreateFloorAsync(CreateFloorRequest floor);
        Task<FloorResponse> UpdateFloorAsync(int id, CreateFloorRequest floor);
        Task DeleteFloorAsync(int id);
    }
}
