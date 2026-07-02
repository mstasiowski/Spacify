using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Interfaces
{
    public interface IAnnouncementService
    {
        Task<List<AnnouncementResponse>> GetAllAnnouncementsAsync();
        Task<List<AnnouncementResponse>> GetAllAnnouncementsForSpecificRoleAsync(string role);
        Task<List<AnnouncementResponse>> GetAllAnnouncementsByOneTagAsync(string tag);
        Task<List<AnnouncementResponse>> GetAllAnnouncementsByAuthorIdAsync(Guid authorId);
        Task<List<AnnouncementResponse>> GetAllAnnouncementsForSpecificDateAsync(DateTime date);
        Task<AnnouncementResponse> GetAnnouncementByIdAsync(int id);
        Task<AnnouncementResponse> CreateAnnouncementAsync(AnnouncementRequest announcement);
        Task<AnnouncementResponse> ModifyAnnouncementAsync(int id, ModifyAnnouncementRequest announcement);
        Task DeleteAnnouncementAsync(int id);


    }
}
