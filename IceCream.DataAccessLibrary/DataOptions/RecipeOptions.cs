using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataOptions.Recipe
{
    public class RecipeOptions
    {
        public GenericOptions Ingredient { get; set; }
        public GenericOptions Recipe { get; set; }
        public GenericOptions RecipeNote { get; set; }
        public GenericOptions RecipePhotos { get; set; }
        public GenericOptions Step { get; set; }
    }
}
