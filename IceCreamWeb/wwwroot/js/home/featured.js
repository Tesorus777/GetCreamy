// workflow
// 1) Get featured recipe elements
// 2) Get featured recipe
// 3) Populate featured recipe elements
// 4) Image
    // a) Make huge
    // b) Give filter (Blur? Lower opacity? Both? Another?)
        // give paralax? Zoom and/or pan on scroll and/or load? Do something fun eventually

// #region Module Imports

import { Importer } from "../infrastructure/importer.js";
import { RatingBuilder } from "../infrastructure/ratingBuilder.js";

// #endregion Module Imports

// #region Variables

let importer = new Importer("../lib/images/recipe", true);
let ratingBuilder = new RatingBuilder();

// DOM Elements
const featuredBody = querySelector("#HomeFeaturedBody");
const featuredImage = querySelector("#HomeFeaturedImage");
const featuredName = querySelector("#FeaturedName");
//const featuredRating = querySelector("#FeaturedRating"); // was a div
const featuredDescription = querySelector("#FeaturedDescription");

// Recipe
const featuredRecipe = featured[0]; // from ViewBag

// #endregion Variables

// #region Load Data

function LoadFeatured() {
    // Link
    featuredBody.href = `/Recipe/${featuredRecipe.Name}`;
    // Recipe Info
    featuredName.innerText = `Featured: ${featuredRecipe.Name}`;
    //ratingBuilder.Build(featuredRating, featuredRecipe.Rating);
    featuredDescription.innerText = featuredRecipe.Description;
}

function LoadImage() {
    let img = importer.Import(featuredRecipe.Photo).Object;
    featuredImage.append(img);
}

// #endregion Load Data

(() => {
    LoadFeatured();
    LoadImage();
})();