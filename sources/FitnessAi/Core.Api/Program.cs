using Core.Api.Bundels;


var builder = WebApplication.CreateBuilder(args);

AppServiceRegistration.AddAppServices(builder.Services, builder);
builder.ConfigurePolicies();

var app = builder.Build();
app.UseAppCors();

AppConfiguration.ConfigureAppServices(app);

await DbMigrator.Migrate(app.Services);
await DefaultAdminUserSeeder.SeedAsync(app.Services);

app.Run();
