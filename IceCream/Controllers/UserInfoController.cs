using IceCream.DataAccessLibrary.DataAccess;
using IceCream.DataLibrary.DataModels.User;
using Microsoft.AspNetCore.Mvc;

namespace IceCreamAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserInfoController : ControllerBase
    {
        private readonly IUserData _user;

        public UserInfoController(IUserData user)
        {
            _user = user;
        }

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
