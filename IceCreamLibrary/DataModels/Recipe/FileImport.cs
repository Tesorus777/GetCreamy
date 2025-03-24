using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Recipe
{
    public class FileImport : BaseModel
    {
        public string FileFolder { get; set; }
        public string FileName { get; set; }
        public string FileExtension { get; set; }
        public string FileLink { get; set; }
    }
}
