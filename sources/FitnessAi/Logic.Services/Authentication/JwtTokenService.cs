using Data.Database.Entities.User;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Shared.Enums.Authentication;
using Shared.Interfaces.Authentication;
using Shared.Models.Authentication;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Logic.Services.Authentication
{
    public class JwtTokenService: IJwtTokenService
    {
        private readonly JwtOptions _jwtOptions;
        
        public JwtTokenService(IOptions<JwtOptions> jwtOptions)
        {
            _jwtOptions = jwtOptions.Value;
        }
        

        public string CreateAccessToken(UserEntity user, DateTime nowUtc)
        {
            var expiresAtUtc = nowUtc.AddMinutes(_jwtOptions.AccessTokenMinutes);
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SigningKey));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Email),
                new(ClaimTypes.Email, user.Email),
            };

            claims.AddRange(GetRoleClaims(user.UserRole));

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                notBefore: nowUtc,
                expires: expiresAtUtc,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string CreateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            return Base64UrlEncoder.Encode(randomBytes);
        }

        private static IEnumerable<Claim> GetRoleClaims(UserRoleEnum roles)
        {
            return Enum.GetValues<UserRoleEnum>()
                .Where(role => role != UserRoleEnum.None && roles.HasFlag(role))
                .Select(role => new Claim(ClaimTypes.Role, role.ToString()));
        }
    }
}
