using Dapper;
using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataAccessLibrary.Internal.Bundlers;
using IceCream.DataLibrary.DataModels;
using IceCream.DataLibrary.DataModels.Email;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.User;
using IceCream.DataLibrary.Internal;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public class UserData : IUserData
    {
        private readonly ISQLCaller _sqlCaller;
        private readonly UserDatabaseOptions _opt;

        public UserData(ISQLCaller sqlCaller, IOptions<UserDatabaseOptions> opt)
        {
            _sqlCaller = sqlCaller;
            _opt = opt.Value;
        }

        #region Order

        #region Email

        public List<OrderPlacedEmailModel> EmailSelectPending(int num)
        {
            // runs an email query that gets data from a view
            // appropriately sorts into EmailModel categories
            List<OrderPlacedEmailModel> output = new();
            output = _sqlCaller.ExecuteSelect<OrderPlacedEmailModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Num = num },
                Command: _opt.Options.Order.Other["PendingEmailSelect"]
            );
            return output;
        }

        public void EmailSelectDeleted(int num)
        {
            // TBD:
            // Build SQL query (OrderStatusId = deleted id but deleted date is still null
              // => set deleted date after query execution)
            // Change output model to something like OrderCanceledEmailModel
              // and return the model object
        }

        #endregion

        public OrderModel OrderSelectOne(OrderModel order)
        {
            OrderModel output = new();
            output = _sqlCaller.ExecuteSelect<OrderModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: order,
                Command: _opt.Options.Order.Other["SelectOne"]
            ).FirstOrDefault();
            return output;
        }

        public OrderModel OrderInsert(OrderModel order)
        {
            // This is an insert despite having a return value because the Order Id is used later to insert Order Content
            OrderModel output = new();
            output = _sqlCaller.ExecuteSelect<OrderModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: order,
                Command: _opt.Options.Order.Insert
            ).FirstOrDefault();
            return output;
        }

        public void OrderUpdate(OrderModel order)
        {
            _sqlCaller.Execute<dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: order,
                Command: _opt.Options.Order.Update
            );
        }

        public List<DeliveryZipcodeModel> OrderVerifyZipcode(string zipcode)
        {
            List<DeliveryZipcodeModel> output = new();
            output = _sqlCaller.ExecuteSelect<DeliveryZipcodeModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Zipcode = zipcode.FirstFromSplit('-') },
                Command: _opt.Options.Order.Other["VerifyZipcode"]
            );
            return output;
        }

        public List<OrderReferralModel> OrderVerifyReferral(string referral)
        {
            List<OrderReferralModel> output = new();
            output = _sqlCaller.ExecuteSelect<OrderReferralModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Text = referral },
                Command: _opt.Options.Order.Other["VerifyReferral"]
            );
            return output;
        }

        public OrderCreationModel OrderGetByUniqueId(Guid? orderUniqueId)
        {
            OrderCreationModel output = new();
            if (orderUniqueId == null)
            {
                return output;
            }
            output = _sqlCaller.ExecuteSelectBundle<OrderCreationModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OrderUniqueId = orderUniqueId },
                Command: _opt.Options.Order.Other["SelectOneByUniqueId"],
                Bundler: new OrderCreationBundler()
            );
            return output;
        }

        public void OrderUpdateStatus(Guid? orderUniqueId)
        {
            if (orderUniqueId == null)
            {
                return;
            }
            _sqlCaller.Execute<dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OrderUniqueId = orderUniqueId },
                Command: _opt.Options.Order.Other["ConfirmPlaced"]
            );
        }

        #endregion

        #region Order Content

        public List<InventoryModel> OrderContentInsertBulk(long orderId, List<InventoryModel> inventoryContent)
        {
            List<InventoryModel> output = new();
            var inventoryContentDataTable = inventoryContent.ToDataTable<InventoryModel>("InventoryContentType");
            output = _sqlCaller.ExecuteSelect<InventoryModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OrderId = orderId, InventoryContent = inventoryContentDataTable.AsTableValuedParameter("InventoryContentType") },
                Command: _opt.Options.OrderContent.Insert
            );
            return output;
        }

        public List<InventoryModel> OrderContentInsert(long orderId, InventoryModel inventoryContent)
        {
            List<InventoryModel> output = new();
            output = _sqlCaller.ExecuteSelect<InventoryModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new {
                    Id = inventoryContent.Id,
                    OrderId = orderId,
                    RecipeName = inventoryContent.RecipeName,
                    PintorQuart = inventoryContent.PintorQuart,
                    Price = inventoryContent.Price
                },
                Command: _opt.Options.OrderContent.Other["InsertOne"]
            );
            return output;
        }

        #endregion

        #region Storage

        public List<StorageModel> StorageSelect(bool onlyRequired)
        {

            List<StorageModel> output = new();
            output = _sqlCaller.ExecuteSelect<StorageModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OnlyRequired = onlyRequired },
                Command: _opt.Options.Storage.Select
            );
            return output;
        }

        public List<StorageModel> CookieSelect(bool onlyRequired)
        {
            List<StorageModel> output = new();
            output = _sqlCaller.ExecuteSelect<StorageModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OnlyRequired = onlyRequired },
                Command: _opt.Options.Storage.Other["SelectCookies"]
            );
            return output;
        }

        public List<StorageModel> SessionSelect(bool onlyRequired)
        {
            List<StorageModel> output = new();
            output = _sqlCaller.ExecuteSelect<StorageModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OnlyRequired = onlyRequired },
                Command: _opt.Options.Storage.Other["SelectSessions"]
            );
            return output;
        }

        public List<StorageModel> LocalSelect(bool onlyRequired)
        {
            List<StorageModel> output = new();
            output = _sqlCaller.ExecuteSelect<StorageModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { OnlyRequired = onlyRequired },
                Command: _opt.Options.Storage.Other["SelectLocals"]
            );
            return output;
        }

        #endregion

        #region User

        public UserModel UserGenerateNew()
        {
            // 1) Create New User
            UserModel newUser = new();
            newUser.UserId = Guid.NewGuid();
            // 2) Save New User
            _sqlCaller.Execute<dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: newUser,
                Command: _opt.Options.User.Insert
            );
            // 3) Return New User
            return newUser;
        }

        public UserInformationModel UserInformationInsert(UserInformationModel input)
        {
            input.Normalize();
            UserInformationModel output = new();
            output = _sqlCaller.ExecuteSelect<UserInformationModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: input,
                Command: _opt.Options.UserInfo.Insert
            ).FirstOrDefault();
            return output;
        }

        public void UserView(UserViewModel input)
        {
            _sqlCaller.Execute<dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: input,
                Command: _opt.Options.UserView.Insert
            );
        }

        public void UserSuggestionNew(UserSuggestionModel input)
        {
            // Only execute suggestion stored procedure if telephone is not entered
            if (String.IsNullOrEmpty(input.Telephone))
            {
                UserSuggestionModel validInput = UserSuggestionValidate(input);
                _sqlCaller.Execute<dynamic>(
                    ConnectionString: _opt.ConnectionString,
                    Parameter: validInput,
                    Command: _opt.Options.UserSuggestion.Other["NewSuggestion"]
                );
            }
        }

        private UserSuggestionModel UserSuggestionValidate(UserSuggestionModel input)
        {
            // Ensures any UserSuggestionModel input from an API request is valid
            input.FirstName = input.FirstName.RegexReplace(@"A-Za-z\s\-");
            input.FirstName = input.FirstName.Truncate(50);
            input.LastName = input.LastName.RegexReplace(@"A-Za-z\s\-");
            input.LastName = input.LastName.Truncate(50);
            input.Email = input.Email.RegexReplace(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]$");
            input.Email = input.Email.Truncate(200);
            input.Suggestion = input.Suggestion.RegexReplace(@"A-Za-z\s\-");
            input.Suggestion = input.Suggestion.Truncate(50);
            input.Notes = input.Notes.Truncate(2500);
            input.Telephone = input.Telephone.RegexReplace(@"0-9");
            input.Telephone = input.Telephone.Truncate(22);
            return input;
        }

        #endregion User

    }
}
