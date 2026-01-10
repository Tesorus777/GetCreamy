// workflow
// 1) get trending recipe elements
// 2) get trending recipes
// 3) populate trending recipe elements

// #region Module Imports
import { MenuList } from "../infrastructure/importer.js";
import { RatingBuilder } from "../infrastructure/ratingBuilder.js";
// #endregion Module Imports

// #region Variables

let menuList = new MenuList("../lib/images/recipe", "div#HomeTrending");
let ratingBuilder = new RatingBuilder();

// AutoScroll
const trendingAutoHoverClass = "home-trending-auto-hover";
const trendingMobileHoverClass = "home-trending-mobile-hover";
let autoScrollId;
let autoScrollRunning = false;
let autoScrollTimer = 4 * 1000; // 5 seconds

// #endregion Variables

async function LoadTrending() {
    let trendingRecipes = trending;
    trendingRecipes.forEach(r => {
        // Build Trending Recipe Menu text object
        r.Item = BuildMenuObject(r);
    });
    menuList.Build(trendingRecipes);
    menuList.MenuItems[0].Item.classList.add(trendingAutoHoverClass);
    menuList.MenuItems.forEach(recipeItem => {
        recipeItem.Item.addEventListener("mouseover", PauseAutoScroll);
        recipeItem.Item.addEventListener("touchstart", () => {
            // 1) Pause auto scroll
            PauseAutoScroll();
            // 2) Remove all mobile hover class
            menuList.MenuItems.forEach(rItem => {
                rItem.Item.classList.remove(trendingMobileHoverClass);
                menuList.HoverImage(rItem.ImageItem);
            });
            // 3) Add new mobile hover class
            recipeItem.Item.classList.add(trendingMobileHoverClass);
            // 4) Add image hover class
            menuList.HoverImage(recipeItem.ImageItem, true);
        });
    });
}

function BuildMenuObject(recipe) {
    let container = createElement({
        tag: "a",
        href: `/Recipe/${recipe.Name}`,
        classList: ["home-trending-recipe"],
        children: [
            {
                // Name
                tag: "h3",
                innerText: recipe.Name,
                classList: ["home-trending-recipe-name"]
            }//,
            //{
            //    // Rating
            //    tag: "div",
            //    innerHTML: "", // was previously made by a deprecated function
            //    classList: ["home-trending-recipe-rating"]
            //},
            //{
            //    // Description
            //    tag: "div",
            //    innerText: recipe.Description,
            //    classList: ["home-trending-recipe-description"]
            //}
        ]
    });
    // Return
    return container;
}

// #region Auto Scroll Functions

function NextItemSelect() {
    // 1) Get current and next index
    let currentIndex = menuList.MenuItems.findIndex((recipeItem) => {
        return recipeItem.Item.classList.contains(trendingAutoHoverClass);
    });
    let nextIndex = currentIndex === (menuList.MenuItems.length - 1) ? 0 : currentIndex + 1;
    // 2) Remove current
    menuList.MenuItems[currentIndex].Item.classList.remove(trendingAutoHoverClass);
    menuList.HoverImage(menuList.MenuItems[currentIndex].ImageItem);
    // 3) Set next
    menuList.MenuItems[nextIndex].Item.classList.add(trendingAutoHoverClass);
    menuList.HoverImage(menuList.MenuItems[nextIndex].ImageItem, true);
}

function StartAutoScroll() {
    if (!autoScrollRunning) {
        autoScrollId = RunAutoScroll();
        autoScrollRunning = true;
    }
}

function RunAutoScroll() {
    const autoScrollId = setInterval(() => {
        NextItemSelect();
    }, autoScrollTimer);
    return autoScrollId;
}

function PauseAutoScroll() {
    if (autoScrollRunning) {
        autoScrollRunning = false;
        clearInterval(autoScrollId);
        menuList.MenuItems.forEach(recipeItem => {
            recipeItem.Item.classList.remove(trendingAutoHoverClass);
        });
    }
}

// #endregion Auto Scroll Functions

(async () => {
    await LoadTrending();
    StartAutoScroll();
})();