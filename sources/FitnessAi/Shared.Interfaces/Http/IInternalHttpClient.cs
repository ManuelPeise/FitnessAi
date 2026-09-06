namespace Shared.Interfaces.Http
{
    public interface IInternalHttpClient
    {
        Task<HttpResponseMessage> PostAsync(Uri requestUri, HttpContent? content = null, CancellationToken cancellationToken = default);
    }
}
