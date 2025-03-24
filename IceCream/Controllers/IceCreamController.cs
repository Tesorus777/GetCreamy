using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;
using Microsoft.AspNetCore.Mvc;

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

        #region Steps

        #endregion

    }
}
