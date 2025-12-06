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
        public List<RecipeIngredientModel> Ingredients { get; set; }
        public List<StepModel> Steps { get; set; }
        public List<RecipePhotoModel> Photos { get; set; }
        public List<RecipeNotesModel> Notes { get; set; }
        public List<InventoryModel> Inventory { get; set; }
    }
}
