using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class UserSuggestionModel : UserModel
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Suggestion { get; set; }
        public string? Notes { get; set; }
        public bool MailingList { get; set; }
        public string? Telephone { get; set; } // Honey Pot
    }
}
