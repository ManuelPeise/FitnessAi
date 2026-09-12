namespace Logic.Ai.Interfaces
{
    // Extension point for model-specific CSV mapping. Implementations are added per concrete
    // TModel by the developer - the generic CSV infrastructure never assumes columnKey ==
    // PropertyName and never uses reflection.
    public interface ICsvRowMapper<TModel>
    {
        TModel MapFromRow(IReadOnlyDictionary<string, string> rowValues);
        IReadOnlyDictionary<string, string> MapToRow(TModel model);
    }
}
