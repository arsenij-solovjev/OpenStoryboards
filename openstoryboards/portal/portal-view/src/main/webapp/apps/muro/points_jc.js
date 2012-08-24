/*
 * Ã‚Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
DWait.ready(["jms/lib/jquery/jquery.current.js", "jms/legacy/modals.js", "jms/lib/gwebpage.js", "cssms/pages/misc/gmbutton2.css"], function () {
    (function (a) {
        window.PointsManager = {
            modal_action: ["Points", "transferModal"],
            openModal: function (b) {
                DiFi.pushPost("Points", "modal", [b || ""], bind(this, this.openCallback));
                DiFi.send()
            },
            openCallback: function (d, c) {
                if (!d || !c.response.content.html) {
                    if (c.response.content.error == "DiFi Security Access Error") {
                        return DiFi.stdErr("Please sign up or log in to give points.")
                    } else {
                        return DiFi.stdErr("Failed to load modal", c.response.content)
                    }
                }
                gWebPage.update(c.response.content);
                var b = a(c.response.content.html);
                setTimeout(bind(this, this.actualOpen, b), 50)
            },
            actualOpen: function (b) {
                Modals.push(b.get(0), bind(this, this.closeModal))
            },
            closeModal: function (d, c) {
                if (d != "OK") {
                    return
                }
                var b = this.buildArgs(c);
                DiFi.pushPost(this.modal_action[0], this.modal_action[1], b, this.transferCallback.bindTo(this));
                DiFi.send()
            },
            buildArgs: function (c) {
                var b = 0;
                if (c.tosagree) {
                    b = 1
                }
                return [c.toName, a.trim(c.numPoints), c.memo, c.userpass, b]
            },
            transferCallback: function (c, b) {
                if (b.response.status == "SUCCESS") {
                    Modals.push(a(b.response.content.html).get(0))
                } else {
                    if (b.response.content.error.code == "INSUFFICIENT_FUNDS") {
                        MorePointsManager.openModal()
                    } else {
                        this.displayErrors([b.response.content.error.human])
                    }
                }
            },
            displayErrors: function (d) {
                var b = a('<div id="pointsModalError"><div class="error_icon"></div><div class="header">There were problems with your submission:</div></div>');
                var c = a('<ul id="pointsModalErrorList"></ul>').appendTo(b);
                a.each(d, function (e, f) {
                    c.append("<li>" + f + "</li>")
                });
                Modals.push(b.get(0))
            }
        };
        window.MorePointsManager = {
            openModal: function () {
                this.cart_products = {};
                this.cart_points = 0;
                this.cart_purchase = 0;
                DiFi.pushPost("Points", "morePointsModal", [], bind(this, this.openCallback));
                DiFi.send()
            },
            openCallback: function (e, d) {
                if (!e || !d.response.content.html) {
                    return DiFi.stdErr("Failed to load modal", d.response.content)
                }
                gWebPage.update(d.response.content);
                var b = a(d.response.content.html);
                var c = this;
                b.find(".pointsButtons .addpoints").click(function (g) {
                    g.preventDefault();
                    var f = parseInt(a(this).attr("rel"));
                    c.addPoints(b, f)
                });
                b.find(".pointsButtons .removepoints").click(function (g) {
                    g.preventDefault();
                    if (a(this).is(".disabled")) {
                        return false
                    }
                    var f = parseInt(a(this).attr("rel"));
                    c.removePoints(b, f)
                });
                b.find(".tosagree").click(bind(this, this.updateCart, b));
                setTimeout(bind(this, this.actualOpen, b), 50)
            },
            actualOpen: function (b) {
                Modals.push(b.get(0))
            },
            addPoints: function (b, d) {
                if (!this.cart_products[d]) {
                    this.cart_products[d] = 0
                }
                this.cart_products[d]++;
                this.cart_points = this.cart_points + d;
                var c = parseFloat(d / 80);
                this.cart_purchase = this.cart_purchase + c;
                a(".buttonHolder .removepoints[rel=" + d + "]").removeClass("disabled");
                this.updateCart(b)
            },
            removePoints: function (b, d) {
                if (!this.cart_products[d] || this.cart_products[d] < 1) {
                    return
                }
                this.cart_products[d]--;
                this.cart_points = this.cart_points - d;
                var c = parseFloat(d / 80);
                this.cart_purchase = this.cart_purchase - c;
                if (this.cart_products[d] < 1) {
                    a(".buttonHolder .removepoints[rel=" + d + "]").addClass("disabled")
                }
                this.updateCart(b)
            },
            updateCart: function (b) {
                b.find(".pointsQuant").val(this.cart_points);
                b.find(".pointsAdded").html(this.add_commas(this.cart_points));
                b.find(".pointsCost").html(this.add_commas(this.cart_purchase));
                if (this.cart_points > 0 && b.find(".tosagree").is(":checked")) {
                    b.find(".checkoutButton").addClass("checkoutButtonActive");
                    b.find(".checkoutButton").removeClass("disabledbutton")
                } else {
                    b.find(".checkoutButton").removeClass("checkoutButtonActive");
                    b.find(".checkoutButton").addClass("disabledbutton")
                }
            },
            add_commas: function (c) {
                c += "";
                x = c.split(".");
                x1 = x[0];
                x2 = x.length > 1 ? "." + x[1] : "";
                var b = /(\d+)(\d{3})/;
                while (b.test(x1)) {
                    x1 = x1.replace(b, "$1,$2")
                }
                return x1 + x2
            }
        }
    })(jQuery);
    if (window.DWait) {
        DWait.run("jms/pages/pointsmodal.js")
    }
});
DWait.ready(["jms/pages/pointsmodal.js"], function () {
    (function (a) {
        window.DD2PointsManager = a.extend({}, window.PointsManager, {
            modal_action: ["Points", "convertModal"],
            openModal: function () {
                DiFi.pushPost("Points", "dd2Modal", [], bind(this, this.openCallback));
                DiFi.send()
            },
            buildArgs: function (c) {
                var b = 0;
                if (c.tosagree) {
                    b = 1
                }
                return [c.userpass, b]
            }
        });
        a("a#convert-points").live("click", function (b) {
            b.preventDefault();
            DD2PointsManager.openModal()
        });
        if (/\?.*convertdd2points/.test(location.href)) {
            DD2PointsManager.openModal()
        }
    })(jQuery);
    if (window.DWait) {
        DWait.run("jms/pages/dd2points.js")
    }
});
DWait.ready(["cssms/lib/points_tos.css", "jms/lib/jquery/jquery.current.js", "jms/legacy/modals.js"], function () {
    (function (b) {
        var a = Base.extend({
            show: function () {
                DiFi.pushPost("Points", "tos", [], this._handle);
                DiFi.send();
                return false
            },
            _handle: function (e, d) {
                if (d.response.status != "SUCCESS") {
                    return
                }
                var f = $('<div class="tosModal"><h2>Terms &amp; Conditions</h2><div class="scroller"> </div></div>').find(".scroller").append(d.response.content).end();
                if (b.location != b.parent.location && $(b).width() <= 500) {
                    f.css({
                        width: ($(b).width() - 30),
                        height: ($(b).height() - 100)
                    })
                }
                var c = Modals.factory(f, {
                    cssShadows: true,
                    showCloseButton: true
                });
                c.addButton("Close", "smbutton-green");
                Modals.push(c);
                f.find(".scroller").height(f.height() - 50)
            }
        });
        b.pointstos = new a()
    })(window);
    if (window.DWait) {
        DWait.run("jms/pages/pointstos.js")
    }
});
DWait.count();