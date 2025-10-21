using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class OrderModel : UserModel
    {
        public string ReferralText { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal? Tax { get; set; }
        public decimal? Delivery { get; set; }
        public string PaymentMethod { get; set; }
        public string AddressOne { get; set; }
        public string AddressTwo { get; set; }
        public string AddressThree { get; set; }
        public string City { get; set; }
        public string Zipcode { get; set; }
        public bool? Fulfilled { get; set; }
        public string Note { get; set; }
    }
}
