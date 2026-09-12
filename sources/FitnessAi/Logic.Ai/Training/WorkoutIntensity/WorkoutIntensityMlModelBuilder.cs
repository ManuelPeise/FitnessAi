using Logic.Ai.Interfaces;
using Logic.Ai.Training.WorkoutIntensity.Models;
using Microsoft.ML;

namespace Logic.Ai.Training.WorkoutIntensity
{
    // Builds and trains the actual ML.NET pipeline. An ML.NET "pipeline" is just a chain of
    // transforms (Append(...)) run in order over an in-memory table (IDataView): each step reads
    // some column(s) and writes a new column, and the final step is the trainer itself.
    public class WorkoutIntensityMlModelBuilder : IWorkoutIntensityMlModelBuilder
    {
        public ITransformer Train(MLContext mlContext, IReadOnlyList<WorkoutIntensityMlInput> trainingData, out DataViewSchema schema)
        {
            // LoadFromEnumerable turns our plain C# list into ML.NET's columnar IDataView -
            // the format every transform below reads from and writes to.
            var dataView = mlContext.Data.LoadFromEnumerable(trainingData);
            schema = dataView.Schema;

            var pipeline = mlContext.Transforms.Conversion.MapValueToKey("Label", nameof(WorkoutIntensityMlInput.Label))
                // ML.NET's trainers work with numeric "key" values internally, not strings, so
                // MapValueToKey turns "Easy"/"Medium"/"Hard" into keys; MapKeyToValue (below,
                // after training) turns the predicted key back into a readable string again.

                .Append(mlContext.Transforms.Categorical.OneHotEncoding("ExerciseTypeEncoded", nameof(WorkoutIntensityMlInput.ExerciseType)))
                .Append(mlContext.Transforms.Categorical.OneHotEncoding("UserIdEncoded", nameof(WorkoutIntensityMlInput.UserId)))
                // ExerciseType/UserId are categories, not numbers - "Running" isn't twice
                // "Walking". One-hot encoding turns each distinct value into its own 0/1 column
                // so the trainer can use them without inventing a false numeric ordering.

                .Append(mlContext.Transforms.Concatenate("Features",
                    nameof(WorkoutIntensityMlInput.Elevation),
                    nameof(WorkoutIntensityMlInput.Pace),
                    nameof(WorkoutIntensityMlInput.AverageHeartRate),
                    "ExerciseTypeEncoded",
                    "UserIdEncoded"))
                // Trainers expect one single "Features" vector column, not several separate
                // columns - Concatenate merges the raw numeric features and the one-hot-encoded
                // columns into that single vector.

                .Append(mlContext.Transforms.NormalizeMinMax("Features"))
                // Elevation/Pace/HeartRate live on very different numeric scales (e.g. 0-3000m
                // vs. 60-200bpm). Without normalizing to a common [0,1] range, the trainer would
                // implicitly weigh whichever feature happens to have the largest raw numbers.

                .Append(mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy(labelColumnName: "Label", featureColumnName: "Features"))
                // The actual learning step: SdcaMaximumEntropy is ML.NET's standard multiclass
                // trainer (logistic regression generalized to more than 2 classes) - it learns
                // weights per feature/class from "Features" that best predict "Label".

                .Append(mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"));
                // Converts the trainer's numeric key prediction back into "Easy"/"Medium"/"Hard"
                // text (WorkoutIntensityMlPrediction.PredictedLabel) so callers never see keys.

            // Fit() is what actually runs every transform above over the training data and
            // produces the trained model (an ITransformer) - everything before this line was
            // just describing the pipeline, not executing it.
            return pipeline.Fit(dataView);
        }
    }
}
