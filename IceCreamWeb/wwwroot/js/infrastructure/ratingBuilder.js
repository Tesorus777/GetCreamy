class RatingBuilder {
    constructor(max = 10) {
        this._max = max;
        this._emptyStar = "&#9734";
        this._halfStar = "";
        this._fullStar = "&#9733";
    }

    // #region Getters and Setters

    // #endregion Getters and Setters

    // #region Methods
    Build(element, rating) {
        // Update this later. This makes a rounded rating, no half stars

        let fullNum = Math.floor((rating / this._max) * (this._max / 2));
        let emptyNum = (this._max / 2) - fullNum;

        let starSpan = document.createElement("span");
        starSpan.classList.add("recipe-star");
        for (let i = 0; i < fullNum; i++) {
            starSpan.innerHTML += this._fullStar;
        }
        for (let i = 0; i < emptyNum; i++) {
            starSpan.innerHTML += this._emptyStar;
        }
        element.append(starSpan);
    }
    // #endregion Methods
}

export { RatingBuilder };