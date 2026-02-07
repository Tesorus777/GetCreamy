using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class UserSuggestionModel : UserInformationModel
    {
        public string? Suggestion { get; set; }
        public string? Notes { get; set; }
        // need new honey pot field
    }
}
