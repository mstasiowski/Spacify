using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Entities;

namespace SpacifyAPI.Data
{
    public class SpacifyDbContext: DbContext
    {
        public SpacifyDbContext(DbContextOptions<SpacifyDbContext> options): base(options)
        {

        }

        public DbSet<Workstation> Workstations { get; set; } = null!;
        public DbSet<ConferenceRoom> ConferenceRooms { get; set; } = null!;
        public DbSet<Floor> Floors { get; set; } = null!;
        public DbSet<WorkstationReservation> WorkstationReservations { get; set; } = null!;
        public DbSet<ConferenceRoomReservation> ConferenceRoomReservations { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<LogActivity> LogActivities { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User -> WorkstationReservations
            modelBuilder.Entity<User>()
                .HasMany(u => u.WorkstationReservations)
                .WithOne(wr => wr.User)
                .HasForeignKey(wr => wr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> ConferenceRoomReservations
            modelBuilder.Entity<User>()
                .HasMany(u => u.ConferenceRoomReservations)
                .WithOne(crr => crr.User)
                .HasForeignKey(crr => crr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User -> LogActivities
            //modelBuilder.Entity<User>()
            //    .HasMany<LogActivity>()
            //    .WithOne()
            //    .HasForeignKey(l => l.UserId)
            //    .OnDelete(DeleteBehavior.Cascade);

            // Floor -> Workstations
            modelBuilder.Entity<Floor>()
                .HasMany(f => f.Workstations)
                .WithOne(w => w.Floor)
                .HasForeignKey(w => w.FloorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Floor -> ConferenceRooms
            modelBuilder.Entity<Floor>()
                .HasMany(f => f.ConferenceRooms)
                .WithOne(cr => cr.Floor)
                .HasForeignKey(cr => cr.FloorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Workstation -> WorkstationReservations
            modelBuilder.Entity<Workstation>()
                .HasMany(w => w.WorkstationReservations)
                .WithOne(wr => wr.Workstation)
                .HasForeignKey(wr => wr.WorkstationId)
                .OnDelete(DeleteBehavior.Cascade);

            // ConferenceRoom -> ConferenceRoomReservations
            modelBuilder.Entity<ConferenceRoom>()
                .HasMany(cr => cr.ConferenceRoomReservations)
                .WithOne(crr => crr.ConferenceRoom)
                .HasForeignKey(crr => crr.ConferenceRoomId)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();
        }
    }
}
