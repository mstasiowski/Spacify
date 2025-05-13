
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SpacifyAPI.Data;
using SpacifyAPI.Interfaces;
using SpacifyAPI.Middlewares;
using SpacifyAPI.Services;
using SpacifyAPI.Tasks;
using System.Text;

namespace SpacifyAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            //Cors
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularF", policy =>
                {
                    policy.WithOrigins("https://localhost:4200", "http://localhost:4200")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

                // Add services to the container.

            builder.Services.AddControllers();

            builder.Services.AddHttpContextAccessor();

            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {

                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(e => e.Value.Errors.Count > 0)
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        );

                    var problem = new ProblemDetails
                    {
                        Status = StatusCodes.Status400BadRequest,
                        Title = "Validation failed",
                        Type = "https://httpstatuses.com/400",
                        Extensions = { ["errors"] = errors }
                    };

                    return new BadRequestObjectResult(problem);
                };
            });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition(name: JwtBearerDefaults.AuthenticationScheme,
                securityScheme: new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Description = "Enter `Bearer` [space] and then your `token`",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = JwtBearerDefaults.AuthenticationScheme
                            }
                        },
                        new string[] {}
                    }
                });
            });

            //register GlobalExceptionHandler and ProblemDetails
            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddProblemDetails();

            //Add database context
            builder.Services.AddDbContext<SpacifyDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = builder.Configuration["AppSettings:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["AppSettings:Audience"],
                        ValidateLifetime = true,
                        // wy³¹czenie luzu czasowego dla serwera (ok 5 minut)
                        ClockSkew = TimeSpan.Zero,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!))
                    };
                });

            
            //Register services
            builder.Services.AddScoped<IFloorService, FloorService>();
            builder.Services.AddScoped<IConferenceRoomService, ConferenceRoomService>();
            builder.Services.AddScoped<IWorkstationService, WorkstationService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IWorkstationReservationService, WorkstationReservationService>();
            builder.Services.AddScoped<IConferenceRoomReservationService, ConferenceRoomReservationService>();

            //Tasks
            builder.Services.AddHostedService<WorkstationReservationCleanupService>();

            // max request body size
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.Limits.MaxRequestBodySize = 1048576; // 1 MB
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Middleware do ustawienia nag³ówka CSP
            //Tutaj ten unsafe-inline jest tylko dla dev, w produkcji powinno byæ bez tego
            app.Use(async (context, next) =>
            {
               var cspPolicy =
                    "default-src 'none'; " +               // Domyœlnie wszystko zablokowane
                    "script-src 'self'; " +                 // Skrypty tylko z backendu
                    "style-src 'self' 'unsafe-inline'; " +  // Style z backendu i inline (dla dev)
                    "img-src 'self' data:; " +              // Obrazy z backendu oraz base64
                    "font-src 'self'; " +                   // Fonty tylko z backendu
                    "connect-src 'self' http://localhost:4200; " +  // Dozwolone po³¹czenia z frontendem Angular
                    "frame-ancestors 'none';";            // Blokuje osadzanie w iframe (ochrona przed clickjackingiem)

                context.Response.Headers.Append("Content-Security-Policy", cspPolicy);

                await next();
            });


            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            // Middleware do obs³ugi wyj¹tków
            app.UseExceptionHandler();

            app.MapControllers();

            app.Run();
        }
    }
}
