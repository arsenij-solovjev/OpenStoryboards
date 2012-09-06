/*
 * Â© 2000-2012 deviantART, Inc. All rights reserved.
 */
window.ArithCoder = Base.extend({
    constructor: function (b, a) {
        this.logger = new StdLogger("ArithCode");
        this.VERSION = 1;
        this.BTOA = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~";
        this.radix = b;
        this.precision = a
    },
    reset: function () {
        this.freq = {};
        this.low = [];
        this.high = [];
        this.diff = [];
        for (var a = 0; a < this.precision; a++) {
            this.low[a] = 0;
            this.high[a] = this.radix - 1
        }
        this.diff = this.intArithAdd(this.intArithDiff(this.high, this.low), [1]);
        this.payload = ""
    },
    startStream: function () {
        this.buffer = ""
    },
    add: function (a) {
        this.buffer += a
    },
    streamSize: function () {
        return this.buffer.length
    },
    endStream: function () {
        var a = this.encode(this.buffer);
        this.buffer = "";
        return a
    },
    encode: function (h) {
        var e = {
            v: this.VERSION
        };
        this.reset();
        var a = {
            ZERO: 0,
            EOM: 1
        };
        this.total = h.length + 3;
        var g, k, j, b;
        for (var f = 0; f < h.length; f++) {
            g = h.charAt(f);
            if (!a[g]) {
                a[g] = 1
            } else {
                a[g]++
            }
        }
        var d = [];
        for (k in a) {
            d.push([k, a[k]])
        }
        d.sort(function (l, c) {
            return c[1] - l[1]
        });
        e.freq = d;
        e.total = this.total;
        this.freqTable(d);
        for (f = 0; f < h.length; f++) {
            this.step(h.charAt(f), true)
        }
        this.step("EOM", true);
        this.finalize();
        e.payload = this.payload;
        return JSON.stringify(e)
    },
    decode: function (a) {
        try {
            var c = JSON.parse(a);
            if (!c.freq) {
                return a
            }
            return this.decodeObj(c)
        } catch (b) {
            return a
        }
    },
    decodeObj: function (d) {
        if (!d.freq) {
            this.logger.log("Not an Arith Encoded Json");
            return d
        }
        this.reset();
        this.total = d.total;
        this.freqTable(d.freq);
        this.payload = d.payload;
        this.ptr = 0;
        this.code = [];
        for (var a = 0; a < this.precision; a++) {
            this.code.unshift(this.BTOA.indexOf(this.payload.charAt(this.ptr++)))
        }
        this.output = "";
        this.lastChar = null;
        while (this.ptr < this.payload.length && this.lastChar != "EOM") {
            if (!this.lastChar) {
                this.grabDecodeChar();
                if (this.lastChar == "EOM") {
                    break
                }
            }
            var b = this.lastChar;
            this.lastChar = null;
            this.step(b)
        }
        return this.output
    },
    grabDecodeChar: function () {
        for (var b in this.freq) {
            var d = this.freq[b];
            var a = this.intArithAdd(this.low, this.intArithDiv(this.intArithMult(this.diff, d.start), this.total, false));
            if (this.intArithCompare(a, this.code) <= 0) {
                var c = this.intArithAdd(this.low, this.intArithDiv(this.intArithMult(this.diff, (d.start + d.f)), this.total, false));
                if (this.intArithCompare(c, this.code) >= 0) {
                    if (b != "EOM") {
                        this.output += b
                    }
                    this.lastChar = b;
                    return
                }
            }
        }
    },
    freqTable: function (a) {
        this.freq = {};
        var b = 0;
        for (i = 0; i < a.length; i++) {
            key = a[i][0];
            frequency = a[i][1];
            if (!frequency) {
                frequency = 1
            }
            this.freq[key] = {
                f: frequency,
                start: b
            };
            b += frequency
        }
    },
    highLow: function (a) {
        this.high = this.intArithTrim(this.intArithDiff(this.intArithAdd(this.low, this.intArithDiv(this.intArithMult(this.diff, (a.start + a.f)), this.total, true)), [1]));
        this.low = this.intArithTrim(this.intArithAdd(this.low, this.intArithDiv(this.intArithMult(this.diff, a.start), this.total, false)))
    },
    getDiff: function () {
        this.diff = this.intArithAdd(this.intArithDiff(this.high, this.low), [1])
    },
    step: function (b) {
        var a = this.freq[b];
        this.highLow(a);
        this.getDiff();
        while (this.low[this.precision - 1] == this.high[this.precision - 1]) {
            this.payload += this.BTOA.charAt(this.low.pop());
            this.high.pop();
            this.low.unshift(0);
            this.high.unshift(this.radix - 1);
            this.getDiff();
            if (this.code && this.code.length > 0) {
                this.code.pop();
                this.code.unshift(this.BTOA.indexOf(this.payload.charAt(this.ptr++)))
            }
        }
    },
    finalize: function () {
        var a = this.intArithAdd(this.low, this.intArithDiv(this.intArithDiff(this.high, this.low), 2, true));
        while (a.length) {
            this.payload += this.BTOA.charAt(a.pop())
        }
    },
    intArithTrim: function (a) {
        while (a.length > this.precision) {
            if (a.pop() > 0) {
                throw "Overflow"
            }
        }
        return a
    },
    intArithCompare: function (d, c) {
        if (this.intArithTrim(d).length != this.intArithTrim(c).length) {
            return d.length - c.length
        }
        for (var e = d.length - 1; e >= 0; e--) {
            if (d[e] != c[e]) {
                return d[e] - c[e]
            }
        }
        return 0
    },
    intArithMult: function (d, f) {
        var b = [];
        var e = 0;
        for (var c = 0; c < d.length; c++) {
            var a = d[c] * f + e;
            if (a >= this.radix) {
                e = Math.floor(a / this.radix)
            } else {
                e = 0
            }
            b.push(a - (this.radix * e))
        }
        if (e) {
            b.push(e)
        }
        return b
    },
    intArithDiv: function (h, b, c) {
        var f = [];
        c = !! c;
        var j = 0;
        for (var d = h.length - 1; d >= 0; d--) {
            var a = (j * this.radix) + h[d];
            var e = a / b;
            var g = Math.floor(e);
            j = a - (g * b);
            f.unshift(g)
        }
        if (j && !c) {
            return this.intArithAdd(f, [1])
        } else {
            return f
        }
    },
    intArithAdd: function (e, d) {
        var h, g;
        var f = [];
        var j = 0;
        var c = Math.max(e.length, d.length);
        for (h = 0; h < c; h++) {
            if (h >= e.length) {
                g = d[h] + j
            } else {
                if (h >= d.length) {
                    g = e[h] + j
                } else {
                    g = e[h] + d[h] + j
                }
            }
            if (g >= this.radix) {
                j = Math.floor(g / this.radix);
                g -= j * this.radix
            } else {
                j = 0
            }
            f.push(g)
        }
        if (j) {
            f.push(j)
        }
        return f
    },
    intArithDiff: function (e, d) {
        var c = [];
        for (var f = 0; f < e.length; f++) {
            c.push(e[f])
        }
        if (c.length < d.length) {
            throw "Negative integer arithmetic"
        }
        for (f = 0; f < c.length; f++) {
            var g = (f >= d.length) ? 0 : d[f];
            if (c[f] < g) {
                if (f == c.length - 1) {
                    throw "Negative integer arithmetic"
                }
                c[f] += this.radix;
                c[f + 1] -= 1
            }
            c[f] -= g
        }
        return c
    }
});
if (window.DWait) {
    DWait.run("jms/lib/arithmetic_compressor.js");
    /*
// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Modifications for deviantART made by Michael Dewey.
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
//
// 3. Neither the name of this module nor the names of its contributors may
// be used to endorse or promote products derived from this software
// without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
}(function (k, l, c, j, n, g, b) {
    l.srand = function d() {
        return Math.random()
    };
    l.seedrandom = function h(o, s) {
        var q = [];
        var p;
        o = m(a(s ? [o, k] : arguments.length ? o : [new Date().getTime(), k, window], 3), q);
        p = new f(q);
        m(p.S, k);
        l.srand = function r() {
            var v = p.g(j);
            var u = b;
            var t = 0;
            while (v < n) {
                v = (v + t) * c;
                u *= c;
                t = p.g(1)
            }
            while (v >= g) {
                v /= 2;
                u /= 2;
                t >>>= 1
            }
            return (v + t) / u
        };
        return o
    };

    function f(v) {
        var s, q, x = this,
            w = v.length;
        var r = 0,
            p = x.i = x.j = x.m = 0;
        x.S = [];
        x.c = [];
        if (!w) {
            v = [w++]
        }
        while (r < c) {
            x.S[r] = r++
        }
        for (r = 0; r < c; r++) {
            s = x.S[r];
            p = e(p + s + v[r % w]);
            q = x.S[p];
            x.S[r] = q;
            x.S[p] = s
        }
        x.g = function o(E) {
            var C = x.S;
            var B = e(x.i + 1);
            var A = C[B];
            var z = e(x.j + A);
            var y = C[z];
            C[B] = y;
            C[z] = A;
            var D = C[e(A + y)];
            while (--E) {
                B = e(B + 1);
                A = C[B];
                z = e(z + A);
                y = C[z];
                C[B] = y;
                C[z] = A;
                D = D * c + C[e(A + y)]
            }
            x.i = B;
            x.j = z;
            return D
        };
        x.g(c)
    }
    function a(r, s, o, t, p) {
        o = [];
        p = typeof (r);
        if (s && p == "object") {
            for (t in r) {
                if (t.indexOf("S") < 5) {
                    try {
                        o.push(a(r[t], s - 1))
                    } catch (q) {}
                }
            }
        }
        return (o.length ? o : r + (p != "string" ? "\0" : ""))
    }
    function m(o, q, r, p) {
        o += "";
        r = 0;
        for (p = 0; p < o.length; p++) {
            q[e(p)] = e((r ^= q[e(p)] * 19) + o.charCodeAt(p))
        }
        o = "";
        for (p in q) {
            o += String.fromCharCode(q[p])
        }
        return o
    }
    function e(o) {
        return o & (c - 1)
    }
    b = l.pow(c, j);
    n = l.pow(2, n);
    g = n * 2;
    m(l.srand(), k)
})([], Math, 256, 6, 52);
if (window.DWait) {
    DWait.run("jms/lib/seededRandom.js")
}
DWait.count();