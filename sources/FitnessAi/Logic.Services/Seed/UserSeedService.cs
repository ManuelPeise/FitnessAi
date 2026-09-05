using Data.Accessor.Interfaces;
using Data.Database.Entities.User;
using Logic.Services.Interfaces;
using Logic.Shared;
using Shared.Enums.Authentication;


namespace Logic.Services.Seed
{
    public class UserSeedService : IUserSeedService
    {
        private readonly IApplicationUnitOfWork _applicationUnitOfWork;

        public UserSeedService(IApplicationUnitOfWork applicationUnitOfWork)
        {
            _applicationUnitOfWork = applicationUnitOfWork;
        }

        public async Task<bool> SeedUser(UserSeedModel userSeedModel)
        {
            try
            {
                var userEntity = new UserEntity
                {
                    FirstName = userSeedModel.FirstName,
                    LastName = userSeedModel.LastName,
                    Email = userSeedModel.Email,
                    AppId = Guid.NewGuid().ToString(),
                    UserRole = UserRoleEnum.UserRole,
                    UserCredentials = new UserCredentialsEntity
                    {
                        Salt = "",
                        PasswordHash = EncryptionHelper.HashPassword(userSeedModel.Password)
                    },
                };

                await _applicationUnitOfWork.UserRepository.AddAsync(userEntity);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> SeedAdminUser(UserSeedModel userSeedModel)
        {
            try
            {
                var userEntity = new UserEntity
                {
                    FirstName = userSeedModel.FirstName,
                    LastName = userSeedModel.LastName,
                    Email = userSeedModel.Email,
                    UserRole = UserRoleEnum.AdminRole,
                    AppId = Guid.NewGuid().ToString(),
                    UserCredentials = new UserCredentialsEntity
                    {
                        Salt = "",
                        PasswordHash = EncryptionHelper.HashPassword(userSeedModel.Password)
                    },
                };

                await _applicationUnitOfWork.UserRepository.AddAsync(userEntity);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                return result > 0;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }

    public sealed class UserSeedModel
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
