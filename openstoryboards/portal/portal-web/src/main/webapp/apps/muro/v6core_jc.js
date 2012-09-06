/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.FilmBox = {
    hover: function (e) {
        var d, f, b, c;
        d = e.clientWidth || e.offsetWidth;
        e = e.getElementsByTagName("b")[0];
        Station.stopAnimation(e);
        f = parseInt(Station.read(e, "left")) || 0;
        b = [e, "left"];
        while (f > -(d * 5)) {
            b = b.concat([{
                from: f,
                to: f = ((f - d) - (f % d)),
                time: 300,
                f: Interpolators.pulse
            }, {
                from: f,
                to: f,
                time: 700
            }])
        }
        Station.run.apply(Station, b)
    },
    out: function (b) {
        b = b.getElementsByTagName("b")[0];
        Station.stopAnimation(b);
        Station.run(b, "display", {
            to: "block",
            time: 25
        }, "left", {
            from: parseInt(Station.read(b, "left") || 0),
            to: 0,
            f: Interpolators.pulse,
            time: 600
        })
    }
};
if (window.DWait) {
    DWait.run("jms/lib/filmbox.js")
}
window.Subby = {
    warning: function (link, verb, resource) {
        var bubble, c;
        $(link).addClass("subble");
        bubble = $(link).data("subby");
        if (bubble) {
            bubble.css("display", "block")
        } else {
            bubble = $("<div>", {
                "class": "subblebubble"
            }).css("visibility", "hidden").append((verb || "Get") + " ").append(resource ? $("<strong>", {
                "class": "subby",
                html: resource
            }) : "this feature").append(" when you upgrade to ").append($("<strong>", {
                "class": "subby",
                html: "Premium Membership"
            }).css("whiteSpace", "nowrap")).append(".").append($("<div>", {
                "class": "bottom",
                text: "Click for more info."
            })).appendTo("body");
            $(link).data("subby", bubble)
        }
        with(Popup.getPosition({
            node: bubble[0],
            options: {}
        }, Ruler.document.node(link))) {
            bubble.css("left", x + "px");
            bubble.css("top", y + "px")
        }
        bubble.css("visibility", "visible")
    },
    out: function (c) {
        var b;
        b = $(c).data("subby");
        if (b) {
            b.css("display", "none");
            b.css("visibility", "hidden")
        }
        $(c).removeClass("subble")
    }
};
if (window.DWait) {
    DWait.run("jms/pages/subby.js")
}
window.popupSitback = function (h, g, d, b) {
    var f = "http://justsitback.deviantart.com";
    var e = "menubar=no,width=640,height=480,toolbar=no,status=no,location=no,directories=no,resizable=yes";
    if (vms_feature("html5_sitback")) {
        e = "menubar=no,width=640,height=510,toolbar=no,status=no,location=no,directories=no,resizable=yes"
    }
    if (Browser.isIE) {
        h = "Slideshow"
    }
    var c = f + "?title=" + encodeURIComponent(h) + "&rssQuery=" + encodeURIComponent(g);
    window.open(c, "SitBack", e);
    if (window.event) {
        event.cancelBubble = true
    }
    return false
};
if (window.DWait) {
    DWait.run("jms/pages/sitback.js")
}
DWait.ready(["jms/lib/jquery/jquery.current.js"], function () {
    (function (b) {
        b(function () {
            var c;
            if (b("body").hasClass("maturehide") && (c = b("#browse2 .tt-ismature").length) && (b("#browse2 .tt-a").length == c)) {
                b("#maturehider_explanation").show()
            }
        })
    })(jQuery);
    if (window.DWait) {
        DWait.run("jms/pages/browsesearch.js")
    }
});
DWait.ready(["jms/lib/jquery/jquery.current.js", "jms/lib/quantcast.js", "jms/lib/dtlocal.js", "jms/lib/bind.js", "jms/pages/ccommentthread.js"], function () {
    DWait.ready("jms/lib/gmi.js", function () {
        window.TalkPostWrapper = GMIBase.extend({
            gmiConstructor: function () {
                console.log("GMI Constructor");
                var c;
                this.talkpost = new TalkPost(this);
                this.talkpost.node = this.gmi_node;
                this.talkpost.comment = this.gmi_args;
                this.reset = bind(this.talkpost, this.talkpost.reset);
                this.talkpost.hookDrawingUI();
                $(this.gmi_node).data("TalkPost", this.talkpost);
                this.textarea = this.gmi_node.getElementsByTagName("textarea")[0];
                c = this.getCacheName();
                if (TalkPostWrapper.textCache[c]) {
                    this.textarea.value = TalkPostWrapper.textCache[c].shift() || ""
                }
                this.refreshTextareaState();
                this.textarea.onfocus = bind(this, this.textareaFocus);
                this.textarea.onblur = bind(this, this.textareaBlur);
                this.stdPostHook();
                $(document.documentElement).bind("keydown", this.keypress = bind(this, this.keypress))
            },
            gmiDestructor: function () {
                var c;
                $(document.documentElement).unbind("keydown", this.keypress);
                if (this.textarea) {
                    c = this.getCacheName();
                    if (!TalkPostWrapper.textCache[c]) {
                        TalkPostWrapper.textCache[c] = []
                    }
                    TalkPostWrapper.textCache[c].push(this.textarea.value || "")
                }
                this.talkpost.localDestroy()
            },
            previewClick: function () {
                this.talkpost.confirmPreview()
            },
            sendClick: function () {
                if (window.event) {
                    event.cancelBubble = true
                }
                this.talkpost.confirmPost();
                return false
            },
            getCacheName: function () {
                return [this.gmi_args.typeid || "", this.gmi_args.itemid || "", this.gmi_args.parentid || "", this.gmi_args.time_index || ""].join(":")
            },
            keypress: function (c) {
                this.tab_pressed = (c.keyCode == 9);
                if (this.textarea_focused && (c.keyCode == 13 || c.keyCode == 10) && (((Browser.isMac && c.metaKey) && !Browser.isOpera) || c.ctrlKey)) {
                    c.target.blur();
                    return this.sendClick()
                }
            },
            setCallback: function (c) {
                this.talkpost.callback = c
            },
            hookSend: function () {
                var c, d;
                c = this.talkpost.node.getElementsByTagName("input");
                c[c.length - 1].onclick = bind(this, this.sendClick)
            },
            stdPostHook: function (c) {
                this.setCallback(bind(this, this.stdPostHookDone));
                this.hookSend();
                if (c) {
                    var d = document.createElement("div");
                    d.innerHTML = ('<table class="f full"><tr><td class="f"><div class="exofilo" style="float:left;margin-top:20px;margin-right:12px"><div id="gmi-ExoFilo" name="gmi-ExoFilo"></div><div id="gmi-ExoFilo" name="gmi-ExoFilo"></div></div></td><td class="f"></tr></table>');
                    this.gmi_node.parentNode.insertBefore(d.firstChild, this.gmi_node);
                    this.talkpost.exo_files = GMI.query(this.gmi_node.parentNode, "ExoFilo");
                    this.gmi_node.previousSibling.getElementsByTagName("td")[1].appendChild(this.gmi_node)
                }
            },
            stdPostHookDone: function (f, d) {
                var c, g, e, h;
                TalkPostWrapper.one_comment_p...ue;
                if (f.response.content.can_report_all && d && (confirm("Would you also like to scan for comments by " + e + d + " on your user page, deviations, journals, etc.?"))) {
                    DiFi.pushPost("CommentAttributes", "removeSpamOnUser", [d], function (i, h) {
                        if (i) {
                            alert("The process of removing spam from your user page, deviations, journals, etc., has started.\nYou will be notified with a note once this is complete.")
                        } else {
                            alert("deviantART was unable to start the process of removing all spam by this user.\nWe appreciate your effort, and ask you to please try again shortly.")
                        }
                    });
                    DiFi.timer(1)
                } else {
                    alert("Thank you for your report.")
                }
            }
        case "hide":
            this.makeUnhideLink();
            this.setHideState(true);
            break;
        case "unhide":
            this.setHideState(false);
            break
        }
        }, makeUnhideLink: function () {
            var b, c;
            b = (this.gmi_node.getElementsByTagName("a") || [])[0];
            if (!b || b.className != "creason") {
                b = document.createElement("a");
                b.onclick = bind(this, this.unhideClick);
                b.href = "#";
                b.className = "creason";
                c = this.gmi_node.getElementsByTagName("div")[0];
                c.insertBefore(b, c.firstChild)
            }
            b.innerHTML = "<span>" + (this.permahidden ? "Flagged as Spam" : "Hidden by Owner") + "</span><em>" + (this.permahidden ? "Peek" : "Undo Hide") + "</em>"
        },
        setHideState: function (b) {
            if (b) {
                this.gmi_node.className += " ccomment-hidden"
            } else {
                this.gmi_node.className = this.gmi_node.className.replace(/\bccomment.hidden\b/g, "")
            }
        }
    });
    if (window.DWait) {
        DWait.run("jms/pages/ccomment.js")
    }
});
window.TabledResourceStream = ResourceStream.extend({
    domFindVisible: function () {
        var b, d, g, f;
        d = {};
        f = 0;
        var e = $(this.gmi_node).find(".tt-a, .rs-customicon-cont, .gl-text");
        for (b = 0; g = e[b]; b++) {
            if (!g.getAttribute("rs_ignore")) {
                d[(f++) + this.gs_offset] = g
            }
        }
        return d
    },
    dataFetch: function () {},
    gmiConstructor: function () {
        this.preview_override_selection_type = TabledResourceStreamSimpleSelection;
        this.base()
    }
});
window.TabledResourceStreamSimpleSelection = window.ResourceStreamSimpleSelection.extend({
    getAllSelectable: function () {
        return $(".tt-a", this.root).toArray()
    },
    isSelectable: function (b) {
        return $(b).hasClass("tt-a")
    }
});
if (window.DWait) {
    DWait.run("jms/lib/gstream/tabled_resource_stream.js")
}
DWait.ready(["jms/lib/Base.js", "jms/legacy/modals.js", "jms/lib/jquery/plugins/jquery.ba-postmessage.js"], function () {
    SignupBase = Base.extend({
        constructor: function () {
            if ($.receiveMessage) {
                $.receiveMessage(function (b) {
                    Modals.pop("finished")
                }, "http://verify.deviantart.com")
            }
        },
        modalUp: false,
        dificalls: [],
        modal: function (b, e, h) {
            var i, g, d = "475";
            if (h) {
                g = h
            } else {
                var f = location.hostname.split(".")[0];
                if (window.location.hostname.match(/sta.sh$/)) {
                    g = "https://sta.sh/login/oauth/modal";
                    d = "550"
                } else {
                    if (((window.deviantART || {}).deviant || {}).id) {
                        g = "http://verify.deviantart.com/?from=Modal&subdomain=" + f + "&referrer=" + encodeURIComponent(location.href)
                    } else {
                        g = "https://www.deviantart.com/join/?joinview=Modal&module=" + e.request["class"] + "&subdomain=" + f
                    }
                }
            }
            i = $('<div class="secure" style="width:592px"><div style="margin:10px 20px 10px 20px"><h3 style="color: #424e4d; font-size: 20px">Sign Up or Log In</h3></div><div style="height:' + d + 'px; position: relative; overflow: hidden;"><div id="loading_iframe" style="text-align: center; font-weight: bold; font-size: 1.2em; padding-top: 25%; width: 100%;"><img src="http://s.deviantart.com/emoticons/e/eager.gif" />Loading&hellip;</div><iframe scrolling="no" allowtransparency="true" src="' + g + '" frameBorder="0" style="border:0;width:100%;height:100%; position: absolute; top: 0; left: 0; z-index: 100; overflow: hidden; display: none;" onload="$(this).show().closest(\'.secure\').addClass(\'loaded\').parent().width(592); $(\'#loading_iframe\').hide();"></iframe></div></div>')[0];
            Modals.lightfade = true;
            this.dificalls.push([b, e]);
            if (!this.modalUp) {
                var c = Modals.factory(i);
                Modals.push(c, bind(this, this.done), "join-modal")
            }
            this.modalUp = true
        },
        done: function (g) {
            this.modalUp = false;
            var c, b, f, d = false;
            while (c = this.dificalls.pop()) {
                b = c[0];
                f = c[1];
                if (g == "finished" && f) {
                    d = true;
                    DiFi.pushPost(f.request["class"], f.request.method, f.request.args, b[0][0], b[1][0])
                } else {
                    b[0][0].call(b[1][0], g == "finished", f, true)
                }
            }
            if (d) {
                var e = window.location.hostname.match(/sta.sh$/) ? "Stash" : "DAWebpageHeader";
                DiFi.pushPrivateGet(e, "getHeaderHTML", [], this.headerRefresh);
                DiFi.send()
            }
        },
        headerRefresh: function (c, b) {
            if (c) {
                $("#overhead-sc").fadeOut(function () {
                    gWebPage.update(b.response.content);
                    $(this).html(b.response.content.html).fadeIn()
                });
                $("#overhead tr").fadeOut(function () {
                    gWebPage.update(b.response.content);
                    $(this).html(b.response.content.html).fadeIn()
                })
            } else {
                console.log("Err", b.response.content)
            }
        }
    });
    window.Signup = new SignupBase();
    if (window.DWait) {
        DWait.run("jms/pages/signup.js")
    }
});
DiFi.errorHooks.push(function (d, c, b) {
    if (!d && c.response.content && c.response.content.error == "DiFi Security Access Error" && c.response.content.details.privs && ((((c.response.content.details.privs[0] || [])[2] || [])[0] == PRIV_LOGGEDIN) || (((c.response.content.details.privs[0] || [])[2] || [])[0] == PRIV_VERIFIED)) && window.Signup && !window.location.hostname.match("dreamup")) {
        Signup.modal(b, c);
        return true
    }
});
if (window.DWait) {
    DWait.run("jms/pages/difi_errorhook_signup.js");
    /*
     * jQuery postMessage - v0.5 - 9/11/2009
     * http://benalman.com/projects/jquery-postmessage-plugin/
     *
     * Copyright (c) 2009 "Cowboy" Ben Alman
     * Dual licensed under the MIT and GPL licenses.
     * http://benalman.com/about/license/
     */
}(function ($) {
    var c, e, k = 1,
        b, g = this,
        h = !1,
        i = "postMessage",
        d = "addEventListener",
        f, j = g[i] && !$.browser.opera;
    $[i] = function (l, n, m) {
        if (!n) {
            return
        }
        l = typeof l === "string" ? l : $.param(l);
        m = m || parent;
        if (j) {
            m[i](l, n.replace(/([^:]+:\/\/[^\/]+).*/, "$1"))
        } else {
            if (n) {
                m.location = n.replace(/#.*$/, "") + "#" + (+new Date) + (k++) + "&" + l
            }
        }
    };
    $.receiveMessage = f = function (n, m, l) {
        if (j) {
            if (n) {
                b && f();
                b = function (o) {
                    if ((typeof m === "string" && o.origin !== m) || ($.isFunction(m) && m(o.origin) === h)) {
                        return h
                    }
                    n(o)
                }
            }
            if (g[d]) {
                g[n ? d : "removeEventListener"]("message", b, h)
            } else {
                g[n ? "attachEvent" : "detachEvent"]("onmessage", b)
            }
        } else {
            c && clearInterval(c);
            c = null;
            if (n) {
                l = typeof m === "number" ? m : typeof l === "number" ? l : 100;
                c = setInterval(function () {
                    var p = document.location.hash,
                        o = /^#?\d+&/;
                    if (p !== e && o.test(p)) {
                        e = p;
                        n({
                            data: p.replace(o, "")
                        })
                    }
                }, l)
            }
        }
    }
})(jQuery);
if (window.DWait) {
    DWait.run("jms/lib/jquery/plugins/jquery.ba-postmessage.js")
}(function (b) {
    b(".gmbutton2searchcancel").each(function () {
        var d = b(this);
        var e = d.parent().find("input.gmbutton2");
        d.click(function () {
            e.val("");
            e.change();
            d.parents("form").submit()
        });
        var c = function () {
                if (e.val()) {
                    d.addClass("show")
                } else {
                    d.removeClass("show")
                }
            };
        e.change(c);
        e.keyup(c);
        e.change()
    })
})(jQuery);
if (window.DWait) {
    DWait.run("jms/chrome/searchcancel.js")
}
DWait.ready([".jquery", ".domready"], function () {
    var b = window.location.href.substring(window.location.href.indexOf("?") + 1);
    $("a.expand").each(function () {
        var c = $(this).attr("href");
        if (c.substring(0, 9) != "#_expand_") {
            return
        }
        var e = c.substring(9);
        var d = $("div[skinscript=expandable_" + e + "]");
        if (!d.length) {
            return
        }
        d.hide();
        $(this).click(function () {
            d.toggle();
            return false
        });
        if (b == $(this).attr("href").substring(1) || b.match("_expand_all")) {
            $(this).click()
        }
    });
    if (window.DWait) {
        DWait.run("jms/pages/catskin-expander.js")
    }
});
DWait.count();