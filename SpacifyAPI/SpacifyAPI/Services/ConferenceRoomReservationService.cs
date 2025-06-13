using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Entities;


namespace SpacifyAPI.Services
{
    public class ConferenceRoomReservationService: IConferenceRoomReservationService
    {
        private readonly SpacifyDbContext _context;
        private readonly IWorkstationReservationService _workstationReservationService;

        public ConferenceRoomReservationService(SpacifyDbContext context, IWorkstationReservationService workstationReservationService)
        {
            _context = context;
            _workstationReservationService = workstationReservationService;
        }

        public async Task<List<ConferenceRoomReservationResponse>> GetAllConfRoomsReservationsAsync()
        {
            var dbReservations = await _context.ConferenceRoomReservations
                .AsNoTracking()
                .ToListAsync();

            if(!dbReservations.Any())
            {
                throw new NotFoundException("No conference rooms reservations found.");
            }

            return  dbReservations.Select(MapToResponse).ToList();

        }

        public async Task<List<ConferenceRoomReservationResponse>> GetUserConfRoomReservationsAsync(Guid userId)
        {
            var dbReservations = await _context.ConferenceRoomReservations
                .Where(r=>r.UserId == userId)
                .AsNoTracking()
                .ToListAsync();

            if (!dbReservations.Any())
            {
                throw new NotFoundException($"No conference room reservations found for user with id {userId}.");
            }

            return dbReservations.Select(MapToResponse).ToList();
        }

        public async Task<ConferenceRoomReservationResponse> GetConfRoomReservationByIdAsync(int reservationId)
        {
            var dbReservation = await _context.ConferenceRoomReservations.FindAsync(reservationId);

            if(dbReservation == null)
            {
                throw new NotFoundException($"Reservation with id {reservationId} not found");
            }

            return MapToResponse(dbReservation);
        }


        public async Task<List<ConferenceRoomReservationResponse>> GetConfReservationsByDateTimeRangeAsync(DateTime startTime, DateTime endTime)
        {
            var dbConfReservation = await _context.ConferenceRoomReservations
                .Where(r => r.ReservationStart < endTime && r.ReservationEnd > startTime)
                .AsNoTracking()
                .ToListAsync();

            return dbConfReservation.Select(MapToResponse).ToList();
        }

        public async Task<ConferenceRoomReservationResponse> CreateConfRoomReservationAsync(CreateConferenceRoomReservationRequest request)
        {
            if(request == null)
            {
                throw new BadRequestException("Reservation request cannot be null.");
            }

            if (request.ReservationStart == default || request.ReservationEnd == default)
            {
                throw new BadRequestException("Reservation start and end times are required.");
            }

            if (request.UserId == Guid.Empty)
            {
                throw new BadRequestException("User ID is required.");
            }

            var dbConferenceRoom = await _context.ConferenceRooms.FindAsync(request.ConferenceRoomId);
            if (dbConferenceRoom == null)
            {
                throw new NotFoundException($"Conference room with id {request.ConferenceRoomId} not found.");
            }



            var dbUser = await _context.Users.FindAsync(request.UserId);
           
            if(dbUser == null)
            {
                throw new NotFoundException($"User with id {request.UserId} not found.");
            }

        
            _workstationReservationService.ValidateReservationDateConstraints(request.ReservationStart, request.ReservationEnd);
            _workstationReservationService.ValidateReservationTime(request.ReservationStart, request.ReservationEnd);


            //overlaping reseration check
            var overlappingReservations = await _context.ConferenceRoomReservations
                .Where(r => r.ConferenceRoomId == request.ConferenceRoomId &&
                            r.ReservationStart < request.ReservationEnd &&
                            r.ReservationEnd > request.ReservationStart)
                .ToListAsync();

            if (overlappingReservations.Any())
            {
                throw new BadRequestException("The conference room is reserved at the specified time.");
            }

            var newReservation = new ConferenceRoomReservation
            {
                UserId = request.UserId,
                ConferenceRoomId = request.ConferenceRoomId,
                ReservationStart = request.ReservationStart.ToUniversalTime(),
                ReservationEnd = request.ReservationEnd.ToUniversalTime(),
                CreatedAt = DateTime.UtcNow,
                IsConfirmed = false 
            };

            _context.ConferenceRoomReservations.Add(newReservation);
           await _context.SaveChangesAsync();

            return MapToResponse(newReservation);
        }

        public async Task<ConferenceRoomReservationResponse> UpdateConfRoomReservationAsync(int reservationId, ModifyConfRoomReservationRequest request)
        {
            if(request ==null)
            {
                throw new BadRequestException("Reservation request cannot be null.");
            }

            if(request.ReservationStart == default || request.ReservationEnd == default)
            {
                throw new BadRequestException("Reservation start and end times are required.");
            }

            if (request.UserId == Guid.Empty)
                throw new BadRequestException("User ID is required");

            var dbExistingReservation = await _context.ConferenceRoomReservations.FindAsync(reservationId);

            if(dbExistingReservation == null)
            {
                throw new NotFoundException($"Reservation with ID: {reservationId} not found.");
            }

            var dbUser = await _context.Users.FindAsync(request.UserId);

            if(dbUser == null)
                throw new NotFoundException($"User with ID: {request.UserId} not found.");

            var dbConferenceRoom = await _context.ConferenceRooms.FindAsync(request.ConferenceRoomId);

            if(dbConferenceRoom == null)
                throw new NotFoundException($"Conference room with ID:{request.ConferenceRoomId} not found");

            _workstationReservationService.ValidateReservationDateConstraints(request.ReservationStart,request.ReservationEnd);
            _workstationReservationService.ValidateReservationTime(request.ReservationStart, request.ReservationEnd);


            var overlapping = await _context.ConferenceRoomReservations
                .Where(r => r.Id != reservationId &&
                r.ConferenceRoomId == request.ConferenceRoomId &&
                r.ReservationStart < request.ReservationEnd &&
                r.ReservationEnd > request.ReservationStart)
                .ToListAsync();

            if (overlapping.Any())
                throw new BadRequestException("The conference room is reserved at the specified time.");

            dbExistingReservation.UserId = request.UserId;
            dbExistingReservation.ConferenceRoomId = request.ConferenceRoomId;
            dbExistingReservation.ReservationStart = request.ReservationStart.ToUniversalTime();
            dbExistingReservation.ReservationEnd = request.ReservationEnd.ToUniversalTime();
            dbExistingReservation.IsConfirmed = request.IsConfirmed;
            dbExistingReservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(dbExistingReservation);

        }

        public async Task DeleteConfRoomsReservationAsync(int id)
        {
            var dbReservation = await _context.ConferenceRoomReservations.FindAsync(id);

            if (dbReservation == null)
            {
                throw new NotFoundException($"Reservation with id {id} not found.");
            }


            var now = DateTime.UtcNow;

            if(dbReservation.IsConfirmed && dbReservation.ReservationStart <= now && dbReservation.ReservationEnd >= now)
            {
                throw new BadRequestException("You cannot delete a confirmed booking that is still active.");
            }

            _context.ConferenceRoomReservations.Remove(dbReservation);
            await _context.SaveChangesAsync();

        }

        public async Task<ConferenceRoomReservationResponse> ConfirmConfRoomReservationAsync(int reservationId, Guid userId)
        {
            var dbConfReservation = await _context.ConferenceRoomReservations
                 .FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);

            if (dbConfReservation == null)
            {
                throw new NotFoundException($"Workstation reservation with ID {reservationId} not found for user with ID {userId}.");
            }

            if (dbConfReservation.ReservationStart <= DateTime.UtcNow)
            {
                throw new BadRequestException("Cannot confirm a reservation that has already started.");
            }

            var timeUntillResStart = dbConfReservation.ReservationStart - DateTime.UtcNow;

            if (timeUntillResStart > TimeSpan.FromHours(1))
            {
                throw new BadRequestException("Reservation can only be confirmed within 1 hour before it starts.");
            }

            if (dbConfReservation.IsConfirmed)
            {
                throw new BadRequestException("Reservation is already confirmed.");
            }

            dbConfReservation.IsConfirmed = true;
            dbConfReservation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(dbConfReservation);
        }

        private ConferenceRoomReservationResponse MapToResponse(ConferenceRoomReservation reservation)
        {
            return new ConferenceRoomReservationResponse
            {
                Id = reservation.Id,
                UserId = reservation.UserId,
                ConferenceRoomId = reservation.ConferenceRoomId,
                ReservationStart = reservation.ReservationStart,
                ReservationEnd = reservation.ReservationEnd,
                CreatedAt = reservation.CreatedAt,
                IsConfirmed = reservation.IsConfirmed
            };
        }

    }
}
