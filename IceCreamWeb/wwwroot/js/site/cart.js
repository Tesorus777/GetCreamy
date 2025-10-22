import { Importer } from "../infrastructure/importer.js";

class ShoppingCart {
    constructor(userId) {
        // #region Set Externally
        this._userId = userId;
        // #endregion Set Externally

        // #region Set Internally
        // Imports
        this._importer = new Importer("../lib/images/recipe", true);

        // Screen Elements
        this._cartDiv = document.querySelector(`li#CartIconContainer`);
        this._cartDialog = document.querySelector(`dialog#CartDialog`);
        console.log(this._cartDialog);

        // Local Storage
        this._checkoutKey = "ShoppingCart";
        this._checkoutObj = {
            UserId: userId,
            Order: []
        };

        // Order Keys
        this._flavorKey = "Flavor";
        this._pintKey = "Pints";
        this._quartKey = "Quarts";

        // Icons
        this._cartClasses = ["cart-icon"];
        this._xmlns = "http://www.w3.org/2000/svg";
        this._viewBoxCart = "0 0 902.86 823.75";
        this._shoppingCartPath = `<g id="g3" transform="translate(0,-102.20216)">
	                <g id="g2" transform="matrix(-1,0,0,1,902.86,77.08216)">
		                <path d="M 671.504,577.829 781.989,145.22 H 902.86 v -68 H 729.174 L 703.128,179.2 0,178.697 74.753,577.826 h 596.751 z m 14.262,-330.641 -67.077,262.64 H 131.199 L 81.928,246.756 Z" id="path1" />
		                <path d="m 578.418,825.641 c 59.961,0 108.743,-48.783 108.743,-108.744 0,-59.961 -48.782,-108.742 -108.743,-108.742 H 168.717 c -59.961,0 -108.744,48.781 -108.744,108.742 0,59.961 48.782,108.744 108.744,108.744 59.962,0 108.743,-48.783 108.743,-108.744 0,-14.4 -2.821,-28.152 -7.927,-40.742 h 208.069 c -5.107,12.59 -7.928,26.342 -7.928,40.742 0.001,59.961 48.783,108.744 108.744,108.744 z M 209.46,716.897 c 0,22.467 -18.277,40.744 -40.743,40.744 -22.466,0 -40.744,-18.277 -40.744,-40.744 0,-22.465 18.277,-40.742 40.744,-40.742 22.466,0 40.743,18.277 40.743,40.742 z m 409.702,0 c 0,22.467 -18.277,40.744 -40.743,40.744 -22.466,0 -40.743,-18.277 -40.743,-40.744 0,-22.465 18.277,-40.742 40.743,-40.742 22.466,0 40.743,18.277 40.743,40.742 z" id="path2" />
                	</g>
                </g>`;
        this._viewBoxFullCart = "0 0 862.99 771.75";
        this._shoppingFullCartPath = `<g id="g3" transform="translate(0,-91.584601)">
	                <g id="g2" transform="matrix(-1,0,0,1,862.988,45.769601)">
		                <path d="m 71.892,580.826 c 190.555,0 381.11,0 571.665,0 35.12501,-137.531 70.24993,-275.06202 105.375,-412.593 38.01867,0 76.03733,0 114.056,0 0,-22.66667 0,-45.33333 0,-68 -55.62433,0 -111.24867,0 -166.873,0 -8.28133,32.424 -16.56267,64.848 -24.844,97.272 -15.5,-0.005 -31,-0.0107 -46.5,-0.016 6.87367,-35.06167 13.74733,-70.12333 20.621,-105.185 C 566.34633,76.807667 487.30067,61.311333 408.255,45.815 c -6.72167,34.288 -13.44333,68.576 -20.165,102.864 -2.96833,-23.076 -5.93667,-46.152 -8.905,-69.228 -79.89133,10.276333 -159.78267,20.55267 -239.674,30.829 3.73233,29.01567 7.46467,58.03133 11.197,87.047 C 100.472,197.31 50.236,197.293 0,197.276 c 23.964,127.85 47.928,255.7 71.892,383.55 z M 228.019,265.353 c 141.962,0.047 283.924,0.0973 425.886,0.145 -21.055,82.44267 -42.11,164.88533 -63.165,247.328 -154.13633,0 -308.27267,0 -462.409,0 -15.465,-82.50767 -30.93,-165.01533 -46.395,-247.523 48.69433,0.0162 97.38867,0.0327 146.083,0.05 z M 461.904,125.625 c 34.55867,6.775 69.11733,13.55 103.676,20.325 -3.366,17.17133 -6.732,34.34267 -10.098,51.514 -35.88467,-0.0123 -71.76933,-0.0247 -107.654,-0.037 4.692,-23.934 9.384,-47.868 14.076,-71.802 z M 215.63,169.049 c 34.929,-4.493 69.858,-8.986 104.787,-13.479 1.79333,13.939 3.58667,27.878 5.38,41.817 -35.50867,-0.012 -71.01733,-0.024 -106.526,-0.036 -1.21367,-9.434 -2.42733,-18.868 -3.641,-28.302 z" id="path1" />
		                <path d="m 553.557,817.173 c 59.79713,1.86881 112.17362,-56.17654 104.99511,-115.40094 -4.4829,-54.71988 -57.24913,-100.04716 -112.13378,-95.05255 -131.38514,-0.0232 -262.79371,-0.57502 -394.1644,0.31056 -58.676675,4.45503 -104.803613,65.19537 -93.380847,122.88444 8.878051,56.24794 68.556627,97.74193 124.297027,85.4903 46.62513,-9.10663 84.84978,-52.86101 84.89144,-100.80359 5.71288,-13.70981 -19.21512,-46.1479 9.77456,-39.99822 59.08796,0 118.17593,0 177.26389,0 -23.57035,56.20133 14.10365,127.68004 74.00162,139.70216 8.00206,1.90869 16.22875,2.87456 24.45538,2.86784 z M 200.096,711.888 c 1.96956,30.74672 -40.69601,49.59267 -62.35465,27.84829 -24.80196,-20.43877 -8.27384,-66.35016 24.19156,-65.25373 19.97489,-0.47896 38.98878,17.02086 38.16309,37.40544 z m 390.746,0 c 1.96914,30.74635 -40.69566,49.59259 -62.35432,27.84831 -24.80245,-20.43861 -8.27386,-66.35013 24.19148,-65.25371 19.9747,-0.4787 38.9882,17.02111 38.16284,37.4054 z" id="path2" />
                	</g>
                </g>`;
        // Functions
        this._openCart = this.OpenCart.bind(this);
        this._closeCart = this.CloseCart.bind(this);

        console.log(this._userId);
        console.log(localStorage);
        console.log(this._checkoutObj);

        // #region Set Internally
        this.Initialize();
    }

    // #region Getters and Setters

    get CartDiv() {
        return this._cartDiv;
    }
    set CartDiv(cartDiv) {
        this._cartDiv = cartDiv;
    }
    get CartDialog() {
        return this._cartDialog;
    }
    set CartDialog(cartDialog) {
        this._cartDialog = cartDialog;
    }

    get UserId() {
        return this._userId;
    }

    get CartId() {
        return JSON.parse(localStorage[this._checkoutKey]).UserId;
    }

    set CartId(userId) {
        let storageObj = JSON.parse(localStorage[this._checkoutKey]);
        storageObj.UserId = userId;
        localStorage.setItem(this._checkoutKey, JSON.stringify(storageObj));
        //JSON.parse(localStorage[this._checkoutKey]).UserId = userId;
    }

    get Order() {
        return JSON.parse(localStorage[this._checkoutKey]).Order;
    }

    set Order(order) {
        // get the order in a variable
        // set it to the new value
        // update the whole localStorage checkoutkey object
        let storageObj = JSON.parse(localStorage[this._checkoutKey]);
        storageObj.Order = order;
        localStorage.setItem(this._checkoutKey, JSON.stringify(storageObj));
    }

    get OrderLength() {
        return this.Order.reduce((acc, curr) => {
            acc = acc + curr[this._pintKey] + curr[this._quartKey];
            return acc;
        }, 0)
    }

    // #endregion Getters and Setters

    // #region Methods

    Initialize() {
        // 1) If cart object exists, verify UserId is the same
        if (localStorage[this._checkoutKey] === undefined) {
            // If the CheckoutKey doesn't exist
            // Create the CheckoutObject at the CheckoutKey
            localStorage.setItem(this._checkoutKey, JSON.stringify(this._checkoutObj));
        } else if (localStorage[this._checkoutKey] && this.CartId !== this.UserId) {
            // If the CheckoutKey exists but the Cart's UserId doesn't match the incoming UserId
            // Reset the Order and update the Cart's UserId
            this.Order = [];
            this.CartId = this.UserId;
        }
        // 2) Update State
        this.UpdateState();
    }

    // #region Screen Functions

    async UpdateState() {
        this.UpdateSVG();
        await this.UpdateCartContents();
    }

    UpdateSVG() {
        // 1) If order length > 0, set to full-cart-svg else set to empty-cart-svg
        let svgObj;
        if (this.OrderLength > 0) {
            svgObj = this.BuildSVG(this._cartClasses, this._shoppingFullCartPath, this._viewBoxFullCart, "click", this._openCart);
        } else {
            svgObj = this.BuildSVG(this._cartClasses, this._shoppingCartPath, this._viewBoxCart, "click", this._openCart);
        }
        // 2) Clear previous and append
        this.CartDiv.innerHTML = "";
        this.CartDiv.append(svgObj);
    }

    async UpdateCartContents(flavorName, pints, quarts) {
        // 1) Create cart item
            // need: flavor name, image, text for pint and quart, - and + button, number box, price
        // Fires off API calls to get thumbnails and loads
    }

    UpdatePrice() {

    }

    OpenCart() {
        // opens a dialog with the cart
        // design pending (window pane or dropdown or dependant on mobile or what)
        this.CartDialog.show();
    }

    CloseCart() {
        this.CartDialog.close();
    }

    

    // #endregion Screen Functions

    // #region Local Storage Functions

    AddToOrder(flavorName, pints, quarts) {
        // Add new order items. As a default, update existing items
        // Only UpdateSVG() after new item. UpdateOrder() always runs RemoveFromOrder()
        let orderItem = {
            [this._flavorKey]: flavorName,
            [this._pintKey]: pints,
            [this._quartKey]: quarts
        };
        if (!this.Order.some(item => item[this._flavorKey] === flavorName)) {
            this.Order = this.Order.toSpliced(this.Order.length, 0, orderItem);
            this.UpdateState();
        } else {
            this.UpdateOrder(flavorName, pints, quarts);
        }
    }

    UpdateOrder(flavorName, pints, quarts) {
        // Update existing order items. As a default, remove any empty items
        // Don't run UpdateSVG() here because this will always run RemoveFromOrder()
        this.Order = this.Order.map(item => {
            if (item[this._flavorKey] === flavorName) {
                item[this._pintKey] = pints;
                item[this._quartKey] = quarts;
            }
            return item;
        });
        this.RemoveFromOrder();
    }

    RemoveFromOrder(flavorName = "") {
        // Default mode verfies there is any quantity of all flavors
        this.Order = this.Order.filter((item) => {
            // Keep items that are not flavorName and have a quantity > 0
            return (item[this._flavorKey] !== flavorName && item[this._pintKey] > 0 && item[this._quartKey] > 0);
        });
        this.UpdateState();
    }
    // #endregion Local Storage Functions


    // #region Extra Methods

    BuildSVG(classes, path, viewBox, eventType = null, eventFunction = null, attributes = []) {
        let svgObj = document.createElementNS(this._xmlns, 'svg');
        svgObj.setAttribute("viewBox", viewBox);
        for (const attr of attributes) {
            svgObj.setAttribute(`${attr.Type}`, `${attr.Value}`);
        }
        svgObj.classList.add(...classes);
        svgObj.innerHTML = path;
        svgObj.addEventListener(eventType, eventFunction, true);
        return svgObj;
    }

    BuildCartObject() {
        // 1) Build text and inputs

        // 2) Load low-res image

        // 3) Initialize price based on Order quantity
    }

    // #endregion Extra Methods

    // #region Test Methods

    TestAddToOrder() {
        let testArr = [{
            [this._flavorKey]: "Vanilla",
            [this._pintKey]: (Math.floor(Math.random() * 10) + 1),
            [this._quartKey]: (Math.floor(Math.random() * 10) + 1)
        }, {
            [this._flavorKey]: "Chocolate",
            [this._pintKey]: (Math.floor(Math.random() * 10) + 1),
            [this._quartKey]: (Math.floor(Math.random() * 10) + 1)
        }];
        testArr.forEach(item => {
            this.AddToOrder(item[this._flavorKey], item[this._pintKey], item[this._quartKey]);
        });
        console.log(this.Order);
    }

    TestUpdateOrder() {
        let testArr = [{
            [this._flavorKey]: "Vanilla",
            [this._pintKey]: (Math.floor(Math.random() * 10) + 1),
            [this._quartKey]: (Math.floor(Math.random() * 10) + 1)
        }, {
            [this._flavorKey]: "Chocolate",
            [this._pintKey]: (Math.floor(Math.random() * 10) + 1),
            [this._quartKey]: (Math.floor(Math.random() * 10) + 1)
        }];
        testArr.forEach(item => {
            this.UpdateOrder(item[this._flavorKey], item[this._pintKey], item[this._quartKey]);
        });
        console.log(this.Order);
    }

    TestRemoveFromOrder() {
        let testArr = [{
            [this._flavorKey]: "Vanilla",
            [this._pintKey]: 0,
            [this._quartKey]: 0
        }, {
            [this._flavorKey]: "Chocolate",
            [this._pintKey]: 0,
            [this._quartKey]: 0
        }];
        testArr.forEach(item => {
            this.RemoveFromOrder(item[this._flavorKey]);
        });
        console.log(this.Order);
    }


    // #endregion

    // #endregion Methods

}

export { ShoppingCart };