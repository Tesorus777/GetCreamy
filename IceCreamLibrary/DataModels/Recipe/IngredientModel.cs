using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class IngredientModel : BaseModel
    {
        public string? Text { get; set; }
        public string BaseUnit { get; set; }
    }
}
