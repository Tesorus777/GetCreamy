using IceCream.DataAccessLibrary.Internal.Bundlers;

namespace IceCream.DataAccessLibrary.Internal
{
    public interface ISQLCaller
    {
        void Execute<U>(string ConnectionString, U Parameter, string Command);
        List<T> ExecuteDoubleSelect<T, S, U>(string ConnectionString, U Parameter, string Command, string SplitOn);
        List<T> ExecuteSelect<T, U>(string ConnectionString, U Parameter, string Command);
        T ExecuteSelectBundle<T, U>(string ConnectionString, U Parameter, string Command, IBundler Bundler);
    }
}