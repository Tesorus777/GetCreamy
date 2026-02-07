export class Importer {
    // Goal: Enter an array of file extensions and return
    // a) Array of objects with appropriate properties
    // b) Same as (a) + a dom object

    // Usage
    // Constructor:
        // folderRoot = root folder for images
    // Methods:
        // Import => takes in a single file of standard file model (eg. PhotoModel)
            // PhotoModel contains Folder, FileName, LowResFileName, ThumbnailFileName, AltText, SortOrder
            // Use => set variable importObjectArray = fileArray.map(i => Import(i))
        // ImportThumbnail => sets FileName to ThumbnailFileName and runs Import(file)
        // Treat all other methods as internal use only
    constructor(folderRoot = "../lib/images") {
        // Set externally
        this._folderRoot = folderRoot;
        // Set internally
        this._styleSheet = "/css/infrastructure/importer/importer.css";
        // Images
        this._imageTypes = ["png", "jpg", "jpeg", "gif"];
        this._lazyContainerClasses = ["import-lazy-container"];
        this._lazyClasses = ["import-lazy-img"];
        this._imageClasses = [];
        this._imageLoadedClasses = ["import-loaded"];

        this._imageLoaded = this.ImageLoaded.bind(this);

        this.AddStyles();
    }

    // #region Methods

    AddStyles() {
        let head = querySelector("head");
        let linkSheet = querySelector(`link[href='${this._styleSheet}']`);
        if (!linkSheet) {
            let sheet = {
                tag: "link",
                rel: "stylesheet",
                href: this._styleSheet
            };
            head.append(createElement(sheet));
        }
    }

    Import(file) {
        // All file objects must contain "FileName" property
        let fileObj = {};
        // 1) Build object properties object
        fileObj.Properties = this.BuildObjectProperties(file);
        // 2) Create dom object
        fileObj.Object = createElement(fileObj.Properties);
        // 4) Return object
        return fileObj;
    }

    ImportThumbnail(file) {
        file.FileName = file.ThumbnailFileName;
        return this.Import(file);
    }

    DetermineFileType(fileExtension) {
        if (this._imageTypes.includes(fileExtension)) {
            return "img";
        } else {
            return "div";
        }
    }

    BuildObjectProperties(file) {
        // Mandatory:
            // Every object needs a "tag" and a "classList"
        let properties = {};
        let fileType = this.DetermineFileType(file.FileName.split(".").slice(-1)[0]);
        // Image
        if (fileType == "img") {
            properties = {
                tag: "div",
                classList: this._lazyContainerClasses,
                children: [{
                    tag: "div",
                    style: `background-image: url("${this._folderRoot}/${file.Folder}/${file.LowResFileName}")`,
                    classList: this._lazyClasses,
                    children: [{
                        tag: "img",
                        src: `${this._folderRoot}/${file.Folder}/${file.FileName}`,
                        loading: "lazy",
                        alt: file.AltText,
                        classList: this._imageClasses,
                        events: [{
                            type: "load",
                            handler: this._imageLoaded
                        }]
                    }]
                }]
            };
        }

        return properties;
    }

    ImageLoaded(event) {
        event.target.classList.add(...this._imageLoadedClasses);
    }

    // #endregion Methods

}

export class Carousel extends Importer {
    constructor(imageRoot, imageItems, selector, infinteLoop = true, autoScroll = false, autoIntervalSeconds = 3, pauseIntervalSeconds = 15) {
        // Importer
        super(imageRoot, true);
        // Set externally
        this._location = querySelector(selector);
        this._imageItems = imageItems;
        // #region Set Internally
        // Icons
        this._viewBox = "0 0 16 16";
        this._circlePath = `<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>`;
        this._leftArrowPath = `<path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>`;
        this._rightArrowPath = `<path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>`;

        // Style sources
        this._styleSheet = "/css/infrastructure/importer/imageCarousel.css";
        // Object arrays
        this._imageObjArray = [];

        // DOM object arrays
        this._carouselViewport;
        this._carouselPaginationViewport;
        // Classes
        this._containerClasses = ["carousel-container"]; // attached to location
        this._viewPortClasses = ["carousel-viewport"]; // attached to image viewport
        this._paginationClasses = ["carousel-pagination"]; // attached to pagination container
        this._itemClasses = ["carousel-object"]; // Classes for viewport items (images)
        this._activeItemClass = "carousel-active"; // Active class for viewport items (images)
        this._arrowClasses = ["carousel-pagination-arrow"];
        this._circleClasses = ["carousel-pagination-circle"];
        this._activePaginationClass = "carousel-pagination-active";

        // Internal Selection Tracking Variables
        this._currentSelectedIndex = 0;
        this._maxViewIndex = imageItems.length - 1;

        // Selected item and pagination
        this._viewableAttribute = "carousel-viewable";

        // Functions
        this._previousItem = this.PreviousItem.bind(this);
        this._nextItem = this.NextItem.bind(this);
        this._specificItem = this.SpecificItem.bind(this);
        this._startAutoScroll = this.StartAutoScroll.bind(this);
        this._stopAutoScroll = this.StopAutoScroll.bind(this);
        // Automation
        this._infiniteLoop = infinteLoop;
        this._autoScroll = autoScroll && infinteLoop && (imageItems.length > 1); // Need to set both autoscroll and infiniteloop on and more than one image item
        this._autoScrollReverse = false; // false = NextItem (L to R), true = PreviousItem (R to L)
        this._autoScrollRunning = false;
        this._autoScrollId;
        this._timer = autoIntervalSeconds * 1000;  // 3 seconds per image default
        this._timerPause = pauseIntervalSeconds * 1000; // 15 seconds pause until restart autoscroll default
        this._infiniteScrollDelay = 350;
        // Mobile Swiping
        this._touchstartX = 0; // unit = px
        this._touchendX = 0; // unit = px
        this._scrollThreshold = 50; // unit = px
        // #endregion Set Internally

        this.AddStyles(); // Only adds if styles missing
        this.Initialize();
    }

    // #region Get and Set
    get Location() {
        return this._location;
    }
    set Location(selector) {
        this._location = querySelector(selector);
    }
    get ImageObjArray() {
        return this._imageObjArray;
    }
    set ImageObjArray(imageObjArray) {
        this._imageObjArray = imageObjArray;
    }
    get CurrentSelectedItem() {
        return querySelector(`.${this._activeItemClass}`);
    }
    set CurrentSelectedItem(viewableIndex) {
        // Can only select viewable items
        let viewPortItems = querySelectorAll(`[${this._viewableAttribute}="true"].${this._itemClasses.join(".")}`);
        viewPortItems.map(i => i.classList.remove(this._activeItemClass));
        viewPortItems[viewableIndex].classList.add(this._activeItemClass);
    }
    get CurrentSelectedPagination() {
        return querySelector(`svg.${this._activePaginationClass}`);
    }
    set CurrentSelectedPagination(index) {
        let paginationItems = querySelectorAll(`svg.${this._circleClasses.join(".")}`);
        paginationItems.map(i => i.classList.remove(this._activePaginationClass));
        paginationItems[index].classList.add(this._activePaginationClass);
    }
    get CurrentSelectedIndex() {
        return this._currentSelectedIndex;
    }

    set CurrentSelectedIndex(index) {
        this._currentSelectedIndex = index;
    }

    get CurrentTotalIndex() {
        return this._totalIndex;
    }
    set CurrentTotalIndex(index) {
        this._totalIndex = index;
    }
    get MaxViewIndex() {
        // Maximum index of viewable items
        return this._maxViewIndex;
    }

    // #endregion Get and Set

    // #region Methods

    AddStyles() {
        let head = querySelector("head");
        let linkSheet = querySelector(`link[href='${this._styleSheet}']`);
        if (!linkSheet) {
            let sheet = {
                tag: "link",
                rel: "stylesheet",
                href: this._styleSheet
            };
            head.append(createElement(sheet));
        }
    }

    Initialize() {
        // Document Event Listeners
        document.addEventListener("OpenCart", this._stopAutoScroll);
        document.addEventListener("CloseCart", this._startAutoScroll);
        // Add location classes
        this.Location.classList.add(...this._containerClasses);
        // Regardless of size of imageItems, import into ImageObjArray
        this.ImageObjArray = this._imageItems.map(i => this.Import(i));
        this.ImageObjArray.map((item, index, array) => {
            // Set the id, classList, and viewable attribute (for current selected item)
            item.Object.id = `carousel_${index}`;
            item.Object.classList.add(...this._itemClasses);
            if (index == 0) {
                // Can't do the fancy ternary operator as it will just add the null as a class (this is easier)
                item.Object.classList.add(this._activeItemClass);
            }
            item.Object.setAttribute(this._viewableAttribute, true);
        });
        // Build appropriate objects
        let carouselViewportEvents = [];
        let paginationChildNodes = [];
        if (this._imageItems.length > 1) {
            this.ImageObjArray.map((item, index, array) => {
                // Create Pagination Object
                item.PaginationObject = createElement({
                    tagNS: "svg",
                    viewBox: this._viewBox,
                    classList: [...this._circleClasses, index == 0 ? this._activePaginationClass : null],
                    innerHTML: this._circlePath,
                    events: [{
                        type: "click",
                        handler: this._specificItem
                    }],
                    // Custom Attributes
                    index: `#carousel_${index}`
                });
            });
            // If there is more than one image, create duplicate objects for infinte scroll
            this.ImageObjArray.unshift(this.Import(this._imageItems[this._maxViewIndex]));
            this.ImageObjArray.push(this.Import(this._imageItems[0]));
            // Create Pagination objects
            let leftArrow = createElement({
                tagNS: "svg",
                viewBox: this._viewBox,
                classList: this._arrowClasses,
                innerHTML: this._leftArrowPath,
                events: [{
                    type: "click",
                    handler: this._previousItem
                }]
            });
            let rightArrow = createElement({
                tagNS: "svg",
                viewBox: this._viewBox,
                classList: this._arrowClasses,
                innerHTML: this._rightArrowPath,
                events: [{
                    type: "click",
                    handler: this._nextItem
                }]
            });
            // Set viewable property of infinite scroll objects to false
            this.ImageObjArray[0].Object.classList.add(...[...this._itemClasses, null].filter(c => c !== null));
            this.ImageObjArray[0].Object.setAttribute(this._viewableAttribute, false);
            this.ImageObjArray[this.ImageObjArray.length - 1].Object.classList.add(...this._itemClasses);
            this.ImageObjArray[this.ImageObjArray.length - 1].Object.setAttribute(this._viewableAttribute, false);
            // Create pagination child nodes
            paginationChildNodes = [leftArrow, ...this.ImageObjArray.filter(item => item.PaginationObject != undefined).map(i => i.PaginationObject), rightArrow]
            // Set viewport events
            carouselViewportEvents = [
                {
                    type: "touchstart",
                    handler: ((event) => {
                        event.preventDefault();
                        this._touchstartX = event.changedTouches[0].screenX;
                    }),
                    passive: false
                },
                {
                    type: "touchend",
                    handler: ((event) => {
                        //event.preventDefault();
                        this._touchendX = event.changedTouches[0].screenX;
                        this.CheckDirection(event);
                    }),
                    passive: false
                }
            ];

        };
        // Create containers
        this._carouselViewport = createElement({
            tag: "div",
            classList: this._viewPortClasses,
            events: carouselViewportEvents,
            childNodes: this.ImageObjArray.map(i => i.Object)
        });
        this._carouselPaginationViewport = createElement({
            tag: "div",
            classList: this._paginationClasses,
            childNodes: paginationChildNodes
        });
        // Append
        this.Location.append(this._carouselViewport, this._carouselPaginationViewport);
        // Start Scroll
        this.ScrollToCurrentIndex(true);
        this.StartAutoScroll();
    }

    NextItem(event) {
        // 1) If there's an event, a human input interrupts the autoScroll
        if (event) {
            this.PauseAutoScroll();
        }
        // 2) Set Active Item
        let timer = 0;
        let snap = false;
        if (this.CurrentSelectedIndex < this.MaxViewIndex) {
            // 2a) if less than max, set new current item, pagination, and increase the index
            this.CurrentSelectedItem = this.CurrentSelectedIndex + 1;
            this.CurrentSelectedPagination = this.CurrentSelectedIndex + 1;
            this.CurrentSelectedIndex++;
        } else if (this.CurrentSelectedIndex == this.MaxViewIndex && this._infiniteLoop) {
            // 2b) if max, scroll one more, then snap to start
            timer = this._infiniteScrollDelay; // Wait for smooth scroll animation to end (there is no better solution at the moment)
            snap = true;
            // scroll beyond max
            this._carouselViewport.scrollTo({
                left: this._carouselViewport.childNodes[this._carouselViewport.childNodes.length - 1].offsetLeft,
                behavior: "smooth"
            });
            this.CurrentSelectedItem = 0;
            this.CurrentSelectedPagination = 0;
            this.CurrentSelectedIndex = 0;
        }
        // 3) Scroll to Selected
        setTimeout(() => {
            this.ScrollToCurrentIndex(snap);
        }, timer);
    }

    PreviousItem(event) {
        // 1) If there's an event, a human input interrupts the autoScroll
        if (event) {
            this.PauseAutoScroll();
        }
        // 2) Set Active Item
        let timer = 0;
        let snap = false;
        if (this.CurrentSelectedIndex > 0) {
            // 2a) if greater than 0, set new current item, pagination, and decrease the index
            this.CurrentSelectedItem = this.CurrentSelectedIndex - 1;
            this.CurrentSelectedPagination = this.CurrentSelectedIndex - 1;
            this.CurrentSelectedIndex--;
        } else if (this.CurrentSelectedIndex == 0 && this._infiniteLoop) {
            // 2b) if min, scroll one less, then snap to end
            timer = this._infiniteScrollDelay; // Wait for smooth scroll animation to end (there is no better solution at the moment)
            snap = true;
            // scroll beyond min
            this._carouselViewport.scrollTo({
                left: this._carouselViewport.childNodes[0].offsetLeft,
                behavior: "smooth"
            });
            this.CurrentSelectedItem = this.MaxViewIndex;
            this.CurrentSelectedPagination = this.MaxViewIndex;
            this.CurrentSelectedIndex = this.MaxViewIndex;
        }
        // 3) Scroll to Selected
        setTimeout(() => {
            this.ScrollToCurrentIndex(snap);
        }, timer);
    }

    SpecificItem(event) {
        // Set Active Item
        this.CurrentSelectedIndex = Number(event.target.getAttribute("index").split("_")[1]);
        this.CurrentSelectedItem.classList.remove(this._activeItemClass);
        querySelector(event.target.getAttribute("index")).classList.add(this._activeItemClass);
        this.CurrentSelectedPagination.classList.remove(this._activePaginationClass);
        event.target.classList.add(this._activePaginationClass);
        // If a specific item is selected, there was a human input to interrupt the autoScroll
        this.PauseAutoScroll();
        // Scroll to Selected
        this.ScrollToCurrentIndex();
    }

    ScrollToCurrentIndex(snap = false) {
        let scrollBehavior = "smooth";
        if (snap) {
            scrollBehavior = "instant";
        }
        this._carouselViewport.scrollTo({
            left: this.CurrentSelectedItem.offsetLeft,
            behavior: scrollBehavior
        });
    }

    // #region AutoScroll Methods

    StartAutoScroll() {
        if (this._autoScroll && !this._autoScrollRunning) {
            this._autoScrollId = this.RunAutoScroll();
            this._autoScrollRunning = true;
        }
    }

    RunAutoScroll() {
        const autoScrollId = setInterval(() => {
            if (this._autoScrollReverse) {
                this.PreviousItem();
            } else {
                this.NextItem();
            }
        }, this._timer);
        return autoScrollId;
    }

    PauseAutoScroll() {
        // 1) If running, pause the autoscroll
        if (this._autoScrollRunning) {
            this._autoScrollRunning = false;
            clearInterval(this._autoScrollId);
            setTimeout(() => { this.StartAutoScroll(); }, this._timerPause);
        }
    }

    StopAutoScroll() {
        // 1) If running, stop the autoscroll
        if (this._autoScrollRunning) {
            this._autoScrollRunning = false;
            clearInterval(this._autoScrollId);
        }
    }

    // #endregion AutoScroll Methods

    // #region Mobile Swipe Methods

    CheckDirection(event) {
        let scrollDistance = Math.abs(this._touchendX - this._touchstartX);
        if ((this._touchendX < this._touchstartX) && (scrollDistance > this._scrollThreshold)) {
            this.NextItem(event);
        }
        if ((this._touchendX > this._touchstartX) && (scrollDistance > this._scrollThreshold)) {
            this.PreviousItem(event);
        }
    }

    // #endregion Mobile Swipe Methods

    // #endregion Methods
}

export class MenuList extends Importer {
    constructor(imageRoot, selector) {
        // Importer
        super(imageRoot, true);
        // Set externally
        this._location = querySelector(selector);
        // #region Set Internally
        // Style Source
        this._styleSheet = "/css/infrastructure/importer/menuList.css";
        this._containerClasses = ["menuList-container"];
        // Objects
        this._menuList;
        this._imageList;
        // Classes
        this._menuListContainerClasses = ["menuList-menu-container"];
        this._menuListImageContainerClasses = ["menuList-menu-image-container"];

        this._menuItemImageContainerClasses = ["menuList-image-container"];

        this._menuItemContainerClasses = ["menuList-item-container"];
        this._menuItemTextClasses = ["menuList-item-text"];
        this._menuItemImageHoverClass = "menuList-image-hover";
        // #endregion

        this.AddStyles();
        this.Initialize();
    }

    // #region Get and Set
    get Location() {
        return this._location;
    }
    set Location(selector) {
        this._location = querySelector(selector);
    }
    get MenuItems() {
        return this._menuItems;
    }
    set MenuItems(menuItems) {
        this._menuItems = menuItems;
    }
    // #endregion Get and Set

    // #region Methods
    AddStyles() {
        let head = querySelector("head");
        let linkSheet = querySelector(`link[href='${this._styleSheet}']`);
        if (!linkSheet) {
            let sheet = {
                tag: "link",
                rel: "stylesheet",
                href: this._styleSheet
            };
            head.append(createElement(sheet));
        }
    }

    Initialize() {
        // Create Container
        this._container = createElement({
            tag: "div",
            classList: this._containerClasses
        });
        // Create Subcontainers
        this._menuList = createElement({
            tag: "div",
            classList: this._menuListContainerClasses
        });
        this._imageList = createElement({
            tag: "div",
            classList: this._menuListImageContainerClasses
        });
    }

    Build(menuItems) {
       /*
         MenuItems is an array of object which contains (at least) two properties:
           Item: a dom object or text (checked per array object entry) that serves as the menu list item
           Photo: a dom object that contains the standard 
       */
       // Build MenuItems
        this.MenuItems = menuItems.map(i => {
            // Create Image Container
            let imageItemContainer = createElement({
                tag: "div",
                classList: this._menuItemImageContainerClasses,
                childNodes: [this.Import(i.Photo).Object]
            });
            // return object
            return {
                ImageItem: imageItemContainer,
                Item: this.BuildMenuItem(i.Item)
            }
        });
        // Add Event Listeners
        this.MenuItems.forEach(i => {
            // Add Hover events to item
            i.Item.addEventListener("mouseover", (e) => { this.HoverImage(i.ImageItem, true) });
            i.Item.addEventListener("mouseout", (e) => { this.HoverImage(i.ImageItem) });
        })
        // Append and display
        this._menuList.append(...this.MenuItems.map(i => i.Item));
        this._imageList.append(...this.MenuItems.map(i => i.ImageItem));
        this._container.append(this._menuList, this._imageList);
        this.Location.append(this._container);
    }

    BuildMenuItem(item) {
        // Builds a menu item if the given item is just text
        if (!this.IsElement(item)) {
            let container = {
                tag: "div",
                classList: this._menuItemContainerClasses,
                children: [{
                    tag: "h3",
                    innerText: item, // item == string in this case
                    classList: this._menuItemTextClasses
                }]
            };
            return container;
        }
        
        return item;
    }

    IsElement(element) {
        return element instanceof Element || element instanceof HTMLDocument;
    }

    HoverImage(imageObj, toggle = false) {      
        imageObj.classList.remove(this._menuItemImageHoverClass);
        if (toggle) {
            imageObj.classList.add(this._menuItemImageHoverClass);
        }
        
    }
    // #endregion Methods
}

export default Carousel;