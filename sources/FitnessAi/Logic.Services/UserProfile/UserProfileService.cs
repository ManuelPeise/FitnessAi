using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.User;
using Logic.Services.Interfaces;
using Logic.Shared;
using Logic.Shared.Interfaces;
using Shared.Models.Authentication;

namespace Logic.Services.UserProfile
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public UserProfileService(IApplicationUnitOfWork applicationUnitOfWork, ICurrentUserService currentUserService)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<UserProfileModel> GetProfileAsync(CancellationToken cancellationToken = default)
        {
            var userId = _currentUserService.UserId;

            var user = await GetUserAsync(userId, asNoTracking: true, cancellationToken);
            var bodyData = await GetBodyDataAsync(userId, asNoTracking: true, cancellationToken);

            return new UserProfileModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Height = bodyData.Height,
                Weight = bodyData.Weight,
                BodyFatPercentageAvg = bodyData.BodyFatPercentageAvg,
                Waist = bodyData.Waist,
                Abdomen = bodyData.Abdomen,
                ShoulderWidth = bodyData.ShoulderWidth,
                Bmi = bodyData.Bmi,
            };
        }

        public async Task UpdateProfileAsync(UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _currentUserService.UserId;

            var user = await GetUserAsync(userId, asNoTracking: false, cancellationToken);
            var bodyData = await GetBodyDataAsync(userId, asNoTracking: false, cancellationToken);

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;

            bodyData.Height = request.Height;
            bodyData.Weight = request.Weight;
            bodyData.BodyFatPercentageAvg = request.BodyFatPercentageAvg;
            bodyData.Waist = request.Waist;
            bodyData.Abdomen = request.Abdomen;
            bodyData.ShoulderWidth = request.ShoulderWidth;

            await _applicationUnitOfWork.UserRepository.UpdateAsync(user, cancellationToken);
            await _applicationUnitOfWork.UserBodyDataRepository.UpdateAsync(bodyData, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default)
        {
            var userId = _currentUserService.UserId;

            var user = await _applicationUnitOfWork.UserRepository.GetByIdAsync(
                userId,
                includeExpressions: [x => x.UserCredentials],
                cancellationToken: cancellationToken);

            if (user == null)
            {
                throw new KeyNotFoundException($"User {userId} was not found.");
            }

            if (!EncryptionHelper.VerifyPassword(request.CurrentPassword, user.UserCredentials.PasswordHash))
            {
                throw new UnauthorizedAccessException("The current password is incorrect.");
            }

            user.UserCredentials.PasswordHash = EncryptionHelper.HashPassword(request.NewPassword);

            await _applicationUnitOfWork.UserCredentialsRepository.UpdateAsync(user.UserCredentials, cancellationToken);
            await _applicationUnitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<UserEntity> GetUserAsync(long userId, bool asNoTracking, CancellationToken cancellationToken)
        {
            var user = await _applicationUnitOfWork.UserRepository.GetByIdAsync(userId, asNoTracking, cancellationToken: cancellationToken);

            if (user == null)
            {
                throw new KeyNotFoundException($"User {userId} was not found.");
            }

            return user;
        }

        private async Task<UserBodyDataEntity> GetBodyDataAsync(long userId, bool asNoTracking, CancellationToken cancellationToken)
        {
            var bodyData = await _applicationUnitOfWork.UserBodyDataRepository.GetSingleAsync(new DbQueryOptions<UserBodyDataEntity>
            {
                WhereExpression = x => x.UserId == userId,
            }, asNoTracking, cancellationToken);

            if (bodyData == null)
            {
                throw new KeyNotFoundException($"Body data for user {userId} was not found.");
            }

            return bodyData;
        }
    }
}
