
using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;

namespace SpacifyAPI.Tasks
{
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RefreshTokenCleanupService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(15);

        public RefreshTokenCleanupService(IServiceProvider serviceProvider, ILogger<RefreshTokenCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation($"[{DateTime.Now}] Removal of expired tokens from the database has begun...");
            while(!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var spacifyDbContext = scope.ServiceProvider.GetRequiredService<SpacifyDbContext>();

                        var expiredTokens = await spacifyDbContext.Users
                            .Where(u => u.RefreshTokenExpirationTime != null && u.RefreshTokenExpirationTime < DateTime.UtcNow)
                            .ToListAsync(stoppingToken);

                        foreach (var user in expiredTokens)
                        {
                            user.RefreshToken = null;
                            user.RefreshTokenExpirationTime = null;
                        }

                        if (expiredTokens.Count > 0)
                        {
                            _logger.LogInformation($"Removing {expiredTokens.Count} expired refresh tokens from the database.");
                            await spacifyDbContext.SaveChangesAsync(stoppingToken);
                        }

                        

                    }
                       

                }
                catch(Exception err)
                {
                    _logger.LogError(err, "An error occurred while cleaning up expired refresh tokens.");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
