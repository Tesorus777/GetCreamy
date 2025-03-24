using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Site
{
    public class UpcomingProjectModel : BaseModel
    {
        public string Name { get; set; }
        public string? Description { get; set; }

    }
}
