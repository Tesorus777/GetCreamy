using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class IngredientInventory
    {
        public int ReceiptId { get; set; }
        public int IngredientId { get; set; }
        public string Quantity { get; set; }
    }
}
