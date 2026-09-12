using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    public interface ICsvModelCreator<TModel>
    {
        byte[] Create(AiModelTypeEnum aiType, IReadOnlyCollection<TModel> models);
    }
}
