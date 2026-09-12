using Shared.Enums.Ai;

namespace Logic.Ai.Interfaces
{
    public interface ICsvModelLoader<TModel>
    {
        // Deduplication relies entirely on TModel's own Equals/GetHashCode - the loader itself
        // has no opinion on equality. Merging into an existing set of known models is a
        // call-site concern (e.g. existingSet.UnionWith(Load(...))).
        HashSet<TModel> Load(AiModelTypeEnum aiType, byte[] data);
    }
}
