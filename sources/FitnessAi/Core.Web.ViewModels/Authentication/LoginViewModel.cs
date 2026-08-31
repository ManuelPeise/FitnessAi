using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Core.Web.ViewModels.Authentication
{
    public partial class LoginViewModel: ViewModelBase
    {
        [ObservableProperty]
        private string _email;

        [ObservableProperty]
        private string _password;

        public LoginViewModel()
        {
            var test = 100;
        }

        public override void Initialize()
        {
            Email = string.Empty;
            Password = string.Empty;
        }

        [RelayCommand]
        public async Task LoginAsync()
        {
            var test = 100;

            await Task.CompletedTask;
        }
    }
}
