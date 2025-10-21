using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataAccessLibrary.DataOptions.Recipe;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataLibrary.Internal;

namespace IceCreamAPI
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
            // for dependencies and services
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = null;
                options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
            }).ConfigureApiBehaviorOptions(options =>
            {
                options.SuppressMapClientErrors = true;
            }).AddNewtonsoftJson();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddCors(p => p.AddPolicy("corsapp", builder =>
            {
                builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
            }));

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
            #endregion Configuration
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // for middlewares

            // Configure the HTTP request pipeline.
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //app cors
            app.UseRouting();
            app.UseCors("corsapp");
            app.UseStaticFiles();
            app.UseAuthorization();

            //app.UseCors(prodCorsPolicy);
        }
    }
}
