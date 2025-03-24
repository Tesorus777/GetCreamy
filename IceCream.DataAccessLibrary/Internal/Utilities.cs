using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace IceCream.DataAccessLibrary.Internal
{
    public static class Utilities
    {
        #region String Extensions
        public static string Truncate(this string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length <= maxLength ? value : value.Substring(0, maxLength) + "...";
        }

        // Splice out any characters that do not match the provided regex pattern
        public static string RegexReplace(this string input, string pattern)
        {
            if (string.IsNullOrEmpty(input) || string.IsNullOrEmpty(pattern))
                return input;

            return Regex.Replace(input, $"[^{pattern}]", "");
        }
        #endregion String Extensions
    }
}
