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
const inventory = recipeBundle.Inventory;

// Pricing
const numberWords = { "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine" };
const pint = inventory.filter(i => i.PintorQuart == 0)[0];
const quart = inventory.filter(i => i.PintorQuart == 1)[0];
// if > 20 => "in stock"
// if > 0 => "number available"
// if 0 => out of stock
const [pintDisplayPrice, maxPintInput, pintEnable] = FormatPrice(pint);
const [quartDisplayPrice, maxQuartInput, quartEnable] = FormatPrice(quart);

// Image Carousel
let imageCarousel = new Carousel("../lib/images/recipe", photos, `div#RecipeImageContainer`, true, true);

// From html
// Recipe Block
const recipeNameLocation = querySelector("#RecipeName");
const recipeDescriptionLocation = querySelector("#RecipeDescription");
const recipePintStock = querySelector("#RecipePintStock");
const recipeQuartStock = querySelector("#RecipeQuartStock");
// Add to Cart
const pintMinus = querySelector("#PintAddMinus");
const pintInput = querySelector("#PintAddInput");
const pintPlus = querySelector("#PintAddPlus");
const pintAddToCart = querySelector("#PintAddToCartButton");
const quartMinus = querySelector("#QuartAddMinus");
const quartInput = querySelector("#QuartAddInput");
const quartPlus = querySelector("#QuartAddPlus");
const quartAddToCart = querySelector("#QuartAddToCartButton");``
// Other Blocks
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
        API.Post("User/View", view);
    }
});

pintMinus.addEventListener("click", () => {
    if (pintInput.value > 1) {
        pintInput.value--;
    }
});
pintPlus.addEventListener("click", () => {
    if (pintInput.value < maxPintInput) {
        pintInput.value++;
    }
});
pintAddToCart.addEventListener("click", () => {
    AddToCart(Number(pintInput.value), 0);
});
quartMinus.addEventListener("click", () => {
    if (quartInput.value > 1) {
        quartInput.value--;
    }
});
quartPlus.addEventListener("click", () => {
    if (quartInput.value < maxQuartInput) {
        quartInput.value++;
    }
});
quartAddToCart.addEventListener("click", () => {
    AddToCart(0, Number(quartInput.value));
});

// #endregion

function LoadRecipeInfo() {
    // Recipe
    recipeNameLocation.innerText = recipe.Name;
    recipeDescriptionLocation.innerText = recipe.Description;
    // Recipe cart inputs
    // Pint
    recipePintStock.innerText = `Pints:\t${pintDisplayPrice}`;
    pintInput.max = maxPintInput;
    pintMinus.disabled = !pintEnable;
    pintInput.disabled = !pintEnable;
    pintPlus.disabled = !pintEnable;
    pintAddToCart.disabled = !pintEnable;
    // Quart
    recipeQuartStock.innerText = `Quarts:\t${quartDisplayPrice}`;
    quartInput.max = maxQuartInput;
    quartMinus.disabled = !quartEnable;
    quartInput.disabled = !quartEnable;
    quartPlus.disabled = !quartEnable;
    quartAddToCart.disabled = !quartEnable;

    // Ingredients
    ingredients.forEach(ingredient => {
        // Create Objects
        let ingredientItem = document.createElement("li");
        let checkbox = document.createElement("input");
        let quantitySpan = document.createElement("span");
        let nameSpan = document.createElement("span");
        // Set Checkbox values
        checkbox.type = "checkbox";
        checkbox.name = ingredient.Text;
        // Set Classes
        checkbox.classList.add("recipe-single-checkbox");
        ingredientItem.classList.add("recipe-single-ingredient");
        // Set Info
        quantitySpan.append(checkbox, `${ingredient.Quantity} ${ingredient.QuantityUnit}`);
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

function FormatPrice(input) {
    let displayText = "";
    let maxPurchaseInput = 0;
    let enable = true;
    if (input.Stock === "out of stock") {
        displayText = input.Stock;
        maxPurchaseInput = 0;
        enable = false;
    } else if (input.Stock === "in stock") {
        displayText = `$${input.Price} each`;
        maxPurchaseInput = 20;
    } else {
        displayText = `$${input.Price} each, ${input.Stock.replace(input.Stock.split(" ")[0], numberWords[input.Stock.split(" ")[0]])}`;
        maxPurchaseInput = Number(input.Stock.split(" ")[0]);
    }
    return [displayText, maxPurchaseInput, enable];
}

function AddToCart(pints = 0, quarts = 0) {
    // Only add to cart what is allowed => inventory - cart = allowed
    let allowedPints = maxPintInput - Cart.GetPintsByFlavor(recipe.Name);
    let allowedQuarts = maxQuartInput - Cart.GetQuartsByFlavor(recipe.Name);
    // Calculate how many pints/quarts can be added
    let pintsToAdd = allowedPints > pints ? pints : allowedPints;
    let quartsToAdd = allowedQuarts > quarts ? quarts : allowedQuarts;
    // Add to cart
    Cart.AddToOrder(recipe.Name, pintsToAdd, quartsToAdd);
}

(() => {
    LoadRecipeInfo();
})();