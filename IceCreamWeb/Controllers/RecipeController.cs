using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using IceCreamWeb.Models;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataAccessLibrary.DataAccess;
using Newtonsoft.Json;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;
using IceCream.DataAccessLibrary.Internal.Bundlers;

namespace IceCreamWeb.Controllers;

public class RecipeController : Controller
{
    private readonly ILogger<RecipeController> _logger;
    private readonly IRecipeData _data;

    public RecipeController(ILogger<RecipeController> logger, IRecipeData data)
    {
        _logger = logger;
        _data = data;
    }

    [Route("Recipe/{RecipeName}")]
    public IActionResult Index(string RecipeName)
    {
        RecipeBundleModel recipeBundle = _data.RecipeSelectOneBundle(RecipeName);
        ViewBag.Title = recipeBundle.Recipe.Name;
        ViewBag.RecipeBundle = JsonConvert.SerializeObject(recipeBundle);

        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}