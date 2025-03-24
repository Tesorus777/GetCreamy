using Microsoft.Extensions.Configuration;
using Dapper;
using System.Data;
//using System.Data.SqlClient;
using Microsoft.Data.SqlClient;
using static Dapper.SqlMapper;
using IceCream.DataAccessLibrary.Internal.Bundlers;
using System.Xml;
using Microsoft.Extensions.Logging;

namespace IceCream.DataAccessLibrary.Internal
{
    public class SQLCaller : ISQLCaller
    {
        private readonly IConfiguration _connection;
        private readonly ILogger<SQLCaller> _logger;

        public SQLCaller(IConfiguration connection, ILogger<SQLCaller> logger)
        {
            _connection = connection;
            _logger = logger;
        }

        public List<T> ExecuteSelect<T, U>(string ConnectionString, U Parameter, string Command)
        {
            List<T> output = new();
            using IDbConnection conn = new SqlConnection(_connection.GetConnectionString(ConnectionString));
            try
            {
                output = conn.Query<T>(
                    sql: Command,
                    param: Parameter,
                    commandType: CommandType.StoredProcedure
                ).ToList();
                return output;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ExecuteSelect");
                return new List<T>();
            }
        }

        public List<T> ExecuteDoubleSelect<T, S, U>(string ConnectionString, U Parameter, string Command, string SplitOn)
        {
            List<T> output = new();
            using IDbConnection conn = new SqlConnection(_connection.GetConnectionString(ConnectionString));
            try
            {
                output = conn.Query<T, S, T>(
                    sql: Command,
                    param: Parameter,
                    map: (firstModel, secondModel) =>
                    {
                        // Get the type of S
                        var sType = typeof(S);

                        // Find the first property in T that is of type S
                        var sPropertyInT = typeof(T).GetProperties()
                            .FirstOrDefault(p => p.PropertyType == sType);

                        if (sPropertyInT != null)
                        {
                            // Set the value of the property in T
                            sPropertyInT.SetValue(firstModel, secondModel);
                        }

                        return firstModel;
                    },
                    splitOn: SplitOn,
                    commandType: CommandType.StoredProcedure
                ).ToList();   
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ExecuteSelect");
            }
            return output;
        }

        public T ExecuteSelectBundle<T, U>(string ConnectionString, U Parameter, string Command, IBundler Bundler)
        {
            GridReader multiOutput;
            var output = Bundler;
            // Must do this because IBundler is an interface.
            // Setting output to this allows for a specific BundleClass to be passed in
            using IDbConnection conn = new SqlConnection(_connection.GetConnectionString(ConnectionString));
            try
            {
                multiOutput = conn.QueryMultiple(
                    sql: Command,
                    param: Parameter,
                    commandType: CommandType.StoredProcedure
                );
                output.BundleClass(multiOutput); // running the BundleClass function sets output.Bundled.Properties to the values
                return (T)output.Bundled; // return output explicitly cast as type (T). output.Bundled returns a bundled Model, but not explicitly (it's an object)
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ExecuteSelect");
                return (T)output.Bundled;
            }

        }

        public void Execute<U>(string ConnectionString, U Parameter, string Command)
        {
            using IDbConnection conn = new SqlConnection(_connection.GetConnectionString(ConnectionString));
            try
            {
                conn.Query(
                    sql: Command,
                    param: Parameter,
                    commandType: CommandType.StoredProcedure
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to ExecuteSelect");
            }
        }

    }
}
