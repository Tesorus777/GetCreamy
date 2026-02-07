using Dapper;
using IceCream.DataLibrary.DataModels;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Dapper.SqlMapper;

namespace IceCream.DataAccessLibrary.Internal.Bundlers
{
    public class RecipeBundler : IBundler
    {
        public object Bundled { get; set; }

        public RecipeBundler()
        {
            Bundled = new RecipeBundleModel();
        }

        public void BundleClass(GridReader reader)
        {
            ((RecipeBundleModel)Bundled).Recipe = reader.Read<RecipeModel>().FirstOrDefault();
            ((RecipeBundleModel)Bundled).Ingredients = reader.Read<RecipeIngredientModel>().ToList();
            ((RecipeBundleModel)Bundled).Steps = reader.Read<StepModel>().ToList();
            ((RecipeBundleModel)Bundled).Photos = reader.Read<RecipePhotoModel>().ToList();
            //((RecipeBundleModel)Bundled).Notes = reader.Read<RecipeNotesModel>().ToList();
            ((RecipeBundleModel)Bundled).Inventory = reader.Read<InventoryModel>().ToList();
        }
    }
}
