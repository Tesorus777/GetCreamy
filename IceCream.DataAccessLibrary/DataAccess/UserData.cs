using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataLibrary.DataModels;
using IceCream.DataLibrary.DataModels.User;
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
