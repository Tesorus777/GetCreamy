using IceCreamWeb;
using Microsoft.AspNetCore.Http.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration.SetBasePath(AppContext.BaseDirectory);
builder.Configuration.AddJsonFile("appsettings.json");
builder.Configuration.AddJsonFile($"DataAccessOptions.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile($"DataAccessOptions.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile($"Secrets/credentials.json");

var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    //builder.WebHost.UseUrls(""); // For running locally in IIS, use PC IP:port
    app.UseHttpsRedirection();
}

startup.Configure(app, builder.Environment);

app.Use(async (context, next) =>
{
    var config = context.RequestServices.GetRequiredService<IConfiguration>();
    var apiBaseUrl = config["ApiBaseUrl"];


    // Add to response headers (optional)
    context.Response.Headers["X-Api-Base-Url"] = apiBaseUrl;

    await next();
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}"
);

app.Run();
