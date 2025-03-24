class APIFetcher {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    get BaseUrl() {
        return this.baseUrl;
    }
    set BaseUrl(newBaseUrl) {
        this.baseUrl = newBaseUrl;
    }

    async PerformFetch(url, method, data = null) {
        let response;
        if (method === "GET") {
            response = await fetch(url, {
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
            response = await fetch(url, {
                method: method,
                mode: "cors",
                cache: "default",
                credentials: "omit",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": this.baseUrl,
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
            return jsonData[0];
        } catch (exception) {
            this.CatchException(urlExtension, "GET", {}, exception);
            return {};
        }
    }

    async Post(urlExtension, data) {
        try {
            await this.PerformFetch(`${this.BaseUrl}/${urlExtension}`, "POST", data);
            return true;
        } catch(exception) {
            this.CatchException(urlExtension, "POST", data, exception);
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
            acc[curr.split("=")[0]] = curr.split("=")[1];
            return acc;
        }, {});
    }
    set Cookie(cookie) {
        document.cookie = cookie;
    }
    // #endregion Getters and Setters

    // #region Methods
    async Initialize() {
        // 1) Get User Preference
        let storageList = await this._api.Get(`UserInfo/Storage/${this.Cookie["UserPreference"] ? true : false}`); // todo: set UserPreference cookie to true(allow optional) or false(necesseccary only)
        // 2) Determine which type each is and if the key already exists
        // if key exists: get duration from API and reset duration
        // if key !exist: run function to grab a value from API and set it
        for await (const item of storageList) {
            if (item.Type == 0 && item.ValueEndpoint && !this.Cookie[item.Name]) {
                // Cookie
                await this.NewCookie(item);
            } else if (item.Type == 1) {
                // Session Storage

            } else if (item.Type == 2) {
                // Local Storage

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
        if (!this.Cookie["UserViewedGDPR"]) {
            this._toastGDPR.classList.add(this._toastPoppedClassGDPR);
        }
    }

    // #region Cookie Methods

    async NewCookie(item) {
        let expiration = item.Duration ? ` expires=${this.GetExpiration(item.Duration)}; ` : "";
        let value;
        if (typeof (item.ValueEndpoint) === "string") {
            // Assume string is API endpoint
            value = await this._api.Get(item.ValueEndpoint)
        } else if (typeof (item.ValueEndpoint) === "boolean") {
            // Assume boolean is feature flag
            value = {};
            value[item.ValueName] = item.ValueEndpoint;
        }
        document.cookie = `${item.Name}=${value[item.ValueName]};${expiration}path=/;`;
    }

    RemoveCookie(name) {
        document.cookie = `${name}=; expires=Thu, 1 Jan 1970 00:00:00 UTC;`;
    }

    GetExpiration(daysToExpire) {
        let date = new Date();
        date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
        return date.toUTCString();
    }

    // #endregion Cookie Methods

    // #region Session Storage Methods

    // #endregion Session Storage Methods

    // #region Local Storage Methods

    // #endregion Local Storage Methods

    // #region Extra Methods

    ViewedGDPR() {
        let gdprViewed = {
            Type: 0,
            Name: "UserViewedGDPR",
            "ValueName": "UserViewedGDPR",
            "ValueEndpoint": true,
            "Duration": 60
        }
        if (!this.Cookie["UserViewedGDPR"]) {
            this.NewCookie(gdprViewed);
        }
    }

    // #endregion Extra Methods

    // #endregion Methods
}

export { APIFetcher, StorageClass };