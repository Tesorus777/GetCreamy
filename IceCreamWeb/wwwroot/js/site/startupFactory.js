class APIFetcher {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    // #region Getters and Setters

    get BaseUrl() {
        return this._baseUrl;
    }
    set BaseUrl(newBaseUrl) {
        this._baseUrl = newBaseUrl;
    }

    // #region Getters and Setters

    // #region Methods

    async PerformFetch(url, method, data = null) {
        let response;
        if (method === "GET") {
            response = await fetch(encodeURI(url), {
                method: method,
                mode: "cors",
                cache: "default",
                credentials: "omit",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "text/json"
                },
                referrerPolicy: "no-referrer"
            });
        } else {
            response = await fetch(encodeURI(url), {
                method: method,
                mode: "cors",
                cache: "default",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": this._baseUrl,
                    "Access-Control-Allow-Credentials": true 
                },
                referrerPolicy: "no-referrer",
                body: JSON.stringify(data)
            });
        }
        return response;
    }

    async Get(urlExtension) {
        try {
            let response = await this.PerformFetch(`${this.BaseUrl}/${urlExtension}`, "GET");
            let data = await response.json();
            let jsonData = JSON.parse(JSON.stringify(data));
            return jsonData;
        } catch (exception) {
            this.CatchException(urlExtension, "GET", {}, exception);
            return [];
        }
    }

    async GetSingle(urlExtension) {
        try {
            let response = await this.PerformFetch(`${this.BaseUrl}/${urlExtension}`, "GET");
            let data = await response.json();
            let jsonData = JSON.parse(JSON.stringify(data));
            if (Object.prototype.toString.call(jsonData) == '[object Array]') {
                // if the object is an array, return the first row of it
                return jsonData[0];
            } else {
                // else, return the object
                return jsonData;
            }
        } catch (exception) {
            this.CatchException(urlExtension, "GET", {}, exception);
            return {};
        }
    }

    async Post(urlExtension, inputData) {
        try {
            const response = await this.PerformFetch(`${this.BaseUrl}/${urlExtension}`, "POST", inputData);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            return response;
        } catch(exception) {
            this.CatchException(urlExtension, "POST", inputData, exception);
            return false;
        }
    }

    async Put(urlExtension, data) {
        try {
            await this.PerformFetch(`${this.BaseUrl}/${urlExtension}`, "PUT", data);
            return true;
        } catch (exception) {
            this.CatchException(urlExtension, "PUT", data, exception);
            return false;
        }
    }

    async Delete(urlExtension, data) {
        try {
            await this.PerformFetch(`${this.BaseUrl}/${urlExtension}`, "DELETE", data);
            return true;
        } catch (exception) {
            this.CatchException(urlExtension, "DELETE", data, exception);
            return false;
        }
    }

    // Does this need to be asynchronous? Test when ErrorLog API available
    CatchException(urlExtension, method, data, exception) {
        let errorLog = {};
        errorLog.EndPoint = urlExtension;
        errorLog.Method = method;
        errorLog.Data = data; // make sure this is a string
        errorLog.Exception = exception; // make sure this is a string
        //this.PerformFetch(`${this.BaseUrl}/ErrorLog`, "POST", errorLog); // turn this on when API available
        console.log(errorLog);
    }

    // #endregion Methods

}

class GeoapifyFetcher extends APIFetcher {
    constructor(baseUrl, apiKey, lang, limit, filter) {
        //
        super(baseUrl);
        this._apiKey = apiKey;
        this._lang = lang != null ? lang : "en";
        this._limit = limit != null ? limit : 5;
        // Coordinates must be formatted (1) bottom left to (2) top right
        this._longitude1 = "-119.377441";
        this._latitude1 = "33.525369";
        this._longitude2 = "-117.537231";
        this._latitude2 = "34.465806";
        this._filter = filter != null ? filter : `rect:${this._longitude1},${this._latitude1},${this._longitude2},${this._latitude2}` // from ventura to huntington beach
        this._format = "json";

        //this._state = "CA";
        //this._country = "United States of America";
    }

    // #region Getters and Setters
    get ApiKey() {
        return this._apiKey;
    }
    set ApiKey(newApiKey) {
        this._apiKey = newApiKey;
    }
    get Language() {
        return this._lang;
    }
    set Language(newLang) {
        // 2-character ISO 639-1 language codes are supported
        // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
        this._lang = newLang;

    }
    get Limit() {
        return this._limit;
    }
    set Limit(newLimit) {
        this._limit = newLimit;
    }
    get Filter() {
        return this._filter;
    }
    set Filter(newFilter) {
        this._filter = newFilter;
    }

    get GeoCodeUrlExtension() {
        return `&limit=${this.Limit}&lang=${this.Language}&filter=${this.Filter}&format=${this._format}&apiKey=${this.ApiKey}`;
    }
    // #endregion Getters and Setters


    // #region Methods
    async AutoComplete(searchText) {
        // searchText == addressOne
        searchText = searchText != null ? searchText : "";
        if (searchText == null || searchText.length == 0) {
            return [];
        }
        // 1) Build request url
        let urlExtension = `geocode/autocomplete?text=${searchText}${this.GeoCodeUrlExtension}`;
        let resultSet = await this.Get(urlExtension).then(result => {
            return result.results;
        });
        return resultSet;
    }
    // #endregion Methods
}
class StorageClass {
    constructor(baseUrl) {
        // #region Set Externally
        this._api = new APIFetcher(baseUrl);
        // #endregion Set Externally

        // #region Set Internally
        this._toastGDPR = document.querySelector(`div#ToastGDPR`);
        this._acceptGDPR = document.querySelector(`button#AcceptGDPR`);
        this._toastPoppedClassGDPR = "main-gdpr-toast-popped";
        this._gdprStorageItem = {
            Type: 0,
            Name: "UserViewedGDPR",
            "ValueName": "UserViewedGDPR",
            "ValueEndpoint": false,
            "Duration": 60
        }

        this.loadedEvent = new Event("storageLoaded");
        // #endregion Set Internally
        this.Initialize();
    }

    // #region Getters and Setters
    get UserPreference() {
        return this._userPreference;
    }
    set UserPreference(preference) {
        // 1) Set internal property
        this._userPreference = preference;
        // 2) Set cookie property

    }
    get Cookie() {
        return document.cookie.split("; ").reduce((acc, curr) => {
            // This will set the cookie value to a known type (eg: bool or number) and default to string if it fails
            try {
                acc[curr.split("=")[0]] = JSON.parse(curr.split("=")[1]);
            } catch {
                acc[curr.split("=")[0]] = curr.split("=")[1];
            }
            return acc;
        }, {});
    }
    set Cookie(cookie) {
        document.cookie = cookie;
    }

    get Session() {
        return window.sessionStorage;
    }
    set Session(storage) {
        window.sessionStorage = storage;
    }

    get LocalStorage() {
        return localStorage
    }
    // #endregion Getters and Setters

    // #region Methods

    async Initialize() {
        // 1) Get User Preference
        let storageList = await this._api.Get(`User/Storage/${this.Cookie["UserPreference"] ? true : false}`); // todo: set UserPreference cookie to true(allow optional) or false(necesseccary only)
        // set GDPR (with View=false default) as first storageItem to be loaded
        storageList.unshift(this._gdprStorageItem);
        // 2) Determine which type each is and if the key (item.Name) already exists
        // if key exists: get duration from API and reset duration
        // if key !exist: run function to grab a value from API and set it as new

        // item.ValueEndpoint is the API URL that returns the data to be set at item.ValueName
            // item.ValueName = api.get(item.ValueEndpoint)

        // item:
            // Type: 0==cookie, 1==session, 2==localStorage
            // Name: the key to be used in the cookie/session/localStorage
            // ValueName: the key for the value as returned by the API
            // ValueEndpoint: the url extension to be used with the API to get a value
                // (eg: ValueEndpoint "User/New" returns a value {UserId: "guid"} where "UserId" is the ValueName)
                // (eg: ValueEndpoint true (boolean) returns no value, but code below creates an object {ValueName: "val"})
            // Duration: duration for cookies in days
        for await (const item of storageList) {
            if (item.Type == 0) {
                // Cookie
                if (!this.Cookie[item.Name] && item.ValueEndpoint !== null) {
                    // If the cookie doesn't exist and has an API endpoint, create a new cookie
                    await this.NewCookie(item);
                } else if (this.Cookie[item.Name]) {
                    // If the cookie exists, reset the duration
                    this.ResetCookieDuration(item);
                }

            } else if (item.Type == 1) {
                // Session Storage

            } else if (item.Type == 2) {
                // Local Storage
                if (!this.LocalStorage.getItem(item.Name)) {
                    // If the localStorage item doesn't exist and has an API endpoint, create a new storage item
                    await this.SetLocalStorage(item);
                } 
            }
        }
        // 3) Dispatch event to indicate cookies loaded
        document.dispatchEvent(this.loadedEvent);
        // 4) Add GDPR event
        this._acceptGDPR.addEventListener("click", (e) => {
            e.preventDefault();
            this.ViewedGDPR();
            this._toastGDPR.classList.remove(this._toastPoppedClassGDPR);
        });
        // 5) Notify user of cookies
        if (this.Cookie["UserViewedGDPR"] == false) {
            this._toastGDPR.classList.add(this._toastPoppedClassGDPR);
        }
    }

    // #region Cookie Methods

    async NewCookie(item) {
        let expiration = item.Duration ? ` expires=${this.GetExpiration(item.Duration)}; ` : "";
        let value;
        if (typeof (item.ValueEndpoint) === "string") {
            // Assume string is API endpoint
            value = await this._api.Get(item.ValueEndpoint);
        } else if (typeof (item.ValueEndpoint) === "boolean") {
            // Assume boolean is feature flag
            value = {};
            value[item.ValueName] = item.ValueEndpoint;
        }
        this.Cookie = `${item.Name}=${value[item.ValueName]};${expiration}path=/;`;
    }

    ResetCookieDuration(item) {
        // This resets a cookie's duration while retaining the value
        let expiration = item.Duration ? ` expires=${this.GetExpiration(item.Duration)}; ` : "";
        let value = this.Cookie[item.ValueName];
        this.Cookie = `${item.Name}=${value};${expiration}path=/;`;
    }

    RemoveCookie(name) {
        this.Cookie = `${name}=; expires=Thu, 1 Jan 1970 00:00:00 UTC;`;
    }

    GetExpiration(daysToExpire) {
        let date = new Date();
        date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
        return date.toUTCString();
    }

    // #endregion Cookie Methods

    // #region Session Storage Methods

    NewSessionItem(key, value) {
        this.Session.setItem(key, JSON.stringify(value));
    }

    GetSessionItem(key) {
        return JSON.parse(this.Session.getItem(key));
    }

    RemoveSessionItem(key) {
        this.Session.removeItem(key);
    }

    ClearSession() {
        this.Session.clear();
    }

    // #endregion Session Storage Methods

    // #region Local Storage Methods

    // #endregion Local Storage Methods

    async SetLocalStorage(item) {
        // Local Storage items will never be booleans
        let value = await this._api.Get(item.ValueEndpoint);
        this.LocalStorage.setItem(item.Name, value[item.ValueName]);
    }

    ClearLocalStorage() {
        this.LocalStorage.clear();
    }

    // #region Extra Methods

    ViewedGDPR() {
        let expiration = this._gdprStorageItem.Duration ? ` expires=${this.GetExpiration(this._gdprStorageItem.Duration)}; ` : "";
        document.cookie = `${this._gdprStorageItem.Name}=true;${expiration}path=/;`;
    }

    // #endregion Extra Methods

    // #endregion Methods

}

export { APIFetcher, GeoapifyFetcher, StorageClass };