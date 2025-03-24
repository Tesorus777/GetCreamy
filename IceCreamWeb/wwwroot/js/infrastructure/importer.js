export class Importer {
    // Goal: Enter an array of file extensions and return
    // a) Array of objects with appropriate properties
    // b) Same as (a) + a dom object
    constructor(folderRoot = "../lib/images", createDomObjects = false) {
        // Set externally
        this._folderRoot = folderRoot;
        this._createDomObjects = createDomObjects;
        // Set internally
        this._imageTypes = ["png", "jpg", "jpeg", "gif"];
    }

    Import(file) {
        // All file objects must contain "FileName" property
        let fileObj = {};
        // 1) Determine file type
        try {
            fileObj.Type = this.DetermineFileType(file.FileName.split(".").slice(-1)[0]);
        } catch {
            fileObj.Type = "div";
        }
        
        // 2) Get file type properties
        fileObj.Properties = this.GetFileProperties(file, fileObj.Type);
        // 3) Create dom object if requested
        if (this._createDomObjects) {
            fileObj.Object = this.CreateDomObject(fileObj);
        }
        // 4) Return Obj
        return fileObj;
    }

    DetermineFileType(fileExtension) {
        if (this._imageTypes.includes(fileExtension)) {
            return "img";
        }
    }

    GetFileProperties(file, fileType) {
        let properties = {};
        // Image
        if (fileType == "img") {
            properties.src = `${this._folderRoot}/${file.Folder}/${file.FileName}`;
            properties.srcLowRes = file.LowResFileName ? `../lib/images/${file.Folder}/${file.LowResFileName}` : "";
            properties.alt = file.AltText;
            properties.loading = "lazy";
        }

        return properties;
    }

    CreateDomObject(fileObj) {
        let obj = document.createElement(fileObj.Type);
        Object.entries(fileObj.Properties).forEach(([key, value]) => {
            obj.setAttribute(key, value);
        });
        return obj;
    }
}

export class Carousel extends Importer {
    constructor(imageRoot, imageItems, selector, infinteLoop = true, autoScroll = false, autoIntervalSeconds = 3, pauseIntervalSeconds = 15) {
        // Importer
        super(imageRoot, true);
        this.ImageObjArray = imageItems.map(i => this.Import(i));
        // Set externally
        this._location = querySelector(selector);
        // #region Set Internally
        // Icons
        this._xmlns = "http://www.w3.org/2000/svg";
        this._viewBox = "0 0 16 16";
        this._circlePath = `<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>`;
        this._leftArrowPath = `<path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>`;
        this._rightArrowPath = `<path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z"/>`;

        // Style sources
        this._styleSheet = "/css/infrastructure/imageCarousel.css";
        // Objects
        this._carouselViewport;
        this._carouselPagination;
        // Classes
        this._containerClasses = ["carousel-container"]; // attached to location
        this._viewPortClasses = ["carousel-viewport"]; // attached to image viewport
        this._paginationClasses = ["carousel-pagination"]; // attached to pagination container
        this._itemClasses = ["carousel-object"]; // Classes for viewport items (images)
        this._activeItemClass = "carousel-active"; // Active class for viewport items (images)
        this._arrowClasses = ["carousel-pagination-arrow"]
        this._circleClasses = ["carousel-pagination-circle"];
        this._activePaginationClass = "carousel-pagination-active";
        // Functions
        this._previousItem = this.PreviousItem.bind(this);
        this._nextItem = this.NextItem.bind(this);
        this._specificItem = this.SpecificItem.bind(this);
        // Automation
        this._infiniteLoop = infinteLoop;
        this._autoScroll = autoScroll && infinteLoop; // Need to set both autoscroll and infiniteloop on
        this._autoScrollReverse = false; // false = NextItem (L to R), true = PreviousItem (R to L)
        this._autoScrollRunning = false;
        this._autoScrollId;
        this._timer = autoIntervalSeconds * 1000;  // 3 seconds per image default
        this._timerPause = pauseIntervalSeconds * 1000; // 15 seconds pause until restart autoscroll default
        // Mobile Swiping
        this._touchstartX = 0
        this._touchendX = 0
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
    get CurrentSelectedItem() {
        return querySelector(`.${this._activeItemClass}`);
    }
    set CurrentSelectedItem(index) {
        let viewPortItems = querySelectorAll(`.${this._itemClasses.join(".")}`);
        viewPortItems.map(i => i.classList.remove(this._activeItemClass));
        viewPortItems[index].classList.add(this._activeItemClass);

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
        let l = querySelectorAll(`svg.${this._circleClasses.join(".")}`);
        return l.indexOf(this.CurrentSelectedPagination);
    }
    get MaxSelectIndex() {
        return querySelectorAll(`svg.${this._circleClasses.join(".")}`).length - 1;
    }

    // #endregion Get and Set

    // #region Methods

    AddStyles() {
        let head = querySelector("head");
        let linkSheet = querySelector(`link[href='${this._styleSheet}']`);
        if (!linkSheet) {
            let sheet = document.createElement("link");
            sheet.rel = "stylesheet";
            sheet.href = this._styleSheet;
            head.append(sheet);
        }
    }

    Initialize() {
        this.Location.classList.add(...this._containerClasses);
        // Create Subcontainers
        this._carouselViewport = document.createElement("div");
        this._carouselViewport.classList.add(...this._viewPortClasses);
        this._carouselPagination = document.createElement("div");
        this._carouselPagination.classList.add(...this._paginationClasses);
        // Create Pagination Arrows
        let leftArrow = this.BuildSVG(this._arrowClasses, this._leftArrowPath, "click", this._previousItem);
        let rightArrow = this.BuildSVG(this._arrowClasses, this._rightArrowPath, "click", this._nextItem);
        // Create Carousel List
        this.ImageObjArray.map((item, index) => {
            // Add carousel item classes
            item.Object.id = `carousel_${index}`;
            item.Object.classList.add(...this._itemClasses);
            // Pagination Object
            let paginationObj = this.BuildSVG(this._circleClasses, this._circlePath, "click", this._specificItem, [{ Type: "index", Value: `#carousel_${index}` }]);
            item.PaginationObject = paginationObj;
        });
        // Set classes
        this.ImageObjArray[0].Object.classList.add(this._activeItemClass);
        this.ImageObjArray[0].PaginationObject.classList.add(this._activePaginationClass);
        // Set Mobile Swipe Events
        this._carouselViewport.addEventListener('touchstart', e => {
            e.preventDefault();
            this._touchstartX = e.changedTouches[0].screenX
        });
        this._carouselViewport.addEventListener('touchend', e => {
            //e.preventDefault();
            this._touchendX = e.changedTouches[0].screenX
            this.CheckDirection(e);
        });
        // Append
        this._carouselViewport.append(...this.ImageObjArray.map(i => i.Object));
        this._carouselPagination.append(leftArrow, ...this.ImageObjArray.map(i => i.PaginationObject), rightArrow);
        this.Location.append(this._carouselViewport, this._carouselPagination);
        // Start Scroll
        this.StartAutoScroll();
    }

    PreviousItem(event) {
        // Set Active Item
        if (this.CurrentSelectedIndex > 0) {
            this.CurrentSelectedItem = this.CurrentSelectedIndex - 1;
            this.CurrentSelectedPagination = this.CurrentSelectedIndex - 1;
        } else if (this.CurrentSelectedIndex == 0 && this._infiniteLoop) {
            this.CurrentSelectedItem = this.MaxSelectIndex;
            this.CurrentSelectedPagination = this.MaxSelectIndex;
        }
        // If there's an event, a human input interrupts the autoScroll
        if (event) {
            this.PauseAutoScroll();
        }
        // Scroll to Selected
        this.ScrollToCurrentIndex();
    }

    NextItem(event) {
        // Set Active Item
        if (this.CurrentSelectedIndex < this.MaxSelectIndex) {
            this.CurrentSelectedItem = this.CurrentSelectedIndex + 1;
            this.CurrentSelectedPagination = this.CurrentSelectedIndex + 1;
        } else if (this.CurrentSelectedIndex == this.MaxSelectIndex && this._infiniteLoop) {
            this.CurrentSelectedItem = 0;
            this.CurrentSelectedPagination = 0;
        }
        // If there's an event, a human input interrupts the autoScroll
        if (event) {
            this.PauseAutoScroll();
        }
        // Scroll to Selected
        this.ScrollToCurrentIndex();
    }

    SpecificItem(event) {
        // Set Active Item
        this.CurrentSelectedItem.classList.remove(this._activeItemClass);
        querySelector(event.target.getAttribute("index")).classList.add(this._activeItemClass);
        this.CurrentSelectedPagination.classList.remove(this._activePaginationClass);
        event.target.classList.add(this._activePaginationClass);
        // If a specific item is selected, there was a human input to interrupt the autoScroll
        this.PauseAutoScroll();
        // Scroll to Selected
        this.ScrollToCurrentIndex();
    }

    ScrollToCurrentIndex() {
        this._carouselViewport.scrollLeft = (this.CurrentSelectedItem.scrollWidth * this.CurrentSelectedIndex);
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

    // #endregion AutoScroll Methods

    // #region Mobile Swipe Methods

    CheckDirection(event) {
        if (this._touchendX < this._touchstartX) {
            this.NextItem(event);
        }
        if (this._touchendX > this._touchstartX) {
            this.PreviousItem(event);
        }
    }

    // #endregion Mobile Swipe Methods

    // #region Extra Methods

    BuildSVG(classes, path, eventType = null, eventFunction = null, attributes = []) {
        let svgObj = document.createElementNS(this._xmlns, 'svg');
        svgObj.setAttribute("viewBox", this._viewBox);
        for (const attr of attributes) {
            svgObj.setAttribute(`${attr.Type}`, `${attr.Value}`);
        }
        svgObj.classList.add(...classes);
        svgObj.innerHTML = path;
        svgObj.addEventListener(eventType, eventFunction, true);
        return svgObj;
    }

    // #endregion Extra Methods

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
        this._styleSheet = "/css/infrastructure/menuList.css";
        this._containerClasses = ["menuList-container"];
        // Objects
        this._menuList;
        this._imageList;
        // Classes
        this._menuListContainerClass = "menuList-menu-container";
        this._menuListImageContainerClass = "menuList-image-container";

        this._menuItemContainerClass = "menuList-item-container";
        this._menuItemTextClass = "menuList-item-text";
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
            let sheet = document.createElement("link");
            sheet.rel = "stylesheet";
            sheet.href = this._styleSheet;
            head.append(sheet);
        }
    }

    Initialize() {
        // Create Container
        this._container = document.createElement("div");
        this._container.classList.add(...this._containerClasses);
        // Create Subcontainers
        this._menuList = document.createElement("div");
        this._menuList.classList.add(this._menuListContainerClass);
        this._imageList = document.createElement("div");
        this._imageList.classList.add(this._menuListImageContainerClass);
    }

    Build(menuItems) {
       /*
         MenuItems is an array of object which contains (at least) two properties:
           Item: a dom object or text (checked per array object entry) that serves as the menu list item
           Photo: a dom object that contains the standard 
       */
       // Build MenuItems
        this.MenuItems = menuItems.map(i => {
            return {
                ImageItem: this.Import(i.Photo).Object,
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
            // Build Generic Elements
            let container = document.createElement("div");
            let text = document.createElement("h3");
            // Classes
            container.classList.add(this._menuItemContainerClass);
            text.classList.add(this._menuItemTextClass);
            // Append and return
            container.append(text);
            item = container;
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