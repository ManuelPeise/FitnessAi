using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.User;
using Logic.Services.Interfaces;
using Logic.Shared;
using Microsoft.Extensions.Options;
using Shared.Interfaces.Authentication;
using Shared.Models.Authentication;

namespace Logic.Services.Authentication
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly JwtOptions _jwtOptions;

        public AuthenticationService(
            IJwtTokenService jwtTokenService,
            IApplicationUnitOfWork applicationUnitOfWork,
            IOptions<JwtOptions> jwtOptions)
        {
            _jwtTokenService = jwtTokenService;
            _applicationUnitOfWork = applicationUnitOfWork;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<string?> AuthenticateUser(UserAuthenticationModel model)
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

                IssueRefreshToken(userEntity);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0 ? jwtToken : null;
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
                var refreshToken = IssueRefreshToken(userEntity);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

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
                var newRefreshToken = IssueRefreshToken(userEntity);

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
                    x => x.UserCredentials
                }
            });
        }

        private string IssueRefreshToken(UserEntity userEntity)
        {
            var refreshToken = _jwtTokenService.CreateRefreshToken();

            userEntity.UserCredentials.RefreshToken = refreshToken;
            userEntity.UserCredentials.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays);

            return refreshToken;
        }

        private TokenResponse BuildTokenResponse(UserEntity userEntity, string jwtToken, string refreshToken)
        {
            return new TokenResponse
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                TokenExpiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes),
                AppId = userEntity.AppId
            };
        }
    }
}
