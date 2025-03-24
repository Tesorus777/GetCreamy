using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class RecipeNotesModel : BaseModel
    {
        private int RecipeId { get; set; }
        public float RecipeVersion { get; set; }
        public string Note { get; set; }

        public RecipeNotesModel()
        {
            Note = "The recipe is perfect.\nNo notes required.";
        }
    }
}
