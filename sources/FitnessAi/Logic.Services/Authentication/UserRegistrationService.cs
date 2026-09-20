using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Settings;
using Data.Database.Entities.User;
using Logic.Services.Interfaces;
using Logic.Shared;
using Microsoft.Extensions.Options;
using Shared.Enums.Authentication;
using Shared.Interfaces.Authentication;
using Shared.Models.Authentication;

namespace Logic.Services.Authentication
{
    public class UserRegistrationService : IUserRegistrationService
    {
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly JwtOptions _jwtOptions;

        public UserRegistrationService(
            IApplicationUnitOfWork applicationUnitOfWork,
            IJwtTokenService jwtTokenService,
            IOptions<JwtOptions> jwtOptions)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
            _jwtTokenService = jwtTokenService;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<TokenResponse?> RegisterUser(UserRegistrationModel model)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(model.Email, nameof(model.Email));
                ArgumentException.ThrowIfNullOrEmpty(model.Password, nameof(model.Password));

                if (await EmailIsTaken(model.Email))
                {
                    return null;
                }

                var userEntity = BuildUserEntity(model);

                await _applicationUnitOfWork.UserRepository.AddAsync(userEntity);
                var result = await _applicationUnitOfWork.SaveChangesAsync();

                if (result <= 0)
                {
                    return null;
                }

                await CreateRelatedEntities(userEntity.Id);

                return await IssueTokens(userEntity);
            }
            catch (Exception)
            {
                return null;
            }
        }

        private async Task<bool> EmailIsTaken(string email)
        {
            var existingUser = await _applicationUnitOfWork.UserRepository.GetSingleAsync(
                new DbQueryOptions<UserEntity> { WhereExpression = u => u.Email == email });

            return existingUser != null;
        }

        private static UserEntity BuildUserEntity(UserRegistrationModel model)
        {
            return new UserEntity
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                AppId = Guid.NewGuid().ToString(),
                UserRole = UserRoleEnum.UserRole,
                UserCredentials = new UserCredentialsEntity
                {
                    PasswordHash = EncryptionHelper.HashPassword(model.Password)
                },
                Settings = new SettingsEntity
                {
                    AiSettings = new AISettingsEntity
                    {
                        CanUseHealthDataForAiTraining = false,
                        CanUseHealthDataAcceptedAt = null,
                        CanUseHealthDataRejectedAt = null,
                    }
                },
            };
        }

        private async Task CreateRelatedEntities(long userId)
        {
            await _applicationUnitOfWork.UserBodyDataRepository.AddAsync(new UserBodyDataEntity
            {
                UserId = userId
            });

            await _applicationUnitOfWork.SaveChangesAsync();
        }

        private async Task<TokenResponse?> IssueTokens(UserEntity userEntity)
        {
            var jwtToken = _jwtTokenService.CreateAccessToken(userEntity, DateTime.UtcNow);
            var refreshToken = _jwtTokenService.CreateRefreshToken();

            userEntity.UserCredentials.RefreshToken = refreshToken;
            userEntity.UserCredentials.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

            var result = await _applicationUnitOfWork.SaveChangesAsync();

            return result > 0 ? new TokenResponse
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                TokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
            } : null;
        }
    }
}
