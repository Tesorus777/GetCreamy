// #region Imports

import { Importer } from "../infrastructure/importer.js";

// #endregion

// #region Variables

const importer = new Importer("../lib/images/recipe", true);

// Order Keys
const flavorKey = "RecipeName";
const photoKey = "Photo";
const pintKey = "Pint";
const quartKey = "Quart";

// DOM Objects
const messageHeader = querySelector(`div#OrderMessage`);

// Checkout Details (Left Column)
const contactHeaders = querySelectorAll(`div.order-customer-details h3.order-header, div.order-customer-details h5.order-header`)

// Checkout Summary (Right Column)
const orderSummary = querySelector(`div#OrderContents`);

const discountCode = querySelector(`h3#OrderDiscount`);

const priceHeaders = querySelectorAll(`div.order-price-container h3.order-header.price`);

// #endregion Variables

// #region Order Details (Left Column)
function FormatTelephone(telephone) {
    let input = telephone.replace(/\D/g, '');
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

    return input;
}
// #endregion Order Details (Left Column)


// #region Order Summary (Right Column)
function BuildOrderItem(orderItem) {
    // 1) Build containers
    let thumbnailContainer = {
        tag: "div",
        classList: ["order-thumbnail"],
        childNodes: [importer.ImportThumbnail(orderItem).Object]
    }
    let flavorNameContainer = {
        tag: "div",
        classList: ["order-flavor"],
        children: [{
            tag: "h4",
            classList: ["order-header"],
            innerText: orderItem[flavorKey]
        }]
    }
    let quantityContainer = {
        tag: "div",
        classList: ["order-quantity"],
        children: [{
            tag: "h5",
            classList: ["order-header", "quantity"],
            innerText: (orderItem[pintKey].Price > 0 && orderItem[pintKey].Quantity > 0) ? `${orderItem[pintKey].Quantity} Pint${(orderItem[pintKey].Quantity > 1 || orderItem[pintKey].Quantity == 0) ? "s" : ""}` : ""
        }, {
            tag: "h5",
            classList: ["order-header", "quantity"],
            innerText: (orderItem[quartKey].Price > 0 && orderItem[quartKey].Quantity > 0) ? `${orderItem[quartKey].Quantity} Quart${(orderItem[quartKey].Quantity > 1 || orderItem[quartKey].Quantity == 0) ? "s" : ""}` : ""
        }]
    }
    let priceContainer = {
        tag: "div",
        classList: ["order-price"],
        children: [{
            tag: "h5",
            classList: ["order-header"],
            innerText: (orderItem[pintKey].Price > 0 && orderItem[pintKey].Quantity > 0) ? `at $${orderItem[pintKey].Price} each` : ""
        }, {
            tag: "h5",
            classList: ["order-header"],
            innerText: (orderItem[quartKey].Price > 0 && orderItem[quartKey].Quantity > 0) ? `at $${orderItem[quartKey].Price} each` : ""
        }]
    }
    // 2) Build object and return container
    let domObject = {
        tag: "div",
        classList: ["order-item"],
        children: [thumbnailContainer, flavorNameContainer, quantityContainer, priceContainer]
    }
    return createElement(domObject);
}

async function GetOrderDiscount(discountCode) {
    let discountInfo = await API.GetSingle(`User/VerifyReferral/${discountCode}`);
    if (discountInfo.Text != null) {
        return `Code "${discountInfo.Text}" applied!\nYour order total has been reduced by $${discountInfo.DiscountAmount}.`;
    }
    return ``;
}
// #endregion Order Summary (Right Column)

(async () => {
    // Verify if orderDetails is null
    //if (orderDetails == null) {
    //    window.location.href = "../Home";
    //}
    console.log(orderDetails);
    // 3) Set information
    const userInfo = orderDetails.UserInformation;
    const order = orderDetails.Order;
    const content = orderDetails.OrderContent;
    const message = orderDetails.Message;
    const photos = orderDetails.OrderPhotos;
    // 2) Build screen details
    message.split("|").forEach(line => {
        messageHeader.append(createElement({
            tag: "h2",
            classList: ["order-header", "message"],
            innerText: line
        }));
    });
    // Order Details (Left Column)
    contactHeaders[0].innerText = `${userInfo.FirstName} ${userInfo.LastName}`;
    contactHeaders[1].innerText = `${userInfo.Email}`;
    contactHeaders[2].innerText = `${FormatTelephone(userInfo.Telephone)}`;
    contactHeaders[3].innerText = `${order.AddressOne}${(order.AddressTwo != null) && (order.AddressTwo != "") ? ", " + order.AddressTwo : ""}`;
    contactHeaders[4].innerText = `${order.City}, ${order.Zipcode}`;
    contactHeaders[5].innerText = order.Note == null ? "" : order.Note.length > 34 ? `${order.Note.slice(0, 34)}...` : order.Note;
    // Order Summary (Right Column)
    // need to reduce content into photos
    let fixedContent = photos.map(p => {
        p[pintKey] = {
            Quantity: content.reduce((acc, curr) => { return acc += (curr.RecipeName == p.RecipeName) && (!curr.PintorQuart) ? 1 : 0; }, 0),
            Price: content.find(c => (c.RecipeName == p.RecipeName) && (!c.PintorQuart)).Price
        }
        p[quartKey] = {
            Quantity: content.reduce((acc, curr) => { return acc += (curr.RecipeName == p.RecipeName) && (curr.PintorQuart) ? 1 : 0; }, 0),
            Price: content.find(c => (c.RecipeName == p.RecipeName) && (c.PintorQuart)).Price
        }
        return p;
    });

    fixedContent.forEach(item => {
        orderSummary.append(BuildOrderItem(item));
    });

    discountCode.innerHTML = await GetOrderDiscount(order.ReferralText);
    priceHeaders[0].innerText = `$${Math.round((order.Subtotal + Number.EPSILON) * 100) / 100}`;
    priceHeaders[1].innerText = `$${Math.round((order.TaxCost + Number.EPSILON) * 100) / 100}`;
    priceHeaders[2].innerText = `$${order.ShippingCost}`;
    priceHeaders[3].innerText = `$${Number(order.Subtotal) + Number(order.TaxCost) + Number(order.ShippingCost)}`;
    // 3) Clear Session
    UserStorage.RemoveSessionItem("OrderDetails");
})();