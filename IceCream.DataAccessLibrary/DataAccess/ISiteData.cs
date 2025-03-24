using IceCream.DataLibrary.DataModels.Site;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public interface ISiteData
    {
        List<UpcomingProjectModel> UpcomingProjectSelect();
    }
}