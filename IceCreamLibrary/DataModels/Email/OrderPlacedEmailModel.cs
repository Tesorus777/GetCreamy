using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Email
{
    public class OrderPlacedEmailModel : EmailBaseModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid OrderUniqueId { get; set; }

        protected override void LoadBodyData(Dictionary<string, string> data)
        {
            data["FirstName"] = FirstName;
            data["LastName"] = LastName;
            data["OrderUniqueId"] = OrderUniqueId.ToString();
        }
    }
}