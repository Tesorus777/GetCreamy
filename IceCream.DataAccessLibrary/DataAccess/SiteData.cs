using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataLibrary.DataModels.Site;
using IceCream.DataLibrary.DataModels.User;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public class SiteData : ISiteData
    {
        private readonly ISQLCaller _sQLCaller;
        private readonly SiteDatabaseOptions _opt;

        public SiteData(ISQLCaller sQLCaller, IOptions<SiteDatabaseOptions> opt)
        {
            _sQLCaller = sQLCaller;
            _opt = opt.Value;
        }

        #region Upcoming Project

        public List<UpcomingProjectModel> UpcomingProjectSelect()
        {
            List<UpcomingProjectModel> output = new();
            output = _sQLCaller.ExecuteSelect<UpcomingProjectModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { },
                Command: _opt.Options.UpcomingProject.Select
            );
            return output;
        }

        #endregion
    }
}
