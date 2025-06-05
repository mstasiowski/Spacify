using SpacifyAPI.Entities;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IWorkstationReservationService
    {
        Task<List<WorkstationReservationResponse>> GetAllWorkstationReservationsAsync();
        Task<WorkstationReservationResponse> GetWorkstationReservationByIdAsync(int reservationId);
        Task<List<WorkstationReservationResponse>> GetWorkstationReservationsByUserIdAsync(Guid userId);
        Task<List<WorkstationReservationResponse>> GetWorkstationReservationsByDateAsync(DateTime date);
        Task<List<WorkstationReservationResponse>> GetReservationsByDateTimeRangeAsync(DateTime startDateTime, DateTime endDateTime);
        Task<List<WorkstationReservationResponse>> GetTodaysWorkstationReservationsAsync();
        Task<List<WorkstationReservationResponse>> GetWorkstationReservationsByFloorAndDateAsync(int floorId,DateTime date);

        Task<WorkstationReservationResponse> CreateWorkstationReservationAsync(CreateWorkstationReservationRequest reservation);
        Task<WorkstationReservationResponse> ModifyWorkstationReservationAsync(int reservationId, ModifyWorkstationReservationRequest reservation);
        Task DeleteWorkstationReservationAsync(int reservationId);
        Task<WorkstationReservationResponse> ConfirmWorkstationReservationAsync(int reservationId, Guid userId);
        Task RemoveExpiredUnconfirmedReservationsAsync();
       
    }
}
