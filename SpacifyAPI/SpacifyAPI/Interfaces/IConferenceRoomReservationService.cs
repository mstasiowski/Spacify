using Microsoft.AspNetCore.Mvc;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IConferenceRoomReservationService
    {
        Task<List<ConferenceRoomReservationResponse>> GetAllConfRoomsReservationsAsync();
        Task<ConferenceRoomReservationResponse> GetConfRoomReservationByIdAsync(int reservationId);
        Task<List<ConferenceRoomReservationResponse>> GetUserConfRoomReservationsAsync(Guid userId);
        Task<List<ConferenceRoomReservationResponse>> GetConfReservationsByDateTimeRangeAsync(DateTimeOffset startDate, DateTimeOffset endDate);
        Task<ConferenceRoomReservationResponse> CreateConfRoomReservationAsync(CreateConferenceRoomReservationRequest request);
        Task<ConferenceRoomReservationResponse> UpdateConfRoomReservationAsync(int reservationId,ModifyConfRoomReservationRequest request);
        Task DeleteConfRoomsReservationAsync(int id);
        Task<ConferenceRoomReservationResponse> ConfirmConfRoomReservationAsync(int reservationId, Guid userId);
    }
}
