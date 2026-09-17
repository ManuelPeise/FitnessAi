using AiUnitTests.Fakes;
using Data.Database.Entities.User;
using Logic.Services.UserProfile;
using Logic.Shared;
using Shared.Models.Authentication;

namespace AiUnitTests.Services
{
    public class UserProfileServiceTests
    {
        private const long UserId = 1;

        [Fact]
        public async Task GetProfileAsync_MapsUserAndBodyDataIncludingBmi()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            unitOfWork.User.Items.Add(CreateUser());
            unitOfWork.UserBodyData.Items.Add(CreateBodyData(height: 180, weight: 81));

            var service = CreateService(unitOfWork);

            var profile = await service.GetProfileAsync();

            Assert.Equal(UserId, profile.Id);
            Assert.Equal("Jane", profile.FirstName);
            Assert.Equal("Doe", profile.LastName);
            Assert.Equal("jane.doe@example.com", profile.Email);
            Assert.Equal(180, profile.Height);
            Assert.Equal(81, profile.Weight);
            Assert.True(profile.Bmi > 0);
        }

        [Fact]
        public async Task UpdateProfileAsync_PersistsIdentityAndBodyDataChanges()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var user = CreateUser();
            var bodyData = CreateBodyData(height: 180, weight: 81);
            unitOfWork.User.Items.Add(user);
            unitOfWork.UserBodyData.Items.Add(bodyData);

            var service = CreateService(unitOfWork);

            await service.UpdateProfileAsync(new UpdateUserProfileRequest
            {
                FirstName = "Janet",
                LastName = "Doey",
                Height = 182,
                Weight = 79,
                BodyFatPercentageAvg = 18,
                Waist = 80,
                Abdomen = 82,
                ShoulderWidth = 45,
            });

            Assert.Equal("Janet", user.FirstName);
            Assert.Equal("Doey", user.LastName);
            Assert.Equal(182, bodyData.Height);
            Assert.Equal(79, bodyData.Weight);
            Assert.Equal(18, bodyData.BodyFatPercentageAvg);
            Assert.Equal(80, bodyData.Waist);
            Assert.Equal(82, bodyData.Abdomen);
            Assert.Equal(45, bodyData.ShoulderWidth);
            Assert.Equal(1, unitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task ChangePasswordAsync_UpdatesHashWhenCurrentPasswordIsCorrect()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var user = CreateUser();
            unitOfWork.User.Items.Add(user);

            var service = CreateService(unitOfWork);

            await service.ChangePasswordAsync(new ChangePasswordRequest
            {
                CurrentPassword = "correct-password",
                NewPassword = "new-password",
            });

            Assert.True(EncryptionHelper.VerifyPassword("new-password", user.UserCredentials.PasswordHash));
            Assert.Equal(1, unitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task ChangePasswordAsync_ThrowsWhenCurrentPasswordIsIncorrect()
        {
            var unitOfWork = new FakeApplicationUnitOfWork();
            var user = CreateUser();
            unitOfWork.User.Items.Add(user);

            var service = CreateService(unitOfWork);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.ChangePasswordAsync(new ChangePasswordRequest
            {
                CurrentPassword = "wrong-password",
                NewPassword = "new-password",
            }));
        }

        private static UserProfileService CreateService(FakeApplicationUnitOfWork unitOfWork)
        {
            return new UserProfileService(unitOfWork, new FakeCurrentUserService { UserId = UserId });
        }

        private static UserEntity CreateUser()
        {
            return new UserEntity
            {
                Id = UserId,
                FirstName = "Jane",
                LastName = "Doe",
                Email = "jane.doe@example.com",
                AppId = Guid.NewGuid().ToString(),
                UserCredentials = new UserCredentialsEntity
                {
                    PasswordHash = EncryptionHelper.HashPassword("correct-password"),
                },
            };
        }

        private static UserBodyDataEntity CreateBodyData(decimal height, decimal weight)
        {
            return new UserBodyDataEntity
            {
                Id = UserId,
                UserId = UserId,
                Height = height,
                Weight = weight,
            };
        }
    }
}
