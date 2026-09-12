using AiUnitTests.Fakes;
using Data.Database.Entities.Ai;
using Logic.Ai.Csv;
using Shared.Enums.Ai;

namespace AiUnitTests.Csv
{
    public class AiTrainingDataFileServiceTests
    {
        [Fact]
        public async Task GetCsvAsync_ReturnsNull_WhenNoFileExistsForAiType()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var service = new AiTrainingDataFileService(aiUnitOfWork);

            var result = await service.GetCsvAsync(AiModelTypeEnum.Global);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetCsvAsync_ReturnsStoredCsv_WhenFileExists()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var csv = new byte[] { 1, 2, 3 };
            aiUnitOfWork.TrainingDataFile.Items.Add(new AiTrainingDataFileEntity { AiType = AiModelTypeEnum.Global, Csv = csv });
            var service = new AiTrainingDataFileService(aiUnitOfWork);

            var result = await service.GetCsvAsync(AiModelTypeEnum.Global);

            Assert.Equal(csv, result);
        }

        [Fact]
        public async Task UploadCsvAsync_CreatesNewFile_WhenNoneExistsForAiType()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var csv = new byte[] { 1, 2, 3 };
            var service = new AiTrainingDataFileService(aiUnitOfWork);

            await service.UploadCsvAsync(AiModelTypeEnum.Global, csv);

            var added = Assert.Single(aiUnitOfWork.TrainingDataFile.AddedItems);
            Assert.Equal(AiModelTypeEnum.Global, added.AiType);
            Assert.Equal(csv, added.Csv);
            Assert.True(added.IsUpdated);
            Assert.Equal(1, aiUnitOfWork.SaveChangesCallCount);
        }

        [Fact]
        public async Task UploadCsvAsync_UpdatesExistingFile_WhenOneExistsForAiType()
        {
            var aiUnitOfWork = new FakeAiUnitOfWork();
            var existing = new AiTrainingDataFileEntity { AiType = AiModelTypeEnum.Global, Csv = [0], IsUpdated = false };
            aiUnitOfWork.TrainingDataFile.Items.Add(existing);
            var newCsv = new byte[] { 1, 2, 3 };
            var service = new AiTrainingDataFileService(aiUnitOfWork);

            await service.UploadCsvAsync(AiModelTypeEnum.Global, newCsv);

            var updated = Assert.Single(aiUnitOfWork.TrainingDataFile.UpdatedItems);
            Assert.Equal(newCsv, updated.Csv);
            Assert.True(updated.IsUpdated);
            Assert.Empty(aiUnitOfWork.TrainingDataFile.AddedItems);
            Assert.Equal(1, aiUnitOfWork.SaveChangesCallCount);
        }
    }
}
