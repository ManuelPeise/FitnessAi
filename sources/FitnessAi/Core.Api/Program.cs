using Core.Api.Bundels;

var builder = WebApplication.CreateBuilder(args);

AppServiceRegistration.AddAppServices(builder.Services, builder);

var app = builder.Build();

AppConfiguration.ConfigureAppServices(app);

app.Run();
