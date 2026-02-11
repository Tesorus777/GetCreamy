import { Importer } from "../infrastructure/importer.js";

class ShoppingCart {
    // Operates as a finite state machine that controls the shopping cart
    // Getters / Setters
      // Internal Use:
        // CartDiv: DOM object - created in cshtml
        // CartDialog: created in cshtml
        // UserId: set by startupFactory
        // CartId: same as UserId => used to clear cart if CartId != UserId
      // Internal/External Use:
        // Order: array of order objects
        // OrderCartModel: order array but in the OrderCartModel {Flavor, Pints, Quarts}
        // OrderLength: total number of pints + quarts
        // OrderTotalCost: total cost of the order
    // Methods
      // Initialize(): creates the cart
      // UpdateState(): executes the functions required to update visual elements
      // InputHandler(orderItem): handles -/+ button and typing into quantity inputs
      // OpenCart(), CloseCart(): opens and closes the cart (can also hit escape or the X or click outside dialog to close)
        // dispatches event to stop other events where desired (eg. the Caoursel auto scroll)
      // AddToOrder: determines if an input item is new. Will either make a new object or add it to the existing cart object
        // runs UpdateState() after execution
      // UpdateOrder: updates the price, quantity, and max quantity of an existing pint/quart
        // does NOT run UpdateState() after execution => can't add or remove cart items so there will never be a change of state
      // RemoveFromOrder: removes an item from the cart by flavor name only
        // runs UpdateState() after execution
      // RemoveAllFromOrder: removes everything from the cart
        // runs UpdateState() after execution
      // BuildCartObject: builds a cart object when a new item is added
      // GetPintsByFlavor: Gets the total number of pints in the cart
      // GetQuartsByFlavor: Gets the total number of quarts in the cart
    // Things of note:
        // cartAllowed: bool set in Controller -> _Layout.cshtml

    constructor(userId) {
        // #region Set Externally
        this._userId = userId;
        // #endregion Set Externally

        // #region Set Internally
        // Imports
        this._importer = new Importer("../lib/images/recipe", true);

        // Screen Elements
        // Outside cart
        this._mainHeader = querySelector(`header.main-header`);
        this._mainDiv = querySelector(`div.main`);
        this._cartDiv = querySelector(`li#CartIconContainer`);
        // Cart
        this._cartDialog = querySelector(`dialog#CartDialog`);
        // Inside cart
        this._cartCloseButton = querySelector(`svg#CartClose`);
        this._cartDetailsBody = querySelector(`div#CartDetailsBody`);
        this._cartDetailsCount = querySelector(`h2#CartDetailsCount`);
        this._cartSubtotalContainer = querySelector(`h2#CartSubtotalContainer`);
        this._checkoutButton = querySelector(`a#CartCheckout`);

        // Custom Events
        this._openCartEvent = new CustomEvent("OpenCart");
        this._closeCartEvent = new CustomEvent("CloseCart");

        // Local Storage
        this._checkoutKey = "ShoppingCart";
        this._checkoutObj = {
            UserId: userId,
            Order: []
        };

        // Variables
        this._mainHeaderScrollOffset = this._mainHeader.offsetHeight;

        // Order Keys
        this._flavorKey = "Flavor";
        this._photoKey = "Photo";
        this._pintKey = "Pint";
        this._quartKey = "Quart";

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

        // Classes
        this._infoRowClasses = ["cart-info-row"];
        this._infoClasses = ["cart-info-container"];
        this._quantityContainerClasses = ["cart-quantity-container"];
        this._addToCartClasses = ["cart-quantity"];
        this._removeFromCartClasses = [];

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

    get OrderCartModel() {
        return this.Order.map((item) => {
            return {
                Flavor: item[this._flavorKey].replace("-", " "),
                Pints: item[this._pintKey].Quantity,
                Quarts: item[this._quartKey].Quantity
            }
        });
    }

    get OrderLength() {
        return this.Order.reduce((acc, curr) => {
            acc = acc + curr[this._pintKey].Quantity + curr[this._quartKey].Quantity;
            return acc;
        }, 0)
    }

    get OrderTotalCost() {
        return this.Order.reduce((acc, curr) => {
            acc = acc + (curr[this._pintKey].Quantity * curr[this._pintKey].Price) + (curr[this._quartKey].Quantity * curr[this._quartKey].Price);
            return acc;
        }, 0);
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
        // 2) Event listeners
        this._cartDialog.addEventListener("close", this._closeCart);
        this._cartCloseButton.addEventListener("click", this._closeCart);

        // 3) Update State
        this.UpdateState();

        // 4) For testing
        //document.addEventListener("keydown", (event) => {
        //    if (event.altKey && event.shiftKey && (event.key === "C" || event.key === "c")) {
        //        this.OpenCart();
        //    }
        //});
    }

    // #region Screen Functions

    // #region Update Visuals

    UpdateState() {
        if (cartAllowed) {
            this.UpdateSVG();
            this.UpdateCartContents();
            this.UpdateItemCount();
            this.UpdateSubtotal();
        }
    }

    UpdateSVG() {
        // Updates the cart SVG icon to show either empty or full
        // 1) If order length > 0, set to full-cart-svg else set to empty-cart-svg
        let svgObj = {
            tagNS: "svg",
            classList: this._cartClasses,
            events: [{
                type: "click",
                handler: this._openCart
            }]
        };
        if (this.OrderLength > 0) {
            svgObj.viewBox = this._viewBoxFullCart;
            svgObj.innerHTML = this._shoppingFullCartPath;
        } else {
            svgObj.viewBox = this._viewBoxCart;
            svgObj.innerHTML = this._shoppingCartPath;
        }
        // 2) Clear previous and append
        this.CartDiv.innerHTML = "";
        this.CartDiv.append(createElement(svgObj));
    }

    async UpdateCartContents() {
        // Adds or Removes screen items based on cart contents
        // 1) Add screen objects not yet on the screen (for page load/reload)
        let cartRows = Array.from(this._cartDetailsBody.querySelectorAll(`div.cart-info-row`));
        let cartItemsToAdd = this.Order.filter(cartItem => {
            // return true for a cartItem that is not in cartRows
            return !cartRows.includes((row) => {
                return row.id.split("_")[1] === cartItem.Flavor;
            });
        });
        cartItemsToAdd.forEach(item => this.BuildCartObject(item));
        // 2) Remove screen objects no longer in cart
        let cartItemsToRemove = cartRows.filter(row => {
            // return true for a row (on screen) that is not in this.Order
            return !this.Order.includes((cartItem) => {
                return cartItem.Flavor === row.id.split("_")[1];
            });
        });
        cartItemsToRemove.forEach(item => item.remove());
    }

    UpdateItemCount() {
        // Updates the cart item count
        this._cartDetailsCount.innerText = `Item Count: ${this.OrderLength}`;
    }

    UpdateSubtotal() {
        // Updates the subtotal in the cart
        this._cartSubtotalContainer.innerText = `Subtotal: $${this.OrderTotalCost}`;
    }

    InputHandler(orderItem) {
        // Update Pint(s)/Quart(s) and price display
        let pintInput = querySelector(`input#Cart_${orderItem[this._flavorKey]}_PintInput`);
        querySelector(`h4#Cart_${orderItem[this._flavorKey]}_PintQuantity`).innerText = `Pint${pintInput.value > 1 || pintInput.value == 0 ? "s" : ""}`;
        querySelector(`h4#Cart_${orderItem[this._flavorKey]}_PintPrice`).innerText = orderItem[this._pintKey].Price > 0 ? `$${orderItem[this._pintKey].Price * pintInput.value}` : `Out of Stock`;;

        let quartInput = querySelector(`input#Cart_${orderItem[this._flavorKey]}_QuartInput`);
        querySelector(`h4#Cart_${orderItem[this._flavorKey]}_QuartQuantity`).innerText = `Quart${quartInput.value > 1 || quartInput.value == 0 ? "s" : ""}`;
        querySelector(`h4#Cart_${orderItem[this._flavorKey]}_QuartPrice`).innerText = orderItem[this._quartKey].Price > 0 ? `$${orderItem[this._quartKey].Price * quartInput.value}` : `Out of Stock`;;

        // Update the order, item count, and subtotal
        orderItem[this._pintKey].Quantity = pintInput.value;
        orderItem[this._quartKey].Quantity = quartInput.value;
        this.UpdateOrder(orderItem);
        this.UpdateItemCount();
        this.UpdateSubtotal();
    }

    // #endregion Update Visuals

    // #region Open and Close

    OpenCart() {
        if (cartAllowed && this.OrderLength > 0) {
            // 1) Dispatch open event
            document.dispatchEvent(this._openCartEvent);
            // 2) Open the cart
            this.CartDialog.show();
        }
    }

    CloseCart() {
        // 1) Dispatch close event
        document.dispatchEvent(this._closeCartEvent);
        // 2) Close the cart
        this.CartDialog.close();
    }

    // #endregion Open and Close

    // #endregion Screen Functions

    // #region Local Storage Functions

    async AddToOrder(flavorName, photo, pintInfo, quartInfo) {
        // Add new order items. As a default, update existing items
        // Only UpdateSVG() after new item. UpdateOrder() always runs RemoveFromOrder()
        let orderItem = {
            [this._flavorKey]: flavorName.replace(" ", "-"),
            [this._photoKey]: photo,
            [this._pintKey]: {
                Price: pintInfo.Price,
                Quantity: pintInfo.Quantity,
                MaxQuantity: pintInfo.MaxQuantity
            },
            [this._quartKey]: {
                Price: quartInfo.Price,
                Quantity: quartInfo.Quantity,
                MaxQuantity: quartInfo.MaxQuantity
            }
        };
        if (!this.Order.some(item => item[this._flavorKey] === flavorName.replace(" ", "-"))) {
            // If the Order does not already contain the flavor, add it
            this.Order = this.Order.toSpliced(this.Order.length, 0, orderItem);
            this.Order = this.Order.sort((a, b) => {
                if (a[this._flavorKey] < b[this._flavorKey]) {
                    return -1;
                }
                if (a[this._flavorKey] > b[this._flavorKey]) {
                    return 1;
                }
                return 0;
            });
            this.BuildCartObject(orderItem);
        } else {
            // If the Order does already contain the flavor, Update it
            // Get the exact flavor from the order, add the incoming pints/quarts and submit that to UpdateOrder
            let currentItem = this.Order.find(item => item[this._flavorKey] === flavorName.replace(" ", "-"));
            // Set updated pint info
            currentItem[this._pintKey].Price = pintInfo.Price;
            currentItem[this._pintKey].Quantity += currentItem[this._pintKey].Quantity < pintInfo.MaxQuantity ? Number(pintInfo.Quantity) : 0;
            currentItem[this._pintKey].MaxQuantity = pintInfo.MaxQuantity;
            // Set updated quart info
            currentItem[this._quartKey].Price = quartInfo.Price;
            currentItem[this._quartKey].Quantity += currentItem[this._quartKey].Quantity < quartInfo.MaxQuantity ? Number(quartInfo.Quantity) : 0;
            currentItem[this._quartKey].MaxQuantity = quartInfo.MaxQuantity;
            // Update
            this.UpdateOrder(currentItem);
        };
        this.UpdateState();
    }

    UpdateOrder(updateItem) {
        // Update existing order items. As a default, remove any empty items
        this.Order = this.Order.map(item => {
            if (item[this._flavorKey] === updateItem[this._flavorKey]) {
                // Pint info
                item[this._pintKey].Price = updateItem[this._pintKey].Price;
                item[this._pintKey].Quantity = Number(updateItem[this._pintKey].Quantity);
                item[this._pintKey].MaxQuantity = updateItem[this._pintKey].MaxQuantity;
                // Quart info
                item[this._quartKey].Price = updateItem[this._quartKey].Price;
                item[this._quartKey].Quantity = Number(updateItem[this._quartKey].Quantity);
                item[this._quartKey].MaxQuantity = updateItem[this._quartKey].MaxQuantity;
            }
            return item;
        });
    }

    RemoveFromOrder(flavorName = "") {
        // Default mode verfies there is any quantity of all flavors
        this.Order = this.Order.filter((item) => {
            // Keep items that are not flavorName and have a pint or quart quantity > 0
                // Logic to remove empty flavors from order: && (item[this._pintKey].Quantity > 0 || item[this._quartKey].Quantity > 0)
            return (item[this._flavorKey] !== flavorName.replace(" ", "-"));
        });
        this.UpdateState();
    }

    RemoveAllFromOrder() {
        this.Order = this.Order.filter((item) => {
            return false;
        });
        this.UpdateState();
    }

    // #endregion Local Storage Functions


    // #region Extra Methods

    BuildCartObject(orderItem) {
        // Build DOM tree from inside -> out
        // 1) Build info
        // Flavor info
        let flavorThumbnail = this._importer.ImportThumbnail(orderItem[this._photoKey]).Object;
        let flavorName = {
            tag: "h3",
            innerText: orderItem[this._flavorKey].replace("-", " ")
        };
        let pintPriceLabel = {
            tag: "h4",
            innerText: orderItem[this._pintKey].Price > 0 ? `Pints: $${orderItem[this._pintKey].Price} each` : `Pints: Out of Stock`
        };
        let quartPriceLabel = {
            tag: "h4",
            innerText: orderItem[this._quartKey].Price > 0 ? `Quarts: $${orderItem[this._quartKey].Price} each` : `Quarts: Out of Stock`
        }
        // Quantity info
        // Pint
        let pintLabel = {
            tag: "h4",
            id: `Cart_${orderItem[this._flavorKey]}_PintQuantity`,
            innerText: `Pint${orderItem[this._pintKey].Quantity > 1 || orderItem[this._pintKey].Quantity == 0 ? "s" : ""}`
        };
        let pintInput = {
            tag: "input",
            id: `Cart_${orderItem[this._flavorKey]}_PintInput`,
            type: "number",
            classList: [...this._addToCartClasses],
            min: 0,
            max: orderItem[this._pintKey].MaxQuantity,
            value: orderItem[this._pintKey].Quantity,
            disabled: orderItem[this._pintKey].MaxQuantity > 0 ? false : true,
            events: [{
                type: "change",
                handler: (() => {
                    this.InputHandler(orderItem);
                }),
                capture: true
            }]
        };
        let pintMinusButton = {
            tag: "button",
            id: `Cart_${orderItem[this._flavorKey]}_PintMinus`,
            classList: [...this._addToCartClasses, "minus"],
            disabled: orderItem[this._pintKey].MaxQuantity > 0 ? false : true,
            children: [{
                tag: "span",
                innerText: "-"
            }],
            events: [{
                type: "click",
                handler: ((event) => {
                    let input = event.currentTarget.nextSibling;
                    if (input.value > 0) {
                        input.value--;
                        this.InputHandler(orderItem);
                    }
                }),
                capture: true
            }]
        };
        let pintPlusButton = {
            tag: "button",
            id: `Cart_${orderItem[this._flavorKey]}_PintPlus`,
            classList: [...this._addToCartClasses, "plus"],
            disabled: orderItem[this._pintKey].MaxQuantity > 0 ? false : true,
            children: [{
                tag: "span",
                innerText: "+"
            }],
            events: [{
                type: "click",
                handler: ((event) => {
                    let input = event.currentTarget.previousSibling;
                    if (input.value < input.max) {
                        input.value++;
                        this.InputHandler(orderItem);
                    }
                }),
                capture: true
            }]
        };
        let pintQuantityContainer = {
            tag: "div",
            classList: [...this._quantityContainerClasses],
            children: [pintMinusButton, pintInput, pintPlusButton]
        };
        // Quart
        let quartLabel = {
            tag: "h4",
            id: `Cart_${orderItem[this._flavorKey]}_QuartQuantity`,
            innerText: `Quart${orderItem[this._quartKey].Quantity > 1 || orderItem[this._quartKey].Quantity == 0 ? "s" : ""}`
        };
        let quartInput = {
            tag: "input",
            id: `Cart_${orderItem[this._flavorKey]}_QuartInput`,
            type: "number",
            classList: [...this._addToCartClasses],
            min: 0,
            max: orderItem[this._quartKey].MaxQuantity,
            value: orderItem[this._quartKey].Quantity,
            disabled: orderItem[this._quartKey].MaxQuantity > 0 ? false : true,
            events: [{
                type: "change",
                handler: (() => {
                    this.InputHandler(orderItem);
                }),
                capture: true
            }]
        };
        let quartMinusButton = {
            tag: "button",
            id: `Cart_${orderItem[this._flavorKey]}_QuartMinus`,
            classList: [...this._addToCartClasses, "minus"],
            disabled: orderItem[this._quartKey].MaxQuantity > 0 ? false : true,
            children: [{
                tag: "span",
                innerText: "-"
            }],
            events: [{
                type: "click",
                handler: ((event) => {
                    let input = event.currentTarget.nextSibling;
                    if (input.value > 0) {
                        input.value--;
                        this.InputHandler(orderItem);
                    }
                }),
                capture: true
            }]
        };
        let quartPlusButton = {
            tag: "button",
            id: `Cart_${orderItem[this._flavorKey]}_QuartPlus`,
            classList: [...this._addToCartClasses, "plus"],
            disabled: orderItem[this._quartKey].MaxQuantity > 0 ? false : true,
            children: [{
                tag: "span",
                innerText: "+"
            }],
            events: [{
                type: "click",
                handler: ((event) => {
                    let input = event.currentTarget.previousSibling;
                    if (input.value < input.max) {
                        input.value++;
                        this.InputHandler(orderItem);
                    }
                }),
                capture: true
            }]
        };
        let quartQuantityContainer = {
            tag: "div",
            classList: [...this._quantityContainerClasses],
            children: [quartMinusButton, quartInput, quartPlusButton]
        };
        // Price info
        let pintPrice = {
            tag: "h4",
            id: `Cart_${orderItem[this._flavorKey]}_PintPrice`,
            innerText: orderItem[this._pintKey].Price > 0 ? `$${orderItem[this._pintKey].Price * orderItem[this._pintKey].Quantity}` : `Out of Stock`
        };
        let quartPrice = {
            tag: "h4",
            id: `Cart_${orderItem[this._flavorKey]}_QuartPrice`,
            innerText: orderItem[this._quartKey].Price > 0 ? `$${orderItem[this._quartKey].Price * orderItem[this._quartKey].Quantity}` : `Out of Stock`
        };
        // Remove button
        let removeCartButton = {
            tag: "h5",
            id: `Cart_${orderItem[this._flavorKey]}_Remove`,
            classList: [...this._removeFromCartClasses],
            innerText: "Remove",
            events: [{
                type: "click",
                handler: ((event) => {
                    this.RemoveFromOrder(event.currentTarget.id.split("_")[1]);
                })
            }]
        };
        // 2) Build containers
        let flavorInfo = {
            tag: "div",
            classList: [...this._infoClasses, "flavor"],
            children: [flavorName, pintPriceLabel, quartPriceLabel],
            childNodes: [flavorThumbnail]
        };
        let quantityInfo = {
            tag: "div",
            classList: [...this._infoClasses, "quantity"],
            children: [pintQuantityContainer, pintLabel, quartQuantityContainer, quartLabel]
        };
        let priceInfo = {
            tag: "div",
            classList: [...this._infoClasses, "price"],
            children: [pintPrice, quartPrice]
        };
        let removeInfo = {
            tag: "div",
            classList: [...this._infoClasses, "remove"],
            children: [removeCartButton]
        };
        let row = {
            tag: "div",
            id: `CartRow_${orderItem[this._flavorKey]}`,
            classList: [...this._infoRowClasses],
            children: [flavorInfo, quantityInfo, priceInfo, removeInfo]
        };
        // 4) Build
        let domRow = createElement(row);

        // Append to both the container and an array for easy access to stuff like the quart(s) and price control
        this._cartDetailsBody.append(domRow);
    }

    GetPintsByFlavor(flavorName) {
        let flavorItem = this.Order.find(item => item[this._flavorKey] === flavorName);
        return flavorItem !== undefined ? flavorItem[this._pintKey].Quantity : 0;
    }

    GetQuartsByFlavor(flavorName) {
        let flavorItem = this.Order.find(item => item[this._flavorKey] === flavorName);
        return flavorItem !== undefined ? flavorItem[this._quartKey].Quantity : 0;
    }

    // #endregion Extra Methods

    // #region Test Methods

    TestAddToOrder() {
        // order object reference
        //let orderItem = {
        //    [this._flavorKey]: flavorName.replace(" ", "_"),
        //    [this._photoKey]: photo,
        //    [this._pintKey]: {
        //        Price: pintInfo.Price,
        //        Quantity: pintInfo.Quantity,
        //        MaxQuantity: pintInfo.MaxQuantity
        //    },
        //    [this._quartKey]: {
        //        Price: quartInfo.Price,
        //        Quantity: quartInfo.Quantity,
        //        MaxQuantity: quartInfo.MaxQuantity
        //    }
        //};

        let testArr = [{
            [this._flavorKey]: "Vanilla",
            [this._photoKey]: {
                "RecipeName": "Vanilla",
                "Folder": "Vanilla",
                "FileName": "vanilla_ice_cream_test_batch.jpg",
                "LowResFileName": "vanilla_ice_cream_test_batch-lowRes.jpg",
                "ThumbnailFileName": "vanilla_ice_cream_test_batch-thumbnail.jpg",
                "AltText": "Picture of vanilla ice cream being churned",
                "SortOrder": 0
            },
            [this._pintKey]: {
                Price: 12,
                Quantity: (Math.floor(Math.random() * 10) + 1),
                MaxQuantity: 7
            },
            [this._quartKey]: {
                Price: 24,
                Quantity: (Math.floor(Math.random() * 10) + 1),
                MaxQuantity: 7
            }
        }, {
            [this._flavorKey]: "Chocolate",
            [this._photoKey]: {
                "RecipeName": "Chocolate",
                "Folder": "Chocolate",
                "FileName": "chocolate_ice_cream.png",
                "LowResFileName": "chocolate_ice_cream-lowRes.png",
                "ThumbnailFileName": "chocolate_ice_cream-thumbnail.png",
                "AltText": "Picture of chocolate ice cream",
                "SortOrder": 0
            },
            [this._pintKey]: {
                Price: 12,
                Quantity: (Math.floor(Math.random() * 10) + 1),
                MaxQuantity: 7
            },
            [this._quartKey]: {
                Price: 24,
                Quantity: (Math.floor(Math.random() * 10) + 1),
                MaxQuantity: 7
            }
        }];
        testArr.forEach(item => {
            // Inputs: flavor name, pint object, quart object
            this.AddToOrder(item[this._flavorKey], item[this._pintKey], item[this._quartKey]);
        });
        console.log(this.Order);
    }

    TestUpdateOrder() {
        let testArr = [{
            FlavorName: "Vanilla",
            Pints: (Math.floor(Math.random() * 10) + 1),
            Quarts: (Math.floor(Math.random() * 10) + 1)
        }, {
            FlavorName: "Chocolate",
            Pints: (Math.floor(Math.random() * 10) + 1),
            Quarts: (Math.floor(Math.random() * 10) + 1)
        }];
        testArr.forEach(item => {
            // Inputs: flavor name, number of pints, number of quarts
            this.UpdateOrder(item[FlavorName], item[Pints], item[Quarts]);
        });
        console.log(this.Order);
    }

    TestRemoveFromOrder() {
        let testArr = ["Vanilla", "Chocolate"];
        testArr.forEach(item => {
            // Inputs: flavor name
            this.RemoveFromOrder(item);
        });
        console.log(this.Order);
    }


    // #endregion

    // #endregion Methods

}

export { ShoppingCart };