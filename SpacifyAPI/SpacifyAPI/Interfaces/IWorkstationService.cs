using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IWorkstationService
    {
        Task<List<WorkstationResponse>> GetAllWorkstationsAsync();
        Task<WorkstationResponse> GetWorkstationByIdAsync(int id);
        Task<WorkstationResponse> CreateWorkstationAsync(CreateWorkstationRequest workstation);
        Task<WorkstationResponse> UpdateWorkstationAsync(int id, CreateWorkstationRequest workstation);
        Task DeleteWorkstationAsync(int id);
    }
}
