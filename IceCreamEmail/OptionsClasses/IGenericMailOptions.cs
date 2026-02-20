using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCreamEmail.OptionsClasses
{
    public interface IGenericMailOptions
    {
        public bool Ssl { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
        public LoginOptions Login { get; set; }
    }
}
