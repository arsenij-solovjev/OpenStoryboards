/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
DWait.ready(["jms/lib/jQueryMisc.js"], function () {
    window.BrowserSupport = {
        getBrowser: function (d) {
            for (var a = 0; a < d.length; a++) {
                var b = d[a].string;
                var c = d[a].prop;
                this.versionSearchString = d[a].versionSearch || d[a].identity;
                if (b) {
                    if (b.indexOf(d[a].subString) != -1) {
                        return d[a]
                    }
                } else {
                    if (c) {
                        if (navigator.userAgent) {
                            if (navigator.userAgent.indexOf(d[a].identity) != -1) {
                                return d[a]
                            }
                        } else {
                            return d[a]
                        }
                    }
                }
            }
            return null
        },
        getVersion: function (a) {
            var b = new RegExp(this.versionSearchString + "/? ?([0-9]+(.?[0-9]+)*)");
            var c = a.match(b);
            if (!c) {
                return null
            }
            return c[1].split(".")
        },
        dataBrowser: [{
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome",
            min: [8, 0],
            link: "http://www.google.com/chrome"
        }, {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version",
            min: [4, 0],
            link: "http://www.apple.com/safari/"
        }, {
            prop: window.opera,
            identity: "Opera Mini",
            versionSearch: "Version",
            min: [10, 50],
            link: "http://www.opera.com/"
        }, {
            prop: window.opera,
            identity: "Opera",
            versionSearch: "Version",
            min: [11, 50],
            link: "http://www.opera.com/"
        }, {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox",
            min: [3, 6],
            link: "http://getfirefox.com"
        }, {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE",
            min: [8, 0],
            link: "http://microsoft.com/ie"
        }],
        enforce: function () {
            var c = this.getBrowser(this.dataBrowser);
            var b = this.getVersion(navigator.userAgent);
            if (!c || !b) {
                return
            }
            var a = undefined;
            $.each(c.min, function (d, e) {
                if (a === undefined && b[d]) {
                    if (b[d] < e) {
                        a = false
                    }
                    if (b[d] > e) {
                        a = true
                    }
                }
            });
            if (a === false || (a === undefined && c.min.length > b.length)) {
                this.showBanner(c.link)
            }
        },
        showBanner: function (a) {
            $("#overhead-collect").before('<div style="background:url(http://st.deviantart.net/misc/updatebrowser_ylw_bg.png) repeat-x;width:100%;height:10px;line-height:10px;text-align:center;position:absolute;top:-1px;z-index:1000;font-family:verdana;font-size:10px;color:#3c3838;padding:10px 0px;text-shadow:#fff 1px 1px;">Please <a href="' + a + '" style="color:#1965B6;">upgrade your browser</a> to access deviantART</div>')
        }
    };
    BrowserSupport.enforce();
    if (window.DWait) {
        DWait.run("jms/pages/browser_support.js")
    }
});
DWait.count();