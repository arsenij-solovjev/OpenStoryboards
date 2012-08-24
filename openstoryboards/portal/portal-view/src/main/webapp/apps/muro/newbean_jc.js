/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.Bean = function () {};
jQuery.extend(window.Bean, {
    types: {
        UNKNOWN: 0,
        STRING: 1,
        INTEGER: 2,
        FLOAT: 3,
        POSITIVE_INTEGER: 4,
        POSITIVE_FLOAT: 5,
        OBJECT: 6,
        BOOLEAN: 7,
        ZERO_ONE_FLOAT: 8
    },
    sanitizeType: function (a, b) {
        switch (a) {
        case Bean.types.POSITIVE_INTEGER:
            return Math.abs(parseInt(b, 10));
        case Bean.types.INTEGER:
            return parseInt(b, 10);
        case Bean.types.POSITIVE_FLOAT:
            return Math.abs(parseFloat(b, 10));
        case Bean.types.ZERO_ONE_FLOAT:
            return Math.max(0, Math.min(1, parseFloat(b, 10)));
        case Bean.types.FLOAT:
            return parseFloat(b, 10);
        case Bean.types.BOOLEAN:
            return !!b;
        case Bean.types.STRING:
        case Bean.types.OBJECT:
        case Bean.types.UNKNOWN:
        default:
            return b
        }
    },
    createBean: function (a) {
        a.prototype.getModified = function () {
            return this["isModified"]
        };
        a.prototype.setModified = function (b) {
            this["isModified"] = b
        };
        jQuery.each(a.attributes, function (b, c) {
            if (b.length < 1) {
                return
            }
            var e = b.charAt(0).toUpperCase() + b.substr(1);
            var d = c.type;
            if (!d) {
                d = Bean.types.UNKNOWN
            }
            a.prototype["get" + e] = function () {
                if (this[b] == null && c.nullStub) {
                    return c.nullStub
                } else {
                    return Bean.sanitizeType(d, this[b])
                }
            };
            a.prototype["set" + e] = function (k, i) {
                if (this.frozenList[b]) {
                    return
                }
                var g = Bean.sanitizeType(d, k);
                if (i || (d == Bean.types.OBJECT) || (Bean.sanitizeType(d, this[b]) != g)) {
                    var j = c.addBeforeSetter;
                    if (j) {
                        var h = j.bindTo(this);
                        if (!h(g)) {
                            return
                        }
                    }
                    if (!this.isEventsOff) {
                        if (c.setsModified) {
                            this.setModified(true)
                        }
                        this.eventList[b][0] = true
                    }
                    this[b] = g
                }
                var l = c.addToSetter;
                if (l) {
                    var f = l.bindTo(this);
                    f(g)
                }
                if (!this.isEventsOff) {
                    this.fireEvents()
                }
            }
        });
        a.prototype._initialize = function () {
            this.eventList = new Array();
            this.frozenList = new Array();
            jQuery.each(a.attributes, function (b, c) {
                this.frozenList[b] = false;
                this.eventList[b] = [false, []];
                if (c.initialValue || c.initialValue == 0) {
                    this[b] = c.initialValue
                } else {
                    switch (c.type) {
                    case Bean.types.POSITIVE_INTEGER:
                    case Bean.types.INTEGER:
                    case Bean.types.POSITIVE_FLOAT:
                    case Bean.types.FLOAT:
                        this[b] = 0;
                        break;
                    case Bean.types.BOOLEAN:
                        this[b] = false;
                        break;
                    case Bean.types.STRING:
                        this[b] = "";
                        break;
                    case Bean.types.OBJECT:
                    case Bean.types.UNKNOWN:
                    default:
                        this[b] = null
                    }
                }
            }.bindTo(this));
            this.setModified(true);
            this.isAtomic = 0;
            this.isEventsOff = false
        };
        a.prototype.fireEvents = function () {
            if (!this.isAtomic) {
                for (key in this.eventList) {
                    if (this.eventList[key][0]) {
                        this.eventList[key][0] = false;
                        var b = this.eventList[key][1];
                        for (var c = 0; c < b.length; c++) {
                            var d = b[c];
                            try {
                                d()
                            } catch (f) {
                                stdLog("Error in function subscribed to " + key + ": ", f)
                            }
                        }
                    }
                }
            }
        };
        a.prototype.subscribe = function (b, f) {
            if (b.constructor.toString().indexOf("Array") == -1) {
                b = [b]
            }
            var d;
            for (var c = 0; c < b.length; c++) {
                d = b[c];
                try {
                    this.eventList[d][1].push(f)
                } catch (g) {
                    if (this.eventList[d]) {
                        stdLog("Attribute: ", d);
                        stdLog("EventList: ", this.eventList);
                        this.eventList[d][1] = [];
                        this.eventList[d][1].push(f)
                    }
                }
            }
        };
        a.prototype.unsubscribe = function (c, b) {
            this.eventList[c][1] = jQuery.grep(this.eventList[c][1], function (e, d) {
                return (e == b)
            }, true)
        };
        a.prototype.freeze = function (b) {
            this.frozenList[b] = true
        };
        a.prototype.thaw = function (b) {
            this.frozenList[b] = false
        };
        a.prototype.startAtomic = function () {
            this.isAtomic++
        };
        a.prototype.endAtomic = function () {
            this.isAtomic--;
            this.isAtomic = Math.max(0, this.isAtomic);
            if (!this.isAtomic) {
                this.fireEvents()
            }
        };
        a.prototype.turnEventsOff = function () {
            this.isEventsOff = true
        };
        a.prototype.turnEventsOn = function () {
            this.isEventsOff = false
        }
    }
});
if (window.DWait) {
    DWait.run("jms/lib/Bean.js")
}
DWait.count();