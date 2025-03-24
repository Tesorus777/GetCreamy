using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCreamLibrary.DataLibrary.DataModels
{
    public class BaseModel
    {
        internal long Id { get; set; }
        internal DateOnly? InsertedDate { get; set; }
        internal DateOnly? UpdatedDate { get; set; }
        internal DateOnly? DeletedDate { get; set; }
    }
}
