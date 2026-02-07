// workflow
// 1) Build cart summary
    // a) run API to get current inventory on cart items
    // b) allowedToBuy = the difference between the available inventory and the selected inventory
        // i) if inventory >= cartNum => choose cartNum
        // ii) if inventory < cartNum => choose inventory
        // iii) do all this in API, return allowedToBuy
// 2) turn on the form
    // a) email change => microservice API to validate email
// b) shipping address change => when all fields are filled, run against microservice API to validate address
        // i)  after shipping is validated, load tax cost
        // ii) after shipping is validated, load shipping cost
// 3) discount code event listener on apply
    // a) Check API if valid => apply discount
// 4) After all checks cleared, activate Place Order button
// a) goes to "confirmation" page where user will be prompted to click the button in their email

// #region Imports

import { Importer } from "../infrastructure/importer.js";

// #endregion

// #region Variables

const importer = new Importer("../lib/images/recipe", true);

// Order Keys
const flavorKey = "Flavor";
const photoKey = "Photo";
const pintKey = "Pint";
const quartKey = "Quart";

const invalidAttribute = "invalid-text";

let orderObj = {
    CartDetails: [],
    DefaultCartDetails: [],
    DefaultInformation: {
        Subtotal: null,
        TaxCost: null,
        TaxRate: null,
        TotalCost: 0
    },
    DiscountInformation: {
        Amount: 0,
        MinimumOrderValue: 0
    },
    OrderDetails: {
        UserId: UserStorage.Cookie.UserId,
        ReferralText: null,
        Subtotal: null,
        TaxCost: null,
        TotalCost: null,
        ShippingCost: 0,
        PaymentMethod: null,
        AddressOne: null,
        AddressTwo: null,
        AddressThree: null,
        City: null,
        Zipcode: null,
        OrderStatusId: null,
        Note: null
    },
    UserDetails: {
        UserId: UserStorage.Cookie.UserId,
        FirstName: null,
        LastName: null,
        Email: null,
        Telephone: null,
        MailingList: false
    }
};

// Intervals
let addressInterval;
let zipcodeInterval;
let discountInterval;
let orderSubmitInterval;

// Helpers
let previousPhone = "";

// DOM Objects
// Checkout Details (Left Column)
const contactForm = querySelector(`form#ContactInformation`);
const contactInputs = querySelectorAll(`form#ContactInformation input.checkout-input, form#ContactInformation input.checkout-marketing-input, form#ContactInformation textarea.checkout-input`);

const zipcodeLoad = querySelector(`div#ZipcodeLoad`);
const addressLoad = querySelector(`div#AddressLoad`);
const geoapifyAutofillDiv = querySelector(`div#GeoapifyAutofill`);

const instructionsCount = querySelector(`span#InstructionsCount`);

// Checkout Summary (Right Column)
const checkoutCartSummary = querySelector(`div#CheckoutCartSummary`);
const checkoutDiscrepancy = querySelector(`div#CheckoutDiscrepancy`);

const discountForm = querySelector(`form#DiscountInformation`);
const discountInput = querySelector(`input#CheckoutDiscountInput`);
const discountApply = querySelector(`button#CheckoutDiscountButton`);

const discountLoad = querySelector(`div#DiscountLoad`);

const checkoutSubtotal = querySelector(`h3#CheckoutSubtotal`);
const checkoutTaxCost = querySelector(`h3#CheckoutTax`);
const checkoutShipping = querySelector(`h3#CheckoutShipping`);
const checkoutTotalCost = querySelector(`h3#CheckoutTotal`);

const checkoutSubmit = querySelector(`input[type=submit]#CheckoutSubmit`);

const submitLoad = querySelector(`div#CheckoutSubmitLoad`);
const submitMessage = querySelector(`div#CheckoutMessageContainer`);

// #endregion Variables

// #region Event Listeners
// Checkout Details (Left Column)
contactInputs.forEach(input => {
    input.addEventListener("invalid", () => {
        // An invalid input will always add the correct custom validity text, but it won't be shown until reportValidity() on submit
        if (input.validity.valueMissing || input.validity.patternMismatch || input.validity.typeMismatch || input.validity.tooLong) {
            input.setCustomValidity(input.getAttribute(invalidAttribute));
            input.classList.add("invalid");
        } else {
            input.setCustomValidity("");
            input.classList.remove("invalid");
        }
    });
    input.addEventListener("input", CloseMessage);
});

// Telephone
contactInputs[4].addEventListener("input", FormatTelephone);
// Address One
contactInputs[5].addEventListener("input", AddressEventHandler);
// Address Two
contactInputs[6].addEventListener("input", (e) => {
    // to ensure pattern is matched
    e.target.value = e.target.value.toLowerCase();
});
// Zipcode
contactInputs[8].addEventListener("input", ZipcodeEventHandler);
// Special Instructions
contactInputs[9].addEventListener("input", UpdateSpecialInstructionLength);

// Submit (via checkoutSubmit button)
contactForm.addEventListener("submit", ContactFormSubmitEventListener);

// Checkout Summary (Right Column)
discountInput.addEventListener("input", CloseMessage);
discountApply.addEventListener("click", DiscountEventHandler);

checkoutSubmit.addEventListener("click", OrderSubmitEventHandler);
// #endregion Event Listeners

// #region Checkout Details (Left Column)
function FormatTelephone(event) {
    const specialCharCount = (contactInputs[4].value.match(/\D/g) || []).length;
    let cursorPosition = contactInputs[4].selectionStart;

    let input = contactInputs[4].value.replace(/\D/g, '');
    const size = input.length;
    if (input.substring(0, 1) == 1) {
        if (size === 0) { input = `` }
        else if (size < 2) { input = `+${input} ` }
        else if (size < 4) { input = `+${input.substring(0, 1)} (${input.substring(1)}` }
        else if (size < 8) { input = `+${input.substring(0, 1)} (${input.substring(1, 4)}) ${input.substring(4)}` }
        else if (size < 12) { input = `+${input.substring(0, 1)} (${input.substring(1, 4)}) ${input.substring(4, 7)}-${input.substring(7, 11)}` }
    } else {
        if (size > 7 && size < 11) { input = `(${input.substring(0, 3)}) ${input.substring(3, 6)}-${input.substring(6)}` }
        else if (size > 3 && size < 8) { input = `${input.substring(0, 3)}-${input.substring(3)}` }
    }

    if (input !== previousPhone) {
        previousPhone = input
        const specialCharDiff = (input.match(/\D/g) || []).length - specialCharCount;
        cursorPosition += specialCharDiff;

        contactInputs[4].value = input;
        contactInputs[4].selectionStart = cursorPosition;
        contactInputs[4].selectionEnd = cursorPosition;
    }
}

function AddressEventHandler(event) {
    // 1) Always clear the interval (to prevent spam)
    clearInterval(addressInterval);
    // 2) Verify all required address fields are entered
    if (contactInputs[5].value.length > 4) {
        // Set loading animation
        addressLoad.classList.add("active");
        // Set an interval
        addressInterval = createInterval(CheckAddressAutofill, 1.5);
    }
}
async function CheckAddressAutofill() {
    // Checks to autofill address
    let geoapifyInfo = await Geoapify.AutoComplete(contactInputs[5].value);
    // 1) End loading animation
    addressLoad.classList.remove("active");
    // 2) Create address dropdown
    geoapifyAutofillDiv.innerHTML = "";
    let dropdownInfo = geoapifyInfo.map(result => {
        let housenumber = result.housenumber != undefined ? result.housenumber : "???";
        let street = result.street != undefined ? result.street : "???";
        let city = result.city != undefined ? result.city : "???";
        let state_code = result.state_code != undefined ? result.state_code : "???";
        let postcode = result.postcode != undefined ? result.postcode : "???";
        return createElement({
            tag: "div",
            classList: ["geoapify-autofill-row"],
            innerText: `${housenumber} ${street}, ${city}, ${state_code} ${postcode}`,
            events: [{
                type: "click",
                handler: (() => {
                    // autofill the data
                    contactInputs[5].value = result.address_line1 != undefined ? result.address_line1 : "???";
                    contactInputs[7].value = result.city != undefined ? result.city : "???";
                    contactInputs[8].value = result.postcode != undefined ? result.postcode : "???";
                    // remove results (hiding happens via css)
                    geoapifyAutofillDiv.innerHTML = "";
                    // Execute CheckZipcode
                    CheckZipcode();
                })
            }]
        })
    }, {});
    // 3) Display dropdown
    geoapifyAutofillDiv.append(...dropdownInfo);
}
function ZipcodeEventHandler(event) {
    // 1) Always clear the interval (to prevent spam)
    clearInterval(zipcodeInterval);
    // 2) If the zipcode entered is structurally valid
    if (contactInputs[8].checkValidity() || contactInputs[8].checkValidity()) {
        // Set loading animation
        zipcodeLoad.classList.add("active");
        // Set an interval
        zipcodeInterval = createInterval(CheckZipcode, 1.5);
    }
}

async function CheckZipcode() {
    // Checks if a zipcode will be delivered to
    let deliveryInfo = await API.GetSingle(`User/VerifyZipcode/${contactInputs[8].value}`);
    // 1) End Loading Animation
    zipcodeLoad.classList.remove("active");
    // 2) Enter deliveryInfo
    if (deliveryInfo.Zipcode != null) {
        orderObj.OrderDetails.Zipcode = deliveryInfo.Zipcode;
        orderObj.OrderDetails.ShippingCost = deliveryInfo.ShippingCost;
        orderObj.DefaultInformation.TaxRate = deliveryInfo.TaxRate;
        orderObj.DefaultInformation.Subtotal = Math.round(((orderObj.DefaultInformation.TotalCost / (1 + (deliveryInfo.TaxRate / 100))) + Number.EPSILON) * 100) / 100;
        orderObj.DefaultInformation.TaxCost = Math.round(((orderObj.DefaultInformation.TotalCost - orderObj.DefaultInformation.Subtotal) + Number.EPSILON) * 100) / 100;
    } else {
        // reset orderObj
        orderObj.OrderDetails.Zipcode = null;
        orderObj.OrderDetails.ShippingCost = 0;
        orderObj.DefaultInformation.Subtotal = null;
        orderObj.DefaultInformation.TaxCost = null;
        // show message
        ShowMessage("This zipcode is unavailable for delivery at this moment.|The current delivery radius is most of Ventura and Los Angeles County.");
    }
    // 3) Always rebuild cost info (invalid zipcodes have no data)
    BuildCostInfo();
}

function UpdateSpecialInstructionLength() {
    instructionsCount.innerText = contactInputs[9].value.length;
}

function ContactFormSubmitEventListener(event) {
    event.preventDefault() // Prevents page reload
    contactInputs.forEach(input => {
        // An input to correct a bad field will fire an invalid event. If the field becomes valid, it will stop reporting invalid
        input.addEventListener("input", () => {
            input.dispatchEvent(new Event("invalid"));
        });
    }, { once: true });

    if (contactForm.reportValidity()) {
        orderObj.UserDetails.FirstName = contactInputs[2].value;
        orderObj.UserDetails.LastName = contactInputs[3].value;
        orderObj.UserDetails.Email = contactInputs[0].value;
        orderObj.UserDetails.Telephone = contactInputs[4].value;
        orderObj.UserDetails.MailingList = contactInputs[1].checked;
    }
}
// #endregion Checkout Details (Left Column)

// #region Checkout Summary (Right Column)
async function BuildCartSummary() {
    // 1) Run Order Inventory Check API
    await CheckInventory();
    // 2) Build Order Items
    orderObj.DefaultCartDetails.forEach(orderItem => {
        checkoutCartSummary.append(BuildOrderItem(orderItem));
    });
}

async function CheckInventory() {
    // 1) Run API to get orderObj
    await API.Post("IceCream/Inventory/Check", Cart.OrderCartModel).then((response) => response.json())
        .then((data) => {
            orderObj.DefaultCartDetails = Cart.Order.map((item) => {
                item[pintKey].Quantity = data.find(d => d.Flavor.replace(" ", "-") == item[flavorKey]).Pints;
                item[quartKey].Quantity = data.find(d => d.Flavor.replace(" ", "-") == item[flavorKey]).Quarts;
                if (item[pintKey].Quantity > 0 || item[quartKey].Quantity > 0) {
                    return item;
                }
            }).filter(i => i != undefined);
        });
    // 2) Compare Cart.Order and orderObj
    let orderObjLength = orderObj.DefaultCartDetails.reduce((acc, curr) => {
        orderObj.DefaultInformation.TotalCost += (curr[pintKey].Quantity * curr[pintKey].Price) + (curr[quartKey].Quantity * curr[quartKey].Price);
        acc = acc + curr[pintKey].Quantity + curr[quartKey].Quantity;
        return acc;
    }, 0);
    if (orderObjLength < Cart.OrderLength) {
        // If final length is different (eg smaller), notify the user
        checkoutDiscrepancy.innerText = "Some items are no longer available. Sorry for the inconvenience.";
    }
    // 3) Set Default Total Price
    checkoutTotalCost.innerText = `$${orderObj.DefaultInformation.TotalCost}`;
}
function BuildOrderItem(orderItem) {
    // 1) Build containers
    let thumbnailContainer = {
        tag: "div",
        classList: ["checkout-thumbnail"],
        childNodes: [importer.ImportThumbnail(orderItem[photoKey]).Object]
    }
    let flavorNameContainer = {
        tag: "div",
        classList: ["checkout-flavor"],
        children: [{
            tag: "h4",
            classList: ["checkout-header"],
            innerText: orderItem[flavorKey].replace("-", " ")
        }]
    }
    let quantityContainer = {
        tag: "div",
        classList: ["checkout-quantity"],
        children: [{
            tag: "h5",
            classList: ["checkout-header", "quantity"],
            innerText: (orderItem[pintKey].Price > 0 && orderItem[pintKey].Quantity > 0) ? `${orderItem[pintKey].Quantity} Pint${(orderItem[pintKey].Quantity > 1 || orderItem[pintKey].Quantity == 0) ? "s" : ""}` : ""
        }, {
            tag: "h5",
            classList: ["checkout-header", "quantity"],
            innerText: (orderItem[quartKey].Price > 0 && orderItem[quartKey].Quantity > 0) ? `${orderItem[quartKey].Quantity} Quart${(orderItem[quartKey].Quantity > 1 || orderItem[quartKey].Quantity == 0) ? "s" : ""}` : ""
        }]
    }
    let priceContainer = {
        tag: "div",
        classList: ["checkout-price"],
        children: [{
            tag: "h5",
            classList: ["checkout-header"],
            innerText: (orderItem[pintKey].Price > 0 && orderItem[pintKey].Quantity > 0) ? `at $${orderItem[pintKey].Price} each` : ""
        }, {
            tag: "h5",
            classList: ["checkout-header"],
            innerText: (orderItem[quartKey].Price > 0 && orderItem[quartKey].Quantity > 0) ? `at $${orderItem[quartKey].Price} each` : ""
        }]
    }
    // 2) Build object and return container
    let domObject = {
        tag: "div",
        classList: ["checkout-order-item"],
        children: [thumbnailContainer, flavorNameContainer, quantityContainer, priceContainer]
    }
    return createElement(domObject);
}

function DiscountEventHandler(event) {
    // 1) Always clear the interval (to prevent spam)
    clearInterval(discountInterval);
    // 2) If the discount entered is structurally valid
    if (discountInput.checkValidity()) {
        // Set loading animation
        discountLoad.classList.add("active");
        // Set an interval
        discountInterval = createInterval(CheckDiscount, 2);
    }
}

async function CheckDiscount() {
    let discountInfo = await API.GetSingle(`User/VerifyReferral/${discountInput.value}`);
    // 1) End Loading Animation
    discountLoad.classList.remove("active");
    // 2) Enter discountInfo
    if (discountInfo.Text != null && discountInfo.DiscountAmount >= orderObj.DiscountInformation.Amount) {
        // Verify discount can be applied
        if (orderObj.DefaultInformation.TotalCost >= discountInfo.MinimumOrderValue) {
            // If no Zipcode yet but total cost is greater than minimum, warn user they need to enter a zipcode to see full price info
            if (orderObj.OrderDetails.Zipcode == null) {
                ShowMessage("Please enter a zipcode to see full pricing breakdown");
            }
            // only set a new discount percent if it's equal to or bigger than the previously entered one
            orderObj.OrderDetails.ReferralText = discountInfo.Text;
            orderObj.DiscountInformation.Amount = discountInfo.DiscountAmount;
            orderObj.DiscountInformation.MinimumOrderValue = discountInfo.MinimumOrderValue;
            // Only rebuild if code found
            BuildCostInfo();
        } else {
            // order minimum not hit, show message
            ShowMessage(`The order minimum for this discount code is $${discountInfo.MinimumOrderValue}|Please add more to your cart or try another code!`);
        }
    } else {
        // no code found
        ShowMessage(`Sorry, there is no discount for code "${discountInput.value}"`);
    }
}

function BuildCostInfo() {
    // Update info if discount
    if (orderObj.OrderDetails.ReferralText != null) {
        orderObj.OrderDetails.TotalCost = orderObj.DefaultInformation.TotalCost - orderObj.DiscountInformation.Amount;
    }
    // Load order info
    if (orderObj.OrderDetails.Zipcode != null) {
        // If a valid zipcode has been found
        if (orderObj.OrderDetails.ReferralText != null) {
            // If a valid referral code has been found calculate Order Subtotal and TaxCost
            orderObj.OrderDetails.Subtotal = Math.round(((orderObj.OrderDetails.TotalCost / (1 + (orderObj.DefaultInformation.TaxRate / 100))) + Number.EPSILON) * 100) / 100;
            orderObj.OrderDetails.TaxCost = Math.round(((orderObj.OrderDetails.TotalCost - orderObj.OrderDetails.Subtotal) + Number.EPSILON) * 100) / 100;
            // Show on screen
            checkoutSubtotal.innerHTML = `<s><span>$${orderObj.DefaultInformation.Subtotal}</span></s> $${orderObj.OrderDetails.Subtotal}`;
            checkoutTaxCost.innerText = `$${orderObj.OrderDetails.TaxCost}`;
            checkoutTotalCost.innerHTML = `<s><span>$${orderObj.DefaultInformation.TotalCost + orderObj.OrderDetails.ShippingCost}<span></s> $${orderObj.OrderDetails.TotalCost + orderObj.OrderDetails.ShippingCost}`;

        } else {
            // No referral code
            checkoutSubtotal.innerText = `$${orderObj.DefaultInformation.Subtotal}`;
            checkoutTaxCost.innerText = `$${orderObj.DefaultInformation.TaxCost}`;
            checkoutShipping.innerText = `$${orderObj.OrderDetails.ShippingCost}`;
            checkoutTotalCost.innerText = `$${orderObj.DefaultInformation.TotalCost + orderObj.OrderDetails.ShippingCost}`;
        }
    } else {
        checkoutSubtotal.innerText = ``;
        checkoutTaxCost.innerText = ``;
        checkoutShipping.innerText = ``;
        //checkoutTotalCost.innerText = ``;
    }
}

async function OrderSubmitEventHandler(event) {
    event.preventDefault();
    // 1) Always clear the interval and disable submit (to prevent spam)
    clearInterval(orderSubmitInterval);
    checkoutSubmit.disabled = true;

    // 2) Check if contact form is valid via submission
    contactForm.dispatchEvent(new Event("submit"));

    // 3) If contact form is valid, continue
    if (contactForm.checkValidity()) {
        // Disable all the inputs
        contactInputs.forEach(input => input.disabled = true);
        discountInput.disabled = true;
        // Set loading animation
        submitLoad.classList.add("active");
        // Build orderObj
        orderObj.OrderDetails.ReferralText = discountInput.value;
        orderObj.OrderDetails.AddressOne = contactInputs[5].value;
        orderObj.OrderDetails.AddressTwo = contactInputs[6].value.length > 0 ? contactInputs[6].value : null;
        orderObj.OrderDetails.City = contactInputs[7].value;
        orderObj.OrderDetails.Zipcode = contactInputs[8].value;
        orderObj.OrderDetails.Note = contactInputs[9].value.length > 0 ? contactInputs[9].value : null;

        orderObj.CartDetails = orderObj.DefaultCartDetails.map((item) => {
            return {
                Flavor: item[flavorKey].replace("-", " "),
                Pints: item[pintKey].Quantity != undefined ? item[pintKey].Quantity : item[pintKey],
                Quarts: item[quartKey].Quantity != undefined ? item[quartKey].Quantity : item[quartKey]
            }
        });
        // Set an interval
        orderSubmitInterval = createInterval(SubmitOrder, 1.5);
    }
    checkoutSubmit.disabled = false; // remove (move?) after testing
}

async function SubmitOrder() {
    // Run API
    let orderResponse = await API.Post("User/Order", orderObj);
    let data = await orderResponse.json();
    let jsonData = JSON.parse(JSON.stringify(data));
    if (jsonData.Success) {
        // Remove everything from cart
        Cart.RemoveAllFromOrder();
        // Put success data into the session storage
        UserStorage.NewSessionItem("OrderDetails", jsonData);
        // redirect to success page
        window.location.href = `Placed`;
    } else {
        ShowMessage(jsonData.Message);
    }
    // Re-enable inputs
    contactInputs.forEach(input => input.disabled = false);
    discountInput.disabled = false;
    // End loading animation 
    submitLoad.classList.remove("active");
}
// #endregion Checkout Summary(Right Column)

// #region Extra Functions

function ShowMessage(message) {
    submitMessage.innerHTML = "";
    message.split("|").forEach(line => {
        submitMessage.append(createElement({
            tag: "span",
            innerText: line
        }));
    });
    submitMessage.classList.add("active");
}

function CloseMessage() {
    // If a message is shown and close is called, the message will fade
    if (submitMessage.classList.contains("active")) {
        // Remove the class, wait the transition length, and then remove the text
        submitMessage.classList.remove("active");
        createInterval(() => {
            submitMessage.innerHTML = "";
        }, 0.5);
    }
}

// #endregion Extra Functions

(async () => {
    if (Cart.OrderLength < 1) {
        window.location.href = `../Home`;
    }
    await BuildCartSummary();
})();