using IceCream.DataAccessLibrary.DataOptions.Recipe;

namespace IceCream.DataAccessLibrary.DataOptions
{
    public interface IGenericClassOptions<T>
    {
        string ConnectionString { get; set; }
        T Options { get; set; }
    }
}