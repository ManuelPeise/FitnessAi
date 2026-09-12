using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    public interface IColumnDefinitionFactory
    {
        IReadOnlyDictionary<string, int> GetColumnDefinition(AiModelTypeEnum aiType);
    }
}
