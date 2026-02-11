using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataAccessLibrary.DataOptions.Recipe;
using IceCream.DataAccessLibrary.DataOptions.SecretOptions;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataLibrary.Internal;

namespace IceCreamWeb
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();
            services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = null;
                options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
            });

            #region Infrastructure
            services.AddTransient<ISQLCaller, SQLCaller>();
            #endregion Infrastructure

            #region Transients
            services.AddTransient<IRecipeData, RecipeData>();
            services.AddTransient<IUserData, UserData>();
            services.AddTransient<ISiteData, SiteData>();
            #endregion Transients

            #region Configuration
            services.Configure<RecipeDatabaseOptions>(Configuration.GetSection("RecipeDatabase"));
            services.Configure<UserDatabaseOptions>(Configuration.GetSection("UserDatabase"));
            services.Configure<SiteDatabaseOptions>(Configuration.GetSection("SiteDatabase"));
            #region Secrets
            services.Configure<GeoapifyOptions>(Configuration.GetSection("Geoapify"));
            #endregion Secrets
            #endregion Configuration
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Configure the HTTP request pipeline.
            if (!env.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthorization();
        }
    }
}
