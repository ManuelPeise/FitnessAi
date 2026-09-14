using Shared.Models.Authentication;

namespace Logic.Services.Interfaces
{
    public interface IUserRegistrationService
    {
        Task<TokenResponse?> RegisterUser(UserRegistrationModel model);
    }
}
