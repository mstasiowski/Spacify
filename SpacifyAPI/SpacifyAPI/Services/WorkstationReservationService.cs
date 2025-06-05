using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SpacifyAPI.Services
{
    public class WorkstationReservationService : IWorkstationReservationService
    {
        private readonly SpacifyDbContext _context;

        public WorkstationReservationService(SpacifyDbContext context)
        {
            _context = context;
        }

        public async Task<List<WorkstationReservationResponse>> GetAllWorkstationReservationsAsync()
        {
            var dbWorkstationReservations = await _context.WorkstationReservations
                .ToListAsync();

            if (dbWorkstationReservations == null || dbWorkstationReservations.Count == 0)
            {
                throw new NotFoundException("No workstation reservations found.");
            }

            

            return dbWorkstationReservations.Select(w => MapToResponse(w)).ToList();
        }

        public async Task<WorkstationReservationResponse> GetWorkstationReservationByIdAsync(int reservationId)
        {
            var dbWorkstationReservation = await  _context.WorkstationReservations
                .FirstOrDefaultAsync(x => x.Id == reservationId);

            if (dbWorkstationReservation == null)
            {
                throw new NotFoundException($"Workstation reservation with ID {reservationId} not found.");
            }

           return MapToResponse(dbWorkstationReservation);
        }

        public async Task<List<WorkstationReservationResponse>> GetWorkstationReservationsByUserIdAsync(Guid userId)
        {
            var dbWorkstationReservations = await _context.WorkstationReservations
                .Where(x => x.UserId == userId)
                .ToListAsync();

            if (dbWorkstationReservations == null || dbWorkstationReservations.Count == 0)
            {
                throw new NotFoundException($"No workstation reservations found for user with ID {userId}.");
            }



            return dbWorkstationReservations.Select(w => MapToResponse(w)).ToList();
        }

        public async Task<List<WorkstationReservationResponse>> GetWorkstationReservationsByDateAsync(DateTime date)
        {
            var dbWorkstationReservations = await _context.WorkstationReservations
                .Where(x => x.ReservationStart.Date == date.Date)
                .ToListAsync();

            if (dbWorkstationReservations == null || dbWorkstationReservations.Count == 0)
            {
                throw new NotFoundException($"No workstation reservations found for date {date.ToShortDateString()}.");
            }



            return dbWorkstationReservations.Select(w => MapToResponse(w)).ToList();
        }

        public async Task<List<WorkstationReservationResponse>> GetReservationsByDateTimeRangeAsync(DateTime startDateTime, DateTime endDateTime)
        {
            var dbWorkstationReservations = await _context.WorkstationReservations
                .Where(x => x.ReservationStart < endDateTime && x.ReservationEnd > startDateTime)
                .ToListAsync();


            return dbWorkstationReservations.Select(MapToResponse).ToList();
        }


        public async Task<List<WorkstationReservationResponse>> GetTodaysWorkstationReservationsAsync()
        {

            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var dbWorkstationReservations = await _context.WorkstationReservations
                .Where(x => x.ReservationStart >= today && x.ReservationStart < tomorrow)
                .ToListAsync();

            if (dbWorkstationReservations == null || dbWorkstationReservations.Count == 0)
            {
                throw new NotFoundException($"No workstation reservations found for today.");
            }

            return dbWorkstationReservations.Select(w => MapToResponse(w)).ToList();
        }

        public async Task<List<WorkstationReservationResponse>> GetWorkstationReservationsByFloorAndDateAsync(int floorId, DateTime date)
        {
            var reservations = await _context.WorkstationReservations
        .Include(r => r.Workstation)
        .Where(r =>
            r.ReservationStart.Date == date.Date &&
            r.Workstation != null &&
            r.Workstation.FloorId == floorId)
        .ToListAsync();

            if (reservations == null || reservations.Count == 0)
            {
                throw new NotFoundException($"No workstation reservations found for floor ID {floorId} on date {date.ToShortDateString()}.");
            }
            return reservations.Select(r => MapToResponse(r)).ToList();
        }

        public async Task<WorkstationReservationResponse> CreateWorkstationReservationAsync(CreateWorkstationReservationRequest newReservation)
        {
           if(newReservation == null)
            {
                throw new BadRequestException("Reservation data is null.");
            }

            if (newReservation.ReservationStart == default || newReservation.ReservationEnd == default)
            {
                throw new BadRequestException("Reservation start and end times are required.");
            }

            if (newReservation.UserId == Guid.Empty)
            {
                throw new BadRequestException("User ID is required.");
            }

            var dbUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == newReservation.UserId);

            if (dbUser == null)
            {
                throw new NotFoundException($"User with ID {newReservation.UserId} not found.");
            }

            if (newReservation.WorkstationId <= 0)
            {
                throw new BadRequestException("Workstation ID must be greater than zero.");
            }

            var dbWorkstation = await _context.Workstations
                .FirstOrDefaultAsync(w => w.Id == newReservation.WorkstationId);

            if (dbWorkstation == null)
            {
                throw new NotFoundException($"Workstation with ID {newReservation.WorkstationId} not found.");
            }

            ValidateReservationDateConstraints(newReservation.ReservationStart, newReservation.ReservationEnd);

            ValidateReservationTime(newReservation.ReservationStart, newReservation.ReservationEnd);

            
            var overlappingReservation = await IsReservationOverlapping(newReservation.WorkstationId, newReservation.ReservationStart, newReservation.ReservationEnd);

            if (overlappingReservation)
            {
                throw new BadRequestException("The workstation is already reserved for the selected time.");
            }


                var dbWorkstationReservation = new WorkstationReservation
            {
                UserId = newReservation.UserId,
                WorkstationId = newReservation.WorkstationId,
                ReservationStart = newReservation.ReservationStart.ToUniversalTime(),
                ReservationEnd = newReservation.ReservationEnd.ToUniversalTime(),
                CreatedAt = DateTime.UtcNow,
                IsConfirmed = false
            };

            _context.WorkstationReservations.Add(dbWorkstationReservation);
            await _context.SaveChangesAsync();

            return MapToResponse(dbWorkstationReservation);

        }

        public async Task<WorkstationReservationResponse> ModifyWorkstationReservationAsync(int reservationId, ModifyWorkstationReservationRequest reservation)
        {
            if (reservation == null)
            {
                throw new BadRequestException("Reservation data is null.");
            }

            var existingReservation = await _context.WorkstationReservations
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (existingReservation == null)
            {
                throw new NotFoundException($"Workstation reservation with ID {reservationId} not found.");
            }

            if (reservation.UserId.HasValue && reservation.UserId.Value == Guid.Empty)
            {
                throw new BadRequestException("User ID is required.");
            }

            if (reservation.UserId.HasValue)
            {
                var dbUser = await _context.Users
                    .AnyAsync(u => u.Id == reservation.UserId.Value);
                if (!dbUser)
                {
                    throw new NotFoundException($"User with ID {reservation.UserId} not found.");
                }
            }

            if (reservation.WorkstationId.HasValue && reservation.WorkstationId.Value <= 0)
            {
                throw new BadRequestException("Workstation ID must be greater than zero.");
            }

            if (reservation.WorkstationId.HasValue)
            {
                var dbWorkstation = await _context.Workstations
                    .AnyAsync(w => w.Id == reservation.WorkstationId.Value);
                if (!dbWorkstation)
                {
                    throw new NotFoundException($"Workstation with ID {reservation.WorkstationId} not found.");
                }
            }


            var now = DateTime.UtcNow;

            if (existingReservation.ReservationStart <= now && now < existingReservation.ReservationEnd)
            {
                throw new BadRequestException("Cannot modify a reservation that has already started.");
            }

            var finalStart = reservation.ReservationStart ?? existingReservation.ReservationStart;
            var finalEnd = reservation.ReservationEnd ?? existingReservation.ReservationEnd;

            ValidateReservationDateConstraints(finalStart, finalEnd);

            ValidateReservationTime(reservation.ReservationStart, reservation.ReservationEnd, existingReservation.ReservationStart, existingReservation.ReservationEnd);

            if(reservation.ReservationStart.HasValue || reservation.ReservationEnd.HasValue)
            {
                int modifiedReservationId = reservation.WorkstationId ?? existingReservation.WorkstationId;

                bool overlappingReservation = await IsReservationOverlapping(modifiedReservationId, finalStart,
                    finalEnd, existingReservation.Id);

                if (overlappingReservation)
                {
                    throw new BadRequestException("The workstation is already reserved for the selected time.");
                }
            }

            bool isChanged = false;

            if (reservation.UserId.HasValue && existingReservation.UserId != reservation.UserId.Value)
            {
                existingReservation.UserId = reservation.UserId.Value;
                isChanged = true;
            }

            if (reservation.WorkstationId.HasValue && existingReservation.WorkstationId != reservation.WorkstationId.Value)
            {
                existingReservation.WorkstationId = reservation.WorkstationId.Value;
                isChanged = true;
            }

            if (reservation.ReservationStart.HasValue && existingReservation.ReservationStart != reservation.ReservationStart.Value)
            {
                existingReservation.ReservationStart = reservation.ReservationStart.Value.ToUniversalTime();
                isChanged = true;
            }

            if (reservation.ReservationEnd.HasValue && existingReservation.ReservationEnd != reservation.ReservationEnd.Value)
            {
                existingReservation.ReservationEnd = reservation.ReservationEnd.Value.ToUniversalTime();
                isChanged = true;
            }

            if(isChanged)
            {
                existingReservation.IsConfirmed = false;
                existingReservation.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

            }

            var dbWorkstationReservation = new WorkstationReservation
            {
                Id = existingReservation.Id,
                UserId = existingReservation.UserId,
                WorkstationId = existingReservation.WorkstationId,
                ReservationStart = existingReservation.ReservationStart,
                ReservationEnd = existingReservation.ReservationEnd,
                CreatedAt = existingReservation.CreatedAt,
                IsConfirmed = existingReservation.IsConfirmed
            };

            return MapToResponse(dbWorkstationReservation);


        }

        public async Task<WorkstationReservationResponse> ConfirmWorkstationReservationAsync(int reservationId, Guid userId)
        {
           var dbWorkstationReservation = await _context.WorkstationReservations
                .FirstOrDefaultAsync(r => r.Id == reservationId && r.UserId == userId);

            if (dbWorkstationReservation == null)
            {
                throw new NotFoundException($"Workstation reservation with ID {reservationId} not found for user with ID {userId}.");
            }

            if(dbWorkstationReservation.ReservationStart <= DateTime.UtcNow)
            {
                throw new BadRequestException("Cannot confirm a reservation that has already started.");
            }

            var timeUntillResStart = dbWorkstationReservation.ReservationStart - DateTime.UtcNow;

            if (timeUntillResStart > TimeSpan.FromHours(1))
            {
                throw new BadRequestException("Reservation can only be confirmed within 1 hour before it starts.");
            }

            if(dbWorkstationReservation.IsConfirmed)
            {
                throw new BadRequestException("Reservation is already confirmed.");
            }

            dbWorkstationReservation.IsConfirmed = true;
            dbWorkstationReservation.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            return new WorkstationReservationResponse
            {
                Id = dbWorkstationReservation.Id,
                UserId = dbWorkstationReservation.UserId,
                WorkstationId = dbWorkstationReservation.WorkstationId,
                ReservationStart = dbWorkstationReservation.ReservationStart,
                ReservationEnd = dbWorkstationReservation.ReservationEnd,
                CreatedAt = dbWorkstationReservation.CreatedAt,
                IsConfirmed = dbWorkstationReservation.IsConfirmed
            };
        }

        ///Temat .net jobów trzeba by było dodać do tego że co 15-20 min usuwa te rezerwacje
        public async Task RemoveExpiredUnconfirmedReservationsAsync()
        {
            var now = DateTime.UtcNow;

            var expiredUnconfirmedReservations = await _context.WorkstationReservations
                .Where(r => !r.IsConfirmed && r.ReservationStart <= now)
                .ToListAsync();

            if (expiredUnconfirmedReservations.Any())
            {
                _context.WorkstationReservations.RemoveRange(expiredUnconfirmedReservations);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteWorkstationReservationAsync(int reservationId)
        {
            var dbReservation = await _context.WorkstationReservations
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (dbReservation == null)
            {
                throw new NotFoundException($"Workstation reservation with ID {reservationId} not found.");
            }

            var now = DateTime.UtcNow;

            if (dbReservation.ReservationStart <= now && now < dbReservation.ReservationEnd)
            {
                throw new BadRequestException("Cannot delete a reservation that has already started.");
            }

            _context.WorkstationReservations.Remove(dbReservation);
            await _context.SaveChangesAsync();

        }

        private void ValidateReservationDateConstraints(DateTime reservationStart, DateTime reservationEnd)
        {
            var now = DateTime.UtcNow;

            if(reservationStart < now)
            {
                throw new BadRequestException("Reservation start time must be in the future.");
            }

            if(reservationEnd <= reservationStart)
            {
                throw new BadRequestException("Reservation end time must be after the start time.");
            }

            if(reservationStart.Date != reservationEnd.Date)
            {
                throw new BadRequestException("Reservation must start and end on the same day.");
            }

            if((reservationStart - now).TotalDays > 7)
            {
                throw new BadRequestException("Reservations can only be made up to 7 days in advance.");
            }

        }

        private void ValidateReservationTime(DateTime? requestedStart, DateTime? requestedEnd, DateTime? existingStart= null, DateTime? existingEnd = null)
        {
           
            var start = requestedStart ?? existingStart;
            var end = requestedEnd ?? existingEnd;

            if (start == null || end == null)
            {
                throw new BadRequestException("Reservation start and end times are required.");
            }

            //Convert to local time before compare
            var startLocal = start.Value.ToLocalTime();
            var endLocal = end.Value.ToLocalTime();

            var startHour = startLocal.TimeOfDay;
            var endHour = endLocal.TimeOfDay;

            int startingTime = 8;
            int endingTime = 18;
            int minBookingDuration = 30;


            if (startHour < TimeSpan.FromHours(startingTime) || startHour >= TimeSpan.FromHours(endingTime) ||
                endHour <= TimeSpan.FromHours(startingTime) || endHour > TimeSpan.FromHours(endingTime))
            {
                throw new BadRequestException($"Reservation time must be between {startingTime}:00 and {endingTime}:00.");
            }

            if ((startLocal.Minute != 0 && startLocal.Minute != 30) ||
                (endLocal.Minute != 0 && endLocal.Minute != 30))
            {
                throw new BadRequestException("Reservations can only start and end on the hour or half-hour (e.g., 08:00, 08:30).");
            }

            if ((endLocal - startLocal).TotalMinutes < minBookingDuration)
            {
                throw new BadRequestException($"Minimum booking duration is {minBookingDuration} minutes.");
            }
        }

        private async Task<bool> IsReservationOverlapping(int workstationId, DateTime start, DateTime end)
        {
            return await _context.WorkstationReservations
                .AnyAsync(wr =>
                    wr.WorkstationId == workstationId &&
                    wr.ReservationStart < end &&
                    start < wr.ReservationEnd);
        }

        private async Task<bool> IsReservationOverlapping(int workstationId, DateTime start, DateTime end,int excludeReservation )
        {
            return await _context.WorkstationReservations
                .AnyAsync(wr =>
                    wr.WorkstationId == workstationId &&
                    wr.Id != excludeReservation &&
                    wr.ReservationStart < end &&
                    start < wr.ReservationEnd);
        }

        private WorkstationReservationResponse MapToResponse(WorkstationReservation reservation)
        {
            return new WorkstationReservationResponse
            {
                //Wywalic to localTime jak coś
                Id = reservation.Id,
                UserId = reservation.UserId,
                WorkstationId = reservation.WorkstationId,
                ReservationStart = reservation.ReservationStart,
                ReservationEnd = reservation.ReservationEnd,
                CreatedAt = reservation.CreatedAt,
                IsConfirmed = reservation.IsConfirmed
            };
        }

       
    }
}
