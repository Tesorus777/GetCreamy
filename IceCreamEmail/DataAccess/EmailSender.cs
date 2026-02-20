using HandlebarsDotNet;
using IceCream.DataLibrary.DataModels.Email;
using IceCreamEmail.OptionsClasses;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.Extensions.Logging;
using MimeKit;
using Org.BouncyCastle.Tls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCreamEmail.DataAccess
{
    public class EmailSender : IEmailSender
    {
        private readonly ILogger<EmailSender> _logger;

        public EmailSender(ILogger<EmailSender> logger)
        {
            _logger = logger;
        }

        public Task SendEmail<T, U>(string siteBaseUrl, T mailAccount, U email)
            where T : IGenericMailOptions
            where U : EmailBaseModel
        {
            MimeMessage message = new();
            message.From.Add(email.FromAddress);
            message.To.AddRange(email.ToAddressList);
            message.Bcc.AddRange(email.BccAddressList);
            message.Cc.AddRange(email.CcAddressList);
            message.Subject = email.Subject;

            // Message Body and Attachments
            BodyBuilder builder = new();
            var template = Handlebars.Compile(File.ReadAllText($"../../../{email.BodyTemplatePath}"));// check this => might need to be "../{templatePath}"
            builder.HtmlBody = template(email.Data);
            //email.AttachmentFilePathList.ForEach(attachment =>
            //{
            //    builder.Attachments.Add(attachment);
            //});
            message.Body = builder.ToMessageBody();

            // Send 
            try
            {
                using SmtpClient client = new();
                client.Connect(mailAccount.Host, mailAccount.Port, mailAccount.Ssl);
                client.Authenticate(mailAccount.Login.Username, mailAccount.Login.Password);
                client.Send(message); // enable after testing
                client.Disconnect(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send mail");
            }

            return Task.CompletedTask;
        }

        public Task SendEmailBulk<T, U>(string siteBaseUrl, T mailAccount, List<U> emailList)
            where T : IGenericMailOptions
            where U : EmailBaseModel
        {
            using SmtpClient client = new();
            try
            {
                // Establish connection
                client.Connect(mailAccount.Host, mailAccount.Port, mailAccount.Ssl);
                client.Authenticate(mailAccount.Login.Username, mailAccount.Login.Password);
                // Build message and send
                foreach (U email in emailList)
                {
                    MimeMessage message = new MimeMessage();
                    message.From.Add(email.FromAddress);
                    message.To.AddRange(email.ToAddressList);
                    message.Bcc.AddRange(email.BccAddressList);
                    message.Cc.AddRange(email.CcAddressList);
                    message.Subject = email.Subject;

                    // Message Body and Attachments
                    BodyBuilder builder = new();
                    var template = Handlebars.Compile(File.ReadAllText($"../../../{email.BodyTemplatePath}"));
                    email.Data["SiteBaseUrl"] = siteBaseUrl;
                    builder.HtmlBody = template(email.Data);
                    //email.AttachmentFilePathList.ForEach(attachment =>
                    //{
                    //    builder.Attachments.Add(attachment);
                    //});
                    message.Body = builder.ToMessageBody();

                    client.Send(message);
                }
                // Close connection
                client.Disconnect(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send mail");
            }

            return Task.CompletedTask;
        }
    }
}
