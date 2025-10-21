using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class OrderReferralModel : BaseModel
    {
        public string Text { get; set; }
        public decimal DiscountPercent { get; set; }
    }
}
