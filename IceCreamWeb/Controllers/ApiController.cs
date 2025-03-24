using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IceCreamWeb.Controllers
{
    [Route("config")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly IConfiguration _config;

        public ApiController(IConfiguration configuration)
        {
            _config = configuration;
        }

        [HttpGet("settings.js")]
        public IActionResult GetSettings()
        {
            var apiUrl = _config["ApiBaseUrl"];
            var jsContent = $"window.envVar = {{ baseUrl: '{apiUrl}' }};";
            return Content(jsContent, "application/javascript");
        }
    }
}
