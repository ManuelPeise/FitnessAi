namespace Core.Api.Bundels
{
    public static class AppConfiguration
    {
        public static void ConfigureAppServices(this WebApplication app)
        {

            app.MapOpenApi();
            app.UseSwagger();
            app.UseSwaggerUI();


            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
        }
    }
}
