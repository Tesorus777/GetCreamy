using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using IceCreamWeb.Models;
using IceCream.DataAccessLibrary.DataAccess;
using Newtonsoft.Json;

namespace IceCreamWeb.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IRecipeData _data;

    public HomeController(ILogger<HomeController> logger, IRecipeData data)
    {
        _logger = logger;
        _data = data;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Recipes()
    {
        ViewBag.Recipes = JsonConvert.SerializeObject(_data.RecipeSelect());
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
