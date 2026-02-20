using Dapper;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Dapper.SqlMapper;

namespace IceCream.DataAccessLibrary.Internal.Bundlers
{
    public class OrderCreationBundler : IBundler
    {
        public object Bundled { get; set; }

        public OrderCreationBundler()
        {
            Bundled = new OrderCreationModel();
        }

        public void BundleClass(GridReader reader)
        {
            ((OrderCreationModel)Bundled).Order = reader.Read<OrderModel>().FirstOrDefault();
            ((OrderCreationModel)Bundled).Success = reader.Read<bool>().FirstOrDefault();
            ((OrderCreationModel)Bundled).Message = reader.Read<string>().FirstOrDefault();
            ((OrderCreationModel)Bundled).OrderContent = reader.Read<InventoryModel>().ToList();
            ((OrderCreationModel)Bundled).UserInformation = reader.Read<UserInformationModel>().FirstOrDefault();
            ((OrderCreationModel)Bundled).OrderPhotos = reader.Read<RecipePhotoModel>().ToList();
        }
    }
}
