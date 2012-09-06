/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
DWait.ready(["jms/lib/difi.js"], function () {
    window.MenuTraffic = {
        cache: {},
        register: function (a, b) {
            this.registry.push([a, b])
        },
        registry: [],
        titles: [],
        get: function (a) {
            var d, c, b;
            if ((d = this.cache[a]) && !this.cache[a]["volatile"]) {
                this.shout(a);
                if (d.children == null || (!d.children[0].path)) {
                    return
                }
                if (this.cache[d.children[0].path.join("/")]) {
                    return
                }
                if (MenuTraffic.news_hack && a.indexOf("news/") == 0) {
                    return
                }
                if (MenuTraffic.no_prefetch) {
                    return
                }
                for (b = 0; d.children[b]; b++) {
                    if (d.children[b].children != null) {
                        break
                    }
                }
                if (!d.children[b]) {
                    return
                }
            } else {
                if (c = this.overrides[a.split("/")[0]]) {
                    if (d = c.call(this, a)) {
                        if (d != true) {
                            this.cache[a] = d;
                            this.shout(a)
                        }
                        return
                    }
                }
            }
            DiFi.pushPrivateGet("Menu", "get", [a, 2], this.difi_got, this);
            if (!MenuTraffic.AUTO_DIFI_OFF) {
                DiFi.send()
            }
        },
        difi_got: function (b, a) {
            this.got.call(this, b, a.request.args[0], a.response.content, true)
        },
        got: function (g, a, f) {
            var h, e, d, b;
            if (!g) {
                delete MenuTraffic.cache[a]
            } else {
                this.cache[a] = f;
                if ((f.path instanceof Array) && (d = f.title_path)) {
                    for (e = 0; e != d.length; e++) {
                        this.titles[f.path.slice(0, e + 1).join("/")] = d[e]
                    }
                }
                if (h = f.children) {
                    for (e = 0; h[e]; e++) {
                        if (h[e].children && h[e].children.length) {
                            this.cache[h[e].path.join("/")] = h[e];
                            for (b = 0; h[e].children[b]; b++) {
                                this.titles[h[e].children[b].path.join("/")] = h[e].children[b].title
                            }
                        }
                        this.titles[h[e].path.join("/")] = h[e].title
                    }
                }
            }
            this.shout(a)
        },
        shout: function (a) {
            var b, c;
            c = this.cache[a];
            b = -1;
            while (this.registry[++b]) {
                this.registry[b][0].call(this.registry[b][1], a, c)
            }
        },
        overrides: {},
        getTitles: function (a) {
            var d, c, b, e;
            d = a.split("/");
            e = [];
            for (c = 0; c != d.length; c++) {
                b = d.slice(0, c + 1).join("/");
                if (MenuTraffic.titles[b]) {
                    e.push(MenuTraffic.titles[b])
                } else {
                    if (MenuTraffic.cache[b]) {
                        e.push(MenuTraffic.cache[b].title || d[c])
                    } else {}
                }
            }
            return e
        }
    };
    if (window.DWait) {
        DWait.run("jms/lib/menutraffic.js")
    }
});
window.Pager = {
    more: {},
    overrides: [],
    create: function (c) {
        var b, d, a;
        if (Browser.isIE) {
            try {
                document.execCommand("BackgroundImageCache", false, true)
            } catch (f) {}
        }
        c = c || {};
        if (c.paned) {
            d = $("<div>", {
                "class": "pager-panes pager-" + c.theme
            })
        } else {
            d = $("<div>", {
                "class": "pager-holder pager-" + c.theme
            })
        }
        if (c.auto_height) {}
        if (c.breadcrumb_stack) {
            d.addClass("pager-holder-stackable")
        }
        a = $("<div>", {
            "class": "jsid-pager " + (c.class_name || "pager2")
        });
        if (c.icon_set) {
            a.addClass("pager2-icons iconset-" + c.icon_set)
        }
        a.appendTo(d);
        b = {
            options: c,
            node: d.get(0),
            pages: {},
            selection: c.selection
        };
        d.data("pager", b);
        MenuTraffic.register(Pager.dataAvailable, b);
        return b
    },
    getFromNode: function (a) {
        return $($(a).closest("div.jsid-pager")[0].parentNode).data("pager")
    },
    render: {
        page: function (d, c, b) {
            var f, a, e;
            f = $("<div>", {
                "class": "page2"
            });
            if (!d.options.paned && (c.length > 1 || c[0])) {
                e = $("<div>", {
                    "class": "top"
                }).appendTo(f);
                a = b.split("/");
                while (c.length) {
                    a.pop();
                    $("<a>", {
                        "class": "f " + (d.options.breadcrumb_stack ? "bareback" : "back"),
                        href: "",
                        menuri: a.join("/"),
                        css: d.options.breadcrumb_stack ? {
                            textIndent: "10px",
                            paddingLeft: Math.max(0, -3 + ((c.length - 1) * 8)) + "px"
                        } : {},
                        text: d.options.breadcrumb_stack ? MenuTraffic.titles[a.join("/")] || (a.length == 1 ? "All Categories" : a[a.length - 1]) : "Back"
                    }).click(function (g) {
                        if (!Pager.clickBack(this)) {
                            g.preventDefault()
                        }
                    }).prependTo(e);
                    if (!d.options.breadcrumb_stack) {
                        break
                    }
                    c.pop()
                }
                f.append($("<div>", {
                    "class": "busy pagescroll pagescroll-space"
                }))
            } else {
                f.append($("<div>", {
                    "class": "busy pagescroll"
                }))
            }
            return f[0]
        },
        menuHTML: function (e, o, m) {
            function k(i, p) {
                var q;
                if (!i) {
                    return ""
                }
                q = p[0] == "gallery" ? 2 : 1;
                return i[0] + "/" + (p.length > q ? (p.slice(q).join("/") + "/") : "") + (i[1] || "")
            }
            var g, a, n, f, h, b, d, c, l, j;
            g = [];
            if (o.disable_clicks) {
                b = ""
            } else {
                b = ' onclick="return Pager.clickBack(this) ? true : Events.stop();" '
            }
            if (o.href_base) {
                h = o.href_base.split("%s");
                if (!h[1]) {
                    h[1] = ""
                }
                h[0] = h[0].replace(/\/$/, "")
            }
            if (o.master_links) {
                if ((typeof e.all) == "string") {
                    l = e.all
                } else {
                    if (e.title) {
                        l = e.title + ": All"
                    } else {
                        l = "All"
                    }
                }
                if (l) {
                    g.push('<a menuri="' + e.path.join("/") + '" href="' + (e.href || k(h, e.path)) + '" class="f" ' + b + ">" + l + "</a>")
                }
            }
            for (f = 0; f != Pager.overrides.length; f++) {
                if (a = Pager.overrides[f](e, o, g, b, m)) {
                    return o.return_html_as_array ? a : a.join("")
                }
            }
            for (f = 0; n = e.children[f]; f++) {
                if (j != undefined && n.flag != j) {
                    g.push('<div class="hr">-</div>')
                }
                j = n.flag;
                html_click = "";
                href = n.href || k(h, n.path);
                if (n.children != null) {
                    html_class = "f more"
                } else {
                    html_class = "f"
                }
                if (n.children && o.more_links) {
                    g.push('<a menuri="' + e.children[f].path.join("/") + '" href="' + href + '" class="rr f more" ' + b + ">more</a>");
                    g.push('<a menuri="' + e.children[f].path.join("/") + '" href="' + href + '" class="ll f" ' + b + ">")
                } else {
                    if (e.children[f].path) {
                        g.push('<a menuri="' + e.children[f].path.join("/") + '" ')
                    } else {
                        g.push("<a ")
                    }
                    g.push('href="' + href + '" class="' + html_class + '" ' + b + ">")
                }
                if (o.icon_base_url && n.icon) {
                    g.push('<img src="' + o.icon_base_url + n.icon + '" alt=""/> ')
                } else {
                    if (o.icon_set && n.icon) {
                        g.push('<i class="icon i' + n.icon + '"></i> ')
                    }
                }
                g.push(n.title + "</a>")
            }
            return g.join("")
        }
    },
    loadPage: function (b, a, e, d) {
        var c;
        c = b.pages[a];
        if (!c) {
            c = b.pages[a] = {
                node: Pager.render.page(b, a.substr(((b.options.rootri + "/") || "").length).split("/"), a),
                ready: false
            };
            if (!b.options.paned) {
                Events.hook(c.node, "contextmenu", Pager.backBack)
            }
            Pager.showPage(b, a, e, d);...
        }
        Pager.pageSelect(a, d, e);
        return false
    }
    return true
}, dataAvailable: function (a, b) {
    if (this.pages[a] && !this.pages[a].ready) {
        if (b == undefined) {
            Pager.pageFail(this, a)
        } else {
            Pager.pageReady(this, a, b)
        }
    }
},
pageFail: function (pager, ri) {
    with($("div.pagescroll", pager.pages[ri].node)[0]) {
        className = className.replace(/\bbusy\b/, "broken")
    }
    delete pager.pages[ri]
},
pageReady: function (pager, ri, data) {
    var page, page_html;
    if (data.children == null) {
        if (ri.indexOf("/") > 0) {
            Pager.loadPage(pager, ri.split("/").reverse().slice(1).reverse().join("/"))
        }
        return
    }
    page = pager.pages[ri];
    if (page.ready) {}
    page_html = Pager.render.menuHTML(data, pager.options, page.node);
    with($("div.pagescroll", page.node)[0]) {
        className = className.replace(/\bbusy\b/, "");
        while (firstChild) {
            removeChild(firstChild)
        }
        $($("div.pagescroll", page.node)[0]).html(page_html)
    }
    Pager.pageSelect(pager, page.node);
    page.ready = true;
    Pager.pageDisplayed(pager, ri)
},
pageDisplayed: function (b, a) {
    DRE.assert(b.pages[a]);
    b.ri = a;
    if (b.options.paned && b.jump_target) {
        if (b.jump_target.indexOf(a) == 0) {
            Bug.log(b.jump_target, "match with " + a);
            Pager.more.jumpThrough(b, b.pages[a].node, a)
        } else {
            Bug.log(b.jump_target, "miss with " + a);
            b.jump_target = null
        }
    }
    if (b.options.auto_height) {
        this.adjustHeight(b)
    }
},
pageSelect: function (b, a, e) {
    var k, f, g, c, h, d, j;
    if (typeof b.selection != "string") {
        return
    }
    f = b.selection.split("/");
    k = f.pop().split("-");
    if (k.length > 1) {
        g = f.concat([k[1]]).join("/");
        f = f.concat([k[0]]).join("/")
    } else {
        f = b.selection
    }
    h = $("div.pagescroll a.f", a);
    if (b.options.paned) {
        h.filter(".more").removeClass("more-selected")
    }
    h.filter(":not(.more)").each(function () {
        var i = $(this);
        j = false;
        if (g) {
            if (i.attr("menuri") == f) {
                f = g;
                d = !d;
                j = true
            } else {
                j = d
            }
        } else {
            if (i.attr("menuri") == f && i[0] == (e || i[0])) {
                j = true
            }
        }
        if (j && !b.options.no_selected_class) {
            i.addClass("selected")
        } else {
            i.removeClass("selected")
        }
    })
},
clearPages: function (b, c, a) {
    DRE.assert(a in {
        next: 0,
        previous: 0
    });
    if (b.options.paned) {}
    a += "Sibling";
    while (c[a]) {
        c.parentNode.removeChild(c[a])
    }
},
adjustHeight: function (b, e) {
    e = e || b.pages[b.ri].node;
    var f = $("div.top", e)[0];
    var a = f ? f.offsetHeight : 0;
    var d = $("div.pagescroll", e)[0];
    d = d ? d.children : false;
    if (d) {
        for (var c = d.length - 1; c >= 0; c--) {
            a += d[c].offsetHeight
        }
    }
    b.node.style.height = a + "px";
    if (b.options.adjust_height_callback) {
        b.options.adjust_height_callback.call(this, b, e, a)
    }
},
showPage: function (c, b, f, a) {
    var e, g;
    e = c.pages[b].node;
    if (f) {
        if (!(a == "previous" && f.previousSibling == e)) {
            Pager.clearPages(c, f, a)
        }
        e.style.left = (parseInt(f.style.left) + f.offsetWidth * (a == "next" ? 1 : -1)) + "px"
    } else {
        a = "next";
        e.style.left = 0;
        while (c.node.firstChild.firstChild) {
            c.node.firstChild.removeChild(c.node.firstChild.firstChild)
        }
        c.node.firstChild.style.width = "auto"
    }
    if (a == "next") {
        c.node.firstChild.appendChild(e)
    } else {
        if (!(a == "previous" && f.previousSibling == e)) {
            c.node.firstChild.insertBefore(e, f)
        }
    }
    if (f) {
        if (c.options.paned) {
            c.node.firstChild.style.width = parseInt(c.node.firstChild.lastChild.style.left) + f.offsetWidth + "px";
            var d = $.inArray(b, c.options.no_scroll || []) < 0;
            if (d) {
                c.node.scrollLeft = parseInt(f.style.left) + f.offsetWidth
            }
        } else {
            Station.push(c.node.firstChild, "left", {
                from: parseInt(c.node.firstChild.style.left || 0),
                to: -parseInt(e.style.left),
                f: Interpolators.pulse,
                time: 350
            })
        }
    } else {
        c.node.firstChild.style.left = 0
    }
    c.last_loaded_ri = b
},
reload: function (b) {
    var a;
    a = b.last_loaded_ri || b.options.rootri;
    delete b.pages[a];
    Pager.loadPage(b, a)
},
editOn: function (a) {
    var b;
    if (a.getAttribute("menuri") && a.lastChild.nodeType != 1) {
        b = a.lastChild.nodeValue;
        if (!a.getAttribute("pager_original_text")) {
            a.setAttribute("pager_original_text", b)
        }
        a.removeChild(a.lastChild);
        $("<input>", {
            "class": "itext",
            type: "text",
            value: b,
            blur: function () {
                Pager.editOff(this.parentNode)
            },
            keypress: function (c) {
                if (c.keyCode == 13) {
                    this.blur()
                }
            }
        }).appendTo(a);
        a.lastChild.focus()
    }
},
editOff: function (a) {
    var b;
    b = a.lastChild.value;
    a.removeChild(a.lastChild);
    a.appendChild(document.createTextNode(b || "???"))
}
};
if (window.DWait) {
    DWait.run("jms/lib/pager.js")
}
DWait.ready(["jms/lib/pager.js", "jms/lib/menutraffic.js"], function () {
    Pager.overrides.push(function (e, k, f, b) {
        function a(i) {
            i = i.toLowerCase();
            i = i.replace(/ /g, "_");
            i = i.replace(/[^a-z0-9\-_]/g, "");
            if (i == "wow") {
                i = "surprise"
            }
            return i
        }
        var h, j, c, d, g;
        if (e.path[0] == "mood") {
            c = "";
            for (d = 1; d != e.path.length; d++) {
                c += a(MenuTraffic.cache[e.path.slice(0, d + 1).join("/")].title) + "/"
            }
            for (d = 0; h = e.children[d]; d++) {
                if (h.children) {
                    f.push('<a menuri="' + h.path.join("/") + '" href="/" onmouseover="if (!Browser.isIE)this.style.height = (this.nextSibling.offsetHeight-1) + \'px\';$(this.nextSibling).addClass(\'highlight\')" onmouseout="$(this.nextSibling).removeClass(\'highlight\')" class="rr f more" ' + b + '>more</a><a menuri="' + h.path.join("/") + '" href="/" class="ll f" ' + b + ">")
                } else {
                    if (h.path) {
                        f.push('<a menuri="' + h.path.join("/") + '" ')
                    } else {
                        f.push("<a ")
                    }
                    f.push('href="/" class="f" ' + b + ">")
                }
                g = c + a(h.title) + ".gif";
                k.icon_base_url = k.icon_base_url || "http://e.deviantart.com/emoticons/moods/";
                f.push('<img src="' + k.icon_base_url + g + '" alt=""/> ');
                f.push(h.title + "</a>")
            }
            return f
        }
        return false
    });
    if (window.DWait) {
        DWait.run("jms/lib/pager.js.mood.js")
    }
});
DWait.count();