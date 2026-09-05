using Shared.Models.Authentication;

namespace Logic.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserExportModel?> GetCurrentUserAsync();
    }
}
