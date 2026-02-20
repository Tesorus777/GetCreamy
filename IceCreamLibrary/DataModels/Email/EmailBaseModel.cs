using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.DataModels.Email
{
    public abstract class EmailBaseModel
    {
        public string From { get; set; }
        public string To { get; set; }
        public string Bcc { get; set; }
        public string Cc { get; set; }
        public string Subject { get; set; }
        public string BodyTemplatePath { get; set; }

        // Wrapper properties
        public MailboxAddress FromAddress => MailboxAddress.Parse(From);
        public List<MailboxAddress> ToAddressList
        {
            get
            {
                if (string.IsNullOrWhiteSpace(To))
                {
                    return new List<MailboxAddress>();
                }

                return InternetAddressList.Parse(To).Cast<MailboxAddress>().ToList();
            }
        }
        public List<MailboxAddress> BccAddressList
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Bcc))
                {
                    return new List<MailboxAddress>();
                }

                return InternetAddressList.Parse(Bcc).Cast<MailboxAddress>().ToList();
            }
        }
        public List<MailboxAddress> CcAddressList
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Cc))
                {
                    return new List<MailboxAddress>();
                }

                return InternetAddressList.Parse(Cc).Cast<MailboxAddress>().ToList();
            }
        }

        private Dictionary<string, string> _data;

        public Dictionary<string, string> Data
        {
            get
            {
                if (_data == null)
                {
                    _data = new Dictionary<string, string>();
                    // Trigger the manual population defined in the child class
                    LoadBodyData(_data);
                }
                return _data;
            }
        }

        protected abstract void LoadBodyData(Dictionary<string, string> data);
    }
}
