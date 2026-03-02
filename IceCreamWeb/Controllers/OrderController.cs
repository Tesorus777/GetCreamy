using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataLibrary.DataModels.User;
using IceCreamWeb.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Diagnostics;

namespace IceCreamWeb.Controllers
{
    public class OrderController : Controller
    {
        private readonly ILogger<OrderController> _logger;
        private readonly IUserData _userData;

        public OrderController(ILogger<OrderController> logger, IUserData userData)
        {
            _logger = logger;
            _userData = userData;
        }
        public IActionResult Checkout()
        {
            ViewBag.Cart = false;
            return View();
        }

        public IActionResult Placed()
        {
            ViewBag.Cart = false;
            return View();
        }

        [Route("Manage/{OrderUniqueId}")]
        public IActionResult Manage(Guid? OrderUniqueId)
        {
            // Directed here from email

            // 1) Get order from OrderUniqueId
            OrderCreationModel order = _userData.OrderGetByUniqueId(OrderUniqueId);
            //OrderCreationModel order = new();

            if (order.Order.Id != null)
            {
                _userData.OrderUpdateStatus(OrderUniqueId);
                ViewBag.Cart = false;
                ViewBag.Order = JsonConvert.SerializeObject(order);
                return View();
            } else
            {
                return RedirectToAction("Index", "Home");
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
