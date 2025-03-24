using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataOptions.Recipe
{
    public class GenericOptions
    {
        public string Select { get; set; }
        public string Insert { get; set; }
        public string Update { get; set; }
        public string Delete { get; set; }
        public Dictionary<string, string> Other { get; set; }
    }
}
