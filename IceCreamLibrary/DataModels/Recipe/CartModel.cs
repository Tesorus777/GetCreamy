using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class CartModel
    {
        public string Flavor { get; set; }
        public int Pints { get; set; } = 0;
        public int Quarts { get; set; } = 0;
    }
}
