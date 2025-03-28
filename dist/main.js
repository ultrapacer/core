var C0 = Object.defineProperty;
var b0 = (f, s, r) => s in f ? C0(f, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : f[s] = r;
var P = (f, s, r) => b0(f, typeof s != "symbol" ? s + "" : s, r);
var Or = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function mu(f) {
  return f && f.__esModule && Object.prototype.hasOwnProperty.call(f, "default") ? f.default : f;
}
var Dr = { exports: {} }, gs, ou;
function S0() {
  if (ou) return gs;
  ou = 1;
  var f = 1e3, s = f * 60, r = s * 60, a = r * 24, l = a * 7, p = a * 365.25;
  gs = function(I, m) {
    m = m || {};
    var R = typeof I;
    if (R === "string" && I.length > 0)
      return d(I);
    if (R === "number" && isFinite(I))
      return m.long ? y(I) : g(I);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(I)
    );
  };
  function d(I) {
    if (I = String(I), !(I.length > 100)) {
      var m = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        I
      );
      if (m) {
        var R = parseFloat(m[1]), T = (m[2] || "ms").toLowerCase();
        switch (T) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return R * p;
          case "weeks":
          case "week":
          case "w":
            return R * l;
          case "days":
          case "day":
          case "d":
            return R * a;
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
            return R * f;
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
  function g(I) {
    var m = Math.abs(I);
    return m >= a ? Math.round(I / a) + "d" : m >= r ? Math.round(I / r) + "h" : m >= s ? Math.round(I / s) + "m" : m >= f ? Math.round(I / f) + "s" : I + "ms";
  }
  function y(I) {
    var m = Math.abs(I);
    return m >= a ? M(I, m, a, "day") : m >= r ? M(I, m, r, "hour") : m >= s ? M(I, m, s, "minute") : m >= f ? M(I, m, f, "second") : I + " ms";
  }
  function M(I, m, R, T) {
    var F = m >= R * 1.5;
    return Math.round(I / R) + " " + T + (F ? "s" : "");
  }
  return gs;
}
var _s, uu;
function x0() {
  if (uu) return _s;
  uu = 1;
  function f(s) {
    a.debug = a, a.default = a, a.coerce = M, a.disable = g, a.enable = p, a.enabled = y, a.humanize = S0(), a.destroy = I, Object.keys(s).forEach((m) => {
      a[m] = s[m];
    }), a.names = [], a.skips = [], a.formatters = {};
    function r(m) {
      let R = 0;
      for (let T = 0; T < m.length; T++)
        R = (R << 5) - R + m.charCodeAt(T), R |= 0;
      return a.colors[Math.abs(R) % a.colors.length];
    }
    a.selectColor = r;
    function a(m) {
      let R, T = null, F, E;
      function N(...q) {
        if (!N.enabled)
          return;
        const K = N, J = Number(/* @__PURE__ */ new Date()), st = J - (R || J);
        K.diff = st, K.prev = R, K.curr = J, R = J, q[0] = a.coerce(q[0]), typeof q[0] != "string" && q.unshift("%O");
        let mt = 0;
        q[0] = q[0].replace(/%([a-zA-Z%])/g, (bt, jt) => {
          if (bt === "%%")
            return "%";
          mt++;
          const Ht = a.formatters[jt];
          if (typeof Ht == "function") {
            const Ft = q[mt];
            bt = Ht.call(K, Ft), q.splice(mt, 1), mt--;
          }
          return bt;
        }), a.formatArgs.call(K, q), (K.log || a.log).apply(K, q);
      }
      return N.namespace = m, N.useColors = a.useColors(), N.color = a.selectColor(m), N.extend = l, N.destroy = a.destroy, Object.defineProperty(N, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => T !== null ? T : (F !== a.namespaces && (F = a.namespaces, E = a.enabled(m)), E),
        set: (q) => {
          T = q;
        }
      }), typeof a.init == "function" && a.init(N), N;
    }
    function l(m, R) {
      const T = a(this.namespace + (typeof R > "u" ? ":" : R) + m);
      return T.log = this.log, T;
    }
    function p(m) {
      a.save(m), a.namespaces = m, a.names = [], a.skips = [];
      const R = (typeof m == "string" ? m : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const T of R)
        T[0] === "-" ? a.skips.push(T.slice(1)) : a.names.push(T);
    }
    function d(m, R) {
      let T = 0, F = 0, E = -1, N = 0;
      for (; T < m.length; )
        if (F < R.length && (R[F] === m[T] || R[F] === "*"))
          R[F] === "*" ? (E = F, N = T, F++) : (T++, F++);
        else if (E !== -1)
          F = E + 1, N++, T = N;
        else
          return !1;
      for (; F < R.length && R[F] === "*"; )
        F++;
      return F === R.length;
    }
    function g() {
      const m = [
        ...a.names,
        ...a.skips.map((R) => "-" + R)
      ].join(",");
      return a.enable(""), m;
    }
    function y(m) {
      for (const R of a.skips)
        if (d(m, R))
          return !1;
      for (const R of a.names)
        if (d(m, R))
          return !0;
      return !1;
    }
    function M(m) {
      return m instanceof Error ? m.stack || m.message : m;
    }
    function I() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return a.enable(a.load()), a;
  }
  return _s = f, _s;
}
var cu;
function I0() {
  return cu || (cu = 1, function(f, s) {
    s.formatArgs = a, s.save = l, s.load = p, s.useColors = r, s.storage = d(), s.destroy = /* @__PURE__ */ (() => {
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
    function r() {
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
    function a(y) {
      if (y[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + y[0] + (this.useColors ? "%c " : " ") + "+" + f.exports.humanize(this.diff), !this.useColors)
        return;
      const M = "color: " + this.color;
      y.splice(1, 0, M, "color: inherit");
      let I = 0, m = 0;
      y[0].replace(/%[a-zA-Z%]/g, (R) => {
        R !== "%%" && (I++, R === "%c" && (m = I));
      }), y.splice(m, 0, M);
    }
    s.log = console.debug || console.log || (() => {
    });
    function l(y) {
      try {
        y ? s.storage.setItem("debug", y) : s.storage.removeItem("debug");
      } catch {
      }
    }
    function p() {
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
    f.exports = x0()(s);
    const { formatters: g } = f.exports;
    g.j = function(y) {
      try {
        return JSON.stringify(y);
      } catch (M) {
        return "[UnexpectedJSONParseError]: " + M.message;
      }
    };
  }(Dr, Dr.exports)), Dr.exports;
}
var A0 = I0();
const Ss = /* @__PURE__ */ mu(A0), vs = {};
function Hn(f) {
  if (!vs[f]) {
    const s = Ss("ultraPacer:core");
    s(`loading debug for namespace "${f}"`), vs[f] = s.extend(f);
  }
  return vs[f];
}
function r_() {
  Ss.enable("ultraPacer:core*"), Ss("ultraPacer:core")("debug enabled");
}
const P0 = {
  rate: 6,
  // %
  span: 1e3,
  // m
  th: 750
  // m
};
function wu(f, s) {
  (s === null || typeof s > "u") && (s = P0);
  let r = 0;
  return Array.isArray(f) ? r = (f[0] + f[1]) / 2 : r = f, r <= s.th ? 1 : (1 + s.rate / s.span / 100) ** (r - s.th);
}
const lu = {
  baseline: 0,
  terrainScale: 1
};
function Nt(f, s = 0) {
  return Math.round(f * 10 ** s) / 10 ** s;
}
function me(f, s, r, a, l) {
  return r + (l - f) / (s - f) * (a - r);
}
function yu(f, s, r) {
  let a = 0, l = 0;
  const p = [];
  for (a = 0; a < r.length; a++)
    if (r[a] < f[l])
      p.push(s[l]);
    else {
      for (; l < f.length - 1 && f[l + 1] <= r[a]; )
        l++;
      l === f.length - 1 || r[a] === f[l] ? p.push(s[l]) : p.push(me(f[l], f[l + 1], s[l], s[l + 1], r[a]));
    }
  return p;
}
function Mu(f) {
  let s, r, a, l, p = 0, d = 0, g = 0, y = 0, M = 0;
  for (s = 0; s < f.length; s++)
    r = f[s][0], a = f[s][1], l = f[s][2], M += l, p += l * r, g += l * (r * r), d += l * a, y += l * (r * a);
  const I = (d * g - p * y) / (M * g - p * p);
  return [(M * y - p * d) / (M * g - p * p), I];
}
function Cu(f, s, r, a) {
  let l = 0, p = 0;
  const d = [];
  return r.forEach((g) => {
    for (; f[l] < g - a; )
      l++;
    for (l > 0 && f[l] >= g && l--; p < f.length - 1 && f[p + 1] <= g + a; )
      p++;
    p < f.length - 1 && f[p] <= g && p++;
    const y = Math.max(a, Math.abs(g - f[l]) + 1e-3, Math.abs(g - f[p]) + 1e-3), M = [];
    let I = 0;
    for (let m = l; m <= p; m++)
      I = (1 - (Math.abs(g - f[m]) / y) ** 3) ** 3, M.push([f[m], s[m], I]);
    d.push(Mu(M));
  }), d;
}
function qr(f, s, r) {
  return Nt(f, r) < Nt(s, r);
}
function E0(f, s, r) {
  return Nt(f, r) > Nt(s, r);
}
function we(f, s, r) {
  return Nt(f, r) <= Nt(s, r);
}
function Gr(f, s, r) {
  return Nt(f, r) >= Nt(s, r);
}
function ye(f, s, r) {
  return Nt(f, r) === Nt(s, r);
}
const i_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interp: me,
  interpArray: yu,
  linearRegression: Mu,
  req: ye,
  rgt: E0,
  rgte: Gr,
  rlt: qr,
  rlte: we,
  round: Nt,
  wlslr: Cu
}, Symbol.toStringTag, { value: "Module" }));
function R0(f, s) {
  function r(a) {
    return a < f.noon ? a + 86400 : a;
  }
  if (s >= f.sunrise && s <= f.sunset)
    return 0;
  if (!isNaN(f.dawn) && !isNaN(f.dusk) && (s <= f.dawn || s >= f.dusk) || f.nadirAltitude > 0)
    return 1;
  {
    const a = f.nadirAltitude < -6 ? 1 : -(f.nadirAltitude / 6);
    return r(s) >= r(f.nadir) ? me(
      r(isNaN(f.dawn) ? f.nadir : f.dawn),
      r(f.sunrise),
      a,
      0,
      r(s)
    ) : me(
      r(f.sunset),
      r(isNaN(f.dusk) ? f.nadir : f.dusk),
      0,
      a,
      r(s)
    );
  }
}
function bu(f, s, r, a = lu) {
  if (s === 1 || f >= r.sunrise && f <= r.sunset)
    return 1;
  (a === null || typeof a > "u") && (a = lu);
  const l = a.terrainScale * (s - 1) + a.baseline, p = R0(r, f);
  return 1 + l * p;
}
const ve = [
  "altitude",
  "grade",
  "terrain",
  "heat",
  "dark",
  "fatigue",
  "strategy"
];
class Mn {
  constructor(s) {
    P(this, "_data", {
      altitude: 1,
      grade: 1,
      terrain: 1,
      heat: 1,
      dark: 1,
      fatigue: 1,
      strategy: 1
    });
    P(this, "_combined");
    Object.assign(this, s);
  }
  init(s) {
    return ve.forEach((r) => this._data[r] = s), this;
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
    return this._combined === void 0 && (this._combined = ve.reduce((s, r) => s * this._data[r], 1)), this._combined;
  }
  /**
   * @param f - function to apply
   * @param factors - factor list to apply
   */
  applyEach(s, r) {
    ve.forEach((a) => this._data[a] = s(this._data[a], r[a]));
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
    return ve.forEach((r) => this._data[r] *= s), delete this._combined, this;
  }
}
const F0 = {
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
function Su(f, s) {
  return (s === null || typeof s > "u") && (s = F0), f < s.lower.lim ? s.lower.m * f + s.lower.b : f > s.upper.lim ? s.upper.m * f + s.upper.b : s.a * f ** 2 + s.b * f + 1;
}
function xu(f, s) {
  if (!s) return 1;
  const r = f.tod;
  let a = 1;
  if (r > s.start && r < s.stop) {
    const l = (r - s.start) / (s.stop - s.start) * Math.PI;
    a += (s.max - s.baseline) * Math.sin(l) / 100;
  }
  return a += s.baseline / 100, a;
}
var $e = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var T0 = $e.exports, fu;
function L0() {
  return fu || (fu = 1, function(f, s) {
    (function() {
      var r, a = "4.17.21", l = 200, p = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", d = "Expected a function", g = "Invalid `variable` option passed into `_.template`", y = "__lodash_hash_undefined__", M = 500, I = "__lodash_placeholder__", m = 1, R = 2, T = 4, F = 1, E = 2, N = 1, q = 2, K = 4, J = 8, st = 16, mt = 32, zt = 64, bt = 128, jt = 256, Ht = 512, Ft = 30, Me = "...", Ge = 800, Kr = 16, Ce = 1, ze = 2, Zr = 3, ne = 1 / 0, Tn = 9007199254740991, He = 17976931348623157e292, Cn = NaN, k = 4294967295, $ = k - 1, G = k >>> 1, ft = [
        ["ary", bt],
        ["bind", N],
        ["bindKey", q],
        ["curry", J],
        ["curryRight", st],
        ["flip", Ht],
        ["partial", mt],
        ["partialRight", zt],
        ["rearg", jt]
      ], nt = "[object Arguments]", ht = "[object Array]", ot = "[object AsyncFunction]", ct = "[object Boolean]", Mt = "[object Date]", Kt = "[object DOMException]", Tt = "[object Error]", Wt = "[object Function]", _n = "[object GeneratorFunction]", _t = "[object Map]", Lt = "[object Number]", Ln = "[object Null]", Ct = "[object Object]", Bt = "[object Promise]", fn = "[object Proxy]", tn = "[object RegExp]", pt = "[object Set]", vn = "[object String]", Ke = "[object Symbol]", Uu = "[object Undefined]", be = "[object WeakMap]", $u = "[object WeakSet]", Se = "[object ArrayBuffer]", ee = "[object DataView]", Jr = "[object Float32Array]", Yr = "[object Float64Array]", Xr = "[object Int8Array]", Qr = "[object Int16Array]", Vr = "[object Int32Array]", jr = "[object Uint8Array]", ti = "[object Uint8ClampedArray]", ni = "[object Uint16Array]", ei = "[object Uint32Array]", qu = /\b__p \+= '';/g, Gu = /\b(__p \+=) '' \+/g, zu = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Fs = /&(?:amp|lt|gt|quot|#39);/g, Ts = /[&<>"']/g, Hu = RegExp(Fs.source), Ku = RegExp(Ts.source), Zu = /<%-([\s\S]+?)%>/g, Ju = /<%([\s\S]+?)%>/g, Ls = /<%=([\s\S]+?)%>/g, Yu = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Xu = /^\w*$/, Qu = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ri = /[\\^$.*+?()[\]{}|]/g, Vu = RegExp(ri.source), ii = /^\s+/, ju = /\s/, tc = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, nc = /\{\n\/\* \[wrapped with (.+)\] \*/, ec = /,? & /, rc = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, ic = /[()=,{}\[\]\/\s]/, sc = /\\(\\)?/g, ac = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, ks = /\w*$/, oc = /^[-+]0x[0-9a-f]+$/i, uc = /^0b[01]+$/i, cc = /^\[object .+?Constructor\]$/, lc = /^0o[0-7]+$/i, fc = /^(?:0|[1-9]\d*)$/, hc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Ze = /($^)/, pc = /['\n\r\u2028\u2029\\]/g, Je = "\\ud800-\\udfff", dc = "\\u0300-\\u036f", gc = "\\ufe20-\\ufe2f", _c = "\\u20d0-\\u20ff", Os = dc + gc + _c, Ds = "\\u2700-\\u27bf", Ns = "a-z\\xdf-\\xf6\\xf8-\\xff", vc = "\\xac\\xb1\\xd7\\xf7", mc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", wc = "\\u2000-\\u206f", yc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Ws = "A-Z\\xc0-\\xd6\\xd8-\\xde", Bs = "\\ufe0e\\ufe0f", Us = vc + mc + wc + yc, si = "['’]", Mc = "[" + Je + "]", $s = "[" + Us + "]", Ye = "[" + Os + "]", qs = "\\d+", Cc = "[" + Ds + "]", Gs = "[" + Ns + "]", zs = "[^" + Je + Us + qs + Ds + Ns + Ws + "]", ai = "\\ud83c[\\udffb-\\udfff]", bc = "(?:" + Ye + "|" + ai + ")", Hs = "[^" + Je + "]", oi = "(?:\\ud83c[\\udde6-\\uddff]){2}", ui = "[\\ud800-\\udbff][\\udc00-\\udfff]", re = "[" + Ws + "]", Ks = "\\u200d", Zs = "(?:" + Gs + "|" + zs + ")", Sc = "(?:" + re + "|" + zs + ")", Js = "(?:" + si + "(?:d|ll|m|re|s|t|ve))?", Ys = "(?:" + si + "(?:D|LL|M|RE|S|T|VE))?", Xs = bc + "?", Qs = "[" + Bs + "]?", xc = "(?:" + Ks + "(?:" + [Hs, oi, ui].join("|") + ")" + Qs + Xs + ")*", Ic = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Ac = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", Vs = Qs + Xs + xc, Pc = "(?:" + [Cc, oi, ui].join("|") + ")" + Vs, Ec = "(?:" + [Hs + Ye + "?", Ye, oi, ui, Mc].join("|") + ")", Rc = RegExp(si, "g"), Fc = RegExp(Ye, "g"), ci = RegExp(ai + "(?=" + ai + ")|" + Ec + Vs, "g"), Tc = RegExp([
        re + "?" + Gs + "+" + Js + "(?=" + [$s, re, "$"].join("|") + ")",
        Sc + "+" + Ys + "(?=" + [$s, re + Zs, "$"].join("|") + ")",
        re + "?" + Zs + "+" + Js,
        re + "+" + Ys,
        Ac,
        Ic,
        qs,
        Pc
      ].join("|"), "g"), Lc = RegExp("[" + Ks + Je + Os + Bs + "]"), kc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Oc = [
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
      ], Dc = -1, lt = {};
      lt[Jr] = lt[Yr] = lt[Xr] = lt[Qr] = lt[Vr] = lt[jr] = lt[ti] = lt[ni] = lt[ei] = !0, lt[nt] = lt[ht] = lt[Se] = lt[ct] = lt[ee] = lt[Mt] = lt[Tt] = lt[Wt] = lt[_t] = lt[Lt] = lt[Ct] = lt[tn] = lt[pt] = lt[vn] = lt[be] = !1;
      var ut = {};
      ut[nt] = ut[ht] = ut[Se] = ut[ee] = ut[ct] = ut[Mt] = ut[Jr] = ut[Yr] = ut[Xr] = ut[Qr] = ut[Vr] = ut[_t] = ut[Lt] = ut[Ct] = ut[tn] = ut[pt] = ut[vn] = ut[Ke] = ut[jr] = ut[ti] = ut[ni] = ut[ei] = !0, ut[Tt] = ut[Wt] = ut[be] = !1;
      var Nc = {
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
      }, Wc = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Bc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Uc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, $c = parseFloat, qc = parseInt, js = typeof Or == "object" && Or && Or.Object === Object && Or, Gc = typeof self == "object" && self && self.Object === Object && self, At = js || Gc || Function("return this")(), li = s && !s.nodeType && s, Kn = li && !0 && f && !f.nodeType && f, ta = Kn && Kn.exports === li, fi = ta && js.process, nn = function() {
        try {
          var v = Kn && Kn.require && Kn.require("util").types;
          return v || fi && fi.binding && fi.binding("util");
        } catch {
        }
      }(), na = nn && nn.isArrayBuffer, ea = nn && nn.isDate, ra = nn && nn.isMap, ia = nn && nn.isRegExp, sa = nn && nn.isSet, aa = nn && nn.isTypedArray;
      function Zt(v, b, C) {
        switch (C.length) {
          case 0:
            return v.call(b);
          case 1:
            return v.call(b, C[0]);
          case 2:
            return v.call(b, C[0], C[1]);
          case 3:
            return v.call(b, C[0], C[1], C[2]);
        }
        return v.apply(b, C);
      }
      function zc(v, b, C, O) {
        for (var z = -1, et = v == null ? 0 : v.length; ++z < et; ) {
          var St = v[z];
          b(O, St, C(St), v);
        }
        return O;
      }
      function en(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length; ++C < O && b(v[C], C, v) !== !1; )
          ;
        return v;
      }
      function Hc(v, b) {
        for (var C = v == null ? 0 : v.length; C-- && b(v[C], C, v) !== !1; )
          ;
        return v;
      }
      function oa(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length; ++C < O; )
          if (!b(v[C], C, v))
            return !1;
        return !0;
      }
      function kn(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length, z = 0, et = []; ++C < O; ) {
          var St = v[C];
          b(St, C, v) && (et[z++] = St);
        }
        return et;
      }
      function Xe(v, b) {
        var C = v == null ? 0 : v.length;
        return !!C && ie(v, b, 0) > -1;
      }
      function hi(v, b, C) {
        for (var O = -1, z = v == null ? 0 : v.length; ++O < z; )
          if (C(b, v[O]))
            return !0;
        return !1;
      }
      function dt(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length, z = Array(O); ++C < O; )
          z[C] = b(v[C], C, v);
        return z;
      }
      function On(v, b) {
        for (var C = -1, O = b.length, z = v.length; ++C < O; )
          v[z + C] = b[C];
        return v;
      }
      function pi(v, b, C, O) {
        var z = -1, et = v == null ? 0 : v.length;
        for (O && et && (C = v[++z]); ++z < et; )
          C = b(C, v[z], z, v);
        return C;
      }
      function Kc(v, b, C, O) {
        var z = v == null ? 0 : v.length;
        for (O && z && (C = v[--z]); z--; )
          C = b(C, v[z], z, v);
        return C;
      }
      function di(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length; ++C < O; )
          if (b(v[C], C, v))
            return !0;
        return !1;
      }
      var Zc = gi("length");
      function Jc(v) {
        return v.split("");
      }
      function Yc(v) {
        return v.match(rc) || [];
      }
      function ua(v, b, C) {
        var O;
        return C(v, function(z, et, St) {
          if (b(z, et, St))
            return O = et, !1;
        }), O;
      }
      function Qe(v, b, C, O) {
        for (var z = v.length, et = C + (O ? 1 : -1); O ? et-- : ++et < z; )
          if (b(v[et], et, v))
            return et;
        return -1;
      }
      function ie(v, b, C) {
        return b === b ? ol(v, b, C) : Qe(v, ca, C);
      }
      function Xc(v, b, C, O) {
        for (var z = C - 1, et = v.length; ++z < et; )
          if (O(v[z], b))
            return z;
        return -1;
      }
      function ca(v) {
        return v !== v;
      }
      function la(v, b) {
        var C = v == null ? 0 : v.length;
        return C ? vi(v, b) / C : Cn;
      }
      function gi(v) {
        return function(b) {
          return b == null ? r : b[v];
        };
      }
      function _i(v) {
        return function(b) {
          return v == null ? r : v[b];
        };
      }
      function fa(v, b, C, O, z) {
        return z(v, function(et, St, at) {
          C = O ? (O = !1, et) : b(C, et, St, at);
        }), C;
      }
      function Qc(v, b) {
        var C = v.length;
        for (v.sort(b); C--; )
          v[C] = v[C].value;
        return v;
      }
      function vi(v, b) {
        for (var C, O = -1, z = v.length; ++O < z; ) {
          var et = b(v[O]);
          et !== r && (C = C === r ? et : C + et);
        }
        return C;
      }
      function mi(v, b) {
        for (var C = -1, O = Array(v); ++C < v; )
          O[C] = b(C);
        return O;
      }
      function Vc(v, b) {
        return dt(b, function(C) {
          return [C, v[C]];
        });
      }
      function ha(v) {
        return v && v.slice(0, _a(v) + 1).replace(ii, "");
      }
      function Jt(v) {
        return function(b) {
          return v(b);
        };
      }
      function wi(v, b) {
        return dt(b, function(C) {
          return v[C];
        });
      }
      function xe(v, b) {
        return v.has(b);
      }
      function pa(v, b) {
        for (var C = -1, O = v.length; ++C < O && ie(b, v[C], 0) > -1; )
          ;
        return C;
      }
      function da(v, b) {
        for (var C = v.length; C-- && ie(b, v[C], 0) > -1; )
          ;
        return C;
      }
      function jc(v, b) {
        for (var C = v.length, O = 0; C--; )
          v[C] === b && ++O;
        return O;
      }
      var tl = _i(Nc), nl = _i(Wc);
      function el(v) {
        return "\\" + Uc[v];
      }
      function rl(v, b) {
        return v == null ? r : v[b];
      }
      function se(v) {
        return Lc.test(v);
      }
      function il(v) {
        return kc.test(v);
      }
      function sl(v) {
        for (var b, C = []; !(b = v.next()).done; )
          C.push(b.value);
        return C;
      }
      function yi(v) {
        var b = -1, C = Array(v.size);
        return v.forEach(function(O, z) {
          C[++b] = [z, O];
        }), C;
      }
      function ga(v, b) {
        return function(C) {
          return v(b(C));
        };
      }
      function Dn(v, b) {
        for (var C = -1, O = v.length, z = 0, et = []; ++C < O; ) {
          var St = v[C];
          (St === b || St === I) && (v[C] = I, et[z++] = C);
        }
        return et;
      }
      function Ve(v) {
        var b = -1, C = Array(v.size);
        return v.forEach(function(O) {
          C[++b] = O;
        }), C;
      }
      function al(v) {
        var b = -1, C = Array(v.size);
        return v.forEach(function(O) {
          C[++b] = [O, O];
        }), C;
      }
      function ol(v, b, C) {
        for (var O = C - 1, z = v.length; ++O < z; )
          if (v[O] === b)
            return O;
        return -1;
      }
      function ul(v, b, C) {
        for (var O = C + 1; O--; )
          if (v[O] === b)
            return O;
        return O;
      }
      function ae(v) {
        return se(v) ? ll(v) : Zc(v);
      }
      function hn(v) {
        return se(v) ? fl(v) : Jc(v);
      }
      function _a(v) {
        for (var b = v.length; b-- && ju.test(v.charAt(b)); )
          ;
        return b;
      }
      var cl = _i(Bc);
      function ll(v) {
        for (var b = ci.lastIndex = 0; ci.test(v); )
          ++b;
        return b;
      }
      function fl(v) {
        return v.match(ci) || [];
      }
      function hl(v) {
        return v.match(Tc) || [];
      }
      var pl = function v(b) {
        b = b == null ? At : oe.defaults(At.Object(), b, oe.pick(At, Oc));
        var C = b.Array, O = b.Date, z = b.Error, et = b.Function, St = b.Math, at = b.Object, Mi = b.RegExp, dl = b.String, rn = b.TypeError, je = C.prototype, gl = et.prototype, ue = at.prototype, tr = b["__core-js_shared__"], nr = gl.toString, it = ue.hasOwnProperty, _l = 0, va = function() {
          var t = /[^.]+$/.exec(tr && tr.keys && tr.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        }(), er = ue.toString, vl = nr.call(at), ml = At._, wl = Mi(
          "^" + nr.call(it).replace(ri, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), rr = ta ? b.Buffer : r, Nn = b.Symbol, ir = b.Uint8Array, ma = rr ? rr.allocUnsafe : r, sr = ga(at.getPrototypeOf, at), wa = at.create, ya = ue.propertyIsEnumerable, ar = je.splice, Ma = Nn ? Nn.isConcatSpreadable : r, Ie = Nn ? Nn.iterator : r, Zn = Nn ? Nn.toStringTag : r, or = function() {
          try {
            var t = Vn(at, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        }(), yl = b.clearTimeout !== At.clearTimeout && b.clearTimeout, Ml = O && O.now !== At.Date.now && O.now, Cl = b.setTimeout !== At.setTimeout && b.setTimeout, ur = St.ceil, cr = St.floor, Ci = at.getOwnPropertySymbols, bl = rr ? rr.isBuffer : r, Ca = b.isFinite, Sl = je.join, xl = ga(at.keys, at), xt = St.max, Et = St.min, Il = O.now, Al = b.parseInt, ba = St.random, Pl = je.reverse, bi = Vn(b, "DataView"), Ae = Vn(b, "Map"), Si = Vn(b, "Promise"), ce = Vn(b, "Set"), Pe = Vn(b, "WeakMap"), Ee = Vn(at, "create"), lr = Pe && new Pe(), le = {}, El = jn(bi), Rl = jn(Ae), Fl = jn(Si), Tl = jn(ce), Ll = jn(Pe), fr = Nn ? Nn.prototype : r, Re = fr ? fr.valueOf : r, Sa = fr ? fr.toString : r;
        function u(t) {
          if (vt(t) && !H(t) && !(t instanceof j)) {
            if (t instanceof sn)
              return t;
            if (it.call(t, "__wrapped__"))
              return Io(t);
          }
          return new sn(t);
        }
        var fe = /* @__PURE__ */ function() {
          function t() {
          }
          return function(n) {
            if (!gt(n))
              return {};
            if (wa)
              return wa(n);
            t.prototype = n;
            var e = new t();
            return t.prototype = r, e;
          };
        }();
        function hr() {
        }
        function sn(t, n) {
          this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!n, this.__index__ = 0, this.__values__ = r;
        }
        u.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: Zu,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: Ju,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Ls,
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
        }, u.prototype = hr.prototype, u.prototype.constructor = u, sn.prototype = fe(hr.prototype), sn.prototype.constructor = sn;
        function j(t) {
          this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = k, this.__views__ = [];
        }
        function kl() {
          var t = new j(this.__wrapped__);
          return t.__actions__ = Ut(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = Ut(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = Ut(this.__views__), t;
        }
        function Ol() {
          if (this.__filtered__) {
            var t = new j(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function Dl() {
          var t = this.__wrapped__.value(), n = this.__dir__, e = H(t), i = n < 0, o = e ? t.length : 0, c = Yf(0, o, this.__views__), h = c.start, _ = c.end, w = _ - h, S = i ? _ : h - 1, x = this.__iteratees__, A = x.length, L = 0, D = Et(w, this.__takeCount__);
          if (!e || !i && o == w && D == w)
            return Ja(t, this.__actions__);
          var B = [];
          t:
            for (; w-- && L < D; ) {
              S += n;
              for (var Y = -1, U = t[S]; ++Y < A; ) {
                var V = x[Y], tt = V.iteratee, Qt = V.type, Dt = tt(U);
                if (Qt == ze)
                  U = Dt;
                else if (!Dt) {
                  if (Qt == Ce)
                    continue t;
                  break t;
                }
              }
              B[L++] = U;
            }
          return B;
        }
        j.prototype = fe(hr.prototype), j.prototype.constructor = j;
        function Jn(t) {
          var n = -1, e = t == null ? 0 : t.length;
          for (this.clear(); ++n < e; ) {
            var i = t[n];
            this.set(i[0], i[1]);
          }
        }
        function Nl() {
          this.__data__ = Ee ? Ee(null) : {}, this.size = 0;
        }
        function Wl(t) {
          var n = this.has(t) && delete this.__data__[t];
          return this.size -= n ? 1 : 0, n;
        }
        function Bl(t) {
          var n = this.__data__;
          if (Ee) {
            var e = n[t];
            return e === y ? r : e;
          }
          return it.call(n, t) ? n[t] : r;
        }
        function Ul(t) {
          var n = this.__data__;
          return Ee ? n[t] !== r : it.call(n, t);
        }
        function $l(t, n) {
          var e = this.__data__;
          return this.size += this.has(t) ? 0 : 1, e[t] = Ee && n === r ? y : n, this;
        }
        Jn.prototype.clear = Nl, Jn.prototype.delete = Wl, Jn.prototype.get = Bl, Jn.prototype.has = Ul, Jn.prototype.set = $l;
        function bn(t) {
          var n = -1, e = t == null ? 0 : t.length;
          for (this.clear(); ++n < e; ) {
            var i = t[n];
            this.set(i[0], i[1]);
          }
        }
        function ql() {
          this.__data__ = [], this.size = 0;
        }
        function Gl(t) {
          var n = this.__data__, e = pr(n, t);
          if (e < 0)
            return !1;
          var i = n.length - 1;
          return e == i ? n.pop() : ar.call(n, e, 1), --this.size, !0;
        }
        function zl(t) {
          var n = this.__data__, e = pr(n, t);
          return e < 0 ? r : n[e][1];
        }
        function Hl(t) {
          return pr(this.__data__, t) > -1;
        }
        function Kl(t, n) {
          var e = this.__data__, i = pr(e, t);
          return i < 0 ? (++this.size, e.push([t, n])) : e[i][1] = n, this;
        }
        bn.prototype.clear = ql, bn.prototype.delete = Gl, bn.prototype.get = zl, bn.prototype.has = Hl, bn.prototype.set = Kl;
        function Sn(t) {
          var n = -1, e = t == null ? 0 : t.length;
          for (this.clear(); ++n < e; ) {
            var i = t[n];
            this.set(i[0], i[1]);
          }
        }
        function Zl() {
          this.size = 0, this.__data__ = {
            hash: new Jn(),
            map: new (Ae || bn)(),
            string: new Jn()
          };
        }
        function Jl(t) {
          var n = xr(this, t).delete(t);
          return this.size -= n ? 1 : 0, n;
        }
        function Yl(t) {
          return xr(this, t).get(t);
        }
        function Xl(t) {
          return xr(this, t).has(t);
        }
        function Ql(t, n) {
          var e = xr(this, t), i = e.size;
          return e.set(t, n), this.size += e.size == i ? 0 : 1, this;
        }
        Sn.prototype.clear = Zl, Sn.prototype.delete = Jl, Sn.prototype.get = Yl, Sn.prototype.has = Xl, Sn.prototype.set = Ql;
        function Yn(t) {
          var n = -1, e = t == null ? 0 : t.length;
          for (this.__data__ = new Sn(); ++n < e; )
            this.add(t[n]);
        }
        function Vl(t) {
          return this.__data__.set(t, y), this;
        }
        function jl(t) {
          return this.__data__.has(t);
        }
        Yn.prototype.add = Yn.prototype.push = Vl, Yn.prototype.has = jl;
        function pn(t) {
          var n = this.__data__ = new bn(t);
          this.size = n.size;
        }
        function tf() {
          this.__data__ = new bn(), this.size = 0;
        }
        function nf(t) {
          var n = this.__data__, e = n.delete(t);
          return this.size = n.size, e;
        }
        function ef(t) {
          return this.__data__.get(t);
        }
        function rf(t) {
          return this.__data__.has(t);
        }
        function sf(t, n) {
          var e = this.__data__;
          if (e instanceof bn) {
            var i = e.__data__;
            if (!Ae || i.length < l - 1)
              return i.push([t, n]), this.size = ++e.size, this;
            e = this.__data__ = new Sn(i);
          }
          return e.set(t, n), this.size = e.size, this;
        }
        pn.prototype.clear = tf, pn.prototype.delete = nf, pn.prototype.get = ef, pn.prototype.has = rf, pn.prototype.set = sf;
        function xa(t, n) {
          var e = H(t), i = !e && te(t), o = !e && !i && qn(t), c = !e && !i && !o && ge(t), h = e || i || o || c, _ = h ? mi(t.length, dl) : [], w = _.length;
          for (var S in t)
            (n || it.call(t, S)) && !(h && // Safari 9 has enumerable `arguments.length` in strict mode.
            (S == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            o && (S == "offset" || S == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (S == "buffer" || S == "byteLength" || S == "byteOffset") || // Skip index properties.
            Pn(S, w))) && _.push(S);
          return _;
        }
        function Ia(t) {
          var n = t.length;
          return n ? t[Oi(0, n - 1)] : r;
        }
        function af(t, n) {
          return Ir(Ut(t), Xn(n, 0, t.length));
        }
        function of(t) {
          return Ir(Ut(t));
        }
        function xi(t, n, e) {
          (e !== r && !dn(t[n], e) || e === r && !(n in t)) && xn(t, n, e);
        }
        function Fe(t, n, e) {
          var i = t[n];
          (!(it.call(t, n) && dn(i, e)) || e === r && !(n in t)) && xn(t, n, e);
        }
        function pr(t, n) {
          for (var e = t.length; e--; )
            if (dn(t[e][0], n))
              return e;
          return -1;
        }
        function uf(t, n, e, i) {
          return Wn(t, function(o, c, h) {
            n(i, o, e(o), h);
          }), i;
        }
        function Aa(t, n) {
          return t && wn(n, It(n), t);
        }
        function cf(t, n) {
          return t && wn(n, qt(n), t);
        }
        function xn(t, n, e) {
          n == "__proto__" && or ? or(t, n, {
            configurable: !0,
            enumerable: !0,
            value: e,
            writable: !0
          }) : t[n] = e;
        }
        function Ii(t, n) {
          for (var e = -1, i = n.length, o = C(i), c = t == null; ++e < i; )
            o[e] = c ? r : as(t, n[e]);
          return o;
        }
        function Xn(t, n, e) {
          return t === t && (e !== r && (t = t <= e ? t : e), n !== r && (t = t >= n ? t : n)), t;
        }
        function an(t, n, e, i, o, c) {
          var h, _ = n & m, w = n & R, S = n & T;
          if (e && (h = o ? e(t, i, o, c) : e(t)), h !== r)
            return h;
          if (!gt(t))
            return t;
          var x = H(t);
          if (x) {
            if (h = Qf(t), !_)
              return Ut(t, h);
          } else {
            var A = Rt(t), L = A == Wt || A == _n;
            if (qn(t))
              return Qa(t, _);
            if (A == Ct || A == nt || L && !o) {
              if (h = w || L ? {} : vo(t), !_)
                return w ? Uf(t, cf(h, t)) : Bf(t, Aa(h, t));
            } else {
              if (!ut[A])
                return o ? t : {};
              h = Vf(t, A, _);
            }
          }
          c || (c = new pn());
          var D = c.get(t);
          if (D)
            return D;
          c.set(t, h), Ko(t) ? t.forEach(function(U) {
            h.add(an(U, n, e, U, t, c));
          }) : zo(t) && t.forEach(function(U, V) {
            h.set(V, an(U, n, e, V, t, c));
          });
          var B = S ? w ? Ki : Hi : w ? qt : It, Y = x ? r : B(t);
          return en(Y || t, function(U, V) {
            Y && (V = U, U = t[V]), Fe(h, V, an(U, n, e, V, t, c));
          }), h;
        }
        function lf(t) {
          var n = It(t);
          return function(e) {
            return Pa(e, t, n);
          };
        }
        function Pa(t, n, e) {
          var i = e.length;
          if (t == null)
            return !i;
          for (t = at(t); i--; ) {
            var o = e[i], c = n[o], h = t[o];
            if (h === r && !(o in t) || !c(h))
              return !1;
          }
          return !0;
        }
        function Ea(t, n, e) {
          if (typeof t != "function")
            throw new rn(d);
          return We(function() {
            t.apply(r, e);
          }, n);
        }
        function Te(t, n, e, i) {
          var o = -1, c = Xe, h = !0, _ = t.length, w = [], S = n.length;
          if (!_)
            return w;
          e && (n = dt(n, Jt(e))), i ? (c = hi, h = !1) : n.length >= l && (c = xe, h = !1, n = new Yn(n));
          t:
            for (; ++o < _; ) {
              var x = t[o], A = e == null ? x : e(x);
              if (x = i || x !== 0 ? x : 0, h && A === A) {
                for (var L = S; L--; )
                  if (n[L] === A)
                    continue t;
                w.push(x);
              } else c(n, A, i) || w.push(x);
            }
          return w;
        }
        var Wn = eo(mn), Ra = eo(Pi, !0);
        function ff(t, n) {
          var e = !0;
          return Wn(t, function(i, o, c) {
            return e = !!n(i, o, c), e;
          }), e;
        }
        function dr(t, n, e) {
          for (var i = -1, o = t.length; ++i < o; ) {
            var c = t[i], h = n(c);
            if (h != null && (_ === r ? h === h && !Xt(h) : e(h, _)))
              var _ = h, w = c;
          }
          return w;
        }
        function hf(t, n, e, i) {
          var o = t.length;
          for (e = Z(e), e < 0 && (e = -e > o ? 0 : o + e), i = i === r || i > o ? o : Z(i), i < 0 && (i += o), i = e > i ? 0 : Jo(i); e < i; )
            t[e++] = n;
          return t;
        }
        function Fa(t, n) {
          var e = [];
          return Wn(t, function(i, o, c) {
            n(i, o, c) && e.push(i);
          }), e;
        }
        function Pt(t, n, e, i, o) {
          var c = -1, h = t.length;
          for (e || (e = th), o || (o = []); ++c < h; ) {
            var _ = t[c];
            n > 0 && e(_) ? n > 1 ? Pt(_, n - 1, e, i, o) : On(o, _) : i || (o[o.length] = _);
          }
          return o;
        }
        var Ai = ro(), Ta = ro(!0);
        function mn(t, n) {
          return t && Ai(t, n, It);
        }
        function Pi(t, n) {
          return t && Ta(t, n, It);
        }
        function gr(t, n) {
          return kn(n, function(e) {
            return En(t[e]);
          });
        }
        function Qn(t, n) {
          n = Un(n, t);
          for (var e = 0, i = n.length; t != null && e < i; )
            t = t[yn(n[e++])];
          return e && e == i ? t : r;
        }
        function La(t, n, e) {
          var i = n(t);
          return H(t) ? i : On(i, e(t));
        }
        function kt(t) {
          return t == null ? t === r ? Uu : Ln : Zn && Zn in at(t) ? Jf(t) : oh(t);
        }
        function Ei(t, n) {
          return t > n;
        }
        function pf(t, n) {
          return t != null && it.call(t, n);
        }
        function df(t, n) {
          return t != null && n in at(t);
        }
        function gf(t, n, e) {
          return t >= Et(n, e) && t < xt(n, e);
        }
        function Ri(t, n, e) {
          for (var i = e ? hi : Xe, o = t[0].length, c = t.length, h = c, _ = C(c), w = 1 / 0, S = []; h--; ) {
            var x = t[h];
            h && n && (x = dt(x, Jt(n))), w = Et(x.length, w), _[h] = !e && (n || o >= 120 && x.length >= 120) ? new Yn(h && x) : r;
          }
          x = t[0];
          var A = -1, L = _[0];
          t:
            for (; ++A < o && S.length < w; ) {
              var D = x[A], B = n ? n(D) : D;
              if (D = e || D !== 0 ? D : 0, !(L ? xe(L, B) : i(S, B, e))) {
                for (h = c; --h; ) {
                  var Y = _[h];
                  if (!(Y ? xe(Y, B) : i(t[h], B, e)))
                    continue t;
                }
                L && L.push(B), S.push(D);
              }
            }
          return S;
        }
        function _f(t, n, e, i) {
          return mn(t, function(o, c, h) {
            n(i, e(o), c, h);
          }), i;
        }
        function Le(t, n, e) {
          n = Un(n, t), t = Mo(t, n);
          var i = t == null ? t : t[yn(un(n))];
          return i == null ? r : Zt(i, t, e);
        }
        function ka(t) {
          return vt(t) && kt(t) == nt;
        }
        function vf(t) {
          return vt(t) && kt(t) == Se;
        }
        function mf(t) {
          return vt(t) && kt(t) == Mt;
        }
        function ke(t, n, e, i, o) {
          return t === n ? !0 : t == null || n == null || !vt(t) && !vt(n) ? t !== t && n !== n : wf(t, n, e, i, ke, o);
        }
        function wf(t, n, e, i, o, c) {
          var h = H(t), _ = H(n), w = h ? ht : Rt(t), S = _ ? ht : Rt(n);
          w = w == nt ? Ct : w, S = S == nt ? Ct : S;
          var x = w == Ct, A = S == Ct, L = w == S;
          if (L && qn(t)) {
            if (!qn(n))
              return !1;
            h = !0, x = !1;
          }
          if (L && !x)
            return c || (c = new pn()), h || ge(t) ? po(t, n, e, i, o, c) : Kf(t, n, w, e, i, o, c);
          if (!(e & F)) {
            var D = x && it.call(t, "__wrapped__"), B = A && it.call(n, "__wrapped__");
            if (D || B) {
              var Y = D ? t.value() : t, U = B ? n.value() : n;
              return c || (c = new pn()), o(Y, U, e, i, c);
            }
          }
          return L ? (c || (c = new pn()), Zf(t, n, e, i, o, c)) : !1;
        }
        function yf(t) {
          return vt(t) && Rt(t) == _t;
        }
        function Fi(t, n, e, i) {
          var o = e.length, c = o, h = !i;
          if (t == null)
            return !c;
          for (t = at(t); o--; ) {
            var _ = e[o];
            if (h && _[2] ? _[1] !== t[_[0]] : !(_[0] in t))
              return !1;
          }
          for (; ++o < c; ) {
            _ = e[o];
            var w = _[0], S = t[w], x = _[1];
            if (h && _[2]) {
              if (S === r && !(w in t))
                return !1;
            } else {
              var A = new pn();
              if (i)
                var L = i(S, x, w, t, n, A);
              if (!(L === r ? ke(x, S, F | E, i, A) : L))
                return !1;
            }
          }
          return !0;
        }
        function Oa(t) {
          if (!gt(t) || eh(t))
            return !1;
          var n = En(t) ? wl : cc;
          return n.test(jn(t));
        }
        function Mf(t) {
          return vt(t) && kt(t) == tn;
        }
        function Cf(t) {
          return vt(t) && Rt(t) == pt;
        }
        function bf(t) {
          return vt(t) && Tr(t.length) && !!lt[kt(t)];
        }
        function Da(t) {
          return typeof t == "function" ? t : t == null ? Gt : typeof t == "object" ? H(t) ? Ba(t[0], t[1]) : Wa(t) : su(t);
        }
        function Ti(t) {
          if (!Ne(t))
            return xl(t);
          var n = [];
          for (var e in at(t))
            it.call(t, e) && e != "constructor" && n.push(e);
          return n;
        }
        function Sf(t) {
          if (!gt(t))
            return ah(t);
          var n = Ne(t), e = [];
          for (var i in t)
            i == "constructor" && (n || !it.call(t, i)) || e.push(i);
          return e;
        }
        function Li(t, n) {
          return t < n;
        }
        function Na(t, n) {
          var e = -1, i = $t(t) ? C(t.length) : [];
          return Wn(t, function(o, c, h) {
            i[++e] = n(o, c, h);
          }), i;
        }
        function Wa(t) {
          var n = Ji(t);
          return n.length == 1 && n[0][2] ? wo(n[0][0], n[0][1]) : function(e) {
            return e === t || Fi(e, t, n);
          };
        }
        function Ba(t, n) {
          return Xi(t) && mo(n) ? wo(yn(t), n) : function(e) {
            var i = as(e, t);
            return i === r && i === n ? os(e, t) : ke(n, i, F | E);
          };
        }
        function _r(t, n, e, i, o) {
          t !== n && Ai(n, function(c, h) {
            if (o || (o = new pn()), gt(c))
              xf(t, n, h, e, _r, i, o);
            else {
              var _ = i ? i(Vi(t, h), c, h + "", t, n, o) : r;
              _ === r && (_ = c), xi(t, h, _);
            }
          }, qt);
        }
        function xf(t, n, e, i, o, c, h) {
          var _ = Vi(t, e), w = Vi(n, e), S = h.get(w);
          if (S) {
            xi(t, e, S);
            return;
          }
          var x = c ? c(_, w, e + "", t, n, h) : r, A = x === r;
          if (A) {
            var L = H(w), D = !L && qn(w), B = !L && !D && ge(w);
            x = w, L || D || B ? H(_) ? x = _ : wt(_) ? x = Ut(_) : D ? (A = !1, x = Qa(w, !0)) : B ? (A = !1, x = Va(w, !0)) : x = [] : Be(w) || te(w) ? (x = _, te(_) ? x = Yo(_) : (!gt(_) || En(_)) && (x = vo(w))) : A = !1;
          }
          A && (h.set(w, x), o(x, w, i, c, h), h.delete(w)), xi(t, e, x);
        }
        function Ua(t, n) {
          var e = t.length;
          if (e)
            return n += n < 0 ? e : 0, Pn(n, e) ? t[n] : r;
        }
        function $a(t, n, e) {
          n.length ? n = dt(n, function(c) {
            return H(c) ? function(h) {
              return Qn(h, c.length === 1 ? c[0] : c);
            } : c;
          }) : n = [Gt];
          var i = -1;
          n = dt(n, Jt(W()));
          var o = Na(t, function(c, h, _) {
            var w = dt(n, function(S) {
              return S(c);
            });
            return { criteria: w, index: ++i, value: c };
          });
          return Qc(o, function(c, h) {
            return Wf(c, h, e);
          });
        }
        function If(t, n) {
          return qa(t, n, function(e, i) {
            return os(t, i);
          });
        }
        function qa(t, n, e) {
          for (var i = -1, o = n.length, c = {}; ++i < o; ) {
            var h = n[i], _ = Qn(t, h);
            e(_, h) && Oe(c, Un(h, t), _);
          }
          return c;
        }
        function Af(t) {
          return function(n) {
            return Qn(n, t);
          };
        }
        function ki(t, n, e, i) {
          var o = i ? Xc : ie, c = -1, h = n.length, _ = t;
          for (t === n && (n = Ut(n)), e && (_ = dt(t, Jt(e))); ++c < h; )
            for (var w = 0, S = n[c], x = e ? e(S) : S; (w = o(_, x, w, i)) > -1; )
              _ !== t && ar.call(_, w, 1), ar.call(t, w, 1);
          return t;
        }
        function Ga(t, n) {
          for (var e = t ? n.length : 0, i = e - 1; e--; ) {
            var o = n[e];
            if (e == i || o !== c) {
              var c = o;
              Pn(o) ? ar.call(t, o, 1) : Wi(t, o);
            }
          }
          return t;
        }
        function Oi(t, n) {
          return t + cr(ba() * (n - t + 1));
        }
        function Pf(t, n, e, i) {
          for (var o = -1, c = xt(ur((n - t) / (e || 1)), 0), h = C(c); c--; )
            h[i ? c : ++o] = t, t += e;
          return h;
        }
        function Di(t, n) {
          var e = "";
          if (!t || n < 1 || n > Tn)
            return e;
          do
            n % 2 && (e += t), n = cr(n / 2), n && (t += t);
          while (n);
          return e;
        }
        function X(t, n) {
          return ji(yo(t, n, Gt), t + "");
        }
        function Ef(t) {
          return Ia(_e(t));
        }
        function Rf(t, n) {
          var e = _e(t);
          return Ir(e, Xn(n, 0, e.length));
        }
        function Oe(t, n, e, i) {
          if (!gt(t))
            return t;
          n = Un(n, t);
          for (var o = -1, c = n.length, h = c - 1, _ = t; _ != null && ++o < c; ) {
            var w = yn(n[o]), S = e;
            if (w === "__proto__" || w === "constructor" || w === "prototype")
              return t;
            if (o != h) {
              var x = _[w];
              S = i ? i(x, w, _) : r, S === r && (S = gt(x) ? x : Pn(n[o + 1]) ? [] : {});
            }
            Fe(_, w, S), _ = _[w];
          }
          return t;
        }
        var za = lr ? function(t, n) {
          return lr.set(t, n), t;
        } : Gt, Ff = or ? function(t, n) {
          return or(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: cs(n),
            writable: !0
          });
        } : Gt;
        function Tf(t) {
          return Ir(_e(t));
        }
        function on(t, n, e) {
          var i = -1, o = t.length;
          n < 0 && (n = -n > o ? 0 : o + n), e = e > o ? o : e, e < 0 && (e += o), o = n > e ? 0 : e - n >>> 0, n >>>= 0;
          for (var c = C(o); ++i < o; )
            c[i] = t[i + n];
          return c;
        }
        function Lf(t, n) {
          var e;
          return Wn(t, function(i, o, c) {
            return e = n(i, o, c), !e;
          }), !!e;
        }
        function vr(t, n, e) {
          var i = 0, o = t == null ? i : t.length;
          if (typeof n == "number" && n === n && o <= G) {
            for (; i < o; ) {
              var c = i + o >>> 1, h = t[c];
              h !== null && !Xt(h) && (e ? h <= n : h < n) ? i = c + 1 : o = c;
            }
            return o;
          }
          return Ni(t, n, Gt, e);
        }
        function Ni(t, n, e, i) {
          var o = 0, c = t == null ? 0 : t.length;
          if (c === 0)
            return 0;
          n = e(n);
          for (var h = n !== n, _ = n === null, w = Xt(n), S = n === r; o < c; ) {
            var x = cr((o + c) / 2), A = e(t[x]), L = A !== r, D = A === null, B = A === A, Y = Xt(A);
            if (h)
              var U = i || B;
            else S ? U = B && (i || L) : _ ? U = B && L && (i || !D) : w ? U = B && L && !D && (i || !Y) : D || Y ? U = !1 : U = i ? A <= n : A < n;
            U ? o = x + 1 : c = x;
          }
          return Et(c, $);
        }
        function Ha(t, n) {
          for (var e = -1, i = t.length, o = 0, c = []; ++e < i; ) {
            var h = t[e], _ = n ? n(h) : h;
            if (!e || !dn(_, w)) {
              var w = _;
              c[o++] = h === 0 ? 0 : h;
            }
          }
          return c;
        }
        function Ka(t) {
          return typeof t == "number" ? t : Xt(t) ? Cn : +t;
        }
        function Yt(t) {
          if (typeof t == "string")
            return t;
          if (H(t))
            return dt(t, Yt) + "";
          if (Xt(t))
            return Sa ? Sa.call(t) : "";
          var n = t + "";
          return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
        }
        function Bn(t, n, e) {
          var i = -1, o = Xe, c = t.length, h = !0, _ = [], w = _;
          if (e)
            h = !1, o = hi;
          else if (c >= l) {
            var S = n ? null : zf(t);
            if (S)
              return Ve(S);
            h = !1, o = xe, w = new Yn();
          } else
            w = n ? [] : _;
          t:
            for (; ++i < c; ) {
              var x = t[i], A = n ? n(x) : x;
              if (x = e || x !== 0 ? x : 0, h && A === A) {
                for (var L = w.length; L--; )
                  if (w[L] === A)
                    continue t;
                n && w.push(A), _.push(x);
              } else o(w, A, e) || (w !== _ && w.push(A), _.push(x));
            }
          return _;
        }
        function Wi(t, n) {
          return n = Un(n, t), t = Mo(t, n), t == null || delete t[yn(un(n))];
        }
        function Za(t, n, e, i) {
          return Oe(t, n, e(Qn(t, n)), i);
        }
        function mr(t, n, e, i) {
          for (var o = t.length, c = i ? o : -1; (i ? c-- : ++c < o) && n(t[c], c, t); )
            ;
          return e ? on(t, i ? 0 : c, i ? c + 1 : o) : on(t, i ? c + 1 : 0, i ? o : c);
        }
        function Ja(t, n) {
          var e = t;
          return e instanceof j && (e = e.value()), pi(n, function(i, o) {
            return o.func.apply(o.thisArg, On([i], o.args));
          }, e);
        }
        function Bi(t, n, e) {
          var i = t.length;
          if (i < 2)
            return i ? Bn(t[0]) : [];
          for (var o = -1, c = C(i); ++o < i; )
            for (var h = t[o], _ = -1; ++_ < i; )
              _ != o && (c[o] = Te(c[o] || h, t[_], n, e));
          return Bn(Pt(c, 1), n, e);
        }
        function Ya(t, n, e) {
          for (var i = -1, o = t.length, c = n.length, h = {}; ++i < o; ) {
            var _ = i < c ? n[i] : r;
            e(h, t[i], _);
          }
          return h;
        }
        function Ui(t) {
          return wt(t) ? t : [];
        }
        function $i(t) {
          return typeof t == "function" ? t : Gt;
        }
        function Un(t, n) {
          return H(t) ? t : Xi(t, n) ? [t] : xo(rt(t));
        }
        var kf = X;
        function $n(t, n, e) {
          var i = t.length;
          return e = e === r ? i : e, !n && e >= i ? t : on(t, n, e);
        }
        var Xa = yl || function(t) {
          return At.clearTimeout(t);
        };
        function Qa(t, n) {
          if (n)
            return t.slice();
          var e = t.length, i = ma ? ma(e) : new t.constructor(e);
          return t.copy(i), i;
        }
        function qi(t) {
          var n = new t.constructor(t.byteLength);
          return new ir(n).set(new ir(t)), n;
        }
        function Of(t, n) {
          var e = n ? qi(t.buffer) : t.buffer;
          return new t.constructor(e, t.byteOffset, t.byteLength);
        }
        function Df(t) {
          var n = new t.constructor(t.source, ks.exec(t));
          return n.lastIndex = t.lastIndex, n;
        }
        function Nf(t) {
          return Re ? at(Re.call(t)) : {};
        }
        function Va(t, n) {
          var e = n ? qi(t.buffer) : t.buffer;
          return new t.constructor(e, t.byteOffset, t.length);
        }
        function ja(t, n) {
          if (t !== n) {
            var e = t !== r, i = t === null, o = t === t, c = Xt(t), h = n !== r, _ = n === null, w = n === n, S = Xt(n);
            if (!_ && !S && !c && t > n || c && h && w && !_ && !S || i && h && w || !e && w || !o)
              return 1;
            if (!i && !c && !S && t < n || S && e && o && !i && !c || _ && e && o || !h && o || !w)
              return -1;
          }
          return 0;
        }
        function Wf(t, n, e) {
          for (var i = -1, o = t.criteria, c = n.criteria, h = o.length, _ = e.length; ++i < h; ) {
            var w = ja(o[i], c[i]);
            if (w) {
              if (i >= _)
                return w;
              var S = e[i];
              return w * (S == "desc" ? -1 : 1);
            }
          }
          return t.index - n.index;
        }
        function to(t, n, e, i) {
          for (var o = -1, c = t.length, h = e.length, _ = -1, w = n.length, S = xt(c - h, 0), x = C(w + S), A = !i; ++_ < w; )
            x[_] = n[_];
          for (; ++o < h; )
            (A || o < c) && (x[e[o]] = t[o]);
          for (; S--; )
            x[_++] = t[o++];
          return x;
        }
        function no(t, n, e, i) {
          for (var o = -1, c = t.length, h = -1, _ = e.length, w = -1, S = n.length, x = xt(c - _, 0), A = C(x + S), L = !i; ++o < x; )
            A[o] = t[o];
          for (var D = o; ++w < S; )
            A[D + w] = n[w];
          for (; ++h < _; )
            (L || o < c) && (A[D + e[h]] = t[o++]);
          return A;
        }
        function Ut(t, n) {
          var e = -1, i = t.length;
          for (n || (n = C(i)); ++e < i; )
            n[e] = t[e];
          return n;
        }
        function wn(t, n, e, i) {
          var o = !e;
          e || (e = {});
          for (var c = -1, h = n.length; ++c < h; ) {
            var _ = n[c], w = i ? i(e[_], t[_], _, e, t) : r;
            w === r && (w = t[_]), o ? xn(e, _, w) : Fe(e, _, w);
          }
          return e;
        }
        function Bf(t, n) {
          return wn(t, Yi(t), n);
        }
        function Uf(t, n) {
          return wn(t, go(t), n);
        }
        function wr(t, n) {
          return function(e, i) {
            var o = H(e) ? zc : uf, c = n ? n() : {};
            return o(e, t, W(i, 2), c);
          };
        }
        function he(t) {
          return X(function(n, e) {
            var i = -1, o = e.length, c = o > 1 ? e[o - 1] : r, h = o > 2 ? e[2] : r;
            for (c = t.length > 3 && typeof c == "function" ? (o--, c) : r, h && Ot(e[0], e[1], h) && (c = o < 3 ? r : c, o = 1), n = at(n); ++i < o; ) {
              var _ = e[i];
              _ && t(n, _, i, c);
            }
            return n;
          });
        }
        function eo(t, n) {
          return function(e, i) {
            if (e == null)
              return e;
            if (!$t(e))
              return t(e, i);
            for (var o = e.length, c = n ? o : -1, h = at(e); (n ? c-- : ++c < o) && i(h[c], c, h) !== !1; )
              ;
            return e;
          };
        }
        function ro(t) {
          return function(n, e, i) {
            for (var o = -1, c = at(n), h = i(n), _ = h.length; _--; ) {
              var w = h[t ? _ : ++o];
              if (e(c[w], w, c) === !1)
                break;
            }
            return n;
          };
        }
        function $f(t, n, e) {
          var i = n & N, o = De(t);
          function c() {
            var h = this && this !== At && this instanceof c ? o : t;
            return h.apply(i ? e : this, arguments);
          }
          return c;
        }
        function io(t) {
          return function(n) {
            n = rt(n);
            var e = se(n) ? hn(n) : r, i = e ? e[0] : n.charAt(0), o = e ? $n(e, 1).join("") : n.slice(1);
            return i[t]() + o;
          };
        }
        function pe(t) {
          return function(n) {
            return pi(ru(eu(n).replace(Rc, "")), t, "");
          };
        }
        function De(t) {
          return function() {
            var n = arguments;
            switch (n.length) {
              case 0:
                return new t();
              case 1:
                return new t(n[0]);
              case 2:
                return new t(n[0], n[1]);
              case 3:
                return new t(n[0], n[1], n[2]);
              case 4:
                return new t(n[0], n[1], n[2], n[3]);
              case 5:
                return new t(n[0], n[1], n[2], n[3], n[4]);
              case 6:
                return new t(n[0], n[1], n[2], n[3], n[4], n[5]);
              case 7:
                return new t(n[0], n[1], n[2], n[3], n[4], n[5], n[6]);
            }
            var e = fe(t.prototype), i = t.apply(e, n);
            return gt(i) ? i : e;
          };
        }
        function qf(t, n, e) {
          var i = De(t);
          function o() {
            for (var c = arguments.length, h = C(c), _ = c, w = de(o); _--; )
              h[_] = arguments[_];
            var S = c < 3 && h[0] !== w && h[c - 1] !== w ? [] : Dn(h, w);
            if (c -= S.length, c < e)
              return co(
                t,
                n,
                yr,
                o.placeholder,
                r,
                h,
                S,
                r,
                r,
                e - c
              );
            var x = this && this !== At && this instanceof o ? i : t;
            return Zt(x, this, h);
          }
          return o;
        }
        function so(t) {
          return function(n, e, i) {
            var o = at(n);
            if (!$t(n)) {
              var c = W(e, 3);
              n = It(n), e = function(_) {
                return c(o[_], _, o);
              };
            }
            var h = t(n, e, i);
            return h > -1 ? o[c ? n[h] : h] : r;
          };
        }
        function ao(t) {
          return An(function(n) {
            var e = n.length, i = e, o = sn.prototype.thru;
            for (t && n.reverse(); i--; ) {
              var c = n[i];
              if (typeof c != "function")
                throw new rn(d);
              if (o && !h && Sr(c) == "wrapper")
                var h = new sn([], !0);
            }
            for (i = h ? i : e; ++i < e; ) {
              c = n[i];
              var _ = Sr(c), w = _ == "wrapper" ? Zi(c) : r;
              w && Qi(w[0]) && w[1] == (bt | J | mt | jt) && !w[4].length && w[9] == 1 ? h = h[Sr(w[0])].apply(h, w[3]) : h = c.length == 1 && Qi(c) ? h[_]() : h.thru(c);
            }
            return function() {
              var S = arguments, x = S[0];
              if (h && S.length == 1 && H(x))
                return h.plant(x).value();
              for (var A = 0, L = e ? n[A].apply(this, S) : x; ++A < e; )
                L = n[A].call(this, L);
              return L;
            };
          });
        }
        function yr(t, n, e, i, o, c, h, _, w, S) {
          var x = n & bt, A = n & N, L = n & q, D = n & (J | st), B = n & Ht, Y = L ? r : De(t);
          function U() {
            for (var V = arguments.length, tt = C(V), Qt = V; Qt--; )
              tt[Qt] = arguments[Qt];
            if (D)
              var Dt = de(U), Vt = jc(tt, Dt);
            if (i && (tt = to(tt, i, o, D)), c && (tt = no(tt, c, h, D)), V -= Vt, D && V < S) {
              var yt = Dn(tt, Dt);
              return co(
                t,
                n,
                yr,
                U.placeholder,
                e,
                tt,
                yt,
                _,
                w,
                S - V
              );
            }
            var gn = A ? e : this, Fn = L ? gn[t] : t;
            return V = tt.length, _ ? tt = uh(tt, _) : B && V > 1 && tt.reverse(), x && w < V && (tt.length = w), this && this !== At && this instanceof U && (Fn = Y || De(Fn)), Fn.apply(gn, tt);
          }
          return U;
        }
        function oo(t, n) {
          return function(e, i) {
            return _f(e, t, n(i), {});
          };
        }
        function Mr(t, n) {
          return function(e, i) {
            var o;
            if (e === r && i === r)
              return n;
            if (e !== r && (o = e), i !== r) {
              if (o === r)
                return i;
              typeof e == "string" || typeof i == "string" ? (e = Yt(e), i = Yt(i)) : (e = Ka(e), i = Ka(i)), o = t(e, i);
            }
            return o;
          };
        }
        function Gi(t) {
          return An(function(n) {
            return n = dt(n, Jt(W())), X(function(e) {
              var i = this;
              return t(n, function(o) {
                return Zt(o, i, e);
              });
            });
          });
        }
        function Cr(t, n) {
          n = n === r ? " " : Yt(n);
          var e = n.length;
          if (e < 2)
            return e ? Di(n, t) : n;
          var i = Di(n, ur(t / ae(n)));
          return se(n) ? $n(hn(i), 0, t).join("") : i.slice(0, t);
        }
        function Gf(t, n, e, i) {
          var o = n & N, c = De(t);
          function h() {
            for (var _ = -1, w = arguments.length, S = -1, x = i.length, A = C(x + w), L = this && this !== At && this instanceof h ? c : t; ++S < x; )
              A[S] = i[S];
            for (; w--; )
              A[S++] = arguments[++_];
            return Zt(L, o ? e : this, A);
          }
          return h;
        }
        function uo(t) {
          return function(n, e, i) {
            return i && typeof i != "number" && Ot(n, e, i) && (e = i = r), n = Rn(n), e === r ? (e = n, n = 0) : e = Rn(e), i = i === r ? n < e ? 1 : -1 : Rn(i), Pf(n, e, i, t);
          };
        }
        function br(t) {
          return function(n, e) {
            return typeof n == "string" && typeof e == "string" || (n = cn(n), e = cn(e)), t(n, e);
          };
        }
        function co(t, n, e, i, o, c, h, _, w, S) {
          var x = n & J, A = x ? h : r, L = x ? r : h, D = x ? c : r, B = x ? r : c;
          n |= x ? mt : zt, n &= ~(x ? zt : mt), n & K || (n &= -4);
          var Y = [
            t,
            n,
            o,
            D,
            A,
            B,
            L,
            _,
            w,
            S
          ], U = e.apply(r, Y);
          return Qi(t) && Co(U, Y), U.placeholder = i, bo(U, t, n);
        }
        function zi(t) {
          var n = St[t];
          return function(e, i) {
            if (e = cn(e), i = i == null ? 0 : Et(Z(i), 292), i && Ca(e)) {
              var o = (rt(e) + "e").split("e"), c = n(o[0] + "e" + (+o[1] + i));
              return o = (rt(c) + "e").split("e"), +(o[0] + "e" + (+o[1] - i));
            }
            return n(e);
          };
        }
        var zf = ce && 1 / Ve(new ce([, -0]))[1] == ne ? function(t) {
          return new ce(t);
        } : hs;
        function lo(t) {
          return function(n) {
            var e = Rt(n);
            return e == _t ? yi(n) : e == pt ? al(n) : Vc(n, t(n));
          };
        }
        function In(t, n, e, i, o, c, h, _) {
          var w = n & q;
          if (!w && typeof t != "function")
            throw new rn(d);
          var S = i ? i.length : 0;
          if (S || (n &= -97, i = o = r), h = h === r ? h : xt(Z(h), 0), _ = _ === r ? _ : Z(_), S -= o ? o.length : 0, n & zt) {
            var x = i, A = o;
            i = o = r;
          }
          var L = w ? r : Zi(t), D = [
            t,
            n,
            e,
            i,
            o,
            x,
            A,
            c,
            h,
            _
          ];
          if (L && sh(D, L), t = D[0], n = D[1], e = D[2], i = D[3], o = D[4], _ = D[9] = D[9] === r ? w ? 0 : t.length : xt(D[9] - S, 0), !_ && n & (J | st) && (n &= -25), !n || n == N)
            var B = $f(t, n, e);
          else n == J || n == st ? B = qf(t, n, _) : (n == mt || n == (N | mt)) && !o.length ? B = Gf(t, n, e, i) : B = yr.apply(r, D);
          var Y = L ? za : Co;
          return bo(Y(B, D), t, n);
        }
        function fo(t, n, e, i) {
          return t === r || dn(t, ue[e]) && !it.call(i, e) ? n : t;
        }
        function ho(t, n, e, i, o, c) {
          return gt(t) && gt(n) && (c.set(n, t), _r(t, n, r, ho, c), c.delete(n)), t;
        }
        function Hf(t) {
          return Be(t) ? r : t;
        }
        function po(t, n, e, i, o, c) {
          var h = e & F, _ = t.length, w = n.length;
          if (_ != w && !(h && w > _))
            return !1;
          var S = c.get(t), x = c.get(n);
          if (S && x)
            return S == n && x == t;
          var A = -1, L = !0, D = e & E ? new Yn() : r;
          for (c.set(t, n), c.set(n, t); ++A < _; ) {
            var B = t[A], Y = n[A];
            if (i)
              var U = h ? i(Y, B, A, n, t, c) : i(B, Y, A, t, n, c);
            if (U !== r) {
              if (U)
                continue;
              L = !1;
              break;
            }
            if (D) {
              if (!di(n, function(V, tt) {
                if (!xe(D, tt) && (B === V || o(B, V, e, i, c)))
                  return D.push(tt);
              })) {
                L = !1;
                break;
              }
            } else if (!(B === Y || o(B, Y, e, i, c))) {
              L = !1;
              break;
            }
          }
          return c.delete(t), c.delete(n), L;
        }
        function Kf(t, n, e, i, o, c, h) {
          switch (e) {
            case ee:
              if (t.byteLength != n.byteLength || t.byteOffset != n.byteOffset)
                return !1;
              t = t.buffer, n = n.buffer;
            case Se:
              return !(t.byteLength != n.byteLength || !c(new ir(t), new ir(n)));
            case ct:
            case Mt:
            case Lt:
              return dn(+t, +n);
            case Tt:
              return t.name == n.name && t.message == n.message;
            case tn:
            case vn:
              return t == n + "";
            case _t:
              var _ = yi;
            case pt:
              var w = i & F;
              if (_ || (_ = Ve), t.size != n.size && !w)
                return !1;
              var S = h.get(t);
              if (S)
                return S == n;
              i |= E, h.set(t, n);
              var x = po(_(t), _(n), i, o, c, h);
              return h.delete(t), x;
            case Ke:
              if (Re)
                return Re.call(t) == Re.call(n);
          }
          return !1;
        }
        function Zf(t, n, e, i, o, c) {
          var h = e & F, _ = Hi(t), w = _.length, S = Hi(n), x = S.length;
          if (w != x && !h)
            return !1;
          for (var A = w; A--; ) {
            var L = _[A];
            if (!(h ? L in n : it.call(n, L)))
              return !1;
          }
          var D = c.get(t), B = c.get(n);
          if (D && B)
            return D == n && B == t;
          var Y = !0;
          c.set(t, n), c.set(n, t);
          for (var U = h; ++A < w; ) {
            L = _[A];
            var V = t[L], tt = n[L];
            if (i)
              var Qt = h ? i(tt, V, L, n, t, c) : i(V, tt, L, t, n, c);
            if (!(Qt === r ? V === tt || o(V, tt, e, i, c) : Qt)) {
              Y = !1;
              break;
            }
            U || (U = L == "constructor");
          }
          if (Y && !U) {
            var Dt = t.constructor, Vt = n.constructor;
            Dt != Vt && "constructor" in t && "constructor" in n && !(typeof Dt == "function" && Dt instanceof Dt && typeof Vt == "function" && Vt instanceof Vt) && (Y = !1);
          }
          return c.delete(t), c.delete(n), Y;
        }
        function An(t) {
          return ji(yo(t, r, Eo), t + "");
        }
        function Hi(t) {
          return La(t, It, Yi);
        }
        function Ki(t) {
          return La(t, qt, go);
        }
        var Zi = lr ? function(t) {
          return lr.get(t);
        } : hs;
        function Sr(t) {
          for (var n = t.name + "", e = le[n], i = it.call(le, n) ? e.length : 0; i--; ) {
            var o = e[i], c = o.func;
            if (c == null || c == t)
              return o.name;
          }
          return n;
        }
        function de(t) {
          var n = it.call(u, "placeholder") ? u : t;
          return n.placeholder;
        }
        function W() {
          var t = u.iteratee || ls;
          return t = t === ls ? Da : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function xr(t, n) {
          var e = t.__data__;
          return nh(n) ? e[typeof n == "string" ? "string" : "hash"] : e.map;
        }
        function Ji(t) {
          for (var n = It(t), e = n.length; e--; ) {
            var i = n[e], o = t[i];
            n[e] = [i, o, mo(o)];
          }
          return n;
        }
        function Vn(t, n) {
          var e = rl(t, n);
          return Oa(e) ? e : r;
        }
        function Jf(t) {
          var n = it.call(t, Zn), e = t[Zn];
          try {
            t[Zn] = r;
            var i = !0;
          } catch {
          }
          var o = er.call(t);
          return i && (n ? t[Zn] = e : delete t[Zn]), o;
        }
        var Yi = Ci ? function(t) {
          return t == null ? [] : (t = at(t), kn(Ci(t), function(n) {
            return ya.call(t, n);
          }));
        } : ps, go = Ci ? function(t) {
          for (var n = []; t; )
            On(n, Yi(t)), t = sr(t);
          return n;
        } : ps, Rt = kt;
        (bi && Rt(new bi(new ArrayBuffer(1))) != ee || Ae && Rt(new Ae()) != _t || Si && Rt(Si.resolve()) != Bt || ce && Rt(new ce()) != pt || Pe && Rt(new Pe()) != be) && (Rt = function(t) {
          var n = kt(t), e = n == Ct ? t.constructor : r, i = e ? jn(e) : "";
          if (i)
            switch (i) {
              case El:
                return ee;
              case Rl:
                return _t;
              case Fl:
                return Bt;
              case Tl:
                return pt;
              case Ll:
                return be;
            }
          return n;
        });
        function Yf(t, n, e) {
          for (var i = -1, o = e.length; ++i < o; ) {
            var c = e[i], h = c.size;
            switch (c.type) {
              case "drop":
                t += h;
                break;
              case "dropRight":
                n -= h;
                break;
              case "take":
                n = Et(n, t + h);
                break;
              case "takeRight":
                t = xt(t, n - h);
                break;
            }
          }
          return { start: t, end: n };
        }
        function Xf(t) {
          var n = t.match(nc);
          return n ? n[1].split(ec) : [];
        }
        function _o(t, n, e) {
          n = Un(n, t);
          for (var i = -1, o = n.length, c = !1; ++i < o; ) {
            var h = yn(n[i]);
            if (!(c = t != null && e(t, h)))
              break;
            t = t[h];
          }
          return c || ++i != o ? c : (o = t == null ? 0 : t.length, !!o && Tr(o) && Pn(h, o) && (H(t) || te(t)));
        }
        function Qf(t) {
          var n = t.length, e = new t.constructor(n);
          return n && typeof t[0] == "string" && it.call(t, "index") && (e.index = t.index, e.input = t.input), e;
        }
        function vo(t) {
          return typeof t.constructor == "function" && !Ne(t) ? fe(sr(t)) : {};
        }
        function Vf(t, n, e) {
          var i = t.constructor;
          switch (n) {
            case Se:
              return qi(t);
            case ct:
            case Mt:
              return new i(+t);
            case ee:
              return Of(t, e);
            case Jr:
            case Yr:
            case Xr:
            case Qr:
            case Vr:
            case jr:
            case ti:
            case ni:
            case ei:
              return Va(t, e);
            case _t:
              return new i();
            case Lt:
            case vn:
              return new i(t);
            case tn:
              return Df(t);
            case pt:
              return new i();
            case Ke:
              return Nf(t);
          }
        }
        function jf(t, n) {
          var e = n.length;
          if (!e)
            return t;
          var i = e - 1;
          return n[i] = (e > 1 ? "& " : "") + n[i], n = n.join(e > 2 ? ", " : " "), t.replace(tc, `{
/* [wrapped with ` + n + `] */
`);
        }
        function th(t) {
          return H(t) || te(t) || !!(Ma && t && t[Ma]);
        }
        function Pn(t, n) {
          var e = typeof t;
          return n = n ?? Tn, !!n && (e == "number" || e != "symbol" && fc.test(t)) && t > -1 && t % 1 == 0 && t < n;
        }
        function Ot(t, n, e) {
          if (!gt(e))
            return !1;
          var i = typeof n;
          return (i == "number" ? $t(e) && Pn(n, e.length) : i == "string" && n in e) ? dn(e[n], t) : !1;
        }
        function Xi(t, n) {
          if (H(t))
            return !1;
          var e = typeof t;
          return e == "number" || e == "symbol" || e == "boolean" || t == null || Xt(t) ? !0 : Xu.test(t) || !Yu.test(t) || n != null && t in at(n);
        }
        function nh(t) {
          var n = typeof t;
          return n == "string" || n == "number" || n == "symbol" || n == "boolean" ? t !== "__proto__" : t === null;
        }
        function Qi(t) {
          var n = Sr(t), e = u[n];
          if (typeof e != "function" || !(n in j.prototype))
            return !1;
          if (t === e)
            return !0;
          var i = Zi(e);
          return !!i && t === i[0];
        }
        function eh(t) {
          return !!va && va in t;
        }
        var rh = tr ? En : ds;
        function Ne(t) {
          var n = t && t.constructor, e = typeof n == "function" && n.prototype || ue;
          return t === e;
        }
        function mo(t) {
          return t === t && !gt(t);
        }
        function wo(t, n) {
          return function(e) {
            return e == null ? !1 : e[t] === n && (n !== r || t in at(e));
          };
        }
        function ih(t) {
          var n = Rr(t, function(i) {
            return e.size === M && e.clear(), i;
          }), e = n.cache;
          return n;
        }
        function sh(t, n) {
          var e = t[1], i = n[1], o = e | i, c = o < (N | q | bt), h = i == bt && e == J || i == bt && e == jt && t[7].length <= n[8] || i == (bt | jt) && n[7].length <= n[8] && e == J;
          if (!(c || h))
            return t;
          i & N && (t[2] = n[2], o |= e & N ? 0 : K);
          var _ = n[3];
          if (_) {
            var w = t[3];
            t[3] = w ? to(w, _, n[4]) : _, t[4] = w ? Dn(t[3], I) : n[4];
          }
          return _ = n[5], _ && (w = t[5], t[5] = w ? no(w, _, n[6]) : _, t[6] = w ? Dn(t[5], I) : n[6]), _ = n[7], _ && (t[7] = _), i & bt && (t[8] = t[8] == null ? n[8] : Et(t[8], n[8])), t[9] == null && (t[9] = n[9]), t[0] = n[0], t[1] = o, t;
        }
        function ah(t) {
          var n = [];
          if (t != null)
            for (var e in at(t))
              n.push(e);
          return n;
        }
        function oh(t) {
          return er.call(t);
        }
        function yo(t, n, e) {
          return n = xt(n === r ? t.length - 1 : n, 0), function() {
            for (var i = arguments, o = -1, c = xt(i.length - n, 0), h = C(c); ++o < c; )
              h[o] = i[n + o];
            o = -1;
            for (var _ = C(n + 1); ++o < n; )
              _[o] = i[o];
            return _[n] = e(h), Zt(t, this, _);
          };
        }
        function Mo(t, n) {
          return n.length < 2 ? t : Qn(t, on(n, 0, -1));
        }
        function uh(t, n) {
          for (var e = t.length, i = Et(n.length, e), o = Ut(t); i--; ) {
            var c = n[i];
            t[i] = Pn(c, e) ? o[c] : r;
          }
          return t;
        }
        function Vi(t, n) {
          if (!(n === "constructor" && typeof t[n] == "function") && n != "__proto__")
            return t[n];
        }
        var Co = So(za), We = Cl || function(t, n) {
          return At.setTimeout(t, n);
        }, ji = So(Ff);
        function bo(t, n, e) {
          var i = n + "";
          return ji(t, jf(i, ch(Xf(i), e)));
        }
        function So(t) {
          var n = 0, e = 0;
          return function() {
            var i = Il(), o = Kr - (i - e);
            if (e = i, o > 0) {
              if (++n >= Ge)
                return arguments[0];
            } else
              n = 0;
            return t.apply(r, arguments);
          };
        }
        function Ir(t, n) {
          var e = -1, i = t.length, o = i - 1;
          for (n = n === r ? i : n; ++e < n; ) {
            var c = Oi(e, o), h = t[c];
            t[c] = t[e], t[e] = h;
          }
          return t.length = n, t;
        }
        var xo = ih(function(t) {
          var n = [];
          return t.charCodeAt(0) === 46 && n.push(""), t.replace(Qu, function(e, i, o, c) {
            n.push(o ? c.replace(sc, "$1") : i || e);
          }), n;
        });
        function yn(t) {
          if (typeof t == "string" || Xt(t))
            return t;
          var n = t + "";
          return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
        }
        function jn(t) {
          if (t != null) {
            try {
              return nr.call(t);
            } catch {
            }
            try {
              return t + "";
            } catch {
            }
          }
          return "";
        }
        function ch(t, n) {
          return en(ft, function(e) {
            var i = "_." + e[0];
            n & e[1] && !Xe(t, i) && t.push(i);
          }), t.sort();
        }
        function Io(t) {
          if (t instanceof j)
            return t.clone();
          var n = new sn(t.__wrapped__, t.__chain__);
          return n.__actions__ = Ut(t.__actions__), n.__index__ = t.__index__, n.__values__ = t.__values__, n;
        }
        function lh(t, n, e) {
          (e ? Ot(t, n, e) : n === r) ? n = 1 : n = xt(Z(n), 0);
          var i = t == null ? 0 : t.length;
          if (!i || n < 1)
            return [];
          for (var o = 0, c = 0, h = C(ur(i / n)); o < i; )
            h[c++] = on(t, o, o += n);
          return h;
        }
        function fh(t) {
          for (var n = -1, e = t == null ? 0 : t.length, i = 0, o = []; ++n < e; ) {
            var c = t[n];
            c && (o[i++] = c);
          }
          return o;
        }
        function hh() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var n = C(t - 1), e = arguments[0], i = t; i--; )
            n[i - 1] = arguments[i];
          return On(H(e) ? Ut(e) : [e], Pt(n, 1));
        }
        var ph = X(function(t, n) {
          return wt(t) ? Te(t, Pt(n, 1, wt, !0)) : [];
        }), dh = X(function(t, n) {
          var e = un(n);
          return wt(e) && (e = r), wt(t) ? Te(t, Pt(n, 1, wt, !0), W(e, 2)) : [];
        }), gh = X(function(t, n) {
          var e = un(n);
          return wt(e) && (e = r), wt(t) ? Te(t, Pt(n, 1, wt, !0), r, e) : [];
        });
        function _h(t, n, e) {
          var i = t == null ? 0 : t.length;
          return i ? (n = e || n === r ? 1 : Z(n), on(t, n < 0 ? 0 : n, i)) : [];
        }
        function vh(t, n, e) {
          var i = t == null ? 0 : t.length;
          return i ? (n = e || n === r ? 1 : Z(n), n = i - n, on(t, 0, n < 0 ? 0 : n)) : [];
        }
        function mh(t, n) {
          return t && t.length ? mr(t, W(n, 3), !0, !0) : [];
        }
        function wh(t, n) {
          return t && t.length ? mr(t, W(n, 3), !0) : [];
        }
        function yh(t, n, e, i) {
          var o = t == null ? 0 : t.length;
          return o ? (e && typeof e != "number" && Ot(t, n, e) && (e = 0, i = o), hf(t, n, e, i)) : [];
        }
        function Ao(t, n, e) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = e == null ? 0 : Z(e);
          return o < 0 && (o = xt(i + o, 0)), Qe(t, W(n, 3), o);
        }
        function Po(t, n, e) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = i - 1;
          return e !== r && (o = Z(e), o = e < 0 ? xt(i + o, 0) : Et(o, i - 1)), Qe(t, W(n, 3), o, !0);
        }
        function Eo(t) {
          var n = t == null ? 0 : t.length;
          return n ? Pt(t, 1) : [];
        }
        function Mh(t) {
          var n = t == null ? 0 : t.length;
          return n ? Pt(t, ne) : [];
        }
        function Ch(t, n) {
          var e = t == null ? 0 : t.length;
          return e ? (n = n === r ? 1 : Z(n), Pt(t, n)) : [];
        }
        function bh(t) {
          for (var n = -1, e = t == null ? 0 : t.length, i = {}; ++n < e; ) {
            var o = t[n];
            i[o[0]] = o[1];
          }
          return i;
        }
        function Ro(t) {
          return t && t.length ? t[0] : r;
        }
        function Sh(t, n, e) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = e == null ? 0 : Z(e);
          return o < 0 && (o = xt(i + o, 0)), ie(t, n, o);
        }
        function xh(t) {
          var n = t == null ? 0 : t.length;
          return n ? on(t, 0, -1) : [];
        }
        var Ih = X(function(t) {
          var n = dt(t, Ui);
          return n.length && n[0] === t[0] ? Ri(n) : [];
        }), Ah = X(function(t) {
          var n = un(t), e = dt(t, Ui);
          return n === un(e) ? n = r : e.pop(), e.length && e[0] === t[0] ? Ri(e, W(n, 2)) : [];
        }), Ph = X(function(t) {
          var n = un(t), e = dt(t, Ui);
          return n = typeof n == "function" ? n : r, n && e.pop(), e.length && e[0] === t[0] ? Ri(e, r, n) : [];
        });
        function Eh(t, n) {
          return t == null ? "" : Sl.call(t, n);
        }
        function un(t) {
          var n = t == null ? 0 : t.length;
          return n ? t[n - 1] : r;
        }
        function Rh(t, n, e) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = i;
          return e !== r && (o = Z(e), o = o < 0 ? xt(i + o, 0) : Et(o, i - 1)), n === n ? ul(t, n, o) : Qe(t, ca, o, !0);
        }
        function Fh(t, n) {
          return t && t.length ? Ua(t, Z(n)) : r;
        }
        var Th = X(Fo);
        function Fo(t, n) {
          return t && t.length && n && n.length ? ki(t, n) : t;
        }
        function Lh(t, n, e) {
          return t && t.length && n && n.length ? ki(t, n, W(e, 2)) : t;
        }
        function kh(t, n, e) {
          return t && t.length && n && n.length ? ki(t, n, r, e) : t;
        }
        var Oh = An(function(t, n) {
          var e = t == null ? 0 : t.length, i = Ii(t, n);
          return Ga(t, dt(n, function(o) {
            return Pn(o, e) ? +o : o;
          }).sort(ja)), i;
        });
        function Dh(t, n) {
          var e = [];
          if (!(t && t.length))
            return e;
          var i = -1, o = [], c = t.length;
          for (n = W(n, 3); ++i < c; ) {
            var h = t[i];
            n(h, i, t) && (e.push(h), o.push(i));
          }
          return Ga(t, o), e;
        }
        function ts(t) {
          return t == null ? t : Pl.call(t);
        }
        function Nh(t, n, e) {
          var i = t == null ? 0 : t.length;
          return i ? (e && typeof e != "number" && Ot(t, n, e) ? (n = 0, e = i) : (n = n == null ? 0 : Z(n), e = e === r ? i : Z(e)), on(t, n, e)) : [];
        }
        function Wh(t, n) {
          return vr(t, n);
        }
        function Bh(t, n, e) {
          return Ni(t, n, W(e, 2));
        }
        function Uh(t, n) {
          var e = t == null ? 0 : t.length;
          if (e) {
            var i = vr(t, n);
            if (i < e && dn(t[i], n))
              return i;
          }
          return -1;
        }
        function $h(t, n) {
          return vr(t, n, !0);
        }
        function qh(t, n, e) {
          return Ni(t, n, W(e, 2), !0);
        }
        function Gh(t, n) {
          var e = t == null ? 0 : t.length;
          if (e) {
            var i = vr(t, n, !0) - 1;
            if (dn(t[i], n))
              return i;
          }
          return -1;
        }
        function zh(t) {
          return t && t.length ? Ha(t) : [];
        }
        function Hh(t, n) {
          return t && t.length ? Ha(t, W(n, 2)) : [];
        }
        function Kh(t) {
          var n = t == null ? 0 : t.length;
          return n ? on(t, 1, n) : [];
        }
        function Zh(t, n, e) {
          return t && t.length ? (n = e || n === r ? 1 : Z(n), on(t, 0, n < 0 ? 0 : n)) : [];
        }
        function Jh(t, n, e) {
          var i = t == null ? 0 : t.length;
          return i ? (n = e || n === r ? 1 : Z(n), n = i - n, on(t, n < 0 ? 0 : n, i)) : [];
        }
        function Yh(t, n) {
          return t && t.length ? mr(t, W(n, 3), !1, !0) : [];
        }
        function Xh(t, n) {
          return t && t.length ? mr(t, W(n, 3)) : [];
        }
        var Qh = X(function(t) {
          return Bn(Pt(t, 1, wt, !0));
        }), Vh = X(function(t) {
          var n = un(t);
          return wt(n) && (n = r), Bn(Pt(t, 1, wt, !0), W(n, 2));
        }), jh = X(function(t) {
          var n = un(t);
          return n = typeof n == "function" ? n : r, Bn(Pt(t, 1, wt, !0), r, n);
        });
        function tp(t) {
          return t && t.length ? Bn(t) : [];
        }
        function np(t, n) {
          return t && t.length ? Bn(t, W(n, 2)) : [];
        }
        function ep(t, n) {
          return n = typeof n == "function" ? n : r, t && t.length ? Bn(t, r, n) : [];
        }
        function ns(t) {
          if (!(t && t.length))
            return [];
          var n = 0;
          return t = kn(t, function(e) {
            if (wt(e))
              return n = xt(e.length, n), !0;
          }), mi(n, function(e) {
            return dt(t, gi(e));
          });
        }
        function To(t, n) {
          if (!(t && t.length))
            return [];
          var e = ns(t);
          return n == null ? e : dt(e, function(i) {
            return Zt(n, r, i);
          });
        }
        var rp = X(function(t, n) {
          return wt(t) ? Te(t, n) : [];
        }), ip = X(function(t) {
          return Bi(kn(t, wt));
        }), sp = X(function(t) {
          var n = un(t);
          return wt(n) && (n = r), Bi(kn(t, wt), W(n, 2));
        }), ap = X(function(t) {
          var n = un(t);
          return n = typeof n == "function" ? n : r, Bi(kn(t, wt), r, n);
        }), op = X(ns);
        function up(t, n) {
          return Ya(t || [], n || [], Fe);
        }
        function cp(t, n) {
          return Ya(t || [], n || [], Oe);
        }
        var lp = X(function(t) {
          var n = t.length, e = n > 1 ? t[n - 1] : r;
          return e = typeof e == "function" ? (t.pop(), e) : r, To(t, e);
        });
        function Lo(t) {
          var n = u(t);
          return n.__chain__ = !0, n;
        }
        function fp(t, n) {
          return n(t), t;
        }
        function Ar(t, n) {
          return n(t);
        }
        var hp = An(function(t) {
          var n = t.length, e = n ? t[0] : 0, i = this.__wrapped__, o = function(c) {
            return Ii(c, t);
          };
          return n > 1 || this.__actions__.length || !(i instanceof j) || !Pn(e) ? this.thru(o) : (i = i.slice(e, +e + (n ? 1 : 0)), i.__actions__.push({
            func: Ar,
            args: [o],
            thisArg: r
          }), new sn(i, this.__chain__).thru(function(c) {
            return n && !c.length && c.push(r), c;
          }));
        });
        function pp() {
          return Lo(this);
        }
        function dp() {
          return new sn(this.value(), this.__chain__);
        }
        function gp() {
          this.__values__ === r && (this.__values__ = Zo(this.value()));
          var t = this.__index__ >= this.__values__.length, n = t ? r : this.__values__[this.__index__++];
          return { done: t, value: n };
        }
        function _p() {
          return this;
        }
        function vp(t) {
          for (var n, e = this; e instanceof hr; ) {
            var i = Io(e);
            i.__index__ = 0, i.__values__ = r, n ? o.__wrapped__ = i : n = i;
            var o = i;
            e = e.__wrapped__;
          }
          return o.__wrapped__ = t, n;
        }
        function mp() {
          var t = this.__wrapped__;
          if (t instanceof j) {
            var n = t;
            return this.__actions__.length && (n = new j(this)), n = n.reverse(), n.__actions__.push({
              func: Ar,
              args: [ts],
              thisArg: r
            }), new sn(n, this.__chain__);
          }
          return this.thru(ts);
        }
        function wp() {
          return Ja(this.__wrapped__, this.__actions__);
        }
        var yp = wr(function(t, n, e) {
          it.call(t, e) ? ++t[e] : xn(t, e, 1);
        });
        function Mp(t, n, e) {
          var i = H(t) ? oa : ff;
          return e && Ot(t, n, e) && (n = r), i(t, W(n, 3));
        }
        function Cp(t, n) {
          var e = H(t) ? kn : Fa;
          return e(t, W(n, 3));
        }
        var bp = so(Ao), Sp = so(Po);
        function xp(t, n) {
          return Pt(Pr(t, n), 1);
        }
        function Ip(t, n) {
          return Pt(Pr(t, n), ne);
        }
        function Ap(t, n, e) {
          return e = e === r ? 1 : Z(e), Pt(Pr(t, n), e);
        }
        function ko(t, n) {
          var e = H(t) ? en : Wn;
          return e(t, W(n, 3));
        }
        function Oo(t, n) {
          var e = H(t) ? Hc : Ra;
          return e(t, W(n, 3));
        }
        var Pp = wr(function(t, n, e) {
          it.call(t, e) ? t[e].push(n) : xn(t, e, [n]);
        });
        function Ep(t, n, e, i) {
          t = $t(t) ? t : _e(t), e = e && !i ? Z(e) : 0;
          var o = t.length;
          return e < 0 && (e = xt(o + e, 0)), Lr(t) ? e <= o && t.indexOf(n, e) > -1 : !!o && ie(t, n, e) > -1;
        }
        var Rp = X(function(t, n, e) {
          var i = -1, o = typeof n == "function", c = $t(t) ? C(t.length) : [];
          return Wn(t, function(h) {
            c[++i] = o ? Zt(n, h, e) : Le(h, n, e);
          }), c;
        }), Fp = wr(function(t, n, e) {
          xn(t, e, n);
        });
        function Pr(t, n) {
          var e = H(t) ? dt : Na;
          return e(t, W(n, 3));
        }
        function Tp(t, n, e, i) {
          return t == null ? [] : (H(n) || (n = n == null ? [] : [n]), e = i ? r : e, H(e) || (e = e == null ? [] : [e]), $a(t, n, e));
        }
        var Lp = wr(function(t, n, e) {
          t[e ? 0 : 1].push(n);
        }, function() {
          return [[], []];
        });
        function kp(t, n, e) {
          var i = H(t) ? pi : fa, o = arguments.length < 3;
          return i(t, W(n, 4), e, o, Wn);
        }
        function Op(t, n, e) {
          var i = H(t) ? Kc : fa, o = arguments.length < 3;
          return i(t, W(n, 4), e, o, Ra);
        }
        function Dp(t, n) {
          var e = H(t) ? kn : Fa;
          return e(t, Fr(W(n, 3)));
        }
        function Np(t) {
          var n = H(t) ? Ia : Ef;
          return n(t);
        }
        function Wp(t, n, e) {
          (e ? Ot(t, n, e) : n === r) ? n = 1 : n = Z(n);
          var i = H(t) ? af : Rf;
          return i(t, n);
        }
        function Bp(t) {
          var n = H(t) ? of : Tf;
          return n(t);
        }
        function Up(t) {
          if (t == null)
            return 0;
          if ($t(t))
            return Lr(t) ? ae(t) : t.length;
          var n = Rt(t);
          return n == _t || n == pt ? t.size : Ti(t).length;
        }
        function $p(t, n, e) {
          var i = H(t) ? di : Lf;
          return e && Ot(t, n, e) && (n = r), i(t, W(n, 3));
        }
        var qp = X(function(t, n) {
          if (t == null)
            return [];
          var e = n.length;
          return e > 1 && Ot(t, n[0], n[1]) ? n = [] : e > 2 && Ot(n[0], n[1], n[2]) && (n = [n[0]]), $a(t, Pt(n, 1), []);
        }), Er = Ml || function() {
          return At.Date.now();
        };
        function Gp(t, n) {
          if (typeof n != "function")
            throw new rn(d);
          return t = Z(t), function() {
            if (--t < 1)
              return n.apply(this, arguments);
          };
        }
        function Do(t, n, e) {
          return n = e ? r : n, n = t && n == null ? t.length : n, In(t, bt, r, r, r, r, n);
        }
        function No(t, n) {
          var e;
          if (typeof n != "function")
            throw new rn(d);
          return t = Z(t), function() {
            return --t > 0 && (e = n.apply(this, arguments)), t <= 1 && (n = r), e;
          };
        }
        var es = X(function(t, n, e) {
          var i = N;
          if (e.length) {
            var o = Dn(e, de(es));
            i |= mt;
          }
          return In(t, i, n, e, o);
        }), Wo = X(function(t, n, e) {
          var i = N | q;
          if (e.length) {
            var o = Dn(e, de(Wo));
            i |= mt;
          }
          return In(n, i, t, e, o);
        });
        function Bo(t, n, e) {
          n = e ? r : n;
          var i = In(t, J, r, r, r, r, r, n);
          return i.placeholder = Bo.placeholder, i;
        }
        function Uo(t, n, e) {
          n = e ? r : n;
          var i = In(t, st, r, r, r, r, r, n);
          return i.placeholder = Uo.placeholder, i;
        }
        function $o(t, n, e) {
          var i, o, c, h, _, w, S = 0, x = !1, A = !1, L = !0;
          if (typeof t != "function")
            throw new rn(d);
          n = cn(n) || 0, gt(e) && (x = !!e.leading, A = "maxWait" in e, c = A ? xt(cn(e.maxWait) || 0, n) : c, L = "trailing" in e ? !!e.trailing : L);
          function D(yt) {
            var gn = i, Fn = o;
            return i = o = r, S = yt, h = t.apply(Fn, gn), h;
          }
          function B(yt) {
            return S = yt, _ = We(V, n), x ? D(yt) : h;
          }
          function Y(yt) {
            var gn = yt - w, Fn = yt - S, au = n - gn;
            return A ? Et(au, c - Fn) : au;
          }
          function U(yt) {
            var gn = yt - w, Fn = yt - S;
            return w === r || gn >= n || gn < 0 || A && Fn >= c;
          }
          function V() {
            var yt = Er();
            if (U(yt))
              return tt(yt);
            _ = We(V, Y(yt));
          }
          function tt(yt) {
            return _ = r, L && i ? D(yt) : (i = o = r, h);
          }
          function Qt() {
            _ !== r && Xa(_), S = 0, i = w = o = _ = r;
          }
          function Dt() {
            return _ === r ? h : tt(Er());
          }
          function Vt() {
            var yt = Er(), gn = U(yt);
            if (i = arguments, o = this, w = yt, gn) {
              if (_ === r)
                return B(w);
              if (A)
                return Xa(_), _ = We(V, n), D(w);
            }
            return _ === r && (_ = We(V, n)), h;
          }
          return Vt.cancel = Qt, Vt.flush = Dt, Vt;
        }
        var zp = X(function(t, n) {
          return Ea(t, 1, n);
        }), Hp = X(function(t, n, e) {
          return Ea(t, cn(n) || 0, e);
        });
        function Kp(t) {
          return In(t, Ht);
        }
        function Rr(t, n) {
          if (typeof t != "function" || n != null && typeof n != "function")
            throw new rn(d);
          var e = function() {
            var i = arguments, o = n ? n.apply(this, i) : i[0], c = e.cache;
            if (c.has(o))
              return c.get(o);
            var h = t.apply(this, i);
            return e.cache = c.set(o, h) || c, h;
          };
          return e.cache = new (Rr.Cache || Sn)(), e;
        }
        Rr.Cache = Sn;
        function Fr(t) {
          if (typeof t != "function")
            throw new rn(d);
          return function() {
            var n = arguments;
            switch (n.length) {
              case 0:
                return !t.call(this);
              case 1:
                return !t.call(this, n[0]);
              case 2:
                return !t.call(this, n[0], n[1]);
              case 3:
                return !t.call(this, n[0], n[1], n[2]);
            }
            return !t.apply(this, n);
          };
        }
        function Zp(t) {
          return No(2, t);
        }
        var Jp = kf(function(t, n) {
          n = n.length == 1 && H(n[0]) ? dt(n[0], Jt(W())) : dt(Pt(n, 1), Jt(W()));
          var e = n.length;
          return X(function(i) {
            for (var o = -1, c = Et(i.length, e); ++o < c; )
              i[o] = n[o].call(this, i[o]);
            return Zt(t, this, i);
          });
        }), rs = X(function(t, n) {
          var e = Dn(n, de(rs));
          return In(t, mt, r, n, e);
        }), qo = X(function(t, n) {
          var e = Dn(n, de(qo));
          return In(t, zt, r, n, e);
        }), Yp = An(function(t, n) {
          return In(t, jt, r, r, r, n);
        });
        function Xp(t, n) {
          if (typeof t != "function")
            throw new rn(d);
          return n = n === r ? n : Z(n), X(t, n);
        }
        function Qp(t, n) {
          if (typeof t != "function")
            throw new rn(d);
          return n = n == null ? 0 : xt(Z(n), 0), X(function(e) {
            var i = e[n], o = $n(e, 0, n);
            return i && On(o, i), Zt(t, this, o);
          });
        }
        function Vp(t, n, e) {
          var i = !0, o = !0;
          if (typeof t != "function")
            throw new rn(d);
          return gt(e) && (i = "leading" in e ? !!e.leading : i, o = "trailing" in e ? !!e.trailing : o), $o(t, n, {
            leading: i,
            maxWait: n,
            trailing: o
          });
        }
        function jp(t) {
          return Do(t, 1);
        }
        function td(t, n) {
          return rs($i(n), t);
        }
        function nd() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return H(t) ? t : [t];
        }
        function ed(t) {
          return an(t, T);
        }
        function rd(t, n) {
          return n = typeof n == "function" ? n : r, an(t, T, n);
        }
        function id(t) {
          return an(t, m | T);
        }
        function sd(t, n) {
          return n = typeof n == "function" ? n : r, an(t, m | T, n);
        }
        function ad(t, n) {
          return n == null || Pa(t, n, It(n));
        }
        function dn(t, n) {
          return t === n || t !== t && n !== n;
        }
        var od = br(Ei), ud = br(function(t, n) {
          return t >= n;
        }), te = ka(/* @__PURE__ */ function() {
          return arguments;
        }()) ? ka : function(t) {
          return vt(t) && it.call(t, "callee") && !ya.call(t, "callee");
        }, H = C.isArray, cd = na ? Jt(na) : vf;
        function $t(t) {
          return t != null && Tr(t.length) && !En(t);
        }
        function wt(t) {
          return vt(t) && $t(t);
        }
        function ld(t) {
          return t === !0 || t === !1 || vt(t) && kt(t) == ct;
        }
        var qn = bl || ds, fd = ea ? Jt(ea) : mf;
        function hd(t) {
          return vt(t) && t.nodeType === 1 && !Be(t);
        }
        function pd(t) {
          if (t == null)
            return !0;
          if ($t(t) && (H(t) || typeof t == "string" || typeof t.splice == "function" || qn(t) || ge(t) || te(t)))
            return !t.length;
          var n = Rt(t);
          if (n == _t || n == pt)
            return !t.size;
          if (Ne(t))
            return !Ti(t).length;
          for (var e in t)
            if (it.call(t, e))
              return !1;
          return !0;
        }
        function dd(t, n) {
          return ke(t, n);
        }
        function gd(t, n, e) {
          e = typeof e == "function" ? e : r;
          var i = e ? e(t, n) : r;
          return i === r ? ke(t, n, r, e) : !!i;
        }
        function is(t) {
          if (!vt(t))
            return !1;
          var n = kt(t);
          return n == Tt || n == Kt || typeof t.message == "string" && typeof t.name == "string" && !Be(t);
        }
        function _d(t) {
          return typeof t == "number" && Ca(t);
        }
        function En(t) {
          if (!gt(t))
            return !1;
          var n = kt(t);
          return n == Wt || n == _n || n == ot || n == fn;
        }
        function Go(t) {
          return typeof t == "number" && t == Z(t);
        }
        function Tr(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= Tn;
        }
        function gt(t) {
          var n = typeof t;
          return t != null && (n == "object" || n == "function");
        }
        function vt(t) {
          return t != null && typeof t == "object";
        }
        var zo = ra ? Jt(ra) : yf;
        function vd(t, n) {
          return t === n || Fi(t, n, Ji(n));
        }
        function md(t, n, e) {
          return e = typeof e == "function" ? e : r, Fi(t, n, Ji(n), e);
        }
        function wd(t) {
          return Ho(t) && t != +t;
        }
        function yd(t) {
          if (rh(t))
            throw new z(p);
          return Oa(t);
        }
        function Md(t) {
          return t === null;
        }
        function Cd(t) {
          return t == null;
        }
        function Ho(t) {
          return typeof t == "number" || vt(t) && kt(t) == Lt;
        }
        function Be(t) {
          if (!vt(t) || kt(t) != Ct)
            return !1;
          var n = sr(t);
          if (n === null)
            return !0;
          var e = it.call(n, "constructor") && n.constructor;
          return typeof e == "function" && e instanceof e && nr.call(e) == vl;
        }
        var ss = ia ? Jt(ia) : Mf;
        function bd(t) {
          return Go(t) && t >= -9007199254740991 && t <= Tn;
        }
        var Ko = sa ? Jt(sa) : Cf;
        function Lr(t) {
          return typeof t == "string" || !H(t) && vt(t) && kt(t) == vn;
        }
        function Xt(t) {
          return typeof t == "symbol" || vt(t) && kt(t) == Ke;
        }
        var ge = aa ? Jt(aa) : bf;
        function Sd(t) {
          return t === r;
        }
        function xd(t) {
          return vt(t) && Rt(t) == be;
        }
        function Id(t) {
          return vt(t) && kt(t) == $u;
        }
        var Ad = br(Li), Pd = br(function(t, n) {
          return t <= n;
        });
        function Zo(t) {
          if (!t)
            return [];
          if ($t(t))
            return Lr(t) ? hn(t) : Ut(t);
          if (Ie && t[Ie])
            return sl(t[Ie]());
          var n = Rt(t), e = n == _t ? yi : n == pt ? Ve : _e;
          return e(t);
        }
        function Rn(t) {
          if (!t)
            return t === 0 ? t : 0;
          if (t = cn(t), t === ne || t === -1 / 0) {
            var n = t < 0 ? -1 : 1;
            return n * He;
          }
          return t === t ? t : 0;
        }
        function Z(t) {
          var n = Rn(t), e = n % 1;
          return n === n ? e ? n - e : n : 0;
        }
        function Jo(t) {
          return t ? Xn(Z(t), 0, k) : 0;
        }
        function cn(t) {
          if (typeof t == "number")
            return t;
          if (Xt(t))
            return Cn;
          if (gt(t)) {
            var n = typeof t.valueOf == "function" ? t.valueOf() : t;
            t = gt(n) ? n + "" : n;
          }
          if (typeof t != "string")
            return t === 0 ? t : +t;
          t = ha(t);
          var e = uc.test(t);
          return e || lc.test(t) ? qc(t.slice(2), e ? 2 : 8) : oc.test(t) ? Cn : +t;
        }
        function Yo(t) {
          return wn(t, qt(t));
        }
        function Ed(t) {
          return t ? Xn(Z(t), -9007199254740991, Tn) : t === 0 ? t : 0;
        }
        function rt(t) {
          return t == null ? "" : Yt(t);
        }
        var Rd = he(function(t, n) {
          if (Ne(n) || $t(n)) {
            wn(n, It(n), t);
            return;
          }
          for (var e in n)
            it.call(n, e) && Fe(t, e, n[e]);
        }), Xo = he(function(t, n) {
          wn(n, qt(n), t);
        }), kr = he(function(t, n, e, i) {
          wn(n, qt(n), t, i);
        }), Fd = he(function(t, n, e, i) {
          wn(n, It(n), t, i);
        }), Td = An(Ii);
        function Ld(t, n) {
          var e = fe(t);
          return n == null ? e : Aa(e, n);
        }
        var kd = X(function(t, n) {
          t = at(t);
          var e = -1, i = n.length, o = i > 2 ? n[2] : r;
          for (o && Ot(n[0], n[1], o) && (i = 1); ++e < i; )
            for (var c = n[e], h = qt(c), _ = -1, w = h.length; ++_ < w; ) {
              var S = h[_], x = t[S];
              (x === r || dn(x, ue[S]) && !it.call(t, S)) && (t[S] = c[S]);
            }
          return t;
        }), Od = X(function(t) {
          return t.push(r, ho), Zt(Qo, r, t);
        });
        function Dd(t, n) {
          return ua(t, W(n, 3), mn);
        }
        function Nd(t, n) {
          return ua(t, W(n, 3), Pi);
        }
        function Wd(t, n) {
          return t == null ? t : Ai(t, W(n, 3), qt);
        }
        function Bd(t, n) {
          return t == null ? t : Ta(t, W(n, 3), qt);
        }
        function Ud(t, n) {
          return t && mn(t, W(n, 3));
        }
        function $d(t, n) {
          return t && Pi(t, W(n, 3));
        }
        function qd(t) {
          return t == null ? [] : gr(t, It(t));
        }
        function Gd(t) {
          return t == null ? [] : gr(t, qt(t));
        }
        function as(t, n, e) {
          var i = t == null ? r : Qn(t, n);
          return i === r ? e : i;
        }
        function zd(t, n) {
          return t != null && _o(t, n, pf);
        }
        function os(t, n) {
          return t != null && _o(t, n, df);
        }
        var Hd = oo(function(t, n, e) {
          n != null && typeof n.toString != "function" && (n = er.call(n)), t[n] = e;
        }, cs(Gt)), Kd = oo(function(t, n, e) {
          n != null && typeof n.toString != "function" && (n = er.call(n)), it.call(t, n) ? t[n].push(e) : t[n] = [e];
        }, W), Zd = X(Le);
        function It(t) {
          return $t(t) ? xa(t) : Ti(t);
        }
        function qt(t) {
          return $t(t) ? xa(t, !0) : Sf(t);
        }
        function Jd(t, n) {
          var e = {};
          return n = W(n, 3), mn(t, function(i, o, c) {
            xn(e, n(i, o, c), i);
          }), e;
        }
        function Yd(t, n) {
          var e = {};
          return n = W(n, 3), mn(t, function(i, o, c) {
            xn(e, o, n(i, o, c));
          }), e;
        }
        var Xd = he(function(t, n, e) {
          _r(t, n, e);
        }), Qo = he(function(t, n, e, i) {
          _r(t, n, e, i);
        }), Qd = An(function(t, n) {
          var e = {};
          if (t == null)
            return e;
          var i = !1;
          n = dt(n, function(c) {
            return c = Un(c, t), i || (i = c.length > 1), c;
          }), wn(t, Ki(t), e), i && (e = an(e, m | R | T, Hf));
          for (var o = n.length; o--; )
            Wi(e, n[o]);
          return e;
        });
        function Vd(t, n) {
          return Vo(t, Fr(W(n)));
        }
        var jd = An(function(t, n) {
          return t == null ? {} : If(t, n);
        });
        function Vo(t, n) {
          if (t == null)
            return {};
          var e = dt(Ki(t), function(i) {
            return [i];
          });
          return n = W(n), qa(t, e, function(i, o) {
            return n(i, o[0]);
          });
        }
        function tg(t, n, e) {
          n = Un(n, t);
          var i = -1, o = n.length;
          for (o || (o = 1, t = r); ++i < o; ) {
            var c = t == null ? r : t[yn(n[i])];
            c === r && (i = o, c = e), t = En(c) ? c.call(t) : c;
          }
          return t;
        }
        function ng(t, n, e) {
          return t == null ? t : Oe(t, n, e);
        }
        function eg(t, n, e, i) {
          return i = typeof i == "function" ? i : r, t == null ? t : Oe(t, n, e, i);
        }
        var jo = lo(It), tu = lo(qt);
        function rg(t, n, e) {
          var i = H(t), o = i || qn(t) || ge(t);
          if (n = W(n, 4), e == null) {
            var c = t && t.constructor;
            o ? e = i ? new c() : [] : gt(t) ? e = En(c) ? fe(sr(t)) : {} : e = {};
          }
          return (o ? en : mn)(t, function(h, _, w) {
            return n(e, h, _, w);
          }), e;
        }
        function ig(t, n) {
          return t == null ? !0 : Wi(t, n);
        }
        function sg(t, n, e) {
          return t == null ? t : Za(t, n, $i(e));
        }
        function ag(t, n, e, i) {
          return i = typeof i == "function" ? i : r, t == null ? t : Za(t, n, $i(e), i);
        }
        function _e(t) {
          return t == null ? [] : wi(t, It(t));
        }
        function og(t) {
          return t == null ? [] : wi(t, qt(t));
        }
        function ug(t, n, e) {
          return e === r && (e = n, n = r), e !== r && (e = cn(e), e = e === e ? e : 0), n !== r && (n = cn(n), n = n === n ? n : 0), Xn(cn(t), n, e);
        }
        function cg(t, n, e) {
          return n = Rn(n), e === r ? (e = n, n = 0) : e = Rn(e), t = cn(t), gf(t, n, e);
        }
        function lg(t, n, e) {
          if (e && typeof e != "boolean" && Ot(t, n, e) && (n = e = r), e === r && (typeof n == "boolean" ? (e = n, n = r) : typeof t == "boolean" && (e = t, t = r)), t === r && n === r ? (t = 0, n = 1) : (t = Rn(t), n === r ? (n = t, t = 0) : n = Rn(n)), t > n) {
            var i = t;
            t = n, n = i;
          }
          if (e || t % 1 || n % 1) {
            var o = ba();
            return Et(t + o * (n - t + $c("1e-" + ((o + "").length - 1))), n);
          }
          return Oi(t, n);
        }
        var fg = pe(function(t, n, e) {
          return n = n.toLowerCase(), t + (e ? nu(n) : n);
        });
        function nu(t) {
          return us(rt(t).toLowerCase());
        }
        function eu(t) {
          return t = rt(t), t && t.replace(hc, tl).replace(Fc, "");
        }
        function hg(t, n, e) {
          t = rt(t), n = Yt(n);
          var i = t.length;
          e = e === r ? i : Xn(Z(e), 0, i);
          var o = e;
          return e -= n.length, e >= 0 && t.slice(e, o) == n;
        }
        function pg(t) {
          return t = rt(t), t && Ku.test(t) ? t.replace(Ts, nl) : t;
        }
        function dg(t) {
          return t = rt(t), t && Vu.test(t) ? t.replace(ri, "\\$&") : t;
        }
        var gg = pe(function(t, n, e) {
          return t + (e ? "-" : "") + n.toLowerCase();
        }), _g = pe(function(t, n, e) {
          return t + (e ? " " : "") + n.toLowerCase();
        }), vg = io("toLowerCase");
        function mg(t, n, e) {
          t = rt(t), n = Z(n);
          var i = n ? ae(t) : 0;
          if (!n || i >= n)
            return t;
          var o = (n - i) / 2;
          return Cr(cr(o), e) + t + Cr(ur(o), e);
        }
        function wg(t, n, e) {
          t = rt(t), n = Z(n);
          var i = n ? ae(t) : 0;
          return n && i < n ? t + Cr(n - i, e) : t;
        }
        function yg(t, n, e) {
          t = rt(t), n = Z(n);
          var i = n ? ae(t) : 0;
          return n && i < n ? Cr(n - i, e) + t : t;
        }
        function Mg(t, n, e) {
          return e || n == null ? n = 0 : n && (n = +n), Al(rt(t).replace(ii, ""), n || 0);
        }
        function Cg(t, n, e) {
          return (e ? Ot(t, n, e) : n === r) ? n = 1 : n = Z(n), Di(rt(t), n);
        }
        function bg() {
          var t = arguments, n = rt(t[0]);
          return t.length < 3 ? n : n.replace(t[1], t[2]);
        }
        var Sg = pe(function(t, n, e) {
          return t + (e ? "_" : "") + n.toLowerCase();
        });
        function xg(t, n, e) {
          return e && typeof e != "number" && Ot(t, n, e) && (n = e = r), e = e === r ? k : e >>> 0, e ? (t = rt(t), t && (typeof n == "string" || n != null && !ss(n)) && (n = Yt(n), !n && se(t)) ? $n(hn(t), 0, e) : t.split(n, e)) : [];
        }
        var Ig = pe(function(t, n, e) {
          return t + (e ? " " : "") + us(n);
        });
        function Ag(t, n, e) {
          return t = rt(t), e = e == null ? 0 : Xn(Z(e), 0, t.length), n = Yt(n), t.slice(e, e + n.length) == n;
        }
        function Pg(t, n, e) {
          var i = u.templateSettings;
          e && Ot(t, n, e) && (n = r), t = rt(t), n = kr({}, n, i, fo);
          var o = kr({}, n.imports, i.imports, fo), c = It(o), h = wi(o, c), _, w, S = 0, x = n.interpolate || Ze, A = "__p += '", L = Mi(
            (n.escape || Ze).source + "|" + x.source + "|" + (x === Ls ? ac : Ze).source + "|" + (n.evaluate || Ze).source + "|$",
            "g"
          ), D = "//# sourceURL=" + (it.call(n, "sourceURL") ? (n.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Dc + "]") + `
`;
          t.replace(L, function(U, V, tt, Qt, Dt, Vt) {
            return tt || (tt = Qt), A += t.slice(S, Vt).replace(pc, el), V && (_ = !0, A += `' +
__e(` + V + `) +
'`), Dt && (w = !0, A += `';
` + Dt + `;
__p += '`), tt && (A += `' +
((__t = (` + tt + `)) == null ? '' : __t) +
'`), S = Vt + U.length, U;
          }), A += `';
`;
          var B = it.call(n, "variable") && n.variable;
          if (!B)
            A = `with (obj) {
` + A + `
}
`;
          else if (ic.test(B))
            throw new z(g);
          A = (w ? A.replace(qu, "") : A).replace(Gu, "$1").replace(zu, "$1;"), A = "function(" + (B || "obj") + `) {
` + (B ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (_ ? ", __e = _.escape" : "") + (w ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + A + `return __p
}`;
          var Y = iu(function() {
            return et(c, D + "return " + A).apply(r, h);
          });
          if (Y.source = A, is(Y))
            throw Y;
          return Y;
        }
        function Eg(t) {
          return rt(t).toLowerCase();
        }
        function Rg(t) {
          return rt(t).toUpperCase();
        }
        function Fg(t, n, e) {
          if (t = rt(t), t && (e || n === r))
            return ha(t);
          if (!t || !(n = Yt(n)))
            return t;
          var i = hn(t), o = hn(n), c = pa(i, o), h = da(i, o) + 1;
          return $n(i, c, h).join("");
        }
        function Tg(t, n, e) {
          if (t = rt(t), t && (e || n === r))
            return t.slice(0, _a(t) + 1);
          if (!t || !(n = Yt(n)))
            return t;
          var i = hn(t), o = da(i, hn(n)) + 1;
          return $n(i, 0, o).join("");
        }
        function Lg(t, n, e) {
          if (t = rt(t), t && (e || n === r))
            return t.replace(ii, "");
          if (!t || !(n = Yt(n)))
            return t;
          var i = hn(t), o = pa(i, hn(n));
          return $n(i, o).join("");
        }
        function kg(t, n) {
          var e = Ft, i = Me;
          if (gt(n)) {
            var o = "separator" in n ? n.separator : o;
            e = "length" in n ? Z(n.length) : e, i = "omission" in n ? Yt(n.omission) : i;
          }
          t = rt(t);
          var c = t.length;
          if (se(t)) {
            var h = hn(t);
            c = h.length;
          }
          if (e >= c)
            return t;
          var _ = e - ae(i);
          if (_ < 1)
            return i;
          var w = h ? $n(h, 0, _).join("") : t.slice(0, _);
          if (o === r)
            return w + i;
          if (h && (_ += w.length - _), ss(o)) {
            if (t.slice(_).search(o)) {
              var S, x = w;
              for (o.global || (o = Mi(o.source, rt(ks.exec(o)) + "g")), o.lastIndex = 0; S = o.exec(x); )
                var A = S.index;
              w = w.slice(0, A === r ? _ : A);
            }
          } else if (t.indexOf(Yt(o), _) != _) {
            var L = w.lastIndexOf(o);
            L > -1 && (w = w.slice(0, L));
          }
          return w + i;
        }
        function Og(t) {
          return t = rt(t), t && Hu.test(t) ? t.replace(Fs, cl) : t;
        }
        var Dg = pe(function(t, n, e) {
          return t + (e ? " " : "") + n.toUpperCase();
        }), us = io("toUpperCase");
        function ru(t, n, e) {
          return t = rt(t), n = e ? r : n, n === r ? il(t) ? hl(t) : Yc(t) : t.match(n) || [];
        }
        var iu = X(function(t, n) {
          try {
            return Zt(t, r, n);
          } catch (e) {
            return is(e) ? e : new z(e);
          }
        }), Ng = An(function(t, n) {
          return en(n, function(e) {
            e = yn(e), xn(t, e, es(t[e], t));
          }), t;
        });
        function Wg(t) {
          var n = t == null ? 0 : t.length, e = W();
          return t = n ? dt(t, function(i) {
            if (typeof i[1] != "function")
              throw new rn(d);
            return [e(i[0]), i[1]];
          }) : [], X(function(i) {
            for (var o = -1; ++o < n; ) {
              var c = t[o];
              if (Zt(c[0], this, i))
                return Zt(c[1], this, i);
            }
          });
        }
        function Bg(t) {
          return lf(an(t, m));
        }
        function cs(t) {
          return function() {
            return t;
          };
        }
        function Ug(t, n) {
          return t == null || t !== t ? n : t;
        }
        var $g = ao(), qg = ao(!0);
        function Gt(t) {
          return t;
        }
        function ls(t) {
          return Da(typeof t == "function" ? t : an(t, m));
        }
        function Gg(t) {
          return Wa(an(t, m));
        }
        function zg(t, n) {
          return Ba(t, an(n, m));
        }
        var Hg = X(function(t, n) {
          return function(e) {
            return Le(e, t, n);
          };
        }), Kg = X(function(t, n) {
          return function(e) {
            return Le(t, e, n);
          };
        });
        function fs(t, n, e) {
          var i = It(n), o = gr(n, i);
          e == null && !(gt(n) && (o.length || !i.length)) && (e = n, n = t, t = this, o = gr(n, It(n)));
          var c = !(gt(e) && "chain" in e) || !!e.chain, h = En(t);
          return en(o, function(_) {
            var w = n[_];
            t[_] = w, h && (t.prototype[_] = function() {
              var S = this.__chain__;
              if (c || S) {
                var x = t(this.__wrapped__), A = x.__actions__ = Ut(this.__actions__);
                return A.push({ func: w, args: arguments, thisArg: t }), x.__chain__ = S, x;
              }
              return w.apply(t, On([this.value()], arguments));
            });
          }), t;
        }
        function Zg() {
          return At._ === this && (At._ = ml), this;
        }
        function hs() {
        }
        function Jg(t) {
          return t = Z(t), X(function(n) {
            return Ua(n, t);
          });
        }
        var Yg = Gi(dt), Xg = Gi(oa), Qg = Gi(di);
        function su(t) {
          return Xi(t) ? gi(yn(t)) : Af(t);
        }
        function Vg(t) {
          return function(n) {
            return t == null ? r : Qn(t, n);
          };
        }
        var jg = uo(), t0 = uo(!0);
        function ps() {
          return [];
        }
        function ds() {
          return !1;
        }
        function n0() {
          return {};
        }
        function e0() {
          return "";
        }
        function r0() {
          return !0;
        }
        function i0(t, n) {
          if (t = Z(t), t < 1 || t > Tn)
            return [];
          var e = k, i = Et(t, k);
          n = W(n), t -= k;
          for (var o = mi(i, n); ++e < t; )
            n(e);
          return o;
        }
        function s0(t) {
          return H(t) ? dt(t, yn) : Xt(t) ? [t] : Ut(xo(rt(t)));
        }
        function a0(t) {
          var n = ++_l;
          return rt(t) + n;
        }
        var o0 = Mr(function(t, n) {
          return t + n;
        }, 0), u0 = zi("ceil"), c0 = Mr(function(t, n) {
          return t / n;
        }, 1), l0 = zi("floor");
        function f0(t) {
          return t && t.length ? dr(t, Gt, Ei) : r;
        }
        function h0(t, n) {
          return t && t.length ? dr(t, W(n, 2), Ei) : r;
        }
        function p0(t) {
          return la(t, Gt);
        }
        function d0(t, n) {
          return la(t, W(n, 2));
        }
        function g0(t) {
          return t && t.length ? dr(t, Gt, Li) : r;
        }
        function _0(t, n) {
          return t && t.length ? dr(t, W(n, 2), Li) : r;
        }
        var v0 = Mr(function(t, n) {
          return t * n;
        }, 1), m0 = zi("round"), w0 = Mr(function(t, n) {
          return t - n;
        }, 0);
        function y0(t) {
          return t && t.length ? vi(t, Gt) : 0;
        }
        function M0(t, n) {
          return t && t.length ? vi(t, W(n, 2)) : 0;
        }
        return u.after = Gp, u.ary = Do, u.assign = Rd, u.assignIn = Xo, u.assignInWith = kr, u.assignWith = Fd, u.at = Td, u.before = No, u.bind = es, u.bindAll = Ng, u.bindKey = Wo, u.castArray = nd, u.chain = Lo, u.chunk = lh, u.compact = fh, u.concat = hh, u.cond = Wg, u.conforms = Bg, u.constant = cs, u.countBy = yp, u.create = Ld, u.curry = Bo, u.curryRight = Uo, u.debounce = $o, u.defaults = kd, u.defaultsDeep = Od, u.defer = zp, u.delay = Hp, u.difference = ph, u.differenceBy = dh, u.differenceWith = gh, u.drop = _h, u.dropRight = vh, u.dropRightWhile = mh, u.dropWhile = wh, u.fill = yh, u.filter = Cp, u.flatMap = xp, u.flatMapDeep = Ip, u.flatMapDepth = Ap, u.flatten = Eo, u.flattenDeep = Mh, u.flattenDepth = Ch, u.flip = Kp, u.flow = $g, u.flowRight = qg, u.fromPairs = bh, u.functions = qd, u.functionsIn = Gd, u.groupBy = Pp, u.initial = xh, u.intersection = Ih, u.intersectionBy = Ah, u.intersectionWith = Ph, u.invert = Hd, u.invertBy = Kd, u.invokeMap = Rp, u.iteratee = ls, u.keyBy = Fp, u.keys = It, u.keysIn = qt, u.map = Pr, u.mapKeys = Jd, u.mapValues = Yd, u.matches = Gg, u.matchesProperty = zg, u.memoize = Rr, u.merge = Xd, u.mergeWith = Qo, u.method = Hg, u.methodOf = Kg, u.mixin = fs, u.negate = Fr, u.nthArg = Jg, u.omit = Qd, u.omitBy = Vd, u.once = Zp, u.orderBy = Tp, u.over = Yg, u.overArgs = Jp, u.overEvery = Xg, u.overSome = Qg, u.partial = rs, u.partialRight = qo, u.partition = Lp, u.pick = jd, u.pickBy = Vo, u.property = su, u.propertyOf = Vg, u.pull = Th, u.pullAll = Fo, u.pullAllBy = Lh, u.pullAllWith = kh, u.pullAt = Oh, u.range = jg, u.rangeRight = t0, u.rearg = Yp, u.reject = Dp, u.remove = Dh, u.rest = Xp, u.reverse = ts, u.sampleSize = Wp, u.set = ng, u.setWith = eg, u.shuffle = Bp, u.slice = Nh, u.sortBy = qp, u.sortedUniq = zh, u.sortedUniqBy = Hh, u.split = xg, u.spread = Qp, u.tail = Kh, u.take = Zh, u.takeRight = Jh, u.takeRightWhile = Yh, u.takeWhile = Xh, u.tap = fp, u.throttle = Vp, u.thru = Ar, u.toArray = Zo, u.toPairs = jo, u.toPairsIn = tu, u.toPath = s0, u.toPlainObject = Yo, u.transform = rg, u.unary = jp, u.union = Qh, u.unionBy = Vh, u.unionWith = jh, u.uniq = tp, u.uniqBy = np, u.uniqWith = ep, u.unset = ig, u.unzip = ns, u.unzipWith = To, u.update = sg, u.updateWith = ag, u.values = _e, u.valuesIn = og, u.without = rp, u.words = ru, u.wrap = td, u.xor = ip, u.xorBy = sp, u.xorWith = ap, u.zip = op, u.zipObject = up, u.zipObjectDeep = cp, u.zipWith = lp, u.entries = jo, u.entriesIn = tu, u.extend = Xo, u.extendWith = kr, fs(u, u), u.add = o0, u.attempt = iu, u.camelCase = fg, u.capitalize = nu, u.ceil = u0, u.clamp = ug, u.clone = ed, u.cloneDeep = id, u.cloneDeepWith = sd, u.cloneWith = rd, u.conformsTo = ad, u.deburr = eu, u.defaultTo = Ug, u.divide = c0, u.endsWith = hg, u.eq = dn, u.escape = pg, u.escapeRegExp = dg, u.every = Mp, u.find = bp, u.findIndex = Ao, u.findKey = Dd, u.findLast = Sp, u.findLastIndex = Po, u.findLastKey = Nd, u.floor = l0, u.forEach = ko, u.forEachRight = Oo, u.forIn = Wd, u.forInRight = Bd, u.forOwn = Ud, u.forOwnRight = $d, u.get = as, u.gt = od, u.gte = ud, u.has = zd, u.hasIn = os, u.head = Ro, u.identity = Gt, u.includes = Ep, u.indexOf = Sh, u.inRange = cg, u.invoke = Zd, u.isArguments = te, u.isArray = H, u.isArrayBuffer = cd, u.isArrayLike = $t, u.isArrayLikeObject = wt, u.isBoolean = ld, u.isBuffer = qn, u.isDate = fd, u.isElement = hd, u.isEmpty = pd, u.isEqual = dd, u.isEqualWith = gd, u.isError = is, u.isFinite = _d, u.isFunction = En, u.isInteger = Go, u.isLength = Tr, u.isMap = zo, u.isMatch = vd, u.isMatchWith = md, u.isNaN = wd, u.isNative = yd, u.isNil = Cd, u.isNull = Md, u.isNumber = Ho, u.isObject = gt, u.isObjectLike = vt, u.isPlainObject = Be, u.isRegExp = ss, u.isSafeInteger = bd, u.isSet = Ko, u.isString = Lr, u.isSymbol = Xt, u.isTypedArray = ge, u.isUndefined = Sd, u.isWeakMap = xd, u.isWeakSet = Id, u.join = Eh, u.kebabCase = gg, u.last = un, u.lastIndexOf = Rh, u.lowerCase = _g, u.lowerFirst = vg, u.lt = Ad, u.lte = Pd, u.max = f0, u.maxBy = h0, u.mean = p0, u.meanBy = d0, u.min = g0, u.minBy = _0, u.stubArray = ps, u.stubFalse = ds, u.stubObject = n0, u.stubString = e0, u.stubTrue = r0, u.multiply = v0, u.nth = Fh, u.noConflict = Zg, u.noop = hs, u.now = Er, u.pad = mg, u.padEnd = wg, u.padStart = yg, u.parseInt = Mg, u.random = lg, u.reduce = kp, u.reduceRight = Op, u.repeat = Cg, u.replace = bg, u.result = tg, u.round = m0, u.runInContext = v, u.sample = Np, u.size = Up, u.snakeCase = Sg, u.some = $p, u.sortedIndex = Wh, u.sortedIndexBy = Bh, u.sortedIndexOf = Uh, u.sortedLastIndex = $h, u.sortedLastIndexBy = qh, u.sortedLastIndexOf = Gh, u.startCase = Ig, u.startsWith = Ag, u.subtract = w0, u.sum = y0, u.sumBy = M0, u.template = Pg, u.times = i0, u.toFinite = Rn, u.toInteger = Z, u.toLength = Jo, u.toLower = Eg, u.toNumber = cn, u.toSafeInteger = Ed, u.toString = rt, u.toUpper = Rg, u.trim = Fg, u.trimEnd = Tg, u.trimStart = Lg, u.truncate = kg, u.unescape = Og, u.uniqueId = a0, u.upperCase = Dg, u.upperFirst = us, u.each = ko, u.eachRight = Oo, u.first = Ro, fs(u, function() {
          var t = {};
          return mn(u, function(n, e) {
            it.call(u.prototype, e) || (t[e] = n);
          }), t;
        }(), { chain: !1 }), u.VERSION = a, en(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t) {
          u[t].placeholder = u;
        }), en(["drop", "take"], function(t, n) {
          j.prototype[t] = function(e) {
            e = e === r ? 1 : xt(Z(e), 0);
            var i = this.__filtered__ && !n ? new j(this) : this.clone();
            return i.__filtered__ ? i.__takeCount__ = Et(e, i.__takeCount__) : i.__views__.push({
              size: Et(e, k),
              type: t + (i.__dir__ < 0 ? "Right" : "")
            }), i;
          }, j.prototype[t + "Right"] = function(e) {
            return this.reverse()[t](e).reverse();
          };
        }), en(["filter", "map", "takeWhile"], function(t, n) {
          var e = n + 1, i = e == Ce || e == Zr;
          j.prototype[t] = function(o) {
            var c = this.clone();
            return c.__iteratees__.push({
              iteratee: W(o, 3),
              type: e
            }), c.__filtered__ = c.__filtered__ || i, c;
          };
        }), en(["head", "last"], function(t, n) {
          var e = "take" + (n ? "Right" : "");
          j.prototype[t] = function() {
            return this[e](1).value()[0];
          };
        }), en(["initial", "tail"], function(t, n) {
          var e = "drop" + (n ? "" : "Right");
          j.prototype[t] = function() {
            return this.__filtered__ ? new j(this) : this[e](1);
          };
        }), j.prototype.compact = function() {
          return this.filter(Gt);
        }, j.prototype.find = function(t) {
          return this.filter(t).head();
        }, j.prototype.findLast = function(t) {
          return this.reverse().find(t);
        }, j.prototype.invokeMap = X(function(t, n) {
          return typeof t == "function" ? new j(this) : this.map(function(e) {
            return Le(e, t, n);
          });
        }), j.prototype.reject = function(t) {
          return this.filter(Fr(W(t)));
        }, j.prototype.slice = function(t, n) {
          t = Z(t);
          var e = this;
          return e.__filtered__ && (t > 0 || n < 0) ? new j(e) : (t < 0 ? e = e.takeRight(-t) : t && (e = e.drop(t)), n !== r && (n = Z(n), e = n < 0 ? e.dropRight(-n) : e.take(n - t)), e);
        }, j.prototype.takeRightWhile = function(t) {
          return this.reverse().takeWhile(t).reverse();
        }, j.prototype.toArray = function() {
          return this.take(k);
        }, mn(j.prototype, function(t, n) {
          var e = /^(?:filter|find|map|reject)|While$/.test(n), i = /^(?:head|last)$/.test(n), o = u[i ? "take" + (n == "last" ? "Right" : "") : n], c = i || /^find/.test(n);
          o && (u.prototype[n] = function() {
            var h = this.__wrapped__, _ = i ? [1] : arguments, w = h instanceof j, S = _[0], x = w || H(h), A = function(V) {
              var tt = o.apply(u, On([V], _));
              return i && L ? tt[0] : tt;
            };
            x && e && typeof S == "function" && S.length != 1 && (w = x = !1);
            var L = this.__chain__, D = !!this.__actions__.length, B = c && !L, Y = w && !D;
            if (!c && x) {
              h = Y ? h : new j(this);
              var U = t.apply(h, _);
              return U.__actions__.push({ func: Ar, args: [A], thisArg: r }), new sn(U, L);
            }
            return B && Y ? t.apply(this, _) : (U = this.thru(A), B ? i ? U.value()[0] : U.value() : U);
          });
        }), en(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var n = je[t], e = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", i = /^(?:pop|shift)$/.test(t);
          u.prototype[t] = function() {
            var o = arguments;
            if (i && !this.__chain__) {
              var c = this.value();
              return n.apply(H(c) ? c : [], o);
            }
            return this[e](function(h) {
              return n.apply(H(h) ? h : [], o);
            });
          };
        }), mn(j.prototype, function(t, n) {
          var e = u[n];
          if (e) {
            var i = e.name + "";
            it.call(le, i) || (le[i] = []), le[i].push({ name: n, func: e });
          }
        }), le[yr(r, q).name] = [{
          name: "wrapper",
          func: r
        }], j.prototype.clone = kl, j.prototype.reverse = Ol, j.prototype.value = Dl, u.prototype.at = hp, u.prototype.chain = pp, u.prototype.commit = dp, u.prototype.next = gp, u.prototype.plant = vp, u.prototype.reverse = mp, u.prototype.toJSON = u.prototype.valueOf = u.prototype.value = wp, u.prototype.first = u.prototype.head, Ie && (u.prototype[Ie] = _p), u;
      }, oe = pl();
      Kn ? ((Kn.exports = oe)._ = oe, li._ = oe) : At._ = oe;
    }).call(T0);
  }($e, $e.exports)), $e.exports;
}
var Iu = L0();
const Q = /* @__PURE__ */ mu(Iu);
function Au(f, s) {
  const r = Q.findLast(s.terrain, (a) => we(a.percents[0] * s.dist, f.loc, 4));
  return r ? r.value / 100 + 1 : 1;
}
const k0 = [
  "altitude",
  "grade",
  "terrain",
  "heat",
  "dark",
  "fatigue",
  "strategy"
];
function Ps(f) {
  const s = new Mn().init(0);
  return f.forEach(({ factors: r, dist: a }) => {
    s.applyEach((l, p) => l + a * p, r);
  }), s.scaleEach(1 / Iu.sumBy(f, "dist")), s;
}
function O0(f, s) {
  let r = 0, a = 0;
  return f.forEach((l, p) => {
    const d = p === f.length - 1 ? s : f[p + 1].onset, g = l.type === "linear" ? l.value / 2 : l.value;
    a += (r + g) * (d - l.onset), r += l.value;
  }), a / s;
}
function D0(f) {
  return f < 30 ? 2 : f < 60 ? 5 : f < 90 ? 10 : f < 120 ? 15 : 20;
}
function N0(f, s, r) {
  let a = -O0(s, r);
  return s.forEach((l, p) => {
    if (f >= l.onset) {
      if (l.type === "step")
        a += l.value;
      else if (l.type === "linear") {
        const d = p === s.length - 1 ? r : s[p + 1].onset;
        f > d ? a += l.value : a += l.value * (f - l.onset) / (d - l.onset);
      }
    }
  }), a;
}
class Pu {
  constructor(s, r) {
    P(this, "plan");
    P(this, "values");
    this.plan = s, this.values = r ? Q.cloneDeep(r) : [{ onset: 0, value: D0(this.plan.course.dist), type: "linear" }];
  }
  /**
   * Returns strategy factor at location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns  The strategy factor at input location.
   */
  at(s) {
    return 1 + N0(s, this.values, this.plan.course.dist) / 100;
  }
  addValue(s) {
    const r = this.values.findIndex((a) => a.onset >= s.onset);
    r >= 0 ? this.values.splice(r, 0, s) : this.values.push(s);
  }
}
function xs(f, s) {
  return s === void 0 ? f : (f - 1) * s + 1;
}
function Es(f, s) {
  f.factors || (f.factors = new Mn()), Object.assign(f.factors, {
    grade: Su(f.grade),
    altitude: wu(f.alt),
    terrain: Au(f, s)
  });
}
function qe(f, s) {
  var r, a;
  if (f.factors || (f.factors = new Mn()), Es(f, s.course), s) {
    if (f.factors === void 0) throw new Error("no factors");
    f.factors.strategy = s.strategy.at(f.loc), Object.assign(f.factors, {
      heat: s.heatModel ? xu(f, s.heatModel) : 1,
      dark: s.event.sun ? bu(f.tod, f.factors.terrain, s.event.sun) : 1
    });
  }
  f.factors.altitude = xs(f.factors.altitude, (r = s.scales) == null ? void 0 : r.altitude), f.factors.dark = xs(f.factors.dark, (a = s.scales) == null ? void 0 : a.dark);
}
const s_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Factors: Mn,
  Strategy: Pu,
  applyScale: xs,
  factorKeys: ve,
  generateCourseFactors: Es,
  generatePlanFactors: qe,
  getAltitudeFactor: wu,
  getDarkFactor: bu,
  getGradeFactor: Su,
  getHeatFactor: xu,
  getTerrainFactor: Au,
  rollup: Ps,
  typeList: k0
}, Symbol.toStringTag, { value: "Module" }));
var ms = {}, hu;
function W0() {
  return hu || (hu = 1, function(f) {
    f.parseDMS = function(r) {
      if (typeof l == "object") throw new TypeError("geo.parseDMS - dmsStr is [DOM?] object");
      if (typeof r == "number" && isFinite(r)) return Number(r);
      var a = String(r).trim().replace(/^-/, "").replace(/[NSEW]$/i, "").split(/[^0-9.,]+/);
      if (a[a.length - 1] == "" && a.splice(a.length - 1), a == "") return NaN;
      switch (a.length) {
        case 3:
          var l = a[0] / 1 + a[1] / 60 + a[2] / 3600;
          break;
        case 2:
          var l = a[0] / 1 + a[1] / 60;
          break;
        case 1:
          var l = a[0];
          break;
        default:
          return NaN;
      }
      return /^-|[WS]$/i.test(r.trim()) && (l = -l), Number(l);
    }, f.toDMS = function(r, a, l) {
      if (typeof r == "object") throw new TypeError("geo.toDMS - deg is [DOM?] object");
      if (isNaN(r)) return null;
      if (typeof a > "u" && (a = "dms"), typeof l > "u")
        switch (a) {
          case "d":
            l = 4;
            break;
          case "dm":
            l = 2;
            break;
          case "dms":
            l = 0;
            break;
          default:
            a = "dms", l = 0;
        }
      switch (r = Math.abs(r), a) {
        case "d":
          g = r.toFixed(l), g < 100 && (g = "0" + g), g < 10 && (g = "0" + g), dms = g + "°";
          break;
        case "dm":
          var p = (r * 60).toFixed(l), g = Math.floor(p / 60), y = (p % 60).toFixed(l);
          g < 100 && (g = "0" + g), g < 10 && (g = "0" + g), y < 10 && (y = "0" + y), dms = g + "°" + y + "′";
          break;
        case "dms":
          var d = (r * 3600).toFixed(l), g = Math.floor(d / 3600), y = Math.floor(d / 60) % 60, M = (d % 60).toFixed(l);
          g < 100 && (g = "0" + g), g < 10 && (g = "0" + g), y < 10 && (y = "0" + y), M < 10 && (M = "0" + M), dms = g + "°" + y + "′" + M + "″";
          break;
      }
      return dms;
    }, f.toLat = function(r, a, l) {
      var p = f.toDMS(r, a, l);
      return p == null ? "." : p.slice(1) + (r < 0 ? "S" : "N");
    }, f.toLon = function(r, a, l) {
      var p = f.toDMS(r, a, l);
      return p == null ? "." : p + (r < 0 ? "W" : "E");
    }, f.toBrng = function(r, a, l) {
      r = (Number(r) + 360) % 360;
      var p = f.toDMS(r, a, l);
      return p == null ? "." : p.replace("360", "0");
    };
    var s = 6371;
    f.latlon = function(r, a) {
      this.lat = typeof r == "number" ? r : typeof r == "string" && r.trim() != "" ? +r : NaN, this.lng = typeof a == "number" ? a : typeof a == "string" && a.trim() != "" ? +a : NaN;
    }, f.latlon.prototype.distanceTo = function(r, a) {
      typeof a > "u" && (a = 4);
      var l = this.distanceRadTo(r), p = s * l;
      return p.toPrecisionFixed(a);
    }, f.latlon.prototype.distanceRadTo = function(r) {
      var a = this.lat.toRad(), l = this.lng.toRad(), p = r.lat.toRad(), d = r.lng.toRad(), g = p - a, y = d - l, M = Math.sin(g / 2) * Math.sin(g / 2) + Math.cos(a) * Math.cos(p) * Math.sin(y / 2) * Math.sin(y / 2), I = 2 * Math.atan2(Math.sqrt(M), Math.sqrt(1 - M));
      return I;
    }, f.latlon.prototype.bearingTo = function(r) {
      var a = this.bearingRadTo(r);
      return (a.toDeg() + 360) % 360;
    }, f.latlon.prototype.bearingRadTo = function(r) {
      var a = this.lat.toRad(), l = r.lat.toRad(), p = (r.lng - this.lng).toRad(), d = Math.cos(a) * Math.sin(l) - Math.sin(a) * Math.cos(l) * Math.cos(p), g = Math.cos(l) * Math.sin(p), y = Math.atan2(g, d);
      return y;
    }, f.latlon.prototype.finalBearingTo = function(r) {
      var a = r.lat.toRad(), l = this.lat.toRad(), p = (this.lng - r.lng).toRad(), d = Math.sin(p) * Math.cos(l), g = Math.cos(a) * Math.sin(l) - Math.sin(a) * Math.cos(l) * Math.cos(p), y = Math.atan2(d, g);
      return (y.toDeg() + 180) % 360;
    }, f.latlon.prototype.midpointTo = function(r) {
      var a = this.lat.toRad(), l = r.lat.toRad(), p = (r.lng - this.lng).toRad(), d = Math.cos(l) * Math.cos(p), g = Math.cos(l) * Math.sin(p), y = this.lng.toRad(), M = Math.atan2(Math.sin(a) + Math.sin(l), Math.sqrt((Math.cos(a) + d) * (Math.cos(a) + d) + g * g)), I = y + Math.atan2(g, Math.cos(a) + d);
      return I = (I + 3 * Math.PI) % (2 * Math.PI) - Math.PI, new f.latlon(M.toDeg(), I.toDeg());
    }, f.midpoint = function(r) {
      var a = 0, l = 0, p = 0;
      for (var d in r) {
        var g = r[d], y = g.lat * Math.PI / 180, M = g.lng * Math.PI / 180, I = Math.cos(y) * Math.cos(M), m = Math.cos(y) * Math.sin(M), R = Math.sin(y);
        a += I, l += m, p += R;
      }
      a = a / r.length, l = l / r.length, p = p / r.length;
      var T = Math.atan2(l, a), F = Math.sqrt(a * a + l * l), E = Math.atan2(p, F);
      return new f.latlon(E * 180 / Math.PI, T * 180 / Math.PI);
    }, f.latlon.prototype.interpolate = function(r, a) {
      var l = this.distanceRadTo(r), p = this.bearingRadTo(r), d = this.lat.toRad(), g = this.lng.toRad();
      r.lat.toRad(), r.lng.toRad();
      for (var y = Math.sin(d), M = Math.cos(d), I = [], m = 0; m < a; m++) {
        var R = 1 / (a - 1) * m, T = l * R, F = Math.sin(T), E = Math.cos(T), N = Math.asin(y * E + M * F * Math.cos(p)), q = g + Math.atan2(Math.sin(p) * F * M, E - y * Math.sin(N)), K = N.toDeg(), J = q.toDeg();
        for (K > 90 && (K = 90), K < -90 && (K = -90); J > 180; ) J -= 360;
        for (; J <= -180; ) J += 360;
        I.push(new f.latlon(K, J));
      }
      return I;
    }, f.latlon.prototype.destinationPoint = function(r, a) {
      a = typeof a == "number" ? a : typeof a == "string" && a.trim() != "" ? +a : NaN, a = a / s, r = r.toRad();
      var l = this.lat.toRad(), p = this.lng.toRad(), d = Math.asin(Math.sin(l) * Math.cos(a) + Math.cos(l) * Math.sin(a) * Math.cos(r)), g = p + Math.atan2(
        Math.sin(r) * Math.sin(a) * Math.cos(l),
        Math.cos(a) - Math.sin(l) * Math.sin(d)
      );
      return g = (g + 3 * Math.PI) % (2 * Math.PI) - Math.PI, new f.latlon(d.toDeg(), g.toDeg());
    }, f.latlon.intersection = function(r, a, l, p) {
      a = typeof a == "number" ? a : typeof a == "string" && trim(a) != "" ? +a : NaN, p = typeof p == "number" ? p : typeof p == "string" && trim(p) != "" ? +p : NaN;
      var d = r.lat.toRad(), g = r.lng.toRad(), y = l.lat.toRad(), M = l.lng.toRad(), I = a.toRad(), m = p.toRad(), R = y - d, T = M - g, F = 2 * Math.asin(Math.sqrt(Math.sin(R / 2) * Math.sin(R / 2) + Math.cos(d) * Math.cos(y) * Math.sin(T / 2) * Math.sin(T / 2)));
      if (F == 0) return null;
      var E = Math.acos((Math.sin(y) - Math.sin(d) * Math.cos(F)) / (Math.sin(F) * Math.cos(d)));
      isNaN(E) && (E = 0);
      var N = Math.acos((Math.sin(d) - Math.sin(y) * Math.cos(F)) / (Math.sin(F) * Math.cos(y)));
      if (Math.sin(M - g) > 0)
        var q = E, K = 2 * Math.PI - N;
      else
        q = 2 * Math.PI - E, K = N;
      var J = (I - q + Math.PI) % (2 * Math.PI) - Math.PI, st = (K - m + Math.PI) % (2 * Math.PI) - Math.PI;
      if (Math.sin(J) == 0 && Math.sin(st) == 0 || Math.sin(J) * Math.sin(st) < 0) return null;
      var mt = Math.acos(-Math.cos(J) * Math.cos(st) + Math.sin(J) * Math.sin(st) * Math.cos(F)), zt = Math.atan2(
        Math.sin(F) * Math.sin(J) * Math.sin(st),
        Math.cos(st) + Math.cos(J) * Math.cos(mt)
      ), bt = Math.asin(Math.sin(d) * Math.cos(zt) + Math.cos(d) * Math.sin(zt) * Math.cos(I)), jt = Math.atan2(
        Math.sin(I) * Math.sin(zt) * Math.cos(d),
        Math.cos(zt) - Math.sin(d) * Math.sin(bt)
      ), Ht = g + jt;
      return Ht = (Ht + 3 * Math.PI) % (2 * Math.PI) - Math.PI, new f.latlon(bt.toDeg(), Ht.toDeg());
    }, f.latlon.prototype.rhumbDistanceTo = function(r) {
      var a = s, l = this.lat.toRad(), p = r.lat.toRad(), d = (r.lat - this.lat).toRad(), g = Math.abs(r.lng - this.lng).toRad(), y = Math.log(Math.tan(p / 2 + Math.PI / 4) / Math.tan(l / 2 + Math.PI / 4)), M = isFinite(d / y) ? d / y : Math.cos(l);
      Math.abs(g) > Math.PI && (g = g > 0 ? -(2 * Math.PI - g) : 2 * Math.PI + g);
      var I = Math.sqrt(d * d + M * M * g * g) * a;
      return I.toPrecisionFixed(4);
    }, f.latlon.prototype.rhumbBearingTo = function(r) {
      var a = this.lat.toRad(), l = r.lat.toRad(), p = (r.lng - this.lng).toRad(), d = Math.log(Math.tan(l / 2 + Math.PI / 4) / Math.tan(a / 2 + Math.PI / 4));
      Math.abs(p) > Math.PI && (p = p > 0 ? -(2 * Math.PI - p) : 2 * Math.PI + p);
      var g = Math.atan2(p, d);
      return (g.toDeg() + 360) % 360;
    }, f.latlon.prototype.rhumbDestinationPoint = function(r, a) {
      var l = s, p = parseFloat(a) / l, d = this.lat.toRad(), g = this.lng.toRad();
      r = r.toRad();
      var y = p * Math.cos(r);
      Math.abs(y) < 1e-10 && (y = 0);
      var M = d + y, I = Math.log(Math.tan(M / 2 + Math.PI / 4) / Math.tan(d / 2 + Math.PI / 4)), m = isFinite(y / I) ? y / I : Math.cos(d), R = p * Math.sin(r) / m;
      Math.abs(M) > Math.PI / 2 && (M = M > 0 ? Math.PI - M : -Math.PI - M);
      var T = (g + R + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return new f.latlon(M.toDeg(), T.toDeg());
    }, f.latlon.prototype.rhumbMidpointTo = function(r) {
      var a = this.lat.toRad(), l = this.lng.toRad(), p = r.lat.toRad(), d = r.lng.toRad();
      Math.abs(d - l) > Math.PI && (l += 2 * Math.PI);
      var g = (a + p) / 2, y = Math.tan(Math.PI / 4 + a / 2), M = Math.tan(Math.PI / 4 + p / 2), I = Math.tan(Math.PI / 4 + g / 2), m = ((d - l) * Math.log(I) + l * Math.log(M) - d * Math.log(y)) / Math.log(M / y);
      return isFinite(m) || (m = (l + d) / 2), m = (m + 3 * Math.PI) % (2 * Math.PI) - Math.PI, new f.latlon(g.toDeg(), m.toDeg());
    }, f.latlon.prototype.lat = function(r, a) {
      return typeof r > "u" ? this.lat : f.toLat(this.lat, r, a);
    }, f.latlon.prototype.lon = function(r, a) {
      return typeof r > "u" ? this.lng : f.toLon(this.lng, r, a);
    }, f.latlon.prototype.toString = function(r, a) {
      return typeof r > "u" && (r = "dms"), f.toLat(this.lat, r, a) + ", " + f.toLon(this.lng, r, a);
    }, typeof Number.prototype.toRad > "u" && (Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    }), typeof Number.prototype.toDeg > "u" && (Number.prototype.toDeg = function() {
      return this * 180 / Math.PI;
    }), typeof Number.prototype.toPrecisionFixed > "u" && (Number.prototype.toPrecisionFixed = function(r) {
      var a = this.toPrecision(r);
      return a = a.replace(/(.+)e\+(.+)/, function(l, p, d) {
        p = p.replace(/\./, "");
        for (var g = p.length - 1; d-- > g; ) p = p + "0";
        return p;
      }), a = a.replace(/(.+)e-(.+)/, function(l, p, d) {
        for (p = p.replace(/\./, ""); d-- > 1; ) p = "0" + p;
        return "0." + p;
      }), a;
    }), typeof String.prototype.trim > "u" && (String.prototype.trim = function() {
      return String(this).replace(/^\s\s*/, "").replace(/\s\s*$/, "");
    });
  }(ms)), ms;
}
var B0 = W0();
function U0(f) {
  return "latlon" in f;
}
class Rs {
  constructor(s) {
    P(this, "source");
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
  get latlon() {
    return U0(this.source) ? this.source.latlon : new B0.latlon(this.lat, this.lon);
  }
  get lon() {
    return this.source.lon;
  }
  set lon(s) {
    this.source.lon = s;
  }
}
class zr extends Rs {
  constructor(r, a, l) {
    super(r);
    P(this, "_trackData");
    this._trackData = { grade: l, loc: a };
  }
  get grade() {
    return this._trackData.grade;
  }
  get loc() {
    return this._trackData.loc;
  }
}
function ws(f) {
  return "_course" in f;
}
class Ur extends zr {
  constructor(r, a, l) {
    super(a, a.loc, a.grade);
    P(this, "_course");
    P(this, "factors", new Mn());
    P(this, "_interpolated");
    P(this, "loop");
    P(this, "source");
    this._course = r, this.loop = l, this.source = a;
  }
  get grade() {
    return ws(this.source) ? this.source.grade : this.source.grade * (this.source.grade > 0 ? this._course.gainScale : this._course.lossScale);
  }
  get interpolated() {
    return (ws(this.source) ? this.source.interpolated : this._interpolated) || !1;
  }
  set interpolated(r) {
    this._interpolated = r;
  }
  get loc() {
    if (ws(this.source)) return this.source.loc;
    let r = this.source.loc * this._course.distScale;
    return this.loop && (r += this._course.loopDist * this.loop), r;
  }
}
function $r(f, s) {
  const r = f.filter((l) => l > 0 && qr(l, s, 4));
  return r.unshift(0), r.map((l, p) => ({ start: l, end: r[p + 1] || s }));
}
function Eu(f) {
  switch (f) {
    case "kilometers":
      return 1;
    case "miles":
      return 0.621371;
    default:
      throw new Error("Invalid distance unit");
  }
}
function Nr(f) {
  return typeof f == "number" && !isNaN(f);
}
function $0(f, s, r) {
  f = [...f], s.interpolated && f.splice(f.findIndex((p) => p.loc > s.loc) - 1, 0, s), r.interpolated && f.splice(f.findIndex((p) => p.loc > r.loc) - 1, 0, r);
  const a = f.filter(
    (p, d) => d >= f.findIndex((g) => g === s) && d <= f.findIndex((g) => g === r)
  ), l = a.map((p, d) => ({
    factors: p.factors,
    dist: d === a.length - 1 ? 0 : a[d + 1].loc - a[d].loc
  }));
  return l.pop(), Ps(l);
}
class Ru {
  constructor(s) {
    P(this, "point1");
    P(this, "point2");
    P(this, "gain");
    P(this, "loss");
    P(this, "grade");
    P(this, "waypoint");
    P(this, "_name");
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
class Fu extends Ru {
  constructor(r, a) {
    super(a);
    P(this, "_course");
    P(this, "point1");
    P(this, "point2");
    this._course = r, this.point1 = a.point1, this.point2 = a.point2;
  }
}
class Tu extends Ru {
  constructor(r, a) {
    super(a);
    P(this, "_plan");
    P(this, "point1");
    P(this, "point2");
    P(this, "_factors");
    this._plan = r, this.point1 = a.point1, this.point2 = a.point2;
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
    return this._factors || (this._factors = $0(this._plan.points, this.point1, this.point2));
  }
}
const ys = Hn("CourseSplits");
class q0 {
  constructor(s) {
    P(this, "_segments");
    P(this, "_miles");
    P(this, "_kilometers");
    P(this, "course");
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
    ys("createSegments");
    const s = this.course.waypoints, r = this.calcSegments(
      $r(
        s.map((a) => a.loc),
        this.course.dist
      )
    );
    if (!r.length) throw new Error("createSegments result is empty");
    return r.forEach((a, l) => {
      a.waypoint = s[l + 1];
    }), r;
  }
  createSplits(s) {
    ys(`createSplits:${s}`);
    const r = Eu(s), a = Q.range(this.course.dist * r).map((p) => p / r);
    this.course.dist - a[a.length - 1] > 1e-4 && a.push(this.course.dist);
    const l = this.calcSegments($r(a, this.course.dist));
    if (!l.length) throw new Error("createSplits result is empty");
    return l;
  }
  calcSegments(s) {
    var R;
    ys.extend("calcSegments")("exec");
    const a = this.course, l = a.points, p = [], d = [];
    let g, y, M = a.points[0], I;
    for (g = 0, y = s.length; g < y; g++) {
      const T = s[g];
      I && ye((R = s[g - 1]) == null ? void 0 : R.end, T.start, 4) ? M = I : M = a.getPoint(T.start), I = a.getPoint(T.end);
      const F = T.end - T.start, E = new Fu(this.course, {
        gain: 0,
        loss: 0,
        grade: F > 0 ? (I.alt - M.alt) / F / 10 * (I.alt - M.alt > 0 ? a.gainScale : a.lossScale) : 0,
        point1: M,
        point2: I
      }), N = new Mn().init(0);
      p.push(E), d.push(N);
    }
    const m = (T, F, E, N) => {
      const q = E.alt - F.alt;
      T[q > 0 ? "gain" : "loss"] += q * (q > 0 ? a.gainScale : a.lossScale), Es(F, a);
      const K = E.loc - F.loc;
      N.applyEach((J, st) => J + st * K, F.factors);
    };
    g = 1;
    for (let T = 0; T < p.length; T++) {
      const F = p[T], E = d[T];
      for (; we(l[g].loc, F.point1.loc, 4); ) g++;
      let N = F.point1;
      for (; g < l.length && we(l[g].loc, F.point2.loc, 4); ) {
        const q = l[g];
        m(F, N, q, E), N = q, g++;
      }
      m(F, N, F.point2, E);
    }
    return p;
  }
}
function Lu(f, s, r) {
  if (f.loc > s.loc && r > f.loc || s.loc > f.loc && r > s.loc)
    throw new Error("Input location must be between points");
  const a = Math.abs(f.loc - r), l = f.latlon.bearingTo(s.latlon), { lat: p, lng: d } = f.latlon.destinationPoint(l, a), g = f.grade, y = me(f.loc, s.loc, f.alt, s.alt, r);
  return new zr({ lat: p, lon: d, alt: y }, r, g);
}
class Is {
  constructor(s, r = 1) {
    P(this, "_data");
    P(this, "loop");
    P(this, "site");
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
    if (!Q.isNumber(s)) throw new Error("Wrong format for Waypoint.loc");
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
    return (r = (s = this.site.cutoffs) == null ? void 0 : s.find((a) => a.loop === this.loop)) == null ? void 0 : r.time;
  }
}
const pu = Hn("models:Waypoint");
class Br {
  constructor(s, r) {
    /**
     * internal cache object
     * gets deleted and regenerated when version changes
     */
    P(this, "_cache", {});
    /**
     * internal data object
     */
    P(this, "_data");
    P(this, "course");
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
    return "waypoints" in this._cache ? this._cache.waypoints : (pu(`generating waypoints array: ${this.name}`), this.isFinish ? this._cache.waypoints = [new Is(this, this.course.loops)] : this._cache.waypoints = Q.range(this.course.loops).map((s) => new Is(this, s + 1)), this._cache.waypoints);
  }
  refreshLLA() {
    pu("refreshLLA");
    let s, r, a;
    this.isStart ? { lat: s, lon: r, alt: a } = this.course.track.points[0] : this.isFinish ? { lat: s, lon: r, alt: a } = this.course.track.points[this.course.track.points.length - 1] : { lat: s, lon: r, alt: a } = this.course.track.getLLA(this.percent * this.course.track.dist), this._cache.lat = s, this._cache.lon = r, this._cache.alt = a;
  }
}
const Ue = Hn("models:Course"), ku = [
  { type: "paved", value: 0 },
  { type: "dirt road", value: 4 },
  { type: "doubletrack", value: 8 },
  { type: "singletrack", value: 15 },
  { type: "technical", value: 30 }
];
class G0 {
  constructor(s, r) {
    P(this, "_cache", {});
    /**
     * Course data
     */
    P(this, "_data");
    /**
     * Track object
     */
    P(this, "track");
    /**
     * Version of course update (non-trivial changes that affect pacing)
     */
    P(this, "version", 0);
    Ue("constructor"), this.track = s, this._data = r, this.version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  /**
   * Course cutoffs
   */
  get cutoffs() {
    return "cutoffs" in this.cache ? this.cache.cutoffs : (this.cache.cutoffs = this.waypoints.filter((s) => s.cutoff).map((s) => new Ou(s)), this.cache.cutoffs);
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
    Ue("generating points array"), this.cache.points = new Array(this.track.points.length * this.loops);
    for (let s = 0; s < this.loops; s++)
      for (let r = 0; r < this.track.points.length; r++)
        this.points[r + s * this.track.points.length] = new Ur(
          this,
          this.track.points[r],
          s
        );
    return this.cache.points;
  }
  get sites() {
    var s;
    if ("sites" in this.cache) return this.cache.sites;
    if (this.cache.sites = ((s = this._data.sites) == null ? void 0 : s.map((r) => new Br(this, r))) || [
      new Br(this, {
        id: String(Q.random(1e4, 2e4)),
        name: "Start",
        isStart: !0,
        percent: 0
      }),
      new Br(this, {
        id: String(Q.random(3e4, 4e4)),
        name: "Finish",
        isFinish: !0,
        percent: 1
      })
    ], this.cache.sites.length < 2 || this.cache.sites.filter((r) => r.isStart).length !== 1 || this.cache.sites.filter((r) => r.isFinish).length !== 1)
      throw new Error("Course must have at least a start and finish");
    return this.cache.sites;
  }
  get splits() {
    return "splits" in this.cache ? this.cache.splits : (this.cache.splits = new q0(this), this.cache.splits);
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    Ue("stats:calculate");
    const s = this.track.points.map((d) => d.alt), r = this.track.points.map((d) => d.grade), a = this.terrain.map((d) => d.value / 100 + 1), l = {
      altitude: {
        avg: Q.sum(
          this.track.points.map((d, g) => {
            var y;
            return d.alt * (d.loc - (((y = this.track.points[g - 1]) == null ? void 0 : y.loc) || 0));
          })
        ) / this.track.dist,
        max: Q.max(s) || 0,
        min: Q.min(s) || 0
      },
      grade: {
        avg: (this.track.points[this.track.points.length - 1].alt - this.track.points[0].alt) / this.track.dist / 10,
        max: Q.max(r) || 0,
        min: Q.min(r) || 0
      },
      terrain: {
        avg: (Q.sumBy(this.terrain, (d) => (d.percents[1] - d.percents[0]) * this.dist * d.value) / this.dist + 100) / 100,
        max: Q.max(a) || 0,
        min: Q.min(a) || 0,
        maxDist: 0,
        minDist: 0
      }
    }, p = (d) => this.terrain.reduce(
      (g, y) => y.value / 100 + 1 === d ? g + (y.percents[1] - y.percents[0]) * this.dist : g,
      0
    );
    return Object.assign(l.terrain, {
      maxDist: p(l.terrain.max),
      minDist: p(l.terrain.min)
    }), this.cache.stats = l, l;
  }
  get terrain() {
    if ("terrain" in this.cache) return this.cache.terrain;
    if (this._data.terrain) {
      const s = [...this._data.terrain];
      s.sort((r, a) => r.percent - a.percent), this.cache.terrain = s.map((r, a) => {
        var g, y;
        const l = Q.isNumber(r.value) ? r.value : Q.isString(r.value) ? ((g = ku.find((M) => M.type === r.value)) == null ? void 0 : g.value) || 0 : r.value.value, p = typeof r == "string" ? r : Q.isObject(r.value) ? r.value.type : void 0;
        return {
          value: l,
          type: p,
          percents: [r.percent, ((y = s[a + 1]) == null ? void 0 : y.percent) || 1]
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
    return this.sites.forEach((a) => {
      s.push(...a.waypoints);
    }), s = s.sort((a, l) => a.loc - l.loc), this.cache.waypoints = s, this.cache.waypoints;
  }
  update(s) {
    Ue("update"), Object.assign(this._data, s), this.version++;
  }
  /**
   * Finds or creates a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns The CoursePoint at input location.
   */
  getPoint(s) {
    const r = this.points.findIndex((y) => Gr(y.loc, s, 4)), a = this.points[r];
    if (ye(a.loc, s, 4)) return a;
    Ue(`getPoint: creating new CoursePoint at ${s}`);
    const l = r - 1, p = this.points[l], d = Lu(
      p.source,
      a.source,
      s % this.loopDist / this.distScale
    ), g = new Ur(this, d, Math.floor(s / this.loopDist));
    return g.interpolated = !0, g;
  }
  locationsToBreaks(s) {
    const r = s.filter((l) => l > 0 && qr(l, this.dist, 4));
    return r.unshift(0), r.map((l, p) => ({ start: l, end: r[p + 1] || this.dist }));
  }
}
class Ou {
  constructor(s) {
    P(this, "waypoint");
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
var Ms = { exports: {} }, du;
function z0() {
  return du || (du = 1, function(f, s) {
    (function() {
      var r = Math.PI, a = Math.sin, l = Math.cos, p = Math.tan, d = Math.asin, g = Math.atan2, y = Math.acos, M = r / 180, I = 1e3 * 60 * 60 * 24, m = 2440588, R = 2451545;
      function T(k) {
        return k.valueOf() / I - 0.5 + m;
      }
      function F(k) {
        return new Date((k + 0.5 - m) * I);
      }
      function E(k) {
        return T(k) - R;
      }
      var N = M * 23.4397;
      function q(k, $) {
        return g(a(k) * l(N) - p($) * a(N), l(k));
      }
      function K(k, $) {
        return d(a($) * l(N) + l($) * a(N) * a(k));
      }
      function J(k, $, G) {
        return g(a(k), l(k) * a($) - p(G) * l($));
      }
      function st(k, $, G) {
        return d(a($) * a(G) + l($) * l(G) * l(k));
      }
      function mt(k, $) {
        return M * (280.16 + 360.9856235 * k) - $;
      }
      function zt(k) {
        return k < 0 && (k = 0), 2967e-7 / Math.tan(k + 312536e-8 / (k + 0.08901179));
      }
      function bt(k) {
        return M * (357.5291 + 0.98560028 * k);
      }
      function jt(k) {
        var $ = M * (1.9148 * a(k) + 0.02 * a(2 * k) + 3e-4 * a(3 * k)), G = M * 102.9372;
        return k + $ + G + r;
      }
      function Ht(k) {
        var $ = bt(k), G = jt($);
        return {
          dec: K(G, 0),
          ra: q(G, 0)
        };
      }
      var Ft = {};
      Ft.getPosition = function(k, $, G) {
        var ft = M * -G, nt = M * $, ht = E(k), ot = Ht(ht), ct = mt(ht, ft) - ot.ra;
        return {
          azimuth: J(ct, nt, ot.dec),
          altitude: st(ct, nt, ot.dec)
        };
      };
      var Me = Ft.times = [
        [-0.833, "sunrise", "sunset"],
        [-0.3, "sunriseEnd", "sunsetStart"],
        [-6, "dawn", "dusk"],
        [-12, "nauticalDawn", "nauticalDusk"],
        [-18, "nightEnd", "night"],
        [6, "goldenHourEnd", "goldenHour"]
      ];
      Ft.addTime = function(k, $, G) {
        Me.push([k, $, G]);
      };
      var Ge = 9e-4;
      function Kr(k, $) {
        return Math.round(k - Ge - $ / (2 * r));
      }
      function Ce(k, $, G) {
        return Ge + (k + $) / (2 * r) + G;
      }
      function ze(k, $, G) {
        return R + k + 53e-4 * a($) - 69e-4 * a(2 * G);
      }
      function Zr(k, $, G) {
        return y((a(k) - a($) * a(G)) / (l($) * l(G)));
      }
      function ne(k) {
        return -2.076 * Math.sqrt(k) / 60;
      }
      function Tn(k, $, G, ft, nt, ht, ot) {
        var ct = Zr(k, G, ft), Mt = Ce(ct, $, nt);
        return ze(Mt, ht, ot);
      }
      Ft.getTimes = function(k, $, G, ft) {
        ft = ft || 0;
        var nt = M * -G, ht = M * $, ot = ne(ft), ct = E(k), Mt = Kr(ct, nt), Kt = Ce(0, nt, Mt), Tt = bt(Kt), Wt = jt(Tt), _n = K(Wt, 0), _t = ze(Kt, Tt, Wt), Lt, Ln, Ct, Bt, fn, tn, pt = {
          solarNoon: F(_t),
          nadir: F(_t - 0.5)
        };
        for (Lt = 0, Ln = Me.length; Lt < Ln; Lt += 1)
          Ct = Me[Lt], Bt = (Ct[0] + ot) * M, fn = Tn(Bt, nt, ht, _n, Mt, Tt, Wt), tn = _t - (fn - _t), pt[Ct[1]] = F(tn), pt[Ct[2]] = F(fn);
        return pt;
      };
      function He(k) {
        var $ = M * (218.316 + 13.176396 * k), G = M * (134.963 + 13.064993 * k), ft = M * (93.272 + 13.22935 * k), nt = $ + M * 6.289 * a(G), ht = M * 5.128 * a(ft), ot = 385001 - 20905 * l(G);
        return {
          ra: q(nt, ht),
          dec: K(nt, ht),
          dist: ot
        };
      }
      Ft.getMoonPosition = function(k, $, G) {
        var ft = M * -G, nt = M * $, ht = E(k), ot = He(ht), ct = mt(ht, ft) - ot.ra, Mt = st(ct, nt, ot.dec), Kt = g(a(ct), p(nt) * l(ot.dec) - a(ot.dec) * l(ct));
        return Mt = Mt + zt(Mt), {
          azimuth: J(ct, nt, ot.dec),
          altitude: Mt,
          distance: ot.dist,
          parallacticAngle: Kt
        };
      }, Ft.getMoonIllumination = function(k) {
        var $ = E(k || /* @__PURE__ */ new Date()), G = Ht($), ft = He($), nt = 149598e3, ht = y(a(G.dec) * a(ft.dec) + l(G.dec) * l(ft.dec) * l(G.ra - ft.ra)), ot = g(nt * a(ht), ft.dist - nt * l(ht)), ct = g(l(G.dec) * a(G.ra - ft.ra), a(G.dec) * l(ft.dec) - l(G.dec) * a(ft.dec) * l(G.ra - ft.ra));
        return {
          fraction: (1 + l(ot)) / 2,
          phase: 0.5 + 0.5 * ot * (ct < 0 ? -1 : 1) / Math.PI,
          angle: ct
        };
      };
      function Cn(k, $) {
        return new Date(k.valueOf() + $ * I / 24);
      }
      Ft.getMoonTimes = function(k, $, G, ft) {
        var nt = new Date(k);
        ft ? nt.setUTCHours(0, 0, 0, 0) : nt.setHours(0, 0, 0, 0);
        for (var ht = 0.133 * M, ot = Ft.getMoonPosition(nt, $, G).altitude - ht, ct, Mt, Kt, Tt, Wt, _n, _t, Lt, Ln, Ct, Bt, fn, tn, pt = 1; pt <= 24 && (ct = Ft.getMoonPosition(Cn(nt, pt), $, G).altitude - ht, Mt = Ft.getMoonPosition(Cn(nt, pt + 1), $, G).altitude - ht, Wt = (ot + Mt) / 2 - ct, _n = (Mt - ot) / 2, _t = -_n / (2 * Wt), Lt = (Wt * _t + _n) * _t + ct, Ln = _n * _n - 4 * Wt * ct, Ct = 0, Ln >= 0 && (tn = Math.sqrt(Ln) / (Math.abs(Wt) * 2), Bt = _t - tn, fn = _t + tn, Math.abs(Bt) <= 1 && Ct++, Math.abs(fn) <= 1 && Ct++, Bt < -1 && (Bt = fn)), Ct === 1 ? ot < 0 ? Kt = pt + Bt : Tt = pt + Bt : Ct === 2 && (Kt = pt + (Lt < 0 ? fn : Bt), Tt = pt + (Lt < 0 ? Bt : fn)), !(Kt && Tt)); pt += 2)
          ot = Mt;
        var vn = {};
        return Kt && (vn.rise = Cn(nt, Kt)), Tt && (vn.set = Cn(nt, Tt)), !Kt && !Tt && (vn[Lt > 0 ? "alwaysUp" : "alwaysDown"] = !0), vn;
      }, f.exports = Ft;
    })();
  }(Ms)), Ms.exports;
}
var gu = z0();
function zn(f, s) {
  const r = f.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: s
  }).split(":").map((a) => Number(a));
  return r[0] * 60 * 60 + r[1] * 60 + r[2];
}
class H0 {
  constructor(s) {
    P(this, "nadir", 0);
    P(this, "dawn", 0);
    P(this, "sunrise", 0);
    P(this, "dusk", 0);
    P(this, "sunset", 0);
    P(this, "noon", 0);
    P(this, "nadirAltitude", 0);
    Object.assign(this, s);
  }
}
class Du {
  constructor(s, r, a, l) {
    P(this, "start");
    P(this, "lat");
    P(this, "lon");
    P(this, "timezone");
    P(this, "sun");
    P(this, "startTime");
    this.start = s, this.lat = a, this.lon = l, this.timezone = r;
    const p = gu.getTimes(this.start, this.lat, this.lon), d = gu.getPosition(p.nadir, this.lat, this.lon);
    this.sun = new H0({
      nadir: zn(p.nadir, this.timezone),
      dawn: zn(p.dawn, this.timezone),
      sunrise: zn(p.sunrise, this.timezone),
      dusk: zn(p.dusk, this.timezone),
      sunset: zn(p.sunset, this.timezone),
      noon: zn(p.solarNoon, this.timezone),
      nadirAltitude: d.altitude * 180 / Math.PI
    }), this.startTime = zn(this.start, this.timezone);
  }
  dateAtElapsed(s) {
    const r = new Date(this.start);
    return r.setTime(r.getTime() + s * 1e3), r;
  }
  elapsedToTimeOfDay(s) {
    return (this.startTime + s) % 86400;
  }
}
var Cs = {}, _u;
function K0() {
  return _u || (_u = 1, function(f) {
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
      function r(g) {
        return l(d(g), arguments);
      }
      function a(g, y) {
        return r.apply(null, [g].concat(y || []));
      }
      function l(g, y) {
        var M = 1, I = g.length, m, R = "", T, F, E, N, q, K, J, st;
        for (T = 0; T < I; T++)
          if (typeof g[T] == "string")
            R += g[T];
          else if (typeof g[T] == "object") {
            if (E = g[T], E.keys)
              for (m = y[M], F = 0; F < E.keys.length; F++) {
                if (m == null)
                  throw new Error(r('[sprintf] Cannot access property "%s" of undefined value "%s"', E.keys[F], E.keys[F - 1]));
                m = m[E.keys[F]];
              }
            else E.param_no ? m = y[E.param_no] : m = y[M++];
            if (s.not_type.test(E.type) && s.not_primitive.test(E.type) && m instanceof Function && (m = m()), s.numeric_arg.test(E.type) && typeof m != "number" && isNaN(m))
              throw new TypeError(r("[sprintf] expecting number but found %T", m));
            switch (s.number.test(E.type) && (J = m >= 0), E.type) {
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
                m = JSON.stringify(m, null, E.width ? parseInt(E.width) : 0);
                break;
              case "e":
                m = E.precision ? parseFloat(m).toExponential(E.precision) : parseFloat(m).toExponential();
                break;
              case "f":
                m = E.precision ? parseFloat(m).toFixed(E.precision) : parseFloat(m);
                break;
              case "g":
                m = E.precision ? String(Number(m.toPrecision(E.precision))) : parseFloat(m);
                break;
              case "o":
                m = (parseInt(m, 10) >>> 0).toString(8);
                break;
              case "s":
                m = String(m), m = E.precision ? m.substring(0, E.precision) : m;
                break;
              case "t":
                m = String(!!m), m = E.precision ? m.substring(0, E.precision) : m;
                break;
              case "T":
                m = Object.prototype.toString.call(m).slice(8, -1).toLowerCase(), m = E.precision ? m.substring(0, E.precision) : m;
                break;
              case "u":
                m = parseInt(m, 10) >>> 0;
                break;
              case "v":
                m = m.valueOf(), m = E.precision ? m.substring(0, E.precision) : m;
                break;
              case "x":
                m = (parseInt(m, 10) >>> 0).toString(16);
                break;
              case "X":
                m = (parseInt(m, 10) >>> 0).toString(16).toUpperCase();
                break;
            }
            s.json.test(E.type) ? R += m : (s.number.test(E.type) && (!J || E.sign) ? (st = J ? "+" : "-", m = m.toString().replace(s.sign, "")) : st = "", q = E.pad_char ? E.pad_char === "0" ? "0" : E.pad_char.charAt(1) : " ", K = E.width - (st + m).length, N = E.width && K > 0 ? q.repeat(K) : "", R += E.align ? st + m + N : q === "0" ? st + N + m : N + st + m);
          }
        return R;
      }
      var p = /* @__PURE__ */ Object.create(null);
      function d(g) {
        if (p[g])
          return p[g];
        for (var y = g, M, I = [], m = 0; y; ) {
          if ((M = s.text.exec(y)) !== null)
            I.push(M[0]);
          else if ((M = s.modulo.exec(y)) !== null)
            I.push("%");
          else if ((M = s.placeholder.exec(y)) !== null) {
            if (M[2]) {
              m |= 1;
              var R = [], T = M[2], F = [];
              if ((F = s.key.exec(T)) !== null)
                for (R.push(F[1]); (T = T.substring(F[0].length)) !== ""; )
                  if ((F = s.key_access.exec(T)) !== null)
                    R.push(F[1]);
                  else if ((F = s.index_access.exec(T)) !== null)
                    R.push(F[1]);
                  else
                    throw new SyntaxError("[sprintf] failed to parse named argument key");
              else
                throw new SyntaxError("[sprintf] failed to parse named argument key");
              M[2] = R;
            } else
              m |= 2;
            if (m === 3)
              throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
            I.push(
              {
                placeholder: M[0],
                param_no: M[1],
                keys: M[2],
                sign: M[3],
                pad_char: M[4],
                align: M[5],
                width: M[6],
                precision: M[7],
                type: M[8]
              }
            );
          } else
            throw new SyntaxError("[sprintf] unexpected placeholder");
          y = y.substring(M[0].length);
        }
        return p[g] = I;
      }
      f.sprintf = r, f.vsprintf = a, typeof window < "u" && (window.sprintf = r, window.vsprintf = a);
    })();
  }(Cs)), Cs;
}
var Nu = K0();
const Z0 = Hn("PaceChunk");
class J0 {
  constructor() {
    P(this, "points", !1);
    P(this, "iterations", !1);
    P(this, "factor", !1);
    P(this, "target", !1);
  }
  get passing() {
    return this.iterations && this.factor && this.target && this.points;
  }
}
class vu {
  constructor(s, r, a, l) {
    P(this, "constraints");
    P(this, "points");
    P(this, "plan");
    P(this, "delay");
    P(this, "factor");
    P(this, "factors", new Mn());
    P(this, "status");
    this.constraints = a, this.points = r, this.plan = s, this.delay = l, this.factor = 1;
  }
  get elapsed() {
    const s = Q.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0];
    return (Q.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - s;
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
    s[0].elapsed = Q.isFunction(this.constraints[0]) ? this.constraints[0]() : this.constraints[0], s[0].time = s[0].elapsed - Q.sum(this.plan.pacing.chunks.filter((M) => M.points[0].loc < s[0].loc).map((M) => M.delay)), this.plan.event.start && (s[0].tod = this.plan.event.elapsedToTimeOfDay(s[0].elapsed));
    let r = s[0].elapsed, a = s[0].delay || 0, l = 0, p = 0, d = 0;
    const g = this.factor ? this.np : this.plan.pacing.pace, y = new Mn().init(0);
    for (let M = 1, I = s.length; M < I; M++) {
      l = s[M].loc - s[M - 1].loc, qe(s[M - 1], this.plan), y.applyEach((R, T) => R + T * l, s[M - 1].factors);
      const m = s[M - 1].factors.combined;
      d += m * l, p = g * m * l, s[M].time = s[M - 1].time + p, a = s[M - 1].delay || 0, r += p + a, s[M].elapsed = r, this.plan.event.start && (s[M].tod = this.plan.event.elapsedToTimeOfDay(r));
    }
    qe(s[s.length - 1], this.plan), this.factors = y.scaleEach(1 / this.dist), this.factor = d / this.dist;
  }
  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const a = Z0.extend(
      Nu.vsprintf("calculate:%.2f-%.2f", [this.points[0].loc, this.points[this.points.length - 1].loc])
    );
    let l = this.factor || 0, p, d;
    const g = new J0();
    for (d = 1; d <= 30; d++)
      if (this.applyPacing(), g.iterations = d >= 2, g.factor = !Q.round(l - this.factor, d === 30 ? 6 : 8), l = this.factor, g.target = Math.abs(
        (Q.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - this.points[this.points.length - 1].elapsed
      ) < 0.1, g.points = p && this.points.every((M, I) => ye(M.elapsed, p[I], 0)) || !1, p = this.points.map((M) => M.elapsed), g.passing) {
        a(`iteration ${d} complete, passed`);
        break;
      } else
        a(
          `iteration ${d} complete, failed ${Object.keys(g).filter((M) => !g[M]).join("|")}`
        );
    a("chunk complete");
    const y = g.passing ? void 0 : `failed tests ${Object.keys(g).filter((M) => !g[M]).map((M) => `"${M}"`).join(",")} after ${d} iterations`;
    this.status = {
      errorMessage: y,
      tests: g,
      success: g.passing,
      iterations: d
    };
  }
}
const ln = Hn("Pacing");
class Wu {
  constructor(s) {
    P(this, "chunks", []);
    P(this, "plan");
    P(this, "_factor");
    P(this, "_factors");
    /**
     * last time this pacing was updated
     */
    P(this, "version");
    this.plan = s;
  }
  clearCache() {
    ln("clearCache"), delete this._factor, delete this._factors;
  }
  get elapsed() {
    return ln("elapsed:get"), this.plan.points[this.plan.points.length - 1].elapsed;
  }
  get pace() {
    return ln("pace:get"), (this.elapsed - this.plan.delay) / this.plan.course.dist;
  }
  get factor() {
    return this._factor ? this._factor : (ln("factor:update"), this.chunks && (this._factor = Q.sum(this.chunks.map((s) => s.factor * s.dist)) / this.plan.course.dist), this._factor || 1);
  }
  clearFactor() {
    delete this._factor;
  }
  get factors() {
    return ln("factors:get"), this._factors || (ln("factors:update"), this._factors = Ps(this.chunks)), this._factors;
  }
  /**
   * check if this pacing is current
   */
  get isCurrent() {
    return this.version === this.plan.version;
  }
  get np() {
    return ln("np:get"), this.pace / this.factor;
  }
  get moving() {
    return this.elapsed - this.plan.delay;
  }
  get status() {
    var r, a;
    const s = {
      complete: ((r = this.chunks) == null ? void 0 : r.length) > 0,
      errorMessage: void 0,
      success: ((a = this.chunks) == null ? void 0 : a.filter((l) => {
        var p;
        return !((p = l.status) != null && p.success);
      }).length) === 0,
      chunks: this.chunks.length,
      iterations: this.chunks.map((l) => {
        var p;
        return ((p = l.status) == null ? void 0 : p.iterations) || 0;
      })
    };
    return s.success || (s.errorMessage = this.chunks.filter((l) => {
      var p;
      return l.status && !((p = l.status) != null && p.success);
    }).map((l, p) => `Chunk ${p + 1}: ${l.status.errorMessage}`).join(" | ")), s;
  }
  calculate() {
    var a, l, p;
    const s = ln.extend("calculate");
    for (s("exec"), s("clearing cache"), this.clearCache(); this.plan.points.find((d) => d.interpolated); ) {
      const d = this.plan.points.findIndex((g) => g.interpolated);
      this.plan.points.splice(d, 1);
    }
    for (s("adding points at each terrain factor break"), (a = this.plan.course.terrain) == null || a.forEach(
      (d) => this.plan.getPoint(d.percents[0] * this.plan.course.dist, !0)
    ), s("adding points at each cutoff"), this.plan.cutoffMargin && ((l = this.plan.cutoffs) == null || l.forEach((d) => {
      this.plan.getPoint(d.loc, !0);
    })), this.plan.points.filter((d) => d.delay).forEach((d) => {
      d.delay = 0;
    }), (p = this.plan.delays) == null || p.forEach((d) => {
      const g = this.plan.getPoint(d.loc, !0);
      g.delay = d.delay;
    }), s("creating pace chunks"), this.initChunks(), [null, ...Q.reverse([...this.plan.cutoffs || []]), null].forEach((d) => {
      for (; this.chunks.find((y) => !y.status); )
        this.calcChunks(), this.validateChunks();
      if (!d) return !0;
      const g = this.plan.getPoint(d.loc);
      if (g.elapsed - d.time > 0.5) {
        s(`cutoff at ${d.loc} missed`);
        const y = this.chunks[0];
        Q.last(y.points) === g ? (s(`setting cutoff at ${d.loc}`), y.constraints = [0, d.time], delete y.status) : this.splitChunk(y, g, d.time);
      }
    }), Q.isFunction(this.chunks[this.chunks.length - 1].constraints[1]) && this.chunks.length > 2 && (s("rerunning last chunk"), this.chunks[this.chunks.length - 1].calculate()), ln(`pacing status=${this.status.success ? "PASS" : "FAIL"}.`); this.plan.points.find((d) => d.interpolated); ) {
      const d = this.plan.points.findIndex((g) => g.interpolated);
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
    this.chunks = [new vu(this.plan, this.plan.points, [0, s], this.plan.delay)], this.plan.points.forEach((r) => {
      r._chunk = this.chunks[0];
    });
  }
  /**
   * calculate pacing for each pacing chunk
   */
  calcChunks() {
    ln("calcChunks"), this.clearCache(), this.chunks.filter((s) => !s.status).forEach((s) => s.calculate());
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
  splitChunk(s, r, a) {
    ln.extend("split")(`breaking chunks at ${r.loc} km`);
    const p = s.points.findIndex((y) => y === r), d = Q.round(r.elapsed - r.time), g = new vu(this.plan, s.points.slice(0, p + 1), [0, a], d);
    g.points.filter((y, M) => M < g.points.length - 1).forEach((y) => {
      y._chunk = g;
    }), this.chunks.unshift(g), s.constraints[0] = a, s.delay -= d, s.points = s.points.slice(p), delete s.status;
  }
  /**
   * merge two sequential chunks together, mutates chunks array
   * @param a - first chunk
   * @param b - second chunk
   */
  mergeChunks(s, r) {
    const a = this.chunks.findIndex((p) => p === s), l = this.chunks.findIndex((p) => p === r);
    if (l - a !== 1) throw new Error("chunks must be sequential");
    ln(Nu.sprintf("calcChunks: merging %i&%i (%.2f&%.2f)", a, l, s.np, r.np)), s.points.pop(), s.points.push(...r.points), s.delay += r.delay, delete s.status, s.points.forEach((p) => {
      p._chunk = s;
    }), s.constraints = [s.constraints[0], r.constraints[1]], this.chunks.splice(l, 1), s.calculate();
  }
}
class As extends Ur {
  constructor(r, a) {
    super(r.course, a, a.loop);
    P(this, "_plan");
    P(this, "_chunk");
    P(this, "delay", 0);
    P(this, "elapsed", 0);
    P(this, "factors", new Mn());
    P(this, "source");
    P(this, "time", 0);
    P(this, "tod", 0);
    this._plan = r, this.source = a;
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
const bs = Hn("PlanSplits");
class Y0 {
  constructor(s) {
    P(this, "plan");
    P(this, "_segments");
    P(this, "_segmentsVersion");
    P(this, "_miles");
    P(this, "_milesVersion");
    P(this, "_kilometers");
    P(this, "_kilometersVersion");
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
    const s = this.plan.course.waypoints, r = this.calcSegments(
      $r(
        s.map((a) => a.loc),
        this.plan.course.dist
      )
    );
    if (!r.length) throw new Error("createSegments result is empty");
    return r.forEach((a, l) => {
      a.waypoint = s[l + 1];
    }), r;
  }
  createSplits(s) {
    bs(`createSplits:${s}`);
    const r = Eu(s), a = Q.range(this.plan.course.dist * r).map(
      (p) => p / r
    );
    this.plan.course.dist - a[a.length - 1] > 1e-4 && a.push(this.plan.course.dist);
    const l = this.calcSegments($r(a, this.plan.course.dist));
    if (!l.length) throw new Error("createSplits result is empty");
    return l;
  }
  calcSegments(s) {
    var T;
    bs.extend("calcSegments")("exec"), this.plan.checkPacing();
    const a = this.plan, l = a.course, p = a.points, d = [], g = [];
    let y, M, I = a.points[0], m;
    for (y = 0, M = s.length; y < M; y++) {
      const F = s[y];
      m && ye((T = s[y - 1]) == null ? void 0 : T.end, F.start, 4) ? I = m : I = a.getPoint(F.start), m = a.getPoint(F.end);
      const E = F.end - F.start, N = new Tu(this.plan, {
        gain: 0,
        loss: 0,
        grade: E > 0 ? (m.alt - I.alt) / E / 10 * (m.alt - I.alt > 0 ? l.gainScale : l.lossScale) : 0,
        point1: I,
        point2: m
      }), q = new Mn().init(0);
      d.push(N), g.push(q);
    }
    const R = (F, E, N, q) => {
      const K = N.alt - E.alt;
      F[K > 0 ? "gain" : "loss"] += K * (K > 0 ? l.gainScale : l.lossScale), qe(E, a);
      const J = N.loc - E.loc;
      q.applyEach((st, mt) => st + mt * J, E.factors);
    };
    y = 1;
    for (let F = 0; F < d.length; F++) {
      const E = d[F], N = g[F];
      for (; we(p[y].loc, E.point1.loc, 4); ) y++;
      let q = E.point1;
      for (; y < p.length && we(p[y].loc, E.point2.loc, 4); ) {
        const K = p[y];
        R(E, q, K, N), q = K, y++;
      }
      R(E, q, E.point2, N), a && (E.delay = a.delays.filter((K) => Gr(E.point1.loc, K.loc, 4) && qr(E.point2.loc, K.loc, 4)).reduce((K, J) => K + J.delay, 0));
    }
    return d;
  }
}
const Gn = Hn("models:Plan");
class X0 {
  constructor(s, r) {
    P(this, "_cache", {});
    P(this, "_data");
    P(this, "course");
    P(this, "pacing", new Wu(this));
    P(this, "points");
    P(this, "splits", new Y0(this));
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    P(this, "_version", 0);
    if (this.course = s, this._data = r, r.delays) {
      const a = s.sites.map((p) => p.id), l = r.delays.find((p) => !a.includes(p.siteId));
      if (l)
        throw console.error(`Site in plan delays is not in course sites (${String(l.siteId)})`), new Error("Site in plan delays is not in course sites.");
    }
    this.points = this.course.points.map((a) => new As(this, a)), this._version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  get cutoffMargin() {
    return this._data.cutoffMargin;
  }
  get cutoffs() {
    var r;
    if ("cutoffs" in this.cache) return this.cache.cutoffs;
    this.cache.cutoffs = this.cutoffMargin ? ((r = this.course.cutoffs) == null ? void 0 : r.map((a) => new V0(this, a, this.getPoint(a.loc, !0)))) || [] : [];
    let s = 0;
    for (; this.cache.cutoffs.length - 1 >= s; ) {
      const a = this.cache.cutoffs[s];
      this.cache.cutoffs.find((l, p) => p > s && l.time <= a.time) ? (Gn(`get cutoffs: deleting extraneous cutoff at ${a.loc} km`), this.cache.cutoffs.splice(s, 1)) : s++;
    }
    return this.cache.cutoffs;
  }
  get delay() {
    return Q.sumBy(this.delays, "delay");
  }
  get delays() {
    if ("delays" in this.cache) return this.cache.delays;
    const s = this.course.waypoints.map((a) => {
      var d;
      const l = (d = this._data.delays) == null ? void 0 : d.find(
        (g) => g.loop === a.loop && g.siteId === a.site.id
      ), p = l ? l.delay : a.hasDelay ? this.typicalDelay : 0;
      return new Q0(a, p);
    }).filter((a) => a.delay > 0).sort((a, l) => a.loc - l.loc);
    let r = 0;
    for (; s.length - 1 >= r; )
      r > 0 && s[r].loc === s[r - 1].loc ? (Gn(`get delays: merging delay at ${s[r].loc} km`), s[r - 1].delay += s[r].delay, s.splice(r, 1)) : r++;
    return this.cache.delays = s, this.cache.delays;
  }
  get event() {
    if ("event" in this.cache) return this.cache.event;
    if (this._data.start)
      return this.cache.event = new Du(
        this._data.start.date,
        this._data.start.timezone,
        this.points[0].lat,
        this.points[0].lon
      );
    throw new Error("Start date/timezone is required for either the plan or the course");
  }
  get events() {
    if ("events" in this.cache) return this.cache.events;
    Gn("calculating events.sun");
    const s = [], r = this.event.elapsedToTimeOfDay(0), a = Math.ceil((r + this.points[this.points.length - 1].elapsed) / 86400);
    for (let d = 0; d < a; d++)
      [
        { event: "dawn", time: this.event.sun.dawn },
        { event: "sunrise", time: this.event.sun.sunrise },
        { event: "nadir", time: this.event.sun.nadir },
        { event: "sunset", time: this.event.sun.sunset },
        { event: "dusk", time: this.event.sun.dusk }
      ].forEach((y) => {
        const M = y.time - r + 86400 * d;
        M >= 0 && M <= this.points[this.points.length - 1].elapsed && s.push({ event: y.event, elapsed: M });
      });
    s.sort((d, g) => d.elapsed - g.elapsed);
    const l = yu(
      this.points.map((d) => d.elapsed),
      this.points.map((d) => d.loc),
      s.map((d) => d.elapsed)
    ), p = s.map((d, g) => ({ ...d, loc: l[g] }));
    return this.cache.events = { sun: p }, this.cache.events;
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
    Gn("calculating stats.factors");
    const s = Q.fromPairs(
      ve.map((p) => {
        const d = this.points.map((g) => g.factors[p]);
        return [
          p,
          {
            min: Number(Q.min(d)),
            max: Number(Q.max(d))
          }
        ];
      })
    );
    Gn("calculating stats.sun");
    const r = {
      day: { time: 0, dist: 0 },
      twilight: { time: 0, dist: 0 },
      dark: { time: 0, dist: 0 }
    };
    let a = 0, l = 0;
    return this.points.forEach((p, d) => {
      var g, y;
      a = p.loc - (((g = this.points[d - 1]) == null ? void 0 : g.loc) || 0), l = p.elapsed - (((y = this.points[d - 1]) == null ? void 0 : y.elapsed) || 0), !isNaN(this.event.sun.dawn) && !isNaN(this.event.sun.dusk) && (p.tod <= this.event.sun.dawn || p.tod >= this.event.sun.dusk) ? (r.dark.time += l, r.dark.dist += a) : p.tod < this.event.sun.sunrise || p.tod > this.event.sun.sunset ? (r.twilight.time += l, r.twilight.dist += a) : (r.day.time += l, r.day.dist += a);
    }), this.cache.stats = { factors: s, sun: r }, this.cache.stats;
  }
  get strategy() {
    return "strategy" in this.cache ? this.cache.strategy : this.cache.strategy = new Pu(this, this._data.strategy);
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
    if (Gn("checkPacing"), (!((s = this.pacing.status) != null && s.complete) || !this.pacing.isCurrent) && (Gn("checkPacing: calculate"), this.pacing.calculate()), !((r = this.points) != null && r.length)) throw new Error("No plan points");
    return !0;
  }
  getDelayAtWaypoint(s) {
    var r;
    return ((r = this.delays.find((a) => a.waypoint === s)) == null ? void 0 : r.delay) || 0;
  }
  getPoint(s, r = !1) {
    const a = this.points.findIndex((y) => Gr(y.loc, s, 4)), l = this.points[a];
    if (ye(l.loc, s, 4)) return l;
    Gn(`getPoint: ${r ? "inserting" : "creating"} new PlanPoint at ${s}`);
    const p = a - 1, d = this.points[p], g = new As(this, this.course.getPoint(s));
    return g.delay = Math.round(l.elapsed - d.elapsed - (l.time - d.time)), g.time = me(d.loc, l.loc, d.time, l.time, g.loc), g.elapsed = d.elapsed + d.delay + (g.time - d.time), g.tod = this.event.elapsedToTimeOfDay(g.elapsed), qe(g, this), r && this.points.splice(a, 0, g), g;
  }
  update(s) {
    const a = ["target", "method"].find((l) => l in s && Q.isNil(s[l]));
    if (a) throw new Error(`Plan.${a} cannot be set to null or undefined`);
    Object.assign(this._data, s), this._version++;
  }
}
class Q0 {
  constructor(s, r) {
    P(this, "delay");
    P(this, "waypoint");
    this.waypoint = s, this.delay = r;
  }
  get loc() {
    return this.waypoint.loc;
  }
}
class V0 {
  constructor(s, r, a) {
    P(this, "plan");
    P(this, "courseCutoff");
    P(this, "point");
    this.plan = s, this.courseCutoff = r, this.point = a;
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
const Bu = (f, s, r, a) => {
  const l = Cu(f, s, r, a), p = [];
  return r.forEach((d, g) => {
    let y = l[g][0] / 10;
    y > 50 ? y = 50 : y < -50 && (y = -50);
    const M = d * l[g][0] + l[g][1];
    p.push({
      grade: y,
      alt: M
    });
  }), p;
};
function j0(f, s) {
  return Bu(
    s,
    f.map((a) => a.alt),
    s,
    0.05
  ).map((a) => a.grade);
}
const t_ = (f) => {
  let s = 0, r = 0;
  const a = [0];
  for (let l = 1, p = f.length; l < p; l++)
    s = Number(f[l - 1].latlon.distanceTo(f[l].latlon)), r += s, a.push(r);
  return a;
}, Wr = Hn("models:Track");
class Hr {
  constructor(s) {
    P(this, "dist");
    P(this, "gain");
    P(this, "loss");
    P(this, "points");
    Wr("Creating new Track object");
    const r = s.map((M) => new Rs(M)), a = t_(r), l = j0(r, a);
    this.points = r.map((M, I) => new zr(M, a[I], l[I])), Wr(`set-points - ${r.length} points`), Wr("Calculating"), this.dist = this.points[this.points.length - 1].loc;
    let p = 0, d = 0, g = 0, y = this.points[0].alt;
    this.points.forEach((M) => {
      g = M.alt - y, g < 0 ? d += g : p += g, y = M.alt;
    }), this.gain = p, this.loss = d;
  }
  get start() {
    return Q.pick(this.points[0], ["alt", "lat", "lon"]);
  }
  get finish() {
    return Q.pick(this.points[this.points.length - 1], ["alt", "lat", "lon"]);
  }
  getLLA(s) {
    s > this.dist && (s = s % this.dist);
    let r;
    if (s === 0) r = this.points[0];
    else {
      const a = this.points.findIndex((l) => l.loc >= s);
      r = Lu(this.points[a - 1], this.points[a], s);
    }
    return Q.pick(r, ["lat", "lon", "alt"]);
  }
  getNearestPoint(s, r, a) {
    let p = this.points.findIndex((y) => y === r), d = this.points[p], g = 0;
    for (; a > 0.025; ) {
      const y = a / 5, M = [d];
      for (let R = 1; R <= 5; R++) {
        const T = d.loc + y * R;
        if (T <= this.dist) {
          for (; this.points[p + 1].loc < T && p < this.points.length - 1; )
            p++;
          M.push(this.points[p]);
        }
      }
      const I = M.map((R) => Number(s.distanceTo(R.latlon)));
      g = Math.min(...I);
      const m = I.findIndex((R) => R === g);
      d = M[m], a = a / 5;
    }
    return {
      point: d,
      delta: g
    };
  }
  reduceDensity(s = 0.025, r = this.points.length / 2) {
    const a = Wr.extend("reduceDensity");
    if (this.dist / s > r / 2)
      return a("Does not meet criteria"), this;
    const l = this.dist, p = Math.floor(l / s) + 1, d = Array(p).fill(0).map((I, m) => Nt(m++ * s, 3));
    d[d.length - 1] < l && d.push(l);
    const g = Bu(
      this.points.map((I) => I.loc),
      this.points.map((I) => I.alt),
      d,
      2 * s
    ), y = d.map((I) => this.getLLA(I)).map((I, m) => ({
      lat: Nt(I.lat, 6),
      lon: Nt(I.lon, 6),
      alt: Nt(g[m].alt, 2)
    })), M = new Hr(y);
    return a(`Reduced from ${this.points.length} to ${M.points.length} points.`), M;
  }
}
function n_(f, s, r) {
  const a = f.map((l, p) => ({ lat: f[p], lon: s[p], alt: r[p] }));
  return new Hr(a);
}
const a_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Course: G0,
  CourseCutoff: Ou,
  CoursePoint: Ur,
  CourseSegment: Fu,
  Event: Du,
  Pacing: Wu,
  Plan: X0,
  PlanPoint: As,
  PlanSegment: Tu,
  Point: Rs,
  Site: Br,
  Track: Hr,
  TrackPoint: zr,
  Waypoint: Is,
  createTrackFromArrays: n_,
  terrainTypes: ku
}, Symbol.toStringTag, { value: "Module" })), o_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dateToTODSeconds: zn
}, Symbol.toStringTag, { value: "Module" }));
export {
  Mn as Factors,
  a_ as Models,
  Pu as Strategy,
  O0 as adjustStrategy,
  r_ as enableDebug,
  s_ as factors,
  Lu as interpolatePoint,
  i_ as math,
  R0 as scaleDark,
  o_ as util
};
