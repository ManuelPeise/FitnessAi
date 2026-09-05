using Data.Accessor.Interfaces;
using Logic.Services.Interfaces;
using Logic.Shared.Interfaces;
using Microsoft.Extensions.Logging;
using Shared.Models.Authentication;

namespace Logic.Services.Authentication
{
    public class UserService: IUserService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly ILogger<UserService> _logger;
        public UserService(ILogger<UserService> logger, ICurrentUserService currentUserService, IApplicationUnitOfWork applicationUnitOfWork)
        {
            _logger = logger;
            _currentUserService = currentUserService;
            _applicationUnitOfWork = applicationUnitOfWork;
        }

        public async Task<UserExportModel?> GetCurrentUserAsync()
        {
            try
            {
                var currentIserId = _currentUserService.UserId;

                if (currentIserId == -1)
                {
                    throw new Exception("User is not authenticated.");
                }

                var userEntity = await _applicationUnitOfWork.UserRepository.GetByIdAsync(currentIserId);

                if(userEntity == null)
                {
                    throw new Exception("User not found.");
                }

                return new UserExportModel
                {
                    Id = userEntity.Id,
                    Email = userEntity.Email,
                    CreatedAt = userEntity.CreatedAt.ToString("o"),
                    UpdatedAt = userEntity.UpdatedAt?.ToString("o")
                };
            }
            catch(Exception exception) {
               
                _logger.LogError(exception, "An error occurred while retrieving the current user.");

                return null;
            }
        }
    }
}
