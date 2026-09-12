using Logic.Ai.Interfaces;
using Shared.Enums.Ai;

namespace Logic.Ai.Csv
{
    public class ColumnDefinitionFactory : IColumnDefinitionFactory
    {
        // Each ColumnDefinition maps a CSV column name to its column index and is the single
        // source of truth for both header validation and column order. Register additional
        // AiModelTypeEnum -> ColumnDefinition mappings here as new CSV-backed AiTypes are added.
        private static readonly Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>> ColumnDefinitions = new Dictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>>
        {
            { AiModelTypeEnum.WorkoutIntensity, AiTrainingColumnDefinitions.IntensityAiColumnDefinition },
        };

        private readonly IReadOnlyDictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>> _definitions;

        public ColumnDefinitionFactory()
        {
            _definitions = ColumnDefinitions;
        }

        // Test-only seam so unit tests can verify factory behavior without registering
        // fabricated production column definitions.
        internal ColumnDefinitionFactory(IReadOnlyDictionary<AiModelTypeEnum, IReadOnlyDictionary<string, int>> definitions)
        {
            _definitions = definitions;
        }

        public IReadOnlyDictionary<string, int> GetColumnDefinition(AiModelTypeEnum aiType)
        {
            if (!_definitions.TryGetValue(aiType, out var columnDefinition))
            {
                throw new InvalidOperationException($"No CSV column definition registered for AiType '{aiType}'.");
            }

            return columnDefinition;
        }
    }
}
