/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
var IMAGETYPE_PNG = 3;
var RAD2DEG = 180 / Math.PI;
window.Canvas = Base.extend({
    constructor: function (a) {
        this.logger = new StdLogger("Canvas");
        this.canvas = $(a);
        this.context = null;
        this.didInit = false;
        this.isExCanvas = false;
        this.path = []
    },
    init: function (c, a, b) {
        this.width = c + 20;
        this.height = a;
        if (this.didInit && !b) {
            return
        }
        this.canvas.css("width", c + "px");
        this.canvas.css("height", a + "px");
        this.canvas.attr("width", c);
        this.canvas.attr("height", a);
        this.isExCanvas = !this.canvas.get(0).getContext;
        if (this.isExCanvas) {
            try {
                G_vmlCanvasManager.initElement(this.canvas.get(0))
            } catch (d) {}
        }
        this.canvasWidth = c;
        this.canvasHeight = a;
        this.context = this.canvas.get(0).getContext("2d");
        this.context.obj = this;
        this.context.key = Math.random();
        this.context.clearRect(0, 0, c, a);
        this.context.isExCanvas = this.isExCanvas;
        this.didInit = true;
        this.context.clear = function () {
            if (this.context.isExCanvas) {
                $(this.canvas).find("[path]").remove()
            } else {
                this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
            }
        }.bindTo(this);
        this.context.clearToColor = function (f) {
            $("#debugDiv").append("Clear To Color <br/>");
            if (this.context.isExCanvas) {
                this.context.clear()
            }
            var e = this.context.globalAlpha;
            this.context.globalAlpha = 1;
            this.context.fillStyle = f;
            this.context.fillRect(0, 0, this.canvasWidth + 30, this.canvasHeight + 30);
            this.context.globalAlpha = e
        }.bindTo(this);
        this.context.getPixelData = function () {
            if (this.context.getImageData) {
                return this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight)
            }
            return false
        }.bindTo(this);
        this.context.setPixelData = function (f) {
            var e = this.context.globalCompositeOperation;
            this.context.globalCompositeOperation = "copy";
            this.context.putImageData(f, 0, 0);
            this.context.globalCompositeOperation = e
        }.bindTo(this);
        this.context.toDataURL = function (e) {
            if (this.canvas.get(0).toDataURL) {
                return this.canvas.get(0).toDataURL(e)
            }
            return false
        }.bindTo(this);
        if (!this.context.getPixel) {
            if (this.context.isExCanvas) {
                this.context.getPixel = function (f, e, g) {
                    return false
                }
            } else {
                this.context.getPixel = function (g, e, j) {
                    var h = g.data;
                    var f = (j * g.width + e) << 2;
                    return [h[f + 0], h[f + 1], h[f + 2], h[f + 3]]
                }
            }
        }
        if (!this.context.setPixel) {
            if (this.context.isExCanvas) {
                this.context.setPixel = function (g, e, h, f) {
                    return false
                }
            }
            this.context.setPixel = function (h, e, k, g) {
                var f = (k * h.width + e) << 2;
                var j = h.data;
                j[f + 0] = g[0];
                j[f + 1] = g[1];
                j[f + 2] = g[2];
                j[f + 3] = g[3]
            }
        }
        this.context.colorDistance = function (h, g) {
            if (h[0] == g[0] && h[1] == g[1] && h[2] == g[2] && h[3] == g[3]) {
                return 0
            }
            alphaThreshold = 25;
            if ((h[3] < alphaThreshold) || (g[3] < alphaThreshold)) {
                dist = Math.pow(Math.abs(h[3] - g[3]), 0.5);
                return dist
            }
            var j = Math.pow(h[0] - g[0], 2);
            var i = Math.pow(h[1] - g[1], 2);
            var e = Math.pow(h[2] - g[2], 2);
            var f = Math.pow(h[3] - g[3], 2);
            return Math.pow((j + i + e + f), 0.25)
        };
        this.context.avgColors = function (i, h, l) {
            var k = (l * i[0] + h[0]) / (l + 1);
            var j = (l * i[1] + h[1]) / (l + 1);
            var e = (l * i[2] + h[2]) / (l + 1);
            var f = (l * i[3] + h[3]) / (l + 1);
            return [k, j, e, f]
        };
        this.context.rescale = function (f, e) {
            $(this.canvas).width(f).height(e)
        }.bindTo(this)
    }
});
if (window.DWait) {
    DWait.run("jms/lib/canvas.js")
}
DWait.count();