namespace Shared.Interfaces.Http
{
    public interface IInternalHttpClient
    {
        Task<HttpResponseMessage> PostAsync(
            string requestUri, 
            Dictionary<string, object>? parameters = null, 
            HttpContent? content = null, 
            CancellationToken cancellationToken = default);
    }
}
