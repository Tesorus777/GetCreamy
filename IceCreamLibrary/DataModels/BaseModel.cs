using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace IceCreamLibrary.DataLibrary.DataModels
{
    public class BaseModel
    {
        [Newtonsoft.Json.JsonIgnore]
        public long Id { get; set; }
        internal DateOnly? InsertedDate { get; set; }
        internal DateOnly? UpdatedDate { get; set; }
        internal DateOnly? DeletedDate { get; set; }
    }
}
