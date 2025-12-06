using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class RecipeIngredientModel : BaseModel
    {
        private int RecipeId { get; set; }
        private int IngredientId { get; set; }
        public string Text { get; set; }
        public decimal Quantity { get; set; }
        public string QuantityUnit { get; set; }
        public void Normalize()
        {
            // Set plurality
            Text = SetPlural(Quantity, Text, QuantityUnit);
            QuantityUnit = SetPlural(Quantity, null, QuantityUnit);
        }
        private string SetPlural(decimal quantity, string? text, string? unit)
        {
            string output = text is not null ? text : unit is not null ? unit : "";
            int quantityInt = (int)Math.Floor(quantity);
            if (quantityInt > 1)
            {
                // if the quantity is greater than 1
                if (text is not null && unit is null)
                {
                    // Rules to make a word plural
                    // For now, assume everything that is unit-less just requires an 's' attached at the end. Update later if not the case
                    output = $"{text}s";
                }
                if (text is null && unit is not null)
                {
                    // If there is a unit attached, pluralize the unit
                    output = $"{unit}s";
                }
            }

            return output;
        }
    }
}
