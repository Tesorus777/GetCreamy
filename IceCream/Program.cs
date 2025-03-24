using IceCreamAPI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration.AddJsonFile("appsettings.json");
builder.Configuration.AddJsonFile($"DataAccessOptions.json", optional: false, reloadOnChange: true);
builder.Configuration.AddJsonFile($"DataAccessOptions.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);
builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);


var app = builder.Build();

// Content Security Policy (CSP)
//app.Use(async (context, next) =>
//{
//    context.Response.Headers.Append("Content-Security-Policy",
//        "default-src 'self'; script-src 'self' https://trusted.com; style-src 'self' 'unsafe-inline';");
//    await next();
//});

if (!app.Environment.IsDevelopment())
{
    //builder.WebHost.UseUrls(""); // For running locally in IIS, use PC IP:port
    app.UseHttpsRedirection();
}


startup.Configure(app, builder.Environment);
app.MapControllers();

app.Run();