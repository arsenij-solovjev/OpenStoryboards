/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
DDD = {
    DEFAULT_SNAP_TRESHOLD: 4,
    subject: null,
    subject_snap_treshold: null,
    p_down: null,
    mod_down: null,
    snapped: false,
    preventDraggingToDesktop: function (a) {
        a.preventDefault()
    },
    hookMouse: function (a) {
        Events.hook(document, Browser.isTouch ? "touchstart" : "mousedown", a)
    },
    unhookMouse: function (a) {
        Events.unhook(document, Browser.isTouch ? "touchstart" : "mousedown", a)
    },
    mouseDown: function (d, b, a, c) {
        if (DDD.subject || Browser.isTouch) {
            return false
        }
        DRE.assert(b);
        DRE.assert(b.ddd);
        DRE.assert(typeof b.ddd.snap == "function");
        DRE.assert(typeof b.ddd.drag == "function");
        DRE.assert(typeof b.ddd.drop == "function");
        b.ddd.node = this;
        DDD.subject = b;
        DDD.subject_snap_treshold = a == Number(a) ? a : DDD.DEFAULT_SNAP_TRESHOLD;
        DDD.p_down = Ruler.document.pointer(d);
        DDD.mod_down = Ruler.clickMod(Ruler.document.node(DDD.subject.ddd.node, c), DDD.p_down);
        Events.hook(document, Browser.isTouch ? "touchmove" : "mousemove", DDD.mouseDrag);
        Events.hook(document, Browser.isTouch ? "touchend" : "mouseup", DDD.mouseDrop);
        if (window.$ && $.browser.msie) {
            $(DDD.subject.ddd.node).bind("mousemove", DDD.preventDraggingToDesktop);
            if ($.browser.version.match(/^(7.0|8.0)$/)) {
                document.onselectstart = function () {
                    return false
                }
            }
        }
        DDD.p_current = null;
        if (DDD.subject_snap_treshold == 0) {
            DDD.mouseDrag(d)
        }
        return true
    },
    mouseDrop: function (a) {
        if (DDD.snapped) {
            DDD.subject.ddd.drop.call(DDD.subject, a)
        }
        DDD.mouseUp(a)
    },
    mouseUp: function (a) {
        DDD.p_down = null;
        DDD.snapped = false;
        if (window.$ && $.browser.msie) {
            $(DDD.subject.ddd.node).unbind("mousemove", DDD.preventDraggingToDesktop);
            if ($.browser.version.match(/^(7.0|8.0)$/)) {
                document.onselectstart = null
            }
        }
        DDD.subject = null;
        Events.unhook(document, Browser.isTouch ? "touchmove" : "mousemove", DDD.mouseDrag);
        Events.unhook(document, Browser.isTouch ? "touchend" : "mouseup", DDD.mouseDrop)
    },
    mouseDrag: function (b) {
        var a;
        if (!DDD.subject) {
            return dre_notice("DDD.mouseDrag without DDD.subject")
        }
        DDD.p_previous = DDD.p_current;
        DDD.p_current = a = Ruler.document.pointer(b);
        if (!DDD.snapped) {
            if (Math.abs(DDD.p_down.x - a.x) >= DDD.subject_snap_treshold || Math.abs(DDD.p_down.y - a.y) >= DDD.subject_snap_treshold) {
                DDD.snapped = true;
                DDD.subject.ddd.snap.call(DDD.subject, b)
            } else {
                return true
            }
        }
        DDD.subject.ddd.drag.call(DDD.subject, b);
        return false
    },
    eventKeys: function (a) {
        if (Browser.isMac && !Browser.isOpera) {
            return {
                range: a.shiftKey,
                multiple: a.metaKey
            }
        } else {
            return {
                range: a.shiftKey,
                multiple: a.ctrlKey
            }
        }
    }
};
if (window.DWait) {
    DWait.run("jms/lib/ddd.js")
}
DDDUtils = {
    mix: function (b) {
        var a, c = DDDUtils.mixer;
        for (a in c) {
            if (b[a] != c[a]) {
                if (b[a]) {
                    throw new Error("subject." + a + " already exists")
                }
                b[a] = c[a]
            }
        }
    },
    mixer: {
        dddTickStart: function (a) {
            if (!this.drag_data.top_drag_offset) {
                this.drag_data.top_drag_offset = 0
            }
            this.drag_data.scroll_timer = setInterval(bind(this, this._dddTickIterate), 200);
            this.dddTickUpdate(a)
        },
        dddTickUpdate: function (a) {
            this.drag_data.event_cache = {
                clientX: a.clientX,
                clientY: a.clientY,
                x: a.x,
                y: a.y
            }
        },
        dddTickEnd: function (a) {
            clearInterval(this.drag_data.scroll_timer)
        },
        _dddTickIterate: function () {
            var b, a;
            b = Ruler.screen.pointer(this.drag_data.event_cache);
            if (((b.y > this.drag_data.top_drag_offset) && (b.y < this.drag_data.top_drag_offset + 48)) || b.y > (Ruler.screen.rect().y2 - 24)) {
                if (this.drag_data.surfers) {
                    for (a = 0; this.drag_data.surfers[a]; a++) {
                        Surfer.update(this.drag_data.surfers[a], this.drag_data.event_cache)
                    }
                } else {
                    if (this.drag_data.surfer2) {
                        Surfer2.update(this.drag_data.surfer2, this.drag_data.event_cache)
                    }
                }
                if (b.y < this.drag_data.top_drag_offset + 48) {
                    if (Browser.isGecko || Browser.isIE) {
                        document.documentElement.scrollTop -= 48
                    } else {
                        document.body.scrollTop -= 48
                    }
                } else {
                    if (Browser.isGecko || Browser.isIE) {
                        document.documentElement.scrollTop += 48
                    } else {
                        document.body.scrollTop += 48
                    }
                }
            }
        }
    }
};
if (window.DWait) {
    DWait.run("jms/lib/ddd.utils.js")
}
window.Renamer = function (a, c, b) {
    DTLocal.infect(this);
    this.init(a, c, b)
};
Renamer.prototype = {
    template: '<input type="text" class="itext renamer"/>',
    init: function (a, c, b) {
        this.node = $(this.template)[0];
        this.owner = a;
        this.callback = c;
        this.localEventHook(this.node, "blur", bind(this, this.blurred));
        this.localEventHook(this.node, "keydown", bind(this, this.keyd));
        this.localEventHook(this.node, "click", bind(this, this.clicked));
        this.localEventHook(this.node, "mousedown", bind(this, this.clicked));
        this.previous_name = b;
        this.node.value = b;
        setTimeout(bind(this, this.focus), 1)
    },
    localRecv: function (b) {
        var a;
        if (b == "destroy") {
            a = this.node.value;
            if (this.node.cancelled) {
                a = null
            }
            if (this.node.parentNode) {
                this.node.parentNode.removeChild(this.node)
            }
            this.callback.call(this.owner, a, this.previous_name)
        }
    },
    clicked: function (a) {
        a.cancelBubble = true;
        if (a.stopPropagation) {
            a.stopPropagation()
        }
        return true
    },
    focus: function () {
        this.node.focus();
        this.node.select()
    },
    blurred: function (a) {
        this.done()
    },
    done: function () {
        if (this.dead) {
            return
        }
        this.dead = true;
        setTimeout(bind(this, this.localDestroy), 1)
    },
    keyd: function (a) {
        if (a.keyCode == 13) {
            this.done();
            return false
        } else {
            if (a.keyCode == 27) {
                this.node.value = "";
                this.done();
                return false
            }
        }
    }
};
if (window.DWait) {
    DWait.run("jms/lib/renamer.js")
}
DWait.ready(["jms/lib/Base.js", "jms/lib/events.js", "jms/lib/simple_selection.js", "jms/lib/browser.js", "jms/lib/wo.js"], function () {
    window.Selection = Simple...ltiple || k.range) {
    if (h) {
        this.deselect(c)
    } else {
        if (k.range && this.getSelection().length) {
            var b = false,
                f = true,
                j = this.getAllSelectable();
            for (i = 0; node = j[i]; i++) {
                if (node == c) {
                    f = false;
                    if (b) {
                        break
                    } else {
                        b = true
                    }
                }
                if (!b && f && this.isSelected(node)) {
                    b = true
                }
                if (b) {
                    this.select(node)
                }
            }
        }
        this.select(c)
    }
    this.callback(this.getSelection(), [], "click");
    d = true
} else {
    if (this.options.ignore_clicks) {
        d = h && !this.next_sel_click_volatile;
        this.next_sel_click_volatile = true;
        break
    }
    this.setSelection(c, "click");
    d = true
}
break
}
}
while (c != this.root && (c = c.parentNode));
if (!d && !this.options.sticky_selection) {
    this.setSelection(null, "click")
}
if (this.options.ignore_clicks) {
    return true
}
if (c && c.blur) {
    try {
        c.blur()
    } catch (g) {}
}
return g.returnValue = false
}, onkeydown: function (c) {
    var a, b;
    c = c || event;
    if (c.ctrlKey || c.metaKey || c.altKey || c.shiftKey) {
        return true
    }
    if ((c.target || c.srcElement).tagName in {
        TEXTAREA: 1,
        INPUT: 1
    }) {
        return true
    }
    if (Selection.focused == this) {
        if (c.keyCode in this.options.include_keyboard) {
            a = (c.keyCode in {
                37: 1,
                38: 1
            }) ? -1 : 1;
            this.setRelativeSelection(a, 1);
            this.scroll(a);
            return false
        } else {
            if (c.keyCode == 27) {
                if (this.cancel_next_esc) {
                    this.cancel_next_esc = 0;
                    return true
                }
                setTimeout(bind(this, this.setSelection, null, "keyboard"), 1)
            }
        }
    }
    return true
},
ieonmousedown: function (a) {
    a = a || window.event;
    this.ie_last_button = a.button
},
onmousedown: function (b) {
    var a;
    b = b || window.event;
    if (b.button > (Browser.isGecko ? 0 : 1)) {} else {
        a = b.target || b.srcElement;
        while (a && a != document.documentElement && (a.tagName != "DIV" || a.parentNode.className.indexOf("thumb") >= 0 || a.className.indexOf("stash-tt-a") >= 0 || a.className.indexOf("stash-thumb-container") >= 0)) {
            if (a.tagName == "A" && a.className.indexOf("no-drag") < 0) {
                return true
            }
            if (a.tagName == "INPUT") {
                return true
            }
            a = a.parentNode
        }
        if (window.event) {
            window.event.cancelBubble = true
        }
        if (b.stopPropagation) {
            b.stopPropagation()
        }
        if (DDD.mouseDown.call(this.root, b, this, 12, true)) {
            if (b.preventDefault) {
                b.preventDefault()
            }
            if (window.Popup) {
                Popup.completeAll()
            }
            return false
        }
    }
    return true
},
getAllSelectableRects: function (b, h, g) {
    var f, d, l, c, e, k, a, j = 0;
    c = this.getAllSelectable();
    l = [];
    for (f = 0; d = c[f]; f++) {
        if (this.options.skip_first_item && !j++) {
            continue
        }
        if (h && (this.isSelected(d) || g === d)) {
            k = true;
            continue
        }
        a = this.drag_rect_ruler(d, true);
        a.index = f;
        a.owner = b;
        a.node = d;
        if (h && k) {
            a.offset_mark = 1
        }
        l.push(a)
    }
    return l
},
ddd: {
    snap: function (g) {
        var a, b, f, c, d;
        f = Selection.eventKeys(g);
        if (window.Popup && Browser.isIE) {
            Popup.cancel_next_click = true
        }
        this.drag_data = {
            surfer2: Surfer2.create(g, Ruler.document.pointer(g)),
            rects: [],
            initial_selection: []
        };
        this.drag_data.rects = this.options.allow_multiple == "ignore" ? [] : this.getAllSelectableRects();
        for (c = 0; d = (this.drag_data.rects[c] || {}).node; c++) {
            if (f && (f.multiple || f.range)) {
                this.drag_data.initial_selection[c] = this.isSelected(d)
            }
        }
        if (this.options.allow_multiple == "rectangle") {
            this.drag_data.surfer2.node.style.display = "block"
        }
        if (window.DDDUtils) {
            DDDUtils.mix(this)
        }
        if (this.dddTickStart) {
            this.dddTickStart(g)
        }
    },
    drag: function (f) {
        var d, b, c, a;
        if (this.dddTickUpdate) {
            this.dddTickUpdate(f)
        }
        d = Surfer2.update(this.drag_data.surfer2, f);
        for (b = 0; msg_rect = this.drag_data.rects[b]; b++) {
            a = ((d.x < msg_rect.x2 && msg_rect.x < d.x2) && (d.y < msg_rect.y2 && msg_rect.y < d.y2));
            if (a ^ this.drag_data.initial_selection[b]) {
                this.next_sel_click_volatile = false;
                this.select(this.drag_data.rects[b].node)
            } else {
                this.deselect(this.drag_data.rects[b].node)
            }
        }
    },
    drop: function (a) {
        if (this.dddTickEnd) {
            this.dddTickEnd(a)
        }
        Surfer2.clear(this.drag_data.surfer2);
        this.drag_data.surfer2 = {}
    }
},
scroll: function (a, b) {
    var c;
    c = this.getSelection();
    if (c.length) {
        rect = Ruler.document.node(this.root);
        if (a > 0) {
            if (!b || b == "y") {
                this.root.scrollTop = Math.max(this.root.scrollTop, 0, Ruler.document.node(c[c.length - 1]).y2 - (rect.y + rect.h - 8))
            }
            if (!b || b == "x") {
                this.root.scrollLeft = Math.max(this.root.scrollLeft, 0, Ruler.document.node(c[c.length - 1]).x2 - (rect.x + rect.w - 8))
            }
        } else {
            if (!b || b == "y") {
                this.root.scrollTop = Math.min(this.root.scrollTop, Math.max(0, Ruler.document.node(c[0]).y - rect.y))
            }
            if (!b || b == "x") {
                this.root.scrollLeft = Math.min(this.root.scrollLeft, Math.max(0, Ruler.document.node(c[0]).x - rect.x))
            }
        }
    }
}
});
Selection.eventKeys = function (a) {
    if (Browser.isMac && !Browser.isOpera) {
        return {
            range: a.shiftKey,
            multiple: a.metaKey
        }
    } else {
        return {
            range: a.shiftKey,
            multiple: a.ctrlKey
        }
    }
};
Selection.mouseInit = function () {
    if (window.Popup) {
        Popup.go()
    }
    if (!this._mouse) {
        this._mouse = new WatchableObject()
    }
    return this._mouse
};
Selection.mouseCancel = function (a) {
    if (this._mouse && !a.ctrlKey && !a.metaKey && !a.altKey && !a.shiftKey && a.button < 1) {
        this._mouse.broadcast(a)
    }
};
window.DivOnlySelection = Selection.extend({
    getAllSelectable: function () {
        var b, a;
        b = [];
        for (a = 0; a != this.root.childNodes.length; a++) {
            if ((this.root.childNodes[a].tagName || "").toLowerCase() == "div") {
                b.push(this.root.childNodes[a])
            }
        }
        return b
    },
    isSelectable: function (a) {
        return a.parentNode == this.root && a.tagName == "DIV"
    }
});
window.LinkOnlySelection = Selection.extend({
    getAllSelectable: function () {
        return this.root.getElementsByTagName("a")
    },
    isSelectable: function (a) {
        return a.parentNode == this.root && a.tagName == "A"
    }
});
if (window.DWait) {
    DWait.run("jms/lib/selection.js")
}
});
DWait.count();