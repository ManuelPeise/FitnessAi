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
            var token = await _authenticationService.AuthenticateUser(model);

            if (token == null)
            {
                return Unauthorized();
            }

            Response.Cookies.Append(
                "access_token",
                token,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
                });

            return Ok(new AuthenticationResponseModel 
            { 
                Success = !string.IsNullOrEmpty(token) 
            });
        }
    }
}
