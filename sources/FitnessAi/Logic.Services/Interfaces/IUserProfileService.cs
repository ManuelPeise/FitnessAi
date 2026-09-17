using Shared.Models.Authentication;

namespace Logic.Services.Interfaces
{
    public interface IUserProfileService
    {
        Task<UserProfileModel> GetProfileAsync(CancellationToken cancellationToken = default);
        Task UpdateProfileAsync(UpdateUserProfileRequest request, CancellationToken cancellationToken = default);

        // Throws UnauthorizedAccessException when CurrentPassword does not match the stored hash.
        Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default);
    }
}
