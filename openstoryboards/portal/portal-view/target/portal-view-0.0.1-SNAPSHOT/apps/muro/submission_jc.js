/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
if (window.DWait) {
    DWait.run("jms/pages/submission.js")
}
window.SPDeviation = {
    showHelp: function (b) {
        var a = b.parentNode;
        if (hasClass(a, "helpactive")) {
            unsetClass(a, "helpactive")
        } else {
            setClass(a, "helpactive")
        }
        b.blur();
        return cancelEvent()
    },
    checkLoad: function (a, b) {
        if (typeof (window[a]) == "undefined") {
            if (!b) {
                alert("We are unable to process this request. It is possible that this page has not yet fully loaded. \nIf problem persists please try refreshing the page")
            }
            return false
        }
        return true
    },
    flipDownlodable: function (c) {
        var a = $("#watermark").get(0);
        var d = $("#devisdownloadable").get(0);
        if (a && d) {
            var b;
            if (!c) {
                var c = window.event
            }
            if (c.target) {
                b = c.target
            } else {
                if (c.srcElement) {
                    b = c.srcElement
                }
            }
            if (b && b.id == "watermark" && a.checked) {
                d.checked = false
            } else {
                if (b && b.id == "devisdownloadable" && d.checked) {
                    a.checked = false
                }
            }
        }
    },
    toggleWatermarker: function () {
        var a = $("#watermark").get(0);
        var b = $("#devsize").get(0);
        if (a && b && b.value) {
            if (b.value == 0) {
                a.checked = false;
                a.disabled = true
            } else {
                a.disabled = false
            }
        }
    },
    showEditFileModal: function () {
        this.deckModal("#deck_modal_file_layout", {
            show_text: false
        }, function (a) {
            if (a) {
                $("#deckPreviewId").val("");
                SPDeviation.deckSelect(a, false, true);
                SPDeviation.setDeviationThumb(a, "edit_image_thumb");
                $("#dont_notify_watchers").show();
                if (a.is_displayable) {
                    $("#change_button_preview").hide();
                    $("#generic_image_thumb").hide()
                } else {
                    if (a.status > Deck.STATUS_PROCESSING) {
                        $("#change_button_preview").show();
                        $("#generic_image_thumb").show()
                    } else {
                        $("#dont_notify_watchers").hide();
                        $("#change_button_preview").hide();
                        $("#edit_image_thumb").hide()
                    }
                }
            }
        })
    },
    showEditPreviewModal: function () {
        this.deckModal("#deck_modal_preview_layout", {
            show_text: false,
            filter: "displayable"
        }, function (a) {
            if (a && a.is_displayable) {
                $("#deckPreviewId").val(a.deckId);
                SPDeviation.setDeviationThumb(a, "edit_image_thumb");
                if (window.literatureEditMode) {
                    $("#previewKillerId").val("");
                    $("#remove_button_preview").show()
                }
            }
        })
    },
    showNewPreviewModal: function () {
        this.deckModal("#deck_modal_preview_layout", {
            show_text: false,
            filter: "displayable"
        }, function (a) {
            if (a && a.is_displayable) {
                SPDeviation.setDeviationThumb(a, "preview_thumb");
                $("#deckPreviewId").val(a.deckId)
            } else {
                $("#preview_thumb").attr("src", Deck.no_preview);
                $("#deckPreviewId").val("")
            }
        })
    },
    showNewReleaseModal: function () {
        this.deckModal("#deck_modal_file_layout", {
            show_text: false
        }, function (a) {
            if (a) {
                $("#deckNarfId").val(a.deckId);
                $("#model_release_info_id").val("Release form file <em>" + a.name + "</em> is chosen for submission.")
            } else {
                $("#model_release_info_id").val("No release form is selected")
            }
            $("#model_release_info_text_id").html($("#model_release_info_id").val())
        })
    },
    showNewPermissionModal: function () {
        this.deckModal("#deck_modal_file_layout", {
            show_text: false
        }, function (a) {
            if (a) {
                $("#deckSprfId").val(a.deckId);
                $("#permission_document_info_id").val("Permission document file <em>" + a.name + "</em> is chosen for submission.")
            } else {
                $("#permission_document_info_id").val("No permission document is selected")
            }
            $("#permission_document_info_text_id").html($("#permission_document_info_id").val())
        })
    },
    setDeviationThumb: function (a, c) {
        var b = $("#" + c).show();
        if (!a.height || a.height > 100) {
            b.height(100)
        } else {
            b.height(a.height)
        }
        b.attr("src", a.thumb_url || Deck.needs_preview)
    },
    toggleTextEditor: function () {
        if (!this.core_deck) {
            return
        }
        this.core_deck.uploader.showTextModal($("#existing_text_content").val(), false, function (a) {
            if (a == "ok") {
                $("#change_button_text").css("visibility", "hidden");
                $("#text_preview_spinner").show();
                $("#existing_text_preview").html("Processing, please wait");
                SPDeviation.deckUpload = SPDeviation.deckUpload_lit
            }
        });
        return cancelEvent()
    },
    deckUpload_lit: function (a) {
        if (!a.deckId) {
            $("#change_button_text").css("visibility", "hidden");
            $("#text_preview_spinner").show();
            $("#existing_text_preview").html("Processing, please wait");
            return
        }
        if (a.status == Deck.STATUS_NEEDS_PREVIEW || a.status == Deck.STATUS_ERROR) {
            $("#deckId_id").val(a.deckId);
            $("#existing_text_preview").html(a.text_preview);
            $("#dont_notify_watchers").show();
            $("#text_preview_spinner").hide();
            SPDeviation.deckUpload = false
        }
    },
    removePreview: function () {
        $("#deckPreviewId").val("");
        $("#previewKillerId").val("purge");
        $("#edit_image_thumb").height(100);
        $("#edit_image_thumb").attr("src", Deck.optional_preview);
        $("#remove_button_preview").hide();
        return cancelEvent()
    },
    toggleCommons: function () {
        if (SPDeviation.checkLoad("creativeCommons")) {
            creativeCommons.open()
        }
        return cancelEvent()
    },
    previewingDescription: false,
    doPreview: function (c) {
        var a = $("#devdesc");
        var d = encodeURI(a.val()).replace(/&/g, "%26").replace(/\+/g, "%2B");
        var b;
        if (d.length == 0) {
            return cancelEvent()
        }
        if (SPDeviation.previewingDescription) {
            $(c).find("span").text("Preview Description");
            b = $("#previewdiv").css("cursor", "default").hide();
            a.show();
            SPDeviation.previewingDescription = false;
            return cancelEvent()
        }
        SPDeviation.previewingDescription = true;
        $(c).find("span").text("Edit Description");
        var b = $("#previewdiv");
        if (!b.length) {
            b = $('<div class="previewcontainer" id="previewdiv"></div>');
            b.appendTo(a.parent())
        }
        b.css({
            cursor: "wait",
            width: (a[0].offsetWidth - 26) + "px"
        }).html("...").show();
        a....i++) {
        a = f.path.join("/");
        if (f.children != null) {
            html_class = "f more"
        } else {
            html_class = "f"
        }
        e.push('<a menuri="' + a + '" href="' + (f.path[0] == "artid" ? "http://browse.deviantart.com/" + f.path[1] + "/" : "") + '" class="' + html_class + '" ' + (g.path[1] == "frequent" ? ' title="' + f.title + '" ' : "") + c);
        if (f.children == null) {
            e.push(' ondblclick="Pager.clickBack(this);SuperArtSubmitZoneJapan.finish(this)" ')
        }
        e.push(">" + f.title + "</a>")
    }
    return e
}
return false
})
}
SuperArtSubmitZoneJapan.find5array_lookup = {
    1123: "Scraps",
    0: "Clear"
};
SuperArtSubmitZoneJapan.find5array = function () {
    if (SuperArtSubmitZoneJapan.find5array_sorted) {
        return SuperArtSubmitZoneJapan.find5array_sorted
    }
    var h = SuperArtSubmitZoneJapan.big_data.split("\n");
    var d = [];
    SuperArtSubmitZoneJapan.find5array_lookup = {
        1123: "Scraps",
        0: "Clear"
    };
    var f = {};
    for (var c = 0; c < h.length; c++) {
        var g = (h[c].match(/^[\.]+/) || [""])[0].length;
        var b = h[c].replace(/^[\.]+/, "");
        var a = 0;
        var e = [];
        while (a < g) {
            e.push(f[a]);
            a++
        }
        e.push(b.split(":")[0]);
        if (b.indexOf(":") > 0) {
            d.push({
                title: e.join(" / "),
                v: b.split(":")[1],
                s: 3
            });
            SuperArtSubmitZoneJapan.find5array_lookup[b.split(":")[1]] = e.join("/")
        }
        f[g] = b
    }
    SuperArtSubmitZoneJapan.find5array_sorted = SuperArtSubmitZoneJapan.SortByFrequency(d);
    return SuperArtSubmitZoneJapan.find5array_sorted
};
SuperArtSubmitZoneJapan.find5setupFrequent = function () {
    if (SuperArtSubmitZoneJapan.submit_frequent_catids) {
        return
    }
    var b = deviantART.pageData.submit_frequent;
    SuperArtSubmitZoneJapan.submit_frequent_catids = {};
    if (!b) {
        return
    }
    for (var a = 0; a < b.length; a++) {
        SuperArtSubmitZoneJapan.submit_frequent_catids[b[a].id] = Math.max(b[a].title.split("(")[1].split(")")[0], 1)
    }
};
SuperArtSubmitZoneJapan.SortByFrequency = function (a) {
    if (!SuperArtSubmitZoneJapan.submit_frequent_catids) {
        SuperArtSubmitZoneJapan.find5setupFrequent()
    }
    for (var b = 0; b < a.length; b++) {
        var c = a[b];
        if (SuperArtSubmitZoneJapan.submit_frequent_catids[c.v]) {
            c.s = 1 - Math.min(1, SuperArtSubmitZoneJapan.submit_frequent_catids[c.v] / 100)
        } else {
            if (/^(Photography)/.test(c.title)) {
                c.s = 1.1
            } else {
                if (/^(Digital Art|Traditional Art)/.test(c.title)) {
                    c.s = 2
                }
            }
        }
    }
    a.sort(function (e, d) {
        return e.s > d.s ? 1 : -1
    });
    return a
};
SuperArtSubmitZoneJapan.find5escape = function (a) {
    return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
};
SuperArtSubmitZoneJapan.find5over = function (c) {
    var a = jQuery(c);
    if (a.attr("title").length) {
        return
    }
    var b = a.attr("menuri");
    if (!b.length) {
        return
    }
    b = b.split("/")[1];
    DiFi.pushPublicStaticGet("Deck", "categoryPathHelp", [b], function (f, e) {
        if (f && e.response.content[0].description != null) {
            var d = e.response.content[0].description.replace(/<[^>]+>/g, "");
            var d = d.replace("\\", "");
            if (d == "") {
                d = "No category description."
            }
            a.attr("title", d)
        }
    });
    DiFi.send()
};
SuperArtSubmitZoneJapan.find5filter = function (c, a) {
    var b = new RegExp(SuperArtSubmitZoneJapan.find5escape(a).split("\\ ").join(".+"), "gi");
    return jQuery.grep(c, function (d) {
        return b.test(d.title || d.value || d)
    })
};
SuperArtSubmitZoneJapan.find5search = function (a, b) {
    b = $.extend({
        container_id: "#SuperArtSubmitZoneJapanSearch",
        show_empty_msg: true,
        remove_frequent_cats: false,
        total_results: 24
    }, b);
    DiFi.pushPublicStaticGet("Resources", "resultsFromQuery", ["meta:all boost:popular " + a, 0, b.total_results], function (o, g) {
        if (!o) {
            return array()
        }
        var p = jQuery(b.container_id);
        var m = g.response.content;
        var j = {
            all: null,
            title: null,
            path: ["artsubmit", "search", a],
            children: []
        };
        var l = new Array();
        if (b.remove_frequent_cats) {
            SuperArtSubmitZoneJapan.find5setupFrequent()
        }
        for (var h = 0; h < m.length; h++) {
            var q = [];
            var f = m[h].catid;
            if (b.remove_frequent_cats && SuperArtSubmitZoneJapan.submit_frequent_catids[f]) {
                continue
            }
            for (var e = 0; e < m[h].catinfo.length; e++) {
                q.push(m[h].catinfo[e].cattitle)
            }
            if (!l[f] && SuperArtSubmitZoneJapan.find5array_lookup[f]) {
                j.children.push({
                    href: "http://browse.deviantart.com/" + f + "/",
                    title: q.join(" / "),
                    path: ["artid", f],
                    children: false,
                    v: f,
                    s: 3
                })
            }
            l[f] = true
        }
        if (!b.remove_frequent_cats) {
            j.children = SuperArtSubmitZoneJapan.SortByFrequency(j.children)
        }
        if (m.length == 0 && b.show_empty_msg) {
            p.html('No suggested categories for "' + a + '" found.')
        } else {
            var n = Pager.render.menuHTML(j, {
                hide_backlink: true,
                return_html_as_array: true
            }, SuperArtSubmitZoneJapan.chooser.node);
            var c = false;
            p.html('Suggested categories for "' + a + '"').parent().find(".catf").remove();
            for (var h = 0; h < n.length; h += 2) {
                var d = n[h] + n[h + 1];
                var d = jQuery(n[h] + n[h + 1]);
                if (c) {
                    c.after(d)
                } else {
                    p.after(d)
                }
                var c = d
            }
        }
    });
    DiFi.send()
};
SuperArtSubmitZoneJapan.find5 = function (e, f, g, a) {
    var d = SuperArtSubmitZoneJapan.find5filter(f, e[0]);
    var b = {};
    for (var c = 0; c < d.length; c++) {
        b[d[c].v] = d[c].title
    }
    if (d.length == 0) {
        SuperArtSubmitZoneJapan.find5search(e[0], {
            container_id: "#SuperArtSubmitZoneJapanSearch",
            show_empty_msg: true,
            remove_frequent_cats: false
        });
        b[0] = "Searching for categories..."
    }
    return b
};
SuperArtSubmitZoneJapan.suggestBasedOnTitle = function () {
    var a = $("input[name=devtitle]").val();
    if (!a || a.length == 0 || !a.match(/\S/) || a.length < 3) {
        return
    }
    SuperArtSubmitZoneJapan.find5search(a, {
        container_id: "#SuperArtSubmitZoneJapanSearchTitle",
        show_empty_msg: false,
        remove_frequent_cats: true,
        total_results: 10
    })
};
if (window.DWait) {
    DWait.run("jms/lib/pager.js.artsubmit.js")
}
});
DWait.count();