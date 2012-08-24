/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.DTask = Base.extend({
    constructor: function (a) {
        this.init(a)
    },
    init: function (c) {
        this.stop();
        c = c || {};
        this.id = c.id;
        var a = ["onComplete", "onStep", "totalSteps"];
        for (var b = 0; b < a.length; ++b) {
            var d = a[b];
            if (typeof c[d] == "undefined") {
                this.throwError('Missing argument "' + d + '"')
            }
        }
        this.onComplete = (typeof c.onComplete == "function") ? c.onComplete : this.throwError("Invalid onComplete handler.");
        this.onStep = (typeof c.onStep == "function") ? c.onStep : this.throwError("Invalid onStep handler.");
        this.onChunk = (typeof c.onChunk == "function") ? c.onChunk : false;
        this.interval = c.interval || 1;
        this.totalSteps = c.totalSteps || 1;
        this.chunkSize = c.chunkSize || ((this.totalSteps * 0.05) | 0) + 1;
        this.reset();
        return this
    },
    start: function () {
        if (!this.isRunning) {
            this.isPaused = false;
            this.doStep()
        }
        return this
    },
    end: function (a) {
        this.stop().onComplete(a);
        return this
    },
    pause: function () {
        if (this.isPaused) {
            this.start()
        } else {
            this.isPaused = true;
            this.stop()
        }
        return this
    },
    doStep: function () {
        if (this.onChunk) {
            this.onChunk(this.currentStep, this.totalSteps)
        }
        var a = Math.min((this.currentStep + this.chunkSize), this.totalSteps);
        while (this.currentStep < a) {
            this.onStep(this.currentStep++)
        }
        if (this.currentStep >= this.totalSteps) {
            this.isCompleted = true;
            return this.end(success = true)
        } else {
            this.timeoutId = setTimeout(this.doStep.bindTo(this), this.interval)
        }
        return this
    },
    stop: function () {
        clearTimeout(this.timeoutId);
        if (this.isRunning && !this.isPaused) {
            this.onComplete(success = false)
        }
        this.isRunning = false;
        return this
    },
    reset: function () {
        this.stop();
        this.currentStep = 0;
        this.isPaused = this.isRunning = this.isCompleted = false;
        return this
    },
    throwError: function (a) {
        var b = "[DTask " + (this.id ? '"' + this.id + '"' : "") + "] Error:";
        throw new Error(b + a)
    }
});
if (window.DWait) {
    DWait.run("jms/lib/dtask.js");
    /*
     *
     * jQuery $.getImageData Plugin 0.3
     * http://www.maxnov.com/getimagedata
     *
     * Written by Max Novakovic (http://www.maxnov.com/)
     * Date: Thu Jan 13 2011
     *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *
     * Includes jQuery JSONP Core Plugin 2.1.4
     * http://code.google.com/p/jquery-jsonp/
     * Copyright 2010, Julian Aubourg
     * Released under the MIT License.
     *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *
     * Copyright 2011, Max Novakovic
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://www.maxnov.com/getimagedata/#license
     *
     */
}(function (aa, X) {
    function E() {}
    function c(d) {
        W = [d]
    }
    function Y(d, g, f) {
        return d && d.apply(g.context || g, f)
    }
    function A(C) {
        function w(K) {
            !q++ && X(function () {
                p();
                l && (U[z] = {
                    s: [K]
                });
                B && (K = B.apply(C, [K]));
                Y(C.success, C, [K, m]);
                Y(g, C, [C, m])
            }, 0)
        }
        function u(K) {
            !q++ && X(function () {
                p();
                l && K != V && (U[z] = K);
                Y(C.error, C, [C, K]);
                Y(g, C, [C, K])
            }, 0)
        }
        C = aa.extend({}, N, C);
        var g = C.complete,
            B = C.dataFilter,
            d = C.callbackParameter,
            J = C.callback,
            t = C.cache,
            l = C.pageCache,
            I = C.charset,
            z = C.url,
            x = C.data,
            H = C.timeout,
            f, q = 0,
            p = E;
        C.abort = function () {
            !q++ && p()
        };
        if (Y(C.beforeSend, C, [C]) === false || q) {
            return C
        }
        z = z || R;
        x = x ? typeof x == "string" ? x : aa.param(x, C.traditional) : R;
        z += x ? (/\?/.test(z) ? "&" : "?") + x : R;
        d && (z += (/\?/.test(z) ? "&" : "?") + encodeURIComponent(d) + "=?");
        !t && !l && (z += (/\?/.test(z) ? "&" : "?") + "_" + (new Date).getTime() + "=");
        z = z.replace(/=\?(&|$)/, "=" + J + "$1");
        l && (f = U[z]) ? f.s ? w(f.s[0]) : u(f) : X(function (K, L, M) {
            if (!q) {
                M = H > 0 && X(function () {
                    u(V)
                }, H);
                p = function () {
                    M && clearTimeout(M);
                    K[D] = K[G] = K[y] = K[F] = null;
                    Z[v](K);
                    L && Z[v](L)
                };
                window[J] = c;
                K = aa(n)[0];
                K.id = k + b++;
                if (I) {
                    K[a] = I
                }
                var O = function (P) {
                        (K[G] || E)();
                        P = W;
                        W = undefined;
                        P ? w(P[0]) : u(j)
                    };
                if (h.msie) {
                    K.event = G;
                    K.htmlFor = K.id;
                    K[D] = function () {
                        /loaded|complete/.test(K.readyState) && O()
                    }
                } else {
                    K[F] = K[y] = O;
                    h.opera ? (L = aa(n)[0]).text = "jQuery('#" + K.id + "')[0]." + F + "()" : K[e] = e
                }
                K.src = z;
                Z.insertBefore(K, Z.firstChild);
                L && Z.insertBefore(L, Z.firstChild)
            }
        }, 0);
        return C
    }
    var e = "async",
        a = "charset",
        R = "",
        j = "error",
        k = "_jqjsp",
        G = "onclick",
        F = "on" + j,
        y = "onload",
        D = "onreadystatechange",
        v = "removeChild",
        n = "<script/>",
        m = "success",
        V = "timeout",
        h = aa.browser,
        Z = aa("head")[0] || document.documentElement,
        U = {},
        b = 0,
        W, N = {
            callback: k,
            url: location.href
        };
    A.setup = function (d) {
        aa.extend(N, d)
    };
    aa.jsonp = A
})(jQuery, setTimeout);
(function (a) {
    a.getImageData = function (c) {
        var d = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (c.url) {
            var e = location.protocol === "https:";
            var b = "";
            if (c.server && d.test(c.server) && (c.server.indexOf("https:") && (e || c.url.indexOf("https:")))) {
                b = c.server
            } else {
                b = "//img-to-json.appspot.com/?callback=?"
            }
            a.jsonp({
                url: b,
                data: {
                    url: escape(c.url)
                },
                dataType: "jsonp",
                timeout: 10000,
                success: function (h, f) {
                    var g = new Image();
                    a(g).load(function () {
                        this.width = h.width;
                        this.height = h.height;
                        if (typeof (c.success) == typeof (Function)) {
                            c.success(this)
                        }
                    }).attr("src", h.data)
                },
                error: function (g, f) {
                    if (typeof (c.error) == typeof (Function)) {
                        c.error(g, f)
                    }
                }
            })
        } else {
            if (typeof (c.error) == typeof (Function)) {
                c.error(null, "no_url")
            }
        }
    }
})(jQuery);
if (window.DWait) {
    DWait.run("jms/lib/jquery/plugins/jquery.getimagedata.js")
}
window.toHexByte = function (a) {
    a = parseInt(a);
    if (!a) {
        return "00"
    }
    a = a < 0 ? 0 : a > 255 ? 255 : a;
    return "0123456789ABCDEF".charAt((a - (a & 15)) >> 4) + "0123456789ABCDEF".charAt(a & 15)
};
window.rgbaToHex = function (a) {
    var b = toHexByte;
    return b(a[0]) + b(a[1]) + b(a[2]) + b(a[3])
};
window.hexToRgba = function (a) {
    return [parseInt(a.substr(0, 2), 16), parseInt(a.substr(2, 2), 16), parseInt(a.substr(4, 2), 16), parseInt(a.substr(6, 2), 16)]
};
window.interpolateColor = function (a, g, h) {
    var f = hexToRgba(a);
    var e = hexToRgba(g);
    var k = 1 - h;
    var b = parseInt(f[0] * k + e[0] * h);
    var d = parseInt(f[1] * k + e[1] * h);
    var j = parseInt(f[2] * k + e[2] * h);
    var c = parseInt(f[3] * k + e[3] * h);
    return [b, d, j, c]
};
window.HSVToHex = function (h, d, b) {
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
    return (toHexByte(e) + toHexByte(j) + toHexByte(a))
};
window.HexToHSV = function (d) {
    var k, t, b, g, q, a, p, f, c;
    k = d.substr(0, 2);
    g = parseInt((k).substring(0, 2), 16);
    t = d.substr(2, 2);
    q = parseInt((t).substring(0, 2), 16);
    b = d.substr(4, 2);
    a = parseInt((b).substring(0, 2), 16);
    var l = Math.max(g, q, a);
    var e = Math.min(g, q, a);
    var n = l - e;
    c = Math.round((l / 255) * 100);
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
    var m = c / 100;
    return [j, h, m]
};
if (window.DWait) {
    DWait.run("jms/pages/drawplz/colorlib.js")
}
PixelDeviator = Base.extend({
    constructor: function () {},
    _init: function (a, e, d, c) {
        this.name = a || "Pixel Deviator";
        this.kernel = e;
        this.radius = Math.sqrt(this.kernel.length);
        this.isSlow = false;
        this.preserveAlpha = false;
        this.factor = c || 0;
        if (isNaN(c)) {
            var b = e.length;
            while (b--) {
                this.factor += e[b]
            }
        }
        this.offset = isNaN(d) ? 0 : d;
        this.pixelData = null
    },
    getName: function () {
        return this.name
    },
    deviatePixels: function (f) {
        var H = f;
        var C = H.data;
        var m = H.width;
        var A = H.height;
        var a = 0;
        var G = this.pixelData = new Array(m * A << 2);
        var d = this.kernel;
        var b = this.radius;
        var g = this.factor;
        var c = this.offset;
        var u = (b - 1) >> 1;
        var n, z, B, D;
        var q, k, j, t, F, l, p, E, e;
        var v = m * A - 1;
        do {
            t = v % m;
            F = (v / m) | 0;
            l = d.length - 1;
            n = z = B = D = 0;
            do {
                e = d[l];
                k = t - u + (l % b);
                j = F - u + (l / b) | 0;
                k = k < 0 ? 0 : k > m - 1 ? m - 1 : k;
                j = j < 0 ? 0 : j > A - 1 ? A - 1 : j;
                q = (j * m + k) << 2;
                n += C[q + 0] * e;
                z += C[q + 1] * e;
                B += C[q + 2] * e;
                D += C[q + 3] * e
            } while (l--);
            n = (n / g + c + 0.5) | 0;
            z = (z / g + c + 0.5) | 0;
            B = (B / g + c + 0.5) | 0;
            D = (D / g + c + 0.5) | 0;
            n = n > 255 ? 255 : ...0, -1, 0]; this ._init("Sharpen More", a, 0, 1);
        this.isSlow = true
    }
});
FindEdgesFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [1, 1, 1, 1, -7, 1, 1, 1, 1];
        this._init("Find Edges", a, 0, 1);
        this.isSlow = true
    }
});
GlowingEdgesFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
        this._init("Glowing Edges", a, 0, 1);
        this.isSlow = true;
        this.preserveAlpha = true
    }
});
DarkSharpenFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [0, 0, 0, -1, 1.2, 0, 0, 0, 0];
        this._init("Dark Sharpen", a, 0, 1);
        this.isSlow = true;
        this.preserveAlpha = true
    }
});
EmbossFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
        this._init("Emboss Filter", a, 128, 1);
        this.isSlow = true
    }
});
MeanFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [1, 2, 3, 2, 1, 2, 4, 6, 4, 2, 3, 6, 9, 6, 3, 2, 4, 6, 4, 2, 1, 2, 3, 2, 1];
        this._init("Mean Filter", a, 0, 27);
        this.isSlow = true
    }
});
DesaturateFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [];
        this._init("Desaturate Filter", a, 0)
    },
    deviatePixels: function (g) {
        var c = g;
        var d = c.data;
        var b = c.width;
        var f = c.height;
        var j, a;
        var e = b * f;
        while (e--) {
            a = e << 2;
            j = ((d[a + 0] + d[a + 1] + d[a + 2]) / 3) | 0;
            d[a + 0] = d[a + 1] = d[a + 2] = j
        }
    },
    applyResultTo: function (a) {}
});
NoiseFilter = PixelDeviator.extend({
    constructor: function (a) {
        a = a || 0;
        a = a < 0 ? 0 : a > 1 ? 1 : a;
        var b = [];
        this._init("Noise Filter", b, 0, a)
    },
    deviatePixels: function (t) {
        var l = t;
        var c = l.data;
        var p = l.width;
        var e = l.height;
        var q, n, a, j, m;
        var k = this.factor;
        var d = p * e;
        while (d--) {
            q = d << 2;
            n = ((Math.random() - 0.5) * k * 255) | 0;
            a = c[q + 0] + n;
            j = c[q + 1] + n;
            m = c[q + 2] + n;
            c[q + 0] = a < 0 ? 0 : a > 255 ? 255 : a;
            c[q + 1] = j < 0 ? 0 : j > 255 ? 255 : j;
            c[q + 2] = m < 0 ? 0 : m > 255 ? 255 : m
        }
    },
    applyResultTo: function (a) {}
});
InvertColorsFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [];
        this._init("InvertColors Filter", a, 255, 1)
    },
    deviatePixels: function (g) {
        var c = g;
        var d = c.data;
        var b = c.width;
        var f = c.height;
        var a;
        var e = b * f;
        while (e--) {
            a = e << 2;
            d[a + 0] = 255 - d[a + 0];
            d[a + 1] = 255 - d[a + 1];
            d[a + 2] = 255 - d[a + 2]
        }
    },
    applyResultTo: function (a) {}
});
BrightnessFilter = PixelDeviator.extend({
    constructor: function (a) {
        a = a || 0;
        a = a < -1 ? -1 : a > 1 ? 1 : a;
        var b = [];
        this._init("Brightness Filter", b, 0, (a * 255) | 0)
    },
    deviatePixels: function (l) {
        var e = l;
        var a = e.data;
        var g = e.width;
        var d = e.height;
        var k, j;
        var f = this.factor;
        var c = g * d;
        while (c--) {
            j = c << 2;
            k = a[j + 0] + f;
            a[j + 0] = k < 0 ? 0 : k > 255 ? 255 : k;
            k = a[j + 1] + f;
            a[j + 1] = k < 0 ? 0 : k > 255 ? 255 : k;
            k = a[j + 2] + f;
            a[j + 2] = k < 0 ? 0 : k > 255 ? 255 : k
        }
    },
    applyResultTo: function (a) {}
});
LightenFilter = BrightnessFilter.extend({
    constructor: function (a) {
        this.base(a);
        this.name = "Lighten Filter"
    }
});
DarkenFilter = BrightnessFilter.extend({
    constructor: function (a) {
        this.base(-a);
        this.name = "Darken Filter"
    }
});
ContrastFilter = PixelDeviator.extend({
    constructor: function (a) {
        a = a || 0;
        a = a < -1 ? -1 : a > 1 ? 1 : a;
        a = (a + 1);
        a *= a;
        var b = [];
        this._init("Contrast Filter", b, 0, a)
    },
    deviatePixels: function (l) {
        var e = l;
        var a = e.data;
        var g = e.width;
        var d = e.height;
        var k, j;
        var f = this.factor;
        var c = g * d;
        while (c--) {
            j = c << 2;
            k = ((((a[j + 0] / 255 - 0.5) * f) + 0.5) * 255) | 0;
            a[j + 0] = k < 0 ? 0 : k > 255 ? 255 : k;
            k = ((((a[j + 1] / 255 - 0.5) * f) + 0.5) * 255) | 0;
            a[j + 1] = k < 0 ? 0 : k > 255 ? 255 : k;
            k = ((((a[j + 2] / 255 - 0.5) * f) + 0.5) * 255) | 0;
            a[j + 2] = k < 0 ? 0 : k > 255 ? 255 : k
        }
    },
    applyResultTo: function (a) {}
});
IncreaseContrastFilter = ContrastFilter.extend({
    constructor: function (a) {
        this.base(a);
        this.name = "Increase Contrast"
    }
});
DecreaseContrastFilter = ContrastFilter.extend({
    constructor: function (a) {
        this.base(-a);
        this.name = "Decrease Contrast"
    }
});
MedianFilter = PixelDeviator.extend({
    constructor: function () {
        var a = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        this._init("Median Filter", a, 0);
        this.rgbs = null;
        this.isSlow = true;
        this.suggestedChunkSize = 8000
    },
    deviatePixels: function (f) {
        var J = f;
        var G = J.data;
        var q = J.width;
        var D = J.height;
        var c = this.kernel;
        var a = this.radius;
        var j = this.factor;
        var b = this.offset;
        var g = this.kernel.length;
        var m = new Array(g),
            F = new Array(g),
            d = new Array(g);
        var z = (a - 1) >> 1;
        var u, l, k, v, I, p, t, H, e, A;
        var E = a * a;
        var C = E >> 1;
        var B = q * D - 1;
        do {
            A = 0;
            v = B % q;
            I = (B / q) | 0;
            p = c.length - 1;
            sumr = sumg = sumb = suma = 0;
            do {
                l = v - z + (p % a);
                k = I - z + (p / a) | 0;
                l = l < 0 ? 0 : l > q - 1 ? q - 1 : l;
                k = k < 0 ? 0 : k > D - 1 ? D - 1 : k;
                u = (k * q + l) << 2;
                m[A] = G[u + 0];
                F[A] = G[u + 1];
                d[A] = G[u + 2];
                A++
            } while (p--);
            combsort(m, E);
            combsort(F, E);
            combsort(d, E);
            u = B << 2;
            if (E % 2 == 1) {
                G[u + 0] = m[C];
                G[u + 1] = F[C];
                G[u + 2] = d[C]
            } else {
                if (a >= 2) {
                    G[u + 0] = (m[C] + m[C + 1]) >> 1;
                    G[u + 1] = (F[C] + F[C + 1]) >> 1;
                    G[u + 2] = (d[C] + d[C + 1]) >> 1
                }
            }
        } while (B--)
    },
    deviatePixel: function (g, b) {
        var K = g;
        var H = K.data;
        var t = K.width;
        var E = K.height;
        var d = this.kernel;
        var a = this.radius;
        var k = this.factor;
        var c = this.offset;
        var j = this.kernel.length;
        if (!this.rgbs) {
            this.rgbs = {
                reds: new Array(j),
                greens: new Array(j),
                blues: new Array(j)
            }
        }
        var p = this.rgbs.reds;
        var G = this.rgbs.greens;
        var e = this.rgbs.blues;
        var A = (a - 1) >> 1;
        var v, m, l, z, J, q, u, I, f, B;
        var F = a * a;
        var D = F >> 1;
        var C = b;
        B = 0;
        z = C % t;
        J = (C / t) | 0;
        q = d.length - 1;
        sumr = sumg = sumb = suma = 0;
        do {
            m = z - A + (q % a);
            l = J - A + (q / a) | 0;
            m = m < 0 ? 0 : m > t - 1 ? t - 1 : m;
            l = l < 0 ? 0 : l > E - 1 ? E - 1 : l;
            v = (l * t + m) << 2;
            p[B] = H[v + 0];
            G[B] = H[v + 1];
            e[B] = H[v + 2];
            B++
        } while (q--);
        combsort(p, F);
        combsort(G, F);
        combsort(e, F);
        v = C << 2;
        if (F % 2 == 1) {
            H[v + 0] = p[D];
            H[v + 1] = G[D];
            H[v + 2] = e[D]
        } else {
            if (a >= 2) {
                H[v + 0] = (p[D] + p[D + 1]) >> 1;
                H[v + 1] = (G[D] + G[D + 1]) >> 1;
                H[v + 2] = (e[D] + e[D + 1]) >> 1
            }
        }
    },
    applyResultTo: function (a) {
        this.rgbs = null
    }
});
if (window.DWait) {
    DWait.run("jms/pages/drawplz/filters.js");
    /*
// +----------------------------------------------------------------------+
// | Copyright (c) 2008- deviantART Inc. |
// +----------------------------------------------------------------------+
*/