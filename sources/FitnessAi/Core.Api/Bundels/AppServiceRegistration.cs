using Core.Api.AuthorizationAttributes;
using Data.Accessor.DI;
using Data.Database;
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
            });

            services.AddScoped<IAuthorizationHandler, ApiAuthorizationHandler>();

            services.AddControllers();

            services.AddOpenApi();

            ServiceRegistration.AddLogicServices(services);
            DataAccessorServiceRegistration.AddDataAccessorServices(services);
            SharedServiceRegistration.AddSharedServices(services);
        }
    }
}
