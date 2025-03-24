using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class TrendingRecipeModel : RecipeModel
    {
        internal int ViewCount { get; set; }
    }
}
