using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataOptions
{
    public class UserDatabaseOptions : IGenericClassOptions<UserOptions>
    {
        public string ConnectionString { get; set; }
        public UserOptions Options { get; set; }
    }
}
