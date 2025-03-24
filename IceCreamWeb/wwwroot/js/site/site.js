// #region Imports
import { APIFetcher, StorageClass } from "./startupFactory.js";
// #endregion

// #region Variables
let baseUrl = window.envVar.baseUrl;

// #region SelectorFunctions

const querySelector = (selector) => document.querySelector(selector);
const querySelectorAll = (selector) => Array.from(document.querySelectorAll(selector));

// #endregion SelectorFunctions

// #endregion Variables

const API = new APIFetcher(baseUrl);
const UserStorage = new StorageClass(baseUrl);

// #region Set Global Scope

window.querySelector = querySelector;
window.querySelectorAll = querySelectorAll;
window.API = API;
window.UserStorage = UserStorage;

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