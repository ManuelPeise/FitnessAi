using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Logic.Ai.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Shared.Enums.Ai;
using Shared.Models.Ai;

namespace AiUnitTests.Services
{
    public class AiModelTrainingServiceTests
    {
        [Fact]
        public async Task TrainAsync_DoesNotSave_WhenNoTrainingDataFileExists()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: null);
            var trainer = new FakeAiModelTrainer(result: BuildResult(0.9));
            var versionStorage = new FakeAiModelVersionStorageService();
            var service = CreateService(csvService, trainer, versionStorage);

            await service.TrainAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.False(trainer.WasCalled);
            Assert.False(versionStorage.SaveWasCalled);
        }

        [Fact]
        public async Task TrainAsync_DoesNotSave_WhenTrainerReturnsNull()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: [1, 2, 3]);
            var trainer = new FakeAiModelTrainer(result: null);
            var versionStorage = new FakeAiModelVersionStorageService();
            var service = CreateService(csvService, trainer, versionStorage);

            await service.TrainAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.False(versionStorage.SaveWasCalled);
        }

        [Fact]
        public async Task TrainAsync_Saves_WhenNoExistingVersionExists()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: [1, 2, 3]);
            var trainer = new FakeAiModelTrainer(result: BuildResult(0.7));
            var versionStorage = new FakeAiModelVersionStorageService { LatestMetrics = null };
            var service = CreateService(csvService, trainer, versionStorage);

            await service.TrainAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.True(versionStorage.SaveWasCalled);
        }

        [Fact]
        public async Task TrainAsync_Saves_WhenNewModelHasHigherMacroAccuracy()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: [1, 2, 3]);
            var trainer = new FakeAiModelTrainer(result: BuildResult(0.9));
            var versionStorage = new FakeAiModelVersionStorageService
            {
                LatestMetrics = BuildMetrics("0.0.1", 0.5),
            };
            var service = CreateService(csvService, trainer, versionStorage);

            await service.TrainAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.True(versionStorage.SaveWasCalled);
        }

        [Fact]
        public async Task TrainAsync_DoesNotSave_WhenNewModelIsNotBetter()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: [1, 2, 3]);
            var trainer = new FakeAiModelTrainer(result: BuildResult(0.4));
            var versionStorage = new FakeAiModelVersionStorageService
            {
                LatestMetrics = BuildMetrics("0.0.1", 0.5),
            };
            var service = CreateService(csvService, trainer, versionStorage);

            await service.TrainAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.False(versionStorage.SaveWasCalled);
        }

        [Fact]
        public async Task EvaluateAsync_ReturnsNull_WhenNoTrainingDataFileExists()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: null);
            var trainer = new FakeAiModelTrainer(result: BuildResult(0.9));
            var versionStorage = new FakeAiModelVersionStorageService();
            var service = CreateService(csvService, trainer, versionStorage);

            var metrics = await service.EvaluateAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.Null(metrics);
            Assert.False(trainer.WasCalled);
        }

        [Fact]
        public async Task EvaluateAsync_ReturnsNull_WhenTrainerReturnsNull()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: [1, 2, 3]);
            var trainer = new FakeAiModelTrainer(result: null);
            var versionStorage = new FakeAiModelVersionStorageService();
            var service = CreateService(csvService, trainer, versionStorage);

            var metrics = await service.EvaluateAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.Null(metrics);
        }

        [Fact]
        public async Task EvaluateAsync_ReturnsMetrics_WithoutSavingANewVersion()
        {
            var csvService = new FakeAiTrainingDataFileService(csv: [1, 2, 3]);
            var trainer = new FakeAiModelTrainer(result: BuildResult(0.9));
            var versionStorage = new FakeAiModelVersionStorageService
            {
                LatestMetrics = BuildMetrics("0.0.1", 0.5),
            };
            var service = CreateService(csvService, trainer, versionStorage);

            var metrics = await service.EvaluateAsync(AiModelTypeEnum.WorkoutIntensity);

            Assert.NotNull(metrics);
            Assert.Equal(0.9, metrics.MacroAccuracy);
            Assert.False(versionStorage.SaveWasCalled);
        }

        private static AiModelTrainingService CreateService(
            FakeAiTrainingDataFileService csvService, FakeAiModelTrainer trainer, FakeAiModelVersionStorageService versionStorage)
        {
            var trainerFactory = new FakeAiModelTrainerFactory(trainer);
            return new AiModelTrainingService(csvService, trainerFactory, versionStorage, NullLogger<AiModelTrainingService>.Instance);
        }

        private static AiModelTrainingResult BuildResult(double macroAccuracy)
        {
            return new AiModelTrainingResult
            {
                ModelData = [1, 2, 3],
                MicroAccuracy = macroAccuracy,
                MacroAccuracy = macroAccuracy,
                LogLoss = 0.1,
            };
        }

        private static TrainedAiModelMetrics BuildMetrics(string version, double macroAccuracy)
        {
            return new TrainedAiModelMetrics
            {
                Version = version,
                MicroAccuracy = macroAccuracy,
                MacroAccuracy = macroAccuracy,
                LogLoss = 0.1,
                TrainedAt = DateTime.UtcNow,
            };
        }

        private sealed class FakeAiTrainingDataFileService : IAiTrainingDataFileService
        {
            private readonly byte[]? _csv;

            public FakeAiTrainingDataFileService(byte[]? csv)
            {
                _csv = csv;
            }

            public Task<byte[]?> GetCsvAsync(AiModelTypeEnum aiType, CancellationToken cancellationToken = default) =>
                Task.FromResult(_csv);

            public Task UploadCsvAsync(AiModelTypeEnum aiType, byte[] csv, CancellationToken cancellationToken = default) =>
                throw new NotImplementedException();
        }

        private sealed class FakeAiModelTrainer : IAiModelTrainer
        {
            private readonly AiModelTrainingResult? _result;

            public bool WasCalled { get; private set; }
            public AiModelTypeEnum AiType => AiModelTypeEnum.WorkoutIntensity;

            public FakeAiModelTrainer(AiModelTrainingResult? result)
            {
                _result = result;
            }

            public AiModelTrainingResult? Train(byte[] csvData)
            {
                WasCalled = true;
                return _result;
            }
        }

        private sealed class FakeAiModelTrainerFactory : IAiModelTrainerFactory
        {
            private readonly IAiModelTrainer _trainer;

            public FakeAiModelTrainerFactory(IAiModelTrainer trainer)
            {
                _trainer = trainer;
            }

            public IAiModelTrainer GetTrainer(AiModelTypeEnum aiType) => _trainer;
        }

        private sealed class FakeAiModelVersionStorageService : IAiModelVersionStorageService
        {
            public TrainedAiModelMetrics? LatestMetrics { get; set; }
            public bool SaveWasCalled { get; private set; }

            public Task<TrainedAiModelMetrics?> GetLatestModelMetricsAsync(AiModelTypeEnum aiType,  CancellationToken cancellationToken = default) =>
                Task.FromResult(LatestMetrics);

            public Task<byte[]?> GetModelDataAsync(AiModelTypeEnum aiType, string? modelVersion, CancellationToken cancellationToken = default) =>
                throw new NotImplementedException();

            public Task SaveNewModelVersionAsync(AiModelTypeEnum aiType, AiModelTrainingResult result, CancellationToken cancellationToken = default)
            {
                SaveWasCalled = true;
                return Task.CompletedTask;
            }
        }
    }
}
