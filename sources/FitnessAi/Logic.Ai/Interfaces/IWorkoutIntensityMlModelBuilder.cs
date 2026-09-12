using Logic.Ai.Training.WorkoutIntensity.Models;
using Microsoft.ML;

namespace Logic.Ai.Interfaces
{
    public interface IWorkoutIntensityMlModelBuilder
    {
        ITransformer Train(MLContext mlContext, IReadOnlyList<WorkoutIntensityMlInput> trainingData, out DataViewSchema schema);
    }
}
