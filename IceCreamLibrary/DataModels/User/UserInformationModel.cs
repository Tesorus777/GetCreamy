using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class UserInformationModel : UserModel
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Telephone { get; set; }
        private bool? AllowInfused { get; set; }
        public bool MailingList { get; set; }
        public UserInformationModel()
        {
            AllowInfused = false;
        }
        public void Normalize()
        {
            // to-do:
            // 1) verify all values follow regex
            // 2) find references to model and call method where appropriate
            Telephone = new string(Telephone.Where(char.IsDigit).ToArray());
            //Telephone = Regex.Replace(Telephone, @"[()\- \s]", "").Substring(0, 15);
        }
    }
}
