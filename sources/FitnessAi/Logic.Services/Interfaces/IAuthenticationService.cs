using Shared.Models.Authentication;

namespace Logic.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<string?> AuthenticateUser(UserAuthenticationModel model);
    }
}
