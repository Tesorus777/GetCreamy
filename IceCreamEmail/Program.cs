using HandlebarsDotNet;
using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataLibrary.DataModels.Email;
using IceCreamEmail.DataAccess;
using IceCreamEmail.OptionsClasses;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

class Program
{
    private static IEmailSender _emailSender = default!;
    private static IUserData _userData = default!;
    private static CredentialsOptions _credOpt = default!;
    private static AppSettingsOptions _appSettings = default!;

    static void Main(string[] args)
    {
        HostApplicationBuilder builder = Host.CreateApplicationBuilder(args);
        var envName = builder.Environment.EnvironmentName;
        //IConfiguration config = builder.Configuration();
        //var envName = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "PRODUCTION";

        // Add services to the container.
        builder.Configuration
            .AddJsonFile($"DataAccessOptions.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"DataAccessOptions.{envName}.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"Secrets/credentials.json");

        IServiceCollection serviceCollection = builder.Services;
        IConfiguration configuration = builder.Configuration;

        #region Services

        // figure out how to get this to work (if necessary in the future)
        //serviceCollection.AddControllers().AddJsonOptions(options =>
        //{
        //    options.JsonSerializerOptions.PropertyNamingPolicy = null;
        //    options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        //});

        serviceCollection.AddLogging();

        #region Infrastructure
        serviceCollection.AddTransient<ISQLCaller, SQLCaller>();
        serviceCollection.AddTransient<IEmailSender, EmailSender>();
        #endregion

        #region Transients
        serviceCollection.AddTransient<IUserData, UserData>();
        #endregion

        #region Configuration
        serviceCollection.Configure<UserDatabaseOptions>(configuration.GetSection("UserDatabase"));
        #region Secrets
        serviceCollection.Configure<CredentialsOptions>(configuration.GetSection("Credentials"));
        #endregion
        #region Site Settings
        serviceCollection.Configure<AppSettingsOptions>(configuration.GetSection("SiteSettings"));
        #endregion
        #endregion

        #endregion Services

        IHost app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;

            _emailSender = services.GetRequiredService<IEmailSender>();
            _userData = services.GetRequiredService<IUserData>();
            _credOpt = services.GetRequiredService<IOptions<CredentialsOptions>>().Value;
            _appSettings = services.GetRequiredService<IOptions<AppSettingsOptions>>().Value;
        }

        //string siteBaseUrl = configuration.GetValue<string>("SiteBaseUrl");

        List<OrderPlacedEmailModel> orderPlacedEmails = _userData.EmailSelectPending(_appSettings.EmailSendCount);

        _emailSender.SendEmailBulk(_appSettings.SiteBaseUrl, _credOpt.ZohoMail, orderPlacedEmails);
        //orderPlacedEmails.ForEach(email =>
        //{
        //    _emailSender.SendEmail(_credOpt.ZohoMail, email);
        //});

        return;
    }
}