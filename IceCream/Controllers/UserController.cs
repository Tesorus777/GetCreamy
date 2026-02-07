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

        [HttpPost]
        [Route("Order")]
        public OrderCreationModel OrderNew([FromBody] JObject data)
        {
            // Input:
            // data = {
            // OrderDetails: { Order Model }
            // CartDetails: [{ CartModel }, { Cart Model }, ... ]
            // UserDetails: { User Information Model }
            // };

            // 1) Create Output
            OrderCreationModel output = new();
            output.Success = false; // default

            // 2) Parse Input
            List<CartModel> cartDetails = data["CartDetails"].ToObject<List<CartModel>>();
            OrderModel orderDetails = data["OrderDetails"].ToObject<OrderModel>();
            orderDetails.SetDefaults();
            UserInformationModel userDetails = data["UserDetails"].ToObject<UserInformationModel>();

            // 3) Verify an order is allowed to be made
            if (userDetails.UserId == Guid.Empty || orderDetails.UserId == Guid.Empty)
            {
                // If not coming from the checkout page with a valid UserId, do not permit order
                output.Message = "Please allow first party browser cookies and order through the official page";
                return output;
            }
            // Remove this white-listing code on full release -- need to do a default referral[0].MinimumOrderValue of 0 to preserve subsequent logic
            List<OrderReferralModel> referral = _user.OrderVerifyReferral(orderDetails.ReferralText);
            if (referral.Count() < 1)
            {
                // If not a white-listed customer, not allowed to make an order
                output.Message = "Sorry, but we are unable to take your order at this moment.|Please try another time!";
                return output;
            }

            // 2) Verify there are items in the order and at least some of the order is available
            if (cartDetails.Count() < 1)
            {
                output.Message = "Please add some ice cream to your cart.";
                return output;
            }

            // 3) Insert an order if inventory is available


            List<InventoryModel> availableCartInventory = _recipe.InventorySelectOrderItemsBulk(cartDetails);
            decimal availableCartValue = availableCartInventory.Sum(item => item.Price);
            if (availableCartInventory.Count() > 0)
            {
                if (availableCartValue >= referral[0].MinimumOrderValue)
                {
                    // Insert user information after everything is validated
                    output.UserInformation = _user.UserInformationInsert(userDetails);
                    // Will auto reject if
                    // zipcode is invalid (verify this)
                    // referral text is valid (verify this)
                    output.Order = _user.OrderInsert(orderDetails);
                } else
                {
                    // If the referral minimum value is not hit, cannot order with that code
                    output.Message = $"Sorry, the minimum order value for this discount code is ${Math.Round(referral[0].MinimumOrderValue ?? 0.00M, 2)}.|Please add some more ice cream to your cart or try a different code!";
                    return output;
                }
            } else
            {
                output.Message = "Sorry, nothing from your order is in stock!";
            }

            // 4) Check if order was created
            if (output.Order == null || output.Order.Id == null)
            {
                output.Message = "Sorry, something went wrong.|Please verify your order details and try again.";
            }
            else
            {
                output.Success = true;
                // Compare how many are in the order vs how many are in inventory
                int cartTotal = 0;
                foreach (CartModel item in cartDetails)
                {
                    cartTotal += item.Pints + item.Quarts;
                }
                if (cartTotal > availableCartInventory.Count())
                {
                    // if customer desires more items than what is available
                    output.Message = "Sorry, but we are out of stock of one or more items from your order.|You will receive a confirmation email soon for your remaining items.";
                }
                else
                {
                    // else the availableCartInventory count is equal to cartTotal
                    output.Message = "Your order is placed!|You should receive a confirmation email soon.";
                }
                // 4) Insert the availableCartInventory into the OrderContent table
                output.OrderContent = _user.OrderContentInsertBulk(output.Order.Id, availableCartInventory);
                // 5) Get the photos associated with the Order Content
                List<RecipeNameTypeModel> photoInput = output.OrderContent.DistinctBy(c => c.RecipeName).Select(rn => new RecipeNameTypeModel
                {
                    RecipeName = rn.RecipeName
                }).ToList();
                output.OrderPhotos = _recipe.RecipePhotoSelectFirstsBulk(photoInput);

                // 6) Get the order after content inserted for price info
                output.Order = _user.OrderSelectOne(output.Order);
                // 7) Delete the ordered items from the Inventory table
                List<InventoryModel> deletedInventory = _recipe.InventoryDeleteOrderItemsBulk(cartDetails);
            }

            return output;
        }

        [HttpGet]
        [Route("VerifyReferral/{code}")]
        public OrderReferralModel GetOrderVerifyReferral(string code)
        {
            return _user.OrderVerifyReferral(code).FirstOrDefault() ?? new OrderReferralModel();
        }

        [HttpGet]
        [Route("VerifyZipcode/{zipcode}")]
        public DeliveryZipcodeModel GetOrderVerifyZipcode(string zipcode)
        {
            return _user.OrderVerifyZipcode(zipcode).FirstOrDefault() ?? new DeliveryZipcodeModel();
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
        [Route("Suggestion")]
        public void UserSuggestionNew([FromBody] UserSuggestionModel input)
        {
            _user.UserSuggestionNew(input);
        }

        #endregion Suggestions

        #region User Data

        [HttpGet]
        [Route("New")]
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
