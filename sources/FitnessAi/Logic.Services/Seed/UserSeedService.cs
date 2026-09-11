using Data.Accessor.Interfaces;
using Data.Accessor.Models;
using Data.Database.Entities.Settings;
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
                var existingUser = await _applicationUnitOfWork.UserRepository.GetSingleAsync(
                    new DbQueryOptions<UserEntity> { WhereExpression = u => u.Email == userSeedModel.Email });

                if (existingUser != null)
                {
                    return false;
                }

                var userEntity = new UserEntity
                {
                    FirstName = userSeedModel.FirstName,
                    LastName = userSeedModel.LastName,
                    Email = userSeedModel.Email,
                    AppId = Guid.NewGuid().ToString(),
                    UserRole = UserRoleEnum.UserRole,
                    UserCredentials = new UserCredentialsEntity
                    {
                        PasswordHash = EncryptionHelper.HashPassword(userSeedModel.Password)
                    },
                    Settings = new SettingsEntity
                    {
                        AiSettings = new AISettingsEntity
                        {
                            CanUseHealthDataForAiTraining = false,
                            CanUseHealthDataAcceptedAt = null,
                            CanUseHealthDataRejectedAt = null,
                        }
                    },
                };

                await _applicationUnitOfWork.UserRepository.AddAsync(userEntity);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                if( result > 0)
                {
                    await CreateRelatedEntities(userEntity.Id);
                    return true;
                }

                return false;  
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
                var existingUser = await _applicationUnitOfWork.UserRepository.GetSingleAsync(
                   new DbQueryOptions<UserEntity> { WhereExpression = u => u.Email == userSeedModel.Email });

                if (existingUser != null)
                {
                    return false;
                }

                var userEntity = new UserEntity
                {
                    FirstName = userSeedModel.FirstName,
                    LastName = userSeedModel.LastName,
                    Email = userSeedModel.Email,
                    UserRole = UserRoleEnum.AdminRole,
                    AppId = Guid.NewGuid().ToString(),
                    UserCredentials = new UserCredentialsEntity
                    {
                        PasswordHash = EncryptionHelper.HashPassword(userSeedModel.Password)
                    },
                    Settings = new SettingsEntity
                    {
                        AiSettings = new AISettingsEntity
                        {
                            CanUseHealthDataForAiTraining = false,
                            CanUseHealthDataAcceptedAt = null,
                            CanUseHealthDataRejectedAt = null,
                        }
                    }
                };

                await _applicationUnitOfWork.UserRepository.AddAsync(userEntity);

                var result = await _applicationUnitOfWork.SaveChangesAsync();

                if( result > 0)
                {
                    await CreateRelatedEntities(userEntity.Id);
                    return true;
                }

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private async Task CreateRelatedEntities(long userId)
        {
            var userBodyDataEntity = new UserBodyDataEntity
            {
                UserId = userId
            };
            await _applicationUnitOfWork.UserBodyDataRepository.AddAsync(userBodyDataEntity);

            await _applicationUnitOfWork.SaveChangesAsync();
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
