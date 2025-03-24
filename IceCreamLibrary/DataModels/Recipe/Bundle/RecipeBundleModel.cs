using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe.Bundle
{
    public class RecipeBundleModel
    {
        public RecipeModel Recipe { get; set; }
        public List<IngredientModel> Ingredients { get; set; }
        public List<StepModel> Steps { get; set; }
        public List<PhotoModel> Photos { get; set; }
        public List<RecipeNotesModel> Notes { get; set; }
    }
}
