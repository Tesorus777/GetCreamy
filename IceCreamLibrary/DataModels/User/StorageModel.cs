using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.User
{
    public class StorageModel : BaseModel
    {
        public int Type { get; set; }
        private bool Required { get; set; }
        public string Name { get; set; }
        public string ValueName { get; set; }
        public string ValueEndpoint { get; set; }
        public int? Duration { get; set; }
        private string? Description { get; set; }
    }
}
