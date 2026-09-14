using Logic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Shared.Models.Authentication;

namespace Core.Api.ApiControllers.Authentication
{
    public class UserRegistrationController : ApiControllerBase
    {
        private readonly IUserRegistrationService _userRegistrationService;
        private readonly JwtOptions _jwtOptions;

        public UserRegistrationController(IUserRegistrationService userRegistrationService, IOptions<JwtOptions> jwtOptions)
        {
            _userRegistrationService = userRegistrationService;
            _jwtOptions = jwtOptions.Value;
        }

        [HttpPost(Name = "RegisterUser")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationModel model)
        {
            var tokenResponse = await _userRegistrationService.RegisterUser(model);

            if (tokenResponse == null)
            {
                return Conflict();
            }

            AppendAuthenticationCookies(tokenResponse);

            return Ok(new AuthenticationResponseModel
            {
                Success = !string.IsNullOrEmpty(tokenResponse.Token) && !string.IsNullOrEmpty(tokenResponse.RefreshToken)
            });
        }

        [HttpPost(Name ="Logout")]
        public async Task<IActionResult> Logout()
        {
            ClearAuthenticationCookies();

            return Ok();
        }

        [NonAction]
        private void AppendAuthenticationCookies(TokenResponse tokenResponse)
        {
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
        }

        [NonAction]
        private void ClearAuthenticationCookies()
        {
            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("refresh_token");
        }
    }
}
