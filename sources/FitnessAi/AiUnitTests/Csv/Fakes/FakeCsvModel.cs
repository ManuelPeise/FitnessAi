namespace AiUnitTests.Csv.Fakes
{
    // Test-only model, never a production model. Records get value-based Equals/GetHashCode for
    // free, which is what HashSet<T> dedup relies on.
    internal record FakeCsvModel(string Prompt, string Completion);
}
