using IceCream.DataAccessLibrary.DataOptions.Recipe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.DataOptions
{
    public class UserOptions
    {
        public GenericOptions Order { get; set; }
        public GenericOptions OrderContent { get; set; }
        public GenericOptions Storage { get; set; }
        public GenericOptions User { get; set; }
        public GenericOptions UserInfo { get; set; }
        public GenericOptions UserSuggestion { get; set; }
        public GenericOptions UserEmail { get; set; }
        public GenericOptions UserView { get; set;}
    }
}
