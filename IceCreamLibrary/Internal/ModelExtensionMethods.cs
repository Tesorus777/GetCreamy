using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IceCream.DataLibrary.Internal
{
    public static class ModelExtensionMethods
    {
        public static DataTable ToDataTable<T>(this List<T> data, string tableName)
        {
            DataTable output = new DataTable(tableName);

            // Default Case
            if (data == null || data.Count == 0)
            {
                return output;
            }

            // Add Properties to DataTable
            var properties = typeof(T).GetProperties();
            foreach (var property in properties)
            {
                output.Columns.Add(property.Name, Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType); 
            }

            // Add data rows to output
            foreach (var item in data)
            {
                DataRow row = output.NewRow();
                
                foreach(var property in properties)
                {
                    row[property.Name] = property.GetValue(item) ?? DBNull.Value;
                }

                output.Rows.Add(row);
            }

            return output;
        }
    }
}
