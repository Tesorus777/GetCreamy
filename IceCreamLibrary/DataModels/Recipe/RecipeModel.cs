using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class RecipeModel : BaseModel
    {
        public string Name { get; set; }
        public int Rating { get; set; }
        public int Version { get; set; }
        internal bool Infused { get; set; }
        public int BatchQuantity { get; set; }
        public string BatchQuantityUnit { get; set; }
        public string Description { get; set; }
        public PhotoModel? Photo { get; set; }

        public RecipeModel()
        {
            Rating = 5;
            Description = "Nothing is set in stone, but I promise this flavor is great.";
        }
        public void Normalize()
        {
            BatchQuantityUnit = $"{BatchQuantityUnit}{(BatchQuantity > 1 ? "s" : "")}";
        }
    }
}