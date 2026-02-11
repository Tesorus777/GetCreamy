using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using IceCreamWeb.Models;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataAccessLibrary.DataAccess;
using Newtonsoft.Json;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;
using IceCream.DataAccessLibrary.Internal.Bundlers;

namespace IceCreamWeb.Controllers;

public class FlavorController : Controller
{
    private readonly ILogger<FlavorController> _logger;
    private readonly IRecipeData _data;

    public FlavorController(ILogger<FlavorController> logger, IRecipeData data)
    {
        _logger = logger;
        _data = data;
    }

    [Route("Flavor/{RecipeName}")]
    public IActionResult Index(string RecipeName)
    {
        ViewBag.Cart = true;
        RecipeBundleModel recipeBundle = _data.RecipeSelectOneBundle(RecipeName);
        ViewBag.Title = $"GetCreamy | {recipeBundle.Recipe.Name} Ice Cream";
        ViewBag.RecipeBundle = JsonConvert.SerializeObject(recipeBundle);

        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}