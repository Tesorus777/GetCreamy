using IceCream.DataAccessLibrary.DataOptions.SecretOptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace IceCreamWeb.Controllers
{
    [Route("config")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly GeoapifyOptions _geoOpts;

        public ApiController(IConfiguration configuration, IOptions<GeoapifyOptions> geoOpts)
        {
            _config = configuration;
            _geoOpts = geoOpts.Value;
        }

        [HttpGet("settings.js")]
        public IActionResult GetSettings()
        {
            var apiUrl = _config["ApiBaseUrl"];
            var geoapifyUrl = _geoOpts.BaseUrl;
            var geoapifyApiKey = _geoOpts.ApiKey;
            var jsContent = $"window.envVar = {{ baseUrl: '{apiUrl}', geoapifyUrl: '{geoapifyUrl}', geoapifyApiKey: '{geoapifyApiKey}' }};";
            return Content(jsContent, "application/javascript");
        }
    }
}
