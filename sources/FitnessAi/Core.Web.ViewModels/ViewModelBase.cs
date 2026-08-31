using CommunityToolkit.Mvvm.ComponentModel;

namespace Core.Web.ViewModels
{
    public partial class ViewModelBase: ObservableObject
    {
        [ObservableProperty]
        private bool _isLoading;

        public virtual Task InitializeAsync()
        {
            return Task.CompletedTask;
        }

        public virtual void Initialize()
        {
           
        }
    }
}
