// #region Module Imports

import Carousel from "../js/infrastructure/importer.js";

// #endregion

// #region Variables

// From Viewbag
const recipe = recipeBundle.Recipe;
const ingredients = recipeBundle.Ingredients;
const steps = recipeBundle.Steps;
const photos = recipeBundle.Photos;
const notes = recipeBundle.Notes;

// Image Carousel
let imageCarousel = new Carousel("../lib/images/recipe", photos, `div#RecipeImageContainer`, true, true);

// From html
const recipeNameLocation = querySelector("#RecipeName");
const recipeDescriptionLocation = querySelector("#RecipeDescription");

const ingredientsLocation = querySelector("#RecipeIngredients");
const stepsLocation = querySelector("#RecipeSteps");
let notesLocation = querySelector("#RecipeNotes");

// #endregion Variables

// #region Event Listeners

document.addEventListener("storageLoaded", (e) => {
    // Want to only send view if coming from other page (not back, not forward, not refresh)
    const viewType = performance.getEntriesByType("navigation")[0].type;
    if (viewType === "navigate") {
        // Send View
        let view = {
            UserId: UserStorage.Cookie["UserId"],
            RecipeName: recipe.Name
        }
        API.Post("UserInfo/View", view);
    }
});

// #endregion

function LoadRecipeInfo() {
    // Recipe
    recipeNameLocation.innerText = recipe.Name;
    recipeDescriptionLocation.innerText = recipe.Description;
    // Ingredients
    ingredients.forEach(ingredient => {
        // Create Objects
        let ingredientItem = document.createElement("li");
        let quantitySpan = document.createElement("span");
        let nameSpan = document.createElement("span");
        // Set Classes
        ingredientItem.classList.add("recipe-single-ingredient");
        // Set Info
        quantitySpan.innerText = ingredient.Quantity;
        nameSpan.innerText = ingredient.Text;
        // Append
        ingredientItem.append(quantitySpan, nameSpan);
        ingredientsLocation.append(ingredientItem);
    });
    // Steps
    steps.forEach(step => {
        // Create Objects
        let stepItem = document.createElement("li");
        // Set Classes
        stepItem.classList.add("recipe-single-step");
        // Set Info
        stepItem.innerText = step.Text;
        // Append
        stepsLocation.append(stepItem);
    });
    // Notes
    notes.forEach(note => {
        // Create Objects
        let noteItem = document.createElement("li");
        let noteBody = document.createElement("p");
        let noteLabel = document.createElement("span");
        // Set Classes
        noteItem.classList.add("recipe-single-note");
        // Set Info
        noteLabel.innerText = `V${note.RecipeVersion}`;
        noteBody.innerText = note.Note;
        // Append
        noteBody.prepend(noteLabel);
        noteItem.append(noteBody);
        notesLocation.append(noteItem);
    });
}

(() => {
    LoadRecipeInfo();
})();