/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.SelectionManager = Base.extend({
    constructor: function () {
        this.logger = new StdLogger("Selection Manager");
        this.bean = getManager().bean;
        this.mainNode = this.bean.getMainNode();
        this.stepsize = 10;
        this.hasSelection = false;
        this.clipboardData = false;
        this.selectionChangestamp = 0;
        this.reset();
        this.bean.subscribe("selectedLayer", function () {
            this.fixBrushCtx(this.hasSelection)
        }.bindTo(this));
        this.bean.subscribe("brush", function () {
            this.fixBrushCtx(this.hasSelection)
        }.bindTo(this))
    },
    reset: function () {
        this.width = mgr.width;
        this.height = mgr.height;
        this.selCanvas = new Canvas($(this.mainNode).find(".selectionCanvas").get(0));
        this.selCanvas.init(this.width, this.height, true);
        this.selCtx = this.selCanvas.context;
        this.selDom = this.selCanvas.canvas.get(0);
        this.antsCanvas = new Canvas($(this.mainNode).find(".marchingAnts").get(0));
        this.antsCanvas.init(this.width, this.height, true);
        this.antsCtx = this.antsCanvas.context;
        this.antOffset = 0;
        if (this.clipboardData) {
            this.clipboardData.rect.x = 0;
            this.clipboardData.rect.y = 0
        }
        this.deselect()
    },
    getSelectionRectangle: function () {
        if (this.hasSelection) {
            return {
                x: this.minX,
                y: this.minY,
                width: this.maxX - this.minX,
                height: this.maxY - this.minY
            }
        }
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    },
    getClipboardData: function () {
        return this.clipboardData
    },
    clearClipboardData: function () {
        this.clipboardData = false
    },
    setClipboardData: function (b, a) {
        this.clipboardData = {
            pixelData: b,
            rect: a,
            handDrawn: mgr.bean.getHandDrawn()
        }
    },
    getInverseMask: function () {
        if (!this.inverseCanvas) {
            this.inverseCanvas = new Canvas(document.createElement("canvas"))
        }
        this.inverseCanvas.init(this.width, this.height, true);
        var a = this.inverseCanvas.context;
        a.globalCompositeOperation = "source-over";
        a.fillStyle = "#000000";
        a.fillRect(0, 0, this.width, this.height);
        a.globalCompositeOperation = "xor";
        a.drawImage(this.selCanvas.canvas.get(0), 0, 0);
        return this.inverseCanvas
    },
    selectInverse: function () {
        if (!this.hasSelection) {
            return
        }
        var a = mgr.bean.getRDWriter().startInstruction(RDInst.SELECTION, "inv");
        this.selCtx.globalCompositeOperation = "xor";
        this.selCtx.fillStyle = "#000000";
        this.selCtx.fillRect(0, 0, this.width, this.height);
        this.selCtx.globalCompositeOperation = "source-over";
        this.makeMarchingAnts();
        a.pushInstruction()
    },
    squareSelect: function (a, e, b, c, d) {
        if (d) {
            this.selCtx.clearRect(a, e, b, c)
        } else {
            this.selCtx.fillStyle = "#000000";
            this.selCtx.fillRect(a, e, b, c)
        }
        this.makeMarchingAnts()
    },
    pathSelect: function (c, d) {
        if (d) {
            this.selCtx.globalCompositeOperation = "destination-out"
        } else {
            this.selCtx.globalCompositeOperation = "source-over"
        }
        this.selCtx.fillStyle = "rgba(0, 0, 0, 1)";
        var a = c[0];
        this.selCtx.beginPath();
        this.selCtx.moveTo(a[0], a[1]);
        for (var b = 1; b < c.length; b++) {
            a = c[b];
            this.selCtx.lineTo(a[0], a[1])
        }
        this.selCtx.fill();
        this.selCtx.globalCompositeOperation = "source-over";
        this.makeMarchingAnts()
    },
    fixBrushCtx: function (b) {
        try {
            var a = this.bean.getBrush();
            if (!b || a.options.handlesOwnSelection || !this.bean.getIsHTML5()) {
                a.ctx = this.bean.getSelectedLayer().getContext()
            } else {
                a.ctx = this.bean.getStagingCtx()
            }
        } catch (c) {}
    },
    deselect: function () {
        var a = mgr.bean.getRDWriter().startInstruction(RDInst.SELECTION, "des");
        this.selCtx.fillStyle = "#000000";
        this.selCtx.fillRect(0, 0, this.width, this.height);
        this.hasSelection = false;
        this.selectionChangestamp = 0;
        this.fixBrushCtx(false);
        this.antsCtx.clear();
        this.rebuildAntCanvas();
        this.animateAnts();
        a.pushInstruction()
    },
    selectAll: function () {
        var a = mgr.bean.getRDWriter().startInstruction(RDInst.SELECTION, "sall");
        this.selCtx.clearRect(0, 0, this.width, this.height);
        this.fixBrushCtx(true);
        this.makeMarchingAnts();
        this.hasSelection = true;
        this.selectionChangestamp = new Date().getTime();
        a.pushInstruction()
    },
    selectFromImage: function (a) {
        this.selCtx.clear();
        this.selCtx.drawImage(a, 0, 0);
        this.fixBrushCtx(true);
        this.makeMarchingAnts();
        this.hasSelection = true;
        this.selectionChangestamp = new Date().getTime()
    },
    moveSelection: function (c, b) {
        var a = this.getInverseMask();
        this.deselect();
        this.selCtx.globalCompositeOperation = "destination-out";
        this.selCtx.drawImage(a.canvas.get(0), c, b);
        this.selCtx.globalCompositeOperation = "source-over";
        this.makeMarchingAnts()
    },
    rebuildAntCanvas: function () {
        var b = this.antsCanvas.canvas.css("z-index");
        var c = this.antsCanvas.canvas.parent();
        this.antsCanvas.canvas.remove();
        var a = $('<canvas class="marchingAnts"></canvas>').appendTo(c);
        this.antsCanvas = new Canvas(a);
        this.antsCanvas.init(this.width, this.height, true);
        this.antsCtx = this.antsCanvas.context;
        this.antsCanvas.canvas.css("z-index", b)
    },
    makeMarchingAnts: function () {
        this.hasSelection = false;
        this.selectionChangestamp = 0;
        this.fixBrushCtx(false);
        var g = this.selCtx.getPixelData();
        this.rebuildAntCanvas();
        var c = this.antsCtx.getPixelData();
        this.minX = this.width;
        this.maxX = 0;
        this.minY = this.height;
        this.maxY = 0;
        var b, d, k, h;
        var a = [];
        var f, e;
        for (f = 0; f < this.width; f++) {
            a[f] = 255
        }
        for (e = 0; e < this.height - 1; e++) {
            k = 255;
            for (f = 0; f < this.width; f++) {
                h = k;
                k = (f < this.width - 1) ? g.data[((e * this.width + f + 1) << 2) + 3] : 255;
                if (((h < 128) && ((k >= 128) || (a[f] >= 128))) || ((h >= 128) && ((k < 128) || (a[f] < 128)))) {
                    this.antsCtx.setPixel(c, f, e, [0, 0, 0, 255]);
                    this.minX = Math.min(this.minX, f);
                    this.maxX = Math.max(this.maxX, f + 1);
                    this.minY = Math.min(...sso ":this.startCoords=a;this.bufferCtx.obj.canvas.css("
                    z - index ",getManager().selectionManager.antsCanvas.canvas.css("
                    z - index ")+1);break}switch(this.subbrush){case"
                    Lasso ":case"
                    Additive Lasso ":case"
                    Subtractive Lasso ":this.lassoPoints=[];this.lassoPoints.push(a);break}},moveDraw:function(f,g){var c=f[0]-this.startCoords[0];var b=f[1]-this.startCoords[1];if(c*c+b*b>16){this.isMicroSelection=false}switch(this.subbrush){case"
                    Marquee ":case"
                    Additive Marquee ":case"
                    Subtractive Marquee ":this.bufferCtx.clear();this.bufferCtx.strokeStyle="#ffffff ";this.bufferCtx.lineWidth=2;this.bufferCtx.strokeRect(this.startCoords[0],this.startCoords[1],c,b);this.bufferCtx.strokeStyle="
                    #000000";this.bufferCtx.lineWidth= 1; this.bufferCtx.strokeRect(this.startCoords[0], this.startCoords[1], c, b);
                    return false;
                case "Lasso":
                case "Additive Lasso":
                case "Subtractive Lasso":
                    this.lassoPoints.push(f); this.bufferCtx.clear(); this.bufferCtx.strokeStyle = "#000000"; this.bufferCtx.lineWidth = 1;
                    var a = this.lassoPoints[0]; this.bufferCtx.beginPath(); this.bufferCtx.moveTo(a[0], a[1]);
                    for (var d = 1; d < this.lassoPoints.length; d++) {
                        a = this.lassoPoints[d];
                        this.bufferCtx.lineTo(a[0], a[1])
                    }
                    this.bufferCtx.stroke();
                    break
                    }
                }, endDraw: function (c) {
                    var d;
                    if ((this.subbrush == "Marquee" || this.subbrush == "Lasso") && this.isMicroSelection) {
                        getManager().selectionManager.deselect()
                    } else {
                        switch (this.subbrush) {
                        case "Marquee":
                        case "Additive Marquee":
                        case "Subtractive Marquee":
                            var b = c[0] - this.startCoords[0];
                            var a = c[1] - this.startCoords[1];
                            d = ((this.shiftStroke) || (this.subbrush != "Subtractive Marquee")) && !this.altStroke;
                            getManager().selectionManager.squareSelect(this.startCoords[0], this.startCoords[1], b, a, d);
                            break;
                        case "Lasso":
                        case "Additive Lasso":
                        case "Subtractive Lasso":
                            d = ((this.shiftStroke) || (this.subbrush != "Subtractive Lasso")) && !this.altStroke;
                            getManager().selectionManager.pathSelect(this.lassoPoints, d);
                            this.lassoPoints = null;
                            break
                        }
                    }
                    this.bufferCtx.clear();
                    getManager().layerManager.setZIndices();
                    return false
                },
                recordStart: function (a) {
                    a.startInstruction(RDInst.BRUSH, [this.options.name, this.subbrush])
                },
                recordPlayMeta: function (a) {
                    this.subBrush(a[1])
                }
            });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/brushes/marqueeSelection.js")
        }
        window.MoveTool = BrushBase.extend({
            options: {
                name: "Move",
                wacom: false,
                ie: false,
                ie9: true,
                handlesOwnSelection: true,
                inToolbar: false,
                defaultModifiers: false
            },
            constructor: function (b, a, d, c) {
                this.base(b, a, d, c);
                this.cursorImage = new Image();
                this.cursorImage.src = "http://st.deviantart.net/minish/canvasdraw/brushassets/move_cursor.png?2"
            },
            getCursorSize: function () {
                return (36 / this.bean.getScale())
            },
            customCursor: function (a) {
                a.globalAlpha = 1;
                a.drawImage(this.cursorImage, 11, 11)
            },
            setTool: function () {
                $(".toolbutton").removeClass("toolbuttonActive");
                $(".toolbutton[title=Move]").addClass("toolbuttonActive")
            },
            brushPreview: function (a) {
                $(".brushPicker .brushPickerCover").show()
            },
            startDraw: function (a, b) {
                this.startCoords = a;
                this.scale = this.bean.getScale();
                this.bufferCtx.clear();
                this.bufferCtx.drawImage(this.ctx.obj.canvas.get(0), 0, 0);
                this.selMgr = getManager().selectionManager;
                this.hasSel = this.selMgr.hasSelection;
                if (this.hasSel) {
                    this.bufferCtx.globalCompositeOperation = "destination-out";
                    this.bufferCtx.drawImage(getManager().selectionManager.selDom, 0, 0);
                    this.bufferCtx.globalCompositeOperation = "source-over";
                    getManager().selectionManager.clear(false)
                } else {
                    this.ctx.obj.canvas.hide()
                }
            },
            moveDraw: function (c, d) {
                var b = Math.round((c[0] - this.startCoords[0]) * this.scale);
                var a = Math.round((c[1] - this.startCoords[1]) * this.scale);
                this.bufferCtx.obj.canvas.css("left", b + "px").css("top", a + "px");
                if (this.hasSel) {
                    this.selMgr.antsCanvas.canvas.css("left", b + "px").css("top", a + "px")
                }
                return false
            },
            endDraw: function (c) {
                var b = Math.round(c[0] - this.startCoords[0]);
                var a = Math.round(c[1] - this.startCoords[1]);
                if (!this.hasSel) {
                    this.ctx.clear();
                    this.ctx.obj.canvas.show();
                    this.selMgr.antsCanvas.canvas.css("left", "0px").css("top", "0px")
                } else {
                    this.selMgr.moveSelection(b, a)
                }
                this.ctx.drawImage(this.bufferCtx.obj.canvas.get(0), b, a);
                this.bufferCtx.clear();
                this.bufferCtx.obj.canvas.css("left", "0px").css("top", "0px");
                this.selMgr = this.hasSel = null;
                this.minX = this.minY = 0;
                this.maxX = mgr.width;
                this.maxY = mgr.height;
                return false
            },
            recordStart: function (a) {
                a.startInstruction(RDInst.BRUSH, [this.options.name])
            },
            recordPlayMeta: function (a) {}
        });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/brushes/moveTool.js")
        }
        window.SlotList = Base.extend({
            constructor: function (b, c, a) {
                this.logger = new StdLogger("SlotList");
                this.$node = jQuery(b);
                this.reset()
            },
            reset: function () {
                this.slots = [];
                this.empty()
            },
            setSlotItems: function (a) {
                this.slots = [];
                for (var b = 0; b < a.length; ++b) {
                    this.slots.push(a[b])
                }
            },
            empty: function () {
                this.$node.empty()
            },
            renderSlots: function (f, d, a) {
                a = parseInt(a) || this.slots.length;
                var e = jQuery.extend({}, d),
                    b = mgr.templateManager,
                    g;
                for (var c = 0; c < this.slots.length; ++c) {
                    if (c >= a) {
                        break
                    }
                    if (g = b.processTemplate(f, jQuery.extend(e, this.slots[c]))) {
                        this.$node.append(g)
                    } else {
                        this.logger.log("Error processing template '" + f + "'", this.slots[1])
                    }
                }
            }
        });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/slotList.js");
            /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
// | This source file is bound by United States copyright law. |
// +----------------------------------------------------------------------+
*/
        }
        window.FilterManager = Base.extend({
            constructor: function () {
                this.logger = new StdLogger("Filter");
                this.bean = getManager().bean;
                this.filter = "BlurFilter";
                this.processingFilter = false
            },
            changeFilter: function (a) {
                a = a || window.event;
                this.filter = a.target.value
            },
            applyFilter: function (completeFunc) {
                if (this.processingFilter) {
                    return
                }
                this.processingFilter = true;
                var $modal, filter, amt = "";
                switch (this.filter) {
                case "NoiseFilter":
                    if (!amt) {
                        amt = "0.1"
                    }
                case "DecreaseContrastFilter":
                case "IncreaseContrastFilter":
                case "LightenFilter":
                case "DarkenFilter":
                    if (!amt) {
                        amt = "0.05"
                    }
                default:
                    filter = eval("new " + this.filter + "(" + amt + ")")
                }
                var isslowStr = filter.isSlow ? "s" : "f";
                var rdw;
                if (filter.isSlow) {
                    var rdw = mgr.bean.getRDWriter().startInstruction(RDInst.FLUSH, ["Applying Filter", "Applying " + filter.name])
                } else {
                    var rdw = mgr.bean.getRDWriter().startInstruction(RDInst.FILTER, [this.filter, isslowStr])
                }
                try {
                    var l = this.bean.getSelectedLayer();
                    var c = l.getContext();
                    var pixels = c.getPixelData();
                    var $bar, filterProcessor, lastMessageAt = (new Date()).getTime();
                    if (filter.isSlow) {
                        $modal = $($(".filtersModal").get(0).cloneNode(true));
                        $modal.find(".titlePart h1").html("Applying the " + filter.name);
                        $bar = $modal.find(".progressbar .bar").width(0);
                        Modals.push($modal.get(0), bind(this, function (action) {
                            switch (action) {
                            case "cancel":
                                if (!filterProcessor.isCompleted) {
                                    filterProcessor.stop()
                                }
                                filterProcessor = null;
                                break
                            }
                            this.processingFilter = false
                        }), ModalManager.MODAL_CLASS);
                        var initObj = {
                            onComplete: bind(this, function (success) {
                                $bar.width("100%");
                                if (success) {
                                    filter.applyResultTo(pixels);
                                    this.pastePixels(pixels);
                                    Modals.pop("ok")
                                }
                                if (window.console && window.console.timeEnd) {
                                    window.console.timeEnd(this.filter)
                                }
                                this.processingFilter = false;
                                this.bean.getSelectedLayer().setChangeStamp();
                                getManager().undoManager.push();
                                rdw.pushInstruction();
                                if (completeFunc) {
                                    completeFunc(success)
                                }
                            }),
                            onStep: function (idx) {
                                filter.deviatePixel(pixels, idx)
                            },
                            onChunk: function (idx, total) {
                                $bar.width((((idx / total) * 100) | 0) + "%");
                                var t = (new Date).getTime();
                                if (t - lastMessageAt > 2400) {
                                    lastMessageAt = t;
                                    var msgs = ["Almost there!", "Painting pixels...", "Pushing the progressbar!", "*whistles*", 'Adding to <a href="http://browse.deviantart.com/?order=15">popular art on dA</a>', "Ordering some nachos", "Zzzzzzzzz....", "Making witty comments...", "Making sure this works...", "Counting bits...", "Adding some final touches...", "Messing with the red channel...", "Cheering up blue pixels...", "Adding some awesomeness...", "Calculating PI... mmm, pie....", "Polishing each pixel...", "Handpicking best pixels...", "Making green more deviant-green...", "Starting over... just kidding ;)", "What would Tron guy do here?", "Singing some pixel blues...", "Adding to random deviant's favourites...", "Trying to make your CPU faster...", "Decreasing cheesy factor...", "Waiting for the color to dry...", "Fixing Hyperdrive Motivator", "Gaga, ooh la la", "Anybody wanna peanut?"];
                                    var fadeSpeed = Browser.isTouch ? 0 : "fast";
                                    $modal.find(".talkmessage .message").fadeTo(fadeSpeed, 0, function () {
                                        $(this).html(msgs[(Math.random() * msgs.length) | 0]).fadeTo(Browser.isTouch ? 0 : "slow", 1)
                                    })
                                }
                            },
                            totalSteps: pixels.data.length >> 2,
                            interval: Browser.isTouch ? 50 : 1
                        };
                        if (filter.suggestedChunkSize) {
                            initObj.chunkSize = filter.suggestedChunkSize
                        }
                        filterProcessor = new DTask(initObj);
                        if (window.console && window.console.time) {
                            window.console.time(this.filter)
                        }
                        filterProcessor.start()
                    } else {
                        if (window.console && window.console.time) {
                            window.console.time(this.filter)
                        }
                        filter.deviatePixels(pixels);
                        if (window.console && window.console.timeEnd) {
                            window.console.timeEnd(this.filter)
                        }
                        this.pastePixels(pixels);
                        this.bean.getSelectedLayer().setChangeStamp();
                        getManager().undoManager.push();
                        rdw.pushInstruction();
                        this.processingFilter = false
                    }
                } catch (e) {
                    this.logger.log("ERROR IN FILTER!!!!", e);
                    this.processingFilter = false;
                    if ($modal) {
                        $modal.find(".leftImage img").attr("http://st.deviantart.net/minish/canvasdraw/modals/yellow_frown.png");
                        $modal.find(".talkmessage .message").html("Error: " + e.message)
                    }
                }
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
            pastePixels: function (b) {
                if (window.SelectionManager && getManager().selectionManager.hasSelection) {
                    var a = getManager().bean.getBufferCtx();
                    a.clear();
                    a.setPixelData(b);
                    a.globalCompositeOperation = "destination-out";
                    a.drawImage(getManager().selectionManager.selCanvas.canvas.get(0), 0, 0);
                    a.globalCompositeOperation = "source-over";
                    getManager().selectionManager.clear();
                    getManager().bean.getSelectedLayer().getContext().drawImage(a.canvas, 0, 0);
                    a.clear()
                } else {
                    getManager().bean.getSelectedLayer().getContext().setPixelData(b)
                }
            }
        });
        if (window.DWait) {
            DWait.run("jms/pages/drawplz/filterManager.js")
        }
        window.STATUS_COLLAB_INVITE_PENDING = 1;
        window.STATUS_COLLAB_INVITE_ACCEPTED = 2;
        window.STATUS_COLLAB_INVITE_REJECTED = 3;
        window.ChatManager = Base.extend({
            constructor: function () {
                this.logger = new StdLogger("Chat Manager");
                var a = getManager().bean.getMainNode();
                this.$sidebarNode = $(".sideBar", a);
                this.$chatNode = this.$sidebarNode.find(".chatScroller");
                th...ATUS_COLLAB_INVITE_REJECTED: default: continue
            }
            var f = b.getUser(c.userid);
            f.statusClass = j;
            if (a) {
                f.is_owner = true
            }
            d.append(o.processTemplate("participantRow", f))
        }
        var n = d.find("tr").length;
        var m = n + " Participants"; $(".collabTab .label", this.$sidebar).html(m)
        } catch (k) {
            this.logger.log("collabManager Error:", k)
        }
    },
    updateCallback: function (c, b) {
        if (!c) {
            b = b || {};
            b.fullresponse = DiFi._lastresponse.replace(/(data:image\/png)[^\"']*/, "$1...");
            this.logger.talkback("Drawplz update poll error XD", b);
            this.schedulePoll();
            return
        }
        if (b.response.content.draft) {
            var a = b.response.content.draft;
            this.updateParticipants(a.participants, true);
            getManager().fileManager.loadUpdate(a);
            getManager().layerManager.loadLayerData(a.layer_data);
            this.setIsPublic(a.is_public)
        }
        if (b.response.content.chat) {
            getManager().chatManager.renderMessages(b.response.content.chat.messages)
        }
        if (((getManager().fileManager.getDraftVersion() != b.response.content.draft_version) || (b.response.content.chat.messages.length > 0)) && this.didSomething) {
            this.pollInterval = Math.max(0.5 * this.pollInterval, window.UPDATE_POLL_INTERVAL_MIN)
        } else {
            if (((getManager().fileManager.getDraftVersion() != b.response.content.draft_version) || (b.response.content.chat.messages.length > 0)) || this.didSomething) {
                this.pollInterval = Math.min(1.1 * this.pollInterval, window.UPDATE_POLL_INTERVAL_MAX)
            } else {
                this.pollInterval = Math.min(1.75 * this.pollInterval, window.UPDATE_POLL_INTERVAL_MAX)
            }
        }
        this.didSomething = false;
        this.logger.log("Poll Interval: ", this.pollInterval);
        this.schedulePoll()
    },
    kickParticipant: function (g) {
        var f = $(g.target);
        var a = parseInt(f.attr("rel"));
        var d = getManager().userManager.getUsername(a);
        var b = getManager().userManager.getDeviant();
        var c = "Are you sure you want to kick " + d + " from this collaboration?";
        if (b.userid == a) {
            c = "Are you sure you want to leave this collaboration?"
        }
        if (confirm(c)) {
            DiFi.pushPost("DrawPlz", "kick_participant", [getManager().fileManager.getDraftId(), [d]], function (m, j) {
                if (!m) {
                    var i = "unknown",
                        l = "Error processing your request.",
                        h = {};
                    try {
                        i = j.response.content.error.code;
                        l = j.response.content.error.human;
                        h = j.response.content.error.details
                    } catch (k) {}
                    alert(l);
                    this.logger.talkback("Drawplz error kicking participant: ", j)
                } else {
                    getManager().userManager.popUser(a);
                    $(".participantTable tr[rel=" + a + "]", this.$sidebar).remove()
                }
            }, this)
        }
        return false
    },
    inviteModal: function () {
        if (!getManager().bean.getIsHTML5()) {
            return getManager().layoutManager.showHtml5Modal()
        }
        if (!getManager().fileManager.getDraftId()) {
            getManager().fileManager.savePrompt("Please save your file before<br/>creating a collaboration.");
            return
        }
        getManager().modalManager.pushModal("invite", [], function (a) {
            if (a.action == "invite") {
                validatedData = this.validateInvite(a);
                if (validatedData.error) {
                    alert(validatedData.error);
                    return false
                }
                if (!this.bean.getIsCollab()) {
                    getManager().fileManager.createCollab(validatedData.recipients, validatedData.message)
                } else {
                    DiFi.pushPost("DrawPlz", "invite_participant", [getManager().fileManager.getDraftId(), validatedData.recipients, validatedData.message], function (h, d) {
                        if (!h) {
                            var c = "unknown",
                                g = "Error processing your request.",
                                b = {};
                            try {
                                c = d.response.content.error.code;
                                g = d.response.content.error.human;
                                b = d.response.content.error.details
                            } catch (f) {}
                            switch (c) {
                            case "TOO_MANY_COLLABORATORS":
                                alert(g);
                                if (b && b.invites_left) {
                                    if (b.invites_left == 0) {
                                        Modals.pop("cancel")
                                    }
                                }
                                break;
                            default:
                            }
                            this.logger.talkback("Drawplz error inviting participant: ", d)
                        } else {
                            Modals.pop("cancel")
                        }
                    }.bindTo(this));
                    DiFi.send();
                    return false
                }
            }
            return
        }.bindTo(this), function (b) {
            var a = $(b);
            a.find(".recipEntry").focus();
            return
        }.bindTo(this))
    },
    validateInvite: function (c) {
        var a = new Object();
        a.error = false;
        a.recipients = c.recipients.replace(/, */g, " ").replace(/ +/g, " ").split(" ");
        a.message = c.message;
        for (var b = a.recipients.length - 1; b >= 0; b--) {
            if (a.recipients[b].length < 1) {
                a.recipients.splice(b, 1)
            }
        }
        if (a.recipients.length < 1) {
            a.error = "Please specify at least one other user to invite"
        }
        return a
    },
    turnOnCollab: function (b, a) {
        if (!b) {
            a = a || {};
            a.fullresponse = DiFi._lastresponse.replace(/(data:image\/png)[^\"']*/, "$1...");
            this.logger.talkback("Drawplz error creating collab XD", a);
            alert("Error creating collaboration. Please try again later.");
            return
        }
        this.bean.setIsCollab(true)
    },
    setIsPublic: function (b) {
        b = b || false;
        var a = $(".topArea .stuffMenuItem[rel=ispublic]", this.mainNode);
        if (b) {
            a.html('<i class="i8"><!-- --></i><span class="fw">Public mode</span> ON')
        } else {
            a.html('<i class="i9"><!-- --></i><span class="fw">Public mode</span> OFF')
        }
    },
    toggleIsPublic: function () {
        var b = $(".topArea .stuffMenuItem[rel=ispublic]", this.mainNode);
        var a = $(".i9", b).length;
        this.setIsPublic(a);
        DiFi.pushPost("DrawPlz", "set_public", [getManager().fileManager.getDraftId(), a], bind(this, this.toggleIsPublicCallback));
        DiFi.send()
    },
    toggleIsPublicCallback: function (b, a) {
        if (!b) {
            if (a && a.request && a.request.args && a.request.args[1]) {
                this.setIsPublic(!a.request.args[1])
            }
            a = a || {};
            a.fullresponse = DiFi._lastresponse;
            this.logger.talkback("Drawplz error toggling is_public", a)
        }
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/collabManager.js")
}
DWait.count();