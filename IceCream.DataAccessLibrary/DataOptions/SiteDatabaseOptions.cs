using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataOptions
{
    public class SiteDatabaseOptions : IGenericClassOptions<SiteOptions>
    {
        public string ConnectionString { get; set; }
        public SiteOptions Options { get; set; }
    }
}
