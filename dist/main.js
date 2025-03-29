var M0 = Object.defineProperty;
var L0 = (l, s, i) => s in l ? M0(l, s, { enumerable: !0, configurable: !0, writable: !0, value: i }) : l[s] = i;
var I = (l, s, i) => L0(l, typeof s != "symbol" ? s + "" : s, i);
var Br = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function xo(l) {
  return l && l.__esModule && Object.prototype.hasOwnProperty.call(l, "default") ? l.default : l;
}
var Nr = { exports: {} }, ms, lo;
function P0() {
  if (lo) return ms;
  lo = 1;
  var l = 1e3, s = l * 60, i = s * 60, o = i * 24, h = o * 7, v = o * 365.25;
  ms = function(F, m) {
    m = m || {};
    var R = typeof F;
    if (R === "string" && F.length > 0)
      return d(F);
    if (R === "number" && isFinite(F))
      return m.long ? C(F) : w(F);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(F)
    );
  };
  function d(F) {
    if (F = String(F), !(F.length > 100)) {
      var m = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        F
      );
      if (m) {
        var R = parseFloat(m[1]), k = (m[2] || "ms").toLowerCase();
        switch (k) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return R * v;
          case "weeks":
          case "week":
          case "w":
            return R * h;
          case "days":
          case "day":
          case "d":
            return R * o;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return R * i;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return R * s;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return R * l;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return R;
          default:
            return;
        }
      }
    }
  }
  function w(F) {
    var m = Math.abs(F);
    return m >= o ? Math.round(F / o) + "d" : m >= i ? Math.round(F / i) + "h" : m >= s ? Math.round(F / s) + "m" : m >= l ? Math.round(F / l) + "s" : F + "ms";
  }
  function C(F) {
    var m = Math.abs(F);
    return m >= o ? x(F, m, o, "day") : m >= i ? x(F, m, i, "hour") : m >= s ? x(F, m, s, "minute") : m >= l ? x(F, m, l, "second") : F + " ms";
  }
  function x(F, m, R, k) {
    var L = m >= R * 1.5;
    return Math.round(F / R) + " " + k + (L ? "s" : "");
  }
  return ms;
}
var ws, fo;
function R0() {
  if (fo) return ws;
  fo = 1;
  function l(s) {
    o.debug = o, o.default = o, o.coerce = x, o.disable = w, o.enable = v, o.enabled = C, o.humanize = P0(), o.destroy = F, Object.keys(s).forEach((m) => {
      o[m] = s[m];
    }), o.names = [], o.skips = [], o.formatters = {};
    function i(m) {
      let R = 0;
      for (let k = 0; k < m.length; k++)
        R = (R << 5) - R + m.charCodeAt(k), R |= 0;
      return o.colors[Math.abs(R) % o.colors.length];
    }
    o.selectColor = i;
    function o(m) {
      let R, k = null, L, T;
      function W(...H) {
        if (!W.enabled)
          return;
        const tt = W, it = Number(/* @__PURE__ */ new Date()), vt = it - (R || it);
        tt.diff = vt, tt.prev = R, tt.curr = it, R = it, H[0] = o.coerce(H[0]), typeof H[0] != "string" && H.unshift("%O");
        let xt = 0;
        H[0] = H[0].replace(/%([a-zA-Z%])/g, (Ft, ge) => {
          if (Ft === "%%")
            return "%";
          xt++;
          const Ce = o.formatters[ge];
          if (typeof Ce == "function") {
            const Lt = H[xt];
            Ft = Ce.call(tt, Lt), H.splice(xt, 1), xt--;
          }
          return Ft;
        }), o.formatArgs.call(tt, H), (tt.log || o.log).apply(tt, H);
      }
      return W.namespace = m, W.useColors = o.useColors(), W.color = o.selectColor(m), W.extend = h, W.destroy = o.destroy, Object.defineProperty(W, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => k !== null ? k : (L !== o.namespaces && (L = o.namespaces, T = o.enabled(m)), T),
        set: (H) => {
          k = H;
        }
      }), typeof o.init == "function" && o.init(W), W;
    }
    function h(m, R) {
      const k = o(this.namespace + (typeof R > "u" ? ":" : R) + m);
      return k.log = this.log, k;
    }
    function v(m) {
      o.save(m), o.namespaces = m, o.names = [], o.skips = [];
      const R = (typeof m == "string" ? m : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const k of R)
        k[0] === "-" ? o.skips.push(k.slice(1)) : o.names.push(k);
    }
    function d(m, R) {
      let k = 0, L = 0, T = -1, W = 0;
      for (; k < m.length; )
        if (L < R.length && (R[L] === m[k] || R[L] === "*"))
          R[L] === "*" ? (T = L, W = k, L++) : (k++, L++);
        else if (T !== -1)
          L = T + 1, W++, k = W;
        else
          return !1;
      for (; L < R.length && R[L] === "*"; )
        L++;
      return L === R.length;
    }
    function w() {
      const m = [
        ...o.names,
        ...o.skips.map((R) => "-" + R)
      ].join(",");
      return o.enable(""), m;
    }
    function C(m) {
      for (const R of o.skips)
        if (d(m, R))
          return !1;
      for (const R of o.names)
        if (d(m, R))
          return !0;
      return !1;
    }
    function x(m) {
      return m instanceof Error ? m.stack || m.message : m;
    }
    function F() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return o.enable(o.load()), o;
  }
  return ws = l, ws;
}
var ho;
function O0() {
  return ho || (ho = 1, function(l, s) {
    s.formatArgs = o, s.save = h, s.load = v, s.useColors = i, s.storage = d(), s.destroy = /* @__PURE__ */ (() => {
      let C = !1;
      return () => {
        C || (C = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), s.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function i() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let C;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (C = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(C[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function o(C) {
      if (C[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + C[0] + (this.useColors ? "%c " : " ") + "+" + l.exports.humanize(this.diff), !this.useColors)
        return;
      const x = "color: " + this.color;
      C.splice(1, 0, x, "color: inherit");
      let F = 0, m = 0;
      C[0].replace(/%[a-zA-Z%]/g, (R) => {
        R !== "%%" && (F++, R === "%c" && (m = F));
      }), C.splice(m, 0, x);
    }
    s.log = console.debug || console.log || (() => {
    });
    function h(C) {
      try {
        C ? s.storage.setItem("debug", C) : s.storage.removeItem("debug");
      } catch {
      }
    }
    function v() {
      let C;
      try {
        C = s.storage.getItem("debug");
      } catch {
      }
      return !C && typeof process < "u" && "env" in process && (C = process.env.DEBUG), C;
    }
    function d() {
      try {
        return localStorage;
      } catch {
      }
    }
    l.exports = R0()(s);
    const { formatters: w } = l.exports;
    w.j = function(C) {
      try {
        return JSON.stringify(C);
      } catch (x) {
        return "[UnexpectedJSONParseError]: " + x.message;
      }
    };
  }(Nr, Nr.exports)), Nr.exports;
}
var k0 = O0();
const Es = /* @__PURE__ */ xo(k0), ys = {};
function Ke(l) {
  if (!ys[l]) {
    const s = Es("ultraPacer:core");
    s(`loading debug for namespace "${l}"`), ys[l] = s.extend(l);
  }
  return ys[l];
}
function d_() {
  Es.enable("ultraPacer:core*"), Es("ultraPacer:core")("debug enabled");
}
const D0 = {
  rate: 6,
  // %
  span: 1e3,
  // m
  th: 750
  // m
};
function So(l, s) {
  (s === null || typeof s > "u") && (s = D0);
  let i = 0;
  return Array.isArray(l) ? i = (l[0] + l[1]) / 2 : i = l, i <= s.th ? 1 : (1 + s.rate / s.span / 100) ** (i - s.th);
}
const po = {
  baseline: 0,
  terrainScale: 1
};
function Wt(l, s = 0) {
  return Math.round(l * 10 ** s) / 10 ** s;
}
function yn(l, s, i, o, h) {
  return i + (h - l) / (s - l) * (o - i);
}
function bo(l, s, i) {
  let o = 0, h = 0;
  const v = [];
  for (o = 0; o < i.length; o++)
    if (i[o] < l[h])
      v.push(s[h]);
    else {
      for (; h < l.length - 1 && l[h + 1] <= i[o]; )
        h++;
      h === l.length - 1 || i[o] === l[h] ? v.push(s[h]) : v.push(yn(l[h], l[h + 1], s[h], s[h + 1], i[o]));
    }
  return v;
}
function Ao(l) {
  let s, i, o, h, v = 0, d = 0, w = 0, C = 0, x = 0;
  for (s = 0; s < l.length; s++)
    i = l[s][0], o = l[s][1], h = l[s][2], x += h, v += h * i, w += h * (i * i), d += h * o, C += h * (i * o);
  const F = (d * w - v * C) / (x * w - v * v);
  return [(x * C - v * d) / (x * w - v * v), F];
}
function Eo(l, s, i, o) {
  let h = 0, v = 0;
  const d = [];
  return i.forEach((w) => {
    for (; l[h] < w - o; )
      h++;
    for (h > 0 && l[h] >= w && h--; v < l.length - 1 && l[v + 1] <= w + o; )
      v++;
    v < l.length - 1 && l[v] <= w && v++;
    const C = Math.max(o, Math.abs(w - l[h]) + 1e-3, Math.abs(w - l[v]) + 1e-3), x = [];
    let F = 0;
    for (let m = h; m <= v; m++)
      F = (1 - (Math.abs(w - l[m]) / C) ** 3) ** 3, x.push([l[m], s[m], F]);
    d.push(Ao(x));
  }), d;
}
function Hr(l, s, i) {
  return Wt(l, i) < Wt(s, i);
}
function W0(l, s, i) {
  return Wt(l, i) > Wt(s, i);
}
function Cn(l, s, i) {
  return Wt(l, i) <= Wt(s, i);
}
function Kr(l, s, i) {
  return Wt(l, i) >= Wt(s, i);
}
function xn(l, s, i) {
  return Wt(l, i) === Wt(s, i);
}
const __ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interp: yn,
  interpArray: bo,
  linearRegression: Ao,
  req: xn,
  rgt: W0,
  rgte: Kr,
  rlt: Hr,
  rlte: Cn,
  round: Wt,
  wlslr: Eo
}, Symbol.toStringTag, { value: "Module" }));
function B0(l, s) {
  function i(o) {
    return o < l.noon ? o + 86400 : o;
  }
  if (s >= l.sunrise && s <= l.sunset)
    return 0;
  if (!isNaN(l.dawn) && !isNaN(l.dusk) && (s <= l.dawn || s >= l.dusk) || l.nadirAltitude > 0)
    return 1;
  {
    const o = l.nadirAltitude < -6 ? 1 : -(l.nadirAltitude / 6);
    return i(s) >= i(l.nadir) ? yn(
      i(isNaN(l.dawn) ? l.nadir : l.dawn),
      i(l.sunrise),
      o,
      0,
      i(s)
    ) : yn(
      i(l.sunset),
      i(isNaN(l.dusk) ? l.nadir : l.dusk),
      0,
      o,
      i(s)
    );
  }
}
function Io(l, s, i, o = po) {
  if (s === 1 || l >= i.sunrise && l <= i.sunset)
    return 1;
  (o === null || typeof o > "u") && (o = po);
  const h = o.terrainScale * (s - 1) + o.baseline, v = B0(i, l);
  return 1 + h * v;
}
const wn = [
  "altitude",
  "grade",
  "terrain",
  "heat",
  "dark",
  "fatigue",
  "strategy"
];
class ye {
  constructor(s) {
    I(this, "_data", {
      altitude: 1,
      grade: 1,
      terrain: 1,
      heat: 1,
      dark: 1,
      fatigue: 1,
      strategy: 1
    });
    I(this, "_combined");
    Object.assign(this, s);
  }
  init(s) {
    return wn.forEach((i) => this._data[i] = s), this;
  }
  get altitude() {
    return this._data.altitude;
  }
  set altitude(s) {
    this._data.altitude = s, delete this._combined;
  }
  get grade() {
    return this._data.grade;
  }
  set grade(s) {
    this._data.grade = s, delete this._combined;
  }
  get terrain() {
    return this._data.terrain;
  }
  set terrain(s) {
    this._data.terrain = s, delete this._combined;
  }
  get heat() {
    return this._data.heat;
  }
  set heat(s) {
    this._data.heat = s, delete this._combined;
  }
  get dark() {
    return this._data.dark;
  }
  set dark(s) {
    this._data.dark = s, delete this._combined;
  }
  get fatigue() {
    return this._data.fatigue;
  }
  set fatigue(s) {
    this._data.fatigue = s, delete this._combined;
  }
  get strategy() {
    return this._data.strategy;
  }
  set strategy(s) {
    this._data.strategy = s, delete this._combined;
  }
  get combined() {
    return this._combined === void 0 && (this._combined = wn.reduce((s, i) => s * this._data[i], 1)), this._combined;
  }
  /**
   * @param f - function to apply
   * @param factors - factor list to apply
   */
  applyEach(s, i) {
    wn.forEach((o) => this._data[o] = s(this._data[o], i[o]));
  }
  /**
   * get object representation
   */
  toObject() {
    return this._data;
  }
  /**
   * scale each factor
   * @param scale - scale to apply
   */
  scaleEach(s) {
    return wn.forEach((i) => this._data[i] *= s), delete this._combined, this;
  }
}
const N0 = {
  // f = a*x^2 + b*x
  // goes linear at lower and upper bounds
  a: 21e-4,
  b: 0.034,
  lower: {
    lim: -22,
    m: -0.0584,
    b: -0.0164
  },
  upper: {
    lim: 16,
    m: 0.1012,
    b: 0.4624
  }
};
function Fo(l, s) {
  return (s === null || typeof s > "u") && (s = N0), l < s.lower.lim ? s.lower.m * l + s.lower.b : l > s.upper.lim ? s.upper.m * l + s.upper.b : s.a * l ** 2 + s.b * l + 1;
}
function To(l, s) {
  if (!s) return 1;
  const i = l.tod;
  let o = 1;
  if (i > s.start && i < s.stop) {
    const h = (i - s.start) / (s.stop - s.start) * Math.PI;
    o += (s.max - s.baseline) * Math.sin(h) / 100;
  }
  return o += s.baseline / 100, o;
}
var Gn = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var U0 = Gn.exports, go;
function $0() {
  return go || (go = 1, function(l, s) {
    (function() {
      var i, o = "4.17.21", h = 200, v = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", d = "Expected a function", w = "Invalid `variable` option passed into `_.template`", C = "__lodash_hash_undefined__", x = 500, F = "__lodash_placeholder__", m = 1, R = 2, k = 4, L = 1, T = 2, W = 1, H = 2, tt = 4, it = 8, vt = 16, xt = 32, Pe = 64, Ft = 128, ge = 256, Ce = 512, Lt = 30, Sn = "...", Kn = 800, Yr = 16, bn = 1, Jn = 2, Xr = 3, nn = 1 / 0, Re = 9007199254740991, Zn = 17976931348623157e292, xe = NaN, P = 4294967295, $ = P - 1, q = P >>> 1, lt = [
        ["ary", Ft],
        ["bind", W],
        ["bindKey", H],
        ["curry", it],
        ["curryRight", vt],
        ["flip", Ce],
        ["partial", xt],
        ["partialRight", Pe],
        ["rearg", ge]
      ], j = "[object Arguments]", ft = "[object Array]", at = "[object AsyncFunction]", ot = "[object Boolean]", yt = "[object Date]", zt = "[object DOMException]", Pt = "[object Error]", Bt = "[object Function]", de = "[object GeneratorFunction]", dt = "[object Map]", Rt = "[object Number]", Oe = "[object Null]", Ct = "[object Object]", Nt = "[object Promise]", oe = "[object Proxy]", Vt = "[object RegExp]", ht = "[object Set]", _e = "[object String]", Yn = "[object Symbol]", Zo = "[object Undefined]", An = "[object WeakMap]", Yo = "[object WeakSet]", En = "[object ArrayBuffer]", rn = "[object DataView]", Qr = "[object Float32Array]", Vr = "[object Float64Array]", jr = "[object Int8Array]", ti = "[object Int16Array]", ei = "[object Int32Array]", ni = "[object Uint8Array]", ri = "[object Uint8ClampedArray]", ii = "[object Uint16Array]", si = "[object Uint32Array]", Xo = /\b__p \+= '';/g, Qo = /\b(__p \+=) '' \+/g, Vo = /(__e\(.*?\)|\b__t\)) \+\n'';/g, ks = /&(?:amp|lt|gt|quot|#39);/g, Ds = /[&<>"']/g, jo = RegExp(ks.source), tc = RegExp(Ds.source), ec = /<%-([\s\S]+?)%>/g, nc = /<%([\s\S]+?)%>/g, Ws = /<%=([\s\S]+?)%>/g, rc = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ic = /^\w*$/, sc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ai = /[\\^$.*+?()[\]{}|]/g, ac = RegExp(ai.source), ui = /^\s+/, uc = /\s/, oc = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, cc = /\{\n\/\* \[wrapped with (.+)\] \*/, lc = /,? & /, fc = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, hc = /[()=,{}\[\]\/\s]/, pc = /\\(\\)?/g, gc = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Bs = /\w*$/, dc = /^[-+]0x[0-9a-f]+$/i, _c = /^0b[01]+$/i, vc = /^\[object .+?Constructor\]$/, mc = /^0o[0-7]+$/i, wc = /^(?:0|[1-9]\d*)$/, yc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Xn = /($^)/, Cc = /['\n\r\u2028\u2029\\]/g, Qn = "\\ud800-\\udfff", xc = "\\u0300-\\u036f", Sc = "\\ufe20-\\ufe2f", bc = "\\u20d0-\\u20ff", Ns = xc + Sc + bc, Us = "\\u2700-\\u27bf", $s = "a-z\\xdf-\\xf6\\xf8-\\xff", Ac = "\\xac\\xb1\\xd7\\xf7", Ec = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Ic = "\\u2000-\\u206f", Fc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", qs = "A-Z\\xc0-\\xd6\\xd8-\\xde", Gs = "\\ufe0e\\ufe0f", zs = Ac + Ec + Ic + Fc, oi = "['’]", Tc = "[" + Qn + "]", Hs = "[" + zs + "]", Vn = "[" + Ns + "]", Ks = "\\d+", Mc = "[" + Us + "]", Js = "[" + $s + "]", Zs = "[^" + Qn + zs + Ks + Us + $s + qs + "]", ci = "\\ud83c[\\udffb-\\udfff]", Lc = "(?:" + Vn + "|" + ci + ")", Ys = "[^" + Qn + "]", li = "(?:\\ud83c[\\udde6-\\uddff]){2}", fi = "[\\ud800-\\udbff][\\udc00-\\udfff]", sn = "[" + qs + "]", Xs = "\\u200d", Qs = "(?:" + Js + "|" + Zs + ")", Pc = "(?:" + sn + "|" + Zs + ")", Vs = "(?:" + oi + "(?:d|ll|m|re|s|t|ve))?", js = "(?:" + oi + "(?:D|LL|M|RE|S|T|VE))?", ta = Lc + "?", ea = "[" + Gs + "]?", Rc = "(?:" + Xs + "(?:" + [Ys, li, fi].join("|") + ")" + ea + ta + ")*", Oc = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", kc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", na = ea + ta + Rc, Dc = "(?:" + [Mc, li, fi].join("|") + ")" + na, Wc = "(?:" + [Ys + Vn + "?", Vn, li, fi, Tc].join("|") + ")", Bc = RegExp(oi, "g"), Nc = RegExp(Vn, "g"), hi = RegExp(ci + "(?=" + ci + ")|" + Wc + na, "g"), Uc = RegExp([
        sn + "?" + Js + "+" + Vs + "(?=" + [Hs, sn, "$"].join("|") + ")",
        Pc + "+" + js + "(?=" + [Hs, sn + Qs, "$"].join("|") + ")",
        sn + "?" + Qs + "+" + Vs,
        sn + "+" + js,
        kc,
        Oc,
        Ks,
        Dc
      ].join("|"), "g"), $c = RegExp("[" + Xs + Qn + Ns + Gs + "]"), qc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Gc = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ], zc = -1, ct = {};
      ct[Qr] = ct[Vr] = ct[jr] = ct[ti] = ct[ei] = ct[ni] = ct[ri] = ct[ii] = ct[si] = !0, ct[j] = ct[ft] = ct[En] = ct[ot] = ct[rn] = ct[yt] = ct[Pt] = ct[Bt] = ct[dt] = ct[Rt] = ct[Ct] = ct[Vt] = ct[ht] = ct[_e] = ct[An] = !1;
      var ut = {};
      ut[j] = ut[ft] = ut[En] = ut[rn] = ut[ot] = ut[yt] = ut[Qr] = ut[Vr] = ut[jr] = ut[ti] = ut[ei] = ut[dt] = ut[Rt] = ut[Ct] = ut[Vt] = ut[ht] = ut[_e] = ut[Yn] = ut[ni] = ut[ri] = ut[ii] = ut[si] = !0, ut[Pt] = ut[Bt] = ut[An] = !1;
      var Hc = {
        // Latin-1 Supplement block.
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        Ç: "C",
        ç: "c",
        Ð: "D",
        ð: "d",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        Ñ: "N",
        ñ: "n",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ø: "O",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        Ý: "Y",
        ý: "y",
        ÿ: "y",
        Æ: "Ae",
        æ: "ae",
        Þ: "Th",
        þ: "th",
        ß: "ss",
        // Latin Extended-A block.
        Ā: "A",
        Ă: "A",
        Ą: "A",
        ā: "a",
        ă: "a",
        ą: "a",
        Ć: "C",
        Ĉ: "C",
        Ċ: "C",
        Č: "C",
        ć: "c",
        ĉ: "c",
        ċ: "c",
        č: "c",
        Ď: "D",
        Đ: "D",
        ď: "d",
        đ: "d",
        Ē: "E",
        Ĕ: "E",
        Ė: "E",
        Ę: "E",
        Ě: "E",
        ē: "e",
        ĕ: "e",
        ė: "e",
        ę: "e",
        ě: "e",
        Ĝ: "G",
        Ğ: "G",
        Ġ: "G",
        Ģ: "G",
        ĝ: "g",
        ğ: "g",
        ġ: "g",
        ģ: "g",
        Ĥ: "H",
        Ħ: "H",
        ĥ: "h",
        ħ: "h",
        Ĩ: "I",
        Ī: "I",
        Ĭ: "I",
        Į: "I",
        İ: "I",
        ĩ: "i",
        ī: "i",
        ĭ: "i",
        į: "i",
        ı: "i",
        Ĵ: "J",
        ĵ: "j",
        Ķ: "K",
        ķ: "k",
        ĸ: "k",
        Ĺ: "L",
        Ļ: "L",
        Ľ: "L",
        Ŀ: "L",
        Ł: "L",
        ĺ: "l",
        ļ: "l",
        ľ: "l",
        ŀ: "l",
        ł: "l",
        Ń: "N",
        Ņ: "N",
        Ň: "N",
        Ŋ: "N",
        ń: "n",
        ņ: "n",
        ň: "n",
        ŋ: "n",
        Ō: "O",
        Ŏ: "O",
        Ő: "O",
        ō: "o",
        ŏ: "o",
        ő: "o",
        Ŕ: "R",
        Ŗ: "R",
        Ř: "R",
        ŕ: "r",
        ŗ: "r",
        ř: "r",
        Ś: "S",
        Ŝ: "S",
        Ş: "S",
        Š: "S",
        ś: "s",
        ŝ: "s",
        ş: "s",
        š: "s",
        Ţ: "T",
        Ť: "T",
        Ŧ: "T",
        ţ: "t",
        ť: "t",
        ŧ: "t",
        Ũ: "U",
        Ū: "U",
        Ŭ: "U",
        Ů: "U",
        Ű: "U",
        Ų: "U",
        ũ: "u",
        ū: "u",
        ŭ: "u",
        ů: "u",
        ű: "u",
        ų: "u",
        Ŵ: "W",
        ŵ: "w",
        Ŷ: "Y",
        ŷ: "y",
        Ÿ: "Y",
        Ź: "Z",
        Ż: "Z",
        Ž: "Z",
        ź: "z",
        ż: "z",
        ž: "z",
        Ĳ: "IJ",
        ĳ: "ij",
        Œ: "Oe",
        œ: "oe",
        ŉ: "'n",
        ſ: "s"
      }, Kc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Jc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Zc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, Yc = parseFloat, Xc = parseInt, ra = typeof Br == "object" && Br && Br.Object === Object && Br, Qc = typeof self == "object" && self && self.Object === Object && self, Et = ra || Qc || Function("return this")(), pi = s && !s.nodeType && s, Je = pi && !0 && l && !l.nodeType && l, ia = Je && Je.exports === pi, gi = ia && ra.process, jt = function() {
        try {
          var g = Je && Je.require && Je.require("util").types;
          return g || gi && gi.binding && gi.binding("util");
        } catch {
        }
      }(), sa = jt && jt.isArrayBuffer, aa = jt && jt.isDate, ua = jt && jt.isMap, oa = jt && jt.isRegExp, ca = jt && jt.isSet, la = jt && jt.isTypedArray;
      function Ht(g, S, y) {
        switch (y.length) {
          case 0:
            return g.call(S);
          case 1:
            return g.call(S, y[0]);
          case 2:
            return g.call(S, y[0], y[1]);
          case 3:
            return g.call(S, y[0], y[1], y[2]);
        }
        return g.apply(S, y);
      }
      function Vc(g, S, y, O) {
        for (var G = -1, et = g == null ? 0 : g.length; ++G < et; ) {
          var St = g[G];
          S(O, St, y(St), g);
        }
        return O;
      }
      function te(g, S) {
        for (var y = -1, O = g == null ? 0 : g.length; ++y < O && S(g[y], y, g) !== !1; )
          ;
        return g;
      }
      function jc(g, S) {
        for (var y = g == null ? 0 : g.length; y-- && S(g[y], y, g) !== !1; )
          ;
        return g;
      }
      function fa(g, S) {
        for (var y = -1, O = g == null ? 0 : g.length; ++y < O; )
          if (!S(g[y], y, g))
            return !1;
        return !0;
      }
      function ke(g, S) {
        for (var y = -1, O = g == null ? 0 : g.length, G = 0, et = []; ++y < O; ) {
          var St = g[y];
          S(St, y, g) && (et[G++] = St);
        }
        return et;
      }
      function jn(g, S) {
        var y = g == null ? 0 : g.length;
        return !!y && an(g, S, 0) > -1;
      }
      function di(g, S, y) {
        for (var O = -1, G = g == null ? 0 : g.length; ++O < G; )
          if (y(S, g[O]))
            return !0;
        return !1;
      }
      function pt(g, S) {
        for (var y = -1, O = g == null ? 0 : g.length, G = Array(O); ++y < O; )
          G[y] = S(g[y], y, g);
        return G;
      }
      function De(g, S) {
        for (var y = -1, O = S.length, G = g.length; ++y < O; )
          g[G + y] = S[y];
        return g;
      }
      function _i(g, S, y, O) {
        var G = -1, et = g == null ? 0 : g.length;
        for (O && et && (y = g[++G]); ++G < et; )
          y = S(y, g[G], G, g);
        return y;
      }
      function tl(g, S, y, O) {
        var G = g == null ? 0 : g.length;
        for (O && G && (y = g[--G]); G--; )
          y = S(y, g[G], G, g);
        return y;
      }
      function vi(g, S) {
        for (var y = -1, O = g == null ? 0 : g.length; ++y < O; )
          if (S(g[y], y, g))
            return !0;
        return !1;
      }
      var el = mi("length");
      function nl(g) {
        return g.split("");
      }
      function rl(g) {
        return g.match(fc) || [];
      }
      function ha(g, S, y) {
        var O;
        return y(g, function(G, et, St) {
          if (S(G, et, St))
            return O = et, !1;
        }), O;
      }
      function tr(g, S, y, O) {
        for (var G = g.length, et = y + (O ? 1 : -1); O ? et-- : ++et < G; )
          if (S(g[et], et, g))
            return et;
        return -1;
      }
      function an(g, S, y) {
        return S === S ? dl(g, S, y) : tr(g, pa, y);
      }
      function il(g, S, y, O) {
        for (var G = y - 1, et = g.length; ++G < et; )
          if (O(g[G], S))
            return G;
        return -1;
      }
      function pa(g) {
        return g !== g;
      }
      function ga(g, S) {
        var y = g == null ? 0 : g.length;
        return y ? yi(g, S) / y : xe;
      }
      function mi(g) {
        return function(S) {
          return S == null ? i : S[g];
        };
      }
      function wi(g) {
        return function(S) {
          return g == null ? i : g[S];
        };
      }
      function da(g, S, y, O, G) {
        return G(g, function(et, St, st) {
          y = O ? (O = !1, et) : S(y, et, St, st);
        }), y;
      }
      function sl(g, S) {
        var y = g.length;
        for (g.sort(S); y--; )
          g[y] = g[y].value;
        return g;
      }
      function yi(g, S) {
        for (var y, O = -1, G = g.length; ++O < G; ) {
          var et = S(g[O]);
          et !== i && (y = y === i ? et : y + et);
        }
        return y;
      }
      function Ci(g, S) {
        for (var y = -1, O = Array(g); ++y < g; )
          O[y] = S(y);
        return O;
      }
      function al(g, S) {
        return pt(S, function(y) {
          return [y, g[y]];
        });
      }
      function _a(g) {
        return g && g.slice(0, ya(g) + 1).replace(ui, "");
      }
      function Kt(g) {
        return function(S) {
          return g(S);
        };
      }
      function xi(g, S) {
        return pt(S, function(y) {
          return g[y];
        });
      }
      function In(g, S) {
        return g.has(S);
      }
      function va(g, S) {
        for (var y = -1, O = g.length; ++y < O && an(S, g[y], 0) > -1; )
          ;
        return y;
      }
      function ma(g, S) {
        for (var y = g.length; y-- && an(S, g[y], 0) > -1; )
          ;
        return y;
      }
      function ul(g, S) {
        for (var y = g.length, O = 0; y--; )
          g[y] === S && ++O;
        return O;
      }
      var ol = wi(Hc), cl = wi(Kc);
      function ll(g) {
        return "\\" + Zc[g];
      }
      function fl(g, S) {
        return g == null ? i : g[S];
      }
      function un(g) {
        return $c.test(g);
      }
      function hl(g) {
        return qc.test(g);
      }
      function pl(g) {
        for (var S, y = []; !(S = g.next()).done; )
          y.push(S.value);
        return y;
      }
      function Si(g) {
        var S = -1, y = Array(g.size);
        return g.forEach(function(O, G) {
          y[++S] = [G, O];
        }), y;
      }
      function wa(g, S) {
        return function(y) {
          return g(S(y));
        };
      }
      function We(g, S) {
        for (var y = -1, O = g.length, G = 0, et = []; ++y < O; ) {
          var St = g[y];
          (St === S || St === F) && (g[y] = F, et[G++] = y);
        }
        return et;
      }
      function er(g) {
        var S = -1, y = Array(g.size);
        return g.forEach(function(O) {
          y[++S] = O;
        }), y;
      }
      function gl(g) {
        var S = -1, y = Array(g.size);
        return g.forEach(function(O) {
          y[++S] = [O, O];
        }), y;
      }
      function dl(g, S, y) {
        for (var O = y - 1, G = g.length; ++O < G; )
          if (g[O] === S)
            return O;
        return -1;
      }
      function _l(g, S, y) {
        for (var O = y + 1; O--; )
          if (g[O] === S)
            return O;
        return O;
      }
      function on(g) {
        return un(g) ? ml(g) : el(g);
      }
      function ce(g) {
        return un(g) ? wl(g) : nl(g);
      }
      function ya(g) {
        for (var S = g.length; S-- && uc.test(g.charAt(S)); )
          ;
        return S;
      }
      var vl = wi(Jc);
      function ml(g) {
        for (var S = hi.lastIndex = 0; hi.test(g); )
          ++S;
        return S;
      }
      function wl(g) {
        return g.match(hi) || [];
      }
      function yl(g) {
        return g.match(Uc) || [];
      }
      var Cl = function g(S) {
        S = S == null ? Et : cn.defaults(Et.Object(), S, cn.pick(Et, Gc));
        var y = S.Array, O = S.Date, G = S.Error, et = S.Function, St = S.Math, st = S.Object, bi = S.RegExp, xl = S.String, ee = S.TypeError, nr = y.prototype, Sl = et.prototype, ln = st.prototype, rr = S["__core-js_shared__"], ir = Sl.toString, rt = ln.hasOwnProperty, bl = 0, Ca = function() {
          var t = /[^.]+$/.exec(rr && rr.keys && rr.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        }(), sr = ln.toString, Al = ir.call(st), El = Et._, Il = bi(
          "^" + ir.call(rt).replace(ai, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), ar = ia ? S.Buffer : i, Be = S.Symbol, ur = S.Uint8Array, xa = ar ? ar.allocUnsafe : i, or = wa(st.getPrototypeOf, st), Sa = st.create, ba = ln.propertyIsEnumerable, cr = nr.splice, Aa = Be ? Be.isConcatSpreadable : i, Fn = Be ? Be.iterator : i, Ze = Be ? Be.toStringTag : i, lr = function() {
          try {
            var t = je(st, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        }(), Fl = S.clearTimeout !== Et.clearTimeout && S.clearTimeout, Tl = O && O.now !== Et.Date.now && O.now, Ml = S.setTimeout !== Et.setTimeout && S.setTimeout, fr = St.ceil, hr = St.floor, Ai = st.getOwnPropertySymbols, Ll = ar ? ar.isBuffer : i, Ea = S.isFinite, Pl = nr.join, Rl = wa(st.keys, st), bt = St.max, Tt = St.min, Ol = O.now, kl = S.parseInt, Ia = St.random, Dl = nr.reverse, Ei = je(S, "DataView"), Tn = je(S, "Map"), Ii = je(S, "Promise"), fn = je(S, "Set"), Mn = je(S, "WeakMap"), Ln = je(st, "create"), pr = Mn && new Mn(), hn = {}, Wl = tn(Ei), Bl = tn(Tn), Nl = tn(Ii), Ul = tn(fn), $l = tn(Mn), gr = Be ? Be.prototype : i, Pn = gr ? gr.valueOf : i, Fa = gr ? gr.toString : i;
        function u(t) {
          if (_t(t) && !z(t) && !(t instanceof Q)) {
            if (t instanceof ne)
              return t;
            if (rt.call(t, "__wrapped__"))
              return Tu(t);
          }
          return new ne(t);
        }
        var pn = /* @__PURE__ */ function() {
          function t() {
          }
          return function(e) {
            if (!gt(e))
              return {};
            if (Sa)
              return Sa(e);
            t.prototype = e;
            var n = new t();
            return t.prototype = i, n;
          };
        }();
        function dr() {
        }
        function ne(t, e) {
          this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!e, this.__index__ = 0, this.__values__ = i;
        }
        u.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: ec,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: nc,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Ws,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          variable: "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          imports: {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            _: u
          }
        }, u.prototype = dr.prototype, u.prototype.constructor = u, ne.prototype = pn(dr.prototype), ne.prototype.constructor = ne;
        function Q(t) {
          this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = P, this.__views__ = [];
        }
        function ql() {
          var t = new Q(this.__wrapped__);
          return t.__actions__ = Ut(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = Ut(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = Ut(this.__views__), t;
        }
        function Gl() {
          if (this.__filtered__) {
            var t = new Q(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function zl() {
          var t = this.__wrapped__.value(), e = this.__dir__, n = z(t), r = e < 0, a = n ? t.length : 0, c = rh(0, a, this.__views__), f = c.start, p = c.end, _ = p - f, b = r ? p : f - 1, A = this.__iteratees__, E = A.length, M = 0, D = Tt(_, this.__takeCount__);
          if (!n || !r && a == _ && D == _)
            return Va(t, this.__actions__);
          var N = [];
          t:
            for (; _-- && M < D; ) {
              b += e;
              for (var J = -1, U = t[b]; ++J < E; ) {
                var X = A[J], V = X.iteratee, Yt = X.type, Dt = V(U);
                if (Yt == Jn)
                  U = Dt;
                else if (!Dt) {
                  if (Yt == bn)
                    continue t;
                  break t;
                }
              }
              N[M++] = U;
            }
          return N;
        }
        Q.prototype = pn(dr.prototype), Q.prototype.constructor = Q;
        function Ye(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function Hl() {
          this.__data__ = Ln ? Ln(null) : {}, this.size = 0;
        }
        function Kl(t) {
          var e = this.has(t) && delete this.__data__[t];
          return this.size -= e ? 1 : 0, e;
        }
        function Jl(t) {
          var e = this.__data__;
          if (Ln) {
            var n = e[t];
            return n === C ? i : n;
          }
          return rt.call(e, t) ? e[t] : i;
        }
        function Zl(t) {
          var e = this.__data__;
          return Ln ? e[t] !== i : rt.call(e, t);
        }
        function Yl(t, e) {
          var n = this.__data__;
          return this.size += this.has(t) ? 0 : 1, n[t] = Ln && e === i ? C : e, this;
        }
        Ye.prototype.clear = Hl, Ye.prototype.delete = Kl, Ye.prototype.get = Jl, Ye.prototype.has = Zl, Ye.prototype.set = Yl;
        function Se(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function Xl() {
          this.__data__ = [], this.size = 0;
        }
        function Ql(t) {
          var e = this.__data__, n = _r(e, t);
          if (n < 0)
            return !1;
          var r = e.length - 1;
          return n == r ? e.pop() : cr.call(e, n, 1), --this.size, !0;
        }
        function Vl(t) {
          var e = this.__data__, n = _r(e, t);
          return n < 0 ? i : e[n][1];
        }
        function jl(t) {
          return _r(this.__data__, t) > -1;
        }
        function tf(t, e) {
          var n = this.__data__, r = _r(n, t);
          return r < 0 ? (++this.size, n.push([t, e])) : n[r][1] = e, this;
        }
        Se.prototype.clear = Xl, Se.prototype.delete = Ql, Se.prototype.get = Vl, Se.prototype.has = jl, Se.prototype.set = tf;
        function be(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function ef() {
          this.size = 0, this.__data__ = {
            hash: new Ye(),
            map: new (Tn || Se)(),
            string: new Ye()
          };
        }
        function nf(t) {
          var e = Fr(this, t).delete(t);
          return this.size -= e ? 1 : 0, e;
        }
        function rf(t) {
          return Fr(this, t).get(t);
        }
        function sf(t) {
          return Fr(this, t).has(t);
        }
        function af(t, e) {
          var n = Fr(this, t), r = n.size;
          return n.set(t, e), this.size += n.size == r ? 0 : 1, this;
        }
        be.prototype.clear = ef, be.prototype.delete = nf, be.prototype.get = rf, be.prototype.has = sf, be.prototype.set = af;
        function Xe(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.__data__ = new be(); ++e < n; )
            this.add(t[e]);
        }
        function uf(t) {
          return this.__data__.set(t, C), this;
        }
        function of(t) {
          return this.__data__.has(t);
        }
        Xe.prototype.add = Xe.prototype.push = uf, Xe.prototype.has = of;
        function le(t) {
          var e = this.__data__ = new Se(t);
          this.size = e.size;
        }
        function cf() {
          this.__data__ = new Se(), this.size = 0;
        }
        function lf(t) {
          var e = this.__data__, n = e.delete(t);
          return this.size = e.size, n;
        }
        function ff(t) {
          return this.__data__.get(t);
        }
        function hf(t) {
          return this.__data__.has(t);
        }
        function pf(t, e) {
          var n = this.__data__;
          if (n instanceof Se) {
            var r = n.__data__;
            if (!Tn || r.length < h - 1)
              return r.push([t, e]), this.size = ++n.size, this;
            n = this.__data__ = new be(r);
          }
          return n.set(t, e), this.size = n.size, this;
        }
        le.prototype.clear = cf, le.prototype.delete = lf, le.prototype.get = ff, le.prototype.has = hf, le.prototype.set = pf;
        function Ta(t, e) {
          var n = z(t), r = !n && en(t), a = !n && !r && Ge(t), c = !n && !r && !a && vn(t), f = n || r || a || c, p = f ? Ci(t.length, xl) : [], _ = p.length;
          for (var b in t)
            (e || rt.call(t, b)) && !(f && // Safari 9 has enumerable `arguments.length` in strict mode.
            (b == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            a && (b == "offset" || b == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (b == "buffer" || b == "byteLength" || b == "byteOffset") || // Skip index properties.
            Fe(b, _))) && p.push(b);
          return p;
        }
        function Ma(t) {
          var e = t.length;
          return e ? t[Bi(0, e - 1)] : i;
        }
        function gf(t, e) {
          return Tr(Ut(t), Qe(e, 0, t.length));
        }
        function df(t) {
          return Tr(Ut(t));
        }
        function Fi(t, e, n) {
          (n !== i && !fe(t[e], n) || n === i && !(e in t)) && Ae(t, e, n);
        }
        function Rn(t, e, n) {
          var r = t[e];
          (!(rt.call(t, e) && fe(r, n)) || n === i && !(e in t)) && Ae(t, e, n);
        }
        function _r(t, e) {
          for (var n = t.length; n--; )
            if (fe(t[n][0], e))
              return n;
          return -1;
        }
        function _f(t, e, n, r) {
          return Ne(t, function(a, c, f) {
            e(r, a, n(a), f);
          }), r;
        }
        function La(t, e) {
          return t && me(e, At(e), t);
        }
        function vf(t, e) {
          return t && me(e, qt(e), t);
        }
        function Ae(t, e, n) {
          e == "__proto__" && lr ? lr(t, e, {
            configurable: !0,
            enumerable: !0,
            value: n,
            writable: !0
          }) : t[e] = n;
        }
        function Ti(t, e) {
          for (var n = -1, r = e.length, a = y(r), c = t == null; ++n < r; )
            a[n] = c ? i : cs(t, e[n]);
          return a;
        }
        function Qe(t, e, n) {
          return t === t && (n !== i && (t = t <= n ? t : n), e !== i && (t = t >= e ? t : e)), t;
        }
        function re(t, e, n, r, a, c) {
          var f, p = e & m, _ = e & R, b = e & k;
          if (n && (f = a ? n(t, r, a, c) : n(t)), f !== i)
            return f;
          if (!gt(t))
            return t;
          var A = z(t);
          if (A) {
            if (f = sh(t), !p)
              return Ut(t, f);
          } else {
            var E = Mt(t), M = E == Bt || E == de;
            if (Ge(t))
              return eu(t, p);
            if (E == Ct || E == j || M && !a) {
              if (f = _ || M ? {} : yu(t), !p)
                return _ ? Zf(t, vf(f, t)) : Jf(t, La(f, t));
            } else {
              if (!ut[E])
                return a ? t : {};
              f = ah(t, E, p);
            }
          }
          c || (c = new le());
          var D = c.get(t);
          if (D)
            return D;
          c.set(t, f), Yu(t) ? t.forEach(function(U) {
            f.add(re(U, e, n, U, t, c));
          }) : Ju(t) && t.forEach(function(U, X) {
            f.set(X, re(U, e, n, X, t, c));
          });
          var N = b ? _ ? Yi : Zi : _ ? qt : At, J = A ? i : N(t);
          return te(J || t, function(U, X) {
            J && (X = U, U = t[X]), Rn(f, X, re(U, e, n, X, t, c));
          }), f;
        }
        function mf(t) {
          var e = At(t);
          return function(n) {
            return Pa(n, t, e);
          };
        }
        function Pa(t, e, n) {
          var r = n.length;
          if (t == null)
            return !r;
          for (t = st(t); r--; ) {
            var a = n[r], c = e[a], f = t[a];
            if (f === i && !(a in t) || !c(f))
              return !1;
          }
          return !0;
        }
        function Ra(t, e, n) {
          if (typeof t != "function")
            throw new ee(d);
          return Un(function() {
            t.apply(i, n);
          }, e);
        }
        function On(t, e, n, r) {
          var a = -1, c = jn, f = !0, p = t.length, _ = [], b = e.length;
          if (!p)
            return _;
          n && (e = pt(e, Kt(n))), r ? (c = di, f = !1) : e.length >= h && (c = In, f = !1, e = new Xe(e));
          t:
            for (; ++a < p; ) {
              var A = t[a], E = n == null ? A : n(A);
              if (A = r || A !== 0 ? A : 0, f && E === E) {
                for (var M = b; M--; )
                  if (e[M] === E)
                    continue t;
                _.push(A);
              } else c(e, E, r) || _.push(A);
            }
          return _;
        }
        var Ne = au(ve), Oa = au(Li, !0);
        function wf(t, e) {
          var n = !0;
          return Ne(t, function(r, a, c) {
            return n = !!e(r, a, c), n;
          }), n;
        }
        function vr(t, e, n) {
          for (var r = -1, a = t.length; ++r < a; ) {
            var c = t[r], f = e(c);
            if (f != null && (p === i ? f === f && !Zt(f) : n(f, p)))
              var p = f, _ = c;
          }
          return _;
        }
        function yf(t, e, n, r) {
          var a = t.length;
          for (n = K(n), n < 0 && (n = -n > a ? 0 : a + n), r = r === i || r > a ? a : K(r), r < 0 && (r += a), r = n > r ? 0 : Qu(r); n < r; )
            t[n++] = e;
          return t;
        }
        function ka(t, e) {
          var n = [];
          return Ne(t, function(r, a, c) {
            e(r, a, c) && n.push(r);
          }), n;
        }
        function It(t, e, n, r, a) {
          var c = -1, f = t.length;
          for (n || (n = oh), a || (a = []); ++c < f; ) {
            var p = t[c];
            e > 0 && n(p) ? e > 1 ? It(p, e - 1, n, r, a) : De(a, p) : r || (a[a.length] = p);
          }
          return a;
        }
        var Mi = uu(), Da = uu(!0);
        function ve(t, e) {
          return t && Mi(t, e, At);
        }
        function Li(t, e) {
          return t && Da(t, e, At);
        }
        function mr(t, e) {
          return ke(e, function(n) {
            return Te(t[n]);
          });
        }
        function Ve(t, e) {
          e = $e(e, t);
          for (var n = 0, r = e.length; t != null && n < r; )
            t = t[we(e[n++])];
          return n && n == r ? t : i;
        }
        function Wa(t, e, n) {
          var r = e(t);
          return z(t) ? r : De(r, n(t));
        }
        function Ot(t) {
          return t == null ? t === i ? Zo : Oe : Ze && Ze in st(t) ? nh(t) : dh(t);
        }
        function Pi(t, e) {
          return t > e;
        }
        function Cf(t, e) {
          return t != null && rt.call(t, e);
        }
        function xf(t, e) {
          return t != null && e in st(t);
        }
        function Sf(t, e, n) {
          return t >= Tt(e, n) && t < bt(e, n);
        }
        function Ri(t, e, n) {
          for (var r = n ? di : jn, a = t[0].length, c = t.length, f = c, p = y(c), _ = 1 / 0, b = []; f--; ) {
            var A = t[f];
            f && e && (A = pt(A, Kt(e))), _ = Tt(A.length, _), p[f] = !n && (e || a >= 120 && A.length >= 120) ? new Xe(f && A) : i;
          }
          A = t[0];
          var E = -1, M = p[0];
          t:
            for (; ++E < a && b.length < _; ) {
              var D = A[E], N = e ? e(D) : D;
              if (D = n || D !== 0 ? D : 0, !(M ? In(M, N) : r(b, N, n))) {
                for (f = c; --f; ) {
                  var J = p[f];
                  if (!(J ? In(J, N) : r(t[f], N, n)))
                    continue t;
                }
                M && M.push(N), b.push(D);
              }
            }
          return b;
        }
        function bf(t, e, n, r) {
          return ve(t, function(a, c, f) {
            e(r, n(a), c, f);
          }), r;
        }
        function kn(t, e, n) {
          e = $e(e, t), t = bu(t, e);
          var r = t == null ? t : t[we(se(e))];
          return r == null ? i : Ht(r, t, n);
        }
        function Ba(t) {
          return _t(t) && Ot(t) == j;
        }
        function Af(t) {
          return _t(t) && Ot(t) == En;
        }
        function Ef(t) {
          return _t(t) && Ot(t) == yt;
        }
        function Dn(t, e, n, r, a) {
          return t === e ? !0 : t == null || e == null || !_t(t) && !_t(e) ? t !== t && e !== e : If(t, e, n, r, Dn, a);
        }
        function If(t, e, n, r, a, c) {
          var f = z(t), p = z(e), _ = f ? ft : Mt(t), b = p ? ft : Mt(e);
          _ = _ == j ? Ct : _, b = b == j ? Ct : b;
          var A = _ == Ct, E = b == Ct, M = _ == b;
          if (M && Ge(t)) {
            if (!Ge(e))
              return !1;
            f = !0, A = !1;
          }
          if (M && !A)
            return c || (c = new le()), f || vn(t) ? vu(t, e, n, r, a, c) : th(t, e, _, n, r, a, c);
          if (!(n & L)) {
            var D = A && rt.call(t, "__wrapped__"), N = E && rt.call(e, "__wrapped__");
            if (D || N) {
              var J = D ? t.value() : t, U = N ? e.value() : e;
              return c || (c = new le()), a(J, U, n, r, c);
            }
          }
          return M ? (c || (c = new le()), eh(t, e, n, r, a, c)) : !1;
        }
        function Ff(t) {
          return _t(t) && Mt(t) == dt;
        }
        function Oi(t, e, n, r) {
          var a = n.length, c = a, f = !r;
          if (t == null)
            return !c;
          for (t = st(t); a--; ) {
            var p = n[a];
            if (f && p[2] ? p[1] !== t[p[0]] : !(p[0] in t))
              return !1;
          }
          for (; ++a < c; ) {
            p = n[a];
            var _ = p[0], b = t[_], A = p[1];
            if (f && p[2]) {
              if (b === i && !(_ in t))
                return !1;
            } else {
              var E = new le();
              if (r)
                var M = r(b, A, _, t, e, E);
              if (!(M === i ? Dn(A, b, L | T, r, E) : M))
                return !1;
            }
          }
          return !0;
        }
        function Na(t) {
          if (!gt(t) || lh(t))
            return !1;
          var e = Te(t) ? Il : vc;
          return e.test(tn(t));
        }
        function Tf(t) {
          return _t(t) && Ot(t) == Vt;
        }
        function Mf(t) {
          return _t(t) && Mt(t) == ht;
        }
        function Lf(t) {
          return _t(t) && kr(t.length) && !!ct[Ot(t)];
        }
        function Ua(t) {
          return typeof t == "function" ? t : t == null ? Gt : typeof t == "object" ? z(t) ? Ga(t[0], t[1]) : qa(t) : oo(t);
        }
        function ki(t) {
          if (!Nn(t))
            return Rl(t);
          var e = [];
          for (var n in st(t))
            rt.call(t, n) && n != "constructor" && e.push(n);
          return e;
        }
        function Pf(t) {
          if (!gt(t))
            return gh(t);
          var e = Nn(t), n = [];
          for (var r in t)
            r == "constructor" && (e || !rt.call(t, r)) || n.push(r);
          return n;
        }
        function Di(t, e) {
          return t < e;
        }
        function $a(t, e) {
          var n = -1, r = $t(t) ? y(t.length) : [];
          return Ne(t, function(a, c, f) {
            r[++n] = e(a, c, f);
          }), r;
        }
        function qa(t) {
          var e = Qi(t);
          return e.length == 1 && e[0][2] ? xu(e[0][0], e[0][1]) : function(n) {
            return n === t || Oi(n, t, e);
          };
        }
        function Ga(t, e) {
          return ji(t) && Cu(e) ? xu(we(t), e) : function(n) {
            var r = cs(n, t);
            return r === i && r === e ? ls(n, t) : Dn(e, r, L | T);
          };
        }
        function wr(t, e, n, r, a) {
          t !== e && Mi(e, function(c, f) {
            if (a || (a = new le()), gt(c))
              Rf(t, e, f, n, wr, r, a);
            else {
              var p = r ? r(es(t, f), c, f + "", t, e, a) : i;
              p === i && (p = c), Fi(t, f, p);
            }
          }, qt);
        }
        function Rf(t, e, n, r, a, c, f) {
          var p = es(t, n), _ = es(e, n), b = f.get(_);
          if (b) {
            Fi(t, n, b);
            return;
          }
          var A = c ? c(p, _, n + "", t, e, f) : i, E = A === i;
          if (E) {
            var M = z(_), D = !M && Ge(_), N = !M && !D && vn(_);
            A = _, M || D || N ? z(p) ? A = p : mt(p) ? A = Ut(p) : D ? (E = !1, A = eu(_, !0)) : N ? (E = !1, A = nu(_, !0)) : A = [] : $n(_) || en(_) ? (A = p, en(p) ? A = Vu(p) : (!gt(p) || Te(p)) && (A = yu(_))) : E = !1;
          }
          E && (f.set(_, A), a(A, _, r, c, f), f.delete(_)), Fi(t, n, A);
        }
        function za(t, e) {
          var n = t.length;
          if (n)
            return e += e < 0 ? n : 0, Fe(e, n) ? t[e] : i;
        }
        function Ha(t, e, n) {
          e.length ? e = pt(e, function(c) {
            return z(c) ? function(f) {
              return Ve(f, c.length === 1 ? c[0] : c);
            } : c;
          }) : e = [Gt];
          var r = -1;
          e = pt(e, Kt(B()));
          var a = $a(t, function(c, f, p) {
            var _ = pt(e, function(b) {
              return b(c);
            });
            return { criteria: _, index: ++r, value: c };
          });
          return sl(a, function(c, f) {
            return Kf(c, f, n);
          });
        }
        function Of(t, e) {
          return Ka(t, e, function(n, r) {
            return ls(t, r);
          });
        }
        function Ka(t, e, n) {
          for (var r = -1, a = e.length, c = {}; ++r < a; ) {
            var f = e[r], p = Ve(t, f);
            n(p, f) && Wn(c, $e(f, t), p);
          }
          return c;
        }
        function kf(t) {
          return function(e) {
            return Ve(e, t);
          };
        }
        function Wi(t, e, n, r) {
          var a = r ? il : an, c = -1, f = e.length, p = t;
          for (t === e && (e = Ut(e)), n && (p = pt(t, Kt(n))); ++c < f; )
            for (var _ = 0, b = e[c], A = n ? n(b) : b; (_ = a(p, A, _, r)) > -1; )
              p !== t && cr.call(p, _, 1), cr.call(t, _, 1);
          return t;
        }
        function Ja(t, e) {
          for (var n = t ? e.length : 0, r = n - 1; n--; ) {
            var a = e[n];
            if (n == r || a !== c) {
              var c = a;
              Fe(a) ? cr.call(t, a, 1) : $i(t, a);
            }
          }
          return t;
        }
        function Bi(t, e) {
          return t + hr(Ia() * (e - t + 1));
        }
        function Df(t, e, n, r) {
          for (var a = -1, c = bt(fr((e - t) / (n || 1)), 0), f = y(c); c--; )
            f[r ? c : ++a] = t, t += n;
          return f;
        }
        function Ni(t, e) {
          var n = "";
          if (!t || e < 1 || e > Re)
            return n;
          do
            e % 2 && (n += t), e = hr(e / 2), e && (t += t);
          while (e);
          return n;
        }
        function Z(t, e) {
          return ns(Su(t, e, Gt), t + "");
        }
        function Wf(t) {
          return Ma(mn(t));
        }
        function Bf(t, e) {
          var n = mn(t);
          return Tr(n, Qe(e, 0, n.length));
        }
        function Wn(t, e, n, r) {
          if (!gt(t))
            return t;
          e = $e(e, t);
          for (var a = -1, c = e.length, f = c - 1, p = t; p != null && ++a < c; ) {
            var _ = we(e[a]), b = n;
            if (_ === "__proto__" || _ === "constructor" || _ === "prototype")
              return t;
            if (a != f) {
              var A = p[_];
              b = r ? r(A, _, p) : i, b === i && (b = gt(A) ? A : Fe(e[a + 1]) ? [] : {});
            }
            Rn(p, _, b), p = p[_];
          }
          return t;
        }
        var Za = pr ? function(t, e) {
          return pr.set(t, e), t;
        } : Gt, Nf = lr ? function(t, e) {
          return lr(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: hs(e),
            writable: !0
          });
        } : Gt;
        function Uf(t) {
          return Tr(mn(t));
        }
        function ie(t, e, n) {
          var r = -1, a = t.length;
          e < 0 && (e = -e > a ? 0 : a + e), n = n > a ? a : n, n < 0 && (n += a), a = e > n ? 0 : n - e >>> 0, e >>>= 0;
          for (var c = y(a); ++r < a; )
            c[r] = t[r + e];
          return c;
        }
        function $f(t, e) {
          var n;
          return Ne(t, function(r, a, c) {
            return n = e(r, a, c), !n;
          }), !!n;
        }
        function yr(t, e, n) {
          var r = 0, a = t == null ? r : t.length;
          if (typeof e == "number" && e === e && a <= q) {
            for (; r < a; ) {
              var c = r + a >>> 1, f = t[c];
              f !== null && !Zt(f) && (n ? f <= e : f < e) ? r = c + 1 : a = c;
            }
            return a;
          }
          return Ui(t, e, Gt, n);
        }
        function Ui(t, e, n, r) {
          var a = 0, c = t == null ? 0 : t.length;
          if (c === 0)
            return 0;
          e = n(e);
          for (var f = e !== e, p = e === null, _ = Zt(e), b = e === i; a < c; ) {
            var A = hr((a + c) / 2), E = n(t[A]), M = E !== i, D = E === null, N = E === E, J = Zt(E);
            if (f)
              var U = r || N;
            else b ? U = N && (r || M) : p ? U = N && M && (r || !D) : _ ? U = N && M && !D && (r || !J) : D || J ? U = !1 : U = r ? E <= e : E < e;
            U ? a = A + 1 : c = A;
          }
          return Tt(c, $);
        }
        function Ya(t, e) {
          for (var n = -1, r = t.length, a = 0, c = []; ++n < r; ) {
            var f = t[n], p = e ? e(f) : f;
            if (!n || !fe(p, _)) {
              var _ = p;
              c[a++] = f === 0 ? 0 : f;
            }
          }
          return c;
        }
        function Xa(t) {
          return typeof t == "number" ? t : Zt(t) ? xe : +t;
        }
        function Jt(t) {
          if (typeof t == "string")
            return t;
          if (z(t))
            return pt(t, Jt) + "";
          if (Zt(t))
            return Fa ? Fa.call(t) : "";
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function Ue(t, e, n) {
          var r = -1, a = jn, c = t.length, f = !0, p = [], _ = p;
          if (n)
            f = !1, a = di;
          else if (c >= h) {
            var b = e ? null : Vf(t);
            if (b)
              return er(b);
            f = !1, a = In, _ = new Xe();
          } else
            _ = e ? [] : p;
          t:
            for (; ++r < c; ) {
              var A = t[r], E = e ? e(A) : A;
              if (A = n || A !== 0 ? A : 0, f && E === E) {
                for (var M = _.length; M--; )
                  if (_[M] === E)
                    continue t;
                e && _.push(E), p.push(A);
              } else a(_, E, n) || (_ !== p && _.push(E), p.push(A));
            }
          return p;
        }
        function $i(t, e) {
          return e = $e(e, t), t = bu(t, e), t == null || delete t[we(se(e))];
        }
        function Qa(t, e, n, r) {
          return Wn(t, e, n(Ve(t, e)), r);
        }
        function Cr(t, e, n, r) {
          for (var a = t.length, c = r ? a : -1; (r ? c-- : ++c < a) && e(t[c], c, t); )
            ;
          return n ? ie(t, r ? 0 : c, r ? c + 1 : a) : ie(t, r ? c + 1 : 0, r ? a : c);
        }
        function Va(t, e) {
          var n = t;
          return n instanceof Q && (n = n.value()), _i(e, function(r, a) {
            return a.func.apply(a.thisArg, De([r], a.args));
          }, n);
        }
        function qi(t, e, n) {
          var r = t.length;
          if (r < 2)
            return r ? Ue(t[0]) : [];
          for (var a = -1, c = y(r); ++a < r; )
            for (var f = t[a], p = -1; ++p < r; )
              p != a && (c[a] = On(c[a] || f, t[p], e, n));
          return Ue(It(c, 1), e, n);
        }
        function ja(t, e, n) {
          for (var r = -1, a = t.length, c = e.length, f = {}; ++r < a; ) {
            var p = r < c ? e[r] : i;
            n(f, t[r], p);
          }
          return f;
        }
        function Gi(t) {
          return mt(t) ? t : [];
        }
        function zi(t) {
          return typeof t == "function" ? t : Gt;
        }
        function $e(t, e) {
          return z(t) ? t : ji(t, e) ? [t] : Fu(nt(t));
        }
        var qf = Z;
        function qe(t, e, n) {
          var r = t.length;
          return n = n === i ? r : n, !e && n >= r ? t : ie(t, e, n);
        }
        var tu = Fl || function(t) {
          return Et.clearTimeout(t);
        };
        function eu(t, e) {
          if (e)
            return t.slice();
          var n = t.length, r = xa ? xa(n) : new t.constructor(n);
          return t.copy(r), r;
        }
        function Hi(t) {
          var e = new t.constructor(t.byteLength);
          return new ur(e).set(new ur(t)), e;
        }
        function Gf(t, e) {
          var n = e ? Hi(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.byteLength);
        }
        function zf(t) {
          var e = new t.constructor(t.source, Bs.exec(t));
          return e.lastIndex = t.lastIndex, e;
        }
        function Hf(t) {
          return Pn ? st(Pn.call(t)) : {};
        }
        function nu(t, e) {
          var n = e ? Hi(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.length);
        }
        function ru(t, e) {
          if (t !== e) {
            var n = t !== i, r = t === null, a = t === t, c = Zt(t), f = e !== i, p = e === null, _ = e === e, b = Zt(e);
            if (!p && !b && !c && t > e || c && f && _ && !p && !b || r && f && _ || !n && _ || !a)
              return 1;
            if (!r && !c && !b && t < e || b && n && a && !r && !c || p && n && a || !f && a || !_)
              return -1;
          }
          return 0;
        }
        function Kf(t, e, n) {
          for (var r = -1, a = t.criteria, c = e.criteria, f = a.length, p = n.length; ++r < f; ) {
            var _ = ru(a[r], c[r]);
            if (_) {
              if (r >= p)
                return _;
              var b = n[r];
              return _ * (b == "desc" ? -1 : 1);
            }
          }
          return t.index - e.index;
        }
        function iu(t, e, n, r) {
          for (var a = -1, c = t.length, f = n.length, p = -1, _ = e.length, b = bt(c - f, 0), A = y(_ + b), E = !r; ++p < _; )
            A[p] = e[p];
          for (; ++a < f; )
            (E || a < c) && (A[n[a]] = t[a]);
          for (; b--; )
            A[p++] = t[a++];
          return A;
        }
        function su(t, e, n, r) {
          for (var a = -1, c = t.length, f = -1, p = n.length, _ = -1, b = e.length, A = bt(c - p, 0), E = y(A + b), M = !r; ++a < A; )
            E[a] = t[a];
          for (var D = a; ++_ < b; )
            E[D + _] = e[_];
          for (; ++f < p; )
            (M || a < c) && (E[D + n[f]] = t[a++]);
          return E;
        }
        function Ut(t, e) {
          var n = -1, r = t.length;
          for (e || (e = y(r)); ++n < r; )
            e[n] = t[n];
          return e;
        }
        function me(t, e, n, r) {
          var a = !n;
          n || (n = {});
          for (var c = -1, f = e.length; ++c < f; ) {
            var p = e[c], _ = r ? r(n[p], t[p], p, n, t) : i;
            _ === i && (_ = t[p]), a ? Ae(n, p, _) : Rn(n, p, _);
          }
          return n;
        }
        function Jf(t, e) {
          return me(t, Vi(t), e);
        }
        function Zf(t, e) {
          return me(t, mu(t), e);
        }
        function xr(t, e) {
          return function(n, r) {
            var a = z(n) ? Vc : _f, c = e ? e() : {};
            return a(n, t, B(r, 2), c);
          };
        }
        function gn(t) {
          return Z(function(e, n) {
            var r = -1, a = n.length, c = a > 1 ? n[a - 1] : i, f = a > 2 ? n[2] : i;
            for (c = t.length > 3 && typeof c == "function" ? (a--, c) : i, f && kt(n[0], n[1], f) && (c = a < 3 ? i : c, a = 1), e = st(e); ++r < a; ) {
              var p = n[r];
              p && t(e, p, r, c);
            }
            return e;
          });
        }
        function au(t, e) {
          return function(n, r) {
            if (n == null)
              return n;
            if (!$t(n))
              return t(n, r);
            for (var a = n.length, c = e ? a : -1, f = st(n); (e ? c-- : ++c < a) && r(f[c], c, f) !== !1; )
              ;
            return n;
          };
        }
        function uu(t) {
          return function(e, n, r) {
            for (var a = -1, c = st(e), f = r(e), p = f.length; p--; ) {
              var _ = f[t ? p : ++a];
              if (n(c[_], _, c) === !1)
                break;
            }
            return e;
          };
        }
        function Yf(t, e, n) {
          var r = e & W, a = Bn(t);
          function c() {
            var f = this && this !== Et && this instanceof c ? a : t;
            return f.apply(r ? n : this, arguments);
          }
          return c;
        }
        function ou(t) {
          return function(e) {
            e = nt(e);
            var n = un(e) ? ce(e) : i, r = n ? n[0] : e.charAt(0), a = n ? qe(n, 1).join("") : e.slice(1);
            return r[t]() + a;
          };
        }
        function dn(t) {
          return function(e) {
            return _i(ao(so(e).replace(Bc, "")), t, "");
          };
        }
        function Bn(t) {
          return function() {
            var e = arguments;
            switch (e.length) {
              case 0:
                return new t();
              case 1:
                return new t(e[0]);
              case 2:
                return new t(e[0], e[1]);
              case 3:
                return new t(e[0], e[1], e[2]);
              case 4:
                return new t(e[0], e[1], e[2], e[3]);
              case 5:
                return new t(e[0], e[1], e[2], e[3], e[4]);
              case 6:
                return new t(e[0], e[1], e[2], e[3], e[4], e[5]);
              case 7:
                return new t(e[0], e[1], e[2], e[3], e[4], e[5], e[6]);
            }
            var n = pn(t.prototype), r = t.apply(n, e);
            return gt(r) ? r : n;
          };
        }
        function Xf(t, e, n) {
          var r = Bn(t);
          function a() {
            for (var c = arguments.length, f = y(c), p = c, _ = _n(a); p--; )
              f[p] = arguments[p];
            var b = c < 3 && f[0] !== _ && f[c - 1] !== _ ? [] : We(f, _);
            if (c -= b.length, c < n)
              return pu(
                t,
                e,
                Sr,
                a.placeholder,
                i,
                f,
                b,
                i,
                i,
                n - c
              );
            var A = this && this !== Et && this instanceof a ? r : t;
            return Ht(A, this, f);
          }
          return a;
        }
        function cu(t) {
          return function(e, n, r) {
            var a = st(e);
            if (!$t(e)) {
              var c = B(n, 3);
              e = At(e), n = function(p) {
                return c(a[p], p, a);
              };
            }
            var f = t(e, n, r);
            return f > -1 ? a[c ? e[f] : f] : i;
          };
        }
        function lu(t) {
          return Ie(function(e) {
            var n = e.length, r = n, a = ne.prototype.thru;
            for (t && e.reverse(); r--; ) {
              var c = e[r];
              if (typeof c != "function")
                throw new ee(d);
              if (a && !f && Ir(c) == "wrapper")
                var f = new ne([], !0);
            }
            for (r = f ? r : n; ++r < n; ) {
              c = e[r];
              var p = Ir(c), _ = p == "wrapper" ? Xi(c) : i;
              _ && ts(_[0]) && _[1] == (Ft | it | xt | ge) && !_[4].length && _[9] == 1 ? f = f[Ir(_[0])].apply(f, _[3]) : f = c.length == 1 && ts(c) ? f[p]() : f.thru(c);
            }
            return function() {
              var b = arguments, A = b[0];
              if (f && b.length == 1 && z(A))
                return f.plant(A).value();
              for (var E = 0, M = n ? e[E].apply(this, b) : A; ++E < n; )
                M = e[E].call(this, M);
              return M;
            };
          });
        }
        function Sr(t, e, n, r, a, c, f, p, _, b) {
          var A = e & Ft, E = e & W, M = e & H, D = e & (it | vt), N = e & Ce, J = M ? i : Bn(t);
          function U() {
            for (var X = arguments.length, V = y(X), Yt = X; Yt--; )
              V[Yt] = arguments[Yt];
            if (D)
              var Dt = _n(U), Xt = ul(V, Dt);
            if (r && (V = iu(V, r, a, D)), c && (V = su(V, c, f, D)), X -= Xt, D && X < b) {
              var wt = We(V, Dt);
              return pu(
                t,
                e,
                Sr,
                U.placeholder,
                n,
                V,
                wt,
                p,
                _,
                b - X
              );
            }
            var he = E ? n : this, Le = M ? he[t] : t;
            return X = V.length, p ? V = _h(V, p) : N && X > 1 && V.reverse(), A && _ < X && (V.length = _), this && this !== Et && this instanceof U && (Le = J || Bn(Le)), Le.apply(he, V);
          }
          return U;
        }
        function fu(t, e) {
          return function(n, r) {
            return bf(n, t, e(r), {});
          };
        }
        function br(t, e) {
          return function(n, r) {
            var a;
            if (n === i && r === i)
              return e;
            if (n !== i && (a = n), r !== i) {
              if (a === i)
                return r;
              typeof n == "string" || typeof r == "string" ? (n = Jt(n), r = Jt(r)) : (n = Xa(n), r = Xa(r)), a = t(n, r);
            }
            return a;
          };
        }
        function Ki(t) {
          return Ie(function(e) {
            return e = pt(e, Kt(B())), Z(function(n) {
              var r = this;
              return t(e, function(a) {
                return Ht(a, r, n);
              });
            });
          });
        }
        function Ar(t, e) {
          e = e === i ? " " : Jt(e);
          var n = e.length;
          if (n < 2)
            return n ? Ni(e, t) : e;
          var r = Ni(e, fr(t / on(e)));
          return un(e) ? qe(ce(r), 0, t).join("") : r.slice(0, t);
        }
        function Qf(t, e, n, r) {
          var a = e & W, c = Bn(t);
          function f() {
            for (var p = -1, _ = arguments.length, b = -1, A = r.length, E = y(A + _), M = this && this !== Et && this instanceof f ? c : t; ++b < A; )
              E[b] = r[b];
            for (; _--; )
              E[b++] = arguments[++p];
            return Ht(M, a ? n : this, E);
          }
          return f;
        }
        function hu(t) {
          return function(e, n, r) {
            return r && typeof r != "number" && kt(e, n, r) && (n = r = i), e = Me(e), n === i ? (n = e, e = 0) : n = Me(n), r = r === i ? e < n ? 1 : -1 : Me(r), Df(e, n, r, t);
          };
        }
        function Er(t) {
          return function(e, n) {
            return typeof e == "string" && typeof n == "string" || (e = ae(e), n = ae(n)), t(e, n);
          };
        }
        function pu(t, e, n, r, a, c, f, p, _, b) {
          var A = e & it, E = A ? f : i, M = A ? i : f, D = A ? c : i, N = A ? i : c;
          e |= A ? xt : Pe, e &= ~(A ? Pe : xt), e & tt || (e &= -4);
          var J = [
            t,
            e,
            a,
            D,
            E,
            N,
            M,
            p,
            _,
            b
          ], U = n.apply(i, J);
          return ts(t) && Au(U, J), U.placeholder = r, Eu(U, t, e);
        }
        function Ji(t) {
          var e = St[t];
          return function(n, r) {
            if (n = ae(n), r = r == null ? 0 : Tt(K(r), 292), r && Ea(n)) {
              var a = (nt(n) + "e").split("e"), c = e(a[0] + "e" + (+a[1] + r));
              return a = (nt(c) + "e").split("e"), +(a[0] + "e" + (+a[1] - r));
            }
            return e(n);
          };
        }
        var Vf = fn && 1 / er(new fn([, -0]))[1] == nn ? function(t) {
          return new fn(t);
        } : ds;
        function gu(t) {
          return function(e) {
            var n = Mt(e);
            return n == dt ? Si(e) : n == ht ? gl(e) : al(e, t(e));
          };
        }
        function Ee(t, e, n, r, a, c, f, p) {
          var _ = e & H;
          if (!_ && typeof t != "function")
            throw new ee(d);
          var b = r ? r.length : 0;
          if (b || (e &= -97, r = a = i), f = f === i ? f : bt(K(f), 0), p = p === i ? p : K(p), b -= a ? a.length : 0, e & Pe) {
            var A = r, E = a;
            r = a = i;
          }
          var M = _ ? i : Xi(t), D = [
            t,
            e,
            n,
            r,
            a,
            A,
            E,
            c,
            f,
            p
          ];
          if (M && ph(D, M), t = D[0], e = D[1], n = D[2], r = D[3], a = D[4], p = D[9] = D[9] === i ? _ ? 0 : t.length : bt(D[9] - b, 0), !p && e & (it | vt) && (e &= -25), !e || e == W)
            var N = Yf(t, e, n);
          else e == it || e == vt ? N = Xf(t, e, p) : (e == xt || e == (W | xt)) && !a.length ? N = Qf(t, e, n, r) : N = Sr.apply(i, D);
          var J = M ? Za : Au;
          return Eu(J(N, D), t, e);
        }
        function du(t, e, n, r) {
          return t === i || fe(t, ln[n]) && !rt.call(r, n) ? e : t;
        }
        function _u(t, e, n, r, a, c) {
          return gt(t) && gt(e) && (c.set(e, t), wr(t, e, i, _u, c), c.delete(e)), t;
        }
        function jf(t) {
          return $n(t) ? i : t;
        }
        function vu(t, e, n, r, a, c) {
          var f = n & L, p = t.length, _ = e.length;
          if (p != _ && !(f && _ > p))
            return !1;
          var b = c.get(t), A = c.get(e);
          if (b && A)
            return b == e && A == t;
          var E = -1, M = !0, D = n & T ? new Xe() : i;
          for (c.set(t, e), c.set(e, t); ++E < p; ) {
            var N = t[E], J = e[E];
            if (r)
              var U = f ? r(J, N, E, e, t, c) : r(N, J, E, t, e, c);
            if (U !== i) {
              if (U)
                continue;
              M = !1;
              break;
            }
            if (D) {
              if (!vi(e, function(X, V) {
                if (!In(D, V) && (N === X || a(N, X, n, r, c)))
                  return D.push(V);
              })) {
                M = !1;
                break;
              }
            } else if (!(N === J || a(N, J, n, r, c))) {
              M = !1;
              break;
            }
          }
          return c.delete(t), c.delete(e), M;
        }
        function th(t, e, n, r, a, c, f) {
          switch (n) {
            case rn:
              if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset)
                return !1;
              t = t.buffer, e = e.buffer;
            case En:
              return !(t.byteLength != e.byteLength || !c(new ur(t), new ur(e)));
            case ot:
            case yt:
            case Rt:
              return fe(+t, +e);
            case Pt:
              return t.name == e.name && t.message == e.message;
            case Vt:
            case _e:
              return t == e + "";
            case dt:
              var p = Si;
            case ht:
              var _ = r & L;
              if (p || (p = er), t.size != e.size && !_)
                return !1;
              var b = f.get(t);
              if (b)
                return b == e;
              r |= T, f.set(t, e);
              var A = vu(p(t), p(e), r, a, c, f);
              return f.delete(t), A;
            case Yn:
              if (Pn)
                return Pn.call(t) == Pn.call(e);
          }
          return !1;
        }
        function eh(t, e, n, r, a, c) {
          var f = n & L, p = Zi(t), _ = p.length, b = Zi(e), A = b.length;
          if (_ != A && !f)
            return !1;
          for (var E = _; E--; ) {
            var M = p[E];
            if (!(f ? M in e : rt.call(e, M)))
              return !1;
          }
          var D = c.get(t), N = c.get(e);
          if (D && N)
            return D == e && N == t;
          var J = !0;
          c.set(t, e), c.set(e, t);
          for (var U = f; ++E < _; ) {
            M = p[E];
            var X = t[M], V = e[M];
            if (r)
              var Yt = f ? r(V, X, M, e, t, c) : r(X, V, M, t, e, c);
            if (!(Yt === i ? X === V || a(X, V, n, r, c) : Yt)) {
              J = !1;
              break;
            }
            U || (U = M == "constructor");
          }
          if (J && !U) {
            var Dt = t.constructor, Xt = e.constructor;
            Dt != Xt && "constructor" in t && "constructor" in e && !(typeof Dt == "function" && Dt instanceof Dt && typeof Xt == "function" && Xt instanceof Xt) && (J = !1);
          }
          return c.delete(t), c.delete(e), J;
        }
        function Ie(t) {
          return ns(Su(t, i, Pu), t + "");
        }
        function Zi(t) {
          return Wa(t, At, Vi);
        }
        function Yi(t) {
          return Wa(t, qt, mu);
        }
        var Xi = pr ? function(t) {
          return pr.get(t);
        } : ds;
        function Ir(t) {
          for (var e = t.name + "", n = hn[e], r = rt.call(hn, e) ? n.length : 0; r--; ) {
            var a = n[r], c = a.func;
            if (c == null || c == t)
              return a.name;
          }
          return e;
        }
        function _n(t) {
          var e = rt.call(u, "placeholder") ? u : t;
          return e.placeholder;
        }
        function B() {
          var t = u.iteratee || ps;
          return t = t === ps ? Ua : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function Fr(t, e) {
          var n = t.__data__;
          return ch(e) ? n[typeof e == "string" ? "string" : "hash"] : n.map;
        }
        function Qi(t) {
          for (var e = At(t), n = e.length; n--; ) {
            var r = e[n], a = t[r];
            e[n] = [r, a, Cu(a)];
          }
          return e;
        }
        function je(t, e) {
          var n = fl(t, e);
          return Na(n) ? n : i;
        }
        function nh(t) {
          var e = rt.call(t, Ze), n = t[Ze];
          try {
            t[Ze] = i;
            var r = !0;
          } catch {
          }
          var a = sr.call(t);
          return r && (e ? t[Ze] = n : delete t[Ze]), a;
        }
        var Vi = Ai ? function(t) {
          return t == null ? [] : (t = st(t), ke(Ai(t), function(e) {
            return ba.call(t, e);
          }));
        } : _s, mu = Ai ? function(t) {
          for (var e = []; t; )
            De(e, Vi(t)), t = or(t);
          return e;
        } : _s, Mt = Ot;
        (Ei && Mt(new Ei(new ArrayBuffer(1))) != rn || Tn && Mt(new Tn()) != dt || Ii && Mt(Ii.resolve()) != Nt || fn && Mt(new fn()) != ht || Mn && Mt(new Mn()) != An) && (Mt = function(t) {
          var e = Ot(t), n = e == Ct ? t.constructor : i, r = n ? tn(n) : "";
          if (r)
            switch (r) {
              case Wl:
                return rn;
              case Bl:
                return dt;
              case Nl:
                return Nt;
              case Ul:
                return ht;
              case $l:
                return An;
            }
          return e;
        });
        function rh(t, e, n) {
          for (var r = -1, a = n.length; ++r < a; ) {
            var c = n[r], f = c.size;
            switch (c.type) {
              case "drop":
                t += f;
                break;
              case "dropRight":
                e -= f;
                break;
              case "take":
                e = Tt(e, t + f);
                break;
              case "takeRight":
                t = bt(t, e - f);
                break;
            }
          }
          return { start: t, end: e };
        }
        function ih(t) {
          var e = t.match(cc);
          return e ? e[1].split(lc) : [];
        }
        function wu(t, e, n) {
          e = $e(e, t);
          for (var r = -1, a = e.length, c = !1; ++r < a; ) {
            var f = we(e[r]);
            if (!(c = t != null && n(t, f)))
              break;
            t = t[f];
          }
          return c || ++r != a ? c : (a = t == null ? 0 : t.length, !!a && kr(a) && Fe(f, a) && (z(t) || en(t)));
        }
        function sh(t) {
          var e = t.length, n = new t.constructor(e);
          return e && typeof t[0] == "string" && rt.call(t, "index") && (n.index = t.index, n.input = t.input), n;
        }
        function yu(t) {
          return typeof t.constructor == "function" && !Nn(t) ? pn(or(t)) : {};
        }
        function ah(t, e, n) {
          var r = t.constructor;
          switch (e) {
            case En:
              return Hi(t);
            case ot:
            case yt:
              return new r(+t);
            case rn:
              return Gf(t, n);
            case Qr:
            case Vr:
            case jr:
            case ti:
            case ei:
            case ni:
            case ri:
            case ii:
            case si:
              return nu(t, n);
            case dt:
              return new r();
            case Rt:
            case _e:
              return new r(t);
            case Vt:
              return zf(t);
            case ht:
              return new r();
            case Yn:
              return Hf(t);
          }
        }
        function uh(t, e) {
          var n = e.length;
          if (!n)
            return t;
          var r = n - 1;
          return e[r] = (n > 1 ? "& " : "") + e[r], e = e.join(n > 2 ? ", " : " "), t.replace(oc, `{
/* [wrapped with ` + e + `] */
`);
        }
        function oh(t) {
          return z(t) || en(t) || !!(Aa && t && t[Aa]);
        }
        function Fe(t, e) {
          var n = typeof t;
          return e = e ?? Re, !!e && (n == "number" || n != "symbol" && wc.test(t)) && t > -1 && t % 1 == 0 && t < e;
        }
        function kt(t, e, n) {
          if (!gt(n))
            return !1;
          var r = typeof e;
          return (r == "number" ? $t(n) && Fe(e, n.length) : r == "string" && e in n) ? fe(n[e], t) : !1;
        }
        function ji(t, e) {
          if (z(t))
            return !1;
          var n = typeof t;
          return n == "number" || n == "symbol" || n == "boolean" || t == null || Zt(t) ? !0 : ic.test(t) || !rc.test(t) || e != null && t in st(e);
        }
        function ch(t) {
          var e = typeof t;
          return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
        }
        function ts(t) {
          var e = Ir(t), n = u[e];
          if (typeof n != "function" || !(e in Q.prototype))
            return !1;
          if (t === n)
            return !0;
          var r = Xi(n);
          return !!r && t === r[0];
        }
        function lh(t) {
          return !!Ca && Ca in t;
        }
        var fh = rr ? Te : vs;
        function Nn(t) {
          var e = t && t.constructor, n = typeof e == "function" && e.prototype || ln;
          return t === n;
        }
        function Cu(t) {
          return t === t && !gt(t);
        }
        function xu(t, e) {
          return function(n) {
            return n == null ? !1 : n[t] === e && (e !== i || t in st(n));
          };
        }
        function hh(t) {
          var e = Rr(t, function(r) {
            return n.size === x && n.clear(), r;
          }), n = e.cache;
          return e;
        }
        function ph(t, e) {
          var n = t[1], r = e[1], a = n | r, c = a < (W | H | Ft), f = r == Ft && n == it || r == Ft && n == ge && t[7].length <= e[8] || r == (Ft | ge) && e[7].length <= e[8] && n == it;
          if (!(c || f))
            return t;
          r & W && (t[2] = e[2], a |= n & W ? 0 : tt);
          var p = e[3];
          if (p) {
            var _ = t[3];
            t[3] = _ ? iu(_, p, e[4]) : p, t[4] = _ ? We(t[3], F) : e[4];
          }
          return p = e[5], p && (_ = t[5], t[5] = _ ? su(_, p, e[6]) : p, t[6] = _ ? We(t[5], F) : e[6]), p = e[7], p && (t[7] = p), r & Ft && (t[8] = t[8] == null ? e[8] : Tt(t[8], e[8])), t[9] == null && (t[9] = e[9]), t[0] = e[0], t[1] = a, t;
        }
        function gh(t) {
          var e = [];
          if (t != null)
            for (var n in st(t))
              e.push(n);
          return e;
        }
        function dh(t) {
          return sr.call(t);
        }
        function Su(t, e, n) {
          return e = bt(e === i ? t.length - 1 : e, 0), function() {
            for (var r = arguments, a = -1, c = bt(r.length - e, 0), f = y(c); ++a < c; )
              f[a] = r[e + a];
            a = -1;
            for (var p = y(e + 1); ++a < e; )
              p[a] = r[a];
            return p[e] = n(f), Ht(t, this, p);
          };
        }
        function bu(t, e) {
          return e.length < 2 ? t : Ve(t, ie(e, 0, -1));
        }
        function _h(t, e) {
          for (var n = t.length, r = Tt(e.length, n), a = Ut(t); r--; ) {
            var c = e[r];
            t[r] = Fe(c, n) ? a[c] : i;
          }
          return t;
        }
        function es(t, e) {
          if (!(e === "constructor" && typeof t[e] == "function") && e != "__proto__")
            return t[e];
        }
        var Au = Iu(Za), Un = Ml || function(t, e) {
          return Et.setTimeout(t, e);
        }, ns = Iu(Nf);
        function Eu(t, e, n) {
          var r = e + "";
          return ns(t, uh(r, vh(ih(r), n)));
        }
        function Iu(t) {
          var e = 0, n = 0;
          return function() {
            var r = Ol(), a = Yr - (r - n);
            if (n = r, a > 0) {
              if (++e >= Kn)
                return arguments[0];
            } else
              e = 0;
            return t.apply(i, arguments);
          };
        }
        function Tr(t, e) {
          var n = -1, r = t.length, a = r - 1;
          for (e = e === i ? r : e; ++n < e; ) {
            var c = Bi(n, a), f = t[c];
            t[c] = t[n], t[n] = f;
          }
          return t.length = e, t;
        }
        var Fu = hh(function(t) {
          var e = [];
          return t.charCodeAt(0) === 46 && e.push(""), t.replace(sc, function(n, r, a, c) {
            e.push(a ? c.replace(pc, "$1") : r || n);
          }), e;
        });
        function we(t) {
          if (typeof t == "string" || Zt(t))
            return t;
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function tn(t) {
          if (t != null) {
            try {
              return ir.call(t);
            } catch {
            }
            try {
              return t + "";
            } catch {
            }
          }
          return "";
        }
        function vh(t, e) {
          return te(lt, function(n) {
            var r = "_." + n[0];
            e & n[1] && !jn(t, r) && t.push(r);
          }), t.sort();
        }
        function Tu(t) {
          if (t instanceof Q)
            return t.clone();
          var e = new ne(t.__wrapped__, t.__chain__);
          return e.__actions__ = Ut(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
        }
        function mh(t, e, n) {
          (n ? kt(t, e, n) : e === i) ? e = 1 : e = bt(K(e), 0);
          var r = t == null ? 0 : t.length;
          if (!r || e < 1)
            return [];
          for (var a = 0, c = 0, f = y(fr(r / e)); a < r; )
            f[c++] = ie(t, a, a += e);
          return f;
        }
        function wh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, r = 0, a = []; ++e < n; ) {
            var c = t[e];
            c && (a[r++] = c);
          }
          return a;
        }
        function yh() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var e = y(t - 1), n = arguments[0], r = t; r--; )
            e[r - 1] = arguments[r];
          return De(z(n) ? Ut(n) : [n], It(e, 1));
        }
        var Ch = Z(function(t, e) {
          return mt(t) ? On(t, It(e, 1, mt, !0)) : [];
        }), xh = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = i), mt(t) ? On(t, It(e, 1, mt, !0), B(n, 2)) : [];
        }), Sh = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = i), mt(t) ? On(t, It(e, 1, mt, !0), i, n) : [];
        });
        function bh(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), ie(t, e < 0 ? 0 : e, r)) : [];
        }
        function Ah(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), e = r - e, ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function Eh(t, e) {
          return t && t.length ? Cr(t, B(e, 3), !0, !0) : [];
        }
        function Ih(t, e) {
          return t && t.length ? Cr(t, B(e, 3), !0) : [];
        }
        function Fh(t, e, n, r) {
          var a = t == null ? 0 : t.length;
          return a ? (n && typeof n != "number" && kt(t, e, n) && (n = 0, r = a), yf(t, e, n, r)) : [];
        }
        function Mu(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = bt(r + a, 0)), tr(t, B(e, 3), a);
        }
        function Lu(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = r - 1;
          return n !== i && (a = K(n), a = n < 0 ? bt(r + a, 0) : Tt(a, r - 1)), tr(t, B(e, 3), a, !0);
        }
        function Pu(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, 1) : [];
        }
        function Th(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, nn) : [];
        }
        function Mh(t, e) {
          var n = t == null ? 0 : t.length;
          return n ? (e = e === i ? 1 : K(e), It(t, e)) : [];
        }
        function Lh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, r = {}; ++e < n; ) {
            var a = t[e];
            r[a[0]] = a[1];
          }
          return r;
        }
        function Ru(t) {
          return t && t.length ? t[0] : i;
        }
        function Ph(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = bt(r + a, 0)), an(t, e, a);
        }
        function Rh(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 0, -1) : [];
        }
        var Oh = Z(function(t) {
          var e = pt(t, Gi);
          return e.length && e[0] === t[0] ? Ri(e) : [];
        }), kh = Z(function(t) {
          var e = se(t), n = pt(t, Gi);
          return e === se(n) ? e = i : n.pop(), n.length && n[0] === t[0] ? Ri(n, B(e, 2)) : [];
        }), Dh = Z(function(t) {
          var e = se(t), n = pt(t, Gi);
          return e = typeof e == "function" ? e : i, e && n.pop(), n.length && n[0] === t[0] ? Ri(n, i, e) : [];
        });
        function Wh(t, e) {
          return t == null ? "" : Pl.call(t, e);
        }
        function se(t) {
          var e = t == null ? 0 : t.length;
          return e ? t[e - 1] : i;
        }
        function Bh(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = r;
          return n !== i && (a = K(n), a = a < 0 ? bt(r + a, 0) : Tt(a, r - 1)), e === e ? _l(t, e, a) : tr(t, pa, a, !0);
        }
        function Nh(t, e) {
          return t && t.length ? za(t, K(e)) : i;
        }
        var Uh = Z(Ou);
        function Ou(t, e) {
          return t && t.length && e && e.length ? Wi(t, e) : t;
        }
        function $h(t, e, n) {
          return t && t.length && e && e.length ? Wi(t, e, B(n, 2)) : t;
        }
        function qh(t, e, n) {
          return t && t.length && e && e.length ? Wi(t, e, i, n) : t;
        }
        var Gh = Ie(function(t, e) {
          var n = t == null ? 0 : t.length, r = Ti(t, e);
          return Ja(t, pt(e, function(a) {
            return Fe(a, n) ? +a : a;
          }).sort(ru)), r;
        });
        function zh(t, e) {
          var n = [];
          if (!(t && t.length))
            return n;
          var r = -1, a = [], c = t.length;
          for (e = B(e, 3); ++r < c; ) {
            var f = t[r];
            e(f, r, t) && (n.push(f), a.push(r));
          }
          return Ja(t, a), n;
        }
        function rs(t) {
          return t == null ? t : Dl.call(t);
        }
        function Hh(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (n && typeof n != "number" && kt(t, e, n) ? (e = 0, n = r) : (e = e == null ? 0 : K(e), n = n === i ? r : K(n)), ie(t, e, n)) : [];
        }
        function Kh(t, e) {
          return yr(t, e);
        }
        function Jh(t, e, n) {
          return Ui(t, e, B(n, 2));
        }
        function Zh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var r = yr(t, e);
            if (r < n && fe(t[r], e))
              return r;
          }
          return -1;
        }
        function Yh(t, e) {
          return yr(t, e, !0);
        }
        function Xh(t, e, n) {
          return Ui(t, e, B(n, 2), !0);
        }
        function Qh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var r = yr(t, e, !0) - 1;
            if (fe(t[r], e))
              return r;
          }
          return -1;
        }
        function Vh(t) {
          return t && t.length ? Ya(t) : [];
        }
        function jh(t, e) {
          return t && t.length ? Ya(t, B(e, 2)) : [];
        }
        function tp(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 1, e) : [];
        }
        function ep(t, e, n) {
          return t && t.length ? (e = n || e === i ? 1 : K(e), ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function np(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), e = r - e, ie(t, e < 0 ? 0 : e, r)) : [];
        }
        function rp(t, e) {
          return t && t.length ? Cr(t, B(e, 3), !1, !0) : [];
        }
        function ip(t, e) {
          return t && t.length ? Cr(t, B(e, 3)) : [];
        }
        var sp = Z(function(t) {
          return Ue(It(t, 1, mt, !0));
        }), ap = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = i), Ue(It(t, 1, mt, !0), B(e, 2));
        }), up = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : i, Ue(It(t, 1, mt, !0), i, e);
        });
        function op(t) {
          return t && t.length ? Ue(t) : [];
        }
        function cp(t, e) {
          return t && t.length ? Ue(t, B(e, 2)) : [];
        }
        function lp(t, e) {
          return e = typeof e == "function" ? e : i, t && t.length ? Ue(t, i, e) : [];
        }
        function is(t) {
          if (!(t && t.length))
            return [];
          var e = 0;
          return t = ke(t, function(n) {
            if (mt(n))
              return e = bt(n.length, e), !0;
          }), Ci(e, function(n) {
            return pt(t, mi(n));
          });
        }
        function ku(t, e) {
          if (!(t && t.length))
            return [];
          var n = is(t);
          return e == null ? n : pt(n, function(r) {
            return Ht(e, i, r);
          });
        }
        var fp = Z(function(t, e) {
          return mt(t) ? On(t, e) : [];
        }), hp = Z(function(t) {
          return qi(ke(t, mt));
        }), pp = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = i), qi(ke(t, mt), B(e, 2));
        }), gp = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : i, qi(ke(t, mt), i, e);
        }), dp = Z(is);
        function _p(t, e) {
          return ja(t || [], e || [], Rn);
        }
        function vp(t, e) {
          return ja(t || [], e || [], Wn);
        }
        var mp = Z(function(t) {
          var e = t.length, n = e > 1 ? t[e - 1] : i;
          return n = typeof n == "function" ? (t.pop(), n) : i, ku(t, n);
        });
        function Du(t) {
          var e = u(t);
          return e.__chain__ = !0, e;
        }
        function wp(t, e) {
          return e(t), t;
        }
        function Mr(t, e) {
          return e(t);
        }
        var yp = Ie(function(t) {
          var e = t.length, n = e ? t[0] : 0, r = this.__wrapped__, a = function(c) {
            return Ti(c, t);
          };
          return e > 1 || this.__actions__.length || !(r instanceof Q) || !Fe(n) ? this.thru(a) : (r = r.slice(n, +n + (e ? 1 : 0)), r.__actions__.push({
            func: Mr,
            args: [a],
            thisArg: i
          }), new ne(r, this.__chain__).thru(function(c) {
            return e && !c.length && c.push(i), c;
          }));
        });
        function Cp() {
          return Du(this);
        }
        function xp() {
          return new ne(this.value(), this.__chain__);
        }
        function Sp() {
          this.__values__ === i && (this.__values__ = Xu(this.value()));
          var t = this.__index__ >= this.__values__.length, e = t ? i : this.__values__[this.__index__++];
          return { done: t, value: e };
        }
        function bp() {
          return this;
        }
        function Ap(t) {
          for (var e, n = this; n instanceof dr; ) {
            var r = Tu(n);
            r.__index__ = 0, r.__values__ = i, e ? a.__wrapped__ = r : e = r;
            var a = r;
            n = n.__wrapped__;
          }
          return a.__wrapped__ = t, e;
        }
        function Ep() {
          var t = this.__wrapped__;
          if (t instanceof Q) {
            var e = t;
            return this.__actions__.length && (e = new Q(this)), e = e.reverse(), e.__actions__.push({
              func: Mr,
              args: [rs],
              thisArg: i
            }), new ne(e, this.__chain__);
          }
          return this.thru(rs);
        }
        function Ip() {
          return Va(this.__wrapped__, this.__actions__);
        }
        var Fp = xr(function(t, e, n) {
          rt.call(t, n) ? ++t[n] : Ae(t, n, 1);
        });
        function Tp(t, e, n) {
          var r = z(t) ? fa : wf;
          return n && kt(t, e, n) && (e = i), r(t, B(e, 3));
        }
        function Mp(t, e) {
          var n = z(t) ? ke : ka;
          return n(t, B(e, 3));
        }
        var Lp = cu(Mu), Pp = cu(Lu);
        function Rp(t, e) {
          return It(Lr(t, e), 1);
        }
        function Op(t, e) {
          return It(Lr(t, e), nn);
        }
        function kp(t, e, n) {
          return n = n === i ? 1 : K(n), It(Lr(t, e), n);
        }
        function Wu(t, e) {
          var n = z(t) ? te : Ne;
          return n(t, B(e, 3));
        }
        function Bu(t, e) {
          var n = z(t) ? jc : Oa;
          return n(t, B(e, 3));
        }
        var Dp = xr(function(t, e, n) {
          rt.call(t, n) ? t[n].push(e) : Ae(t, n, [e]);
        });
        function Wp(t, e, n, r) {
          t = $t(t) ? t : mn(t), n = n && !r ? K(n) : 0;
          var a = t.length;
          return n < 0 && (n = bt(a + n, 0)), Dr(t) ? n <= a && t.indexOf(e, n) > -1 : !!a && an(t, e, n) > -1;
        }
        var Bp = Z(function(t, e, n) {
          var r = -1, a = typeof e == "function", c = $t(t) ? y(t.length) : [];
          return Ne(t, function(f) {
            c[++r] = a ? Ht(e, f, n) : kn(f, e, n);
          }), c;
        }), Np = xr(function(t, e, n) {
          Ae(t, n, e);
        });
        function Lr(t, e) {
          var n = z(t) ? pt : $a;
          return n(t, B(e, 3));
        }
        function Up(t, e, n, r) {
          return t == null ? [] : (z(e) || (e = e == null ? [] : [e]), n = r ? i : n, z(n) || (n = n == null ? [] : [n]), Ha(t, e, n));
        }
        var $p = xr(function(t, e, n) {
          t[n ? 0 : 1].push(e);
        }, function() {
          return [[], []];
        });
        function qp(t, e, n) {
          var r = z(t) ? _i : da, a = arguments.length < 3;
          return r(t, B(e, 4), n, a, Ne);
        }
        function Gp(t, e, n) {
          var r = z(t) ? tl : da, a = arguments.length < 3;
          return r(t, B(e, 4), n, a, Oa);
        }
        function zp(t, e) {
          var n = z(t) ? ke : ka;
          return n(t, Or(B(e, 3)));
        }
        function Hp(t) {
          var e = z(t) ? Ma : Wf;
          return e(t);
        }
        function Kp(t, e, n) {
          (n ? kt(t, e, n) : e === i) ? e = 1 : e = K(e);
          var r = z(t) ? gf : Bf;
          return r(t, e);
        }
        function Jp(t) {
          var e = z(t) ? df : Uf;
          return e(t);
        }
        function Zp(t) {
          if (t == null)
            return 0;
          if ($t(t))
            return Dr(t) ? on(t) : t.length;
          var e = Mt(t);
          return e == dt || e == ht ? t.size : ki(t).length;
        }
        function Yp(t, e, n) {
          var r = z(t) ? vi : $f;
          return n && kt(t, e, n) && (e = i), r(t, B(e, 3));
        }
        var Xp = Z(function(t, e) {
          if (t == null)
            return [];
          var n = e.length;
          return n > 1 && kt(t, e[0], e[1]) ? e = [] : n > 2 && kt(e[0], e[1], e[2]) && (e = [e[0]]), Ha(t, It(e, 1), []);
        }), Pr = Tl || function() {
          return Et.Date.now();
        };
        function Qp(t, e) {
          if (typeof e != "function")
            throw new ee(d);
          return t = K(t), function() {
            if (--t < 1)
              return e.apply(this, arguments);
          };
        }
        function Nu(t, e, n) {
          return e = n ? i : e, e = t && e == null ? t.length : e, Ee(t, Ft, i, i, i, i, e);
        }
        function Uu(t, e) {
          var n;
          if (typeof e != "function")
            throw new ee(d);
          return t = K(t), function() {
            return --t > 0 && (n = e.apply(this, arguments)), t <= 1 && (e = i), n;
          };
        }
        var ss = Z(function(t, e, n) {
          var r = W;
          if (n.length) {
            var a = We(n, _n(ss));
            r |= xt;
          }
          return Ee(t, r, e, n, a);
        }), $u = Z(function(t, e, n) {
          var r = W | H;
          if (n.length) {
            var a = We(n, _n($u));
            r |= xt;
          }
          return Ee(e, r, t, n, a);
        });
        function qu(t, e, n) {
          e = n ? i : e;
          var r = Ee(t, it, i, i, i, i, i, e);
          return r.placeholder = qu.placeholder, r;
        }
        function Gu(t, e, n) {
          e = n ? i : e;
          var r = Ee(t, vt, i, i, i, i, i, e);
          return r.placeholder = Gu.placeholder, r;
        }
        function zu(t, e, n) {
          var r, a, c, f, p, _, b = 0, A = !1, E = !1, M = !0;
          if (typeof t != "function")
            throw new ee(d);
          e = ae(e) || 0, gt(n) && (A = !!n.leading, E = "maxWait" in n, c = E ? bt(ae(n.maxWait) || 0, e) : c, M = "trailing" in n ? !!n.trailing : M);
          function D(wt) {
            var he = r, Le = a;
            return r = a = i, b = wt, f = t.apply(Le, he), f;
          }
          function N(wt) {
            return b = wt, p = Un(X, e), A ? D(wt) : f;
          }
          function J(wt) {
            var he = wt - _, Le = wt - b, co = e - he;
            return E ? Tt(co, c - Le) : co;
          }
          function U(wt) {
            var he = wt - _, Le = wt - b;
            return _ === i || he >= e || he < 0 || E && Le >= c;
          }
          function X() {
            var wt = Pr();
            if (U(wt))
              return V(wt);
            p = Un(X, J(wt));
          }
          function V(wt) {
            return p = i, M && r ? D(wt) : (r = a = i, f);
          }
          function Yt() {
            p !== i && tu(p), b = 0, r = _ = a = p = i;
          }
          function Dt() {
            return p === i ? f : V(Pr());
          }
          function Xt() {
            var wt = Pr(), he = U(wt);
            if (r = arguments, a = this, _ = wt, he) {
              if (p === i)
                return N(_);
              if (E)
                return tu(p), p = Un(X, e), D(_);
            }
            return p === i && (p = Un(X, e)), f;
          }
          return Xt.cancel = Yt, Xt.flush = Dt, Xt;
        }
        var Vp = Z(function(t, e) {
          return Ra(t, 1, e);
        }), jp = Z(function(t, e, n) {
          return Ra(t, ae(e) || 0, n);
        });
        function tg(t) {
          return Ee(t, Ce);
        }
        function Rr(t, e) {
          if (typeof t != "function" || e != null && typeof e != "function")
            throw new ee(d);
          var n = function() {
            var r = arguments, a = e ? e.apply(this, r) : r[0], c = n.cache;
            if (c.has(a))
              return c.get(a);
            var f = t.apply(this, r);
            return n.cache = c.set(a, f) || c, f;
          };
          return n.cache = new (Rr.Cache || be)(), n;
        }
        Rr.Cache = be;
        function Or(t) {
          if (typeof t != "function")
            throw new ee(d);
          return function() {
            var e = arguments;
            switch (e.length) {
              case 0:
                return !t.call(this);
              case 1:
                return !t.call(this, e[0]);
              case 2:
                return !t.call(this, e[0], e[1]);
              case 3:
                return !t.call(this, e[0], e[1], e[2]);
            }
            return !t.apply(this, e);
          };
        }
        function eg(t) {
          return Uu(2, t);
        }
        var ng = qf(function(t, e) {
          e = e.length == 1 && z(e[0]) ? pt(e[0], Kt(B())) : pt(It(e, 1), Kt(B()));
          var n = e.length;
          return Z(function(r) {
            for (var a = -1, c = Tt(r.length, n); ++a < c; )
              r[a] = e[a].call(this, r[a]);
            return Ht(t, this, r);
          });
        }), as = Z(function(t, e) {
          var n = We(e, _n(as));
          return Ee(t, xt, i, e, n);
        }), Hu = Z(function(t, e) {
          var n = We(e, _n(Hu));
          return Ee(t, Pe, i, e, n);
        }), rg = Ie(function(t, e) {
          return Ee(t, ge, i, i, i, e);
        });
        function ig(t, e) {
          if (typeof t != "function")
            throw new ee(d);
          return e = e === i ? e : K(e), Z(t, e);
        }
        function sg(t, e) {
          if (typeof t != "function")
            throw new ee(d);
          return e = e == null ? 0 : bt(K(e), 0), Z(function(n) {
            var r = n[e], a = qe(n, 0, e);
            return r && De(a, r), Ht(t, this, a);
          });
        }
        function ag(t, e, n) {
          var r = !0, a = !0;
          if (typeof t != "function")
            throw new ee(d);
          return gt(n) && (r = "leading" in n ? !!n.leading : r, a = "trailing" in n ? !!n.trailing : a), zu(t, e, {
            leading: r,
            maxWait: e,
            trailing: a
          });
        }
        function ug(t) {
          return Nu(t, 1);
        }
        function og(t, e) {
          return as(zi(e), t);
        }
        function cg() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return z(t) ? t : [t];
        }
        function lg(t) {
          return re(t, k);
        }
        function fg(t, e) {
          return e = typeof e == "function" ? e : i, re(t, k, e);
        }
        function hg(t) {
          return re(t, m | k);
        }
        function pg(t, e) {
          return e = typeof e == "function" ? e : i, re(t, m | k, e);
        }
        function gg(t, e) {
          return e == null || Pa(t, e, At(e));
        }
        function fe(t, e) {
          return t === e || t !== t && e !== e;
        }
        var dg = Er(Pi), _g = Er(function(t, e) {
          return t >= e;
        }), en = Ba(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Ba : function(t) {
          return _t(t) && rt.call(t, "callee") && !ba.call(t, "callee");
        }, z = y.isArray, vg = sa ? Kt(sa) : Af;
        function $t(t) {
          return t != null && kr(t.length) && !Te(t);
        }
        function mt(t) {
          return _t(t) && $t(t);
        }
        function mg(t) {
          return t === !0 || t === !1 || _t(t) && Ot(t) == ot;
        }
        var Ge = Ll || vs, wg = aa ? Kt(aa) : Ef;
        function yg(t) {
          return _t(t) && t.nodeType === 1 && !$n(t);
        }
        function Cg(t) {
          if (t == null)
            return !0;
          if ($t(t) && (z(t) || typeof t == "string" || typeof t.splice == "function" || Ge(t) || vn(t) || en(t)))
            return !t.length;
          var e = Mt(t);
          if (e == dt || e == ht)
            return !t.size;
          if (Nn(t))
            return !ki(t).length;
          for (var n in t)
            if (rt.call(t, n))
              return !1;
          return !0;
        }
        function xg(t, e) {
          return Dn(t, e);
        }
        function Sg(t, e, n) {
          n = typeof n == "function" ? n : i;
          var r = n ? n(t, e) : i;
          return r === i ? Dn(t, e, i, n) : !!r;
        }
        function us(t) {
          if (!_t(t))
            return !1;
          var e = Ot(t);
          return e == Pt || e == zt || typeof t.message == "string" && typeof t.name == "string" && !$n(t);
        }
        function bg(t) {
          return typeof t == "number" && Ea(t);
        }
        function Te(t) {
          if (!gt(t))
            return !1;
          var e = Ot(t);
          return e == Bt || e == de || e == at || e == oe;
        }
        function Ku(t) {
          return typeof t == "number" && t == K(t);
        }
        function kr(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= Re;
        }
        function gt(t) {
          var e = typeof t;
          return t != null && (e == "object" || e == "function");
        }
        function _t(t) {
          return t != null && typeof t == "object";
        }
        var Ju = ua ? Kt(ua) : Ff;
        function Ag(t, e) {
          return t === e || Oi(t, e, Qi(e));
        }
        function Eg(t, e, n) {
          return n = typeof n == "function" ? n : i, Oi(t, e, Qi(e), n);
        }
        function Ig(t) {
          return Zu(t) && t != +t;
        }
        function Fg(t) {
          if (fh(t))
            throw new G(v);
          return Na(t);
        }
        function Tg(t) {
          return t === null;
        }
        function Mg(t) {
          return t == null;
        }
        function Zu(t) {
          return typeof t == "number" || _t(t) && Ot(t) == Rt;
        }
        function $n(t) {
          if (!_t(t) || Ot(t) != Ct)
            return !1;
          var e = or(t);
          if (e === null)
            return !0;
          var n = rt.call(e, "constructor") && e.constructor;
          return typeof n == "function" && n instanceof n && ir.call(n) == Al;
        }
        var os = oa ? Kt(oa) : Tf;
        function Lg(t) {
          return Ku(t) && t >= -9007199254740991 && t <= Re;
        }
        var Yu = ca ? Kt(ca) : Mf;
        function Dr(t) {
          return typeof t == "string" || !z(t) && _t(t) && Ot(t) == _e;
        }
        function Zt(t) {
          return typeof t == "symbol" || _t(t) && Ot(t) == Yn;
        }
        var vn = la ? Kt(la) : Lf;
        function Pg(t) {
          return t === i;
        }
        function Rg(t) {
          return _t(t) && Mt(t) == An;
        }
        function Og(t) {
          return _t(t) && Ot(t) == Yo;
        }
        var kg = Er(Di), Dg = Er(function(t, e) {
          return t <= e;
        });
        function Xu(t) {
          if (!t)
            return [];
          if ($t(t))
            return Dr(t) ? ce(t) : Ut(t);
          if (Fn && t[Fn])
            return pl(t[Fn]());
          var e = Mt(t), n = e == dt ? Si : e == ht ? er : mn;
          return n(t);
        }
        function Me(t) {
          if (!t)
            return t === 0 ? t : 0;
          if (t = ae(t), t === nn || t === -1 / 0) {
            var e = t < 0 ? -1 : 1;
            return e * Zn;
          }
          return t === t ? t : 0;
        }
        function K(t) {
          var e = Me(t), n = e % 1;
          return e === e ? n ? e - n : e : 0;
        }
        function Qu(t) {
          return t ? Qe(K(t), 0, P) : 0;
        }
        function ae(t) {
          if (typeof t == "number")
            return t;
          if (Zt(t))
            return xe;
          if (gt(t)) {
            var e = typeof t.valueOf == "function" ? t.valueOf() : t;
            t = gt(e) ? e + "" : e;
          }
          if (typeof t != "string")
            return t === 0 ? t : +t;
          t = _a(t);
          var n = _c.test(t);
          return n || mc.test(t) ? Xc(t.slice(2), n ? 2 : 8) : dc.test(t) ? xe : +t;
        }
        function Vu(t) {
          return me(t, qt(t));
        }
        function Wg(t) {
          return t ? Qe(K(t), -9007199254740991, Re) : t === 0 ? t : 0;
        }
        function nt(t) {
          return t == null ? "" : Jt(t);
        }
        var Bg = gn(function(t, e) {
          if (Nn(e) || $t(e)) {
            me(e, At(e), t);
            return;
          }
          for (var n in e)
            rt.call(e, n) && Rn(t, n, e[n]);
        }), ju = gn(function(t, e) {
          me(e, qt(e), t);
        }), Wr = gn(function(t, e, n, r) {
          me(e, qt(e), t, r);
        }), Ng = gn(function(t, e, n, r) {
          me(e, At(e), t, r);
        }), Ug = Ie(Ti);
        function $g(t, e) {
          var n = pn(t);
          return e == null ? n : La(n, e);
        }
        var qg = Z(function(t, e) {
          t = st(t);
          var n = -1, r = e.length, a = r > 2 ? e[2] : i;
          for (a && kt(e[0], e[1], a) && (r = 1); ++n < r; )
            for (var c = e[n], f = qt(c), p = -1, _ = f.length; ++p < _; ) {
              var b = f[p], A = t[b];
              (A === i || fe(A, ln[b]) && !rt.call(t, b)) && (t[b] = c[b]);
            }
          return t;
        }), Gg = Z(function(t) {
          return t.push(i, _u), Ht(to, i, t);
        });
        function zg(t, e) {
          return ha(t, B(e, 3), ve);
        }
        function Hg(t, e) {
          return ha(t, B(e, 3), Li);
        }
        function Kg(t, e) {
          return t == null ? t : Mi(t, B(e, 3), qt);
        }
        function Jg(t, e) {
          return t == null ? t : Da(t, B(e, 3), qt);
        }
        function Zg(t, e) {
          return t && ve(t, B(e, 3));
        }
        function Yg(t, e) {
          return t && Li(t, B(e, 3));
        }
        function Xg(t) {
          return t == null ? [] : mr(t, At(t));
        }
        function Qg(t) {
          return t == null ? [] : mr(t, qt(t));
        }
        function cs(t, e, n) {
          var r = t == null ? i : Ve(t, e);
          return r === i ? n : r;
        }
        function Vg(t, e) {
          return t != null && wu(t, e, Cf);
        }
        function ls(t, e) {
          return t != null && wu(t, e, xf);
        }
        var jg = fu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = sr.call(e)), t[e] = n;
        }, hs(Gt)), td = fu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = sr.call(e)), rt.call(t, e) ? t[e].push(n) : t[e] = [n];
        }, B), ed = Z(kn);
        function At(t) {
          return $t(t) ? Ta(t) : ki(t);
        }
        function qt(t) {
          return $t(t) ? Ta(t, !0) : Pf(t);
        }
        function nd(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(r, a, c) {
            Ae(n, e(r, a, c), r);
          }), n;
        }
        function rd(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(r, a, c) {
            Ae(n, a, e(r, a, c));
          }), n;
        }
        var id = gn(function(t, e, n) {
          wr(t, e, n);
        }), to = gn(function(t, e, n, r) {
          wr(t, e, n, r);
        }), sd = Ie(function(t, e) {
          var n = {};
          if (t == null)
            return n;
          var r = !1;
          e = pt(e, function(c) {
            return c = $e(c, t), r || (r = c.length > 1), c;
          }), me(t, Yi(t), n), r && (n = re(n, m | R | k, jf));
          for (var a = e.length; a--; )
            $i(n, e[a]);
          return n;
        });
        function ad(t, e) {
          return eo(t, Or(B(e)));
        }
        var ud = Ie(function(t, e) {
          return t == null ? {} : Of(t, e);
        });
        function eo(t, e) {
          if (t == null)
            return {};
          var n = pt(Yi(t), function(r) {
            return [r];
          });
          return e = B(e), Ka(t, n, function(r, a) {
            return e(r, a[0]);
          });
        }
        function od(t, e, n) {
          e = $e(e, t);
          var r = -1, a = e.length;
          for (a || (a = 1, t = i); ++r < a; ) {
            var c = t == null ? i : t[we(e[r])];
            c === i && (r = a, c = n), t = Te(c) ? c.call(t) : c;
          }
          return t;
        }
        function cd(t, e, n) {
          return t == null ? t : Wn(t, e, n);
        }
        function ld(t, e, n, r) {
          return r = typeof r == "function" ? r : i, t == null ? t : Wn(t, e, n, r);
        }
        var no = gu(At), ro = gu(qt);
        function fd(t, e, n) {
          var r = z(t), a = r || Ge(t) || vn(t);
          if (e = B(e, 4), n == null) {
            var c = t && t.constructor;
            a ? n = r ? new c() : [] : gt(t) ? n = Te(c) ? pn(or(t)) : {} : n = {};
          }
          return (a ? te : ve)(t, function(f, p, _) {
            return e(n, f, p, _);
          }), n;
        }
        function hd(t, e) {
          return t == null ? !0 : $i(t, e);
        }
        function pd(t, e, n) {
          return t == null ? t : Qa(t, e, zi(n));
        }
        function gd(t, e, n, r) {
          return r = typeof r == "function" ? r : i, t == null ? t : Qa(t, e, zi(n), r);
        }
        function mn(t) {
          return t == null ? [] : xi(t, At(t));
        }
        function dd(t) {
          return t == null ? [] : xi(t, qt(t));
        }
        function _d(t, e, n) {
          return n === i && (n = e, e = i), n !== i && (n = ae(n), n = n === n ? n : 0), e !== i && (e = ae(e), e = e === e ? e : 0), Qe(ae(t), e, n);
        }
        function vd(t, e, n) {
          return e = Me(e), n === i ? (n = e, e = 0) : n = Me(n), t = ae(t), Sf(t, e, n);
        }
        function md(t, e, n) {
          if (n && typeof n != "boolean" && kt(t, e, n) && (e = n = i), n === i && (typeof e == "boolean" ? (n = e, e = i) : typeof t == "boolean" && (n = t, t = i)), t === i && e === i ? (t = 0, e = 1) : (t = Me(t), e === i ? (e = t, t = 0) : e = Me(e)), t > e) {
            var r = t;
            t = e, e = r;
          }
          if (n || t % 1 || e % 1) {
            var a = Ia();
            return Tt(t + a * (e - t + Yc("1e-" + ((a + "").length - 1))), e);
          }
          return Bi(t, e);
        }
        var wd = dn(function(t, e, n) {
          return e = e.toLowerCase(), t + (n ? io(e) : e);
        });
        function io(t) {
          return fs(nt(t).toLowerCase());
        }
        function so(t) {
          return t = nt(t), t && t.replace(yc, ol).replace(Nc, "");
        }
        function yd(t, e, n) {
          t = nt(t), e = Jt(e);
          var r = t.length;
          n = n === i ? r : Qe(K(n), 0, r);
          var a = n;
          return n -= e.length, n >= 0 && t.slice(n, a) == e;
        }
        function Cd(t) {
          return t = nt(t), t && tc.test(t) ? t.replace(Ds, cl) : t;
        }
        function xd(t) {
          return t = nt(t), t && ac.test(t) ? t.replace(ai, "\\$&") : t;
        }
        var Sd = dn(function(t, e, n) {
          return t + (n ? "-" : "") + e.toLowerCase();
        }), bd = dn(function(t, e, n) {
          return t + (n ? " " : "") + e.toLowerCase();
        }), Ad = ou("toLowerCase");
        function Ed(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? on(t) : 0;
          if (!e || r >= e)
            return t;
          var a = (e - r) / 2;
          return Ar(hr(a), n) + t + Ar(fr(a), n);
        }
        function Id(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? on(t) : 0;
          return e && r < e ? t + Ar(e - r, n) : t;
        }
        function Fd(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? on(t) : 0;
          return e && r < e ? Ar(e - r, n) + t : t;
        }
        function Td(t, e, n) {
          return n || e == null ? e = 0 : e && (e = +e), kl(nt(t).replace(ui, ""), e || 0);
        }
        function Md(t, e, n) {
          return (n ? kt(t, e, n) : e === i) ? e = 1 : e = K(e), Ni(nt(t), e);
        }
        function Ld() {
          var t = arguments, e = nt(t[0]);
          return t.length < 3 ? e : e.replace(t[1], t[2]);
        }
        var Pd = dn(function(t, e, n) {
          return t + (n ? "_" : "") + e.toLowerCase();
        });
        function Rd(t, e, n) {
          return n && typeof n != "number" && kt(t, e, n) && (e = n = i), n = n === i ? P : n >>> 0, n ? (t = nt(t), t && (typeof e == "string" || e != null && !os(e)) && (e = Jt(e), !e && un(t)) ? qe(ce(t), 0, n) : t.split(e, n)) : [];
        }
        var Od = dn(function(t, e, n) {
          return t + (n ? " " : "") + fs(e);
        });
        function kd(t, e, n) {
          return t = nt(t), n = n == null ? 0 : Qe(K(n), 0, t.length), e = Jt(e), t.slice(n, n + e.length) == e;
        }
        function Dd(t, e, n) {
          var r = u.templateSettings;
          n && kt(t, e, n) && (e = i), t = nt(t), e = Wr({}, e, r, du);
          var a = Wr({}, e.imports, r.imports, du), c = At(a), f = xi(a, c), p, _, b = 0, A = e.interpolate || Xn, E = "__p += '", M = bi(
            (e.escape || Xn).source + "|" + A.source + "|" + (A === Ws ? gc : Xn).source + "|" + (e.evaluate || Xn).source + "|$",
            "g"
          ), D = "//# sourceURL=" + (rt.call(e, "sourceURL") ? (e.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++zc + "]") + `
`;
          t.replace(M, function(U, X, V, Yt, Dt, Xt) {
            return V || (V = Yt), E += t.slice(b, Xt).replace(Cc, ll), X && (p = !0, E += `' +
__e(` + X + `) +
'`), Dt && (_ = !0, E += `';
` + Dt + `;
__p += '`), V && (E += `' +
((__t = (` + V + `)) == null ? '' : __t) +
'`), b = Xt + U.length, U;
          }), E += `';
`;
          var N = rt.call(e, "variable") && e.variable;
          if (!N)
            E = `with (obj) {
` + E + `
}
`;
          else if (hc.test(N))
            throw new G(w);
          E = (_ ? E.replace(Xo, "") : E).replace(Qo, "$1").replace(Vo, "$1;"), E = "function(" + (N || "obj") + `) {
` + (N ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (p ? ", __e = _.escape" : "") + (_ ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + E + `return __p
}`;
          var J = uo(function() {
            return et(c, D + "return " + E).apply(i, f);
          });
          if (J.source = E, us(J))
            throw J;
          return J;
        }
        function Wd(t) {
          return nt(t).toLowerCase();
        }
        function Bd(t) {
          return nt(t).toUpperCase();
        }
        function Nd(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return _a(t);
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = ce(e), c = va(r, a), f = ma(r, a) + 1;
          return qe(r, c, f).join("");
        }
        function Ud(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return t.slice(0, ya(t) + 1);
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = ma(r, ce(e)) + 1;
          return qe(r, 0, a).join("");
        }
        function $d(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return t.replace(ui, "");
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = va(r, ce(e));
          return qe(r, a).join("");
        }
        function qd(t, e) {
          var n = Lt, r = Sn;
          if (gt(e)) {
            var a = "separator" in e ? e.separator : a;
            n = "length" in e ? K(e.length) : n, r = "omission" in e ? Jt(e.omission) : r;
          }
          t = nt(t);
          var c = t.length;
          if (un(t)) {
            var f = ce(t);
            c = f.length;
          }
          if (n >= c)
            return t;
          var p = n - on(r);
          if (p < 1)
            return r;
          var _ = f ? qe(f, 0, p).join("") : t.slice(0, p);
          if (a === i)
            return _ + r;
          if (f && (p += _.length - p), os(a)) {
            if (t.slice(p).search(a)) {
              var b, A = _;
              for (a.global || (a = bi(a.source, nt(Bs.exec(a)) + "g")), a.lastIndex = 0; b = a.exec(A); )
                var E = b.index;
              _ = _.slice(0, E === i ? p : E);
            }
          } else if (t.indexOf(Jt(a), p) != p) {
            var M = _.lastIndexOf(a);
            M > -1 && (_ = _.slice(0, M));
          }
          return _ + r;
        }
        function Gd(t) {
          return t = nt(t), t && jo.test(t) ? t.replace(ks, vl) : t;
        }
        var zd = dn(function(t, e, n) {
          return t + (n ? " " : "") + e.toUpperCase();
        }), fs = ou("toUpperCase");
        function ao(t, e, n) {
          return t = nt(t), e = n ? i : e, e === i ? hl(t) ? yl(t) : rl(t) : t.match(e) || [];
        }
        var uo = Z(function(t, e) {
          try {
            return Ht(t, i, e);
          } catch (n) {
            return us(n) ? n : new G(n);
          }
        }), Hd = Ie(function(t, e) {
          return te(e, function(n) {
            n = we(n), Ae(t, n, ss(t[n], t));
          }), t;
        });
        function Kd(t) {
          var e = t == null ? 0 : t.length, n = B();
          return t = e ? pt(t, function(r) {
            if (typeof r[1] != "function")
              throw new ee(d);
            return [n(r[0]), r[1]];
          }) : [], Z(function(r) {
            for (var a = -1; ++a < e; ) {
              var c = t[a];
              if (Ht(c[0], this, r))
                return Ht(c[1], this, r);
            }
          });
        }
        function Jd(t) {
          return mf(re(t, m));
        }
        function hs(t) {
          return function() {
            return t;
          };
        }
        function Zd(t, e) {
          return t == null || t !== t ? e : t;
        }
        var Yd = lu(), Xd = lu(!0);
        function Gt(t) {
          return t;
        }
        function ps(t) {
          return Ua(typeof t == "function" ? t : re(t, m));
        }
        function Qd(t) {
          return qa(re(t, m));
        }
        function Vd(t, e) {
          return Ga(t, re(e, m));
        }
        var jd = Z(function(t, e) {
          return function(n) {
            return kn(n, t, e);
          };
        }), t0 = Z(function(t, e) {
          return function(n) {
            return kn(t, n, e);
          };
        });
        function gs(t, e, n) {
          var r = At(e), a = mr(e, r);
          n == null && !(gt(e) && (a.length || !r.length)) && (n = e, e = t, t = this, a = mr(e, At(e)));
          var c = !(gt(n) && "chain" in n) || !!n.chain, f = Te(t);
          return te(a, function(p) {
            var _ = e[p];
            t[p] = _, f && (t.prototype[p] = function() {
              var b = this.__chain__;
              if (c || b) {
                var A = t(this.__wrapped__), E = A.__actions__ = Ut(this.__actions__);
                return E.push({ func: _, args: arguments, thisArg: t }), A.__chain__ = b, A;
              }
              return _.apply(t, De([this.value()], arguments));
            });
          }), t;
        }
        function e0() {
          return Et._ === this && (Et._ = El), this;
        }
        function ds() {
        }
        function n0(t) {
          return t = K(t), Z(function(e) {
            return za(e, t);
          });
        }
        var r0 = Ki(pt), i0 = Ki(fa), s0 = Ki(vi);
        function oo(t) {
          return ji(t) ? mi(we(t)) : kf(t);
        }
        function a0(t) {
          return function(e) {
            return t == null ? i : Ve(t, e);
          };
        }
        var u0 = hu(), o0 = hu(!0);
        function _s() {
          return [];
        }
        function vs() {
          return !1;
        }
        function c0() {
          return {};
        }
        function l0() {
          return "";
        }
        function f0() {
          return !0;
        }
        function h0(t, e) {
          if (t = K(t), t < 1 || t > Re)
            return [];
          var n = P, r = Tt(t, P);
          e = B(e), t -= P;
          for (var a = Ci(r, e); ++n < t; )
            e(n);
          return a;
        }
        function p0(t) {
          return z(t) ? pt(t, we) : Zt(t) ? [t] : Ut(Fu(nt(t)));
        }
        function g0(t) {
          var e = ++bl;
          return nt(t) + e;
        }
        var d0 = br(function(t, e) {
          return t + e;
        }, 0), _0 = Ji("ceil"), v0 = br(function(t, e) {
          return t / e;
        }, 1), m0 = Ji("floor");
        function w0(t) {
          return t && t.length ? vr(t, Gt, Pi) : i;
        }
        function y0(t, e) {
          return t && t.length ? vr(t, B(e, 2), Pi) : i;
        }
        function C0(t) {
          return ga(t, Gt);
        }
        function x0(t, e) {
          return ga(t, B(e, 2));
        }
        function S0(t) {
          return t && t.length ? vr(t, Gt, Di) : i;
        }
        function b0(t, e) {
          return t && t.length ? vr(t, B(e, 2), Di) : i;
        }
        var A0 = br(function(t, e) {
          return t * e;
        }, 1), E0 = Ji("round"), I0 = br(function(t, e) {
          return t - e;
        }, 0);
        function F0(t) {
          return t && t.length ? yi(t, Gt) : 0;
        }
        function T0(t, e) {
          return t && t.length ? yi(t, B(e, 2)) : 0;
        }
        return u.after = Qp, u.ary = Nu, u.assign = Bg, u.assignIn = ju, u.assignInWith = Wr, u.assignWith = Ng, u.at = Ug, u.before = Uu, u.bind = ss, u.bindAll = Hd, u.bindKey = $u, u.castArray = cg, u.chain = Du, u.chunk = mh, u.compact = wh, u.concat = yh, u.cond = Kd, u.conforms = Jd, u.constant = hs, u.countBy = Fp, u.create = $g, u.curry = qu, u.curryRight = Gu, u.debounce = zu, u.defaults = qg, u.defaultsDeep = Gg, u.defer = Vp, u.delay = jp, u.difference = Ch, u.differenceBy = xh, u.differenceWith = Sh, u.drop = bh, u.dropRight = Ah, u.dropRightWhile = Eh, u.dropWhile = Ih, u.fill = Fh, u.filter = Mp, u.flatMap = Rp, u.flatMapDeep = Op, u.flatMapDepth = kp, u.flatten = Pu, u.flattenDeep = Th, u.flattenDepth = Mh, u.flip = tg, u.flow = Yd, u.flowRight = Xd, u.fromPairs = Lh, u.functions = Xg, u.functionsIn = Qg, u.groupBy = Dp, u.initial = Rh, u.intersection = Oh, u.intersectionBy = kh, u.intersectionWith = Dh, u.invert = jg, u.invertBy = td, u.invokeMap = Bp, u.iteratee = ps, u.keyBy = Np, u.keys = At, u.keysIn = qt, u.map = Lr, u.mapKeys = nd, u.mapValues = rd, u.matches = Qd, u.matchesProperty = Vd, u.memoize = Rr, u.merge = id, u.mergeWith = to, u.method = jd, u.methodOf = t0, u.mixin = gs, u.negate = Or, u.nthArg = n0, u.omit = sd, u.omitBy = ad, u.once = eg, u.orderBy = Up, u.over = r0, u.overArgs = ng, u.overEvery = i0, u.overSome = s0, u.partial = as, u.partialRight = Hu, u.partition = $p, u.pick = ud, u.pickBy = eo, u.property = oo, u.propertyOf = a0, u.pull = Uh, u.pullAll = Ou, u.pullAllBy = $h, u.pullAllWith = qh, u.pullAt = Gh, u.range = u0, u.rangeRight = o0, u.rearg = rg, u.reject = zp, u.remove = zh, u.rest = ig, u.reverse = rs, u.sampleSize = Kp, u.set = cd, u.setWith = ld, u.shuffle = Jp, u.slice = Hh, u.sortBy = Xp, u.sortedUniq = Vh, u.sortedUniqBy = jh, u.split = Rd, u.spread = sg, u.tail = tp, u.take = ep, u.takeRight = np, u.takeRightWhile = rp, u.takeWhile = ip, u.tap = wp, u.throttle = ag, u.thru = Mr, u.toArray = Xu, u.toPairs = no, u.toPairsIn = ro, u.toPath = p0, u.toPlainObject = Vu, u.transform = fd, u.unary = ug, u.union = sp, u.unionBy = ap, u.unionWith = up, u.uniq = op, u.uniqBy = cp, u.uniqWith = lp, u.unset = hd, u.unzip = is, u.unzipWith = ku, u.update = pd, u.updateWith = gd, u.values = mn, u.valuesIn = dd, u.without = fp, u.words = ao, u.wrap = og, u.xor = hp, u.xorBy = pp, u.xorWith = gp, u.zip = dp, u.zipObject = _p, u.zipObjectDeep = vp, u.zipWith = mp, u.entries = no, u.entriesIn = ro, u.extend = ju, u.extendWith = Wr, gs(u, u), u.add = d0, u.attempt = uo, u.camelCase = wd, u.capitalize = io, u.ceil = _0, u.clamp = _d, u.clone = lg, u.cloneDeep = hg, u.cloneDeepWith = pg, u.cloneWith = fg, u.conformsTo = gg, u.deburr = so, u.defaultTo = Zd, u.divide = v0, u.endsWith = yd, u.eq = fe, u.escape = Cd, u.escapeRegExp = xd, u.every = Tp, u.find = Lp, u.findIndex = Mu, u.findKey = zg, u.findLast = Pp, u.findLastIndex = Lu, u.findLastKey = Hg, u.floor = m0, u.forEach = Wu, u.forEachRight = Bu, u.forIn = Kg, u.forInRight = Jg, u.forOwn = Zg, u.forOwnRight = Yg, u.get = cs, u.gt = dg, u.gte = _g, u.has = Vg, u.hasIn = ls, u.head = Ru, u.identity = Gt, u.includes = Wp, u.indexOf = Ph, u.inRange = vd, u.invoke = ed, u.isArguments = en, u.isArray = z, u.isArrayBuffer = vg, u.isArrayLike = $t, u.isArrayLikeObject = mt, u.isBoolean = mg, u.isBuffer = Ge, u.isDate = wg, u.isElement = yg, u.isEmpty = Cg, u.isEqual = xg, u.isEqualWith = Sg, u.isError = us, u.isFinite = bg, u.isFunction = Te, u.isInteger = Ku, u.isLength = kr, u.isMap = Ju, u.isMatch = Ag, u.isMatchWith = Eg, u.isNaN = Ig, u.isNative = Fg, u.isNil = Mg, u.isNull = Tg, u.isNumber = Zu, u.isObject = gt, u.isObjectLike = _t, u.isPlainObject = $n, u.isRegExp = os, u.isSafeInteger = Lg, u.isSet = Yu, u.isString = Dr, u.isSymbol = Zt, u.isTypedArray = vn, u.isUndefined = Pg, u.isWeakMap = Rg, u.isWeakSet = Og, u.join = Wh, u.kebabCase = Sd, u.last = se, u.lastIndexOf = Bh, u.lowerCase = bd, u.lowerFirst = Ad, u.lt = kg, u.lte = Dg, u.max = w0, u.maxBy = y0, u.mean = C0, u.meanBy = x0, u.min = S0, u.minBy = b0, u.stubArray = _s, u.stubFalse = vs, u.stubObject = c0, u.stubString = l0, u.stubTrue = f0, u.multiply = A0, u.nth = Nh, u.noConflict = e0, u.noop = ds, u.now = Pr, u.pad = Ed, u.padEnd = Id, u.padStart = Fd, u.parseInt = Td, u.random = md, u.reduce = qp, u.reduceRight = Gp, u.repeat = Md, u.replace = Ld, u.result = od, u.round = E0, u.runInContext = g, u.sample = Hp, u.size = Zp, u.snakeCase = Pd, u.some = Yp, u.sortedIndex = Kh, u.sortedIndexBy = Jh, u.sortedIndexOf = Zh, u.sortedLastIndex = Yh, u.sortedLastIndexBy = Xh, u.sortedLastIndexOf = Qh, u.startCase = Od, u.startsWith = kd, u.subtract = I0, u.sum = F0, u.sumBy = T0, u.template = Dd, u.times = h0, u.toFinite = Me, u.toInteger = K, u.toLength = Qu, u.toLower = Wd, u.toNumber = ae, u.toSafeInteger = Wg, u.toString = nt, u.toUpper = Bd, u.trim = Nd, u.trimEnd = Ud, u.trimStart = $d, u.truncate = qd, u.unescape = Gd, u.uniqueId = g0, u.upperCase = zd, u.upperFirst = fs, u.each = Wu, u.eachRight = Bu, u.first = Ru, gs(u, function() {
          var t = {};
          return ve(u, function(e, n) {
            rt.call(u.prototype, n) || (t[n] = e);
          }), t;
        }(), { chain: !1 }), u.VERSION = o, te(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t) {
          u[t].placeholder = u;
        }), te(["drop", "take"], function(t, e) {
          Q.prototype[t] = function(n) {
            n = n === i ? 1 : bt(K(n), 0);
            var r = this.__filtered__ && !e ? new Q(this) : this.clone();
            return r.__filtered__ ? r.__takeCount__ = Tt(n, r.__takeCount__) : r.__views__.push({
              size: Tt(n, P),
              type: t + (r.__dir__ < 0 ? "Right" : "")
            }), r;
          }, Q.prototype[t + "Right"] = function(n) {
            return this.reverse()[t](n).reverse();
          };
        }), te(["filter", "map", "takeWhile"], function(t, e) {
          var n = e + 1, r = n == bn || n == Xr;
          Q.prototype[t] = function(a) {
            var c = this.clone();
            return c.__iteratees__.push({
              iteratee: B(a, 3),
              type: n
            }), c.__filtered__ = c.__filtered__ || r, c;
          };
        }), te(["head", "last"], function(t, e) {
          var n = "take" + (e ? "Right" : "");
          Q.prototype[t] = function() {
            return this[n](1).value()[0];
          };
        }), te(["initial", "tail"], function(t, e) {
          var n = "drop" + (e ? "" : "Right");
          Q.prototype[t] = function() {
            return this.__filtered__ ? new Q(this) : this[n](1);
          };
        }), Q.prototype.compact = function() {
          return this.filter(Gt);
        }, Q.prototype.find = function(t) {
          return this.filter(t).head();
        }, Q.prototype.findLast = function(t) {
          return this.reverse().find(t);
        }, Q.prototype.invokeMap = Z(function(t, e) {
          return typeof t == "function" ? new Q(this) : this.map(function(n) {
            return kn(n, t, e);
          });
        }), Q.prototype.reject = function(t) {
          return this.filter(Or(B(t)));
        }, Q.prototype.slice = function(t, e) {
          t = K(t);
          var n = this;
          return n.__filtered__ && (t > 0 || e < 0) ? new Q(n) : (t < 0 ? n = n.takeRight(-t) : t && (n = n.drop(t)), e !== i && (e = K(e), n = e < 0 ? n.dropRight(-e) : n.take(e - t)), n);
        }, Q.prototype.takeRightWhile = function(t) {
          return this.reverse().takeWhile(t).reverse();
        }, Q.prototype.toArray = function() {
          return this.take(P);
        }, ve(Q.prototype, function(t, e) {
          var n = /^(?:filter|find|map|reject)|While$/.test(e), r = /^(?:head|last)$/.test(e), a = u[r ? "take" + (e == "last" ? "Right" : "") : e], c = r || /^find/.test(e);
          a && (u.prototype[e] = function() {
            var f = this.__wrapped__, p = r ? [1] : arguments, _ = f instanceof Q, b = p[0], A = _ || z(f), E = function(X) {
              var V = a.apply(u, De([X], p));
              return r && M ? V[0] : V;
            };
            A && n && typeof b == "function" && b.length != 1 && (_ = A = !1);
            var M = this.__chain__, D = !!this.__actions__.length, N = c && !M, J = _ && !D;
            if (!c && A) {
              f = J ? f : new Q(this);
              var U = t.apply(f, p);
              return U.__actions__.push({ func: Mr, args: [E], thisArg: i }), new ne(U, M);
            }
            return N && J ? t.apply(this, p) : (U = this.thru(E), N ? r ? U.value()[0] : U.value() : U);
          });
        }), te(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var e = nr[t], n = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", r = /^(?:pop|shift)$/.test(t);
          u.prototype[t] = function() {
            var a = arguments;
            if (r && !this.__chain__) {
              var c = this.value();
              return e.apply(z(c) ? c : [], a);
            }
            return this[n](function(f) {
              return e.apply(z(f) ? f : [], a);
            });
          };
        }), ve(Q.prototype, function(t, e) {
          var n = u[e];
          if (n) {
            var r = n.name + "";
            rt.call(hn, r) || (hn[r] = []), hn[r].push({ name: e, func: n });
          }
        }), hn[Sr(i, H).name] = [{
          name: "wrapper",
          func: i
        }], Q.prototype.clone = ql, Q.prototype.reverse = Gl, Q.prototype.value = zl, u.prototype.at = yp, u.prototype.chain = Cp, u.prototype.commit = xp, u.prototype.next = Sp, u.prototype.plant = Ap, u.prototype.reverse = Ep, u.prototype.toJSON = u.prototype.valueOf = u.prototype.value = Ip, u.prototype.first = u.prototype.head, Fn && (u.prototype[Fn] = bp), u;
      }, cn = Cl();
      Je ? ((Je.exports = cn)._ = cn, pi._ = cn) : Et._ = cn;
    }).call(U0);
  }(Gn, Gn.exports)), Gn.exports;
}
var Mo = $0();
const Y = /* @__PURE__ */ xo(Mo);
function Lo(l, s) {
  const i = Y.findLast(s.terrain, (o) => Cn(o.percents[0] * s.dist, l.loc, 4));
  return i ? i.value / 100 + 1 : 1;
}
const q0 = [
  "altitude",
  "grade",
  "terrain",
  "heat",
  "dark",
  "fatigue",
  "strategy"
];
function Ps(l) {
  const s = new ye().init(0);
  return l.forEach(({ factors: i, dist: o }) => {
    s.applyEach((h, v) => h + o * v, i);
  }), s.scaleEach(1 / Mo.sumBy(l, "dist")), s;
}
function G0(l, s) {
  let i = 0, o = 0;
  return l.forEach((h, v) => {
    const d = v === l.length - 1 ? s : l[v + 1].onset, w = h.type === "linear" ? h.value / 2 : h.value;
    o += (i + w) * (d - h.onset), i += h.value;
  }), o / s;
}
function z0(l) {
  return l < 30 ? 2 : l < 60 ? 5 : l < 90 ? 10 : l < 120 ? 15 : 20;
}
function H0(l, s, i) {
  let o = -G0(s, i);
  return s.forEach((h, v) => {
    if (l >= h.onset) {
      if (h.type === "step")
        o += h.value;
      else if (h.type === "linear") {
        const d = v === s.length - 1 ? i : s[v + 1].onset;
        l > d ? o += h.value : o += h.value * (l - h.onset) / (d - h.onset);
      }
    }
  }), o;
}
class Po {
  constructor(s, i) {
    I(this, "plan");
    I(this, "values");
    this.plan = s, this.values = i ? Y.cloneDeep(i) : [{ onset: 0, value: z0(this.plan.course.dist), type: "linear" }];
  }
  /**
   * Returns strategy factor at location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns  The strategy factor at input location.
   */
  at(s) {
    return 1 + H0(s, this.values, this.plan.course.dist) / 100;
  }
  addValue(s) {
    const i = this.values.findIndex((o) => o.onset >= s.onset);
    i >= 0 ? this.values.splice(i, 0, s) : this.values.push(s);
  }
}
function Is(l, s) {
  return s === void 0 ? l : (l - 1) * s + 1;
}
function Rs(l, s) {
  l.factors || (l.factors = new ye()), Object.assign(l.factors, {
    grade: Fo(l.grade),
    altitude: So(l.alt),
    terrain: Lo(l, s)
  });
}
function zn(l, s) {
  var i, o;
  if (l.factors || (l.factors = new ye()), Rs(l, s.course), s) {
    if (l.factors === void 0) throw new Error("no factors");
    l.factors.strategy = s.strategy.at(l.loc), Object.assign(l.factors, {
      heat: s.heatModel ? To(l, s.heatModel) : 1,
      dark: s.event.sun ? Io(l.tod, l.factors.terrain, s.event.sun) : 1
    });
  }
  l.factors.altitude = Is(l.factors.altitude, (i = s.scales) == null ? void 0 : i.altitude), l.factors.dark = Is(l.factors.dark, (o = s.scales) == null ? void 0 : o.dark);
}
const v_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Factors: ye,
  Strategy: Po,
  applyScale: Is,
  factorKeys: wn,
  generateCourseFactors: Rs,
  generatePlanFactors: zn,
  getAltitudeFactor: So,
  getDarkFactor: Io,
  getGradeFactor: Fo,
  getHeatFactor: To,
  getTerrainFactor: Lo,
  rollup: Ps,
  typeList: q0
}, Symbol.toStringTag, { value: "Module" }));
class Os {
  constructor(s) {
    I(this, "source");
    this.source = s;
  }
  get alt() {
    return this.source.alt;
  }
  set alt(s) {
    this.source.alt = s;
  }
  get lat() {
    return this.source.lat;
  }
  set lat(s) {
    this.source.lat = s;
  }
  get lon() {
    return this.source.lon;
  }
  set lon(s) {
    this.source.lon = s;
  }
}
class Jr extends Os {
  constructor(i, o, h) {
    super(i);
    I(this, "_trackData");
    this._trackData = { grade: h, loc: o };
  }
  get grade() {
    return this._trackData.grade;
  }
  get loc() {
    return this._trackData.loc;
  }
}
function Cs(l) {
  return "_course" in l;
}
class Gr extends Jr {
  constructor(i, o, h) {
    super(o, o.loc, o.grade);
    I(this, "_course");
    I(this, "factors", new ye());
    I(this, "_interpolated");
    I(this, "loop");
    I(this, "source");
    this._course = i, this.loop = h, this.source = o;
  }
  get grade() {
    return Cs(this.source) ? this.source.grade : this.source.grade * (this.source.grade > 0 ? this._course.gainScale : this._course.lossScale);
  }
  get interpolated() {
    return (Cs(this.source) ? this.source.interpolated : this._interpolated) || !1;
  }
  set interpolated(i) {
    this._interpolated = i;
  }
  get loc() {
    if (Cs(this.source)) return this.source.loc;
    let i = this.source.loc * this._course.distScale;
    return this.loop && (i += this._course.loopDist * this.loop), i;
  }
}
function zr(l, s) {
  const i = l.filter((h) => h > 0 && Hr(h, s, 4));
  return i.unshift(0), i.map((h, v) => ({ start: h, end: i[v + 1] || s }));
}
function Ro(l) {
  switch (l) {
    case "kilometers":
      return 1;
    case "miles":
      return 0.621371;
    default:
      throw new Error("Invalid distance unit");
  }
}
function Ur(l) {
  return typeof l == "number" && !isNaN(l);
}
function K0(l, s, i) {
  l = [...l], s.interpolated && l.splice(l.findIndex((v) => v.loc > s.loc) - 1, 0, s), i.interpolated && l.splice(l.findIndex((v) => v.loc > i.loc) - 1, 0, i);
  const o = l.filter(
    (v, d) => d >= l.findIndex((w) => w === s) && d <= l.findIndex((w) => w === i)
  ), h = o.map((v, d) => ({
    factors: v.factors,
    dist: d === o.length - 1 ? 0 : o[d + 1].loc - o[d].loc
  }));
  return h.pop(), Ps(h);
}
class Oo {
  constructor(s) {
    I(this, "point1");
    I(this, "point2");
    I(this, "gain");
    I(this, "loss");
    I(this, "grade");
    I(this, "waypoint");
    I(this, "_name");
    this.point1 = s.point1, this.point2 = s.point2, this.gain = s.gain, this.loss = s.loss, this.grade = s.grade, s.name && (this._name = s.name);
  }
  get name() {
    var s;
    return this._name || ((s = this.waypoint) == null ? void 0 : s.name) || void 0;
  }
  get start() {
    return this.point1.loc;
  }
  get dist() {
    return this.point2.loc - this.point1.loc;
  }
  get end() {
    return this.point2.loc;
  }
  get alt() {
    return this.point2.alt;
  }
}
class ko extends Oo {
  constructor(i, o) {
    super(o);
    I(this, "_course");
    I(this, "point1");
    I(this, "point2");
    this._course = i, this.point1 = o.point1, this.point2 = o.point2;
  }
}
class Do extends Oo {
  constructor(i, o) {
    super(o);
    I(this, "_plan");
    I(this, "point1");
    I(this, "point2");
    I(this, "_factors");
    this._plan = i, this.point1 = o.point1, this.point2 = o.point2;
  }
  get pace() {
    return this.time ? this.time / this.dist : 0;
  }
  get delay() {
    return !Ur(this.point1.elapsed) || !Ur(this.point2.elapsed) || !Ur(this.point1.time) || !Ur(this.point2.time) ? 0 : this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time);
  }
  get elapsed() {
    return this.point2.elapsed;
  }
  get time() {
    return this.point2.time - this.point1.time;
  }
  get tod() {
    return this.point2.tod;
  }
  // dummy setters, just in case:
  set delay(i) {
  }
  set pace(i) {
  }
  set elapsed(i) {
  }
  set time(i) {
  }
  set tod(i) {
  }
  get factors() {
    return this._factors || (this._factors = K0(this._plan.points, this.point1, this.point2));
  }
}
const xs = Ke("CourseSplits");
class J0 {
  constructor(s) {
    I(this, "_segments");
    I(this, "_miles");
    I(this, "_kilometers");
    I(this, "course");
    this.course = s;
  }
  get segments() {
    return this._segments || (this._segments = this.createSegments()), this._segments;
  }
  set segments(s) {
    this._segments = s;
  }
  get miles() {
    var s;
    return (s = this._miles) != null && s.length || (this._miles = this.createSplits("miles")), this._miles;
  }
  set miles(s) {
    this._miles = s;
  }
  get kilometers() {
    var s;
    return (s = this._kilometers) != null && s.length || (this._kilometers = this.createSplits("kilometers")), this._kilometers;
  }
  set kilometers(s) {
    this._kilometers = s;
  }
  createSegments() {
    xs("createSegments");
    const s = this.course.waypoints, i = this.calcSegments(
      zr(
        s.map((o) => o.loc),
        this.course.dist
      )
    );
    if (!i.length) throw new Error("createSegments result is empty");
    return i.forEach((o, h) => {
      o.waypoint = s[h + 1];
    }), i;
  }
  createSplits(s) {
    xs(`createSplits:${s}`);
    const i = Ro(s), o = Y.range(this.course.dist * i).map((v) => v / i);
    this.course.dist - o[o.length - 1] > 1e-4 && o.push(this.course.dist);
    const h = this.calcSegments(zr(o, this.course.dist));
    if (!h.length) throw new Error("createSplits result is empty");
    return h;
  }
  calcSegments(s) {
    var R;
    xs.extend("calcSegments")("exec");
    const o = this.course, h = o.points, v = [], d = [];
    let w, C, x = o.points[0], F;
    for (w = 0, C = s.length; w < C; w++) {
      const k = s[w];
      F && xn((R = s[w - 1]) == null ? void 0 : R.end, k.start, 4) ? x = F : x = o.getPoint(k.start), F = o.getPoint(k.end);
      const L = k.end - k.start, T = new ko(this.course, {
        gain: 0,
        loss: 0,
        grade: L > 0 ? (F.alt - x.alt) / L / 10 * (F.alt - x.alt > 0 ? o.gainScale : o.lossScale) : 0,
        point1: x,
        point2: F
      }), W = new ye().init(0);
      v.push(T), d.push(W);
    }
    const m = (k, L, T, W) => {
      const H = T.alt - L.alt;
      k[H > 0 ? "gain" : "loss"] += H * (H > 0 ? o.gainScale : o.lossScale), Rs(L, o);
      const tt = T.loc - L.loc;
      W.applyEach((it, vt) => it + vt * tt, L.factors);
    };
    w = 1;
    for (let k = 0; k < v.length; k++) {
      const L = v[k], T = d[k];
      for (; Cn(h[w].loc, L.point1.loc, 4); ) w++;
      let W = L.point1;
      for (; w < h.length && Cn(h[w].loc, L.point2.loc, 4); ) {
        const H = h[w];
        m(L, W, H, T), W = H, w++;
      }
      m(L, W, L.point2, T);
    }
    return v;
  }
}
var Qt = 63710088e-1, Wo = {
  centimeters: Qt * 100,
  centimetres: Qt * 100,
  degrees: 360 / (2 * Math.PI),
  feet: Qt * 3.28084,
  inches: Qt * 39.37,
  kilometers: Qt / 1e3,
  kilometres: Qt / 1e3,
  meters: Qt,
  metres: Qt,
  miles: Qt / 1609.344,
  millimeters: Qt * 1e3,
  millimetres: Qt * 1e3,
  nauticalmiles: Qt / 1852,
  radians: 1,
  yards: Qt * 1.0936
};
function Bo(l, s, i = {}) {
  const o = { type: "Feature" };
  return (i.id === 0 || i.id) && (o.id = i.id), i.bbox && (o.bbox = i.bbox), o.properties = s || {}, o.geometry = l, o;
}
function Fs(l, s, i = {}) {
  if (!l)
    throw new Error("coordinates is required");
  if (!Array.isArray(l))
    throw new Error("coordinates must be an Array");
  if (l.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!_o(l[0]) || !_o(l[1]))
    throw new Error("coordinates must contain numbers");
  return Bo({
    type: "Point",
    coordinates: l
  }, s, i);
}
function Z0(l, s, i = {}) {
  if (l.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return Bo({
    type: "LineString",
    coordinates: l
  }, s, i);
}
function Y0(l, s = "kilometers") {
  const i = Wo[s];
  if (!i)
    throw new Error(s + " units is invalid");
  return l * i;
}
function X0(l, s = "kilometers") {
  const i = Wo[s];
  if (!i)
    throw new Error(s + " units is invalid");
  return l / i;
}
function Ts(l) {
  return l % (2 * Math.PI) * 180 / Math.PI;
}
function pe(l) {
  return l % 360 * Math.PI / 180;
}
function _o(l) {
  return !isNaN(l) && l !== null && !Array.isArray(l);
}
function Hn(l) {
  if (!l)
    throw new Error("coord is required");
  if (!Array.isArray(l)) {
    if (l.type === "Feature" && l.geometry !== null && l.geometry.type === "Point")
      return [...l.geometry.coordinates];
    if (l.type === "Point")
      return [...l.coordinates];
  }
  if (Array.isArray(l) && l.length >= 2 && !Array.isArray(l[0]) && !Array.isArray(l[1]))
    return [...l];
  throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
function Q0(l) {
  return l.type === "Feature" ? l.geometry : l;
}
function No(l, s, i = {}) {
  if (i.final === !0)
    return V0(l, s);
  const o = Hn(l), h = Hn(s), v = pe(o[0]), d = pe(h[0]), w = pe(o[1]), C = pe(h[1]), x = Math.sin(d - v) * Math.cos(C), F = Math.cos(w) * Math.sin(C) - Math.sin(w) * Math.cos(C) * Math.cos(d - v);
  return Ts(Math.atan2(x, F));
}
function V0(l, s) {
  let i = No(s, l);
  return i = (i + 180) % 360, i;
}
function j0(l, s, i, o = {}) {
  const h = Hn(l), v = pe(h[0]), d = pe(h[1]), w = pe(i), C = X0(s, o.units), x = Math.asin(
    Math.sin(d) * Math.cos(C) + Math.cos(d) * Math.sin(C) * Math.cos(w)
  ), F = v + Math.atan2(
    Math.sin(w) * Math.sin(C) * Math.cos(d),
    Math.cos(C) - Math.sin(d) * Math.sin(x)
  ), m = Ts(F), R = Ts(x);
  return Fs([m, R], o.properties);
}
function Uo(l, s, i = {}) {
  var o = Hn(l), h = Hn(s), v = pe(h[1] - o[1]), d = pe(h[0] - o[0]), w = pe(o[1]), C = pe(h[1]), x = Math.pow(Math.sin(v / 2), 2) + Math.pow(Math.sin(d / 2), 2) * Math.cos(w) * Math.cos(C);
  return Y0(
    2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)),
    i.units
  );
}
function t_(l, s, i = {}) {
  const h = Q0(l).coordinates;
  let v = 0;
  for (let d = 0; d < h.length && !(s >= v && d === h.length - 1); d++)
    if (v >= s) {
      const w = s - v;
      if (w) {
        const C = No(h[d], h[d - 1]) - 180;
        return j0(
          h[d],
          w,
          C,
          i
        );
      } else
        return Fs(h[d]);
    } else
      v += Uo(h[d], h[d + 1], i);
  return Fs(h[h.length - 1]);
}
function $o(l, s, i) {
  if (l.loc > s.loc && i > l.loc || s.loc > l.loc && i > s.loc)
    throw new Error("Input location must be between points");
  const o = Z0([
    [l.lon, l.lat],
    [s.lon, s.lat]
  ]), h = t_(o, i - l.loc), v = l.grade, d = yn(l.loc, s.loc, l.alt, s.alt, i);
  return new Jr(
    { lon: h.geometry.coordinates[0], lat: h.geometry.coordinates[1], alt: d },
    i,
    v
  );
}
class Ms {
  constructor(s, i = 1) {
    I(this, "_data");
    I(this, "loop");
    I(this, "site");
    this._data = {}, this.site = s, this.loop = i;
  }
  get course() {
    return this.site.course;
  }
  get name() {
    return this.loop >= 2 && !this.isFinish ? `${this.site.name} ${this.loop}` : this.site.name;
  }
  get description() {
    return this.site.description;
  }
  get loc() {
    return (this.site.percent + this.loop - 1) * this.course.loopDist;
  }
  set loc(s) {
    if (!Y.isNumber(s)) throw new Error("Wrong format for Waypoint.loc");
    if (this.isStart || this.isFinish) {
      console.warn("Cannot set loc for start or finish waypoint");
      return;
    }
    this.site.percent = s / this.course.loopDist % 1;
  }
  get lat() {
    return this.site.lat;
  }
  get lon() {
    return this.site.lon;
  }
  get alt() {
    return this.site.alt;
  }
  get hasDelay() {
    return this.isStart ? !1 : this.site.hasDelay;
  }
  get isFinish() {
    return this.site.isFinish;
  }
  get isStart() {
    return this.site.isStart && this.loop === 1;
  }
  get cutoff() {
    var s, i;
    return (i = (s = this.site.cutoffs) == null ? void 0 : s.find((o) => o.loop === this.loop)) == null ? void 0 : i.time;
  }
}
const vo = Ke("models:Waypoint");
class qr {
  constructor(s, i) {
    /**
     * internal cache object
     * gets deleted and regenerated when version changes
     */
    I(this, "_cache", {});
    /**
     * internal data object
     */
    I(this, "_data");
    I(this, "course");
    this.course = s, this._data = i;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s._version) === this.version ? this._cache : (this._cache = { _version: this.version }, this._cache);
  }
  get alt() {
    return "alt" in this._cache ? this._cache.alt : (this.refreshLLA(), Number(this._cache.alt));
  }
  get cutoffs() {
    return this._data.cutoffs || [];
  }
  get description() {
    return this._data.description;
  }
  get hasDelay() {
    return this._data.hasDelay;
  }
  get id() {
    return this._data.id;
  }
  get isFinish() {
    return this._data.isFinish;
  }
  set isFinish(s) {
    this._data.isFinish = s;
  }
  get isStart() {
    return this._data.isStart;
  }
  set isStart(s) {
    this._data.isStart = s;
  }
  get lat() {
    return "lat" in this._cache ? this._cache.lat : (this.refreshLLA(), Number(this._cache.lat));
  }
  get lon() {
    return "lon" in this._cache ? this._cache.lon : (this.refreshLLA(), Number(this._cache.lon));
  }
  get name() {
    return this._data.name;
  }
  get percent() {
    return this.isStart ? 0 : this.isFinish ? 1 : this._data.percent;
  }
  set percent(s) {
    this._data.percent = s;
  }
  get version() {
    return this.course.version;
  }
  get waypoints() {
    return "waypoints" in this._cache ? this._cache.waypoints : (vo(`generating waypoints array: ${this.name}`), this.isFinish ? this._cache.waypoints = [new Ms(this, this.course.loops)] : this._cache.waypoints = Y.range(this.course.loops).map((s) => new Ms(this, s + 1)), this._cache.waypoints);
  }
  refreshLLA() {
    vo("refreshLLA");
    let s, i, o;
    this.isStart ? { lat: s, lon: i, alt: o } = this.course.track.points[0] : this.isFinish ? { lat: s, lon: i, alt: o } = this.course.track.points[this.course.track.points.length - 1] : { lat: s, lon: i, alt: o } = this.course.track.getLLA(this.percent * this.course.track.dist), this._cache.lat = s, this._cache.lon = i, this._cache.alt = o;
  }
}
const qn = Ke("models:Course"), qo = [
  { type: "paved", value: 0 },
  { type: "dirt road", value: 4 },
  { type: "doubletrack", value: 8 },
  { type: "singletrack", value: 15 },
  { type: "technical", value: 30 }
];
class e_ {
  constructor(s, i) {
    I(this, "_cache", {});
    /**
     * Course data
     */
    I(this, "_data");
    /**
     * Track object
     */
    I(this, "track");
    /**
     * Version of course update (non-trivial changes that affect pacing)
     */
    I(this, "version", 0);
    qn("constructor"), this.track = s, this._data = i, this.version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  /**
   * Course cutoffs
   */
  get cutoffs() {
    return "cutoffs" in this.cache ? this.cache.cutoffs : (this.cache.cutoffs = this.waypoints.filter((s) => s.cutoff).map((s) => new Go(s)), this.cache.cutoffs);
  }
  /**
   * Total distance of course (in km)
   */
  get dist() {
    return "dist" in this.cache ? this.cache.dist : (this.cache.dist = this._data.dist || this.track.dist * this.loops, this.cache.dist);
  }
  /**
   * Distance scale of course (in km), relative to calculated track distance
   */
  get distScale() {
    return this._data.dist ? this._data.dist / (this.track.dist * this.loops) : 1;
  }
  get gain() {
    return "gain" in this.cache ? this.cache.gain : (this.cache.gain = this._data.gain || this.track.gain * this.loops, this.cache.gain);
  }
  get gainScale() {
    return this._data.gain ? this._data.gain / (this.track.gain * this.loops) : 1;
  }
  get loopDist() {
    return this.dist / this.loops;
  }
  get loopGain() {
    return this.gain / this.loops;
  }
  get loopLoss() {
    return this.loss / this.loops;
  }
  get loops() {
    return this._data.loops || 1;
  }
  get loss() {
    return "loss" in this.cache ? this.cache.loss : (this.cache.loss = this._data.loss || this.track.loss * this.loops, this.cache.loss);
  }
  get lossScale() {
    return this._data.loss ? this._data.loss / (this.track.loss * this.loops) : 1;
  }
  get points() {
    if ("points" in this.cache) return this.cache.points;
    qn("generating points array"), this.cache.points = new Array(this.track.points.length * this.loops);
    for (let s = 0; s < this.loops; s++)
      for (let i = 0; i < this.track.points.length; i++)
        this.points[i + s * this.track.points.length] = new Gr(
          this,
          this.track.points[i],
          s
        );
    return this.cache.points;
  }
  get sites() {
    var s;
    if ("sites" in this.cache) return this.cache.sites;
    if (this.cache.sites = ((s = this._data.sites) == null ? void 0 : s.map((i) => new qr(this, i))) || [
      new qr(this, {
        id: String(Y.random(1e4, 2e4)),
        name: "Start",
        isStart: !0,
        percent: 0
      }),
      new qr(this, {
        id: String(Y.random(3e4, 4e4)),
        name: "Finish",
        isFinish: !0,
        percent: 1
      })
    ], this.cache.sites.length < 2 || this.cache.sites.filter((i) => i.isStart).length !== 1 || this.cache.sites.filter((i) => i.isFinish).length !== 1)
      throw new Error("Course must have at least a start and finish");
    return this.cache.sites;
  }
  get splits() {
    return "splits" in this.cache ? this.cache.splits : (this.cache.splits = new J0(this), this.cache.splits);
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    qn("stats:calculate");
    const s = this.track.points.map((d) => d.alt), i = this.track.points.map((d) => d.grade), o = this.terrain.map((d) => d.value / 100 + 1), h = {
      altitude: {
        avg: Y.sum(
          this.track.points.map((d, w) => {
            var C;
            return d.alt * (d.loc - (((C = this.track.points[w - 1]) == null ? void 0 : C.loc) || 0));
          })
        ) / this.track.dist,
        max: Y.max(s) || 0,
        min: Y.min(s) || 0
      },
      grade: {
        avg: (this.track.points[this.track.points.length - 1].alt - this.track.points[0].alt) / this.track.dist / 10,
        max: Y.max(i) || 0,
        min: Y.min(i) || 0
      },
      terrain: {
        avg: (Y.sumBy(this.terrain, (d) => (d.percents[1] - d.percents[0]) * this.dist * d.value) / this.dist + 100) / 100,
        max: Y.max(o) || 0,
        min: Y.min(o) || 0,
        maxDist: 0,
        minDist: 0
      }
    }, v = (d) => this.terrain.reduce(
      (w, C) => C.value / 100 + 1 === d ? w + (C.percents[1] - C.percents[0]) * this.dist : w,
      0
    );
    return Object.assign(h.terrain, {
      maxDist: v(h.terrain.max),
      minDist: v(h.terrain.min)
    }), this.cache.stats = h, h;
  }
  get terrain() {
    if ("terrain" in this.cache) return this.cache.terrain;
    if (this._data.terrain) {
      const s = [...this._data.terrain];
      s.sort((i, o) => i.percent - o.percent), this.cache.terrain = s.map((i, o) => {
        var w, C;
        const h = Y.isNumber(i.value) ? i.value : Y.isString(i.value) ? ((w = qo.find((x) => x.type === i.value)) == null ? void 0 : w.value) || 0 : i.value.value, v = typeof i == "string" ? i : Y.isObject(i.value) ? i.value.type : void 0;
        return {
          value: h,
          type: v,
          percents: [i.percent, ((C = s[o + 1]) == null ? void 0 : C.percent) || 1]
        };
      });
    } else
      this.cache.terrain = [];
    return this.cache.terrain;
  }
  get waypoints() {
    var i;
    if ("waypoints" in this.cache) return this.cache.waypoints;
    if (!((i = this.track) != null && i.dist)) return [];
    let s = [];
    return this.sites.forEach((o) => {
      s.push(...o.waypoints);
    }), s = s.sort((o, h) => o.loc - h.loc), this.cache.waypoints = s, this.cache.waypoints;
  }
  update(s) {
    qn("update"), Object.assign(this._data, s), this.version++;
  }
  /**
   * Finds or creates a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns The CoursePoint at input location.
   */
  getPoint(s) {
    const i = this.points.findIndex((C) => Kr(C.loc, s, 4)), o = this.points[i];
    if (xn(o.loc, s, 4)) return o;
    qn(`getPoint: creating new CoursePoint at ${s}`);
    const h = i - 1, v = this.points[h], d = $o(
      v.source,
      o.source,
      s % this.loopDist / this.distScale
    ), w = new Gr(this, d, Math.floor(s / this.loopDist));
    return w.interpolated = !0, w;
  }
  locationsToBreaks(s) {
    const i = s.filter((h) => h > 0 && Hr(h, this.dist, 4));
    return i.unshift(0), i.map((h, v) => ({ start: h, end: i[v + 1] || this.dist }));
  }
}
class Go {
  constructor(s) {
    I(this, "waypoint");
    this.waypoint = s;
  }
  get loc() {
    return this.waypoint.loc;
  }
  get time() {
    if (!this.waypoint.cutoff) throw new Error("Invalid cutoff");
    return this.waypoint.cutoff;
  }
}
var Ss = { exports: {} }, mo;
function n_() {
  return mo || (mo = 1, function(l, s) {
    (function() {
      var i = Math.PI, o = Math.sin, h = Math.cos, v = Math.tan, d = Math.asin, w = Math.atan2, C = Math.acos, x = i / 180, F = 1e3 * 60 * 60 * 24, m = 2440588, R = 2451545;
      function k(P) {
        return P.valueOf() / F - 0.5 + m;
      }
      function L(P) {
        return new Date((P + 0.5 - m) * F);
      }
      function T(P) {
        return k(P) - R;
      }
      var W = x * 23.4397;
      function H(P, $) {
        return w(o(P) * h(W) - v($) * o(W), h(P));
      }
      function tt(P, $) {
        return d(o($) * h(W) + h($) * o(W) * o(P));
      }
      function it(P, $, q) {
        return w(o(P), h(P) * o($) - v(q) * h($));
      }
      function vt(P, $, q) {
        return d(o($) * o(q) + h($) * h(q) * h(P));
      }
      function xt(P, $) {
        return x * (280.16 + 360.9856235 * P) - $;
      }
      function Pe(P) {
        return P < 0 && (P = 0), 2967e-7 / Math.tan(P + 312536e-8 / (P + 0.08901179));
      }
      function Ft(P) {
        return x * (357.5291 + 0.98560028 * P);
      }
      function ge(P) {
        var $ = x * (1.9148 * o(P) + 0.02 * o(2 * P) + 3e-4 * o(3 * P)), q = x * 102.9372;
        return P + $ + q + i;
      }
      function Ce(P) {
        var $ = Ft(P), q = ge($);
        return {
          dec: tt(q, 0),
          ra: H(q, 0)
        };
      }
      var Lt = {};
      Lt.getPosition = function(P, $, q) {
        var lt = x * -q, j = x * $, ft = T(P), at = Ce(ft), ot = xt(ft, lt) - at.ra;
        return {
          azimuth: it(ot, j, at.dec),
          altitude: vt(ot, j, at.dec)
        };
      };
      var Sn = Lt.times = [
        [-0.833, "sunrise", "sunset"],
        [-0.3, "sunriseEnd", "sunsetStart"],
        [-6, "dawn", "dusk"],
        [-12, "nauticalDawn", "nauticalDusk"],
        [-18, "nightEnd", "night"],
        [6, "goldenHourEnd", "goldenHour"]
      ];
      Lt.addTime = function(P, $, q) {
        Sn.push([P, $, q]);
      };
      var Kn = 9e-4;
      function Yr(P, $) {
        return Math.round(P - Kn - $ / (2 * i));
      }
      function bn(P, $, q) {
        return Kn + (P + $) / (2 * i) + q;
      }
      function Jn(P, $, q) {
        return R + P + 53e-4 * o($) - 69e-4 * o(2 * q);
      }
      function Xr(P, $, q) {
        return C((o(P) - o($) * o(q)) / (h($) * h(q)));
      }
      function nn(P) {
        return -2.076 * Math.sqrt(P) / 60;
      }
      function Re(P, $, q, lt, j, ft, at) {
        var ot = Xr(P, q, lt), yt = bn(ot, $, j);
        return Jn(yt, ft, at);
      }
      Lt.getTimes = function(P, $, q, lt) {
        lt = lt || 0;
        var j = x * -q, ft = x * $, at = nn(lt), ot = T(P), yt = Yr(ot, j), zt = bn(0, j, yt), Pt = Ft(zt), Bt = ge(Pt), de = tt(Bt, 0), dt = Jn(zt, Pt, Bt), Rt, Oe, Ct, Nt, oe, Vt, ht = {
          solarNoon: L(dt),
          nadir: L(dt - 0.5)
        };
        for (Rt = 0, Oe = Sn.length; Rt < Oe; Rt += 1)
          Ct = Sn[Rt], Nt = (Ct[0] + at) * x, oe = Re(Nt, j, ft, de, yt, Pt, Bt), Vt = dt - (oe - dt), ht[Ct[1]] = L(Vt), ht[Ct[2]] = L(oe);
        return ht;
      };
      function Zn(P) {
        var $ = x * (218.316 + 13.176396 * P), q = x * (134.963 + 13.064993 * P), lt = x * (93.272 + 13.22935 * P), j = $ + x * 6.289 * o(q), ft = x * 5.128 * o(lt), at = 385001 - 20905 * h(q);
        return {
          ra: H(j, ft),
          dec: tt(j, ft),
          dist: at
        };
      }
      Lt.getMoonPosition = function(P, $, q) {
        var lt = x * -q, j = x * $, ft = T(P), at = Zn(ft), ot = xt(ft, lt) - at.ra, yt = vt(ot, j, at.dec), zt = w(o(ot), v(j) * h(at.dec) - o(at.dec) * h(ot));
        return yt = yt + Pe(yt), {
          azimuth: it(ot, j, at.dec),
          altitude: yt,
          distance: at.dist,
          parallacticAngle: zt
        };
      }, Lt.getMoonIllumination = function(P) {
        var $ = T(P || /* @__PURE__ */ new Date()), q = Ce($), lt = Zn($), j = 149598e3, ft = C(o(q.dec) * o(lt.dec) + h(q.dec) * h(lt.dec) * h(q.ra - lt.ra)), at = w(j * o(ft), lt.dist - j * h(ft)), ot = w(h(q.dec) * o(q.ra - lt.ra), o(q.dec) * h(lt.dec) - h(q.dec) * o(lt.dec) * h(q.ra - lt.ra));
        return {
          fraction: (1 + h(at)) / 2,
          phase: 0.5 + 0.5 * at * (ot < 0 ? -1 : 1) / Math.PI,
          angle: ot
        };
      };
      function xe(P, $) {
        return new Date(P.valueOf() + $ * F / 24);
      }
      Lt.getMoonTimes = function(P, $, q, lt) {
        var j = new Date(P);
        lt ? j.setUTCHours(0, 0, 0, 0) : j.setHours(0, 0, 0, 0);
        for (var ft = 0.133 * x, at = Lt.getMoonPosition(j, $, q).altitude - ft, ot, yt, zt, Pt, Bt, de, dt, Rt, Oe, Ct, Nt, oe, Vt, ht = 1; ht <= 24 && (ot = Lt.getMoonPosition(xe(j, ht), $, q).altitude - ft, yt = Lt.getMoonPosition(xe(j, ht + 1), $, q).altitude - ft, Bt = (at + yt) / 2 - ot, de = (yt - at) / 2, dt = -de / (2 * Bt), Rt = (Bt * dt + de) * dt + ot, Oe = de * de - 4 * Bt * ot, Ct = 0, Oe >= 0 && (Vt = Math.sqrt(Oe) / (Math.abs(Bt) * 2), Nt = dt - Vt, oe = dt + Vt, Math.abs(Nt) <= 1 && Ct++, Math.abs(oe) <= 1 && Ct++, Nt < -1 && (Nt = oe)), Ct === 1 ? at < 0 ? zt = ht + Nt : Pt = ht + Nt : Ct === 2 && (zt = ht + (Rt < 0 ? oe : Nt), Pt = ht + (Rt < 0 ? Nt : oe)), !(zt && Pt)); ht += 2)
          at = yt;
        var _e = {};
        return zt && (_e.rise = xe(j, zt)), Pt && (_e.set = xe(j, Pt)), !zt && !Pt && (_e[Rt > 0 ? "alwaysUp" : "alwaysDown"] = !0), _e;
      }, l.exports = Lt;
    })();
  }(Ss)), Ss.exports;
}
var wo = n_();
function He(l, s) {
  const i = l.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: s
  }).split(":").map((o) => Number(o));
  return i[0] * 60 * 60 + i[1] * 60 + i[2];
}
class r_ {
  constructor(s) {
    I(this, "nadir", 0);
    I(this, "dawn", 0);
    I(this, "sunrise", 0);
    I(this, "dusk", 0);
    I(this, "sunset", 0);
    I(this, "noon", 0);
    I(this, "nadirAltitude", 0);
    Object.assign(this, s);
  }
}
class zo {
  constructor(s, i, o, h) {
    I(this, "start");
    I(this, "lat");
    I(this, "lon");
    I(this, "timezone");
    I(this, "sun");
    I(this, "startTime");
    this.start = s, this.lat = o, this.lon = h, this.timezone = i;
    const v = wo.getTimes(this.start, this.lat, this.lon), d = wo.getPosition(v.nadir, this.lat, this.lon);
    this.sun = new r_({
      nadir: He(v.nadir, this.timezone),
      dawn: He(v.dawn, this.timezone),
      sunrise: He(v.sunrise, this.timezone),
      dusk: He(v.dusk, this.timezone),
      sunset: He(v.sunset, this.timezone),
      noon: He(v.solarNoon, this.timezone),
      nadirAltitude: d.altitude * 180 / Math.PI
    }), this.startTime = He(this.start, this.timezone);
  }
  dateAtElapsed(s) {
    const i = new Date(this.start);
    return i.setTime(i.getTime() + s * 1e3), i;
  }
  elapsedToTimeOfDay(s) {
    return (this.startTime + s) % 86400;
  }
}
var bs = {}, yo;
function i_() {
  return yo || (yo = 1, function(l) {
    (function() {
      var s = {
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[+-]/
      };
      function i(w) {
        return h(d(w), arguments);
      }
      function o(w, C) {
        return i.apply(null, [w].concat(C || []));
      }
      function h(w, C) {
        var x = 1, F = w.length, m, R = "", k, L, T, W, H, tt, it, vt;
        for (k = 0; k < F; k++)
          if (typeof w[k] == "string")
            R += w[k];
          else if (typeof w[k] == "object") {
            if (T = w[k], T.keys)
              for (m = C[x], L = 0; L < T.keys.length; L++) {
                if (m == null)
                  throw new Error(i('[sprintf] Cannot access property "%s" of undefined value "%s"', T.keys[L], T.keys[L - 1]));
                m = m[T.keys[L]];
              }
            else T.param_no ? m = C[T.param_no] : m = C[x++];
            if (s.not_type.test(T.type) && s.not_primitive.test(T.type) && m instanceof Function && (m = m()), s.numeric_arg.test(T.type) && typeof m != "number" && isNaN(m))
              throw new TypeError(i("[sprintf] expecting number but found %T", m));
            switch (s.number.test(T.type) && (it = m >= 0), T.type) {
              case "b":
                m = parseInt(m, 10).toString(2);
                break;
              case "c":
                m = String.fromCharCode(parseInt(m, 10));
                break;
              case "d":
              case "i":
                m = parseInt(m, 10);
                break;
              case "j":
                m = JSON.stringify(m, null, T.width ? parseInt(T.width) : 0);
                break;
              case "e":
                m = T.precision ? parseFloat(m).toExponential(T.precision) : parseFloat(m).toExponential();
                break;
              case "f":
                m = T.precision ? parseFloat(m).toFixed(T.precision) : parseFloat(m);
                break;
              case "g":
                m = T.precision ? String(Number(m.toPrecision(T.precision))) : parseFloat(m);
                break;
              case "o":
                m = (parseInt(m, 10) >>> 0).toString(8);
                break;
              case "s":
                m = String(m), m = T.precision ? m.substring(0, T.precision) : m;
                break;
              case "t":
                m = String(!!m), m = T.precision ? m.substring(0, T.precision) : m;
                break;
              case "T":
                m = Object.prototype.toString.call(m).slice(8, -1).toLowerCase(), m = T.precision ? m.substring(0, T.precision) : m;
                break;
              case "u":
                m = parseInt(m, 10) >>> 0;
                break;
              case "v":
                m = m.valueOf(), m = T.precision ? m.substring(0, T.precision) : m;
                break;
              case "x":
                m = (parseInt(m, 10) >>> 0).toString(16);
                break;
              case "X":
                m = (parseInt(m, 10) >>> 0).toString(16).toUpperCase();
                break;
            }
            s.json.test(T.type) ? R += m : (s.number.test(T.type) && (!it || T.sign) ? (vt = it ? "+" : "-", m = m.toString().replace(s.sign, "")) : vt = "", H = T.pad_char ? T.pad_char === "0" ? "0" : T.pad_char.charAt(1) : " ", tt = T.width - (vt + m).length, W = T.width && tt > 0 ? H.repeat(tt) : "", R += T.align ? vt + m + W : H === "0" ? vt + W + m : W + vt + m);
          }
        return R;
      }
      var v = /* @__PURE__ */ Object.create(null);
      function d(w) {
        if (v[w])
          return v[w];
        for (var C = w, x, F = [], m = 0; C; ) {
          if ((x = s.text.exec(C)) !== null)
            F.push(x[0]);
          else if ((x = s.modulo.exec(C)) !== null)
            F.push("%");
          else if ((x = s.placeholder.exec(C)) !== null) {
            if (x[2]) {
              m |= 1;
              var R = [], k = x[2], L = [];
              if ((L = s.key.exec(k)) !== null)
                for (R.push(L[1]); (k = k.substring(L[0].length)) !== ""; )
                  if ((L = s.key_access.exec(k)) !== null)
                    R.push(L[1]);
                  else if ((L = s.index_access.exec(k)) !== null)
                    R.push(L[1]);
                  else
                    throw new SyntaxError("[sprintf] failed to parse named argument key");
              else
                throw new SyntaxError("[sprintf] failed to parse named argument key");
              x[2] = R;
            } else
              m |= 2;
            if (m === 3)
              throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
            F.push(
              {
                placeholder: x[0],
                param_no: x[1],
                keys: x[2],
                sign: x[3],
                pad_char: x[4],
                align: x[5],
                width: x[6],
                precision: x[7],
                type: x[8]
              }
            );
          } else
            throw new SyntaxError("[sprintf] unexpected placeholder");
          C = C.substring(x[0].length);
        }
        return v[w] = F;
      }
      l.sprintf = i, l.vsprintf = o, typeof window < "u" && (window.sprintf = i, window.vsprintf = o);
    })();
  }(bs)), bs;
}
var Ho = i_();
const s_ = Ke("PaceChunk");
class a_ {
  constructor() {
    I(this, "points", !1);
    I(this, "iterations", !1);
    I(this, "factor", !1);
    I(this, "target", !1);
  }
  get passing() {
    return this.iterations && this.factor && this.target && this.points;
  }
}
class Co {
  constructor(s, i, o, h) {
    I(this, "constraints");
    I(this, "points");
    I(this, "plan");
    I(this, "delay");
    I(this, "factor");
    I(this, "factors", new ye());
    I(this, "status");
    this.constraints = o, this.points = i, this.plan = s, this.delay = h, this.factor = 1;
  }
  get elapsed() {
    const s = Y.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0];
    return (Y.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - s;
  }
  get dist() {
    return this.points[this.points.length - 1].loc - this.points[0].loc;
  }
  get pace() {
    return (this.elapsed - this.delay) / this.dist;
  }
  get np() {
    return this.pace / this.factor;
  }
  get moving() {
    return this.elapsed - this.delay;
  }
  /**
   * apply pacing to chunk points, update factors
   */
  applyPacing() {
    this.plan.pacing.clearFactor();
    const s = this.points;
    s[0].elapsed = Y.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0], s[0].time = s[0].elapsed - Y.sum(this.plan.pacing.chunks.filter((x) => x.points[0].loc < s[0].loc).map((x) => x.delay)), this.plan.event.start && (s[0].tod = this.plan.event.elapsedToTimeOfDay(s[0].elapsed));
    let i = s[0].elapsed, o = s[0].delay || 0, h = 0, v = 0, d = 0;
    const w = this.factor ? this.np : this.plan.pacing.pace, C = new ye().init(0);
    for (let x = 1, F = s.length; x < F; x++) {
      h = s[x].loc - s[x - 1].loc, zn(s[x - 1], this.plan), C.applyEach((R, k) => R + k * h, s[x - 1].factors);
      const m = s[x - 1].factors.combined;
      d += m * h, v = w * m * h, s[x].time = s[x - 1].time + v, o = s[x - 1].delay || 0, i += v + o, s[x].elapsed = i, this.plan.event.start && (s[x].tod = this.plan.event.elapsedToTimeOfDay(i));
    }
    zn(s[s.length - 1], this.plan), this.factors = C.scaleEach(1 / this.dist), this.factor = d / this.dist;
  }
  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const o = s_.extend(
      Ho.vsprintf("calculate:%.2f-%.2f", [this.points[0].loc, this.points[this.points.length - 1].loc])
    );
    let h = this.factor || 0, v, d;
    const w = new a_();
    for (d = 1; d <= 30; d++)
      if (this.applyPacing(), w.iterations = d >= 2, w.factor = !Y.round(h - this.factor, d === 30 ? 6 : 8), h = this.factor, w.target = Math.abs(
        (Y.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - this.points[this.points.length - 1].elapsed
      ) < 0.1, w.points = v && this.points.every((x, F) => xn(x.elapsed, v[F], 0)) || !1, v = this.points.map((x) => x.elapsed), w.passing) {
        o(`iteration ${d} complete, passed`);
        break;
      } else
        o(
          `iteration ${d} complete, failed ${Object.keys(w).filter((x) => !w[x]).join("|")}`
        );
    o("chunk complete");
    const C = w.passing ? void 0 : `failed tests ${Object.keys(w).filter((x) => !w[x]).map((x) => `"${x}"`).join(",")} after ${d} iterations`;
    this.status = {
      errorMessage: C,
      tests: w,
      success: w.passing,
      iterations: d
    };
  }
}
const ue = Ke("Pacing");
class Ko {
  constructor(s) {
    I(this, "chunks", []);
    I(this, "plan");
    I(this, "_factor");
    I(this, "_factors");
    /**
     * last time this pacing was updated
     */
    I(this, "version");
    this.plan = s;
  }
  clearCache() {
    ue("clearCache"), delete this._factor, delete this._factors;
  }
  get elapsed() {
    return ue("elapsed:get"), this.plan.points[this.plan.points.length - 1].elapsed;
  }
  get pace() {
    return ue("pace:get"), (this.elapsed - this.plan.delay) / this.plan.course.dist;
  }
  get factor() {
    return this._factor ? this._factor : (ue("factor:update"), this.chunks && (this._factor = Y.sum(this.chunks.map((s) => s.factor * s.dist)) / this.plan.course.dist), this._factor || 1);
  }
  clearFactor() {
    delete this._factor;
  }
  get factors() {
    return ue("factors:get"), this._factors || (ue("factors:update"), this._factors = Ps(this.chunks)), this._factors;
  }
  /**
   * check if this pacing is current
   */
  get isCurrent() {
    return this.version === this.plan.version;
  }
  get np() {
    return ue("np:get"), this.pace / this.factor;
  }
  get moving() {
    return this.elapsed - this.plan.delay;
  }
  get status() {
    var i, o;
    const s = {
      complete: ((i = this.chunks) == null ? void 0 : i.length) > 0,
      errorMessage: void 0,
      success: ((o = this.chunks) == null ? void 0 : o.filter((h) => {
        var v;
        return !((v = h.status) != null && v.success);
      }).length) === 0,
      chunks: this.chunks.length,
      iterations: this.chunks.map((h) => {
        var v;
        return ((v = h.status) == null ? void 0 : v.iterations) || 0;
      })
    };
    return s.success || (s.errorMessage = this.chunks.filter((h) => {
      var v;
      return h.status && !((v = h.status) != null && v.success);
    }).map((h, v) => `Chunk ${v + 1}: ${h.status.errorMessage}`).join(" | ")), s;
  }
  calculate() {
    var o, h, v;
    const s = ue.extend("calculate");
    for (s("exec"), s("clearing cache"), this.clearCache(); this.plan.points.find((d) => d.interpolated); ) {
      const d = this.plan.points.findIndex((w) => w.interpolated);
      this.plan.points.splice(d, 1);
    }
    for (s("adding points at each terrain factor break"), (o = this.plan.course.terrain) == null || o.forEach(
      (d) => this.plan.getPoint(d.percents[0] * this.plan.course.dist, !0)
    ), s("adding points at each cutoff"), this.plan.cutoffMargin && ((h = this.plan.cutoffs) == null || h.forEach((d) => {
      this.plan.getPoint(d.loc, !0);
    })), this.plan.points.filter((d) => d.delay).forEach((d) => {
      d.delay = 0;
    }), (v = this.plan.delays) == null || v.forEach((d) => {
      const w = this.plan.getPoint(d.loc, !0);
      w.delay = d.delay;
    }), s("creating pace chunks"), this.initChunks(), [null, ...Y.reverse([...this.plan.cutoffs || []]), null].forEach((d) => {
      for (; this.chunks.find((C) => !C.status); )
        this.calcChunks(), this.validateChunks();
      if (!d) return !0;
      const w = this.plan.getPoint(d.loc);
      if (w.elapsed - d.time > 0.5) {
        s(`cutoff at ${d.loc} missed`);
        const C = this.chunks[0];
        Y.last(C.points) === w ? (s(`setting cutoff at ${d.loc}`), C.constraints = [0, d.time], delete C.status) : this.splitChunk(C, w, d.time);
      }
    }), Y.isFunction(this.chunks[this.chunks.length - 1].constraints[1]) && this.chunks.length > 2 && (s("rerunning last chunk"), this.chunks[this.chunks.length - 1].calculate()), ue(`pacing status=${this.status.success ? "PASS" : "FAIL"}.`); this.plan.points.find((d) => d.interpolated); ) {
      const d = this.plan.points.findIndex((w) => w.interpolated);
      this.plan.points.splice(d, 1);
    }
    this.version = this.plan.version;
  }
  /**
   * initialize pacing chunks array
   */
  initChunks() {
    let s;
    switch (this.plan.method) {
      case "time":
        s = this.plan.target;
        break;
      case "pace":
        s = this.plan.target * this.plan.course.dist + this.plan.delay;
        break;
      case "np":
        s = () => this.plan.target * (this.factor || 1) * this.plan.course.dist + this.plan.delay;
        break;
      default:
        throw new Error(`Incorrect pacing method ${this.plan.method}`);
    }
    this.chunks = [new Co(this.plan, this.plan.points, [0, s], this.plan.delay)], this.plan.points.forEach((i) => {
      i._chunk = this.chunks[0];
    });
  }
  /**
   * calculate pacing for each pacing chunk
   */
  calcChunks() {
    ue("calcChunks"), this.clearCache(), this.chunks.filter((s) => !s.status).forEach((s) => s.calculate());
  }
  /**
   * make sure chunks nps increasing monotincally and merge if needed
   */
  validateChunks() {
    let s = 1;
    for (; s <= this.chunks.length - 1; )
      this.chunks[s].np < this.chunks[s - 1].np ? this.mergeChunks(this.chunks[s - 1], this.chunks[s]) : s++;
  }
  /**
   * split pacing chunk; mutates chunks array
   * @param chunk - PaceChunk to split
   * @param point - point to split at
   * @param elapsed - elapsed time at split
   */
  splitChunk(s, i, o) {
    ue.extend("split")(`breaking chunks at ${i.loc} km`);
    const v = s.points.findIndex((C) => C === i), d = Y.round(i.elapsed - i.time), w = new Co(this.plan, s.points.slice(0, v + 1), [0, o], d);
    w.points.filter((C, x) => x < w.points.length - 1).forEach((C) => {
      C._chunk = w;
    }), this.chunks.unshift(w), s.constraints[0] = o, s.delay -= d, s.points = s.points.slice(v), delete s.status;
  }
  /**
   * merge two sequential chunks together, mutates chunks array
   * @param a - first chunk
   * @param b - second chunk
   */
  mergeChunks(s, i) {
    const o = this.chunks.findIndex((v) => v === s), h = this.chunks.findIndex((v) => v === i);
    if (h - o !== 1) throw new Error("chunks must be sequential");
    ue(Ho.sprintf("calcChunks: merging %i&%i (%.2f&%.2f)", o, h, s.np, i.np)), s.points.pop(), s.points.push(...i.points), s.delay += i.delay, delete s.status, s.points.forEach((v) => {
      v._chunk = s;
    }), s.constraints = [s.constraints[0], i.constraints[1]], this.chunks.splice(h, 1), s.calculate();
  }
}
class Ls extends Gr {
  constructor(i, o) {
    super(i.course, o, o.loop);
    I(this, "_plan");
    I(this, "_chunk");
    I(this, "delay", 0);
    I(this, "elapsed", 0);
    I(this, "factors", new ye());
    I(this, "source");
    I(this, "time", 0);
    I(this, "tod", 0);
    this._plan = i, this.source = o;
  }
  get factor() {
    var i;
    return (i = this.factors) == null ? void 0 : i.combined;
  }
  get np() {
    var i;
    if (!this._chunk) throw new Error("PlanPoint._chunk not defined");
    return (i = this._chunk) == null ? void 0 : i.np;
  }
  get pace() {
    return this.np * this.factor;
  }
}
const As = Ke("PlanSplits");
class u_ {
  constructor(s) {
    I(this, "plan");
    I(this, "_segments");
    I(this, "_segmentsVersion");
    I(this, "_miles");
    I(this, "_milesVersion");
    I(this, "_kilometers");
    I(this, "_kilometersVersion");
    this.plan = s;
  }
  get segments() {
    return this._segments && this._segmentsVersion === this.plan.version ? this._segments : (this._segments = this.createSegments(), this._segmentsVersion = this.plan.version, this._segments);
  }
  set segments(s) {
    this._segments = s;
  }
  get miles() {
    return this._miles && this._milesVersion === this.plan.version ? this._miles : (this._miles = this.createSplits("miles"), this._milesVersion = this.plan.version, this._miles);
  }
  set miles(s) {
    this._miles = s;
  }
  get kilometers() {
    return this._kilometers && this._kilometersVersion === this.plan.version ? this._kilometers : (this._kilometers = this.createSplits("kilometers"), this._kilometersVersion = this.plan.version, this._kilometers);
  }
  set kilometers(s) {
    this._kilometers = s;
  }
  createSegments() {
    As("createSegments");
    const s = this.plan.course.waypoints, i = this.calcSegments(
      zr(
        s.map((o) => o.loc),
        this.plan.course.dist
      )
    );
    if (!i.length) throw new Error("createSegments result is empty");
    return i.forEach((o, h) => {
      o.waypoint = s[h + 1];
    }), i;
  }
  createSplits(s) {
    As(`createSplits:${s}`);
    const i = Ro(s), o = Y.range(this.plan.course.dist * i).map(
      (v) => v / i
    );
    this.plan.course.dist - o[o.length - 1] > 1e-4 && o.push(this.plan.course.dist);
    const h = this.calcSegments(zr(o, this.plan.course.dist));
    if (!h.length) throw new Error("createSplits result is empty");
    return h;
  }
  calcSegments(s) {
    var k;
    As.extend("calcSegments")("exec"), this.plan.checkPacing();
    const o = this.plan, h = o.course, v = o.points, d = [], w = [];
    let C, x, F = o.points[0], m;
    for (C = 0, x = s.length; C < x; C++) {
      const L = s[C];
      m && xn((k = s[C - 1]) == null ? void 0 : k.end, L.start, 4) ? F = m : F = o.getPoint(L.start), m = o.getPoint(L.end);
      const T = L.end - L.start, W = new Do(this.plan, {
        gain: 0,
        loss: 0,
        grade: T > 0 ? (m.alt - F.alt) / T / 10 * (m.alt - F.alt > 0 ? h.gainScale : h.lossScale) : 0,
        point1: F,
        point2: m
      }), H = new ye().init(0);
      d.push(W), w.push(H);
    }
    const R = (L, T, W, H) => {
      const tt = W.alt - T.alt;
      L[tt > 0 ? "gain" : "loss"] += tt * (tt > 0 ? h.gainScale : h.lossScale), zn(T, o);
      const it = W.loc - T.loc;
      H.applyEach((vt, xt) => vt + xt * it, T.factors);
    };
    C = 1;
    for (let L = 0; L < d.length; L++) {
      const T = d[L], W = w[L];
      for (; Cn(v[C].loc, T.point1.loc, 4); ) C++;
      let H = T.point1;
      for (; C < v.length && Cn(v[C].loc, T.point2.loc, 4); ) {
        const tt = v[C];
        R(T, H, tt, W), H = tt, C++;
      }
      R(T, H, T.point2, W), o && (T.delay = o.delays.filter((tt) => Kr(T.point1.loc, tt.loc, 4) && Hr(T.point2.loc, tt.loc, 4)).reduce((tt, it) => tt + it.delay, 0));
    }
    return d;
  }
}
const ze = Ke("models:Plan");
class o_ {
  constructor(s, i) {
    I(this, "_cache", {});
    I(this, "_data");
    I(this, "course");
    I(this, "pacing", new Ko(this));
    I(this, "points");
    I(this, "splits", new u_(this));
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    I(this, "_version", 0);
    if (this.course = s, this._data = i, i.delays) {
      const o = s.sites.map((v) => v.id), h = i.delays.find((v) => !o.includes(v.siteId));
      if (h)
        throw console.error(`Site in plan delays is not in course sites (${String(h.siteId)})`), new Error("Site in plan delays is not in course sites.");
    }
    this.points = this.course.points.map((o) => new Ls(this, o)), this._version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  get cutoffMargin() {
    return this._data.cutoffMargin;
  }
  get cutoffs() {
    var i;
    if ("cutoffs" in this.cache) return this.cache.cutoffs;
    this.cache.cutoffs = this.cutoffMargin ? ((i = this.course.cutoffs) == null ? void 0 : i.map((o) => new l_(this, o, this.getPoint(o.loc, !0)))) || [] : [];
    let s = 0;
    for (; this.cache.cutoffs.length - 1 >= s; ) {
      const o = this.cache.cutoffs[s];
      this.cache.cutoffs.find((h, v) => v > s && h.time <= o.time) ? (ze(`get cutoffs: deleting extraneous cutoff at ${o.loc} km`), this.cache.cutoffs.splice(s, 1)) : s++;
    }
    return this.cache.cutoffs;
  }
  get delay() {
    return Y.sumBy(this.delays, "delay");
  }
  get delays() {
    if ("delays" in this.cache) return this.cache.delays;
    const s = this.course.waypoints.map((o) => {
      var d;
      const h = (d = this._data.delays) == null ? void 0 : d.find(
        (w) => w.loop === o.loop && w.siteId === o.site.id
      ), v = h ? h.delay : o.hasDelay ? this.typicalDelay : 0;
      return new c_(o, v);
    }).filter((o) => o.delay > 0).sort((o, h) => o.loc - h.loc);
    let i = 0;
    for (; s.length - 1 >= i; )
      i > 0 && s[i].loc === s[i - 1].loc ? (ze(`get delays: merging delay at ${s[i].loc} km`), s[i - 1].delay += s[i].delay, s.splice(i, 1)) : i++;
    return this.cache.delays = s, this.cache.delays;
  }
  get event() {
    if ("event" in this.cache) return this.cache.event;
    if (this._data.start)
      return this.cache.event = new zo(
        this._data.start.date,
        this._data.start.timezone,
        this.points[0].lat,
        this.points[0].lon
      );
    throw new Error("Start date/timezone is required for either the plan or the course");
  }
  get events() {
    if ("events" in this.cache) return this.cache.events;
    ze("calculating events.sun");
    const s = [], i = this.event.elapsedToTimeOfDay(0), o = Math.ceil((i + this.points[this.points.length - 1].elapsed) / 86400);
    for (let d = 0; d < o; d++)
      [
        { event: "dawn", time: this.event.sun.dawn },
        { event: "sunrise", time: this.event.sun.sunrise },
        { event: "nadir", time: this.event.sun.nadir },
        { event: "sunset", time: this.event.sun.sunset },
        { event: "dusk", time: this.event.sun.dusk }
      ].forEach((C) => {
        const x = C.time - i + 86400 * d;
        x >= 0 && x <= this.points[this.points.length - 1].elapsed && s.push({ event: C.event, elapsed: x });
      });
    s.sort((d, w) => d.elapsed - w.elapsed);
    const h = bo(
      this.points.map((d) => d.elapsed),
      this.points.map((d) => d.loc),
      s.map((d) => d.elapsed)
    ), v = s.map((d, w) => ({ ...d, loc: h[w] }));
    return this.cache.events = { sun: v }, this.cache.events;
  }
  get heatModel() {
    return "heatModel" in this.cache ? this.cache.heatModel : this._data.heatModel ? this.cache.heatModel = {
      start: this.event.sun.sunrise + 1800,
      stop: this.event.sun.sunset + 7200,
      baseline: this._data.heatModel.baseline,
      max: this._data.heatModel.max
    } : this.cache.heatModel = void 0;
  }
  get id() {
    return this._data.id;
  }
  get method() {
    return this._data.method;
  }
  get name() {
    return this._data.name;
  }
  get scales() {
    return "scales" in this.cache ? this.cache.scales : this._data.scales ? this.cache.scales = {
      altitude: this._data.scales.altitude || 1,
      dark: this._data.scales.dark || 1
    } : this.cache.scales = void 0;
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    ze("calculating stats.factors");
    const s = Y.fromPairs(
      wn.map((v) => {
        const d = this.points.map((w) => w.factors[v]);
        return [
          v,
          {
            min: Number(Y.min(d)),
            max: Number(Y.max(d))
          }
        ];
      })
    );
    ze("calculating stats.sun");
    const i = {
      day: { time: 0, dist: 0 },
      twilight: { time: 0, dist: 0 },
      dark: { time: 0, dist: 0 }
    };
    let o = 0, h = 0;
    return this.points.forEach((v, d) => {
      var w, C;
      o = v.loc - (((w = this.points[d - 1]) == null ? void 0 : w.loc) || 0), h = v.elapsed - (((C = this.points[d - 1]) == null ? void 0 : C.elapsed) || 0), !isNaN(this.event.sun.dawn) && !isNaN(this.event.sun.dusk) && (v.tod <= this.event.sun.dawn || v.tod >= this.event.sun.dusk) ? (i.dark.time += h, i.dark.dist += o) : v.tod < this.event.sun.sunrise || v.tod > this.event.sun.sunset ? (i.twilight.time += h, i.twilight.dist += o) : (i.day.time += h, i.day.dist += o);
    }), this.cache.stats = { factors: s, sun: i }, this.cache.stats;
  }
  get strategy() {
    return "strategy" in this.cache ? this.cache.strategy : this.cache.strategy = new Po(this, this._data.strategy);
  }
  get target() {
    return this._data.target;
  }
  get typicalDelay() {
    return this._data.typicalDelay ?? 180;
  }
  /**
   * Version of course & plan update (non trivial changes that affect pacing)
   */
  get version() {
    return this._version + this.course.version;
  }
  checkPacing() {
    var s, i;
    if (ze("checkPacing"), (!((s = this.pacing.status) != null && s.complete) || !this.pacing.isCurrent) && (ze("checkPacing: calculate"), this.pacing.calculate()), !((i = this.points) != null && i.length)) throw new Error("No plan points");
    return !0;
  }
  getDelayAtWaypoint(s) {
    var i;
    return ((i = this.delays.find((o) => o.waypoint === s)) == null ? void 0 : i.delay) || 0;
  }
  getPoint(s, i = !1) {
    const o = this.points.findIndex((C) => Kr(C.loc, s, 4)), h = this.points[o];
    if (xn(h.loc, s, 4)) return h;
    ze(`getPoint: ${i ? "inserting" : "creating"} new PlanPoint at ${s}`);
    const v = o - 1, d = this.points[v], w = new Ls(this, this.course.getPoint(s));
    return w.delay = Math.round(h.elapsed - d.elapsed - (h.time - d.time)), w.time = yn(d.loc, h.loc, d.time, h.time, w.loc), w.elapsed = d.elapsed + d.delay + (w.time - d.time), w.tod = this.event.elapsedToTimeOfDay(w.elapsed), zn(w, this), i && this.points.splice(o, 0, w), w;
  }
  update(s) {
    const o = ["target", "method"].find((h) => h in s && Y.isNil(s[h]));
    if (o) throw new Error(`Plan.${o} cannot be set to null or undefined`);
    Object.assign(this._data, s), this._version++;
  }
}
class c_ {
  constructor(s, i) {
    I(this, "delay");
    I(this, "waypoint");
    this.waypoint = s, this.delay = i;
  }
  get loc() {
    return this.waypoint.loc;
  }
}
class l_ {
  constructor(s, i, o) {
    I(this, "plan");
    I(this, "courseCutoff");
    I(this, "point");
    this.plan = s, this.courseCutoff = i, this.point = o;
  }
  get waypoint() {
    return this.courseCutoff.waypoint;
  }
  get loc() {
    return this.courseCutoff.loc;
  }
  get time() {
    return this.courseCutoff.time - Math.max(this.plan.cutoffMargin || 0, this.plan.getDelayAtWaypoint(this.waypoint));
  }
}
const Jo = (l, s, i, o) => {
  const h = Eo(l, s, i, o), v = [];
  return i.forEach((d, w) => {
    let C = h[w][0] / 10;
    C > 50 ? C = 50 : C < -50 && (C = -50);
    const x = d * h[w][0] + h[w][1];
    v.push({
      grade: C,
      alt: x
    });
  }), v;
};
function f_(l, s) {
  return Jo(
    s,
    l.map((o) => o.alt),
    s,
    0.05
  ).map((o) => o.grade);
}
const h_ = (l) => {
  let s = 0, i = 0;
  const o = [0];
  for (let h = 1, v = l.length; h < v; h++)
    s = Uo([l[h - 1].lon, l[h - 1].lat], [l[h].lon, l[h].lat]), i += s, o.push(i);
  return o;
}, $r = Ke("models:Track");
class Zr {
  constructor(s) {
    I(this, "dist");
    I(this, "gain");
    I(this, "loss");
    I(this, "points");
    $r("Creating new Track object");
    const i = s.map((x) => new Os(x)), o = h_(i), h = f_(i, o);
    this.points = i.map((x, F) => new Jr(x, o[F], h[F])), $r(`set-points - ${i.length} points`), $r("Calculating"), this.dist = this.points[this.points.length - 1].loc;
    let v = 0, d = 0, w = 0, C = this.points[0].alt;
    this.points.forEach((x) => {
      w = x.alt - C, w < 0 ? d += w : v += w, C = x.alt;
    }), this.gain = v, this.loss = d;
  }
  get start() {
    return Y.pick(this.points[0], ["alt", "lat", "lon"]);
  }
  get finish() {
    return Y.pick(this.points[this.points.length - 1], ["alt", "lat", "lon"]);
  }
  getLLA(s) {
    s > this.dist && (s = s % this.dist);
    let i;
    if (s === 0) i = this.points[0];
    else {
      const o = this.points.findIndex((h) => h.loc >= s);
      i = $o(this.points[o - 1], this.points[o], s);
    }
    return Y.pick(i, ["lat", "lon", "alt"]);
  }
  reduceDensity(s = 0.025, i = this.points.length / 2) {
    const o = $r.extend("reduceDensity");
    if (this.dist / s > i / 2)
      return o("Does not meet criteria"), this;
    const h = this.dist, v = Math.floor(h / s) + 1, d = Array(v).fill(0).map((F, m) => Wt(m++ * s, 3));
    d[d.length - 1] < h && d.push(h);
    const w = Jo(
      this.points.map((F) => F.loc),
      this.points.map((F) => F.alt),
      d,
      2 * s
    ), C = d.map((F) => this.getLLA(F)).map((F, m) => ({
      lat: Wt(F.lat, 6),
      lon: Wt(F.lon, 6),
      alt: Wt(w[m].alt, 2)
    })), x = new Zr(C);
    return o(`Reduced from ${this.points.length} to ${x.points.length} points.`), x;
  }
}
function p_(l, s, i) {
  const o = l.map((h, v) => ({ lat: l[v], lon: s[v], alt: i[v] }));
  return new Zr(o);
}
const m_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Course: e_,
  CourseCutoff: Go,
  CoursePoint: Gr,
  CourseSegment: ko,
  Event: zo,
  Pacing: Ko,
  Plan: o_,
  PlanPoint: Ls,
  PlanSegment: Do,
  Point: Os,
  Site: qr,
  Track: Zr,
  TrackPoint: Jr,
  Waypoint: Ms,
  createTrackFromArrays: p_,
  terrainTypes: qo
}, Symbol.toStringTag, { value: "Module" })), w_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dateToTODSeconds: He
}, Symbol.toStringTag, { value: "Module" }));
export {
  ye as Factors,
  m_ as Models,
  Po as Strategy,
  G0 as adjustStrategy,
  d_ as enableDebug,
  v_ as factors,
  $o as interpolatePoint,
  __ as math,
  B0 as scaleDark,
  w_ as util
};
