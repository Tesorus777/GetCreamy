// #region Module Imports

import { Importer, MenuList } from "../infrastructure/importer.js";
//import { RatingBuilder } from "./infrastructure/ratingBuilder.js";

// #endregion Module Imports

// #region Variables

// #region Featured
// workflow
// 1) Get featured recipe elements
// 2) Get featured recipe
// 3) Populate featured recipe elements
// 4) Image
    // a) Make huge
    // b) Give filter (Blur? Lower opacity? Both? Another?)
        // give paralax? Zoom and/or pan on scroll and/or load? Do something fun eventually

let importer = new Importer("../lib/images/recipe", true);
//let ratingBuilder = new RatingBuilder();

// DOM Elements
const featuredBody = querySelector("#HomeFeaturedBody");
const featuredImage = querySelector("#HomeFeaturedImage");
const featuredName = querySelector("#FeaturedName");
//const featuredRating = querySelector("#FeaturedRating"); // was a div
const featuredDescription = querySelector("#FeaturedDescription");
// Recipe
const featuredRecipe = featured[0]; // from ViewBag
// #endregion

// #region Trending
// workflow
// 1) get trending recipe elements
// 2) get trending recipes
// 3) populate trending recipe elements

let menuList = new MenuList("../lib/images/recipe", "div#HomeTrending");
//let ratingBuilder = new RatingBuilder();

// AutoScroll
const trendingAutoHoverClass = "home-trending-auto-hover";
const trendingMobileHoverClass = "home-trending-mobile-hover";
let autoScrollId;
let autoScrollRunning = false;
let autoScrollTimer = 4 * 1000; // 5 seconds
// #endregion

// #region Suggestion
// workflow
// 1) get info from suggestion box
    // a) verify human input via pattern checking (non-required fields must match pattern if filled)
        // i) Must reset setCustomValidity in invalid functions: with message, will report invalid again where message can be reset
    // b) validate input (eg: can't ask for marketing/followup email without an email)
// 2) send to suggestion post api
// 3) clear form upon successful post (don't clear if unsuccessful so user can try again)
    // a) send thank you message

const suggestionForm = querySelector("#SuggestionForm");
const suggestionInputs = querySelectorAll(`form#SuggestionForm input:not([type="submit"]), form#SuggestionForm textarea`);
const suggestionTextAreaCount = querySelector(`#SuggestionDescriptionCount`);
const suggestionSubmit = querySelector(`form#SuggestionForm input[type="submit"]`);
const suggestionToast = querySelector(`div#SuggestionToast`);
const suggestionLoad = querySelector(`div#SuggestionLoad`);

const invalidAttribute = "invalid-text";
let suggestionInterval;

let previousSuggestion = {};
// #endregion

// #region Blog
// workflow
// 1) Get blog element
// 2) Get upcoming projects
// 3) Populate blog element with upcoming project data

// DOM Elements
const blogBody = querySelector(`#BlogBody`);
// Blog data
const blogData = blog;
// #endregion

// #endregion Variables

// #region EventListeners

// #region Suggestion
suggestionInputs.forEach(input => {
    input.addEventListener("invalid", () => {
        //console.log(input.validity);
        //console.log(input.validity.valueMissing, input.validity.patternMismatch, input.validity.typeMismatch, input.validity.tooLong);
        // An invalid input will always add the correct custom validity text, but it won't be shown until reportValidity() on submit
        if (input.validity.valueMissing || input.validity.patternMismatch || input.validity.typeMismatch || input.validity.tooLong) {
            input.setCustomValidity(input.getAttribute(invalidAttribute));
            input.classList.add("invalid");
        } else {
            input.setCustomValidity("");
            input.classList.remove("invalid");
        }
    });
});


// FirstName
//suggestionInputs[0].addEventListener("invalid", () => {
//    if (!suggestionInputs[0].validity.valueMissing && suggestionInputs[0].validity.patternMismatch) {
//        suggestionInputs[0].setCustomValidity("Please only use letters and keep it under 50 characters long");
//    } else if (suggestionInputs[0].validity.valueMissing) {
//        suggestionInputs[0].setCustomValidity("Please enter your first name");
//    } else {
//        suggestionInputs[0].setCustomValidity("");
//    }
//});
// LastName
//suggestionInputs[1].addEventListener("invalid", () => {
//    if (!suggestionInputs[1].validity.valueMissing && (suggestionInputs[1].validity.patternMismatch || suggestionInputs[1].validity.toolong)) {
//        suggestionInputs[1].setCustomValidity("Please only use letters and keep it under 50 characters");
//    } else {
//        suggestionInputs[1].setCustomValidity("");
//    }
//});
// Telephone
//suggestionInputs[2].addEventListener("invalid", () => {
//    if (!suggestionInputs[2].validity.valueMissing && !suggestionInputs[2].validity.patternMismatch) {
//        suggestionInputs[2].setCustomValidity("Please enter a valid phone number");
//    } else {
//        suggestionInputs[2].setCustomValidity("");
//    }
//});
// Email
//suggestionInputs[3].addEventListener("invalid", () => {
//    // Check against HTML built in pattern
//    if (suggestionInputs[3].validity.patternMismatch) {
//        suggestionInputs[3].setCustomValidity("Please enter a valid email adderss");
//    } else {
//        suggestionInputs[3].setCustomValidity("");
//    }
//});
// Flavor
//suggestionInputs[4].addEventListener("invalid", () => {
//    if (!suggestionInputs[4].validity.valueMissing && suggestionInputs[4].validity.patternMismatch) {
//        suggestionInputs[4].setCustomValidity("Please only use letters and keep it under 50 characters");
//    } else if (suggestionInputs[4].validity.valueMissing) {
//        suggestionInputs[4].setCustomValidity("Please give your flavor a name");
//    } else {
//        suggestionInputs[4].setCustomValidity("");
//    }
//});

// Description
suggestionInputs[5].addEventListener("input", UpdateDescriptionLength);
//suggestionInputs[5].addEventListener("invalid", () => {
//    if (suggestionInputs[5].validity.toolong) {
//        suggestionInputs[5].setCustomValidity("Please keep it under 2500 characters");
//    } else {
//        suggestionInputs[5].setCustomValidity("");
//    }
//});

// Marketing
suggestionInputs[6].addEventListener("change", () => {
    // If marketing requested, email required
    if (suggestionInputs[6].checked) {
        suggestionInputs[3].required = true;
    } else {
        suggestionInputs[3].required = false;
    }
});

// Submit (button or enter)
suggestionForm.addEventListener("submit", SubmitFormEventListener);
suggestionSubmit.addEventListener("click", () => {
    suggestionForm.dispatchEvent(new Event("submit"));
});
// #endregion

// #endregion Event Listeners

// #region Featured
function LoadFeatured() {
    // Link
    featuredBody.href = `/Flavor/${featuredRecipe.Name}`;
    // Recipe Info
    featuredName.innerText = `Featured: ${featuredRecipe.Name}`;
    //ratingBuilder.Build(featuredRating, featuredRecipe.Rating);
    featuredDescription.innerText = featuredRecipe.Description;
    // Image
    featuredImage.append(importer.Import(featuredRecipe.Photo).Object);
}

// #endregion Featured

// #region Trending

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
        href: `/Flavor/${recipe.Name}`,
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

// #endregion Trending

// #region Suggestion
// ToDo: consider changing Telephone to ConfirmEmail
function UpdateDescriptionLength() {
    // Updates description character count
    suggestionTextAreaCount.innerText = suggestionInputs[5].value.length;
}

function SubmitFormEventListener(event) {
    event.preventDefault(); // Prevents page reload
    // 1) Always clear the interval (to prevent spam)
    clearInterval(suggestionInterval);
    // 2) Double check: checkValidity() fires invalid event if form not valid
    suggestionInputs.forEach(input => {
        // An input to correct a bad field will fire an invalid event. If the field becomes valid, it will stop reporting invalid
        input.addEventListener("input", () => {
            input.dispatchEvent(new Event("invalid"));
        });
    }, { once: true });

    if (suggestionForm.reportValidity()) {
        suggestionLoad.classList.add("active");
        suggestionSubmit.disabled = true;
        // Set an interval
        suggestionInterval = createInterval(SubmitForm, 1.5);
    }
}

async function SubmitForm() {
    // Build suggestion
    let suggestion = {};
    suggestion.UserId = UserStorage.Cookie.UserId;
    suggestion.FirstName = suggestionInputs[0].value;
    suggestion.LastName = suggestionInputs[1].value;
    suggestion.Telephone = suggestionInputs[2].value;
    suggestion.Email = suggestionInputs[3].value;
    suggestion.Suggestion = suggestionInputs[4].value;
    suggestion.Notes = suggestionInputs[5].value;
    suggestion.MailingList = suggestionInputs[6].checked;
    // Submit suggestion
    // Dummy check to ensure button is not spammed without suggestion changing
    if (suggestion.Suggestion.toLower() !== previousSuggestion.Suggestion.toLower()) {
        await API.Post("User/Suggestion", suggestion).then(response => {
            previousSuggestion = suggestion;
            suggestionLoad.classList.remove("active");
            suggestionSubmit.disabled = false;
            // 5) Toast Pop-up
            suggestionToast.classList.add("suggestion-toast-popped");
        });
    }
}
// #endregion Suggestion

// #region Blog
function LoadBlog() {
    for (const project of blogData) {
        blogBody.append(createElement({
            tag: "div",
            classList: ["home-blog-project-container"],
            children: [
                {
                    tag: "h3",
                    innerText: project.Name,
                    classList: ["home-blog-name"]
                },
                {
                    tag: "p",
                    innerHTML: project.Description,
                    classList: ["home-blog-description"]
                }
            ]
        }));
    };
};
// #endregion Blog

(async () => {
    // Featured
    LoadFeatured();
    // Trending
    await LoadTrending();
    StartAutoScroll();
    // Blog
    LoadBlog();
})();