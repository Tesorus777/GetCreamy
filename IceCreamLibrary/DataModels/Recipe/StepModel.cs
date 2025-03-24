using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class StepModel : BaseModel
    {
        private int RecipeId { get; set; }
        public int Step { get; set; }
        public string Text { get; set; }
    }
}
