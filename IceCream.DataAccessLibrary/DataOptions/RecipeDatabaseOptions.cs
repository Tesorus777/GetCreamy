using IceCream.DataAccessLibrary.DataOptions.Recipe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataOptions
{
    public class RecipeDatabaseOptions : IGenericClassOptions<RecipeOptions>
    {
        public string ConnectionString { get; set; }
        public RecipeOptions Options { get; set; }
    }
}
