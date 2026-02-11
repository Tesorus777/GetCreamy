using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public interface IRecipeData
    {
        List<IngredientModel> IngredientDelete(IngredientModel input);
        List<IngredientModel> IngredientInsert(IngredientModel input);
        List<IngredientModel> IngredientSelect(RecipeModel input);
        List<IngredientModel> IngredientUpdate(IngredientModel input);
        List<RecipeNotesModel> NoteDelete(RecipeNotesModel input);
        List<RecipeNotesModel> NoteInsert(RecipeNotesModel input);
        List<RecipeNotesModel> NoteSelect(RecipeModel input);
        List<RecipeNotesModel> NoteUpdate(RecipeNotesModel input);
        List<RecipeModel> RecipeDelete(RecipeModel input);
        List<RecipeModel> RecipeInsert(RecipeModel input);
        List<RecipePhotoModel> RecipePhotoSelectFirsts();
        List<RecipePhotoModel> RecipePhotoSelectOne(string Name);
        List<RecipeModel> RecipeSelect(int startNum = 0, int num = 20);
        RecipeModel RecipeSelectOne(string Name);
        RecipeBundleModel RecipeSelectOneBundle(string Name);
        List<RecipeModel> RecipeSelectFeatured();
        List<TrendingRecipeModel> RecipeSelectTrending();
        List<RecipeModel> RecipeUpdate(RecipeModel input);
        List<StepModel> StepDelete(StepModel input);
        List<StepModel> StepInsert(StepModel input);
        List<StepModel> StepSelect(RecipeModel input);
        List<StepModel> StepUpdate(StepModel input);
        List<InventoryModel> InventorySelectCurrentStock();
        List<InventoryModel> InventorySelectAllStock();
        List<InventoryModel> InventorySelectOneCurrentStock(string recipeName);
        List<InventoryModel> InventorySelectOrderItemsBulk(List<CartModel> cartContent);
        List<InventoryModel> InventoryDeleteOrderItemsBulk(List<CartModel> cartContent);
        List<InventoryModel> InventorySelectBulkCurrentStock(List<CartModel> cartContent);
        List<RecipePhotoModel> RecipePhotoSelectFirstsBulk(List<RecipeNameTypeModel> recipeNames);
    }
}