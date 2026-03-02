using IceCream.DataLibrary.DataModels.Email;
using IceCreamEmail.OptionsClasses;

namespace IceCreamEmail.DataAccess
{
    public interface IEmailSender
    {
        Task SendEmail<T, U>(string siteBaseUrl, T mailAccount, U email)
            where T : IGenericMailOptions
            where U : EmailBaseModel;
        Task SendEmailBulk<T, U>(string siteBaseUrl, T mailAccount, List<U> emailList)
            where T : IGenericMailOptions
            where U : EmailBaseModel;
    }
}