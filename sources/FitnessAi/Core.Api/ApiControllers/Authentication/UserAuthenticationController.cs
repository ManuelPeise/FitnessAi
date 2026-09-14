using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Shared.Models.Authentication;

namespace Core.Api.ApiControllers.Authentication
{
    public class UserAuthenticationController : ApiControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly JwtOptions _jwtOptions;

        public UserAuthenticationController(IAuthenticationService authenticationService, IOptions<JwtOptions> jwtOptions)
        {
            _authenticationService = authenticationService;
            _jwtOptions = jwtOptions.Value;
        }

        [HttpPost(Name = "AuthenticateUser")]
        public async Task<IActionResult> AuthenticateUser([FromBody] UserAuthenticationModel model)
        {
            var tokenResponse = await _authenticationService.AuthenticateUser(model);

            if (tokenResponse == null)
            {
                return Unauthorized();
            }

            Response.Cookies.Append(
                "access_token",
                tokenResponse.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
                });

            Response.Cookies.Append(
               "refresh_token",
               tokenResponse.RefreshToken,
               new CookieOptions
               {
                   HttpOnly = true,
                   Secure = true,
                   SameSite = SameSiteMode.Strict,
                   Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
               });

            return Ok(new AuthenticationResponseModel 
            { 
                Success = !string.IsNullOrEmpty(tokenResponse.Token)  && !string.IsNullOrEmpty(tokenResponse.RefreshToken)
            });
        }   

        [HttpPost(Name = "AuthenticateUserOnMobile")]
        public async Task<TokenResponse?> AuthenticateUserOnMobile([FromBody] UserAuthenticationModel model)
        {
            return await _authenticationService.AuthenticateUserOnMobile(model);
        }

        [HttpPost(Name = "RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestModel model)
        {
            var tokenResponse = await _authenticationService.RefreshToken(model.RefreshToken);

            if (tokenResponse == null)
            {
                return Unauthorized();
            }

            Response.Cookies.Append(
                "access_token",
                tokenResponse.Token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
                });

            Response.Cookies.Append(
                "refresh_token",
                tokenResponse.RefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
                });

            return Ok();
        }
    }
}
