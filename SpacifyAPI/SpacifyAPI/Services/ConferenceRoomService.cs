using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using SpacifyAPI.Entities;
using SpacifyAPI.Exceptions;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Models.Requests;
using SpacifyAPI.Models.Responses;

namespace SpacifyAPI.Services
{
    public class ConferenceRoomService: IConferenceRoomService
    {
        private readonly SpacifyDbContext _context;
        public ConferenceRoomService(SpacifyDbContext context)
        {
            _context = context;
        }
        public async Task<List<ConferenceRoomResponse>> GetAllConferenceRoomsAsync()
        {
            var dbConferenceRooms = await _context.ConferenceRooms
                .Include(cr => cr.Floor)
                .AsNoTracking()
                .ToListAsync();

            if (dbConferenceRooms == null || dbConferenceRooms.Count == 0)
            {
                throw new NotFoundException("No conference rooms found in the database.");
            }

            //return dbConferenceRooms.Select(r => new ConferenceRoomResponse
            //{
            //    Id = r.Id,
            //    Name = r.Name,
            //    EquipmentDetails = r.EquipmentDetails,
            //    ImageUrl = r.ImageUrl,
            //    Capacity = r.Capacity,
            //    FloorId = r.FloorId
            //}).ToList();

            return dbConferenceRooms.Select(MapToResponse).ToList();
        }
        public async Task<ConferenceRoomResponse> GetConferenceRoomByIdAsync(int id)
        {
            var dbConferenceRoom = await _context.ConferenceRooms
                .Include(cr => cr.Floor)
                .FirstOrDefaultAsync(cr => cr.Id == id);

            if (dbConferenceRoom == null)
            {
                throw new NotFoundException($"Conference room with id {id} not found.");
            }

            //return new ConferenceRoomResponse
            //{
            //    Id = dbConferenceRoom.Id,
            //    Name = dbConferenceRoom.Name,
            //    EquipmentDetails = dbConferenceRoom.EquipmentDetails,
            //    ImageUrl = dbConferenceRoom.ImageUrl,
            //    Capacity = dbConferenceRoom.Capacity,
            //    FloorId = dbConferenceRoom.FloorId
            //};

            return MapToResponse(dbConferenceRoom);

        }

        public async Task<List<ConferenceRoomResponse>> GetConfRoomsByFloorAsync(int floorId)
        {
            var dbConfReservation = await _context.ConferenceRooms
                .Where(cr=>cr.FloorId == floorId)
                .ToListAsync();

            if (dbConfReservation == null || dbConfReservation.Count == 0)
            {
                throw new NotFoundException($"No conference rooms found for floor with id {floorId}.");
            }


                return dbConfReservation.Select(MapToResponse).ToList();
        }

        public async Task<ConferenceRoomResponse> CreateConferenceRoomAsync(CreateConferenceRoomRequest conferenceRoom)
        {
            if (conferenceRoom == null)
            {
                throw new BadRequestException("Conference room cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(conferenceRoom.Name) || string.IsNullOrWhiteSpace(conferenceRoom.ImageUrl))
            {
                throw new BadRequestException("Conference room name and image URL cannot be empty.");
            }

            if(string.IsNullOrWhiteSpace(conferenceRoom.EquipmentDetails))
            {
                throw new BadRequestException("Conference room equipment details cannot be empty.");
            }

            if (conferenceRoom.Capacity < 10 || conferenceRoom.Capacity > 50)
            {
                throw new BadRequestException("Conference room capacity must be between 10 and 50.");
            }

            if (conferenceRoom.FloorId <= 0)
            {
                throw new BadRequestException("Floor ID must be a positive integer.");
            }

            if(int.TryParse(conferenceRoom.FloorId.ToString(), out int floorId))
            {
                var dbFloor = await _context.Floors.FindAsync(floorId);
                if (dbFloor == null)
                {
                    throw new NotFoundException($"Floor with id {floorId} not found");
                }
            }else
            {
                throw new BadRequestException("Floor ID must be a positive integer.");
            }

            var newConferenceRoom = new ConferenceRoom
            {
                Name = conferenceRoom.Name,
                EquipmentDetails = conferenceRoom.EquipmentDetails,
                ImageUrl = conferenceRoom.ImageUrl,
                Capacity = conferenceRoom.Capacity,
                FloorId = conferenceRoom.FloorId
            };

            _context.ConferenceRooms.Add(newConferenceRoom);
            await _context.SaveChangesAsync();

            //return new ConferenceRoomResponse
            //{
            //    Id = newConferenceRoom.Id,
            //    Name = newConferenceRoom.Name,
            //    EquipmentDetails = newConferenceRoom.EquipmentDetails,
            //    ImageUrl = newConferenceRoom.ImageUrl,
            //    Capacity = newConferenceRoom.Capacity,
            //    FloorId = newConferenceRoom.FloorId
            //};
            return MapToResponse(newConferenceRoom);
        }

        public async Task<ConferenceRoomResponse> UpdateConferenceRoomAsync(int id, CreateConferenceRoomRequest updatedConferenceRoom)
        {
            if(updatedConferenceRoom == null)
            {
                throw new BadRequestException("Conference room cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(updatedConferenceRoom.Name) || string.IsNullOrWhiteSpace(updatedConferenceRoom.ImageUrl))
            {
                throw new BadRequestException("Conference room name and image URL cannot be empty.");
            }

            if (string.IsNullOrWhiteSpace(updatedConferenceRoom.EquipmentDetails))
            {
                throw new BadRequestException("Conference room equipment details cannot be empty.");
            }

            if (updatedConferenceRoom.Capacity < 10 || updatedConferenceRoom.Capacity > 50)
            {
                throw new BadRequestException("Conference room capacity must be between 10 and 50.");
            }

            if (updatedConferenceRoom.FloorId <= 0)
            {
                throw new BadRequestException("Floor ID must be a positive integer.");
            }

            if (int.TryParse(updatedConferenceRoom.FloorId.ToString(), out int floorId))
            {
                var dbFloor = await _context.Floors.FindAsync(floorId);
                if (dbFloor == null)
                {
                    throw new NotFoundException($"Floor with id {floorId} not found");
                }
            }
            else
            {
                throw new BadRequestException("Floor ID must be a positive integer.");
            }

            var dbConferenceRoom = await _context.ConferenceRooms.FindAsync(id);

            if (dbConferenceRoom == null)
            {
                throw new NotFoundException($"Conference room with id {id} not found.");
            }

            dbConferenceRoom.Name = updatedConferenceRoom.Name;
            dbConferenceRoom.EquipmentDetails = updatedConferenceRoom.EquipmentDetails;
            dbConferenceRoom.ImageUrl = updatedConferenceRoom.ImageUrl;
            dbConferenceRoom.Capacity = updatedConferenceRoom.Capacity;
            dbConferenceRoom.FloorId = updatedConferenceRoom.FloorId;

            await _context.SaveChangesAsync();

            //return new ConferenceRoomResponse 
            //{
            //    Id = dbConferenceRoom.Id,
            //    Name = dbConferenceRoom.Name,
            //    EquipmentDetails = dbConferenceRoom.EquipmentDetails,
            //    ImageUrl = dbConferenceRoom.ImageUrl,
            //    Capacity = dbConferenceRoom.Capacity,
            //    FloorId = dbConferenceRoom.FloorId 
            //};

            return MapToResponse(dbConferenceRoom);
        }
        public async Task DeleteConferenceRoomAsync(int id)
        {
            var dbConferenceRoom = await _context.ConferenceRooms.FindAsync(id);
            
            if (dbConferenceRoom == null)
            {
                throw new NotFoundException($"Conference room with id {id} not found.");
            }

            if(int.TryParse(id.ToString(), out int conferenceRoomId) && id > 0)
            {
                _context.ConferenceRooms.Remove(dbConferenceRoom);
                await _context.SaveChangesAsync();

            }
            else
            {
                throw new BadRequestException("Conference room ID must be a positive number.");
            }


        }

        private ConferenceRoomResponse MapToResponse(ConferenceRoom reservation)
        {
            return new ConferenceRoomResponse
            {
                Id = reservation.Id,
                Name = reservation.Name,
                EquipmentDetails = reservation.EquipmentDetails,
                ImageUrl = reservation.ImageUrl,
                Capacity = reservation.Capacity,
                FloorId = reservation.FloorId
            };
        }


    }
}
