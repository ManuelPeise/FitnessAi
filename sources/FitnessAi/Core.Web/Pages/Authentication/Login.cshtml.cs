using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Shared.Interfaces.Http;
using Shared.Models.Authentication;

namespace Core.Web.Pages.Authentication
{
    public class Login : PageModel
    {
        private readonly IHttpClientService _httpClientService;


        [BindProperty]
        public string Email { get; set; } = string.Empty;

        [BindProperty]
        public string Password { get; set; } = string.Empty;

        public Login(IHttpClientService httpClientService)
        {
            _httpClientService = httpClientService;
        }
        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Page();
                }

                var model = new UserAuthenticationModel
                {
                    Email = Email,
                    Password = Password
                };

                var response = await _httpClientService.SendPostRequest<AuthenticationResponseModel, UserAuthenticationModel>(
                    "UserAuthentication/AuthenticateUser", model, null, null, null);

                if (response.Success)
                {
                    return RedirectToPage("/Dashboard");
                }

                throw new Exception("Authentication failed. Please check your credentials and try again.");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, $"An error occurred: {ex.Message}");

                return Page();
            }
        }
    }
}
