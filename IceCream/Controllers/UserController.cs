  using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.User;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace IceCreamAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserData _user;
        private readonly IRecipeData _recipe;

        public UserController(IUserData user, IRecipeData recipe)
        {
            _user = user;
            _recipe = recipe;
        }

        #region Order

        // To Do:
            // 1) Verify Zipcode (for front end form validation)
            // 2) Verify Referral code (for front end form validation)

        [HttpPost]
        [Route("Order")]
        public OrderStatusModel OrderNew([FromBody] JObject data)
        {
            // 1) Create Output
            OrderStatusModel output = new();

            // 2) Parse Input
            OrderModel orderDetails = data["OrderDetails"].ToObject<OrderModel>();
            List<CartModel> cartDetails = data["CartDetails"].ToObject<List<CartModel>>();

            // 3) Verify an order is allowed to be made
                // Remove this white-listing code on full release
            List<OrderReferralModel> referral = _user.OrderVerifyReferral(orderDetails.ReferralText);
            if (referral.Count() < 1)
            {
                // If not a white-listed customer, not allowed to make an order
                output.Success = false;
                output.Message = "Sorry, but you are not able to order at this moment. Please try another time!";
                return output;
            }

            // 2) Verify there are items in the order and the entire order is available
            if (cartDetails.Count() < 1)
            {
                output.Success = false;
                output.Message = "Please add some ice cream to your cart.";
                return output;
            }
            int inventoryCount = 0;
            foreach (CartModel item in cartDetails)
            {
                inventoryCount += item.Pints + item.Quarts;
            }
            List<InventoryModel> availableCartInventory = _recipe.InventorySelectOrderItemsBulk(cartDetails);
            if (inventoryCount > availableCartInventory.Count())
            {
                output.Success = false;
                output.Message = "Sorry, but we are out of stock of one or more items from your order. Please verify your cart and try ordering again!";
                return output;
            }

            // 3) Insert an order
            // Will auto reject if a zipcode is invalid
            output.Order = _user.OrderInsert(orderDetails);
            if (output.Order == null || output.Order.Id == null)
            {
                output.Success = false;
                output.Message = "Sorry, something went wrong. Please verify your order details and try again.";
            } else
            {
                // 4) Insert the availableCartInventory into the OrderContent table
                output.OrderContent = _user.OrderContentInsertBulk(output.Order.Id, availableCartInventory);
                output.Success = true;
                output.Message = "Your order is placed! You should receive confirmation soon.";

                // 5) Delete the ordered items from the Inventory table
                List<InventoryModel> deletedInventory = _recipe.InventoryDeleteOrderItemsBulk(cartDetails);
            }

            return output;
        }

        [HttpGet]
        [Route("VerifyReferral/{code}")]
        public OrderReferralModel GetOrderVerifyReferral(string code)
        {
            return _user.OrderVerifyReferral(code).First();
        }

        [HttpGet]
        [Route("VerifyZipcode/{zipcode}")]
        public DeliveryZipcodeModel GetOrderVerifyZipcode(string zipcode)
        {
            return _user.OrderVerifyZipcode(zipcode).First();
        }

        #endregion

        #region Storage

        [HttpGet]
        [Route("Storage/{onlyRequired?}")]
        public List<StorageModel> GetStorage(bool onlyRequired = false)
        {
            return _user.StorageSelect(onlyRequired);
        }

        #endregion Storage

        #region Suggestions

        [HttpPost]
        [Route("User/Suggestion")]
        public void UserSuggestionNew([FromBody] UserSuggestionModel input)
        {
            _user.UserSuggestionNew(input);
        }

        #endregion Suggestions

        #region User Data

        [HttpGet]
        [Route("User/New")]
        public UserModel GenerateNewUser()
        {
            return _user.UserGenerateNew();
        }

        #endregion User Data

        #region User View

        [HttpPost]
        [Route("View")]
        public void UserViewRecipe([FromBody] UserViewModel input)
        {
            _user.UserView(input);
        }

        #endregion User View

    }
}
