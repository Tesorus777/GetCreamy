using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.User;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public interface IUserData
    {
        List<StorageModel> CookieSelect(bool onlyRequired);
        List<StorageModel> LocalSelect(bool onlyRequired);
        List<InventoryModel> OrderContentInsert(long orderId, InventoryModel inventoryContent);
        List<InventoryModel> OrderContentInsertBulk(long orderId, List<InventoryModel> inventoryContent);
        OrderModel OrderInsert(OrderModel order);
        OrderModel OrderSelectOne(OrderModel order);
        void OrderUpdate(OrderModel order);
        List<OrderReferralModel> OrderVerifyReferral(string referral);
        List<DeliveryZipcodeModel> OrderVerifyZipcode(string zipcode);
        List<StorageModel> SessionSelect(bool onlyRequired);
        List<StorageModel> StorageSelect(bool onlyRequired);
        UserModel UserGenerateNew();
        UserInformationModel UserInformationInsert(UserInformationModel input);
        void UserSuggestionNew(UserSuggestionModel input);
        void UserView(UserViewModel input);
    }
}