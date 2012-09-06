/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.HashURI = {
    get: function () {
        var c = document.location.hash,
            f = {},
            e = null,
            b = null,
            d = null;
        if (!c.length) {
            return f
        }
        c = c.substring(1).split("&");
        for (var a in c) {
            e = c[a].split("=");
            b = unescape(e[0]);
            d = typeof e[1] == "undefined" ? true : unescape(e[1]);
            f[b] = d
        }
        return f
    },
    set: function (c) {
        var b = [];
        for (var a in c) {
            b.push(escape(a) + "=" + escape(c[a]))
        }
        document.location.hash = b.join("&")
    },
    getKey: function (a) {
        return HashURI.get()[a]
    },
    setKey: function (a, b) {
        if (typeof b == "undefined") {
            HashURI.removeKey(a)
        } else {
            var c = HashURI.get();
            c[a] = b;
            HashURI.set(c)
        }
    },
    removeKey: function (a) {
        if (!a) {
            return
        }
        var b = HashURI.get();
        delete b[a];
        HashURI.set(b)
    }
};
if (window.DWait) {
    DWait.run("jms/lib/hashUri.js")
}
DWait.ready(["jms/lib/Base.js", "jms/lib/Bean.js"], function () {
    window.DrawBean = Base.extend({
        constructor: function () {
            var a = this._initialize.bindTo(this);
            a()
        }
    });
    jQuery.extend(window.DrawBean, {
        attributes: {
            color: {
                type: Bean.types.STRING,
                initialValue: "000000"
            },
            secondaryColor: {
                type: Bean.types.STRING,
                initialValue: "2D3836"
            },
            backgroundColor: {
                type: Bean.types.STRING,
                initialValue: "fffffa"
            },
            useDynamics: {
                type: Bean.types.BOOLEAN,
                initialValue: false
            },
            isHTML5: {
                type: Bean.types.BOOLEAN,
                initialValue: true
            },
            isCollab: {
                type: Bean.types.BOOLEAN,
                initialValue: false
            },
            userRole: {
                type: Bean.types.STRING,
                initialValue: "unknown"
            },
            brushSize: {
                type: Bean.types.POSITIVE_INTEGER,
                initialValue: 10,
                addToSetter: function () {
                    var a = this.getBrushSize();
                    if (a > 40) {
                        this.setBrushSize(40)
                    } else {
                        if (a < 1) {
                            this.setBrushSize(1)
                        }
                    }
                }
            },
            brushOpacity: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 1,
                addToSetter: function () {
                    var a = this.getBrushOpacity();
                    if (a < 0.01) {
                        this.setBrushOpacity(0.01)
                    }
                }
            },
            brushHardness: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 1
            },
            lastUsedBrush: {
                type: Bean.types.OBJECT,
                initialValue: null,
                addBeforeSetter: function (a) {
                    try {
                        switch (a.options.name) {
                        case "Flood Fill":
                        case "Eraser":
                        case "Eye Dropper":
                            return false;
                        default:
                            return true
                        }
                    } catch (b) {
                        return false
                    }
                }
            },
            mainNode: {
                type: Bean.types.OBJECT,
                initialValue: null,
                addBeforeSetter: function () {
                    return !this.getMainNode()
                }
            },
            brush: {
                type: Bean.types.OBJECT,
                initialValue: null,
                addBeforeSetter: function () {
                    var a = this.getBrush();
                    if (a) {
                        a.settings.save()
                    }
                    return true
                },
                addToSetter: function () {
                    $(".dropperPreview").hide();
                    $(".floodPreview").hide();
                    var a = this.getBrush();
                    a.setTool();
                    $(".effectLabel").html(a.options.effectLabel);
                    a.settings.restore()
                }
            },
            ctx: {
                type: Bean.types.OBJECT,
                initialValue: null
            },
            bufferCtx: {
                type: Bean.types.OBJECT,
                initialValue: null
            },
            stagingCtx: {
                type: Bean.types.OBJECT,
                initialValue: null
            },
            brushCtx: {
                type: Bean.types.OBJECT,
                initialValue: null
            },
            selectedLayer: {
                type: Bean.types.OBJECT,
                initialValue: null,
                addToSetter: function () {
                    var a = this.getSelectedLayer();
                    this.setLayerOpacity($(a.canvasDom).css("opacity"))
                }
            },
            layerOpacity: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 1,
                addToSetter: function () {
                    var a = this.getLayerOpacity().toFixed(3);
                    if (a < 0.01) {
                        this.setLayerOpacity(0.01)
                    } else {
                        this.layerOpacity = a
                    }
                }
            },
            hue: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 0
            },
            saturation: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 1
            },
            value: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 1
            },
            autosave: {
                type: Bean.types.BOOLEAN,
                initialValue: false
            },
            scale: {
                type: Bean.types.POSITIVE_FLOAT,
                initialValue: 1,
                addToSetter: function () {
                    if (mgr.isDrawhere) {
                        if (this.getScale() != 1) {
                            this.setScale(1)
                        }
                    }
                }
            },
            basicPro: {
                type: Bean.types.STRING,
                initialValue: "basic"
            },
            handDrawn: {
                type: Bean.types.BOOLEAN,
                initialValue: true
            },
            draftId: {
                type: Bean.types.POSITIVE_INTEGER,
                initialValue: 0
            },
            draftTitle: {
                type: Bean.types.STRING,
                initialValue: null
            },
            draftFileversion: {
                type: Bean.types.POSITIVE_INTEGER,
                initialValue: 1
            },
            busyFlags: {
                type: Bean.types.OBJECT,
                initialValue: {}
            },
            RDWriter: {
                type: Bean.types.OBJECT,
                initialValue: null,
                nullStub: {
                    isStub: true,
                    startInstruction: function () {
                        return this
                    },
                    addInstructionData: function () {},
                    pushInstruction: function () {},
                    getRandom: function () {
                        return Math.random()
                    }
                }
            },
            RDReader: {
                type: Bean.types.OBJECT,
                initialValue: null
            },
            drawhereUrl: {
                type: Bean.types.STRING,
                initialValue: null
            },
            isRecording: {
                type: Bean.types.BOOLEAN,
                initialValue: false
            },
            recordingDeviationId: {
                type: Bean.types.STRING,
                initialValue: ""
            },
            recordingPreviewUrl: {
                type: Bean.types.STRING,
                initialValue: ""
            },
            playbackFrame: {
                type: Bean.types.INTEGER,
                initialValue: 0,
                addToSetter: function () {
                    mgr.bean.setFramePercent(0)
                }
            },
            playbackSpeed: {
                type: Bean.types.ZERO_ONE_FLOAT,
                initialValue: 0,
                addToSetter: function (a) {
                    safeLocalSet("drawplz_playbackSpeed", a)
                }
            },
            framePercent: {
                type: Bean.types.POSITIVE_FLOAT,
                initialValue: 0
            },
            saveTime: {
                type: Bean.types.POSITIVE_INTEGER,
                initialValue: 0,
                addToSetter: function () {
                    var e;
                    if (!this.getSaveTime()) {
                        e = new Date();
                        this.setSaveTime(e.getTime())
                    } else {
                        e = new Date(this.getSaveTime())
                    }
                    var a = e.getHours();
                    var b = (a >= 12) ? "pm" : "am";
                    if (a > 12) {
                        a -= 12
                    } else {
                        if (a < 1) {
                            a += 12
                        }
                    }
                    var c = e.getMinutes();
                    if (c < 10) {
                        c = "0" + c
                    }
                    this.setSaveTimeString(a + ":" + c + b)
                }
            },
            saveTimeString: {
                type: Bean.types.STRING,
                initialValue: "never"
            },
            overrideQunitSkip: {
                type: Bean.types.BOOLEAN,
                initialValue: false
            },
            isPenDown: {
                type: Bean.types.BOOLEAN,
                initialValue: false
            }
        }
    });
    Bean.createBean(window.DrawBean, DrawBean.attributes);
    if (window.DWait) {
        DWait.run("jms/pages/drawplz/drawBean.js")
    }
});
DWait.ready([...ight() - 50)
} else {
    $(".middleArea", this.mainNode).height(mgr.$mainNode.height())
}
$(".middleArea", this.mainNode).width(mgr.$mainNode.width());
a.refreshViewport();
this.resizeEmbedCover();
var b = mgr.$mainNode.find(".drawPlzCanvas");
this.resizeControls()
}
});
window.CommentLayoutManager = LayoutManager.extend({
    constructor: function (a, b) {
        this.app_type = APP_TYPE_COMMENT;
        this.base(a, b)
    },
    basicProInit: function () {
        mgr.zoomManager.fitToScreen()
    },
    resizeSidebar: function () {
        return
    },
    disableTextSelect: function () {
        return
    },
    resizeDrawingArea: function () {
        var a = mgr.zoomManager;
        var c = $(this.mainNode).height();
        var b = c - this.headerSize - this.controlSize;
        $(".middleArea", this.mainNode).height(b);
        a.fitToScreen();
        this.resizeControls()
    },
    resizeControls: function () {
        var f = $(".centeringDiv", this.mainNode).width();
        var e = $(".buttonControls", this.mainNode).width();
        var a = Math.round((f - e) / 2);
        $(".buttonControls", this.mainNode).css("left", a + "px");
        var g = $(".fourSquares", this.mainNode).width();
        var c = Math.round((f - g) / 2);
        $(".fourSquares", this.mainNode).css("left", c + "px");
        var b = $(".brushSliders", this.mainNode).width();
        var d = Math.round((f - b) / 2);
        $(".brushSliders", this.mainNode).css("left", d + "px")
    },
    updateLayout: function () {
        if (window.recordedDrawingReader) {
            this.base()
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/layoutManager.js")
}
window.FLIP_DIRECTION_HORIZ = 1;
window.FLIP_DIRECTION_VERT = 2;
window.Layer = Base.extend({
    constructor: function (b, a) {
        this.logger = new StdLogger("Layer");
        this.manager = b;
        this.bean = this.manager.bean;
        this.name = this.manager.getUniqueName(a);
        this.layerId = -1 * Math.round(Math.random() * 4294967296 - 1);
        this.gotData = false;
        this.createCanvas();
        this.changeStamp = 0;
        this.oldChangeStamp = -1
    },
    createCanvas: function () {
        this.canvasDom = document.createElement("canvas");
        this.$canvasDom = $(this.canvasDom);
        $(this.manager.paintArea).get(0).appendChild(this.canvasDom);
        this.$canvasDom.addClass("canvasPaint");
        this.canvasObj = new Canvas(this.canvasDom);
        if (!this.bean.getIsHTML5()) {
            this.canvasObj.init(this.manager.realWidth + 20, this.manager.realHeight + 20, false)
        } else {
            this.canvasObj.init(this.manager.realWidth, this.manager.realHeight, false)
        }
        this.ctx = this.canvasObj.context
    },
    getName: function () {
        return this.name
    },
    setName: function (a) {
        if (a == this.name) {
            return
        }
        var b = mgr.bean.getRDWriter().startInstruction(RDInst.LAYER, ["rn", this.name, a]);
        a = this.manager.getUniqueName(a);
        this.name = a;
        this.manager.updateDisplay();
        b.pushInstruction();
        return a
    },
    getId: function () {
        return this.layerId
    },
    setId: function (a) {
        this.layerId = parseInt(a);
        return this.layerId
    },
    getLayerData: function () {
        var a = this.layerData || {};
        a.layerid = this.layerId;
        a.name = this.name;
        return a
    },
    setLayerData: function (a) {
        this.layerData = a;
        this.setId(a.layerid);
        this.setName(a.name);
        return this.layerData
    },
    getOwnerId: function () {
        var a = this.getLayerData();
        if (a && a.ownerid) {
            return a.ownerid
        }
        return false
    },
    getAvatar: function () {
        return (this.layerData && this.layerData.ownerid) ? getManager().userManager.getUserAvatar(this.layerData.ownerid, "userAvatarImg") : null
    },
    getContext: function () {
        return this.ctx
    },
    setZIndex: function (a) {
        $(this.canvasDom).css("z-index", a)
    },
    duplicate: function () {
        copy = new Layer(this.manager, this.name);
        return copy
    },
    destroy: function () {
        $(this.canvasDom).remove()
    },
    select: function () {
        this.bean.startAtomic();
        var a = $(this.canvasDom).css("opacity");
        this.bean.setSelectedLayer(this);
        this.bean.setLayerOpacity(a);
        this.bean.endAtomic();
        return this
    },
    toggle: function () {
        var a = mgr.bean.getRDWriter().startInstruction(RDInst.LAYER, ["v", this.getName(), !this.isVisible]);
        $(this.canvasDom).toggle();
        getManager().layerManager.changeEvent();
        getManager().layerManager.updateDisplay();
        this.setChangeStamp();
        getManager().undoManager.push();
        a.pushInstruction()
    },
    isVisible: function () {
        return $(this.canvasDom).is(":visible")
    },
    isDataLoaded: function () {
        return this.gotData == true
    },
    setData: function (d, c, b) {
        var a = new Image();
        a.onload = function () {
            var e = this.getContext();
            e.clear();
            e.drawImage(a, 0, 0);
            this.setChangeStamp();
            this.logger.log("Setting data");
            if (c) {
                c()
            }
        }.bindTo(this);
        a.src = d;
        this.gotData = true
    },
    setChangeStamp: function (a) {
        this.oldChangeStamp = this.changeStamp;
        if (a == null || a == "undefined") {
            this.changeStamp = new Date().getTime()
        } else {
            this.changeStamp = a
        }
        this.manager.changeEvent([this])
    },
    getMetadata: function () {
        var a = {
            name: this.getName(),
            opacity: Math.round(100 * parseFloat($(this.canvasDom).css("opacity"))) / 100,
            visible: this.isVisible() ? 1 : 0,
            changestamp: this.changeStamp
        };
        if (this.getId() > 0) {
            a.layerid = this.getId()
        }
        return a
    },
    flip: function (b) {
        if (isSpecialChangestamp(this.changeStamp)) {
            return
        }
        var a = mgr.bean.getBufferCtx();
        a.globalCompositeOperation = "source-over";
        a.clear();
        a.drawImage(this.canvasDom, 0, 0);
        this.ctx.clear();
        this.ctx.save();
        if (b == FLIP_DIRECTION_HORIZ) {
            this.ctx.translate(mgr.width, 0);
            this.ctx.scale(-1, 1)
        } else {
            this.ctx.translate(0, mgr.height);
            this.ctx.scale(1, -1)
        }
        this.ctx.drawImage(mgr.bufferCanvas.canvas.get(0), 0, 0);
        this.ctx.restore();
        this.setChangeStamp(null);
        a.clear()
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/layer.js")
}
DWait.ready(["jms/lib/bind.js", "jms/lib/Base.js", "jms/lib/wo.js"], function () {
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
(function () {
        var a = WatchableObject.extend({
            constructor: function () {
                this.broadcast = bind(this, this.broadcast);
                this.reset();
                this.brush_list = {};
                this.timeout_id = null;
                this.delay = 10;
                this.base()
            },
            reset: function () {
                this.empty();
                this.timeout_id = null;
                this.delay = 1000
            },
            empty: function () {
                this.brush_list = {};
                this.brushpackOffers = []
            },
            addBrush: function (c) {
                var b = c.prototype.options.name;
                if (!b || !c || (b in this.brush_list)) {
                    this.delayedBroadcast();
                    return
                }
                this.brush_list[b] = c;
                this.delayedBroadcast()
            },
            addBrushes: function (c) {
                try {
                    for (var d = 0; d < c.length; d++) {
                        var f = c[d];
                        var b = f.prototype.options.name;
                        if (!b || !f || (b in this.brush_list)) {
                            continue
                        }
                        this.brush_list[b] = f
                    }
                    this.delayedBroadcast()
                } catch (g) {
                    console.log("GBrushList: Error adding brushes [" + c + "]")
                }
            },
            delayedBroadcast: function () {
                window.clearTimeout(this.timeout_id);
                this.timeout_id = window.setTimeout(this.broadcast, this.delay)
            },
            broadcast: function () {
                var b = {};
                for (var c in this.brush_list) {
                    b[c] = this.brush_list[c]
                }
                this.base(b)
            }
        });
        window.gBrushList = new a()
    })();
    if (window.DWait) {
        DWait.run("jms/pages/drawplz/gBrushList.js")
    }
});
window.TemplateManager = Base.extend({
    constructor: function () {
        this.logger = new StdLogger("Template Manager")
    },
    addTemplate: function (c, a, b) {
        if (c in jQuery.template) {
            if (!b) {
                return
            }
            this.logger.log("Redefining already defined template [" + c + "]")
        }
        jQuery.template(c, a)
    },
    addTemplates: function (a, b) {
        for (var c in a) {
            this.addTemplate(c, a[c], b)
        }
    },
    getTemplate: function (a) {
        return jQuery.template[a] || ""
    },
    processTemplate: function (b, a) {
        return jQuery.tmpl(b, a)
    },
    processTemplateAndReturnAsString: function (c, a) {
        var b = jQuery("<div>").append(jQuery.tmpl(c, a)).remove().html();
        this.logger.log("Processing template [" + c + "]:" + b);
        return b
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/templateManager.js")
}
window.UserManager = Base.extend({
    constructor: function () {
        this.logger = new StdLogger("User Manager");
        this.reset();
        var a = {
            userLink: ('<span class="userlink">${symbol}<a class="u" href="http://${username}.deviantart.com">${username}</a></span>'),
            userSymbolName: ("${symbol}${username}"),
            userAvatar: ('<img src="${avatar}" alt="Layer owner" />'),
            userAvatarSrc: ("${avatar}")
        };
        getManager().templateManager.addTemplates(a)
    },
    reset: function () {
        this.users = {}
    },
    pushUser: function (b) {
        var a = b.userid || 0;
        if (a) {
            this.logger.log("Adding user with the id " + a);
            this.users[a] = this.sanitizeUserData(b)
        }
    },
    popUser: function (a) {
        var b = this.getUser(a);
        if (b) {
            this.users[a] = null;
            delete this.users[a]
        }
        return b
    },
    pushUsers: function (a) {
        if (!(a && a.length && typeof a != "string")) {
            a = []
        }
        for (var b = 0; b < a.length; b++) {
            this.pushUser(a[b])
        }
    },
    sanitizeUserData: function (b) {
        b = b || {};
        var c = UserManager.DEFAULT_USER_DATA;
        for (var a in c) {
            b[a] = b[a] || c[a]
        }
        return b
    },
    findUserByUsername: function (c) {
        for (var b in this.users) {
            var a = this.users[b];
            var d = String(a.username).toLowerCase();
            if (d.indexOf(c) == 0) {
                return a
            }
        }
    },
    getUser: function (a) {
        if (a && this.users[a]) {
            return this.users[a]
        }
    },
    getUserLink: function (a) {
        var b = this.getUser(a);
        if (b) {
            return this.formatTemplate("userLink", b)
        }
    },
    getUsername: function (a) {
        var b = this.getUser(a);
        if (b) {
            return b.username
        }
    },
    getSymbol: function (a) {
        var b = this.getUser(a);
        if (b) {
            return b.symbol
        }
    },
    getUserSymbolName: function (a) {
        var b = this.getUser(a);
        if (b) {
            return this.formatTemplate("userSymbolName", b)
        }
    },
    getUserAvatar: function (a, c) {
        var b = this.getUser(a);
        c = c || "userAvatar";
        if (b) {
            return this.formatTemplate(c, b)
        }
    },
    formatTemplate: function (b, a) {
        return getManager().templateManager.processTemplateAndReturnAsString(b, a)
    },
    getUserStatus: function (a) {
        var b = this.getUser(a);
        if (b) {
            return b.status
        }
    },
    getDeviant: function () {
        var a;
        try {
            var b = window.deviantART.deviant;
            a = {
                loggedIn: b.loggedIn,
                username: b.username,
                symbol: b.symbol,
                usericon: b.usericon,
                userid: b.id,
                gender: b.gender,
                age: b.age,
                subbed: b.subbed,
                browseadult: b.browseadult
            }
        } catch (c) {
            a = {
                loggedIn: false,
                username: "unknown",
                symbol: "?",
                usericon: "0",
                userid: "0",
                gender: "?",
                age: 0,
                subbed: false,
                browseadult: false
            }
        }
        return a
    }
}, {
    DEFAULT_USER_DATA: {
        username: "unknown",
        userid: 0,
        symbol: "?",
        avatar: "http://a.deviantart.net/avatars/default.gif",
        status: 0,
        usericon: 0
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/userManager.js")
}
window.SliderManager = Base.extend({
    constructor: function () {
        this.sliderId = 0
    },
    fineTuneBinder: function (f, e, g, c, b, a) {
        var d = this.sliderId;
        this.sliderId++;
        if (!a) {
            a = 1
        }
        e.click(function () {
            f.show();
            var h = Math.round(g() * a);
            f.val(h);
            f.get(0).focus();
            return false
        });
        f.blur(function () {
            f.hide()
        });
        f.get(0).onkeydown = function (h) {
            switch (h.which) {
            case 38:
                c(g() + b);
                return false;
            case 40:
                c(g() - b);
                return false
            }
            return true
        };
        f.get(0).onkeyup = function () {
            if (this["timer_" + d]) {
                clearTimeout(this["timer_" + d])
            }
            this["timer_" + d] = setTimeout(function () {
                c(f.val() / a);
                this["timer_" + d] = null
            }.bindTo(this), 1000);
            return false
        }.bindTo(this)
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/slider.js")
}
window.RDInst = {
    BRUSH: "b",
    LAYER: "l",
    TOOLMANAGER: "tm",
    SELECTION: "sel",
    ZOOM: "z",
    UNDO: "u",
    BASICPRO: "bp",
    FILTER: "fil",
    ERROR: "err",
    FLUSH: "flsh"
};
if (window.DWait) {
    DWait.run("jms/pages/drawplz/RDInst.js")
}
window.checkFeature = function (a) {
    try {
        switch (a) {
        case "redraw_play":
            if (mgr.recordingDeviationId) {
                return true
            }
            break;
        case "redraw_rec":
            if ($(".drawPlzContainer").is(".alwaysRec") || mgr.$mainNode.find(".recBut").length > 0) {
                return true
            }
            break;
        case "smudge":
            if ($(".drawPlzContainer").is(".smudge")) {
                return true
            }
            break;
        case "alwaysRec":
            if ($(".drawPlzContainer").is(".alwaysRec")) {
                return true
            }
            break;
        case "v2css":
            if ($("#drawPlz").is(".v2css")) {
                return true
            }
            break;
        case "muroStashImport":
            if ($(".drawPlzContainer").is(".muro-stash-import")) {
                return true
            }
            break
        }
    } catch (b) {
        stdLog("ERROR TRYING TO CHECK FOR FEATURE: " + a)
    }
    return false
};
window.getCheckFeatureInfos = function () {
    var b = ["redraw_play", "redraw_rec", "smudge", "alwaysRec", "v2css", "muroStashImport"];
    var a = {};
    for (var c = 0; c < b.length; c++) {
        a[b[c]] = window.checkFeature(b[c])
    }
    return a
};
if (window.DWait) {
    DWait.run("jms/pages/drawplz/featureManager.js")
}
DWait.count();