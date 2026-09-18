using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Data.Database.Entities.User;
using Logic.Services.Authentication;
using Microsoft.Extensions.Options;
using Shared.Enums.Authentication;
using Shared.Models.Authentication;

namespace AiUnitTests.Services
{
    public class JwtTokenServiceTests
    {
        [Fact]
        public void CreateAccessToken_EmitsOneRoleClaimPerFlag()
        {
            var service = CreateService();
            var user = CreateUser(UserRoleEnum.UserRole | UserRoleEnum.AdminRole);

            var token = service.CreateAccessToken(user, DateTime.UtcNow);

            var roleClaims = ReadRoleClaims(token);
            Assert.Equal(2, roleClaims.Count);
            Assert.Contains(nameof(UserRoleEnum.UserRole), roleClaims);
            Assert.Contains(nameof(UserRoleEnum.AdminRole), roleClaims);
        }

        [Fact]
        public void CreateAccessToken_EmitsNoRoleClaimForNone()
        {
            var service = CreateService();
            var user = CreateUser(UserRoleEnum.None);

            var token = service.CreateAccessToken(user, DateTime.UtcNow);

            Assert.Empty(ReadRoleClaims(token));
        }

        private static List<string> ReadRoleClaims(string token)
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            return jwt.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
        }

        private static JwtTokenService CreateService()
        {
            var options = Options.Create(new JwtOptions
            {
                Issuer = "test-issuer",
                Audience = "test-audience",
                SigningKey = "this-is-a-test-signing-key-that-is-long-enough",
                AccessTokenMinutes = 30,
                RefreshTokenDays = 7,
            });

            return new JwtTokenService(options);
        }

        private static UserEntity CreateUser(UserRoleEnum role)
        {
            return new UserEntity
            {
                Id = 1,
                FirstName = "Jane",
                LastName = "Doe",
                Email = "jane.doe@example.com",
                AppId = Guid.NewGuid().ToString(),
                UserRole = role,
            };
        }
    }
}
