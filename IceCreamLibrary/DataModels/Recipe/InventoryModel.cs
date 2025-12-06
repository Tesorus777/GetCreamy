using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class InventoryModel : BaseModel
    {
        public string RecipeName { get; set; }
        public bool PintorQuart { get; set; }
        public decimal Price { get; set; }
        public string Stock { get; set; }
    }
}
