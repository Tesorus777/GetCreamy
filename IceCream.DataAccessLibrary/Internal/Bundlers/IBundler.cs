using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Dapper.SqlMapper;

namespace IceCream.DataAccessLibrary.Internal.Bundlers
{
    public interface IBundler
    {
        object Bundled { get; set; }
        void BundleClass(GridReader reader);
    }
}
