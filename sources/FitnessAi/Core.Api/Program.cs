using Core.Api.Bundels;
using Org.BouncyCastle.Security;


var builder = WebApplication.CreateBuilder(args);

AppServiceRegistration.AddAppServices(builder.Services, builder);
builder.ConfigurePolicies();

var app = builder.Build();
app.UseAppCors();

AppConfiguration.ConfigureAppServices(app);

await DbMigrator.Migrate(app.Services);

app.Run();
