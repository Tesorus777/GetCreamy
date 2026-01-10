// #region Imports

import { APIFetcher, StorageClass } from "./startupFactory.js";
import { ShoppingCart } from "./cart.js";

// #endregion Imports

// #region Variables
let baseUrl = window.envVar.baseUrl;

// #region SelectorFunctions

//const querySelector = (selector) => document.querySelector(selector);
//const querySelectorAll = (selector) => Array.from(document.querySelectorAll(selector));

window.querySelector = (selector) => document.querySelector(selector);
window.querySelectorAll = (selector) => Array.from(document.querySelectorAll(selector));
window.createElement = (obj) => {
    // Recursive: will create a dom object and attach it to the parent for every child
    const excludeFields = ["tag", "tagNS", "viewBox", "classList", "innerText", "disabled", "children", "childNodes", "events", "prepend"]; // fields that do not have attributes
    let domObject;
    // Check if NS or regular element
    if ("tagNS" in obj) {
        domObject = document.createElementNS(`http://www.w3.org/2000/${obj.tagNS}`, obj.tagNS);
        domObject.setAttribute("viewBox", obj.viewBox);
    } else {
        domObject = document.createElement(obj.tag);
    }
    // Add classList
    if (obj.classList != undefined) {
        domObject.classList.add(...obj.classList.filter(c => typeof c === "string" && c.trim()));
    };
    // Add innerText
    if (obj.innerText != undefined) {
        domObject.innerText = obj.innerText;
    };
    // Add innerHTML
    if (obj.innerHTML != undefined) {
        domObject.innerHTML = obj.innerHTML;
    }
    // Disabled
    if (obj.disabled != undefined) {
        domObject.disabled = obj.disabled;
    }
    // Set an attribute for everything not in the excluded fields (i.e. have attributes)
    Object.keys(obj).filter(key => !excludeFields.includes(key)).forEach(key => {
        domObject.setAttribute(key, obj[key]);
    });
    // If there are events to be added, add them
    if (obj.events != undefined) {
        obj.events.forEach((event) => {
            domObject.addEventListener(
                event.type,
                event.handler,
                {
                    capture: event.capture != undefined ? event.capture : false,
                    once: event.once != undefined ? event.once : false,
                    passive: event.passive != undefined ? event.passive : ["wheel", "mousewheel", "touchstart", "touchmove"].includes(event.type) ? true : false
                    // not including signal due to complication and lack of potential use
                }
            );
        });
    };
    // If there are child nodes, append them
    if (obj.childNodes != undefined) {
        obj.childNodes.forEach(childNode => {
            domObject.append(childNode);
        });
    };
    // If there are children elements, build them
    if (obj.children != undefined) {
        obj.children.forEach(child => {
            if (obj.prepend === true) {
                domObject.prepend(createElement(child));
            } else {
                domObject.append(createElement(child));
            }
        });
    };
    // Return
    return domObject;
};

// #endregion SelectorFunctions

// #endregion Variables

const API = new APIFetcher(baseUrl);
const UserStorage = new StorageClass(baseUrl);
const Cart = new ShoppingCart(UserStorage.Cookie.UserId);

// #region Set Global Scope

//window.querySelector = querySelector;
//window.querySelectorAll = querySelectorAll;
window.API = API;
window.UserStorage = UserStorage;
window.Cart = Cart;

// #endregion

// #region Shrink Nav on Scroll of div.main

// Accomplishes 4 things
    // 1) Shrink height of mainHeaer
    // 2) Widen the navContainerAccent (and navContainer by extension)
    // 3) Remove box shadow from navContainerAccent
    // 4) Shrink font size

//let mainHeader = querySelector("header.main-header");
//let navContainerAccent = querySelector("div.nav-container-accent");
//let mainBody = querySelector("div.main");

// #endregion Shrink Nav on Scroll of div.main

//(async () => {

//})();