// workflow
// 1) run a query to get the first viewNum (8) recipes
// 2) go through each and create 2 objects
//     a) need a back (Flavor name, rating [tbd if wanted], description)
//     b) need a front (picture)
// 3) load more button runs the card builder again
//     a) if more, load more
//     b) if no more, change to "Showing All"


// #region Module Imports

import { Importer } from "../js/infrastructure/importer.js";
//import { RatingBuilder } from "../js/infrastructure/ratingBuilder.js";

// #endregion

// Needs to do a few things:

// #region Variables

let importer = new Importer("../lib/images/recipe", true);
//let ratingBuilder = new RatingBuilder();
const recipeBody = querySelector(`#RecipeBody`);
const loadMoreButton = querySelector(`#RecipeLoadMoreButton`);
let recipeCalls = 0;
const viewNum = 8;
let totalCards = [];

const recipeListMobileHoverClass = "recipe-card-mobile-hover";

// #endregion Variables

// #region Event Listeners

loadMoreButton.addEventListener("click", LoadMoreRecipes);

// If the mobile user touches something that isn't a card, remove the mobile hover class
document.addEventListener("touchstart", (e) => {
    let touchedCard = totalCards.find(card => {
        return card == e.target.closest("a.recipe-card");
    });
    if (touchedCard === null || touchedCard === undefined) {
        totalCards.forEach(card => { card.classList.remove(recipeListMobileHoverClass) });
    }
})

// #endregion Event Listensers

async function RecipeCardBuilder(sortBy) {
    let recipeList = await API.Get(`IceCream/Recipe/${recipeCalls}/${viewNum}`);
    let cards = [];
    for await (const recipe of recipeList) {
        // Create front and rear cards
        let backCard = {
            tag: "div",
            classList: ["recipe-back"],
            children: [
                {
                    // Flavor
                    tag: "h3",
                    innerText: recipe.Name,
                    classList: ["recipe-flavor"]
                },
                {
                    // Description
                    tag: "div",
                    innerText: recipe.Description,
                    classList: ["recipe-description"]
                }
            ]
        }
        let frontCard = {
            tag: "div",
            classList: ["recipe-front"],
            childNodes: [importer.Import(recipe.Photo).Object]
        }
        // Create container card
        let containerCard = createElement({
            tag: "a",
            classList: ["recipe-card"],
            href: `/Recipe/${recipe.Name}`,
            children: [backCard, frontCard],
            events: [{
                type: "touchstart",
                handler: ((event) => {
                    totalCards.forEach(card => {
                        card.classList.remove(recipeListMobileHoverClass);
                    });
                    containerCard.classList.add(recipeListMobileHoverClass);
                })
            }]
        });
        // Append
        recipeBody.append(containerCard);
        cards.push(containerCard);
        totalCards.push(containerCard);

        // Increment recipe Calls
        recipeCalls++;
    }
    AnimateCardLoad(cards);
}

function AnimateCardLoad(cards) {
    // Add listener to card to play animation for next card on start
    for (let i = 1; i < cards.length; i++) {
        cards[i - 1].addEventListener("animationstart", (event) => {
            delay(75).then(() => {
                cards[i].classList.add("recipe-card-animate");
            });
        });
    }
    if (cards.length > 0) {
        cards[0].classList.add("recipe-card-animate");
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function LoadMoreRecipes() {
    // 1) Set temp recipe calls
    // 2) run recipe card builder
    // 3) check if recipe calls is greater than temp recipe calls
        // if yes, do nothing
        // if no, disable button, remove event listener, change button text
    const currentViewNum = recipeCalls;
    await RecipeCardBuilder();
    // if recipeCalls didn't change
    if (currentViewNum === recipeCalls) {
        loadMoreButton.disabled = true;
        loadMoreButton.removeEventListener("click", LoadMoreRecipes);
        loadMoreButton.innerText = "Showing All";
    }
}

(() => {
    RecipeCardBuilder();
})();