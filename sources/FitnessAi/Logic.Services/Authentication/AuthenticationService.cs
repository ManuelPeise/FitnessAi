using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.User;
using Logic.Services.Interfaces;
using Logic.Shared;
using Microsoft.Extensions.Options;
using Shared.Models.Authentication;

namespace Logic.Services.Authentication
{
    public class AuthenticationService : IAuthenticationService
    {
       
        private readonly JwtTokenService _jwtTokenService;
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        public AuthenticationService(
            IOptions<JwtOptions> jwtOptions, 
            IApplicationUnitOfWork applicationUnitOfWork)
        {
            _jwtTokenService = new JwtTokenService(jwtOptions);
            _applicationUnitOfWork = applicationUnitOfWork;
        }

        public async Task<string?> AuthenticateUser(UserAuthenticationModel model)
        {
            try
            {
                ArgumentException.ThrowIfNullOrEmpty(model.Email, nameof(model.Email));
                ArgumentException.ThrowIfNullOrEmpty(model.Password, nameof(model.Password));

                var userEntity = await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
                {
                    WhereExpression = x => x.Email == model.Email,
                    Includes = new List<System.Linq.Expressions.Expression<Func<UserEntity, object>>>
                    {
                        x => x.UserCredentials
                    }
                });

                if(userEntity == null)
                {
                    throw new ArgumentException(nameof(model));
                }

                if (!EncryptionHelper.VerifyPassword(model.Password, userEntity.UserCredentials.PasswordHash))
                {
                    throw new ArgumentException(nameof(model));
                }

                var jwtToken = _jwtTokenService.CreateAccessToken(userEntity, DateTime.UtcNow);
                var refreshToken = _jwtTokenService.CreateRefreshToken();
                

                userEntity.UserCredentials.RefreshToken = refreshToken;

                var result =await _applicationUnitOfWork.SaveChangesAsync();

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

                var userEntity = await _applicationUnitOfWork.UserRepository.GetSingleAsync(new DbQueryOptions<UserEntity>
                {
                    WhereExpression = x => x.Email == model.Email,
                    Includes = new List<System.Linq.Expressions.Expression<Func<UserEntity, object>>>
                    {
                        x => x.UserCredentials
                    }
                });

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


                userEntity.UserCredentials.RefreshToken = refreshToken;
                
                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0 ? new TokenResponse
                {
                    Token = jwtToken,
                    RefreshToken = refreshToken,
                    TokenExpiresAt = DateTime.UtcNow.AddMinutes(30),
                    AppId = userEntity.AppId
                } : null;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
