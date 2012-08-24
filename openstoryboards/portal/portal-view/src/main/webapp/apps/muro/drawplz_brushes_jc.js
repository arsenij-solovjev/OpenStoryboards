/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved. 
 */
function Base85() {}
Base85.prototype.alphabetChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz{}()[]<>=-~_+?^`|/!#$%&";
Base85.prototype.powerChars = ".,;";
Base85.prototype.repeatChar = "*";
Base85.prototype.encode = function (f) {
    if (!f || !f.length) {
        return ""
    }
    var l, g, k, b, a = "";
    var e = 0,
        h;
    var j = 0;
    while (e < f.length) {
        l = parseInt(f[e]);
        h = 1;
        while ((parseInt(f[++e]) == l) && (h < 84)) {
            ++h
        }
        j += h;
        g = (l / 85) | 0;
        k = l % 85;
        b = "";
        if (g) {
            b += Base85.powerChars.charAt(g - 1)
        }
        b += Base85.alphabetChars.charAt(k);
        if (h > 3) {
            a += Base85.repeatChar + Base85.alphabetChars.charAt(h) + b
        } else {
            while (h--) {
                a += b
            }
        }
    }
    return a
};
Base85.prototype.decode = function (g) {
    if (!g) {
        return ""
    }
    var e = "";
    var a = [];
    var b = 0,
        f;
    while (b < g.length) {
        f = 1;
        e = g.charAt(b);
        if (e == Base85.repeatChar) {
            f = Base85.alphabetChars.indexOf(g.charAt(++b));
            e = g.charAt(++b)
        }
        power = 0;
        m = Base85.powerChars.indexOf(e);
        if (m != -1) {
            power = (m + 1) * 85;
            e = g.charAt(++b)
        }
        val = Base85.alphabetChars.indexOf(e) + power;
        while (f--) {
            a.push(val)
        }++b
    }
    return a
};
Base85.alphabetChars = Base85.prototype.alphabetChars;
Base85.powerChars = Base85.prototype.powerChars;
Base85.repeatChar = Base85.prototype.repeatChar;
Base85.decode = Base85.prototype.decode;
Base85.encode = Base85.prototype.encode;
window.Base85 = Base85;
if (window.DWait) {
    DWait.run("jms/lib/base85.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
window.AssetLoader = {
    requested_files: {},
    loadAssets: function (a, f, k) {
        if (!window.DWait) {
            throw new Error("DWait is not available?")
        }
        if (!a || !a.length || !f || !f.length) {
            throw new Error("Invalid asset filename(s) and/or invalid asset name(s) provided")
        }
        if (!k || (typeof k != "function")) {
            throw new Error("This call is asynchronous. Callback must be provided")
        }
        var j = bind(this, function (i, o) {
            i = i || [];
            var l = {};
            var e = 0;
            while (e < i.length) {
                var n = i[e];
                if (!window.BrushAssets || !BrushAssets[n]) {
                    l[n] = false
                } else {
                    l[n] = BrushAssets[n]
                }
                e++
            }
            o(l)
        }, f, k);
        var b = [];
        for (var g = 0; g < a.length; ++g) {
            if (a[g] in AssetLoader.requested_files) {} else {
                b.push(a[g]);
                AssetLoader.requested_files[a[g]] = true
            }
        }
        if (b.length) {
            try {
                DWait.readyLink("jms/dwait/download.js", this, function () {
                    DWait.download(b, j)
                })
            } catch (h) {}
        } else {
            window.setTimeout(bind(AssetLoader, AssetLoader.checkIfFilesAreLoaded, a, j), 300)
        }
    },
    checkIfFilesAreLoaded: function (e, f) {
        var a = true;
        for (var b = 0; b < e.length; b++) {
            a = a && (DWait.downloads[e[b]] == "completed")
        }
        if (a) {
            f()
        } else {
            window.setTimeout(bind(AssetLoader, AssetLoader.checkIfFilesAreLoaded, e, f), 300)
        }
    },
    convertAssetToPixelData: function (b, h) {
        if (!b || !b.createImageData) {
            throw new Error("Invalid context provided")
        }
        if (!h || !h.width || !h.height || !h.data) {
            return false
        }
        try {
            var a = Base85.decode(h.data);
            var e = b.createImageData(h.width, h.height);
            var g = 0;
            var k = e.data;
            var j = h.inverted || false;
            var f = k.length >> 2;
            while (f--) {
                g = f << 2;
                k[g] = k[g + 1] = k[g + 2] = 0;
                k[g + 3] = j ? 255 - a[f] : a[f]
            }
            return e
        } finally {}
        return false
    },
    defaults: {
        base_path: (window.vms_feature && vms_feature("staging")) ? "http://s.deviantart.com/styles-trunk/jms/pages/drawplz/brushes/assets/" : "http://st.deviantart.com/styles/jms/pages/drawplz/brushes/assets/"
    }
};
if (window.DWait) {
    DWait.run("jms/pages/drawplz/assetLoader.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
window.BrushBase = Base.extend({
    defaultOptions: {
        name: "",
        wacom: false,
        ie: false,
        ie9: true,
        maskBuffers: ["stgCtx"],
        inToolbar: true,
        shouldUndo: true,
        asyncPush: false,
        specialBrushes: false,
        defaultSettings: [20, 1, 0.9],
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_basic.png",
        shouldHandleSharpStrokes: false,
        defaultModifiers: true,
        handlesOwnSelection: false,
        handlesOwnMinMax: false,
        minMaxWidth: 40,
        usersBuffer: false,
        async: false,
        hasFlush: false,
        shiftJitter: 1,
        straightShift: false
    },
    options: {},
    constructor: function (b, a, g, f) {
        this.logger = new StdLogger("Brush");
        this.settings = new BrushSettings(b, this);
        this.bean = b;
        this.ctx = b.getSelectedLayer().getContext();
        this.bufferCtx = g;
        this.brushCtx = f;
        this.button = null;
        this.activated = true;
        for (var e in this.defaultOptions) {
            if (this.options[e] == undefined) {
                this.options[e] = this.defaultOptions[e]
            }
        }
        this.lastCoords = null;
        this.previousCoords = null;
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocity = 0;
        this.shiftKey = false;
        this.settings.restoreFromStorage();
        this.ctxArr = [this.ctx, this.bufferCtx, this.brushCtx];
        this.bean.subscribe("selectedLayer", function () {
            var h = this.bean.getSelectedLayer();
            if (h) {
                this.ctxArr = [this.ctx, this.bufferCtx, this.brushCtx]
            }
        }.bindTo(this));
        this.init()
    },
    init: function () {},
    brushPreview: function (a) {
        $(".brushPreviewCanvas").css("opacity", 1);
        $(".brushPicker .brushPickerCover").hide()
    },
    getCursorSize: function () {
        return this.bean.getBrushSize()
    },
    strokePreview: function (g, a, e) {
        var f = [];
        for (var b = 0; b < 30; b = b + 0.6 + (b / 100)) {
            coord = [];
            coord[0] = a[0] - Math.floor((0.4 * Math.pow(10 - b, 2))) + 25;
            coord[1] = a[1] + (b * 2) - 20;
            coord[2] = Math.pow((10 + b) / 40, 1.5);
            coord[3] = [0, 0];
            f.push(coord);
            if (!e) {
                g(coord, f)
            }
        }
        if (e) {
            g(coord, f)
        }
    },
    recordVelocity: function () {
        if (!this.lastCoords) {
            this.velocityX = 0;
            this.velocityY = 0;
            this.velocity = 0
        } else {
            if (!this.previousCoords) {
                this.velocity = 0;
                this.velocityX = 0;
                this.velocityY = 0;
                this.previousCoords = [this.lastCoords[0], this.lastCoords[1]]
            } else {
                this.velocityX = this.lastCoords[0] - this.previousCoords[0];
                this.velocityY = this.lastCoords[1] - this.previousCoords[1];
                this.velocity = Math.sqrt(Math.pow(this.velocityX, 2) + Math.pow(this.velocityY, 2));
                this.previousCoords = [this.lastCoords[0], this.lastCoords[1]]
            }
        }
    },
    setButton: function (a) {
        this.button = a
    },
    setTool: function () {
        $(".toolbutton").removeClass("toolbuttonActive");
        $(".toolbutton[title=Draw]").addClass("toolbuttonActive");
        $(".specialColor").hide();
        $(".brushPreview .brushPreviewCanvas").show()
    },
    stroke: function (a, b) {},
    getRGBA: function (f, i, a) {
        var h = f.substr(0, 2);
        var g = parseInt((h).substring(0, 2), 16);
        var k = f.substr(2, 2);
        var j = parseInt((k).substring(0, 2), 16);
        var e = f.substr(4, 2);
        var b = parseInt((e).substring(0, 2), 16);
        if (!a) {
            return "rgba(" + g + ", " + j + ", " + b + ", " + i + ")"
        } else {
            return [g, j, b, i]
        }
    },
    clearMinMax: function () {
        var a = getManager();
        this.minX = a.width;
        this.maxX = 0;
        this.minY = a.height;
        this.maxY = 0
    },
    minMax: function (a) {
        this.minX = Math.min(this.minX, a[0] - this.options.minMaxWidth);
        this.maxX = Math.max(this.maxX, a[0] + this.options.minMaxWidth);
        this.minY = Math.min(this.minY, a[1] - this.options.minMaxWidth);
        this.maxY = Math.max(this.maxY, a[1] + this.options.minMaxWidth)
    },
    clearLineStyle: function (e) {
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.shadowColor = this.getRGBA("000000", 0);
            a.shadowBlur = 0;
            a.globalAlpha = 1
        }
    },
    setDefaultLineStyle: function (e) {
        e = e || this.ctxArr;
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over";
            a.globalAlpha = 1;
            a.strokeStyle = this.getRGBA(this.bean.getBackgroundColor(), 1);
            a.lineWidth = this.bean.getBrushSize()
        }
    },
    getRGBALong: function (g, b) {
        var a = parseInt("0x" + g, 16);
        var f = (a >> 16) & 255;
        var e = (a >> 8) & 255;
        var h = a & 255;
        b = ((b * 255) | 0) & 255;
        return (f << 24) | (e << 16) | (h << 8) | b
    },
    isActivated: function () {
        this.activated
    },
    updateVML: function (e, f) {
        var h = "";
        for (var b = 0; b < f.length; b++) {
            var g = f[b];
            ieCoords = this.bufferCtx.getCoords_(Math.floor(g[0][0]), Math.floor(g[0][1]));
            h += " m" + ieCoords.x + "," + ieCoords.y;
            for (var a = 0; a < g.length; a++) {
                c = g[a];
                ieCoords = this.bufferCtx.getCoords_(Math.floor(c[0]), Math.floor(c[1]));
                h += " l" + ieCoords.x + "," + ieCoords.y
            }
        }
        h += " e";
        $(e).attr("path", h)
    },
    getControlPoints: function (g, a) {
        var h, f, e;
        for (var b = 0; b < g.length; b++) {
            if (!a[b]) {
                h = (b == 0) ? null : g[b - 1];
                f = g[b];
                e = (b > g.length - 2) ? null : g[b + 1];
                a[b] = this.controlPoints(h, f, e)
            }
        }
    },
    controlPoints: function (r, p, n) {
        if (!r || !n || (r[0] == p[0] && r[1] == p[1]) || (n[0] == p[0] && n[1] == p[1])) {
            return [[null, null], [null, null]]
        }
        var j = [r[0] + (p[0] - r[0]) / 2, r[1] + (p[1] - r[1]) / 2];
        var i = [p[0] + (n[0] - p[0]) / 2, p[1] + (n[1] - p[1]) / 2];
        var e = Math.pow(Math.pow(p[0] - r[0], 2) + Math.pow(p[1] - r[1], 2), 0.5);
        var b = Math.pow(Math.pow(n[0] - p[0], 2) + Math.pow(n[1] - p[1], 2), 0.5);
        var a = e / (e + b);
        var f = 0.75;
        var q = [j[0] + (a * (i[0] - j[0])), j[1] + (a * (i[1] - j[1]))];
        var l = [q[0] - ((q[0] - j[0]) * f), q[1] - ((q[1] - j[1]) * f)];
        var o = [q[0] - ((q[0] - i[0]) * f), q[1] - ((q[1] - i[1]) * f)];
        var h = [l[0] - (q[0] - p[0]), l[1] - (q[1] - p[1])];
        var g = [o[0] - (q[0] - p[0]), o[1] - (q[1] - p[1])];
        return [h, g]
    },
    random: function () {
        var a;
        var b = mgr.bean.getRDWriter();
        if (!b.isStub) {
            return b.getRandom()
        } else {
            if (a = mgr.bean.getRDReader()) {
                return a.getRandom()
            } else {
                return Math.random()
            }
        }
    },
    recordStart: function (a) {
        a.startInstruction(RDInst.BRUSH, [this.options.name, mgr.bean.getColor(), mgr.bean.getSecondaryColor(), mgr.bean.getBrushOpacity(), mgr.bean.getBrushSize(), mgr.bean.getBrushHardness(), ])
    },
    recordPlayMeta: function (a) {
        try {
            mgr.bean.startAtomic();
            mgr.bean.setColor(a[1]);
            mgr.bean.setSecondaryColor(a[2]);
            mgr.bean.setBrushOpacity(a[3]);
            mgr.bean.setBrushSize(a[4]);
            mgr.bean.setBrushHardness(a[5])
        } finally {
            mgr.bean.endAtomic()
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/brushBase.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var BrushSettings = Base.extend({
    constructor: function (a, b) {
        this.bean = a;
        this.brush = b
    },
    save: function () {
        this.size = this.bean.getBrushSize();
        this.opacity = this.bean.getBrushOpacity();
        this.hardness = this.bean.getBrushHardness();
        this.saveToStorage()
    },
    restore: function () {
        this.bean.setBrushHardness(this.hardness);
        this.bean.setBrushOpacity(this.opacity);
        this.bean.setBrushSize(this.size)
    },
    set: function (b, a, e) {
        this.size = b;
        this.opacity = a;
        this.hardness = e
    },
    saveToStorage: function () {
        if (getManager().brushSelector.initializing) {
            return
        }
        if (!mgr.bean.getRDReader()) {
            safeLocalSet("drawplz_brushsetting_" + this.brush.options.name, [this.size, this.opacity, this.hardness].join(":"))
        }
    },
    restoreFromStorage: function () {
        var a = safeLocalGet("drawplz_brushsetting_" + this.brush.options.name, this.brush.options.defaultSettings, function (f) {
            try {
                return f.split(":")
            } catch (b) {
                stdLog("Could not split: ", f);
                return f
            }
        });
        this.set(a[0], a[1], a[2]);
        this.restore();
        if (isNaN(this.bean.getBrushHardness()) || isNaN(this.bean.getBrushOpacity()) || isNaN(this.bean.getBrushSize())) {
            d = this.brush.options.defaultSettings;
            this.set(d[0], d[1], d[2]);
            this.restore();
            this.save()
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushSettings.js")
}
DWait.ready(["jms/lib/bind.js", "jms/legacy/modals.js", "jms/lib/gwebpage.js", "jms/pages/pointsmodal.js", "cssms/pages/misc/gmbutton2.css"], function () {
    (function (a) {
        window.BrushBuyer = {
            openModal: function (e, f, b) {
                b = a.extend(this.default_options, b, {
                    productid: e,
                    to_user: f
                });
                DiFi.pushPost("DrawPlz", "get_buy_modal", [e, f], bind(this, this.openCallback, b));
                DiFi.send()
            },
            openCallback: function (b, f, e) {
                if (!f || !e.response.content.html) {
                    if (e.response.content.error == "DiFi Security Access Error") {
                        return
                    } else {
                        return DiFi.stdErr("Failed to load modal", e.response.content)
                    }
                }
                gWebPage.update(e.response.content);
                $modal = a(e.response.content.html);
                $modal.find("input[name=rememberpassword]").click(this.rememberpasswordclick.bindTo(this, $modal));
                $modal.find("input[name=userpass]:visible").focus();
                setTimeout(bind(this, this.actualOpen, $modal, b), 50)
            },
            actualOpen: function (e, b) {
                var f = Modals.factory(e, {
                    cssShadows: true,
                    showCloseButton: true
                });
                Modals.push(f, bind(this, this.closeModal, b))
            },
            closeModal: function (e, g, f) {
                if (g != "OK") {
                    return
                }
                var b = this.buildArgs(f);
                DiFi.pushPost("DrawPlz", "buy_brushpack", b, bind(this, this.transferCallback, e));
                DiFi.send()
            },
            buildArgs: function (b) {
                return [b.brushpackid, b.to_user, b.userpass, b.tosagree ? 1 : 0, b.rememberpassword ? 1 : 0]
            },
            transferCallback: function (b, f, e) {
                if (e.response.status != "SUCCESS") {
                    if (e.response.content.error.code == "INSUFFICIENT_FUNDS") {
                        MorePointsManager.openModal()
                    } else {
                        this.displayErrors([e.response.content.error.human])
                    }
                } else {
                    var g = Modals.factory(a(e.response.content.html), {
                        cssShadows: true,
                        showCloseButton: true
                    });
                    Modals.push(g, bind(this, function (h) {
                        if (h != "OK") {
                            return
                        }
                        if (typeof b.callback == "function") {
                            b.callback(f, e)
                        }
                        if (b.forceReload) {
                            window.location.reload(true)
                        }
                    }))
                }
            },
            displayErrors: function (f) {
                var b = a('<div id="buyBrushModalError"><div class="error_icon"></div><div class="header">There were problems with your submission:</div></div>');
                var e = a('<ul id="buyBrushModalErrorList"></ul>').appendTo(b);
                a.each(f, function (g, h) {
                    e.append("<li>" + h + "</li>")
                });
                Modals.push(b.get(0))
            },
            rememberpasswordclick: function (b, f) {
                b.find("div.password-holder").css("visibility", "")
            },
            default_options: {
                forceReload: true,
                callback: false,
                icon: false
            }
        }
    })(jQuery);
    if (window.DWait) {
        DWait.run("jms/pages/drawplz/buybrush.js")
    }
});
/*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
var BasicBrush = BrushBase.extend({
    options: {
        name: "Basic",
        wacom: false,
        ie: true,
        ie9: true,
        glyphPos: 1,
        defaultSettings: [3, 1, 1],
        effectLabel: "Softness",
        maskBuffers: ["bufferCtx"],
        minMaxWidth: 60,
        hasFlush: true,
        straightShift: true
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.SHADOW_DISTANCE = 10000;
        this.count = 0
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx, this.bufferCtx]);
        this.brushInit([this.brushCtx, this.bufferCtx]);
        this.brushCtx.clear();
        this.bufferCtx.clear();
        this.setupShadow(this.brushCtx);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b, [], true)
        }.bindTo(this), a, true);
        this.clearShadow(this.brushCtx)
    },
    setLineStyle: function (a) {
        this._setLineStyle(a, this.bean.getColor())
    },
    _setLineStyle: function (b, e) {
        this.baseLineWidth = this.bean.getBrushSize();
        this.setDefaultLineStyle(b);
        for (var a = 0; a < b.length; a++) {
            b[a].lineWidth = this.baseLineWidth
        }
    },
    brushInit: function (a) {
        this._brushInit(a, this.bean.getColor())
    },
    _brushInit: function (a, b) {
        if (!b) {
            b = this.bean.getColor()
        }
        this.hex = b;
        this.radius = this.bean.getBrushSize();
        this.hardness = this.bean.getBrushHardness()
    },
    setupShadow: function (a) {
        var b;
        this.isOpaque = (this.bean.getBrushOpacity() > 0.9) && (this.bean.getBrushHardness() == 1);
        if (this.isOpaque) {
            this.SHADOW_DISTANCE = 0;
            a.shadowColor = this.getRGBA(this.hex, 0);
            a.strokeStyle = this.getRGBA(this.hex, this.bean.getBrushOpacity());
            a.shadowBlur = 0
        } else {
            this.SHADOW_DISTANCE = getManager().width * 2;
            a.shadowColor = this.getRGBA(this.hex, this.bean.getBrushOpacity());
            a.strokeStyle = this.getRGBA(this.bean.getBackgroundColor(), 1);
            if (mgr.calibrator) {
                b = Math.pow((1 - this.hardness), 2) * Math.log(this.radius) * 1.5;
                mgr.calibrator.specBlur(a, b)
            } else {
                if (!Browser.isFirefox3) {
                    b = Math.ceil((1 - this.hardness) * (1 + this.radius / 20) * 2.5)
                } else {
                    b = Math.ceil((1 - this.hardness) * this.radius * 10 * (this.radius / 50))
                }
                a.shadowBlur = b
            }
        }
        a.shadowOffsetX = this.SHADOW_DISTANCE;
        a.shadowOffsetY = 0
    },
    clearShadow: function (e) {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.shadowColor = this.getRGBA("ffffff", 0)
        }
    },
    startDraw: function (a) {
        this.brushInit([this.ctx, this.bufferCtx]);
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.path = [];
        this.cp = [];
        this.setupShadow(this.bufferCtx);
        this.moveDraw(a)
    },
    moveDraw: function (a, b, f) {
        this.path.push(a);
        this.minMax(a);
        this._moveDraw(false, f);
        return false
    },
    _moveDraw: function (e, b) {
        var a = this.path.length;
        if (a > 2) {
            this.cp[a - 2] = this.controlPoints(this.path[a - 3], this.path[a - 2], this.path[a - 1])
        } else {
            if (a == 2) {
                this.cp[0] = [this.path[0], this.path[0]]
            }
        }
        if (b) {
            return
        }
        if (!this.isOpaque || e) {
            if (this.count++ % 5 || e) {
                this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
                this.stroke(this.bufferCtx, this.path, this.cp, e)
            }
        } else {
            if (this.count++ % 5 || e) {
                this.stroke(this.bufferCtx, this.path, this.cp, e)
            }
        }
    },
    flush: function () {
        if (!this.isOpaque) {
            this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY)
        }
        this.stroke(this.bufferCtx, this.path, this.cp, false)
    },
    endDraw: function (a) {
        this.path.push(a);
        this._moveDraw(true);
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
        this.clearShadow(this.bufferCtx);
        return false
    },
    stroke: function (bufferContext, points, l, g) {
        var f, a;
        if (!points.length) {
            return
        }
        var n = g ? points.length : points.length - 2;
        if (g) {
            if (!l || l.length < n - 1) {
                this.getControlPoints(points, l)
            }
        }
        bufferContext.beginPath();
        bufferContext.moveTo(points[0][0] - this.SHADOW_DISTANCE, points[0][1]);
        for (var b = 0; b < n; b++) {
            if (g) {
                try {
                    f = (b == 0) ? l[0][1] : l[b - 1][1]
                } catch (h) {
                    f = [null, null]
                }
                try {
                    a = (b < points.length - 2) ? l[b][0] : [points[b], points[b]]
                } catch (h) {
                    a = [null, null]
                }
                if (!f || !a || !f[0] || !f[1] || !a[0] || !a[1]) {
                    bufferContext.lineTo(points[b][0] - this.SHADOW_DISTANCE, points[b][1])
                } else {
                    if (f[0] == points[b][0]) {
                        f[0]++
                    }
                    if (f[1] == points[b][1]) {
                        f[1]++
                    }
                    try {
                        bufferContext.bezierCurveTo(f[0] - this.SHADOW_DISTANCE, f[1], a[0] - this.SHADOW_DISTANCE, a[1], points[b][0] - this.SHADOW_DISTANCE, points[b][1])
                    } catch (h) {
                        bufferContext.lineTo(points[b][0] - this.SHADOW_DISTANCE, points[b][1])
                    }
                }
            } else {
                bufferContext.lineTo(points[b][0] - this.SHADOW_DISTANCE, points[b][1])
            }
        }
        bufferContext.stroke()
    },
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/basic.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var ScatterBrush = BrushBase.extend({
    options: {
        name: "Scatter",
        wacom: true,
        ie: true,
        ie9: true,
        glyphPos: 9,
        defaultSettings: [35, 0.5, 0.65],
        effectLabel: "Density",
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_scatter.png",
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    getCursorSize: function () {
        return this.bean.getBrushSize() * 2
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over";
            this.count = 0
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx, this.bufferCtx]);
        this.brushInit([this.brushCtx, this.bufferCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    brushInit: function () {
        this.radius = this.bean.getBrushSize() / 2;
        this.density = 1 - this.bean.getBrushHardness()
    },
    setLineStyle: function (f) {
        var b;
        this.setDefaultLineStyle(f);
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            b = this.bean.getBrushOpacity();
            a.globalAlpha = b;
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 1);
            a.fillStyle = this.getRGBA(this.bean.getColor(), 1);
            a.lineWidth = 2
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.bufferCtx, this.ctx]);
        this.brushInit();
        this.path = [];
        this.count = 0;
        this.moveDraw(a);
        return false
    },
    ieStartDraw: function (a) {
        this.radPaths = []
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.ctx, this.path);
        return false
    },
    ieMoveDraw: function (g, e, h) {
        var f = h[h.length - 1];
        if (1.3 * this.random() < (1 - this.density)) {
            var b = f[0] + (Math.cos(this.random() * 2 * Math.PI) * this.radius);
            var i = f[1] + (Math.cos(this.random() * 2 * Math.PI) * this.radius);
            var a = Math.floor(this.random() * this.radius);
            if (this.radPaths[a]) {
                this.radPaths[a].paths.push([
                    [b + a, i],
                    [b + a, i + 1]
                ])
            } else {
                this.radPaths[a] = [];
                this.bufferCtx.lineWidth = a * 2;
                this.bufferCtx.clear();
                this.bufferCtx.beginPath();
                this.bufferCtx.moveTo(b + a, i);
                this.bufferCtx.lineTo(b + a, i + 1);
                this.bufferCtx.stroke();
                this.radPaths[a].node = $(this.bufferCtx.canvas).find("[path]").remove().appendTo(e.canvas);
                this.radPaths[a].paths = [
                    [
                        [b + a, i],
                        [b + a, i + 1]
                    ]
                ]
            }
            this.updateVML(this.radPaths[a].node, this.radPaths[a].paths)
        }
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    },
    stroke: function (e, g) {
        e.beginPath();
        var f = g[g.length - 1];
        if (1.3 * this.random() > (1 - this.density)) {
            var b = f[0] + (Math.cos(this.random() * 2 * Math.PI) * this.radius) - (this.radius * f[3][0] * 2);
            var h = f[1] + (Math.cos(this.random() * 2 * Math.PI) * this.radius) + (this.radius * f[3][1] * 2);
            var a = Math.ceil(this.random() * this.radius * Math.max(0.2, Math.pow(f[2], 0.8)));
            e.beginPath();
            e.moveTo(b + a, h);
            e.arc(b, h, a, 0, 2 * Math.PI, false);
            e.fill()
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/scatter.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var OrganicBrush = ScatterBrush.extend({
    options: {
        name: "Organic",
        wacom: false,
        ie: false,
        ie9: true
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.imagesData = [];
        this.hasAllRequiredAssets = false
    },
    parseAssets: function (f) {
        if (!this.bean.getIsHTML5()) {
            return false
        }
        this.imagesData = [];
        var l = true;
        for (var g in f) {
            var h = AssetLoader.convertAssetToPixelData(this.ctx, f[g]);
            if (h !== "false") {
                this.imagesData.push(h)
            } else {
                l = false
            }
        }
        var e = 0;
        var k = 0;
        for (var j = 0; j < this.imagesData.length; j++) {
            e = Math.max(e, this.imagesData[j].height);
            k += this.imagesData[j].width
        }
        this.assetCanvas = new Canvas(document.createElement("canvas"));
        this.assetCanvas.init(k, e, true);
        this.assetCanvasOrig = new Canvas(document.createElement("canvas"));
        this.assetCanvasOrig.init(k, e, true);
        var b = 0;
        for (j = 0; j < this.imagesData.length; j++) {
            this.assetCanvasOrig.context.putImageData(this.imagesData[j], b, 0);
            this.imagesData[j].x = b;
            b += this.imagesData[j].width
        }
        this.hasAllRequiredAssets = l;
        return true
    },
    setLineStyle: function (e) {
        if (!this.hasAllRequiredAssets) {
            return
        }
        for (var b = 0; b < e.length; b++) {
            this.opacity = this.bean.getBrushOpacity();
            e[b].globalAlpha = this.opacity
        }
        var a = this.bean.getColor();
        if (this.key == a) {
            return
        }
        this.key = a;
        this.assetCanvas.context.globalCompositeOperation = "source-over";
        this.assetCanvas.context.fillStyle = this.getRGBA(this.bean.getColor(), 1);
        this.assetCanvas.context.fillRect(0, 0, this.assetCanvas.width, this.assetCanvas.height);
        this.assetCanvas.context.fill();
        this.assetCanvas.context.globalCompositeOperation = "destination-in";
        this.assetCanvas.context.drawImage(this.assetCanvasOrig.context.canvas, 0, 0)
    },
    brushPreview: function (a) {
        if (!this.hasAllRequiredAssets) {
            window.setTimeout(function () {
                if (this.brushPreview(a)) {
                    mgr.brushSelector.preview()
                }
            }.bindTo(this), 100);
            return false
        }
        this.setLineStyle([this.brushCtx, this.ctx]);
        this.brushInit([this.brushCtx, this.bufferCtx]);
        this.renderPreview(a);
        return true
    },
    renderPreview: function (a) {
        if (!this.hasAllRequiredAssets) {
            return window.setTimeout(bind(this, this.renderPreview, a), 50)
        }
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    stroke: function (e, i) {
        if (!this.hasAllRequiredAssets) {
            return
        }
        var h = i[i.length - 1];
        if (1.3 * this.random() > (1 - this.density)) {
            var b = h[0];
            var j = h[1];
            var a = Math.ceil(this.random() * this.radius * Math.sqrt(h[2]));
            var f = a * 4;
            e.save();
            try {
                e.translate(b, j);
                e.rotate(this.random() * 2 * Math.PI);
                var g = (this.imagesData.length * this.random()) | 0;
                e.drawImage(this.assetCanvas.context.canvas, this.imagesData[g].x, 0, this.imagesData[g].width, this.imagesData[g].height, 0, 0, f, f)
            } finally {
                e.restore()
            }
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/organic.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var MaskBrush = BrushBase.extend({
    options: {
        name: "Mask",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 2,
        defaultSettings: [3, 1, 0.99],
        shouldHandleSharpStrokes: true,
        effectLabel: "Effect"
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        if (Browser.isSafari && mgr.bean.getRDReader()) {
            this.buildMask(this.bufferCtx);
            if (this.maskCanvKey != this.getMaskKey(this.bufferCtx)) {
                this.buildMaskCanvas();
                this.maskCanvKey = this.getMaskKey(this.bufferCtx)
            }
        } else {
            this.buildMask(this.bufferCtx)
        }
        this.brushInit([this.brushCtx, this.bufferCtx]);
        this.setLineStyle([this.brushCtx, this.bufferCtx]);
        $(".brushPreviewCanvas").css("opacity", this.bean.getBrushOpacity());
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a, true)
    },
    buildMaskCanvas: function () {
        if (!this.maskCanvas) {
            this.maskCanvas = document.createElement("canvas");
            this.maskCanv = new Canvas(this.maskCanvas);
            this.maskCanv.init(mgr.width, mgr.height, false)
        }
        var a = this.maskCanv.context;
        this.maskKey = null;
        a.clear();
        a.fillStyle = this.pattern;
        a.beginPath();
        a.rect(0, 0, mgr.width, mgr.height);
        a.fill()
    },
    setLineStyle: function (a) {
        this.lineWidth = this.bean.getBrushSize();
        this.setDefaultLineStyle(a);
        $(".canvasBuffer").css("opacity", this.bean.getBrushOpacity())
    },
    setDefaultLineStyle: function (e) {
        e = e || this.ctxArr;
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalAlpha = 1;
            a.strokeStyle = this.pattern;
            a.lineWidth = this.bean.getBrushSize();
            a.globalCompositeOperation = "source-over";
            a.shadowColor = this.getRGBA("ffffff", 0);
            a.shadowBlur = 0
        }
    },
    brushInit: function (a) {
        this.radius = this.bean.getBrushSize();
        this.hardness = this.bean.getBrushHardness()
    },
    buildMask: function (a) {
        this.logger.log("MUST IMPLEMENT!")
    },
    getMaskKey: function (a) {
        return this.bean.getBrushHardness() + "_" + this.bean.getColor()
    },
    startDraw: function (a) {
        this.brushInit([this.ctx, this.bufferCtx]);
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.path = [];
        this.count = 0
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.bufferCtx, this.path);
        return false
    },
    endDraw: function (a) {
        this.ctx.globalAlpha = this.bean.getBrushOpacity();
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
        return false
    },
    stroke: function (a, f) {
        var e, b;
        if ((Browser.isSafari && mgr.bean.getRDReader())) {
            this.fuckedUpSafariBugCanStrokeDeezNutz(a, f);
            return
        } else {
            while (f.length > 1) {
                e = f.shift();
                b = f[0];
                a.lineWidth = this.lineWidth * Math.pow(e[2], 2.5);
                a.beginPath();
                a.moveTo(e[0], e[1]);
                a.lineTo(b[0], b[1]);
                a.stroke()
            }
        }
    },
    fuckedUpSafariBugCanStrokeDeezNutz: function (f, j) {
        f.strokeStyle = this.getRGBA("000000", 1);
        while (j.length > 1) {
            coord1 = j.shift();
            coord2 = j[0];
            f.lineWidth = this.lineWidth * Math.pow(coord1[2], 2.5);
            f.globalCompositeOperation = "source-over";
            f.beginPath();
            f.moveTo(coord1[0], coord1[1]);
            f.lineTo(coord2[0], coord2[1]);
            f.stroke();
            f.globalCompositeOperation = "source-in";
            if (f != mgr.bean.getBrushCtx()) {
                try {
                    var a = Math.min(mgr.width - 1, Math.max(0, this.minX));
                    var k = Math.min(mgr.height - 1, Math.max(0, this.minY));
                    var b = Math.min(mgr.width - a, Math.max(1, this.maxX - this.minX));
                    var g = Math.min(mgr.height - k, Math.max(1, this.maxY - this.minY));
                    f.drawImage(this.maskCanvas, a, k, b, g, a, k, b, g)
                } catch (i) {
                    breakpoint()
                }
            } else {
                f.drawImage(this.maskCanvas, 0, 0)
            }
        }
        f.globalCompositeOperation = "source-over"
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/mask.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var TextureBrush = MaskBrush.extend({
    options: {
        name: "Texture",
        ie: false,
        ie9: true,
        glyphPos: 2,
        defaultSettings: [40, 1, 0],
        effectLabel: "Effect",
        shouldHandleSharpStrokes: true,
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.imagesData = [];
        this.pattern = null;
        this.hasAllRequiredAssets = false
    },
    parseAssets: function (b) {
        this.imagesData = [];
        var g = true;
        for (var e in b) {
            var f = AssetLoader.convertAssetToPixelData(this.ctx, b[e]);
            if (f !== "false") {
                this.imagesData.push(f)
            } else {
                g = false
            }
        }
        this.hasAllRequiredAssets = g;
        return true
    },
    chromeSux: function (a) {
        if (this.maskKey == this.getMaskKey(a)) {
            return
        }
        if (!this.hasAllRequiredAssets) {
            window.setTimeout(function () {
                if (this.buildChromeSuxCanvas()) {
                    mgr.brushSelector.preview()
                }
            }.bindTo(this), 100);
            return false
        }
        try {
            var f = this.imagesData[0];
            var l = document.createElement("canvas");
            l.setAttribute("width", f.width);
            l.setAttribute("height", f.height);
            var h = l.getContext("2d");
            h.globalCompositeOperation = "source-over";
            h.putImageData(f, 0, 0);
            h.globalCompositeOperation = "source-atop";
            h.fillStyle = this.getRGBA(this.bean.getColor(), 1);
            h.fillRect(0, 0, f.width, f.height);
            h.globalCompositeOperation = "destination-over";
            h.fillStyle = this.avgRGBA(this.bean.getSecondaryColor(), this.bean.getColor(), 0.8 * this.bean.getBrushHardness(), 1);
            h.fillRect(0, 0, f.width, f.height);
            for (var g = 0; g < mgr.width; g += f.width) {
                for (var b = 0; b < mgr.height; b += f.height) {
                    a.drawImage(l, g, b)
                }
            }
            this.maskKey = this.getMaskKey()
        } catch (k) {
            this.pattern = null;
            return false
        }
        return true
    },
    buildMask: function (a) {
        if (!this.hasAllRequiredAssets) {
            window.setTimeout(function () {
                if (this.buildMask(this.bean.getBrushCtx())) {
                    mgr.brushSelector.preview()
                }
            }.bindTo(this), 100);
            return false
        }
        if (this.maskKey == this.getMaskKey(a)) {
            return true
        }
        try {
            var b = this.imagesData[0];
            var h = document.createElement("canvas");
            h.setAttribute("width", b.width);
            h.setAttribute("height", b.height);
            var f = h.getContext("2d");
            f.globalCompositeOperation = "source-over";
            f.putImageData(b, 0, 0);
            f.globalCompositeOperation = "source-atop";
            f.fillStyle = this.getRGBA(this.bean.getColor(), 1);
            f.fillRect(0, 0, b.width, b.height);
            f.globalCompositeOperation = "destination-over";
            f.fillStyle = this.avgRGBA(this.bean.getSecondaryColor(), this.bean.getColor(), 0.8 * this.bean.getBrushHardness(), 1);
            f.fillRect(0, 0, b.width, b.height);
            this.pattern = this.ctx.createPattern(h, "repeat");
            h = null;
            this.maskKey = this.getMaskKey()
        } catch (g) {
            this.pattern = null;
            return false
        }
        return true
    },
    getMaskKey: function () {
        return this.bean.getBrushHardness() + "_" + this.bean.getSecondaryColor() + "_" + this.bean.getColor()
    },
    avgRGBA: function (p, o, e, j) {
        var h = parseInt((p.substr(0, 2)).substring(0, 2), 16);
        var f = parseInt((p.substr(2, 2)).substring(0, 2), 16);
        var n = parseInt((p.substr(4, 2)).substring(0, 2), 16);
        var g = parseInt((o.substr(0, 2)).substring(0, 2), 16);
        var b = parseInt((o.substr(2, 2)).substring(0, 2), 16);
        var k = parseInt((o.substr(4, 2)).substring(0, 2), 16);
        var i = Math.min(255, Math.max(0, Math.round(h + ((g - h) * e))));
        var l = Math.min(255, Math.max(0, Math.round(f + ((b - f) * e))));
        var a = Math.min(255, Math.max(0, Math.round(n + ((k - n) * e))));
        return "rgba(" + i + ", " + l + ", " + a + ", " + j + ")"
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/texture.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var BubbleBrush = ScatterBrush.extend({
    options: {
        name: "Bubbles",
        wacom: false,
        ie: false,
        ie9: true,
        glyphPos: 10,
        defaultSettings: [35, 1, 0.65],
        effectLabel: "Density",
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_bubble.png",
        shiftJitter: 0
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit([this.brushCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    setLineStyle: function (f) {
        var b;
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            b = this.bean.getBrushOpacity();
            a.globalAlpha = b;
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 1);
            a.fillStyle = this.getRGBA(this.bean.getColor(), 0);
            a.lineWidth = 2
        }
    },
    stroke: function (a, b) {
        this.lobotomized(a, b)
    },
    lobotomized: function (a, b) {
        return
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/bubble.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var EyeDropperBrush = BrushBase.extend({
    options: {
        name: "Eye Dropper",
        wacom: false,
        ie: false,
        ie9: true,
        inToolbar: false,
        shouldUndo: false
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.cursorImage = new Image();
        this.cursorImage.src = "http://st.deviantart.net/minish/canvasdraw/brushassets/eye_cursor.png"
    },
    setTool: function () {
        $(".toolbutton").removeClass("toolbuttonActive");
        $(".toolbutton[title='Eye Dropper']").addClass("toolbuttonActive")
    },
    getCursorSize: function () {
        return (36 / this.bean.getScale())
    },
    customCursor: function (a) {
        a.globalAlpha = 1;
        a.drawImage(this.cursorImage, 20, 10)
    },
    init: function () {},
    brushPreview: function (a) {
        $(".brushPicker .brushPickerCover").show()
    },
    startDraw: function (a) {
        lm = getManager().layerManager;
        tmpCanvas = lm.merge(lm.layers, true);
        tmpCtx = tmpCanvas.getContext("2d");
        this.pixelData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCanvas = null;
        return false
    },
    pickColor: function (e) {
        x = Math.round(e[0]);
        y = Math.round(e[1]);
        var a = this.ctx.getPixel(this.pixelData, x, y);
        if (a[3] <= 10) {
            return
        }
        var b = toHexByte(a[0]) + toHexByte(a[1]) + toHexByte(a[2]);
        this.bean.setColor(b)
    },
    moveDraw: function (a) {
        this.pickColor(a);
        return false
    },
    endDraw: function (a) {
        this.pickColor(a);
        this.pixelData = null;
        return false
    },
    recordStart: function (a) {
        a.startInstruction(RDInst.BRUSH, [this.options.name])
    },
    recordPlayMeta: function (a) {}
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/eyedropper.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var GradientBrush = BrushBase.extend({
    options: {
        name: "Gradient Fill",
        wacom: false,
        ie: false,
        ie9: false,
        defaultSettings: [15, 1, 1],
        maskBuffers: ["bufferCtx"],
        inToolbar: false,
        effectLabel: "End Opacity"
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.cursorImage = new Image();
        this.cursorImage.src = "http://st.deviantart.net/minish/canvasdraw/brushassets/move_cursor.png?2"
    },
    getCursorSize: function () {
        return (36 / this.bean.getScale())
    },
    customCursor: function (a) {},
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-in"
        }
    },
    setTool: function () {
        $(".toolbutton").removeClass("toolbuttonActive");
        $(".toolbutton[title='Gradient Fill']").addClass("toolbuttonActive")
    },
    brushPreview: function (a) {
        this.base(a);
        this.brushInit([this.brushCtx]);
        this.brushCtx.clearRect(0, 0, this.brushCtx.canvas.width, this.brushCtx.canvas.height);
        var b = this.brushCtx.createLinearGradient(0, 0, this.brushCtx.canvas.width, this.brushCtx.canvas.height);
        b.addColorStop(0, this.getRGBA(this.fg, this.opacity));
        b.addColorStop(1, this.getRGBA(this.bg, 1 - this.bean.getBrushHardness()));
        this.brushCtx.fillStyle = b;
        this.brushCtx.fillRect(0, 0, this.brushCtx.canvas.width, this.brushCtx.canvas.height)
    },
    brushInit: function (a) {
        this.path = [];
        this.opacity = this.bean.getBrushOpacity();
        this.radius = this.bean.getBrushSize();
        this.fg = this.bean.getColor();
        this.bg = this.bean.getSecondaryColor();
        this.angle = 0
    },
    setLineStyle: function (b) {
        this.setDefaultLineStyle(b);
        for (var a = 0; a < b.length; a++) {
            b[a].lineWidth = this.baseLineWidth
        }
    },
    startDraw: function (a) {
        this.base(a);
        this.path = [];
        this.stgCtx = this.bean.getStagingCtx();
        $(this.stgCtx.canvas).hide()
    },
    endDraw: function (a) {
        this.moveDraw(a);
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.bufferCtx.clear();
        $(this.ctx.canvas).show();
        this.clearMinMax();
        this.stgCtx = this.stgDom = this.hasSel = this.selDom = null;
        return false
    },
    moveDraw: function (a) {
        this.bufferCtx.clear();
        this.path.push(a);
        this.stroke(this.bufferCtx, this.path);
        return false
    },
    stroke: function (b, g) {
        if (!g.length || g.length < 2) {
            return
        }
        var e = g[0];
        var a = g[g.length - 1];
        var f = b.createLinearGradient(e[0], e[1], a[0], a[1]);
        f.addColorStop(0, this.getRGBA(this.fg, this.opacity));
        f.addColorStop(1, this.getRGBA(this.bg, 1 - this.bean.getBrushHardness()));
        b.fillStyle = f;
        b.fillRect(0, 0, b.canvas.width, b.canvas.height)
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/gradient.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var DrippyBrush = BrushBase.extend({
    options: {
        name: "Drippy",
        ie: false,
        ie9: true,
        glyphPos: 8,
        defaultSettings: [20, 0.5, 0.1],
        effectLabel: "Drippiness",
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_drippy.png",
        maskBuffers: ["stgCtx", "bufferCtx"],
        shiftJitter: 0
    },
    update: function (a) {
        return
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over";
            this.count = 0
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx, this.bufferCtx]);
        this.brushInit([this.brushCtx, this.bufferCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    brushInit: function (e) {
        var b = this.bean.getBrushOpacity();
        var a = this.bean.getBrushSize();
        var f = this.bean.getBrushHardness();
        this.minRad = Math.ceil(f * a);
        this.radiusDelta = a - this.minRad;
        if (this.radiusDelta <= 0) {
            this.radiusDelta = 1
        }
        this.drippiness = 1 - (this.bean.getBrushHardness() * this.bean.getBrushHardness())
    },
    setLineStyle: function (f) {
        var b, a;
        this.setDefaultLineStyle(f);
        for (var e = 0; e < f.length; e++) {
            a = f[e];
            b = this.bean.getBrushOpacity();
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 1);
            a.lineWidth = this.bean.getBrushSize()
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.bufferCtx, this.ctx]);
        this.brushInit([this.bufferCtx, this.ctx]);
        this.count = 0;
        this.path = [];
        this.moveDraw(a);
        return false
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.ctx, this.path);
        return false
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    },
    stroke: function (k, l) {
        if (l.length < 2) {
            return
        }
        var i = l[l.length - 1];
        var h = l[l.length - 2];
        k.beginPath();
        k.moveTo(i[0], i[1]);
        k.lineTo(h[0], h[1]);
        k.stroke();
        var a = this.random() * (400 * (1 - this.drippiness) * Math.sqrt(this.velocity + this.velocityX + 0.001) + 2);
        if (a < 1) {
            try {
                k.globalAlpha = this.bean.getBrushOpacity();
                var b = k.lineWidth;
                k.lineWidth = Math.min(10, Math.ceil(this.random() * k.lineWidth / 3));
                var f = (this.random() * 1000) / (this.velocity + 3);
                k.beginPath();
                var j = l[l.length - 1][0] + ((b - (k.lineWidth / 2)) * (this.random() - 0.5));
                k.moveTo(j, l[l.length - 1][1]);
                k.lineTo(j, l[l.length - 1][1] + f);
                this.minMax([j, l[l.length - 1][1] + f]);
                k.stroke()
            } catch (g) {}
            k.lineWidth = b;
            k.globalAlpha = 1
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/drippy.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
window.EraserBrush = BasicBrush.extend({
    options: {
        name: "Eraser",
        wacom: true,
        ie: false,
        ie9: true,
        defaultSettings: [15, 1, 0.99],
        effectLabel: "Softness",
        maskBuffers: ["bufferCtx"],
        handlesOwnSelection: true,
        inToolbar: false
    },
    setTool: function () {
        $(".toolbutton").removeClass("toolbuttonActive");
        $(".toolbutton[title=Eraser]").addClass("toolbuttonActive")
    },
    brushInit: function (a) {
        this.hex = this.bean.getBackgroundColor();
        this._brushInit(a, this.hex)
    },
    brushPreview: function (a) {
        this.setLineStyle([this.brushCtx, this.bufferCtx, this.bean.getStagingCtx()]);
        this.brushInit([this.brushCtx, this.bufferCtx, this.bean.getStagingCtx()]);
        this.setupShadow(this.brushCtx);
        this.brushCtx.clearToColor("#000000");
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a, true);
        this.clearShadow(this.brushCtx)
    },
    setLineStyle: function (a) {
        this._setLineStyle(a)
    },
    startDraw: function (a) {
        this.base(a);
        this.copyContext(this.ctx, this.bufferCtx);
        $(this.ctx.canvas).hide();
        this.stgCtx = this.bean.getStagingCtx();
        $(this.stgCtx.canvas).hide();
        if (window.SelectionManager) {
            this.hasSel = getManager().selectionManager.hasSelection;
            this.selDom = getManager().selectionManager.selDom;
            this.stgDom = this.stgCtx.canvas
        } else {
            this.hasSel = false
        }
        if (this.hasSel) {
            this.setupShadow(this.stgCtx)
        }
    },
    copyContext: function (f, a) {
        try {
            a.clear();
            a.globalCompositeOperation = "source-over";
            a.globalAlpha = 1;
            var b = a.shadowBlur;
            a.shadowBlur = 0;
            a.drawImage(f.canvas, 0, 0);
            a.shadowBlur = b
        } catch (g) {
            console.log("brushes.eraser#copyContext Error: Incompatible contexts")
        }
    },
    moveDraw: function (a) {
        this.path.push(a);
        if (!this.isOpaque) {
            if ((this.count++ % 5) || this.shiftKey) {
                this.copyContext(this.ctx, this.bufferCtx);
                if (this.hasSel) {
                    this.stgCtx.clear()
                }
                this.stroke(this.bufferCtx, this.path)
            }
        } else {
            this.stroke(this.bufferCtx, this.path);
            if (this.path.length > 2) {
                this.path.shift()
            }
        }
        return false
    },
    endDraw: function (a) {
        this.ctx.globalAlpha = 1;
        this.ctx.clear();
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.bufferCtx.clear();
        this.clearShadow(this.bufferCtx);
        this.clearShadow(this.stgCtx);
        $(this.stgCtx.canvas).show();
        $(this.ctx.canvas).show();
        this.stgCtx = this.stgDom = this.hasSel = this.selDom = null;
        return false
    },
    stroke: function (a, e) {
        if (!e.length) {
            return
        }
        var f, b;
        if (this.hasSel && a != this.brushCtx) {
            f = this.SHADOW_DISTANCE;
            this.stgCtx.beginPath();
            this.stgCtx.moveTo(e[0][0] - f, e[0][1]);
            for (b = 0; b < e.length; b++) {
                c = e[b];
                this.stgCtx.lineTo(c[0] - f, c[1])
            }
            this.stgCtx.stroke();
            this.stgCtx.globalCompositeOperation = "destination-out";
            this.stgCtx.drawImage(this.selDom, 0, 0);
            this.stgCtx.globalCompositeOperation = "source-over";
            a.globalCompositeOperation = "destination-out";
            a.drawImage(this.stgDom, 0, 0);
            a.globalCompositeOperation = "source-over";
            this.stgCtx.clear()
        } else {
            a.globalCompositeOperation = "destination-out";
            f = this.SHADOW_DISTANCE;
            a.beginPath();
            a.moveTo(e[0][0] - f, e[0][1]);
            for (b = 0; b < e.length; b++) {
                c = e[b];
                a.lineTo(c[0] - f, c[1])
            }
            a.stroke();
            a.globalCompositeOperation = "source-over"
        }
    },
    recordStart: function (a) {
        a.startInstruction(RDInst.BRUSH, [this.options.name, mgr.bean.getBrushOpacity(), mgr.bean.getBrushSize(), mgr.bean.getBrushHardness(), ])
    },
    recordPlayMeta: function (a) {
        mgr.bean.setBrushOpacity(a[1]);
        mgr.bean.setBrushSize(a[2]);
        mgr.bean.setBrushHardness(a[3])
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/eraser.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var FloodFillBrush = BrushBase.extend({
    options: {
        name: "Flood Fill",
        wacom: false,
        ie: false,
        ie9: true,
        defaultSettings: [40, 1, 0.5],
        effectLabel: "Threshold",
        handlesOwnSelection: true,
        inToolbar: false,
        shouldUndo: false,
        asyncPush: true,
        async: true
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.is_busy = false;
        this.cursorImage = new Image();
        this.cursorImage.src = "http://st.deviantart.net/minish/canvasdraw/brushassets/flood_cursor.png"
    },
    setTool: function () {
        $(".toolbutton").removeClass("toolbuttonActive");
        $(".toolbutton[title='Flood Fill']").addClass("toolbuttonActive")
    },
    getCursorSize: function () {
        return 36
    },
    customCursor: function (a) {
        a.globalAlpha = 1;
        a.drawImage(this.cursorImage, 5, 8)
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.globalCompositeOperation = "source-over";
            a.globalAlpha = 1;
            this.count = 0
        }
    },
    brushPreview: function (a) {
        $(".brushPicker .brushPickerCover").show();
        $(".specialColor").show()
    },
    setLineStyle: function (e) {
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 1);
            a.fillStyle = this.getRGBA(this.bean.getColor(), 1);
            a.lineWidth = Math.ceil(this.bean.getBrushSize() / 2)
        }
    },
    startDraw: function (a) {
        return false
    },
    moveDraw: function (a) {
        return false
    },
    endDraw: function (b) {
        if (this.is_busy) {
            return false
        }
        var a = this.bean.getColor();
        this.tolerance = (1 - this.bean.getBrushHardness()) * 15;
        this.pd = this.ctx.getPixelData();
        this.floodFill(b, a);
        return false
    },
    findLine: function (a, f, b, e) {
        sampledPixel = this.ctx.getPixel(this.pd, a, f);
        if ((sampledPixel[0] == e[0] && sampledPixel[1] == e[1] && sampledPixel[2] == e[2] && sampledPixel[3] == e[3]) || (this.ctx.colorDistance(b, sampledPixel) > this.tolerance)) {
            return null
        }
        this.ctx.setPixel(this.pd, a, f, e);
        west = a;
        foundEnd = false;
        while (!foundEnd) {
            west--;
            sampledPixel = this.ctx.getPixel(this.pd, west, f);
            if (west < 0 || this.ctx.colorDistance(b, sampledPixel) > this.tolerance) {
                west++;
                foundEnd = true
            } else {
                this.ctx.setPixel(this.pd, west, f, e)
            }
        }
        if (west > 0) {
            this.ctx.setPixel(this.pd, west - 1, f, this.ctx.avgColors(e, sampledPixel, 2));
            if (west > 1) {
                sampledPixel = this.ctx.getPixel(this.pd, west - 2, f);
                this.ctx.setPixel(this.pd, west - 2, f, this.ctx.avgColors(e, sampledPixel, 0.25))
            }
        }
        east = a;
        foundEnd = false;
        while (!foundEnd) {
            east++;
            sampledPixel = this.ctx.getPixel(this.pd, east, f);
            if (east >= this.pd.width || this.ctx.colorDistance(b, sampledPixel) > this.tolerance) {
                east--;
                foundEnd = true
            } else {
                this.ctx.setPixel(this.pd, east, f, e)
            }
        }
        if (east < (this.pd.width - 1)) {
            this.ctx.setPixel(this.pd, east + 1, f, this.ctx.avgColors(e, sampledPixel, 2));
            if (east < this.pd.width - 1) {
                sampledPixel = this.ctx.getPixel(this.pd, east + 2, f);
                this.ctx.setPixel(this.pd, east + 2, f, this.ctx.avgColors(e, sampledPixel, 0.25))
            }
        }
        return [west, east]
    },
    runForWhile: function () {
        var l = 0;
        var f = new Date().getMilliseconds();
        while (this.stack.length > 0) {
            var b = this.stack.pop();
            try {
                var p = b[0];
                var r = b[1];
                var h = b[2];
                var o = b[3];
                if (p > 0) {
                    var j = r[0];
                    while (j <= r[1]) {
                        var k = this.findLine(j, p - 1, this.target_color, this.new_color);
                        if (k && (k.length) > 0 && (k[0] != k[1])) {
                            this.stack.push([p - 1, k, [-1, -1], r]);
                            j = k[1] + 1
                        } else {
                            if (j >= h[0] && j <= h[1]) {
                                j = h[1] + 1
                            } else {
                                j++
                            }
                        }
                    }
                }
                if (p < (this.pd.height - 1)) {
                    var j = r[0];
                    while (j <= r[1]) {
                        var g = this.findLine(j, p + 1, this.target_color, this.new_color);
                        if (g && (g.length > 0) && (g[0] != g[1])) {
                            this.stack.push([p + 1, g, r, [-1, -1]]);
                            j = g[1] + 1
                        } else {
                            if (j >= o[0] && j <= o[1]) {
                                j = o[1] + 1
                            } else {
                                j++
                            }
                        }
                    }
                }
            } catch (n) {}
            if (new Date().getMilliseconds() > (f + 100)) {
                this.copyPdToCtx();
                setTimeout(this.runForWhile.bindTo(this), 1);
                return
            }
        }
        try {
            this.copyPdToCtx();
            this.ctx.strokeStyle = "rgba(0,0,0,0.0001)";
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(2, 2);
            this.ctx.stroke();
            this.bean.getSelectedLayer().setChangeStamp();
            getManager().undoManager.push();
            var a = mgr.bean.getRDReader();
            if (a) {
                setTimeout(function () {
                    mgr.bean.getRDReader().resumeFromAsync()
                }, 5)
            }
            var q = mgr.bean.getRDWriter();
            if (q) {
                q.pushInstruction()
            }
        } finally {
            this.is_busy = false
        }
    },
    copyPdToCtx: function () {
        var a = getManager().selectionManager;
        if (window.SelectionManager && a.hasSelection) {
            this.bufferCtx.clear();
            this.bufferCtx.putImageData(this.pd, 0, 0);
            this.bufferCtx.globalCompositeOperation = "destination-out";
            this.bufferCtx.drawImage(a.selDom, 0, 0);
            this.bufferCtx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(this.bufferCtx.obj.canvas.get(0), 0, 0);
            this.bufferCtx.clear()
        } else {
            this.ctx.putImageData(this.pd, 0, 0)
        }
    },
    floodFill: function (e, b) {
        if (this.is_busy) {
            return false
        }
        this.is_busy = true;
        var a = parseInt(e[0]);
        var g = parseInt(e[1]);
        this.target_color = this.ctx.getPixel(this.pd, a, g);
        this.new_color = hexToRgba(b + "FF");
        this.stack = [];
        if (this.ctx.colorDistance(this.target_color, this.new_color) <= this.tolerance) {
            this.is_busy = false;
            if (mgr.bean.getRDReader()) {
                setTimeout(function () {
                    mgr.bean.getRDReader().resumeFromAsync()
                }, 5)
            }
            var f = mgr.bean.getRDWriter();
            if (f) {
                f.pushInstruction()
            }
            return
        }
        this.stack.push([g, this.findLine(a, g, this.target_color, this.new_color), [-1, -1],
            [-1, -1]
        ]);
        setTimeout(this.runForWhile.bindTo(this), 1)
    },
    stroke: function (a, b) {},
    recordStart: function (a) {
        a.startInstruction(RDInst.BRUSH, [this.options.name, mgr.bean.getColor(), mgr.bean.getBrushHardness(), ])
    },
    recordPlayMeta: function (a) {
        mgr.bean.setColor(a[1]);
        mgr.bean.setBrushHardness(a[2])
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/floodfill.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var HeatBrush = BrushBase.extend({
    options: {
        name: "Heat",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 19,
        defaultSettings: [20, 1, 0.5],
        effectLabel: "Conductivity",
        maskBuffers: ["stgCtx", "bufferCtx"],
        shiftJitter: 0
    },
    update: function (a) {
        return
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.SHADOW_DISTANCE = 10000;
        this.activated = false
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit([this.brushCtx]);
        this.setupShadow(this.brushCtx);
        $(".brushPreviewCanvas").css("opacity", this.bean.getBrushOpacity());
        this.strokePreview(function (e, b) {
            this.lobotomized(this.brushCtx, b)
        }.bindTo(this), a, false)
    },
    brushInit: function (a) {
        this.hex = this.bean.getColor();
        this.radius = this.bean.getBrushSize();
        this.hardness = 0.5;
        this.awesomeness = 0.01 * (1 - this.bean.getBrushHardness());
        this.scaler = 0
    },
    setLineStyle: function (e) {
        this.brushSize = this.bean.getBrushSize();
        this.baseColor = this.bean.getColor();
        this.baseHSV = HexToHSV(this.baseColor);
        this.radius = this.bean.getBrushSize();
        this.setDefaultLineStyle(e);
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 1);
            a.fillStyle = this.getRGBA(this.bean.getColor(), 1);
            a.lineWidth = this.bean.getBrushSize()
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit([this.ctx, this.bufferCtx]);
        this.setupShadow(this.bufferCtx);
        this.path = []
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.lobotomized(this.bufferCtx, this.path);
        return false
    },
    endDraw: function (a) {
        this.ctx.globalAlpha = this.bean.getBrushOpacity();
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.ctx.globalAlpha = 1;
        this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
        this.clearShadow(this.bufferCtx);
        return false
    },
    setupShadow: function (a) {
        blur = Math.ceil((1 - this.hardness) * this.radius * 10);
        if (!Browser.isFirefox3) {
            blur = blur / 15
        }
        $(".canvasBuffer").css("opacity", this.bean.getBrushOpacity());
        a.shadowColor = this.getRGBA(this.hex, 1);
        a.strokeStyle = this.getRGBA(this.bean.getBackgroundColor(), 1);
        a.fillStyle = this.getRGBA(this.bean.getBackgroundColor(), 1);
        a.shadowBlur = blur;
        a.shadowOffsetX = this.SHADOW_DISTANCE;
        a.shadowOffsetY = 0
    },
    clearShadow: function (e) {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.shadowColor = this.getRGBA("ffffff", 0)
        }
        $(".canvasBuffer").css("opacity", 1)
    },
    lobotomized: function (a, b) {
        return
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/heat.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var FurryBrush = BrushBase.extend({
    options: {
        name: "Nightmare",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 2,
        defaultSettings: [3, 0.2, 0],
        effectLabel: "Intensity",
        shiftJitter: 0.1
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    getCursorSize: function () {
        return this.bean.getBrushSize() * 2
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over";
            this.count = 0
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit([this.brushCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.furriness = 20 + (200 * (1 - this.bean.getBrushHardness()))
    },
    setLineStyle: function (f) {
        this.setDefaultLineStyle(f);
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            var b = Math.pow(this.bean.getBrushOpacity(), 2);
            a.strokeStyle = this.getRGBA(this.bean.getColor(), b);
            a.lineWidth = this.size = Math.ceil(this.bean.getBrushSize() / 3)
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit();
        this.path = [];
        this.count = 0;
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.ctx, this.path);
        return false
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    },
    stroke: function (r, s) {
        r.beginPath();
        for (var h = 0; h < s.length; h++) {
            var f = this.furriness * Math.pow(s[h][2], 1.3);
            var e = 1 + s[h][2];
            var n = s[h];
            var j = s[this.count];
            if (!j || typeof (j) == "undefined") {
                this.count = 0;
                j = s[this.count]
            }
            var t = j[0] - n[0];
            var q = j[1] - n[1];
            var k = Math.pow(t * t + q * q, 0.5);
            var g = this.random();
            t *= g;
            q *= g;
            if (k < f && this.random() > k / f) {
                var p = [j[0] + t, j[1] + (q * this.size)];
                var o = [n[0] - t + (this.random() * e), n[1] - q + (this.random() * e)];
                r.moveTo(p[0], p[1]);
                r.lineTo(o[0], o[1]);
                this.minMax(p);
                this.minMax(o)
            }
        }
        r.stroke();
        this.count++;
        if (this.count >= s.length) {
            this.count = 0
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/furry.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var DragonBrush = BrushBase.extend({
    options: {
        name: "Dragon",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 6,
        defaultSettings: [20, 0.8, 0.5],
        effectLabel: "Spikes",
        handlesOwnMinMax: true,
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_furry.png"
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    getCursorSize: function () {
        return (1 - this.bean.getBrushHardness()) * 20
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.count = 0;
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit();
        this.strokePreview(function (e, b) {
            this.stroke(e, this.brushCtx, b)
        }.bindTo(this), a, false)
    },
    brushInit: function (a) {
        this.trogdor = 10 * Math.pow(this.bean.getBrushSize() / 2, 2);
        this.sizeScale = Math.ceil(this.bean.getBrushSize() / 10);
        this.radiusScale = (1 - this.bean.getBrushHardness()) * 0.1
    },
    setLineStyle: function (g) {
        var e;
        this.lineWidth = Math.floor((1 - this.bean.getBrushHardness()) * 15) + 1;
        this.setDefaultLineStyle(g);
        for (var f = 0; f < g.length; f++) {
            var a = g[f];
            e = this.bean.getBrushOpacity();
            e = e * e * e;
            a.strokeStyle = this.getRGBA(this.bean.getColor(), e);
            a.fillStyle = this.getRGBA(this.bean.getColor(), e);
            this.baseColor = this.bean.getColor();
            this.baseHSV = HexToHSV(this.baseColor);
            var b = Math.pow((this.baseHSV[2] - 1), 2);
            var h = HSVToHex(this.baseHSV[0], 0, b);
            a.shadowColor = this.getRGBA(h, 0.3 * e);
            a.shadowBlur = Math.floor(10 * (1 - this.bean.getBrushHardness()));
            a.shadowOffsetX = 2;
            a.shadowOffsetY = 2
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit();
        this.path = [];
        this.count = 0;
        this.moveDraw(a);
        this.minMax[0, 0]
    },
    moveDraw: function (a) {
        this.stroke(a, this.ctx, this.path);
        this.path.push(a);
        return false
    },
    stroke: function (b, a, e) {
        this.lobotomized(b, a, e)
    },
    lobotomized: function (b, a, e) {
        return
    },
    endDraw: function (a) {
        this.moveDraw(a);
        this.minMax[getManager().width, getManager().height];
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/dragon.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var YarnBrush = BrushBase.extend({
    options: {
        name: "Sketch",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 4,
        defaultSettings: [35, 0.2, 0.4],
        effectLabel: "Strokes",
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_furry.png"
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    getCursorSize: function () {
        return this.bean.getBrushSize() / 2
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit();
        var b = this.bean.getBrushOpacity();
        this.brushCtx.fillStyle = this.getRGBA("000000", Math.pow(b, 2) / 5);
        this.strokePreview(function (f, e) {
            this.stroke(this.brushCtx, e)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.awesomeness = 100000 * (1 - this.bean.getBrushHardness())
    },
    setLineStyle: function (f) {
        var b = this.bean.getBrushOpacity();
        this.setDefaultLineStyle(f);
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), Math.pow(b, 2));
            a.fillStyle = this.getRGBA("000000", Math.pow(b, 2) / 20);
            a.lineWidth = Math.floor(this.bean.getBrushSize() / 10)
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit();
        this.path = [];
        this.count = 0;
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.ctx, this.path);
        return false
    },
    stroke: function (k, n) {
        var b = n.length - 1;
        var h = n[b];
        var e = 0;
        var g = [];
        g[e++] = h;
        var f = 0;
        while (--b >= 0) {
            var a = [n[b][0], n[b][1]];
            var l = a[0] - h[0];
            var j = a[1] - h[1];
            f += l * l + j * j;
            if (f > (this.awesomeness * e) || ((n.length - b) > (this.awesomeness / 10)) || ((n.length < 500) && this.random() < 0.2)) {
                g[e++] = a
            }
        }
        if (e >= 4) {
            k.beginPath();
            k.moveTo(g[0][0], g[0][1]);
            k.bezierCurveTo(g[1][0], g[1][1], g[2][0], g[2][1], g[3][0], g[3][1]);
            k.stroke();
            k.fill()
        }
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/yarn.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var BottleBrush = BrushBase.extend({
    options: {
        name: "Bottle Brush",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 5,
        defaultSettings: [35, 1, 0.25],
        effectLabel: "Shadow",
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit();
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.awesomeness = 100 * (1 - this.bean.getBrushHardness())
    },
    setLineStyle: function (f) {
        this.brushSize = this.bean.getBrushSize();
        var b = this.bean.getBrushOpacity();
        this.setDefaultLineStyle(f);
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), Math.pow(b, 2));
            a.lineWidth = Math.floor(this.bean.getBrushSize() / 10) + 1;
            a.shadowColor = this.getRGBA("000000", 0.5 * b);
            if (Browser.isFirefox3) {
                a.shadowBlur = 35 * (1 - this.bean.getBrushHardness())
            } else {
                a.shadowBlur = 5 * (1 - this.bean.getBrushHardness())
            }
            a.shadowOffsetX = 0;
            a.shadowOffsetY = 0
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit();
        this.path = [];
        this.count = 0;
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.ctx, this.path);
        return false
    },
    stroke: function (a, b) {
        this.lobotomized(a, b)
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/bottle.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var SlinkyBrush = BrushBase.extend({
    options: {
        name: "Pebble",
        wacom: false,
        ie: false,
        ie9: true,
        glyphPos: 7,
        defaultSettings: [10, 1, 0.75],
        effectLabel: "Fill Opacity",
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    getCursorSize: function () {
        return 30
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.count = 0;
        this.radius = 0;
        this.coord0 = null;
        this.coord1 = null;
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit();
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, e)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.trogdor = 10 * Math.pow(this.bean.getBrushSize(), 2);
        this.sizeScale = Math.ceil(this.bean.getBrushSize() / 5);
        this.radiusScale = (1 - this.bean.getBrushHardness()) * 0.1
    },
    setLineStyle: function (f) {
        var b;
        this.setDefaultLineStyle(f);
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            b = this.bean.getBrushOpacity();
            a.strokeStyle = this.getRGBA(this.bean.getColor(), b);
            a.fillStyle = this.getRGBA(this.bean.getSecondaryColor(), b * (1 - this.bean.getBrushHardness()));
            a.lineWidth = Math.ceil(this.bean.getBrushSize() / 7)
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx]);
        this.brushInit();
        this.path = [];
        this.count = 0;
        this.radius = 0;
        this.coord0 = null;
        this.coord1 = null;
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.stroke(this.ctx, a);
        return false
    },
    stroke: function (a, b) {
        this.lobotomized(a, b)
    },
    lobotomized: function (a, b) {
        return
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/slinky.js")
}
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/love.js")
}
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/mudkip.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var PencilBrush = BrushBase.extend({
    options: {
        name: "Paintbrush",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 13,
        defaultSettings: [20, 1, 0.25],
        effectLabel: "Softness",
        minMaxWidth: 60,
        maskBuffers: ["bufferCtx"],
        straightShift: true,
        minMaxWidth: 60
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.SHADOW_DISTANCE = 10000
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.setLineStyle([this.brushCtx]);
        this.brushInit([this.brushCtx]);
        this.setupShadow(this.brushCtx);
        $(".brushPreviewCanvas").css("opacity", this.opacity);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a, false);
        this.clearShadow(this.brushCtx)
    },
    setLineStyle: function (e) {
        this.setDefaultLineStyle(e);
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 1);
            a.fillStyle = this.getRGBA(this.bean.getColor(), 1);
            a.lineWidth = this.bean.getBrushSize()
        }
    },
    brushInit: function (a) {
        this.hex = this.bean.getColor();
        this.opacity = this.bean.getBrushOpacity();
        this.radius = this.bean.getBrushSize();
        this.hardness = this.bean.getBrushHardness()
    },
    startDraw: function (a) {
        this.drew = false;
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit([this.ctx, this.bufferCtx]);
        this.setupShadow(this.bufferCtx);
        this.path = [];
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.path.push(a);
        if (this.path.length < 3) {
            return
        } else {
            if (this.path.length == 3) {
                this.path[0][2] = this.path[1][2] = this.path[2][2]
            }
        }
        this.drew = true;
        this.stroke(this.bufferCtx, this.path);
        return false
    },
    endDraw: function (a) {
        if (!this.drew) {
            this.stroke(this.bufferCtx, this.path)
        }
        this.ctx.globalAlpha = this.opacity;
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.ctx.globalAlpha = 1;
        this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
        this.clearShadow(this.bufferCtx);
        return false
    },
    setupShadow: function (a) {
        var b;
        if (mgr.calibrator) {
            b = Math.pow((1 - this.hardness), 2) * Math.log(this.radius) * 3;
            mgr.calibrator.specBlur(a, b)
        } else {
            if (!Browser.isFirefox3) {
                b = Math.ceil((1 - this.hardness) * (1 + this.radius / 10) * 2.5)
            } else {
                b = Math.ceil((1 - this.hardness) * this.radius * 5 * (this.radius / 50))
            }
            a.shadowBlur = b
        }
        $(".canvasBuffer").css("opacity", this.opacity);
        a.shadowColor = this.getRGBA(this.hex, 1);
        a.strokeStyle = this.getRGBA(this.bean.getBackgroundColor(), 1);
        a.fillStyle = this.getRGBA(this.bean.getBackgroundColor(), 1);
        a.shadowBlur = b;
        a.shadowOffsetX = this.SHADOW_DISTANCE;
        a.shadowOffsetY = 0
    },
    clearShadow: function (e) {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.shadowColor = this.getRGBA("ffffff", 0)
        }
        $(".canvasBuffer").css("opacity", 1)
    },
    stroke: function (v, u) {
        var f, e, b, a;
        var p, o, k, B, w;
        var j, i, h, g, n, l, s, q;
        var A, z;
        if (!u.length) {
            return
        } else {
            if (u.length < 2) {
                n = u[0][0] - this.SHADOW_DISTANCE;
                l = u[0][1];
                s = Math.max(0.1, Math.min(this.radius / 2, this.radius * Math.pow(u[0][2], 3)));
                v.beginPath();
                v.arc(n, l, s, 0, 2 * Math.PI, false);
                v.fill();
                return
            } else {
                if (u.length < 4) {
                    e = u[u.length - 2];
                    b = u[u.length - 1];
                    p = b[0] - e[0];
                    o = b[1] - e[1];
                    f = [e[0] - p, e[1] - o, e[2], e[3]];
                    a = [b[0] + p, b[1] + o, b[2], b[3]]
                } else {
                    f = u[u.length - 4];
                    e = u[u.length - 3];
                    b = u[u.length - 2];
                    a = u[u.length - 1]
                }
            }
        }
        A = this.controlPoints(f, e, b);
        z = this.controlPoints(e, b, a);
        if (!A[1][0] || !z[0][0]) {
            return
        }
        this.draw(v, e, b, A, z)
    },
    draw: function (u, e, b, B, A) {
        var v, p, h, h, g, f, l, k, q;
        var a = this.SHADOW_DISTANCE;
        var C = this.radius;
        var s = 2 * Math.PI;
        var z = 1 - this.hardness;
        var o = b[0] - e[0];
        var n = b[1] - e[1];
        var j = Math.pow(o * o + n * n, 0.5);
        var D = 1;
        var w = (b[2] - e[2]) / j;
        for (v = 0; v < j; v = v + D) {
            u.beginPath();
            p = v / j;
            coef1 = Math.pow(1 - p, 3);
            h = 3 * Math.pow(1 - p, 2) * p;
            g = 3 * (1 - p) * Math.pow(p, 2);
            f = Math.pow(p, 3);
            l = coef1 * e[0] + h * B[1][0] + g * A[0][0] + f * b[0] - a;
            k = coef1 * e[1] + h * B[1][1] + g * A[0][1] + f * b[1];
            q = Math.max(0.01, C * Math.pow(e[2] + (w * v), 3) * 0.5);
            D = j / (j - Math.min(j - 1, z * q * 0.3));
            u.arc(l, k, q, 0, s, false);
            u.fill()
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/pencil.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var WebinkBrush = BrushBase.extend({
    options: {
        name: "Webink",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 0,
        defaultSettings: [2, 0.5, 0.5],
        effectLabel: "Webbiness",
        maskBuffers: ["stgCtx", "bufferCtx"]
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.last_coord_idx = 0
    },
    getCursorSize: function () {
        return this.bean.getBrushSize() / 5
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over";
            this.count = 0
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.brushInit([this.brushCtx]);
        this.setLineStyle([this.brushCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.radius = Math.ceil(this.bean.getBrushSize() / 8);
        this.opacity = this.bean.getBrushOpacity();
        this.opacity *= this.opacity;
        this.webbiness = Math.ceil(10 * (1 - this.bean.getBrushHardness())) + 1;
        this.last_coord_idx = 0
    },
    setLineStyle: function (e) {
        this.setDefaultLineStyle(e);
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), this.opacity);
            a.lineWidth = 1
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.brushInit([this.ctx, this.bufferCtx]);
        this.path = [];
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.ctx, this.path);
        return false
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    },
    stroke: function (l, o) {
        try {
            l.lineWidth = Math.max(1, Math.ceil(this.radius * Math.pow(o[o.length - 1][2], 2)))
        } catch (g) {
            l.lineWidth = 1
        }
        l.beginPath();
        l.moveTo(o[0][0], o[0][1]);
        var h = this.last_coord_idx - this.web_how_many;
        h = Math.max(0, h);
        var a = this.webbiness;
        for (var b = this.last_coord_idx; b < o.length; b++) {
            var k = o[b];
            for (var f = a; f > 0; f--) {
                if (b - f >= 0) {
                    var n = o[b - f];
                    l.moveTo(n[0], n[1]);
                    l.lineTo(k[0], k[1])
                }
            }
        }
        this.last_coord_idx = o.length;
        l.stroke()
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/webink.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var SplatterBrush = OrganicBrush.extend({
    options: {
        name: "Splatter",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 3,
        defaultSettings: [35, 0.5, 0.65],
        minMaxWidth: 80,
        effectLabel: "Density"
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.lobotomized()
    },
    lobotomized: function () {
        return
    },
    getCursorSize: function () {
        return this.bean.getBrushSize() * 4
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/splatter.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var PolygonBrush = BrushBase.extend({
    options: {
        name: "Paper Worm",
        wacom: false,
        ie: false,
        ie9: true,
        glyphPos: 14,
        defaultSettings: [10, 1, 0.75],
        effectLabel: "Shadow",
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.brushInit();
        this.setLineStyle([this.brushCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, e)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.path = [];
        this.opacity = this.bean.getBrushOpacity();
        this.radius = this.bean.getBrushSize() * 2;
        this.lastRadius = 0;
        this.orthLine = null;
        this.lastPosition = null
    },
    setLineStyle: function (e) {
        this.setDefaultLineStyle(e);
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), 0);
            a.fillStyle = this.getRGBA(this.bean.getColor(), this.opacity);
            a.lineWidth = 0;
            a.shadowColor = this.getRGBA("000000", 0.5 * this.opacity);
            a.shadowBlur = 35 * (1 - this.bean.getBrushHardness());
            a.shadowOffsetX = 0;
            a.shadowOffsetY = 0
        }
    },
    startDraw: function (a) {
        this.brushInit();
        this.setLineStyle([this.ctx]);
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.stroke(this.ctx, a);
        return false
    },
    stroke: function (a, b) {
        this.lobotomized(a, b)
    },
    lobotomized: function (a, b) {
        return
    },
    endDraw: function (a) {
        this.moveDraw(a);
        this.clearLineStyle([this.ctx, this.bufferCtx, this.brushCtx]);
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/polygon.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var HatchBrush = BrushBase.extend({
    options: {
        name: "Hatch",
        wacom: false,
        ie: false,
        ie9: true,
        glyphPos: 11,
        defaultSettings: [10, 1, 0.75],
        effectLabel: "Width",
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_furry.png",
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e)
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.brushInit();
        this.setLineStyle([this.brushCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, e)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.path = [];
        this.opacity = this.bean.getBrushOpacity();
        this.radius = this.bean.getBrushSize();
        this.lastRadius = 0;
        this.orthLine = null;
        this.lastPosition = null
    },
    setLineStyle: function (e) {
        this.setDefaultLineStyle(e);
        for (var b = 0; b < e.length; b++) {
            var a = e[b];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), this.opacity);
            a.fillStyle = this.getRGBA(this.bean.getColor(), 0);
            a.lineWidth = Math.floor((1 - this.bean.getBrushHardness()) * 20) + 1
        }
    },
    startDraw: function (a) {
        this.brushInit();
        this.setLineStyle([this.ctx]);
        this.moveDraw(a)
    },
    moveDraw: function (a) {
        this.stroke(this.ctx, a);
        return false
    },
    stroke: function (a, b) {
        this.lobotomized(a, b)
    },
    lobotomized: function (a, b) {
        return
    },
    endDraw: function (a) {
        this.moveDraw(a);
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/hatch.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var SmokeBrush = BrushBase.extend({
    options: {
        name: "Smoke",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 12,
        defaultSettings: [40, 0.6, 0.5],
        effectLabel: "Speed",
        overlay: "http://st.deviantart.com/minish/canvasdraw/brush_overlay_furry.png",
        cursorSize: 40,
        maskBuffers: ["stgCtx", "bufferCtx"],
        shiftJitter: 5
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.isDrawing = false;
        this.factor = 400;
        this.awesomeness = 70
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "lighter"
        }
    },
    createParticle: function (b, h, g, f, a, e) {
        bh = HexToHSV(e[1]);
        return {
            x: b,
            y: h,
            vx: g,
            vy: f,
            damp: a,
            color: e[0],
            baseHSV: bh,
            o: e[2]
        }
    },
    update: function (j, q) {
        if (!this.isDrawing || !this.initialized) {
            return
        }
        isWacom = getManager().canvasDrawing.isWacom;
        q = q || this.ctx;
        var o = j[0];
        var l = j[1];
        var b = j[2];
        var e;
        var g = this.particles.length;
        var h = 0.93;
        var n = 1 / this.factor;
        while (g--) {
            var a = this.particles[g];
            if (isWacom) {
                heatVal = Math.max(0, a.baseHSV[2] + (b) - 0.5);
                if (heatVal >= 1) {
                    diff = heatVal - 1;
                    heatVal = 1;
                    heatSat = Math.max(0, a.baseHSV[1] - diff)
                } else {
                    heatSat = a.baseHSV[1]
                }
                strokeColor = this.getRGBA(HSVToHex(a.baseHSV[0], heatSat, heatVal), a.o)
            } else {
                strokeColor = a.color
            }
            q.beginPath();
            q.strokeStyle = strokeColor || this.baseColor;
            e = n * a.damp;
            q.moveTo(a.x, a.y);
            this.minMax([a.x, a.y]);
            a.vx *= h;
            a.vy *= h;
            a.vx += (o - a.x) * e;
            a.vy += (l - a.y) * e;
            a.x += a.vx;
            a.y += a.vy;
            q.lineTo(a.x, a.y);
            this.minMax([a.x, a.y]);
            a.vx *= h;
            a.vy *= h;
            a.vx += (o - a.x) * e;
            a.vy += (l - a.y) * e;
            a.x += a.vx;
            a.y += a.vy;
            q.lineTo(a.x, a.y);
            this.minMax([a.x, a.y]);
            q.stroke()
        }
    },
    brushPreview: function (a) {
        this.base(a);
        this.previousCoords = [0, 0];
        this.setLineStyle([this.brushCtx]);
        this.brushInit([this.brushCtx]);
        this.isDrawing = true;
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, e)
        }.bindTo(this), a);
        this.isDrawing = false
    },
    stroke: function (a, b) {
        this.update(b, a)
    },
    brushInit: function (f) {
        var e = this.awesomeness;
        var b = this.generateGradientArray(e);
        this.particles = new Array();
        var g = this.previousCoords || [0, 0];
        var a = e;
        while (a--) {
            this.particles.push(this.createParticle(g[0], g[1], 0, 0, 1 + (a / e * 2), b[a]))
        }
        this.initialized = true
    },
    generateGradientArray: function (u) {
        var n, v, j, k, t, w, e, o, s, h;
        var a = [];
        var q = this.bean.getColor();
        var f = this.bean.getSecondaryColor();
        var p = Math.pow(this.bean.getBrushOpacity(), 2);
        n = parseInt(q.substring(0, 2), 16);
        v = parseInt(q.substring(2, 4), 16);
        sB = parseInt(q.substring(4, 6), 16);
        k = parseInt(f.substring(0, 2), 16);
        t = parseInt(f.substring(2, 4), 16);
        w = parseInt(f.substring(4, 6), 16);
        for (var l = 0; l < u; l++) {
            e = Math.round(n + (l * (k - n) / u)).toString(16);
            o = Math.round(v + (l * (t - v) / u)).toString(16);
            s = Math.round(sB + (l * (w - sB) / u)).toString(16);
            if (e.length < 2) {
                e = "0" + e
            }
            if (o.length < 2) {
                o = "0" + o
            }
            if (s.length < 2) {
                s = "0" + s
            }
            h = e + o + s;
            a.push([this.getRGBA(h, p), h, p])
        }
        return a
    },
    setLineStyle: function (f) {
        this.brushSize = this.bean.getBrushSize();
        this.awesomeness = (70 * (this.brushSize / 40)) | 0 + 1;
        this.factor = 50 + this.bean.getBrushHardness() * 1000;
        var b = this.bean.getBrushOpacity();
        this.baseColor = this.getRGBA(this.bean.getColor(), Math.pow(b, 2));
        b = this.bean.getBrushOpacity();
        for (var e = 0; e < f.length; e++) {
            var a = f[e];
            a.strokeStyle = this.getRGBA(this.bean.getColor(), Math.pow(b, 2));
            a.lineWidth = 1
        }
    },
    startDraw: function (a) {
        this.initialized = false;
        this.setLineStyle([this.ctx, this.bufferCtx]);
        this.previousCoords = a;
        this.brushInit();
        this.path = [];
        this.isDrawing = true
    },
    moveDraw: function (a) {
        return false
    },
    endDraw: function (a) {
        this.isDrawing = false;
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/smoke.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var HalftoneBrush = MaskBrush.extend({
    options: {
        name: "Halftone",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 15,
        defaultSettings: [20, 1, 0.9],
        effectLabel: "Dot Size",
        shiftJitter: 0,
        maskBuffers: ["bufferCtx"]
    },
    buildMask: function (a) {
        this.lobotomized(a)
    },
    lobotomized: function (a) {
        return
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/halftone.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var StripesBrush = MaskBrush.extend({
    options: {
        name: "Stripes",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 16,
        defaultSettings: [20, 1, 0.9],
        effectLabel: "Stripe Size",
        maskBuffers: ["bufferCtx"],
        shiftJitter: 0
    },
    lobotomized: function (a) {
        return
    },
    buildMask: function (a) {
        this.lobotomized(a)
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/stripes.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var ConcreteBrush = TextureBrush.extend({
    options: {
        name: "Concrete",
        ie: false,
        ie9: true,
        glyphPos: 17,
        defaultSettings: [40, 1, 0],
        effectLabel: "Roughness",
        maskBuffers: ["bufferCtx"],
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.lobotomized()
    },
    lobotomized: function () {
        return
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/concrete.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
var RoughBrush = TextureBrush.extend({
    options: {
        name: "Rough",
        ie: false,
        ie9: true,
        glyphPos: 18,
        defaultSettings: [40, 1, 0],
        effectLabel: "Roughness",
        maskBuffers: ["bufferCtx"],
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.lobotomized()
    },
    lobotomized: function () {}
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/rough.js")
}
var DrPepper = BrushBase.extend({
    options: {
        name: "Dr Pepper",
        wacom: true,
        ie: false,
        ie9: true,
        glyphPos: 20,
        defaultSettings: [2, 0.5, 0.5],
        effectLabel: "Fizz",
        maskBuffers: ["stgCtx", "bufferCtx"],
        shiftJitter: 0
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.assetsLoaded = {};
        this.bubbleImages = [];
        this.fizzImages = [];
        AssetLoader.loadAssets([AssetLoader.defaults.base_path + "drpepper.js"], ["bubble1"], this.parseBubbleAssets.bindTo(this));
        AssetLoader.loadAssets([AssetLoader.defaults.base_path + "drpepper.js"], ["fizz1", "fizz2"], this.parseFizzAssets.bindTo(this))
    },
    parseBubbleAssets: function (a) {
        var h = this;
        var f = 0;
        this.bubbleImages = [];
        for (var e in a) {
            var g = a[e];
            var b = document.createElement("img");
            this.bubbleImages.push({
                width: g.width,
                height: g.height
            });
            b.rel = f++;
            b.onload = function () {
                h.bubbleImages[this.rel].img = this;
                for (var j = 0; j < h.bubbleImages.length; j++) {
                    if (!h.bubbleImages[j].img) {
                        h.assetsLoaded.bubbleImages = false;
                        return
                    }
                }
                h.assetsLoaded.bubbleImages = true
            };
            b.src = g.data
        }
    },
    parseFizzAssets: function (a) {
        var h = this;
        var f = 0;
        this.fizzImages = [];
        for (var e in a) {
            var g = a[e];
            var b = document.createElement("img");
            this.fizzImages.push({
                width: g.width,
                height: g.height
            });
            b.rel = f++;
            b.onload = function () {
                h.fizzImages[this.rel].img = this;
                h.fizzImages[this.rel].canv = new Canvas(document.createElement("canvas"));
                h.fizzImages[this.rel].canv.init(h.fizzImages[this.rel].width, h.fizzImages[this.rel].height, true);
                for (var j = 0; j < h.fizzImages.length; j++) {
                    if (!h.fizzImages[j].img) {
                        h.assetsLoaded.fizzImages = false;
                        return
                    }
                }
                h.assetsLoaded.fizzImages = true
            };
            b.src = g.data
        }
    },
    getCursorSize: function () {
        return this.bean.getBrushSize() * 3.5
    },
    init: function () {
        for (var b = 0; b < this.ctxArr.length; b++) {
            var a = this.ctxArr[b];
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
    },
    brushPreview: function (a) {
        if (!this.assetsLoaded.fizzImages || !this.assetsLoaded.bubbleImages) {
            this.logger.log("Postponing brushPreview until assets are loaded");
            setTimeout(function () {
                this.brushPreview(a)
            }.bindTo(this), 100);
            return
        }
        this.base(a);
        this.brushInit([this.brushCtx]);
        this.setLineStyle([this.brushCtx]);
        this.strokePreview(function (e, b) {
            this.stroke(this.brushCtx, b)
        }.bindTo(this), a)
    },
    brushInit: function (a) {
        this.radius = mgr.bean.getBrushSize();
        this.opacity = mgr.bean.getBrushOpacity();
        this.fizz = mgr.bean.getBrushHardness()
    },
    setLineStyle: function (f) {
        var b, a;
        for (var e = 0; e < f.length; e++) {
            a = f[e];
            b = this.bean.getBrushOpacity();
            a.lineWidth = this.bean.getBrushSize();
            a.fillStyle = this.getRGBA(mgr.bean.getColor(), b / 3);
            a.lineCap = "round";
            a.lineJoin = "round";
            a.globalCompositeOperation = "source-over"
        }
        for (e = 0; e < this.fizzImages.length; e++) {
            var g = this.fizzImages[e];
            a = g.canv.context;
            a.globalCompositeOperation = "source-over";
            a.fillStyle = this.getRGBA(mgr.bean.getColor(), 1);
            a.fillRect(0, 0, g.width, g.height);
            a.fill();
            a.globalCompositeOperation = "destination-in";
            a.drawImage(g.img, 0, 0)
        }
    },
    startDraw: function (a) {
        this.setLineStyle([this.bufferCtx, this.ctx]);
        this.path = []
    },
    moveDraw: function (a) {
        this.path.push(a);
        this.stroke(this.bufferCtx, this.path)
    },
    endDraw: function (a) {
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.bufferCtx.canvas, 0, 0);
        this.bufferCtx.clearRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY)
    },
    stroke: function (k, l) {
        var j = l[l.length - 1];
        var h = 5;
        for (var e = 1; e < h; e = e + this.random()) {
            var f = Math.max(1, Math.log(e));
            var b = j[0] + (Math.cos(this.random() * 2 * Math.PI) * this.radius / f) - (this.radius * j[3][0] * 2);
            var a = j[1] + (Math.cos(this.random() * 2 * Math.PI) * this.radius / f) + (this.radius * j[3][1] * 2);
            var g = Math.ceil(this.random() * Math.max(0.2, Math.pow(j[2], 0.8)) * this.radius / Math.max(1, (Math.log(h - e) * 2)));
            k.beginPath();
            k.moveTo(b + g, a);
            k.arc(b, a, g, 0, 2 * Math.PI, false);
            k.fill();
            this.minMax([b - g - 5, a - g - 5]);
            this.minMax([b + g + 5, a + g + 5])
        }
        this.lobotomized(j, k)
    },
    lobotomized: function (b, a) {}
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/drpepper.js")
}
var HandTool = BrushBase.extend({
    options: {
        name: "Hand Tool",
        wacom: false,
        ie: false,
        ie9: true,
        inToolbar: false,
        shouldUndo: false
    },
    constructor: function (b, a, f, e) {
        this.base(b, a, f, e);
        this.cursorImage = new Image();
        this.cursorImage.src = "http://st.deviantart.net/minish/canvasdraw/brushassets/hand_cursor.png"
    },
    setTool: function () {},
    getCursorSize: function () {
        return (36 / this.bean.getScale())
    },
    customCursor: function (a) {
        a.globalAlpha = 1;
        a.drawImage(this.cursorImage, 0, 0)
    },
    init: function () {},
    brushPreview: function (a) {
        $(".brushPicker .brushPickerCover").show()
    },
    startDraw: function (a) {
        this.startCoords = a;
        this.startNavPan = [mgr.zoomManager.navPanLeft, mgr.zoomManager.navPanTop];
        this.scale = mgr.bean.getScale();
        return false
    },
    moveDraw: function (b) {
        var a = mgr.zoomManager;
        a.setNavPan(this.startNavPan[0] + (a.navScale * (this.startCoords[0] - b[0])), this.startNavPan[1] + (a.navScale * (this.startCoords[1] - b[1])));
        return false
    },
    endDraw: function (a) {
        this.startCoords = null;
        return false
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/handTool.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}
window.SmudgeBrush = BrushBase.extend({
    options: {
        name: "Blending",
        wacom: true,
        ie: false,
        ie9: true,
        defaultSettings: [15, 1, 0.5],
        effectLabel: "Smear",
        maskBuffers: ["bufferCtx"],
        minMaxWidth: 80,
        handlesOwnSelection: true,
        inToolbar: false
    },
    setTool: function () {
        $(".toolbutton").removeClass("toolbuttonActive");
        $(".toolbutton[title=Blending]").addClass("toolbuttonActive")
    },
    brushInit: function (a) {},
    getCursorSize: function () {
        return this.bean.getBrushSize() * 3
    },
    brushPreview: function (a) {
        this.setLineStyle();
        this.imageData = null;
        this.brushCtx.lineWidth = 10;
        var b = mgr.$mainNode.find(".brushPreviewCanvas").width();
        var f = mgr.$mainNode.find(".brushPreviewCanvas").height();
        for (var e = -1 * f + 5; e < b; e = e + 20) {
            this.brushCtx.strokeStyle = this.getRGBA("000000", 1);
            this.brushCtx.beginPath();
            this.brushCtx.moveTo(e, 0);
            this.brushCtx.lineTo(e + f, f);
            this.brushCtx.stroke();
            this.brushCtx.strokeStyle = this.getRGBA("ffffff", 1);
            this.brushCtx.beginPath();
            this.brushCtx.moveTo(e + 5, 0);
            this.brushCtx.lineTo(e + f + 5, f);
            this.brushCtx.stroke()
        }
        for (e = 0; e < 100; e = e + 3) {
            coord = [];
            coord[0] = e;
            coord[1] = 26;
            coord[2] = Math.pow(e / 100, 0.25);
            coord[3] = [0, 0];
            this.stroke(this.brushCtx, coord)
        }
    },
    setLineStyle: function () {
        this.radius = Math.ceil(mgr.bean.getBrushSize() * 1.5);
        this.diameter = this.radius * 2;
        this.lift = (1 - mgr.bean.getBrushHardness() + 0.01) * 2
    },
    startDraw: function (a) {
        this.setLineStyle();
        this.base(a);
        this.imageData = null;
        this.lc = [a[0], a[1], a[2]];
        return false
    },
    moveDraw: function (h) {
        var l = h[0] - this.lc[0];
        var k = h[1] - this.lc[1];
        var b = h[2] - this.lc[2];
        var a = Math.pow(l * l + k * k, 0.5);
        var j = 2;
        if (a > j) {
            for (var e = j; e < a; e = e + j) {
                var f = e / a;
                var g = [Math.round(this.lc[0] + f * l), Math.round(this.lc[1] + f * k), Math.max(0, Math.min(1, this.lc[2] + f * b))];
                this.stroke(this.ctx, g)
            }
            this.lc = [h[0], h[1], h[2]]
        } else {
            this.stroke(this.ctx, [Math.round(h[0]), Math.round(h[1]), h[2]])
        }
    },
    endDraw: function (a) {
        if (this.hasSel) {
            this.ctx.drawImage(this.stgDom, 0, 0);
            this.stgCtx.clear()
        }
        this.stgCtx = this.stgDom = this.hasSel = this.selDom = null;
        return false
    },
    stroke: function (w, v) {
        var o, n, a, t, f, q, p, k, h, g, e, b, l, u, s;
        a = this.radius;
        t = this.diameter;
        u = mgr.selectionManager.hasSelection && (w == this.ctx);
        s = !u ? null : mgr.selectionManager.selCanvas.context.getImageData(v[0] - a, v[1] - a, t, t);
        l = w.getImageData(v[0] - a, v[1] - a, t, t);
        b = this.lift * Math.pow(v[2], 3);
        if (!this.imageData) {
            this.imageData = l;
            return
        }
        f = this.imageData.data;
        for (o = 0; o < t; o++) {
            q = Math.pow(o - a, 2);
            e = o * t;
            for (n = 0; n < t; n++) {
                p = 4 * (e + n);
                k = Math.max(a - Math.pow(q + Math.pow(n - a, 2), 0.5), 0.1) / a;
                h = b * k;
                if (u) {
                    h *= 1 - s.data[p + 3] / 255
                }
                g = h + 1;
                f[p] = (f[p] * h + l.data[p]) / g;
                f[p + 1] = (f[p + 1] * h + l.data[p + 1]) / g;
                f[p + 2] = (f[p + 2] * h + l.data[p + 2]) / g;
                f[p + 3] = (f[p + 3] * h + l.data[p + 3]) / g
            }
        }
        w.putImageData(this.imageData, Math.round(v[0] - a), Math.round(v[1] - a))
    },
    recordStart: function (a) {
        a.startInstruction(RDInst.BRUSH, [this.options.name, mgr.bean.getBrushOpacity(), mgr.bean.getBrushSize(), mgr.bean.getBrushHardness(), ])
    },
    recordPlayMeta: function (a) {
        mgr.bean.setBrushOpacity(a[1]);
        mgr.bean.setBrushSize(a[2]);
        mgr.bean.setBrushHardness(a[3])
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/brushes/smudge.js")
}
DWait.count();