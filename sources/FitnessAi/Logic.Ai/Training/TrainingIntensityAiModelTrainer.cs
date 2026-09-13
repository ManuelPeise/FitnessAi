using Logic.Ai.Interfaces;
using Logic.Ai.Models;
using Microsoft.ML;
using Microsoft.ML.Data;
using Shared.Enums.Ai;
using Shared.Models.Ai.InputModels;
using System.Globalization;

namespace Logic.Ai.Training
{
    public class TrainingIntensityAiModelTrainer : IAiModelTrainer
    {
        private const int MinTrainingSetSize = 20;
        private const int NumberOfFolds = 5;

        private readonly ICsvModelLoader<WorkOutIntensityCsvModel> _csvModelLoader;

        public AiModelTypeEnum AiType => AiModelTypeEnum.WorkoutIntensity;

        public TrainingIntensityAiModelTrainer(ICsvModelLoader<WorkOutIntensityCsvModel> csvModelLoader)
        {
            _csvModelLoader = csvModelLoader;
        }

        public AiModelTrainingResult? Train(byte[] csvData)
        {
            var rows = _csvModelLoader.Load(AiModelTypeEnum.WorkoutIntensity, csvData);
            var trainingRows = MapToTrainingRows(rows);

            if (trainingRows.Count < MinTrainingSetSize)
            {
                return null;
            }

            var mlContext = new MLContext();
            var data = mlContext.Data.LoadFromEnumerable(trainingRows.Select(ToTrainingRow));
            var pipeline = BuildPipeline(mlContext);

            var (microAccuracy, macroAccuracy, logLoss) = Evaluate(mlContext, data, pipeline);
            var model = pipeline.Fit(data);
            var modelData = SerializeModel(mlContext, model, data.Schema);

            return new AiModelTrainingResult
            {
                ModelData = modelData,
                MicroAccuracy = microAccuracy,
                MacroAccuracy = macroAccuracy,
                LogLoss = logLoss,
            };
        }

        private static (double MicroAccuracy, double MacroAccuracy, double LogLoss) Evaluate(
            MLContext mlContext, IDataView data, IEstimator<ITransformer> pipeline)
        {
            var cvResults = mlContext.MulticlassClassification.CrossValidate(data, pipeline, numberOfFolds: NumberOfFolds);

            return (
                cvResults.Average(result => result.Metrics.MicroAccuracy),
                cvResults.Average(result => result.Metrics.MacroAccuracy),
                cvResults.Average(result => result.Metrics.LogLoss));
        }

        private static IEstimator<ITransformer> BuildPipeline(MLContext mlContext)
        {
            var featureColumns = new[]
            {
                nameof(WorkoutIntensityModelRow.Elevation),
                nameof(WorkoutIntensityModelRow.PaceSeconds),
                nameof(WorkoutIntensityModelRow.AverageHeartRate),
                nameof(WorkoutIntensityModelRow.MinHeartRate),
                nameof(WorkoutIntensityModelRow.MaxHeartRate),
                nameof(WorkoutIntensityModelRow.Power),
            };

            // The label column must stay a Key type all the way through (CrossValidate/Evaluate
            // require it) - only the trainer's PredictedLabel output is mapped back to a string.
            return mlContext.Transforms.Conversion.MapValueToKey(nameof(WorkoutIntensityModelRow.Label))
                .Append(mlContext.Transforms.Concatenate("Features", featureColumns))
                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy())
                .Append(mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"));
        }

        private static byte[] SerializeModel(MLContext mlContext, ITransformer model, DataViewSchema schema)
        {
            using var stream = new MemoryStream();
            mlContext.Model.Save(model, schema, stream);
            return stream.ToArray();
        }

        private static List<WorkoutIntensityMlInputModel> MapToTrainingRows(IEnumerable<WorkOutIntensityCsvModel> rows)
        {
            var trainingRows = new List<WorkoutIntensityMlInputModel>();

            foreach (var row in rows)
            {
                var trainingRow = TryMapRow(row);

                if (trainingRow != null)
                {
                    trainingRows.Add(trainingRow);
                }
            }

            return trainingRows;
        }

        // UserId and the nullable feature fields on WorkoutIntensityMlInputModel serve broader
        // (e.g. prediction-request) use cases - training only ever sees rows where all six
        // dependent fields already parsed successfully, so they're safe to unwrap here.
        private static WorkoutIntensityModelRow ToTrainingRow(WorkoutIntensityMlInputModel row)
        {
            return new WorkoutIntensityModelRow
            {
                Elevation = row.Elevation!.Value,
                PaceSeconds = row.PaceSeconds,
                AverageHeartRate = row.AverageHeartRate,
                MinHeartRate = row.MinHeartRate!.Value,
                MaxHeartRate = row.MaxHeartRate,
                Power = row.Power!.Value,
                Label = row.Label,
            };
        }

        private static WorkoutIntensityMlInputModel? TryMapRow(WorkOutIntensityCsvModel row)
        {
            if (!TryParseLabel(row.Label, out _) ||
                !TryParseDecimal(row.Elevation, out var elevation) ||
                !TryParsePaceSeconds(row.Pace, out var paceSeconds) ||
                !TryParseDecimal(row.AverageHeartRate, out var averageHeartRate) ||
                !TryParseDecimal(row.MinHeartRate, out var minHeartRate) ||
                !TryParseDecimal(row.MaxHeartRate, out var maxHeartRate) ||
                !TryParseDecimal(row.Power, out var power))
            {
                return null;
            }

            return new WorkoutIntensityMlInputModel
            {
                Elevation = elevation,
                PaceSeconds = paceSeconds,
                AverageHeartRate = averageHeartRate,
                MinHeartRate = minHeartRate,
                MaxHeartRate = maxHeartRate,
                Power = power,
                Label = row.Label!,
            };
        }

        private static bool TryParseLabel(string? label, out WorkoutIntensityEnum value)
        {
            return Enum.TryParse(label, ignoreCase: true, out value) && value != WorkoutIntensityEnum.Unknown;
        }

        private static bool TryParseDecimal(string? value, out float result)
        {
            return float.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out result);
        }

        // Pace is stored as "MM:SS" (see WorkoutIntensityCsvRowMapper.GetPaceString) - convert back to seconds-per-km.
        private static bool TryParsePaceSeconds(string? pace, out float seconds)
        {
            seconds = 0;

            if (string.IsNullOrEmpty(pace))
            {
                return false;
            }

            var parts = pace.Split(':');

            if (parts.Length != 2 ||
                !int.TryParse(parts[0], out var minutes) ||
                !int.TryParse(parts[1], out var remainingSeconds))
            {
                return false;
            }

            seconds = minutes * 60 + remainingSeconds;
            return true;
        }
    }
}
