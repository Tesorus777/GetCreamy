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
        this._styleSheet = "/css/infrastructure/importer.css";
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
            let sheet = document.createElement("link");
            sheet.rel = "stylesheet";
            sheet.href = this._styleSheet;
            head.append(sheet);
        }
    }

    Import(file) {
        // All file objects must contain "FileName" property
        let fileObj = {};
        // 1) Get file type properties
        fileObj.Properties = this.GetFileProperties(file);
        // 2) Create dom object
        fileObj.Object = this.CreateDomObject(fileObj.Properties);
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

    GetFileProperties(file) {
        // Mandatory:
            // Every object needs a "tag" and a "classList"
        let properties = {};
        let fileType = this.DetermineFileType(file.FileName.split(".").slice(-1)[0]);
        // Image
        if (fileType == "img") {
            // Parent container
            properties.tag = "div";
            properties.classList = this._lazyContainerClasses;
            properties.child = {};
            // Parent lazy loaded div with background image
            properties.child.tag = "div";
            properties.child.style = `background-image: url("${this._folderRoot}/${file.Folder}/${file.LowResFileName}")`;
            properties.child.classList = this._lazyClasses;
            properties.child.child = {};
            // Child image
            properties.child.child.tag = "img";
            properties.child.child.classList = this._imageClasses;
            properties.child.child.src = `${this._folderRoot}/${file.Folder}/${file.FileName}`;
            properties.child.child.loading = "lazy";
            properties.child.child.alt = file.AltText;
            properties.child.child.event = {
                name: "load",
                func: this._imageLoaded
            }
        }

        return properties;
    }

    CreateDomObject(fileObj) {
        // Recursive: will create a dom object and attach it to the parent for every child
        const excludeFields = ["tag", "classList", "child", "event"]; // fields that do not have attributes
        let obj = document.createElement(fileObj.tag);
        obj.classList.add(...fileObj.classList);
        // Set an attribute for everything not in the excluded fields (i.e. have attributes)
        Object.keys(fileObj).filter(key => !excludeFields.includes(key)).forEach(key => {
            obj.setAttribute(key, fileObj[key]);
        });
        // If there is an event to be added, add it
        if (fileObj.event != undefined) {
            obj.addEventListener(fileObj.event.name, fileObj.event.func);
        }
        // If there is a child element, build it
        if (fileObj.child != undefined) {
            obj.append(this.CreateDomObject(fileObj.child));
        }
        return obj;
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
        this.ImageObjArray = imageItems.map(i => this.Import(i));
        if (imageItems.length > 0) {
            this.ImageObjArray.unshift(this.Import(imageItems[imageItems.length - 1]));
            this.ImageObjArray.push(this.Import(imageItems[0]));
        }
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
        this._arrowClasses = ["carousel-pagination-arrow"];
        this._circleClasses = ["carousel-pagination-circle"];
        this._activePaginationClass = "carousel-pagination-active";

        // Internal Selection Tracking Variables
        this._currentSelectedIndex = 0;
        this._maxViewIndex = this.ImageObjArray.length - 3;
        // Selected item and pagination
        this._viewableAttribute = "carousel-viewable";

        // Functions
        this._previousItem = this.PreviousItem.bind(this);
        this._nextItem = this.NextItem.bind(this);
        this._specificItem = this.SpecificItem.bind(this);
        // Automation
        this._infiniteLoop = infinteLoop;
        this._autoScroll = autoScroll && infinteLoop && (imageItems.length > 1); // Need to set both autoscroll and infiniteloop on and more than one image item
        this._autoScrollReverse = false; // false = NextItem (L to R), true = PreviousItem (R to L)
        this._autoScrollRunning = false;
        this._autoScrollId;
        this._timer = autoIntervalSeconds * 1000;  // 3 seconds per image default
        this._timerPause = pauseIntervalSeconds * 1000; // 15 seconds pause until restart autoscroll default
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
        this.ImageObjArray.map((item, index, array) => {
            // if index is first or last, do not have an object id, do not add a pagination object
            if (index > 0 && index < array.length - 1) {
                // Add normal id
                item.Object.id = `carousel_${index - 1}`;
                item.Object.setAttribute(this._viewableAttribute, true);
                // Pagination Object
                let paginationObj = this.BuildSVG(this._circleClasses, this._circlePath, "click", this._specificItem, [{ Type: "index", Value: `#carousel_${index - 1}` }]);
                item.PaginationObject = paginationObj;
            } else if (index == 0) {
                // Add last id to cloned obj at first index
                item.Object.id = `carousel_${array.length - 3}_clone`;
                item.Object.setAttribute(this._viewableAttribute, false);
            } else if (index == array.length - 1) {
                // Add first id to cloned obj at last index
                item.Object.id = `carousel_0_clone`;
                item.Object.setAttribute(this._viewableAttribute, false);
            }
            // Add carousel item classes
            item.Object.classList.add(...this._itemClasses);
        });
        // Set classes
        this.ImageObjArray[1].Object.classList.add(this._activeItemClass);
        this.ImageObjArray[1].PaginationObject.classList.add(this._activePaginationClass);
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
        if (this.ImageObjArray.length > 3) {
            // Only show pagination if there is more than one image
            this._carouselPagination.append(leftArrow, ...this.ImageObjArray.filter(item => item.PaginationObject != undefined).map(i => i.PaginationObject), rightArrow);
        }
        this.Location.append(this._carouselViewport, this._carouselPagination);
        // Start Scroll
        this.ScrollToCurrentIndex(true);
        this.StartAutoScroll();
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
            timer = 300; // Wait for smooth scroll animation to end (there is no better solution at the moment)
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
            timer = 300; // Wait for smooth scroll animation to end (there is no better solution at the moment)
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
            //setTimeout(() => { this.StartAutoScroll(); }, this._timerPause);
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
        this._menuList.classList.add(...this._menuListContainerClasses);
        this._imageList = document.createElement("div");
        this._imageList.classList.add(...this._menuListImageContainerClasses);
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
            let imageItemContainer = document.createElement("div");
            imageItemContainer.classList.add(...this._menuItemImageContainerClasses);
            imageItemContainer.append(this.Import(i.Photo).Object);
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
            // Build Generic Elements
            let container = document.createElement("div");
            let text = document.createElement("h3");
            // Classes
            container.classList.add(...this._menuItemContainerClasses);
            text.classList.add(...this._menuItemTextClasses);
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