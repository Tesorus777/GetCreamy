using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataLibrary.DataModels.Site;
using Microsoft.AspNetCore.Mvc;

namespace IceCreamAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SiteController : ControllerBase
    {
        private readonly ISiteData _site;

        public SiteController(ISiteData site)
        {
            _site = site;
        }

        #region Upcoming Project

        [HttpGet]
        [Route("IncompleteProjects")]
        public List<UpcomingProjectModel> GetUpcomingProject()
        {
            return _site.UpcomingProjectSelect();
        }

        #endregion
    }
}
