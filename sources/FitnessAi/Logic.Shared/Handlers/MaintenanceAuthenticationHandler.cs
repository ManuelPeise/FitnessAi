using Data.Database.Entities.User;
using Microsoft.Extensions.Options;
using Shared.Enums.Authentication;
using Shared.Interfaces.Authentication;
using System.Net.Http.Headers;

namespace Logic.Shared.Handlers
{
    public class MaintenanceAuthenticationHandler : DelegatingHandler
    {
        private readonly IJwtTokenService _tokenService;

        public MaintenanceAuthenticationHandler(IJwtTokenService tokenService)
        {
            _tokenService = tokenService;
        }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var maintenanceUserEntity = new UserEntity
            {
                Email = "maintenanceUser@fitnesAi.com",
                UserRole = UserRoleEnum.MaintenanceRole
            };

            var token = _tokenService.CreateAccessToken(maintenanceUserEntity, DateTime.UtcNow);

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            return await base.SendAsync(request, cancellationToken);
        }
    }
}
