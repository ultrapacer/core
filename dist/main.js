var k0 = Object.defineProperty;
var D0 = (l, s, i) => s in l ? k0(l, s, { enumerable: !0, configurable: !0, writable: !0, value: i }) : l[s] = i;
var I = (l, s, i) => D0(l, typeof s != "symbol" ? s + "" : s, i);
var Br = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Eo(l) {
  return l && l.__esModule && Object.prototype.hasOwnProperty.call(l, "default") ? l.default : l;
}
var Ur = { exports: {} }, ws, po;
function W0() {
  if (po) return ws;
  po = 1;
  var l = 1e3, s = l * 60, i = s * 60, o = i * 24, f = o * 7, v = o * 365.25;
  ws = function(F, w) {
    w = w || {};
    var R = typeof F;
    if (R === "string" && F.length > 0)
      return g(F);
    if (R === "number" && isFinite(F))
      return w.long ? y(F) : _(F);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(F)
    );
  };
  function g(F) {
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
            return R * v;
          case "weeks":
          case "week":
          case "w":
            return R * f;
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
  function _(F) {
    var w = Math.abs(F);
    return w >= o ? Math.round(F / o) + "d" : w >= i ? Math.round(F / i) + "h" : w >= s ? Math.round(F / s) + "m" : w >= l ? Math.round(F / l) + "s" : F + "ms";
  }
  function y(F) {
    var w = Math.abs(F);
    return w >= o ? C(F, w, o, "day") : w >= i ? C(F, w, i, "hour") : w >= s ? C(F, w, s, "minute") : w >= l ? C(F, w, l, "second") : F + " ms";
  }
  function C(F, w, R, k) {
    var L = w >= R * 1.5;
    return Math.round(F / R) + " " + k + (L ? "s" : "");
  }
  return ws;
}
var ys, go;
function B0() {
  if (go) return ys;
  go = 1;
  function l(s) {
    o.debug = o, o.default = o, o.coerce = C, o.disable = _, o.enable = v, o.enabled = y, o.humanize = W0(), o.destroy = F, Object.keys(s).forEach((w) => {
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
      return W.namespace = w, W.useColors = o.useColors(), W.color = o.selectColor(w), W.extend = f, W.destroy = o.destroy, Object.defineProperty(W, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => k !== null ? k : (L !== o.namespaces && (L = o.namespaces, T = o.enabled(w)), T),
        set: (z) => {
          k = z;
        }
      }), typeof o.init == "function" && o.init(W), W;
    }
    function f(w, R) {
      const k = o(this.namespace + (typeof R > "u" ? ":" : R) + w);
      return k.log = this.log, k;
    }
    function v(w) {
      o.save(w), o.namespaces = w, o.names = [], o.skips = [];
      const R = (typeof w == "string" ? w : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const k of R)
        k[0] === "-" ? o.skips.push(k.slice(1)) : o.names.push(k);
    }
    function g(w, R) {
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
    function _() {
      const w = [
        ...o.names,
        ...o.skips.map((R) => "-" + R)
      ].join(",");
      return o.enable(""), w;
    }
    function y(w) {
      for (const R of o.skips)
        if (g(w, R))
          return !1;
      for (const R of o.names)
        if (g(w, R))
          return !0;
      return !1;
    }
    function C(w) {
      return w instanceof Error ? w.stack || w.message : w;
    }
    function F() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return o.enable(o.load()), o;
  }
  return ys = l, ys;
}
var _o;
function U0() {
  return _o || (_o = 1, function(l, s) {
    s.formatArgs = o, s.save = f, s.load = v, s.useColors = i, s.storage = g(), s.destroy = /* @__PURE__ */ (() => {
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
      const C = "color: " + this.color;
      y.splice(1, 0, C, "color: inherit");
      let F = 0, w = 0;
      y[0].replace(/%[a-zA-Z%]/g, (R) => {
        R !== "%%" && (F++, R === "%c" && (w = F));
      }), y.splice(w, 0, C);
    }
    s.log = console.debug || console.log || (() => {
    });
    function f(y) {
      try {
        y ? s.storage.setItem("debug", y) : s.storage.removeItem("debug");
      } catch {
      }
    }
    function v() {
      let y;
      try {
        y = s.storage.getItem("debug");
      } catch {
      }
      return !y && typeof process < "u" && "env" in process && (y = process.env.DEBUG), y;
    }
    function g() {
      try {
        return localStorage;
      } catch {
      }
    }
    l.exports = B0()(s);
    const { formatters: _ } = l.exports;
    _.j = function(y) {
      try {
        return JSON.stringify(y);
      } catch (C) {
        return "[UnexpectedJSONParseError]: " + C.message;
      }
    };
  }(Ur, Ur.exports)), Ur.exports;
}
var N0 = U0();
const Is = /* @__PURE__ */ Eo(N0), Cs = {};
function Ke(l) {
  if (!Cs[l]) {
    const s = Is("ultraPacer:core");
    s(`loading debug for namespace "${l}"`), Cs[l] = s.extend(l);
  }
  return Cs[l];
}
function v_() {
  Is.enable("ultraPacer:core*"), Is("ultraPacer:core")("debug enabled");
}
const $0 = {
  rate: 6,
  // %
  span: 1e3,
  // m
  th: 750
  // m
};
function Io(l, s) {
  (s === null || typeof s > "u") && (s = $0);
  let i = 0;
  return Array.isArray(l) ? i = (l[0] + l[1]) / 2 : i = l, i <= s.th ? 1 : (1 + s.rate / s.span / 100) ** (i - s.th);
}
const vo = {
  baseline: 0,
  terrainScale: 1
};
function Wt(l, s = 0) {
  return Math.round(l * 10 ** s) / 10 ** s;
}
function yn(l, s, i, o, f) {
  return i + (f - l) / (s - l) * (o - i);
}
function Fo(l, s, i) {
  let o = 0, f = 0;
  const v = [];
  for (o = 0; o < i.length; o++)
    if (i[o] < l[f])
      v.push(s[f]);
    else {
      for (; f < l.length - 1 && l[f + 1] <= i[o]; )
        f++;
      f === l.length - 1 || i[o] === l[f] ? v.push(s[f]) : v.push(yn(l[f], l[f + 1], s[f], s[f + 1], i[o]));
    }
  return v;
}
function To(l) {
  let s, i, o, f, v = 0, g = 0, _ = 0, y = 0, C = 0;
  for (s = 0; s < l.length; s++)
    i = l[s][0], o = l[s][1], f = l[s][2], C += f, v += f * i, _ += f * (i * i), g += f * o, y += f * (i * o);
  const F = (g * _ - v * y) / (C * _ - v * v);
  return [(C * y - v * g) / (C * _ - v * v), F];
}
function Mo(l, s, i, o) {
  let f = 0, v = 0;
  const g = [];
  return i.forEach((_) => {
    for (; l[f] < _ - o; )
      f++;
    for (f > 0 && l[f] >= _ && f--; v < l.length - 1 && l[v + 1] <= _ + o; )
      v++;
    v < l.length - 1 && l[v] <= _ && v++;
    const y = Math.max(o, Math.abs(_ - l[f]) + 1e-3, Math.abs(_ - l[v]) + 1e-3), C = [];
    let F = 0;
    for (let w = f; w <= v; w++)
      F = (1 - (Math.abs(_ - l[w]) / y) ** 3) ** 3, C.push([l[w], s[w], F]);
    g.push(To(C));
  }), g;
}
function Kr(l, s, i) {
  return Wt(l, i) < Wt(s, i);
}
function q0(l, s, i) {
  return Wt(l, i) > Wt(s, i);
}
function Cn(l, s, i) {
  return Wt(l, i) <= Wt(s, i);
}
function Jr(l, s, i) {
  return Wt(l, i) >= Wt(s, i);
}
function xn(l, s, i) {
  return Wt(l, i) === Wt(s, i);
}
const m_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interp: yn,
  interpArray: Fo,
  linearRegression: To,
  req: xn,
  rgt: q0,
  rgte: Jr,
  rlt: Kr,
  rlte: Cn,
  round: Wt,
  wlslr: Mo
}, Symbol.toStringTag, { value: "Module" })), Nr = -6;
function Lo(l, s) {
  var i, o, f, v;
  if (l.noon.altitude <= Nr || // sun never gets above twilight altitude
  l.dawn && s < l.dawn.time || // before dawn
  l.dusk && s > l.dusk.time)
    return 1;
  if (l.sunrise && s < l.sunrise.time || // before sunrise
  l.sunset && s > l.sunset.time || // after sunset
  !l.sunrise && !l.sunset && l.noon.altitude < 0) {
    let g = function(C) {
      return C < l.noon.time ? C + 86400 : C;
    };
    const _ = l.noon.altitude >= 0 ? 0 : l.noon.altitude / Nr, y = l.nadir.altitude < Nr ? 1 : l.nadir.altitude / Nr;
    return g(s) >= g(l.nadir.time) ? yn(
      g(((i = l.dawn) == null ? void 0 : i.time) ?? l.nadir.time),
      g(((o = l.sunrise) == null ? void 0 : o.time) ?? l.noon.time),
      y,
      _,
      g(s)
    ) : yn(
      g(((f = l.sunset) == null ? void 0 : f.time) ?? l.noon.time),
      g(((v = l.dusk) == null ? void 0 : v.time) ?? l.nadir.time),
      _,
      y,
      g(s)
    );
  } else
    return 0;
}
function Po(l, s, i, o = vo) {
  if (s === 1) return 1;
  (o === null || typeof o > "u") && (o = vo);
  const f = o.terrainScale * (s - 1) + o.baseline, v = Lo(i, l);
  return 1 + f * v;
}
const wn = [
  "altitude",
  "climbStrategy",
  "descentStrategy",
  "grade",
  "terrain",
  "heat",
  "dark",
  "strategy"
];
class ye {
  constructor(s) {
    I(this, "_data", {
      altitude: 1,
      climbStrategy: 1,
      descentStrategy: 1,
      grade: 1,
      terrain: 1,
      heat: 1,
      dark: 1,
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
  get climbStrategy() {
    return this._data.climbStrategy;
  }
  set climbStrategy(s) {
    this._data.climbStrategy = s, delete this._combined;
  }
  get descentStrategy() {
    return this._data.descentStrategy;
  }
  set descentStrategy(s) {
    this._data.descentStrategy = s, delete this._combined;
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
   * scale each factor
   * @param scale - scale to apply
   */
  scaleEach(s) {
    return wn.forEach((i) => this._data[i] *= s), delete this._combined, this;
  }
}
const Pe = {
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
}, Ro = (l) => l < Pe.lower.lim ? Pe.lower.m * l + Pe.lower.b : l > Pe.upper.lim ? Pe.upper.m * l + Pe.upper.b : Pe.a * l ** 2 + Pe.b * l + 1;
function Os(l, s) {
  return s || (s = Ro), s(l);
}
function Oo(l, s) {
  if (!s) return 1;
  const i = l.tod;
  let o = 1;
  if (i > s.start && i < s.stop) {
    const f = (i - s.start) / (s.stop - s.start) * Math.PI;
    o += (s.max - s.baseline) * Math.sin(f) / 100;
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
var G0 = Gn.exports, mo;
function H0() {
  return mo || (mo = 1, function(l, s) {
    (function() {
      var i, o = "4.17.21", f = 200, v = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", g = "Expected a function", _ = "Invalid `variable` option passed into `_.template`", y = "__lodash_hash_undefined__", C = 500, F = "__lodash_placeholder__", w = 1, R = 2, k = 4, L = 1, T = 2, W = 1, z = 2, tt = 4, it = 8, vt = 16, xt = 32, Re = 64, Ft = 128, ge = 256, Ce = 512, Lt = 30, Sn = "...", Kn = 800, Xr = 16, bn = 1, Jn = 2, Qr = 3, nn = 1 / 0, Oe = 9007199254740991, Zn = 17976931348623157e292, xe = NaN, P = 4294967295, $ = P - 1, q = P >>> 1, lt = [
        ["ary", Ft],
        ["bind", W],
        ["bindKey", z],
        ["curry", it],
        ["curryRight", vt],
        ["flip", Ce],
        ["partial", xt],
        ["partialRight", Re],
        ["rearg", ge]
      ], j = "[object Arguments]", ft = "[object Array]", at = "[object AsyncFunction]", ot = "[object Boolean]", yt = "[object Date]", Ht = "[object DOMException]", Pt = "[object Error]", Bt = "[object Function]", de = "[object GeneratorFunction]", dt = "[object Map]", Rt = "[object Number]", ke = "[object Null]", Ct = "[object Object]", Ut = "[object Promise]", oe = "[object Proxy]", Vt = "[object RegExp]", ht = "[object Set]", _e = "[object String]", Yn = "[object Symbol]", jo = "[object Undefined]", An = "[object WeakMap]", tc = "[object WeakSet]", En = "[object ArrayBuffer]", rn = "[object DataView]", Vr = "[object Float32Array]", jr = "[object Float64Array]", ti = "[object Int8Array]", ei = "[object Int16Array]", ni = "[object Int32Array]", ri = "[object Uint8Array]", ii = "[object Uint8ClampedArray]", si = "[object Uint16Array]", ai = "[object Uint32Array]", ec = /\b__p \+= '';/g, nc = /\b(__p \+=) '' \+/g, rc = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Bs = /&(?:amp|lt|gt|quot|#39);/g, Us = /[&<>"']/g, ic = RegExp(Bs.source), sc = RegExp(Us.source), ac = /<%-([\s\S]+?)%>/g, uc = /<%([\s\S]+?)%>/g, Ns = /<%=([\s\S]+?)%>/g, oc = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, cc = /^\w*$/, lc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ui = /[\\^$.*+?()[\]{}|]/g, fc = RegExp(ui.source), oi = /^\s+/, hc = /\s/, pc = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, gc = /\{\n\/\* \[wrapped with (.+)\] \*/, dc = /,? & /, _c = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, vc = /[()=,{}\[\]\/\s]/, mc = /\\(\\)?/g, wc = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, $s = /\w*$/, yc = /^[-+]0x[0-9a-f]+$/i, Cc = /^0b[01]+$/i, xc = /^\[object .+?Constructor\]$/, Sc = /^0o[0-7]+$/i, bc = /^(?:0|[1-9]\d*)$/, Ac = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Xn = /($^)/, Ec = /['\n\r\u2028\u2029\\]/g, Qn = "\\ud800-\\udfff", Ic = "\\u0300-\\u036f", Fc = "\\ufe20-\\ufe2f", Tc = "\\u20d0-\\u20ff", qs = Ic + Fc + Tc, Gs = "\\u2700-\\u27bf", Hs = "a-z\\xdf-\\xf6\\xf8-\\xff", Mc = "\\xac\\xb1\\xd7\\xf7", Lc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Pc = "\\u2000-\\u206f", Rc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", zs = "A-Z\\xc0-\\xd6\\xd8-\\xde", Ks = "\\ufe0e\\ufe0f", Js = Mc + Lc + Pc + Rc, ci = "['’]", Oc = "[" + Qn + "]", Zs = "[" + Js + "]", Vn = "[" + qs + "]", Ys = "\\d+", kc = "[" + Gs + "]", Xs = "[" + Hs + "]", Qs = "[^" + Qn + Js + Ys + Gs + Hs + zs + "]", li = "\\ud83c[\\udffb-\\udfff]", Dc = "(?:" + Vn + "|" + li + ")", Vs = "[^" + Qn + "]", fi = "(?:\\ud83c[\\udde6-\\uddff]){2}", hi = "[\\ud800-\\udbff][\\udc00-\\udfff]", sn = "[" + zs + "]", js = "\\u200d", ta = "(?:" + Xs + "|" + Qs + ")", Wc = "(?:" + sn + "|" + Qs + ")", ea = "(?:" + ci + "(?:d|ll|m|re|s|t|ve))?", na = "(?:" + ci + "(?:D|LL|M|RE|S|T|VE))?", ra = Dc + "?", ia = "[" + Ks + "]?", Bc = "(?:" + js + "(?:" + [Vs, fi, hi].join("|") + ")" + ia + ra + ")*", Uc = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Nc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", sa = ia + ra + Bc, $c = "(?:" + [kc, fi, hi].join("|") + ")" + sa, qc = "(?:" + [Vs + Vn + "?", Vn, fi, hi, Oc].join("|") + ")", Gc = RegExp(ci, "g"), Hc = RegExp(Vn, "g"), pi = RegExp(li + "(?=" + li + ")|" + qc + sa, "g"), zc = RegExp([
        sn + "?" + Xs + "+" + ea + "(?=" + [Zs, sn, "$"].join("|") + ")",
        Wc + "+" + na + "(?=" + [Zs, sn + ta, "$"].join("|") + ")",
        sn + "?" + ta + "+" + ea,
        sn + "+" + na,
        Nc,
        Uc,
        Ys,
        $c
      ].join("|"), "g"), Kc = RegExp("[" + js + Qn + qs + Ks + "]"), Jc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Zc = [
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
      ], Yc = -1, ct = {};
      ct[Vr] = ct[jr] = ct[ti] = ct[ei] = ct[ni] = ct[ri] = ct[ii] = ct[si] = ct[ai] = !0, ct[j] = ct[ft] = ct[En] = ct[ot] = ct[rn] = ct[yt] = ct[Pt] = ct[Bt] = ct[dt] = ct[Rt] = ct[Ct] = ct[Vt] = ct[ht] = ct[_e] = ct[An] = !1;
      var ut = {};
      ut[j] = ut[ft] = ut[En] = ut[rn] = ut[ot] = ut[yt] = ut[Vr] = ut[jr] = ut[ti] = ut[ei] = ut[ni] = ut[dt] = ut[Rt] = ut[Ct] = ut[Vt] = ut[ht] = ut[_e] = ut[Yn] = ut[ri] = ut[ii] = ut[si] = ut[ai] = !0, ut[Pt] = ut[Bt] = ut[An] = !1;
      var Xc = {
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
      }, Qc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Vc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, jc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, tl = parseFloat, el = parseInt, aa = typeof Br == "object" && Br && Br.Object === Object && Br, nl = typeof self == "object" && self && self.Object === Object && self, Et = aa || nl || Function("return this")(), gi = s && !s.nodeType && s, Je = gi && !0 && l && !l.nodeType && l, ua = Je && Je.exports === gi, di = ua && aa.process, jt = function() {
        try {
          var d = Je && Je.require && Je.require("util").types;
          return d || di && di.binding && di.binding("util");
        } catch {
        }
      }(), oa = jt && jt.isArrayBuffer, ca = jt && jt.isDate, la = jt && jt.isMap, fa = jt && jt.isRegExp, ha = jt && jt.isSet, pa = jt && jt.isTypedArray;
      function zt(d, S, x) {
        switch (x.length) {
          case 0:
            return d.call(S);
          case 1:
            return d.call(S, x[0]);
          case 2:
            return d.call(S, x[0], x[1]);
          case 3:
            return d.call(S, x[0], x[1], x[2]);
        }
        return d.apply(S, x);
      }
      function rl(d, S, x, O) {
        for (var G = -1, et = d == null ? 0 : d.length; ++G < et; ) {
          var St = d[G];
          S(O, St, x(St), d);
        }
        return O;
      }
      function te(d, S) {
        for (var x = -1, O = d == null ? 0 : d.length; ++x < O && S(d[x], x, d) !== !1; )
          ;
        return d;
      }
      function il(d, S) {
        for (var x = d == null ? 0 : d.length; x-- && S(d[x], x, d) !== !1; )
          ;
        return d;
      }
      function ga(d, S) {
        for (var x = -1, O = d == null ? 0 : d.length; ++x < O; )
          if (!S(d[x], x, d))
            return !1;
        return !0;
      }
      function De(d, S) {
        for (var x = -1, O = d == null ? 0 : d.length, G = 0, et = []; ++x < O; ) {
          var St = d[x];
          S(St, x, d) && (et[G++] = St);
        }
        return et;
      }
      function jn(d, S) {
        var x = d == null ? 0 : d.length;
        return !!x && an(d, S, 0) > -1;
      }
      function _i(d, S, x) {
        for (var O = -1, G = d == null ? 0 : d.length; ++O < G; )
          if (x(S, d[O]))
            return !0;
        return !1;
      }
      function pt(d, S) {
        for (var x = -1, O = d == null ? 0 : d.length, G = Array(O); ++x < O; )
          G[x] = S(d[x], x, d);
        return G;
      }
      function We(d, S) {
        for (var x = -1, O = S.length, G = d.length; ++x < O; )
          d[G + x] = S[x];
        return d;
      }
      function vi(d, S, x, O) {
        var G = -1, et = d == null ? 0 : d.length;
        for (O && et && (x = d[++G]); ++G < et; )
          x = S(x, d[G], G, d);
        return x;
      }
      function sl(d, S, x, O) {
        var G = d == null ? 0 : d.length;
        for (O && G && (x = d[--G]); G--; )
          x = S(x, d[G], G, d);
        return x;
      }
      function mi(d, S) {
        for (var x = -1, O = d == null ? 0 : d.length; ++x < O; )
          if (S(d[x], x, d))
            return !0;
        return !1;
      }
      var al = wi("length");
      function ul(d) {
        return d.split("");
      }
      function ol(d) {
        return d.match(_c) || [];
      }
      function da(d, S, x) {
        var O;
        return x(d, function(G, et, St) {
          if (S(G, et, St))
            return O = et, !1;
        }), O;
      }
      function tr(d, S, x, O) {
        for (var G = d.length, et = x + (O ? 1 : -1); O ? et-- : ++et < G; )
          if (S(d[et], et, d))
            return et;
        return -1;
      }
      function an(d, S, x) {
        return S === S ? yl(d, S, x) : tr(d, _a, x);
      }
      function cl(d, S, x, O) {
        for (var G = x - 1, et = d.length; ++G < et; )
          if (O(d[G], S))
            return G;
        return -1;
      }
      function _a(d) {
        return d !== d;
      }
      function va(d, S) {
        var x = d == null ? 0 : d.length;
        return x ? Ci(d, S) / x : xe;
      }
      function wi(d) {
        return function(S) {
          return S == null ? i : S[d];
        };
      }
      function yi(d) {
        return function(S) {
          return d == null ? i : d[S];
        };
      }
      function ma(d, S, x, O, G) {
        return G(d, function(et, St, st) {
          x = O ? (O = !1, et) : S(x, et, St, st);
        }), x;
      }
      function ll(d, S) {
        var x = d.length;
        for (d.sort(S); x--; )
          d[x] = d[x].value;
        return d;
      }
      function Ci(d, S) {
        for (var x, O = -1, G = d.length; ++O < G; ) {
          var et = S(d[O]);
          et !== i && (x = x === i ? et : x + et);
        }
        return x;
      }
      function xi(d, S) {
        for (var x = -1, O = Array(d); ++x < d; )
          O[x] = S(x);
        return O;
      }
      function fl(d, S) {
        return pt(S, function(x) {
          return [x, d[x]];
        });
      }
      function wa(d) {
        return d && d.slice(0, Sa(d) + 1).replace(oi, "");
      }
      function Kt(d) {
        return function(S) {
          return d(S);
        };
      }
      function Si(d, S) {
        return pt(S, function(x) {
          return d[x];
        });
      }
      function In(d, S) {
        return d.has(S);
      }
      function ya(d, S) {
        for (var x = -1, O = d.length; ++x < O && an(S, d[x], 0) > -1; )
          ;
        return x;
      }
      function Ca(d, S) {
        for (var x = d.length; x-- && an(S, d[x], 0) > -1; )
          ;
        return x;
      }
      function hl(d, S) {
        for (var x = d.length, O = 0; x--; )
          d[x] === S && ++O;
        return O;
      }
      var pl = yi(Xc), gl = yi(Qc);
      function dl(d) {
        return "\\" + jc[d];
      }
      function _l(d, S) {
        return d == null ? i : d[S];
      }
      function un(d) {
        return Kc.test(d);
      }
      function vl(d) {
        return Jc.test(d);
      }
      function ml(d) {
        for (var S, x = []; !(S = d.next()).done; )
          x.push(S.value);
        return x;
      }
      function bi(d) {
        var S = -1, x = Array(d.size);
        return d.forEach(function(O, G) {
          x[++S] = [G, O];
        }), x;
      }
      function xa(d, S) {
        return function(x) {
          return d(S(x));
        };
      }
      function Be(d, S) {
        for (var x = -1, O = d.length, G = 0, et = []; ++x < O; ) {
          var St = d[x];
          (St === S || St === F) && (d[x] = F, et[G++] = x);
        }
        return et;
      }
      function er(d) {
        var S = -1, x = Array(d.size);
        return d.forEach(function(O) {
          x[++S] = O;
        }), x;
      }
      function wl(d) {
        var S = -1, x = Array(d.size);
        return d.forEach(function(O) {
          x[++S] = [O, O];
        }), x;
      }
      function yl(d, S, x) {
        for (var O = x - 1, G = d.length; ++O < G; )
          if (d[O] === S)
            return O;
        return -1;
      }
      function Cl(d, S, x) {
        for (var O = x + 1; O--; )
          if (d[O] === S)
            return O;
        return O;
      }
      function on(d) {
        return un(d) ? Sl(d) : al(d);
      }
      function ce(d) {
        return un(d) ? bl(d) : ul(d);
      }
      function Sa(d) {
        for (var S = d.length; S-- && hc.test(d.charAt(S)); )
          ;
        return S;
      }
      var xl = yi(Vc);
      function Sl(d) {
        for (var S = pi.lastIndex = 0; pi.test(d); )
          ++S;
        return S;
      }
      function bl(d) {
        return d.match(pi) || [];
      }
      function Al(d) {
        return d.match(zc) || [];
      }
      var El = function d(S) {
        S = S == null ? Et : cn.defaults(Et.Object(), S, cn.pick(Et, Zc));
        var x = S.Array, O = S.Date, G = S.Error, et = S.Function, St = S.Math, st = S.Object, Ai = S.RegExp, Il = S.String, ee = S.TypeError, nr = x.prototype, Fl = et.prototype, ln = st.prototype, rr = S["__core-js_shared__"], ir = Fl.toString, rt = ln.hasOwnProperty, Tl = 0, ba = function() {
          var t = /[^.]+$/.exec(rr && rr.keys && rr.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        }(), sr = ln.toString, Ml = ir.call(st), Ll = Et._, Pl = Ai(
          "^" + ir.call(rt).replace(ui, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), ar = ua ? S.Buffer : i, Ue = S.Symbol, ur = S.Uint8Array, Aa = ar ? ar.allocUnsafe : i, or = xa(st.getPrototypeOf, st), Ea = st.create, Ia = ln.propertyIsEnumerable, cr = nr.splice, Fa = Ue ? Ue.isConcatSpreadable : i, Fn = Ue ? Ue.iterator : i, Ze = Ue ? Ue.toStringTag : i, lr = function() {
          try {
            var t = je(st, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        }(), Rl = S.clearTimeout !== Et.clearTimeout && S.clearTimeout, Ol = O && O.now !== Et.Date.now && O.now, kl = S.setTimeout !== Et.setTimeout && S.setTimeout, fr = St.ceil, hr = St.floor, Ei = st.getOwnPropertySymbols, Dl = ar ? ar.isBuffer : i, Ta = S.isFinite, Wl = nr.join, Bl = xa(st.keys, st), bt = St.max, Tt = St.min, Ul = O.now, Nl = S.parseInt, Ma = St.random, $l = nr.reverse, Ii = je(S, "DataView"), Tn = je(S, "Map"), Fi = je(S, "Promise"), fn = je(S, "Set"), Mn = je(S, "WeakMap"), Ln = je(st, "create"), pr = Mn && new Mn(), hn = {}, ql = tn(Ii), Gl = tn(Tn), Hl = tn(Fi), zl = tn(fn), Kl = tn(Mn), gr = Ue ? Ue.prototype : i, Pn = gr ? gr.valueOf : i, La = gr ? gr.toString : i;
        function u(t) {
          if (_t(t) && !H(t) && !(t instanceof Q)) {
            if (t instanceof ne)
              return t;
            if (rt.call(t, "__wrapped__"))
              return Pu(t);
          }
          return new ne(t);
        }
        var pn = /* @__PURE__ */ function() {
          function t() {
          }
          return function(e) {
            if (!gt(e))
              return {};
            if (Ea)
              return Ea(e);
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
          escape: ac,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: uc,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Ns,
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
        function Jl() {
          var t = new Q(this.__wrapped__);
          return t.__actions__ = Nt(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = Nt(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = Nt(this.__views__), t;
        }
        function Zl() {
          if (this.__filtered__) {
            var t = new Q(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function Yl() {
          var t = this.__wrapped__.value(), e = this.__dir__, n = H(t), r = e < 0, a = n ? t.length : 0, c = oh(0, a, this.__views__), h = c.start, p = c.end, m = p - h, b = r ? p : h - 1, A = this.__iteratees__, E = A.length, M = 0, D = Tt(m, this.__takeCount__);
          if (!n || !r && a == m && D == m)
            return eu(t, this.__actions__);
          var U = [];
          t:
            for (; m-- && M < D; ) {
              b += e;
              for (var J = -1, N = t[b]; ++J < E; ) {
                var X = A[J], V = X.iteratee, Yt = X.type, Dt = V(N);
                if (Yt == Jn)
                  N = Dt;
                else if (!Dt) {
                  if (Yt == bn)
                    continue t;
                  break t;
                }
              }
              U[M++] = N;
            }
          return U;
        }
        Q.prototype = pn(dr.prototype), Q.prototype.constructor = Q;
        function Ye(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function Xl() {
          this.__data__ = Ln ? Ln(null) : {}, this.size = 0;
        }
        function Ql(t) {
          var e = this.has(t) && delete this.__data__[t];
          return this.size -= e ? 1 : 0, e;
        }
        function Vl(t) {
          var e = this.__data__;
          if (Ln) {
            var n = e[t];
            return n === y ? i : n;
          }
          return rt.call(e, t) ? e[t] : i;
        }
        function jl(t) {
          var e = this.__data__;
          return Ln ? e[t] !== i : rt.call(e, t);
        }
        function tf(t, e) {
          var n = this.__data__;
          return this.size += this.has(t) ? 0 : 1, n[t] = Ln && e === i ? y : e, this;
        }
        Ye.prototype.clear = Xl, Ye.prototype.delete = Ql, Ye.prototype.get = Vl, Ye.prototype.has = jl, Ye.prototype.set = tf;
        function Se(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function ef() {
          this.__data__ = [], this.size = 0;
        }
        function nf(t) {
          var e = this.__data__, n = _r(e, t);
          if (n < 0)
            return !1;
          var r = e.length - 1;
          return n == r ? e.pop() : cr.call(e, n, 1), --this.size, !0;
        }
        function rf(t) {
          var e = this.__data__, n = _r(e, t);
          return n < 0 ? i : e[n][1];
        }
        function sf(t) {
          return _r(this.__data__, t) > -1;
        }
        function af(t, e) {
          var n = this.__data__, r = _r(n, t);
          return r < 0 ? (++this.size, n.push([t, e])) : n[r][1] = e, this;
        }
        Se.prototype.clear = ef, Se.prototype.delete = nf, Se.prototype.get = rf, Se.prototype.has = sf, Se.prototype.set = af;
        function be(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var r = t[e];
            this.set(r[0], r[1]);
          }
        }
        function uf() {
          this.size = 0, this.__data__ = {
            hash: new Ye(),
            map: new (Tn || Se)(),
            string: new Ye()
          };
        }
        function of(t) {
          var e = Fr(this, t).delete(t);
          return this.size -= e ? 1 : 0, e;
        }
        function cf(t) {
          return Fr(this, t).get(t);
        }
        function lf(t) {
          return Fr(this, t).has(t);
        }
        function ff(t, e) {
          var n = Fr(this, t), r = n.size;
          return n.set(t, e), this.size += n.size == r ? 0 : 1, this;
        }
        be.prototype.clear = uf, be.prototype.delete = of, be.prototype.get = cf, be.prototype.has = lf, be.prototype.set = ff;
        function Xe(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.__data__ = new be(); ++e < n; )
            this.add(t[e]);
        }
        function hf(t) {
          return this.__data__.set(t, y), this;
        }
        function pf(t) {
          return this.__data__.has(t);
        }
        Xe.prototype.add = Xe.prototype.push = hf, Xe.prototype.has = pf;
        function le(t) {
          var e = this.__data__ = new Se(t);
          this.size = e.size;
        }
        function gf() {
          this.__data__ = new Se(), this.size = 0;
        }
        function df(t) {
          var e = this.__data__, n = e.delete(t);
          return this.size = e.size, n;
        }
        function _f(t) {
          return this.__data__.get(t);
        }
        function vf(t) {
          return this.__data__.has(t);
        }
        function mf(t, e) {
          var n = this.__data__;
          if (n instanceof Se) {
            var r = n.__data__;
            if (!Tn || r.length < f - 1)
              return r.push([t, e]), this.size = ++n.size, this;
            n = this.__data__ = new be(r);
          }
          return n.set(t, e), this.size = n.size, this;
        }
        le.prototype.clear = gf, le.prototype.delete = df, le.prototype.get = _f, le.prototype.has = vf, le.prototype.set = mf;
        function Pa(t, e) {
          var n = H(t), r = !n && en(t), a = !n && !r && He(t), c = !n && !r && !a && vn(t), h = n || r || a || c, p = h ? xi(t.length, Il) : [], m = p.length;
          for (var b in t)
            (e || rt.call(t, b)) && !(h && // Safari 9 has enumerable `arguments.length` in strict mode.
            (b == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            a && (b == "offset" || b == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (b == "buffer" || b == "byteLength" || b == "byteOffset") || // Skip index properties.
            Fe(b, m))) && p.push(b);
          return p;
        }
        function Ra(t) {
          var e = t.length;
          return e ? t[Ui(0, e - 1)] : i;
        }
        function wf(t, e) {
          return Tr(Nt(t), Qe(e, 0, t.length));
        }
        function yf(t) {
          return Tr(Nt(t));
        }
        function Ti(t, e, n) {
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
        function Cf(t, e, n, r) {
          return Ne(t, function(a, c, h) {
            e(r, a, n(a), h);
          }), r;
        }
        function Oa(t, e) {
          return t && me(e, At(e), t);
        }
        function xf(t, e) {
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
        function Mi(t, e) {
          for (var n = -1, r = e.length, a = x(r), c = t == null; ++n < r; )
            a[n] = c ? i : ls(t, e[n]);
          return a;
        }
        function Qe(t, e, n) {
          return t === t && (n !== i && (t = t <= n ? t : n), e !== i && (t = t >= e ? t : e)), t;
        }
        function re(t, e, n, r, a, c) {
          var h, p = e & w, m = e & R, b = e & k;
          if (n && (h = a ? n(t, r, a, c) : n(t)), h !== i)
            return h;
          if (!gt(t))
            return t;
          var A = H(t);
          if (A) {
            if (h = lh(t), !p)
              return Nt(t, h);
          } else {
            var E = Mt(t), M = E == Bt || E == de;
            if (He(t))
              return iu(t, p);
            if (E == Ct || E == j || M && !a) {
              if (h = m || M ? {} : Su(t), !p)
                return m ? jf(t, xf(h, t)) : Vf(t, Oa(h, t));
            } else {
              if (!ut[E])
                return a ? t : {};
              h = fh(t, E, p);
            }
          }
          c || (c = new le());
          var D = c.get(t);
          if (D)
            return D;
          c.set(t, h), Vu(t) ? t.forEach(function(N) {
            h.add(re(N, e, n, N, t, c));
          }) : Xu(t) && t.forEach(function(N, X) {
            h.set(X, re(N, e, n, X, t, c));
          });
          var U = b ? m ? Xi : Yi : m ? qt : At, J = A ? i : U(t);
          return te(J || t, function(N, X) {
            J && (X = N, N = t[X]), Rn(h, X, re(N, e, n, X, t, c));
          }), h;
        }
        function Sf(t) {
          var e = At(t);
          return function(n) {
            return ka(n, t, e);
          };
        }
        function ka(t, e, n) {
          var r = n.length;
          if (t == null)
            return !r;
          for (t = st(t); r--; ) {
            var a = n[r], c = e[a], h = t[a];
            if (h === i && !(a in t) || !c(h))
              return !1;
          }
          return !0;
        }
        function Da(t, e, n) {
          if (typeof t != "function")
            throw new ee(g);
          return Nn(function() {
            t.apply(i, n);
          }, e);
        }
        function On(t, e, n, r) {
          var a = -1, c = jn, h = !0, p = t.length, m = [], b = e.length;
          if (!p)
            return m;
          n && (e = pt(e, Kt(n))), r ? (c = _i, h = !1) : e.length >= f && (c = In, h = !1, e = new Xe(e));
          t:
            for (; ++a < p; ) {
              var A = t[a], E = n == null ? A : n(A);
              if (A = r || A !== 0 ? A : 0, h && E === E) {
                for (var M = b; M--; )
                  if (e[M] === E)
                    continue t;
                m.push(A);
              } else c(e, E, r) || m.push(A);
            }
          return m;
        }
        var Ne = cu(ve), Wa = cu(Pi, !0);
        function bf(t, e) {
          var n = !0;
          return Ne(t, function(r, a, c) {
            return n = !!e(r, a, c), n;
          }), n;
        }
        function vr(t, e, n) {
          for (var r = -1, a = t.length; ++r < a; ) {
            var c = t[r], h = e(c);
            if (h != null && (p === i ? h === h && !Zt(h) : n(h, p)))
              var p = h, m = c;
          }
          return m;
        }
        function Af(t, e, n, r) {
          var a = t.length;
          for (n = K(n), n < 0 && (n = -n > a ? 0 : a + n), r = r === i || r > a ? a : K(r), r < 0 && (r += a), r = n > r ? 0 : to(r); n < r; )
            t[n++] = e;
          return t;
        }
        function Ba(t, e) {
          var n = [];
          return Ne(t, function(r, a, c) {
            e(r, a, c) && n.push(r);
          }), n;
        }
        function It(t, e, n, r, a) {
          var c = -1, h = t.length;
          for (n || (n = ph), a || (a = []); ++c < h; ) {
            var p = t[c];
            e > 0 && n(p) ? e > 1 ? It(p, e - 1, n, r, a) : We(a, p) : r || (a[a.length] = p);
          }
          return a;
        }
        var Li = lu(), Ua = lu(!0);
        function ve(t, e) {
          return t && Li(t, e, At);
        }
        function Pi(t, e) {
          return t && Ua(t, e, At);
        }
        function mr(t, e) {
          return De(e, function(n) {
            return Te(t[n]);
          });
        }
        function Ve(t, e) {
          e = qe(e, t);
          for (var n = 0, r = e.length; t != null && n < r; )
            t = t[we(e[n++])];
          return n && n == r ? t : i;
        }
        function Na(t, e, n) {
          var r = e(t);
          return H(t) ? r : We(r, n(t));
        }
        function Ot(t) {
          return t == null ? t === i ? jo : ke : Ze && Ze in st(t) ? uh(t) : yh(t);
        }
        function Ri(t, e) {
          return t > e;
        }
        function Ef(t, e) {
          return t != null && rt.call(t, e);
        }
        function If(t, e) {
          return t != null && e in st(t);
        }
        function Ff(t, e, n) {
          return t >= Tt(e, n) && t < bt(e, n);
        }
        function Oi(t, e, n) {
          for (var r = n ? _i : jn, a = t[0].length, c = t.length, h = c, p = x(c), m = 1 / 0, b = []; h--; ) {
            var A = t[h];
            h && e && (A = pt(A, Kt(e))), m = Tt(A.length, m), p[h] = !n && (e || a >= 120 && A.length >= 120) ? new Xe(h && A) : i;
          }
          A = t[0];
          var E = -1, M = p[0];
          t:
            for (; ++E < a && b.length < m; ) {
              var D = A[E], U = e ? e(D) : D;
              if (D = n || D !== 0 ? D : 0, !(M ? In(M, U) : r(b, U, n))) {
                for (h = c; --h; ) {
                  var J = p[h];
                  if (!(J ? In(J, U) : r(t[h], U, n)))
                    continue t;
                }
                M && M.push(U), b.push(D);
              }
            }
          return b;
        }
        function Tf(t, e, n, r) {
          return ve(t, function(a, c, h) {
            e(r, n(a), c, h);
          }), r;
        }
        function kn(t, e, n) {
          e = qe(e, t), t = Iu(t, e);
          var r = t == null ? t : t[we(se(e))];
          return r == null ? i : zt(r, t, n);
        }
        function $a(t) {
          return _t(t) && Ot(t) == j;
        }
        function Mf(t) {
          return _t(t) && Ot(t) == En;
        }
        function Lf(t) {
          return _t(t) && Ot(t) == yt;
        }
        function Dn(t, e, n, r, a) {
          return t === e ? !0 : t == null || e == null || !_t(t) && !_t(e) ? t !== t && e !== e : Pf(t, e, n, r, Dn, a);
        }
        function Pf(t, e, n, r, a, c) {
          var h = H(t), p = H(e), m = h ? ft : Mt(t), b = p ? ft : Mt(e);
          m = m == j ? Ct : m, b = b == j ? Ct : b;
          var A = m == Ct, E = b == Ct, M = m == b;
          if (M && He(t)) {
            if (!He(e))
              return !1;
            h = !0, A = !1;
          }
          if (M && !A)
            return c || (c = new le()), h || vn(t) ? yu(t, e, n, r, a, c) : sh(t, e, m, n, r, a, c);
          if (!(n & L)) {
            var D = A && rt.call(t, "__wrapped__"), U = E && rt.call(e, "__wrapped__");
            if (D || U) {
              var J = D ? t.value() : t, N = U ? e.value() : e;
              return c || (c = new le()), a(J, N, n, r, c);
            }
          }
          return M ? (c || (c = new le()), ah(t, e, n, r, a, c)) : !1;
        }
        function Rf(t) {
          return _t(t) && Mt(t) == dt;
        }
        function ki(t, e, n, r) {
          var a = n.length, c = a, h = !r;
          if (t == null)
            return !c;
          for (t = st(t); a--; ) {
            var p = n[a];
            if (h && p[2] ? p[1] !== t[p[0]] : !(p[0] in t))
              return !1;
          }
          for (; ++a < c; ) {
            p = n[a];
            var m = p[0], b = t[m], A = p[1];
            if (h && p[2]) {
              if (b === i && !(m in t))
                return !1;
            } else {
              var E = new le();
              if (r)
                var M = r(b, A, m, t, e, E);
              if (!(M === i ? Dn(A, b, L | T, r, E) : M))
                return !1;
            }
          }
          return !0;
        }
        function qa(t) {
          if (!gt(t) || dh(t))
            return !1;
          var e = Te(t) ? Pl : xc;
          return e.test(tn(t));
        }
        function Of(t) {
          return _t(t) && Ot(t) == Vt;
        }
        function kf(t) {
          return _t(t) && Mt(t) == ht;
        }
        function Df(t) {
          return _t(t) && kr(t.length) && !!ct[Ot(t)];
        }
        function Ga(t) {
          return typeof t == "function" ? t : t == null ? Gt : typeof t == "object" ? H(t) ? Ka(t[0], t[1]) : za(t) : fo(t);
        }
        function Di(t) {
          if (!Un(t))
            return Bl(t);
          var e = [];
          for (var n in st(t))
            rt.call(t, n) && n != "constructor" && e.push(n);
          return e;
        }
        function Wf(t) {
          if (!gt(t))
            return wh(t);
          var e = Un(t), n = [];
          for (var r in t)
            r == "constructor" && (e || !rt.call(t, r)) || n.push(r);
          return n;
        }
        function Wi(t, e) {
          return t < e;
        }
        function Ha(t, e) {
          var n = -1, r = $t(t) ? x(t.length) : [];
          return Ne(t, function(a, c, h) {
            r[++n] = e(a, c, h);
          }), r;
        }
        function za(t) {
          var e = Vi(t);
          return e.length == 1 && e[0][2] ? Au(e[0][0], e[0][1]) : function(n) {
            return n === t || ki(n, t, e);
          };
        }
        function Ka(t, e) {
          return ts(t) && bu(e) ? Au(we(t), e) : function(n) {
            var r = ls(n, t);
            return r === i && r === e ? fs(n, t) : Dn(e, r, L | T);
          };
        }
        function wr(t, e, n, r, a) {
          t !== e && Li(e, function(c, h) {
            if (a || (a = new le()), gt(c))
              Bf(t, e, h, n, wr, r, a);
            else {
              var p = r ? r(ns(t, h), c, h + "", t, e, a) : i;
              p === i && (p = c), Ti(t, h, p);
            }
          }, qt);
        }
        function Bf(t, e, n, r, a, c, h) {
          var p = ns(t, n), m = ns(e, n), b = h.get(m);
          if (b) {
            Ti(t, n, b);
            return;
          }
          var A = c ? c(p, m, n + "", t, e, h) : i, E = A === i;
          if (E) {
            var M = H(m), D = !M && He(m), U = !M && !D && vn(m);
            A = m, M || D || U ? H(p) ? A = p : mt(p) ? A = Nt(p) : D ? (E = !1, A = iu(m, !0)) : U ? (E = !1, A = su(m, !0)) : A = [] : $n(m) || en(m) ? (A = p, en(p) ? A = eo(p) : (!gt(p) || Te(p)) && (A = Su(m))) : E = !1;
          }
          E && (h.set(m, A), a(A, m, r, c, h), h.delete(m)), Ti(t, n, A);
        }
        function Ja(t, e) {
          var n = t.length;
          if (n)
            return e += e < 0 ? n : 0, Fe(e, n) ? t[e] : i;
        }
        function Za(t, e, n) {
          e.length ? e = pt(e, function(c) {
            return H(c) ? function(h) {
              return Ve(h, c.length === 1 ? c[0] : c);
            } : c;
          }) : e = [Gt];
          var r = -1;
          e = pt(e, Kt(B()));
          var a = Ha(t, function(c, h, p) {
            var m = pt(e, function(b) {
              return b(c);
            });
            return { criteria: m, index: ++r, value: c };
          });
          return ll(a, function(c, h) {
            return Qf(c, h, n);
          });
        }
        function Uf(t, e) {
          return Ya(t, e, function(n, r) {
            return fs(t, r);
          });
        }
        function Ya(t, e, n) {
          for (var r = -1, a = e.length, c = {}; ++r < a; ) {
            var h = e[r], p = Ve(t, h);
            n(p, h) && Wn(c, qe(h, t), p);
          }
          return c;
        }
        function Nf(t) {
          return function(e) {
            return Ve(e, t);
          };
        }
        function Bi(t, e, n, r) {
          var a = r ? cl : an, c = -1, h = e.length, p = t;
          for (t === e && (e = Nt(e)), n && (p = pt(t, Kt(n))); ++c < h; )
            for (var m = 0, b = e[c], A = n ? n(b) : b; (m = a(p, A, m, r)) > -1; )
              p !== t && cr.call(p, m, 1), cr.call(t, m, 1);
          return t;
        }
        function Xa(t, e) {
          for (var n = t ? e.length : 0, r = n - 1; n--; ) {
            var a = e[n];
            if (n == r || a !== c) {
              var c = a;
              Fe(a) ? cr.call(t, a, 1) : qi(t, a);
            }
          }
          return t;
        }
        function Ui(t, e) {
          return t + hr(Ma() * (e - t + 1));
        }
        function $f(t, e, n, r) {
          for (var a = -1, c = bt(fr((e - t) / (n || 1)), 0), h = x(c); c--; )
            h[r ? c : ++a] = t, t += n;
          return h;
        }
        function Ni(t, e) {
          var n = "";
          if (!t || e < 1 || e > Oe)
            return n;
          do
            e % 2 && (n += t), e = hr(e / 2), e && (t += t);
          while (e);
          return n;
        }
        function Z(t, e) {
          return rs(Eu(t, e, Gt), t + "");
        }
        function qf(t) {
          return Ra(mn(t));
        }
        function Gf(t, e) {
          var n = mn(t);
          return Tr(n, Qe(e, 0, n.length));
        }
        function Wn(t, e, n, r) {
          if (!gt(t))
            return t;
          e = qe(e, t);
          for (var a = -1, c = e.length, h = c - 1, p = t; p != null && ++a < c; ) {
            var m = we(e[a]), b = n;
            if (m === "__proto__" || m === "constructor" || m === "prototype")
              return t;
            if (a != h) {
              var A = p[m];
              b = r ? r(A, m, p) : i, b === i && (b = gt(A) ? A : Fe(e[a + 1]) ? [] : {});
            }
            Rn(p, m, b), p = p[m];
          }
          return t;
        }
        var Qa = pr ? function(t, e) {
          return pr.set(t, e), t;
        } : Gt, Hf = lr ? function(t, e) {
          return lr(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: ps(e),
            writable: !0
          });
        } : Gt;
        function zf(t) {
          return Tr(mn(t));
        }
        function ie(t, e, n) {
          var r = -1, a = t.length;
          e < 0 && (e = -e > a ? 0 : a + e), n = n > a ? a : n, n < 0 && (n += a), a = e > n ? 0 : n - e >>> 0, e >>>= 0;
          for (var c = x(a); ++r < a; )
            c[r] = t[r + e];
          return c;
        }
        function Kf(t, e) {
          var n;
          return Ne(t, function(r, a, c) {
            return n = e(r, a, c), !n;
          }), !!n;
        }
        function yr(t, e, n) {
          var r = 0, a = t == null ? r : t.length;
          if (typeof e == "number" && e === e && a <= q) {
            for (; r < a; ) {
              var c = r + a >>> 1, h = t[c];
              h !== null && !Zt(h) && (n ? h <= e : h < e) ? r = c + 1 : a = c;
            }
            return a;
          }
          return $i(t, e, Gt, n);
        }
        function $i(t, e, n, r) {
          var a = 0, c = t == null ? 0 : t.length;
          if (c === 0)
            return 0;
          e = n(e);
          for (var h = e !== e, p = e === null, m = Zt(e), b = e === i; a < c; ) {
            var A = hr((a + c) / 2), E = n(t[A]), M = E !== i, D = E === null, U = E === E, J = Zt(E);
            if (h)
              var N = r || U;
            else b ? N = U && (r || M) : p ? N = U && M && (r || !D) : m ? N = U && M && !D && (r || !J) : D || J ? N = !1 : N = r ? E <= e : E < e;
            N ? a = A + 1 : c = A;
          }
          return Tt(c, $);
        }
        function Va(t, e) {
          for (var n = -1, r = t.length, a = 0, c = []; ++n < r; ) {
            var h = t[n], p = e ? e(h) : h;
            if (!n || !fe(p, m)) {
              var m = p;
              c[a++] = h === 0 ? 0 : h;
            }
          }
          return c;
        }
        function ja(t) {
          return typeof t == "number" ? t : Zt(t) ? xe : +t;
        }
        function Jt(t) {
          if (typeof t == "string")
            return t;
          if (H(t))
            return pt(t, Jt) + "";
          if (Zt(t))
            return La ? La.call(t) : "";
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function $e(t, e, n) {
          var r = -1, a = jn, c = t.length, h = !0, p = [], m = p;
          if (n)
            h = !1, a = _i;
          else if (c >= f) {
            var b = e ? null : rh(t);
            if (b)
              return er(b);
            h = !1, a = In, m = new Xe();
          } else
            m = e ? [] : p;
          t:
            for (; ++r < c; ) {
              var A = t[r], E = e ? e(A) : A;
              if (A = n || A !== 0 ? A : 0, h && E === E) {
                for (var M = m.length; M--; )
                  if (m[M] === E)
                    continue t;
                e && m.push(E), p.push(A);
              } else a(m, E, n) || (m !== p && m.push(E), p.push(A));
            }
          return p;
        }
        function qi(t, e) {
          return e = qe(e, t), t = Iu(t, e), t == null || delete t[we(se(e))];
        }
        function tu(t, e, n, r) {
          return Wn(t, e, n(Ve(t, e)), r);
        }
        function Cr(t, e, n, r) {
          for (var a = t.length, c = r ? a : -1; (r ? c-- : ++c < a) && e(t[c], c, t); )
            ;
          return n ? ie(t, r ? 0 : c, r ? c + 1 : a) : ie(t, r ? c + 1 : 0, r ? a : c);
        }
        function eu(t, e) {
          var n = t;
          return n instanceof Q && (n = n.value()), vi(e, function(r, a) {
            return a.func.apply(a.thisArg, We([r], a.args));
          }, n);
        }
        function Gi(t, e, n) {
          var r = t.length;
          if (r < 2)
            return r ? $e(t[0]) : [];
          for (var a = -1, c = x(r); ++a < r; )
            for (var h = t[a], p = -1; ++p < r; )
              p != a && (c[a] = On(c[a] || h, t[p], e, n));
          return $e(It(c, 1), e, n);
        }
        function nu(t, e, n) {
          for (var r = -1, a = t.length, c = e.length, h = {}; ++r < a; ) {
            var p = r < c ? e[r] : i;
            n(h, t[r], p);
          }
          return h;
        }
        function Hi(t) {
          return mt(t) ? t : [];
        }
        function zi(t) {
          return typeof t == "function" ? t : Gt;
        }
        function qe(t, e) {
          return H(t) ? t : ts(t, e) ? [t] : Lu(nt(t));
        }
        var Jf = Z;
        function Ge(t, e, n) {
          var r = t.length;
          return n = n === i ? r : n, !e && n >= r ? t : ie(t, e, n);
        }
        var ru = Rl || function(t) {
          return Et.clearTimeout(t);
        };
        function iu(t, e) {
          if (e)
            return t.slice();
          var n = t.length, r = Aa ? Aa(n) : new t.constructor(n);
          return t.copy(r), r;
        }
        function Ki(t) {
          var e = new t.constructor(t.byteLength);
          return new ur(e).set(new ur(t)), e;
        }
        function Zf(t, e) {
          var n = e ? Ki(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.byteLength);
        }
        function Yf(t) {
          var e = new t.constructor(t.source, $s.exec(t));
          return e.lastIndex = t.lastIndex, e;
        }
        function Xf(t) {
          return Pn ? st(Pn.call(t)) : {};
        }
        function su(t, e) {
          var n = e ? Ki(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.length);
        }
        function au(t, e) {
          if (t !== e) {
            var n = t !== i, r = t === null, a = t === t, c = Zt(t), h = e !== i, p = e === null, m = e === e, b = Zt(e);
            if (!p && !b && !c && t > e || c && h && m && !p && !b || r && h && m || !n && m || !a)
              return 1;
            if (!r && !c && !b && t < e || b && n && a && !r && !c || p && n && a || !h && a || !m)
              return -1;
          }
          return 0;
        }
        function Qf(t, e, n) {
          for (var r = -1, a = t.criteria, c = e.criteria, h = a.length, p = n.length; ++r < h; ) {
            var m = au(a[r], c[r]);
            if (m) {
              if (r >= p)
                return m;
              var b = n[r];
              return m * (b == "desc" ? -1 : 1);
            }
          }
          return t.index - e.index;
        }
        function uu(t, e, n, r) {
          for (var a = -1, c = t.length, h = n.length, p = -1, m = e.length, b = bt(c - h, 0), A = x(m + b), E = !r; ++p < m; )
            A[p] = e[p];
          for (; ++a < h; )
            (E || a < c) && (A[n[a]] = t[a]);
          for (; b--; )
            A[p++] = t[a++];
          return A;
        }
        function ou(t, e, n, r) {
          for (var a = -1, c = t.length, h = -1, p = n.length, m = -1, b = e.length, A = bt(c - p, 0), E = x(A + b), M = !r; ++a < A; )
            E[a] = t[a];
          for (var D = a; ++m < b; )
            E[D + m] = e[m];
          for (; ++h < p; )
            (M || a < c) && (E[D + n[h]] = t[a++]);
          return E;
        }
        function Nt(t, e) {
          var n = -1, r = t.length;
          for (e || (e = x(r)); ++n < r; )
            e[n] = t[n];
          return e;
        }
        function me(t, e, n, r) {
          var a = !n;
          n || (n = {});
          for (var c = -1, h = e.length; ++c < h; ) {
            var p = e[c], m = r ? r(n[p], t[p], p, n, t) : i;
            m === i && (m = t[p]), a ? Ae(n, p, m) : Rn(n, p, m);
          }
          return n;
        }
        function Vf(t, e) {
          return me(t, ji(t), e);
        }
        function jf(t, e) {
          return me(t, Cu(t), e);
        }
        function xr(t, e) {
          return function(n, r) {
            var a = H(n) ? rl : Cf, c = e ? e() : {};
            return a(n, t, B(r, 2), c);
          };
        }
        function gn(t) {
          return Z(function(e, n) {
            var r = -1, a = n.length, c = a > 1 ? n[a - 1] : i, h = a > 2 ? n[2] : i;
            for (c = t.length > 3 && typeof c == "function" ? (a--, c) : i, h && kt(n[0], n[1], h) && (c = a < 3 ? i : c, a = 1), e = st(e); ++r < a; ) {
              var p = n[r];
              p && t(e, p, r, c);
            }
            return e;
          });
        }
        function cu(t, e) {
          return function(n, r) {
            if (n == null)
              return n;
            if (!$t(n))
              return t(n, r);
            for (var a = n.length, c = e ? a : -1, h = st(n); (e ? c-- : ++c < a) && r(h[c], c, h) !== !1; )
              ;
            return n;
          };
        }
        function lu(t) {
          return function(e, n, r) {
            for (var a = -1, c = st(e), h = r(e), p = h.length; p--; ) {
              var m = h[t ? p : ++a];
              if (n(c[m], m, c) === !1)
                break;
            }
            return e;
          };
        }
        function th(t, e, n) {
          var r = e & W, a = Bn(t);
          function c() {
            var h = this && this !== Et && this instanceof c ? a : t;
            return h.apply(r ? n : this, arguments);
          }
          return c;
        }
        function fu(t) {
          return function(e) {
            e = nt(e);
            var n = un(e) ? ce(e) : i, r = n ? n[0] : e.charAt(0), a = n ? Ge(n, 1).join("") : e.slice(1);
            return r[t]() + a;
          };
        }
        function dn(t) {
          return function(e) {
            return vi(co(oo(e).replace(Gc, "")), t, "");
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
        function eh(t, e, n) {
          var r = Bn(t);
          function a() {
            for (var c = arguments.length, h = x(c), p = c, m = _n(a); p--; )
              h[p] = arguments[p];
            var b = c < 3 && h[0] !== m && h[c - 1] !== m ? [] : Be(h, m);
            if (c -= b.length, c < n)
              return _u(
                t,
                e,
                Sr,
                a.placeholder,
                i,
                h,
                b,
                i,
                i,
                n - c
              );
            var A = this && this !== Et && this instanceof a ? r : t;
            return zt(A, this, h);
          }
          return a;
        }
        function hu(t) {
          return function(e, n, r) {
            var a = st(e);
            if (!$t(e)) {
              var c = B(n, 3);
              e = At(e), n = function(p) {
                return c(a[p], p, a);
              };
            }
            var h = t(e, n, r);
            return h > -1 ? a[c ? e[h] : h] : i;
          };
        }
        function pu(t) {
          return Ie(function(e) {
            var n = e.length, r = n, a = ne.prototype.thru;
            for (t && e.reverse(); r--; ) {
              var c = e[r];
              if (typeof c != "function")
                throw new ee(g);
              if (a && !h && Ir(c) == "wrapper")
                var h = new ne([], !0);
            }
            for (r = h ? r : n; ++r < n; ) {
              c = e[r];
              var p = Ir(c), m = p == "wrapper" ? Qi(c) : i;
              m && es(m[0]) && m[1] == (Ft | it | xt | ge) && !m[4].length && m[9] == 1 ? h = h[Ir(m[0])].apply(h, m[3]) : h = c.length == 1 && es(c) ? h[p]() : h.thru(c);
            }
            return function() {
              var b = arguments, A = b[0];
              if (h && b.length == 1 && H(A))
                return h.plant(A).value();
              for (var E = 0, M = n ? e[E].apply(this, b) : A; ++E < n; )
                M = e[E].call(this, M);
              return M;
            };
          });
        }
        function Sr(t, e, n, r, a, c, h, p, m, b) {
          var A = e & Ft, E = e & W, M = e & z, D = e & (it | vt), U = e & Ce, J = M ? i : Bn(t);
          function N() {
            for (var X = arguments.length, V = x(X), Yt = X; Yt--; )
              V[Yt] = arguments[Yt];
            if (D)
              var Dt = _n(N), Xt = hl(V, Dt);
            if (r && (V = uu(V, r, a, D)), c && (V = ou(V, c, h, D)), X -= Xt, D && X < b) {
              var wt = Be(V, Dt);
              return _u(
                t,
                e,
                Sr,
                N.placeholder,
                n,
                V,
                wt,
                p,
                m,
                b - X
              );
            }
            var he = E ? n : this, Le = M ? he[t] : t;
            return X = V.length, p ? V = Ch(V, p) : U && X > 1 && V.reverse(), A && m < X && (V.length = m), this && this !== Et && this instanceof N && (Le = J || Bn(Le)), Le.apply(he, V);
          }
          return N;
        }
        function gu(t, e) {
          return function(n, r) {
            return Tf(n, t, e(r), {});
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
              typeof n == "string" || typeof r == "string" ? (n = Jt(n), r = Jt(r)) : (n = ja(n), r = ja(r)), a = t(n, r);
            }
            return a;
          };
        }
        function Ji(t) {
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
            return n ? Ni(e, t) : e;
          var r = Ni(e, fr(t / on(e)));
          return un(e) ? Ge(ce(r), 0, t).join("") : r.slice(0, t);
        }
        function nh(t, e, n, r) {
          var a = e & W, c = Bn(t);
          function h() {
            for (var p = -1, m = arguments.length, b = -1, A = r.length, E = x(A + m), M = this && this !== Et && this instanceof h ? c : t; ++b < A; )
              E[b] = r[b];
            for (; m--; )
              E[b++] = arguments[++p];
            return zt(M, a ? n : this, E);
          }
          return h;
        }
        function du(t) {
          return function(e, n, r) {
            return r && typeof r != "number" && kt(e, n, r) && (n = r = i), e = Me(e), n === i ? (n = e, e = 0) : n = Me(n), r = r === i ? e < n ? 1 : -1 : Me(r), $f(e, n, r, t);
          };
        }
        function Er(t) {
          return function(e, n) {
            return typeof e == "string" && typeof n == "string" || (e = ae(e), n = ae(n)), t(e, n);
          };
        }
        function _u(t, e, n, r, a, c, h, p, m, b) {
          var A = e & it, E = A ? h : i, M = A ? i : h, D = A ? c : i, U = A ? i : c;
          e |= A ? xt : Re, e &= ~(A ? Re : xt), e & tt || (e &= -4);
          var J = [
            t,
            e,
            a,
            D,
            E,
            U,
            M,
            p,
            m,
            b
          ], N = n.apply(i, J);
          return es(t) && Fu(N, J), N.placeholder = r, Tu(N, t, e);
        }
        function Zi(t) {
          var e = St[t];
          return function(n, r) {
            if (n = ae(n), r = r == null ? 0 : Tt(K(r), 292), r && Ta(n)) {
              var a = (nt(n) + "e").split("e"), c = e(a[0] + "e" + (+a[1] + r));
              return a = (nt(c) + "e").split("e"), +(a[0] + "e" + (+a[1] - r));
            }
            return e(n);
          };
        }
        var rh = fn && 1 / er(new fn([, -0]))[1] == nn ? function(t) {
          return new fn(t);
        } : _s;
        function vu(t) {
          return function(e) {
            var n = Mt(e);
            return n == dt ? bi(e) : n == ht ? wl(e) : fl(e, t(e));
          };
        }
        function Ee(t, e, n, r, a, c, h, p) {
          var m = e & z;
          if (!m && typeof t != "function")
            throw new ee(g);
          var b = r ? r.length : 0;
          if (b || (e &= -97, r = a = i), h = h === i ? h : bt(K(h), 0), p = p === i ? p : K(p), b -= a ? a.length : 0, e & Re) {
            var A = r, E = a;
            r = a = i;
          }
          var M = m ? i : Qi(t), D = [
            t,
            e,
            n,
            r,
            a,
            A,
            E,
            c,
            h,
            p
          ];
          if (M && mh(D, M), t = D[0], e = D[1], n = D[2], r = D[3], a = D[4], p = D[9] = D[9] === i ? m ? 0 : t.length : bt(D[9] - b, 0), !p && e & (it | vt) && (e &= -25), !e || e == W)
            var U = th(t, e, n);
          else e == it || e == vt ? U = eh(t, e, p) : (e == xt || e == (W | xt)) && !a.length ? U = nh(t, e, n, r) : U = Sr.apply(i, D);
          var J = M ? Qa : Fu;
          return Tu(J(U, D), t, e);
        }
        function mu(t, e, n, r) {
          return t === i || fe(t, ln[n]) && !rt.call(r, n) ? e : t;
        }
        function wu(t, e, n, r, a, c) {
          return gt(t) && gt(e) && (c.set(e, t), wr(t, e, i, wu, c), c.delete(e)), t;
        }
        function ih(t) {
          return $n(t) ? i : t;
        }
        function yu(t, e, n, r, a, c) {
          var h = n & L, p = t.length, m = e.length;
          if (p != m && !(h && m > p))
            return !1;
          var b = c.get(t), A = c.get(e);
          if (b && A)
            return b == e && A == t;
          var E = -1, M = !0, D = n & T ? new Xe() : i;
          for (c.set(t, e), c.set(e, t); ++E < p; ) {
            var U = t[E], J = e[E];
            if (r)
              var N = h ? r(J, U, E, e, t, c) : r(U, J, E, t, e, c);
            if (N !== i) {
              if (N)
                continue;
              M = !1;
              break;
            }
            if (D) {
              if (!mi(e, function(X, V) {
                if (!In(D, V) && (U === X || a(U, X, n, r, c)))
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
        function sh(t, e, n, r, a, c, h) {
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
              var p = bi;
            case ht:
              var m = r & L;
              if (p || (p = er), t.size != e.size && !m)
                return !1;
              var b = h.get(t);
              if (b)
                return b == e;
              r |= T, h.set(t, e);
              var A = yu(p(t), p(e), r, a, c, h);
              return h.delete(t), A;
            case Yn:
              if (Pn)
                return Pn.call(t) == Pn.call(e);
          }
          return !1;
        }
        function ah(t, e, n, r, a, c) {
          var h = n & L, p = Yi(t), m = p.length, b = Yi(e), A = b.length;
          if (m != A && !h)
            return !1;
          for (var E = m; E--; ) {
            var M = p[E];
            if (!(h ? M in e : rt.call(e, M)))
              return !1;
          }
          var D = c.get(t), U = c.get(e);
          if (D && U)
            return D == e && U == t;
          var J = !0;
          c.set(t, e), c.set(e, t);
          for (var N = h; ++E < m; ) {
            M = p[E];
            var X = t[M], V = e[M];
            if (r)
              var Yt = h ? r(V, X, M, e, t, c) : r(X, V, M, t, e, c);
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
          return rs(Eu(t, i, ku), t + "");
        }
        function Yi(t) {
          return Na(t, At, ji);
        }
        function Xi(t) {
          return Na(t, qt, Cu);
        }
        var Qi = pr ? function(t) {
          return pr.get(t);
        } : _s;
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
          var t = u.iteratee || gs;
          return t = t === gs ? Ga : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function Fr(t, e) {
          var n = t.__data__;
          return gh(e) ? n[typeof e == "string" ? "string" : "hash"] : n.map;
        }
        function Vi(t) {
          for (var e = At(t), n = e.length; n--; ) {
            var r = e[n], a = t[r];
            e[n] = [r, a, bu(a)];
          }
          return e;
        }
        function je(t, e) {
          var n = _l(t, e);
          return qa(n) ? n : i;
        }
        function uh(t) {
          var e = rt.call(t, Ze), n = t[Ze];
          try {
            t[Ze] = i;
            var r = !0;
          } catch {
          }
          var a = sr.call(t);
          return r && (e ? t[Ze] = n : delete t[Ze]), a;
        }
        var ji = Ei ? function(t) {
          return t == null ? [] : (t = st(t), De(Ei(t), function(e) {
            return Ia.call(t, e);
          }));
        } : vs, Cu = Ei ? function(t) {
          for (var e = []; t; )
            We(e, ji(t)), t = or(t);
          return e;
        } : vs, Mt = Ot;
        (Ii && Mt(new Ii(new ArrayBuffer(1))) != rn || Tn && Mt(new Tn()) != dt || Fi && Mt(Fi.resolve()) != Ut || fn && Mt(new fn()) != ht || Mn && Mt(new Mn()) != An) && (Mt = function(t) {
          var e = Ot(t), n = e == Ct ? t.constructor : i, r = n ? tn(n) : "";
          if (r)
            switch (r) {
              case ql:
                return rn;
              case Gl:
                return dt;
              case Hl:
                return Ut;
              case zl:
                return ht;
              case Kl:
                return An;
            }
          return e;
        });
        function oh(t, e, n) {
          for (var r = -1, a = n.length; ++r < a; ) {
            var c = n[r], h = c.size;
            switch (c.type) {
              case "drop":
                t += h;
                break;
              case "dropRight":
                e -= h;
                break;
              case "take":
                e = Tt(e, t + h);
                break;
              case "takeRight":
                t = bt(t, e - h);
                break;
            }
          }
          return { start: t, end: e };
        }
        function ch(t) {
          var e = t.match(gc);
          return e ? e[1].split(dc) : [];
        }
        function xu(t, e, n) {
          e = qe(e, t);
          for (var r = -1, a = e.length, c = !1; ++r < a; ) {
            var h = we(e[r]);
            if (!(c = t != null && n(t, h)))
              break;
            t = t[h];
          }
          return c || ++r != a ? c : (a = t == null ? 0 : t.length, !!a && kr(a) && Fe(h, a) && (H(t) || en(t)));
        }
        function lh(t) {
          var e = t.length, n = new t.constructor(e);
          return e && typeof t[0] == "string" && rt.call(t, "index") && (n.index = t.index, n.input = t.input), n;
        }
        function Su(t) {
          return typeof t.constructor == "function" && !Un(t) ? pn(or(t)) : {};
        }
        function fh(t, e, n) {
          var r = t.constructor;
          switch (e) {
            case En:
              return Ki(t);
            case ot:
            case yt:
              return new r(+t);
            case rn:
              return Zf(t, n);
            case Vr:
            case jr:
            case ti:
            case ei:
            case ni:
            case ri:
            case ii:
            case si:
            case ai:
              return su(t, n);
            case dt:
              return new r();
            case Rt:
            case _e:
              return new r(t);
            case Vt:
              return Yf(t);
            case ht:
              return new r();
            case Yn:
              return Xf(t);
          }
        }
        function hh(t, e) {
          var n = e.length;
          if (!n)
            return t;
          var r = n - 1;
          return e[r] = (n > 1 ? "& " : "") + e[r], e = e.join(n > 2 ? ", " : " "), t.replace(pc, `{
/* [wrapped with ` + e + `] */
`);
        }
        function ph(t) {
          return H(t) || en(t) || !!(Fa && t && t[Fa]);
        }
        function Fe(t, e) {
          var n = typeof t;
          return e = e ?? Oe, !!e && (n == "number" || n != "symbol" && bc.test(t)) && t > -1 && t % 1 == 0 && t < e;
        }
        function kt(t, e, n) {
          if (!gt(n))
            return !1;
          var r = typeof e;
          return (r == "number" ? $t(n) && Fe(e, n.length) : r == "string" && e in n) ? fe(n[e], t) : !1;
        }
        function ts(t, e) {
          if (H(t))
            return !1;
          var n = typeof t;
          return n == "number" || n == "symbol" || n == "boolean" || t == null || Zt(t) ? !0 : cc.test(t) || !oc.test(t) || e != null && t in st(e);
        }
        function gh(t) {
          var e = typeof t;
          return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
        }
        function es(t) {
          var e = Ir(t), n = u[e];
          if (typeof n != "function" || !(e in Q.prototype))
            return !1;
          if (t === n)
            return !0;
          var r = Qi(n);
          return !!r && t === r[0];
        }
        function dh(t) {
          return !!ba && ba in t;
        }
        var _h = rr ? Te : ms;
        function Un(t) {
          var e = t && t.constructor, n = typeof e == "function" && e.prototype || ln;
          return t === n;
        }
        function bu(t) {
          return t === t && !gt(t);
        }
        function Au(t, e) {
          return function(n) {
            return n == null ? !1 : n[t] === e && (e !== i || t in st(n));
          };
        }
        function vh(t) {
          var e = Rr(t, function(r) {
            return n.size === C && n.clear(), r;
          }), n = e.cache;
          return e;
        }
        function mh(t, e) {
          var n = t[1], r = e[1], a = n | r, c = a < (W | z | Ft), h = r == Ft && n == it || r == Ft && n == ge && t[7].length <= e[8] || r == (Ft | ge) && e[7].length <= e[8] && n == it;
          if (!(c || h))
            return t;
          r & W && (t[2] = e[2], a |= n & W ? 0 : tt);
          var p = e[3];
          if (p) {
            var m = t[3];
            t[3] = m ? uu(m, p, e[4]) : p, t[4] = m ? Be(t[3], F) : e[4];
          }
          return p = e[5], p && (m = t[5], t[5] = m ? ou(m, p, e[6]) : p, t[6] = m ? Be(t[5], F) : e[6]), p = e[7], p && (t[7] = p), r & Ft && (t[8] = t[8] == null ? e[8] : Tt(t[8], e[8])), t[9] == null && (t[9] = e[9]), t[0] = e[0], t[1] = a, t;
        }
        function wh(t) {
          var e = [];
          if (t != null)
            for (var n in st(t))
              e.push(n);
          return e;
        }
        function yh(t) {
          return sr.call(t);
        }
        function Eu(t, e, n) {
          return e = bt(e === i ? t.length - 1 : e, 0), function() {
            for (var r = arguments, a = -1, c = bt(r.length - e, 0), h = x(c); ++a < c; )
              h[a] = r[e + a];
            a = -1;
            for (var p = x(e + 1); ++a < e; )
              p[a] = r[a];
            return p[e] = n(h), zt(t, this, p);
          };
        }
        function Iu(t, e) {
          return e.length < 2 ? t : Ve(t, ie(e, 0, -1));
        }
        function Ch(t, e) {
          for (var n = t.length, r = Tt(e.length, n), a = Nt(t); r--; ) {
            var c = e[r];
            t[r] = Fe(c, n) ? a[c] : i;
          }
          return t;
        }
        function ns(t, e) {
          if (!(e === "constructor" && typeof t[e] == "function") && e != "__proto__")
            return t[e];
        }
        var Fu = Mu(Qa), Nn = kl || function(t, e) {
          return Et.setTimeout(t, e);
        }, rs = Mu(Hf);
        function Tu(t, e, n) {
          var r = e + "";
          return rs(t, hh(r, xh(ch(r), n)));
        }
        function Mu(t) {
          var e = 0, n = 0;
          return function() {
            var r = Ul(), a = Xr - (r - n);
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
            var c = Ui(n, a), h = t[c];
            t[c] = t[n], t[n] = h;
          }
          return t.length = e, t;
        }
        var Lu = vh(function(t) {
          var e = [];
          return t.charCodeAt(0) === 46 && e.push(""), t.replace(lc, function(n, r, a, c) {
            e.push(a ? c.replace(mc, "$1") : r || n);
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
        function xh(t, e) {
          return te(lt, function(n) {
            var r = "_." + n[0];
            e & n[1] && !jn(t, r) && t.push(r);
          }), t.sort();
        }
        function Pu(t) {
          if (t instanceof Q)
            return t.clone();
          var e = new ne(t.__wrapped__, t.__chain__);
          return e.__actions__ = Nt(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
        }
        function Sh(t, e, n) {
          (n ? kt(t, e, n) : e === i) ? e = 1 : e = bt(K(e), 0);
          var r = t == null ? 0 : t.length;
          if (!r || e < 1)
            return [];
          for (var a = 0, c = 0, h = x(fr(r / e)); a < r; )
            h[c++] = ie(t, a, a += e);
          return h;
        }
        function bh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, r = 0, a = []; ++e < n; ) {
            var c = t[e];
            c && (a[r++] = c);
          }
          return a;
        }
        function Ah() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var e = x(t - 1), n = arguments[0], r = t; r--; )
            e[r - 1] = arguments[r];
          return We(H(n) ? Nt(n) : [n], It(e, 1));
        }
        var Eh = Z(function(t, e) {
          return mt(t) ? On(t, It(e, 1, mt, !0)) : [];
        }), Ih = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = i), mt(t) ? On(t, It(e, 1, mt, !0), B(n, 2)) : [];
        }), Fh = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = i), mt(t) ? On(t, It(e, 1, mt, !0), i, n) : [];
        });
        function Th(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), ie(t, e < 0 ? 0 : e, r)) : [];
        }
        function Mh(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), e = r - e, ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function Lh(t, e) {
          return t && t.length ? Cr(t, B(e, 3), !0, !0) : [];
        }
        function Ph(t, e) {
          return t && t.length ? Cr(t, B(e, 3), !0) : [];
        }
        function Rh(t, e, n, r) {
          var a = t == null ? 0 : t.length;
          return a ? (n && typeof n != "number" && kt(t, e, n) && (n = 0, r = a), Af(t, e, n, r)) : [];
        }
        function Ru(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = bt(r + a, 0)), tr(t, B(e, 3), a);
        }
        function Ou(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = r - 1;
          return n !== i && (a = K(n), a = n < 0 ? bt(r + a, 0) : Tt(a, r - 1)), tr(t, B(e, 3), a, !0);
        }
        function ku(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, 1) : [];
        }
        function Oh(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, nn) : [];
        }
        function kh(t, e) {
          var n = t == null ? 0 : t.length;
          return n ? (e = e === i ? 1 : K(e), It(t, e)) : [];
        }
        function Dh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, r = {}; ++e < n; ) {
            var a = t[e];
            r[a[0]] = a[1];
          }
          return r;
        }
        function Du(t) {
          return t && t.length ? t[0] : i;
        }
        function Wh(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = bt(r + a, 0)), an(t, e, a);
        }
        function Bh(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 0, -1) : [];
        }
        var Uh = Z(function(t) {
          var e = pt(t, Hi);
          return e.length && e[0] === t[0] ? Oi(e) : [];
        }), Nh = Z(function(t) {
          var e = se(t), n = pt(t, Hi);
          return e === se(n) ? e = i : n.pop(), n.length && n[0] === t[0] ? Oi(n, B(e, 2)) : [];
        }), $h = Z(function(t) {
          var e = se(t), n = pt(t, Hi);
          return e = typeof e == "function" ? e : i, e && n.pop(), n.length && n[0] === t[0] ? Oi(n, i, e) : [];
        });
        function qh(t, e) {
          return t == null ? "" : Wl.call(t, e);
        }
        function se(t) {
          var e = t == null ? 0 : t.length;
          return e ? t[e - 1] : i;
        }
        function Gh(t, e, n) {
          var r = t == null ? 0 : t.length;
          if (!r)
            return -1;
          var a = r;
          return n !== i && (a = K(n), a = a < 0 ? bt(r + a, 0) : Tt(a, r - 1)), e === e ? Cl(t, e, a) : tr(t, _a, a, !0);
        }
        function Hh(t, e) {
          return t && t.length ? Ja(t, K(e)) : i;
        }
        var zh = Z(Wu);
        function Wu(t, e) {
          return t && t.length && e && e.length ? Bi(t, e) : t;
        }
        function Kh(t, e, n) {
          return t && t.length && e && e.length ? Bi(t, e, B(n, 2)) : t;
        }
        function Jh(t, e, n) {
          return t && t.length && e && e.length ? Bi(t, e, i, n) : t;
        }
        var Zh = Ie(function(t, e) {
          var n = t == null ? 0 : t.length, r = Mi(t, e);
          return Xa(t, pt(e, function(a) {
            return Fe(a, n) ? +a : a;
          }).sort(au)), r;
        });
        function Yh(t, e) {
          var n = [];
          if (!(t && t.length))
            return n;
          var r = -1, a = [], c = t.length;
          for (e = B(e, 3); ++r < c; ) {
            var h = t[r];
            e(h, r, t) && (n.push(h), a.push(r));
          }
          return Xa(t, a), n;
        }
        function is(t) {
          return t == null ? t : $l.call(t);
        }
        function Xh(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (n && typeof n != "number" && kt(t, e, n) ? (e = 0, n = r) : (e = e == null ? 0 : K(e), n = n === i ? r : K(n)), ie(t, e, n)) : [];
        }
        function Qh(t, e) {
          return yr(t, e);
        }
        function Vh(t, e, n) {
          return $i(t, e, B(n, 2));
        }
        function jh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var r = yr(t, e);
            if (r < n && fe(t[r], e))
              return r;
          }
          return -1;
        }
        function tp(t, e) {
          return yr(t, e, !0);
        }
        function ep(t, e, n) {
          return $i(t, e, B(n, 2), !0);
        }
        function np(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var r = yr(t, e, !0) - 1;
            if (fe(t[r], e))
              return r;
          }
          return -1;
        }
        function rp(t) {
          return t && t.length ? Va(t) : [];
        }
        function ip(t, e) {
          return t && t.length ? Va(t, B(e, 2)) : [];
        }
        function sp(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 1, e) : [];
        }
        function ap(t, e, n) {
          return t && t.length ? (e = n || e === i ? 1 : K(e), ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function up(t, e, n) {
          var r = t == null ? 0 : t.length;
          return r ? (e = n || e === i ? 1 : K(e), e = r - e, ie(t, e < 0 ? 0 : e, r)) : [];
        }
        function op(t, e) {
          return t && t.length ? Cr(t, B(e, 3), !1, !0) : [];
        }
        function cp(t, e) {
          return t && t.length ? Cr(t, B(e, 3)) : [];
        }
        var lp = Z(function(t) {
          return $e(It(t, 1, mt, !0));
        }), fp = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = i), $e(It(t, 1, mt, !0), B(e, 2));
        }), hp = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : i, $e(It(t, 1, mt, !0), i, e);
        });
        function pp(t) {
          return t && t.length ? $e(t) : [];
        }
        function gp(t, e) {
          return t && t.length ? $e(t, B(e, 2)) : [];
        }
        function dp(t, e) {
          return e = typeof e == "function" ? e : i, t && t.length ? $e(t, i, e) : [];
        }
        function ss(t) {
          if (!(t && t.length))
            return [];
          var e = 0;
          return t = De(t, function(n) {
            if (mt(n))
              return e = bt(n.length, e), !0;
          }), xi(e, function(n) {
            return pt(t, wi(n));
          });
        }
        function Bu(t, e) {
          if (!(t && t.length))
            return [];
          var n = ss(t);
          return e == null ? n : pt(n, function(r) {
            return zt(e, i, r);
          });
        }
        var _p = Z(function(t, e) {
          return mt(t) ? On(t, e) : [];
        }), vp = Z(function(t) {
          return Gi(De(t, mt));
        }), mp = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = i), Gi(De(t, mt), B(e, 2));
        }), wp = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : i, Gi(De(t, mt), i, e);
        }), yp = Z(ss);
        function Cp(t, e) {
          return nu(t || [], e || [], Rn);
        }
        function xp(t, e) {
          return nu(t || [], e || [], Wn);
        }
        var Sp = Z(function(t) {
          var e = t.length, n = e > 1 ? t[e - 1] : i;
          return n = typeof n == "function" ? (t.pop(), n) : i, Bu(t, n);
        });
        function Uu(t) {
          var e = u(t);
          return e.__chain__ = !0, e;
        }
        function bp(t, e) {
          return e(t), t;
        }
        function Mr(t, e) {
          return e(t);
        }
        var Ap = Ie(function(t) {
          var e = t.length, n = e ? t[0] : 0, r = this.__wrapped__, a = function(c) {
            return Mi(c, t);
          };
          return e > 1 || this.__actions__.length || !(r instanceof Q) || !Fe(n) ? this.thru(a) : (r = r.slice(n, +n + (e ? 1 : 0)), r.__actions__.push({
            func: Mr,
            args: [a],
            thisArg: i
          }), new ne(r, this.__chain__).thru(function(c) {
            return e && !c.length && c.push(i), c;
          }));
        });
        function Ep() {
          return Uu(this);
        }
        function Ip() {
          return new ne(this.value(), this.__chain__);
        }
        function Fp() {
          this.__values__ === i && (this.__values__ = ju(this.value()));
          var t = this.__index__ >= this.__values__.length, e = t ? i : this.__values__[this.__index__++];
          return { done: t, value: e };
        }
        function Tp() {
          return this;
        }
        function Mp(t) {
          for (var e, n = this; n instanceof dr; ) {
            var r = Pu(n);
            r.__index__ = 0, r.__values__ = i, e ? a.__wrapped__ = r : e = r;
            var a = r;
            n = n.__wrapped__;
          }
          return a.__wrapped__ = t, e;
        }
        function Lp() {
          var t = this.__wrapped__;
          if (t instanceof Q) {
            var e = t;
            return this.__actions__.length && (e = new Q(this)), e = e.reverse(), e.__actions__.push({
              func: Mr,
              args: [is],
              thisArg: i
            }), new ne(e, this.__chain__);
          }
          return this.thru(is);
        }
        function Pp() {
          return eu(this.__wrapped__, this.__actions__);
        }
        var Rp = xr(function(t, e, n) {
          rt.call(t, n) ? ++t[n] : Ae(t, n, 1);
        });
        function Op(t, e, n) {
          var r = H(t) ? ga : bf;
          return n && kt(t, e, n) && (e = i), r(t, B(e, 3));
        }
        function kp(t, e) {
          var n = H(t) ? De : Ba;
          return n(t, B(e, 3));
        }
        var Dp = hu(Ru), Wp = hu(Ou);
        function Bp(t, e) {
          return It(Lr(t, e), 1);
        }
        function Up(t, e) {
          return It(Lr(t, e), nn);
        }
        function Np(t, e, n) {
          return n = n === i ? 1 : K(n), It(Lr(t, e), n);
        }
        function Nu(t, e) {
          var n = H(t) ? te : Ne;
          return n(t, B(e, 3));
        }
        function $u(t, e) {
          var n = H(t) ? il : Wa;
          return n(t, B(e, 3));
        }
        var $p = xr(function(t, e, n) {
          rt.call(t, n) ? t[n].push(e) : Ae(t, n, [e]);
        });
        function qp(t, e, n, r) {
          t = $t(t) ? t : mn(t), n = n && !r ? K(n) : 0;
          var a = t.length;
          return n < 0 && (n = bt(a + n, 0)), Dr(t) ? n <= a && t.indexOf(e, n) > -1 : !!a && an(t, e, n) > -1;
        }
        var Gp = Z(function(t, e, n) {
          var r = -1, a = typeof e == "function", c = $t(t) ? x(t.length) : [];
          return Ne(t, function(h) {
            c[++r] = a ? zt(e, h, n) : kn(h, e, n);
          }), c;
        }), Hp = xr(function(t, e, n) {
          Ae(t, n, e);
        });
        function Lr(t, e) {
          var n = H(t) ? pt : Ha;
          return n(t, B(e, 3));
        }
        function zp(t, e, n, r) {
          return t == null ? [] : (H(e) || (e = e == null ? [] : [e]), n = r ? i : n, H(n) || (n = n == null ? [] : [n]), Za(t, e, n));
        }
        var Kp = xr(function(t, e, n) {
          t[n ? 0 : 1].push(e);
        }, function() {
          return [[], []];
        });
        function Jp(t, e, n) {
          var r = H(t) ? vi : ma, a = arguments.length < 3;
          return r(t, B(e, 4), n, a, Ne);
        }
        function Zp(t, e, n) {
          var r = H(t) ? sl : ma, a = arguments.length < 3;
          return r(t, B(e, 4), n, a, Wa);
        }
        function Yp(t, e) {
          var n = H(t) ? De : Ba;
          return n(t, Or(B(e, 3)));
        }
        function Xp(t) {
          var e = H(t) ? Ra : qf;
          return e(t);
        }
        function Qp(t, e, n) {
          (n ? kt(t, e, n) : e === i) ? e = 1 : e = K(e);
          var r = H(t) ? wf : Gf;
          return r(t, e);
        }
        function Vp(t) {
          var e = H(t) ? yf : zf;
          return e(t);
        }
        function jp(t) {
          if (t == null)
            return 0;
          if ($t(t))
            return Dr(t) ? on(t) : t.length;
          var e = Mt(t);
          return e == dt || e == ht ? t.size : Di(t).length;
        }
        function tg(t, e, n) {
          var r = H(t) ? mi : Kf;
          return n && kt(t, e, n) && (e = i), r(t, B(e, 3));
        }
        var eg = Z(function(t, e) {
          if (t == null)
            return [];
          var n = e.length;
          return n > 1 && kt(t, e[0], e[1]) ? e = [] : n > 2 && kt(e[0], e[1], e[2]) && (e = [e[0]]), Za(t, It(e, 1), []);
        }), Pr = Ol || function() {
          return Et.Date.now();
        };
        function ng(t, e) {
          if (typeof e != "function")
            throw new ee(g);
          return t = K(t), function() {
            if (--t < 1)
              return e.apply(this, arguments);
          };
        }
        function qu(t, e, n) {
          return e = n ? i : e, e = t && e == null ? t.length : e, Ee(t, Ft, i, i, i, i, e);
        }
        function Gu(t, e) {
          var n;
          if (typeof e != "function")
            throw new ee(g);
          return t = K(t), function() {
            return --t > 0 && (n = e.apply(this, arguments)), t <= 1 && (e = i), n;
          };
        }
        var as = Z(function(t, e, n) {
          var r = W;
          if (n.length) {
            var a = Be(n, _n(as));
            r |= xt;
          }
          return Ee(t, r, e, n, a);
        }), Hu = Z(function(t, e, n) {
          var r = W | z;
          if (n.length) {
            var a = Be(n, _n(Hu));
            r |= xt;
          }
          return Ee(e, r, t, n, a);
        });
        function zu(t, e, n) {
          e = n ? i : e;
          var r = Ee(t, it, i, i, i, i, i, e);
          return r.placeholder = zu.placeholder, r;
        }
        function Ku(t, e, n) {
          e = n ? i : e;
          var r = Ee(t, vt, i, i, i, i, i, e);
          return r.placeholder = Ku.placeholder, r;
        }
        function Ju(t, e, n) {
          var r, a, c, h, p, m, b = 0, A = !1, E = !1, M = !0;
          if (typeof t != "function")
            throw new ee(g);
          e = ae(e) || 0, gt(n) && (A = !!n.leading, E = "maxWait" in n, c = E ? bt(ae(n.maxWait) || 0, e) : c, M = "trailing" in n ? !!n.trailing : M);
          function D(wt) {
            var he = r, Le = a;
            return r = a = i, b = wt, h = t.apply(Le, he), h;
          }
          function U(wt) {
            return b = wt, p = Nn(X, e), A ? D(wt) : h;
          }
          function J(wt) {
            var he = wt - m, Le = wt - b, ho = e - he;
            return E ? Tt(ho, c - Le) : ho;
          }
          function N(wt) {
            var he = wt - m, Le = wt - b;
            return m === i || he >= e || he < 0 || E && Le >= c;
          }
          function X() {
            var wt = Pr();
            if (N(wt))
              return V(wt);
            p = Nn(X, J(wt));
          }
          function V(wt) {
            return p = i, M && r ? D(wt) : (r = a = i, h);
          }
          function Yt() {
            p !== i && ru(p), b = 0, r = m = a = p = i;
          }
          function Dt() {
            return p === i ? h : V(Pr());
          }
          function Xt() {
            var wt = Pr(), he = N(wt);
            if (r = arguments, a = this, m = wt, he) {
              if (p === i)
                return U(m);
              if (E)
                return ru(p), p = Nn(X, e), D(m);
            }
            return p === i && (p = Nn(X, e)), h;
          }
          return Xt.cancel = Yt, Xt.flush = Dt, Xt;
        }
        var rg = Z(function(t, e) {
          return Da(t, 1, e);
        }), ig = Z(function(t, e, n) {
          return Da(t, ae(e) || 0, n);
        });
        function sg(t) {
          return Ee(t, Ce);
        }
        function Rr(t, e) {
          if (typeof t != "function" || e != null && typeof e != "function")
            throw new ee(g);
          var n = function() {
            var r = arguments, a = e ? e.apply(this, r) : r[0], c = n.cache;
            if (c.has(a))
              return c.get(a);
            var h = t.apply(this, r);
            return n.cache = c.set(a, h) || c, h;
          };
          return n.cache = new (Rr.Cache || be)(), n;
        }
        Rr.Cache = be;
        function Or(t) {
          if (typeof t != "function")
            throw new ee(g);
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
        function ag(t) {
          return Gu(2, t);
        }
        var ug = Jf(function(t, e) {
          e = e.length == 1 && H(e[0]) ? pt(e[0], Kt(B())) : pt(It(e, 1), Kt(B()));
          var n = e.length;
          return Z(function(r) {
            for (var a = -1, c = Tt(r.length, n); ++a < c; )
              r[a] = e[a].call(this, r[a]);
            return zt(t, this, r);
          });
        }), us = Z(function(t, e) {
          var n = Be(e, _n(us));
          return Ee(t, xt, i, e, n);
        }), Zu = Z(function(t, e) {
          var n = Be(e, _n(Zu));
          return Ee(t, Re, i, e, n);
        }), og = Ie(function(t, e) {
          return Ee(t, ge, i, i, i, e);
        });
        function cg(t, e) {
          if (typeof t != "function")
            throw new ee(g);
          return e = e === i ? e : K(e), Z(t, e);
        }
        function lg(t, e) {
          if (typeof t != "function")
            throw new ee(g);
          return e = e == null ? 0 : bt(K(e), 0), Z(function(n) {
            var r = n[e], a = Ge(n, 0, e);
            return r && We(a, r), zt(t, this, a);
          });
        }
        function fg(t, e, n) {
          var r = !0, a = !0;
          if (typeof t != "function")
            throw new ee(g);
          return gt(n) && (r = "leading" in n ? !!n.leading : r, a = "trailing" in n ? !!n.trailing : a), Ju(t, e, {
            leading: r,
            maxWait: e,
            trailing: a
          });
        }
        function hg(t) {
          return qu(t, 1);
        }
        function pg(t, e) {
          return us(zi(e), t);
        }
        function gg() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return H(t) ? t : [t];
        }
        function dg(t) {
          return re(t, k);
        }
        function _g(t, e) {
          return e = typeof e == "function" ? e : i, re(t, k, e);
        }
        function vg(t) {
          return re(t, w | k);
        }
        function mg(t, e) {
          return e = typeof e == "function" ? e : i, re(t, w | k, e);
        }
        function wg(t, e) {
          return e == null || ka(t, e, At(e));
        }
        function fe(t, e) {
          return t === e || t !== t && e !== e;
        }
        var yg = Er(Ri), Cg = Er(function(t, e) {
          return t >= e;
        }), en = $a(/* @__PURE__ */ function() {
          return arguments;
        }()) ? $a : function(t) {
          return _t(t) && rt.call(t, "callee") && !Ia.call(t, "callee");
        }, H = x.isArray, xg = oa ? Kt(oa) : Mf;
        function $t(t) {
          return t != null && kr(t.length) && !Te(t);
        }
        function mt(t) {
          return _t(t) && $t(t);
        }
        function Sg(t) {
          return t === !0 || t === !1 || _t(t) && Ot(t) == ot;
        }
        var He = Dl || ms, bg = ca ? Kt(ca) : Lf;
        function Ag(t) {
          return _t(t) && t.nodeType === 1 && !$n(t);
        }
        function Eg(t) {
          if (t == null)
            return !0;
          if ($t(t) && (H(t) || typeof t == "string" || typeof t.splice == "function" || He(t) || vn(t) || en(t)))
            return !t.length;
          var e = Mt(t);
          if (e == dt || e == ht)
            return !t.size;
          if (Un(t))
            return !Di(t).length;
          for (var n in t)
            if (rt.call(t, n))
              return !1;
          return !0;
        }
        function Ig(t, e) {
          return Dn(t, e);
        }
        function Fg(t, e, n) {
          n = typeof n == "function" ? n : i;
          var r = n ? n(t, e) : i;
          return r === i ? Dn(t, e, i, n) : !!r;
        }
        function os(t) {
          if (!_t(t))
            return !1;
          var e = Ot(t);
          return e == Pt || e == Ht || typeof t.message == "string" && typeof t.name == "string" && !$n(t);
        }
        function Tg(t) {
          return typeof t == "number" && Ta(t);
        }
        function Te(t) {
          if (!gt(t))
            return !1;
          var e = Ot(t);
          return e == Bt || e == de || e == at || e == oe;
        }
        function Yu(t) {
          return typeof t == "number" && t == K(t);
        }
        function kr(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= Oe;
        }
        function gt(t) {
          var e = typeof t;
          return t != null && (e == "object" || e == "function");
        }
        function _t(t) {
          return t != null && typeof t == "object";
        }
        var Xu = la ? Kt(la) : Rf;
        function Mg(t, e) {
          return t === e || ki(t, e, Vi(e));
        }
        function Lg(t, e, n) {
          return n = typeof n == "function" ? n : i, ki(t, e, Vi(e), n);
        }
        function Pg(t) {
          return Qu(t) && t != +t;
        }
        function Rg(t) {
          if (_h(t))
            throw new G(v);
          return qa(t);
        }
        function Og(t) {
          return t === null;
        }
        function kg(t) {
          return t == null;
        }
        function Qu(t) {
          return typeof t == "number" || _t(t) && Ot(t) == Rt;
        }
        function $n(t) {
          if (!_t(t) || Ot(t) != Ct)
            return !1;
          var e = or(t);
          if (e === null)
            return !0;
          var n = rt.call(e, "constructor") && e.constructor;
          return typeof n == "function" && n instanceof n && ir.call(n) == Ml;
        }
        var cs = fa ? Kt(fa) : Of;
        function Dg(t) {
          return Yu(t) && t >= -9007199254740991 && t <= Oe;
        }
        var Vu = ha ? Kt(ha) : kf;
        function Dr(t) {
          return typeof t == "string" || !H(t) && _t(t) && Ot(t) == _e;
        }
        function Zt(t) {
          return typeof t == "symbol" || _t(t) && Ot(t) == Yn;
        }
        var vn = pa ? Kt(pa) : Df;
        function Wg(t) {
          return t === i;
        }
        function Bg(t) {
          return _t(t) && Mt(t) == An;
        }
        function Ug(t) {
          return _t(t) && Ot(t) == tc;
        }
        var Ng = Er(Wi), $g = Er(function(t, e) {
          return t <= e;
        });
        function ju(t) {
          if (!t)
            return [];
          if ($t(t))
            return Dr(t) ? ce(t) : Nt(t);
          if (Fn && t[Fn])
            return ml(t[Fn]());
          var e = Mt(t), n = e == dt ? bi : e == ht ? er : mn;
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
        function to(t) {
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
          t = wa(t);
          var n = Cc.test(t);
          return n || Sc.test(t) ? el(t.slice(2), n ? 2 : 8) : yc.test(t) ? xe : +t;
        }
        function eo(t) {
          return me(t, qt(t));
        }
        function qg(t) {
          return t ? Qe(K(t), -9007199254740991, Oe) : t === 0 ? t : 0;
        }
        function nt(t) {
          return t == null ? "" : Jt(t);
        }
        var Gg = gn(function(t, e) {
          if (Un(e) || $t(e)) {
            me(e, At(e), t);
            return;
          }
          for (var n in e)
            rt.call(e, n) && Rn(t, n, e[n]);
        }), no = gn(function(t, e) {
          me(e, qt(e), t);
        }), Wr = gn(function(t, e, n, r) {
          me(e, qt(e), t, r);
        }), Hg = gn(function(t, e, n, r) {
          me(e, At(e), t, r);
        }), zg = Ie(Mi);
        function Kg(t, e) {
          var n = pn(t);
          return e == null ? n : Oa(n, e);
        }
        var Jg = Z(function(t, e) {
          t = st(t);
          var n = -1, r = e.length, a = r > 2 ? e[2] : i;
          for (a && kt(e[0], e[1], a) && (r = 1); ++n < r; )
            for (var c = e[n], h = qt(c), p = -1, m = h.length; ++p < m; ) {
              var b = h[p], A = t[b];
              (A === i || fe(A, ln[b]) && !rt.call(t, b)) && (t[b] = c[b]);
            }
          return t;
        }), Zg = Z(function(t) {
          return t.push(i, wu), zt(ro, i, t);
        });
        function Yg(t, e) {
          return da(t, B(e, 3), ve);
        }
        function Xg(t, e) {
          return da(t, B(e, 3), Pi);
        }
        function Qg(t, e) {
          return t == null ? t : Li(t, B(e, 3), qt);
        }
        function Vg(t, e) {
          return t == null ? t : Ua(t, B(e, 3), qt);
        }
        function jg(t, e) {
          return t && ve(t, B(e, 3));
        }
        function td(t, e) {
          return t && Pi(t, B(e, 3));
        }
        function ed(t) {
          return t == null ? [] : mr(t, At(t));
        }
        function nd(t) {
          return t == null ? [] : mr(t, qt(t));
        }
        function ls(t, e, n) {
          var r = t == null ? i : Ve(t, e);
          return r === i ? n : r;
        }
        function rd(t, e) {
          return t != null && xu(t, e, Ef);
        }
        function fs(t, e) {
          return t != null && xu(t, e, If);
        }
        var id = gu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = sr.call(e)), t[e] = n;
        }, ps(Gt)), sd = gu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = sr.call(e)), rt.call(t, e) ? t[e].push(n) : t[e] = [n];
        }, B), ad = Z(kn);
        function At(t) {
          return $t(t) ? Pa(t) : Di(t);
        }
        function qt(t) {
          return $t(t) ? Pa(t, !0) : Wf(t);
        }
        function ud(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(r, a, c) {
            Ae(n, e(r, a, c), r);
          }), n;
        }
        function od(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(r, a, c) {
            Ae(n, a, e(r, a, c));
          }), n;
        }
        var cd = gn(function(t, e, n) {
          wr(t, e, n);
        }), ro = gn(function(t, e, n, r) {
          wr(t, e, n, r);
        }), ld = Ie(function(t, e) {
          var n = {};
          if (t == null)
            return n;
          var r = !1;
          e = pt(e, function(c) {
            return c = qe(c, t), r || (r = c.length > 1), c;
          }), me(t, Xi(t), n), r && (n = re(n, w | R | k, ih));
          for (var a = e.length; a--; )
            qi(n, e[a]);
          return n;
        });
        function fd(t, e) {
          return io(t, Or(B(e)));
        }
        var hd = Ie(function(t, e) {
          return t == null ? {} : Uf(t, e);
        });
        function io(t, e) {
          if (t == null)
            return {};
          var n = pt(Xi(t), function(r) {
            return [r];
          });
          return e = B(e), Ya(t, n, function(r, a) {
            return e(r, a[0]);
          });
        }
        function pd(t, e, n) {
          e = qe(e, t);
          var r = -1, a = e.length;
          for (a || (a = 1, t = i); ++r < a; ) {
            var c = t == null ? i : t[we(e[r])];
            c === i && (r = a, c = n), t = Te(c) ? c.call(t) : c;
          }
          return t;
        }
        function gd(t, e, n) {
          return t == null ? t : Wn(t, e, n);
        }
        function dd(t, e, n, r) {
          return r = typeof r == "function" ? r : i, t == null ? t : Wn(t, e, n, r);
        }
        var so = vu(At), ao = vu(qt);
        function _d(t, e, n) {
          var r = H(t), a = r || He(t) || vn(t);
          if (e = B(e, 4), n == null) {
            var c = t && t.constructor;
            a ? n = r ? new c() : [] : gt(t) ? n = Te(c) ? pn(or(t)) : {} : n = {};
          }
          return (a ? te : ve)(t, function(h, p, m) {
            return e(n, h, p, m);
          }), n;
        }
        function vd(t, e) {
          return t == null ? !0 : qi(t, e);
        }
        function md(t, e, n) {
          return t == null ? t : tu(t, e, zi(n));
        }
        function wd(t, e, n, r) {
          return r = typeof r == "function" ? r : i, t == null ? t : tu(t, e, zi(n), r);
        }
        function mn(t) {
          return t == null ? [] : Si(t, At(t));
        }
        function yd(t) {
          return t == null ? [] : Si(t, qt(t));
        }
        function Cd(t, e, n) {
          return n === i && (n = e, e = i), n !== i && (n = ae(n), n = n === n ? n : 0), e !== i && (e = ae(e), e = e === e ? e : 0), Qe(ae(t), e, n);
        }
        function xd(t, e, n) {
          return e = Me(e), n === i ? (n = e, e = 0) : n = Me(n), t = ae(t), Ff(t, e, n);
        }
        function Sd(t, e, n) {
          if (n && typeof n != "boolean" && kt(t, e, n) && (e = n = i), n === i && (typeof e == "boolean" ? (n = e, e = i) : typeof t == "boolean" && (n = t, t = i)), t === i && e === i ? (t = 0, e = 1) : (t = Me(t), e === i ? (e = t, t = 0) : e = Me(e)), t > e) {
            var r = t;
            t = e, e = r;
          }
          if (n || t % 1 || e % 1) {
            var a = Ma();
            return Tt(t + a * (e - t + tl("1e-" + ((a + "").length - 1))), e);
          }
          return Ui(t, e);
        }
        var bd = dn(function(t, e, n) {
          return e = e.toLowerCase(), t + (n ? uo(e) : e);
        });
        function uo(t) {
          return hs(nt(t).toLowerCase());
        }
        function oo(t) {
          return t = nt(t), t && t.replace(Ac, pl).replace(Hc, "");
        }
        function Ad(t, e, n) {
          t = nt(t), e = Jt(e);
          var r = t.length;
          n = n === i ? r : Qe(K(n), 0, r);
          var a = n;
          return n -= e.length, n >= 0 && t.slice(n, a) == e;
        }
        function Ed(t) {
          return t = nt(t), t && sc.test(t) ? t.replace(Us, gl) : t;
        }
        function Id(t) {
          return t = nt(t), t && fc.test(t) ? t.replace(ui, "\\$&") : t;
        }
        var Fd = dn(function(t, e, n) {
          return t + (n ? "-" : "") + e.toLowerCase();
        }), Td = dn(function(t, e, n) {
          return t + (n ? " " : "") + e.toLowerCase();
        }), Md = fu("toLowerCase");
        function Ld(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? on(t) : 0;
          if (!e || r >= e)
            return t;
          var a = (e - r) / 2;
          return Ar(hr(a), n) + t + Ar(fr(a), n);
        }
        function Pd(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? on(t) : 0;
          return e && r < e ? t + Ar(e - r, n) : t;
        }
        function Rd(t, e, n) {
          t = nt(t), e = K(e);
          var r = e ? on(t) : 0;
          return e && r < e ? Ar(e - r, n) + t : t;
        }
        function Od(t, e, n) {
          return n || e == null ? e = 0 : e && (e = +e), Nl(nt(t).replace(oi, ""), e || 0);
        }
        function kd(t, e, n) {
          return (n ? kt(t, e, n) : e === i) ? e = 1 : e = K(e), Ni(nt(t), e);
        }
        function Dd() {
          var t = arguments, e = nt(t[0]);
          return t.length < 3 ? e : e.replace(t[1], t[2]);
        }
        var Wd = dn(function(t, e, n) {
          return t + (n ? "_" : "") + e.toLowerCase();
        });
        function Bd(t, e, n) {
          return n && typeof n != "number" && kt(t, e, n) && (e = n = i), n = n === i ? P : n >>> 0, n ? (t = nt(t), t && (typeof e == "string" || e != null && !cs(e)) && (e = Jt(e), !e && un(t)) ? Ge(ce(t), 0, n) : t.split(e, n)) : [];
        }
        var Ud = dn(function(t, e, n) {
          return t + (n ? " " : "") + hs(e);
        });
        function Nd(t, e, n) {
          return t = nt(t), n = n == null ? 0 : Qe(K(n), 0, t.length), e = Jt(e), t.slice(n, n + e.length) == e;
        }
        function $d(t, e, n) {
          var r = u.templateSettings;
          n && kt(t, e, n) && (e = i), t = nt(t), e = Wr({}, e, r, mu);
          var a = Wr({}, e.imports, r.imports, mu), c = At(a), h = Si(a, c), p, m, b = 0, A = e.interpolate || Xn, E = "__p += '", M = Ai(
            (e.escape || Xn).source + "|" + A.source + "|" + (A === Ns ? wc : Xn).source + "|" + (e.evaluate || Xn).source + "|$",
            "g"
          ), D = "//# sourceURL=" + (rt.call(e, "sourceURL") ? (e.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Yc + "]") + `
`;
          t.replace(M, function(N, X, V, Yt, Dt, Xt) {
            return V || (V = Yt), E += t.slice(b, Xt).replace(Ec, dl), X && (p = !0, E += `' +
__e(` + X + `) +
'`), Dt && (m = !0, E += `';
` + Dt + `;
__p += '`), V && (E += `' +
((__t = (` + V + `)) == null ? '' : __t) +
'`), b = Xt + N.length, N;
          }), E += `';
`;
          var U = rt.call(e, "variable") && e.variable;
          if (!U)
            E = `with (obj) {
` + E + `
}
`;
          else if (vc.test(U))
            throw new G(_);
          E = (m ? E.replace(ec, "") : E).replace(nc, "$1").replace(rc, "$1;"), E = "function(" + (U || "obj") + `) {
` + (U ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (p ? ", __e = _.escape" : "") + (m ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + E + `return __p
}`;
          var J = lo(function() {
            return et(c, D + "return " + E).apply(i, h);
          });
          if (J.source = E, os(J))
            throw J;
          return J;
        }
        function qd(t) {
          return nt(t).toLowerCase();
        }
        function Gd(t) {
          return nt(t).toUpperCase();
        }
        function Hd(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return wa(t);
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = ce(e), c = ya(r, a), h = Ca(r, a) + 1;
          return Ge(r, c, h).join("");
        }
        function zd(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return t.slice(0, Sa(t) + 1);
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = Ca(r, ce(e)) + 1;
          return Ge(r, 0, a).join("");
        }
        function Kd(t, e, n) {
          if (t = nt(t), t && (n || e === i))
            return t.replace(oi, "");
          if (!t || !(e = Jt(e)))
            return t;
          var r = ce(t), a = ya(r, ce(e));
          return Ge(r, a).join("");
        }
        function Jd(t, e) {
          var n = Lt, r = Sn;
          if (gt(e)) {
            var a = "separator" in e ? e.separator : a;
            n = "length" in e ? K(e.length) : n, r = "omission" in e ? Jt(e.omission) : r;
          }
          t = nt(t);
          var c = t.length;
          if (un(t)) {
            var h = ce(t);
            c = h.length;
          }
          if (n >= c)
            return t;
          var p = n - on(r);
          if (p < 1)
            return r;
          var m = h ? Ge(h, 0, p).join("") : t.slice(0, p);
          if (a === i)
            return m + r;
          if (h && (p += m.length - p), cs(a)) {
            if (t.slice(p).search(a)) {
              var b, A = m;
              for (a.global || (a = Ai(a.source, nt($s.exec(a)) + "g")), a.lastIndex = 0; b = a.exec(A); )
                var E = b.index;
              m = m.slice(0, E === i ? p : E);
            }
          } else if (t.indexOf(Jt(a), p) != p) {
            var M = m.lastIndexOf(a);
            M > -1 && (m = m.slice(0, M));
          }
          return m + r;
        }
        function Zd(t) {
          return t = nt(t), t && ic.test(t) ? t.replace(Bs, xl) : t;
        }
        var Yd = dn(function(t, e, n) {
          return t + (n ? " " : "") + e.toUpperCase();
        }), hs = fu("toUpperCase");
        function co(t, e, n) {
          return t = nt(t), e = n ? i : e, e === i ? vl(t) ? Al(t) : ol(t) : t.match(e) || [];
        }
        var lo = Z(function(t, e) {
          try {
            return zt(t, i, e);
          } catch (n) {
            return os(n) ? n : new G(n);
          }
        }), Xd = Ie(function(t, e) {
          return te(e, function(n) {
            n = we(n), Ae(t, n, as(t[n], t));
          }), t;
        });
        function Qd(t) {
          var e = t == null ? 0 : t.length, n = B();
          return t = e ? pt(t, function(r) {
            if (typeof r[1] != "function")
              throw new ee(g);
            return [n(r[0]), r[1]];
          }) : [], Z(function(r) {
            for (var a = -1; ++a < e; ) {
              var c = t[a];
              if (zt(c[0], this, r))
                return zt(c[1], this, r);
            }
          });
        }
        function Vd(t) {
          return Sf(re(t, w));
        }
        function ps(t) {
          return function() {
            return t;
          };
        }
        function jd(t, e) {
          return t == null || t !== t ? e : t;
        }
        var t0 = pu(), e0 = pu(!0);
        function Gt(t) {
          return t;
        }
        function gs(t) {
          return Ga(typeof t == "function" ? t : re(t, w));
        }
        function n0(t) {
          return za(re(t, w));
        }
        function r0(t, e) {
          return Ka(t, re(e, w));
        }
        var i0 = Z(function(t, e) {
          return function(n) {
            return kn(n, t, e);
          };
        }), s0 = Z(function(t, e) {
          return function(n) {
            return kn(t, n, e);
          };
        });
        function ds(t, e, n) {
          var r = At(e), a = mr(e, r);
          n == null && !(gt(e) && (a.length || !r.length)) && (n = e, e = t, t = this, a = mr(e, At(e)));
          var c = !(gt(n) && "chain" in n) || !!n.chain, h = Te(t);
          return te(a, function(p) {
            var m = e[p];
            t[p] = m, h && (t.prototype[p] = function() {
              var b = this.__chain__;
              if (c || b) {
                var A = t(this.__wrapped__), E = A.__actions__ = Nt(this.__actions__);
                return E.push({ func: m, args: arguments, thisArg: t }), A.__chain__ = b, A;
              }
              return m.apply(t, We([this.value()], arguments));
            });
          }), t;
        }
        function a0() {
          return Et._ === this && (Et._ = Ll), this;
        }
        function _s() {
        }
        function u0(t) {
          return t = K(t), Z(function(e) {
            return Ja(e, t);
          });
        }
        var o0 = Ji(pt), c0 = Ji(ga), l0 = Ji(mi);
        function fo(t) {
          return ts(t) ? wi(we(t)) : Nf(t);
        }
        function f0(t) {
          return function(e) {
            return t == null ? i : Ve(t, e);
          };
        }
        var h0 = du(), p0 = du(!0);
        function vs() {
          return [];
        }
        function ms() {
          return !1;
        }
        function g0() {
          return {};
        }
        function d0() {
          return "";
        }
        function _0() {
          return !0;
        }
        function v0(t, e) {
          if (t = K(t), t < 1 || t > Oe)
            return [];
          var n = P, r = Tt(t, P);
          e = B(e), t -= P;
          for (var a = xi(r, e); ++n < t; )
            e(n);
          return a;
        }
        function m0(t) {
          return H(t) ? pt(t, we) : Zt(t) ? [t] : Nt(Lu(nt(t)));
        }
        function w0(t) {
          var e = ++Tl;
          return nt(t) + e;
        }
        var y0 = br(function(t, e) {
          return t + e;
        }, 0), C0 = Zi("ceil"), x0 = br(function(t, e) {
          return t / e;
        }, 1), S0 = Zi("floor");
        function b0(t) {
          return t && t.length ? vr(t, Gt, Ri) : i;
        }
        function A0(t, e) {
          return t && t.length ? vr(t, B(e, 2), Ri) : i;
        }
        function E0(t) {
          return va(t, Gt);
        }
        function I0(t, e) {
          return va(t, B(e, 2));
        }
        function F0(t) {
          return t && t.length ? vr(t, Gt, Wi) : i;
        }
        function T0(t, e) {
          return t && t.length ? vr(t, B(e, 2), Wi) : i;
        }
        var M0 = br(function(t, e) {
          return t * e;
        }, 1), L0 = Zi("round"), P0 = br(function(t, e) {
          return t - e;
        }, 0);
        function R0(t) {
          return t && t.length ? Ci(t, Gt) : 0;
        }
        function O0(t, e) {
          return t && t.length ? Ci(t, B(e, 2)) : 0;
        }
        return u.after = ng, u.ary = qu, u.assign = Gg, u.assignIn = no, u.assignInWith = Wr, u.assignWith = Hg, u.at = zg, u.before = Gu, u.bind = as, u.bindAll = Xd, u.bindKey = Hu, u.castArray = gg, u.chain = Uu, u.chunk = Sh, u.compact = bh, u.concat = Ah, u.cond = Qd, u.conforms = Vd, u.constant = ps, u.countBy = Rp, u.create = Kg, u.curry = zu, u.curryRight = Ku, u.debounce = Ju, u.defaults = Jg, u.defaultsDeep = Zg, u.defer = rg, u.delay = ig, u.difference = Eh, u.differenceBy = Ih, u.differenceWith = Fh, u.drop = Th, u.dropRight = Mh, u.dropRightWhile = Lh, u.dropWhile = Ph, u.fill = Rh, u.filter = kp, u.flatMap = Bp, u.flatMapDeep = Up, u.flatMapDepth = Np, u.flatten = ku, u.flattenDeep = Oh, u.flattenDepth = kh, u.flip = sg, u.flow = t0, u.flowRight = e0, u.fromPairs = Dh, u.functions = ed, u.functionsIn = nd, u.groupBy = $p, u.initial = Bh, u.intersection = Uh, u.intersectionBy = Nh, u.intersectionWith = $h, u.invert = id, u.invertBy = sd, u.invokeMap = Gp, u.iteratee = gs, u.keyBy = Hp, u.keys = At, u.keysIn = qt, u.map = Lr, u.mapKeys = ud, u.mapValues = od, u.matches = n0, u.matchesProperty = r0, u.memoize = Rr, u.merge = cd, u.mergeWith = ro, u.method = i0, u.methodOf = s0, u.mixin = ds, u.negate = Or, u.nthArg = u0, u.omit = ld, u.omitBy = fd, u.once = ag, u.orderBy = zp, u.over = o0, u.overArgs = ug, u.overEvery = c0, u.overSome = l0, u.partial = us, u.partialRight = Zu, u.partition = Kp, u.pick = hd, u.pickBy = io, u.property = fo, u.propertyOf = f0, u.pull = zh, u.pullAll = Wu, u.pullAllBy = Kh, u.pullAllWith = Jh, u.pullAt = Zh, u.range = h0, u.rangeRight = p0, u.rearg = og, u.reject = Yp, u.remove = Yh, u.rest = cg, u.reverse = is, u.sampleSize = Qp, u.set = gd, u.setWith = dd, u.shuffle = Vp, u.slice = Xh, u.sortBy = eg, u.sortedUniq = rp, u.sortedUniqBy = ip, u.split = Bd, u.spread = lg, u.tail = sp, u.take = ap, u.takeRight = up, u.takeRightWhile = op, u.takeWhile = cp, u.tap = bp, u.throttle = fg, u.thru = Mr, u.toArray = ju, u.toPairs = so, u.toPairsIn = ao, u.toPath = m0, u.toPlainObject = eo, u.transform = _d, u.unary = hg, u.union = lp, u.unionBy = fp, u.unionWith = hp, u.uniq = pp, u.uniqBy = gp, u.uniqWith = dp, u.unset = vd, u.unzip = ss, u.unzipWith = Bu, u.update = md, u.updateWith = wd, u.values = mn, u.valuesIn = yd, u.without = _p, u.words = co, u.wrap = pg, u.xor = vp, u.xorBy = mp, u.xorWith = wp, u.zip = yp, u.zipObject = Cp, u.zipObjectDeep = xp, u.zipWith = Sp, u.entries = so, u.entriesIn = ao, u.extend = no, u.extendWith = Wr, ds(u, u), u.add = y0, u.attempt = lo, u.camelCase = bd, u.capitalize = uo, u.ceil = C0, u.clamp = Cd, u.clone = dg, u.cloneDeep = vg, u.cloneDeepWith = mg, u.cloneWith = _g, u.conformsTo = wg, u.deburr = oo, u.defaultTo = jd, u.divide = x0, u.endsWith = Ad, u.eq = fe, u.escape = Ed, u.escapeRegExp = Id, u.every = Op, u.find = Dp, u.findIndex = Ru, u.findKey = Yg, u.findLast = Wp, u.findLastIndex = Ou, u.findLastKey = Xg, u.floor = S0, u.forEach = Nu, u.forEachRight = $u, u.forIn = Qg, u.forInRight = Vg, u.forOwn = jg, u.forOwnRight = td, u.get = ls, u.gt = yg, u.gte = Cg, u.has = rd, u.hasIn = fs, u.head = Du, u.identity = Gt, u.includes = qp, u.indexOf = Wh, u.inRange = xd, u.invoke = ad, u.isArguments = en, u.isArray = H, u.isArrayBuffer = xg, u.isArrayLike = $t, u.isArrayLikeObject = mt, u.isBoolean = Sg, u.isBuffer = He, u.isDate = bg, u.isElement = Ag, u.isEmpty = Eg, u.isEqual = Ig, u.isEqualWith = Fg, u.isError = os, u.isFinite = Tg, u.isFunction = Te, u.isInteger = Yu, u.isLength = kr, u.isMap = Xu, u.isMatch = Mg, u.isMatchWith = Lg, u.isNaN = Pg, u.isNative = Rg, u.isNil = kg, u.isNull = Og, u.isNumber = Qu, u.isObject = gt, u.isObjectLike = _t, u.isPlainObject = $n, u.isRegExp = cs, u.isSafeInteger = Dg, u.isSet = Vu, u.isString = Dr, u.isSymbol = Zt, u.isTypedArray = vn, u.isUndefined = Wg, u.isWeakMap = Bg, u.isWeakSet = Ug, u.join = qh, u.kebabCase = Fd, u.last = se, u.lastIndexOf = Gh, u.lowerCase = Td, u.lowerFirst = Md, u.lt = Ng, u.lte = $g, u.max = b0, u.maxBy = A0, u.mean = E0, u.meanBy = I0, u.min = F0, u.minBy = T0, u.stubArray = vs, u.stubFalse = ms, u.stubObject = g0, u.stubString = d0, u.stubTrue = _0, u.multiply = M0, u.nth = Hh, u.noConflict = a0, u.noop = _s, u.now = Pr, u.pad = Ld, u.padEnd = Pd, u.padStart = Rd, u.parseInt = Od, u.random = Sd, u.reduce = Jp, u.reduceRight = Zp, u.repeat = kd, u.replace = Dd, u.result = pd, u.round = L0, u.runInContext = d, u.sample = Xp, u.size = jp, u.snakeCase = Wd, u.some = tg, u.sortedIndex = Qh, u.sortedIndexBy = Vh, u.sortedIndexOf = jh, u.sortedLastIndex = tp, u.sortedLastIndexBy = ep, u.sortedLastIndexOf = np, u.startCase = Ud, u.startsWith = Nd, u.subtract = P0, u.sum = R0, u.sumBy = O0, u.template = $d, u.times = v0, u.toFinite = Me, u.toInteger = K, u.toLength = to, u.toLower = qd, u.toNumber = ae, u.toSafeInteger = qg, u.toString = nt, u.toUpper = Gd, u.trim = Hd, u.trimEnd = zd, u.trimStart = Kd, u.truncate = Jd, u.unescape = Zd, u.uniqueId = w0, u.upperCase = Yd, u.upperFirst = hs, u.each = Nu, u.eachRight = $u, u.first = Du, ds(u, function() {
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
          var n = e + 1, r = n == bn || n == Qr;
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
            var h = this.__wrapped__, p = r ? [1] : arguments, m = h instanceof Q, b = p[0], A = m || H(h), E = function(X) {
              var V = a.apply(u, We([X], p));
              return r && M ? V[0] : V;
            };
            A && n && typeof b == "function" && b.length != 1 && (m = A = !1);
            var M = this.__chain__, D = !!this.__actions__.length, U = c && !M, J = m && !D;
            if (!c && A) {
              h = J ? h : new Q(this);
              var N = t.apply(h, p);
              return N.__actions__.push({ func: Mr, args: [E], thisArg: i }), new ne(N, M);
            }
            return U && J ? t.apply(this, p) : (N = this.thru(E), U ? r ? N.value()[0] : N.value() : N);
          });
        }), te(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var e = nr[t], n = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", r = /^(?:pop|shift)$/.test(t);
          u.prototype[t] = function() {
            var a = arguments;
            if (r && !this.__chain__) {
              var c = this.value();
              return e.apply(H(c) ? c : [], a);
            }
            return this[n](function(h) {
              return e.apply(H(h) ? h : [], a);
            });
          };
        }), ve(Q.prototype, function(t, e) {
          var n = u[e];
          if (n) {
            var r = n.name + "";
            rt.call(hn, r) || (hn[r] = []), hn[r].push({ name: e, func: n });
          }
        }), hn[Sr(i, z).name] = [{
          name: "wrapper",
          func: i
        }], Q.prototype.clone = Jl, Q.prototype.reverse = Zl, Q.prototype.value = Yl, u.prototype.at = Ap, u.prototype.chain = Ep, u.prototype.commit = Ip, u.prototype.next = Fp, u.prototype.plant = Mp, u.prototype.reverse = Lp, u.prototype.toJSON = u.prototype.valueOf = u.prototype.value = Pp, u.prototype.first = u.prototype.head, Fn && (u.prototype[Fn] = Tp), u;
      }, cn = El();
      Je ? ((Je.exports = cn)._ = cn, gi._ = cn) : Et._ = cn;
    }).call(G0);
  }(Gn, Gn.exports)), Gn.exports;
}
var ko = H0();
const Y = /* @__PURE__ */ Eo(ko);
function Do(l, s) {
  const i = Y.findLast(s.terrain, (o) => Cn(o.percents[0] * s.dist, l.loc, 4));
  return i ? i.value / 100 + 1 : 1;
}
function ks(l) {
  const s = new ye().init(0);
  return l.forEach(({ factors: i, dist: o }) => {
    s.applyEach((f, v) => f + o * v, i);
  }), s.scaleEach(1 / ko.sumBy(l, "dist")), s;
}
function z0(l, s) {
  let i = 0, o = 0;
  return l.forEach((f, v) => {
    const g = v === l.length - 1 ? s : l[v + 1].onset, _ = f.type === "linear" ? f.value / 2 : f.value;
    o += (i + _) * (g - f.onset), i += f.value;
  }), o / s;
}
function K0(l) {
  return l < 30 ? 2 : l < 60 ? 5 : l < 90 ? 10 : l < 120 ? 15 : 20;
}
function J0(l, s, i) {
  let o = -z0(s, i);
  return s.forEach((f, v) => {
    if (l >= f.onset) {
      if (f.type === "step")
        o += f.value;
      else if (f.type === "linear") {
        const g = v === s.length - 1 ? i : s[v + 1].onset;
        l > g ? o += f.value : o += f.value * (l - f.onset) / (g - f.onset);
      }
    }
  }), o;
}
class Wo {
  constructor(s, i) {
    I(this, "plan");
    I(this, "values");
    this.plan = s, this.values = i ? Y.cloneDeep(i) : [{ onset: 0, value: K0(this.plan.course.dist), type: "linear" }];
  }
  /**
   * Returns strategy factor at location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns  The strategy factor at input location.
   */
  at(s) {
    return 1 + J0(s, this.values, this.plan.course.dist) / 100;
  }
  addValue(s) {
    const i = this.values.findIndex((o) => o.onset >= s.onset);
    i >= 0 ? this.values.splice(i, 0, s) : this.values.push(s);
  }
}
function Fs(l, s) {
  return s === void 0 ? l : (l - 1) * s + 1;
}
function Ds(l, s) {
  l.factors || (l.factors = new ye()), Object.assign(l.factors, {
    grade: Os(l.grade),
    altitude: Io(l.alt),
    terrain: Do(l, s)
  });
}
function Hn(l, s) {
  var i, o, f, v, g, _, y, C;
  if (l.factors || (l.factors = new ye()), Ds(l, s.course), s) {
    if (l.factors === void 0) throw new Error("no factors");
    l.factors.grade = Os(l.grade, s.gradeModel), l.factors.strategy = s.strategy.at(l.loc), (o = (i = s.strategies) == null ? void 0 : i.climbing) != null && o.filter(l) ? l.factors.climbStrategy = s.strategies.climbing.factor : l.factors.climbStrategy = ((f = s.strategies.climbing) == null ? void 0 : f.default) ?? 1, (g = (v = s.strategies) == null ? void 0 : v.descending) != null && g.filter(l) ? l.factors.descentStrategy = s.strategies.descending.factor : l.factors.descentStrategy = ((_ = s.strategies.descending) == null ? void 0 : _.default) ?? 1, Object.assign(l.factors, {
      heat: s.heatModel ? Oo(l, s.heatModel) : 1,
      dark: s.event.sun ? Po(l.tod, l.factors.terrain, s.event.sun) : 1
    });
  }
  l.factors.altitude = Fs(l.factors.altitude, (y = s.scales) == null ? void 0 : y.altitude), l.factors.dark = Fs(l.factors.dark, (C = s.scales) == null ? void 0 : C.dark);
}
const w_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Factors: ye,
  Strategy: Wo,
  applyScale: Fs,
  factorKeys: wn,
  generateCourseFactors: Ds,
  generatePlanFactors: Hn,
  getAltitudeFactor: Io,
  getDarkFactor: Po,
  getGradeFactor: Os,
  getHeatFactor: Oo,
  getTerrainFactor: Do,
  rollup: ks
}, Symbol.toStringTag, { value: "Module" }));
class Ws {
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
class Zr extends Ws {
  constructor(i, o, f) {
    super(i);
    I(this, "_trackData");
    this._trackData = { grade: f, loc: o };
  }
  get grade() {
    return this._trackData.grade;
  }
  get loc() {
    return this._trackData.loc;
  }
}
function xs(l) {
  return "_course" in l;
}
class Hr extends Zr {
  constructor(i, o, f) {
    super(o, o.loc, o.grade);
    I(this, "_course");
    I(this, "factors", new ye());
    I(this, "_interpolated");
    I(this, "loop");
    I(this, "source");
    this._course = i, this.loop = f, this.source = o;
  }
  get grade() {
    return xs(this.source) ? this.source.grade : this.source.grade * (this.source.grade > 0 ? this._course.gainScale : this._course.lossScale);
  }
  get interpolated() {
    return (xs(this.source) ? this.source.interpolated : this._interpolated) || !1;
  }
  set interpolated(i) {
    this._interpolated = i;
  }
  get loc() {
    if (xs(this.source)) return this.source.loc;
    let i = this.source.loc * this._course.distScale;
    return this.loop && (i += this._course.loopDist * this.loop), i;
  }
}
function zr(l, s) {
  const i = l.filter((f) => f > 0 && Kr(f, s, 4));
  return i.unshift(0), i.map((f, v) => ({ start: f, end: i[v + 1] || s }));
}
function Bo(l) {
  switch (l) {
    case "kilometers":
      return 1;
    case "miles":
      return 0.621371;
    default:
      throw new Error("Invalid distance unit");
  }
}
function $r(l) {
  return typeof l == "number" && !isNaN(l);
}
function Z0(l, s, i) {
  l = [...l], s.interpolated && l.splice(l.findIndex((v) => v.loc > s.loc) - 1, 0, s), i.interpolated && l.splice(l.findIndex((v) => v.loc > i.loc) - 1, 0, i);
  const o = l.filter(
    (v, g) => g >= l.findIndex((_) => _ === s) && g <= l.findIndex((_) => _ === i)
  ), f = o.map((v, g) => ({
    factors: v.factors,
    dist: g === o.length - 1 ? 0 : o[g + 1].loc - o[g].loc
  }));
  return f.pop(), ks(f);
}
class Uo {
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
class No extends Uo {
  constructor(i, o) {
    super(o);
    I(this, "_course");
    I(this, "point1");
    I(this, "point2");
    this._course = i, this.point1 = o.point1, this.point2 = o.point2;
  }
}
class $o extends Uo {
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
    return !$r(this.point1.elapsed) || !$r(this.point2.elapsed) || !$r(this.point1.time) || !$r(this.point2.time) ? 0 : this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time);
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
    return this._factors || (this._factors = Z0(this._plan.points, this.point1, this.point2));
  }
}
const Ss = Ke("CourseSplits");
class Y0 {
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
    Ss("createSegments");
    const s = this.course.waypoints, i = this.calcSegments(
      zr(
        s.map((o) => o.loc),
        this.course.dist
      )
    );
    if (!i.length) throw new Error("createSegments result is empty");
    return i.forEach((o, f) => {
      o.waypoint = s[f + 1];
    }), i;
  }
  createSplits(s) {
    Ss(`createSplits:${s}`);
    const i = Bo(s), o = Y.range(this.course.dist * i).map((v) => v / i);
    this.course.dist - o[o.length - 1] > 1e-4 && o.push(this.course.dist);
    const f = this.calcSegments(zr(o, this.course.dist));
    if (!f.length) throw new Error("createSplits result is empty");
    return f;
  }
  calcSegments(s) {
    var R;
    Ss.extend("calcSegments")("exec");
    const o = this.course, f = o.points, v = [], g = [];
    let _, y, C = o.points[0], F;
    for (_ = 0, y = s.length; _ < y; _++) {
      const k = s[_];
      F && xn((R = s[_ - 1]) == null ? void 0 : R.end, k.start, 4) ? C = F : C = o.getPoint(k.start), F = o.getPoint(k.end);
      const L = k.end - k.start, T = new No(this.course, {
        gain: 0,
        loss: 0,
        grade: L > 0 ? (F.alt - C.alt) / L / 10 * (F.alt - C.alt > 0 ? o.gainScale : o.lossScale) : 0,
        point1: C,
        point2: F
      }), W = new ye().init(0);
      v.push(T), g.push(W);
    }
    const w = (k, L, T, W) => {
      const z = T.alt - L.alt;
      k[z > 0 ? "gain" : "loss"] += z * (z > 0 ? o.gainScale : o.lossScale), Ds(L, o);
      const tt = T.loc - L.loc;
      W.applyEach((it, vt) => it + vt * tt, L.factors);
    };
    _ = 1;
    for (let k = 0; k < v.length; k++) {
      const L = v[k], T = g[k];
      for (; Cn(f[_].loc, L.point1.loc, 4); ) _++;
      let W = L.point1;
      for (; _ < f.length && Cn(f[_].loc, L.point2.loc, 4); ) {
        const z = f[_];
        w(L, W, z, T), W = z, _++;
      }
      w(L, W, L.point2, T);
    }
    return v;
  }
}
var Qt = 63710088e-1, qo = {
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
function Go(l, s, i = {}) {
  const o = { type: "Feature" };
  return (i.id === 0 || i.id) && (o.id = i.id), i.bbox && (o.bbox = i.bbox), o.properties = s || {}, o.geometry = l, o;
}
function Ts(l, s, i = {}) {
  if (!l)
    throw new Error("coordinates is required");
  if (!Array.isArray(l))
    throw new Error("coordinates must be an Array");
  if (l.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!wo(l[0]) || !wo(l[1]))
    throw new Error("coordinates must contain numbers");
  return Go({
    type: "Point",
    coordinates: l
  }, s, i);
}
function X0(l, s, i = {}) {
  if (l.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return Go({
    type: "LineString",
    coordinates: l
  }, s, i);
}
function Q0(l, s = "kilometers") {
  const i = qo[s];
  if (!i)
    throw new Error(s + " units is invalid");
  return l * i;
}
function V0(l, s = "kilometers") {
  const i = qo[s];
  if (!i)
    throw new Error(s + " units is invalid");
  return l / i;
}
function Ms(l) {
  return l % (2 * Math.PI) * 180 / Math.PI;
}
function pe(l) {
  return l % 360 * Math.PI / 180;
}
function wo(l) {
  return !isNaN(l) && l !== null && !Array.isArray(l);
}
function zn(l) {
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
function j0(l) {
  return l.type === "Feature" ? l.geometry : l;
}
function Ho(l, s, i = {}) {
  if (i.final === !0)
    return t_(l, s);
  const o = zn(l), f = zn(s), v = pe(o[0]), g = pe(f[0]), _ = pe(o[1]), y = pe(f[1]), C = Math.sin(g - v) * Math.cos(y), F = Math.cos(_) * Math.sin(y) - Math.sin(_) * Math.cos(y) * Math.cos(g - v);
  return Ms(Math.atan2(C, F));
}
function t_(l, s) {
  let i = Ho(s, l);
  return i = (i + 180) % 360, i;
}
function e_(l, s, i, o = {}) {
  const f = zn(l), v = pe(f[0]), g = pe(f[1]), _ = pe(i), y = V0(s, o.units), C = Math.asin(
    Math.sin(g) * Math.cos(y) + Math.cos(g) * Math.sin(y) * Math.cos(_)
  ), F = v + Math.atan2(
    Math.sin(_) * Math.sin(y) * Math.cos(g),
    Math.cos(y) - Math.sin(g) * Math.sin(C)
  ), w = Ms(F), R = Ms(C);
  return Ts([w, R], o.properties);
}
function zo(l, s, i = {}) {
  var o = zn(l), f = zn(s), v = pe(f[1] - o[1]), g = pe(f[0] - o[0]), _ = pe(o[1]), y = pe(f[1]), C = Math.pow(Math.sin(v / 2), 2) + Math.pow(Math.sin(g / 2), 2) * Math.cos(_) * Math.cos(y);
  return Q0(
    2 * Math.atan2(Math.sqrt(C), Math.sqrt(1 - C)),
    i.units
  );
}
function n_(l, s, i = {}) {
  const f = j0(l).coordinates;
  let v = 0;
  for (let g = 0; g < f.length && !(s >= v && g === f.length - 1); g++)
    if (v >= s) {
      const _ = s - v;
      if (_) {
        const y = Ho(f[g], f[g - 1]) - 180;
        return e_(
          f[g],
          _,
          y,
          i
        );
      } else
        return Ts(f[g]);
    } else
      v += zo(f[g], f[g + 1], i);
  return Ts(f[f.length - 1]);
}
function Ko(l, s, i) {
  if (l.loc > s.loc && i > l.loc || s.loc > l.loc && i > s.loc)
    throw new Error("Input location must be between points");
  const o = X0([
    [l.lon, l.lat],
    [s.lon, s.lat]
  ]), f = n_(o, i - l.loc), v = l.grade, g = yn(l.loc, s.loc, l.alt, s.alt, i);
  return new Zr(
    { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], alt: g },
    i,
    v
  );
}
class Ls {
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
const yo = Ke("models:Waypoint");
class Gr {
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
    return "waypoints" in this._cache ? this._cache.waypoints : (yo(`generating waypoints array: ${this.name}`), this.isFinish ? this._cache.waypoints = [new Ls(this, this.course.loops)] : this._cache.waypoints = Y.range(this.course.loops).map((s) => new Ls(this, s + 1)), this._cache.waypoints);
  }
  refreshLLA() {
    yo("refreshLLA");
    let s, i, o;
    this.isStart ? { lat: s, lon: i, alt: o } = this.course.track.points[0] : this.isFinish ? { lat: s, lon: i, alt: o } = this.course.track.points[this.course.track.points.length - 1] : { lat: s, lon: i, alt: o } = this.course.track.getLLA(this.percent * this.course.track.dist), this._cache.lat = s, this._cache.lon = i, this._cache.alt = o;
  }
}
const qn = Ke("models:Course"), Jo = [
  { type: "paved", value: 0 },
  { type: "dirt road", value: 4 },
  { type: "doubletrack", value: 8 },
  { type: "singletrack", value: 15 },
  { type: "technical", value: 30 }
];
class r_ {
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
    return "cutoffs" in this.cache ? this.cache.cutoffs : (this.cache.cutoffs = this.waypoints.filter((s) => s.cutoff).map((s) => new Zo(s)), this.cache.cutoffs);
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
        this.points[i + s * this.track.points.length] = new Hr(
          this,
          this.track.points[i],
          s
        );
    return this.cache.points;
  }
  get sites() {
    var s;
    if ("sites" in this.cache) return this.cache.sites;
    if (this.cache.sites = ((s = this._data.sites) == null ? void 0 : s.map((i) => new Gr(this, i))) || [
      new Gr(this, {
        id: String(Y.random(1e4, 2e4)),
        name: "Start",
        isStart: !0,
        percent: 0
      }),
      new Gr(this, {
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
    return "splits" in this.cache ? this.cache.splits : (this.cache.splits = new Y0(this), this.cache.splits);
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    qn("stats:calculate");
    const s = this.track.points.map((g) => g.alt), i = this.track.points.map((g) => g.grade), o = this.terrain.map((g) => g.value / 100 + 1), f = {
      altitude: {
        avg: Y.sum(
          this.track.points.map((g, _) => {
            var y;
            return g.alt * (g.loc - (((y = this.track.points[_ - 1]) == null ? void 0 : y.loc) || 0));
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
        avg: (Y.sumBy(this.terrain, (g) => (g.percents[1] - g.percents[0]) * this.dist * g.value) / this.dist + 100) / 100,
        max: Y.max(o) || 0,
        min: Y.min(o) || 0,
        maxDist: 0,
        minDist: 0
      }
    }, v = (g) => this.terrain.reduce(
      (_, y) => y.value / 100 + 1 === g ? _ + (y.percents[1] - y.percents[0]) * this.dist : _,
      0
    );
    return Object.assign(f.terrain, {
      maxDist: v(f.terrain.max),
      minDist: v(f.terrain.min)
    }), this.cache.stats = f, f;
  }
  get terrain() {
    if ("terrain" in this.cache) return this.cache.terrain;
    if (this._data.terrain) {
      const s = [...this._data.terrain];
      s.sort((i, o) => i.percent - o.percent), this.cache.terrain = s.map((i, o) => {
        var _, y;
        const f = Y.isNumber(i.value) ? i.value : Y.isString(i.value) ? ((_ = Jo.find((C) => C.type === i.value)) == null ? void 0 : _.value) || 0 : i.value.value, v = typeof i == "string" ? i : Y.isObject(i.value) ? i.value.type : void 0;
        return {
          value: f,
          type: v,
          percents: [i.percent, ((y = s[o + 1]) == null ? void 0 : y.percent) || 1]
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
    }), s = s.sort((o, f) => o.loc - f.loc), this.cache.waypoints = s, this.cache.waypoints;
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
    const i = this.points.findIndex((y) => Jr(y.loc, s, 4)), o = this.points[i];
    if (xn(o.loc, s, 4)) return o;
    qn(`getPoint: creating new CoursePoint at ${s}`);
    const f = i - 1, v = this.points[f], g = Ko(
      v.source,
      o.source,
      s % this.loopDist / this.distScale
    ), _ = new Hr(this, g, Math.floor(s / this.loopDist));
    return _.interpolated = !0, _;
  }
  locationsToBreaks(s) {
    const i = s.filter((f) => f > 0 && Kr(f, this.dist, 4));
    return i.unshift(0), i.map((f, v) => ({ start: f, end: i[v + 1] || this.dist }));
  }
}
class Zo {
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
var bs = { exports: {} }, Co;
function i_() {
  return Co || (Co = 1, function(l, s) {
    (function() {
      var i = Math.PI, o = Math.sin, f = Math.cos, v = Math.tan, g = Math.asin, _ = Math.atan2, y = Math.acos, C = i / 180, F = 1e3 * 60 * 60 * 24, w = 2440588, R = 2451545;
      function k(P) {
        return P.valueOf() / F - 0.5 + w;
      }
      function L(P) {
        return new Date((P + 0.5 - w) * F);
      }
      function T(P) {
        return k(P) - R;
      }
      var W = C * 23.4397;
      function z(P, $) {
        return _(o(P) * f(W) - v($) * o(W), f(P));
      }
      function tt(P, $) {
        return g(o($) * f(W) + f($) * o(W) * o(P));
      }
      function it(P, $, q) {
        return _(o(P), f(P) * o($) - v(q) * f($));
      }
      function vt(P, $, q) {
        return g(o($) * o(q) + f($) * f(q) * f(P));
      }
      function xt(P, $) {
        return C * (280.16 + 360.9856235 * P) - $;
      }
      function Re(P) {
        return P < 0 && (P = 0), 2967e-7 / Math.tan(P + 312536e-8 / (P + 0.08901179));
      }
      function Ft(P) {
        return C * (357.5291 + 0.98560028 * P);
      }
      function ge(P) {
        var $ = C * (1.9148 * o(P) + 0.02 * o(2 * P) + 3e-4 * o(3 * P)), q = C * 102.9372;
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
        var lt = C * -q, j = C * $, ft = T(P), at = Ce(ft), ot = xt(ft, lt) - at.ra;
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
      function Xr(P, $) {
        return Math.round(P - Kn - $ / (2 * i));
      }
      function bn(P, $, q) {
        return Kn + (P + $) / (2 * i) + q;
      }
      function Jn(P, $, q) {
        return R + P + 53e-4 * o($) - 69e-4 * o(2 * q);
      }
      function Qr(P, $, q) {
        return y((o(P) - o($) * o(q)) / (f($) * f(q)));
      }
      function nn(P) {
        return -2.076 * Math.sqrt(P) / 60;
      }
      function Oe(P, $, q, lt, j, ft, at) {
        var ot = Qr(P, q, lt), yt = bn(ot, $, j);
        return Jn(yt, ft, at);
      }
      Lt.getTimes = function(P, $, q, lt) {
        lt = lt || 0;
        var j = C * -q, ft = C * $, at = nn(lt), ot = T(P), yt = Xr(ot, j), Ht = bn(0, j, yt), Pt = Ft(Ht), Bt = ge(Pt), de = tt(Bt, 0), dt = Jn(Ht, Pt, Bt), Rt, ke, Ct, Ut, oe, Vt, ht = {
          solarNoon: L(dt),
          nadir: L(dt - 0.5)
        };
        for (Rt = 0, ke = Sn.length; Rt < ke; Rt += 1)
          Ct = Sn[Rt], Ut = (Ct[0] + at) * C, oe = Oe(Ut, j, ft, de, yt, Pt, Bt), Vt = dt - (oe - dt), ht[Ct[1]] = L(Vt), ht[Ct[2]] = L(oe);
        return ht;
      };
      function Zn(P) {
        var $ = C * (218.316 + 13.176396 * P), q = C * (134.963 + 13.064993 * P), lt = C * (93.272 + 13.22935 * P), j = $ + C * 6.289 * o(q), ft = C * 5.128 * o(lt), at = 385001 - 20905 * f(q);
        return {
          ra: z(j, ft),
          dec: tt(j, ft),
          dist: at
        };
      }
      Lt.getMoonPosition = function(P, $, q) {
        var lt = C * -q, j = C * $, ft = T(P), at = Zn(ft), ot = xt(ft, lt) - at.ra, yt = vt(ot, j, at.dec), Ht = _(o(ot), v(j) * f(at.dec) - o(at.dec) * f(ot));
        return yt = yt + Re(yt), {
          azimuth: it(ot, j, at.dec),
          altitude: yt,
          distance: at.dist,
          parallacticAngle: Ht
        };
      }, Lt.getMoonIllumination = function(P) {
        var $ = T(P || /* @__PURE__ */ new Date()), q = Ce($), lt = Zn($), j = 149598e3, ft = y(o(q.dec) * o(lt.dec) + f(q.dec) * f(lt.dec) * f(q.ra - lt.ra)), at = _(j * o(ft), lt.dist - j * f(ft)), ot = _(f(q.dec) * o(q.ra - lt.ra), o(q.dec) * f(lt.dec) - f(q.dec) * o(lt.dec) * f(q.ra - lt.ra));
        return {
          fraction: (1 + f(at)) / 2,
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
        for (var ft = 0.133 * C, at = Lt.getMoonPosition(j, $, q).altitude - ft, ot, yt, Ht, Pt, Bt, de, dt, Rt, ke, Ct, Ut, oe, Vt, ht = 1; ht <= 24 && (ot = Lt.getMoonPosition(xe(j, ht), $, q).altitude - ft, yt = Lt.getMoonPosition(xe(j, ht + 1), $, q).altitude - ft, Bt = (at + yt) / 2 - ot, de = (yt - at) / 2, dt = -de / (2 * Bt), Rt = (Bt * dt + de) * dt + ot, ke = de * de - 4 * Bt * ot, Ct = 0, ke >= 0 && (Vt = Math.sqrt(ke) / (Math.abs(Bt) * 2), Ut = dt - Vt, oe = dt + Vt, Math.abs(Ut) <= 1 && Ct++, Math.abs(oe) <= 1 && Ct++, Ut < -1 && (Ut = oe)), Ct === 1 ? at < 0 ? Ht = ht + Ut : Pt = ht + Ut : Ct === 2 && (Ht = ht + (Rt < 0 ? oe : Ut), Pt = ht + (Rt < 0 ? Ut : oe)), !(Ht && Pt)); ht += 2)
          at = yt;
        var _e = {};
        return Ht && (_e.rise = xe(j, Ht)), Pt && (_e.set = xe(j, Pt)), !Ht && !Pt && (_e[Rt > 0 ? "alwaysUp" : "alwaysDown"] = !0), _e;
      }, l.exports = Lt;
    })();
  }(bs)), bs.exports;
}
var xo = i_();
function Ps(l, s) {
  const i = l.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: s
  }).split(":").map((o) => Number(o));
  return i[0] * 60 * 60 + i[1] * 60 + i[2];
}
class s_ {
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
class Yo {
  constructor(s, i, o, f) {
    I(this, "start");
    I(this, "lat");
    I(this, "lon");
    I(this, "timezone");
    I(this, "sun");
    I(this, "startTime");
    this.start = s, this.lat = o, this.lon = f, this.timezone = i;
    const v = xo.getTimes(this.start, this.lat, this.lon), g = (y) => ({
      altitude: xo.getPosition(y, this.lat, this.lon).altitude * 180 / Math.PI,
      time: Ps(y, this.timezone)
    }), _ = (y) => y.getTime() > 0 ? g(y) : null;
    this.sun = new s_({
      nadir: g(v.nadir),
      dawn: _(v.dawn),
      sunrise: _(v.sunrise),
      sunset: _(v.sunset),
      dusk: _(v.dusk),
      noon: g(v.solarNoon)
    }), this.startTime = Ps(this.start, this.timezone);
  }
  dateAtElapsed(s) {
    const i = new Date(this.start);
    return i.setTime(i.getTime() + s * 1e3), i;
  }
  elapsedToTimeOfDay(s) {
    return (this.startTime + s) % 86400;
  }
}
var As = {}, So;
function a_() {
  return So || (So = 1, function(l) {
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
      function i(_) {
        return f(g(_), arguments);
      }
      function o(_, y) {
        return i.apply(null, [_].concat(y || []));
      }
      function f(_, y) {
        var C = 1, F = _.length, w, R = "", k, L, T, W, z, tt, it, vt;
        for (k = 0; k < F; k++)
          if (typeof _[k] == "string")
            R += _[k];
          else if (typeof _[k] == "object") {
            if (T = _[k], T.keys)
              for (w = y[C], L = 0; L < T.keys.length; L++) {
                if (w == null)
                  throw new Error(i('[sprintf] Cannot access property "%s" of undefined value "%s"', T.keys[L], T.keys[L - 1]));
                w = w[T.keys[L]];
              }
            else T.param_no ? w = y[T.param_no] : w = y[C++];
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
      var v = /* @__PURE__ */ Object.create(null);
      function g(_) {
        if (v[_])
          return v[_];
        for (var y = _, C, F = [], w = 0; y; ) {
          if ((C = s.text.exec(y)) !== null)
            F.push(C[0]);
          else if ((C = s.modulo.exec(y)) !== null)
            F.push("%");
          else if ((C = s.placeholder.exec(y)) !== null) {
            if (C[2]) {
              w |= 1;
              var R = [], k = C[2], L = [];
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
              C[2] = R;
            } else
              w |= 2;
            if (w === 3)
              throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
            F.push(
              {
                placeholder: C[0],
                param_no: C[1],
                keys: C[2],
                sign: C[3],
                pad_char: C[4],
                align: C[5],
                width: C[6],
                precision: C[7],
                type: C[8]
              }
            );
          } else
            throw new SyntaxError("[sprintf] unexpected placeholder");
          y = y.substring(C[0].length);
        }
        return v[_] = F;
      }
      l.sprintf = i, l.vsprintf = o, typeof window < "u" && (window.sprintf = i, window.vsprintf = o);
    })();
  }(As)), As;
}
var Xo = a_();
const u_ = Ke("PaceChunk");
class o_ {
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
class bo {
  constructor(s, i, o, f) {
    I(this, "constraints");
    I(this, "points");
    I(this, "plan");
    I(this, "delay");
    I(this, "factor");
    I(this, "factors", new ye());
    I(this, "status");
    this.constraints = o, this.points = i, this.plan = s, this.delay = f, this.factor = 1;
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
    s[0].elapsed = Y.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0], s[0].time = s[0].elapsed - Y.sum(this.plan.pacing.chunks.filter((C) => C.points[0].loc < s[0].loc).map((C) => C.delay)), this.plan.event.start && (s[0].tod = this.plan.event.elapsedToTimeOfDay(s[0].elapsed));
    let i = s[0].elapsed, o = s[0].delay || 0, f = 0, v = 0, g = 0;
    const _ = this.factor ? this.np : this.plan.pacing.pace, y = new ye().init(0);
    for (let C = 1, F = s.length; C < F; C++) {
      f = s[C].loc - s[C - 1].loc, Hn(s[C - 1], this.plan), y.applyEach((R, k) => R + k * f, s[C - 1].factors);
      const w = s[C - 1].factors.combined;
      g += w * f, v = _ * w * f, s[C].time = s[C - 1].time + v, o = s[C - 1].delay || 0, i += v + o, s[C].elapsed = i, this.plan.event.start && (s[C].tod = this.plan.event.elapsedToTimeOfDay(i));
    }
    Hn(s[s.length - 1], this.plan), this.factors = y.scaleEach(1 / this.dist), this.factor = g / this.dist;
  }
  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const o = u_.extend(
      Xo.vsprintf("calculate:%.2f-%.2f", [this.points[0].loc, this.points[this.points.length - 1].loc])
    );
    let f = this.factor || 0, v, g;
    const _ = new o_();
    for (g = 1; g <= 30; g++)
      if (this.applyPacing(), _.iterations = g >= 2, _.factor = !Y.round(f - this.factor, g === 30 ? 6 : 8), f = this.factor, _.target = Math.abs(
        (Y.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - this.points[this.points.length - 1].elapsed
      ) < 0.1, _.points = v && this.points.every((C, F) => xn(C.elapsed, v[F], 0)) || !1, v = this.points.map((C) => C.elapsed), _.passing) {
        o(`iteration ${g} complete, passed`);
        break;
      } else
        o(
          `iteration ${g} complete, failed ${Object.keys(_).filter((C) => !_[C]).join("|")}`
        );
    o("chunk complete");
    const y = _.passing ? void 0 : `failed tests ${Object.keys(_).filter((C) => !_[C]).map((C) => `"${C}"`).join(",")} after ${g} iterations`;
    this.status = {
      errorMessage: y,
      tests: _,
      success: _.passing,
      iterations: g
    };
  }
}
const ue = Ke("Pacing");
class Qo {
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
    return ue("factors:get"), this._factors || (ue("factors:update"), this._factors = ks(this.chunks)), this._factors;
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
      success: ((o = this.chunks) == null ? void 0 : o.filter((f) => {
        var v;
        return !((v = f.status) != null && v.success);
      }).length) === 0,
      chunks: this.chunks.length,
      iterations: this.chunks.map((f) => {
        var v;
        return ((v = f.status) == null ? void 0 : v.iterations) || 0;
      })
    };
    return s.success || (s.errorMessage = this.chunks.filter((f) => {
      var v;
      return f.status && !((v = f.status) != null && v.success);
    }).map((f, v) => `Chunk ${v + 1}: ${f.status.errorMessage}`).join(" | ")), s;
  }
  calculate() {
    var o, f, v;
    const s = ue.extend("calculate");
    for (s("exec"), s("clearing cache"), this.clearCache(); this.plan.points.find((g) => g.interpolated); ) {
      const g = this.plan.points.findIndex((_) => _.interpolated);
      this.plan.points.splice(g, 1);
    }
    for (s("adding points at each terrain factor break"), (o = this.plan.course.terrain) == null || o.forEach(
      (g) => this.plan.getPoint(g.percents[0] * this.plan.course.dist, !0)
    ), s("adding points at each cutoff"), this.plan.cutoffMargin && ((f = this.plan.cutoffs) == null || f.forEach((g) => {
      this.plan.getPoint(g.loc, !0);
    })), this.plan.points.filter((g) => g.delay).forEach((g) => {
      g.delay = 0;
    }), (v = this.plan.delays) == null || v.forEach((g) => {
      const _ = this.plan.getPoint(g.loc, !0);
      _.delay = g.delay;
    }), s("creating pace chunks"), this.initChunks(), [null, ...Y.reverse([...this.plan.cutoffs || []]), null].forEach((g) => {
      for (; this.chunks.find((y) => !y.status); )
        this.calcChunks(), this.validateChunks();
      if (!g) return !0;
      const _ = this.plan.getPoint(g.loc);
      if (_.elapsed - g.time > 0.5) {
        s(`cutoff at ${g.loc} missed`);
        const y = this.chunks[0];
        Y.last(y.points) === _ ? (s(`setting cutoff at ${g.loc}`), y.constraints = [0, g.time], delete y.status) : this.splitChunk(y, _, g.time);
      }
    }), Y.isFunction(this.chunks[this.chunks.length - 1].constraints[1]) && this.chunks.length > 2 && (s("rerunning last chunk"), this.chunks[this.chunks.length - 1].calculate()), ue(`pacing status=${this.status.success ? "PASS" : "FAIL"}.`); this.plan.points.find((g) => g.interpolated); ) {
      const g = this.plan.points.findIndex((_) => _.interpolated);
      this.plan.points.splice(g, 1);
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
    this.chunks = [new bo(this.plan, this.plan.points, [0, s], this.plan.delay)], this.plan.points.forEach((i) => {
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
    const v = s.points.findIndex((y) => y === i), g = Y.round(i.elapsed - i.time), _ = new bo(this.plan, s.points.slice(0, v + 1), [0, o], g);
    _.points.filter((y, C) => C < _.points.length - 1).forEach((y) => {
      y._chunk = _;
    }), this.chunks.unshift(_), s.constraints[0] = o, s.delay -= g, s.points = s.points.slice(v), delete s.status;
  }
  /**
   * merge two sequential chunks together, mutates chunks array
   * @param a - first chunk
   * @param b - second chunk
   */
  mergeChunks(s, i) {
    const o = this.chunks.findIndex((v) => v === s), f = this.chunks.findIndex((v) => v === i);
    if (f - o !== 1) throw new Error("chunks must be sequential");
    ue(Xo.sprintf("calcChunks: merging %i&%i (%.2f&%.2f)", o, f, s.np, i.np)), s.points.pop(), s.points.push(...i.points), s.delay += i.delay, delete s.status, s.points.forEach((v) => {
      v._chunk = s;
    }), s.constraints = [s.constraints[0], i.constraints[1]], this.chunks.splice(f, 1), s.calculate();
  }
}
class Rs extends Hr {
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
const Es = Ke("PlanSplits");
class c_ {
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
    Es("createSegments");
    const s = this.plan.course.waypoints, i = this.calcSegments(
      zr(
        s.map((o) => o.loc),
        this.plan.course.dist
      )
    );
    if (!i.length) throw new Error("createSegments result is empty");
    return i.forEach((o, f) => {
      o.waypoint = s[f + 1];
    }), i;
  }
  createSplits(s) {
    Es(`createSplits:${s}`);
    const i = Bo(s), o = Y.range(this.plan.course.dist * i).map(
      (v) => v / i
    );
    this.plan.course.dist - o[o.length - 1] > 1e-4 && o.push(this.plan.course.dist);
    const f = this.calcSegments(zr(o, this.plan.course.dist));
    if (!f.length) throw new Error("createSplits result is empty");
    return f;
  }
  calcSegments(s) {
    var k;
    Es.extend("calcSegments")("exec"), this.plan.checkPacing();
    const o = this.plan, f = o.course, v = o.points, g = [], _ = [];
    let y, C, F = o.points[0], w;
    for (y = 0, C = s.length; y < C; y++) {
      const L = s[y];
      w && xn((k = s[y - 1]) == null ? void 0 : k.end, L.start, 4) ? F = w : F = o.getPoint(L.start), w = o.getPoint(L.end);
      const T = L.end - L.start, W = new $o(this.plan, {
        gain: 0,
        loss: 0,
        grade: T > 0 ? (w.alt - F.alt) / T / 10 * (w.alt - F.alt > 0 ? f.gainScale : f.lossScale) : 0,
        point1: F,
        point2: w
      }), z = new ye().init(0);
      g.push(W), _.push(z);
    }
    const R = (L, T, W, z) => {
      const tt = W.alt - T.alt;
      L[tt > 0 ? "gain" : "loss"] += tt * (tt > 0 ? f.gainScale : f.lossScale), Hn(T, o);
      const it = W.loc - T.loc;
      z.applyEach((vt, xt) => vt + xt * it, T.factors);
    };
    y = 1;
    for (let L = 0; L < g.length; L++) {
      const T = g[L], W = _[L];
      for (; Cn(v[y].loc, T.point1.loc, 4); ) y++;
      let z = T.point1;
      for (; y < v.length && Cn(v[y].loc, T.point2.loc, 4); ) {
        const tt = v[y];
        R(T, z, tt, W), z = tt, y++;
      }
      R(T, z, T.point2, W), o && (T.delay = o.delays.filter((tt) => Jr(T.point1.loc, tt.loc, 4) && Kr(T.point2.loc, tt.loc, 4)).reduce((tt, it) => tt + it.delay, 0));
    }
    return g;
  }
}
const ze = Ke("models:Plan");
function Ao(l) {
  if (!(!l || Object.keys(l).every((s) => {
    const i = l[s];
    return i === void 0 || i >= 0 && i <= 2;
  })))
    throw new Error("Plan scales must be between 0 and 2");
}
class l_ {
  constructor(s, i) {
    I(this, "_cache", {});
    I(this, "_data");
    I(this, "course");
    I(this, "pacing", new Qo(this));
    I(this, "points");
    I(this, "splits", new c_(this));
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    I(this, "_version", 0);
    if (Ao(i.scales), this.course = s, this._data = i, i.delays) {
      const o = s.sites.map((v) => v.id), f = i.delays.find((v) => !o.includes(v.siteId));
      if (f)
        throw console.error(`Site in plan delays is not in course sites (${String(f.siteId)})`), new Error("Site in plan delays is not in course sites.");
    }
    this.points = this.course.points.map((o) => new Rs(this, o)), this._version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  get strategies() {
    return "strategies" in this._cache ? this._cache.strategies : (this._cache.strategies = {}, [
      { key: "climbing", filter: (i) => i.grade >= 4 },
      { key: "descending", filter: (i) => i.grade <= -4 }
    ].forEach((i) => {
      var f;
      const o = ((f = this._data.strategies) == null ? void 0 : f[i.key]) ?? 1;
      if (o !== 1) {
        let v = 0, g = 0;
        for (let _ = 1, y = this.points.length; _ < y; _++) {
          const C = this.points[_].loc - this.points[_ - 1].loc;
          i.filter(this.points[_ - 1]) && (g += C, v += C * (1 - o));
        }
        this._cache.strategies || (this._cache.strategies = {}), this._cache.strategies[i.key] = {
          default: v / (this.course.dist - g) + 1,
          factor: o,
          filter: i.filter
        };
      }
    }), this._cache.strategies);
  }
  get cutoffMargin() {
    return this._data.cutoffMargin;
  }
  get cutoffs() {
    var i;
    if ("cutoffs" in this.cache) return this.cache.cutoffs;
    this.cache.cutoffs = this.cutoffMargin ? ((i = this.course.cutoffs) == null ? void 0 : i.map((o) => new h_(this, o, this.getPoint(o.loc, !0)))) || [] : [];
    let s = 0;
    for (; this.cache.cutoffs.length - 1 >= s; ) {
      const o = this.cache.cutoffs[s];
      this.cache.cutoffs.find((f, v) => v > s && f.time <= o.time) ? (ze(`get cutoffs: deleting extraneous cutoff at ${o.loc} km`), this.cache.cutoffs.splice(s, 1)) : s++;
    }
    return this.cache.cutoffs;
  }
  get delay() {
    return Y.sumBy(this.delays, "delay");
  }
  get delays() {
    if ("delays" in this.cache) return this.cache.delays;
    const s = this.course.waypoints.map((o) => {
      var g;
      const f = (g = this._data.delays) == null ? void 0 : g.find(
        (_) => _.loop === o.loop && _.siteId === o.site.id
      ), v = f ? f.delay : o.hasDelay ? this.typicalDelay : 0;
      return new f_(o, v);
    }).filter((o) => o.delay > 0).sort((o, f) => o.loc - f.loc);
    let i = 0;
    for (; s.length - 1 >= i; )
      i > 0 && s[i].loc === s[i - 1].loc ? (ze(`get delays: merging delay at ${s[i].loc} km`), s[i - 1].delay += s[i].delay, s.splice(i, 1)) : i++;
    return this.cache.delays = s, this.cache.delays;
  }
  get event() {
    if ("event" in this.cache) return this.cache.event;
    if (this._data.start)
      return this.cache.event = new Yo(
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
    const s = [], i = this.event.elapsedToTimeOfDay(0), o = Math.ceil((i + this.points[this.points.length - 1].elapsed) / 86400), f = ["nadir", "dawn", "sunrise", "noon", "sunset", "dusk"].filter((_) => this.event.sun[_] !== null).map((_) => ({ event: _, time: this.event.sun[_].time }));
    for (let _ = 0; _ < o; _++)
      f.forEach((y) => {
        const C = y.time - i + 86400 * _;
        C >= 0 && C <= this.points[this.points.length - 1].elapsed && s.push({ event: y.event, elapsed: C });
      });
    s.sort((_, y) => _.elapsed - y.elapsed);
    const v = Fo(
      this.points.map((_) => _.elapsed),
      this.points.map((_) => _.loc),
      s.map((_) => _.elapsed)
    ), g = s.map((_, y) => ({ ..._, loc: v[y] }));
    return this.cache.events = { sun: g }, this.cache.events;
  }
  get gradeModel() {
    var o;
    if ("gradeModel" in this.cache) return this.cache.gradeModel;
    const s = ((o = this.scales) == null ? void 0 : o.descending) ?? 1, i = -0.034 / (2 * Pe.a);
    return s !== 1 && (this.cache.gradeModel = (f) => {
      const v = (s - 1) / 2 + 1;
      return Ro(f < i ? i + (f - i) / v : f) * (f < 0 ? 1 / v : 1);
    }), this.cache.gradeModel;
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
    return this._data.scales;
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    ze("calculating stats.factors");
    const s = Y.fromPairs(
      wn.map((v) => {
        const g = this.points.map((_) => _.factors[v]);
        return [
          v,
          {
            min: Number(Y.min(g)),
            max: Number(Y.max(g))
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
    let o = 0, f = 0;
    return this.points.forEach((v, g) => {
      var y, C;
      o = v.loc - (((y = this.points[g - 1]) == null ? void 0 : y.loc) || 0), f = v.elapsed - (((C = this.points[g - 1]) == null ? void 0 : C.elapsed) || 0);
      const _ = Lo(this.event.sun, v.tod);
      _ === 1 ? (i.dark.time += f, i.dark.dist += o) : _ > 0 ? (i.twilight.time += f, i.twilight.dist += o) : (i.day.time += f, i.day.dist += o);
    }), this.cache.stats = { factors: s, sun: i }, this.cache.stats;
  }
  get strategy() {
    return "strategy" in this.cache ? this.cache.strategy : this.cache.strategy = new Wo(this, this._data.strategy);
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
    const o = this.points.findIndex((y) => Jr(y.loc, s, 4)), f = this.points[o];
    if (xn(f.loc, s, 4)) return f;
    ze(`getPoint: ${i ? "inserting" : "creating"} new PlanPoint at ${s}`);
    const v = o - 1, g = this.points[v], _ = new Rs(this, this.course.getPoint(s));
    return _.delay = Math.round(f.elapsed - g.elapsed - (f.time - g.time)), _.time = yn(g.loc, f.loc, g.time, f.time, _.loc), _.elapsed = g.elapsed + g.delay + (_.time - g.time), _.tod = this.event.elapsedToTimeOfDay(_.elapsed), Hn(_, this), i && this.points.splice(o, 0, _), _;
  }
  update(s) {
    Ao(s.scales);
    const o = ["target", "method"].find((f) => f in s && Y.isNil(s[f]));
    if (o) throw new Error(`Plan.${o} cannot be set to null or undefined`);
    Object.assign(this._data, s), this._version++;
  }
}
class f_ {
  constructor(s, i) {
    I(this, "delay");
    I(this, "waypoint");
    this.waypoint = s, this.delay = i;
  }
  get loc() {
    return this.waypoint.loc;
  }
}
class h_ {
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
const Vo = (l, s, i, o) => {
  const f = Mo(l, s, i, o), v = [];
  return i.forEach((g, _) => {
    let y = f[_][0] / 10;
    y > 50 ? y = 50 : y < -50 && (y = -50);
    const C = g * f[_][0] + f[_][1];
    v.push({
      grade: y,
      alt: C
    });
  }), v;
};
function p_(l, s) {
  return Vo(
    s,
    l.map((o) => o.alt),
    s,
    0.05
  ).map((o) => o.grade);
}
const g_ = (l) => {
  let s = 0, i = 0;
  const o = [0];
  for (let f = 1, v = l.length; f < v; f++)
    s = zo([l[f - 1].lon, l[f - 1].lat], [l[f].lon, l[f].lat]), i += s, o.push(i);
  return o;
}, qr = Ke("models:Track");
class Yr {
  constructor(s) {
    I(this, "dist");
    I(this, "gain");
    I(this, "loss");
    I(this, "points");
    qr("Creating new Track object");
    const i = s.map((C) => new Ws(C)), o = g_(i), f = p_(i, o);
    this.points = i.map((C, F) => new Zr(C, o[F], f[F])), qr(`set-points - ${i.length} points`), qr("Calculating"), this.dist = this.points[this.points.length - 1].loc;
    let v = 0, g = 0, _ = 0, y = this.points[0].alt;
    this.points.forEach((C) => {
      _ = C.alt - y, _ < 0 ? g += _ : v += _, y = C.alt;
    }), this.gain = v, this.loss = g;
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
      const o = this.points.findIndex((f) => f.loc >= s);
      i = Ko(this.points[o - 1], this.points[o], s);
    }
    return Y.pick(i, ["lat", "lon", "alt"]);
  }
  reduceDensity(s = 0.025, i = this.points.length / 2) {
    const o = qr.extend("reduceDensity");
    if (this.dist / s > i / 2)
      return o("Does not meet criteria"), this;
    const f = this.dist, v = Math.floor(f / s) + 1, g = Array(v).fill(0).map((F, w) => Wt(w++ * s, 3));
    g[g.length - 1] < f && g.push(f);
    const _ = Vo(
      this.points.map((F) => F.loc),
      this.points.map((F) => F.alt),
      g,
      2 * s
    ), y = g.map((F) => this.getLLA(F)).map((F, w) => ({
      lat: Wt(F.lat, 6),
      lon: Wt(F.lon, 6),
      alt: Wt(_[w].alt, 2)
    })), C = new Yr(y);
    return o(`Reduced from ${this.points.length} to ${C.points.length} points.`), C;
  }
}
function d_(l, s, i) {
  const o = l.map((f, v) => ({ lat: l[v], lon: s[v], alt: i[v] }));
  return new Yr(o);
}
const y_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Course: r_,
  CourseCutoff: Zo,
  CoursePoint: Hr,
  CourseSegment: No,
  Event: Yo,
  Pacing: Qo,
  Plan: l_,
  PlanPoint: Rs,
  PlanSegment: $o,
  Point: Ws,
  Site: Gr,
  Track: Yr,
  TrackPoint: Zr,
  Waypoint: Ls,
  createTrackFromArrays: d_,
  terrainTypes: Jo
}, Symbol.toStringTag, { value: "Module" })), C_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dateToTODSeconds: Ps
}, Symbol.toStringTag, { value: "Module" }));
export {
  ye as Factors,
  y_ as Models,
  Wo as Strategy,
  z0 as adjustStrategy,
  v_ as enableDebug,
  w_ as factors,
  Ko as interpolatePoint,
  m_ as math,
  Lo as scaleDark,
  C_ as util
};
