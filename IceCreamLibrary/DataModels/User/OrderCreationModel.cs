using IceCream.DataLibrary.DataModels.Recipe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class OrderCreationModel
    {
        // Abstract Success and Message out to a SuccessModel in /DataModels if anything else warrants a Success and Message property
        public OrderModel Order { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<InventoryModel> OrderContent { get; set; }
        public UserInformationModel UserInformation { get; set; }
        public List<RecipePhotoModel> OrderPhotos { get; set; }
    }
}
