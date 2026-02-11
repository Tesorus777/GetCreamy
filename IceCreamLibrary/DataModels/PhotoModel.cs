using IceCreamLibrary.DataLibrary.DataModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels
{
    public class PhotoModel : BaseModel
    {
        public string Folder { get; set; }
        public string FileName { get; set; }
        public string LowResFileName { get; set; }
        public string ThumbnailFileName { get; set; }
        public string AltText { get; set; }
        public int SortOrder { get; set; }

        public PhotoModel() {
            Folder = "Test";
            FileName = "test.png";
            AltText = string.Empty;
            SortOrder = 0;
        }
    }
}
