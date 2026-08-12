var P0 = Object.defineProperty;
var R0 = (l, s, i) => s in l ? P0(l, s, { enumerable: !0, configurable: !0, writable: !0, value: i }) : l[s] = i;
var I = (l, s, i) => R0(l, typeof s != "symbol" ? s + "" : s, i);
var Wr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function So(l) {
  return l && l.__esModule && Object.prototype.hasOwnProperty.call(l, "default") ? l.default : l;
}
var Br = { exports: {} }, ms, fo;
function O0() {
  if (fo) return ms;
  fo = 1;
  var l = 1e3, s = l * 60, i = s * 60, o = i * 24, h = o * 7, m = o * 365.25;
  ms = function(F, w) {
    w = w || {};
    var R = typeof F;
    if (R === "string" && F.length > 0)
      return d(F);
    if (R === "number" && isFinite(F))
      return w.long ? y(F) : v(F);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(F)
    );
  };
  function d(F) {
    if (F = String(F), !(F.length > 100)) {
      var w = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        F
      );
      if (w) {
        var R = parseFloat(w[1]), k = (w[2] || "ms").toLowerCase();
        switch (k) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return R * m;
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
  function v(F) {
    var w = Math.abs(F);
    return w >= o ? Math.round(F / o) + "d" : w >= i ? Math.round(F / i) + "h" : w >= s ? Math.round(F / s) + "m" : w >= l ? Math.round(F / l) + "s" : F + "ms";
  }
  function y(F) {
    var w = Math.abs(F);
    return w >= o ? x(F, w, o, "day") : w >= i ? x(F, w, i, "hour") : w >= s ? x(F, w, s, "minute") : w >= l ? x(F, w, l, "second") : F + " ms";
  }
  function x(F, w, R, k) {
    var L = w >= R * 1.5;
    return Math.round(F / R) + " " + k + (L ? "s" : "");
  }
  return ms;
}
var ws, ho;
function k0() {
  if (ho) return ws;
  ho = 1;
  function l(s) {
    o.debug = o, o.default = o, o.coerce = x, o.disable = v, o.enable = m, o.enabled = y, o.humanize = O0(), o.destroy = F, Object.keys(s).forEach((w) => {
      o[w] = s[w];
    }), o.names = [], o.skips = [], o.formatters = {};
    function i(w) {
      let R = 0;
      for (let k = 0; k < w.length; k++)
        R = (R << 5) - R + w.charCodeAt(k), R |= 0;
      return o.colors[Math.abs(R) % o.colors.length];
    }
    o.selectColor = i;
    function o(w) {
      let R, k = null, L, T;
      function W(...z) {
        if (!W.enabled)
          return;
        const tt = W, it = Number(/* @__PURE__ */ new Date()), vt = it - (R || it);
        tt.diff = vt, tt.prev = R, tt.curr = it, R = it, z[0] = o.coerce(z[0]), typeof z[0] != "string" && z.unshift("%O");
        let xt = 0;
        z[0] = z[0].replace(/%([a-zA-Z%])/g, (Ft, ge) => {
          if (Ft === "%%")
            return "%";
          xt++;
          const Ce = o.formatters[ge];
          if (typeof Ce == "function") {
            const Lt = z[xt];
            Ft = Ce.call(tt, Lt), z.splice(xt, 1), xt--;
          }
          return Ft;
        }), o.formatArgs.call(tt, z), (tt.log || o.log).apply(tt, z);
      }
      return W.namespace = w, W.useColors = o.useColors(), W.color = o.selectColor(w), W.extend = h, W.destroy = o.destroy, Object.defineProperty(W, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => k !== null ? k : (L !== o.namespaces && (L = o.namespaces, T = o.enabled(w)), T),
        set: (z) => {
          k = z;
        }
      }), typeof o.init == "function" && o.init(W), W;
    }
    function h(w, R) {
      const k = o(this.namespace + (typeof R > "u" ? ":" : R) + w);
      return k.log = this.log, k;
    }
    function m(w) {
      o.save(w), o.namespaces = w, o.names = [], o.skips = [];
      const R = (typeof w == "string" ? w : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const k of R)
        k[0] === "-" ? o.skips.push(k.slice(1)) : o.names.push(k);
    }
    function d(w, R) {
      let k = 0, L = 0, T = -1, W = 0;
      for (; k < w.length; )
        if (L < R.length && (R[L] === w[k] || R[L] === "*"))
          R[L] === "*" ? (T = L, W = k, L++) : (k++, L++);
        else if (T !== -1)
          L = T + 1, W++, k = W;
        else
          return !1;
      for (; L < R.length && R[L] === "*"; )
        L++;
      return L === R.length;
    }
    function v() {
      const w = [
        ...o.names,
        ...o.skips.map((R) => "-" + R)
      ].join(",");
      return o.enable(""), w;
    }
    function y(w) {
      for (const R of o.skips)
        if (d(w, R))
          return !1;
      for (const R of o.names)
        if (d(w, R))
          return !0;
      return !1;
    }
    function x(w) {
      return w instanceof Error ? w.stack || w.message : w;
    }
    function F() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return o.enable(o.load()), o;
  }
  return ws = l, ws;
}
var po;
function D0() {
  return po || (po = 1, function(l, s) {
    s.formatArgs = o, s.save = h, s.load = m, s.useColors = i, s.storage = d(), s.destroy = /* @__PURE__ */ (() => {
      let y = !1;
      return () => {
        y || (y = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
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
      let y;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (y = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(y[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function o(y) {
      if (y[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + y[0] + (this.useColors ? "%c " : " ") + "+" + l.exports.humanize(this.diff), !this.useColors)
        return;
      const x = "color: " + this.color;
      y.splice(1, 0, x, "color: inherit");
      let F = 0, w = 0;
      y[0].replace(/%[a-zA-Z%]/g, (R) => {
        R !== "%%" && (F++, R === "%c" && (w = F));
      }), y.splice(w, 0, x);
    }
    s.log = console.debug || console.log || (() => {
    });
    function h(y) {
      try {
        y ? s.storage.setItem("debug", y) : s.storage.removeItem("debug");
      } catch {
      }
    }
    function m() {
      let y;
      try {
        y = s.storage.getItem("debug");
      } catch {
      }
      return !y && typeof process < "u" && "env" in process && (y = process.env.DEBUG), y;
    }
    function d() {
      try {
        return localStorage;
      } catch {
      }
    }
    l.exports = k0()(s);
    const { formatters: v } = l.exports;
    v.j = function(y) {
      try {
        return JSON.stringify(y);
      } catch (x) {
        return "[UnexpectedJSONParseError]: " + x.message;
      }
    };
  }(Br, Br.exports)), Br.exports;
}
var W0 = D0();
const Es = /* @__PURE__ */ So(W0), ys = {};
function ze(l) {
  if (!ys[l]) {
    const s = Es("ultraPacer:core");
    s(`loading debug for namespace "${l}"`), ys[l] = s.extend(l);
  }
  return ys[l];
}
function __() {
  Es.enable("ultraPacer:core*"), Es("ultraPacer:core")("debug enabled");
}
const B0 = {
  rate: 6,
  // %
  span: 1e3,
  // m
  th: 750
  // m
};
function Ao(l, s) {
  (s === null || typeof s > "u") && (s = B0);
  let i = 0;
  return Array.isArray(l) ? i = (l[0] + l[1]) / 2 : i = l, i <= s.th ? 1 : (1 + s.rate / s.span / 100) ** (i - s.th);
}
const go = {
  baseline: 0,
  terrainScale: 1
};
function Wt(l, s = 0) {
  return Math.round(l * 10 ** s) / 10 ** s;
}
function wn(l, s, i, o, h) {
  return i + (h - l) / (s - l) * (o - i);
}
function bo(l, s, i) {
  let o = 0, h = 0;
  const m = [];
  for (o = 0; o < i.length; o++)
    if (i[o] < l[h])
      m.push(s[h]);
    else {
      for (; h < l.length - 1 && l[h + 1] <= i[o]; )
        h++;
      h === l.length - 1 || i[o] === l[h] ? m.push(s[h]) : m.push(wn(l[h], l[h + 1], s[h], s[h + 1], i[o]));
    }
  return m;
}
function Eo(l) {
  let s, i, o, h, m = 0, d = 0, v = 0, y = 0, x = 0;
  for (s = 0; s < l.length; s++)
    i = l[s][0], o = l[s][1], h = l[s][2], x += h, m += h * i, v += h * (i * i), d += h * o, y += h * (i * o);
  const F = (d * v - m * y) / (x * v - m * m);
  return [(x * y - m * d) / (x * v - m * m), F];
}
function Io(l, s, i, o) {
  let h = 0, m = 0;
  const d = [];
  return i.forEach((v) => {
    for (; l[h] < v - o; )
      h++;
    for (h > 0 && l[h] >= v && h--; m < l.length - 1 && l[m + 1] <= v + o; )
      m++;
    m < l.length - 1 && l[m] <= v && m++;
    const y = Math.max(o, Math.abs(v - l[h]) + 1e-3, Math.abs(v - l[m]) + 1e-3), x = [];
    let F = 0;
    for (let w = h; w <= m; w++)
      F = (1 - (Math.abs(v - l[w]) / y) ** 3) ** 3, x.push([l[w], s[w], F]);
    d.push(Eo(x));
  }), d;
}
function zr(l, s, i) {
  return Wt(l, i) < Wt(s, i);
}
function U0(l, s, i) {
  return Wt(l, i) > Wt(s, i);
}
function yn(l, s, i) {
  return Wt(l, i) <= Wt(s, i);
}
function Kr(l, s, i) {
  return Wt(l, i) >= Wt(s, i);
}
function Cn(l, s, i) {
  return Wt(l, i) === Wt(s, i);
}
const v_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interp: wn,
  interpArray: bo,
  linearRegression: Eo,
  req: Cn,
  rgt: U0,
  rgte: Kr,
  rlt: zr,
  rlte: yn,
  round: Wt,
  wlslr: Io
}, Symbol.toStringTag, { value: "Module" })), Ur = -6;
function Fo(l, s) {
  var i, o, h, m;
  if (l.noon.altitude <= Ur || // sun never gets above twilight altitude
  l.dawn && s < l.dawn.time || // before dawn
  l.dusk && s > l.dusk.time)
    return 1;
  if (l.sunrise && s < l.sunrise.time || // before sunrise
  l.sunset && s > l.sunset.time || // after sunset
  !l.sunrise && !l.sunset && l.noon.altitude < 0) {
    let d = function(x) {
      return x < l.noon.time ? x + 86400 : x;
    };
    const v = l.noon.altitude >= 0 ? 0 : l.noon.altitude / Ur, y = l.nadir.altitude < Ur ? 1 : l.nadir.altitude / Ur;
    return d(s) >= d(l.nadir.time) ? wn(d(((i = l.dawn) == null ? void 0 : i.time) ?? l.nadir.time), d(((o = l.sunrise) == null ? void 0 : o.time) ?? l.noon.time), y, v, d(s)) : wn(d(((h = l.sunset) == null ? void 0 : h.time) ?? l.noon.time), d(((m = l.dusk) == null ? void 0 : m.time) ?? l.nadir.time), v, y, d(s));
  } else
    return 0;
}
function To(l, s, i, o = go) {
  if (s === 1)
    return 1;
  (o === null || typeof o > "u") && (o = go);
  const h = o.terrainScale * (s - 1) + o.baseline, m = Fo(i, l);
  return 1 + h * m;
}
const mn = [
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
    return mn.forEach((i) => this._data[i] = s), this;
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
    return this._combined === void 0 && (this._combined = mn.reduce((s, i) => s * this._data[i], 1)), this._combined;
  }
  /**
   * @param f - function to apply
   * @param factors - factor list to apply
   */
  applyEach(s, i) {
    mn.forEach((o) => this._data[o] = s(this._data[o], i[o]));
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
    return mn.forEach((i) => this._data[i] *= s), delete this._combined, this;
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
function Mo(l, s) {
  return (s === null || typeof s > "u") && (s = N0), l < s.lower.lim ? s.lower.m * l + s.lower.b : l > s.upper.lim ? s.upper.m * l + s.upper.b : s.a * l ** 2 + s.b * l + 1;
}
function Lo(l, s) {
  if (!s)
    return 1;
  const i = l.tod;
  let o = 1;
  if (i > s.start && i < s.stop) {
    const h = (i - s.start) / (s.stop - s.start) * Math.PI;
    o += (s.max - s.baseline) * Math.sin(h) / 100;
  }
  return o += s.baseline / 100, o;
}
var qn = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var $0 = qn.exports, _o;
function q0() {
  return _o || (_o = 1, function(l, s) {
    (function() {
      var i, o = "4.17.21", h = 200, m = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", d = "Expected a function", v = "Invalid `variable` option passed into `_.template`", y = "__lodash_hash_undefined__", x = 500, F = "__lodash_placeholder__", w = 1, R = 2, k = 4, L = 1, T = 2, W = 1, z = 2, tt = 4, it = 8, vt = 16, xt = 32, Pe = 64, Ft = 128, ge = 256, Ce = 512, Lt = 30, xn = "...", zn = 800, Yr = 16, Sn = 1, Kn = 2, Xr = 3, en = 1 / 0, Re = 9007199254740991, Jn = 17976931348623157e292, xe = NaN, P = 4294967295, $ = P - 1, q = P >>> 1, lt = [
        ["ary", Ft],
        ["bind", W],
        ["bindKey", z],
        ["curry", it],
        ["curryRight", vt],
        ["flip", Ce],
        ["partial", xt],
        ["partialRight", Pe],
        ["rearg", ge]
      ], j = "[object Arguments]", ft = "[object Array]", at = "[object AsyncFunction]", ot = "[object Boolean]", yt = "[object Date]", Ht = "[object DOMException]", Pt = "[object Error]", Bt = "[object Function]", de = "[object GeneratorFunction]", dt = "[object Map]", Rt = "[object Number]", Oe = "[object Null]", Ct = "[object Object]", Ut = "[object Promise]", oe = "[object Proxy]", Vt = "[object RegExp]", ht = "[object Set]", _e = "[object String]", Zn = "[object Symbol]", Xo = "[object Undefined]", An = "[object WeakMap]", Qo = "[object WeakSet]", bn = "[object ArrayBuffer]", nn = "[object DataView]", Qr = "[object Float32Array]", Vr = "[object Float64Array]", jr = "[object Int8Array]", ti = "[object Int16Array]", ei = "[object Int32Array]", ni = "[object Uint8Array]", ri = "[object Uint8ClampedArray]", ii = "[object Uint16Array]", si = "[object Uint32Array]", Vo = /\b__p \+= '';/g, jo = /\b(__p \+=) '' \+/g, tc = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Ds = /&(?:amp|lt|gt|quot|#39);/g, Ws = /[&<>"']/g, ec = RegExp(Ds.source), nc = RegExp(Ws.source), rc = /<%-([\s\S]+?)%>/g, ic = /<%([\s\S]+?)%>/g, Bs = /<%=([\s\S]+?)%>/g, sc = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ac = /^\w*$/, uc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ai = /[\\^$.*+?()[\]{}|]/g, oc = RegExp(ai.source), ui = /^\s+/, cc = /\s/, lc = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, fc = /\{\n\/\* \[wrapped with (.+)\] \*/, hc = /,? & /, pc = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, gc = /[()=,{}\[\]\/\s]/, dc = /\\(\\)?/g, _c = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Us = /\w*$/, vc = /^[-+]0x[0-9a-f]+$/i, mc = /^0b[01]+$/i, wc = /^\[object .+?Constructor\]$/, yc = /^0o[0-7]+$/i, Cc = /^(?:0|[1-9]\d*)$/, xc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Yn = /($^)/, Sc = /['\n\r\u2028\u2029\\]/g, Xn = "\\ud800-\\udfff", Ac = "\\u0300-\\u036f", bc = "\\ufe20-\\ufe2f", Ec = "\\u20d0-\\u20ff", Ns = Ac + bc + Ec, $s = "\\u2700-\\u27bf", qs = "a-z\\xdf-\\xf6\\xf8-\\xff", Ic = "\\xac\\xb1\\xd7\\xf7", Fc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Tc = "\\u2000-\\u206f", Mc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Gs = "A-Z\\xc0-\\xd6\\xd8-\\xde", Hs = "\\ufe0e\\ufe0f", zs = Ic + Fc + Tc + Mc, oi = "['’]", Lc = "[" + Xn + "]", Ks = "[" + zs + "]", Qn = "[" + Ns + "]", Js = "\\d+", Pc = "[" + $s + "]", Zs = "[" + qs + "]", Ys = "[^" + Xn + zs + Js + $s + qs + Gs + "]", ci = "\\ud83c[\\udffb-\\udfff]", Rc = "(?:" + Qn + "|" + ci + ")", Xs = "[^" + Xn + "]", li = "(?:\\ud83c[\\udde6-\\uddff]){2}", fi = "[\\ud800-\\udbff][\\udc00-\\udfff]", rn = "[" + Gs + "]", Qs = "\\u200d", Vs = "(?:" + Zs + "|" + Ys + ")", Oc = "(?:" + rn + "|" + Ys + ")", js = "(?:" + oi + "(?:d|ll|m|re|s|t|ve))?", ta = "(?:" + oi + "(?:D|LL|M|RE|S|T|VE))?", ea = Rc + "?", na = "[" + Hs + "]?", kc = "(?:" + Qs + "(?:" + [Xs, li, fi].join("|") + ")" + na + ea + ")*", Dc = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Wc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", ra = na + ea + kc, Bc = "(?:" + [Pc, li, fi].join("|") + ")" + ra, Uc = "(?:" + [Xs + Qn + "?", Qn, li, fi, Lc].join("|") + ")", Nc = RegExp(oi, "g"), $c = RegExp(Qn, "g"), hi = RegExp(ci + "(?=" + ci + ")|" + Uc + ra, "g"), qc = RegExp([
        rn + "?" + Zs + "+" + js + "(?=" + [Ks, rn, "$"].join("|") + ")",
        Oc + "+" + ta + "(?=" + [Ks, rn + Vs, "$"].join("|") + ")",
        rn + "?" + Vs + "+" + js,
        rn + "+" + ta,
        Wc,
        Dc,
        Js,
        Bc
      ].join("|"), "g"), Gc = RegExp("[" + Qs + Xn + Ns + Hs + "]"), Hc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, zc = [
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
      ], Kc = -1, ct = {};
      ct[Qr] = ct[Vr] = ct[jr] = ct[ti] = ct[ei] = ct[ni] = ct[ri] = ct[ii] = ct[si] = !0, ct[j] = ct[ft] = ct[bn] = ct[ot] = ct[nn] = ct[yt] = ct[Pt] = ct[Bt] = ct[dt] = ct[Rt] = ct[Ct] = ct[Vt] = ct[ht] = ct[_e] = ct[An] = !1;
      var ut = {};
      ut[j] = ut[ft] = ut[bn] = ut[nn] = ut[ot] = ut[yt] = ut[Qr] = ut[Vr] = ut[jr] = ut[ti] = ut[ei] = ut[dt] = ut[Rt] = ut[Ct] = ut[Vt] = ut[ht] = ut[_e] = ut[Zn] = ut[ni] = ut[ri] = ut[ii] = ut[si] = !0, ut[Pt] = ut[Bt] = ut[An] = !1;
      var Jc = {
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
      }, Zc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Yc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Xc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, Qc = parseFloat, Vc = parseInt, ia = typeof Wr == "object" && Wr && Wr.Object === Object && Wr, jc = typeof self == "object" && self && self.Object === Object && self, Et = ia || jc || Function("return this")(), pi = s && !s.nodeType && s, Ke = pi && !0 && l && !l.nodeType && l, sa = Ke && Ke.exports === pi, gi = sa && ia.process, jt = function() {
        try {
          var g = Ke && Ke.require && Ke.require("util").types;
          return g || gi && gi.binding && gi.binding("util");
        } catch {
        }
      }(), aa = jt && jt.isArrayBuffer, ua = jt && jt.isDate, oa = jt && jt.isMap, ca = jt && jt.isRegExp, la = jt && jt.isSet, fa = jt && jt.isTypedArray;
      function zt(g, S, C) {
        switch (C.length) {
          case 0:
            return g.call(S);
          case 1:
            return g.call(S, C[0]);
          case 2:
            return g.call(S, C[0], C[1]);
          case 3:
            return g.call(S, C[0], C[1], C[2]);
        }
        return g.apply(S, C);
      }
      function tl(g, S, C, O) {
        for (var G = -1, et = g == null ? 0 : g.length; ++G < et; ) {
          var St = g[G];
          S(O, St, C(St), g);
        }
        return O;
      }
      function te(g, S) {
        for (var C = -1, O = g == null ? 0 : g.length; ++C < O && S(g[C], C, g) !== !1; )
          ;
        return g;
      }
      function el(g, S) {
        for (var C = g == null ? 0 : g.length; C-- && S(g[C], C, g) !== !1; )
          ;
        return g;
      }
      function ha(g, S) {
        for (var C = -1, O = g == null ? 0 : g.length; ++C < O; )
          if (!S(g[C], C, g))
            return !1;
        return !0;
      }
      function ke(g, S) {
        for (var C = -1, O = g == null ? 0 : g.length, G = 0, et = []; ++C < O; ) {
          var St = g[C];
          S(St, C, g) && (et[G++] = St);
        }
        return et;
      }
      function Vn(g, S) {
        var C = g == null ? 0 : g.length;
        return !!C && sn(g, S, 0) > -1;
      }
      function di(g, S, C) {
        for (var O = -1, G = g == null ? 0 : g.length; ++O < G; )
          if (C(S, g[O]))
            return !0;
        return !1;
      }
      function pt(g, S) {
        for (var C = -1, O = g == null ? 0 : g.length, G = Array(O); ++C < O; )
          G[C] = S(g[C], C, g);
        return G;
      }
      function De(g, S) {
        for (var C = -1, O = S.length, G = g.length; ++C < O; )
          g[G + C] = S[C];
        return g;
      }
      function _i(g, S, C, O) {
        var G = -1, et = g == null ? 0 : g.length;
        for (O && et && (C = g[++G]); ++G < et; )
          C = S(C, g[G], G, g);
        return C;
      }
      function nl(g, S, C, O) {
        var G = g == null ? 0 : g.length;
        for (O && G && (C = g[--G]); G--; )
          C = S(C, g[G], G, g);
        return C;
      }
      function vi(g, S) {
        for (var C = -1, O = g == null ? 0 : g.length; ++C < O; )
          if (S(g[C], C, g))
            return !0;
        return !1;
      }
      var rl = mi("length");
      function il(g) {
        return g.split("");
      }
      function sl(g) {
        return g.match(pc) || [];
      }
      function pa(g, S, C) {
        var O;
        return C(g, function(G, et, St) {
          if (S(G, et, St))
            return O = et, !1;
        }), O;
      }
      function jn(g, S, C, O) {
        for (var G = g.length, et = C + (O ? 1 : -1); O ? et-- : ++et < G; )
          if (S(g[et], et, g))
            return et;
        return -1;
      }
      function sn(g, S, C) {
        return S === S ? vl(g, S, C) : jn(g, ga, C);
      }
      function al(g, S, C, O) {
        for (var G = C - 1, et = g.length; ++G < et; )
          if (O(g[G], S))
            return G;
        return -1;
      }
      function ga(g) {
        return g !== g;
      }
      function da(g, S) {
        var C = g == null ? 0 : g.length;
        return C ? yi(g, S) / C : xe;
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
      function _a(g, S, C, O, G) {
        return G(g, function(et, St, st) {
          C = O ? (O = !1, et) : S(C, et, St, st);
        }), C;
      }
      function ul(g, S) {
        var C = g.length;
        for (g.sort(S); C--; )
          g[C] = g[C].value;
        return g;
      }
      function yi(g, S) {
        for (var C, O = -1, G = g.length; ++O < G; ) {
          var et = S(g[O]);
          et !== i && (C = C === i ? et : C + et);
        }
        return C;
      }
      function Ci(g, S) {
        for (var C = -1, O = Array(g); ++C < g; )
          O[C] = S(C);
        return O;
      }
      function ol(g, S) {
        return pt(S, function(C) {
          return [C, g[C]];
        });
      }
      function va(g) {
        return g && g.slice(0, Ca(g) + 1).replace(ui, "");
      }
      function Kt(g) {
        return function(S) {
          return g(S);
        };
      }
      function xi(g, S) {
        return pt(S, function(C) {
          return g[C];
        });
      }
      function En(g, S) {
        return g.has(S);
      }
      function ma(g, S) {
        for (var C = -1, O = g.length; ++C < O && sn(S, g[C], 0) > -1; )
          ;
        return C;
      }
      function wa(g, S) {
        for (var C = g.length; C-- && sn(S, g[C], 0) > -1; )
          ;
        return C;
      }
      function cl(g, S) {
        for (var C = g.length, O = 0; C--; )
          g[C] === S && ++O;
        return O;
      }
      var ll = wi(Jc), fl = wi(Zc);
      function hl(g) {
        return "\\" + Xc[g];
      }
      function pl(g, S) {
        return g == null ? i : g[S];
      }
      function an(g) {
        return Gc.test(g);
      }
      function gl(g) {
        return Hc.test(g);
      }
      function dl(g) {
        for (var S, C = []; !(S = g.next()).done; )
          C.push(S.value);
        return C;
      }
      function Si(g) {
        var S = -1, C = Array(g.size);
        return g.forEach(function(O, G) {
          C[++S] = [G, O];
        }), C;
      }
      function ya(g, S) {
        return function(C) {
          return g(S(C));
        };
      }
      function We(g, S) {
        for (var C = -1, O = g.length, G = 0, et = []; ++C < O; ) {
          var St = g[C];
          (St === S || St === F) && (g[C] = F, et[G++] = C);
        }
        return et;
      }
      function tr(g) {
        var S = -1, C = Array(g.size);
        return g.forEach(function(O) {
          C[++S] = O;
        }), C;
      }
      function _l(g) {
        var S = -1, C = Array(g.size);
        return g.forEach(function(O) {
          C[++S] = [O, O];
        }), C;
      }
      function vl(g, S, C) {
        for (var O = C - 1, G = g.length; ++O < G; )
          if (g[O] === S)
            return O;
        return -1;
      }
      function ml(g, S, C) {
        for (var O = C + 1; O--; )
          if (g[O] === S)
            return O;
        return O;
      }
      function un(g) {
        return an(g) ? yl(g) : rl(g);
      }
      function ce(g) {
        return an(g) ? Cl(g) : il(g);
      }
      function Ca(g) {
        for (var S = g.length; S-- && cc.test(g.charAt(S)); )
          ;
        return S;
      }
      var wl = wi(Yc);
      function yl(g) {
        for (var S = hi.lastIndex = 0; hi.test(g); )
          ++S;
        return S;
      }
      function Cl(g) {
        return g.match(hi) || [];
      }
      function xl(g) {
        return g.match(qc) || [];
      }
      var Sl = function g(S) {
        S = S == null ? Et : on.defaults(Et.Object(), S, on.pick(Et, zc));
        var C = S.Array, O = S.Date, G = S.Error, et = S.Function, St = S.Math, st = S.Object, Ai = S.RegExp, Al = S.String, ee = S.TypeError, er = C.prototype, bl = et.prototype, cn = st.prototype, nr = S["__core-js_shared__"], rr = bl.toString, rt = cn.hasOwnProperty, El = 0, xa = function() {
          var t = /[^.]+$/.exec(nr && nr.keys && nr.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        }(), ir = cn.toString, Il = rr.call(st), Fl = Et._, Tl = Ai(
          "^" + rr.call(rt).replace(ai, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), sr = sa ? S.Buffer : i, Be = S.Symbol, ar = S.Uint8Array, Sa = sr ? sr.allocUnsafe : i, ur = ya(st.getPrototypeOf, st), Aa = st.create, ba = cn.propertyIsEnumerable, or = er.splice, Ea = Be ? Be.isConcatSpreadable : i, In = Be ? Be.iterator : i, Je = Be ? Be.toStringTag : i, cr = function() {
          try {
            var t = Ve(st, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        }(), Ml = S.clearTimeout !== Et.clearTimeout && S.clearTimeout, Ll = O && O.now !== Et.Date.now && O.now, Pl = S.setTimeout !== Et.setTimeout && S.setTimeout, lr = St.ceil, fr = St.floor, bi = st.getOwnPropertySymbols, Rl = sr ? sr.isBuffer : i, Ia = S.isFinite, Ol = er.join, kl = ya(st.keys, st), At = St.max, Tt = St.min, Dl = O.now, Wl = S.parseInt, Fa = St.random, Bl = er.reverse, Ei = Ve(S, "DataView"), Fn = Ve(S, "Map"), Ii = Ve(S, "Promise"), ln = Ve(S, "Set"), Tn = Ve(S, "WeakMap"), Mn = Ve(st, "create"), hr = Tn && new Tn(), fn = {}, Ul = je(Ei), Nl = je(Fn), $l = je(Ii), ql = je(ln), Gl = je(Tn), pr = Be ? Be.prototype : i, Ln = pr ? pr.valueOf : i, Ta = pr ? pr.toString : i;
        function u(t) {
          if (_t(t) && !H(t) && !(t instanceof Q)) {
            if (t instanceof ne)
              return t;
            if (rt.call(t, "__wrapped__"))
              return Mu(t);
          }
          return new ne(t);
        }
        var hn = /* @__PURE__ */ function() {
          function t() {
          }
          return function(e) {
            if (!gt(e))
              return {};
            if (Aa)
              return Aa(e);
            t.prototype = e;
            var n = new t();
            return t.prototype = i, n;
          };
        }();
        function gr() {
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
          escape: rc,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: ic,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Bs,
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
        }, u.prototype = gr.prototype, u.prototype.constructor = u, ne.prototype = hn(gr.prototype), ne.prototype.constructor = ne;
        function Q(t) {
          this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = P, this.__views__ = [];
        }
        function Hl() {
          var t = new Q(this.__wrapped__);
          return t.__actions__ = Nt(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = Nt(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = Nt(this.__views__), t;
        }
        function zl() {
          if (this.__filtered__) {
            var t = new Q(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function Kl() {
          var t = this.__wrapped__.value(), e = this.__dir__, n = H(t), r = e < 0, a = n ? t.length : 0, c = sh(0, a, this.__views__), f = c.start, p = c.end, _ = p - f, A = r ? p : f - 1, b = this.__iteratees__, E = b.length, M = 0, D = Tt(_, this.__takeCount__);
          if (!n || !r && a == _ && D == _)
            return ja(t, this.__actions__);
          var U = [];
          t:
            for (; _-- && M < D; ) {
              A += e;
              for (var J = -1, N = t[A]; ++J < E; ) {
                var X = b[J], V = X.iteratee, Yt = X.type, Dt = V(N);
                if (Yt == Kn)
                  N = Dt;
                else if (!Dt) {
                  if (Yt == Sn)
                    continue t;
                  break t;
                }
              }
              U[M++] = N;
            }
          return U;
        }
        Q.prototype = hn(gr.prototype), Q.prototype.constructor = Q;
        function Ze(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function Jl() {
          this.__data__ = Mn ? Mn(null) : {}, this.size = 0;
        }
        function Zl(t) {
          var e = this.has(t) && delete this.__data__[t];
          return this.size -= e ? 1 : 0, e;
        }
        function Yl(t) {
          var e = this.__data__;
          if (Mn) {
            var n = e[t];
            return n === y ? i : n;
          }
          return rt.call(e, t) ? e[t] : i;
        }
        function Xl(t) {
          var e = this.__data__;
          return Mn ? e[t] !== i : rt.call(e, t);
        }
        function Ql(t, e) {
          var n = this.__data__;
          return this.size += this.has(t) ? 0 : 1, n[t] = Mn && e === i ? y : e, this;
        }
        Ze.prototype.clear = Jl, Ze.prototype.delete = Zl, Ze.prototype.get = Yl, Ze.prototype.has = Xl, Ze.prototype.set = Ql;
        function Se(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function Vl() {
          this.__data__ = [], this.size = 0;
        }
        function jl(t) {
          var e = this.__data__, n = dr(e, t);
          if (n < 0)
            return !1;
          var r = e.length - 1;
          return n == r ? e.pop() : or.call(e, n, 1), --this.size, !0;
        }
        function tf(t) {
          var e = this.__data__, n = dr(e, t);
          return n < 0 ? i : e[n][1];
        }
        function ef(t) {
          return dr(this.__data__, t) > -1;
        }
        function nf(t, e) {
          var n = this.__data__, r = dr(n, t);
          return r < 0 ? (++this.size, n.push([t, e])) : n[r][1] = e, this;
        }
        Se.prototype.clear = Vl, Se.prototype.delete = jl, Se.prototype.get = tf, Se.prototype.has = ef, Se.prototype.set = nf;
        function Ae(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function rf() {
          this.size = 0, this.__data__ = {
            hash: new Ze(),
            map: new (Fn || Se)(),
            string: new Ze()
          };
        }
        function sf(t) {
          var e = Ir(this, t).delete(t);
          return this.size -= e ? 1 : 0, e;
        }
        function af(t) {
          return Ir(this, t).get(t);
        }
        function uf(t) {
          return Ir(this, t).has(t);
        }
        function of(t, e) {
          var n = Ir(this, t), r = n.size;
          return n.set(t, e), this.size += n.size == r ? 0 : 1, this;
        }
        Ae.prototype.clear = rf, Ae.prototype.delete = sf, Ae.prototype.get = af, Ae.prototype.has = uf, Ae.prototype.set = of;
        function Ye(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.__data__ = new Ae(); ++e < n; )
            this.add(t[e]);
        }
        function cf(t) {
          return this.__data__.set(t, y), this;
        }
        function lf(t) {
          return this.__data__.has(t);
        }
        Ye.prototype.add = Ye.prototype.push = cf, Ye.prototype.has = lf;
        function le(t) {
          var e = this.__data__ = new Se(t);
          this.size = e.size;
        }
        function ff() {
          this.__data__ = new Se(), this.size = 0;
        }
        function hf(t) {
          var e = this.__data__, n = e.delete(t);
          return this.size = e.size, n;
        }
        function pf(t) {
          return this.__data__.get(t);
        }
        function gf(t) {
          return this.__data__.has(t);
        }
        function df(t, e) {
          var n = this.__data__;
          if (n instanceof Se) {
            var r = n.__data__;
            if (!Fn || r.length < h - 1)
              return r.push([t, e]), this.size = ++n.size, this;
            n = this.__data__ = new Ae(r);
          }
          return n.set(t, e), this.size = n.size, this;
        }
        le.prototype.clear = ff, le.prototype.delete = hf, le.prototype.get = pf, le.prototype.has = gf, le.prototype.set = df;
        function Ma(t, e) {
          var n = H(t), r = !n && tn(t), a = !n && !r && Ge(t), c = !n && !r && !a && _n(t), f = n || r || a || c, p = f ? Ci(t.length, Al) : [], _ = p.length;
          for (var A in t)
            (e || rt.call(t, A)) && !(f && // Safari 9 has enumerable `arguments.length` in strict mode.
            (A == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            a && (A == "offset" || A == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (A == "buffer" || A == "byteLength" || A == "byteOffset") || // Skip index properties.
            Fe(A, _))) && p.push(A);
          return p;
        }
        function La(t) {
          var e = t.length;
          return e ? t[Bi(0, e - 1)] : i;
        }
        function _f(t, e) {
          return Fr(Nt(t), Xe(e, 0, t.length));
        }
        function vf(t) {
          return Fr(Nt(t));
        }
        function Fi(t, e, n) {
          (n !== i && !fe(t[e], n) || n === i && !(e in t)) && be(t, e, n);
        }
        function Pn(t, e, n) {
          var r = t[e];
          (!(rt.call(t, e) && fe(r, n)) || n === i && !(e in t)) && be(t, e, n);
        }
        function dr(t, e) {
          for (var n = t.length; n--; )
            if (fe(t[n][0], e))
              return n;
          return -1;
        }
        function mf(t, e, n, r) {
          return Ue(t, function(a, c, f) {
            e(r, a, n(a), f);
          }), r;
        }
        function Pa(t, e) {
          return t && me(e, bt(e), t);
        }
        function wf(t, e) {
          return t && me(e, qt(e), t);
        }
        function be(t, e, n) {
          e == "__proto__" && cr ? cr(t, e, {
            configurable: !0,
            enumerable: !0,
            value: n,
            writable: !0
          }) : t[e] = n;
        }
        function Ti(t, e) {
          for (var n = -1, r = e.length, a = C(r), c = t == null; ++n < r; )
            a[n] = c ? i : cs(t, e[n]);
          return a;
        }
        function Xe(t, e, n) {
          return t === t && (n !== i && (t = t <= n ? t : n), e !== i && (t = t >= e ? t : e)), t;
        }
        function re(t, e, n, r, a, c) {
          var f, p = e & w, _ = e & R, A = e & k;
          if (n && (f = a ? n(t, r, a, c) : n(t)), f !== i)
            return f;
          if (!gt(t))
            return t;
          var b = H(t);
          if (b) {
            if (f = uh(t), !p)
              return Nt(t, f);
          } else {
            var E = Mt(t), M = E == Bt || E == de;
            if (Ge(t))
              return nu(t, p);
            if (E == Ct || E == j || M && !a) {
              if (f = _ || M ? {} : Cu(t), !p)
                return _ ? Xf(t, wf(f, t)) : Yf(t, Pa(f, t));
            } else {
              if (!ut[E])
                return a ? t : {};
              f = oh(t, E, p);
            }
          }
          c || (c = new le());
          var D = c.get(t);
          if (D)
            return D;
          c.set(t, f), Xu(t) ? t.forEach(function(N) {
            f.add(re(N, e, n, N, t, c));
          }) : Zu(t) && t.forEach(function(N, X) {
            f.set(X, re(N, e, n, X, t, c));
          });
          var U = A ? _ ? Yi : Zi : _ ? qt : bt, J = b ? i : U(t);
          return te(J || t, function(N, X) {
            J && (X = N, N = t[X]), Pn(f, X, re(N, e, n, X, t, c));
          }), f;
        }
        function yf(t) {
          var e = bt(t);
          return function(n) {
            return Ra(n, t, e);
          };
        }
        function Ra(t, e, n) {
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
        function Oa(t, e, n) {
          if (typeof t != "function")
            throw new ee(d);
          return Un(function() {
            t.apply(i, n);
          }, e);
        }
        function Rn(t, e, n, r) {
          var a = -1, c = Vn, f = !0, p = t.length, _ = [], A = e.length;
          if (!p)
            return _;
          n && (e = pt(e, Kt(n))), r ? (c = di, f = !1) : e.length >= h && (c = En, f = !1, e = new Ye(e));
          t:
            for (; ++a < p; ) {
              var b = t[a], E = n == null ? b : n(b);
              if (b = r || b !== 0 ? b : 0, f && E === E) {
                for (var M = A; M--; )
                  if (e[M] === E)
                    continue t;
                _.push(b);
              } else c(e, E, r) || _.push(b);
            }
          return _;
        }
        var Ue = uu(ve), ka = uu(Li, !0);
        function Cf(t, e) {
          var n = !0;
          return Ue(t, function(r, a, c) {
            return n = !!e(r, a, c), n;
          }), n;
        }
        function _r(t, e, n) {
          for (var r = -1, a = t.length; ++r < a; ) {
            var c = t[r], f = e(c);
            if (f != null && (p === i ? f === f && !Zt(f) : n(f, p)))
              var p = f, _ = c;
          }
          return _;
        }
        function xf(t, e, n, r) {
          var a = t.length;
          for (n = K(n), n < 0 && (n = -n > a ? 0 : a + n), r = r === i || r > a ? a : K(r), r < 0 && (r += a), r = n > r ? 0 : Vu(r); n < r; )
            t[n++] = e;
          return t;
        }
        function Da(t, e) {
          var n = [];
          return Ue(t, function(r, a, c) {
            e(r, a, c) && n.push(r);
          }), n;
        }
        function It(t, e, n, r, a) {
          var c = -1, f = t.length;
          for (n || (n = lh), a || (a = []); ++c < f; ) {
            var p = t[c];
            e > 0 && n(p) ? e > 1 ? It(p, e - 1, n, r, a) : De(a, p) : r || (a[a.length] = p);
          }
          return a;
        }
        var Mi = ou(), Wa = ou(!0);
        function ve(t, e) {
          return t && Mi(t, e, bt);
        }
        function Li(t, e) {
          return t && Wa(t, e, bt);
        }
        function vr(t, e) {
          return ke(e, function(n) {
            return Te(t[n]);
          });
        }
        function Qe(t, e) {
          e = $e(e, t);
          for (var n = 0, r = e.length; t != null && n < r; )
            t = t[we(e[n++])];
          return n && n == r ? t : i;
        }
        function Ba(t, e, n) {
          var r = e(t);
          return H(t) ? r : De(r, n(t));
        }
        function Ot(t) {
          return t == null ? t === i ? Xo : Oe : Je && Je in st(t) ? ih(t) : vh(t);
        }
        function Pi(t, e) {
          return t > e;
        }
        function Sf(t, e) {
          return t != null && rt.call(t, e);
        }
        function Af(t, e) {
          return t != null && e in st(t);
        }
        function bf(t, e, n) {
          return t >= Tt(e, n) && t < At(e, n);
        }
        function Ri(t, e, n) {
          for (var r = n ? di : Vn, a = t[0].length, c = t.length, f = c, p = C(c), _ = 1 / 0, A = []; f--; ) {
            var b = t[f];
            f && e && (b = pt(b, Kt(e))), _ = Tt(b.length, _), p[f] = !n && (e || a >= 120 && b.length >= 120) ? new Ye(f && b) : i;
          }
          b = t[0];
          var E = -1, M = p[0];
          t:
            for (; ++E < a && A.length < _; ) {
              var D = b[E], U = e ? e(D) : D;
              if (D = n || D !== 0 ? D : 0, !(M ? En(M, U) : r(A, U, n))) {
                for (f = c; --f; ) {
                  var J = p[f];
                  if (!(J ? En(J, U) : r(t[f], U, n)))
                    continue t;
                }
                M && M.push(U), A.push(D);
              }
            }
          return A;
        }
        function Ef(t, e, n, r) {
          return ve(t, function(a, c, f) {
            e(r, n(a), c, f);
          }), r;
        }
        function On(t, e, n) {
          e = $e(e, t), t = bu(t, e);
          var r = t == null ? t : t[we(se(e))];
          return r == null ? i : zt(r, t, n);
        }
        function Ua(t) {
          return _t(t) && Ot(t) == j;
        }
        function If(t) {
          return _t(t) && Ot(t) == bn;
        }
        function Ff(t) {
          return _t(t) && Ot(t) == yt;
        }
        function kn(t, e, n, r, a) {
          return t === e ? !0 : t == null || e == null || !_t(t) && !_t(e) ? t !== t && e !== e : Tf(t, e, n, r, kn, a);
        }
        function Tf(t, e, n, r, a, c) {
          var f = H(t), p = H(e), _ = f ? ft : Mt(t), A = p ? ft : Mt(e);
          _ = _ == j ? Ct : _, A = A == j ? Ct : A;
          var b = _ == Ct, E = A == Ct, M = _ == A;
          if (M && Ge(t)) {
            if (!Ge(e))
              return !1;
            f = !0, b = !1;
          }
          if (M && !b)
            return c || (c = new le()), f || _n(t) ? mu(t, e, n, r, a, c) : nh(t, e, _, n, r, a, c);
          if (!(n & L)) {
            var D = b && rt.call(t, "__wrapped__"), U = E && rt.call(e, "__wrapped__");
            if (D || U) {
              var J = D ? t.value() : t, N = U ? e.value() : e;
              return c || (c = new le()), a(J, N, n, r, c);
            }
          }
          return M ? (c || (c = new le()), rh(t, e, n, r, a, c)) : !1;
        }
        function Mf(t) {
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
            var _ = p[0], A = t[_], b = p[1];
            if (f && p[2]) {
              if (A === i && !(_ in t))
                return !1;
            } else {
              var E = new le();
              if (r)
                var M = r(A, b, _, t, e, E);
              if (!(M === i ? kn(b, A, L | T, r, E) : M))
                return !1;
            }
          }
          return !0;
        }
        function Na(t) {
          if (!gt(t) || hh(t))
            return !1;
          var e = Te(t) ? Tl : wc;
          return e.test(je(t));
        }
        function Lf(t) {
          return _t(t) && Ot(t) == Vt;
        }
        function Pf(t) {
          return _t(t) && Mt(t) == ht;
        }
        function Rf(t) {
          return _t(t) && Or(t.length) && !!ct[Ot(t)];
        }
        function $a(t) {
          return typeof t == "function" ? t : t == null ? Gt : typeof t == "object" ? H(t) ? Ha(t[0], t[1]) : Ga(t) : co(t);
        }
        function ki(t) {
          if (!Bn(t))
            return kl(t);
          var e = [];
          for (var n in st(t))
            rt.call(t, n) && n != "constructor" && e.push(n);
          return e;
        }
        function Of(t) {
          if (!gt(t))
            return _h(t);
          var e = Bn(t), n = [];
          for (var r in t)
            r == "constructor" && (e || !rt.call(t, r)) || n.push(r);
          return n;
        }
        function Di(t, e) {
          return t < e;
        }
        function qa(t, e) {
          var n = -1, r = $t(t) ? C(t.length) : [];
          return Ue(t, function(a, c, f) {
            r[++n] = e(a, c, f);
          }), r;
        }
        function Ga(t) {
          var e = Qi(t);
          return e.length == 1 && e[0][2] ? Su(e[0][0], e[0][1]) : function(n) {
            return n === t || Oi(n, t, e);
          };
        }
        function Ha(t, e) {
          return ji(t) && xu(e) ? Su(we(t), e) : function(n) {
            var r = cs(n, t);
            return r === i && r === e ? ls(n, t) : kn(e, r, L | T);
          };
        }
        function mr(t, e, n, r, a) {
          t !== e && Mi(e, function(c, f) {
            if (a || (a = new le()), gt(c))
              kf(t, e, f, n, mr, r, a);
            else {
              var p = r ? r(es(t, f), c, f + "", t, e, a) : i;
              p === i && (p = c), Fi(t, f, p);
            }
          }, qt);
        }
        function kf(t, e, n, r, a, c, f) {
          var p = es(t, n), _ = es(e, n), A = f.get(_);
          if (A) {
            Fi(t, n, A);
            return;
          }
          var b = c ? c(p, _, n + "", t, e, f) : i, E = b === i;
          if (E) {
            var M = H(_), D = !M && Ge(_), U = !M && !D && _n(_);
            b = _, M || D || U ? H(p) ? b = p : mt(p) ? b = Nt(p) : D ? (E = !1, b = nu(_, !0)) : U ? (E = !1, b = ru(_, !0)) : b = [] : Nn(_) || tn(_) ? (b = p, tn(p) ? b = ju(p) : (!gt(p) || Te(p)) && (b = Cu(_))) : E = !1;
          }
          E && (f.set(_, b), a(b, _, r, c, f), f.delete(_)), Fi(t, n, b);
        }
        function za(t, e) {
          var n = t.length;
          if (n)
            return e += e < 0 ? n : 0, Fe(e, n) ? t[e] : i;
        }
        function Ka(t, e, n) {
          e.length ? e = pt(e, function(c) {
            return H(c) ? function(f) {
              return Qe(f, c.length === 1 ? c[0] : c);
            } : c;
          }) : e = [Gt];
          var r = -1;
          e = pt(e, Kt(B()));
          var a = qa(t, function(c, f, p) {
            var _ = pt(e, function(A) {
              return A(c);
            });
            return { criteria: _, index: ++r, value: c };
          });
          return ul(a, function(c, f) {
            return Zf(c, f, n);
          });
        }
        function Df(t, e) {
          return Ja(t, e, function(n, r) {
            return ls(t, r);
          });
        }
        function Ja(t, e, n) {
          for (var r = -1, a = e.length, c = {}; ++r < a; ) {
            var f = e[r], p = Qe(t, f);
            n(p, f) && Dn(c, $e(f, t), p);
          }
          return c;
        }
        function Wf(t) {
          return function(e) {
            return Qe(e, t);
          };
        }
        function Wi(t, e, n, r) {
          var a = r ? al : sn, c = -1, f = e.length, p = t;
          for (t === e && (e = Nt(e)), n && (p = pt(t, Kt(n))); ++c < f; )
            for (var _ = 0, A = e[c], b = n ? n(A) : A; (_ = a(p, b, _, r)) > -1; )
              p !== t && or.call(p, _, 1), or.call(t, _, 1);
          return t;
        }
        function Za(t, e) {
          for (var n = t ? e.length : 0, r = n - 1; n--; ) {
            var a = e[n];
            if (n == r || a !== c) {
              var c = a;
              Fe(a) ? or.call(t, a, 1) : $i(t, a);
            }
          }
          return t;
        }
        function Bi(t, e) {
          return t + fr(Fa() * (e - t + 1));
        }
        function Bf(t, e, n, r) {
          for (var a = -1, c = At(lr((e - t) / (n || 1)), 0), f = C(c); c--; )
            f[r ? c : ++a] = t, t += n;
          return f;
        }
        function Ui(t, e) {
          var n = "";
          if (!t || e < 1 || e > Re)
            return n;
          do
            e % 2 && (n += t), e = fr(e / 2), e && (t += t);
          while (e);
          return n;
        }
        function Z(t, e) {
          return ns(Au(t, e, Gt), t + "");
        }
        function Uf(t) {
          return La(vn(t));
        }
        function Nf(t, e) {
          var n = vn(t);
          return Fr(n, Xe(e, 0, n.length));
        }
        function Dn(t, e, n, r) {
          if (!gt(t))
            return t;
          e = $e(e, t);
          for (var a = -1, c = e.length, f = c - 1, p = t; p != null && ++a < c; ) {
            var _ = we(e[a]), A = n;
            if (_ === "__proto__" || _ === "constructor" || _ === "prototype")
              return t;
            if (a != f) {
              var b = p[_];
              A = r ? r(b, _, p) : i, A === i && (A = gt(b) ? b : Fe(e[a + 1]) ? [] : {});
            }
            Pn(p, _, A), p = p[_];
          }
          return t;
        }
        var Ya = hr ? function(t, e) {
          return hr.set(t, e), t;
        } : Gt, $f = cr ? function(t, e) {
          return cr(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: hs(e),
            writable: !0
          });
        } : Gt;
        function qf(t) {
          return Fr(vn(t));
        }
        function ie(t, e, n) {
          var r = -1, a = t.length;
          e < 0 && (e = -e > a ? 0 : a + e), n = n > a ? a : n, n < 0 && (n += a), a = e > n ? 0 : n - e >>> 0, e >>>= 0;
          for (var c = C(a); ++r < a; )
            c[r] = t[r + e];
          return c;
        }
        function Gf(t, e) {
          var n;
          return Ue(t, function(r, a, c) {
            return n = e(r, a, c), !n;
          }), !!n;
        }
        function wr(t, e, n) {
          var r = 0, a = t == null ? r : t.length;
          if (typeof e == "number" && e === e && a <= q) {
            for (; r < a; ) {
              var c = r + a >>> 1, f = t[c];
              f !== null && !Zt(f) && (n ? f <= e : f < e) ? r = c + 1 : a = c;
            }
            return a;
          }
          return Ni(t, e, Gt, n);
        }
        function Ni(t, e, n, r) {
          var a = 0, c = t == null ? 0 : t.length;
          if (c === 0)
            return 0;
          e = n(e);
          for (var f = e !== e, p = e === null, _ = Zt(e), A = e === i; a < c; ) {
            var b = fr((a + c) / 2), E = n(t[b]), M = E !== i, D = E === null, U = E === E, J = Zt(E);
            if (f)
              var N = r || U;
            else A ? N = U && (r || M) : p ? N = U && M && (r || !D) : _ ? N = U && M && !D && (r || !J) : D || J ? N = !1 : N = r ? E <= e : E < e;
            N ? a = b + 1 : c = b;
          }
          return Tt(c, $);
        }
        function Xa(t, e) {
          for (var n = -1, r = t.length, a = 0, c = []; ++n < r; ) {
            var f = t[n], p = e ? e(f) : f;
            if (!n || !fe(p, _)) {
              var _ = p;
              c[a++] = f === 0 ? 0 : f;
            }
          }
          return c;
        }
        function Qa(t) {
          return typeof t == "number" ? t : Zt(t) ? xe : +t;
        }
        function Jt(t) {
          if (typeof t == "string")
            return t;
          if (H(t))
            return pt(t, Jt) + "";
          if (Zt(t))
            return Ta ? Ta.call(t) : "";
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function Ne(t, e, n) {
          var r = -1, a = Vn, c = t.length, f = !0, p = [], _ = p;
          if (n)
            f = !1, a = di;
          else if (c >= h) {
            var A = e ? null : th(t);
            if (A)
              return tr(A);
            f = !1, a = En, _ = new Ye();
          } else
            _ = e ? [] : p;
          t:
            for (; ++r < c; ) {
              var b = t[r], E = e ? e(b) : b;
              if (b = n || b !== 0 ? b : 0, f && E === E) {
                for (var M = _.length; M--; )
                  if (_[M] === E)
                    continue t;
                e && _.push(E), p.push(b);
              } else a(_, E, n) || (_ !== p && _.push(E), p.push(b));
            }
          return p;
        }
        function $i(t, e) {
          return e = $e(e, t), t = bu(t, e), t == null || delete t[we(se(e))];
        }
        function Va(t, e, n, r) {
          return Dn(t, e, n(Qe(t, e)), r);
        }
        function yr(t, e, n, r) {
          for (var a = t.length, c = r ? a : -1; (r ? c-- : ++c < a) && e(t[c], c, t); )
            ;
          return n ? ie(t, r ? 0 : c, r ? c + 1 : a) : ie(t, r ? c + 1 : 0, r ? a : c);
        }
        function ja(t, e) {
          var n = t;
          return n instanceof Q && (n = n.value()), _i(e, function(r, a) {
            return a.func.apply(a.thisArg, De([r], a.args));
          }, n);
        }
        function qi(t, e, n) {
          var r = t.length;
          if (r < 2)
            return r ? Ne(t[0]) : [];
          for (var a = -1, c = C(r); ++a < r; )
            for (var f = t[a], p = -1; ++p < r; )
              p != a && (c[a] = Rn(c[a] || f, t[p], e, n));
          return Ne(It(c, 1), e, n);
        }
        function tu(t, e, n) {
          for (var r = -1, a = t.length, c = e.length, f = {}; ++r < a; ) {
            var p = r < c ? e[r] : i;
            n(f, t[r], p);
          }
          return f;
        }
        function Gi(t) {
          return mt(t) ? t : [];
        }
        function Hi(t) {
          return typeof t == "function" ? t : Gt;
        }
        function $e(t, e) {
          return H(t) ? t : ji(t, e) ? [t] : Tu(nt(t));
        }
        var Hf = Z;
        function qe(t, e, n) {
          var r = t.length;
          return n = n === i ? r : n, !e && n >= r ? t : ie(t, e, n);
        }
        var eu = Ml || function(t) {
          return Et.clearTimeout(t);
        };
        function nu(t, e) {
          if (e)
            return t.slice();
          var n = t.length, r = Sa ? Sa(n) : new t.constructor(n);
          return t.copy(r), r;
        }
        function zi(t) {
          var e = new t.constructor(t.byteLength);
          return new ar(e).set(new ar(t)), e;
        }
        function zf(t, e) {
          var n = e ? zi(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.byteLength);
        }
        function Kf(t) {
          var e = new t.constructor(t.source, Us.exec(t));
          return e.lastIndex = t.lastIndex, e;
        }
        function Jf(t) {
          return Ln ? st(Ln.call(t)) : {};
        }
        function ru(t, e) {
          var n = e ? zi(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.length);
        }
        function iu(t, e) {
          if (t !== e) {
            var n = t !== i, r = t === null, a = t === t, c = Zt(t), f = e !== i, p = e === null, _ = e === e, A = Zt(e);
            if (!p && !A && !c && t > e || c && f && _ && !p && !A || r && f && _ || !n && _ || !a)
              return 1;
            if (!r && !c && !A && t < e || A && n && a && !r && !c || p && n && a || !f && a || !_)
              return -1;
          }
          return 0;
        }
        function Zf(t, e, n) {
          for (var r = -1, a = t.criteria, c = e.criteria, f = a.length, p = n.length; ++r < f; ) {
            var _ = iu(a[r], c[r]);
            if (_) {
              if (r >= p)
                return _;
              var A = n[r];
              return _ * (A == "desc" ? -1 : 1);
            }
          }
          return t.index - e.index;
        }
        function su(t, e, n, r) {
          for (var a = -1, c = t.length, f = n.length, p = -1, _ = e.length, A = At(c - f, 0), b = C(_ + A), E = !r; ++p < _; )
            b[p] = e[p];
          for (; ++a < f; )
            (E || a < c) && (b[n[a]] = t[a]);
          for (; A--; )
            b[p++] = t[a++];
          return b;
        }
        function au(t, e, n, r) {
          for (var a = -1, c = t.length, f = -1, p = n.length, _ = -1, A = e.length, b = At(c - p, 0), E = C(b + A), M = !r; ++a < b; )
            E[a] = t[a];
          for (var D = a; ++_ < A; )
            E[D + _] = e[_];
          for (; ++f < p; )
            (M || a < c) && (E[D + n[f]] = t[a++]);
          return E;
        }
        function Nt(t, e) {
          var n = -1, r = t.length;
          for (e || (e = C(r)); ++n < r; )
            e[n] = t[n];
          return e;
        }
        function me(t, e, n, r) {
          var a = !n;
          n || (n = {});
          for (var c = -1, f = e.length; ++c < f; ) {
            var p = e[c], _ = r ? r(n[p], t[p], p, n, t) : i;
            _ === i && (_ = t[p]), a ? be(n, p, _) : Pn(n, p, _);
          }
          return n;
        }
        function Yf(t, e) {
          return me(t, Vi(t), e);
        }
        function Xf(t, e) {
          return me(t, wu(t), e);
        }
        function Cr(t, e) {
          return function(n, r) {
            var a = H(n) ? tl : mf, c = e ? e() : {};
            return a(n, t, B(r, 2), c);
          };
        }
        function pn(t) {
          return Z(function(e, n) {
            var r = -1, a = n.length, c = a > 1 ? n[a - 1] : i, f = a > 2 ? n[2] : i;
            for (c = t.length > 3 && typeof c == "function" ? (a--, c) : i, f && kt(n[0], n[1], f) && (c = a < 3 ? i : c, a = 1), e = st(e); ++r < a; ) {
              var p = n[r];
              p && t(e, p, r, c);
            }
            return e;
          });
        }
        function uu(t, e) {
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
        function ou(t) {
          return function(e, n, r) {
            for (var a = -1, c = st(e), f = r(e), p = f.length; p--; ) {
              var _ = f[t ? p : ++a];
              if (n(c[_], _, c) === !1)
                break;
            }
            return e;
          };
        }
        function Qf(t, e, n) {
          var r = e & W, a = Wn(t);
          function c() {
            var f = this && this !== Et && this instanceof c ? a : t;
            return f.apply(r ? n : this, arguments);
          }
          return c;
        }
        function cu(t) {
          return function(e) {
            e = nt(e);
            var n = an(e) ? ce(e) : i, r = n ? n[0] : e.charAt(0), a = n ? qe(n, 1).join("") : e.slice(1);
            return r[t]() + a;
          };
        }
        function gn(t) {
          return function(e) {
            return _i(uo(ao(e).replace(Nc, "")), t, "");
          };
        }
        function Wn(t) {
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
            var n = hn(t.prototype), r = t.apply(n, e);
            return gt(r) ? r : n;
          };
        }
        function Vf(t, e, n) {
          var r = Wn(t);
          function a() {
            for (var c = arguments.length, f = C(c), p = c, _ = dn(a); p--; )
              f[p] = arguments[p];
            var A = c < 3 && f[0] !== _ && f[c - 1] !== _ ? [] : We(f, _);
            if (c -= A.length, c < n)
              return gu(
                t,
                e,
                xr,
                a.placeholder,
                i,
                f,
                A,
                i,
                i,
                n - c
              );
            var b = this && this !== Et && this instanceof a ? r : t;
            return zt(b, this, f);
          }
          return a;
        }
        function lu(t) {
          return function(e, n, r) {
            var a = st(e);
            if (!$t(e)) {
              var c = B(n, 3);
              e = bt(e), n = function(p) {
                return c(a[p], p, a);
              };
            }
            var f = t(e, n, r);
            return f > -1 ? a[c ? e[f] : f] : i;
          };
        }
        function fu(t) {
          return Ie(function(e) {
            var n = e.length, r = n, a = ne.prototype.thru;
            for (t && e.reverse(); r--; ) {
              var c = e[r];
              if (typeof c != "function")
                throw new ee(d);
              if (a && !f && Er(c) == "wrapper")
                var f = new ne([], !0);
            }
            for (r = f ? r : n; ++r < n; ) {
              c = e[r];
              var p = Er(c), _ = p == "wrapper" ? Xi(c) : i;
              _ && ts(_[0]) && _[1] == (Ft | it | xt | ge) && !_[4].length && _[9] == 1 ? f = f[Er(_[0])].apply(f, _[3]) : f = c.length == 1 && ts(c) ? f[p]() : f.thru(c);
            }
            return function() {
              var A = arguments, b = A[0];
              if (f && A.length == 1 && H(b))
                return f.plant(b).value();
              for (var E = 0, M = n ? e[E].apply(this, A) : b; ++E < n; )
                M = e[E].call(this, M);
              return M;
            };
          });
        }
        function xr(t, e, n, r, a, c, f, p, _, A) {
          var b = e & Ft, E = e & W, M = e & z, D = e & (it | vt), U = e & Ce, J = M ? i : Wn(t);
          function N() {
            for (var X = arguments.length, V = C(X), Yt = X; Yt--; )
              V[Yt] = arguments[Yt];
            if (D)
              var Dt = dn(N), Xt = cl(V, Dt);
            if (r && (V = su(V, r, a, D)), c && (V = au(V, c, f, D)), X -= Xt, D && X < A) {
              var wt = We(V, Dt);
              return gu(
                t,
                e,
                xr,
                N.placeholder,
                n,
                V,
                wt,
                p,
                _,
                A - X
              );
            }
            var he = E ? n : this, Le = M ? he[t] : t;
            return X = V.length, p ? V = mh(V, p) : U && X > 1 && V.reverse(), b && _ < X && (V.length = _), this && this !== Et && this instanceof N && (Le = J || Wn(Le)), Le.apply(he, V);
          }
          return N;
        }
        function hu(t, e) {
          return function(n, r) {
            return Ef(n, t, e(r), {});
          };
        }
        function Sr(t, e) {
          return function(n, r) {
            var a;
            if (n === i && r === i)
              return e;
            if (n !== i && (a = n), r !== i) {
              if (a === i)
                return r;
              typeof n == "string" || typeof r == "string" ? (n = Jt(n), r = Jt(r)) : (n = Qa(n), r = Qa(r)), a = t(n, r);
            }
            return a;
          };
        }
        function Ki(t) {
          return Ie(function(e) {
            return e = pt(e, Kt(B())), Z(function(n) {
              var r = this;
              return t(e, function(a) {
                return zt(a, r, n);
              });
            });
          });
        }
        function Ar(t, e) {
          e = e === i ? " " : Jt(e);
          var n = e.length;
          if (n < 2)
            return n ? Ui(e, t) : e;
          var r = Ui(e, lr(t / un(e)));
          return an(e) ? qe(ce(r), 0, t).join("") : r.slice(0, t);
        }
        function jf(t, e, n, r) {
          var a = e & W, c = Wn(t);
          function f() {
            for (var p = -1, _ = arguments.length, A = -1, b = r.length, E = C(b + _), M = this && this !== Et && this instanceof f ? c : t; ++A < b; )
              E[A] = r[A];
            for (; _--; )
              E[A++] = arguments[++p];
            return zt(M, a ? n : this, E);
          }
          return f;
        }
        function pu(t) {
          return function(e, n, r) {
            return r && typeof r != "number" && kt(e, n, r) && (n = r = i), e = Me(e), n === i ? (n = e, e = 0) : n = Me(n), r = r === i ? e < n ? 1 : -1 : Me(r), Bf(e, n, r, t);
          };
        }
        function br(t) {
          return function(e, n) {
            return typeof e == "string" && typeof n == "string" || (e = ae(e), n = ae(n)), t(e, n);
          };
        }
        function gu(t, e, n, r, a, c, f, p, _, A) {
          var b = e & it, E = b ? f : i, M = b ? i : f, D = b ? c : i, U = b ? i : c;
          e |= b ? xt : Pe, e &= ~(b ? Pe : xt), e & tt || (e &= -4);
          var J = [
            t,
            e,
            a,
            D,
            E,
            U,
            M,
            p,
            _,
            A
          ], N = n.apply(i, J);
          return ts(t) && Eu(N, J), N.placeholder = r, Iu(N, t, e);
        }
        function Ji(t) {
          var e = St[t];
          return function(n, r) {
            if (n = ae(n), r = r == null ? 0 : Tt(K(r), 292), r && Ia(n)) {
              var a = (nt(n) + "e").split("e"), c = e(a[0] + "e" + (+a[1] + r));
              return a = (nt(c) + "e").split("e"), +(a[0] + "e" + (+a[1] - r));
            }
            return e(n);
          };
        }
        var th = ln && 1 / tr(new ln([, -0]))[1] == en ? function(t) {
          return new ln(t);
        } : ds;
        function du(t) {
          return function(e) {
            var n = Mt(e);
            return n == dt ? Si(e) : n == ht ? _l(e) : ol(e, t(e));
          };
        }
        function Ee(t, e, n, r, a, c, f, p) {
          var _ = e & z;
          if (!_ && typeof t != "function")
            throw new ee(d);
          var A = r ? r.length : 0;
          if (A || (e &= -97, r = a = i), f = f === i ? f : At(K(f), 0), p = p === i ? p : K(p), A -= a ? a.length : 0, e & Pe) {
            var b = r, E = a;
            r = a = i;
          }
          var M = _ ? i : Xi(t), D = [
            t,
            e,
            n,
            r,
            a,
            b,
            E,
            c,
            f,
            p
          ];
          if (M && dh(D, M), t = D[0], e = D[1], n = D[2], r = D[3], a = D[4], p = D[9] = D[9] === i ? _ ? 0 : t.length : At(D[9] - A, 0), !p && e & (it | vt) && (e &= -25), !e || e == W)
            var U = Qf(t, e, n);
          else e == it || e == vt ? U = Vf(t, e, p) : (e == xt || e == (W | xt)) && !a.length ? U = jf(t, e, n, r) : U = xr.apply(i, D);
          var J = M ? Ya : Eu;
          return Iu(J(U, D), t, e);
        }
        function _u(t, e, n, r) {
          return t === i || fe(t, cn[n]) && !rt.call(r, n) ? e : t;
        }
        function vu(t, e, n, r, a, c) {
          return gt(t) && gt(e) && (c.set(e, t), mr(t, e, i, vu, c), c.delete(e)), t;
        }
        function eh(t) {
          return Nn(t) ? i : t;
        }
        function mu(t, e, n, r, a, c) {
          var f = n & L, p = t.length, _ = e.length;
          if (p != _ && !(f && _ > p))
            return !1;
          var A = c.get(t), b = c.get(e);
          if (A && b)
            return A == e && b == t;
          var E = -1, M = !0, D = n & T ? new Ye() : i;
          for (c.set(t, e), c.set(e, t); ++E < p; ) {
            var U = t[E], J = e[E];
            if (r)
              var N = f ? r(J, U, E, e, t, c) : r(U, J, E, t, e, c);
            if (N !== i) {
              if (N)
                continue;
              M = !1;
              break;
            }
            if (D) {
              if (!vi(e, function(X, V) {
                if (!En(D, V) && (U === X || a(U, X, n, r, c)))
                  return D.push(V);
              })) {
                M = !1;
                break;
              }
            } else if (!(U === J || a(U, J, n, r, c))) {
              M = !1;
              break;
            }
          }
          return c.delete(t), c.delete(e), M;
        }
        function nh(t, e, n, r, a, c, f) {
          switch (n) {
            case nn:
              if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset)
                return !1;
              t = t.buffer, e = e.buffer;
            case bn:
              return !(t.byteLength != e.byteLength || !c(new ar(t), new ar(e)));
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
              if (p || (p = tr), t.size != e.size && !_)
                return !1;
              var A = f.get(t);
              if (A)
                return A == e;
              r |= T, f.set(t, e);
              var b = mu(p(t), p(e), r, a, c, f);
              return f.delete(t), b;
            case Zn:
              if (Ln)
                return Ln.call(t) == Ln.call(e);
          }
          return !1;
        }
        function rh(t, e, n, r, a, c) {
          var f = n & L, p = Zi(t), _ = p.length, A = Zi(e), b = A.length;
          if (_ != b && !f)
            return !1;
          for (var E = _; E--; ) {
            var M = p[E];
            if (!(f ? M in e : rt.call(e, M)))
              return !1;
          }
          var D = c.get(t), U = c.get(e);
          if (D && U)
            return D == e && U == t;
          var J = !0;
          c.set(t, e), c.set(e, t);
          for (var N = f; ++E < _; ) {
            M = p[E];
            var X = t[M], V = e[M];
            if (r)
              var Yt = f ? r(V, X, M, e, t, c) : r(X, V, M, t, e, c);
            if (!(Yt === i ? X === V || a(X, V, n, r, c) : Yt)) {
              J = !1;
              break;
            }
            N || (N = M == "constructor");
          }
          if (J && !N) {
            var Dt = t.constructor, Xt = e.constructor;
            Dt != Xt && "constructor" in t && "constructor" in e && !(typeof Dt == "function" && Dt instanceof Dt && typeof Xt == "function" && Xt instanceof Xt) && (J = !1);
          }
          return c.delete(t), c.delete(e), J;
        }
        function Ie(t) {
          return ns(Au(t, i, Ru), t + "");
        }
        function Zi(t) {
          return Ba(t, bt, Vi);
        }
        function Yi(t) {
          return Ba(t, qt, wu);
        }
        var Xi = hr ? function(t) {
          return hr.get(t);
        } : ds;
        function Er(t) {
          for (var e = t.name + "", n = fn[e], r = rt.call(fn, e) ? n.length : 0; r--; ) {
            var a = n[r], c = a.func;
            if (c == null || c == t)
              return a.name;
          }
          return e;
        }
        function dn(t) {
          var e = rt.call(u, "placeholder") ? u : t;
          return e.placeholder;
        }
        function B() {
          var t = u.iteratee || ps;
          return t = t === ps ? $a : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function Ir(t, e) {
          var n = t.__data__;
          return fh(e) ? n[typeof e == "string" ? "string" : "hash"] : n.map;
        }
        function Qi(t) {
          for (var e = bt(t), n = e.length; n--; ) {
            var r = e[n], a = t[r];
            e[n] = [r, a, xu(a)];
          }
          return e;
        }
        function Ve(t, e) {
          var n = pl(t, e);
          return Na(n) ? n : i;
        }
        function ih(t) {
          var e = rt.call(t, Je), n = t[Je];
          try {
            t[Je] = i;
            var r = !0;
          } catch {
          }
          var a = ir.call(t);
          return r && (e ? t[Je] = n : delete t[Je]), a;
        }
        var Vi = bi ? function(t) {
          return t == null ? [] : (t = st(t), ke(bi(t), function(e) {
            return ba.call(t, e);
          }));
        } : _s, wu = bi ? function(t) {
          for (var e = []; t; )
            De(e, Vi(t)), t = ur(t);
          return e;
        } : _s, Mt = Ot;
        (Ei && Mt(new Ei(new ArrayBuffer(1))) != nn || Fn && Mt(new Fn()) != dt || Ii && Mt(Ii.resolve()) != Ut || ln && Mt(new ln()) != ht || Tn && Mt(new Tn()) != An) && (Mt = function(t) {
          var e = Ot(t), n = e == Ct ? t.constructor : i, r = n ? je(n) : "";
          if (r)
            switch (r) {
              case Ul:
                return nn;
              case Nl:
                return dt;
              case $l:
                return Ut;
              case ql:
                return ht;
              case Gl:
                return An;
            }
          return e;
        });
        function sh(t, e, n) {
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
                t = At(t, e - f);
                break;
            }
          }
          return { start: t, end: e };
        }
        function ah(t) {
          var e = t.match(fc);
          return e ? e[1].split(hc) : [];
        }
        function yu(t, e, n) {
          e = $e(e, t);
          for (var r = -1, a = e.length, c = !1; ++r < a; ) {
            var f = we(e[r]);
            if (!(c = t != null && n(t, f)))
              break;
            t = t[f];
          }
          return c || ++r != a ? c : (a = t == null ? 0 : t.length, !!a && Or(a) && Fe(f, a) && (H(t) || tn(t)));
        }
        function uh(t) {
          var e = t.length, n = new t.constructor(e);
          return e && typeof t[0] == "string" && rt.call(t, "index") && (n.index = t.index, n.input = t.input), n;
        }
        function Cu(t) {
          return typeof t.constructor == "function" && !Bn(t) ? hn(ur(t)) : {};
        }
        function oh(t, e, n) {
          var r = t.constructor;
          switch (e) {
            case bn:
              return zi(t);
            case ot:
            case yt:
              return new r(+t);
            case nn:
              return zf(t, n);
            case Qr:
            case Vr:
            case jr:
            case ti:
            case ei:
            case ni:
            case ri:
            case ii:
            case si:
              return ru(t, n);
            case dt:
              return new r();
            case Rt:
            case _e:
              return new r(t);
            case Vt:
              return Kf(t);
            case ht:
              return new r();
            case Zn:
              return Jf(t);
          }
        }
        function ch(t, e) {
          var n = e.length;
          if (!n)
            return t;
          var r = n - 1;
          return e[r] = (n > 1 ? "& " : "") + e[r], e = e.join(n > 2 ? ", " : " "), t.replace(lc, `{
/* [wrapped with ` + e + `] */
`);
        }
        function lh(t) {
          return H(t) || tn(t) || !!(Ea && t && t[Ea]);
        }
        function Fe(t, e) {
          var n = typeof t;
          return e = e ?? Re, !!e && (n == "number" || n != "symbol" && Cc.test(t)) && t > -1 && t % 1 == 0 && t < e;
        }
        function kt(t, e, n) {
          if (!gt(n))
            return !1;
          var r = typeof e;
          return (r == "number" ? $t(n) && Fe(e, n.length) : r == "string" && e in n) ? fe(n[e], t) : !1;
        }
        function ji(t, e) {
          if (H(t))
            return !1;
          var n = typeof t;
          return n == "number" || n == "symbol" || n == "boolean" || t == null || Zt(t) ? !0 : ac.test(t) || !sc.test(t) || e != null && t in st(e);
        }
        function fh(t) {
          var e = typeof t;
          return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
        }
        function ts(t) {
          var e = Er(t), n = u[e];
          if (typeof n != "function" || !(e in Q.prototype))
            return !1;
          if (t === n)
            return !0;
          var r = Xi(n);
          return !!r && t === r[0];
        }
        function hh(t) {
          return !!xa && xa in t;
        }
        var ph = nr ? Te : vs;
        function Bn(t) {
          var e = t && t.constructor, n = typeof e == "function" && e.prototype || cn;
          return t === n;
        }
        function xu(t) {
          return t === t && !gt(t);
        }
        function Su(t, e) {
          return function(n) {
            return n == null ? !1 : n[t] === e && (e !== i || t in st(n));
          };
        }
        function gh(t) {
          var e = Pr(t, function(r) {
            return n.size === x && n.clear(), r;
          }), n = e.cache;
          return e;
        }
        function dh(t, e) {
          var n = t[1], r = e[1], a = n | r, c = a < (W | z | Ft), f = r == Ft && n == it || r == Ft && n == ge && t[7].length <= e[8] || r == (Ft | ge) && e[7].length <= e[8] && n == it;
          if (!(c || f))
            return t;
          r & W && (t[2] = e[2], a |= n & W ? 0 : tt);
          var p = e[3];
          if (p) {
            var _ = t[3];
            t[3] = _ ? su(_, p, e[4]) : p, t[4] = _ ? We(t[3], F) : e[4];
          }
          return p = e[5], p && (_ = t[5], t[5] = _ ? au(_, p, e[6]) : p, t[6] = _ ? We(t[5], F) : e[6]), p = e[7], p && (t[7] = p), r & Ft && (t[8] = t[8] == null ? e[8] : Tt(t[8], e[8])), t[9] == null && (t[9] = e[9]), t[0] = e[0], t[1] = a, t;
        }
        function _h(t) {
          var e = [];
          if (t != null)
            for (var n in st(t))
              e.push(n);
          return e;
        }
        function vh(t) {
          return ir.call(t);
        }
        function Au(t, e, n) {
          return e = At(e === i ? t.length - 1 : e, 0), function() {
            for (var r = arguments, a = -1, c = At(r.length - e, 0), f = C(c); ++a < c; )
              f[a] = r[e + a];
            a = -1;
            for (var p = C(e + 1); ++a < e; )
              p[a] = r[a];
            return p[e] = n(f), zt(t, this, p);
          };
        }
        function bu(t, e) {
          return e.length < 2 ? t : Qe(t, ie(e, 0, -1));
        }
        function mh(t, e) {
          for (var n = t.length, r = Tt(e.length, n), a = Nt(t); r--; ) {
            var c = e[r];
            t[r] = Fe(c, n) ? a[c] : i;
          }
          return t;
        }
        function es(t, e) {
          if (!(e === "constructor" && typeof t[e] == "function") && e != "__proto__")
            return t[e];
        }
        var Eu = Fu(Ya), Un = Pl || function(t, e) {
          return Et.setTimeout(t, e);
        }, ns = Fu($f);
        function Iu(t, e, n) {
          var r = e + "";
          return ns(t, ch(r, wh(ah(r), n)));
        }
        function Fu(t) {
          var e = 0, n = 0;
          return function() {
            var r = Dl(), a = Yr - (r - n);
            if (n = r, a > 0) {
              if (++e >= zn)
                return arguments[0];
            } else
              e = 0;
            return t.apply(i, arguments);
          };
        }
        function Fr(t, e) {
          var n = -1, r = t.length, a = r - 1;
          for (e = e === i ? r : e; ++n < e; ) {
            var c = Bi(n, a), f = t[c];
            t[c] = t[n], t[n] = f;
          }
          return t.length = e, t;
        }
        var Tu = gh(function(t) {
          var e = [];
          return t.charCodeAt(0) === 46 && e.push(""), t.replace(uc, function(n, r, a, c) {
            e.push(a ? c.replace(dc, "$1") : r || n);
          }), e;
        });
        function we(t) {
          if (typeof t == "string" || Zt(t))
            return t;
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function je(t) {
          if (t != null) {
            try {
              return rr.call(t);
            } catch {
            }
            try {
              return t + "";
            } catch {
            }
          }
          return "";
        }
        function wh(t, e) {
          return te(lt, function(n) {
            var r = "_." + n[0];
            e & n[1] && !Vn(t, r) && t.push(r);
          }), t.sort();
        }
        function Mu(t) {
          if (t instanceof Q)
            return t.clone();
          var e = new ne(t.__wrapped__, t.__chain__);
          return e.__actions__ = Nt(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
        }
        function yh(t, e, n) {
          (n ? kt(t, e, n) : e === i) ? e = 1 : e = At(K(e), 0);
          var r = t == null ? 0 : t.length;
          if (!r || e < 1)
            return [];
          for (var a = 0, c = 0, f = C(lr(r / e)); a < r; )
            f[c++] = ie(t, a, a += e);
          return f;
        }
        function Ch(t) {
          for (var e = -1, n = t == null ? 0 : t.length, r = 0, a = []; ++e < n; ) {
            var c = t[e];
            c && (a[r++] = c);
          }
          return a;
        }
        function xh() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var e = C(t - 1), n = arguments[0], r = t; r--; )
            e[r - 1] = arguments[r];
          return De(H(n) ? Nt(n) : [n], It(e, 1));
        }
        var Sh = Z(function(t, e) {
          return mt(t) ? Rn(t, It(e, 1, mt, !0)) : [];
        }), Ah = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = i), mt(t) ? Rn(t, It(e, 1, mt, !0), B(n, 2)) : [];
        }), bh = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = i), mt(t) ? Rn(t, It(e, 1, mt, !0), i, n) : [];
        });
        function Eh(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), ie(t, e < 0 ? 0 : e, r)) : [];
        }
        function Ih(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), e = r - e, ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function Fh(t, e) {
          return t && t.length ? yr(t, B(e, 3), !0, !0) : [];
        }
        function Th(t, e) {
          return t && t.length ? yr(t, B(e, 3), !0) : [];
        }
        function Mh(t, e, n, r) {
          var a = t == null ? 0 : t.length;
          return a ? (n && typeof n != "number" && kt(t, e, n) && (n = 0, r = a), xf(t, e, n, r)) : [];
        }
        function Lu(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = At(r + a, 0)), jn(t, B(e, 3), a);
        }
        function Pu(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = r - 1;
          return n !== i && (a = K(n), a = n < 0 ? At(r + a, 0) : Tt(a, r - 1)), jn(t, B(e, 3), a, !0);
        }
        function Ru(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, 1) : [];
        }
        function Lh(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, en) : [];
        }
        function Ph(t, e) {
          var n = t == null ? 0 : t.length;
          return n ? (e = e === i ? 1 : K(e), It(t, e)) : [];
        }
        function Rh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, r = {}; ++e < n; ) {
            var a = t[e];
            r[a[0]] = a[1];
          }
          return r;
        }
        function Ou(t) {
          return t && t.length ? t[0] : i;
        }
        function Oh(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = At(r + a, 0)), sn(t, e, a);
        }
        function kh(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 0, -1) : [];
        }
        var Dh = Z(function(t) {
          var e = pt(t, Gi);
          return e.length && e[0] === t[0] ? Ri(e) : [];
        }), Wh = Z(function(t) {
          var e = se(t), n = pt(t, Gi);
          return e === se(n) ? e = i : n.pop(), n.length && n[0] === t[0] ? Ri(n, B(e, 2)) : [];
        }), Bh = Z(function(t) {
          var e = se(t), n = pt(t, Gi);
          return e = typeof e == "function" ? e : i, e && n.pop(), n.length && n[0] === t[0] ? Ri(n, i, e) : [];
        });
        function Uh(t, e) {
          return t == null ? "" : Ol.call(t, e);
        }
        function se(t) {
          var e = t == null ? 0 : t.length;
          return e ? t[e - 1] : i;
        }
        function Nh(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = r;
          return n !== i && (a = K(n), a = a < 0 ? At(r + a, 0) : Tt(a, r - 1)), e === e ? ml(t, e, a) : jn(t, ga, a, !0);
        }
        function $h(t, e) {
          return t && t.length ? za(t, K(e)) : i;
        }
        var qh = Z(ku);
        function ku(t, e) {
          return t && t.length && e && e.length ? Wi(t, e) : t;
        }
        function Gh(t, e, n) {
          return t && t.length && e && e.length ? Wi(t, e, B(n, 2)) : t;
        }
        function Hh(t, e, n) {
          return t && t.length && e && e.length ? Wi(t, e, i, n) : t;
        }
        var zh = Ie(function(t, e) {
          var n = t == null ? 0 : t.length, r = Ti(t, e);
          return Za(t, pt(e, function(a) {
            return Fe(a, n) ? +a : a;
          }).sort(iu)), r;
        });
        function Kh(t, e) {
          var n = [];
          if (!(t && t.length))
            return n;
          var r = -1, a = [], c = t.length;
          for (e = B(e, 3); ++r < c; ) {
            var f = t[r];
            e(f, r, t) && (n.push(f), a.push(r));
          }
          return Za(t, a), n;
        }
        function rs(t) {
          return t == null ? t : Bl.call(t);
        }
        function Jh(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (n && typeof n != "number" && kt(t, e, n) ? (e = 0, n = r) : (e = e == null ? 0 : K(e), n = n === i ? r : K(n)), ie(t, e, n)) : [];
        }
        function Zh(t, e) {
          return wr(t, e);
        }
        function Yh(t, e, n) {
          return Ni(t, e, B(n, 2));
        }
        function Xh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var r = wr(t, e);
            if (r < n && fe(t[r], e))
              return r;
          }
          return -1;
        }
        function Qh(t, e) {
          return wr(t, e, !0);
        }
        function Vh(t, e, n) {
          return Ni(t, e, B(n, 2), !0);
        }
        function jh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var r = wr(t, e, !0) - 1;
            if (fe(t[r], e))
              return r;
          }
          return -1;
        }
        function tp(t) {
          return t && t.length ? Xa(t) : [];
        }
        function ep(t, e) {
          return t && t.length ? Xa(t, B(e, 2)) : [];
        }
        function np(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 1, e) : [];
        }
        function rp(t, e, n) {
          return t && t.length ? (e = n || e === i ? 1 : K(e), ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function ip(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), e = r - e, ie(t, e < 0 ? 0 : e, r)) : [];
        }
        function sp(t, e) {
          return t && t.length ? yr(t, B(e, 3), !1, !0) : [];
        }
        function ap(t, e) {
          return t && t.length ? yr(t, B(e, 3)) : [];
        }
        var up = Z(function(t) {
          return Ne(It(t, 1, mt, !0));
        }), op = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = i), Ne(It(t, 1, mt, !0), B(e, 2));
        }), cp = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : i, Ne(It(t, 1, mt, !0), i, e);
        });
        function lp(t) {
          return t && t.length ? Ne(t) : [];
        }
        function fp(t, e) {
          return t && t.length ? Ne(t, B(e, 2)) : [];
        }
        function hp(t, e) {
          return e = typeof e == "function" ? e : i, t && t.length ? Ne(t, i, e) : [];
        }
        function is(t) {
          if (!(t && t.length))
            return [];
          var e = 0;
          return t = ke(t, function(n) {
            if (mt(n))
              return e = At(n.length, e), !0;
          }), Ci(e, function(n) {
            return pt(t, mi(n));
          });
        }
        function Du(t, e) {
          if (!(t && t.length))
            return [];
          var n = is(t);
          return e == null ? n : pt(n, function(r) {
            return zt(e, i, r);
          });
        }
        var pp = Z(function(t, e) {
          return mt(t) ? Rn(t, e) : [];
        }), gp = Z(function(t) {
          return qi(ke(t, mt));
        }), dp = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = i), qi(ke(t, mt), B(e, 2));
        }), _p = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : i, qi(ke(t, mt), i, e);
        }), vp = Z(is);
        function mp(t, e) {
          return tu(t || [], e || [], Pn);
        }
        function wp(t, e) {
          return tu(t || [], e || [], Dn);
        }
        var yp = Z(function(t) {
          var e = t.length, n = e > 1 ? t[e - 1] : i;
          return n = typeof n == "function" ? (t.pop(), n) : i, Du(t, n);
        });
        function Wu(t) {
          var e = u(t);
          return e.__chain__ = !0, e;
        }
        function Cp(t, e) {
          return e(t), t;
        }
        function Tr(t, e) {
          return e(t);
        }
        var xp = Ie(function(t) {
          var e = t.length, n = e ? t[0] : 0, r = this.__wrapped__, a = function(c) {
            return Ti(c, t);
          };
          return e > 1 || this.__actions__.length || !(r instanceof Q) || !Fe(n) ? this.thru(a) : (r = r.slice(n, +n + (e ? 1 : 0)), r.__actions__.push({
            func: Tr,
            args: [a],
            thisArg: i
          }), new ne(r, this.__chain__).thru(function(c) {
            return e && !c.length && c.push(i), c;
          }));
        });
        function Sp() {
          return Wu(this);
        }
        function Ap() {
          return new ne(this.value(), this.__chain__);
        }
        function bp() {
          this.__values__ === i && (this.__values__ = Qu(this.value()));
          var t = this.__index__ >= this.__values__.length, e = t ? i : this.__values__[this.__index__++];
          return { done: t, value: e };
        }
        function Ep() {
          return this;
        }
        function Ip(t) {
          for (var e, n = this; n instanceof gr; ) {
            var r = Mu(n);
            r.__index__ = 0, r.__values__ = i, e ? a.__wrapped__ = r : e = r;
            var a = r;
            n = n.__wrapped__;
          }
          return a.__wrapped__ = t, e;
        }
        function Fp() {
          var t = this.__wrapped__;
          if (t instanceof Q) {
            var e = t;
            return this.__actions__.length && (e = new Q(this)), e = e.reverse(), e.__actions__.push({
              func: Tr,
              args: [rs],
              thisArg: i
            }), new ne(e, this.__chain__);
          }
          return this.thru(rs);
        }
        function Tp() {
          return ja(this.__wrapped__, this.__actions__);
        }
        var Mp = Cr(function(t, e, n) {
          rt.call(t, n) ? ++t[n] : be(t, n, 1);
        });
        function Lp(t, e, n) {
          var r = H(t) ? ha : Cf;
          return n && kt(t, e, n) && (e = i), r(t, B(e, 3));
        }
        function Pp(t, e) {
          var n = H(t) ? ke : Da;
          return n(t, B(e, 3));
        }
        var Rp = lu(Lu), Op = lu(Pu);
        function kp(t, e) {
          return It(Mr(t, e), 1);
        }
        function Dp(t, e) {
          return It(Mr(t, e), en);
        }
        function Wp(t, e, n) {
          return n = n === i ? 1 : K(n), It(Mr(t, e), n);
        }
        function Bu(t, e) {
          var n = H(t) ? te : Ue;
          return n(t, B(e, 3));
        }
        function Uu(t, e) {
          var n = H(t) ? el : ka;
          return n(t, B(e, 3));
        }
        var Bp = Cr(function(t, e, n) {
          rt.call(t, n) ? t[n].push(e) : be(t, n, [e]);
        });
        function Up(t, e, n, r) {
          t = $t(t) ? t : vn(t), n = n && !r ? K(n) : 0;
          var a = t.length;
          return n < 0 && (n = At(a + n, 0)), kr(t) ? n <= a && t.indexOf(e, n) > -1 : !!a && sn(t, e, n) > -1;
        }
        var Np = Z(function(t, e, n) {
          var r = -1, a = typeof e == "function", c = $t(t) ? C(t.length) : [];
          return Ue(t, function(f) {
            c[++r] = a ? zt(e, f, n) : On(f, e, n);
          }), c;
        }), $p = Cr(function(t, e, n) {
          be(t, n, e);
        });
        function Mr(t, e) {
          var n = H(t) ? pt : qa;
          return n(t, B(e, 3));
        }
        function qp(t, e, n, r) {
          return t == null ? [] : (H(e) || (e = e == null ? [] : [e]), n = r ? i : n, H(n) || (n = n == null ? [] : [n]), Ka(t, e, n));
        }
        var Gp = Cr(function(t, e, n) {
          t[n ? 0 : 1].push(e);
        }, function() {
          return [[], []];
        });
        function Hp(t, e, n) {
          var r = H(t) ? _i : _a, a = arguments.length < 3;
          return r(t, B(e, 4), n, a, Ue);
        }
        function zp(t, e, n) {
          var r = H(t) ? nl : _a, a = arguments.length < 3;
          return r(t, B(e, 4), n, a, ka);
        }
        function Kp(t, e) {
          var n = H(t) ? ke : Da;
          return n(t, Rr(B(e, 3)));
        }
        function Jp(t) {
          var e = H(t) ? La : Uf;
          return e(t);
        }
        function Zp(t, e, n) {
          (n ? kt(t, e, n) : e === i) ? e = 1 : e = K(e);
          var r = H(t) ? _f : Nf;
          return r(t, e);
        }
        function Yp(t) {
          var e = H(t) ? vf : qf;
          return e(t);
        }
        function Xp(t) {
          if (t == null)
            return 0;
          if ($t(t))
            return kr(t) ? un(t) : t.length;
          var e = Mt(t);
          return e == dt || e == ht ? t.size : ki(t).length;
        }
        function Qp(t, e, n) {
          var r = H(t) ? vi : Gf;
          return n && kt(t, e, n) && (e = i), r(t, B(e, 3));
        }
        var Vp = Z(function(t, e) {
          if (t == null)
            return [];
          var n = e.length;
          return n > 1 && kt(t, e[0], e[1]) ? e = [] : n > 2 && kt(e[0], e[1], e[2]) && (e = [e[0]]), Ka(t, It(e, 1), []);
        }), Lr = Ll || function() {
          return Et.Date.now();
        };
        function jp(t, e) {
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
        function $u(t, e) {
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
            var a = We(n, dn(ss));
            r |= xt;
          }
          return Ee(t, r, e, n, a);
        }), qu = Z(function(t, e, n) {
          var r = W | z;
          if (n.length) {
            var a = We(n, dn(qu));
            r |= xt;
          }
          return Ee(e, r, t, n, a);
        });
        function Gu(t, e, n) {
          e = n ? i : e;
          var r = Ee(t, it, i, i, i, i, i, e);
          return r.placeholder = Gu.placeholder, r;
        }
        function Hu(t, e, n) {
          e = n ? i : e;
          var r = Ee(t, vt, i, i, i, i, i, e);
          return r.placeholder = Hu.placeholder, r;
        }
        function zu(t, e, n) {
          var r, a, c, f, p, _, A = 0, b = !1, E = !1, M = !0;
          if (typeof t != "function")
            throw new ee(d);
          e = ae(e) || 0, gt(n) && (b = !!n.leading, E = "maxWait" in n, c = E ? At(ae(n.maxWait) || 0, e) : c, M = "trailing" in n ? !!n.trailing : M);
          function D(wt) {
            var he = r, Le = a;
            return r = a = i, A = wt, f = t.apply(Le, he), f;
          }
          function U(wt) {
            return A = wt, p = Un(X, e), b ? D(wt) : f;
          }
          function J(wt) {
            var he = wt - _, Le = wt - A, lo = e - he;
            return E ? Tt(lo, c - Le) : lo;
          }
          function N(wt) {
            var he = wt - _, Le = wt - A;
            return _ === i || he >= e || he < 0 || E && Le >= c;
          }
          function X() {
            var wt = Lr();
            if (N(wt))
              return V(wt);
            p = Un(X, J(wt));
          }
          function V(wt) {
            return p = i, M && r ? D(wt) : (r = a = i, f);
          }
          function Yt() {
            p !== i && eu(p), A = 0, r = _ = a = p = i;
          }
          function Dt() {
            return p === i ? f : V(Lr());
          }
          function Xt() {
            var wt = Lr(), he = N(wt);
            if (r = arguments, a = this, _ = wt, he) {
              if (p === i)
                return U(_);
              if (E)
                return eu(p), p = Un(X, e), D(_);
            }
            return p === i && (p = Un(X, e)), f;
          }
          return Xt.cancel = Yt, Xt.flush = Dt, Xt;
        }
        var tg = Z(function(t, e) {
          return Oa(t, 1, e);
        }), eg = Z(function(t, e, n) {
          return Oa(t, ae(e) || 0, n);
        });
        function ng(t) {
          return Ee(t, Ce);
        }
        function Pr(t, e) {
          if (typeof t != "function" || e != null && typeof e != "function")
            throw new ee(d);
          var n = function() {
            var r = arguments, a = e ? e.apply(this, r) : r[0], c = n.cache;
            if (c.has(a))
              return c.get(a);
            var f = t.apply(this, r);
            return n.cache = c.set(a, f) || c, f;
          };
          return n.cache = new (Pr.Cache || Ae)(), n;
        }
        Pr.Cache = Ae;
        function Rr(t) {
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
        function rg(t) {
          return $u(2, t);
        }
        var ig = Hf(function(t, e) {
          e = e.length == 1 && H(e[0]) ? pt(e[0], Kt(B())) : pt(It(e, 1), Kt(B()));
          var n = e.length;
          return Z(function(r) {
            for (var a = -1, c = Tt(r.length, n); ++a < c; )
              r[a] = e[a].call(this, r[a]);
            return zt(t, this, r);
          });
        }), as = Z(function(t, e) {
          var n = We(e, dn(as));
          return Ee(t, xt, i, e, n);
        }), Ku = Z(function(t, e) {
          var n = We(e, dn(Ku));
          return Ee(t, Pe, i, e, n);
        }), sg = Ie(function(t, e) {
          return Ee(t, ge, i, i, i, e);
        });
        function ag(t, e) {
          if (typeof t != "function")
            throw new ee(d);
          return e = e === i ? e : K(e), Z(t, e);
        }
        function ug(t, e) {
          if (typeof t != "function")
            throw new ee(d);
          return e = e == null ? 0 : At(K(e), 0), Z(function(n) {
            var r = n[e], a = qe(n, 0, e);
            return r && De(a, r), zt(t, this, a);
          });
        }
        function og(t, e, n) {
          var r = !0, a = !0;
          if (typeof t != "function")
            throw new ee(d);
          return gt(n) && (r = "leading" in n ? !!n.leading : r, a = "trailing" in n ? !!n.trailing : a), zu(t, e, {
            leading: r,
            maxWait: e,
            trailing: a
          });
        }
        function cg(t) {
          return Nu(t, 1);
        }
        function lg(t, e) {
          return as(Hi(e), t);
        }
        function fg() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return H(t) ? t : [t];
        }
        function hg(t) {
          return re(t, k);
        }
        function pg(t, e) {
          return e = typeof e == "function" ? e : i, re(t, k, e);
        }
        function gg(t) {
          return re(t, w | k);
        }
        function dg(t, e) {
          return e = typeof e == "function" ? e : i, re(t, w | k, e);
        }
        function _g(t, e) {
          return e == null || Ra(t, e, bt(e));
        }
        function fe(t, e) {
          return t === e || t !== t && e !== e;
        }
        var vg = br(Pi), mg = br(function(t, e) {
          return t >= e;
        }), tn = Ua(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Ua : function(t) {
          return _t(t) && rt.call(t, "callee") && !ba.call(t, "callee");
        }, H = C.isArray, wg = aa ? Kt(aa) : If;
        function $t(t) {
          return t != null && Or(t.length) && !Te(t);
        }
        function mt(t) {
          return _t(t) && $t(t);
        }
        function yg(t) {
          return t === !0 || t === !1 || _t(t) && Ot(t) == ot;
        }
        var Ge = Rl || vs, Cg = ua ? Kt(ua) : Ff;
        function xg(t) {
          return _t(t) && t.nodeType === 1 && !Nn(t);
        }
        function Sg(t) {
          if (t == null)
            return !0;
          if ($t(t) && (H(t) || typeof t == "string" || typeof t.splice == "function" || Ge(t) || _n(t) || tn(t)))
            return !t.length;
          var e = Mt(t);
          if (e == dt || e == ht)
            return !t.size;
          if (Bn(t))
            return !ki(t).length;
          for (var n in t)
            if (rt.call(t, n))
              return !1;
          return !0;
        }
        function Ag(t, e) {
          return kn(t, e);
        }
        function bg(t, e, n) {
          n = typeof n == "function" ? n : i;
          var r = n ? n(t, e) : i;
          return r === i ? kn(t, e, i, n) : !!r;
        }
        function us(t) {
          if (!_t(t))
            return !1;
          var e = Ot(t);
          return e == Pt || e == Ht || typeof t.message == "string" && typeof t.name == "string" && !Nn(t);
        }
        function Eg(t) {
          return typeof t == "number" && Ia(t);
        }
        function Te(t) {
          if (!gt(t))
            return !1;
          var e = Ot(t);
          return e == Bt || e == de || e == at || e == oe;
        }
        function Ju(t) {
          return typeof t == "number" && t == K(t);
        }
        function Or(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= Re;
        }
        function gt(t) {
          var e = typeof t;
          return t != null && (e == "object" || e == "function");
        }
        function _t(t) {
          return t != null && typeof t == "object";
        }
        var Zu = oa ? Kt(oa) : Mf;
        function Ig(t, e) {
          return t === e || Oi(t, e, Qi(e));
        }
        function Fg(t, e, n) {
          return n = typeof n == "function" ? n : i, Oi(t, e, Qi(e), n);
        }
        function Tg(t) {
          return Yu(t) && t != +t;
        }
        function Mg(t) {
          if (ph(t))
            throw new G(m);
          return Na(t);
        }
        function Lg(t) {
          return t === null;
        }
        function Pg(t) {
          return t == null;
        }
        function Yu(t) {
          return typeof t == "number" || _t(t) && Ot(t) == Rt;
        }
        function Nn(t) {
          if (!_t(t) || Ot(t) != Ct)
            return !1;
          var e = ur(t);
          if (e === null)
            return !0;
          var n = rt.call(e, "constructor") && e.constructor;
          return typeof n == "function" && n instanceof n && rr.call(n) == Il;
        }
        var os = ca ? Kt(ca) : Lf;
        function Rg(t) {
          return Ju(t) && t >= -9007199254740991 && t <= Re;
        }
        var Xu = la ? Kt(la) : Pf;
        function kr(t) {
          return typeof t == "string" || !H(t) && _t(t) && Ot(t) == _e;
        }
        function Zt(t) {
          return typeof t == "symbol" || _t(t) && Ot(t) == Zn;
        }
        var _n = fa ? Kt(fa) : Rf;
        function Og(t) {
          return t === i;
        }
        function kg(t) {
          return _t(t) && Mt(t) == An;
        }
        function Dg(t) {
          return _t(t) && Ot(t) == Qo;
        }
        var Wg = br(Di), Bg = br(function(t, e) {
          return t <= e;
        });
        function Qu(t) {
          if (!t)
            return [];
          if ($t(t))
            return kr(t) ? ce(t) : Nt(t);
          if (In && t[In])
            return dl(t[In]());
          var e = Mt(t), n = e == dt ? Si : e == ht ? tr : vn;
          return n(t);
        }
        function Me(t) {
          if (!t)
            return t === 0 ? t : 0;
          if (t = ae(t), t === en || t === -1 / 0) {
            var e = t < 0 ? -1 : 1;
            return e * Jn;
          }
          return t === t ? t : 0;
        }
        function K(t) {
          var e = Me(t), n = e % 1;
          return e === e ? n ? e - n : e : 0;
        }
        function Vu(t) {
          return t ? Xe(K(t), 0, P) : 0;
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
          t = va(t);
          var n = mc.test(t);
          return n || yc.test(t) ? Vc(t.slice(2), n ? 2 : 8) : vc.test(t) ? xe : +t;
        }
        function ju(t) {
          return me(t, qt(t));
        }
        function Ug(t) {
          return t ? Xe(K(t), -9007199254740991, Re) : t === 0 ? t : 0;
        }
        function nt(t) {
          return t == null ? "" : Jt(t);
        }
        var Ng = pn(function(t, e) {
          if (Bn(e) || $t(e)) {
            me(e, bt(e), t);
            return;
          }
          for (var n in e)
            rt.call(e, n) && Pn(t, n, e[n]);
        }), to = pn(function(t, e) {
          me(e, qt(e), t);
        }), Dr = pn(function(t, e, n, r) {
          me(e, qt(e), t, r);
        }), $g = pn(function(t, e, n, r) {
          me(e, bt(e), t, r);
        }), qg = Ie(Ti);
        function Gg(t, e) {
          var n = hn(t);
          return e == null ? n : Pa(n, e);
        }
        var Hg = Z(function(t, e) {
          t = st(t);
          var n = -1, r = e.length, a = r > 2 ? e[2] : i;
          for (a && kt(e[0], e[1], a) && (r = 1); ++n < r; )
            for (var c = e[n], f = qt(c), p = -1, _ = f.length; ++p < _; ) {
              var A = f[p], b = t[A];
              (b === i || fe(b, cn[A]) && !rt.call(t, A)) && (t[A] = c[A]);
            }
          return t;
        }), zg = Z(function(t) {
          return t.push(i, vu), zt(eo, i, t);
        });
        function Kg(t, e) {
          return pa(t, B(e, 3), ve);
        }
        function Jg(t, e) {
          return pa(t, B(e, 3), Li);
        }
        function Zg(t, e) {
          return t == null ? t : Mi(t, B(e, 3), qt);
        }
        function Yg(t, e) {
          return t == null ? t : Wa(t, B(e, 3), qt);
        }
        function Xg(t, e) {
          return t && ve(t, B(e, 3));
        }
        function Qg(t, e) {
          return t && Li(t, B(e, 3));
        }
        function Vg(t) {
          return t == null ? [] : vr(t, bt(t));
        }
        function jg(t) {
          return t == null ? [] : vr(t, qt(t));
        }
        function cs(t, e, n) {
          var r = t == null ? i : Qe(t, e);
          return r === i ? n : r;
        }
        function td(t, e) {
          return t != null && yu(t, e, Sf);
        }
        function ls(t, e) {
          return t != null && yu(t, e, Af);
        }
        var ed = hu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = ir.call(e)), t[e] = n;
        }, hs(Gt)), nd = hu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = ir.call(e)), rt.call(t, e) ? t[e].push(n) : t[e] = [n];
        }, B), rd = Z(On);
        function bt(t) {
          return $t(t) ? Ma(t) : ki(t);
        }
        function qt(t) {
          return $t(t) ? Ma(t, !0) : Of(t);
        }
        function id(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(r, a, c) {
            be(n, e(r, a, c), r);
          }), n;
        }
        function sd(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(r, a, c) {
            be(n, a, e(r, a, c));
          }), n;
        }
        var ad = pn(function(t, e, n) {
          mr(t, e, n);
        }), eo = pn(function(t, e, n, r) {
          mr(t, e, n, r);
        }), ud = Ie(function(t, e) {
          var n = {};
          if (t == null)
            return n;
          var r = !1;
          e = pt(e, function(c) {
            return c = $e(c, t), r || (r = c.length > 1), c;
          }), me(t, Yi(t), n), r && (n = re(n, w | R | k, eh));
          for (var a = e.length; a--; )
            $i(n, e[a]);
          return n;
        });
        function od(t, e) {
          return no(t, Rr(B(e)));
        }
        var cd = Ie(function(t, e) {
          return t == null ? {} : Df(t, e);
        });
        function no(t, e) {
          if (t == null)
            return {};
          var n = pt(Yi(t), function(r) {
            return [r];
          });
          return e = B(e), Ja(t, n, function(r, a) {
            return e(r, a[0]);
          });
        }
        function ld(t, e, n) {
          e = $e(e, t);
          var r = -1, a = e.length;
          for (a || (a = 1, t = i); ++r < a; ) {
            var c = t == null ? i : t[we(e[r])];
            c === i && (r = a, c = n), t = Te(c) ? c.call(t) : c;
          }
          return t;
        }
        function fd(t, e, n) {
          return t == null ? t : Dn(t, e, n);
        }
        function hd(t, e, n, r) {
          return r = typeof r == "function" ? r : i, t == null ? t : Dn(t, e, n, r);
        }
        var ro = du(bt), io = du(qt);
        function pd(t, e, n) {
          var r = H(t), a = r || Ge(t) || _n(t);
          if (e = B(e, 4), n == null) {
            var c = t && t.constructor;
            a ? n = r ? new c() : [] : gt(t) ? n = Te(c) ? hn(ur(t)) : {} : n = {};
          }
          return (a ? te : ve)(t, function(f, p, _) {
            return e(n, f, p, _);
          }), n;
        }
        function gd(t, e) {
          return t == null ? !0 : $i(t, e);
        }
        function dd(t, e, n) {
          return t == null ? t : Va(t, e, Hi(n));
        }
        function _d(t, e, n, r) {
          return r = typeof r == "function" ? r : i, t == null ? t : Va(t, e, Hi(n), r);
        }
        function vn(t) {
          return t == null ? [] : xi(t, bt(t));
        }
        function vd(t) {
          return t == null ? [] : xi(t, qt(t));
        }
        function md(t, e, n) {
          return n === i && (n = e, e = i), n !== i && (n = ae(n), n = n === n ? n : 0), e !== i && (e = ae(e), e = e === e ? e : 0), Xe(ae(t), e, n);
        }
        function wd(t, e, n) {
          return e = Me(e), n === i ? (n = e, e = 0) : n = Me(n), t = ae(t), bf(t, e, n);
        }
        function yd(t, e, n) {
          if (n && typeof n != "boolean" && kt(t, e, n) && (e = n = i), n === i && (typeof e == "boolean" ? (n = e, e = i) : typeof t == "boolean" && (n = t, t = i)), t === i && e === i ? (t = 0, e = 1) : (t = Me(t), e === i ? (e = t, t = 0) : e = Me(e)), t > e) {
            var r = t;
            t = e, e = r;
          }
          if (n || t % 1 || e % 1) {
            var a = Fa();
            return Tt(t + a * (e - t + Qc("1e-" + ((a + "").length - 1))), e);
          }
          return Bi(t, e);
        }
        var Cd = gn(function(t, e, n) {
          return e = e.toLowerCase(), t + (n ? so(e) : e);
        });
        function so(t) {
          return fs(nt(t).toLowerCase());
        }
        function ao(t) {
          return t = nt(t), t && t.replace(xc, ll).replace($c, "");
        }
        function xd(t, e, n) {
          t = nt(t), e = Jt(e);
          var r = t.length;
          n = n === i ? r : Xe(K(n), 0, r);
          var a = n;
          return n -= e.length, n >= 0 && t.slice(n, a) == e;
        }
        function Sd(t) {
          return t = nt(t), t && nc.test(t) ? t.replace(Ws, fl) : t;
        }
        function Ad(t) {
          return t = nt(t), t && oc.test(t) ? t.replace(ai, "\\$&") : t;
        }
        var bd = gn(function(t, e, n) {
          return t + (n ? "-" : "") + e.toLowerCase();
        }), Ed = gn(function(t, e, n) {
          return t + (n ? " " : "") + e.toLowerCase();
        }), Id = cu("toLowerCase");
        function Fd(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? un(t) : 0;
          if (!e || r >= e)
            return t;
          var a = (e - r) / 2;
          return Ar(fr(a), n) + t + Ar(lr(a), n);
        }
        function Td(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? un(t) : 0;
          return e && r < e ? t + Ar(e - r, n) : t;
        }
        function Md(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? un(t) : 0;
          return e && r < e ? Ar(e - r, n) + t : t;
        }
        function Ld(t, e, n) {
          return n || e == null ? e = 0 : e && (e = +e), Wl(nt(t).replace(ui, ""), e || 0);
        }
        function Pd(t, e, n) {
          return (n ? kt(t, e, n) : e === i) ? e = 1 : e = K(e), Ui(nt(t), e);
        }
        function Rd() {
          var t = arguments, e = nt(t[0]);
          return t.length < 3 ? e : e.replace(t[1], t[2]);
        }
        var Od = gn(function(t, e, n) {
          return t + (n ? "_" : "") + e.toLowerCase();
        });
        function kd(t, e, n) {
          return n && typeof n != "number" && kt(t, e, n) && (e = n = i), n = n === i ? P : n >>> 0, n ? (t = nt(t), t && (typeof e == "string" || e != null && !os(e)) && (e = Jt(e), !e && an(t)) ? qe(ce(t), 0, n) : t.split(e, n)) : [];
        }
        var Dd = gn(function(t, e, n) {
          return t + (n ? " " : "") + fs(e);
        });
        function Wd(t, e, n) {
          return t = nt(t), n = n == null ? 0 : Xe(K(n), 0, t.length), e = Jt(e), t.slice(n, n + e.length) == e;
        }
        function Bd(t, e, n) {
          var r = u.templateSettings;
          n && kt(t, e, n) && (e = i), t = nt(t), e = Dr({}, e, r, _u);
          var a = Dr({}, e.imports, r.imports, _u), c = bt(a), f = xi(a, c), p, _, A = 0, b = e.interpolate || Yn, E = "__p += '", M = Ai(
            (e.escape || Yn).source + "|" + b.source + "|" + (b === Bs ? _c : Yn).source + "|" + (e.evaluate || Yn).source + "|$",
            "g"
          ), D = "//# sourceURL=" + (rt.call(e, "sourceURL") ? (e.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Kc + "]") + `
`;
          t.replace(M, function(N, X, V, Yt, Dt, Xt) {
            return V || (V = Yt), E += t.slice(A, Xt).replace(Sc, hl), X && (p = !0, E += `' +
__e(` + X + `) +
'`), Dt && (_ = !0, E += `';
` + Dt + `;
__p += '`), V && (E += `' +
((__t = (` + V + `)) == null ? '' : __t) +
'`), A = Xt + N.length, N;
          }), E += `';
`;
          var U = rt.call(e, "variable") && e.variable;
          if (!U)
            E = `with (obj) {
` + E + `
}
`;
          else if (gc.test(U))
            throw new G(v);
          E = (_ ? E.replace(Vo, "") : E).replace(jo, "$1").replace(tc, "$1;"), E = "function(" + (U || "obj") + `) {
` + (U ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (p ? ", __e = _.escape" : "") + (_ ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + E + `return __p
}`;
          var J = oo(function() {
            return et(c, D + "return " + E).apply(i, f);
          });
          if (J.source = E, us(J))
            throw J;
          return J;
        }
        function Ud(t) {
          return nt(t).toLowerCase();
        }
        function Nd(t) {
          return nt(t).toUpperCase();
        }
        function $d(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return va(t);
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = ce(e), c = ma(r, a), f = wa(r, a) + 1;
          return qe(r, c, f).join("");
        }
        function qd(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return t.slice(0, Ca(t) + 1);
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = wa(r, ce(e)) + 1;
          return qe(r, 0, a).join("");
        }
        function Gd(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return t.replace(ui, "");
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = ma(r, ce(e));
          return qe(r, a).join("");
        }
        function Hd(t, e) {
          var n = Lt, r = xn;
          if (gt(e)) {
            var a = "separator" in e ? e.separator : a;
            n = "length" in e ? K(e.length) : n, r = "omission" in e ? Jt(e.omission) : r;
          }
          t = nt(t);
          var c = t.length;
          if (an(t)) {
            var f = ce(t);
            c = f.length;
          }
          if (n >= c)
            return t;
          var p = n - un(r);
          if (p < 1)
            return r;
          var _ = f ? qe(f, 0, p).join("") : t.slice(0, p);
          if (a === i)
            return _ + r;
          if (f && (p += _.length - p), os(a)) {
            if (t.slice(p).search(a)) {
              var A, b = _;
              for (a.global || (a = Ai(a.source, nt(Us.exec(a)) + "g")), a.lastIndex = 0; A = a.exec(b); )
                var E = A.index;
              _ = _.slice(0, E === i ? p : E);
            }
          } else if (t.indexOf(Jt(a), p) != p) {
            var M = _.lastIndexOf(a);
            M > -1 && (_ = _.slice(0, M));
          }
          return _ + r;
        }
        function zd(t) {
          return t = nt(t), t && ec.test(t) ? t.replace(Ds, wl) : t;
        }
        var Kd = gn(function(t, e, n) {
          return t + (n ? " " : "") + e.toUpperCase();
        }), fs = cu("toUpperCase");
        function uo(t, e, n) {
          return t = nt(t), e = n ? i : e, e === i ? gl(t) ? xl(t) : sl(t) : t.match(e) || [];
        }
        var oo = Z(function(t, e) {
          try {
            return zt(t, i, e);
          } catch (n) {
            return us(n) ? n : new G(n);
          }
        }), Jd = Ie(function(t, e) {
          return te(e, function(n) {
            n = we(n), be(t, n, ss(t[n], t));
          }), t;
        });
        function Zd(t) {
          var e = t == null ? 0 : t.length, n = B();
          return t = e ? pt(t, function(r) {
            if (typeof r[1] != "function")
              throw new ee(d);
            return [n(r[0]), r[1]];
          }) : [], Z(function(r) {
            for (var a = -1; ++a < e; ) {
              var c = t[a];
              if (zt(c[0], this, r))
                return zt(c[1], this, r);
            }
          });
        }
        function Yd(t) {
          return yf(re(t, w));
        }
        function hs(t) {
          return function() {
            return t;
          };
        }
        function Xd(t, e) {
          return t == null || t !== t ? e : t;
        }
        var Qd = fu(), Vd = fu(!0);
        function Gt(t) {
          return t;
        }
        function ps(t) {
          return $a(typeof t == "function" ? t : re(t, w));
        }
        function jd(t) {
          return Ga(re(t, w));
        }
        function t0(t, e) {
          return Ha(t, re(e, w));
        }
        var e0 = Z(function(t, e) {
          return function(n) {
            return On(n, t, e);
          };
        }), n0 = Z(function(t, e) {
          return function(n) {
            return On(t, n, e);
          };
        });
        function gs(t, e, n) {
          var r = bt(e), a = vr(e, r);
          n == null && !(gt(e) && (a.length || !r.length)) && (n = e, e = t, t = this, a = vr(e, bt(e)));
          var c = !(gt(n) && "chain" in n) || !!n.chain, f = Te(t);
          return te(a, function(p) {
            var _ = e[p];
            t[p] = _, f && (t.prototype[p] = function() {
              var A = this.__chain__;
              if (c || A) {
                var b = t(this.__wrapped__), E = b.__actions__ = Nt(this.__actions__);
                return E.push({ func: _, args: arguments, thisArg: t }), b.__chain__ = A, b;
              }
              return _.apply(t, De([this.value()], arguments));
            });
          }), t;
        }
        function r0() {
          return Et._ === this && (Et._ = Fl), this;
        }
        function ds() {
        }
        function i0(t) {
          return t = K(t), Z(function(e) {
            return za(e, t);
          });
        }
        var s0 = Ki(pt), a0 = Ki(ha), u0 = Ki(vi);
        function co(t) {
          return ji(t) ? mi(we(t)) : Wf(t);
        }
        function o0(t) {
          return function(e) {
            return t == null ? i : Qe(t, e);
          };
        }
        var c0 = pu(), l0 = pu(!0);
        function _s() {
          return [];
        }
        function vs() {
          return !1;
        }
        function f0() {
          return {};
        }
        function h0() {
          return "";
        }
        function p0() {
          return !0;
        }
        function g0(t, e) {
          if (t = K(t), t < 1 || t > Re)
            return [];
          var n = P, r = Tt(t, P);
          e = B(e), t -= P;
          for (var a = Ci(r, e); ++n < t; )
            e(n);
          return a;
        }
        function d0(t) {
          return H(t) ? pt(t, we) : Zt(t) ? [t] : Nt(Tu(nt(t)));
        }
        function _0(t) {
          var e = ++El;
          return nt(t) + e;
        }
        var v0 = Sr(function(t, e) {
          return t + e;
        }, 0), m0 = Ji("ceil"), w0 = Sr(function(t, e) {
          return t / e;
        }, 1), y0 = Ji("floor");
        function C0(t) {
          return t && t.length ? _r(t, Gt, Pi) : i;
        }
        function x0(t, e) {
          return t && t.length ? _r(t, B(e, 2), Pi) : i;
        }
        function S0(t) {
          return da(t, Gt);
        }
        function A0(t, e) {
          return da(t, B(e, 2));
        }
        function b0(t) {
          return t && t.length ? _r(t, Gt, Di) : i;
        }
        function E0(t, e) {
          return t && t.length ? _r(t, B(e, 2), Di) : i;
        }
        var I0 = Sr(function(t, e) {
          return t * e;
        }, 1), F0 = Ji("round"), T0 = Sr(function(t, e) {
          return t - e;
        }, 0);
        function M0(t) {
          return t && t.length ? yi(t, Gt) : 0;
        }
        function L0(t, e) {
          return t && t.length ? yi(t, B(e, 2)) : 0;
        }
        return u.after = jp, u.ary = Nu, u.assign = Ng, u.assignIn = to, u.assignInWith = Dr, u.assignWith = $g, u.at = qg, u.before = $u, u.bind = ss, u.bindAll = Jd, u.bindKey = qu, u.castArray = fg, u.chain = Wu, u.chunk = yh, u.compact = Ch, u.concat = xh, u.cond = Zd, u.conforms = Yd, u.constant = hs, u.countBy = Mp, u.create = Gg, u.curry = Gu, u.curryRight = Hu, u.debounce = zu, u.defaults = Hg, u.defaultsDeep = zg, u.defer = tg, u.delay = eg, u.difference = Sh, u.differenceBy = Ah, u.differenceWith = bh, u.drop = Eh, u.dropRight = Ih, u.dropRightWhile = Fh, u.dropWhile = Th, u.fill = Mh, u.filter = Pp, u.flatMap = kp, u.flatMapDeep = Dp, u.flatMapDepth = Wp, u.flatten = Ru, u.flattenDeep = Lh, u.flattenDepth = Ph, u.flip = ng, u.flow = Qd, u.flowRight = Vd, u.fromPairs = Rh, u.functions = Vg, u.functionsIn = jg, u.groupBy = Bp, u.initial = kh, u.intersection = Dh, u.intersectionBy = Wh, u.intersectionWith = Bh, u.invert = ed, u.invertBy = nd, u.invokeMap = Np, u.iteratee = ps, u.keyBy = $p, u.keys = bt, u.keysIn = qt, u.map = Mr, u.mapKeys = id, u.mapValues = sd, u.matches = jd, u.matchesProperty = t0, u.memoize = Pr, u.merge = ad, u.mergeWith = eo, u.method = e0, u.methodOf = n0, u.mixin = gs, u.negate = Rr, u.nthArg = i0, u.omit = ud, u.omitBy = od, u.once = rg, u.orderBy = qp, u.over = s0, u.overArgs = ig, u.overEvery = a0, u.overSome = u0, u.partial = as, u.partialRight = Ku, u.partition = Gp, u.pick = cd, u.pickBy = no, u.property = co, u.propertyOf = o0, u.pull = qh, u.pullAll = ku, u.pullAllBy = Gh, u.pullAllWith = Hh, u.pullAt = zh, u.range = c0, u.rangeRight = l0, u.rearg = sg, u.reject = Kp, u.remove = Kh, u.rest = ag, u.reverse = rs, u.sampleSize = Zp, u.set = fd, u.setWith = hd, u.shuffle = Yp, u.slice = Jh, u.sortBy = Vp, u.sortedUniq = tp, u.sortedUniqBy = ep, u.split = kd, u.spread = ug, u.tail = np, u.take = rp, u.takeRight = ip, u.takeRightWhile = sp, u.takeWhile = ap, u.tap = Cp, u.throttle = og, u.thru = Tr, u.toArray = Qu, u.toPairs = ro, u.toPairsIn = io, u.toPath = d0, u.toPlainObject = ju, u.transform = pd, u.unary = cg, u.union = up, u.unionBy = op, u.unionWith = cp, u.uniq = lp, u.uniqBy = fp, u.uniqWith = hp, u.unset = gd, u.unzip = is, u.unzipWith = Du, u.update = dd, u.updateWith = _d, u.values = vn, u.valuesIn = vd, u.without = pp, u.words = uo, u.wrap = lg, u.xor = gp, u.xorBy = dp, u.xorWith = _p, u.zip = vp, u.zipObject = mp, u.zipObjectDeep = wp, u.zipWith = yp, u.entries = ro, u.entriesIn = io, u.extend = to, u.extendWith = Dr, gs(u, u), u.add = v0, u.attempt = oo, u.camelCase = Cd, u.capitalize = so, u.ceil = m0, u.clamp = md, u.clone = hg, u.cloneDeep = gg, u.cloneDeepWith = dg, u.cloneWith = pg, u.conformsTo = _g, u.deburr = ao, u.defaultTo = Xd, u.divide = w0, u.endsWith = xd, u.eq = fe, u.escape = Sd, u.escapeRegExp = Ad, u.every = Lp, u.find = Rp, u.findIndex = Lu, u.findKey = Kg, u.findLast = Op, u.findLastIndex = Pu, u.findLastKey = Jg, u.floor = y0, u.forEach = Bu, u.forEachRight = Uu, u.forIn = Zg, u.forInRight = Yg, u.forOwn = Xg, u.forOwnRight = Qg, u.get = cs, u.gt = vg, u.gte = mg, u.has = td, u.hasIn = ls, u.head = Ou, u.identity = Gt, u.includes = Up, u.indexOf = Oh, u.inRange = wd, u.invoke = rd, u.isArguments = tn, u.isArray = H, u.isArrayBuffer = wg, u.isArrayLike = $t, u.isArrayLikeObject = mt, u.isBoolean = yg, u.isBuffer = Ge, u.isDate = Cg, u.isElement = xg, u.isEmpty = Sg, u.isEqual = Ag, u.isEqualWith = bg, u.isError = us, u.isFinite = Eg, u.isFunction = Te, u.isInteger = Ju, u.isLength = Or, u.isMap = Zu, u.isMatch = Ig, u.isMatchWith = Fg, u.isNaN = Tg, u.isNative = Mg, u.isNil = Pg, u.isNull = Lg, u.isNumber = Yu, u.isObject = gt, u.isObjectLike = _t, u.isPlainObject = Nn, u.isRegExp = os, u.isSafeInteger = Rg, u.isSet = Xu, u.isString = kr, u.isSymbol = Zt, u.isTypedArray = _n, u.isUndefined = Og, u.isWeakMap = kg, u.isWeakSet = Dg, u.join = Uh, u.kebabCase = bd, u.last = se, u.lastIndexOf = Nh, u.lowerCase = Ed, u.lowerFirst = Id, u.lt = Wg, u.lte = Bg, u.max = C0, u.maxBy = x0, u.mean = S0, u.meanBy = A0, u.min = b0, u.minBy = E0, u.stubArray = _s, u.stubFalse = vs, u.stubObject = f0, u.stubString = h0, u.stubTrue = p0, u.multiply = I0, u.nth = $h, u.noConflict = r0, u.noop = ds, u.now = Lr, u.pad = Fd, u.padEnd = Td, u.padStart = Md, u.parseInt = Ld, u.random = yd, u.reduce = Hp, u.reduceRight = zp, u.repeat = Pd, u.replace = Rd, u.result = ld, u.round = F0, u.runInContext = g, u.sample = Jp, u.size = Xp, u.snakeCase = Od, u.some = Qp, u.sortedIndex = Zh, u.sortedIndexBy = Yh, u.sortedIndexOf = Xh, u.sortedLastIndex = Qh, u.sortedLastIndexBy = Vh, u.sortedLastIndexOf = jh, u.startCase = Dd, u.startsWith = Wd, u.subtract = T0, u.sum = M0, u.sumBy = L0, u.template = Bd, u.times = g0, u.toFinite = Me, u.toInteger = K, u.toLength = Vu, u.toLower = Ud, u.toNumber = ae, u.toSafeInteger = Ug, u.toString = nt, u.toUpper = Nd, u.trim = $d, u.trimEnd = qd, u.trimStart = Gd, u.truncate = Hd, u.unescape = zd, u.uniqueId = _0, u.upperCase = Kd, u.upperFirst = fs, u.each = Bu, u.eachRight = Uu, u.first = Ou, gs(u, function() {
          var t = {};
          return ve(u, function(e, n) {
            rt.call(u.prototype, n) || (t[n] = e);
          }), t;
        }(), { chain: !1 }), u.VERSION = o, te(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t) {
          u[t].placeholder = u;
        }), te(["drop", "take"], function(t, e) {
          Q.prototype[t] = function(n) {
            n = n === i ? 1 : At(K(n), 0);
            var r = this.__filtered__ && !e ? new Q(this) : this.clone();
            return r.__filtered__ ? r.__takeCount__ = Tt(n, r.__takeCount__) : r.__views__.push({
              size: Tt(n, P),
              type: t + (r.__dir__ < 0 ? "Right" : "")
            }), r;
          }, Q.prototype[t + "Right"] = function(n) {
            return this.reverse()[t](n).reverse();
          };
        }), te(["filter", "map", "takeWhile"], function(t, e) {
          var n = e + 1, r = n == Sn || n == Xr;
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
            return On(n, t, e);
          });
        }), Q.prototype.reject = function(t) {
          return this.filter(Rr(B(t)));
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
            var f = this.__wrapped__, p = r ? [1] : arguments, _ = f instanceof Q, A = p[0], b = _ || H(f), E = function(X) {
              var V = a.apply(u, De([X], p));
              return r && M ? V[0] : V;
            };
            b && n && typeof A == "function" && A.length != 1 && (_ = b = !1);
            var M = this.__chain__, D = !!this.__actions__.length, U = c && !M, J = _ && !D;
            if (!c && b) {
              f = J ? f : new Q(this);
              var N = t.apply(f, p);
              return N.__actions__.push({ func: Tr, args: [E], thisArg: i }), new ne(N, M);
            }
            return U && J ? t.apply(this, p) : (N = this.thru(E), U ? r ? N.value()[0] : N.value() : N);
          });
        }), te(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var e = er[t], n = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", r = /^(?:pop|shift)$/.test(t);
          u.prototype[t] = function() {
            var a = arguments;
            if (r && !this.__chain__) {
              var c = this.value();
              return e.apply(H(c) ? c : [], a);
            }
            return this[n](function(f) {
              return e.apply(H(f) ? f : [], a);
            });
          };
        }), ve(Q.prototype, function(t, e) {
          var n = u[e];
          if (n) {
            var r = n.name + "";
            rt.call(fn, r) || (fn[r] = []), fn[r].push({ name: e, func: n });
          }
        }), fn[xr(i, z).name] = [{
          name: "wrapper",
          func: i
        }], Q.prototype.clone = Hl, Q.prototype.reverse = zl, Q.prototype.value = Kl, u.prototype.at = xp, u.prototype.chain = Sp, u.prototype.commit = Ap, u.prototype.next = bp, u.prototype.plant = Ip, u.prototype.reverse = Fp, u.prototype.toJSON = u.prototype.valueOf = u.prototype.value = Tp, u.prototype.first = u.prototype.head, In && (u.prototype[In] = Ep), u;
      }, on = Sl();
      Ke ? ((Ke.exports = on)._ = on, pi._ = on) : Et._ = on;
    }).call($0);
  }(qn, qn.exports)), qn.exports;
}
var Po = q0();
const Y = /* @__PURE__ */ So(Po);
function Ro(l, s) {
  const i = Y.findLast(s.terrain, (o) => yn(o.percents[0] * s.dist, l.loc, 4));
  return i ? i.value / 100 + 1 : 1;
}
const G0 = [
  "altitude",
  "grade",
  "terrain",
  "heat",
  "dark",
  "fatigue",
  "strategy"
];
function Rs(l) {
  const s = new ye().init(0);
  return l.forEach(({ factors: i, dist: o }) => {
    s.applyEach((h, m) => h + o * m, i);
  }), s.scaleEach(1 / Po.sumBy(l, "dist")), s;
}
function H0(l, s) {
  let i = 0, o = 0;
  return l.forEach((h, m) => {
    const d = m === l.length - 1 ? s : l[m + 1].onset, v = h.type === "linear" ? h.value / 2 : h.value;
    o += (i + v) * (d - h.onset), i += h.value;
  }), o / s;
}
function z0(l) {
  return l < 30 ? 2 : l < 60 ? 5 : l < 90 ? 10 : l < 120 ? 15 : 20;
}
function K0(l, s, i) {
  let o = -H0(s, i);
  return s.forEach((h, m) => {
    if (l >= h.onset) {
      if (h.type === "step")
        o += h.value;
      else if (h.type === "linear") {
        const d = m === s.length - 1 ? i : s[m + 1].onset;
        l > d ? o += h.value : o += h.value * (l - h.onset) / (d - h.onset);
      }
    }
  }), o;
}
class Oo {
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
    return 1 + K0(s, this.values, this.plan.course.dist) / 100;
  }
  addValue(s) {
    const i = this.values.findIndex((o) => o.onset >= s.onset);
    i >= 0 ? this.values.splice(i, 0, s) : this.values.push(s);
  }
}
function Is(l, s) {
  return s === void 0 ? l : (l - 1) * s + 1;
}
function Os(l, s) {
  l.factors || (l.factors = new ye()), Object.assign(l.factors, {
    grade: Mo(l.grade),
    altitude: Ao(l.alt),
    terrain: Ro(l, s)
  });
}
function Gn(l, s) {
  var i, o;
  if (l.factors || (l.factors = new ye()), Os(l, s.course), s) {
    if (l.factors === void 0)
      throw new Error("no factors");
    l.factors.strategy = s.strategy.at(l.loc), Object.assign(l.factors, {
      heat: s.heatModel ? Lo(l, s.heatModel) : 1,
      dark: s.event.sun ? To(l.tod, l.factors.terrain, s.event.sun) : 1
    });
  }
  l.factors.altitude = Is(l.factors.altitude, (i = s.scales) == null ? void 0 : i.altitude), l.factors.dark = Is(l.factors.dark, (o = s.scales) == null ? void 0 : o.dark);
}
const m_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Factors: ye,
  Strategy: Oo,
  applyScale: Is,
  factorKeys: mn,
  generateCourseFactors: Os,
  generatePlanFactors: Gn,
  getAltitudeFactor: Ao,
  getDarkFactor: To,
  getGradeFactor: Mo,
  getHeatFactor: Lo,
  getTerrainFactor: Ro,
  rollup: Rs,
  typeList: G0
}, Symbol.toStringTag, { value: "Module" }));
class ks {
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
class Jr extends ks {
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
    if (Cs(this.source))
      return this.source.loc;
    let i = this.source.loc * this._course.distScale;
    return this.loop && (i += this._course.loopDist * this.loop), i;
  }
}
function Hr(l, s) {
  const i = l.filter((h) => h > 0 && zr(h, s, 4));
  return i.unshift(0), i.map((h, m) => ({ start: h, end: i[m + 1] || s }));
}
function ko(l) {
  switch (l) {
    case "kilometers":
      return 1;
    case "miles":
      return 0.621371;
    default:
      throw new Error("Invalid distance unit");
  }
}
function Nr(l) {
  return typeof l == "number" && !isNaN(l);
}
function J0(l, s, i) {
  l = [...l], s.interpolated && l.splice(l.findIndex((m) => m.loc > s.loc) - 1, 0, s), i.interpolated && l.splice(l.findIndex((m) => m.loc > i.loc) - 1, 0, i);
  const o = l.filter((m, d) => d >= l.findIndex((v) => v === s) && d <= l.findIndex((v) => v === i)), h = o.map((m, d) => ({
    factors: m.factors,
    dist: d === o.length - 1 ? 0 : o[d + 1].loc - o[d].loc
  }));
  return h.pop(), Rs(h);
}
class Do {
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
class Wo extends Do {
  constructor(s, i) {
    super(i), this.point1 = i.point1, this.point2 = i.point2;
  }
}
class Bo extends Do {
  constructor(i, o) {
    super(o);
    I(this, "_plan");
    I(this, "_factors");
    this._plan = i, this.point1 = o.point1, this.point2 = o.point2;
  }
  get pace() {
    return this.time ? this.time / this.dist : 0;
  }
  get delay() {
    return !Nr(this.point1.elapsed) || !Nr(this.point2.elapsed) || !Nr(this.point1.time) || !Nr(this.point2.time) ? 0 : this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time);
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
    return this._factors || (this._factors = J0(this._plan.points, this.point1, this.point2));
  }
}
const xs = ze("CourseSplits");
class Z0 {
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
    const s = this.course.waypoints, i = this.calcSegments(Hr(s.map((o) => o.loc), this.course.dist));
    if (!i.length)
      throw new Error("createSegments result is empty");
    return i.forEach((o, h) => {
      o.waypoint = s[h + 1];
    }), i;
  }
  createSplits(s) {
    xs(`createSplits:${s}`);
    const i = ko(s), o = Y.range(this.course.dist * i).map((m) => m / i);
    this.course.dist - o[o.length - 1] > 1e-4 && o.push(this.course.dist);
    const h = this.calcSegments(Hr(o, this.course.dist));
    if (!h.length)
      throw new Error("createSplits result is empty");
    return h;
  }
  calcSegments(s) {
    var R;
    xs.extend("calcSegments")("exec");
    const o = this.course, h = o.points, m = [], d = [];
    let v, y, x = o.points[0], F;
    for (v = 0, y = s.length; v < y; v++) {
      const k = s[v];
      F && Cn((R = s[v - 1]) == null ? void 0 : R.end, k.start, 4) ? x = F : x = o.getPoint(k.start), F = o.getPoint(k.end);
      const L = k.end - k.start, T = new Wo(this.course, {
        gain: 0,
        loss: 0,
        grade: L > 0 ? (F.alt - x.alt) / L / 10 * (F.alt - x.alt > 0 ? o.gainScale : o.lossScale) : 0,
        point1: x,
        point2: F
      }), W = new ye().init(0);
      m.push(T), d.push(W);
    }
    const w = (k, L, T, W) => {
      const z = T.alt - L.alt;
      k[z > 0 ? "gain" : "loss"] += z * (z > 0 ? o.gainScale : o.lossScale), Os(L, o);
      const tt = T.loc - L.loc;
      W.applyEach((it, vt) => it + vt * tt, L.factors);
    };
    v = 1;
    for (let k = 0; k < m.length; k++) {
      const L = m[k], T = d[k];
      for (; yn(h[v].loc, L.point1.loc, 4); )
        v++;
      let W = L.point1;
      for (; v < h.length && yn(h[v].loc, L.point2.loc, 4); ) {
        const z = h[v];
        w(L, W, z, T), W = z, v++;
      }
      w(L, W, L.point2, T);
    }
    return m;
  }
}
var Qt = 63710088e-1, Uo = {
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
function No(l, s, i = {}) {
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
  if (!vo(l[0]) || !vo(l[1]))
    throw new Error("coordinates must contain numbers");
  return No({
    type: "Point",
    coordinates: l
  }, s, i);
}
function Y0(l, s, i = {}) {
  if (l.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return No({
    type: "LineString",
    coordinates: l
  }, s, i);
}
function X0(l, s = "kilometers") {
  const i = Uo[s];
  if (!i)
    throw new Error(s + " units is invalid");
  return l * i;
}
function Q0(l, s = "kilometers") {
  const i = Uo[s];
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
function vo(l) {
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
function V0(l) {
  return l.type === "Feature" ? l.geometry : l;
}
function $o(l, s, i = {}) {
  if (i.final === !0)
    return j0(l, s);
  const o = Hn(l), h = Hn(s), m = pe(o[0]), d = pe(h[0]), v = pe(o[1]), y = pe(h[1]), x = Math.sin(d - m) * Math.cos(y), F = Math.cos(v) * Math.sin(y) - Math.sin(v) * Math.cos(y) * Math.cos(d - m);
  return Ts(Math.atan2(x, F));
}
function j0(l, s) {
  let i = $o(s, l);
  return i = (i + 180) % 360, i;
}
function t_(l, s, i, o = {}) {
  const h = Hn(l), m = pe(h[0]), d = pe(h[1]), v = pe(i), y = Q0(s, o.units), x = Math.asin(
    Math.sin(d) * Math.cos(y) + Math.cos(d) * Math.sin(y) * Math.cos(v)
  ), F = m + Math.atan2(
    Math.sin(v) * Math.sin(y) * Math.cos(d),
    Math.cos(y) - Math.sin(d) * Math.sin(x)
  ), w = Ts(F), R = Ts(x);
  return Fs([w, R], o.properties);
}
function qo(l, s, i = {}) {
  var o = Hn(l), h = Hn(s), m = pe(h[1] - o[1]), d = pe(h[0] - o[0]), v = pe(o[1]), y = pe(h[1]), x = Math.pow(Math.sin(m / 2), 2) + Math.pow(Math.sin(d / 2), 2) * Math.cos(v) * Math.cos(y);
  return X0(
    2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)),
    i.units
  );
}
function e_(l, s, i = {}) {
  const h = V0(l).coordinates;
  let m = 0;
  for (let d = 0; d < h.length && !(s >= m && d === h.length - 1); d++)
    if (m >= s) {
      const v = s - m;
      if (v) {
        const y = $o(h[d], h[d - 1]) - 180;
        return t_(
          h[d],
          v,
          y,
          i
        );
      } else
        return Fs(h[d]);
    } else
      m += qo(h[d], h[d + 1], i);
  return Fs(h[h.length - 1]);
}
function Go(l, s, i) {
  if (l.loc > s.loc && i > l.loc || s.loc > l.loc && i > s.loc)
    throw new Error("Input location must be between points");
  const o = Y0([
    [l.lon, l.lat],
    [s.lon, s.lat]
  ]), h = e_(o, i - l.loc), m = l.grade, d = wn(l.loc, s.loc, l.alt, s.alt, i);
  return new Jr({ lon: h.geometry.coordinates[0], lat: h.geometry.coordinates[1], alt: d }, i, m);
}
class Ms {
  constructor(s, i = 1) {
    I(this, "_data");
    I(this, "loop");
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
    if (!Y.isNumber(s))
      throw new Error("Wrong format for Waypoint.loc");
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
    return this.isStart || this.isFinish ? !1 : this.site.hasDelay;
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
const mo = ze("models:Waypoint");
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
    return this._cache.alt ?? this.refreshLLA().alt;
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
    return this._cache.lat ?? this.refreshLLA().lat;
  }
  get lon() {
    return this._cache.lon ?? this.refreshLLA().lon;
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
    return this._cache.waypoints ? this._cache.waypoints : (mo(`generating waypoints array: ${this.name}`), this.isFinish ? this._cache.waypoints = [new Ms(this, this.course.loops)] : this._cache.waypoints = Y.range(this.course.loops).map((s) => new Ms(this, s + 1)), this._cache.waypoints);
  }
  refreshLLA() {
    mo("refreshLLA");
    let s, i, o;
    return this.isStart ? { lat: s, lon: i, alt: o } = this.course.track.points[0] : this.isFinish ? { lat: s, lon: i, alt: o } = this.course.track.points[this.course.track.points.length - 1] : { lat: s, lon: i, alt: o } = this.course.track.getLLA(this.percent * this.course.track.dist), this._cache.lat = s, this._cache.lon = i, this._cache.alt = o, { lat: s, lon: i, alt: o };
  }
}
const $n = ze("models:Course"), Ho = [
  { type: "paved", value: 0 },
  { type: "dirt road", value: 4 },
  { type: "doubletrack", value: 8 },
  { type: "singletrack", value: 15 },
  { type: "technical", value: 30 }
];
class n_ {
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
    $n("constructor"), this.track = s, this._data = i, this.version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  /**
   * Course cutoffs
   */
  get cutoffs() {
    return this.cache.cutoffs ?? (this.cache.cutoffs = this.waypoints.filter((s) => s.cutoff).map((s) => new zo(s)));
  }
  /**
   * Total distance of course (in km)
   */
  get dist() {
    return this.cache.dist ?? (this.cache.dist = this._data.dist || this.track.dist * this.loops);
  }
  /**
   * Distance scale of course (in km), relative to calculated track distance
   */
  get distScale() {
    return this._data.dist ? this._data.dist / (this.track.dist * this.loops) : 1;
  }
  get gain() {
    return this.cache.gain ?? (this.cache.gain = this._data.gain || this.track.gain * this.loops);
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
    return this.cache.loss ?? (this.cache.loss = this._data.loss || this.track.loss * this.loops);
  }
  get lossScale() {
    return this._data.loss ? this._data.loss / (this.track.loss * this.loops) : 1;
  }
  get points() {
    if (this.cache.points)
      return this.cache.points;
    $n("generating points array"), this.cache.points = new Array(this.track.points.length * this.loops);
    for (let s = 0; s < this.loops; s++)
      for (let i = 0; i < this.track.points.length; i++)
        this.points[i + s * this.track.points.length] = new Gr(this, this.track.points[i], s);
    return this.cache.points;
  }
  get sites() {
    var s;
    if (this.cache.sites)
      return this.cache.sites;
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
    return this.cache.splits ?? (this.cache.splits = new Z0(this));
  }
  get stats() {
    if (this.cache.stats)
      return this.cache.stats;
    $n("stats:calculate");
    const s = this.track.points.map((d) => d.alt), i = this.track.points.map((d) => d.grade), o = this.terrain.map((d) => d.value / 100 + 1), h = {
      altitude: {
        avg: Y.sum(this.track.points.map((d, v) => {
          var y;
          return d.alt * (d.loc - (((y = this.track.points[v - 1]) == null ? void 0 : y.loc) || 0));
        })) / this.track.dist,
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
    }, m = (d) => this.terrain.reduce((v, y) => y.value / 100 + 1 === d ? v + (y.percents[1] - y.percents[0]) * this.dist : v, 0);
    return Object.assign(h.terrain, {
      maxDist: m(h.terrain.max),
      minDist: m(h.terrain.min)
    }), this.cache.stats = h, h;
  }
  get terrain() {
    if (this.cache.terrain)
      return this.cache.terrain;
    if (this._data.terrain) {
      const s = [...this._data.terrain];
      s.sort((i, o) => i.percent - o.percent), this.cache.terrain = s.map((i, o) => {
        var v, y;
        const h = Y.isNumber(i.value) ? i.value : Y.isString(i.value) ? ((v = Ho.find((x) => x.type === i.value)) == null ? void 0 : v.value) || 0 : i.value.value, m = typeof i == "string" ? i : Y.isObject(i.value) ? i.value.type : void 0;
        return {
          value: h,
          type: m,
          percents: [i.percent, ((y = s[o + 1]) == null ? void 0 : y.percent) || 1]
        };
      });
    } else
      this.cache.terrain = [];
    return this.cache.terrain;
  }
  get waypoints() {
    var i;
    if (this.cache.waypoints)
      return this.cache.waypoints;
    if (!((i = this.track) != null && i.dist))
      return [];
    let s = [];
    return this.sites.forEach((o) => {
      s.push(...o.waypoints);
    }), s = s.sort((o, h) => o.loc - h.loc), this.cache.waypoints = s, this.cache.waypoints;
  }
  update(s) {
    $n("update"), Object.assign(this._data, s), this.version++;
  }
  /**
   * Finds or creates a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns The CoursePoint at input location.
   */
  getPoint(s) {
    const i = this.points.findIndex((y) => Kr(y.loc, s, 4)), o = this.points[i];
    if (Cn(o.loc, s, 4))
      return o;
    $n(`getPoint: creating new CoursePoint at ${s}`);
    const h = i - 1, m = this.points[h], d = Go(m.source, o.source, s % this.loopDist / this.distScale), v = new Gr(this, d, Math.floor(s / this.loopDist));
    return v.interpolated = !0, v;
  }
  locationsToBreaks(s) {
    const i = s.filter((h) => h > 0 && zr(h, this.dist, 4));
    return i.unshift(0), i.map((h, m) => ({ start: h, end: i[m + 1] || this.dist }));
  }
}
class zo {
  constructor(s) {
    I(this, "waypoint");
    this.waypoint = s;
  }
  get loc() {
    return this.waypoint.loc;
  }
  get time() {
    if (!this.waypoint.cutoff)
      throw new Error("Invalid cutoff");
    return this.waypoint.cutoff;
  }
}
var Ss = { exports: {} }, wo;
function r_() {
  return wo || (wo = 1, function(l, s) {
    (function() {
      var i = Math.PI, o = Math.sin, h = Math.cos, m = Math.tan, d = Math.asin, v = Math.atan2, y = Math.acos, x = i / 180, F = 1e3 * 60 * 60 * 24, w = 2440588, R = 2451545;
      function k(P) {
        return P.valueOf() / F - 0.5 + w;
      }
      function L(P) {
        return new Date((P + 0.5 - w) * F);
      }
      function T(P) {
        return k(P) - R;
      }
      var W = x * 23.4397;
      function z(P, $) {
        return v(o(P) * h(W) - m($) * o(W), h(P));
      }
      function tt(P, $) {
        return d(o($) * h(W) + h($) * o(W) * o(P));
      }
      function it(P, $, q) {
        return v(o(P), h(P) * o($) - m(q) * h($));
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
          ra: z(q, 0)
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
      var xn = Lt.times = [
        [-0.833, "sunrise", "sunset"],
        [-0.3, "sunriseEnd", "sunsetStart"],
        [-6, "dawn", "dusk"],
        [-12, "nauticalDawn", "nauticalDusk"],
        [-18, "nightEnd", "night"],
        [6, "goldenHourEnd", "goldenHour"]
      ];
      Lt.addTime = function(P, $, q) {
        xn.push([P, $, q]);
      };
      var zn = 9e-4;
      function Yr(P, $) {
        return Math.round(P - zn - $ / (2 * i));
      }
      function Sn(P, $, q) {
        return zn + (P + $) / (2 * i) + q;
      }
      function Kn(P, $, q) {
        return R + P + 53e-4 * o($) - 69e-4 * o(2 * q);
      }
      function Xr(P, $, q) {
        return y((o(P) - o($) * o(q)) / (h($) * h(q)));
      }
      function en(P) {
        return -2.076 * Math.sqrt(P) / 60;
      }
      function Re(P, $, q, lt, j, ft, at) {
        var ot = Xr(P, q, lt), yt = Sn(ot, $, j);
        return Kn(yt, ft, at);
      }
      Lt.getTimes = function(P, $, q, lt) {
        lt = lt || 0;
        var j = x * -q, ft = x * $, at = en(lt), ot = T(P), yt = Yr(ot, j), Ht = Sn(0, j, yt), Pt = Ft(Ht), Bt = ge(Pt), de = tt(Bt, 0), dt = Kn(Ht, Pt, Bt), Rt, Oe, Ct, Ut, oe, Vt, ht = {
          solarNoon: L(dt),
          nadir: L(dt - 0.5)
        };
        for (Rt = 0, Oe = xn.length; Rt < Oe; Rt += 1)
          Ct = xn[Rt], Ut = (Ct[0] + at) * x, oe = Re(Ut, j, ft, de, yt, Pt, Bt), Vt = dt - (oe - dt), ht[Ct[1]] = L(Vt), ht[Ct[2]] = L(oe);
        return ht;
      };
      function Jn(P) {
        var $ = x * (218.316 + 13.176396 * P), q = x * (134.963 + 13.064993 * P), lt = x * (93.272 + 13.22935 * P), j = $ + x * 6.289 * o(q), ft = x * 5.128 * o(lt), at = 385001 - 20905 * h(q);
        return {
          ra: z(j, ft),
          dec: tt(j, ft),
          dist: at
        };
      }
      Lt.getMoonPosition = function(P, $, q) {
        var lt = x * -q, j = x * $, ft = T(P), at = Jn(ft), ot = xt(ft, lt) - at.ra, yt = vt(ot, j, at.dec), Ht = v(o(ot), m(j) * h(at.dec) - o(at.dec) * h(ot));
        return yt = yt + Pe(yt), {
          azimuth: it(ot, j, at.dec),
          altitude: yt,
          distance: at.dist,
          parallacticAngle: Ht
        };
      }, Lt.getMoonIllumination = function(P) {
        var $ = T(P || /* @__PURE__ */ new Date()), q = Ce($), lt = Jn($), j = 149598e3, ft = y(o(q.dec) * o(lt.dec) + h(q.dec) * h(lt.dec) * h(q.ra - lt.ra)), at = v(j * o(ft), lt.dist - j * h(ft)), ot = v(h(q.dec) * o(q.ra - lt.ra), o(q.dec) * h(lt.dec) - h(q.dec) * o(lt.dec) * h(q.ra - lt.ra));
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
        for (var ft = 0.133 * x, at = Lt.getMoonPosition(j, $, q).altitude - ft, ot, yt, Ht, Pt, Bt, de, dt, Rt, Oe, Ct, Ut, oe, Vt, ht = 1; ht <= 24 && (ot = Lt.getMoonPosition(xe(j, ht), $, q).altitude - ft, yt = Lt.getMoonPosition(xe(j, ht + 1), $, q).altitude - ft, Bt = (at + yt) / 2 - ot, de = (yt - at) / 2, dt = -de / (2 * Bt), Rt = (Bt * dt + de) * dt + ot, Oe = de * de - 4 * Bt * ot, Ct = 0, Oe >= 0 && (Vt = Math.sqrt(Oe) / (Math.abs(Bt) * 2), Ut = dt - Vt, oe = dt + Vt, Math.abs(Ut) <= 1 && Ct++, Math.abs(oe) <= 1 && Ct++, Ut < -1 && (Ut = oe)), Ct === 1 ? at < 0 ? Ht = ht + Ut : Pt = ht + Ut : Ct === 2 && (Ht = ht + (Rt < 0 ? oe : Ut), Pt = ht + (Rt < 0 ? Ut : oe)), !(Ht && Pt)); ht += 2)
          at = yt;
        var _e = {};
        return Ht && (_e.rise = xe(j, Ht)), Pt && (_e.set = xe(j, Pt)), !Ht && !Pt && (_e[Rt > 0 ? "alwaysUp" : "alwaysDown"] = !0), _e;
      }, l.exports = Lt;
    })();
  }(Ss)), Ss.exports;
}
var yo = r_();
function Ls(l, s) {
  const i = l.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: s
  }).split(":").map((o) => Number(o));
  return i[0] * 60 * 60 + i[1] * 60 + i[2];
}
class i_ {
  constructor(s) {
    I(this, "nadir");
    I(this, "dawn");
    I(this, "sunrise");
    I(this, "dusk");
    I(this, "sunset");
    I(this, "noon");
    this.nadir = s.nadir, this.dawn = s.dawn, this.sunrise = s.sunrise, this.dusk = s.dusk, this.sunset = s.sunset, this.noon = s.noon;
  }
}
class Ko {
  constructor(s, i, o, h) {
    I(this, "start");
    I(this, "lat");
    I(this, "lon");
    I(this, "timezone");
    I(this, "sun");
    I(this, "startTime");
    this.start = s, this.lat = o, this.lon = h, this.timezone = i;
    const m = yo.getTimes(this.start, this.lat, this.lon), d = (y) => ({
      altitude: yo.getPosition(y, this.lat, this.lon).altitude * 180 / Math.PI,
      time: Ls(y, this.timezone)
    }), v = (y) => y.getTime() > 0 ? d(y) : null;
    this.sun = new i_({
      nadir: d(m.nadir),
      dawn: v(m.dawn),
      sunrise: v(m.sunrise),
      sunset: v(m.sunset),
      dusk: v(m.dusk),
      noon: d(m.solarNoon)
    }), this.startTime = Ls(this.start, this.timezone);
  }
  dateAtElapsed(s) {
    const i = new Date(this.start);
    return i.setTime(i.getTime() + s * 1e3), i;
  }
  elapsedToTimeOfDay(s) {
    return (this.startTime + s) % 86400;
  }
}
var As = {}, Co;
function s_() {
  return Co || (Co = 1, function(l) {
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
      function i(v) {
        return h(d(v), arguments);
      }
      function o(v, y) {
        return i.apply(null, [v].concat(y || []));
      }
      function h(v, y) {
        var x = 1, F = v.length, w, R = "", k, L, T, W, z, tt, it, vt;
        for (k = 0; k < F; k++)
          if (typeof v[k] == "string")
            R += v[k];
          else if (typeof v[k] == "object") {
            if (T = v[k], T.keys)
              for (w = y[x], L = 0; L < T.keys.length; L++) {
                if (w == null)
                  throw new Error(i('[sprintf] Cannot access property "%s" of undefined value "%s"', T.keys[L], T.keys[L - 1]));
                w = w[T.keys[L]];
              }
            else T.param_no ? w = y[T.param_no] : w = y[x++];
            if (s.not_type.test(T.type) && s.not_primitive.test(T.type) && w instanceof Function && (w = w()), s.numeric_arg.test(T.type) && typeof w != "number" && isNaN(w))
              throw new TypeError(i("[sprintf] expecting number but found %T", w));
            switch (s.number.test(T.type) && (it = w >= 0), T.type) {
              case "b":
                w = parseInt(w, 10).toString(2);
                break;
              case "c":
                w = String.fromCharCode(parseInt(w, 10));
                break;
              case "d":
              case "i":
                w = parseInt(w, 10);
                break;
              case "j":
                w = JSON.stringify(w, null, T.width ? parseInt(T.width) : 0);
                break;
              case "e":
                w = T.precision ? parseFloat(w).toExponential(T.precision) : parseFloat(w).toExponential();
                break;
              case "f":
                w = T.precision ? parseFloat(w).toFixed(T.precision) : parseFloat(w);
                break;
              case "g":
                w = T.precision ? String(Number(w.toPrecision(T.precision))) : parseFloat(w);
                break;
              case "o":
                w = (parseInt(w, 10) >>> 0).toString(8);
                break;
              case "s":
                w = String(w), w = T.precision ? w.substring(0, T.precision) : w;
                break;
              case "t":
                w = String(!!w), w = T.precision ? w.substring(0, T.precision) : w;
                break;
              case "T":
                w = Object.prototype.toString.call(w).slice(8, -1).toLowerCase(), w = T.precision ? w.substring(0, T.precision) : w;
                break;
              case "u":
                w = parseInt(w, 10) >>> 0;
                break;
              case "v":
                w = w.valueOf(), w = T.precision ? w.substring(0, T.precision) : w;
                break;
              case "x":
                w = (parseInt(w, 10) >>> 0).toString(16);
                break;
              case "X":
                w = (parseInt(w, 10) >>> 0).toString(16).toUpperCase();
                break;
            }
            s.json.test(T.type) ? R += w : (s.number.test(T.type) && (!it || T.sign) ? (vt = it ? "+" : "-", w = w.toString().replace(s.sign, "")) : vt = "", z = T.pad_char ? T.pad_char === "0" ? "0" : T.pad_char.charAt(1) : " ", tt = T.width - (vt + w).length, W = T.width && tt > 0 ? z.repeat(tt) : "", R += T.align ? vt + w + W : z === "0" ? vt + W + w : W + vt + w);
          }
        return R;
      }
      var m = /* @__PURE__ */ Object.create(null);
      function d(v) {
        if (m[v])
          return m[v];
        for (var y = v, x, F = [], w = 0; y; ) {
          if ((x = s.text.exec(y)) !== null)
            F.push(x[0]);
          else if ((x = s.modulo.exec(y)) !== null)
            F.push("%");
          else if ((x = s.placeholder.exec(y)) !== null) {
            if (x[2]) {
              w |= 1;
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
              w |= 2;
            if (w === 3)
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
          y = y.substring(x[0].length);
        }
        return m[v] = F;
      }
      l.sprintf = i, l.vsprintf = o, typeof window < "u" && (window.sprintf = i, window.vsprintf = o);
    })();
  }(As)), As;
}
var Jo = s_();
const a_ = ze("PaceChunk");
class u_ {
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
class xo {
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
    let i = s[0].elapsed, o = s[0].delay || 0, h = 0, m = 0, d = 0;
    const v = this.factor ? this.np : this.plan.pacing.pace, y = new ye().init(0);
    for (let x = 1, F = s.length; x < F; x++) {
      h = s[x].loc - s[x - 1].loc, Gn(s[x - 1], this.plan), y.applyEach((R, k) => R + k * h, s[x - 1].factors);
      const w = s[x - 1].factors.combined;
      d += w * h, m = v * w * h, s[x].time = s[x - 1].time + m, o = s[x - 1].delay || 0, i += m + o, s[x].elapsed = i, this.plan.event.start && (s[x].tod = this.plan.event.elapsedToTimeOfDay(i));
    }
    Gn(s[s.length - 1], this.plan), this.factors = y.scaleEach(1 / this.dist), this.factor = d / this.dist;
  }
  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const o = a_.extend(Jo.vsprintf("calculate:%.2f-%.2f", [this.points[0].loc, this.points[this.points.length - 1].loc]));
    let h = this.factor || 0, m, d;
    const v = new u_();
    for (d = 1; d <= 30; d++)
      if (this.applyPacing(), v.iterations = d >= 2, v.factor = !Y.round(h - this.factor, d === 30 ? 6 : 8), h = this.factor, v.target = Math.abs((Y.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - this.points[this.points.length - 1].elapsed) < 0.1, v.points = m && this.points.every((x, F) => Cn(x.elapsed, m[F], 0)) || !1, m = this.points.map((x) => x.elapsed), v.passing) {
        o(`iteration ${d} complete, passed`);
        break;
      } else
        o(`iteration ${d} complete, failed ${Object.keys(v).filter((x) => !v[x]).join("|")}`);
    o("chunk complete");
    const y = v.passing ? void 0 : `failed tests ${Object.keys(v).filter((x) => !v[x]).map((x) => `"${x}"`).join(",")} after ${d} iterations`;
    this.status = {
      errorMessage: y,
      tests: v,
      success: v.passing,
      iterations: d
    };
  }
}
const ue = ze("Pacing");
class Zo {
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
    return ue("factors:get"), this._factors || (ue("factors:update"), this._factors = Rs(this.chunks)), this._factors;
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
        var m;
        return !((m = h.status) != null && m.success);
      }).length) === 0,
      chunks: this.chunks.length,
      iterations: this.chunks.map((h) => {
        var m;
        return ((m = h.status) == null ? void 0 : m.iterations) || 0;
      })
    };
    return s.success || (s.errorMessage = this.chunks.filter((h) => {
      var m;
      return h.status && !((m = h.status) != null && m.success);
    }).map((h, m) => `Chunk ${m + 1}: ${h.status.errorMessage}`).join(" | ")), s;
  }
  calculate() {
    var o, h, m;
    const s = ue.extend("calculate");
    for (s("exec"), s("clearing cache"), this.clearCache(); this.plan.points.find((d) => d.interpolated); ) {
      const d = this.plan.points.findIndex((v) => v.interpolated);
      this.plan.points.splice(d, 1);
    }
    for (s("adding points at each terrain factor break"), (o = this.plan.course.terrain) == null || o.forEach((d) => this.plan.getPoint(d.percents[0] * this.plan.course.dist, !0)), s("adding points at each cutoff"), this.plan.cutoffMargin && ((h = this.plan.cutoffs) == null || h.forEach((d) => {
      this.plan.getPoint(d.loc, !0);
    })), this.plan.points.filter((d) => d.delay).forEach((d) => {
      d.delay = 0;
    }), (m = this.plan.delays) == null || m.forEach((d) => {
      const v = this.plan.getPoint(d.loc, !0);
      v.delay = d.delay;
    }), s("creating pace chunks"), this.initChunks(), [null, ...Y.reverse([...this.plan.cutoffs || []]), null].forEach((d) => {
      for (; this.chunks.find((y) => !y.status); )
        this.calcChunks(), this.validateChunks();
      if (!d)
        return;
      const v = this.plan.getPoint(d.loc);
      if (v.elapsed - d.time > 0.5) {
        s(`cutoff at ${d.loc} missed`);
        const y = this.chunks[0];
        Y.last(y.points) === v ? (s(`setting cutoff at ${d.loc}`), y.constraints = [0, d.time], delete y.status) : this.splitChunk(y, v, d.time);
      }
    }), Y.isFunction(this.chunks[this.chunks.length - 1].constraints[1]) && this.chunks.length > 2 && (s("rerunning last chunk"), this.chunks[this.chunks.length - 1].calculate()), ue(`pacing status=${this.status.success ? "PASS" : "FAIL"}.`); this.plan.points.find((d) => d.interpolated); ) {
      const d = this.plan.points.findIndex((v) => v.interpolated);
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
    this.chunks = [new xo(this.plan, this.plan.points, [0, s], this.plan.delay)], this.plan.points.forEach((i) => {
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
    const m = s.points.findIndex((y) => y === i), d = Y.round(i.elapsed - i.time), v = new xo(this.plan, s.points.slice(0, m + 1), [0, o], d);
    v.points.filter((y, x) => x < v.points.length - 1).forEach((y) => {
      y._chunk = v;
    }), this.chunks.unshift(v), s.constraints[0] = o, s.delay -= d, s.points = s.points.slice(m), delete s.status;
  }
  /**
   * merge two sequential chunks together, mutates chunks array
   * @param a - first chunk
   * @param b - second chunk
   */
  mergeChunks(s, i) {
    const o = this.chunks.findIndex((m) => m === s), h = this.chunks.findIndex((m) => m === i);
    if (h - o !== 1)
      throw new Error("chunks must be sequential");
    ue(Jo.sprintf("calcChunks: merging %i&%i (%.2f&%.2f)", o, h, s.np, i.np)), s.points.pop(), s.points.push(...i.points), s.delay += i.delay, delete s.status, s.points.forEach((m) => {
      m._chunk = s;
    }), s.constraints = [s.constraints[0], i.constraints[1]], this.chunks.splice(h, 1), s.calculate();
  }
}
class Ps extends Gr {
  constructor(i, o) {
    super(i.course, o, o.loop);
    I(this, "_chunk");
    I(this, "delay", 0);
    I(this, "elapsed", 0);
    I(this, "factors", new ye());
    I(this, "time", 0);
    I(this, "tod", 0);
    this.source = o;
  }
  get factor() {
    var i;
    return (i = this.factors) == null ? void 0 : i.combined;
  }
  get np() {
    var i;
    if (!this._chunk)
      throw new Error("PlanPoint._chunk not defined");
    return (i = this._chunk) == null ? void 0 : i.np;
  }
  get pace() {
    return this.np * this.factor;
  }
}
const bs = ze("PlanSplits");
class o_ {
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
    bs("createSegments");
    const s = this.plan.course.waypoints, i = this.calcSegments(Hr(s.map((o) => o.loc), this.plan.course.dist));
    if (!i.length)
      throw new Error("createSegments result is empty");
    return i.forEach((o, h) => {
      o.waypoint = s[h + 1];
    }), i;
  }
  createSplits(s) {
    bs(`createSplits:${s}`);
    const i = ko(s), o = Y.range(this.plan.course.dist * i).map((m) => m / i);
    this.plan.course.dist - o[o.length - 1] > 1e-4 && o.push(this.plan.course.dist);
    const h = this.calcSegments(Hr(o, this.plan.course.dist));
    if (!h.length)
      throw new Error("createSplits result is empty");
    return h;
  }
  calcSegments(s) {
    var k;
    bs.extend("calcSegments")("exec"), this.plan.checkPacing();
    const o = this.plan, h = o.course, m = o.points, d = [], v = [];
    let y, x, F = o.points[0], w;
    for (y = 0, x = s.length; y < x; y++) {
      const L = s[y];
      w && Cn((k = s[y - 1]) == null ? void 0 : k.end, L.start, 4) ? F = w : F = o.getPoint(L.start), w = o.getPoint(L.end);
      const T = L.end - L.start, W = new Bo(this.plan, {
        gain: 0,
        loss: 0,
        grade: T > 0 ? (w.alt - F.alt) / T / 10 * (w.alt - F.alt > 0 ? h.gainScale : h.lossScale) : 0,
        point1: F,
        point2: w
      }), z = new ye().init(0);
      d.push(W), v.push(z);
    }
    const R = (L, T, W, z) => {
      const tt = W.alt - T.alt;
      L[tt > 0 ? "gain" : "loss"] += tt * (tt > 0 ? h.gainScale : h.lossScale), Gn(T, o);
      const it = W.loc - T.loc;
      z.applyEach((vt, xt) => vt + xt * it, T.factors);
    };
    y = 1;
    for (let L = 0; L < d.length; L++) {
      const T = d[L], W = v[L];
      for (; yn(m[y].loc, T.point1.loc, 4); )
        y++;
      let z = T.point1;
      for (; y < m.length && yn(m[y].loc, T.point2.loc, 4); ) {
        const tt = m[y];
        R(T, z, tt, W), z = tt, y++;
      }
      R(T, z, T.point2, W), o && (T.delay = o.delays.filter((tt) => Kr(T.point1.loc, tt.loc, 4) && zr(T.point2.loc, tt.loc, 4)).reduce((tt, it) => tt + it.delay, 0));
    }
    return d;
  }
}
const He = ze("models:Plan");
class c_ {
  constructor(s, i) {
    I(this, "_cache", {});
    I(this, "_data");
    I(this, "course");
    I(this, "pacing", new Zo(this));
    I(this, "points");
    I(this, "splits", new o_(this));
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    I(this, "_version", 0);
    if (this.course = s, this._data = i, i.delays) {
      const o = s.sites.map((m) => m.id), h = i.delays.find((m) => !o.includes(m.siteId));
      if (h)
        throw console.error(`Site in plan delays is not in course sites (${String(h.siteId)})`), new Error("Site in plan delays is not in course sites.");
    }
    this.points = this.course.points.map((o) => new Ps(this, o)), this._version = 1;
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
    if (this.cache.cutoffs)
      return this.cache.cutoffs;
    this.cache.cutoffs = this.cutoffMargin ? ((i = this.course.cutoffs) == null ? void 0 : i.map((o) => new f_(this, o, this.getPoint(o.loc, !0)))) || [] : [];
    let s = 0;
    for (; this.cache.cutoffs.length - 1 >= s; ) {
      const o = this.cache.cutoffs[s];
      this.cache.cutoffs.find((h, m) => m > s && h.time <= o.time) ? (He(`get cutoffs: deleting extraneous cutoff at ${o.loc} km`), this.cache.cutoffs.splice(s, 1)) : s++;
    }
    return this.cache.cutoffs;
  }
  get delay() {
    return Y.sumBy(this.delays, "delay");
  }
  get delays() {
    if (this.cache.delays)
      return this.cache.delays;
    const s = this.course.waypoints.map((o) => {
      var d;
      const h = (d = this._data.delays) == null ? void 0 : d.find((v) => v.loop === o.loop && v.siteId === o.site.id), m = h ? h.delay : o.hasDelay ? this.typicalDelay : 0;
      return new l_(o, m);
    }).filter((o) => o.delay > 0).sort((o, h) => o.loc - h.loc);
    let i = 0;
    for (; s.length - 1 >= i; )
      i > 0 && s[i].loc === s[i - 1].loc ? (He(`get delays: merging delay at ${s[i].loc} km`), s[i - 1].delay += s[i].delay, s.splice(i, 1)) : i++;
    return this.cache.delays = s, this.cache.delays;
  }
  get event() {
    if (this.cache.event)
      return this.cache.event;
    if (this._data.start)
      return this.cache.event = new Ko(this._data.start.date, this._data.start.timezone, this.points[0].lat, this.points[0].lon);
    throw new Error("Start date/timezone is required for either the plan or the course");
  }
  get events() {
    if (this.cache.events)
      return this.cache.events;
    He("calculating events.sun");
    const s = [], i = this.event.elapsedToTimeOfDay(0), o = Math.ceil((i + this.points[this.points.length - 1].elapsed) / 86400), h = ["nadir", "dawn", "sunrise", "noon", "sunset", "dusk"].filter((v) => this.event.sun[v] !== null).map((v) => ({ event: v, time: this.event.sun[v].time }));
    for (let v = 0; v < o; v++)
      h.forEach((y) => {
        const x = y.time - i + 86400 * v;
        x >= 0 && x <= this.points[this.points.length - 1].elapsed && s.push({ event: y.event, elapsed: x });
      });
    s.sort((v, y) => v.elapsed - y.elapsed);
    const m = bo(this.points.map((v) => v.elapsed), this.points.map((v) => v.loc), s.map((v) => v.elapsed)), d = s.map((v, y) => ({ ...v, loc: m[y] }));
    return this.cache.events = { sun: d }, this.cache.events;
  }
  get heatModel() {
    return "heatModel" in this.cache ? this.cache.heatModel : this._data.heatModel ? this.cache.heatModel = {
      start: this.event.sun.sunrise ? this.event.sun.sunrise.time + 1800 : 0,
      stop: this.event.sun.sunset ? this.event.sun.sunset.time + 7200 : 86400,
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
    if (this.cache.stats)
      return this.cache.stats;
    He("calculating stats.factors");
    const s = Y.fromPairs(mn.map((m) => {
      const d = this.points.map((v) => v.factors[m]);
      return [
        m,
        {
          min: Number(Y.min(d)),
          max: Number(Y.max(d))
        }
      ];
    }));
    He("calculating stats.sun");
    const i = {
      day: { time: 0, dist: 0 },
      twilight: { time: 0, dist: 0 },
      dark: { time: 0, dist: 0 }
    };
    let o = 0, h = 0;
    return this.points.forEach((m, d) => {
      var y, x;
      o = m.loc - (((y = this.points[d - 1]) == null ? void 0 : y.loc) || 0), h = m.elapsed - (((x = this.points[d - 1]) == null ? void 0 : x.elapsed) || 0);
      const v = Fo(this.event.sun, m.tod);
      v === 1 ? (i.dark.time += h, i.dark.dist += o) : v > 0 ? (i.twilight.time += h, i.twilight.dist += o) : (i.day.time += h, i.day.dist += o);
    }), this.cache.stats = { factors: s, sun: i }, this.cache.stats;
  }
  get strategy() {
    return this.cache.strategy ?? (this.cache.strategy = new Oo(this, this._data.strategy));
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
    if (He("checkPacing"), (!((s = this.pacing.status) != null && s.complete) || !this.pacing.isCurrent) && (He("checkPacing: calculate"), this.pacing.calculate()), !((i = this.points) != null && i.length))
      throw new Error("No plan points");
    return !0;
  }
  getDelayAtWaypoint(s) {
    var i;
    return ((i = this.delays.find((o) => o.waypoint === s)) == null ? void 0 : i.delay) || 0;
  }
  getPoint(s, i = !1) {
    const o = this.points.findIndex((y) => Kr(y.loc, s, 4)), h = this.points[o];
    if (Cn(h.loc, s, 4))
      return h;
    He(`getPoint: ${i ? "inserting" : "creating"} new PlanPoint at ${s}`);
    const m = o - 1, d = this.points[m], v = new Ps(this, this.course.getPoint(s));
    return v.delay = Math.round(h.elapsed - d.elapsed - (h.time - d.time)), v.time = wn(d.loc, h.loc, d.time, h.time, v.loc), v.elapsed = d.elapsed + d.delay + (v.time - d.time), v.tod = this.event.elapsedToTimeOfDay(v.elapsed), Gn(v, this), i && this.points.splice(o, 0, v), v;
  }
  update(s) {
    const o = ["target", "method"].find((h) => h in s && Y.isNil(s[h]));
    if (o)
      throw new Error(`Plan.${o} cannot be set to null or undefined`);
    Object.assign(this._data, s), this._version++;
  }
}
class l_ {
  constructor(s, i) {
    I(this, "delay");
    I(this, "waypoint");
    this.waypoint = s, this.delay = i;
  }
  get loc() {
    return this.waypoint.loc;
  }
}
class f_ {
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
const Yo = (l, s, i, o) => {
  const h = Io(l, s, i, o), m = [];
  return i.forEach((d, v) => {
    let y = h[v][0] / 10;
    y > 50 ? y = 50 : y < -50 && (y = -50);
    const x = d * h[v][0] + h[v][1];
    m.push({
      grade: y,
      alt: x
    });
  }), m;
};
function h_(l, s) {
  return Yo(s, l.map((o) => o.alt), s, 0.05).map((o) => o.grade);
}
const p_ = (l) => {
  let s = 0, i = 0;
  const o = [0];
  for (let h = 1, m = l.length; h < m; h++)
    s = qo([l[h - 1].lon, l[h - 1].lat], [l[h].lon, l[h].lat]), i += s, o.push(i);
  return o;
}, $r = ze("models:Track");
class Zr {
  constructor(s) {
    I(this, "dist");
    I(this, "gain");
    I(this, "loss");
    I(this, "points");
    $r("Creating new Track object");
    const i = s.map((x) => new ks(x)), o = p_(i), h = h_(i, o);
    this.points = i.map((x, F) => new Jr(x, o[F], h[F])), $r(`set-points - ${i.length} points`), $r("Calculating"), this.dist = this.points[this.points.length - 1].loc;
    let m = 0, d = 0, v = 0, y = this.points[0].alt;
    this.points.forEach((x) => {
      v = x.alt - y, v < 0 ? d += v : m += v, y = x.alt;
    }), this.gain = m, this.loss = d;
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
    if (s === 0)
      i = this.points[0];
    else {
      const o = this.points.findIndex((h) => h.loc >= s);
      i = Go(this.points[o - 1], this.points[o], s);
    }
    return Y.pick(i, ["lat", "lon", "alt"]);
  }
  reduceDensity(s = 0.025, i = this.points.length / 2) {
    const o = $r.extend("reduceDensity");
    if (this.dist / s > i / 2)
      return o("Does not meet criteria"), this;
    const h = this.dist, m = Math.floor(h / s) + 1, d = Array(m).fill(0).map((F, w) => Wt(w++ * s, 3));
    d[d.length - 1] < h && d.push(h);
    const v = Yo(this.points.map((F) => F.loc), this.points.map((F) => F.alt), d, 2 * s), y = d.map((F) => this.getLLA(F)).map((F, w) => ({
      lat: Wt(F.lat, 6),
      lon: Wt(F.lon, 6),
      alt: Wt(v[w].alt, 2)
    })), x = new Zr(y);
    return o(`Reduced from ${this.points.length} to ${x.points.length} points.`), x;
  }
}
function g_(l, s, i) {
  const o = l.map((h, m) => ({ lat: l[m], lon: s[m], alt: i[m] }));
  return new Zr(o);
}
const w_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Course: n_,
  CourseCutoff: zo,
  CoursePoint: Gr,
  CourseSegment: Wo,
  Event: Ko,
  Pacing: Zo,
  Plan: c_,
  PlanPoint: Ps,
  PlanSegment: Bo,
  Point: ks,
  Site: qr,
  Track: Zr,
  TrackPoint: Jr,
  Waypoint: Ms,
  createTrackFromArrays: g_,
  terrainTypes: Ho
}, Symbol.toStringTag, { value: "Module" })), y_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dateToTODSeconds: Ls
}, Symbol.toStringTag, { value: "Module" }));
export {
  ye as Factors,
  w_ as Models,
  Oo as Strategy,
  H0 as adjustStrategy,
  __ as enableDebug,
  m_ as factors,
  Go as interpolatePoint,
  v_ as math,
  Fo as scaleDark,
  y_ as util
};
