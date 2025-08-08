using Microsoft.EntityFrameworkCore;
using SpacifyAPI.Data;
using System.Security.Claims;

namespace SpacifyAPI.Middlewares
{
    public class BlockedUserMiddleware
    {
        private readonly RequestDelegate _next;

        public BlockedUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, SpacifyDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    var user = await dbContext.Users.FindAsync(userId);

                    if (user != null && user.IsBlocked && user.AccountBlockedUntil > DateTime.UtcNow)
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { reason = "account_blocked" });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
