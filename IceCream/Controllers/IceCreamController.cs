using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace IceCreamAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class IceCreamController : ControllerBase
    {
        private readonly IRecipeData _recipe;

        public IceCreamController(IRecipeData recipe)
        {
            _recipe = recipe;
        }

        #region Recipe

        [HttpGet]
        [Route("Recipe")]
        public List<RecipeModel> GetRecipes()
        {
            return _recipe.RecipeSelect();
        }

        [HttpGet]
        [Route("Recipe/{startNum:int}/{num:int}")]
        public List<RecipeModel> GetNumberOfRecipes(int startNum=0, int num=20)
        {
            return _recipe.RecipeSelect(startNum, num);
        }

        [HttpGet]
        [Route("Recipe/{name}")]
        public RecipeBundleModel GetRecipeBundle(string name= "vanilla")
        {
            return _recipe.RecipeSelectOneBundle(name);
        }

        [HttpGet]
        [Route("Recipe/Featured")]
        public List<RecipeModel> GetFeaturedRecipe()
        {
            return _recipe.RecipeSelectFeatured();
        }

        [HttpGet]
        [Route("Recipe/Trending")]
        public List<TrendingRecipeModel> GetTrendingRecipes()
        {
            return _recipe.RecipeSelectTrending();
        }

        #endregion

        #region Recipe Photo

        [HttpGet]
        [Route("Photos/{name}")]
        public List<RecipePhotoModel> GetOneRecipePhotos(string name= "vanilla")
        {
            return _recipe.RecipePhotoSelectOne(name);
        }

        [HttpGet]
        [Route("Photos/Firsts")]
        public List<RecipePhotoModel> GetFirstRecipePhotos()
        {
            return _recipe.RecipePhotoSelectFirsts();
        }

        #endregion

        #region Ingredients

        #endregion

        #region Inventory

        [HttpGet]
        [Route("Inventory")]
        public List<InventoryModel> GetCurrentInventory()
        {
            return _recipe.InventorySelectCurrentStock();
        }

        [HttpGet]
        [Route("Inventory/{recipeName}")]
        public List<InventoryModel> GetInventoryOne(string recipeName)
        {
            return _recipe.InventorySelectOneCurrentStock(recipeName);
        }

        [HttpPost]
        [Route("Inventory/Check")]
        public List<CartModel> CheckCurrentInventory([FromBody] List<CartModel> input)
        {
            // 1) Create Output
            List<CartModel> output = new();

            // 2) Get total inventory
            List<InventoryModel> inventory = _recipe.InventorySelectBulkCurrentStock(input);

            // 3) Calculate if you can keep input value or are limited by available inventory
            foreach (CartModel item in input)
            {
                int pints = 0;
                int quarts = 0;
                // Add new row to output
                InventoryModel pintAvailability = inventory.FirstOrDefault(i => (i.RecipeName == item.Flavor) && (i.PintorQuart == false))
                    ?? new InventoryModel { 
                        RecipeName = item.Flavor,
                        PintorQuart = false,
                        Price = 0,
                        Stock = "0"
                    };
                InventoryModel quartAvailability = inventory.FirstOrDefault(i => (i.RecipeName == item.Flavor) && (i.PintorQuart == true))
                    ?? new InventoryModel {
                        RecipeName = item.Flavor,
                        PintorQuart = true,
                        Price = 0,
                        Stock = "0"
                    };

                // Pints
                if (item.Pints > Int32.Parse(pintAvailability.Stock))
                {
                    // If you are ordering more pints than available, set output to availability
                    pints = Int32.Parse(pintAvailability.Stock);
                } else
                {
                    // If you are ordering fewer pints than available, set output to the input or 20 (max allowed to purchase)
                    pints = item.Pints <= 20 ? item.Pints : 20;
                }

                // Quarts
                if (item.Quarts > Int32.Parse(quartAvailability.Stock))
                {
                    // If you are ordering more quarts than available, set output to availability
                    quarts = Int32.Parse(quartAvailability.Stock);
                }
                else
                {
                    // If you are ordering fewer quarts than available, set output to the input or 20 (max allowed to purchase)
                    quarts = item.Quarts <= 20 ? item.Quarts : 20;
                }

                // Add to output
                output.Add(new CartModel { Flavor =  item.Flavor, Pints = pints, Quarts = quarts });
            }

            return output;
        }

        #endregion

        #region Steps

        #endregion

    }
}
