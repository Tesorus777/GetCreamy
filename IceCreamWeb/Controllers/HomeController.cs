using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using IceCreamWeb.Models;
using IceCream.DataAccessLibrary.DataAccess;
using Newtonsoft.Json;

namespace IceCreamWeb.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IRecipeData _recipeData;
    private readonly ISiteData _siteData;

    public HomeController(ILogger<HomeController> logger, IRecipeData recipeData, ISiteData siteData)
    {
        _logger = logger;
        _recipeData = recipeData;
        _siteData = siteData;
    }

    public IActionResult Index()
    {
        ViewBag.Featured = JsonConvert.SerializeObject(_recipeData.RecipeSelectFeatured());
        ViewBag.Trending = JsonConvert.SerializeObject(_recipeData.RecipeSelectTrending());
        ViewBag.Blog = JsonConvert.SerializeObject(_siteData.UpcomingProjectSelect());
        return View();
    }

    public IActionResult Recipes()
    {
        ViewBag.Recipes = JsonConvert.SerializeObject(_recipeData.RecipeSelect());
        return View();
    }

    public IActionResult Ingredients()
    {
        return View();
    }

    public IActionResult About()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
