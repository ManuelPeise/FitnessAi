using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.User;
using Logic.Modules.Interfaces;
using Logic.Services.Interfaces;
using Logic.Shared;
using Microsoft.Extensions.Options;
using Shared.Enums.Settings;
using Shared.Interfaces.Authentication;
using Shared.Models.Authentication;

namespace Logic.Services.Authentication
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly IHealthConnectConfiguration _healthConnectConfiguration;
        private readonly JwtOptions _jwtOptions;

        public AuthenticationService(
            IJwtTokenService jwtTokenService,
            IApplicationUnitOfWork applicationUnitOfWork,
            IHealthConnectConfiguration healthConnectConfiguration,
            IOptions<JwtOptions> jwtOptions)
        {
            _jwtTokenService = jwtTokenService;
            _applicationUnitOfWork = applicationUnitOfWork;
            _healthConnectConfiguration = healthConnectConfiguration;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<TokenResponse?> AuthenticateUser(UserAuthenticationModel model)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(model.Email, nameof(model.Email));
                ArgumentException.ThrowIfNullOrEmpty(model.Password, nameof(model.Password));

                var userEntity = await GetUserByEmail(model.Email);

                if (userEntity == null)
                {
                    throw new ArgumentException(nameof(model));
                }

                if (!EncryptionHelper.VerifyPassword(model.Password, userEntity.UserCredentials.PasswordHash))
                {
                    throw new ArgumentException(nameof(model));
                }

                var jwtToken = _jwtTokenService.CreateAccessToken(userEntity, DateTime.UtcNow);
                var refreshToken = _jwtTokenService.CreateRefreshToken();

                IssueRefreshToken(userEntity, refreshToken);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0 ? new TokenResponse
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken
                } : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<TokenResponse?> AuthenticateUserOnMobile(UserAuthenticationModel model)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(model.Email, nameof(model.Email));
                ArgumentException.ThrowIfNullOrEmpty(model.Password, nameof(model.Password));

                var userEntity = await GetUserByEmail(model.Email);

                if (userEntity == null)
                {
                    throw new ArgumentException(nameof(model));
                }

                if (!EncryptionHelper.VerifyPassword(model.Password, userEntity.UserCredentials.PasswordHash))
                {
                    throw new ArgumentException(nameof(model));
                }

                var jwtToken = _jwtTokenService.CreateAccessToken(userEntity, DateTime.UtcNow);
                var refreshToken = _jwtTokenService.CreateRefreshToken();

                IssueRefreshToken(userEntity, refreshToken);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0 ? BuildTokenResponse(userEntity, jwtToken, refreshToken) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<TokenResponse?> AuthenticateSyncClient(SyncClientAuthenticationModel model)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(model.Email, nameof(model.Email));
                ArgumentException.ThrowIfNullOrEmpty(model.Password, nameof(model.Password));

                var userEntity = await GetUserByEmail(model.Email);

                if (userEntity == null)
                {
                    throw new ArgumentException(nameof(model));
                }

                if (!EncryptionHelper.VerifyPassword(model.Password, userEntity.UserCredentials.PasswordHash))
                {
                    throw new ArgumentException(nameof(model));
                }

                var jwtToken = _jwtTokenService.CreateAccessToken(userEntity, DateTime.UtcNow);
                var refreshToken = _jwtTokenService.CreateRefreshToken();

                IssueRefreshToken(userEntity, refreshToken);

                var result = await _applicationUnitOfWork.SaveChangesAsync();
                
                var scheduleSettings = userEntity.SpecialSettings.SingleOrDefault(x => x.SettingsType == SettingsTypeEnum.HealthConnectSettings);
                
                return result > 0 ? BuildTokenResponse(userEntity, jwtToken, refreshToken) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<TokenResponse?> RefreshToken(string refreshToken)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(refreshToken, nameof(refreshToken));

                var userEntity = await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
                {
                    WhereExpression = x => x.UserCredentials.RefreshToken == refreshToken,
                    Includes = new List<System.Linq.Expressions.Expression<Func<UserEntity, object>>>
                    {
                        x => x.UserCredentials
                    }
                });

                if (userEntity == null || userEntity.UserCredentials.RefreshTokenExpiresAt == null
                    || userEntity.UserCredentials.RefreshTokenExpiresAt <= DateTime.UtcNow)
                {
                    return null;
                }

                var jwtToken = _jwtTokenService.CreateAccessToken(userEntity, DateTime.UtcNow);
                var newRefreshToken = _jwtTokenService.CreateRefreshToken();

                IssueRefreshToken(userEntity, newRefreshToken);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0 ? BuildTokenResponse(userEntity, jwtToken, newRefreshToken) : null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private async Task<UserEntity?> GetUserByEmail(string email)
        {
            return await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
            {
                WhereExpression = x => x.Email == email,
                Includes = new List<System.Linq.Expressions.Expression<Func<UserEntity, object>>>
                {
                    x => x.UserCredentials, x => x.SpecialSettings
                }
            });
        }

        private void IssueRefreshToken(UserEntity userEntity, string refreshToken)
        {
            userEntity.UserCredentials.RefreshToken = refreshToken;
            userEntity.UserCredentials.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);
        }

        private TokenResponse BuildTokenResponse(UserEntity userEntity, string jwtToken, string refreshToken)
        {
            return new TokenResponse
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                TokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes),
            };
        }
    }
}
