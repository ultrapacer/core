var R0 = Object.defineProperty;
var k0 = (l, s, r) => s in l ? R0(l, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : l[s] = r;
var I = (l, s, r) => k0(l, typeof s != "symbol" ? s + "" : s, r);
var Nr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ao(l) {
  return l && l.__esModule && Object.prototype.hasOwnProperty.call(l, "default") ? l.default : l;
}
var Ur = { exports: {} }, ws, ho;
function O0() {
  if (ho) return ws;
  ho = 1;
  var l = 1e3, s = l * 60, r = s * 60, o = r * 24, f = o * 7, _ = o * 365.25;
  ws = function(F, m) {
    m = m || {};
    var R = typeof F;
    if (R === "string" && F.length > 0)
      return g(F);
    if (R === "number" && isFinite(F))
      return m.long ? C(F) : w(F);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(F)
    );
  };
  function g(F) {
    if (F = String(F), !(F.length > 100)) {
      var m = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        F
      );
      if (m) {
        var R = parseFloat(m[1]), O = (m[2] || "ms").toLowerCase();
        switch (O) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return R * _;
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
            return R * r;
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
    return m >= o ? Math.round(F / o) + "d" : m >= r ? Math.round(F / r) + "h" : m >= s ? Math.round(F / s) + "m" : m >= l ? Math.round(F / l) + "s" : F + "ms";
  }
  function C(F) {
    var m = Math.abs(F);
    return m >= o ? x(F, m, o, "day") : m >= r ? x(F, m, r, "hour") : m >= s ? x(F, m, s, "minute") : m >= l ? x(F, m, l, "second") : F + " ms";
  }
  function x(F, m, R, O) {
    var L = m >= R * 1.5;
    return Math.round(F / R) + " " + O + (L ? "s" : "");
  }
  return ws;
}
var ys, po;
function D0() {
  if (po) return ys;
  po = 1;
  function l(s) {
    o.debug = o, o.default = o, o.coerce = x, o.disable = w, o.enable = _, o.enabled = C, o.humanize = O0(), o.destroy = F, Object.keys(s).forEach((m) => {
      o[m] = s[m];
    }), o.names = [], o.skips = [], o.formatters = {};
    function r(m) {
      let R = 0;
      for (let O = 0; O < m.length; O++)
        R = (R << 5) - R + m.charCodeAt(O), R |= 0;
      return o.colors[Math.abs(R) % o.colors.length];
    }
    o.selectColor = r;
    function o(m) {
      let R, O = null, L, T;
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
      return W.namespace = m, W.useColors = o.useColors(), W.color = o.selectColor(m), W.extend = f, W.destroy = o.destroy, Object.defineProperty(W, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => O !== null ? O : (L !== o.namespaces && (L = o.namespaces, T = o.enabled(m)), T),
        set: (H) => {
          O = H;
        }
      }), typeof o.init == "function" && o.init(W), W;
    }
    function f(m, R) {
      const O = o(this.namespace + (typeof R > "u" ? ":" : R) + m);
      return O.log = this.log, O;
    }
    function _(m) {
      o.save(m), o.namespaces = m, o.names = [], o.skips = [];
      const R = (typeof m == "string" ? m : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const O of R)
        O[0] === "-" ? o.skips.push(O.slice(1)) : o.names.push(O);
    }
    function g(m, R) {
      let O = 0, L = 0, T = -1, W = 0;
      for (; O < m.length; )
        if (L < R.length && (R[L] === m[O] || R[L] === "*"))
          R[L] === "*" ? (T = L, W = O, L++) : (O++, L++);
        else if (T !== -1)
          L = T + 1, W++, O = W;
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
        if (g(m, R))
          return !1;
      for (const R of o.names)
        if (g(m, R))
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
  return ys = l, ys;
}
var go;
function W0() {
  return go || (go = 1, function(l, s) {
    s.formatArgs = o, s.save = f, s.load = _, s.useColors = r, s.storage = g(), s.destroy = /* @__PURE__ */ (() => {
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
    function r() {
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
    function f(C) {
      try {
        C ? s.storage.setItem("debug", C) : s.storage.removeItem("debug");
      } catch {
      }
    }
    function _() {
      let C;
      try {
        C = s.storage.getItem("debug");
      } catch {
      }
      return !C && typeof process < "u" && "env" in process && (C = process.env.DEBUG), C;
    }
    function g() {
      try {
        return localStorage;
      } catch {
      }
    }
    l.exports = D0()(s);
    const { formatters: w } = l.exports;
    w.j = function(C) {
      try {
        return JSON.stringify(C);
      } catch (x) {
        return "[UnexpectedJSONParseError]: " + x.message;
      }
    };
  }(Ur, Ur.exports)), Ur.exports;
}
var B0 = W0();
const Is = /* @__PURE__ */ Ao(B0), Cs = {};
function Je(l) {
  if (!Cs[l]) {
    const s = Is("ultraPacer:core");
    s(`loading debug for namespace "${l}"`), Cs[l] = s.extend(l);
  }
  return Cs[l];
}
function __() {
  Is.enable("ultraPacer:core*"), Is("ultraPacer:core")("debug enabled");
}
const N0 = {
  rate: 6,
  // %
  span: 1e3,
  // m
  th: 750
  // m
};
function Eo(l, s) {
  (s === null || typeof s > "u") && (s = N0);
  let r = 0;
  return Array.isArray(l) ? r = (l[0] + l[1]) / 2 : r = l, r <= s.th ? 1 : (1 + s.rate / s.span / 100) ** (r - s.th);
}
const _o = {
  baseline: 0,
  terrainScale: 1
};
function Wt(l, s = 0) {
  return Math.round(l * 10 ** s) / 10 ** s;
}
function Cn(l, s, r, o, f) {
  return r + (f - l) / (s - l) * (o - r);
}
function Io(l, s, r) {
  let o = 0, f = 0;
  const _ = [];
  for (o = 0; o < r.length; o++)
    if (r[o] < l[f])
      _.push(s[f]);
    else {
      for (; f < l.length - 1 && l[f + 1] <= r[o]; )
        f++;
      f === l.length - 1 || r[o] === l[f] ? _.push(s[f]) : _.push(Cn(l[f], l[f + 1], s[f], s[f + 1], r[o]));
    }
  return _;
}
function Fo(l) {
  let s, r, o, f, _ = 0, g = 0, w = 0, C = 0, x = 0;
  for (s = 0; s < l.length; s++)
    r = l[s][0], o = l[s][1], f = l[s][2], x += f, _ += f * r, w += f * (r * r), g += f * o, C += f * (r * o);
  const F = (g * w - _ * C) / (x * w - _ * _);
  return [(x * C - _ * g) / (x * w - _ * _), F];
}
function To(l, s, r, o) {
  let f = 0, _ = 0;
  const g = [];
  return r.forEach((w) => {
    for (; l[f] < w - o; )
      f++;
    for (f > 0 && l[f] >= w && f--; _ < l.length - 1 && l[_ + 1] <= w + o; )
      _++;
    _ < l.length - 1 && l[_] <= w && _++;
    const C = Math.max(o, Math.abs(w - l[f]) + 1e-3, Math.abs(w - l[_]) + 1e-3), x = [];
    let F = 0;
    for (let m = f; m <= _; m++)
      F = (1 - (Math.abs(w - l[m]) / C) ** 3) ** 3, x.push([l[m], s[m], F]);
    g.push(Fo(x));
  }), g;
}
function Kr(l, s, r) {
  return Wt(l, r) < Wt(s, r);
}
function U0(l, s, r) {
  return Wt(l, r) > Wt(s, r);
}
function xn(l, s, r) {
  return Wt(l, r) <= Wt(s, r);
}
function Jr(l, s, r) {
  return Wt(l, r) >= Wt(s, r);
}
function Sn(l, s, r) {
  return Wt(l, r) === Wt(s, r);
}
const v_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interp: Cn,
  interpArray: Io,
  linearRegression: Fo,
  req: Sn,
  rgt: U0,
  rgte: Jr,
  rlt: Kr,
  rlte: xn,
  round: Wt,
  wlslr: To
}, Symbol.toStringTag, { value: "Module" }));
function $0(l, s) {
  function r(o) {
    return o < l.noon ? o + 86400 : o;
  }
  if (s >= l.sunrise && s <= l.sunset)
    return 0;
  if (!isNaN(l.dawn) && !isNaN(l.dusk) && (s <= l.dawn || s >= l.dusk) || l.nadirAltitude > 0)
    return 1;
  {
    const o = l.nadirAltitude < -6 ? 1 : -(l.nadirAltitude / 6);
    return r(s) >= r(l.nadir) ? Cn(
      r(isNaN(l.dawn) ? l.nadir : l.dawn),
      r(l.sunrise),
      o,
      0,
      r(s)
    ) : Cn(
      r(l.sunset),
      r(isNaN(l.dusk) ? l.nadir : l.dusk),
      0,
      o,
      r(s)
    );
  }
}
function Mo(l, s, r, o = _o) {
  if (s === 1 || l >= r.sunrise && l <= r.sunset)
    return 1;
  (o === null || typeof o > "u") && (o = _o);
  const f = o.terrainScale * (s - 1) + o.baseline, _ = $0(r, l);
  return 1 + f * _;
}
const yn = [
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
    return yn.forEach((r) => this._data[r] = s), this;
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
    return this._combined === void 0 && (this._combined = yn.reduce((s, r) => s * this._data[r], 1)), this._combined;
  }
  /**
   * @param f - function to apply
   * @param factors - factor list to apply
   */
  applyEach(s, r) {
    yn.forEach((o) => this._data[o] = s(this._data[o], r[o]));
  }
  /**
   * scale each factor
   * @param scale - scale to apply
   */
  scaleEach(s) {
    return yn.forEach((r) => this._data[r] *= s), delete this._combined, this;
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
}, Lo = (l) => l < Pe.lower.lim ? Pe.lower.m * l + Pe.lower.b : l > Pe.upper.lim ? Pe.upper.m * l + Pe.upper.b : Pe.a * l ** 2 + Pe.b * l + 1;
function Rs(l, s) {
  return s || (s = Lo), s(l);
}
function Po(l, s) {
  if (!s) return 1;
  const r = l.tod;
  let o = 1;
  if (r > s.start && r < s.stop) {
    const f = (r - s.start) / (s.stop - s.start) * Math.PI;
    o += (s.max - s.baseline) * Math.sin(f) / 100;
  }
  return o += s.baseline / 100, o;
}
var zn = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var q0 = zn.exports, vo;
function G0() {
  return vo || (vo = 1, function(l, s) {
    (function() {
      var r, o = "4.17.21", f = 200, _ = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", g = "Expected a function", w = "Invalid `variable` option passed into `_.template`", C = "__lodash_hash_undefined__", x = 500, F = "__lodash_placeholder__", m = 1, R = 2, O = 4, L = 1, T = 2, W = 1, H = 2, tt = 4, it = 8, vt = 16, xt = 32, Re = 64, Ft = 128, ge = 256, Ce = 512, Lt = 30, bn = "...", Jn = 800, Xr = 16, An = 1, Zn = 2, Qr = 3, rn = 1 / 0, ke = 9007199254740991, Yn = 17976931348623157e292, xe = NaN, P = 4294967295, $ = P - 1, q = P >>> 1, lt = [
        ["ary", Ft],
        ["bind", W],
        ["bindKey", H],
        ["curry", it],
        ["curryRight", vt],
        ["flip", Ce],
        ["partial", xt],
        ["partialRight", Re],
        ["rearg", ge]
      ], j = "[object Arguments]", ft = "[object Array]", at = "[object AsyncFunction]", ot = "[object Boolean]", yt = "[object Date]", zt = "[object DOMException]", Pt = "[object Error]", Bt = "[object Function]", de = "[object GeneratorFunction]", dt = "[object Map]", Rt = "[object Number]", Oe = "[object Null]", Ct = "[object Object]", Nt = "[object Promise]", oe = "[object Proxy]", Vt = "[object RegExp]", ht = "[object Set]", _e = "[object String]", Xn = "[object Symbol]", Qo = "[object Undefined]", En = "[object WeakMap]", Vo = "[object WeakSet]", In = "[object ArrayBuffer]", sn = "[object DataView]", Vr = "[object Float32Array]", jr = "[object Float64Array]", ti = "[object Int8Array]", ei = "[object Int16Array]", ni = "[object Int32Array]", ri = "[object Uint8Array]", ii = "[object Uint8ClampedArray]", si = "[object Uint16Array]", ai = "[object Uint32Array]", jo = /\b__p \+= '';/g, tc = /\b(__p \+=) '' \+/g, ec = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Ws = /&(?:amp|lt|gt|quot|#39);/g, Bs = /[&<>"']/g, nc = RegExp(Ws.source), rc = RegExp(Bs.source), ic = /<%-([\s\S]+?)%>/g, sc = /<%([\s\S]+?)%>/g, Ns = /<%=([\s\S]+?)%>/g, ac = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, uc = /^\w*$/, oc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ui = /[\\^$.*+?()[\]{}|]/g, cc = RegExp(ui.source), oi = /^\s+/, lc = /\s/, fc = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, hc = /\{\n\/\* \[wrapped with (.+)\] \*/, pc = /,? & /, gc = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, dc = /[()=,{}\[\]\/\s]/, _c = /\\(\\)?/g, vc = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Us = /\w*$/, mc = /^[-+]0x[0-9a-f]+$/i, wc = /^0b[01]+$/i, yc = /^\[object .+?Constructor\]$/, Cc = /^0o[0-7]+$/i, xc = /^(?:0|[1-9]\d*)$/, Sc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Qn = /($^)/, bc = /['\n\r\u2028\u2029\\]/g, Vn = "\\ud800-\\udfff", Ac = "\\u0300-\\u036f", Ec = "\\ufe20-\\ufe2f", Ic = "\\u20d0-\\u20ff", $s = Ac + Ec + Ic, qs = "\\u2700-\\u27bf", Gs = "a-z\\xdf-\\xf6\\xf8-\\xff", Fc = "\\xac\\xb1\\xd7\\xf7", Tc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Mc = "\\u2000-\\u206f", Lc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", zs = "A-Z\\xc0-\\xd6\\xd8-\\xde", Hs = "\\ufe0e\\ufe0f", Ks = Fc + Tc + Mc + Lc, ci = "['’]", Pc = "[" + Vn + "]", Js = "[" + Ks + "]", jn = "[" + $s + "]", Zs = "\\d+", Rc = "[" + qs + "]", Ys = "[" + Gs + "]", Xs = "[^" + Vn + Ks + Zs + qs + Gs + zs + "]", li = "\\ud83c[\\udffb-\\udfff]", kc = "(?:" + jn + "|" + li + ")", Qs = "[^" + Vn + "]", fi = "(?:\\ud83c[\\udde6-\\uddff]){2}", hi = "[\\ud800-\\udbff][\\udc00-\\udfff]", an = "[" + zs + "]", Vs = "\\u200d", js = "(?:" + Ys + "|" + Xs + ")", Oc = "(?:" + an + "|" + Xs + ")", ta = "(?:" + ci + "(?:d|ll|m|re|s|t|ve))?", ea = "(?:" + ci + "(?:D|LL|M|RE|S|T|VE))?", na = kc + "?", ra = "[" + Hs + "]?", Dc = "(?:" + Vs + "(?:" + [Qs, fi, hi].join("|") + ")" + ra + na + ")*", Wc = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Bc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", ia = ra + na + Dc, Nc = "(?:" + [Rc, fi, hi].join("|") + ")" + ia, Uc = "(?:" + [Qs + jn + "?", jn, fi, hi, Pc].join("|") + ")", $c = RegExp(ci, "g"), qc = RegExp(jn, "g"), pi = RegExp(li + "(?=" + li + ")|" + Uc + ia, "g"), Gc = RegExp([
        an + "?" + Ys + "+" + ta + "(?=" + [Js, an, "$"].join("|") + ")",
        Oc + "+" + ea + "(?=" + [Js, an + js, "$"].join("|") + ")",
        an + "?" + js + "+" + ta,
        an + "+" + ea,
        Bc,
        Wc,
        Zs,
        Nc
      ].join("|"), "g"), zc = RegExp("[" + Vs + Vn + $s + Hs + "]"), Hc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Kc = [
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
      ], Jc = -1, ct = {};
      ct[Vr] = ct[jr] = ct[ti] = ct[ei] = ct[ni] = ct[ri] = ct[ii] = ct[si] = ct[ai] = !0, ct[j] = ct[ft] = ct[In] = ct[ot] = ct[sn] = ct[yt] = ct[Pt] = ct[Bt] = ct[dt] = ct[Rt] = ct[Ct] = ct[Vt] = ct[ht] = ct[_e] = ct[En] = !1;
      var ut = {};
      ut[j] = ut[ft] = ut[In] = ut[sn] = ut[ot] = ut[yt] = ut[Vr] = ut[jr] = ut[ti] = ut[ei] = ut[ni] = ut[dt] = ut[Rt] = ut[Ct] = ut[Vt] = ut[ht] = ut[_e] = ut[Xn] = ut[ri] = ut[ii] = ut[si] = ut[ai] = !0, ut[Pt] = ut[Bt] = ut[En] = !1;
      var Zc = {
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
      }, Yc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Xc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Qc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, Vc = parseFloat, jc = parseInt, sa = typeof Nr == "object" && Nr && Nr.Object === Object && Nr, tl = typeof self == "object" && self && self.Object === Object && self, Et = sa || tl || Function("return this")(), gi = s && !s.nodeType && s, Ze = gi && !0 && l && !l.nodeType && l, aa = Ze && Ze.exports === gi, di = aa && sa.process, jt = function() {
        try {
          var d = Ze && Ze.require && Ze.require("util").types;
          return d || di && di.binding && di.binding("util");
        } catch {
        }
      }(), ua = jt && jt.isArrayBuffer, oa = jt && jt.isDate, ca = jt && jt.isMap, la = jt && jt.isRegExp, fa = jt && jt.isSet, ha = jt && jt.isTypedArray;
      function Ht(d, S, y) {
        switch (y.length) {
          case 0:
            return d.call(S);
          case 1:
            return d.call(S, y[0]);
          case 2:
            return d.call(S, y[0], y[1]);
          case 3:
            return d.call(S, y[0], y[1], y[2]);
        }
        return d.apply(S, y);
      }
      function el(d, S, y, k) {
        for (var G = -1, et = d == null ? 0 : d.length; ++G < et; ) {
          var St = d[G];
          S(k, St, y(St), d);
        }
        return k;
      }
      function te(d, S) {
        for (var y = -1, k = d == null ? 0 : d.length; ++y < k && S(d[y], y, d) !== !1; )
          ;
        return d;
      }
      function nl(d, S) {
        for (var y = d == null ? 0 : d.length; y-- && S(d[y], y, d) !== !1; )
          ;
        return d;
      }
      function pa(d, S) {
        for (var y = -1, k = d == null ? 0 : d.length; ++y < k; )
          if (!S(d[y], y, d))
            return !1;
        return !0;
      }
      function De(d, S) {
        for (var y = -1, k = d == null ? 0 : d.length, G = 0, et = []; ++y < k; ) {
          var St = d[y];
          S(St, y, d) && (et[G++] = St);
        }
        return et;
      }
      function tr(d, S) {
        var y = d == null ? 0 : d.length;
        return !!y && un(d, S, 0) > -1;
      }
      function _i(d, S, y) {
        for (var k = -1, G = d == null ? 0 : d.length; ++k < G; )
          if (y(S, d[k]))
            return !0;
        return !1;
      }
      function pt(d, S) {
        for (var y = -1, k = d == null ? 0 : d.length, G = Array(k); ++y < k; )
          G[y] = S(d[y], y, d);
        return G;
      }
      function We(d, S) {
        for (var y = -1, k = S.length, G = d.length; ++y < k; )
          d[G + y] = S[y];
        return d;
      }
      function vi(d, S, y, k) {
        var G = -1, et = d == null ? 0 : d.length;
        for (k && et && (y = d[++G]); ++G < et; )
          y = S(y, d[G], G, d);
        return y;
      }
      function rl(d, S, y, k) {
        var G = d == null ? 0 : d.length;
        for (k && G && (y = d[--G]); G--; )
          y = S(y, d[G], G, d);
        return y;
      }
      function mi(d, S) {
        for (var y = -1, k = d == null ? 0 : d.length; ++y < k; )
          if (S(d[y], y, d))
            return !0;
        return !1;
      }
      var il = wi("length");
      function sl(d) {
        return d.split("");
      }
      function al(d) {
        return d.match(gc) || [];
      }
      function ga(d, S, y) {
        var k;
        return y(d, function(G, et, St) {
          if (S(G, et, St))
            return k = et, !1;
        }), k;
      }
      function er(d, S, y, k) {
        for (var G = d.length, et = y + (k ? 1 : -1); k ? et-- : ++et < G; )
          if (S(d[et], et, d))
            return et;
        return -1;
      }
      function un(d, S, y) {
        return S === S ? ml(d, S, y) : er(d, da, y);
      }
      function ul(d, S, y, k) {
        for (var G = y - 1, et = d.length; ++G < et; )
          if (k(d[G], S))
            return G;
        return -1;
      }
      function da(d) {
        return d !== d;
      }
      function _a(d, S) {
        var y = d == null ? 0 : d.length;
        return y ? Ci(d, S) / y : xe;
      }
      function wi(d) {
        return function(S) {
          return S == null ? r : S[d];
        };
      }
      function yi(d) {
        return function(S) {
          return d == null ? r : d[S];
        };
      }
      function va(d, S, y, k, G) {
        return G(d, function(et, St, st) {
          y = k ? (k = !1, et) : S(y, et, St, st);
        }), y;
      }
      function ol(d, S) {
        var y = d.length;
        for (d.sort(S); y--; )
          d[y] = d[y].value;
        return d;
      }
      function Ci(d, S) {
        for (var y, k = -1, G = d.length; ++k < G; ) {
          var et = S(d[k]);
          et !== r && (y = y === r ? et : y + et);
        }
        return y;
      }
      function xi(d, S) {
        for (var y = -1, k = Array(d); ++y < d; )
          k[y] = S(y);
        return k;
      }
      function cl(d, S) {
        return pt(S, function(y) {
          return [y, d[y]];
        });
      }
      function ma(d) {
        return d && d.slice(0, xa(d) + 1).replace(oi, "");
      }
      function Kt(d) {
        return function(S) {
          return d(S);
        };
      }
      function Si(d, S) {
        return pt(S, function(y) {
          return d[y];
        });
      }
      function Fn(d, S) {
        return d.has(S);
      }
      function wa(d, S) {
        for (var y = -1, k = d.length; ++y < k && un(S, d[y], 0) > -1; )
          ;
        return y;
      }
      function ya(d, S) {
        for (var y = d.length; y-- && un(S, d[y], 0) > -1; )
          ;
        return y;
      }
      function ll(d, S) {
        for (var y = d.length, k = 0; y--; )
          d[y] === S && ++k;
        return k;
      }
      var fl = yi(Zc), hl = yi(Yc);
      function pl(d) {
        return "\\" + Qc[d];
      }
      function gl(d, S) {
        return d == null ? r : d[S];
      }
      function on(d) {
        return zc.test(d);
      }
      function dl(d) {
        return Hc.test(d);
      }
      function _l(d) {
        for (var S, y = []; !(S = d.next()).done; )
          y.push(S.value);
        return y;
      }
      function bi(d) {
        var S = -1, y = Array(d.size);
        return d.forEach(function(k, G) {
          y[++S] = [G, k];
        }), y;
      }
      function Ca(d, S) {
        return function(y) {
          return d(S(y));
        };
      }
      function Be(d, S) {
        for (var y = -1, k = d.length, G = 0, et = []; ++y < k; ) {
          var St = d[y];
          (St === S || St === F) && (d[y] = F, et[G++] = y);
        }
        return et;
      }
      function nr(d) {
        var S = -1, y = Array(d.size);
        return d.forEach(function(k) {
          y[++S] = k;
        }), y;
      }
      function vl(d) {
        var S = -1, y = Array(d.size);
        return d.forEach(function(k) {
          y[++S] = [k, k];
        }), y;
      }
      function ml(d, S, y) {
        for (var k = y - 1, G = d.length; ++k < G; )
          if (d[k] === S)
            return k;
        return -1;
      }
      function wl(d, S, y) {
        for (var k = y + 1; k--; )
          if (d[k] === S)
            return k;
        return k;
      }
      function cn(d) {
        return on(d) ? Cl(d) : il(d);
      }
      function ce(d) {
        return on(d) ? xl(d) : sl(d);
      }
      function xa(d) {
        for (var S = d.length; S-- && lc.test(d.charAt(S)); )
          ;
        return S;
      }
      var yl = yi(Xc);
      function Cl(d) {
        for (var S = pi.lastIndex = 0; pi.test(d); )
          ++S;
        return S;
      }
      function xl(d) {
        return d.match(pi) || [];
      }
      function Sl(d) {
        return d.match(Gc) || [];
      }
      var bl = function d(S) {
        S = S == null ? Et : ln.defaults(Et.Object(), S, ln.pick(Et, Kc));
        var y = S.Array, k = S.Date, G = S.Error, et = S.Function, St = S.Math, st = S.Object, Ai = S.RegExp, Al = S.String, ee = S.TypeError, rr = y.prototype, El = et.prototype, fn = st.prototype, ir = S["__core-js_shared__"], sr = El.toString, rt = fn.hasOwnProperty, Il = 0, Sa = function() {
          var t = /[^.]+$/.exec(ir && ir.keys && ir.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        }(), ar = fn.toString, Fl = sr.call(st), Tl = Et._, Ml = Ai(
          "^" + sr.call(rt).replace(ui, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), ur = aa ? S.Buffer : r, Ne = S.Symbol, or = S.Uint8Array, ba = ur ? ur.allocUnsafe : r, cr = Ca(st.getPrototypeOf, st), Aa = st.create, Ea = fn.propertyIsEnumerable, lr = rr.splice, Ia = Ne ? Ne.isConcatSpreadable : r, Tn = Ne ? Ne.iterator : r, Ye = Ne ? Ne.toStringTag : r, fr = function() {
          try {
            var t = tn(st, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        }(), Ll = S.clearTimeout !== Et.clearTimeout && S.clearTimeout, Pl = k && k.now !== Et.Date.now && k.now, Rl = S.setTimeout !== Et.setTimeout && S.setTimeout, hr = St.ceil, pr = St.floor, Ei = st.getOwnPropertySymbols, kl = ur ? ur.isBuffer : r, Fa = S.isFinite, Ol = rr.join, Dl = Ca(st.keys, st), bt = St.max, Tt = St.min, Wl = k.now, Bl = S.parseInt, Ta = St.random, Nl = rr.reverse, Ii = tn(S, "DataView"), Mn = tn(S, "Map"), Fi = tn(S, "Promise"), hn = tn(S, "Set"), Ln = tn(S, "WeakMap"), Pn = tn(st, "create"), gr = Ln && new Ln(), pn = {}, Ul = en(Ii), $l = en(Mn), ql = en(Fi), Gl = en(hn), zl = en(Ln), dr = Ne ? Ne.prototype : r, Rn = dr ? dr.valueOf : r, Ma = dr ? dr.toString : r;
        function u(t) {
          if (_t(t) && !z(t) && !(t instanceof Q)) {
            if (t instanceof ne)
              return t;
            if (rt.call(t, "__wrapped__"))
              return Lu(t);
          }
          return new ne(t);
        }
        var gn = /* @__PURE__ */ function() {
          function t() {
          }
          return function(e) {
            if (!gt(e))
              return {};
            if (Aa)
              return Aa(e);
            t.prototype = e;
            var n = new t();
            return t.prototype = r, n;
          };
        }();
        function _r() {
        }
        function ne(t, e) {
          this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!e, this.__index__ = 0, this.__values__ = r;
        }
        u.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: ic,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: sc,
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
        }, u.prototype = _r.prototype, u.prototype.constructor = u, ne.prototype = gn(_r.prototype), ne.prototype.constructor = ne;
        function Q(t) {
          this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = P, this.__views__ = [];
        }
        function Hl() {
          var t = new Q(this.__wrapped__);
          return t.__actions__ = Ut(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = Ut(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = Ut(this.__views__), t;
        }
        function Kl() {
          if (this.__filtered__) {
            var t = new Q(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function Jl() {
          var t = this.__wrapped__.value(), e = this.__dir__, n = z(t), i = e < 0, a = n ? t.length : 0, c = ah(0, a, this.__views__), h = c.start, p = c.end, v = p - h, b = i ? p : h - 1, A = this.__iteratees__, E = A.length, M = 0, D = Tt(v, this.__takeCount__);
          if (!n || !i && a == v && D == v)
            return tu(t, this.__actions__);
          var N = [];
          t:
            for (; v-- && M < D; ) {
              b += e;
              for (var J = -1, U = t[b]; ++J < E; ) {
                var X = A[J], V = X.iteratee, Yt = X.type, Dt = V(U);
                if (Yt == Zn)
                  U = Dt;
                else if (!Dt) {
                  if (Yt == An)
                    continue t;
                  break t;
                }
              }
              N[M++] = U;
            }
          return N;
        }
        Q.prototype = gn(_r.prototype), Q.prototype.constructor = Q;
        function Xe(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var i = t[e];
            this.set(i[0], i[1]);
          }
        }
        function Zl() {
          this.__data__ = Pn ? Pn(null) : {}, this.size = 0;
        }
        function Yl(t) {
          var e = this.has(t) && delete this.__data__[t];
          return this.size -= e ? 1 : 0, e;
        }
        function Xl(t) {
          var e = this.__data__;
          if (Pn) {
            var n = e[t];
            return n === C ? r : n;
          }
          return rt.call(e, t) ? e[t] : r;
        }
        function Ql(t) {
          var e = this.__data__;
          return Pn ? e[t] !== r : rt.call(e, t);
        }
        function Vl(t, e) {
          var n = this.__data__;
          return this.size += this.has(t) ? 0 : 1, n[t] = Pn && e === r ? C : e, this;
        }
        Xe.prototype.clear = Zl, Xe.prototype.delete = Yl, Xe.prototype.get = Xl, Xe.prototype.has = Ql, Xe.prototype.set = Vl;
        function Se(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var i = t[e];
            this.set(i[0], i[1]);
          }
        }
        function jl() {
          this.__data__ = [], this.size = 0;
        }
        function tf(t) {
          var e = this.__data__, n = vr(e, t);
          if (n < 0)
            return !1;
          var i = e.length - 1;
          return n == i ? e.pop() : lr.call(e, n, 1), --this.size, !0;
        }
        function ef(t) {
          var e = this.__data__, n = vr(e, t);
          return n < 0 ? r : e[n][1];
        }
        function nf(t) {
          return vr(this.__data__, t) > -1;
        }
        function rf(t, e) {
          var n = this.__data__, i = vr(n, t);
          return i < 0 ? (++this.size, n.push([t, e])) : n[i][1] = e, this;
        }
        Se.prototype.clear = jl, Se.prototype.delete = tf, Se.prototype.get = ef, Se.prototype.has = nf, Se.prototype.set = rf;
        function be(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var i = t[e];
            this.set(i[0], i[1]);
          }
        }
        function sf() {
          this.size = 0, this.__data__ = {
            hash: new Xe(),
            map: new (Mn || Se)(),
            string: new Xe()
          };
        }
        function af(t) {
          var e = Tr(this, t).delete(t);
          return this.size -= e ? 1 : 0, e;
        }
        function uf(t) {
          return Tr(this, t).get(t);
        }
        function of(t) {
          return Tr(this, t).has(t);
        }
        function cf(t, e) {
          var n = Tr(this, t), i = n.size;
          return n.set(t, e), this.size += n.size == i ? 0 : 1, this;
        }
        be.prototype.clear = sf, be.prototype.delete = af, be.prototype.get = uf, be.prototype.has = of, be.prototype.set = cf;
        function Qe(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.__data__ = new be(); ++e < n; )
            this.add(t[e]);
        }
        function lf(t) {
          return this.__data__.set(t, C), this;
        }
        function ff(t) {
          return this.__data__.has(t);
        }
        Qe.prototype.add = Qe.prototype.push = lf, Qe.prototype.has = ff;
        function le(t) {
          var e = this.__data__ = new Se(t);
          this.size = e.size;
        }
        function hf() {
          this.__data__ = new Se(), this.size = 0;
        }
        function pf(t) {
          var e = this.__data__, n = e.delete(t);
          return this.size = e.size, n;
        }
        function gf(t) {
          return this.__data__.get(t);
        }
        function df(t) {
          return this.__data__.has(t);
        }
        function _f(t, e) {
          var n = this.__data__;
          if (n instanceof Se) {
            var i = n.__data__;
            if (!Mn || i.length < f - 1)
              return i.push([t, e]), this.size = ++n.size, this;
            n = this.__data__ = new be(i);
          }
          return n.set(t, e), this.size = n.size, this;
        }
        le.prototype.clear = hf, le.prototype.delete = pf, le.prototype.get = gf, le.prototype.has = df, le.prototype.set = _f;
        function La(t, e) {
          var n = z(t), i = !n && nn(t), a = !n && !i && ze(t), c = !n && !i && !a && mn(t), h = n || i || a || c, p = h ? xi(t.length, Al) : [], v = p.length;
          for (var b in t)
            (e || rt.call(t, b)) && !(h && // Safari 9 has enumerable `arguments.length` in strict mode.
            (b == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            a && (b == "offset" || b == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (b == "buffer" || b == "byteLength" || b == "byteOffset") || // Skip index properties.
            Fe(b, v))) && p.push(b);
          return p;
        }
        function Pa(t) {
          var e = t.length;
          return e ? t[Ni(0, e - 1)] : r;
        }
        function vf(t, e) {
          return Mr(Ut(t), Ve(e, 0, t.length));
        }
        function mf(t) {
          return Mr(Ut(t));
        }
        function Ti(t, e, n) {
          (n !== r && !fe(t[e], n) || n === r && !(e in t)) && Ae(t, e, n);
        }
        function kn(t, e, n) {
          var i = t[e];
          (!(rt.call(t, e) && fe(i, n)) || n === r && !(e in t)) && Ae(t, e, n);
        }
        function vr(t, e) {
          for (var n = t.length; n--; )
            if (fe(t[n][0], e))
              return n;
          return -1;
        }
        function wf(t, e, n, i) {
          return Ue(t, function(a, c, h) {
            e(i, a, n(a), h);
          }), i;
        }
        function Ra(t, e) {
          return t && me(e, At(e), t);
        }
        function yf(t, e) {
          return t && me(e, qt(e), t);
        }
        function Ae(t, e, n) {
          e == "__proto__" && fr ? fr(t, e, {
            configurable: !0,
            enumerable: !0,
            value: n,
            writable: !0
          }) : t[e] = n;
        }
        function Mi(t, e) {
          for (var n = -1, i = e.length, a = y(i), c = t == null; ++n < i; )
            a[n] = c ? r : ls(t, e[n]);
          return a;
        }
        function Ve(t, e, n) {
          return t === t && (n !== r && (t = t <= n ? t : n), e !== r && (t = t >= e ? t : e)), t;
        }
        function re(t, e, n, i, a, c) {
          var h, p = e & m, v = e & R, b = e & O;
          if (n && (h = a ? n(t, i, a, c) : n(t)), h !== r)
            return h;
          if (!gt(t))
            return t;
          var A = z(t);
          if (A) {
            if (h = oh(t), !p)
              return Ut(t, h);
          } else {
            var E = Mt(t), M = E == Bt || E == de;
            if (ze(t))
              return ru(t, p);
            if (E == Ct || E == j || M && !a) {
              if (h = v || M ? {} : xu(t), !p)
                return v ? Qf(t, yf(h, t)) : Xf(t, Ra(h, t));
            } else {
              if (!ut[E])
                return a ? t : {};
              h = ch(t, E, p);
            }
          }
          c || (c = new le());
          var D = c.get(t);
          if (D)
            return D;
          c.set(t, h), Qu(t) ? t.forEach(function(U) {
            h.add(re(U, e, n, U, t, c));
          }) : Yu(t) && t.forEach(function(U, X) {
            h.set(X, re(U, e, n, X, t, c));
          });
          var N = b ? v ? Xi : Yi : v ? qt : At, J = A ? r : N(t);
          return te(J || t, function(U, X) {
            J && (X = U, U = t[X]), kn(h, X, re(U, e, n, X, t, c));
          }), h;
        }
        function Cf(t) {
          var e = At(t);
          return function(n) {
            return ka(n, t, e);
          };
        }
        function ka(t, e, n) {
          var i = n.length;
          if (t == null)
            return !i;
          for (t = st(t); i--; ) {
            var a = n[i], c = e[a], h = t[a];
            if (h === r && !(a in t) || !c(h))
              return !1;
          }
          return !0;
        }
        function Oa(t, e, n) {
          if (typeof t != "function")
            throw new ee(g);
          return $n(function() {
            t.apply(r, n);
          }, e);
        }
        function On(t, e, n, i) {
          var a = -1, c = tr, h = !0, p = t.length, v = [], b = e.length;
          if (!p)
            return v;
          n && (e = pt(e, Kt(n))), i ? (c = _i, h = !1) : e.length >= f && (c = Fn, h = !1, e = new Qe(e));
          t:
            for (; ++a < p; ) {
              var A = t[a], E = n == null ? A : n(A);
              if (A = i || A !== 0 ? A : 0, h && E === E) {
                for (var M = b; M--; )
                  if (e[M] === E)
                    continue t;
                v.push(A);
              } else c(e, E, i) || v.push(A);
            }
          return v;
        }
        var Ue = ou(ve), Da = ou(Pi, !0);
        function xf(t, e) {
          var n = !0;
          return Ue(t, function(i, a, c) {
            return n = !!e(i, a, c), n;
          }), n;
        }
        function mr(t, e, n) {
          for (var i = -1, a = t.length; ++i < a; ) {
            var c = t[i], h = e(c);
            if (h != null && (p === r ? h === h && !Zt(h) : n(h, p)))
              var p = h, v = c;
          }
          return v;
        }
        function Sf(t, e, n, i) {
          var a = t.length;
          for (n = K(n), n < 0 && (n = -n > a ? 0 : a + n), i = i === r || i > a ? a : K(i), i < 0 && (i += a), i = n > i ? 0 : ju(i); n < i; )
            t[n++] = e;
          return t;
        }
        function Wa(t, e) {
          var n = [];
          return Ue(t, function(i, a, c) {
            e(i, a, c) && n.push(i);
          }), n;
        }
        function It(t, e, n, i, a) {
          var c = -1, h = t.length;
          for (n || (n = fh), a || (a = []); ++c < h; ) {
            var p = t[c];
            e > 0 && n(p) ? e > 1 ? It(p, e - 1, n, i, a) : We(a, p) : i || (a[a.length] = p);
          }
          return a;
        }
        var Li = cu(), Ba = cu(!0);
        function ve(t, e) {
          return t && Li(t, e, At);
        }
        function Pi(t, e) {
          return t && Ba(t, e, At);
        }
        function wr(t, e) {
          return De(e, function(n) {
            return Te(t[n]);
          });
        }
        function je(t, e) {
          e = qe(e, t);
          for (var n = 0, i = e.length; t != null && n < i; )
            t = t[we(e[n++])];
          return n && n == i ? t : r;
        }
        function Na(t, e, n) {
          var i = e(t);
          return z(t) ? i : We(i, n(t));
        }
        function kt(t) {
          return t == null ? t === r ? Qo : Oe : Ye && Ye in st(t) ? sh(t) : mh(t);
        }
        function Ri(t, e) {
          return t > e;
        }
        function bf(t, e) {
          return t != null && rt.call(t, e);
        }
        function Af(t, e) {
          return t != null && e in st(t);
        }
        function Ef(t, e, n) {
          return t >= Tt(e, n) && t < bt(e, n);
        }
        function ki(t, e, n) {
          for (var i = n ? _i : tr, a = t[0].length, c = t.length, h = c, p = y(c), v = 1 / 0, b = []; h--; ) {
            var A = t[h];
            h && e && (A = pt(A, Kt(e))), v = Tt(A.length, v), p[h] = !n && (e || a >= 120 && A.length >= 120) ? new Qe(h && A) : r;
          }
          A = t[0];
          var E = -1, M = p[0];
          t:
            for (; ++E < a && b.length < v; ) {
              var D = A[E], N = e ? e(D) : D;
              if (D = n || D !== 0 ? D : 0, !(M ? Fn(M, N) : i(b, N, n))) {
                for (h = c; --h; ) {
                  var J = p[h];
                  if (!(J ? Fn(J, N) : i(t[h], N, n)))
                    continue t;
                }
                M && M.push(N), b.push(D);
              }
            }
          return b;
        }
        function If(t, e, n, i) {
          return ve(t, function(a, c, h) {
            e(i, n(a), c, h);
          }), i;
        }
        function Dn(t, e, n) {
          e = qe(e, t), t = Eu(t, e);
          var i = t == null ? t : t[we(se(e))];
          return i == null ? r : Ht(i, t, n);
        }
        function Ua(t) {
          return _t(t) && kt(t) == j;
        }
        function Ff(t) {
          return _t(t) && kt(t) == In;
        }
        function Tf(t) {
          return _t(t) && kt(t) == yt;
        }
        function Wn(t, e, n, i, a) {
          return t === e ? !0 : t == null || e == null || !_t(t) && !_t(e) ? t !== t && e !== e : Mf(t, e, n, i, Wn, a);
        }
        function Mf(t, e, n, i, a, c) {
          var h = z(t), p = z(e), v = h ? ft : Mt(t), b = p ? ft : Mt(e);
          v = v == j ? Ct : v, b = b == j ? Ct : b;
          var A = v == Ct, E = b == Ct, M = v == b;
          if (M && ze(t)) {
            if (!ze(e))
              return !1;
            h = !0, A = !1;
          }
          if (M && !A)
            return c || (c = new le()), h || mn(t) ? wu(t, e, n, i, a, c) : rh(t, e, v, n, i, a, c);
          if (!(n & L)) {
            var D = A && rt.call(t, "__wrapped__"), N = E && rt.call(e, "__wrapped__");
            if (D || N) {
              var J = D ? t.value() : t, U = N ? e.value() : e;
              return c || (c = new le()), a(J, U, n, i, c);
            }
          }
          return M ? (c || (c = new le()), ih(t, e, n, i, a, c)) : !1;
        }
        function Lf(t) {
          return _t(t) && Mt(t) == dt;
        }
        function Oi(t, e, n, i) {
          var a = n.length, c = a, h = !i;
          if (t == null)
            return !c;
          for (t = st(t); a--; ) {
            var p = n[a];
            if (h && p[2] ? p[1] !== t[p[0]] : !(p[0] in t))
              return !1;
          }
          for (; ++a < c; ) {
            p = n[a];
            var v = p[0], b = t[v], A = p[1];
            if (h && p[2]) {
              if (b === r && !(v in t))
                return !1;
            } else {
              var E = new le();
              if (i)
                var M = i(b, A, v, t, e, E);
              if (!(M === r ? Wn(A, b, L | T, i, E) : M))
                return !1;
            }
          }
          return !0;
        }
        function $a(t) {
          if (!gt(t) || ph(t))
            return !1;
          var e = Te(t) ? Ml : yc;
          return e.test(en(t));
        }
        function Pf(t) {
          return _t(t) && kt(t) == Vt;
        }
        function Rf(t) {
          return _t(t) && Mt(t) == ht;
        }
        function kf(t) {
          return _t(t) && Dr(t.length) && !!ct[kt(t)];
        }
        function qa(t) {
          return typeof t == "function" ? t : t == null ? Gt : typeof t == "object" ? z(t) ? Ha(t[0], t[1]) : za(t) : lo(t);
        }
        function Di(t) {
          if (!Un(t))
            return Dl(t);
          var e = [];
          for (var n in st(t))
            rt.call(t, n) && n != "constructor" && e.push(n);
          return e;
        }
        function Of(t) {
          if (!gt(t))
            return vh(t);
          var e = Un(t), n = [];
          for (var i in t)
            i == "constructor" && (e || !rt.call(t, i)) || n.push(i);
          return n;
        }
        function Wi(t, e) {
          return t < e;
        }
        function Ga(t, e) {
          var n = -1, i = $t(t) ? y(t.length) : [];
          return Ue(t, function(a, c, h) {
            i[++n] = e(a, c, h);
          }), i;
        }
        function za(t) {
          var e = Vi(t);
          return e.length == 1 && e[0][2] ? bu(e[0][0], e[0][1]) : function(n) {
            return n === t || Oi(n, t, e);
          };
        }
        function Ha(t, e) {
          return ts(t) && Su(e) ? bu(we(t), e) : function(n) {
            var i = ls(n, t);
            return i === r && i === e ? fs(n, t) : Wn(e, i, L | T);
          };
        }
        function yr(t, e, n, i, a) {
          t !== e && Li(e, function(c, h) {
            if (a || (a = new le()), gt(c))
              Df(t, e, h, n, yr, i, a);
            else {
              var p = i ? i(ns(t, h), c, h + "", t, e, a) : r;
              p === r && (p = c), Ti(t, h, p);
            }
          }, qt);
        }
        function Df(t, e, n, i, a, c, h) {
          var p = ns(t, n), v = ns(e, n), b = h.get(v);
          if (b) {
            Ti(t, n, b);
            return;
          }
          var A = c ? c(p, v, n + "", t, e, h) : r, E = A === r;
          if (E) {
            var M = z(v), D = !M && ze(v), N = !M && !D && mn(v);
            A = v, M || D || N ? z(p) ? A = p : mt(p) ? A = Ut(p) : D ? (E = !1, A = ru(v, !0)) : N ? (E = !1, A = iu(v, !0)) : A = [] : qn(v) || nn(v) ? (A = p, nn(p) ? A = to(p) : (!gt(p) || Te(p)) && (A = xu(v))) : E = !1;
          }
          E && (h.set(v, A), a(A, v, i, c, h), h.delete(v)), Ti(t, n, A);
        }
        function Ka(t, e) {
          var n = t.length;
          if (n)
            return e += e < 0 ? n : 0, Fe(e, n) ? t[e] : r;
        }
        function Ja(t, e, n) {
          e.length ? e = pt(e, function(c) {
            return z(c) ? function(h) {
              return je(h, c.length === 1 ? c[0] : c);
            } : c;
          }) : e = [Gt];
          var i = -1;
          e = pt(e, Kt(B()));
          var a = Ga(t, function(c, h, p) {
            var v = pt(e, function(b) {
              return b(c);
            });
            return { criteria: v, index: ++i, value: c };
          });
          return ol(a, function(c, h) {
            return Yf(c, h, n);
          });
        }
        function Wf(t, e) {
          return Za(t, e, function(n, i) {
            return fs(t, i);
          });
        }
        function Za(t, e, n) {
          for (var i = -1, a = e.length, c = {}; ++i < a; ) {
            var h = e[i], p = je(t, h);
            n(p, h) && Bn(c, qe(h, t), p);
          }
          return c;
        }
        function Bf(t) {
          return function(e) {
            return je(e, t);
          };
        }
        function Bi(t, e, n, i) {
          var a = i ? ul : un, c = -1, h = e.length, p = t;
          for (t === e && (e = Ut(e)), n && (p = pt(t, Kt(n))); ++c < h; )
            for (var v = 0, b = e[c], A = n ? n(b) : b; (v = a(p, A, v, i)) > -1; )
              p !== t && lr.call(p, v, 1), lr.call(t, v, 1);
          return t;
        }
        function Ya(t, e) {
          for (var n = t ? e.length : 0, i = n - 1; n--; ) {
            var a = e[n];
            if (n == i || a !== c) {
              var c = a;
              Fe(a) ? lr.call(t, a, 1) : qi(t, a);
            }
          }
          return t;
        }
        function Ni(t, e) {
          return t + pr(Ta() * (e - t + 1));
        }
        function Nf(t, e, n, i) {
          for (var a = -1, c = bt(hr((e - t) / (n || 1)), 0), h = y(c); c--; )
            h[i ? c : ++a] = t, t += n;
          return h;
        }
        function Ui(t, e) {
          var n = "";
          if (!t || e < 1 || e > ke)
            return n;
          do
            e % 2 && (n += t), e = pr(e / 2), e && (t += t);
          while (e);
          return n;
        }
        function Z(t, e) {
          return rs(Au(t, e, Gt), t + "");
        }
        function Uf(t) {
          return Pa(wn(t));
        }
        function $f(t, e) {
          var n = wn(t);
          return Mr(n, Ve(e, 0, n.length));
        }
        function Bn(t, e, n, i) {
          if (!gt(t))
            return t;
          e = qe(e, t);
          for (var a = -1, c = e.length, h = c - 1, p = t; p != null && ++a < c; ) {
            var v = we(e[a]), b = n;
            if (v === "__proto__" || v === "constructor" || v === "prototype")
              return t;
            if (a != h) {
              var A = p[v];
              b = i ? i(A, v, p) : r, b === r && (b = gt(A) ? A : Fe(e[a + 1]) ? [] : {});
            }
            kn(p, v, b), p = p[v];
          }
          return t;
        }
        var Xa = gr ? function(t, e) {
          return gr.set(t, e), t;
        } : Gt, qf = fr ? function(t, e) {
          return fr(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: ps(e),
            writable: !0
          });
        } : Gt;
        function Gf(t) {
          return Mr(wn(t));
        }
        function ie(t, e, n) {
          var i = -1, a = t.length;
          e < 0 && (e = -e > a ? 0 : a + e), n = n > a ? a : n, n < 0 && (n += a), a = e > n ? 0 : n - e >>> 0, e >>>= 0;
          for (var c = y(a); ++i < a; )
            c[i] = t[i + e];
          return c;
        }
        function zf(t, e) {
          var n;
          return Ue(t, function(i, a, c) {
            return n = e(i, a, c), !n;
          }), !!n;
        }
        function Cr(t, e, n) {
          var i = 0, a = t == null ? i : t.length;
          if (typeof e == "number" && e === e && a <= q) {
            for (; i < a; ) {
              var c = i + a >>> 1, h = t[c];
              h !== null && !Zt(h) && (n ? h <= e : h < e) ? i = c + 1 : a = c;
            }
            return a;
          }
          return $i(t, e, Gt, n);
        }
        function $i(t, e, n, i) {
          var a = 0, c = t == null ? 0 : t.length;
          if (c === 0)
            return 0;
          e = n(e);
          for (var h = e !== e, p = e === null, v = Zt(e), b = e === r; a < c; ) {
            var A = pr((a + c) / 2), E = n(t[A]), M = E !== r, D = E === null, N = E === E, J = Zt(E);
            if (h)
              var U = i || N;
            else b ? U = N && (i || M) : p ? U = N && M && (i || !D) : v ? U = N && M && !D && (i || !J) : D || J ? U = !1 : U = i ? E <= e : E < e;
            U ? a = A + 1 : c = A;
          }
          return Tt(c, $);
        }
        function Qa(t, e) {
          for (var n = -1, i = t.length, a = 0, c = []; ++n < i; ) {
            var h = t[n], p = e ? e(h) : h;
            if (!n || !fe(p, v)) {
              var v = p;
              c[a++] = h === 0 ? 0 : h;
            }
          }
          return c;
        }
        function Va(t) {
          return typeof t == "number" ? t : Zt(t) ? xe : +t;
        }
        function Jt(t) {
          if (typeof t == "string")
            return t;
          if (z(t))
            return pt(t, Jt) + "";
          if (Zt(t))
            return Ma ? Ma.call(t) : "";
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function $e(t, e, n) {
          var i = -1, a = tr, c = t.length, h = !0, p = [], v = p;
          if (n)
            h = !1, a = _i;
          else if (c >= f) {
            var b = e ? null : eh(t);
            if (b)
              return nr(b);
            h = !1, a = Fn, v = new Qe();
          } else
            v = e ? [] : p;
          t:
            for (; ++i < c; ) {
              var A = t[i], E = e ? e(A) : A;
              if (A = n || A !== 0 ? A : 0, h && E === E) {
                for (var M = v.length; M--; )
                  if (v[M] === E)
                    continue t;
                e && v.push(E), p.push(A);
              } else a(v, E, n) || (v !== p && v.push(E), p.push(A));
            }
          return p;
        }
        function qi(t, e) {
          return e = qe(e, t), t = Eu(t, e), t == null || delete t[we(se(e))];
        }
        function ja(t, e, n, i) {
          return Bn(t, e, n(je(t, e)), i);
        }
        function xr(t, e, n, i) {
          for (var a = t.length, c = i ? a : -1; (i ? c-- : ++c < a) && e(t[c], c, t); )
            ;
          return n ? ie(t, i ? 0 : c, i ? c + 1 : a) : ie(t, i ? c + 1 : 0, i ? a : c);
        }
        function tu(t, e) {
          var n = t;
          return n instanceof Q && (n = n.value()), vi(e, function(i, a) {
            return a.func.apply(a.thisArg, We([i], a.args));
          }, n);
        }
        function Gi(t, e, n) {
          var i = t.length;
          if (i < 2)
            return i ? $e(t[0]) : [];
          for (var a = -1, c = y(i); ++a < i; )
            for (var h = t[a], p = -1; ++p < i; )
              p != a && (c[a] = On(c[a] || h, t[p], e, n));
          return $e(It(c, 1), e, n);
        }
        function eu(t, e, n) {
          for (var i = -1, a = t.length, c = e.length, h = {}; ++i < a; ) {
            var p = i < c ? e[i] : r;
            n(h, t[i], p);
          }
          return h;
        }
        function zi(t) {
          return mt(t) ? t : [];
        }
        function Hi(t) {
          return typeof t == "function" ? t : Gt;
        }
        function qe(t, e) {
          return z(t) ? t : ts(t, e) ? [t] : Mu(nt(t));
        }
        var Hf = Z;
        function Ge(t, e, n) {
          var i = t.length;
          return n = n === r ? i : n, !e && n >= i ? t : ie(t, e, n);
        }
        var nu = Ll || function(t) {
          return Et.clearTimeout(t);
        };
        function ru(t, e) {
          if (e)
            return t.slice();
          var n = t.length, i = ba ? ba(n) : new t.constructor(n);
          return t.copy(i), i;
        }
        function Ki(t) {
          var e = new t.constructor(t.byteLength);
          return new or(e).set(new or(t)), e;
        }
        function Kf(t, e) {
          var n = e ? Ki(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.byteLength);
        }
        function Jf(t) {
          var e = new t.constructor(t.source, Us.exec(t));
          return e.lastIndex = t.lastIndex, e;
        }
        function Zf(t) {
          return Rn ? st(Rn.call(t)) : {};
        }
        function iu(t, e) {
          var n = e ? Ki(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.length);
        }
        function su(t, e) {
          if (t !== e) {
            var n = t !== r, i = t === null, a = t === t, c = Zt(t), h = e !== r, p = e === null, v = e === e, b = Zt(e);
            if (!p && !b && !c && t > e || c && h && v && !p && !b || i && h && v || !n && v || !a)
              return 1;
            if (!i && !c && !b && t < e || b && n && a && !i && !c || p && n && a || !h && a || !v)
              return -1;
          }
          return 0;
        }
        function Yf(t, e, n) {
          for (var i = -1, a = t.criteria, c = e.criteria, h = a.length, p = n.length; ++i < h; ) {
            var v = su(a[i], c[i]);
            if (v) {
              if (i >= p)
                return v;
              var b = n[i];
              return v * (b == "desc" ? -1 : 1);
            }
          }
          return t.index - e.index;
        }
        function au(t, e, n, i) {
          for (var a = -1, c = t.length, h = n.length, p = -1, v = e.length, b = bt(c - h, 0), A = y(v + b), E = !i; ++p < v; )
            A[p] = e[p];
          for (; ++a < h; )
            (E || a < c) && (A[n[a]] = t[a]);
          for (; b--; )
            A[p++] = t[a++];
          return A;
        }
        function uu(t, e, n, i) {
          for (var a = -1, c = t.length, h = -1, p = n.length, v = -1, b = e.length, A = bt(c - p, 0), E = y(A + b), M = !i; ++a < A; )
            E[a] = t[a];
          for (var D = a; ++v < b; )
            E[D + v] = e[v];
          for (; ++h < p; )
            (M || a < c) && (E[D + n[h]] = t[a++]);
          return E;
        }
        function Ut(t, e) {
          var n = -1, i = t.length;
          for (e || (e = y(i)); ++n < i; )
            e[n] = t[n];
          return e;
        }
        function me(t, e, n, i) {
          var a = !n;
          n || (n = {});
          for (var c = -1, h = e.length; ++c < h; ) {
            var p = e[c], v = i ? i(n[p], t[p], p, n, t) : r;
            v === r && (v = t[p]), a ? Ae(n, p, v) : kn(n, p, v);
          }
          return n;
        }
        function Xf(t, e) {
          return me(t, ji(t), e);
        }
        function Qf(t, e) {
          return me(t, yu(t), e);
        }
        function Sr(t, e) {
          return function(n, i) {
            var a = z(n) ? el : wf, c = e ? e() : {};
            return a(n, t, B(i, 2), c);
          };
        }
        function dn(t) {
          return Z(function(e, n) {
            var i = -1, a = n.length, c = a > 1 ? n[a - 1] : r, h = a > 2 ? n[2] : r;
            for (c = t.length > 3 && typeof c == "function" ? (a--, c) : r, h && Ot(n[0], n[1], h) && (c = a < 3 ? r : c, a = 1), e = st(e); ++i < a; ) {
              var p = n[i];
              p && t(e, p, i, c);
            }
            return e;
          });
        }
        function ou(t, e) {
          return function(n, i) {
            if (n == null)
              return n;
            if (!$t(n))
              return t(n, i);
            for (var a = n.length, c = e ? a : -1, h = st(n); (e ? c-- : ++c < a) && i(h[c], c, h) !== !1; )
              ;
            return n;
          };
        }
        function cu(t) {
          return function(e, n, i) {
            for (var a = -1, c = st(e), h = i(e), p = h.length; p--; ) {
              var v = h[t ? p : ++a];
              if (n(c[v], v, c) === !1)
                break;
            }
            return e;
          };
        }
        function Vf(t, e, n) {
          var i = e & W, a = Nn(t);
          function c() {
            var h = this && this !== Et && this instanceof c ? a : t;
            return h.apply(i ? n : this, arguments);
          }
          return c;
        }
        function lu(t) {
          return function(e) {
            e = nt(e);
            var n = on(e) ? ce(e) : r, i = n ? n[0] : e.charAt(0), a = n ? Ge(n, 1).join("") : e.slice(1);
            return i[t]() + a;
          };
        }
        function _n(t) {
          return function(e) {
            return vi(oo(uo(e).replace($c, "")), t, "");
          };
        }
        function Nn(t) {
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
            var n = gn(t.prototype), i = t.apply(n, e);
            return gt(i) ? i : n;
          };
        }
        function jf(t, e, n) {
          var i = Nn(t);
          function a() {
            for (var c = arguments.length, h = y(c), p = c, v = vn(a); p--; )
              h[p] = arguments[p];
            var b = c < 3 && h[0] !== v && h[c - 1] !== v ? [] : Be(h, v);
            if (c -= b.length, c < n)
              return du(
                t,
                e,
                br,
                a.placeholder,
                r,
                h,
                b,
                r,
                r,
                n - c
              );
            var A = this && this !== Et && this instanceof a ? i : t;
            return Ht(A, this, h);
          }
          return a;
        }
        function fu(t) {
          return function(e, n, i) {
            var a = st(e);
            if (!$t(e)) {
              var c = B(n, 3);
              e = At(e), n = function(p) {
                return c(a[p], p, a);
              };
            }
            var h = t(e, n, i);
            return h > -1 ? a[c ? e[h] : h] : r;
          };
        }
        function hu(t) {
          return Ie(function(e) {
            var n = e.length, i = n, a = ne.prototype.thru;
            for (t && e.reverse(); i--; ) {
              var c = e[i];
              if (typeof c != "function")
                throw new ee(g);
              if (a && !h && Fr(c) == "wrapper")
                var h = new ne([], !0);
            }
            for (i = h ? i : n; ++i < n; ) {
              c = e[i];
              var p = Fr(c), v = p == "wrapper" ? Qi(c) : r;
              v && es(v[0]) && v[1] == (Ft | it | xt | ge) && !v[4].length && v[9] == 1 ? h = h[Fr(v[0])].apply(h, v[3]) : h = c.length == 1 && es(c) ? h[p]() : h.thru(c);
            }
            return function() {
              var b = arguments, A = b[0];
              if (h && b.length == 1 && z(A))
                return h.plant(A).value();
              for (var E = 0, M = n ? e[E].apply(this, b) : A; ++E < n; )
                M = e[E].call(this, M);
              return M;
            };
          });
        }
        function br(t, e, n, i, a, c, h, p, v, b) {
          var A = e & Ft, E = e & W, M = e & H, D = e & (it | vt), N = e & Ce, J = M ? r : Nn(t);
          function U() {
            for (var X = arguments.length, V = y(X), Yt = X; Yt--; )
              V[Yt] = arguments[Yt];
            if (D)
              var Dt = vn(U), Xt = ll(V, Dt);
            if (i && (V = au(V, i, a, D)), c && (V = uu(V, c, h, D)), X -= Xt, D && X < b) {
              var wt = Be(V, Dt);
              return du(
                t,
                e,
                br,
                U.placeholder,
                n,
                V,
                wt,
                p,
                v,
                b - X
              );
            }
            var he = E ? n : this, Le = M ? he[t] : t;
            return X = V.length, p ? V = wh(V, p) : N && X > 1 && V.reverse(), A && v < X && (V.length = v), this && this !== Et && this instanceof U && (Le = J || Nn(Le)), Le.apply(he, V);
          }
          return U;
        }
        function pu(t, e) {
          return function(n, i) {
            return If(n, t, e(i), {});
          };
        }
        function Ar(t, e) {
          return function(n, i) {
            var a;
            if (n === r && i === r)
              return e;
            if (n !== r && (a = n), i !== r) {
              if (a === r)
                return i;
              typeof n == "string" || typeof i == "string" ? (n = Jt(n), i = Jt(i)) : (n = Va(n), i = Va(i)), a = t(n, i);
            }
            return a;
          };
        }
        function Ji(t) {
          return Ie(function(e) {
            return e = pt(e, Kt(B())), Z(function(n) {
              var i = this;
              return t(e, function(a) {
                return Ht(a, i, n);
              });
            });
          });
        }
        function Er(t, e) {
          e = e === r ? " " : Jt(e);
          var n = e.length;
          if (n < 2)
            return n ? Ui(e, t) : e;
          var i = Ui(e, hr(t / cn(e)));
          return on(e) ? Ge(ce(i), 0, t).join("") : i.slice(0, t);
        }
        function th(t, e, n, i) {
          var a = e & W, c = Nn(t);
          function h() {
            for (var p = -1, v = arguments.length, b = -1, A = i.length, E = y(A + v), M = this && this !== Et && this instanceof h ? c : t; ++b < A; )
              E[b] = i[b];
            for (; v--; )
              E[b++] = arguments[++p];
            return Ht(M, a ? n : this, E);
          }
          return h;
        }
        function gu(t) {
          return function(e, n, i) {
            return i && typeof i != "number" && Ot(e, n, i) && (n = i = r), e = Me(e), n === r ? (n = e, e = 0) : n = Me(n), i = i === r ? e < n ? 1 : -1 : Me(i), Nf(e, n, i, t);
          };
        }
        function Ir(t) {
          return function(e, n) {
            return typeof e == "string" && typeof n == "string" || (e = ae(e), n = ae(n)), t(e, n);
          };
        }
        function du(t, e, n, i, a, c, h, p, v, b) {
          var A = e & it, E = A ? h : r, M = A ? r : h, D = A ? c : r, N = A ? r : c;
          e |= A ? xt : Re, e &= ~(A ? Re : xt), e & tt || (e &= -4);
          var J = [
            t,
            e,
            a,
            D,
            E,
            N,
            M,
            p,
            v,
            b
          ], U = n.apply(r, J);
          return es(t) && Iu(U, J), U.placeholder = i, Fu(U, t, e);
        }
        function Zi(t) {
          var e = St[t];
          return function(n, i) {
            if (n = ae(n), i = i == null ? 0 : Tt(K(i), 292), i && Fa(n)) {
              var a = (nt(n) + "e").split("e"), c = e(a[0] + "e" + (+a[1] + i));
              return a = (nt(c) + "e").split("e"), +(a[0] + "e" + (+a[1] - i));
            }
            return e(n);
          };
        }
        var eh = hn && 1 / nr(new hn([, -0]))[1] == rn ? function(t) {
          return new hn(t);
        } : _s;
        function _u(t) {
          return function(e) {
            var n = Mt(e);
            return n == dt ? bi(e) : n == ht ? vl(e) : cl(e, t(e));
          };
        }
        function Ee(t, e, n, i, a, c, h, p) {
          var v = e & H;
          if (!v && typeof t != "function")
            throw new ee(g);
          var b = i ? i.length : 0;
          if (b || (e &= -97, i = a = r), h = h === r ? h : bt(K(h), 0), p = p === r ? p : K(p), b -= a ? a.length : 0, e & Re) {
            var A = i, E = a;
            i = a = r;
          }
          var M = v ? r : Qi(t), D = [
            t,
            e,
            n,
            i,
            a,
            A,
            E,
            c,
            h,
            p
          ];
          if (M && _h(D, M), t = D[0], e = D[1], n = D[2], i = D[3], a = D[4], p = D[9] = D[9] === r ? v ? 0 : t.length : bt(D[9] - b, 0), !p && e & (it | vt) && (e &= -25), !e || e == W)
            var N = Vf(t, e, n);
          else e == it || e == vt ? N = jf(t, e, p) : (e == xt || e == (W | xt)) && !a.length ? N = th(t, e, n, i) : N = br.apply(r, D);
          var J = M ? Xa : Iu;
          return Fu(J(N, D), t, e);
        }
        function vu(t, e, n, i) {
          return t === r || fe(t, fn[n]) && !rt.call(i, n) ? e : t;
        }
        function mu(t, e, n, i, a, c) {
          return gt(t) && gt(e) && (c.set(e, t), yr(t, e, r, mu, c), c.delete(e)), t;
        }
        function nh(t) {
          return qn(t) ? r : t;
        }
        function wu(t, e, n, i, a, c) {
          var h = n & L, p = t.length, v = e.length;
          if (p != v && !(h && v > p))
            return !1;
          var b = c.get(t), A = c.get(e);
          if (b && A)
            return b == e && A == t;
          var E = -1, M = !0, D = n & T ? new Qe() : r;
          for (c.set(t, e), c.set(e, t); ++E < p; ) {
            var N = t[E], J = e[E];
            if (i)
              var U = h ? i(J, N, E, e, t, c) : i(N, J, E, t, e, c);
            if (U !== r) {
              if (U)
                continue;
              M = !1;
              break;
            }
            if (D) {
              if (!mi(e, function(X, V) {
                if (!Fn(D, V) && (N === X || a(N, X, n, i, c)))
                  return D.push(V);
              })) {
                M = !1;
                break;
              }
            } else if (!(N === J || a(N, J, n, i, c))) {
              M = !1;
              break;
            }
          }
          return c.delete(t), c.delete(e), M;
        }
        function rh(t, e, n, i, a, c, h) {
          switch (n) {
            case sn:
              if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset)
                return !1;
              t = t.buffer, e = e.buffer;
            case In:
              return !(t.byteLength != e.byteLength || !c(new or(t), new or(e)));
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
              var v = i & L;
              if (p || (p = nr), t.size != e.size && !v)
                return !1;
              var b = h.get(t);
              if (b)
                return b == e;
              i |= T, h.set(t, e);
              var A = wu(p(t), p(e), i, a, c, h);
              return h.delete(t), A;
            case Xn:
              if (Rn)
                return Rn.call(t) == Rn.call(e);
          }
          return !1;
        }
        function ih(t, e, n, i, a, c) {
          var h = n & L, p = Yi(t), v = p.length, b = Yi(e), A = b.length;
          if (v != A && !h)
            return !1;
          for (var E = v; E--; ) {
            var M = p[E];
            if (!(h ? M in e : rt.call(e, M)))
              return !1;
          }
          var D = c.get(t), N = c.get(e);
          if (D && N)
            return D == e && N == t;
          var J = !0;
          c.set(t, e), c.set(e, t);
          for (var U = h; ++E < v; ) {
            M = p[E];
            var X = t[M], V = e[M];
            if (i)
              var Yt = h ? i(V, X, M, e, t, c) : i(X, V, M, t, e, c);
            if (!(Yt === r ? X === V || a(X, V, n, i, c) : Yt)) {
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
          return rs(Au(t, r, ku), t + "");
        }
        function Yi(t) {
          return Na(t, At, ji);
        }
        function Xi(t) {
          return Na(t, qt, yu);
        }
        var Qi = gr ? function(t) {
          return gr.get(t);
        } : _s;
        function Fr(t) {
          for (var e = t.name + "", n = pn[e], i = rt.call(pn, e) ? n.length : 0; i--; ) {
            var a = n[i], c = a.func;
            if (c == null || c == t)
              return a.name;
          }
          return e;
        }
        function vn(t) {
          var e = rt.call(u, "placeholder") ? u : t;
          return e.placeholder;
        }
        function B() {
          var t = u.iteratee || gs;
          return t = t === gs ? qa : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function Tr(t, e) {
          var n = t.__data__;
          return hh(e) ? n[typeof e == "string" ? "string" : "hash"] : n.map;
        }
        function Vi(t) {
          for (var e = At(t), n = e.length; n--; ) {
            var i = e[n], a = t[i];
            e[n] = [i, a, Su(a)];
          }
          return e;
        }
        function tn(t, e) {
          var n = gl(t, e);
          return $a(n) ? n : r;
        }
        function sh(t) {
          var e = rt.call(t, Ye), n = t[Ye];
          try {
            t[Ye] = r;
            var i = !0;
          } catch {
          }
          var a = ar.call(t);
          return i && (e ? t[Ye] = n : delete t[Ye]), a;
        }
        var ji = Ei ? function(t) {
          return t == null ? [] : (t = st(t), De(Ei(t), function(e) {
            return Ea.call(t, e);
          }));
        } : vs, yu = Ei ? function(t) {
          for (var e = []; t; )
            We(e, ji(t)), t = cr(t);
          return e;
        } : vs, Mt = kt;
        (Ii && Mt(new Ii(new ArrayBuffer(1))) != sn || Mn && Mt(new Mn()) != dt || Fi && Mt(Fi.resolve()) != Nt || hn && Mt(new hn()) != ht || Ln && Mt(new Ln()) != En) && (Mt = function(t) {
          var e = kt(t), n = e == Ct ? t.constructor : r, i = n ? en(n) : "";
          if (i)
            switch (i) {
              case Ul:
                return sn;
              case $l:
                return dt;
              case ql:
                return Nt;
              case Gl:
                return ht;
              case zl:
                return En;
            }
          return e;
        });
        function ah(t, e, n) {
          for (var i = -1, a = n.length; ++i < a; ) {
            var c = n[i], h = c.size;
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
        function uh(t) {
          var e = t.match(hc);
          return e ? e[1].split(pc) : [];
        }
        function Cu(t, e, n) {
          e = qe(e, t);
          for (var i = -1, a = e.length, c = !1; ++i < a; ) {
            var h = we(e[i]);
            if (!(c = t != null && n(t, h)))
              break;
            t = t[h];
          }
          return c || ++i != a ? c : (a = t == null ? 0 : t.length, !!a && Dr(a) && Fe(h, a) && (z(t) || nn(t)));
        }
        function oh(t) {
          var e = t.length, n = new t.constructor(e);
          return e && typeof t[0] == "string" && rt.call(t, "index") && (n.index = t.index, n.input = t.input), n;
        }
        function xu(t) {
          return typeof t.constructor == "function" && !Un(t) ? gn(cr(t)) : {};
        }
        function ch(t, e, n) {
          var i = t.constructor;
          switch (e) {
            case In:
              return Ki(t);
            case ot:
            case yt:
              return new i(+t);
            case sn:
              return Kf(t, n);
            case Vr:
            case jr:
            case ti:
            case ei:
            case ni:
            case ri:
            case ii:
            case si:
            case ai:
              return iu(t, n);
            case dt:
              return new i();
            case Rt:
            case _e:
              return new i(t);
            case Vt:
              return Jf(t);
            case ht:
              return new i();
            case Xn:
              return Zf(t);
          }
        }
        function lh(t, e) {
          var n = e.length;
          if (!n)
            return t;
          var i = n - 1;
          return e[i] = (n > 1 ? "& " : "") + e[i], e = e.join(n > 2 ? ", " : " "), t.replace(fc, `{
/* [wrapped with ` + e + `] */
`);
        }
        function fh(t) {
          return z(t) || nn(t) || !!(Ia && t && t[Ia]);
        }
        function Fe(t, e) {
          var n = typeof t;
          return e = e ?? ke, !!e && (n == "number" || n != "symbol" && xc.test(t)) && t > -1 && t % 1 == 0 && t < e;
        }
        function Ot(t, e, n) {
          if (!gt(n))
            return !1;
          var i = typeof e;
          return (i == "number" ? $t(n) && Fe(e, n.length) : i == "string" && e in n) ? fe(n[e], t) : !1;
        }
        function ts(t, e) {
          if (z(t))
            return !1;
          var n = typeof t;
          return n == "number" || n == "symbol" || n == "boolean" || t == null || Zt(t) ? !0 : uc.test(t) || !ac.test(t) || e != null && t in st(e);
        }
        function hh(t) {
          var e = typeof t;
          return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
        }
        function es(t) {
          var e = Fr(t), n = u[e];
          if (typeof n != "function" || !(e in Q.prototype))
            return !1;
          if (t === n)
            return !0;
          var i = Qi(n);
          return !!i && t === i[0];
        }
        function ph(t) {
          return !!Sa && Sa in t;
        }
        var gh = ir ? Te : ms;
        function Un(t) {
          var e = t && t.constructor, n = typeof e == "function" && e.prototype || fn;
          return t === n;
        }
        function Su(t) {
          return t === t && !gt(t);
        }
        function bu(t, e) {
          return function(n) {
            return n == null ? !1 : n[t] === e && (e !== r || t in st(n));
          };
        }
        function dh(t) {
          var e = kr(t, function(i) {
            return n.size === x && n.clear(), i;
          }), n = e.cache;
          return e;
        }
        function _h(t, e) {
          var n = t[1], i = e[1], a = n | i, c = a < (W | H | Ft), h = i == Ft && n == it || i == Ft && n == ge && t[7].length <= e[8] || i == (Ft | ge) && e[7].length <= e[8] && n == it;
          if (!(c || h))
            return t;
          i & W && (t[2] = e[2], a |= n & W ? 0 : tt);
          var p = e[3];
          if (p) {
            var v = t[3];
            t[3] = v ? au(v, p, e[4]) : p, t[4] = v ? Be(t[3], F) : e[4];
          }
          return p = e[5], p && (v = t[5], t[5] = v ? uu(v, p, e[6]) : p, t[6] = v ? Be(t[5], F) : e[6]), p = e[7], p && (t[7] = p), i & Ft && (t[8] = t[8] == null ? e[8] : Tt(t[8], e[8])), t[9] == null && (t[9] = e[9]), t[0] = e[0], t[1] = a, t;
        }
        function vh(t) {
          var e = [];
          if (t != null)
            for (var n in st(t))
              e.push(n);
          return e;
        }
        function mh(t) {
          return ar.call(t);
        }
        function Au(t, e, n) {
          return e = bt(e === r ? t.length - 1 : e, 0), function() {
            for (var i = arguments, a = -1, c = bt(i.length - e, 0), h = y(c); ++a < c; )
              h[a] = i[e + a];
            a = -1;
            for (var p = y(e + 1); ++a < e; )
              p[a] = i[a];
            return p[e] = n(h), Ht(t, this, p);
          };
        }
        function Eu(t, e) {
          return e.length < 2 ? t : je(t, ie(e, 0, -1));
        }
        function wh(t, e) {
          for (var n = t.length, i = Tt(e.length, n), a = Ut(t); i--; ) {
            var c = e[i];
            t[i] = Fe(c, n) ? a[c] : r;
          }
          return t;
        }
        function ns(t, e) {
          if (!(e === "constructor" && typeof t[e] == "function") && e != "__proto__")
            return t[e];
        }
        var Iu = Tu(Xa), $n = Rl || function(t, e) {
          return Et.setTimeout(t, e);
        }, rs = Tu(qf);
        function Fu(t, e, n) {
          var i = e + "";
          return rs(t, lh(i, yh(uh(i), n)));
        }
        function Tu(t) {
          var e = 0, n = 0;
          return function() {
            var i = Wl(), a = Xr - (i - n);
            if (n = i, a > 0) {
              if (++e >= Jn)
                return arguments[0];
            } else
              e = 0;
            return t.apply(r, arguments);
          };
        }
        function Mr(t, e) {
          var n = -1, i = t.length, a = i - 1;
          for (e = e === r ? i : e; ++n < e; ) {
            var c = Ni(n, a), h = t[c];
            t[c] = t[n], t[n] = h;
          }
          return t.length = e, t;
        }
        var Mu = dh(function(t) {
          var e = [];
          return t.charCodeAt(0) === 46 && e.push(""), t.replace(oc, function(n, i, a, c) {
            e.push(a ? c.replace(_c, "$1") : i || n);
          }), e;
        });
        function we(t) {
          if (typeof t == "string" || Zt(t))
            return t;
          var e = t + "";
          return e == "0" && 1 / t == -1 / 0 ? "-0" : e;
        }
        function en(t) {
          if (t != null) {
            try {
              return sr.call(t);
            } catch {
            }
            try {
              return t + "";
            } catch {
            }
          }
          return "";
        }
        function yh(t, e) {
          return te(lt, function(n) {
            var i = "_." + n[0];
            e & n[1] && !tr(t, i) && t.push(i);
          }), t.sort();
        }
        function Lu(t) {
          if (t instanceof Q)
            return t.clone();
          var e = new ne(t.__wrapped__, t.__chain__);
          return e.__actions__ = Ut(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
        }
        function Ch(t, e, n) {
          (n ? Ot(t, e, n) : e === r) ? e = 1 : e = bt(K(e), 0);
          var i = t == null ? 0 : t.length;
          if (!i || e < 1)
            return [];
          for (var a = 0, c = 0, h = y(hr(i / e)); a < i; )
            h[c++] = ie(t, a, a += e);
          return h;
        }
        function xh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, i = 0, a = []; ++e < n; ) {
            var c = t[e];
            c && (a[i++] = c);
          }
          return a;
        }
        function Sh() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var e = y(t - 1), n = arguments[0], i = t; i--; )
            e[i - 1] = arguments[i];
          return We(z(n) ? Ut(n) : [n], It(e, 1));
        }
        var bh = Z(function(t, e) {
          return mt(t) ? On(t, It(e, 1, mt, !0)) : [];
        }), Ah = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = r), mt(t) ? On(t, It(e, 1, mt, !0), B(n, 2)) : [];
        }), Eh = Z(function(t, e) {
          var n = se(e);
          return mt(n) && (n = r), mt(t) ? On(t, It(e, 1, mt, !0), r, n) : [];
        });
        function Ih(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (e = n || e === r ? 1 : K(e), ie(t, e < 0 ? 0 : e, i)) : [];
        }
        function Fh(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (e = n || e === r ? 1 : K(e), e = i - e, ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function Th(t, e) {
          return t && t.length ? xr(t, B(e, 3), !0, !0) : [];
        }
        function Mh(t, e) {
          return t && t.length ? xr(t, B(e, 3), !0) : [];
        }
        function Lh(t, e, n, i) {
          var a = t == null ? 0 : t.length;
          return a ? (n && typeof n != "number" && Ot(t, e, n) && (n = 0, i = a), Sf(t, e, n, i)) : [];
        }
        function Pu(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = bt(i + a, 0)), er(t, B(e, 3), a);
        }
        function Ru(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var a = i - 1;
          return n !== r && (a = K(n), a = n < 0 ? bt(i + a, 0) : Tt(a, i - 1)), er(t, B(e, 3), a, !0);
        }
        function ku(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, 1) : [];
        }
        function Ph(t) {
          var e = t == null ? 0 : t.length;
          return e ? It(t, rn) : [];
        }
        function Rh(t, e) {
          var n = t == null ? 0 : t.length;
          return n ? (e = e === r ? 1 : K(e), It(t, e)) : [];
        }
        function kh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, i = {}; ++e < n; ) {
            var a = t[e];
            i[a[0]] = a[1];
          }
          return i;
        }
        function Ou(t) {
          return t && t.length ? t[0] : r;
        }
        function Oh(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var a = n == null ? 0 : K(n);
          return a < 0 && (a = bt(i + a, 0)), un(t, e, a);
        }
        function Dh(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 0, -1) : [];
        }
        var Wh = Z(function(t) {
          var e = pt(t, zi);
          return e.length && e[0] === t[0] ? ki(e) : [];
        }), Bh = Z(function(t) {
          var e = se(t), n = pt(t, zi);
          return e === se(n) ? e = r : n.pop(), n.length && n[0] === t[0] ? ki(n, B(e, 2)) : [];
        }), Nh = Z(function(t) {
          var e = se(t), n = pt(t, zi);
          return e = typeof e == "function" ? e : r, e && n.pop(), n.length && n[0] === t[0] ? ki(n, r, e) : [];
        });
        function Uh(t, e) {
          return t == null ? "" : Ol.call(t, e);
        }
        function se(t) {
          var e = t == null ? 0 : t.length;
          return e ? t[e - 1] : r;
        }
        function $h(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var a = i;
          return n !== r && (a = K(n), a = a < 0 ? bt(i + a, 0) : Tt(a, i - 1)), e === e ? wl(t, e, a) : er(t, da, a, !0);
        }
        function qh(t, e) {
          return t && t.length ? Ka(t, K(e)) : r;
        }
        var Gh = Z(Du);
        function Du(t, e) {
          return t && t.length && e && e.length ? Bi(t, e) : t;
        }
        function zh(t, e, n) {
          return t && t.length && e && e.length ? Bi(t, e, B(n, 2)) : t;
        }
        function Hh(t, e, n) {
          return t && t.length && e && e.length ? Bi(t, e, r, n) : t;
        }
        var Kh = Ie(function(t, e) {
          var n = t == null ? 0 : t.length, i = Mi(t, e);
          return Ya(t, pt(e, function(a) {
            return Fe(a, n) ? +a : a;
          }).sort(su)), i;
        });
        function Jh(t, e) {
          var n = [];
          if (!(t && t.length))
            return n;
          var i = -1, a = [], c = t.length;
          for (e = B(e, 3); ++i < c; ) {
            var h = t[i];
            e(h, i, t) && (n.push(h), a.push(i));
          }
          return Ya(t, a), n;
        }
        function is(t) {
          return t == null ? t : Nl.call(t);
        }
        function Zh(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (n && typeof n != "number" && Ot(t, e, n) ? (e = 0, n = i) : (e = e == null ? 0 : K(e), n = n === r ? i : K(n)), ie(t, e, n)) : [];
        }
        function Yh(t, e) {
          return Cr(t, e);
        }
        function Xh(t, e, n) {
          return $i(t, e, B(n, 2));
        }
        function Qh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var i = Cr(t, e);
            if (i < n && fe(t[i], e))
              return i;
          }
          return -1;
        }
        function Vh(t, e) {
          return Cr(t, e, !0);
        }
        function jh(t, e, n) {
          return $i(t, e, B(n, 2), !0);
        }
        function tp(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var i = Cr(t, e, !0) - 1;
            if (fe(t[i], e))
              return i;
          }
          return -1;
        }
        function ep(t) {
          return t && t.length ? Qa(t) : [];
        }
        function np(t, e) {
          return t && t.length ? Qa(t, B(e, 2)) : [];
        }
        function rp(t) {
          var e = t == null ? 0 : t.length;
          return e ? ie(t, 1, e) : [];
        }
        function ip(t, e, n) {
          return t && t.length ? (e = n || e === r ? 1 : K(e), ie(t, 0, e < 0 ? 0 : e)) : [];
        }
        function sp(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (e = n || e === r ? 1 : K(e), e = i - e, ie(t, e < 0 ? 0 : e, i)) : [];
        }
        function ap(t, e) {
          return t && t.length ? xr(t, B(e, 3), !1, !0) : [];
        }
        function up(t, e) {
          return t && t.length ? xr(t, B(e, 3)) : [];
        }
        var op = Z(function(t) {
          return $e(It(t, 1, mt, !0));
        }), cp = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = r), $e(It(t, 1, mt, !0), B(e, 2));
        }), lp = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : r, $e(It(t, 1, mt, !0), r, e);
        });
        function fp(t) {
          return t && t.length ? $e(t) : [];
        }
        function hp(t, e) {
          return t && t.length ? $e(t, B(e, 2)) : [];
        }
        function pp(t, e) {
          return e = typeof e == "function" ? e : r, t && t.length ? $e(t, r, e) : [];
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
        function Wu(t, e) {
          if (!(t && t.length))
            return [];
          var n = ss(t);
          return e == null ? n : pt(n, function(i) {
            return Ht(e, r, i);
          });
        }
        var gp = Z(function(t, e) {
          return mt(t) ? On(t, e) : [];
        }), dp = Z(function(t) {
          return Gi(De(t, mt));
        }), _p = Z(function(t) {
          var e = se(t);
          return mt(e) && (e = r), Gi(De(t, mt), B(e, 2));
        }), vp = Z(function(t) {
          var e = se(t);
          return e = typeof e == "function" ? e : r, Gi(De(t, mt), r, e);
        }), mp = Z(ss);
        function wp(t, e) {
          return eu(t || [], e || [], kn);
        }
        function yp(t, e) {
          return eu(t || [], e || [], Bn);
        }
        var Cp = Z(function(t) {
          var e = t.length, n = e > 1 ? t[e - 1] : r;
          return n = typeof n == "function" ? (t.pop(), n) : r, Wu(t, n);
        });
        function Bu(t) {
          var e = u(t);
          return e.__chain__ = !0, e;
        }
        function xp(t, e) {
          return e(t), t;
        }
        function Lr(t, e) {
          return e(t);
        }
        var Sp = Ie(function(t) {
          var e = t.length, n = e ? t[0] : 0, i = this.__wrapped__, a = function(c) {
            return Mi(c, t);
          };
          return e > 1 || this.__actions__.length || !(i instanceof Q) || !Fe(n) ? this.thru(a) : (i = i.slice(n, +n + (e ? 1 : 0)), i.__actions__.push({
            func: Lr,
            args: [a],
            thisArg: r
          }), new ne(i, this.__chain__).thru(function(c) {
            return e && !c.length && c.push(r), c;
          }));
        });
        function bp() {
          return Bu(this);
        }
        function Ap() {
          return new ne(this.value(), this.__chain__);
        }
        function Ep() {
          this.__values__ === r && (this.__values__ = Vu(this.value()));
          var t = this.__index__ >= this.__values__.length, e = t ? r : this.__values__[this.__index__++];
          return { done: t, value: e };
        }
        function Ip() {
          return this;
        }
        function Fp(t) {
          for (var e, n = this; n instanceof _r; ) {
            var i = Lu(n);
            i.__index__ = 0, i.__values__ = r, e ? a.__wrapped__ = i : e = i;
            var a = i;
            n = n.__wrapped__;
          }
          return a.__wrapped__ = t, e;
        }
        function Tp() {
          var t = this.__wrapped__;
          if (t instanceof Q) {
            var e = t;
            return this.__actions__.length && (e = new Q(this)), e = e.reverse(), e.__actions__.push({
              func: Lr,
              args: [is],
              thisArg: r
            }), new ne(e, this.__chain__);
          }
          return this.thru(is);
        }
        function Mp() {
          return tu(this.__wrapped__, this.__actions__);
        }
        var Lp = Sr(function(t, e, n) {
          rt.call(t, n) ? ++t[n] : Ae(t, n, 1);
        });
        function Pp(t, e, n) {
          var i = z(t) ? pa : xf;
          return n && Ot(t, e, n) && (e = r), i(t, B(e, 3));
        }
        function Rp(t, e) {
          var n = z(t) ? De : Wa;
          return n(t, B(e, 3));
        }
        var kp = fu(Pu), Op = fu(Ru);
        function Dp(t, e) {
          return It(Pr(t, e), 1);
        }
        function Wp(t, e) {
          return It(Pr(t, e), rn);
        }
        function Bp(t, e, n) {
          return n = n === r ? 1 : K(n), It(Pr(t, e), n);
        }
        function Nu(t, e) {
          var n = z(t) ? te : Ue;
          return n(t, B(e, 3));
        }
        function Uu(t, e) {
          var n = z(t) ? nl : Da;
          return n(t, B(e, 3));
        }
        var Np = Sr(function(t, e, n) {
          rt.call(t, n) ? t[n].push(e) : Ae(t, n, [e]);
        });
        function Up(t, e, n, i) {
          t = $t(t) ? t : wn(t), n = n && !i ? K(n) : 0;
          var a = t.length;
          return n < 0 && (n = bt(a + n, 0)), Wr(t) ? n <= a && t.indexOf(e, n) > -1 : !!a && un(t, e, n) > -1;
        }
        var $p = Z(function(t, e, n) {
          var i = -1, a = typeof e == "function", c = $t(t) ? y(t.length) : [];
          return Ue(t, function(h) {
            c[++i] = a ? Ht(e, h, n) : Dn(h, e, n);
          }), c;
        }), qp = Sr(function(t, e, n) {
          Ae(t, n, e);
        });
        function Pr(t, e) {
          var n = z(t) ? pt : Ga;
          return n(t, B(e, 3));
        }
        function Gp(t, e, n, i) {
          return t == null ? [] : (z(e) || (e = e == null ? [] : [e]), n = i ? r : n, z(n) || (n = n == null ? [] : [n]), Ja(t, e, n));
        }
        var zp = Sr(function(t, e, n) {
          t[n ? 0 : 1].push(e);
        }, function() {
          return [[], []];
        });
        function Hp(t, e, n) {
          var i = z(t) ? vi : va, a = arguments.length < 3;
          return i(t, B(e, 4), n, a, Ue);
        }
        function Kp(t, e, n) {
          var i = z(t) ? rl : va, a = arguments.length < 3;
          return i(t, B(e, 4), n, a, Da);
        }
        function Jp(t, e) {
          var n = z(t) ? De : Wa;
          return n(t, Or(B(e, 3)));
        }
        function Zp(t) {
          var e = z(t) ? Pa : Uf;
          return e(t);
        }
        function Yp(t, e, n) {
          (n ? Ot(t, e, n) : e === r) ? e = 1 : e = K(e);
          var i = z(t) ? vf : $f;
          return i(t, e);
        }
        function Xp(t) {
          var e = z(t) ? mf : Gf;
          return e(t);
        }
        function Qp(t) {
          if (t == null)
            return 0;
          if ($t(t))
            return Wr(t) ? cn(t) : t.length;
          var e = Mt(t);
          return e == dt || e == ht ? t.size : Di(t).length;
        }
        function Vp(t, e, n) {
          var i = z(t) ? mi : zf;
          return n && Ot(t, e, n) && (e = r), i(t, B(e, 3));
        }
        var jp = Z(function(t, e) {
          if (t == null)
            return [];
          var n = e.length;
          return n > 1 && Ot(t, e[0], e[1]) ? e = [] : n > 2 && Ot(e[0], e[1], e[2]) && (e = [e[0]]), Ja(t, It(e, 1), []);
        }), Rr = Pl || function() {
          return Et.Date.now();
        };
        function tg(t, e) {
          if (typeof e != "function")
            throw new ee(g);
          return t = K(t), function() {
            if (--t < 1)
              return e.apply(this, arguments);
          };
        }
        function $u(t, e, n) {
          return e = n ? r : e, e = t && e == null ? t.length : e, Ee(t, Ft, r, r, r, r, e);
        }
        function qu(t, e) {
          var n;
          if (typeof e != "function")
            throw new ee(g);
          return t = K(t), function() {
            return --t > 0 && (n = e.apply(this, arguments)), t <= 1 && (e = r), n;
          };
        }
        var as = Z(function(t, e, n) {
          var i = W;
          if (n.length) {
            var a = Be(n, vn(as));
            i |= xt;
          }
          return Ee(t, i, e, n, a);
        }), Gu = Z(function(t, e, n) {
          var i = W | H;
          if (n.length) {
            var a = Be(n, vn(Gu));
            i |= xt;
          }
          return Ee(e, i, t, n, a);
        });
        function zu(t, e, n) {
          e = n ? r : e;
          var i = Ee(t, it, r, r, r, r, r, e);
          return i.placeholder = zu.placeholder, i;
        }
        function Hu(t, e, n) {
          e = n ? r : e;
          var i = Ee(t, vt, r, r, r, r, r, e);
          return i.placeholder = Hu.placeholder, i;
        }
        function Ku(t, e, n) {
          var i, a, c, h, p, v, b = 0, A = !1, E = !1, M = !0;
          if (typeof t != "function")
            throw new ee(g);
          e = ae(e) || 0, gt(n) && (A = !!n.leading, E = "maxWait" in n, c = E ? bt(ae(n.maxWait) || 0, e) : c, M = "trailing" in n ? !!n.trailing : M);
          function D(wt) {
            var he = i, Le = a;
            return i = a = r, b = wt, h = t.apply(Le, he), h;
          }
          function N(wt) {
            return b = wt, p = $n(X, e), A ? D(wt) : h;
          }
          function J(wt) {
            var he = wt - v, Le = wt - b, fo = e - he;
            return E ? Tt(fo, c - Le) : fo;
          }
          function U(wt) {
            var he = wt - v, Le = wt - b;
            return v === r || he >= e || he < 0 || E && Le >= c;
          }
          function X() {
            var wt = Rr();
            if (U(wt))
              return V(wt);
            p = $n(X, J(wt));
          }
          function V(wt) {
            return p = r, M && i ? D(wt) : (i = a = r, h);
          }
          function Yt() {
            p !== r && nu(p), b = 0, i = v = a = p = r;
          }
          function Dt() {
            return p === r ? h : V(Rr());
          }
          function Xt() {
            var wt = Rr(), he = U(wt);
            if (i = arguments, a = this, v = wt, he) {
              if (p === r)
                return N(v);
              if (E)
                return nu(p), p = $n(X, e), D(v);
            }
            return p === r && (p = $n(X, e)), h;
          }
          return Xt.cancel = Yt, Xt.flush = Dt, Xt;
        }
        var eg = Z(function(t, e) {
          return Oa(t, 1, e);
        }), ng = Z(function(t, e, n) {
          return Oa(t, ae(e) || 0, n);
        });
        function rg(t) {
          return Ee(t, Ce);
        }
        function kr(t, e) {
          if (typeof t != "function" || e != null && typeof e != "function")
            throw new ee(g);
          var n = function() {
            var i = arguments, a = e ? e.apply(this, i) : i[0], c = n.cache;
            if (c.has(a))
              return c.get(a);
            var h = t.apply(this, i);
            return n.cache = c.set(a, h) || c, h;
          };
          return n.cache = new (kr.Cache || be)(), n;
        }
        kr.Cache = be;
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
        function ig(t) {
          return qu(2, t);
        }
        var sg = Hf(function(t, e) {
          e = e.length == 1 && z(e[0]) ? pt(e[0], Kt(B())) : pt(It(e, 1), Kt(B()));
          var n = e.length;
          return Z(function(i) {
            for (var a = -1, c = Tt(i.length, n); ++a < c; )
              i[a] = e[a].call(this, i[a]);
            return Ht(t, this, i);
          });
        }), us = Z(function(t, e) {
          var n = Be(e, vn(us));
          return Ee(t, xt, r, e, n);
        }), Ju = Z(function(t, e) {
          var n = Be(e, vn(Ju));
          return Ee(t, Re, r, e, n);
        }), ag = Ie(function(t, e) {
          return Ee(t, ge, r, r, r, e);
        });
        function ug(t, e) {
          if (typeof t != "function")
            throw new ee(g);
          return e = e === r ? e : K(e), Z(t, e);
        }
        function og(t, e) {
          if (typeof t != "function")
            throw new ee(g);
          return e = e == null ? 0 : bt(K(e), 0), Z(function(n) {
            var i = n[e], a = Ge(n, 0, e);
            return i && We(a, i), Ht(t, this, a);
          });
        }
        function cg(t, e, n) {
          var i = !0, a = !0;
          if (typeof t != "function")
            throw new ee(g);
          return gt(n) && (i = "leading" in n ? !!n.leading : i, a = "trailing" in n ? !!n.trailing : a), Ku(t, e, {
            leading: i,
            maxWait: e,
            trailing: a
          });
        }
        function lg(t) {
          return $u(t, 1);
        }
        function fg(t, e) {
          return us(Hi(e), t);
        }
        function hg() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return z(t) ? t : [t];
        }
        function pg(t) {
          return re(t, O);
        }
        function gg(t, e) {
          return e = typeof e == "function" ? e : r, re(t, O, e);
        }
        function dg(t) {
          return re(t, m | O);
        }
        function _g(t, e) {
          return e = typeof e == "function" ? e : r, re(t, m | O, e);
        }
        function vg(t, e) {
          return e == null || ka(t, e, At(e));
        }
        function fe(t, e) {
          return t === e || t !== t && e !== e;
        }
        var mg = Ir(Ri), wg = Ir(function(t, e) {
          return t >= e;
        }), nn = Ua(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Ua : function(t) {
          return _t(t) && rt.call(t, "callee") && !Ea.call(t, "callee");
        }, z = y.isArray, yg = ua ? Kt(ua) : Ff;
        function $t(t) {
          return t != null && Dr(t.length) && !Te(t);
        }
        function mt(t) {
          return _t(t) && $t(t);
        }
        function Cg(t) {
          return t === !0 || t === !1 || _t(t) && kt(t) == ot;
        }
        var ze = kl || ms, xg = oa ? Kt(oa) : Tf;
        function Sg(t) {
          return _t(t) && t.nodeType === 1 && !qn(t);
        }
        function bg(t) {
          if (t == null)
            return !0;
          if ($t(t) && (z(t) || typeof t == "string" || typeof t.splice == "function" || ze(t) || mn(t) || nn(t)))
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
        function Ag(t, e) {
          return Wn(t, e);
        }
        function Eg(t, e, n) {
          n = typeof n == "function" ? n : r;
          var i = n ? n(t, e) : r;
          return i === r ? Wn(t, e, r, n) : !!i;
        }
        function os(t) {
          if (!_t(t))
            return !1;
          var e = kt(t);
          return e == Pt || e == zt || typeof t.message == "string" && typeof t.name == "string" && !qn(t);
        }
        function Ig(t) {
          return typeof t == "number" && Fa(t);
        }
        function Te(t) {
          if (!gt(t))
            return !1;
          var e = kt(t);
          return e == Bt || e == de || e == at || e == oe;
        }
        function Zu(t) {
          return typeof t == "number" && t == K(t);
        }
        function Dr(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= ke;
        }
        function gt(t) {
          var e = typeof t;
          return t != null && (e == "object" || e == "function");
        }
        function _t(t) {
          return t != null && typeof t == "object";
        }
        var Yu = ca ? Kt(ca) : Lf;
        function Fg(t, e) {
          return t === e || Oi(t, e, Vi(e));
        }
        function Tg(t, e, n) {
          return n = typeof n == "function" ? n : r, Oi(t, e, Vi(e), n);
        }
        function Mg(t) {
          return Xu(t) && t != +t;
        }
        function Lg(t) {
          if (gh(t))
            throw new G(_);
          return $a(t);
        }
        function Pg(t) {
          return t === null;
        }
        function Rg(t) {
          return t == null;
        }
        function Xu(t) {
          return typeof t == "number" || _t(t) && kt(t) == Rt;
        }
        function qn(t) {
          if (!_t(t) || kt(t) != Ct)
            return !1;
          var e = cr(t);
          if (e === null)
            return !0;
          var n = rt.call(e, "constructor") && e.constructor;
          return typeof n == "function" && n instanceof n && sr.call(n) == Fl;
        }
        var cs = la ? Kt(la) : Pf;
        function kg(t) {
          return Zu(t) && t >= -9007199254740991 && t <= ke;
        }
        var Qu = fa ? Kt(fa) : Rf;
        function Wr(t) {
          return typeof t == "string" || !z(t) && _t(t) && kt(t) == _e;
        }
        function Zt(t) {
          return typeof t == "symbol" || _t(t) && kt(t) == Xn;
        }
        var mn = ha ? Kt(ha) : kf;
        function Og(t) {
          return t === r;
        }
        function Dg(t) {
          return _t(t) && Mt(t) == En;
        }
        function Wg(t) {
          return _t(t) && kt(t) == Vo;
        }
        var Bg = Ir(Wi), Ng = Ir(function(t, e) {
          return t <= e;
        });
        function Vu(t) {
          if (!t)
            return [];
          if ($t(t))
            return Wr(t) ? ce(t) : Ut(t);
          if (Tn && t[Tn])
            return _l(t[Tn]());
          var e = Mt(t), n = e == dt ? bi : e == ht ? nr : wn;
          return n(t);
        }
        function Me(t) {
          if (!t)
            return t === 0 ? t : 0;
          if (t = ae(t), t === rn || t === -1 / 0) {
            var e = t < 0 ? -1 : 1;
            return e * Yn;
          }
          return t === t ? t : 0;
        }
        function K(t) {
          var e = Me(t), n = e % 1;
          return e === e ? n ? e - n : e : 0;
        }
        function ju(t) {
          return t ? Ve(K(t), 0, P) : 0;
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
          t = ma(t);
          var n = wc.test(t);
          return n || Cc.test(t) ? jc(t.slice(2), n ? 2 : 8) : mc.test(t) ? xe : +t;
        }
        function to(t) {
          return me(t, qt(t));
        }
        function Ug(t) {
          return t ? Ve(K(t), -9007199254740991, ke) : t === 0 ? t : 0;
        }
        function nt(t) {
          return t == null ? "" : Jt(t);
        }
        var $g = dn(function(t, e) {
          if (Un(e) || $t(e)) {
            me(e, At(e), t);
            return;
          }
          for (var n in e)
            rt.call(e, n) && kn(t, n, e[n]);
        }), eo = dn(function(t, e) {
          me(e, qt(e), t);
        }), Br = dn(function(t, e, n, i) {
          me(e, qt(e), t, i);
        }), qg = dn(function(t, e, n, i) {
          me(e, At(e), t, i);
        }), Gg = Ie(Mi);
        function zg(t, e) {
          var n = gn(t);
          return e == null ? n : Ra(n, e);
        }
        var Hg = Z(function(t, e) {
          t = st(t);
          var n = -1, i = e.length, a = i > 2 ? e[2] : r;
          for (a && Ot(e[0], e[1], a) && (i = 1); ++n < i; )
            for (var c = e[n], h = qt(c), p = -1, v = h.length; ++p < v; ) {
              var b = h[p], A = t[b];
              (A === r || fe(A, fn[b]) && !rt.call(t, b)) && (t[b] = c[b]);
            }
          return t;
        }), Kg = Z(function(t) {
          return t.push(r, mu), Ht(no, r, t);
        });
        function Jg(t, e) {
          return ga(t, B(e, 3), ve);
        }
        function Zg(t, e) {
          return ga(t, B(e, 3), Pi);
        }
        function Yg(t, e) {
          return t == null ? t : Li(t, B(e, 3), qt);
        }
        function Xg(t, e) {
          return t == null ? t : Ba(t, B(e, 3), qt);
        }
        function Qg(t, e) {
          return t && ve(t, B(e, 3));
        }
        function Vg(t, e) {
          return t && Pi(t, B(e, 3));
        }
        function jg(t) {
          return t == null ? [] : wr(t, At(t));
        }
        function td(t) {
          return t == null ? [] : wr(t, qt(t));
        }
        function ls(t, e, n) {
          var i = t == null ? r : je(t, e);
          return i === r ? n : i;
        }
        function ed(t, e) {
          return t != null && Cu(t, e, bf);
        }
        function fs(t, e) {
          return t != null && Cu(t, e, Af);
        }
        var nd = pu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = ar.call(e)), t[e] = n;
        }, ps(Gt)), rd = pu(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = ar.call(e)), rt.call(t, e) ? t[e].push(n) : t[e] = [n];
        }, B), id = Z(Dn);
        function At(t) {
          return $t(t) ? La(t) : Di(t);
        }
        function qt(t) {
          return $t(t) ? La(t, !0) : Of(t);
        }
        function sd(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(i, a, c) {
            Ae(n, e(i, a, c), i);
          }), n;
        }
        function ad(t, e) {
          var n = {};
          return e = B(e, 3), ve(t, function(i, a, c) {
            Ae(n, a, e(i, a, c));
          }), n;
        }
        var ud = dn(function(t, e, n) {
          yr(t, e, n);
        }), no = dn(function(t, e, n, i) {
          yr(t, e, n, i);
        }), od = Ie(function(t, e) {
          var n = {};
          if (t == null)
            return n;
          var i = !1;
          e = pt(e, function(c) {
            return c = qe(c, t), i || (i = c.length > 1), c;
          }), me(t, Xi(t), n), i && (n = re(n, m | R | O, nh));
          for (var a = e.length; a--; )
            qi(n, e[a]);
          return n;
        });
        function cd(t, e) {
          return ro(t, Or(B(e)));
        }
        var ld = Ie(function(t, e) {
          return t == null ? {} : Wf(t, e);
        });
        function ro(t, e) {
          if (t == null)
            return {};
          var n = pt(Xi(t), function(i) {
            return [i];
          });
          return e = B(e), Za(t, n, function(i, a) {
            return e(i, a[0]);
          });
        }
        function fd(t, e, n) {
          e = qe(e, t);
          var i = -1, a = e.length;
          for (a || (a = 1, t = r); ++i < a; ) {
            var c = t == null ? r : t[we(e[i])];
            c === r && (i = a, c = n), t = Te(c) ? c.call(t) : c;
          }
          return t;
        }
        function hd(t, e, n) {
          return t == null ? t : Bn(t, e, n);
        }
        function pd(t, e, n, i) {
          return i = typeof i == "function" ? i : r, t == null ? t : Bn(t, e, n, i);
        }
        var io = _u(At), so = _u(qt);
        function gd(t, e, n) {
          var i = z(t), a = i || ze(t) || mn(t);
          if (e = B(e, 4), n == null) {
            var c = t && t.constructor;
            a ? n = i ? new c() : [] : gt(t) ? n = Te(c) ? gn(cr(t)) : {} : n = {};
          }
          return (a ? te : ve)(t, function(h, p, v) {
            return e(n, h, p, v);
          }), n;
        }
        function dd(t, e) {
          return t == null ? !0 : qi(t, e);
        }
        function _d(t, e, n) {
          return t == null ? t : ja(t, e, Hi(n));
        }
        function vd(t, e, n, i) {
          return i = typeof i == "function" ? i : r, t == null ? t : ja(t, e, Hi(n), i);
        }
        function wn(t) {
          return t == null ? [] : Si(t, At(t));
        }
        function md(t) {
          return t == null ? [] : Si(t, qt(t));
        }
        function wd(t, e, n) {
          return n === r && (n = e, e = r), n !== r && (n = ae(n), n = n === n ? n : 0), e !== r && (e = ae(e), e = e === e ? e : 0), Ve(ae(t), e, n);
        }
        function yd(t, e, n) {
          return e = Me(e), n === r ? (n = e, e = 0) : n = Me(n), t = ae(t), Ef(t, e, n);
        }
        function Cd(t, e, n) {
          if (n && typeof n != "boolean" && Ot(t, e, n) && (e = n = r), n === r && (typeof e == "boolean" ? (n = e, e = r) : typeof t == "boolean" && (n = t, t = r)), t === r && e === r ? (t = 0, e = 1) : (t = Me(t), e === r ? (e = t, t = 0) : e = Me(e)), t > e) {
            var i = t;
            t = e, e = i;
          }
          if (n || t % 1 || e % 1) {
            var a = Ta();
            return Tt(t + a * (e - t + Vc("1e-" + ((a + "").length - 1))), e);
          }
          return Ni(t, e);
        }
        var xd = _n(function(t, e, n) {
          return e = e.toLowerCase(), t + (n ? ao(e) : e);
        });
        function ao(t) {
          return hs(nt(t).toLowerCase());
        }
        function uo(t) {
          return t = nt(t), t && t.replace(Sc, fl).replace(qc, "");
        }
        function Sd(t, e, n) {
          t = nt(t), e = Jt(e);
          var i = t.length;
          n = n === r ? i : Ve(K(n), 0, i);
          var a = n;
          return n -= e.length, n >= 0 && t.slice(n, a) == e;
        }
        function bd(t) {
          return t = nt(t), t && rc.test(t) ? t.replace(Bs, hl) : t;
        }
        function Ad(t) {
          return t = nt(t), t && cc.test(t) ? t.replace(ui, "\\$&") : t;
        }
        var Ed = _n(function(t, e, n) {
          return t + (n ? "-" : "") + e.toLowerCase();
        }), Id = _n(function(t, e, n) {
          return t + (n ? " " : "") + e.toLowerCase();
        }), Fd = lu("toLowerCase");
        function Td(t, e, n) {
          t = nt(t), e = K(e);
          var i = e ? cn(t) : 0;
          if (!e || i >= e)
            return t;
          var a = (e - i) / 2;
          return Er(pr(a), n) + t + Er(hr(a), n);
        }
        function Md(t, e, n) {
          t = nt(t), e = K(e);
          var i = e ? cn(t) : 0;
          return e && i < e ? t + Er(e - i, n) : t;
        }
        function Ld(t, e, n) {
          t = nt(t), e = K(e);
          var i = e ? cn(t) : 0;
          return e && i < e ? Er(e - i, n) + t : t;
        }
        function Pd(t, e, n) {
          return n || e == null ? e = 0 : e && (e = +e), Bl(nt(t).replace(oi, ""), e || 0);
        }
        function Rd(t, e, n) {
          return (n ? Ot(t, e, n) : e === r) ? e = 1 : e = K(e), Ui(nt(t), e);
        }
        function kd() {
          var t = arguments, e = nt(t[0]);
          return t.length < 3 ? e : e.replace(t[1], t[2]);
        }
        var Od = _n(function(t, e, n) {
          return t + (n ? "_" : "") + e.toLowerCase();
        });
        function Dd(t, e, n) {
          return n && typeof n != "number" && Ot(t, e, n) && (e = n = r), n = n === r ? P : n >>> 0, n ? (t = nt(t), t && (typeof e == "string" || e != null && !cs(e)) && (e = Jt(e), !e && on(t)) ? Ge(ce(t), 0, n) : t.split(e, n)) : [];
        }
        var Wd = _n(function(t, e, n) {
          return t + (n ? " " : "") + hs(e);
        });
        function Bd(t, e, n) {
          return t = nt(t), n = n == null ? 0 : Ve(K(n), 0, t.length), e = Jt(e), t.slice(n, n + e.length) == e;
        }
        function Nd(t, e, n) {
          var i = u.templateSettings;
          n && Ot(t, e, n) && (e = r), t = nt(t), e = Br({}, e, i, vu);
          var a = Br({}, e.imports, i.imports, vu), c = At(a), h = Si(a, c), p, v, b = 0, A = e.interpolate || Qn, E = "__p += '", M = Ai(
            (e.escape || Qn).source + "|" + A.source + "|" + (A === Ns ? vc : Qn).source + "|" + (e.evaluate || Qn).source + "|$",
            "g"
          ), D = "//# sourceURL=" + (rt.call(e, "sourceURL") ? (e.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Jc + "]") + `
`;
          t.replace(M, function(U, X, V, Yt, Dt, Xt) {
            return V || (V = Yt), E += t.slice(b, Xt).replace(bc, pl), X && (p = !0, E += `' +
__e(` + X + `) +
'`), Dt && (v = !0, E += `';
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
          else if (dc.test(N))
            throw new G(w);
          E = (v ? E.replace(jo, "") : E).replace(tc, "$1").replace(ec, "$1;"), E = "function(" + (N || "obj") + `) {
` + (N ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (p ? ", __e = _.escape" : "") + (v ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + E + `return __p
}`;
          var J = co(function() {
            return et(c, D + "return " + E).apply(r, h);
          });
          if (J.source = E, os(J))
            throw J;
          return J;
        }
        function Ud(t) {
          return nt(t).toLowerCase();
        }
        function $d(t) {
          return nt(t).toUpperCase();
        }
        function qd(t, e, n) {
          if (t = nt(t), t && (n || e === r))
            return ma(t);
          if (!t || !(e = Jt(e)))
            return t;
          var i = ce(t), a = ce(e), c = wa(i, a), h = ya(i, a) + 1;
          return Ge(i, c, h).join("");
        }
        function Gd(t, e, n) {
          if (t = nt(t), t && (n || e === r))
            return t.slice(0, xa(t) + 1);
          if (!t || !(e = Jt(e)))
            return t;
          var i = ce(t), a = ya(i, ce(e)) + 1;
          return Ge(i, 0, a).join("");
        }
        function zd(t, e, n) {
          if (t = nt(t), t && (n || e === r))
            return t.replace(oi, "");
          if (!t || !(e = Jt(e)))
            return t;
          var i = ce(t), a = wa(i, ce(e));
          return Ge(i, a).join("");
        }
        function Hd(t, e) {
          var n = Lt, i = bn;
          if (gt(e)) {
            var a = "separator" in e ? e.separator : a;
            n = "length" in e ? K(e.length) : n, i = "omission" in e ? Jt(e.omission) : i;
          }
          t = nt(t);
          var c = t.length;
          if (on(t)) {
            var h = ce(t);
            c = h.length;
          }
          if (n >= c)
            return t;
          var p = n - cn(i);
          if (p < 1)
            return i;
          var v = h ? Ge(h, 0, p).join("") : t.slice(0, p);
          if (a === r)
            return v + i;
          if (h && (p += v.length - p), cs(a)) {
            if (t.slice(p).search(a)) {
              var b, A = v;
              for (a.global || (a = Ai(a.source, nt(Us.exec(a)) + "g")), a.lastIndex = 0; b = a.exec(A); )
                var E = b.index;
              v = v.slice(0, E === r ? p : E);
            }
          } else if (t.indexOf(Jt(a), p) != p) {
            var M = v.lastIndexOf(a);
            M > -1 && (v = v.slice(0, M));
          }
          return v + i;
        }
        function Kd(t) {
          return t = nt(t), t && nc.test(t) ? t.replace(Ws, yl) : t;
        }
        var Jd = _n(function(t, e, n) {
          return t + (n ? " " : "") + e.toUpperCase();
        }), hs = lu("toUpperCase");
        function oo(t, e, n) {
          return t = nt(t), e = n ? r : e, e === r ? dl(t) ? Sl(t) : al(t) : t.match(e) || [];
        }
        var co = Z(function(t, e) {
          try {
            return Ht(t, r, e);
          } catch (n) {
            return os(n) ? n : new G(n);
          }
        }), Zd = Ie(function(t, e) {
          return te(e, function(n) {
            n = we(n), Ae(t, n, as(t[n], t));
          }), t;
        });
        function Yd(t) {
          var e = t == null ? 0 : t.length, n = B();
          return t = e ? pt(t, function(i) {
            if (typeof i[1] != "function")
              throw new ee(g);
            return [n(i[0]), i[1]];
          }) : [], Z(function(i) {
            for (var a = -1; ++a < e; ) {
              var c = t[a];
              if (Ht(c[0], this, i))
                return Ht(c[1], this, i);
            }
          });
        }
        function Xd(t) {
          return Cf(re(t, m));
        }
        function ps(t) {
          return function() {
            return t;
          };
        }
        function Qd(t, e) {
          return t == null || t !== t ? e : t;
        }
        var Vd = hu(), jd = hu(!0);
        function Gt(t) {
          return t;
        }
        function gs(t) {
          return qa(typeof t == "function" ? t : re(t, m));
        }
        function t0(t) {
          return za(re(t, m));
        }
        function e0(t, e) {
          return Ha(t, re(e, m));
        }
        var n0 = Z(function(t, e) {
          return function(n) {
            return Dn(n, t, e);
          };
        }), r0 = Z(function(t, e) {
          return function(n) {
            return Dn(t, n, e);
          };
        });
        function ds(t, e, n) {
          var i = At(e), a = wr(e, i);
          n == null && !(gt(e) && (a.length || !i.length)) && (n = e, e = t, t = this, a = wr(e, At(e)));
          var c = !(gt(n) && "chain" in n) || !!n.chain, h = Te(t);
          return te(a, function(p) {
            var v = e[p];
            t[p] = v, h && (t.prototype[p] = function() {
              var b = this.__chain__;
              if (c || b) {
                var A = t(this.__wrapped__), E = A.__actions__ = Ut(this.__actions__);
                return E.push({ func: v, args: arguments, thisArg: t }), A.__chain__ = b, A;
              }
              return v.apply(t, We([this.value()], arguments));
            });
          }), t;
        }
        function i0() {
          return Et._ === this && (Et._ = Tl), this;
        }
        function _s() {
        }
        function s0(t) {
          return t = K(t), Z(function(e) {
            return Ka(e, t);
          });
        }
        var a0 = Ji(pt), u0 = Ji(pa), o0 = Ji(mi);
        function lo(t) {
          return ts(t) ? wi(we(t)) : Bf(t);
        }
        function c0(t) {
          return function(e) {
            return t == null ? r : je(t, e);
          };
        }
        var l0 = gu(), f0 = gu(!0);
        function vs() {
          return [];
        }
        function ms() {
          return !1;
        }
        function h0() {
          return {};
        }
        function p0() {
          return "";
        }
        function g0() {
          return !0;
        }
        function d0(t, e) {
          if (t = K(t), t < 1 || t > ke)
            return [];
          var n = P, i = Tt(t, P);
          e = B(e), t -= P;
          for (var a = xi(i, e); ++n < t; )
            e(n);
          return a;
        }
        function _0(t) {
          return z(t) ? pt(t, we) : Zt(t) ? [t] : Ut(Mu(nt(t)));
        }
        function v0(t) {
          var e = ++Il;
          return nt(t) + e;
        }
        var m0 = Ar(function(t, e) {
          return t + e;
        }, 0), w0 = Zi("ceil"), y0 = Ar(function(t, e) {
          return t / e;
        }, 1), C0 = Zi("floor");
        function x0(t) {
          return t && t.length ? mr(t, Gt, Ri) : r;
        }
        function S0(t, e) {
          return t && t.length ? mr(t, B(e, 2), Ri) : r;
        }
        function b0(t) {
          return _a(t, Gt);
        }
        function A0(t, e) {
          return _a(t, B(e, 2));
        }
        function E0(t) {
          return t && t.length ? mr(t, Gt, Wi) : r;
        }
        function I0(t, e) {
          return t && t.length ? mr(t, B(e, 2), Wi) : r;
        }
        var F0 = Ar(function(t, e) {
          return t * e;
        }, 1), T0 = Zi("round"), M0 = Ar(function(t, e) {
          return t - e;
        }, 0);
        function L0(t) {
          return t && t.length ? Ci(t, Gt) : 0;
        }
        function P0(t, e) {
          return t && t.length ? Ci(t, B(e, 2)) : 0;
        }
        return u.after = tg, u.ary = $u, u.assign = $g, u.assignIn = eo, u.assignInWith = Br, u.assignWith = qg, u.at = Gg, u.before = qu, u.bind = as, u.bindAll = Zd, u.bindKey = Gu, u.castArray = hg, u.chain = Bu, u.chunk = Ch, u.compact = xh, u.concat = Sh, u.cond = Yd, u.conforms = Xd, u.constant = ps, u.countBy = Lp, u.create = zg, u.curry = zu, u.curryRight = Hu, u.debounce = Ku, u.defaults = Hg, u.defaultsDeep = Kg, u.defer = eg, u.delay = ng, u.difference = bh, u.differenceBy = Ah, u.differenceWith = Eh, u.drop = Ih, u.dropRight = Fh, u.dropRightWhile = Th, u.dropWhile = Mh, u.fill = Lh, u.filter = Rp, u.flatMap = Dp, u.flatMapDeep = Wp, u.flatMapDepth = Bp, u.flatten = ku, u.flattenDeep = Ph, u.flattenDepth = Rh, u.flip = rg, u.flow = Vd, u.flowRight = jd, u.fromPairs = kh, u.functions = jg, u.functionsIn = td, u.groupBy = Np, u.initial = Dh, u.intersection = Wh, u.intersectionBy = Bh, u.intersectionWith = Nh, u.invert = nd, u.invertBy = rd, u.invokeMap = $p, u.iteratee = gs, u.keyBy = qp, u.keys = At, u.keysIn = qt, u.map = Pr, u.mapKeys = sd, u.mapValues = ad, u.matches = t0, u.matchesProperty = e0, u.memoize = kr, u.merge = ud, u.mergeWith = no, u.method = n0, u.methodOf = r0, u.mixin = ds, u.negate = Or, u.nthArg = s0, u.omit = od, u.omitBy = cd, u.once = ig, u.orderBy = Gp, u.over = a0, u.overArgs = sg, u.overEvery = u0, u.overSome = o0, u.partial = us, u.partialRight = Ju, u.partition = zp, u.pick = ld, u.pickBy = ro, u.property = lo, u.propertyOf = c0, u.pull = Gh, u.pullAll = Du, u.pullAllBy = zh, u.pullAllWith = Hh, u.pullAt = Kh, u.range = l0, u.rangeRight = f0, u.rearg = ag, u.reject = Jp, u.remove = Jh, u.rest = ug, u.reverse = is, u.sampleSize = Yp, u.set = hd, u.setWith = pd, u.shuffle = Xp, u.slice = Zh, u.sortBy = jp, u.sortedUniq = ep, u.sortedUniqBy = np, u.split = Dd, u.spread = og, u.tail = rp, u.take = ip, u.takeRight = sp, u.takeRightWhile = ap, u.takeWhile = up, u.tap = xp, u.throttle = cg, u.thru = Lr, u.toArray = Vu, u.toPairs = io, u.toPairsIn = so, u.toPath = _0, u.toPlainObject = to, u.transform = gd, u.unary = lg, u.union = op, u.unionBy = cp, u.unionWith = lp, u.uniq = fp, u.uniqBy = hp, u.uniqWith = pp, u.unset = dd, u.unzip = ss, u.unzipWith = Wu, u.update = _d, u.updateWith = vd, u.values = wn, u.valuesIn = md, u.without = gp, u.words = oo, u.wrap = fg, u.xor = dp, u.xorBy = _p, u.xorWith = vp, u.zip = mp, u.zipObject = wp, u.zipObjectDeep = yp, u.zipWith = Cp, u.entries = io, u.entriesIn = so, u.extend = eo, u.extendWith = Br, ds(u, u), u.add = m0, u.attempt = co, u.camelCase = xd, u.capitalize = ao, u.ceil = w0, u.clamp = wd, u.clone = pg, u.cloneDeep = dg, u.cloneDeepWith = _g, u.cloneWith = gg, u.conformsTo = vg, u.deburr = uo, u.defaultTo = Qd, u.divide = y0, u.endsWith = Sd, u.eq = fe, u.escape = bd, u.escapeRegExp = Ad, u.every = Pp, u.find = kp, u.findIndex = Pu, u.findKey = Jg, u.findLast = Op, u.findLastIndex = Ru, u.findLastKey = Zg, u.floor = C0, u.forEach = Nu, u.forEachRight = Uu, u.forIn = Yg, u.forInRight = Xg, u.forOwn = Qg, u.forOwnRight = Vg, u.get = ls, u.gt = mg, u.gte = wg, u.has = ed, u.hasIn = fs, u.head = Ou, u.identity = Gt, u.includes = Up, u.indexOf = Oh, u.inRange = yd, u.invoke = id, u.isArguments = nn, u.isArray = z, u.isArrayBuffer = yg, u.isArrayLike = $t, u.isArrayLikeObject = mt, u.isBoolean = Cg, u.isBuffer = ze, u.isDate = xg, u.isElement = Sg, u.isEmpty = bg, u.isEqual = Ag, u.isEqualWith = Eg, u.isError = os, u.isFinite = Ig, u.isFunction = Te, u.isInteger = Zu, u.isLength = Dr, u.isMap = Yu, u.isMatch = Fg, u.isMatchWith = Tg, u.isNaN = Mg, u.isNative = Lg, u.isNil = Rg, u.isNull = Pg, u.isNumber = Xu, u.isObject = gt, u.isObjectLike = _t, u.isPlainObject = qn, u.isRegExp = cs, u.isSafeInteger = kg, u.isSet = Qu, u.isString = Wr, u.isSymbol = Zt, u.isTypedArray = mn, u.isUndefined = Og, u.isWeakMap = Dg, u.isWeakSet = Wg, u.join = Uh, u.kebabCase = Ed, u.last = se, u.lastIndexOf = $h, u.lowerCase = Id, u.lowerFirst = Fd, u.lt = Bg, u.lte = Ng, u.max = x0, u.maxBy = S0, u.mean = b0, u.meanBy = A0, u.min = E0, u.minBy = I0, u.stubArray = vs, u.stubFalse = ms, u.stubObject = h0, u.stubString = p0, u.stubTrue = g0, u.multiply = F0, u.nth = qh, u.noConflict = i0, u.noop = _s, u.now = Rr, u.pad = Td, u.padEnd = Md, u.padStart = Ld, u.parseInt = Pd, u.random = Cd, u.reduce = Hp, u.reduceRight = Kp, u.repeat = Rd, u.replace = kd, u.result = fd, u.round = T0, u.runInContext = d, u.sample = Zp, u.size = Qp, u.snakeCase = Od, u.some = Vp, u.sortedIndex = Yh, u.sortedIndexBy = Xh, u.sortedIndexOf = Qh, u.sortedLastIndex = Vh, u.sortedLastIndexBy = jh, u.sortedLastIndexOf = tp, u.startCase = Wd, u.startsWith = Bd, u.subtract = M0, u.sum = L0, u.sumBy = P0, u.template = Nd, u.times = d0, u.toFinite = Me, u.toInteger = K, u.toLength = ju, u.toLower = Ud, u.toNumber = ae, u.toSafeInteger = Ug, u.toString = nt, u.toUpper = $d, u.trim = qd, u.trimEnd = Gd, u.trimStart = zd, u.truncate = Hd, u.unescape = Kd, u.uniqueId = v0, u.upperCase = Jd, u.upperFirst = hs, u.each = Nu, u.eachRight = Uu, u.first = Ou, ds(u, function() {
          var t = {};
          return ve(u, function(e, n) {
            rt.call(u.prototype, n) || (t[n] = e);
          }), t;
        }(), { chain: !1 }), u.VERSION = o, te(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t) {
          u[t].placeholder = u;
        }), te(["drop", "take"], function(t, e) {
          Q.prototype[t] = function(n) {
            n = n === r ? 1 : bt(K(n), 0);
            var i = this.__filtered__ && !e ? new Q(this) : this.clone();
            return i.__filtered__ ? i.__takeCount__ = Tt(n, i.__takeCount__) : i.__views__.push({
              size: Tt(n, P),
              type: t + (i.__dir__ < 0 ? "Right" : "")
            }), i;
          }, Q.prototype[t + "Right"] = function(n) {
            return this.reverse()[t](n).reverse();
          };
        }), te(["filter", "map", "takeWhile"], function(t, e) {
          var n = e + 1, i = n == An || n == Qr;
          Q.prototype[t] = function(a) {
            var c = this.clone();
            return c.__iteratees__.push({
              iteratee: B(a, 3),
              type: n
            }), c.__filtered__ = c.__filtered__ || i, c;
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
            return Dn(n, t, e);
          });
        }), Q.prototype.reject = function(t) {
          return this.filter(Or(B(t)));
        }, Q.prototype.slice = function(t, e) {
          t = K(t);
          var n = this;
          return n.__filtered__ && (t > 0 || e < 0) ? new Q(n) : (t < 0 ? n = n.takeRight(-t) : t && (n = n.drop(t)), e !== r && (e = K(e), n = e < 0 ? n.dropRight(-e) : n.take(e - t)), n);
        }, Q.prototype.takeRightWhile = function(t) {
          return this.reverse().takeWhile(t).reverse();
        }, Q.prototype.toArray = function() {
          return this.take(P);
        }, ve(Q.prototype, function(t, e) {
          var n = /^(?:filter|find|map|reject)|While$/.test(e), i = /^(?:head|last)$/.test(e), a = u[i ? "take" + (e == "last" ? "Right" : "") : e], c = i || /^find/.test(e);
          a && (u.prototype[e] = function() {
            var h = this.__wrapped__, p = i ? [1] : arguments, v = h instanceof Q, b = p[0], A = v || z(h), E = function(X) {
              var V = a.apply(u, We([X], p));
              return i && M ? V[0] : V;
            };
            A && n && typeof b == "function" && b.length != 1 && (v = A = !1);
            var M = this.__chain__, D = !!this.__actions__.length, N = c && !M, J = v && !D;
            if (!c && A) {
              h = J ? h : new Q(this);
              var U = t.apply(h, p);
              return U.__actions__.push({ func: Lr, args: [E], thisArg: r }), new ne(U, M);
            }
            return N && J ? t.apply(this, p) : (U = this.thru(E), N ? i ? U.value()[0] : U.value() : U);
          });
        }), te(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var e = rr[t], n = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", i = /^(?:pop|shift)$/.test(t);
          u.prototype[t] = function() {
            var a = arguments;
            if (i && !this.__chain__) {
              var c = this.value();
              return e.apply(z(c) ? c : [], a);
            }
            return this[n](function(h) {
              return e.apply(z(h) ? h : [], a);
            });
          };
        }), ve(Q.prototype, function(t, e) {
          var n = u[e];
          if (n) {
            var i = n.name + "";
            rt.call(pn, i) || (pn[i] = []), pn[i].push({ name: e, func: n });
          }
        }), pn[br(r, H).name] = [{
          name: "wrapper",
          func: r
        }], Q.prototype.clone = Hl, Q.prototype.reverse = Kl, Q.prototype.value = Jl, u.prototype.at = Sp, u.prototype.chain = bp, u.prototype.commit = Ap, u.prototype.next = Ep, u.prototype.plant = Fp, u.prototype.reverse = Tp, u.prototype.toJSON = u.prototype.valueOf = u.prototype.value = Mp, u.prototype.first = u.prototype.head, Tn && (u.prototype[Tn] = Ip), u;
      }, ln = bl();
      Ze ? ((Ze.exports = ln)._ = ln, gi._ = ln) : Et._ = ln;
    }).call(q0);
  }(zn, zn.exports)), zn.exports;
}
var Ro = G0();
const Y = /* @__PURE__ */ Ao(Ro);
function ko(l, s) {
  const r = Y.findLast(s.terrain, (o) => xn(o.percents[0] * s.dist, l.loc, 4));
  return r ? r.value / 100 + 1 : 1;
}
function ks(l) {
  const s = new ye().init(0);
  return l.forEach(({ factors: r, dist: o }) => {
    s.applyEach((f, _) => f + o * _, r);
  }), s.scaleEach(1 / Ro.sumBy(l, "dist")), s;
}
function z0(l, s) {
  let r = 0, o = 0;
  return l.forEach((f, _) => {
    const g = _ === l.length - 1 ? s : l[_ + 1].onset, w = f.type === "linear" ? f.value / 2 : f.value;
    o += (r + w) * (g - f.onset), r += f.value;
  }), o / s;
}
function H0(l) {
  return l < 30 ? 2 : l < 60 ? 5 : l < 90 ? 10 : l < 120 ? 15 : 20;
}
function K0(l, s, r) {
  let o = -z0(s, r);
  return s.forEach((f, _) => {
    if (l >= f.onset) {
      if (f.type === "step")
        o += f.value;
      else if (f.type === "linear") {
        const g = _ === s.length - 1 ? r : s[_ + 1].onset;
        l > g ? o += f.value : o += f.value * (l - f.onset) / (g - f.onset);
      }
    }
  }), o;
}
class Oo {
  constructor(s, r) {
    I(this, "plan");
    I(this, "values");
    this.plan = s, this.values = r ? Y.cloneDeep(r) : [{ onset: 0, value: H0(this.plan.course.dist), type: "linear" }];
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
    const r = this.values.findIndex((o) => o.onset >= s.onset);
    r >= 0 ? this.values.splice(r, 0, s) : this.values.push(s);
  }
}
function Fs(l, s) {
  return s === void 0 ? l : (l - 1) * s + 1;
}
function Os(l, s) {
  l.factors || (l.factors = new ye()), Object.assign(l.factors, {
    grade: Rs(l.grade),
    altitude: Eo(l.alt),
    terrain: ko(l, s)
  });
}
function Hn(l, s) {
  var r, o, f, _, g, w, C, x;
  if (l.factors || (l.factors = new ye()), Os(l, s.course), s) {
    if (l.factors === void 0) throw new Error("no factors");
    l.factors.grade = Rs(l.grade, s.gradeModel), l.factors.strategy = s.strategy.at(l.loc), (o = (r = s.strategies) == null ? void 0 : r.climbing) != null && o.filter(l) ? l.factors.climbStrategy = s.strategies.climbing.factor : l.factors.climbStrategy = ((f = s.strategies.climbing) == null ? void 0 : f.default) ?? 1, (g = (_ = s.strategies) == null ? void 0 : _.descending) != null && g.filter(l) ? l.factors.descentStrategy = s.strategies.descending.factor : l.factors.descentStrategy = ((w = s.strategies.descending) == null ? void 0 : w.default) ?? 1, Object.assign(l.factors, {
      heat: s.heatModel ? Po(l, s.heatModel) : 1,
      dark: s.event.sun ? Mo(l.tod, l.factors.terrain, s.event.sun) : 1
    });
  }
  l.factors.altitude = Fs(l.factors.altitude, (C = s.scales) == null ? void 0 : C.altitude), l.factors.dark = Fs(l.factors.dark, (x = s.scales) == null ? void 0 : x.dark);
}
const m_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Factors: ye,
  Strategy: Oo,
  applyScale: Fs,
  factorKeys: yn,
  generateCourseFactors: Os,
  generatePlanFactors: Hn,
  getAltitudeFactor: Eo,
  getDarkFactor: Mo,
  getGradeFactor: Rs,
  getHeatFactor: Po,
  getTerrainFactor: ko,
  rollup: ks
}, Symbol.toStringTag, { value: "Module" }));
class Ds {
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
class Zr extends Ds {
  constructor(r, o, f) {
    super(r);
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
class zr extends Zr {
  constructor(r, o, f) {
    super(o, o.loc, o.grade);
    I(this, "_course");
    I(this, "factors", new ye());
    I(this, "_interpolated");
    I(this, "loop");
    I(this, "source");
    this._course = r, this.loop = f, this.source = o;
  }
  get grade() {
    return xs(this.source) ? this.source.grade : this.source.grade * (this.source.grade > 0 ? this._course.gainScale : this._course.lossScale);
  }
  get interpolated() {
    return (xs(this.source) ? this.source.interpolated : this._interpolated) || !1;
  }
  set interpolated(r) {
    this._interpolated = r;
  }
  get loc() {
    if (xs(this.source)) return this.source.loc;
    let r = this.source.loc * this._course.distScale;
    return this.loop && (r += this._course.loopDist * this.loop), r;
  }
}
function Hr(l, s) {
  const r = l.filter((f) => f > 0 && Kr(f, s, 4));
  return r.unshift(0), r.map((f, _) => ({ start: f, end: r[_ + 1] || s }));
}
function Do(l) {
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
function J0(l, s, r) {
  l = [...l], s.interpolated && l.splice(l.findIndex((_) => _.loc > s.loc) - 1, 0, s), r.interpolated && l.splice(l.findIndex((_) => _.loc > r.loc) - 1, 0, r);
  const o = l.filter(
    (_, g) => g >= l.findIndex((w) => w === s) && g <= l.findIndex((w) => w === r)
  ), f = o.map((_, g) => ({
    factors: _.factors,
    dist: g === o.length - 1 ? 0 : o[g + 1].loc - o[g].loc
  }));
  return f.pop(), ks(f);
}
class Wo {
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
class Bo extends Wo {
  constructor(r, o) {
    super(o);
    I(this, "_course");
    I(this, "point1");
    I(this, "point2");
    this._course = r, this.point1 = o.point1, this.point2 = o.point2;
  }
}
class No extends Wo {
  constructor(r, o) {
    super(o);
    I(this, "_plan");
    I(this, "point1");
    I(this, "point2");
    I(this, "_factors");
    this._plan = r, this.point1 = o.point1, this.point2 = o.point2;
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
  set delay(r) {
  }
  set pace(r) {
  }
  set elapsed(r) {
  }
  set time(r) {
  }
  set tod(r) {
  }
  get factors() {
    return this._factors || (this._factors = J0(this._plan.points, this.point1, this.point2));
  }
}
const Ss = Je("CourseSplits");
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
    Ss("createSegments");
    const s = this.course.waypoints, r = this.calcSegments(
      Hr(
        s.map((o) => o.loc),
        this.course.dist
      )
    );
    if (!r.length) throw new Error("createSegments result is empty");
    return r.forEach((o, f) => {
      o.waypoint = s[f + 1];
    }), r;
  }
  createSplits(s) {
    Ss(`createSplits:${s}`);
    const r = Do(s), o = Y.range(this.course.dist * r).map((_) => _ / r);
    this.course.dist - o[o.length - 1] > 1e-4 && o.push(this.course.dist);
    const f = this.calcSegments(Hr(o, this.course.dist));
    if (!f.length) throw new Error("createSplits result is empty");
    return f;
  }
  calcSegments(s) {
    var R;
    Ss.extend("calcSegments")("exec");
    const o = this.course, f = o.points, _ = [], g = [];
    let w, C, x = o.points[0], F;
    for (w = 0, C = s.length; w < C; w++) {
      const O = s[w];
      F && Sn((R = s[w - 1]) == null ? void 0 : R.end, O.start, 4) ? x = F : x = o.getPoint(O.start), F = o.getPoint(O.end);
      const L = O.end - O.start, T = new Bo(this.course, {
        gain: 0,
        loss: 0,
        grade: L > 0 ? (F.alt - x.alt) / L / 10 * (F.alt - x.alt > 0 ? o.gainScale : o.lossScale) : 0,
        point1: x,
        point2: F
      }), W = new ye().init(0);
      _.push(T), g.push(W);
    }
    const m = (O, L, T, W) => {
      const H = T.alt - L.alt;
      O[H > 0 ? "gain" : "loss"] += H * (H > 0 ? o.gainScale : o.lossScale), Os(L, o);
      const tt = T.loc - L.loc;
      W.applyEach((it, vt) => it + vt * tt, L.factors);
    };
    w = 1;
    for (let O = 0; O < _.length; O++) {
      const L = _[O], T = g[O];
      for (; xn(f[w].loc, L.point1.loc, 4); ) w++;
      let W = L.point1;
      for (; w < f.length && xn(f[w].loc, L.point2.loc, 4); ) {
        const H = f[w];
        m(L, W, H, T), W = H, w++;
      }
      m(L, W, L.point2, T);
    }
    return _;
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
function $o(l, s, r = {}) {
  const o = { type: "Feature" };
  return (r.id === 0 || r.id) && (o.id = r.id), r.bbox && (o.bbox = r.bbox), o.properties = s || {}, o.geometry = l, o;
}
function Ts(l, s, r = {}) {
  if (!l)
    throw new Error("coordinates is required");
  if (!Array.isArray(l))
    throw new Error("coordinates must be an Array");
  if (l.length < 2)
    throw new Error("coordinates must be at least 2 numbers long");
  if (!mo(l[0]) || !mo(l[1]))
    throw new Error("coordinates must contain numbers");
  return $o({
    type: "Point",
    coordinates: l
  }, s, r);
}
function Y0(l, s, r = {}) {
  if (l.length < 2)
    throw new Error("coordinates must be an array of two or more positions");
  return $o({
    type: "LineString",
    coordinates: l
  }, s, r);
}
function X0(l, s = "kilometers") {
  const r = Uo[s];
  if (!r)
    throw new Error(s + " units is invalid");
  return l * r;
}
function Q0(l, s = "kilometers") {
  const r = Uo[s];
  if (!r)
    throw new Error(s + " units is invalid");
  return l / r;
}
function Ms(l) {
  return l % (2 * Math.PI) * 180 / Math.PI;
}
function pe(l) {
  return l % 360 * Math.PI / 180;
}
function mo(l) {
  return !isNaN(l) && l !== null && !Array.isArray(l);
}
function Kn(l) {
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
function qo(l, s, r = {}) {
  if (r.final === !0)
    return j0(l, s);
  const o = Kn(l), f = Kn(s), _ = pe(o[0]), g = pe(f[0]), w = pe(o[1]), C = pe(f[1]), x = Math.sin(g - _) * Math.cos(C), F = Math.cos(w) * Math.sin(C) - Math.sin(w) * Math.cos(C) * Math.cos(g - _);
  return Ms(Math.atan2(x, F));
}
function j0(l, s) {
  let r = qo(s, l);
  return r = (r + 180) % 360, r;
}
function t_(l, s, r, o = {}) {
  const f = Kn(l), _ = pe(f[0]), g = pe(f[1]), w = pe(r), C = Q0(s, o.units), x = Math.asin(
    Math.sin(g) * Math.cos(C) + Math.cos(g) * Math.sin(C) * Math.cos(w)
  ), F = _ + Math.atan2(
    Math.sin(w) * Math.sin(C) * Math.cos(g),
    Math.cos(C) - Math.sin(g) * Math.sin(x)
  ), m = Ms(F), R = Ms(x);
  return Ts([m, R], o.properties);
}
function Go(l, s, r = {}) {
  var o = Kn(l), f = Kn(s), _ = pe(f[1] - o[1]), g = pe(f[0] - o[0]), w = pe(o[1]), C = pe(f[1]), x = Math.pow(Math.sin(_ / 2), 2) + Math.pow(Math.sin(g / 2), 2) * Math.cos(w) * Math.cos(C);
  return X0(
    2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)),
    r.units
  );
}
function e_(l, s, r = {}) {
  const f = V0(l).coordinates;
  let _ = 0;
  for (let g = 0; g < f.length && !(s >= _ && g === f.length - 1); g++)
    if (_ >= s) {
      const w = s - _;
      if (w) {
        const C = qo(f[g], f[g - 1]) - 180;
        return t_(
          f[g],
          w,
          C,
          r
        );
      } else
        return Ts(f[g]);
    } else
      _ += Go(f[g], f[g + 1], r);
  return Ts(f[f.length - 1]);
}
function zo(l, s, r) {
  if (l.loc > s.loc && r > l.loc || s.loc > l.loc && r > s.loc)
    throw new Error("Input location must be between points");
  const o = Y0([
    [l.lon, l.lat],
    [s.lon, s.lat]
  ]), f = e_(o, r - l.loc), _ = l.grade, g = Cn(l.loc, s.loc, l.alt, s.alt, r);
  return new Zr(
    { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1], alt: g },
    r,
    _
  );
}
class Ls {
  constructor(s, r = 1) {
    I(this, "_data");
    I(this, "loop");
    I(this, "site");
    this._data = {}, this.site = s, this.loop = r;
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
    var s, r;
    return (r = (s = this.site.cutoffs) == null ? void 0 : s.find((o) => o.loop === this.loop)) == null ? void 0 : r.time;
  }
}
const wo = Je("models:Waypoint");
class Gr {
  constructor(s, r) {
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
    this.course = s, this._data = r;
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
    return "waypoints" in this._cache ? this._cache.waypoints : (wo(`generating waypoints array: ${this.name}`), this.isFinish ? this._cache.waypoints = [new Ls(this, this.course.loops)] : this._cache.waypoints = Y.range(this.course.loops).map((s) => new Ls(this, s + 1)), this._cache.waypoints);
  }
  refreshLLA() {
    wo("refreshLLA");
    let s, r, o;
    this.isStart ? { lat: s, lon: r, alt: o } = this.course.track.points[0] : this.isFinish ? { lat: s, lon: r, alt: o } = this.course.track.points[this.course.track.points.length - 1] : { lat: s, lon: r, alt: o } = this.course.track.getLLA(this.percent * this.course.track.dist), this._cache.lat = s, this._cache.lon = r, this._cache.alt = o;
  }
}
const Gn = Je("models:Course"), Ho = [
  { type: "paved", value: 0 },
  { type: "dirt road", value: 4 },
  { type: "doubletrack", value: 8 },
  { type: "singletrack", value: 15 },
  { type: "technical", value: 30 }
];
class n_ {
  constructor(s, r) {
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
    Gn("constructor"), this.track = s, this._data = r, this.version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  /**
   * Course cutoffs
   */
  get cutoffs() {
    return "cutoffs" in this.cache ? this.cache.cutoffs : (this.cache.cutoffs = this.waypoints.filter((s) => s.cutoff).map((s) => new Ko(s)), this.cache.cutoffs);
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
    Gn("generating points array"), this.cache.points = new Array(this.track.points.length * this.loops);
    for (let s = 0; s < this.loops; s++)
      for (let r = 0; r < this.track.points.length; r++)
        this.points[r + s * this.track.points.length] = new zr(
          this,
          this.track.points[r],
          s
        );
    return this.cache.points;
  }
  get sites() {
    var s;
    if ("sites" in this.cache) return this.cache.sites;
    if (this.cache.sites = ((s = this._data.sites) == null ? void 0 : s.map((r) => new Gr(this, r))) || [
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
    ], this.cache.sites.length < 2 || this.cache.sites.filter((r) => r.isStart).length !== 1 || this.cache.sites.filter((r) => r.isFinish).length !== 1)
      throw new Error("Course must have at least a start and finish");
    return this.cache.sites;
  }
  get splits() {
    return "splits" in this.cache ? this.cache.splits : (this.cache.splits = new Z0(this), this.cache.splits);
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    Gn("stats:calculate");
    const s = this.track.points.map((g) => g.alt), r = this.track.points.map((g) => g.grade), o = this.terrain.map((g) => g.value / 100 + 1), f = {
      altitude: {
        avg: Y.sum(
          this.track.points.map((g, w) => {
            var C;
            return g.alt * (g.loc - (((C = this.track.points[w - 1]) == null ? void 0 : C.loc) || 0));
          })
        ) / this.track.dist,
        max: Y.max(s) || 0,
        min: Y.min(s) || 0
      },
      grade: {
        avg: (this.track.points[this.track.points.length - 1].alt - this.track.points[0].alt) / this.track.dist / 10,
        max: Y.max(r) || 0,
        min: Y.min(r) || 0
      },
      terrain: {
        avg: (Y.sumBy(this.terrain, (g) => (g.percents[1] - g.percents[0]) * this.dist * g.value) / this.dist + 100) / 100,
        max: Y.max(o) || 0,
        min: Y.min(o) || 0,
        maxDist: 0,
        minDist: 0
      }
    }, _ = (g) => this.terrain.reduce(
      (w, C) => C.value / 100 + 1 === g ? w + (C.percents[1] - C.percents[0]) * this.dist : w,
      0
    );
    return Object.assign(f.terrain, {
      maxDist: _(f.terrain.max),
      minDist: _(f.terrain.min)
    }), this.cache.stats = f, f;
  }
  get terrain() {
    if ("terrain" in this.cache) return this.cache.terrain;
    if (this._data.terrain) {
      const s = [...this._data.terrain];
      s.sort((r, o) => r.percent - o.percent), this.cache.terrain = s.map((r, o) => {
        var w, C;
        const f = Y.isNumber(r.value) ? r.value : Y.isString(r.value) ? ((w = Ho.find((x) => x.type === r.value)) == null ? void 0 : w.value) || 0 : r.value.value, _ = typeof r == "string" ? r : Y.isObject(r.value) ? r.value.type : void 0;
        return {
          value: f,
          type: _,
          percents: [r.percent, ((C = s[o + 1]) == null ? void 0 : C.percent) || 1]
        };
      });
    } else
      this.cache.terrain = [];
    return this.cache.terrain;
  }
  get waypoints() {
    var r;
    if ("waypoints" in this.cache) return this.cache.waypoints;
    if (!((r = this.track) != null && r.dist)) return [];
    let s = [];
    return this.sites.forEach((o) => {
      s.push(...o.waypoints);
    }), s = s.sort((o, f) => o.loc - f.loc), this.cache.waypoints = s, this.cache.waypoints;
  }
  update(s) {
    Gn("update"), Object.assign(this._data, s), this.version++;
  }
  /**
   * Finds or creates a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns The CoursePoint at input location.
   */
  getPoint(s) {
    const r = this.points.findIndex((C) => Jr(C.loc, s, 4)), o = this.points[r];
    if (Sn(o.loc, s, 4)) return o;
    Gn(`getPoint: creating new CoursePoint at ${s}`);
    const f = r - 1, _ = this.points[f], g = zo(
      _.source,
      o.source,
      s % this.loopDist / this.distScale
    ), w = new zr(this, g, Math.floor(s / this.loopDist));
    return w.interpolated = !0, w;
  }
  locationsToBreaks(s) {
    const r = s.filter((f) => f > 0 && Kr(f, this.dist, 4));
    return r.unshift(0), r.map((f, _) => ({ start: f, end: r[_ + 1] || this.dist }));
  }
}
class Ko {
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
var bs = { exports: {} }, yo;
function r_() {
  return yo || (yo = 1, function(l, s) {
    (function() {
      var r = Math.PI, o = Math.sin, f = Math.cos, _ = Math.tan, g = Math.asin, w = Math.atan2, C = Math.acos, x = r / 180, F = 1e3 * 60 * 60 * 24, m = 2440588, R = 2451545;
      function O(P) {
        return P.valueOf() / F - 0.5 + m;
      }
      function L(P) {
        return new Date((P + 0.5 - m) * F);
      }
      function T(P) {
        return O(P) - R;
      }
      var W = x * 23.4397;
      function H(P, $) {
        return w(o(P) * f(W) - _($) * o(W), f(P));
      }
      function tt(P, $) {
        return g(o($) * f(W) + f($) * o(W) * o(P));
      }
      function it(P, $, q) {
        return w(o(P), f(P) * o($) - _(q) * f($));
      }
      function vt(P, $, q) {
        return g(o($) * o(q) + f($) * f(q) * f(P));
      }
      function xt(P, $) {
        return x * (280.16 + 360.9856235 * P) - $;
      }
      function Re(P) {
        return P < 0 && (P = 0), 2967e-7 / Math.tan(P + 312536e-8 / (P + 0.08901179));
      }
      function Ft(P) {
        return x * (357.5291 + 0.98560028 * P);
      }
      function ge(P) {
        var $ = x * (1.9148 * o(P) + 0.02 * o(2 * P) + 3e-4 * o(3 * P)), q = x * 102.9372;
        return P + $ + q + r;
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
      var bn = Lt.times = [
        [-0.833, "sunrise", "sunset"],
        [-0.3, "sunriseEnd", "sunsetStart"],
        [-6, "dawn", "dusk"],
        [-12, "nauticalDawn", "nauticalDusk"],
        [-18, "nightEnd", "night"],
        [6, "goldenHourEnd", "goldenHour"]
      ];
      Lt.addTime = function(P, $, q) {
        bn.push([P, $, q]);
      };
      var Jn = 9e-4;
      function Xr(P, $) {
        return Math.round(P - Jn - $ / (2 * r));
      }
      function An(P, $, q) {
        return Jn + (P + $) / (2 * r) + q;
      }
      function Zn(P, $, q) {
        return R + P + 53e-4 * o($) - 69e-4 * o(2 * q);
      }
      function Qr(P, $, q) {
        return C((o(P) - o($) * o(q)) / (f($) * f(q)));
      }
      function rn(P) {
        return -2.076 * Math.sqrt(P) / 60;
      }
      function ke(P, $, q, lt, j, ft, at) {
        var ot = Qr(P, q, lt), yt = An(ot, $, j);
        return Zn(yt, ft, at);
      }
      Lt.getTimes = function(P, $, q, lt) {
        lt = lt || 0;
        var j = x * -q, ft = x * $, at = rn(lt), ot = T(P), yt = Xr(ot, j), zt = An(0, j, yt), Pt = Ft(zt), Bt = ge(Pt), de = tt(Bt, 0), dt = Zn(zt, Pt, Bt), Rt, Oe, Ct, Nt, oe, Vt, ht = {
          solarNoon: L(dt),
          nadir: L(dt - 0.5)
        };
        for (Rt = 0, Oe = bn.length; Rt < Oe; Rt += 1)
          Ct = bn[Rt], Nt = (Ct[0] + at) * x, oe = ke(Nt, j, ft, de, yt, Pt, Bt), Vt = dt - (oe - dt), ht[Ct[1]] = L(Vt), ht[Ct[2]] = L(oe);
        return ht;
      };
      function Yn(P) {
        var $ = x * (218.316 + 13.176396 * P), q = x * (134.963 + 13.064993 * P), lt = x * (93.272 + 13.22935 * P), j = $ + x * 6.289 * o(q), ft = x * 5.128 * o(lt), at = 385001 - 20905 * f(q);
        return {
          ra: H(j, ft),
          dec: tt(j, ft),
          dist: at
        };
      }
      Lt.getMoonPosition = function(P, $, q) {
        var lt = x * -q, j = x * $, ft = T(P), at = Yn(ft), ot = xt(ft, lt) - at.ra, yt = vt(ot, j, at.dec), zt = w(o(ot), _(j) * f(at.dec) - o(at.dec) * f(ot));
        return yt = yt + Re(yt), {
          azimuth: it(ot, j, at.dec),
          altitude: yt,
          distance: at.dist,
          parallacticAngle: zt
        };
      }, Lt.getMoonIllumination = function(P) {
        var $ = T(P || /* @__PURE__ */ new Date()), q = Ce($), lt = Yn($), j = 149598e3, ft = C(o(q.dec) * o(lt.dec) + f(q.dec) * f(lt.dec) * f(q.ra - lt.ra)), at = w(j * o(ft), lt.dist - j * f(ft)), ot = w(f(q.dec) * o(q.ra - lt.ra), o(q.dec) * f(lt.dec) - f(q.dec) * o(lt.dec) * f(q.ra - lt.ra));
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
        for (var ft = 0.133 * x, at = Lt.getMoonPosition(j, $, q).altitude - ft, ot, yt, zt, Pt, Bt, de, dt, Rt, Oe, Ct, Nt, oe, Vt, ht = 1; ht <= 24 && (ot = Lt.getMoonPosition(xe(j, ht), $, q).altitude - ft, yt = Lt.getMoonPosition(xe(j, ht + 1), $, q).altitude - ft, Bt = (at + yt) / 2 - ot, de = (yt - at) / 2, dt = -de / (2 * Bt), Rt = (Bt * dt + de) * dt + ot, Oe = de * de - 4 * Bt * ot, Ct = 0, Oe >= 0 && (Vt = Math.sqrt(Oe) / (Math.abs(Bt) * 2), Nt = dt - Vt, oe = dt + Vt, Math.abs(Nt) <= 1 && Ct++, Math.abs(oe) <= 1 && Ct++, Nt < -1 && (Nt = oe)), Ct === 1 ? at < 0 ? zt = ht + Nt : Pt = ht + Nt : Ct === 2 && (zt = ht + (Rt < 0 ? oe : Nt), Pt = ht + (Rt < 0 ? Nt : oe)), !(zt && Pt)); ht += 2)
          at = yt;
        var _e = {};
        return zt && (_e.rise = xe(j, zt)), Pt && (_e.set = xe(j, Pt)), !zt && !Pt && (_e[Rt > 0 ? "alwaysUp" : "alwaysDown"] = !0), _e;
      }, l.exports = Lt;
    })();
  }(bs)), bs.exports;
}
var Co = r_();
function Ke(l, s) {
  const r = l.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: s
  }).split(":").map((o) => Number(o));
  return r[0] * 60 * 60 + r[1] * 60 + r[2];
}
class i_ {
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
class Jo {
  constructor(s, r, o, f) {
    I(this, "start");
    I(this, "lat");
    I(this, "lon");
    I(this, "timezone");
    I(this, "sun");
    I(this, "startTime");
    this.start = s, this.lat = o, this.lon = f, this.timezone = r;
    const _ = Co.getTimes(this.start, this.lat, this.lon), g = Co.getPosition(_.nadir, this.lat, this.lon);
    this.sun = new i_({
      nadir: Ke(_.nadir, this.timezone),
      dawn: Ke(_.dawn, this.timezone),
      sunrise: Ke(_.sunrise, this.timezone),
      dusk: Ke(_.dusk, this.timezone),
      sunset: Ke(_.sunset, this.timezone),
      noon: Ke(_.solarNoon, this.timezone),
      nadirAltitude: g.altitude * 180 / Math.PI
    }), this.startTime = Ke(this.start, this.timezone);
  }
  dateAtElapsed(s) {
    const r = new Date(this.start);
    return r.setTime(r.getTime() + s * 1e3), r;
  }
  elapsedToTimeOfDay(s) {
    return (this.startTime + s) % 86400;
  }
}
var As = {}, xo;
function s_() {
  return xo || (xo = 1, function(l) {
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
      function r(w) {
        return f(g(w), arguments);
      }
      function o(w, C) {
        return r.apply(null, [w].concat(C || []));
      }
      function f(w, C) {
        var x = 1, F = w.length, m, R = "", O, L, T, W, H, tt, it, vt;
        for (O = 0; O < F; O++)
          if (typeof w[O] == "string")
            R += w[O];
          else if (typeof w[O] == "object") {
            if (T = w[O], T.keys)
              for (m = C[x], L = 0; L < T.keys.length; L++) {
                if (m == null)
                  throw new Error(r('[sprintf] Cannot access property "%s" of undefined value "%s"', T.keys[L], T.keys[L - 1]));
                m = m[T.keys[L]];
              }
            else T.param_no ? m = C[T.param_no] : m = C[x++];
            if (s.not_type.test(T.type) && s.not_primitive.test(T.type) && m instanceof Function && (m = m()), s.numeric_arg.test(T.type) && typeof m != "number" && isNaN(m))
              throw new TypeError(r("[sprintf] expecting number but found %T", m));
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
      var _ = /* @__PURE__ */ Object.create(null);
      function g(w) {
        if (_[w])
          return _[w];
        for (var C = w, x, F = [], m = 0; C; ) {
          if ((x = s.text.exec(C)) !== null)
            F.push(x[0]);
          else if ((x = s.modulo.exec(C)) !== null)
            F.push("%");
          else if ((x = s.placeholder.exec(C)) !== null) {
            if (x[2]) {
              m |= 1;
              var R = [], O = x[2], L = [];
              if ((L = s.key.exec(O)) !== null)
                for (R.push(L[1]); (O = O.substring(L[0].length)) !== ""; )
                  if ((L = s.key_access.exec(O)) !== null)
                    R.push(L[1]);
                  else if ((L = s.index_access.exec(O)) !== null)
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
        return _[w] = F;
      }
      l.sprintf = r, l.vsprintf = o, typeof window < "u" && (window.sprintf = r, window.vsprintf = o);
    })();
  }(As)), As;
}
var Zo = s_();
const a_ = Je("PaceChunk");
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
class So {
  constructor(s, r, o, f) {
    I(this, "constraints");
    I(this, "points");
    I(this, "plan");
    I(this, "delay");
    I(this, "factor");
    I(this, "factors", new ye());
    I(this, "status");
    this.constraints = o, this.points = r, this.plan = s, this.delay = f, this.factor = 1;
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
    let r = s[0].elapsed, o = s[0].delay || 0, f = 0, _ = 0, g = 0;
    const w = this.factor ? this.np : this.plan.pacing.pace, C = new ye().init(0);
    for (let x = 1, F = s.length; x < F; x++) {
      f = s[x].loc - s[x - 1].loc, Hn(s[x - 1], this.plan), C.applyEach((R, O) => R + O * f, s[x - 1].factors);
      const m = s[x - 1].factors.combined;
      g += m * f, _ = w * m * f, s[x].time = s[x - 1].time + _, o = s[x - 1].delay || 0, r += _ + o, s[x].elapsed = r, this.plan.event.start && (s[x].tod = this.plan.event.elapsedToTimeOfDay(r));
    }
    Hn(s[s.length - 1], this.plan), this.factors = C.scaleEach(1 / this.dist), this.factor = g / this.dist;
  }
  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const o = a_.extend(
      Zo.vsprintf("calculate:%.2f-%.2f", [this.points[0].loc, this.points[this.points.length - 1].loc])
    );
    let f = this.factor || 0, _, g;
    const w = new u_();
    for (g = 1; g <= 30; g++)
      if (this.applyPacing(), w.iterations = g >= 2, w.factor = !Y.round(f - this.factor, g === 30 ? 6 : 8), f = this.factor, w.target = Math.abs(
        (Y.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - this.points[this.points.length - 1].elapsed
      ) < 0.1, w.points = _ && this.points.every((x, F) => Sn(x.elapsed, _[F], 0)) || !1, _ = this.points.map((x) => x.elapsed), w.passing) {
        o(`iteration ${g} complete, passed`);
        break;
      } else
        o(
          `iteration ${g} complete, failed ${Object.keys(w).filter((x) => !w[x]).join("|")}`
        );
    o("chunk complete");
    const C = w.passing ? void 0 : `failed tests ${Object.keys(w).filter((x) => !w[x]).map((x) => `"${x}"`).join(",")} after ${g} iterations`;
    this.status = {
      errorMessage: C,
      tests: w,
      success: w.passing,
      iterations: g
    };
  }
}
const ue = Je("Pacing");
class Yo {
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
    var r, o;
    const s = {
      complete: ((r = this.chunks) == null ? void 0 : r.length) > 0,
      errorMessage: void 0,
      success: ((o = this.chunks) == null ? void 0 : o.filter((f) => {
        var _;
        return !((_ = f.status) != null && _.success);
      }).length) === 0,
      chunks: this.chunks.length,
      iterations: this.chunks.map((f) => {
        var _;
        return ((_ = f.status) == null ? void 0 : _.iterations) || 0;
      })
    };
    return s.success || (s.errorMessage = this.chunks.filter((f) => {
      var _;
      return f.status && !((_ = f.status) != null && _.success);
    }).map((f, _) => `Chunk ${_ + 1}: ${f.status.errorMessage}`).join(" | ")), s;
  }
  calculate() {
    var o, f, _;
    const s = ue.extend("calculate");
    for (s("exec"), s("clearing cache"), this.clearCache(); this.plan.points.find((g) => g.interpolated); ) {
      const g = this.plan.points.findIndex((w) => w.interpolated);
      this.plan.points.splice(g, 1);
    }
    for (s("adding points at each terrain factor break"), (o = this.plan.course.terrain) == null || o.forEach(
      (g) => this.plan.getPoint(g.percents[0] * this.plan.course.dist, !0)
    ), s("adding points at each cutoff"), this.plan.cutoffMargin && ((f = this.plan.cutoffs) == null || f.forEach((g) => {
      this.plan.getPoint(g.loc, !0);
    })), this.plan.points.filter((g) => g.delay).forEach((g) => {
      g.delay = 0;
    }), (_ = this.plan.delays) == null || _.forEach((g) => {
      const w = this.plan.getPoint(g.loc, !0);
      w.delay = g.delay;
    }), s("creating pace chunks"), this.initChunks(), [null, ...Y.reverse([...this.plan.cutoffs || []]), null].forEach((g) => {
      for (; this.chunks.find((C) => !C.status); )
        this.calcChunks(), this.validateChunks();
      if (!g) return !0;
      const w = this.plan.getPoint(g.loc);
      if (w.elapsed - g.time > 0.5) {
        s(`cutoff at ${g.loc} missed`);
        const C = this.chunks[0];
        Y.last(C.points) === w ? (s(`setting cutoff at ${g.loc}`), C.constraints = [0, g.time], delete C.status) : this.splitChunk(C, w, g.time);
      }
    }), Y.isFunction(this.chunks[this.chunks.length - 1].constraints[1]) && this.chunks.length > 2 && (s("rerunning last chunk"), this.chunks[this.chunks.length - 1].calculate()), ue(`pacing status=${this.status.success ? "PASS" : "FAIL"}.`); this.plan.points.find((g) => g.interpolated); ) {
      const g = this.plan.points.findIndex((w) => w.interpolated);
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
    this.chunks = [new So(this.plan, this.plan.points, [0, s], this.plan.delay)], this.plan.points.forEach((r) => {
      r._chunk = this.chunks[0];
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
  splitChunk(s, r, o) {
    ue.extend("split")(`breaking chunks at ${r.loc} km`);
    const _ = s.points.findIndex((C) => C === r), g = Y.round(r.elapsed - r.time), w = new So(this.plan, s.points.slice(0, _ + 1), [0, o], g);
    w.points.filter((C, x) => x < w.points.length - 1).forEach((C) => {
      C._chunk = w;
    }), this.chunks.unshift(w), s.constraints[0] = o, s.delay -= g, s.points = s.points.slice(_), delete s.status;
  }
  /**
   * merge two sequential chunks together, mutates chunks array
   * @param a - first chunk
   * @param b - second chunk
   */
  mergeChunks(s, r) {
    const o = this.chunks.findIndex((_) => _ === s), f = this.chunks.findIndex((_) => _ === r);
    if (f - o !== 1) throw new Error("chunks must be sequential");
    ue(Zo.sprintf("calcChunks: merging %i&%i (%.2f&%.2f)", o, f, s.np, r.np)), s.points.pop(), s.points.push(...r.points), s.delay += r.delay, delete s.status, s.points.forEach((_) => {
      _._chunk = s;
    }), s.constraints = [s.constraints[0], r.constraints[1]], this.chunks.splice(f, 1), s.calculate();
  }
}
class Ps extends zr {
  constructor(r, o) {
    super(r.course, o, o.loop);
    I(this, "_plan");
    I(this, "_chunk");
    I(this, "delay", 0);
    I(this, "elapsed", 0);
    I(this, "factors", new ye());
    I(this, "source");
    I(this, "time", 0);
    I(this, "tod", 0);
    this._plan = r, this.source = o;
  }
  get factor() {
    var r;
    return (r = this.factors) == null ? void 0 : r.combined;
  }
  get np() {
    var r;
    if (!this._chunk) throw new Error("PlanPoint._chunk not defined");
    return (r = this._chunk) == null ? void 0 : r.np;
  }
  get pace() {
    return this.np * this.factor;
  }
}
const Es = Je("PlanSplits");
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
    Es("createSegments");
    const s = this.plan.course.waypoints, r = this.calcSegments(
      Hr(
        s.map((o) => o.loc),
        this.plan.course.dist
      )
    );
    if (!r.length) throw new Error("createSegments result is empty");
    return r.forEach((o, f) => {
      o.waypoint = s[f + 1];
    }), r;
  }
  createSplits(s) {
    Es(`createSplits:${s}`);
    const r = Do(s), o = Y.range(this.plan.course.dist * r).map(
      (_) => _ / r
    );
    this.plan.course.dist - o[o.length - 1] > 1e-4 && o.push(this.plan.course.dist);
    const f = this.calcSegments(Hr(o, this.plan.course.dist));
    if (!f.length) throw new Error("createSplits result is empty");
    return f;
  }
  calcSegments(s) {
    var O;
    Es.extend("calcSegments")("exec"), this.plan.checkPacing();
    const o = this.plan, f = o.course, _ = o.points, g = [], w = [];
    let C, x, F = o.points[0], m;
    for (C = 0, x = s.length; C < x; C++) {
      const L = s[C];
      m && Sn((O = s[C - 1]) == null ? void 0 : O.end, L.start, 4) ? F = m : F = o.getPoint(L.start), m = o.getPoint(L.end);
      const T = L.end - L.start, W = new No(this.plan, {
        gain: 0,
        loss: 0,
        grade: T > 0 ? (m.alt - F.alt) / T / 10 * (m.alt - F.alt > 0 ? f.gainScale : f.lossScale) : 0,
        point1: F,
        point2: m
      }), H = new ye().init(0);
      g.push(W), w.push(H);
    }
    const R = (L, T, W, H) => {
      const tt = W.alt - T.alt;
      L[tt > 0 ? "gain" : "loss"] += tt * (tt > 0 ? f.gainScale : f.lossScale), Hn(T, o);
      const it = W.loc - T.loc;
      H.applyEach((vt, xt) => vt + xt * it, T.factors);
    };
    C = 1;
    for (let L = 0; L < g.length; L++) {
      const T = g[L], W = w[L];
      for (; xn(_[C].loc, T.point1.loc, 4); ) C++;
      let H = T.point1;
      for (; C < _.length && xn(_[C].loc, T.point2.loc, 4); ) {
        const tt = _[C];
        R(T, H, tt, W), H = tt, C++;
      }
      R(T, H, T.point2, W), o && (T.delay = o.delays.filter((tt) => Jr(T.point1.loc, tt.loc, 4) && Kr(T.point2.loc, tt.loc, 4)).reduce((tt, it) => tt + it.delay, 0));
    }
    return g;
  }
}
const He = Je("models:Plan");
function bo(l) {
  if (!(!l || Object.keys(l).every((s) => {
    const r = l[s];
    return r === void 0 || r >= 0 && r <= 2;
  })))
    throw new Error("Plan scales must be between 0 and 2");
}
class c_ {
  constructor(s, r) {
    I(this, "_cache", {});
    I(this, "_data");
    I(this, "course");
    I(this, "pacing", new Yo(this));
    I(this, "points");
    I(this, "splits", new o_(this));
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    I(this, "_version", 0);
    if (bo(r.scales), this.course = s, this._data = r, r.delays) {
      const o = s.sites.map((_) => _.id), f = r.delays.find((_) => !o.includes(_.siteId));
      if (f)
        throw console.error(`Site in plan delays is not in course sites (${String(f.siteId)})`), new Error("Site in plan delays is not in course sites.");
    }
    this.points = this.course.points.map((o) => new Ps(this, o)), this._version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  get strategies() {
    return "strategies" in this._cache ? this._cache.strategies : (this._cache.strategies = {}, [
      { key: "climbing", filter: (r) => r.grade >= 4 },
      { key: "descending", filter: (r) => r.grade <= -4 }
    ].forEach((r) => {
      var f;
      const o = ((f = this._data.strategies) == null ? void 0 : f[r.key]) ?? 1;
      if (o !== 1) {
        let _ = 0, g = 0;
        for (let w = 1, C = this.points.length; w < C; w++) {
          const x = this.points[w].loc - this.points[w - 1].loc;
          r.filter(this.points[w - 1]) && (g += x, _ += x * (1 - o));
        }
        this._cache.strategies || (this._cache.strategies = {}), this._cache.strategies[r.key] = {
          default: _ / (this.course.dist - g) + 1,
          factor: o,
          filter: r.filter
        };
      }
    }), this._cache.strategies);
  }
  get cutoffMargin() {
    return this._data.cutoffMargin;
  }
  get cutoffs() {
    var r;
    if ("cutoffs" in this.cache) return this.cache.cutoffs;
    this.cache.cutoffs = this.cutoffMargin ? ((r = this.course.cutoffs) == null ? void 0 : r.map((o) => new f_(this, o, this.getPoint(o.loc, !0)))) || [] : [];
    let s = 0;
    for (; this.cache.cutoffs.length - 1 >= s; ) {
      const o = this.cache.cutoffs[s];
      this.cache.cutoffs.find((f, _) => _ > s && f.time <= o.time) ? (He(`get cutoffs: deleting extraneous cutoff at ${o.loc} km`), this.cache.cutoffs.splice(s, 1)) : s++;
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
        (w) => w.loop === o.loop && w.siteId === o.site.id
      ), _ = f ? f.delay : o.hasDelay ? this.typicalDelay : 0;
      return new l_(o, _);
    }).filter((o) => o.delay > 0).sort((o, f) => o.loc - f.loc);
    let r = 0;
    for (; s.length - 1 >= r; )
      r > 0 && s[r].loc === s[r - 1].loc ? (He(`get delays: merging delay at ${s[r].loc} km`), s[r - 1].delay += s[r].delay, s.splice(r, 1)) : r++;
    return this.cache.delays = s, this.cache.delays;
  }
  get event() {
    if ("event" in this.cache) return this.cache.event;
    if (this._data.start)
      return this.cache.event = new Jo(
        this._data.start.date,
        this._data.start.timezone,
        this.points[0].lat,
        this.points[0].lon
      );
    throw new Error("Start date/timezone is required for either the plan or the course");
  }
  get events() {
    if ("events" in this.cache) return this.cache.events;
    He("calculating events.sun");
    const s = [], r = this.event.elapsedToTimeOfDay(0), o = Math.ceil((r + this.points[this.points.length - 1].elapsed) / 86400);
    for (let g = 0; g < o; g++)
      [
        { event: "dawn", time: this.event.sun.dawn },
        { event: "sunrise", time: this.event.sun.sunrise },
        { event: "nadir", time: this.event.sun.nadir },
        { event: "sunset", time: this.event.sun.sunset },
        { event: "dusk", time: this.event.sun.dusk }
      ].forEach((C) => {
        const x = C.time - r + 86400 * g;
        x >= 0 && x <= this.points[this.points.length - 1].elapsed && s.push({ event: C.event, elapsed: x });
      });
    s.sort((g, w) => g.elapsed - w.elapsed);
    const f = Io(
      this.points.map((g) => g.elapsed),
      this.points.map((g) => g.loc),
      s.map((g) => g.elapsed)
    ), _ = s.map((g, w) => ({ ...g, loc: f[w] }));
    return this.cache.events = { sun: _ }, this.cache.events;
  }
  get gradeModel() {
    var o;
    if ("gradeModel" in this.cache) return this.cache.gradeModel;
    const s = ((o = this.scales) == null ? void 0 : o.descending) ?? 1, r = -0.034 / (2 * Pe.a);
    return s !== 1 && (this.cache.gradeModel = (f) => {
      const _ = (s - 1) / 2 + 1;
      return Lo(f < r ? r + (f - r) / _ : f) * (f < 0 ? 1 / _ : 1);
    }), this.cache.gradeModel;
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
    return this._data.scales;
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    He("calculating stats.factors");
    const s = Y.fromPairs(
      yn.map((_) => {
        const g = this.points.map((w) => w.factors[_]);
        return [
          _,
          {
            min: Number(Y.min(g)),
            max: Number(Y.max(g))
          }
        ];
      })
    );
    He("calculating stats.sun");
    const r = {
      day: { time: 0, dist: 0 },
      twilight: { time: 0, dist: 0 },
      dark: { time: 0, dist: 0 }
    };
    let o = 0, f = 0;
    return this.points.forEach((_, g) => {
      var w, C;
      o = _.loc - (((w = this.points[g - 1]) == null ? void 0 : w.loc) || 0), f = _.elapsed - (((C = this.points[g - 1]) == null ? void 0 : C.elapsed) || 0), !isNaN(this.event.sun.dawn) && !isNaN(this.event.sun.dusk) && (_.tod <= this.event.sun.dawn || _.tod >= this.event.sun.dusk) ? (r.dark.time += f, r.dark.dist += o) : _.tod < this.event.sun.sunrise || _.tod > this.event.sun.sunset ? (r.twilight.time += f, r.twilight.dist += o) : (r.day.time += f, r.day.dist += o);
    }), this.cache.stats = { factors: s, sun: r }, this.cache.stats;
  }
  get strategy() {
    return "strategy" in this.cache ? this.cache.strategy : this.cache.strategy = new Oo(this, this._data.strategy);
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
    var s, r;
    if (He("checkPacing"), (!((s = this.pacing.status) != null && s.complete) || !this.pacing.isCurrent) && (He("checkPacing: calculate"), this.pacing.calculate()), !((r = this.points) != null && r.length)) throw new Error("No plan points");
    return !0;
  }
  getDelayAtWaypoint(s) {
    var r;
    return ((r = this.delays.find((o) => o.waypoint === s)) == null ? void 0 : r.delay) || 0;
  }
  getPoint(s, r = !1) {
    const o = this.points.findIndex((C) => Jr(C.loc, s, 4)), f = this.points[o];
    if (Sn(f.loc, s, 4)) return f;
    He(`getPoint: ${r ? "inserting" : "creating"} new PlanPoint at ${s}`);
    const _ = o - 1, g = this.points[_], w = new Ps(this, this.course.getPoint(s));
    return w.delay = Math.round(f.elapsed - g.elapsed - (f.time - g.time)), w.time = Cn(g.loc, f.loc, g.time, f.time, w.loc), w.elapsed = g.elapsed + g.delay + (w.time - g.time), w.tod = this.event.elapsedToTimeOfDay(w.elapsed), Hn(w, this), r && this.points.splice(o, 0, w), w;
  }
  update(s) {
    bo(s.scales);
    const o = ["target", "method"].find((f) => f in s && Y.isNil(s[f]));
    if (o) throw new Error(`Plan.${o} cannot be set to null or undefined`);
    Object.assign(this._data, s), this._version++;
  }
}
class l_ {
  constructor(s, r) {
    I(this, "delay");
    I(this, "waypoint");
    this.waypoint = s, this.delay = r;
  }
  get loc() {
    return this.waypoint.loc;
  }
}
class f_ {
  constructor(s, r, o) {
    I(this, "plan");
    I(this, "courseCutoff");
    I(this, "point");
    this.plan = s, this.courseCutoff = r, this.point = o;
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
const Xo = (l, s, r, o) => {
  const f = To(l, s, r, o), _ = [];
  return r.forEach((g, w) => {
    let C = f[w][0] / 10;
    C > 50 ? C = 50 : C < -50 && (C = -50);
    const x = g * f[w][0] + f[w][1];
    _.push({
      grade: C,
      alt: x
    });
  }), _;
};
function h_(l, s) {
  return Xo(
    s,
    l.map((o) => o.alt),
    s,
    0.05
  ).map((o) => o.grade);
}
const p_ = (l) => {
  let s = 0, r = 0;
  const o = [0];
  for (let f = 1, _ = l.length; f < _; f++)
    s = Go([l[f - 1].lon, l[f - 1].lat], [l[f].lon, l[f].lat]), r += s, o.push(r);
  return o;
}, qr = Je("models:Track");
class Yr {
  constructor(s) {
    I(this, "dist");
    I(this, "gain");
    I(this, "loss");
    I(this, "points");
    qr("Creating new Track object");
    const r = s.map((x) => new Ds(x)), o = p_(r), f = h_(r, o);
    this.points = r.map((x, F) => new Zr(x, o[F], f[F])), qr(`set-points - ${r.length} points`), qr("Calculating"), this.dist = this.points[this.points.length - 1].loc;
    let _ = 0, g = 0, w = 0, C = this.points[0].alt;
    this.points.forEach((x) => {
      w = x.alt - C, w < 0 ? g += w : _ += w, C = x.alt;
    }), this.gain = _, this.loss = g;
  }
  get start() {
    return Y.pick(this.points[0], ["alt", "lat", "lon"]);
  }
  get finish() {
    return Y.pick(this.points[this.points.length - 1], ["alt", "lat", "lon"]);
  }
  getLLA(s) {
    s > this.dist && (s = s % this.dist);
    let r;
    if (s === 0) r = this.points[0];
    else {
      const o = this.points.findIndex((f) => f.loc >= s);
      r = zo(this.points[o - 1], this.points[o], s);
    }
    return Y.pick(r, ["lat", "lon", "alt"]);
  }
  reduceDensity(s = 0.025, r = this.points.length / 2) {
    const o = qr.extend("reduceDensity");
    if (this.dist / s > r / 2)
      return o("Does not meet criteria"), this;
    const f = this.dist, _ = Math.floor(f / s) + 1, g = Array(_).fill(0).map((F, m) => Wt(m++ * s, 3));
    g[g.length - 1] < f && g.push(f);
    const w = Xo(
      this.points.map((F) => F.loc),
      this.points.map((F) => F.alt),
      g,
      2 * s
    ), C = g.map((F) => this.getLLA(F)).map((F, m) => ({
      lat: Wt(F.lat, 6),
      lon: Wt(F.lon, 6),
      alt: Wt(w[m].alt, 2)
    })), x = new Yr(C);
    return o(`Reduced from ${this.points.length} to ${x.points.length} points.`), x;
  }
}
function g_(l, s, r) {
  const o = l.map((f, _) => ({ lat: l[_], lon: s[_], alt: r[_] }));
  return new Yr(o);
}
const w_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Course: n_,
  CourseCutoff: Ko,
  CoursePoint: zr,
  CourseSegment: Bo,
  Event: Jo,
  Pacing: Yo,
  Plan: c_,
  PlanPoint: Ps,
  PlanSegment: No,
  Point: Ds,
  Site: Gr,
  Track: Yr,
  TrackPoint: Zr,
  Waypoint: Ls,
  createTrackFromArrays: g_,
  terrainTypes: Ho
}, Symbol.toStringTag, { value: "Module" })), y_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dateToTODSeconds: Ke
}, Symbol.toStringTag, { value: "Module" }));
export {
  ye as Factors,
  w_ as Models,
  Oo as Strategy,
  z0 as adjustStrategy,
  __ as enableDebug,
  m_ as factors,
  zo as interpolatePoint,
  v_ as math,
  $0 as scaleDark,
  y_ as util
};
