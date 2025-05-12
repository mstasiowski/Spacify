using SpacifyAPI.Data;
using SpacifyAPI.Interfaces;

namespace SpacifyAPI.Services
{
    public class ConferenceRoomReservationService: IConferenceRoomReservationService
    {
        private readonly SpacifyDbContext _context;

        public ConferenceRoomReservationService(SpacifyDbContext context)
        {
            _context = context;
        }

    }
}
