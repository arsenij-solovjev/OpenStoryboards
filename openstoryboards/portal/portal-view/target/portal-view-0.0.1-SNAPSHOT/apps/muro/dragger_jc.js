/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.Dragger = Base.extend({
    constructor: function (h, b, c, g, f, j) {
        this.logger = new StdLogger("Dragger");
        this.clickNodes = h;
        this.$offsetNode = $(b);
        this.offsetNode = this.$offsetNode[0];
        this.startDragFunc = c;
        this.moveDragFunc = g;
        this.endDragFunc = f;
        this.transformFunc = j;
        this.type = "unknown";
        this.$win = $(window);
        for (var d = 0; d < h.length; d++) {
            var a = h[d];
            var e = this;
            mouseFunc = function (i) {
                i = i || window.event;
                if (i.which) {
                    if (i.which != 1) {
                        return false
                    }
                } else {
                    if (i.button) {
                        if (i.button > 1) {
                            return false
                        }
                    }
                }
                document.onmousemove = e.moveDrag.bindTo(e);
                document.onmouseup = e.endDrag.bindTo(e);
                e.$win.mouseout(e.mouseOut.bindTo(e));
                e.startDrag(i, this);
                return false
            };
            touchFunc = function (k) {
                if (!k.touches) {
                    k.touches = k.originalEvent.touches
                }
                k = k || window.event;
                if (k.touches.length == 1) {
                    for (var i = 0; i < h.length; i++) {
                        e.clickNodes[i].onmousedown = null
                    }
                    document.ontouchmove = e.moveDrag.bindTo(e);
                    document.ontouchend = function (l) {
                        this.endDrag()
                    }.bindTo(e);
                    e.startDrag(k, this);
                    return true
                } else {
                    return true
                }
            };
            if (typeof (a) == "object") {
                a.onmousedown = mouseFunc;
                a.ontouchstart = touchFunc
            } else {
                if (typeof (a) == "string") {
                    $(a).live("mousedown", mouseFunc);
                    $(a).live("touchstart", touchFunc)
                }
            }
            if (a) {
                a.ontouchstart = function (k) {
                    k = k || window.event;
                    if (k.touches.length == 1) {
                        for (var i = 0; i < h.length; i++) {
                            this.clickNodes[i].onmousedown = null
                        }
                        document.ontouchmove = this.moveDrag.bindTo(this);
                        document.ontouchend = function (l) {
                            this.endDrag()
                        }.bindTo(this);
                        this.startDrag(k);
                        return true
                    } else {
                        return true
                    }
                }.bindTo(this)
            }
        }
    },
    startDrag: function (b, a) {
        this.obj = a;
        this.type = null;
        this.getOffset(b);
        b = b || window.event;
        coords = this.transformCoords(b);
        this.startDragFunc(coords, b, this.obj);
        this.moveDragFunc(coords, b, this.obj);
        if (b.preventDefault) {
            b.preventDefault()
        }
        return false
    },
    moveDrag: function (a) {
        a = a || window.event;
        coords = this.transformCoords(a);
        if (this.numTouches > 1) {
            return true
        }
        this.moveDragFunc(coords, a, this.obj);
        if (a.preventDefault) {
            a.preventDefault()
        }
        return false
    },
    endDrag: function (a) {
        this.clearEvents();
        a = a || window.event;
        if (a) {
            coords = this.transformCoords(a);
            try {
                if (coords[0] > 0 && coords[1] > 0) {
                    this.moveDragFunc(coords, a, this.obj)
                }
            } catch (a) {}
            if (a.preventDefault) {
                a.preventDefault()
            }
        } else {
            coords = a = null
        }
        this.endDragFunc(coords, a, this.obj);
        this.offset = null;
        return false
    },
    mouseOut: function (a) {
        a = a || window.event;
        if (!a.relatedTarget && !(a.fromElement || a.toElement)) {
            this.clearEvents();
            coords = this.transformCoords(a);
            this.endDragFunc(coords, a);
            if (a.preventDefault) {
                a.preventDefault()
            }
            return false
        } else {
            return true
        }
    },
    clearEvents: function () {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
        this.$win.unbind("mouseout")
    },
    getOffset: function (b) {
        this.numTouches = 0;
        try {
            this.numTouches = b.touches.length
        } catch (a) {}
        if (this.numTouches > 0) {
            this.offset = cumulativeOffset(this.offsetNode);
            this.$offsetNode.data("offset", this.offset)
        } else {
            this.offset = this.$offsetNode.offset();
            this.$offsetNode.data("offset", [this.offset.left, this.offset.top])
        }
    },
    transformCoords: function (c) {
        c = c || window.event;
        if (this.type != "regular") {
            this.numTouches = 0;
            try {
                this.numTouches = c.touches.length
            } catch (b) {
                this.type = "regular"
            }
        } else {
            this.numTouches = 0
        }
        if (this.numTouches > 0) {
            this.type = "ipad";
            if (!this.offset || this.offset.length < 2 || this.offset[0] != parseInt(this.offset[0])) {
                this.getOffset(c)
            }
            coords = [parseInt(c.touches[0].pageX - this.offset[0]), parseInt(c.touches[0].pageY - this.offset[1])]
        } else {
            if (!this.offset) {
                this.getOffset(c)
            }
            var a = c.pageX || ((document.body.scrollLeft || document.documentElement.scrollLeft) + c.clientX);
            var d = c.pageY || ((document.body.scrollTop || document.documentElement.scrollTop) + c.clientY);
            coords = [(a - this.offset.left) | 0, (d - this.offset.top) | 0]
        }
        if (this.transformFunc) {
            return this.transformFunc(coords)
        } else {
            return coords
        }
    }
});
if (window.DWait) {
    DWait.run("jms/lib/dragger.js")
}
window.DragList = Base.extend({
    constructor: function (a, b, c) {
        this.options = c;
        this.container = $(a);
        this.dragContainer = $(b);
        this.startCoords = {};
        this.inDrag = false;
        if (!this.options) {
            this.options = {}
        }
        if (!this.options.classGhost) {
            this.options.classGhost = "dragGhost"
        }
        if (!this.options.distance) {
            this.options.distance = 0
        }
        this.dragger = new Dragger((this.options.classItemHandle ? $("." + this.options.classItemHandle, this.container) : $("li", this.container)), this.container, this.startListDrag.bindTo(this), this.moveListDrag.bindTo(this), this.endListDrag.bindTo(this))
    },
    startListDrag: function (a, c, b) {
        this.startCoords = a;
        this.inDrag = false;
        if (typeof (this.options.callbackStartDrag) == "function") {
            if (this.options.classItemHandle) {
                this.options.callbackStartDrag($(b).closest("li"))
            } else {
                this.options.callbackStartDrag($(b))
            }
        }
    },
    moveListDrag: function (k, g, b) {
        if (!this.inDrag) {
            if (Math.abs(k[1] - this.startCoords[1]) > this.options.distance) {
                this.scrollOffset = this.container.scrollTop();
                this.inDrag = true;
                var f = this.dragContainer.height(this.container.height()).show();
                if (this.options.classItemHandle) {
                    this.dragObj = $(b).closest("li").clone().appendTo(f)
                } else {
                    this.dragObj = $(b).clone().appendTo(f)
                }
                $(this.dragObj).css("top", (k[1] - 20) + "px");
                $(this.dragObj).css("left", (5) + "px");
                if (this.options.classItemHandle) {
                    $(b).closest("li").addClass(t....options.classGhost)
                }
            }
        } else {
            $(this.dragObj).css("top", (k[1] - 20) + "px");
            var d = k[1] + this.container.data("offset")[1];
            var h = this.container.find("li");
            var j;
            for (var c = 0; c < h.length; c++) {
                var l = h[c];
                if (!$(l).is("." + this.options.classGhost)) {
                    var a = cumulativeOffset($(l).get(0))[1] - this.scrollOffset;
                    if (a + $(l).height() < d) {
                        if ($(l).index() > $("." + this.options.classGhost).index()) {
                            j = $("." + this.options.classGhost).remove();
                            $(j).insertAfter(l);
                            break
                        }
                    } else {
                        if (a > d) {
                            if ($(l).index() < $("." + this.options.classGhost).index()) {
                                j = $("." + this.options.classGhost).remove();
                                $(j).insertBefore(l);
                                break
                            }
                        }
                    }
                }
            }
        }
    },
    endListDrag: function (b, d, c) {
        var a;
        if (!this.inDrag) {
            if (typeof (this.options.callbackNotDrag) == "function") {
                if (this.options.classItemHandle) {
                    this.options.callbackNotDrag($(c).closest("li"))
                } else {
                    this.options.callbackNotDrag($(c))
                }
            }
        } else {
            this.dragContainer.empty().hide();
            if (typeof (this.options.callbackEndDrag) == "function") {
                if (this.options.classItemHandle) {
                    this.options.callbackEndDrag($(c).closest("li"))
                } else {
                    this.options.callbackEndDrag($(c))
                }
            }
        }
        $("." + this.options.classGhost).removeClass(this.options.classGhost);
        this.container.scrollTop(this.scrollOffset)
    }
});
if (window.DWait) {
    DWait.run("jms/lib/draglist.js")
}
window.Draggable = Base.extend({
    constructor: function (c, b, a, d) {
        this.logger = new StdLogger("Draggable");
        this.$container = $(b);
        if (a instanceof Array) {
            this.droppables = a.sort(function (f, e) {
                return e.$node.parents().length - f.$node.parents().length
            })
        } else {
            this.droppables = [a]
        }
        this.options = d;
        new Dragger([c], b, this.startDrag.bindTo(this), this.moveDrag.bindTo(this), this.endDrag.bindTo(this))
    },
    startDrag: function (a, b, c) {
        this.$dragNode = $(c);
        this.oldZ = this.$dragNode.css("z-index");
        this.$dragNode.css("z-index", 300);
        this.contWidth = this.$container.width();
        this.nudgeLeft = Math.round(this.$dragNode.width() / 2);
        this.nudgeTop = Math.round(this.$dragNode.height() / 2);
        if (this.options.dragOffsetLeft) {
            this.nudgeLeft += this.options.dragOffsetLeft
        }
        if (this.options.dragOffsetTop) {
            this.nudgeTop += this.options.dragOffsetTop
        }
        this.maxLeft = this.$container.width() - this.$dragNode.width();
        this.maxTop = this.$container.height() - this.$dragNode.height();
        if (this.options.startDrag) {
            this.options.startDrag(c)
        }
    },
    moveDrag: function (d, g, h) {
        this.$dragNode.css("left", Math.max(0, Math.min(this.maxLeft, (d[0] - this.nudgeLeft))) + "px");
        this.$dragNode.css("top", Math.max(0, Math.min(this.maxTop, (d[1] - this.nudgeTop))) + "px");
        var c = false;
        for (var b = 0; b < this.droppables.length; b++) {
            var f = this.droppables[b];
            if (f.isOver(g) && !c) {
                if (!f.activate(h)) {
                    c = true;
                    for (var a = b + 1; a < this.droppables.length; a++) {
                        this.droppables[a].deactivate(h)
                    }
                }
            } else {
                f.deactivate(h)
            }
        }
        if (this.options.moveDrag) {
            this.options.moveDrag(h)
        }
    },
    endDrag: function (c, f, g) {
        var b = false;
        this.$dragNode.css("z-index", this.oldZ);
        for (var a = 0; a < this.droppables.length; a++) {
            var d = this.droppables[a];
            if (d.isOver(f)) {
                b = true;
                if (!d.dropFunc(this.$dragNode.get(0))) {
                    break
                }
            }
        }
        for (a = 0; a < this.droppables.length; a++) {
            this.droppables[a].clearOffsetData()
        }
        if (!b && this.options.noDrop) {
            this.options.noDrop(g)
        }
        if (this.options.endDrag) {
            this.options.endDrag(g)
        }
    }
});
if (window.DWait) {
    DWait.run("jms/lib/draggable.js")
}
window.Droppable = Base.extend({
    constructor: function (c, b, a) {
        this.logger = new StdLogger("Droppable");
        this.$node = $(c);
        this.node = this.$node[0];
        this.dropFunc = b;
        this.options = a;
        this.type = "unknown";
        this.isDragOver = false;
        this.lastActivateVal = true;
        this.lastDeactivateVal = true
    },
    getOffset: function (b) {
        this.numTouches = 0;
        try {
            this.numTouches = b.touches.length
        } catch (a) {}
        if (this.numTouches > 0) {
            this.offset = cumulativeOffset(this.node);
            this.$node.data("offset", this.offset)
        } else {
            this.offset = this.$node.offset();
            this.$node.data("offset", [this.offset.left, this.offset.top])
        }
    },
    clearOffsetData: function () {
        this.logger.log("Removing data for: ", this.$node.attr("id"));
        this.$node.removeData("offset");
        this.offset = null
    },
    isOver: function (d) {
        var c;
        d = d || window.event;
        if (this.type != "regular") {
            this.numTouches = 0;
            try {
                this.numTouches = d.touches.length
            } catch (b) {
                this.type = "regular"
            }
        } else {
            this.numTouches = 0
        }
        if (this.numTouches > 0) {
            this.type = "ipad";
            if (!this.offset || this.offset.length < 2 || this.offset[0] != parseInt(this.offset[0])) {
                this.getOffset(d)
            }
            c = [parseInt(d.touches[0].pageX - this.offset[0]), parseInt(d.touches[0].pageY - this.offset[1])]
        } else {
            if (!this.offset) {
                this.getOffset(d)
            }
            var a = d.pageX || ((document.body.scrollLeft || document.documentElement.scrollLeft) + d.clientX);
            var f = d.pageY || ((document.body.scrollTop || document.documentElement.scrollTop) + d.clientY);
            c = [(a - this.offset.left) | 0, (f - this.offset.top) | 0]
        }
        return (c[0] > 0 && c[0] < this.$node.width() && c[1] > 0 && c[1] < this.$node.height())
    },
    activate: function (a) {
        this.lastDeactivateVal = true;
        if (!this.isDragOver) {
            if (this.options.activateFunc) {
                this.lastActivateVal = this.options.activateFunc(a)
            }
        }
        this.isDragOver = true;
        return this.lastActivateVal
    },
    deactivate: function (a) {
        this.lastActivateVal = true;
        if (this.isDragOver) {
            if (this.options.deactivateFunc) {
                this.lastDeactivateVal = this.options.deactivateFunc(a)
            }
        }
        this.isDragOver = false;
        return this.lastDeactivateVal
    }
});
if (window.DWait) {
    DWait.run("jms/lib/droppable.js")
}
DWait.count();