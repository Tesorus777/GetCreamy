using IceCream.DataAccessLibrary.DataOptions;
using IceCream.DataAccessLibrary.DataOptions.Recipe;
using IceCream.DataAccessLibrary.Internal;
using IceCream.DataAccessLibrary.Internal.Bundlers;
using IceCream.DataLibrary.DataModels;
using IceCream.DataLibrary.DataModels.Recipe;
using IceCream.DataLibrary.DataModels.Recipe.Bundle;
using Microsoft.Extensions.Options;
using System.Collections.Generic;
using System.Xml.Linq;

namespace IceCream.DataAccessLibrary.DataAccess
{
    public class RecipeData : IRecipeData
    {
        private readonly ISQLCaller _sqlCaller;
        private readonly RecipeDatabaseOptions _opt;
        
        public RecipeData(ISQLCaller sqlCaller, IOptions<RecipeDatabaseOptions> opt)
        {
            _sqlCaller = sqlCaller;
            _opt = opt.Value;
        }

        #region Recipe
        public List<RecipeModel> RecipeSelect(int startNum = 0, int num = 20)
        {
            List<RecipeModel> output = new();

            output = _sqlCaller.ExecuteDoubleSelect<RecipeModel, PhotoModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Id = startNum, Num = num },
                Command: _opt.Options.Recipe.Select,
                SplitOn: "PhotoId"
            );

            return output;
        }

        public List<RecipeModel> RecipeInsert(RecipeModel input)
        {
            List<RecipeModel> output = new();

            return output;
        }

        public List<RecipeModel> RecipeUpdate(RecipeModel input)
        {
            List<RecipeModel> output = new();

            return output;
        }

        public List<RecipeModel> RecipeDelete(RecipeModel input)
        {
            List<RecipeModel> output = new();

            return output;
        }

        public RecipeModel RecipeSelectOne(string Name)
        {
            RecipeModel output = new();

            output = _sqlCaller.ExecuteSelect<RecipeModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Name = Name },
                Command: _opt.Options.Recipe.Other["SelectOne"]
            ).First();

            return output;
        }

        public List<RecipePhotoModel> RecipePhotoSelectOne(string Name)
        {
            List<RecipePhotoModel> output = new();

            output = _sqlCaller.ExecuteSelect<RecipePhotoModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Name = Name },
                Command: _opt.Options.RecipePhotos.Other["SelectOne"]
            );

            return output;
        }

        public List<RecipePhotoModel> RecipePhotoSelectFirsts()
        {
            List<RecipePhotoModel> output = new();

            output = _sqlCaller.ExecuteSelect<RecipePhotoModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { },
                Command: _opt.Options.RecipePhotos.Other["SelectFirsts"]
            );

            return output;
        }

        public RecipeBundleModel RecipeSelectOneBundle(string Name)
        {
            RecipeBundleModel output = new();

            output = _sqlCaller.ExecuteSelectBundle<RecipeBundleModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Name = Name },
                Command: _opt.Options.Recipe.Other["SelectOneBundle"],
                Bundler: new RecipeBundler()
            );

            return output;
        }

        public List<RecipeModel> RecipeSelectFeatured()
        {
            List<RecipeModel> output = new();

            output = _sqlCaller.ExecuteDoubleSelect<RecipeModel, PhotoModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { },
                Command: _opt.Options.Recipe.Other["SelectOneRandom"],
                SplitOn: "PhotoId"
            );

            return output;
        }

        public List<TrendingRecipeModel> RecipeSelectTrending()
        {
            List<TrendingRecipeModel> output = new();

            output = _sqlCaller.ExecuteDoubleSelect<TrendingRecipeModel, PhotoModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { },
                Command: _opt.Options.Recipe.Other["Trending"],
                SplitOn: "PhotoId"
            );

            return output;
        }

        #endregion

        #region Ingredient
        public List<IngredientModel> IngredientSelect(RecipeModel input)
        {
            List<IngredientModel> output = new();

            output = _sqlCaller.ExecuteSelect<IngredientModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Name = input.Name },
                Command: _opt.Options.Ingredient.Select
            );

            return output;
        }

        public List<IngredientModel> IngredientInsert(IngredientModel input)
        {
            List<IngredientModel> output = new();

            return output;
        }

        public List<IngredientModel> IngredientUpdate(IngredientModel input)
        {
            List<IngredientModel> output = new();

            return output;
        }

        public List<IngredientModel> IngredientDelete(IngredientModel input)
        {
            List<IngredientModel> output = new();

            return output;
        }

        #endregion

        #region Step
        public List<StepModel> StepSelect(RecipeModel input)
        {
            List<StepModel> output = new();

            output = _sqlCaller.ExecuteSelect<StepModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Name = input.Name },
                Command: _opt.Options.Step.Select
            );

            return output;
        }

        public List<StepModel> StepInsert(StepModel input)
        {
            List<StepModel> output = new();

            return output;
        }

        public List<StepModel> StepUpdate(StepModel input)
        {
            List<StepModel> output = new();

            return output;
        }

        public List<StepModel> StepDelete(StepModel input)
        {
            List<StepModel> output = new();

            return output;
        }

        #endregion

        #region Notes

        public List<RecipeNotesModel> NoteSelect(RecipeModel input)
        {
            List<RecipeNotesModel> output = new();

            output = _sqlCaller.ExecuteSelect<RecipeNotesModel, dynamic>(
                ConnectionString: _opt.ConnectionString,
                Parameter: new { Name = input.Name },
                Command: _opt.Options.RecipeNote.Select
            );

            if (output.Count < 1)
            {
                RecipeNotesModel defaultOutput = new();
                defaultOutput.RecipeVersion = 1;
                output.Add(defaultOutput);
            }

            return output;
        }

        public List<RecipeNotesModel> NoteInsert(RecipeNotesModel input)
        {
            List<RecipeNotesModel> output = new();

            return output;
        }

        public List<RecipeNotesModel> NoteUpdate(RecipeNotesModel input)
        {
            List<RecipeNotesModel> output = new();

            return output;
        }

        public List<RecipeNotesModel> NoteDelete(RecipeNotesModel input)
        {
            List<RecipeNotesModel> output = new();

            return output;
        }

        #endregion
    }
}