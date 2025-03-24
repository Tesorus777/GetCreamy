using IceCream.DataLibrary.DataModels.User;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public interface IUserData
    {
        List<StorageModel> CookieSelect(bool onlyRequired);
        List<StorageModel> LocalSelect(bool onlyRequired);
        List<StorageModel> SessionSelect(bool onlyRequired);
        List<StorageModel> StorageSelect(bool onlyRequired);
        UserModel UserGenerateNew();
        void UserSuggestionNew(UserSuggestionModel input);
        void UserView(UserViewModel input);
    }
}