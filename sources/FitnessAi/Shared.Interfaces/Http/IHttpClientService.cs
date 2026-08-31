namespace Shared.Interfaces.Http
{
    public interface IHttpClientService
    {
        Task<TResponseModel> SendPostRequest<TResponseModel, TRequestModel>(
            string url,
            TRequestModel model,
            Dictionary<string, object>? urlParameters,
            Dictionary<string, string>? headers,
            Dictionary<string, string>? authenticationHeaders)
            where TRequestModel : class
            where TResponseModel : class;
    }
}
