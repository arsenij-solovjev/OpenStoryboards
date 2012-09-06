/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.safeLocalGet = function (a, d, c) {
    val = d;
    try {
        val = localStorage.getItem(a);
        if (typeof (val) != "string") {
            val = d;
            safeLocalSet(a, val);
            return val
        }
        if (c && typeof (c) == "function") {
            func = c;
            val = func(val)
        }
    } catch (b) {
        val = d;
        safeLocalSet(a, val);
        return val
    }
    return val
};
window.safeLocalSet = function (a, c) {
    try {
        localStorage.removeItem(a);
        localStorage.setItem(a, c)
    } catch (b) {
        stdLog("Error setting local storage: " + b.message, b)
    }
};
if (window.DWait) {
    DWait.run("jms/lib/localStorage.js")
}(function (window) {
    var ua = navigator.userAgent.toLowerCase();
    var match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || !/compatible/.test(ua) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
    var browser = {};
    browser[match[1] || ""] = true;
    browser.version = match[2] || "0";
    var BaseStorageDriver = Base.extend({
        constructor: function () {
            this._data = {};
            this.log("BaseStorageDriver instantiated");
            this.log("Lame. Your browser does not support cross-session storage (appart from cookies)")
        },
        clear: function () {
            this._data = {}
        },
        getItem: function (key, default_value) {
            if (!(key in this._data)) {
                return default_value
            }
            return this._data[key]
        },
        setItem: function (key, value) {
            this._data[key] = value
        },
        removeItem: function (key) {
            this._data[key] = null;
            delete this._data[key]
        },
        log: function (msg) {
            if (vms_feature("dre")) {
                console.log("[DStorage]" + msg)
            }
        }
    });
    var LocalStorageDriver = BaseStorageDriver.extend({
        constructor: function () {
            this._data = window.localStorage
        },
        clear: function () {
            this._data.clear()
        },
        getItem: function (key, default_value) {
            if (!(key in this._data)) {
                return default_value
            }
            if (browser.opera) {
                var exists = false;
                for (var k in this._data) {
                    if (key == k) {
                        exists = true;
                        break
                    }
                }
                if (!exists) {
                    return default_value
                }
            }
            var v;
            try {
                v = this._data.getItem(key)
            } catch (e) {
                this.log(e.message);
                v = default_value
            }
            return v
        },
        setItem: function (key, value) {
            try {
                this._data.setItem(key, value)
            } catch (e) {
                this.log(e.message)
            }
        },
        removeItem: function (key) {
            this._data[key] = null;
            delete this._data[key]
        }
    });
    var GlobalStorageDriver = LocalStorageDriver.extend({
        constructor: function () {
            this._data = window.globalStorage[window.location.hostname];
            this.log("GlobalStorageDriver instantiated")
        },
        clear: function () {
            for (var key in this._data) {
                this.removeItem(key)
            }
        },
        getItem: function (key, default_value) {
            if (!(key in this._data)) {
                return default_value
            }
            var v;
            try {
                v = this._data[key].value
            } catch (e) {
                this.log(e.message);
                v = default_value
            }
            return v
        },
        setItem: function (key, value) {
            this._data[key] = value
        },
        removeItem: function (key) {
            this._data.removeItem(key);
            delete this._data[key]
        }
    });
    var UserDataPersistenceStorageDriver = BaseStorageDriver.extend({
        constructor: function () {
            this.clear();
            this.initialized = false;
            DWait.ready([".domready", "jms/lib/json2.js"], function () {
                this.initDOM()
            }.bindTo(this));
            this.log("UserDataPersistenceStorageDriver instantiated")
        },
        initDOM: function () {
            var d = document;
            this._storage = d.createElement("span");
            this._storage.addBehavior("#default#userData");
            this._storage.load("dAstorage");
            try {
                this._data = JSON.parse(this._storage.getAttribute("data") || "{}")
            } catch (e) {
                this.log(e.message);
                this._data = {}
            }
            this.initialized = true
        },
        save: function () {
            if (!initialized) {
                this.log("Cannot save storage data. UserData behaviour not yet initialized.");
                return
            }
            var d = JSON.stringify(this._data);
            try {
                this._storage.setAttribute("data", d);
                this._storage.save("dAstorage")
            } catch (e) {
                throw new Error("Could not save storage data.")
            }
        },
        clear: function () {
            this.base();
            this.save()
        },
        setItem: function (key, value) {
            this.base();
            this.save()
        },
        removeItem: function (key) {
            this.base();
            this.save()
        }
    });
    var DStorage = Base.extend({
        constructor: function (driver) {
            if (driver && eval(driver)) {
                var driver_class = eval(driver);
                this._storage_driver = new driver_class()
            } else {
                this._storage_driver = DStorage.getStorageDriver()
            }
        },
        clear: function () {
            this._storage_driver.clear()
        },
        getItem: function (key, default_value) {
            return this._storage_driver.getItem(key, default_value)
        },
        setItem: function (key, value) {
            this._storage_driver.setItem(key, value)
        },
        removeItem: function (key) {
            this._storage_driver.removeItem(key)
        }
    }, {
        getStorageDriver: function () {
            var ver = parseInt(browser.version.slice(0, 2));
            var useUserDataPersistence = browser.msie && ver >= 6 && ver < 8;
            if (window.localStorage) {
                return new LocalStorageDriver()
            } else {
                if (window.globalStorage) {
                    return new GlobalStorageDriver()
                } else {
                    if (useUserDataPersistence) {
                        return new UserDataPersistenceStorageDriver()
                    } else {
                        return new BaseStorageDriver()
                    }
                }
            }
        }
    });
    if (!window.DStorage) {
        window.DStorage = new DStorage()
    }
})(window);
if (window.DWait) {
    DWait.run("jms/lib/storage.js")
}
DWait.count();