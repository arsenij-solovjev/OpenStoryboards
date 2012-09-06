// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
window.SlopeConstraint=Base.extend({constructor:function(b,a){this.reset();this.setOrigin(b);this.setDestination(a)},reset:function(){this.origin=this.destination=this.unit=this.distance=undefined;this.no_recalc_flags={};this.is_locked=false},unlock:function(){this.is_locked=false},lock:function(){this.is_locked=true},tryToLockOntoSlope:function(){if(this.getDistance()>=(this.lock_orthogonally?this.options.MIN_ORTHOGONAL_DISTANCE:this.options.MIN_DISTANCE)){this.lock()}},isLocked:function(){return this.is_locked},isValidPoint:function(a){return a&&a.length&&!isNaN(a[0])&&!isNaN(a[1])},isValid:function(){return !isNaN(this.getDistance())},constrain:function(d){if(this.getDistance()>=(this.lock_orthogonally?this.options.MIN_ORTHOGONAL_DISTANCE:this.options.MIN_DISTANCE)){try{var c=this.getUnit();var b=d[0]-this.origin[0];var a=d[1]-this.origin[1];var g=b*c[0]+a*c[1];d[0]=Math.round(g*c[0]+this.origin[0]);d[1]=Math.round(g*c[1]+this.origin[1]);return d}catch(f){return d}}},setOrigin:function(a){if(this.is_locked){return}this.origin=a;this.no_recalc_flags={}},setDestination:function(a){if(this.is_locked){return}this.destination=a;this.no_recalc_flags={}},translateTo:function(f){try{var c=this.destination[0]-this.origin[0];var b=this.destination[1]-this.origin[1];var d=[f[0],f[1]];var a=[f[0]+c,f[1]+b];this.origin=d;this.destination=a}catch(g){console.log(g.message)}},getDistance:function(){if(!("distance" in this.no_recalc_flags)){this.distance=this.calcDistance(this.origin,this.destination);this.no_recalc_flags.distance=true}return this.distance},getUnit:function(){if(!("unit" in this.no_recalc_flags)){try{var l=this.origin[0]-this.destination[0];var k=this.origin[1]-this.destination[1];var j=Math.sqrt(l*l+k*k);var g=j?(l/j): 0;
var f = j ? (k / j) : 0;
this.unit = [g, f];
this.no_recalc_flags.unit = true
} catch (h) {
    this.unit = null
}
}
if (this.lock_orthogonally) {
    var c = Math.abs(this.unit[0]);
    var a = Math.abs(this.unit[1]);
    if ((c * a) > 0.353) {
        var b = 0.707106781;
        return [this.unit[0] > 0 ? b : -b, this.unit[1] > 0 ? b : -b]
    } else {
        if (c > a) {
            return [1, 0]
        } else {
            return [0, 1]
        }
    }
}
return this.unit
}, setOrthogonalLock: function (a) {
    a = !! a;
    if (this.lock_orthogonally != a) {
        this.lock_orthogonally = a;
        this.no_recalc_flags = {}
    }
},
calcDistance: function (f, c) {
    try {
        var g = c[0] - f[0];
        var d = c[1] - f[1];
        return Math.sqrt(g * g + d * d)
    } catch (h) {
        return undefined
    }
},
options: {
    MIN_DISTANCE: 10,
    MIN_ORTHOGONAL_DISTANCE: 4
}
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/slopeconstraint.js")
}
DWait.ready(["jms/lib/browser.js", "jms/lib/StdLogger.js", "jms/lib/Base.js", "jms/lib/dragger.js", "jms/pages/drawplz/colorlib.js", "jms/lib/canvas.js", "jms/lib/dtask.js", "jms/pages/drawplz/drawBean.js", "cssms/lib/canvas_drawing.css", "cssms/pages/drawplz/header_controls.css", "cssms/pages/drawplz/basic_controls.css", "cssms/pages/drawplz/colorpicker.css", "cssms/pages/drawplz/brushpreview.css", "cssms/pages/drawplz/modals.css", "jms/pages/drawplz/slopeconstraint.js"], function () {
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
// | Author: Michael Dewey <mudimba@deviantart.com> |
// +----------------------------------------------------------------------+
*/
    window.cumulativeOffset = function (c) {
        var b = 0;
        var a = 0;
        if (c.parentNode) {
            do {
                b += c.offsetTop || 0;
                a += c.offsetLeft || 0;
                c = c.offsetParent
            } while (c)
        }
        return [a, b]
    };
    window.CanvasDrawing = Base.extend({
        constructor: function () {
            this.logger = new StdLogger("Canvas Drawing");
            this.bean = getManager().bean;
            this.mainNode = this.bean.getMainNode();
            this.$drawPlzCanvas = $(this.mainNode).find(".drawPlzCanvas");
            this.isIPad = false;
            this.brush = this.bean.getBrush();
            this.bean.setLastUsedBrush(this.brush);
            this.bindEvents();
            this.bindBean();
            this.interval_id = null;
            this.interval_update = 20;
            this.mouse_coords = [0, 0];
            this.coords = [0, 0];
            this.velocity = [0, 0];
            this.maxSpeed = 20;
            this.inertia = 8;
            this.doesTiltWork = true;
            this.slope = new SlopeConstraint();
            this.isWacom = null;
            this.forcedEraser = false;
            this.lastCoords = null;
            this.lastEvent = null;
            this.inInnerShift = false;
            $(".flyouts").remove().appendTo("body")
        },
        bindEvents: function () {
            var a = getManager().zoomManager;
            this.canvasDragger = new Dragger([$(".mouseCapture").get(0)], this.bean.getBufferCtx().obj.canvas.get(0), this.startDraw.bindTo(this), this.moveDraw.bindTo(this), this.endDraw.bindTo(this), a.transformCoords.bindTo(a));
            if (wacomEnabled) {
                $(this.mainNode).mousemove(this.detectEraser.bindTo(this))
            }
        },
        detectEraser: function (a) {
            if (mgr.bean.getIsPenDown()) {
                return
            }
            try {
                if (wacomPlugin.isEraser) {
                    if (this.brush.options.name != "Eraser") {
                        this.forcedEraser = this.brush.options.name;
                        getManager().toolManager.toolAction("erase")
                    }
                } else {
                    if (this.forcedEraser) {
                        switch (this.forcedEraser) {
                        case "Eye Dropper":
                            getManager().toolManager.toolAction("dropper");
                            break;
                        case "Flood Fill":
                            getManager().toolManager.toolAction("flood");
                            break;
                        default:
                            getManager().toolManager.toolAction("draw");
                            break
                        }
                        this.forcedEraser = null
                    }
                }
            } catch (a) {}
        },
        bindBean: function () {
            this.bean.subscribe("brush", function () {
                this.brush = this.bean.getBrush();
                this.enableControls()
            }.bindTo(this))
        },
        setBackgroundColor: function (a) {
            this.bean.setBackgroundColor(a)
        },
        handleLineConstraint: function (a, b) {
            if (!this.brush.options.defaultModifiers) {
                return false
            }
            if (b.shiftKey || b.altKey) {
                if (a) {
                    if (this.slope.isValidPoint(this.slope.origin)) {
                        if (!this.slope.isLocked()) {
                            this.slope.setDestination(a);
                            this.slope.setOrthogonalLock(b.shiftKey);
                            this.slope.tryToLockOntoSlope()
                        }
                        this.slope.constrain(a);
                        if (!this.slope.isLocked() && b.shiftKey) {
                            return true
                        }
                    } else {
                        this.slope.unlock();
                        this.slope.setOrigin(a);
                        this.slope.setOrthogonalLock(b.shiftKey)
                    }
                }
            } else {
                this.slope.unlock();
                this.slope.setOrigin(a);
                this.slope.setOrthogonalLock(b.shiftKey)
            }
            return false
        },
        iPadBug: function (b, c) {
            try {
                if (this.isIPad || c.touches.length > 0) {
                    this.isIPad = true;
                    var d = mgr.bean.getScale();
                    return [b[0] + (this.$drawPlzCanvas.scrollLeft() / d), b[1] + (this.$drawPlzCanvas.scrollTop() / d)]
                }
            } catch (a) {}
            return b
        },
        recordCoords: function (c, f, g) {
            var b = mgr.bean.getBrush();
            if (!g && !(g = mgr.bean.getRDWriter())) {
                return
            }
            var a = [c[0], c[1]];
            if ((c[2] != 1) || (c[3] && c[3][0] && c[3][1])) {
                if (c[2] != 1) {
                    var d = parseFloat(c[2].toFixed(4));
                    if (d === 0) {
                        d = 0.0001
                    }
                    a.push(d)
                } else {
                    a.push(1)
                }
                if (c[3] && c[3][0] && c[3][1]) {
                    a.push([c[3][0] ? parseFloat(c[3][0].toFixed(4)) : 0, c[3][1] ? parseFloat(c[3][1].toFixed(4)) : 0])
                }
            }
            if (f.shiftKey || f.altKey || f.ctrlKey || f.metaKey || b.update) {
                a = {
                    c: a
                };
                if (f.shiftKey || f.altKey || f.ctrlKey || f.metaKey) {
                    a.e = [f.altKey, f.shiftKey, f.ctrlKey, f.metaKey]
                }
            }
            g.addInstructionData(a)
        },
        shiftLine: function (d, f) {
            this.inInnerShift = true;
            try {
                this.startDraw(this.lastCoords, this.lastEvent);
                if (!this.brush.options.straightShift) {
                    var g = Math.pow(Math.pow(this.lastCoords[0] - d[0], 2) + Math.pow(this.lastCoords[1] - d[1], 2), 0.5);
                    var c = Math.floor(Math.max(Math.abs(this.lastCoords[0] - d[0]), Math.abs(this.lastCoords[1] - d[1])) / 4);
                    for (var b = 0; b < c; b++) {
                        var a = Math.round(this.lastCoords[0] + b * (d[0] - this.lastCoords[0]) / c);
                        var h = Math.round(this.lastCoords[1] + b * (d[1] - this.lastCoords[1]) / c);
                        if (this.brush.options.shiftJitter) {
                            a += (this.brush.random() - 0.5) * mgr.bean.getBrushSize() * this.brush.options.shiftJitter;
                            h += (this.brush.random() - 0.5) * mgr.bean.getBrushSize() * this.brush.options.shiftJitter
                        }
                        if (this.brush.update) {
                            mgr.canvasDrawing.onIntervalUpdate()
                        }
                        this.moveDraw([a, h, d[2], d[3]], {
                            altKey: false,
                            shiftKey: false,
                            ctrlKey: false,
                            metaKey: false,
                            clientX: a,
                            clientY: h,
                            screenX: a * 2,
                            screenY: h * 2,
                            which: 1
                        })
                    }
                }
                this.moveDraw(d, f);
                this.endDraw(d, f)
            } finally {
                this.inInnerShift = false
            }
        },
        startDraw: function (c, f) {
            mgr.bean.setIsPenDown(true);
            var d = this.iPadBug(c, f);
            f = f || window.event;
            if (!this.brush) {
                return false
            }
            this.addPressureData(d);
            if (!this.inInnerShift) {
                var g = mgr.bean.getRDWriter();
                if (!g.isStub) {
                    this.brush.recordStart(g);
                    this.recordCoords(d, f, g)
                }
            }
            if (mgr.toolManager.isDrawBrush(this.brush) && !this.inInnerShift && f.shiftKey) {
                this.shiftLine(d, f);
                return false
            }
            this.lastCoords = d;
            this.lastEvent = f;
            this.brush.lastCoords = null;
            this.brush.previousCoords = null;
            mgr.zoomManager.clearRefresh();
            if (this.bean.getIsHTML5() && window.SelectionManager && mgr.selectionManager.hasSelection) {
                this.bean.getStagingCtx().clear()
            }
            if (!this.bean.getSelectedLayer().isVisible()) {
                switch (this.brush.options.name) {
                case "Eye Dropper":
                    break;
                default:
                    this.canvasDragger.clearEvents();
                    if (!mgr.bean.getRDReader()) {
                        mgr.bean.getRDWriter().pushInstructio...) {
                        if (wacomPlugin.isWacom > 0 && (wacomPlugin.pointerType == 1 || wacomPlugin.pointerType == 3)) {
                            this.isWacom = true
                        } else {
                            this.isWacom = false
                        }
                    }
                    this.brush.shiftKey = (!this.inInnerShift && d.shiftKey) || false;
                    this.brush.altKey = d.altKey || false;
                    if (this.brush.options.defaultModifiers && this.handleLineConstraint(c, d)) {
                        return false
                    }
                    this.mouse_coords = this.brush.lastCoords = c;
                    if (this.brush.options.shouldHandleSharpStrokes) {
                        this.handleSharpStrokes(this.mouse_coords)
                    }
                    this.brush.moveDraw(this.mouse_coords, d, g);
                    if (window.SelectionManager) {
                        if (mgr.selectionManager.hasSelection && !this.brush.options.handlesOwnSelection && !this.brush.update) {
                            getManager().selectionManager.maskStagingBuffer(this.brush.options.maskBuffers)
                        }
                    }
                }, endDraw: function (c, f) {
                    f = f || window.event;
                    if (!this.brush) {
                        return
                    }
                    if (!this.inInnerShift) {
                        var h = mgr.bean.getRDWriter()
                    }
                    this.brush.shiftKey = f.shiftKey || false;
                    clearInterval(this.interval_id);
                    this.brush.endDraw(this.mouse_coords);
                    if (window.SelectionManager) {
                        getManager().selectionManager.stopMasking()
                    }
                    if (this.bean.getIsHTML5()) {
                        if (window.SelectionManager && getManager().selectionManager.hasSelection) {
                            this.bean.getSelectedLayer().getContext().drawImage(getManager().stagingCanvas.canvas.get(0), 0, 0);
                            this.bean.getStagingCtx().clear()
                        }
                    }
                    this.brush.clearLineStyle([this.bean.getSelectedLayer().getContext(), this.bean.getBufferCtx(), this.bean.getBrushCtx(), this.bean.getStagingCtx()]);
                    this.bean.getSelectedLayer().setChangeStamp();
                    if (this.brush.options.shouldUndo) {
                        var d = true;
                        if (d) {
                            var j = Math.max(0, this.brush.minX);
                            var g = Math.max(0, this.brush.minY);
                            var a = Math.min(mgr.width - j, this.brush.maxX - j);
                            var b = Math.min(mgr.height - g, this.brush.maxY - g);
                            mgr.undoManager.push([j, g, a, b])
                        }
                    }
                    this.isWacom = null;
                    mgr.bean.setIsPenDown(false);
                    if (!this.brush.options.asyncPush && !this.inInnerShift) {
                        h.pushInstruction()
                    }
                },
                addPressureData: function (a) {
                    a[0] = Math.round(a[0]);
                    a[1] = Math.round(a[1]);
                    if (!mgr.bean.getRDReader() && wacomPlugin.isWacom > 0 && (wacomPlugin.pointerType == 1 || wacomPlugin.pointerType == 3)) {
                        a[2] = wacomPlugin.pressure;
                        a[3] = [wacomPlugin.tiltX, wacomPlugin.tiltY]
                    } else {
                        if (!a[2] && a[2] !== 0) {
                            a[2] = 1
                        }
                        if (!a[3]) {
                            a[3] = [0, 0]
                        }
                    }
                },
                onIntervalUpdate: function () {
                    if (this.brush.update) {
                        this.brush.update(this.mouse_coords);
                        this.brush.recordVelocity();
                        mgr.bean.getRDWriter().addInstructionData("U")
                    }
                    if (window.SelectionManager) {
                        getManager().selectionManager.maskStagingBuffer(this.brush.options.maskBuffers)
                    }
                },
                getAngleDiff: function (c, b) {
                    var a = (c + 180 - b) % 360 - 180;
                    return a < 0 ? -a : a
                },
                getAngle: function (e, c) {
                    var f = e[0] - c[0];
                    var d = e[1] - c[1];
                    return Math.atan2(d, f) * RAD2DEG
                },
                handleSharpStrokes: function (j) {
                    var h = this.brush.path;
                    if (!h) {
                        return
                    }
                    var e = h.length;
                    if (e < 2) {
                        return
                    }
                    var f = h[e - 2];
                    var d = h[e - 1];
                    var g = this.getAngleDiff(this.getAngle(f, d), this.getAngle(j, d));
                    if (g < 90) {
                        this.brush.endDraw(f);
                        this.brush.startDraw(d)
                    }
                },
                clearToColor: function (a) {
                    $(".drawPlzCanvas").css("background-color", "#" + a)
                },
                undo: function () {
                    getManager().undoManager.undo()
                },
                redo: function () {
                    getManager().undoManager.redo()
                },
                exportImage: function () {
                    getManager().submissionManager.exportImageData(this.getSaveData())
                },
                submitDrawing: function () {
                    var c = this.getSaveData();
                    if (vms_feature("ie_testing")) {
                        var a = ["<html><head><title>Testing</title></head><body>", "<textarea>", c, "</textarea>", "</body></html>"];
                        var b = window.open("", "_blank");
                        b.document.write(a.join(""));
                        b.document.close();
                        b.focus()
                    }
                    getManager().submissionManager.submitImageData(c)
                },
                hasUnsavedWork: function () {
                    return getManager().undoManager.hasUnsavedWork()
                },
                getSaveData: function (a) {
                    return getManager().layerManager.flatten()
                },
                enableControls: function (c, a) {
                    if (typeof c == "undefined") {
                        c = ["all"]
                    }
                    if (typeof a == "undefined") {
                        a = true
                    }
                    var b = c.length;
                    while (b--) {
                        this.enableControl(c[b], a)
                    }
                },
                enableControl: function (b, a) {
                    var c;
                    switch (b) {
                    case "opacitySlider":
                    case "sizeSlider":
                    case "effectSlider":
                    case "brushSelector":
                    case "colorPicker":
                        c = "." + b + " .disableElement";
                        break;
                    case "all":
                        c = ".disableElement";
                        break;
                    default:
                    }
                    if (a) {
                        $(c).hide()
                    } else {
                        $(c).show()
                    }
                }
            });
        window.loadModal = function (g) {
            var h = new DrawBean();
            var f = $(g).find(".testCanvas");
            var d = new Canvas(f.get(0));
            var b = new Canvas($(g).find(".bufferCanvas").get(0));
            var k = new Canvas($(g).find(".brushPreviewCanvas").get(0));
            var a = new BrushPicker($(g).find(".brushPicker").get(0), h);
            var j = new BrushSelector($(g).find(".brushSelector").get(0), h);
            var e = new ColorPicker($(g).find(".colorPicker").get(0), h);
            var c = new CanvasDrawing(d, h, k, b, a, j);
            h.setColor("005d7a");
            $(g).find("#colorInput").change(function () {
                h.setColor($(this).val())
            });
            $(g).find("#brushSize").change(function () {
                h.setBrushSize($(this).val())
            });
            $(g).find("input[name=useDynamics]").change(function () {
                h.setUseDynamics($(this).is(":checked"))
            });
            $(g).find("#saveButton").click(c.save.bindTo(c));
            $(g).find("#undoButton").click(c.undo.bindTo(c));
            $(g).find("#redoButton").click(c.redo.bindTo(c));
            $(g).find("#colorInput").val("000000");
            $(g).find("#brushSize").val(5)
        };
        if (window.DWait) {
            DWait.run("jms/lib/canvas_drawing.js")
        }
    });
    DWait.ready(["jms/lib/Base.js", "jms/lib/StdLogger.js", "jms/lib/canvas.js", "jms/lib/Bean.js", "jms/lib/dragger.js"], function () {
        /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
        window.ColorPicker = Base.extend({
            constructor: function (a) {
                this.logger = new StdLogger("Color Picker");
                this.mainNode = a;
                this.bean = getManager().bean;
                this.ignoreMainColor = false;
                this.canvas = new Canvas($(this.mainNode).find(".color_preview").get(0));
                this.canvasWidth = this.canvas.canvas.width();
                this.canvasHeight = this.canvas.canvas.height();
                this.canvas.init(this.canvasWidth, this.canvasHeight, false);
                this.ctx = this.canvas.context;
                this.hueCanvas = new Canvas($(this.mainNode).find(".hueCanvas").get(0));
                this.hueCanvasWidth = this.hueCanvas.canvas.width();
                this.hueCanvasHeight = this.hueCanvas.canvas.height();
                this.hueCanvas.init(this.hueCanvasWidth, this.hueCanvasHeight, false);
                this.hueCtx = this.hueCanvas.context;
                this.hueCtx.strokeStyle = "#ffffff";
                this.hueCtx.lineWidth = 2;
                this.hueCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
                this.hueCtx.shadowBlur = 1;
                this.hueCtx.shadowOffsetX = 0;
                this.hueCtx.shadowOffsetY = 1;
                this.bindBean();
                this.bindHtml();
                this.bean.setColor("005E7A")
            },
            bindBean: function () {
                this.bean.subscribe("color", this.mainColorChange.bindTo(this));
                this.bean.subscribe("hue", this.updateColor.bindTo(this));
                this.bean.subscribe("saturation", this.updateColor.bindTo(this));
                this.bean.subscribe("value", this.updateColor.bindTo(this))
            },
            bindHtml: function () {
                $(this.mainNode).find(".color_switcher").click(function () {
                    var c = this.bean.getColor();
                    this.bean.startAtomic();
                    this.bean.setColor(this.bean.getSecondaryColor());
                    this.bean.setSecondaryColor(c);
                    this.bean.endAtomic()
                }.bindTo(this));
                var b = $(this.mainNode).find(".satval_area").get(0);
                new Dragger([b], b, this.startSatvalDrag.bindTo(this), this.moveSatvalDrag.bindTo(this), this.endSatvalDrag.bindTo(this));
                var a = $(this.mainNode).find(".hueClick").get(0);
                new Dragger([a], a, this.startHueDrag.bindTo(this), this.moveHueDrag.bindTo(this), this.endHueDrag.bindTo(this))
            },
            startSatvalDrag: function (b, c) {
                this.ignoreMainColor = true;
                this.origHue = this.bean.getHue();
                var a = navigator.platform;
                if (a == "iPad" || a == "iPod" || a == "iPhone") {
                    $(".flyouts .colorFlyoutMask").show();
                    $(".flyouts .flyoutBG").show();
                    $(".flyouts .numberFlyoutMask").hide();
                    $(".flyouts").show()
                }
            },
            moveSatvalDrag: function (f, g) {
                this.bean.startAtomic();
                var d = Math.max(0.01, Math.min(1, 1 - (Math.min(52, f[1]) / 52)));
                this.bean.setValue(d);
                var a = Math.max(0, Math.min(1, Math.min(54, f[0]) / 54));
                this.bean.setSaturation(a);
                var c = this.HSVToHex(this.origHue, a, d);
                this.bean.setColor(c);
                this.bean.endAtomic();
                this.bean.setHue(this.origHue);
                $(".flyoutBG").css("background-color", "#" + this.bean.getColor());
                try {
                    $(".flyouts").css("left", g.touches[0].pageX - 34);
                    $(".flyouts").css("top", g.touches[0].pageY - 100)
                } catch (b) {
                    $(".flyouts").hide()
                }
            },
            endSatvalDrag: function (a, b) {
                this.ignoreMainColor = false;
                $(".flyouts").hide()
            },
            startHueDrag: function (b, c) {
                this.ignoreMainColor = true;
                var a = navigator.platform;
                if (a == "iPad" || a == "iPod" || a == "iPhone") {
                    $(".flyouts .colorFlyoutMask").show();
                    $(".flyouts .flyoutBG").show();
                    $(".flyouts .numberFlyoutMask").hide();
                    $(".flyouts").show()
                }
            },
            moveHueDrag: function (d, f) {
                d[0] -= 26;
                d[1] = 26 - d[1];
                var g = 180 * Math.atan(d[1] / d[0]) / Math.PI;
                if (d[0] < 0 && d[1] > 0) {
                    g += 180
                } else {
                    if (d[0] < 0 && d[1] <= 0) {
                        g -= 180
                    }
                }
                g += 45;
                if (g < 0) {
                    g += 360
                }
                var a = Math.max(0, Math.min(1, g / 360));
                this.bean.setHue(a);
                var c = "#" + this.HSVToHex(a, 1, 1);
                $(".flyoutBG").css("background-color", c);
                try {
                    $(".flyouts").css("left", f.touches[0].pageX - 34);
                    $(".flyouts").css("top", f.touches[0].pageY - 100)
                } catch (b) {
                    $(".flyouts").hide()
                }
            },
            endHueDrag: function (a, b) {
                this.ignoreMainColor = false;
                $(".flyouts").hide()
            },
            mainColorChange: function () {
                if (this.ignoreMainColor) {
                    this.preview();
                    return
                }
                var d = this.bean.getColor();
                var b = this.HexToHSV(d);
                var a = b[0];
                var c = b[1];
                var e = b[2];
                this.bean.startAtomic();
                this.bean.setHue(a);
                this.bean.setSaturation(c);
                this.bean.setValue(e);
                this.bean.endAtomic();
                this.preview()
            },
            updateColor: function () {
                var a = this.bean.getHue();
                var f = "#" + this.HSVToHex(a, 1, 1);
                var h = (a * 2 * Math.PI) - (Math.PI / 4);
                if (h < 0) {
                    h += 2 * Math.PI
                }
                this.hueCtx.clear();
                this.hueCtx.beginPath();
                this.hueCtx.moveTo(26, 26);
                this.hueCtx.lineTo(Math.ceil(Math.cos(h) * 50) + 26, Math.ceil(-1 * Math.sin(h) * 50) + 26);
                this.hueCtx.stroke();
                $(this.mainNode).find(".hue_div").css("background-color", f);
                var g = this.bean.getValue();
                var e = this.bean.getSaturation();
                var b = 46 - Math.floor(g * 52);
                var d = Math.floor(e * 54) - 6;
                $(this.mainNode).find(".satval_cursor").css("top", b + "px");
                $(this.mainNode).find(".satval_cursor").css("left", d + "px");
                var c = this.HSVToHex(this.bean.getHue(), this.bean.getSaturation(), this.bean.getValue());
                this.bean.setColor(c)
            },
            preview: function () {
                var a = this.bean.getColor();
                this.ctx.strokeStyle = "#" + a;
                this.ctx.fillStyle = "#" + a;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, 10);
                this.ctx.lineTo(53, 63);
                this.ctx.lineTo(63, 63);
                this.ctx.lineTo(63, 0);
                this.ctx.lineTo(0, 0);
                this.ctx.fill();
                var b = this.bean.getSecondaryColor();
                this.ctx.strokeStyle = "#" + b;
                this.ctx.fillStyle = "#" + b;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 10);
                this.ctx.lineTo(0, 63);
                this.ctx.lineTo(53, 63);
                this.ctx.lineTo(0, 10);
                this.ctx.fill();
                $(this.mainNode).find(".specialColor").css("background-color", "#" + a)
            },
            HSVToHex: function (h, d, b) {
                var k, g, f, c, e, j, a;
                if (d <= 0) {
                    d = 0.001
                }
                if (h >= 1) {
                    h = 0
                }
                h = 6 * h;
                k = h - Math.floor(h);
                g = Math.round(255 * b * (1 - d));
                f = Math.round(255 * b * (1 - (d * k)));
                c = Math.round(255 * b * (1 - (d * (1 - k))));
                b = Math.round(255 * b);
                switch (Math.floor(h)) {
                case 0:
                    e = b;
                    j = c;
                    a = g;
                    break;
                case 1:
                    e = f;
                    j = b;
                    a = g;
                    break;
                case 2:
                    e = g;
                    j = b;
                    a = c;
                    break;
                case 3:
                    e = g;
                    j = f;
                    a = b;
                    break;
                case 4:
                    e = c;
                    j = g;
                    a = b;
                    break;
                case 5:
                    e = b;
                    j = g;
                    a = f;
                    break
                }
                return (this.toHex(e) + this.toHex(j) + this.toHex(a))
            },
            toHex: function (a) {
                if (a == null) {
                    return "00"
                }
                a = parseInt(a);
                if (a == 0 || isNaN(a)) {
                    return "00"
                }
                a = Math.max(0, a);
                a = Math.min(a, 255);
                a = Math.round(a);
                return "0123456789ABCDEF".charAt((a - a % 16) / 16) + "0123456789ABCDEF".charAt(a % 16)
            },
            HexToHSV: function (c) {
                var p, f, d;
                var g, q, a;
                var k = c.substr(0, 2);
                g = parseInt((k).substring(0, 2), 16);
                var t = c.substr(2, 2);
                q = parseInt((t).substring(0, 2), 16);
                var b = c.substr(4, 2);
                a = parseInt((b).substring(0, 2), 16);
                var l = Math.max(g, q, a);
                var e = Math.min(g, q, a);
                var n = l - e;
                d = Math.round((l / 255) * 100);
                if (l != 0) {
                    f = Math.round(n / l * 100)
                } else {
                    f = 0
                }
                if (f == 0) {
                    p = 0
                } else {
                    if (g == l) {
                        p = (q - a) / n
                    } else {
                        if (q == l) {
                            p = 2 + (a - g) / n
                        } else {
                            if (a == l) {
                                p = 4 + (g - q) / n
                            }
                        }
                    }
                    p = Math.round(p * 60);
                    if (p > 360) {
                        p = 360
                    }
                    if (p < 0) {
                        p += 360
                    }
                }
                var j = p / 360;
                var h = f / 100;
                var m = d / 100;
                return [j, h, m]
            }
        });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/colorpicker.js")
        }
    });
    DWait.ready(["jms/lib/Base.js", "jms/lib/StdLogger.js", "jms/lib/dragger.js"], function () {
        /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
        window.BrushPicker = Base.extend({
            constructor: function (a) {
                this.logger = new StdLogger("Brush Picker");
                this.bean = getManager().bean;
                this.mainNode = a;
                this.trackWidth = $(".opacitySlider .track", this.mainNode).width();
                this.bindBean();
                this.bindHtml();
                this.logupdate = false
            },
            bindBean: function () {
                this.bean.subscribe("brushOpacity", this.updateBrush.bindTo(this));
                this.bean.subscribe("brushSize", this.updateBrush.bindTo(this));
                this.bean.subscribe("brushHardness", this.updateBrush.bindTo(this))
            },
            bindHtml: function () {
                var c = this;
                var d, a, b;
                d = mgr.$mainNode.find(".opacitySlider");
                a = d.find(".knob").get(0);
                b = d.find(".track").get(0);
                new Dragger([a, b], b, function (f, g) {
                    c.startDrag(f, g, "opacity")
                }, this.moveDrag.bindTo(this), this.endDrag.bindTo(this));
                mgr.sliderManager.fineTuneBinder(d.find(".fineInput"), d.find(".value"), this.bean.getBrushOpacity.bindTo(this.bean), this.bean.setBrushOpacity.bindTo(this.bean), 0.01, 100);
                d = mgr.$mainNode.find(".sizeSlider");
                a = d.find(".knob").get(0);
                b = d.find(".track").get(0);
                new Dragger([a, b], b, function (f, g) {
                    c.startDrag(f, g, "size")
                }, this.moveDrag.bindTo(this), this.endDrag.bindTo(this));
                mgr.sliderManager.fineTuneBinder(d.find(".fineInput"), d.find(".value"), this.bean.getBrushSize.bindTo(this.bean), this.bean.setBrushSize.bindTo(this.bean), 1, 2.5);
                d = mgr.$mainNode.find(".effectSlider");
                a = d.find(".knob").get(0);
                b = d.find(".track").get(0);
                new Dragger([a, b], b, function (f, g) {
                    c.startDrag(f, g, "effect")
                }, this.moveDrag.bindTo(this), this.endDrag.bindTo(this));
                mgr.sliderManager.fineTuneBinder(d.find(".fineInput"), d.find(".value"), function () {
                    return 1 - this.bean.getBrushHardness()
                }.bindTo(this), function (e) {
                    return this.bean.setBrushHardness(1 - e)
                }.bindTo(this), 0.01, 100)
            },
            updateBrush: function (f) {
                var g;
                g = mgr.$mainNode.find(".opacitySlider");
                var a = this.bean.getBrushOpacity();
                g.find(".value").html(Math.floor(a * 100) + "%");
                var d = Math.floor(this.trackWidth * a) - 6;
                g.find(".knob").css("left", d + "px");
                g.find(".fineInput").val(Math.round(a * 100));
                g = mgr.$mainNode.find(".sizeSlider");
                var b = this.bean.getBrushSize();
                d = Math.floor(this.trackWidth * b / 40) - 6;
                g.find(".value").html(Math.floor(b * 2.5) + "%");
                g.find(".knob").css("left", d + "px");
                g.find(".fineInput").val(Math.round(b * 2.5));
                g = mgr.$mainNode.find(".effectSlider");
                var c = this.bean.getBrushHardness();
                d = Math.floor(this.trackWidth * (1 - c)) - 6;
                g.find(".value").html(Math.floor((1 - c) * 100) + "%");
                g.find(".knob").css("left", d + "px");
                g.find(".fineInput").val(Math.round((1 - c) * 100))
            },
            startDrag: function (c, d, b) {
                this.sliderType = b;
                var a = navigator.platform;
                if (a == "iPad" || a == "iPod" || a == "iPhone") {
                    $(".flyouts .colorFlyoutMask").hide();
                    $(".flyouts .flyoutBG").hide();
                    $(".flyouts .numberFlyoutMask").show();
                    $(".flyouts").show()
                }
            },
            moveDrag: function (c, d) {
                var f = Math.max(0, Math.min(1, (c[0] / this.trackWidth)));
                switch (this.sliderType) {
                case "opacity":
                    this.bean.setBrushOpacity(f);
                    break;
                case "size":
                    var a = Math.ceil(f * 40);
                    this.bean.setBrushSize(a);
                    break;
                case "effect":
                    this.bean.setBrushHardness(1 - f);
                    break
                }
                try {
                    $(".numberFlyoutMask .valdisp").empty().html(Math.round(f * 100) + "%");
                    $(".flyouts").css("left", d.touches[0].pageX - 34);
                    $(".flyouts").css("top", d.touches[0].pageY - 100)
                } catch (b) {
                    $(".flyouts").hide()
                }
            },
            endDrag: function (c, d) {
                this.sliderType = null;
                $(".flyouts").hide();
                var a = this.bean.getBrush();
                if (a) {
                    a.settings.save()
                }
            }
        });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/brushpicker.js")
        }
    });
    DWait.ready(["jms/lib/Base.js", "jms/lib/StdLogger.js", "jms/lib/difi.js", "jms/lib/gwebpage.js", "jms/pages/drawplz/gBrushList.js", "jms/pages/drawplz/brushes/basic.js", "jms/pages/drawplz/brushes/scatter.js", "jms/pages/drawplz/brushes/bubble.js", "jms/pages/drawplz/brushes/eyedropper.js", "jms/pages/drawplz/brushes/drippy.js", "jms/pages/drawplz/brushes/eraser.js", "jms/pages/drawplz/brushes/floodfill.js", "jms/pages/drawplz/brushes/gradient.js", "jms/pages/drawplz/brushes/furry.js", "jms/pages/drawplz/brushes/dragon.js", "jms/pages/drawplz/brushes/yarn.js", "jms/pages/drawplz/brushes/heat.js", "jms/pages/drawplz/brushes/bottle.js", "jms/pages/drawplz/brushes/slinky.js", "jms/pages/drawplz/brushes/love.js", "jms/pages/drawplz/brushes/mudkip.js", "jms/pages/drawplz/brushes/pencil.js", "jms/pages/drawplz/brushes/webink.js", "jms/pages/drawplz/brushes/polygon.js", "jms/pages/drawplz/brushes/hatch.js", "jms/pages/drawplz/brushes/splatter.js", "jms/pages/drawplz/brushes/smoke.js", "jms/pages/drawplz/brushes/halftone.js", "jms/pages/drawplz/brushes/stripes.js", "jms/pages/drawplz/brushes/texture.js", "jms/pages/drawplz/brushes/concrete.js", "jms/pages/drawplz/brushes/rough.js", "jms/pages/drawplz/brushes/handTool.js"], function () {
        /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
        window.BrushSelector = Base.extend({
            constructor: function (a) {
                this.logger = new StdLogger("Brush Selector");
                this.mainNode = a;
                this.bean = getManager().bean;
                this.brushArr = [];
                this.fakeBrushes = [];
                this.brushPackArr = [];
                this.defaultBrushes = [];
                this.initializing = false;
                this.bindHtml();
                this.bindBean();
                this.brushInit = {};
                this.difiReturn = null;
                window.gBrushList.addListener(bind(this, this.updateBrushList))
            },
            bindHtml: function () {},
            bindBean: function () {
                this.bean.subscribe(["color", "secondaryColor", "brush", "brushSize", "brushOpacity", "brushHardness"], this.preview.bindTo(this));
                this.bean.subscribe(["brush"], this.brushSubscribe.bindTo(this))
            },
            brushSubscribe: function () {
                var a = mgr.bean.getBrush();
                try {
                    if (a.options.inToolbar) {
                        mgr.$mainNode.find(".brushButtonSelected").removeClass("brushButtonSelected");
                        mgr.$mainNode.find('.brushButton[title="' + a.options.name + '"]').addClass("brushButtonSelected");
                        safeLocalSet("drawplz_lastbrush", a.options.name)
                    }
                } catch (b) {}
            },
            init: function (a, d, c) {
                this.brushInit = {
                    ctx: a,
                    bufferCtx: d,
                    brushCtx: c
                };
                this.brushArr = this.defaultBrushes = [new EraserBrush(this.bean, a, d, c), new EyeDropperBrush(this.bean, a, d, c), new FloodFillBrush(this.bean, a, d, c), new HandTool(this.bean, a, d, c), new SmudgeBrush(this.bean, a, d, c)];
                if (getManager().selectionManager) {
                    this.defaultBrushes.push(new MarqueeSelectionBrush(this.bean, a, d, c));
                    this.defaultBrushes.push(new MoveTool(this.bean, a, d, c))
                }
                var b = this.defaultBrushes.length;
                while (b--) {
                    if (!this.bean.getIsHTML5() && !this.defaultBrushes[b].options.ie) {
                        this.defaultBrushes.splice(b, 1)
                    }
                }
                this.refetchBrushes()
            },
            refetchBrushes: function (b) {
                b = parseInt(b);
                if (isNaN(b) || b < 1) {
                    b = 1
                }
                if (!mgr.isPlayback) {
                    var c = 0;
                    var a = mgr.contestManager;
                    if (a && a.isActive()) {
                        c = a.contest_id
                    }
                    DiFi.pushPost("DrawPlz", "get_brushes", [c], this.difiCallback, this)
                } else {
                    DiFi.pushPost("DrawPlz", "get_recording_brushes", [mgr.recordingDeviationId], this.difiCallback, this)
                }
                DiFi.timer(b)
            },
            updateBrushList: function (b) {
                this.brushArr = [];
                this.fakeBrushes = [];
                for (var d in this.defaultBrushes) {
                    this.brushArr.push(this.defaultBrushes[d]);
                    if (b[d]) {
                        delete b[d]
                    }
                }
                if (b) {
                    for (var f in b) {
                        try {
                            var g = b[f];
                            var c = b[f].prototype.options;
                            if (!g) {
                                continue
                            }
                            if (!this.bean.getIsHTML5() && (!c.ie || c.ie == undefined)) {
                                if (c.inToolbar == undefined || c.inToolbar) {
                                    this.fakeBrushes.push([c.glyphPos, f])
                                }
                                continue
                            }
                            var a = new g(this.bean, this.brushInit.ctx, this.brushInit.bufferCtx, this.brushInit.brushCtx);
                            this.brushArr.push(a)
                        } catch (j) {
                            this.logger.log('Error instantiating brush class "' + f + '"')
                        }
                    }
                }
                this.makeBrushMenu();
                getManager().layoutManager.resizeBrushSelector();
                var h = safeLocalGet("drawplz_lastbrush", null);
                if (h) {
                    this.selectBrushByName(h)
                } else {
                    this.selectBrushByName("Webink")
                }
                DWait.run(".brushesLoaded")
            },
            generateBrushpackButtonHtml: function (d, b, e) {
                var c = "http://st.deviantart.net/minish/canvasdraw/brushassets/" + b.toLowerCase().replace(/ .*/, "") + ".png";
                var a = ['<div class="brushpackButton" brushpackid="' + d + '" price="' + e + '" title="' + b + '" style="background-image: url(' + c + ');"></div>'];
                return a.join("")
            },
            generateBrushButtonHtml: function (a, c, b) {
                b = b || a;
                return '<div class="brushButton" title="' + b + '"><div class="brushGlyph" style="background-position: -' + c + 'px 0px" title="' + a + '"><!-- --></div></div>'
            },
            generateFakeBrushButtonHtml: function (a, c, b) {
                b = b || a;
                return '<div class="fakeBrushButton" title="' + b + '"><div class="brushGlyph" style="background-position: -' + c + 'px 0px" title="' + a + '"><!-- --></div></div>'
            },
            brushpackClick: function (d) {
                var b = $(d.target);
                if (!b.hasClass("brushpackButton")) {
                    b = b.parent(".brushpackButton")
                }
                var c = b.attr("brushpackid");
                var a = window.deviantART.deviant.id || 0;
                DWait.readyLink("jms/pages/drawplz/buybrush.js", this, function () {
                    BrushBuyer.openModal(c, a, {
                        forceReload: false,
                        callback: bind(this, this.onBrushpackPurchase)
                    })
                });
                return false
            },
            onBrushpackPurchase: function (b, a) {
                if (b) {
                    this.refetchBrushes(100)
                }
            },
            makeBrushMenu: function () {
                $(".brushSelector .scroller").find(".brushButton, .brushpackButton").remove();
                $(".fakeBrushButton").remove();
                if (!this.brushArr.length) {
                    return
                }
                this.initializing = true;
                var e, j, g, d, l, a, k;
                for (e = 0; e < this.brushArr.length; e++) {
                    g = this.brushArr[e];
                    if (g.options.inToolbar) {
                        l = g.options.name;
                        l = l.charAt(0).toUpperCase() + l.slice(1);
                        a = g.options.glyphPos * 40;
                        k = $(this.generateBrushButtonHtml(l, a)).appendTo(".brushSelector .brushCont");
                        g.setButton(k);
                        k.mousedown(this.buttonClick.bindTo(g))
                    }
                }
                for (e = 0; e < this.fakeBrushes.length; e++) {
                    d = this.fakeBrushes[e];
                    a = d[0] * 40;
                    l = d[1];
                    var f = this.generateFakeBrushButtonHtml(l, a);
                    k = $(this.generateFakeBrushButtonHtml(l, a)).appendTo(".brushSelector .brushCont");
                    k.mousedown(function () {
                        getManager().modalManager.pushModal("html5", [], function () {}, function () {})
                    })
                }
                var m = window.gBrushList.brushpackOffers;
                if (m) {
                    for (e = 0; e < m.length; e++) {
                        j = m[e];
                        k = $(this.generateBrushpackButtonHtml(j.brushpackid, j.name, j.price)).appendTo(".brushSelector .brushCont");
                        k.click(function (b) {
                            if ($(this).is("#drawPlzPress .brushpackButton")) {
                                return false
                            } else {
                                bs = getManager().brushSelector;
                                bs.brushpackClick(b)
                            }
                        })
                    }
                    var c = navigator.platform;
                    if (c != "iPad" && c != "iPod" && c != "iPhone") {
                        $(".brushpackButton").live("mouseenter", functi..., textarea ").live("
                        focusin ",function(){$(this).addClass("
                        focussedInput ")});$("
                        input, textarea ").live("
                        focusout ",function(){$(this).removeClass("
                        focussedInput ")});if($(".dhUrlEntry ").length){$(".dhUrlEntry ").get(0).onkeypress=function(a){if(a.which==13){$(".dhUrlCont.headerButton ").click()}}}},on:function(){this.enabled=true},off:function(){this.enabled=false},keyPress:function(a){if(!a){return true}if(mgr.bean.getIsPenDown()){return false}if(mgr.bean.getRDReader()){return true}if(a.ctrlKey||a.metaKey){switch(a.which){case 45:mgr.zoomManager.zoomOut();return false;case 61:mgr.zoomManager.zoomIn();return false}}else{switch(a.which){case 91:mgr.bean.setBrushSize(mgr.bean.getBrushSize()-1);return false;case 93:mgr.bean.setBrushSize(mgr.bean.getBrushSize()+1);return false}}},keyDown:function(j){if(!this.enabled){return false}if(!j){return true}if(mgr.bean.getRDReader()){switch(j.which){case 32:mgr.recordedDrawingPlayback.playbuttonClick();return false;default:return true}}if(mgr.bean.getIsPenDown()){return false}var h;var g=mgr.canvasDrawing;if(g.processingFilter){return false}if($(".focussedInput ").length>0){return true}if(window.SelectionManager){if(j.ctrlKey||j.metaKey){switch(j.which){case 67:mgr.selectionManager.copy();return false;case 86:mgr.selectionManager.paste();return false;case 88:mgr.selectionManager.cut();return false;case 68:mgr.selectionManager.deselect();return false;case 65:mgr.selectionManager.selectAll();return false;case 73:if(j.shiftKey){mgr.selectionManager.selectInverse();return false}break}}else{switch(j.which){case 76:mgr.toolManager.toolAction("
                        select ");var a=mgr.bean.getBrush();if(!a.subbrush.match(/Lasso/)){a.subBrush(safeLocalGet("
                        drawplz_whichLasso ","
                        Lasso "))}return false;case 77:mgr.toolManager.toolAction("
                        select ");var a=mgr.bean.getBrush();if(!a.subbrush.match(/Marquee/)){a.subBrush(safeLocalGet("
                        drawplz_whichMarquee ","
                        Marquee "))}return false;case 86:mgr.toolManager.toolAction("
                        move ");return false}}}if(j.ctrlKey||j.metaKey){switch(j.which){case 26:case 122:case 90:if(j.shiftKey){mgr.undoManager.redo()}else{mgr.undoManager.undo()}return false;case 65:return false;case 48:mgr.zoomManager.fitToScreen();return true;case 49:mgr.zoomManager.actualPixels();return false;case 110:case 78:mgr.bean.startAtomic();var c=mgr.layerManager.create();mgr.bean.setSelectedLayer(c);mgr.bean.endAtomic();mgr.undoManager.push();return false;case 189:mgr.zoomManager.zoomOut();return false;case 187:mgr.zoomManager.zoomIn();return false;case 61:case 109:return false}}else{var f=mgr.brushSelector;switch(j.which){case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:if(j.shiftKey){size=Math.ceil(1+((((j.which-48)||10)-1)*40/9));mgr.bean.setBrushSize(size)}else{h=((j.which-48)||10)/10;mgr.bean.setBrushOpacity(h)}return false;case 45:case 189:h=mgr.bean.getBrushOpacity();if(h>0.2){mgr.bean.setBrushOpacity(h-0.1)}return false;case 61:case 187:mgr.bean.setBrushOpacity(mgr.bean.getBrushOpacity()+0.1);return false;case 59:case 186:hard=mgr.bean.getBrushHardness();if(hard<0.9){mgr.bean.setBrushHardness(hard+0.1)}else{mgr.bean.setBrushHardness(1)}return false;case 39:case 222:hard=mgr.bean.getBrushHardness();if(hard>0.1){mgr.bean.setBrushHardness(hard-0.1)}return false;case 188:f.prevBrush();return false;case 190:f.nextBrush();return false;case 73:case 67:if(!this.dropper){this.dropper=true;this.switchBackBrush=mgr.bean.getBrush().options.name;mgr.toolManager.toolAction("
                        dropper ")}return false;case 32:if(!this.handtool){this.handtool=true;var d=mgr.bean.getBrush().options.name;if(d!="
                        Hand Tool "){this.switchBackBrush=d}mgr.toolManager.toolAction("
                        hand ")}return false;case 66:mgr.toolManager.toolAction("
                        draw ");return false;case 69:mgr.toolManager.toolAction("
                        erase ");return false;case 70:mgr.toolManager.toolAction("
                        flood ");return false}}return true},keyUp:function(){if(mgr.bean.getRDReader()){return true}if(this.dropper||this.handtool){this.dropper=false;this.handtool=false;this.logger.log("
                        switch back: ",this.switchBackBrush);switch(this.switchBackBrush){case"
                        Eraser ":mgr.toolManager.toolAction("
                        erase ");return false;case"
                        Flood Fill ":mgr.toolManager.toolAction("
                        flood ");return false;case"
                        Blending ":mgr.toolManager.toolAction("
                        smudge ");return false;default:mgr.toolManager.toolAction("
                        draw ");return false}}else{return true}},menuHotkey:function(a,e,b){if(b.length>0){for(var d=0;d<b.length;d++){var c=b[d];switch(c){case"
                        cmd ":if(Browser.isMac){e=" & #8984;"+e}else{e= "Ctrl+" + e
                        }
                        break;
                    case "shift":
                        if (Browser.isMac) {
                            e = "&#8679;" + e
                        } else {
                            e = "Shift+" + e
                        }
                        break
                    }
                }
            }
            var f = $('.topArea .oh-menu .editMenuItem[rel="' + a + '"]');
            f.find(".hotkey").remove();
            f.append('<div class="hotkey">' + e + "</div>")
        }, lableMenus: function () {
            this.menuHotkey("cut", "X", ["cmd"]);
            this.menuHotkey("copy", "C", ["cmd"]);
            this.menuHotkey("paste", "V", ["cmd"]);
            this.menuHotkey("selectAll", "A", ["cmd"]);
            this.menuHotkey("selectInverse", "I", ["shift", "cmd"]);
            this.menuHotkey("deselect", "D", ["cmd"])
        }
        });
    if (window.DWait) {
        DWait.run("jms/pages/drawplz/keyhandler.js");
        /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
    }
    window.CHANGESTAMPS = {
        CLEAR: 0,
        WHITE: 1,
        OFFWHITE: 2,
        BLACK: 3
    }; window.CHANGESTAMP_COLORS = {
        CLEAR: "rgba(0, 0, 0, 0)",
        WHITE: "#ffffff",
        OFFWHITE: "#fffffa",
        BLACK: "#000000"
    }; window.isSpecialChangestamp = function (a) {
        switch (a) {
        case CHANGESTAMPS.CLEAR:
        case CHANGESTAMPS.WHITE:
        case CHANGESTAMPS.BLACK:
        case CHANGESTAMPS.OFFWHITE:
            return true;
        default:
            return false
        }
    }; window.getSpecialColor = function (a) {
        switch (a) {
        case CHANGESTAMPS.CLEAR:
            return CHANGESTAMP_COLORS.CLEAR;
        case CHANGESTAMPS.WHITE:
            return CHANGESTAMP_COLORS.WHITE;
        case CHANGESTAMPS.BLACK:
            return CHANGESTAMP_COLORS.BLACK;
        case CHANGESTAMPS.OFFWHITE:
            return CHANGESTAMP_COLORS.OFFWHITE;
        default:
            return CHANGESTAMP_COLORS.CLEAR
        }
    }; window.UndoManager = Base.extend({
        constructor: function () {
            this.logger = new StdLogger("Undo");
            this.mainNode = getManager().bean.getMainNode();
            this.bean = getManager().bean;
            this.enabled = true;
            this.talkedback = false;
            this.reset()
        },
        reset: function () {
            this.stash = new LayerDataStash();
            this.undoBuffer = [];
            this.redoBuffer = [];
            this.setDisabledStates();
            this.changedAt = 0;
            this.savedAt = 0;
            this.saveStartedAt = 0;
            this.area = getManager().width * getManager().height
        },
        disable: function () {
            this.enabled = false
        },
        enable: function () {
            this.enabled = true
        },
        setDisabledStates: function () {
            if (this.hasMoreUndo()) {
                $(".undoButtonDisabled", this.mainNode).removeClass("undoButtonDisabled");
                $(".undoToolButtonDisabled", this.mainNode).removeClass("undoToolButtonDisabled")
            } else {
                $(".undoButton", this.mainNode).addClass("undoButtonDisabled");
                $("a.toolbutton[action=undo]", this.mainNode).addClass("undoToolButtonDisabled")
            }
            if (this.hasMoreRedo()) {
                $(".redoButtonDisabled", this.mainNode).removeClass("redoButtonDisabled");
                $(".redoToolButtonDisabled", this.mainNode).removeClass("redoToolButtonDisabled")
            } else {
                $(".redoButton", this.mainNode).addClass("redoButtonDisabled");
                $("a.toolbutton[action=redo]", this.mainNode).addClass("redoToolButtonDisabled")
            }
            if (mgr.bean.getDraftId() && this.hasUnsavedWork()) {
                if (!mgr.isBusy("save", "load", "modal")) {
                    mgr.layoutManager.enableMenuItem("save", true)
                }
            } else {
                mgr.layoutManager.disableMenuItem("save")
            }
        },
        push: function (a) {
            try {
                if (!this.enabled) {
                    return
                }
                var c = this.makeFrame(a);
                c.store();
                this.undoBuffer.push(c);
                while (this.undoBuffer.length > this.MAX_LEVELS) {
                    this.undoBuffer.shift()
                }
                this.redoBuffer = [];
                this.markAndSweep();
                this.changedAt = (new Date()).getTime();
                this.setDisabledStates()
            } catch (b) {
                if (!this.talkedback) {
                    this.talkedback = true;
                    this.logger.talkback("Drawplz - Error in undo push.", {
                        message: b.message
                    })
                }
            }
        },
        undo: function () {
            if (this.hasMoreUndo()) {
                var a = mgr.bean.getRDWriter().startInstruction(RDInst.UNDO, "u");
                this.redoBuffer.push(this.undoBuffer.pop());
                this.undoBuffer.push(this.undoBuffer.pop().restore());
                this.changedAt = (new Date()).getTime();
                a.pushInstruction()
            }
            this.markAndSweep();
            this.setDisabledStates()
        },
        redo: function () {
            if (this.hasMoreRedo()) {
                var a = mgr.bean.getRDWriter().startInstruction(RDInst.UNDO, "r");
                this.undoBuffer.push(this.redoBuffer.pop().restore());
                this.changedAt = (new Date()).getTime();
                a.pushInstruction()
            }
            this.markAndSweep();
            this.setDisabledStates()
        },
        hasMoreUndo: function () {
            return (this.undoBuffer.length > 1)
        },
        hasMoreRedo: function () {
            return (this.redoBuffer.length > 0)
        },
        hasUnsavedWork: function () {
            if (mgr.recordingDeviationId) {
                return false
            }
            return ((this.hasMoreUndo() || this.hasMoreRedo()) && this.changedAt > this.savedAt)
        },
        startedSaving: function () {
            this.saveStartedAt = (new Date()).getTime()
        },
        didSave: function () {
            this.savedAt = this.saveStartedAt
        },
        markAndSweep: function () {
            for (var a = 0; a < this.undoBuffer.length; a++) {
                this.undoBuffer[a].mark()
            }
            for (var a = 0; a < this.redoBuffer.length; a++) {
                this.redoBuffer[a].mark()
            }
            this.stash.sweep()
        },
        clearBuffers: function () {
            if (!this.enabled) {
                return
            }
            this.undoBuffer = [];
            this.redoBuffer = [];
            this.markAndSweep();
            this.push();
            this.setDisabledStates()
        }
    }); window.CanvasUndo = UndoManager.extend({
        constructor: function (a) {
            this.MAX_LEVELS = 6;
            this.base(a)
        },
        makeFrame: function (a) {
            return new CanvasUndoFrame(this.stash, a, this.area)
        }
    }); window.IEUndo = UndoManager.extend({
        constructor: function () {
            this.MAX_LEVELS = 0;
            this.base()
        },
        makeFrame: function (a) {
            return new IEUndoFrame(this.stash, a, this.area)
        }
    }); window.UndoFrame = Base.extend({
        constructor: function (a, b, c) {
            this.stash = a;
            this.dirty = b;
            this.area = c;
            this.nameList = [];
            this.opacityList = [];
            this.visibilityList = [];
            this.layerDataKeys = [];
            this.layerDatas = [];
            this.layerIds = [];
            this.talkedback = false
        },
        mark: function () {
            for (var a = 0; a < this.layerDataKeys.length; a++) {
                this.stash.mark(this.layerDataKeys[a])
            }
        },
        store: function () {
            try {
                var f = getManager().layerManager;
                this.selectedName = f.bean.getSelectedLayer().getName();
                this.nameList = f.getLayerList();
                this.layersToDelete = f.layersToDelete;
                this.layerDataKeys = [];
                var a, b;
                for (var c = 0; c < this.nameList.length; c++) {
                    a = getManager().layerManager.getLayer(this.nameList[c]);
                    b = a.changeStamp;
                    if (!isSpecialChangestamp(b)) {
                        if (!this.stash.check(b)) {
                            this.stash.put(b, this.getData(a))
                        }
                    }
                    this.layerDataKeys.push(b);
                    this.opacityList.push($(a.canvasDom).css("opacity"));
                    this.layerDatas.push(a.getLayerData());
                    this.layerIds.push(a.getId());
                    this.visibilityList.push(a.isVisible())
                }
                if (window.SelectionManager && getManager().bean.getIsHTML5()) {
                    var g = getManager().selectionManager;
                    if (g.hasSelection) {
                        this.selection = g.selCtx.getImageData(0, 0, g.width, g.height)
                    } else {
                        this.selection = null
                    }
                }
            } catch (d) {
                if (!this.talkedback) {
                    this.talkedback = true;
                    talkback("Drawplz - Error in undo store method.", {
                        message: d.message
                    })
                }
                throw d
            }
        },
        restore: function () {
            var g, d, f, a;
            var p = getManager().layerManager;
            p.bean.startAtomic();
            try {
                p.layersToDelete = this.layersToDelete;
                if (this.nameList.length > 0) {
                    for (g = 0; g < this.nameList.length; g++) {
                        f = this.layerDataKeys[g];
                        if (!isSpecialChangestamp(f)) {
                            a = this.stash.get(f);
                            try {
                                var m = a;
                                while (m.meta.ref || m.meta.ref == 0) {
                                    m = this.stash.get(m.meta.ref)
                                }
                                if (!m.data) {
                                    throw "fuck me"
                                }
                            } catch (j) {
                                this.talkedback = true;
                                this.logger.talkback("Drawplz - Trying to undo to something not in our stash, aborting");
                                return this
                            }
                        }
                    }
                    p.clobber();
                    for (g = 0; g < this.nameList.length; g++) {
                        try {
                            d = new Layer(p, this.nameList[g]);
                            f = this.layerDataKeys[g];
                            if (!isSpecialChangestamp(f)) {
                                a = this.stash.get(f);
                                this.putData(d, a)
                            } else {
                                d.getContext().clearToColor(getSpecialColor(f))
                            }
                            d.changeStamp = f;
                            $(d.canvasDom).css("opacity", this.opacityList[g]);
                            d.setLayerData(this.layerDatas[g]);
                            if (this.visibilityList[g]) {
                                $(d.canvasDom).show()
                            } else {
                                $(d.canvasDom).hide()
                            }
                            p.add(d)
                        } catch (j) {
                            if (!this.talkedback) {
                                this.talkedback = true;
                                var h = new Object();
                                try {
                                    h.imgDataType = typeof (a);
                                    h.imgDataLength = a.length;
                                    h.changeStamp = d.changeStamp
                                } catch (n) {}
                                talkback("Drawplz - Error in restore layer.", {
                                    message: j.message,
                                    argObj: h
                                })
                            }
                        }
                    }
                    var c = p.getLayer(this.selectedName);
                    if (!c) {
                        c = p.layers[0]
                    }
                    p.bean.setSelectedLayer(c);
                    p.bean.setLayerOpacity($(c.canvasDom).css("opacity"))
                }
                if (window.SelectionManager && getManager().bean.getIsHTML5()) {
                    var b = getManager().selectionManager;
                    if (this.selection) {
                        b.hasSelection = true;
                        b.selCtx.putImageData(this.selection, 0, 0);
                        b.makeMarchingAnts()
                    } else {
                        b.deselect()
                    }
                }
            } catch (j) {
                if (!this.talkedback) {
                    this.talkedback = true;
                    talkback("Drawplz - Error in undo restore.", {
                        message: j.message
                    })
                }
            } finally {
                p.bean.endAtomic()
            }
            return this
        }
    }); window.CanvasUndoFrame = UndoFrame.extend({
        mergeDirty: function (c, b) {
            if (!c) {
                return b
            } else {
                if (!b) {
                    return c
                } else {
                    try {
                        var a = Math.floor(Math.min(c[0], b[0]));
                        var h = Math.floor(Math.min(c[1], b[1]));
                        var g = Math.floor(Math.max(c[0] + c[2], b[0] + b[2]));
                        var d = Math.floor(Math.max(c[1] + c[3], b[1] + b[3]));
                        return this.checkBounds([a, h, (g - a), (d - h)])
                    } catch (f) {
                        this.logger.talkback("Drawplz - Error in undo mergeDirty.", {
                            message: f.message
                        });
                        return null
                    }
                }
            }
        },
        checkBounds: function (f) {
            try {
                var b = mgr.width;
                var d = mgr.height;
                var a = Math.min(b - 1, Math.max(0, f[0]));
                var k = Math.min(d - 1, Math.max(0, f[1]));
                var c = Math.min(b - a, Math.max(1, f[2]));
                var g = Math.min(d - k, Math.max(1, f[3]));
                return [a, k, c, g]
            } catch (j) {
                this.logger.talkback("Drawplz - Error in undo checkBounds.", {
                    message: j.message
                });
                return null
            }
        },
        getData: function (c) {
            var b = c.getContext();
            try {
                if (this.dirty) {
                    if (this.stash.check(c.oldChangeStamp)) {
                        var g = this.stash.get(c.oldChangeStamp).meta;
                        var a = g.dirtyCoords;
                        var d = this.mergeDirty(a, this.dirty);
                        if (d && d.length == 4 && (1.5 * d[2] * d[3]) < this.area) {
                            return {
                                data: null,
                                meta: {
                                    ref: c.oldChangeStamp,
                                    dirtyData: b.getImageData(d[0], d[1], d[2], d[3]),
                                    dirtyCoords: d
                                }
                            }
                        }
                    }
                }
            } catch (f) {}
            return {
                data: b.getImageData(0, 0, mgr.width, mgr.height),
                meta: {
                    ref: null,
                    dirtyData: null,
                    dirtyCoords: null
                }
            }
        },
        putData: function (b, c) {
            var a = b.getContext();
            if (!c.data) {
                var d = c;
                if (!d) {
                    breakpoint()
                }
                while (d.meta.ref || d.meta.ref == 0) {
                    d = this.stash.get(d.meta.ref)
                }
                a.putImageData(d.data, 0, 0)
            } else {
                a.putImageData(c.data, 0, 0)
            }
            if (c.meta.dirtyData) {
                var e = this.checkBounds(c.meta.dirtyCoords);
                if (e) {
                    a.putImageData(c.meta.dirtyData, e[0], e[1])
                } else {
                    if (!this.talkedback) {
                        this.talkedback = true;
                        talkback("Drawplz - Error in restore dirty data")
                    }
                }
            }
        }
    }); window.IEUndoFrame = UndoFrame.extend({
        getData: function (a) {
            imgData = $(a.canvasDom).html();
            return imgData
        },
        putData: function (a, b) {
            return $(a.canvasDom).html(b)
        }
    }); window.LayerDataStash = Base.extend({
        constructor: function () {
            this.stash = []
        },
        put: function (b, c) {
            for (var a = 0; a < this.stash.length; a++) {
                if (this.stash[a][0] == b) {
                    return
                }
            }
            this.stash.push([b, c, false])
        },
        check: function (b) {
            for (var a = 0; a < this.stash.length; a++) {
                if (this.stash[a][0] == b) {
                    return true
                }
            }
            return false
        },
        get: function (b) {
            for (var a = 0; a < this.stash.length; a++) {
                if (this.stash[a][0] == b) {
                    return this.stash[a][1]
                }
            }
            return null
        },
        mark: function (b) {
            for (var a = 0; a < this.stash.length; a++) {
                if (this.stash[a][0] == b) {
                    this.stash[a][2] = true;
                    return
                }
            }
        },
        moveData: function (d) {
            var c = this.stash[d][0];
            for (var a = 0; a < this.stash.length; a++) {
                try {
                    if (this.stash[a][1].meta.ref == c) {
                        this.stash[a][1].data = this.stash[d][1].data;
                        this.stash[a][1].meta.ref = null;
                        return
                    }
                } catch (b) {}
            }
        },
        sweep: function () {
            for (var a = this.stash.length - 1; a >= 0; a--) {
                if (!this.stash[a][2]) {
                    this.moveData(a);
                    this.stash.splice(a, 1)
                } else {
                    this.stash[a][2] = false
                }
            }
        }
    }); window.undoFactory = function (a) {
        if (!getManager().bean.getIsHTML5()) {
            return new IEUndo(a)
        } else {
            return new CanvasUndo(a)
        }
    };
    if (window.DWait) {
        DWait.run("jms/pages/drawplz/undo.js");
        /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
    }
    window.SubmissionManager = Base.extend({
        constructor: function () {
            this.logger = new StdLogger("Save");
            this.$modal = null;
            this.isAlreadySubmitting = false;
            this.submitWindow = null;
            this.submitList = [{
                name: "Image",
                url: null,
                func: function () {
                    mgr.canvasDrawing.submitDrawing()
                }
            }];
            this.recordNum = 1;
            this.selectedSubmitItem = "Image";
            this.submitPollBlip = bind(this, this.submitPollBlip);
            this.checkForm = bind(this, this.checkForm)
        },
        submitButtonClick: function () {
            mgr.openProgressModal("Writing to your Sta.sh", "Saving your file to your Sta.sh", ["Looks great, you must put in a lot of practice!<br/>"]);
            if (!mgr.bean.getRecordingDeviationId()) {
                if (!mgr.hasDrawn()) {
                    alert("Draw something first!");
                    return
                }
                if (!window.deviantART.deviant.loggedIn) {
                    DiFi.pushPost("DrawPlz", "login_noop", [], function (b, a) {
                        if (b) {
                            PubSub.subscribe([{
                                eventname: "recordedDrawingManager.recordStart",
                                subscriber: this,
                                callback: this.submitButtonClick
                            }]);
                            setTimeout(mgr.recordedDrawingManager.startRecording.bindTo(mgr.recordedDrawingManager), 10)
                        }
                    }.bindTo(this));
                    DiFi.send()
                } else {
                    mgr.recordedDrawingManager.afterRecordStart = function () {
                        this.submitButtonClick()
                    }.bindTo(this);
                    mgr.recordedDrawingManager.postStartToServer()
                }
                return
            }
            mgr.recordedDrawingManager.stopRecording(true, function (a) {
                window.location.href = a.deviationinfo.url
            })
        },
        addToSubmitList: function (c, b, a) {
            if (!c) {
                c = (this.recordNum > 1) ? "Recording " + this.recordNum : "Recording";
                this.recordNum++
            }
            this.submitList.push({
                name: c,
                url: b,
                func: a
            });
            this.selectSubmitListItem(c)
        },
        selectSubmitListItem: function (a) {
            mgr.submissionManager.selectedSubmitItem = a;
            $(".sButtonText").empty();
            $(".sButtonText").html("Submit " + a)
        },
        openSubmitMenu: function () {
            if ($(".headerMenuActive").length > 0) {
                $(".stopTouch").click();
                return false
            }
            $(".oh-menu").hide();
            $(".stopTouch", mgr.mainNode).width($(window).width()).height($(window).height() - mgr.layoutManager.adSize).show();
            var c = mgr.$mainNode.find(".submitMenu");
            c.empty();
            for (var b = 0; b < this.submitList.length; b++) {
                var a = this.submitList[b].name;
                c.append('<a class="mi submitMenuItem" href="javascript:void(0);" value="' + a + '">' + a + "</a>")
            }
            c.show();
            mgr.layoutManager.alignMenus()
        },
        submitImageData: function (a) {
            if (mgr.isInline) {
                return this.submitInline(a)
            } else {
                if (mgr.isDrawhere) {
                    return this.submitDrawHere(a)
                }
            }
            if (this.isAlreadySubmitting) {
                return false
            }
            this.isAlreadySubmitting = true;
            if (false) {
                mgr.modalManager.pushModal("progress", [], function (c) {
                    return true
                }, function (c) {
                    var d = ["I'm gonna add some kittens into this picture for you. You really can't ever have too many kittens.<br/><br/>", "Don't look now, but I think there is a velociraptor right behind you.<br/><br/>", 'How many art critics does it take to change a lightbulb?.<br/>Two, one to change it and one to say, "Hmmph, my 4 year old could do that!"<br/>'];
                    this.$modal = $(c);
                    this.$modal.parents(".modal").find(".x-mac").hide();
                    this.$modal.find(".daTitle").html("Submitting Your Artwork");
                    this.$modal.find(".workDesc").html("Uploading");
                    this.$modal.find(".talkmessage .message").html(d[Math.floor(Math.random() * d.length)]);
                    this.submitWindow = window.open("http://muro.deviantart.com/uploader.php", "muroStashUploader");
                    this.submitWindow.onload = function () {
                        this.submitWindow.$(".imagedata").val(a);
                        this.submitWindow.$(".postForm").get(0).submit()
                    }.bindTo(this)
                }.bindTo(this));
                return false
            }
            var b = getManager().fileManager.getDraftId() || 0;
            getManager().modalManager.pushModal("submit", [b], function (d) {
                this.logger.log("ACTION: ", d);
                switch (d) {
                case "ok":
                    var c = this.$modal.find(".btn-submit");
                    if (c.hasClass("disabledbutton") || c.hasClass("btn-continue")) {
                        return false
                    }
                    c.addClass("disabledbutton");
                    if (mgr.contestManager.isActive()) {
                        this.submitToContest(a)
                    } else {
                        this.submitToDeck(a)
                    }
                    this.$modal.find(".submitModal-overlay").html("<h3>" + this.EAGER_DUDE + " Submitting...</h3>").fadeIn();
                    return false;
                case "export":
                    if (!getManager().bean.getIsHTML5()) {
                        alert("Exporting is currently not supported in your browser.");
                        return false
                    }
                    this.exportImageData(a);
                    return false;
                case "cancel":
                default:
                    this.isAlreadySubmitting = false;
                    break
                }
            }.bindTo(this), function (d) {
                var c = this.$modal = $(d);
                c.find("input, textarea").change(this.checkForm);
                c.find("input, textarea").mousedown(function () {
                    $(this).focus();
                    return true
                });
                c.find(".chooseCatBtn").click(bind(this, this.chooseCategory));
                this.popupRules($("input[name=categoryId]").val())
            }.bindTo(this));
            return false
        },
        submitDrawHere: function (a) {
            this.logger.log("Submit Drawhere");
            mgr.modalManager.pushModal("progress", [], function (b) {
                return true
            }, function (c) {
                var d = ["Draw Where? Draw Here!<br/><br/>", "Chris, can you please install java and X11 on our webservers?<br/><br/>"];
                this.$modal = $(c);
                this.$modal.parents(".modal").find(".x-mac").hide();
                this.$modal.find(".daTitle").html("Submitting Your Artwork");
                this.$modal.find(".workDesc").html("Uploading");
                this.$modal.find(".talkmessage .message").html(d[Math.floor(Math.random() * d.length)]);
                $('<iframe name="submitFrame" style="display: none"></iframe>').appendTo("body");
                var b = $('<form class="postForm" target="submitFrame" action="http://' + window.location.hostname + '/global/muro/poster.php" me...f[1]-this.startCoords[1];if(c*c+b*b>16){this.isMicroSelection=false}switch(this.subbrush){case"Marquee":case"Additive Marquee":case"Subtractive Marquee":this.bufferCtx.clear();this.bufferCtx.strokeStyle="#ffffff";this.bufferCtx.lineWidth=2;this.bufferCtx.strokeRect(this.startCoords[0],this.startCoords[1],c,b);this.bufferCtx.strokeStyle="#000000";this.bufferCtx.lineWidth=1;this.bufferCtx.strokeRect(this.startCoords[0],this.startCoords[1],c,b);return false;case"Lasso":case"Additive Lasso":case"Subtractive Lasso":this.lassoPoints.push(f);this.bufferCtx.clear();this.bufferCtx.strokeStyle="#000000";this.bufferCtx.lineWidth=1;var a=this.lassoPoints[0];this.bufferCtx.beginPath();this.bufferCtx.moveTo(a[0],a[1]);for(var d=1;d<this.lassoPoints.length;d++){a=this.lassoPoints[d];this.bufferCtx.lineTo(a[0],a[1])}this.bufferCtx.stroke();break}},endDraw:function(c){var d;if((this.subbrush=="Marquee"||this.subbrush=="Lasso")&&this.isMicroSelection){getManager().selectionManager.deselect()}else{switch(this.subbrush){case"Marquee":case"Additive Marquee":case"Subtractive Marquee":var b=c[0]-this.startCoords[0];var a=c[1]-this.startCoords[1];d=((this.shiftStroke)||(this.subbrush!="Subtractive Marquee"))&&!this.altStroke;getManager().selectionManager.squareSelect(this.startCoords[0],this.startCoords[1],b,a,d);break;case"Lasso":case"Additive Lasso":case"Subtractive Lasso":d=((this.shiftStroke)||(this.subbrush!="Subtractive Lasso"))&&!this.altStroke;getManager().selectionManager.pathSelect(this.lassoPoints,d);this.lassoPoints=null;break}}this.bufferCtx.clear();getManager().layerManager.setZIndices();return false},recordStart:function(a){a.startInstruction(RDInst.BRUSH,[this.options.name,this.subbrush])},recordPlayMeta:function(a){this.subBrush(a[1])}});if(window.DWait){DWait.run("jms/pages/drawplz/brushes/marqueeSelection.js")}window.MoveTool=BrushBase.extend({options:{name:"Move",wacom:false,ie:false,ie9:true,handlesOwnSelection:true,inToolbar:false,defaultModifiers:false},constructor:function(b,a,d,c){this.base(b,a,d,c);this.cursorImage=new Image();this.cursorImage.src="http://st.deviantart.net/minish/canvasdraw/brushassets/move_cursor.png?2"},getCursorSize:function(){return(36/this.bean.getScale())},customCursor:function(a){a.globalAlpha=1;a.drawImage(this.cursorImage,11,11)},setTool:function(){$(".toolbutton").removeClass("toolbuttonActive");$(".toolbutton[title=Move]").addClass("toolbuttonActive")},brushPreview:function(a){$(".brushPicker .brushPickerCover").show()},startDraw:function(a,b){this.startCoords=a;this.scale=this.bean.getScale();this.bufferCtx.clear();this.bufferCtx.drawImage(this.ctx.obj.canvas.get(0),0,0);this.selMgr=getManager().selectionManager;this.hasSel=this.selMgr.hasSelection;if(this.hasSel){this.bufferCtx.globalCompositeOperation="destination-out";this.bufferCtx.drawImage(getManager().selectionManager.selDom,0,0);this.bufferCtx.globalCompositeOperation="source-over";getManager().selectionManager.clear(false)}else{this.ctx.obj.canvas.hide()}},moveDraw:function(c,d){var b=Math.round((c[0]-this.startCoords[0])*this.scale);var a=Math.round((c[1]-this.startCoords[1])*this.scale);this.bufferCtx.obj.canvas.css("left",b+"px").css("top",a+"px");if(this.hasSel){this.selMgr.antsCanvas.canvas.css("left",b+"px").css("top",a+"px")}return false},endDraw:function(c){var b=Math.round(c[0]-this.startCoords[0]);var a=Math.round(c[1]-this.startCoords[1]);if(!this.hasSel){this.ctx.clear();this.ctx.obj.canvas.show();this.selMgr.antsCanvas.canvas.css("left","0px").css("top","0px")}else{this.selMgr.moveSelection(b,a)}this.ctx.drawImage(this.bufferCtx.obj.canvas.get(0),b,a);this.bufferCtx.clear();this.bufferCtx.obj.canvas.css("left","0px").css("top","0px");this.selMgr=this.hasSel=null;this.minX=this.minY=0;this.maxX=mgr.width;this.maxY=mgr.height;return false},recordStart:function(a){a.startInstruction(RDInst.BRUSH,[this.options.name])},recordPlayMeta:function(a){}});if(window.DWait){DWait.run("jms/pages/drawplz/brushes/moveTool.js")}var HandTool=BrushBase.extend({options:{name:"Hand Tool",wacom:false,ie:false,ie9:true,inToolbar:false,shouldUndo:false},constructor:function(b,a,d,c){this.base(b,a,d,c);this.cursorImage=new Image();this.cursorImage.src="http://st.deviantart.net/minish/canvasdraw/brushassets/hand_cursor.png"},setTool:function(){},getCursorSize:function(){return(36/this.bean.getScale())},customCursor:function(a){a.globalAlpha=1;a.drawImage(this.cursorImage,0,0)},init:function(){},brushPreview:function(a){$(".brushPicker .brushPickerCover").show()},startDraw:function(a){this.startCoords=a;this.startNavPan=[mgr.zoomManager.navPanLeft,mgr.zoomManager.navPanTop];this.scale=mgr.bean.getScale();return false},moveDraw:function(b){var a=mgr.zoomManager;a.setNavPan(this.startNavPan[0]+(a.navScale*(this.startCoords[0]-b[0])),this.startNavPan[1]+(a.navScale*(this.startCoords[1]-b[1])));return false},endDraw:function(a){this.startCoords=null;return false}});if(window.DWait){DWait.run("jms/pages/drawplz/brushes/handTool.js");
/*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}window.SmudgeBrush=BrushBase.extend({options:{name:"Blending",wacom:true,ie:false,ie9:true,defaultSettings:[15,1,0.5],effectLabel:"Smear",maskBuffers:["bufferCtx"],minMaxWidth:80,handlesOwnSelection:true,inToolbar:false},setTool:function(){$(".toolbutton").removeClass("toolbuttonActive");$(".toolbutton[title=Blending]").addClass("toolbuttonActive")},brushInit:function(a){},getCursorSize:function(){return this.bean.getBrushSize()*3},brushPreview:function(a){this.setLineStyle();this.imageData=null;this.brushCtx.lineWidth=10;var b=mgr.$mainNode.find(".brushPreviewCanvas").width();var d=mgr.$mainNode.find(".brushPreviewCanvas").height();for(var c=-1*d+5;c<b;c=c+20){this.brushCtx.strokeStyle=this.getRGBA("000000",1);this.brushCtx.beginPath();this.brushCtx.moveTo(c,0);this.brushCtx.lineTo(c+d,d);this.brushCtx.stroke();this.brushCtx.strokeStyle=this.getRGBA("ffffff",1);this.brushCtx.beginPath();this.brushCtx.moveTo(c+5,0);this.brushCtx.lineTo(c+d+5,d);this.brushCtx.stroke()}for(c=0;c<100;c=c+3){coord=[];coord[0]=c;coord[1]=26;coord[2]=Math.pow(c/100,0.25);coord[3]=[0,0];this.stroke(this.brushCtx,coord)}},setLineStyle:function(){this.radius=Math.ceil(mgr.bean.getBrushSize()*1.5);this.diameter=this.radius*2;this.lift=(1-mgr.bean.getBrushHardness()+0.01)*2},startDraw:function(a){this.setLineStyle();this.base(a);this.imageData=null;this.lc=[a[0],a[1],a[2]];return false},moveDraw:function(f){var j=f[0]-this.lc[0];var h=f[1]-this.lc[1];var b=f[2]-this.lc[2];var a=Math.pow(j*j+h*h,0.5);var g=2;if(a>g){for(var c=g;c<a;c=c+g){var d=c/a;var e=[Math.round(this.lc[0]+d*j),Math.round(this.lc[1]+d*h),Math.max(0,Math.min(1,this.lc[2]+d*b))];this.stroke(this.ctx,e)}this.lc=[f[0],f[1],f[2]]}else{this.stroke(this.ctx,[Math.round(f[0]),Math.round(f[1]),f[2]])}},endDraw:function(a){if(this.hasSel){this.ctx.drawImage(this.stgDom,0,0);this.stgCtx.clear()}this.stgCtx=this.stgDom=this.hasSel=this.selDom=null;return false},stroke:function(w,v){var m,l,a,t,e,p,n,h,g,f,c,b,k,u,q;a=this.radius;t=this.diameter;u=mgr.selectionManager.hasSelection&&(w==this.ctx);q=!u?null:mgr.selectionManager.selCanvas.context.getImageData(v[0]-a,v[1]-a,t,t);k=w.getImageData(v[0]-a,v[1]-a,t,t);b=this.lift*Math.pow(v[2],3);if(!this.imageData){this.imageData=k;return}e=this.imageData.data;for(m=0;m<t;m++){p=Math.pow(m-a,2);c=m*t;for(l=0;l<t;l++){n=4*(c+l);h=Math.max(a-Math.pow(p+Math.pow(l-a,2),0.5),0.1)/a;g=b*h;if(u){g*=1-q.data[n+3]/255}f=g+1;e[n]=(e[n]*g+k.data[n])/f;e[n+1]=(e[n+1]*g+k.data[n+1])/f;e[n+2]=(e[n+2]*g+k.data[n+2])/f;e[n+3]=(e[n+3]*g+k.data[n+3])/f}}w.putImageData(this.imageData,Math.round(v[0]-a),Math.round(v[1]-a))},recordStart:function(a){a.startInstruction(RDInst.BRUSH,[this.options.name,mgr.bean.getBrushOpacity(),mgr.bean.getBrushSize(),mgr.bean.getBrushHardness(),])},recordPlayMeta:function(a){mgr.bean.setBrushOpacity(a[1]);mgr.bean.setBrushSize(a[2]);mgr.bean.setBrushHardness(a[3])}});if(window.DWait){DWait.run("jms/pages/drawplz/brushes/smudge.js");
/*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
}window.FilterManager=Base.extend({constructor:function(){this.logger=new StdLogger("Filter");this.bean=getManager().bean;this.filter="BlurFilter";this.processingFilter=false},changeFilter:function(a){a=a||window.event;this.filter=a.target.value},applyFilter:function(completeFunc){if(this.processingFilter){return}this.processingFilter=true;var $modal,filter,amt="";switch(this.filter){case"NoiseFilter":if(!amt){amt="0.1"}case"DecreaseContrastFilter":case"IncreaseContrastFilter":case"LightenFilter":case"DarkenFilter":if(!amt){amt="0.05"}default:filter=eval("new "+this.filter+"("+amt+")")}var isslowStr=filter.isSlow?"s":"f";var rdw;if(filter.isSlow){var rdw=mgr.bean.getRDWriter().startInstruction(RDInst.FLUSH,["Applying Filter","Applying "+filter.name])}else{var rdw=mgr.bean.getRDWriter().startInstruction(RDInst.FILTER,[this.filter,isslowStr])}try{var l=this.bean.getSelectedLayer();var c=l.getContext();var pixels=c.getPixelData();var $bar,filterProcessor,lastMessageAt=(new Date()).getTime();if(filter.isSlow){$modal=$($(".filtersModal").get(0).cloneNode(true));$modal.find(".titlePart h1").html("Applying the "+filter.name);$bar=$modal.find(".progressbar .bar").width(0);Modals.push($modal.get(0),bind(this,function(action){switch(action){case"cancel":if(!filterProcessor.isCompleted){filterProcessor.stop()}filterProcessor=null;break}this.processingFilter=false}),ModalManager.MODAL_CLASS);var initObj={onComplete:bind(this,function(success){$bar.width("100%");if(success){filter.applyResultTo(pixels);this.pastePixels(pixels);Modals.pop("ok")}if(window.console&&window.console.timeEnd){window.console.timeEnd(this.filter)}this.processingFilter=false;this.bean.getSelectedLayer().setChangeStamp();getManager().undoManager.push();rdw.pushInstruction();if(completeFunc){completeFunc(success)}}),onStep:function(idx){filter.deviatePixel(pixels,idx)},onChunk:function(idx,total){$bar.width((((idx/total)*100)|0)+"%");var t=(new Date).getTime();if(t-lastMessageAt>2400){lastMessageAt=t;var msgs=["Almost there!","Painting pixels...","Pushing the progressbar!","*whistles*",'
                Adding to < a href = "http://browse.deviantart.com/?order=15" > popular art on dA < /a>',"Ordering some nachos","Zzzzzzzzz....","Making witty comments...","Making sure this works...","Counting bits...","Adding some final touches...","Messing with the red channel...","Cheering up blue pixels...","Adding some awesomeness...","Calculating PI... mmm, pie....","Polishing each pixel...","Handpicking best pixels...","Making green more deviant-green...","Starting over... just kidding ;)","What would Tron guy do here?","Singing some pixel blues...","Adding to random deviant's favourites...","Trying to make your CPU faster...","Decreasing cheesy factor...","Waiting for the color to dry...","Fixing Hyperdrive Motivator","Gaga, ooh la la","Anybody wanna peanut?"];var fadeSpeed=Browser.isTouch?0:"fast";$modal.find(".talkmessage .message").fadeTo(fadeSpeed,0,function(){$(this).html(msgs[(Math.random()*msgs.length)|0]).fadeTo(Browser.isTouch?0:"slow",1)})}},totalSteps:pixels.data.length>>2,interval:Browser.isTouch?50:1};if(filter.suggestedChunkSize){initObj.chunkSize=filter.suggestedChunkSize}filterProcessor=new DTask(initObj);if(window.console&&window.console.time){window.console.time(this.filter)}filterProcessor.start()}else{if(window.console&&window.console.time){window.console.time(this.filter)}filter.deviatePixels(pixels);if(window.console&&window.console.timeEnd){window.console.timeEnd(this.filter)}this.pastePixels(pixels);this.bean.getSelectedLayer().setChangeStamp();getManager().undoManager.push();rdw.pushInstruction();this.processingFilter=false}}catch(e){this.logger.log("ERROR IN FILTER!!!!",e);this.processingFilter=false;if($modal){$modal.find(".leftImage img").attr("http:/ / st.deviantart.net / minish / canvasdraw / modals / yellow_frown.png ");$modal.find(".talkmessage.message ").html("
                Error: "+e.message)}}},random:function(){var a;var b=mgr.bean.getRDWriter();if(!b.isStub){return b.getRandom()}else{if(a=mgr.bean.getRDReader()){return a.getRandom()}else{return Math.random()}}},pastePixels:function(b){if(window.SelectionManager&&getManager().selectionManager.hasSelection){var a=getManager().bean.getBufferCtx();a.clear();a.setPixelData(b);a.globalCompositeOperation="
                destination - out ";a.drawImage(getManager().selectionManager.selCanvas.canvas.get(0),0,0);a.globalCompositeOperation="
                source - over ";getManager().selectionManager.clear();getManager().bean.getSelectedLayer().getContext().drawImage(a.canvas,0,0);a.clear()}else{getManager().bean.getSelectedLayer().getContext().setPixelData(b)}}});if(window.DWait){DWait.run("
                jms / pages / drawplz / filterManager.js ")}DWait.ready(["
                jms / lib / Base.js ","
                jms / lib / StdLogger.js ","
                jms / lib / jquery / plugins / jquery.getimagedata.js ","
                jms / lib / dragger.js ","
                jms / pages / submit / DndDeck.js ","
                jms / pages / drawplz / slider.js "],function(){window.ImageImporter=Base.extend({constructor:function(){this.A=0.3857;this.B=2.4079;this.C=0.2857;this.E=2.71828;this.logger=new StdLogger("
                Image...()
                } else {
                    this.clearTimers();
                    this.playTimer = setTimeout(this.playIfReady.bindTo(this), 200)
                }
            }, dontPlayIfReady: function () {
                if (this.isPlayReady()) {
                    $(".rdControls .playButton").addClass("playButtonReady");
                    var a = this.getRdr();
                    a.stop()
                } else {
                    this.clearTimers();
                    this.playTimer = setTimeout(this.dontPlayIfReady.bindTo(this), 200)
                }
            }, play: function () {
                var a = mgr.bean.getPlaybackFrame();
                if (mgr.layoutManager.getAppType() == APP_TYPE_EMBEDDED || mgr.layoutManager.getAppType() == APP_TYPE_CINEMA) {
                    if (!mgr.$mainNode.find(".canvasContainer").is(":visible")) {
                        mgr.$mainNode.find(".canvasContainer").show()
                    }
                    mgr.$mainNode.find(".embedCover").remove()
                }
                var b = this.getRdr();
                if (a >= this.keyframes.length) {
                    b.stop();
                    mgr.zoomManager.fitToScreen();
                    if (!mgr.isEmbedded) {
                        this.pauseDrawer()
                    }
                    return
                }
                if (!a) {
                    this.loadFrame(0, true);
                    return
                }
                if (!this.isPlayReady()) {
                    $(".rdControls .playButton").removeClass("playButtonReady");
                    b.stop();
                    this.clearTimers();
                    this.playTimer = setTimeout(this.playIfReady.bindTo(this), 200)
                } else {
                    $(".rdControls .playButton").addClass("playButtonReady");
                    this._play()
                }
            }, _play: function () {
                var b = this.getRdr();
                if (b.asyncPause) {
                    this.logger.log("Async Pause");
                    this.clearTimers();
                    this.asyncTimer = setTimeout(this._play.bindTo(this), 100);
                    return
                }
                var a = mgr.bean.getPlaybackFrame();
                b.playback(this.keyframes[a].instructions, function () {
                    this.preload(a);
                    if (!this.doubleCheckLayers(a)) {
                        b.stop();
                        return
                    }
                    if (this.playbackFrame < this.keyframes.length - 1) {
                        mgr.bean.setPlaybackFrame(a + 1);
                        this.play()
                    } else {
                        mgr.bean.getRDReader().stop();
                        mgr.zoomManager.fitToScreen();
                        this.pauseDrawer()
                    }
                }.bindTo(this))
            }, needUndoPush: function () {
                try {
                    var d = 0;
                    var b = 0;
                    var c = mgr.bean.getPlaybackFrame();
                    var g = this.getRdr().instructionPtr;
                    if (!this.keyframes || !this.keyframes.length || !this.keyframes[c]) {
                        return true
                    }
                    if (typeof this.keyframes[c].instructions == "string") {
                        try {
                            this.keyframes[c].instructions = JSON.parse(this.keyframes[c].instructions)
                        } catch (f) {
                            this.logger.log("Error parsing json: ", this.keyframes[c].instructions);
                            this.keyframes[c].instructions = [
                                [0, "err", "corrupt json", [], 0]
                            ]
                        }
                    }
                    var a = this.keyframes[c].instructions;
                    while (d <= mgr.undoManager.MAX_LEVELS) {
                        if (g >= a.length) {
                            c++;
                            if (c >= this.keyframes.length) {
                                return false
                            }
                            g = 0;
                            if (typeof this.keyframes[c].instructions == "string") {
                                try {
                                    this.keyframes[c].instructions = JSON.parse(this.keyframes[c].instructions)
                                } catch (f) {
                                    this.logger.log("Error parsing json: ", this.keyframes[c].instructions);
                                    this.keyframes[c].instructions = [
                                        [0, "err", "corrupt json", [], 0]
                                    ]
                                }
                            }
                            a = this.keyframes[c].instructions
                        }
                        if (!a[g]) {
                            return true
                        }
                        switch (a[g][RDINDEX.NAME_INDEX]) {
                        case RDInst.UNDO:
                            if (--b <= 1) {
                                return true
                            }
                            break;
                        case RDInst.BRUSH:
                            switch (a[g][RDINDEX.META_INDEX]) {
                            case "Eye Dropper":
                            case "Hand Tool":
                                break;
                            case "Selection":
                            case "Move":
                            case "Flood Fill":
                            case "Eraser":
                            case "Blending":
                            default:
                                b++;
                                d++;
                                break
                            }
                            break;
                        case RDInst.LAYER:
                        case RDInst.SELECTION:
                        case RDInst.FILTER:
                        case RDInst.FLUSH:
                            b++;
                            d++;
                            break;
                        case RDInst.TOOLMANAGER:
                        case RDInst.ZOOM:
                            break;
                        case RDInst.ERROR:
                        default:
                            this.logger.log("Error/default true: ", a[g][RDINDEX.NAME_INDEX]);
                            return true;
                            break
                        }
                        g++
                    }
                    return false
                } catch (f) {
                    this.logger.log("Error in checking undo push: ", f);
                    return true
                }
            }, pauseDrawer: function () {
                if (!mgr.pauseDrawer) {
                    $(".pauseDrawer").hide();
                    return
                }
                if (mgr.bean.getPlaybackFrame() < this.keyframes.length) {
                    $(".pauseDrawer .resumeButton").show();
                    $(".pauseDrawer .replayButton").hide()
                } else {
                    $(".pauseDrawer .resumeButton").hide();
                    $(".pauseDrawer .replayButton").show()
                }
                $(".pauseDrawer").css("height", "82px")
            }
            });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/recordedDrawingPlayback.js")
        }
        window.ChangestampPreloader = Base.extend({
            constructor: function () {
                this.logger = new StdLogger("Changestamp Preloader");
                this.preloadStack = [];
                this.images = [];
                this.fetching = false;
                this.FETCH_TIMEOUT = 3000
            },
            preload: function (c, a) {
                c = parseInt(c);
                if (isSpecialChangestamp(c)) {
                    return
                }
                for (var b = 0; b < this.images.length; b++) {
                    if (this.images[b][0] == c) {
                        return
                    }
                }
                if (!a) {
                    this.images.push([c, false]);
                    return
                }
                this.preloadStack.push([c, a]);
                this.fetch()
            },
            getImage: function (b) {
                b = parseInt(b);
                for (var a = 0; a < this.images.length; a++) {
                    if (this.images[a][0] == b) {
                        return this.images[a][1]
                    }
                }
                return null
            },
            fetch: function () {
                if (this.fetching || !this.preloadStack.length) {
                    return
                }
                var b = this.preloadStack.shift();
                var d = parseInt(b[0]);
                var a = mgr.imageImporter.convertURL(b[1]);
                var c = new Image();
                $(c).attr("title", d);
                c.onload = function () {
                    this.images.push([d, c]);
                    this.fetching = false;
                    clearTimeout(this.fetchTimeout);
                    this.fetch()
                }.bindTo(this);
                this.fetching = true;
                this.fetchTimeout = setTimeout(this.giveUp.bindTo(this), this.FETCH_TIMEOUT);
                $(c).attr("src", a)
            },
            clearExcept: function (a) {
                var c, b;
                var d;
                for (c = this.images.length - 1; c >= 0; c--) {
                    d = false;
                    for (b = 0; b < a.length; b++) {
                        if (parseInt(a[b]) == this.images[c][0]) {
                            d = true;
                            break
                        }
                    }
                    if (!d) {
                        this.images.splice(c, 1)
                    }
                }
                for (c = this.preloadStack.length - 1; c >= 0; c--) {
                    d = false;
                    for (b = 0; b < a.length; b++) {
                        if (parseInt(a[b]) == this.preloadStack[c][0]) {
                            d = true;
                            break
                        }
                    }
                    if (!d) {
                        this.preloadStack.splice(c, 1)
                    }
                }
            },
            giveUp: function () {
                this.fetching = false;
                this.fetch()
            }
        });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/changestampPreloader.js")
        }
        DWait.count();