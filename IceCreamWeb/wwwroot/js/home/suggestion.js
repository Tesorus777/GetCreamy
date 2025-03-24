// workflow
// 1) get info from suggestion box
    // a) verify human input via pattern checking (non-required fields must match pattern if filled)
        // i) Must reset setCustomValidity in invalid functions: with message, will report invalid again where message can be reset
    // b) validate input (eg: can't ask for marketing/followup email without an email)
// 2) send to suggestion post api
// 3) clear form upon successful post (don't clear if unsuccessful so user can try again)
    // a) send thank you message

// #region Module Imports

// #endregion

// #region Variables

const suggestionForm = querySelector("#SuggestionForm");
const suggestionInputs = querySelectorAll(`form#SuggestionForm input:not([type="submit"]), form#SuggestionForm textarea`);
const suggestionTextAreaCount = querySelector(`#SuggestionDescriptionCount`);
const suggestionSubmit = querySelector(`form#SuggestionForm input[type="submit"]`);
const suggestionToast = querySelector(`div#SuggestionToast`);

let previousSuggestion = {};

// #endregion Variables

// #region EventListeners

suggestionInputs.forEach(input => {
    input.addEventListener("input", (e) => {
        if (input.checkValidity()) {
            input.setCustomValidity("");
        }
    });
});
// FirstName
suggestionInputs[0].addEventListener("invalid", () => {
    if (!suggestionInputs[0].validity.valueMissing && suggestionInputs[0].validity.patternMismatch) {
        suggestionInputs[0].setCustomValidity("Please only use letters and keep it under 50 characters");
    } else if (suggestionInputs[0].validity.valueMissing) {
        suggestionInputs[0].setCustomValidity("Please enter your first name");
    } else {
        suggestionInputs[0].setCustomValidity("");
    }
});
// LastName
suggestionInputs[1].addEventListener("invalid", () => {
    if (!suggestionInputs[1].validity.valueMissing && (suggestionInputs[1].validity.patternMismatch || suggestionInputs[1].validity.toolong)) {
        suggestionInputs[1].setCustomValidity("Please only use letters and keep it under 50 characters")
    } else {
        suggestionInputs[1].setCustomValidity("");
    }
});
// Telephone
suggestionInputs[2].addEventListener("invalid", () => {
    if (!suggestionInputs[2].validity.valueMissing && !suggestionInputs[2].validity.patternMismatch) {
        suggestionInputs[2].setCustomValidity("Please enter a valid phone number")
    } else {
        suggestionInputs[2].setCustomValidity("");
    }
});
// Email
suggestionInputs[3].addEventListener("invalid", () => {
    // Check against HTML built in pattern
    if (suggestionInputs[3].validity.patternMismatch) {
        suggestionInputs[3].setCustomValidity("Please enter a valid email adderss");
    } else {
        suggestionInputs[3].setCustomValidity("");
    }
});
// Marketing
suggestionInputs[4].addEventListener("change", () => {
    // If marketing requested, email required
    if (suggestionInputs[4].checked) {
        suggestionInputs[3].required = true;
    } else {
        suggestionInputs[3].required = false;
    }
});
// Flavor
suggestionInputs[5].addEventListener("invalid", () => {
    if (!suggestionInputs[5].validity.valueMissing && suggestionInputs[5].validity.patternMismatch) {
        suggestionInputs[5].setCustomValidity("Please only use letters and keep it under 50 characters");
    } else if (suggestionInputs[5].validity.valueMissing) {
        suggestionInputs[5].setCustomValidity("Please give your flavor a name");
    } else {
        suggestionInputs[5].setCustomValidity("");
    }
});
// Description
suggestionInputs[6].addEventListener("input", UpdateDescriptionLength);
suggestionInputs[6].addEventListener("invalid", () => {
    if (suggestionInputs[6].validity.toolong) {
        suggestionInputs[6].setCustomValidity("Please keep it under 2500 characters");
    } else {
        suggestionInputs[6].setCustomValidity("");
    }
});

// Submit (button or enter)
suggestionForm.addEventListener("submit", SubmitForm);

// #endregion Event Listeners

function UpdateDescriptionLength() {
    // Updates description character count
    suggestionTextAreaCount.innerText = suggestionInputs[6].value.length;
}

async function SubmitForm(e) {
    e.preventDefault(); // Prevents page reload
    // Double check: checkValidity() fires invalid event if form not valid
    if (suggestionForm.checkValidity()) {
        // 1) Build suggestion
        let suggestion = {};
        suggestion.UserId = UserStorage.Cookie.UserId;
        suggestion.FirstName = suggestionInputs[0].value;
        suggestion.LastName = suggestionInputs[1].value;
        suggestion.Telephone = suggestionInputs[2].value;
        suggestion.Email = suggestionInputs[3].value;
        suggestion.MailingList = suggestionInputs[4].checked;
        suggestion.Suggestion = suggestionInputs[5].value;
        suggestion.Notes = suggestionInputs[6].value;
        // Submit suggestion
        // Dummy check to ensure button is not spammed without suggestion changing
        if (suggestion !== previousSuggestion) {
            // 2) Disable Submit button
            suggestionSubmit.disabled = true;
            // 3) Submit
            await API.Post("UserInfo/User/Suggestion", suggestion).then(response => {
                // 4) Enable Submit button
                suggestionSubmit.enable = true;
                // 5) Toast Pop-up
                suggestionToast.classList.add("suggestion-toast-popped");
            });
        }
    } else {
        // If invalid, reset all custom validity and report validity to re-check
        // This is a fail-safe
        suggestionInputs.forEach(input => {
            input.setCustomValidity("");
        });
        suggestionForm.reportValidity();
    }
}