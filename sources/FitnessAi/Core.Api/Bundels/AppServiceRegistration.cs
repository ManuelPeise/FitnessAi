using Core.Api.AuthorizationAttributes;
using Core.Api.Bundels.Scheduler;
using Core.Api.HttpClients;
using Data.Accessor.DI;
using Data.Database;
using Logic.Ai.DI;
using Logic.Services.DI;
using Logic.Shared.DI;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Shared.Enums.Authentication;
using Shared.Models.Authentication;
using System.Text;

namespace Core.Api.Bundels
{
    public static class AppServiceRegistration
    {
        public static void AddAppServices(this IServiceCollection services, WebApplicationBuilder builder)
        {
            services
            .AddOptions<JwtOptions>()
            .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
            .ValidateOnStart();

            var connectionString = builder.Configuration.GetConnectionString("AiDbContext") ??
                throw new InvalidOperationException("Connection string 'AiDbContext' not found.");

            services.AddDbContext<AIDbContext>(opt =>
            {
                opt.UseMySQL(connectionString);
            });

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            services.AddHttpContextAccessor();

            var jwtOptions =
                builder.Configuration
                    .GetSection(JwtOptions.SectionName)
                    .Get<JwtOptions>() ??
                    throw new InvalidOperationException("JWT configuration is missing.");

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = jwtOptions.Issuer,
                        ValidAudience = jwtOptions.Audience,

                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtOptions.SigningKey))
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            if (context.Request.Cookies.TryGetValue("access_token", out var accessToken))
                            {
                                context.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddAuthorization(options =>
            {
                options.AddPolicy(
                    AuthorizationPolicies.ApiAuthentication,
                    policy =>
                    {
                        policy.RequireAuthenticatedUser();
                        policy.AddRequirements(
                            new ApiAuthorizationRequirement(UserRoleEnum.UserRole));
                    });
                options.AddPolicy(
                    AuthorizationPolicies.MaintenanceUserAuthentication,
                    policy =>
                    {
                        policy.RequireAuthenticatedUser();
                        policy.AddRequirements(
                            new MaintenanceUserAuthorizationRequirement(UserRoleEnum.MaintenanceRole));
                    });
            });

            services.AddScoped<IAuthorizationHandler, ApiAuthorizationHandler>();
            services.AddScoped<IAuthorizationHandler, MaintenanceUserAuthorizationHandler>();

            services.AddControllers();

            services.AddOpenApi();

            services.RegisterHttpClients(builder.Configuration);
            services.AddSchedulerServices();
            services.AddLogicServices();
            services.AddDataAccessorServices();
            services.AddSharedServices();
            services.AddAiServices();
        }
    }
}
