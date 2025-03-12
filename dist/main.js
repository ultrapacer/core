var x0 = Object.defineProperty;
var I0 = (f, s, r) => s in f ? x0(f, s, { enumerable: !0, configurable: !0, writable: !0, value: r }) : f[s] = r;
var P = (f, s, r) => I0(f, typeof s != "symbol" ? s + "" : s, r);
var Dr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Mu(f) {
  return f && f.__esModule && Object.prototype.hasOwnProperty.call(f, "default") ? f.default : f;
}
var Nr = { exports: {} }, _s, cu;
function A0() {
  if (cu) return _s;
  cu = 1;
  var f = 1e3, s = f * 60, r = s * 60, a = r * 24, l = a * 7, p = a * 365.25;
  _s = function(I, m) {
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
        var R = parseFloat(m[1]), F = (m[2] || "ms").toLowerCase();
        switch (F) {
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
  function M(I, m, R, F) {
    var T = m >= R * 1.5;
    return Math.round(I / R) + " " + F + (T ? "s" : "");
  }
  return _s;
}
var vs, lu;
function P0() {
  if (lu) return vs;
  lu = 1;
  function f(s) {
    a.debug = a, a.default = a, a.coerce = M, a.disable = g, a.enable = p, a.enabled = y, a.humanize = A0(), a.destroy = I, Object.keys(s).forEach((m) => {
      a[m] = s[m];
    }), a.names = [], a.skips = [], a.formatters = {};
    function r(m) {
      let R = 0;
      for (let F = 0; F < m.length; F++)
        R = (R << 5) - R + m.charCodeAt(F), R |= 0;
      return a.colors[Math.abs(R) % a.colors.length];
    }
    a.selectColor = r;
    function a(m) {
      let R, F = null, T, E;
      function N(...q) {
        if (!N.enabled)
          return;
        const K = N, Z = Number(/* @__PURE__ */ new Date()), it = Z - (R || Z);
        K.diff = it, K.prev = R, K.curr = Z, R = Z, q[0] = a.coerce(q[0]), typeof q[0] != "string" && q.unshift("%O");
        let _t = 0;
        q[0] = q[0].replace(/%([a-zA-Z%])/g, (bt, jt) => {
          if (bt === "%%")
            return "%";
          _t++;
          const Ht = a.formatters[jt];
          if (typeof Ht == "function") {
            const Tt = q[_t];
            bt = Ht.call(K, Tt), q.splice(_t, 1), _t--;
          }
          return bt;
        }), a.formatArgs.call(K, q), (K.log || a.log).apply(K, q);
      }
      return N.namespace = m, N.useColors = a.useColors(), N.color = a.selectColor(m), N.extend = l, N.destroy = a.destroy, Object.defineProperty(N, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => F !== null ? F : (T !== a.namespaces && (T = a.namespaces, E = a.enabled(m)), E),
        set: (q) => {
          F = q;
        }
      }), typeof a.init == "function" && a.init(N), N;
    }
    function l(m, R) {
      const F = a(this.namespace + (typeof R > "u" ? ":" : R) + m);
      return F.log = this.log, F;
    }
    function p(m) {
      a.save(m), a.namespaces = m, a.names = [], a.skips = [];
      const R = (typeof m == "string" ? m : "").trim().replace(" ", ",").split(",").filter(Boolean);
      for (const F of R)
        F[0] === "-" ? a.skips.push(F.slice(1)) : a.names.push(F);
    }
    function d(m, R) {
      let F = 0, T = 0, E = -1, N = 0;
      for (; F < m.length; )
        if (T < R.length && (R[T] === m[F] || R[T] === "*"))
          R[T] === "*" ? (E = T, N = F, T++) : (F++, T++);
        else if (E !== -1)
          T = E + 1, N++, F = N;
        else
          return !1;
      for (; T < R.length && R[T] === "*"; )
        T++;
      return T === R.length;
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
  return vs = f, vs;
}
var fu;
function E0() {
  return fu || (fu = 1, function(f, s) {
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
    f.exports = P0()(s);
    const { formatters: g } = f.exports;
    g.j = function(y) {
      try {
        return JSON.stringify(y);
      } catch (M) {
        return "[UnexpectedJSONParseError]: " + M.message;
      }
    };
  }(Nr, Nr.exports)), Nr.exports;
}
var R0 = E0();
const xs = /* @__PURE__ */ Mu(R0), ms = {};
function Ke(f) {
  if (!ms[f]) {
    const s = xs("ultraPacer:core");
    s(`loading debug for namespace "${f}"`), ms[f] = s.extend(f);
  }
  return ms[f];
}
function a_() {
  xs.enable("ultraPacer:core*"), xs("ultraPacer:core")("debug enabled");
}
const T0 = {
  rate: 6,
  // %
  span: 1e3,
  // m
  th: 750
  // m
};
function Cu(f, s) {
  (s === null || typeof s > "u") && (s = T0);
  let r = 0;
  return Array.isArray(f) ? r = (f[0] + f[1]) / 2 : r = f, r <= s.th ? 1 : (1 + s.rate / s.span / 100) ** (r - s.th);
}
const hu = {
  baseline: 0,
  terrainScale: 1
};
function Nt(f, s = 0) {
  return Math.round(f * 10 ** s) / 10 ** s;
}
function wn(f, s, r, a, l) {
  return r + (l - f) / (s - f) * (a - r);
}
function bu(f, s, r) {
  let a = 0, l = 0;
  const p = [];
  for (a = 0; a < r.length; a++)
    if (r[a] < f[l])
      p.push(s[l]);
    else {
      for (; l < f.length - 1 && f[l + 1] <= r[a]; )
        l++;
      l === f.length - 1 || r[a] === f[l] ? p.push(s[l]) : p.push(wn(f[l], f[l + 1], s[l], s[l + 1], r[a]));
    }
  return p;
}
function Su(f) {
  let s, r, a, l, p = 0, d = 0, g = 0, y = 0, M = 0;
  for (s = 0; s < f.length; s++)
    r = f[s][0], a = f[s][1], l = f[s][2], M += l, p += l * r, g += l * (r * r), d += l * a, y += l * (r * a);
  const I = (d * g - p * y) / (M * g - p * p);
  return [(M * y - p * d) / (M * g - p * p), I];
}
function xu(f, s, r, a) {
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
    d.push(Su(M));
  }), d;
}
function Gr(f, s, r) {
  return Nt(f, r) < Nt(s, r);
}
function F0(f, s, r) {
  return Nt(f, r) > Nt(s, r);
}
function yn(f, s, r) {
  return Nt(f, r) <= Nt(s, r);
}
function zr(f, s, r) {
  return Nt(f, r) >= Nt(s, r);
}
function Mn(f, s, r) {
  return Nt(f, r) === Nt(s, r);
}
const o_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  interp: wn,
  interpArray: bu,
  linearRegression: Su,
  req: Mn,
  rgt: F0,
  rgte: zr,
  rlt: Gr,
  rlte: yn,
  round: Nt,
  wlslr: xu
}, Symbol.toStringTag, { value: "Module" }));
function L0(f, s) {
  function r(a) {
    return a < f.noon ? a + 86400 : a;
  }
  if (s >= f.sunrise && s <= f.sunset)
    return 0;
  if (!isNaN(f.dawn) && !isNaN(f.dusk) && (s <= f.dawn || s >= f.dusk) || f.nadirAltitude > 0)
    return 1;
  {
    const a = f.nadirAltitude < -6 ? 1 : -(f.nadirAltitude / 6);
    return r(s) >= r(f.nadir) ? wn(
      r(isNaN(f.dawn) ? f.nadir : f.dawn),
      r(f.sunrise),
      a,
      0,
      r(s)
    ) : wn(
      r(f.sunset),
      r(isNaN(f.dusk) ? f.nadir : f.dusk),
      0,
      a,
      r(s)
    );
  }
}
function Iu(f, s, r, a = hu) {
  if (s === 1 || f >= r.sunrise && f <= r.sunset)
    return 1;
  (a === null || typeof a > "u") && (a = hu);
  const l = a.terrainScale * (s - 1) + a.baseline, p = L0(r, f);
  return 1 + l * p;
}
const mn = [
  "altitude",
  "climbStrategy",
  "descentStrategy",
  "grade",
  "terrain",
  "heat",
  "dark",
  "strategy"
];
class Ce {
  constructor(s) {
    P(this, "_data", {
      altitude: 1,
      climbStrategy: 1,
      descentStrategy: 1,
      grade: 1,
      terrain: 1,
      heat: 1,
      dark: 1,
      strategy: 1
    });
    P(this, "_combined");
    Object.assign(this, s);
  }
  init(s) {
    return mn.forEach((r) => this._data[r] = s), this;
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
    return this._combined === void 0 && (this._combined = mn.reduce((s, r) => s * this._data[r], 1)), this._combined;
  }
  /**
   * @param f - function to apply
   * @param factors - factor list to apply
   */
  applyEach(s, r) {
    mn.forEach((a) => this._data[a] = s(this._data[a], r[a]));
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
    return mn.forEach((r) => this._data[r] *= s), delete this._combined, this;
  }
}
const Me = {
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
}, Au = (f) => f < Me.lower.lim ? Me.lower.m * f + Me.lower.b : f > Me.upper.lim ? Me.upper.m * f + Me.upper.b : Me.a * f ** 2 + Me.b * f + 1;
function Es(f, s) {
  return s || (s = Au), s(f);
}
function Pu(f, s) {
  if (!s) return 1;
  const r = f.tod;
  let a = 1;
  if (r > s.start && r < s.stop) {
    const l = (r - s.start) / (s.stop - s.start) * Math.PI;
    a += (s.max - s.baseline) * Math.sin(l) / 100;
  }
  return a += s.baseline / 100, a;
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
var k0 = qn.exports, pu;
function O0() {
  return pu || (pu = 1, function(f, s) {
    (function() {
      var r, a = "4.17.21", l = 200, p = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", d = "Expected a function", g = "Invalid `variable` option passed into `_.template`", y = "__lodash_hash_undefined__", M = 500, I = "__lodash_placeholder__", m = 1, R = 2, F = 4, T = 1, E = 2, N = 1, q = 2, K = 4, Z = 8, it = 16, _t = 32, Wt = 64, bt = 128, jt = 256, Ht = 512, Tt = 30, Cn = "...", zn = 800, Zr = 16, bn = 1, Hn = 2, Jr = 3, be = 1 / 0, ge = 9007199254740991, Kn = 17976931348623157e292, Se = NaN, k = 4294967295, $ = k - 1, G = k >>> 1, ft = [
        ["ary", bt],
        ["bind", N],
        ["bindKey", q],
        ["curry", Z],
        ["curryRight", it],
        ["flip", Ht],
        ["partial", _t],
        ["partialRight", Wt],
        ["rearg", jt]
      ], et = "[object Arguments]", ht = "[object Array]", ot = "[object AsyncFunction]", ct = "[object Boolean]", Mt = "[object Date]", Kt = "[object DOMException]", Ft = "[object Error]", Bt = "[object Function]", _e = "[object GeneratorFunction]", vt = "[object Map]", Lt = "[object Number]", ke = "[object Null]", Ct = "[object Object]", Ut = "[object Promise]", le = "[object Proxy]", te = "[object RegExp]", pt = "[object Set]", ve = "[object String]", Zn = "[object Symbol]", Gu = "[object Undefined]", Sn = "[object WeakMap]", zu = "[object WeakSet]", xn = "[object ArrayBuffer]", nn = "[object DataView]", Yr = "[object Float32Array]", Xr = "[object Float64Array]", Qr = "[object Int8Array]", Vr = "[object Int16Array]", jr = "[object Int32Array]", ti = "[object Uint8Array]", ei = "[object Uint8ClampedArray]", ni = "[object Uint16Array]", ri = "[object Uint32Array]", Hu = /\b__p \+= '';/g, Ku = /\b(__p \+=) '' \+/g, Zu = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Ls = /&(?:amp|lt|gt|quot|#39);/g, ks = /[&<>"']/g, Ju = RegExp(Ls.source), Yu = RegExp(ks.source), Xu = /<%-([\s\S]+?)%>/g, Qu = /<%([\s\S]+?)%>/g, Os = /<%=([\s\S]+?)%>/g, Vu = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ju = /^\w*$/, tc = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, ii = /[\\^$.*+?()[\]{}|]/g, ec = RegExp(ii.source), si = /^\s+/, nc = /\s/, rc = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, ic = /\{\n\/\* \[wrapped with (.+)\] \*/, sc = /,? & /, ac = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, oc = /[()=,{}\[\]\/\s]/, uc = /\\(\\)?/g, cc = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, Ds = /\w*$/, lc = /^[-+]0x[0-9a-f]+$/i, fc = /^0b[01]+$/i, hc = /^\[object .+?Constructor\]$/, pc = /^0o[0-7]+$/i, dc = /^(?:0|[1-9]\d*)$/, gc = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Jn = /($^)/, _c = /['\n\r\u2028\u2029\\]/g, Yn = "\\ud800-\\udfff", vc = "\\u0300-\\u036f", mc = "\\ufe20-\\ufe2f", wc = "\\u20d0-\\u20ff", Ns = vc + mc + wc, Ws = "\\u2700-\\u27bf", Bs = "a-z\\xdf-\\xf6\\xf8-\\xff", yc = "\\xac\\xb1\\xd7\\xf7", Mc = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Cc = "\\u2000-\\u206f", bc = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", Us = "A-Z\\xc0-\\xd6\\xd8-\\xde", $s = "\\ufe0e\\ufe0f", qs = yc + Mc + Cc + bc, ai = "['’]", Sc = "[" + Yn + "]", Gs = "[" + qs + "]", Xn = "[" + Ns + "]", zs = "\\d+", xc = "[" + Ws + "]", Hs = "[" + Bs + "]", Ks = "[^" + Yn + qs + zs + Ws + Bs + Us + "]", oi = "\\ud83c[\\udffb-\\udfff]", Ic = "(?:" + Xn + "|" + oi + ")", Zs = "[^" + Yn + "]", ui = "(?:\\ud83c[\\udde6-\\uddff]){2}", ci = "[\\ud800-\\udbff][\\udc00-\\udfff]", rn = "[" + Us + "]", Js = "\\u200d", Ys = "(?:" + Hs + "|" + Ks + ")", Ac = "(?:" + rn + "|" + Ks + ")", Xs = "(?:" + ai + "(?:d|ll|m|re|s|t|ve))?", Qs = "(?:" + ai + "(?:D|LL|M|RE|S|T|VE))?", Vs = Ic + "?", js = "[" + $s + "]?", Pc = "(?:" + Js + "(?:" + [Zs, ui, ci].join("|") + ")" + js + Vs + ")*", Ec = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", Rc = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", ta = js + Vs + Pc, Tc = "(?:" + [xc, ui, ci].join("|") + ")" + ta, Fc = "(?:" + [Zs + Xn + "?", Xn, ui, ci, Sc].join("|") + ")", Lc = RegExp(ai, "g"), kc = RegExp(Xn, "g"), li = RegExp(oi + "(?=" + oi + ")|" + Fc + ta, "g"), Oc = RegExp([
        rn + "?" + Hs + "+" + Xs + "(?=" + [Gs, rn, "$"].join("|") + ")",
        Ac + "+" + Qs + "(?=" + [Gs, rn + Ys, "$"].join("|") + ")",
        rn + "?" + Ys + "+" + Xs,
        rn + "+" + Qs,
        Rc,
        Ec,
        zs,
        Tc
      ].join("|"), "g"), Dc = RegExp("[" + Js + Yn + Ns + $s + "]"), Nc = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Wc = [
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
      ], Bc = -1, lt = {};
      lt[Yr] = lt[Xr] = lt[Qr] = lt[Vr] = lt[jr] = lt[ti] = lt[ei] = lt[ni] = lt[ri] = !0, lt[et] = lt[ht] = lt[xn] = lt[ct] = lt[nn] = lt[Mt] = lt[Ft] = lt[Bt] = lt[vt] = lt[Lt] = lt[Ct] = lt[te] = lt[pt] = lt[ve] = lt[Sn] = !1;
      var ut = {};
      ut[et] = ut[ht] = ut[xn] = ut[nn] = ut[ct] = ut[Mt] = ut[Yr] = ut[Xr] = ut[Qr] = ut[Vr] = ut[jr] = ut[vt] = ut[Lt] = ut[Ct] = ut[te] = ut[pt] = ut[ve] = ut[Zn] = ut[ti] = ut[ei] = ut[ni] = ut[ri] = !0, ut[Ft] = ut[Bt] = ut[Sn] = !1;
      var Uc = {
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
      }, $c = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, qc = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Gc = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, zc = parseFloat, Hc = parseInt, ea = typeof Dr == "object" && Dr && Dr.Object === Object && Dr, Kc = typeof self == "object" && self && self.Object === Object && self, At = ea || Kc || Function("return this")(), fi = s && !s.nodeType && s, Ze = fi && !0 && f && !f.nodeType && f, na = Ze && Ze.exports === fi, hi = na && ea.process, ee = function() {
        try {
          var v = Ze && Ze.require && Ze.require("util").types;
          return v || hi && hi.binding && hi.binding("util");
        } catch {
        }
      }(), ra = ee && ee.isArrayBuffer, ia = ee && ee.isDate, sa = ee && ee.isMap, aa = ee && ee.isRegExp, oa = ee && ee.isSet, ua = ee && ee.isTypedArray;
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
      function Zc(v, b, C, O) {
        for (var z = -1, nt = v == null ? 0 : v.length; ++z < nt; ) {
          var St = v[z];
          b(O, St, C(St), v);
        }
        return O;
      }
      function ne(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length; ++C < O && b(v[C], C, v) !== !1; )
          ;
        return v;
      }
      function Jc(v, b) {
        for (var C = v == null ? 0 : v.length; C-- && b(v[C], C, v) !== !1; )
          ;
        return v;
      }
      function ca(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length; ++C < O; )
          if (!b(v[C], C, v))
            return !1;
        return !0;
      }
      function Oe(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length, z = 0, nt = []; ++C < O; ) {
          var St = v[C];
          b(St, C, v) && (nt[z++] = St);
        }
        return nt;
      }
      function Qn(v, b) {
        var C = v == null ? 0 : v.length;
        return !!C && sn(v, b, 0) > -1;
      }
      function pi(v, b, C) {
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
      function De(v, b) {
        for (var C = -1, O = b.length, z = v.length; ++C < O; )
          v[z + C] = b[C];
        return v;
      }
      function di(v, b, C, O) {
        var z = -1, nt = v == null ? 0 : v.length;
        for (O && nt && (C = v[++z]); ++z < nt; )
          C = b(C, v[z], z, v);
        return C;
      }
      function Yc(v, b, C, O) {
        var z = v == null ? 0 : v.length;
        for (O && z && (C = v[--z]); z--; )
          C = b(C, v[z], z, v);
        return C;
      }
      function gi(v, b) {
        for (var C = -1, O = v == null ? 0 : v.length; ++C < O; )
          if (b(v[C], C, v))
            return !0;
        return !1;
      }
      var Xc = _i("length");
      function Qc(v) {
        return v.split("");
      }
      function Vc(v) {
        return v.match(ac) || [];
      }
      function la(v, b, C) {
        var O;
        return C(v, function(z, nt, St) {
          if (b(z, nt, St))
            return O = nt, !1;
        }), O;
      }
      function Vn(v, b, C, O) {
        for (var z = v.length, nt = C + (O ? 1 : -1); O ? nt-- : ++nt < z; )
          if (b(v[nt], nt, v))
            return nt;
        return -1;
      }
      function sn(v, b, C) {
        return b === b ? ll(v, b, C) : Vn(v, fa, C);
      }
      function jc(v, b, C, O) {
        for (var z = C - 1, nt = v.length; ++z < nt; )
          if (O(v[z], b))
            return z;
        return -1;
      }
      function fa(v) {
        return v !== v;
      }
      function ha(v, b) {
        var C = v == null ? 0 : v.length;
        return C ? mi(v, b) / C : Se;
      }
      function _i(v) {
        return function(b) {
          return b == null ? r : b[v];
        };
      }
      function vi(v) {
        return function(b) {
          return v == null ? r : v[b];
        };
      }
      function pa(v, b, C, O, z) {
        return z(v, function(nt, St, at) {
          C = O ? (O = !1, nt) : b(C, nt, St, at);
        }), C;
      }
      function tl(v, b) {
        var C = v.length;
        for (v.sort(b); C--; )
          v[C] = v[C].value;
        return v;
      }
      function mi(v, b) {
        for (var C, O = -1, z = v.length; ++O < z; ) {
          var nt = b(v[O]);
          nt !== r && (C = C === r ? nt : C + nt);
        }
        return C;
      }
      function wi(v, b) {
        for (var C = -1, O = Array(v); ++C < v; )
          O[C] = b(C);
        return O;
      }
      function el(v, b) {
        return dt(b, function(C) {
          return [C, v[C]];
        });
      }
      function da(v) {
        return v && v.slice(0, ma(v) + 1).replace(si, "");
      }
      function Jt(v) {
        return function(b) {
          return v(b);
        };
      }
      function yi(v, b) {
        return dt(b, function(C) {
          return v[C];
        });
      }
      function In(v, b) {
        return v.has(b);
      }
      function ga(v, b) {
        for (var C = -1, O = v.length; ++C < O && sn(b, v[C], 0) > -1; )
          ;
        return C;
      }
      function _a(v, b) {
        for (var C = v.length; C-- && sn(b, v[C], 0) > -1; )
          ;
        return C;
      }
      function nl(v, b) {
        for (var C = v.length, O = 0; C--; )
          v[C] === b && ++O;
        return O;
      }
      var rl = vi(Uc), il = vi($c);
      function sl(v) {
        return "\\" + Gc[v];
      }
      function al(v, b) {
        return v == null ? r : v[b];
      }
      function an(v) {
        return Dc.test(v);
      }
      function ol(v) {
        return Nc.test(v);
      }
      function ul(v) {
        for (var b, C = []; !(b = v.next()).done; )
          C.push(b.value);
        return C;
      }
      function Mi(v) {
        var b = -1, C = Array(v.size);
        return v.forEach(function(O, z) {
          C[++b] = [z, O];
        }), C;
      }
      function va(v, b) {
        return function(C) {
          return v(b(C));
        };
      }
      function Ne(v, b) {
        for (var C = -1, O = v.length, z = 0, nt = []; ++C < O; ) {
          var St = v[C];
          (St === b || St === I) && (v[C] = I, nt[z++] = C);
        }
        return nt;
      }
      function jn(v) {
        var b = -1, C = Array(v.size);
        return v.forEach(function(O) {
          C[++b] = O;
        }), C;
      }
      function cl(v) {
        var b = -1, C = Array(v.size);
        return v.forEach(function(O) {
          C[++b] = [O, O];
        }), C;
      }
      function ll(v, b, C) {
        for (var O = C - 1, z = v.length; ++O < z; )
          if (v[O] === b)
            return O;
        return -1;
      }
      function fl(v, b, C) {
        for (var O = C + 1; O--; )
          if (v[O] === b)
            return O;
        return O;
      }
      function on(v) {
        return an(v) ? pl(v) : Xc(v);
      }
      function fe(v) {
        return an(v) ? dl(v) : Qc(v);
      }
      function ma(v) {
        for (var b = v.length; b-- && nc.test(v.charAt(b)); )
          ;
        return b;
      }
      var hl = vi(qc);
      function pl(v) {
        for (var b = li.lastIndex = 0; li.test(v); )
          ++b;
        return b;
      }
      function dl(v) {
        return v.match(li) || [];
      }
      function gl(v) {
        return v.match(Oc) || [];
      }
      var _l = function v(b) {
        b = b == null ? At : un.defaults(At.Object(), b, un.pick(At, Wc));
        var C = b.Array, O = b.Date, z = b.Error, nt = b.Function, St = b.Math, at = b.Object, Ci = b.RegExp, vl = b.String, re = b.TypeError, tr = C.prototype, ml = nt.prototype, cn = at.prototype, er = b["__core-js_shared__"], nr = ml.toString, st = cn.hasOwnProperty, wl = 0, wa = function() {
          var t = /[^.]+$/.exec(er && er.keys && er.keys.IE_PROTO || "");
          return t ? "Symbol(src)_1." + t : "";
        }(), rr = cn.toString, yl = nr.call(at), Ml = At._, Cl = Ci(
          "^" + nr.call(st).replace(ii, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), ir = na ? b.Buffer : r, We = b.Symbol, sr = b.Uint8Array, ya = ir ? ir.allocUnsafe : r, ar = va(at.getPrototypeOf, at), Ma = at.create, Ca = cn.propertyIsEnumerable, or = tr.splice, ba = We ? We.isConcatSpreadable : r, An = We ? We.iterator : r, Je = We ? We.toStringTag : r, ur = function() {
          try {
            var t = je(at, "defineProperty");
            return t({}, "", {}), t;
          } catch {
          }
        }(), bl = b.clearTimeout !== At.clearTimeout && b.clearTimeout, Sl = O && O.now !== At.Date.now && O.now, xl = b.setTimeout !== At.setTimeout && b.setTimeout, cr = St.ceil, lr = St.floor, bi = at.getOwnPropertySymbols, Il = ir ? ir.isBuffer : r, Sa = b.isFinite, Al = tr.join, Pl = va(at.keys, at), xt = St.max, Et = St.min, El = O.now, Rl = b.parseInt, xa = St.random, Tl = tr.reverse, Si = je(b, "DataView"), Pn = je(b, "Map"), xi = je(b, "Promise"), ln = je(b, "Set"), En = je(b, "WeakMap"), Rn = je(at, "create"), fr = En && new En(), fn = {}, Fl = tn(Si), Ll = tn(Pn), kl = tn(xi), Ol = tn(ln), Dl = tn(En), hr = We ? We.prototype : r, Tn = hr ? hr.valueOf : r, Ia = hr ? hr.toString : r;
        function u(t) {
          if (mt(t) && !H(t) && !(t instanceof j)) {
            if (t instanceof ie)
              return t;
            if (st.call(t, "__wrapped__"))
              return Po(t);
          }
          return new ie(t);
        }
        var hn = /* @__PURE__ */ function() {
          function t() {
          }
          return function(e) {
            if (!gt(e))
              return {};
            if (Ma)
              return Ma(e);
            t.prototype = e;
            var n = new t();
            return t.prototype = r, n;
          };
        }();
        function pr() {
        }
        function ie(t, e) {
          this.__wrapped__ = t, this.__actions__ = [], this.__chain__ = !!e, this.__index__ = 0, this.__values__ = r;
        }
        u.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: Xu,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: Qu,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: Os,
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
        }, u.prototype = pr.prototype, u.prototype.constructor = u, ie.prototype = hn(pr.prototype), ie.prototype.constructor = ie;
        function j(t) {
          this.__wrapped__ = t, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = k, this.__views__ = [];
        }
        function Nl() {
          var t = new j(this.__wrapped__);
          return t.__actions__ = $t(this.__actions__), t.__dir__ = this.__dir__, t.__filtered__ = this.__filtered__, t.__iteratees__ = $t(this.__iteratees__), t.__takeCount__ = this.__takeCount__, t.__views__ = $t(this.__views__), t;
        }
        function Wl() {
          if (this.__filtered__) {
            var t = new j(this);
            t.__dir__ = -1, t.__filtered__ = !0;
          } else
            t = this.clone(), t.__dir__ *= -1;
          return t;
        }
        function Bl() {
          var t = this.__wrapped__.value(), e = this.__dir__, n = H(t), i = e < 0, o = n ? t.length : 0, c = Vf(0, o, this.__views__), h = c.start, _ = c.end, w = _ - h, S = i ? _ : h - 1, x = this.__iteratees__, A = x.length, L = 0, D = Et(w, this.__takeCount__);
          if (!n || !i && o == w && D == w)
            return Xa(t, this.__actions__);
          var B = [];
          t:
            for (; w-- && L < D; ) {
              S += e;
              for (var Y = -1, U = t[S]; ++Y < A; ) {
                var V = x[Y], tt = V.iteratee, Qt = V.type, Dt = tt(U);
                if (Qt == Hn)
                  U = Dt;
                else if (!Dt) {
                  if (Qt == bn)
                    continue t;
                  break t;
                }
              }
              B[L++] = U;
            }
          return B;
        }
        j.prototype = hn(pr.prototype), j.prototype.constructor = j;
        function Ye(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var i = t[e];
            this.set(i[0], i[1]);
          }
        }
        function Ul() {
          this.__data__ = Rn ? Rn(null) : {}, this.size = 0;
        }
        function $l(t) {
          var e = this.has(t) && delete this.__data__[t];
          return this.size -= e ? 1 : 0, e;
        }
        function ql(t) {
          var e = this.__data__;
          if (Rn) {
            var n = e[t];
            return n === y ? r : n;
          }
          return st.call(e, t) ? e[t] : r;
        }
        function Gl(t) {
          var e = this.__data__;
          return Rn ? e[t] !== r : st.call(e, t);
        }
        function zl(t, e) {
          var n = this.__data__;
          return this.size += this.has(t) ? 0 : 1, n[t] = Rn && e === r ? y : e, this;
        }
        Ye.prototype.clear = Ul, Ye.prototype.delete = $l, Ye.prototype.get = ql, Ye.prototype.has = Gl, Ye.prototype.set = zl;
        function xe(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var i = t[e];
            this.set(i[0], i[1]);
          }
        }
        function Hl() {
          this.__data__ = [], this.size = 0;
        }
        function Kl(t) {
          var e = this.__data__, n = dr(e, t);
          if (n < 0)
            return !1;
          var i = e.length - 1;
          return n == i ? e.pop() : or.call(e, n, 1), --this.size, !0;
        }
        function Zl(t) {
          var e = this.__data__, n = dr(e, t);
          return n < 0 ? r : e[n][1];
        }
        function Jl(t) {
          return dr(this.__data__, t) > -1;
        }
        function Yl(t, e) {
          var n = this.__data__, i = dr(n, t);
          return i < 0 ? (++this.size, n.push([t, e])) : n[i][1] = e, this;
        }
        xe.prototype.clear = Hl, xe.prototype.delete = Kl, xe.prototype.get = Zl, xe.prototype.has = Jl, xe.prototype.set = Yl;
        function Ie(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.clear(); ++e < n; ) {
            var i = t[e];
            this.set(i[0], i[1]);
          }
        }
        function Xl() {
          this.size = 0, this.__data__ = {
            hash: new Ye(),
            map: new (Pn || xe)(),
            string: new Ye()
          };
        }
        function Ql(t) {
          var e = Ir(this, t).delete(t);
          return this.size -= e ? 1 : 0, e;
        }
        function Vl(t) {
          return Ir(this, t).get(t);
        }
        function jl(t) {
          return Ir(this, t).has(t);
        }
        function tf(t, e) {
          var n = Ir(this, t), i = n.size;
          return n.set(t, e), this.size += n.size == i ? 0 : 1, this;
        }
        Ie.prototype.clear = Xl, Ie.prototype.delete = Ql, Ie.prototype.get = Vl, Ie.prototype.has = jl, Ie.prototype.set = tf;
        function Xe(t) {
          var e = -1, n = t == null ? 0 : t.length;
          for (this.__data__ = new Ie(); ++e < n; )
            this.add(t[e]);
        }
        function ef(t) {
          return this.__data__.set(t, y), this;
        }
        function nf(t) {
          return this.__data__.has(t);
        }
        Xe.prototype.add = Xe.prototype.push = ef, Xe.prototype.has = nf;
        function he(t) {
          var e = this.__data__ = new xe(t);
          this.size = e.size;
        }
        function rf() {
          this.__data__ = new xe(), this.size = 0;
        }
        function sf(t) {
          var e = this.__data__, n = e.delete(t);
          return this.size = e.size, n;
        }
        function af(t) {
          return this.__data__.get(t);
        }
        function of(t) {
          return this.__data__.has(t);
        }
        function uf(t, e) {
          var n = this.__data__;
          if (n instanceof xe) {
            var i = n.__data__;
            if (!Pn || i.length < l - 1)
              return i.push([t, e]), this.size = ++n.size, this;
            n = this.__data__ = new Ie(i);
          }
          return n.set(t, e), this.size = n.size, this;
        }
        he.prototype.clear = rf, he.prototype.delete = sf, he.prototype.get = af, he.prototype.has = of, he.prototype.set = uf;
        function Aa(t, e) {
          var n = H(t), i = !n && en(t), o = !n && !i && Ge(t), c = !n && !i && !o && _n(t), h = n || i || o || c, _ = h ? wi(t.length, vl) : [], w = _.length;
          for (var S in t)
            (e || st.call(t, S)) && !(h && // Safari 9 has enumerable `arguments.length` in strict mode.
            (S == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            o && (S == "offset" || S == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            c && (S == "buffer" || S == "byteLength" || S == "byteOffset") || // Skip index properties.
            Re(S, w))) && _.push(S);
          return _;
        }
        function Pa(t) {
          var e = t.length;
          return e ? t[Di(0, e - 1)] : r;
        }
        function cf(t, e) {
          return Ar($t(t), Qe(e, 0, t.length));
        }
        function lf(t) {
          return Ar($t(t));
        }
        function Ii(t, e, n) {
          (n !== r && !pe(t[e], n) || n === r && !(e in t)) && Ae(t, e, n);
        }
        function Fn(t, e, n) {
          var i = t[e];
          (!(st.call(t, e) && pe(i, n)) || n === r && !(e in t)) && Ae(t, e, n);
        }
        function dr(t, e) {
          for (var n = t.length; n--; )
            if (pe(t[n][0], e))
              return n;
          return -1;
        }
        function ff(t, e, n, i) {
          return Be(t, function(o, c, h) {
            e(i, o, n(o), h);
          }), i;
        }
        function Ea(t, e) {
          return t && we(e, It(e), t);
        }
        function hf(t, e) {
          return t && we(e, Gt(e), t);
        }
        function Ae(t, e, n) {
          e == "__proto__" && ur ? ur(t, e, {
            configurable: !0,
            enumerable: !0,
            value: n,
            writable: !0
          }) : t[e] = n;
        }
        function Ai(t, e) {
          for (var n = -1, i = e.length, o = C(i), c = t == null; ++n < i; )
            o[n] = c ? r : os(t, e[n]);
          return o;
        }
        function Qe(t, e, n) {
          return t === t && (n !== r && (t = t <= n ? t : n), e !== r && (t = t >= e ? t : e)), t;
        }
        function se(t, e, n, i, o, c) {
          var h, _ = e & m, w = e & R, S = e & F;
          if (n && (h = o ? n(t, i, o, c) : n(t)), h !== r)
            return h;
          if (!gt(t))
            return t;
          var x = H(t);
          if (x) {
            if (h = th(t), !_)
              return $t(t, h);
          } else {
            var A = Rt(t), L = A == Bt || A == _e;
            if (Ge(t))
              return ja(t, _);
            if (A == Ct || A == et || L && !o) {
              if (h = w || L ? {} : wo(t), !_)
                return w ? Gf(t, hf(h, t)) : qf(t, Ea(h, t));
            } else {
              if (!ut[A])
                return o ? t : {};
              h = eh(t, A, _);
            }
          }
          c || (c = new he());
          var D = c.get(t);
          if (D)
            return D;
          c.set(t, h), Jo(t) ? t.forEach(function(U) {
            h.add(se(U, e, n, U, t, c));
          }) : Ko(t) && t.forEach(function(U, V) {
            h.set(V, se(U, e, n, V, t, c));
          });
          var B = S ? w ? Zi : Ki : w ? Gt : It, Y = x ? r : B(t);
          return ne(Y || t, function(U, V) {
            Y && (V = U, U = t[V]), Fn(h, V, se(U, e, n, V, t, c));
          }), h;
        }
        function pf(t) {
          var e = It(t);
          return function(n) {
            return Ra(n, t, e);
          };
        }
        function Ra(t, e, n) {
          var i = n.length;
          if (t == null)
            return !i;
          for (t = at(t); i--; ) {
            var o = n[i], c = e[o], h = t[o];
            if (h === r && !(o in t) || !c(h))
              return !1;
          }
          return !0;
        }
        function Ta(t, e, n) {
          if (typeof t != "function")
            throw new re(d);
          return Bn(function() {
            t.apply(r, n);
          }, e);
        }
        function Ln(t, e, n, i) {
          var o = -1, c = Qn, h = !0, _ = t.length, w = [], S = e.length;
          if (!_)
            return w;
          n && (e = dt(e, Jt(n))), i ? (c = pi, h = !1) : e.length >= l && (c = In, h = !1, e = new Xe(e));
          t:
            for (; ++o < _; ) {
              var x = t[o], A = n == null ? x : n(x);
              if (x = i || x !== 0 ? x : 0, h && A === A) {
                for (var L = S; L--; )
                  if (e[L] === A)
                    continue t;
                w.push(x);
              } else c(e, A, i) || w.push(x);
            }
          return w;
        }
        var Be = io(me), Fa = io(Ei, !0);
        function df(t, e) {
          var n = !0;
          return Be(t, function(i, o, c) {
            return n = !!e(i, o, c), n;
          }), n;
        }
        function gr(t, e, n) {
          for (var i = -1, o = t.length; ++i < o; ) {
            var c = t[i], h = e(c);
            if (h != null && (_ === r ? h === h && !Xt(h) : n(h, _)))
              var _ = h, w = c;
          }
          return w;
        }
        function gf(t, e, n, i) {
          var o = t.length;
          for (n = J(n), n < 0 && (n = -n > o ? 0 : o + n), i = i === r || i > o ? o : J(i), i < 0 && (i += o), i = n > i ? 0 : Xo(i); n < i; )
            t[n++] = e;
          return t;
        }
        function La(t, e) {
          var n = [];
          return Be(t, function(i, o, c) {
            e(i, o, c) && n.push(i);
          }), n;
        }
        function Pt(t, e, n, i, o) {
          var c = -1, h = t.length;
          for (n || (n = rh), o || (o = []); ++c < h; ) {
            var _ = t[c];
            e > 0 && n(_) ? e > 1 ? Pt(_, e - 1, n, i, o) : De(o, _) : i || (o[o.length] = _);
          }
          return o;
        }
        var Pi = so(), ka = so(!0);
        function me(t, e) {
          return t && Pi(t, e, It);
        }
        function Ei(t, e) {
          return t && ka(t, e, It);
        }
        function _r(t, e) {
          return Oe(e, function(n) {
            return Te(t[n]);
          });
        }
        function Ve(t, e) {
          e = $e(e, t);
          for (var n = 0, i = e.length; t != null && n < i; )
            t = t[ye(e[n++])];
          return n && n == i ? t : r;
        }
        function Oa(t, e, n) {
          var i = e(t);
          return H(t) ? i : De(i, n(t));
        }
        function kt(t) {
          return t == null ? t === r ? Gu : ke : Je && Je in at(t) ? Qf(t) : lh(t);
        }
        function Ri(t, e) {
          return t > e;
        }
        function _f(t, e) {
          return t != null && st.call(t, e);
        }
        function vf(t, e) {
          return t != null && e in at(t);
        }
        function mf(t, e, n) {
          return t >= Et(e, n) && t < xt(e, n);
        }
        function Ti(t, e, n) {
          for (var i = n ? pi : Qn, o = t[0].length, c = t.length, h = c, _ = C(c), w = 1 / 0, S = []; h--; ) {
            var x = t[h];
            h && e && (x = dt(x, Jt(e))), w = Et(x.length, w), _[h] = !n && (e || o >= 120 && x.length >= 120) ? new Xe(h && x) : r;
          }
          x = t[0];
          var A = -1, L = _[0];
          t:
            for (; ++A < o && S.length < w; ) {
              var D = x[A], B = e ? e(D) : D;
              if (D = n || D !== 0 ? D : 0, !(L ? In(L, B) : i(S, B, n))) {
                for (h = c; --h; ) {
                  var Y = _[h];
                  if (!(Y ? In(Y, B) : i(t[h], B, n)))
                    continue t;
                }
                L && L.push(B), S.push(D);
              }
            }
          return S;
        }
        function wf(t, e, n, i) {
          return me(t, function(o, c, h) {
            e(i, n(o), c, h);
          }), i;
        }
        function kn(t, e, n) {
          e = $e(e, t), t = bo(t, e);
          var i = t == null ? t : t[ye(oe(e))];
          return i == null ? r : Zt(i, t, n);
        }
        function Da(t) {
          return mt(t) && kt(t) == et;
        }
        function yf(t) {
          return mt(t) && kt(t) == xn;
        }
        function Mf(t) {
          return mt(t) && kt(t) == Mt;
        }
        function On(t, e, n, i, o) {
          return t === e ? !0 : t == null || e == null || !mt(t) && !mt(e) ? t !== t && e !== e : Cf(t, e, n, i, On, o);
        }
        function Cf(t, e, n, i, o, c) {
          var h = H(t), _ = H(e), w = h ? ht : Rt(t), S = _ ? ht : Rt(e);
          w = w == et ? Ct : w, S = S == et ? Ct : S;
          var x = w == Ct, A = S == Ct, L = w == S;
          if (L && Ge(t)) {
            if (!Ge(e))
              return !1;
            h = !0, x = !1;
          }
          if (L && !x)
            return c || (c = new he()), h || _n(t) ? _o(t, e, n, i, o, c) : Yf(t, e, w, n, i, o, c);
          if (!(n & T)) {
            var D = x && st.call(t, "__wrapped__"), B = A && st.call(e, "__wrapped__");
            if (D || B) {
              var Y = D ? t.value() : t, U = B ? e.value() : e;
              return c || (c = new he()), o(Y, U, n, i, c);
            }
          }
          return L ? (c || (c = new he()), Xf(t, e, n, i, o, c)) : !1;
        }
        function bf(t) {
          return mt(t) && Rt(t) == vt;
        }
        function Fi(t, e, n, i) {
          var o = n.length, c = o, h = !i;
          if (t == null)
            return !c;
          for (t = at(t); o--; ) {
            var _ = n[o];
            if (h && _[2] ? _[1] !== t[_[0]] : !(_[0] in t))
              return !1;
          }
          for (; ++o < c; ) {
            _ = n[o];
            var w = _[0], S = t[w], x = _[1];
            if (h && _[2]) {
              if (S === r && !(w in t))
                return !1;
            } else {
              var A = new he();
              if (i)
                var L = i(S, x, w, t, e, A);
              if (!(L === r ? On(x, S, T | E, i, A) : L))
                return !1;
            }
          }
          return !0;
        }
        function Na(t) {
          if (!gt(t) || sh(t))
            return !1;
          var e = Te(t) ? Cl : hc;
          return e.test(tn(t));
        }
        function Sf(t) {
          return mt(t) && kt(t) == te;
        }
        function xf(t) {
          return mt(t) && Rt(t) == pt;
        }
        function If(t) {
          return mt(t) && Lr(t.length) && !!lt[kt(t)];
        }
        function Wa(t) {
          return typeof t == "function" ? t : t == null ? zt : typeof t == "object" ? H(t) ? $a(t[0], t[1]) : Ua(t) : ou(t);
        }
        function Li(t) {
          if (!Wn(t))
            return Pl(t);
          var e = [];
          for (var n in at(t))
            st.call(t, n) && n != "constructor" && e.push(n);
          return e;
        }
        function Af(t) {
          if (!gt(t))
            return ch(t);
          var e = Wn(t), n = [];
          for (var i in t)
            i == "constructor" && (e || !st.call(t, i)) || n.push(i);
          return n;
        }
        function ki(t, e) {
          return t < e;
        }
        function Ba(t, e) {
          var n = -1, i = qt(t) ? C(t.length) : [];
          return Be(t, function(o, c, h) {
            i[++n] = e(o, c, h);
          }), i;
        }
        function Ua(t) {
          var e = Yi(t);
          return e.length == 1 && e[0][2] ? Mo(e[0][0], e[0][1]) : function(n) {
            return n === t || Fi(n, t, e);
          };
        }
        function $a(t, e) {
          return Qi(t) && yo(e) ? Mo(ye(t), e) : function(n) {
            var i = os(n, t);
            return i === r && i === e ? us(n, t) : On(e, i, T | E);
          };
        }
        function vr(t, e, n, i, o) {
          t !== e && Pi(e, function(c, h) {
            if (o || (o = new he()), gt(c))
              Pf(t, e, h, n, vr, i, o);
            else {
              var _ = i ? i(ji(t, h), c, h + "", t, e, o) : r;
              _ === r && (_ = c), Ii(t, h, _);
            }
          }, Gt);
        }
        function Pf(t, e, n, i, o, c, h) {
          var _ = ji(t, n), w = ji(e, n), S = h.get(w);
          if (S) {
            Ii(t, n, S);
            return;
          }
          var x = c ? c(_, w, n + "", t, e, h) : r, A = x === r;
          if (A) {
            var L = H(w), D = !L && Ge(w), B = !L && !D && _n(w);
            x = w, L || D || B ? H(_) ? x = _ : wt(_) ? x = $t(_) : D ? (A = !1, x = ja(w, !0)) : B ? (A = !1, x = to(w, !0)) : x = [] : Un(w) || en(w) ? (x = _, en(_) ? x = Qo(_) : (!gt(_) || Te(_)) && (x = wo(w))) : A = !1;
          }
          A && (h.set(w, x), o(x, w, i, c, h), h.delete(w)), Ii(t, n, x);
        }
        function qa(t, e) {
          var n = t.length;
          if (n)
            return e += e < 0 ? n : 0, Re(e, n) ? t[e] : r;
        }
        function Ga(t, e, n) {
          e.length ? e = dt(e, function(c) {
            return H(c) ? function(h) {
              return Ve(h, c.length === 1 ? c[0] : c);
            } : c;
          }) : e = [zt];
          var i = -1;
          e = dt(e, Jt(W()));
          var o = Ba(t, function(c, h, _) {
            var w = dt(e, function(S) {
              return S(c);
            });
            return { criteria: w, index: ++i, value: c };
          });
          return tl(o, function(c, h) {
            return $f(c, h, n);
          });
        }
        function Ef(t, e) {
          return za(t, e, function(n, i) {
            return us(t, i);
          });
        }
        function za(t, e, n) {
          for (var i = -1, o = e.length, c = {}; ++i < o; ) {
            var h = e[i], _ = Ve(t, h);
            n(_, h) && Dn(c, $e(h, t), _);
          }
          return c;
        }
        function Rf(t) {
          return function(e) {
            return Ve(e, t);
          };
        }
        function Oi(t, e, n, i) {
          var o = i ? jc : sn, c = -1, h = e.length, _ = t;
          for (t === e && (e = $t(e)), n && (_ = dt(t, Jt(n))); ++c < h; )
            for (var w = 0, S = e[c], x = n ? n(S) : S; (w = o(_, x, w, i)) > -1; )
              _ !== t && or.call(_, w, 1), or.call(t, w, 1);
          return t;
        }
        function Ha(t, e) {
          for (var n = t ? e.length : 0, i = n - 1; n--; ) {
            var o = e[n];
            if (n == i || o !== c) {
              var c = o;
              Re(o) ? or.call(t, o, 1) : Bi(t, o);
            }
          }
          return t;
        }
        function Di(t, e) {
          return t + lr(xa() * (e - t + 1));
        }
        function Tf(t, e, n, i) {
          for (var o = -1, c = xt(cr((e - t) / (n || 1)), 0), h = C(c); c--; )
            h[i ? c : ++o] = t, t += n;
          return h;
        }
        function Ni(t, e) {
          var n = "";
          if (!t || e < 1 || e > ge)
            return n;
          do
            e % 2 && (n += t), e = lr(e / 2), e && (t += t);
          while (e);
          return n;
        }
        function X(t, e) {
          return ts(Co(t, e, zt), t + "");
        }
        function Ff(t) {
          return Pa(vn(t));
        }
        function Lf(t, e) {
          var n = vn(t);
          return Ar(n, Qe(e, 0, n.length));
        }
        function Dn(t, e, n, i) {
          if (!gt(t))
            return t;
          e = $e(e, t);
          for (var o = -1, c = e.length, h = c - 1, _ = t; _ != null && ++o < c; ) {
            var w = ye(e[o]), S = n;
            if (w === "__proto__" || w === "constructor" || w === "prototype")
              return t;
            if (o != h) {
              var x = _[w];
              S = i ? i(x, w, _) : r, S === r && (S = gt(x) ? x : Re(e[o + 1]) ? [] : {});
            }
            Fn(_, w, S), _ = _[w];
          }
          return t;
        }
        var Ka = fr ? function(t, e) {
          return fr.set(t, e), t;
        } : zt, kf = ur ? function(t, e) {
          return ur(t, "toString", {
            configurable: !0,
            enumerable: !1,
            value: ls(e),
            writable: !0
          });
        } : zt;
        function Of(t) {
          return Ar(vn(t));
        }
        function ae(t, e, n) {
          var i = -1, o = t.length;
          e < 0 && (e = -e > o ? 0 : o + e), n = n > o ? o : n, n < 0 && (n += o), o = e > n ? 0 : n - e >>> 0, e >>>= 0;
          for (var c = C(o); ++i < o; )
            c[i] = t[i + e];
          return c;
        }
        function Df(t, e) {
          var n;
          return Be(t, function(i, o, c) {
            return n = e(i, o, c), !n;
          }), !!n;
        }
        function mr(t, e, n) {
          var i = 0, o = t == null ? i : t.length;
          if (typeof e == "number" && e === e && o <= G) {
            for (; i < o; ) {
              var c = i + o >>> 1, h = t[c];
              h !== null && !Xt(h) && (n ? h <= e : h < e) ? i = c + 1 : o = c;
            }
            return o;
          }
          return Wi(t, e, zt, n);
        }
        function Wi(t, e, n, i) {
          var o = 0, c = t == null ? 0 : t.length;
          if (c === 0)
            return 0;
          e = n(e);
          for (var h = e !== e, _ = e === null, w = Xt(e), S = e === r; o < c; ) {
            var x = lr((o + c) / 2), A = n(t[x]), L = A !== r, D = A === null, B = A === A, Y = Xt(A);
            if (h)
              var U = i || B;
            else S ? U = B && (i || L) : _ ? U = B && L && (i || !D) : w ? U = B && L && !D && (i || !Y) : D || Y ? U = !1 : U = i ? A <= e : A < e;
            U ? o = x + 1 : c = x;
          }
          return Et(c, $);
        }
        function Za(t, e) {
          for (var n = -1, i = t.length, o = 0, c = []; ++n < i; ) {
            var h = t[n], _ = e ? e(h) : h;
            if (!n || !pe(_, w)) {
              var w = _;
              c[o++] = h === 0 ? 0 : h;
            }
          }
          return c;
        }
        function Ja(t) {
          return typeof t == "number" ? t : Xt(t) ? Se : +t;
        }
        function Yt(t) {
          if (typeof t == "string")
            return t;
          if (H(t))
            return dt(t, Yt) + "";
          if (Xt(t))
            return Ia ? Ia.call(t) : "";
          var e = t + "";
          return e == "0" && 1 / t == -be ? "-0" : e;
        }
        function Ue(t, e, n) {
          var i = -1, o = Qn, c = t.length, h = !0, _ = [], w = _;
          if (n)
            h = !1, o = pi;
          else if (c >= l) {
            var S = e ? null : Zf(t);
            if (S)
              return jn(S);
            h = !1, o = In, w = new Xe();
          } else
            w = e ? [] : _;
          t:
            for (; ++i < c; ) {
              var x = t[i], A = e ? e(x) : x;
              if (x = n || x !== 0 ? x : 0, h && A === A) {
                for (var L = w.length; L--; )
                  if (w[L] === A)
                    continue t;
                e && w.push(A), _.push(x);
              } else o(w, A, n) || (w !== _ && w.push(A), _.push(x));
            }
          return _;
        }
        function Bi(t, e) {
          return e = $e(e, t), t = bo(t, e), t == null || delete t[ye(oe(e))];
        }
        function Ya(t, e, n, i) {
          return Dn(t, e, n(Ve(t, e)), i);
        }
        function wr(t, e, n, i) {
          for (var o = t.length, c = i ? o : -1; (i ? c-- : ++c < o) && e(t[c], c, t); )
            ;
          return n ? ae(t, i ? 0 : c, i ? c + 1 : o) : ae(t, i ? c + 1 : 0, i ? o : c);
        }
        function Xa(t, e) {
          var n = t;
          return n instanceof j && (n = n.value()), di(e, function(i, o) {
            return o.func.apply(o.thisArg, De([i], o.args));
          }, n);
        }
        function Ui(t, e, n) {
          var i = t.length;
          if (i < 2)
            return i ? Ue(t[0]) : [];
          for (var o = -1, c = C(i); ++o < i; )
            for (var h = t[o], _ = -1; ++_ < i; )
              _ != o && (c[o] = Ln(c[o] || h, t[_], e, n));
          return Ue(Pt(c, 1), e, n);
        }
        function Qa(t, e, n) {
          for (var i = -1, o = t.length, c = e.length, h = {}; ++i < o; ) {
            var _ = i < c ? e[i] : r;
            n(h, t[i], _);
          }
          return h;
        }
        function $i(t) {
          return wt(t) ? t : [];
        }
        function qi(t) {
          return typeof t == "function" ? t : zt;
        }
        function $e(t, e) {
          return H(t) ? t : Qi(t, e) ? [t] : Ao(rt(t));
        }
        var Nf = X;
        function qe(t, e, n) {
          var i = t.length;
          return n = n === r ? i : n, !e && n >= i ? t : ae(t, e, n);
        }
        var Va = bl || function(t) {
          return At.clearTimeout(t);
        };
        function ja(t, e) {
          if (e)
            return t.slice();
          var n = t.length, i = ya ? ya(n) : new t.constructor(n);
          return t.copy(i), i;
        }
        function Gi(t) {
          var e = new t.constructor(t.byteLength);
          return new sr(e).set(new sr(t)), e;
        }
        function Wf(t, e) {
          var n = e ? Gi(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.byteLength);
        }
        function Bf(t) {
          var e = new t.constructor(t.source, Ds.exec(t));
          return e.lastIndex = t.lastIndex, e;
        }
        function Uf(t) {
          return Tn ? at(Tn.call(t)) : {};
        }
        function to(t, e) {
          var n = e ? Gi(t.buffer) : t.buffer;
          return new t.constructor(n, t.byteOffset, t.length);
        }
        function eo(t, e) {
          if (t !== e) {
            var n = t !== r, i = t === null, o = t === t, c = Xt(t), h = e !== r, _ = e === null, w = e === e, S = Xt(e);
            if (!_ && !S && !c && t > e || c && h && w && !_ && !S || i && h && w || !n && w || !o)
              return 1;
            if (!i && !c && !S && t < e || S && n && o && !i && !c || _ && n && o || !h && o || !w)
              return -1;
          }
          return 0;
        }
        function $f(t, e, n) {
          for (var i = -1, o = t.criteria, c = e.criteria, h = o.length, _ = n.length; ++i < h; ) {
            var w = eo(o[i], c[i]);
            if (w) {
              if (i >= _)
                return w;
              var S = n[i];
              return w * (S == "desc" ? -1 : 1);
            }
          }
          return t.index - e.index;
        }
        function no(t, e, n, i) {
          for (var o = -1, c = t.length, h = n.length, _ = -1, w = e.length, S = xt(c - h, 0), x = C(w + S), A = !i; ++_ < w; )
            x[_] = e[_];
          for (; ++o < h; )
            (A || o < c) && (x[n[o]] = t[o]);
          for (; S--; )
            x[_++] = t[o++];
          return x;
        }
        function ro(t, e, n, i) {
          for (var o = -1, c = t.length, h = -1, _ = n.length, w = -1, S = e.length, x = xt(c - _, 0), A = C(x + S), L = !i; ++o < x; )
            A[o] = t[o];
          for (var D = o; ++w < S; )
            A[D + w] = e[w];
          for (; ++h < _; )
            (L || o < c) && (A[D + n[h]] = t[o++]);
          return A;
        }
        function $t(t, e) {
          var n = -1, i = t.length;
          for (e || (e = C(i)); ++n < i; )
            e[n] = t[n];
          return e;
        }
        function we(t, e, n, i) {
          var o = !n;
          n || (n = {});
          for (var c = -1, h = e.length; ++c < h; ) {
            var _ = e[c], w = i ? i(n[_], t[_], _, n, t) : r;
            w === r && (w = t[_]), o ? Ae(n, _, w) : Fn(n, _, w);
          }
          return n;
        }
        function qf(t, e) {
          return we(t, Xi(t), e);
        }
        function Gf(t, e) {
          return we(t, vo(t), e);
        }
        function yr(t, e) {
          return function(n, i) {
            var o = H(n) ? Zc : ff, c = e ? e() : {};
            return o(n, t, W(i, 2), c);
          };
        }
        function pn(t) {
          return X(function(e, n) {
            var i = -1, o = n.length, c = o > 1 ? n[o - 1] : r, h = o > 2 ? n[2] : r;
            for (c = t.length > 3 && typeof c == "function" ? (o--, c) : r, h && Ot(n[0], n[1], h) && (c = o < 3 ? r : c, o = 1), e = at(e); ++i < o; ) {
              var _ = n[i];
              _ && t(e, _, i, c);
            }
            return e;
          });
        }
        function io(t, e) {
          return function(n, i) {
            if (n == null)
              return n;
            if (!qt(n))
              return t(n, i);
            for (var o = n.length, c = e ? o : -1, h = at(n); (e ? c-- : ++c < o) && i(h[c], c, h) !== !1; )
              ;
            return n;
          };
        }
        function so(t) {
          return function(e, n, i) {
            for (var o = -1, c = at(e), h = i(e), _ = h.length; _--; ) {
              var w = h[t ? _ : ++o];
              if (n(c[w], w, c) === !1)
                break;
            }
            return e;
          };
        }
        function zf(t, e, n) {
          var i = e & N, o = Nn(t);
          function c() {
            var h = this && this !== At && this instanceof c ? o : t;
            return h.apply(i ? n : this, arguments);
          }
          return c;
        }
        function ao(t) {
          return function(e) {
            e = rt(e);
            var n = an(e) ? fe(e) : r, i = n ? n[0] : e.charAt(0), o = n ? qe(n, 1).join("") : e.slice(1);
            return i[t]() + o;
          };
        }
        function dn(t) {
          return function(e) {
            return di(su(iu(e).replace(Lc, "")), t, "");
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
            var n = hn(t.prototype), i = t.apply(n, e);
            return gt(i) ? i : n;
          };
        }
        function Hf(t, e, n) {
          var i = Nn(t);
          function o() {
            for (var c = arguments.length, h = C(c), _ = c, w = gn(o); _--; )
              h[_] = arguments[_];
            var S = c < 3 && h[0] !== w && h[c - 1] !== w ? [] : Ne(h, w);
            if (c -= S.length, c < n)
              return fo(
                t,
                e,
                Mr,
                o.placeholder,
                r,
                h,
                S,
                r,
                r,
                n - c
              );
            var x = this && this !== At && this instanceof o ? i : t;
            return Zt(x, this, h);
          }
          return o;
        }
        function oo(t) {
          return function(e, n, i) {
            var o = at(e);
            if (!qt(e)) {
              var c = W(n, 3);
              e = It(e), n = function(_) {
                return c(o[_], _, o);
              };
            }
            var h = t(e, n, i);
            return h > -1 ? o[c ? e[h] : h] : r;
          };
        }
        function uo(t) {
          return Ee(function(e) {
            var n = e.length, i = n, o = ie.prototype.thru;
            for (t && e.reverse(); i--; ) {
              var c = e[i];
              if (typeof c != "function")
                throw new re(d);
              if (o && !h && xr(c) == "wrapper")
                var h = new ie([], !0);
            }
            for (i = h ? i : n; ++i < n; ) {
              c = e[i];
              var _ = xr(c), w = _ == "wrapper" ? Ji(c) : r;
              w && Vi(w[0]) && w[1] == (bt | Z | _t | jt) && !w[4].length && w[9] == 1 ? h = h[xr(w[0])].apply(h, w[3]) : h = c.length == 1 && Vi(c) ? h[_]() : h.thru(c);
            }
            return function() {
              var S = arguments, x = S[0];
              if (h && S.length == 1 && H(x))
                return h.plant(x).value();
              for (var A = 0, L = n ? e[A].apply(this, S) : x; ++A < n; )
                L = e[A].call(this, L);
              return L;
            };
          });
        }
        function Mr(t, e, n, i, o, c, h, _, w, S) {
          var x = e & bt, A = e & N, L = e & q, D = e & (Z | it), B = e & Ht, Y = L ? r : Nn(t);
          function U() {
            for (var V = arguments.length, tt = C(V), Qt = V; Qt--; )
              tt[Qt] = arguments[Qt];
            if (D)
              var Dt = gn(U), Vt = nl(tt, Dt);
            if (i && (tt = no(tt, i, o, D)), c && (tt = ro(tt, c, h, D)), V -= Vt, D && V < S) {
              var yt = Ne(tt, Dt);
              return fo(
                t,
                e,
                Mr,
                U.placeholder,
                n,
                tt,
                yt,
                _,
                w,
                S - V
              );
            }
            var de = A ? n : this, Le = L ? de[t] : t;
            return V = tt.length, _ ? tt = fh(tt, _) : B && V > 1 && tt.reverse(), x && w < V && (tt.length = w), this && this !== At && this instanceof U && (Le = Y || Nn(Le)), Le.apply(de, tt);
          }
          return U;
        }
        function co(t, e) {
          return function(n, i) {
            return wf(n, t, e(i), {});
          };
        }
        function Cr(t, e) {
          return function(n, i) {
            var o;
            if (n === r && i === r)
              return e;
            if (n !== r && (o = n), i !== r) {
              if (o === r)
                return i;
              typeof n == "string" || typeof i == "string" ? (n = Yt(n), i = Yt(i)) : (n = Ja(n), i = Ja(i)), o = t(n, i);
            }
            return o;
          };
        }
        function zi(t) {
          return Ee(function(e) {
            return e = dt(e, Jt(W())), X(function(n) {
              var i = this;
              return t(e, function(o) {
                return Zt(o, i, n);
              });
            });
          });
        }
        function br(t, e) {
          e = e === r ? " " : Yt(e);
          var n = e.length;
          if (n < 2)
            return n ? Ni(e, t) : e;
          var i = Ni(e, cr(t / on(e)));
          return an(e) ? qe(fe(i), 0, t).join("") : i.slice(0, t);
        }
        function Kf(t, e, n, i) {
          var o = e & N, c = Nn(t);
          function h() {
            for (var _ = -1, w = arguments.length, S = -1, x = i.length, A = C(x + w), L = this && this !== At && this instanceof h ? c : t; ++S < x; )
              A[S] = i[S];
            for (; w--; )
              A[S++] = arguments[++_];
            return Zt(L, o ? n : this, A);
          }
          return h;
        }
        function lo(t) {
          return function(e, n, i) {
            return i && typeof i != "number" && Ot(e, n, i) && (n = i = r), e = Fe(e), n === r ? (n = e, e = 0) : n = Fe(n), i = i === r ? e < n ? 1 : -1 : Fe(i), Tf(e, n, i, t);
          };
        }
        function Sr(t) {
          return function(e, n) {
            return typeof e == "string" && typeof n == "string" || (e = ue(e), n = ue(n)), t(e, n);
          };
        }
        function fo(t, e, n, i, o, c, h, _, w, S) {
          var x = e & Z, A = x ? h : r, L = x ? r : h, D = x ? c : r, B = x ? r : c;
          e |= x ? _t : Wt, e &= ~(x ? Wt : _t), e & K || (e &= ~(N | q));
          var Y = [
            t,
            e,
            o,
            D,
            A,
            B,
            L,
            _,
            w,
            S
          ], U = n.apply(r, Y);
          return Vi(t) && So(U, Y), U.placeholder = i, xo(U, t, e);
        }
        function Hi(t) {
          var e = St[t];
          return function(n, i) {
            if (n = ue(n), i = i == null ? 0 : Et(J(i), 292), i && Sa(n)) {
              var o = (rt(n) + "e").split("e"), c = e(o[0] + "e" + (+o[1] + i));
              return o = (rt(c) + "e").split("e"), +(o[0] + "e" + (+o[1] - i));
            }
            return e(n);
          };
        }
        var Zf = ln && 1 / jn(new ln([, -0]))[1] == be ? function(t) {
          return new ln(t);
        } : ps;
        function ho(t) {
          return function(e) {
            var n = Rt(e);
            return n == vt ? Mi(e) : n == pt ? cl(e) : el(e, t(e));
          };
        }
        function Pe(t, e, n, i, o, c, h, _) {
          var w = e & q;
          if (!w && typeof t != "function")
            throw new re(d);
          var S = i ? i.length : 0;
          if (S || (e &= ~(_t | Wt), i = o = r), h = h === r ? h : xt(J(h), 0), _ = _ === r ? _ : J(_), S -= o ? o.length : 0, e & Wt) {
            var x = i, A = o;
            i = o = r;
          }
          var L = w ? r : Ji(t), D = [
            t,
            e,
            n,
            i,
            o,
            x,
            A,
            c,
            h,
            _
          ];
          if (L && uh(D, L), t = D[0], e = D[1], n = D[2], i = D[3], o = D[4], _ = D[9] = D[9] === r ? w ? 0 : t.length : xt(D[9] - S, 0), !_ && e & (Z | it) && (e &= ~(Z | it)), !e || e == N)
            var B = zf(t, e, n);
          else e == Z || e == it ? B = Hf(t, e, _) : (e == _t || e == (N | _t)) && !o.length ? B = Kf(t, e, n, i) : B = Mr.apply(r, D);
          var Y = L ? Ka : So;
          return xo(Y(B, D), t, e);
        }
        function po(t, e, n, i) {
          return t === r || pe(t, cn[n]) && !st.call(i, n) ? e : t;
        }
        function go(t, e, n, i, o, c) {
          return gt(t) && gt(e) && (c.set(e, t), vr(t, e, r, go, c), c.delete(e)), t;
        }
        function Jf(t) {
          return Un(t) ? r : t;
        }
        function _o(t, e, n, i, o, c) {
          var h = n & T, _ = t.length, w = e.length;
          if (_ != w && !(h && w > _))
            return !1;
          var S = c.get(t), x = c.get(e);
          if (S && x)
            return S == e && x == t;
          var A = -1, L = !0, D = n & E ? new Xe() : r;
          for (c.set(t, e), c.set(e, t); ++A < _; ) {
            var B = t[A], Y = e[A];
            if (i)
              var U = h ? i(Y, B, A, e, t, c) : i(B, Y, A, t, e, c);
            if (U !== r) {
              if (U)
                continue;
              L = !1;
              break;
            }
            if (D) {
              if (!gi(e, function(V, tt) {
                if (!In(D, tt) && (B === V || o(B, V, n, i, c)))
                  return D.push(tt);
              })) {
                L = !1;
                break;
              }
            } else if (!(B === Y || o(B, Y, n, i, c))) {
              L = !1;
              break;
            }
          }
          return c.delete(t), c.delete(e), L;
        }
        function Yf(t, e, n, i, o, c, h) {
          switch (n) {
            case nn:
              if (t.byteLength != e.byteLength || t.byteOffset != e.byteOffset)
                return !1;
              t = t.buffer, e = e.buffer;
            case xn:
              return !(t.byteLength != e.byteLength || !c(new sr(t), new sr(e)));
            case ct:
            case Mt:
            case Lt:
              return pe(+t, +e);
            case Ft:
              return t.name == e.name && t.message == e.message;
            case te:
            case ve:
              return t == e + "";
            case vt:
              var _ = Mi;
            case pt:
              var w = i & T;
              if (_ || (_ = jn), t.size != e.size && !w)
                return !1;
              var S = h.get(t);
              if (S)
                return S == e;
              i |= E, h.set(t, e);
              var x = _o(_(t), _(e), i, o, c, h);
              return h.delete(t), x;
            case Zn:
              if (Tn)
                return Tn.call(t) == Tn.call(e);
          }
          return !1;
        }
        function Xf(t, e, n, i, o, c) {
          var h = n & T, _ = Ki(t), w = _.length, S = Ki(e), x = S.length;
          if (w != x && !h)
            return !1;
          for (var A = w; A--; ) {
            var L = _[A];
            if (!(h ? L in e : st.call(e, L)))
              return !1;
          }
          var D = c.get(t), B = c.get(e);
          if (D && B)
            return D == e && B == t;
          var Y = !0;
          c.set(t, e), c.set(e, t);
          for (var U = h; ++A < w; ) {
            L = _[A];
            var V = t[L], tt = e[L];
            if (i)
              var Qt = h ? i(tt, V, L, e, t, c) : i(V, tt, L, t, e, c);
            if (!(Qt === r ? V === tt || o(V, tt, n, i, c) : Qt)) {
              Y = !1;
              break;
            }
            U || (U = L == "constructor");
          }
          if (Y && !U) {
            var Dt = t.constructor, Vt = e.constructor;
            Dt != Vt && "constructor" in t && "constructor" in e && !(typeof Dt == "function" && Dt instanceof Dt && typeof Vt == "function" && Vt instanceof Vt) && (Y = !1);
          }
          return c.delete(t), c.delete(e), Y;
        }
        function Ee(t) {
          return ts(Co(t, r, To), t + "");
        }
        function Ki(t) {
          return Oa(t, It, Xi);
        }
        function Zi(t) {
          return Oa(t, Gt, vo);
        }
        var Ji = fr ? function(t) {
          return fr.get(t);
        } : ps;
        function xr(t) {
          for (var e = t.name + "", n = fn[e], i = st.call(fn, e) ? n.length : 0; i--; ) {
            var o = n[i], c = o.func;
            if (c == null || c == t)
              return o.name;
          }
          return e;
        }
        function gn(t) {
          var e = st.call(u, "placeholder") ? u : t;
          return e.placeholder;
        }
        function W() {
          var t = u.iteratee || fs;
          return t = t === fs ? Wa : t, arguments.length ? t(arguments[0], arguments[1]) : t;
        }
        function Ir(t, e) {
          var n = t.__data__;
          return ih(e) ? n[typeof e == "string" ? "string" : "hash"] : n.map;
        }
        function Yi(t) {
          for (var e = It(t), n = e.length; n--; ) {
            var i = e[n], o = t[i];
            e[n] = [i, o, yo(o)];
          }
          return e;
        }
        function je(t, e) {
          var n = al(t, e);
          return Na(n) ? n : r;
        }
        function Qf(t) {
          var e = st.call(t, Je), n = t[Je];
          try {
            t[Je] = r;
            var i = !0;
          } catch {
          }
          var o = rr.call(t);
          return i && (e ? t[Je] = n : delete t[Je]), o;
        }
        var Xi = bi ? function(t) {
          return t == null ? [] : (t = at(t), Oe(bi(t), function(e) {
            return Ca.call(t, e);
          }));
        } : ds, vo = bi ? function(t) {
          for (var e = []; t; )
            De(e, Xi(t)), t = ar(t);
          return e;
        } : ds, Rt = kt;
        (Si && Rt(new Si(new ArrayBuffer(1))) != nn || Pn && Rt(new Pn()) != vt || xi && Rt(xi.resolve()) != Ut || ln && Rt(new ln()) != pt || En && Rt(new En()) != Sn) && (Rt = function(t) {
          var e = kt(t), n = e == Ct ? t.constructor : r, i = n ? tn(n) : "";
          if (i)
            switch (i) {
              case Fl:
                return nn;
              case Ll:
                return vt;
              case kl:
                return Ut;
              case Ol:
                return pt;
              case Dl:
                return Sn;
            }
          return e;
        });
        function Vf(t, e, n) {
          for (var i = -1, o = n.length; ++i < o; ) {
            var c = n[i], h = c.size;
            switch (c.type) {
              case "drop":
                t += h;
                break;
              case "dropRight":
                e -= h;
                break;
              case "take":
                e = Et(e, t + h);
                break;
              case "takeRight":
                t = xt(t, e - h);
                break;
            }
          }
          return { start: t, end: e };
        }
        function jf(t) {
          var e = t.match(ic);
          return e ? e[1].split(sc) : [];
        }
        function mo(t, e, n) {
          e = $e(e, t);
          for (var i = -1, o = e.length, c = !1; ++i < o; ) {
            var h = ye(e[i]);
            if (!(c = t != null && n(t, h)))
              break;
            t = t[h];
          }
          return c || ++i != o ? c : (o = t == null ? 0 : t.length, !!o && Lr(o) && Re(h, o) && (H(t) || en(t)));
        }
        function th(t) {
          var e = t.length, n = new t.constructor(e);
          return e && typeof t[0] == "string" && st.call(t, "index") && (n.index = t.index, n.input = t.input), n;
        }
        function wo(t) {
          return typeof t.constructor == "function" && !Wn(t) ? hn(ar(t)) : {};
        }
        function eh(t, e, n) {
          var i = t.constructor;
          switch (e) {
            case xn:
              return Gi(t);
            case ct:
            case Mt:
              return new i(+t);
            case nn:
              return Wf(t, n);
            case Yr:
            case Xr:
            case Qr:
            case Vr:
            case jr:
            case ti:
            case ei:
            case ni:
            case ri:
              return to(t, n);
            case vt:
              return new i();
            case Lt:
            case ve:
              return new i(t);
            case te:
              return Bf(t);
            case pt:
              return new i();
            case Zn:
              return Uf(t);
          }
        }
        function nh(t, e) {
          var n = e.length;
          if (!n)
            return t;
          var i = n - 1;
          return e[i] = (n > 1 ? "& " : "") + e[i], e = e.join(n > 2 ? ", " : " "), t.replace(rc, `{
/* [wrapped with ` + e + `] */
`);
        }
        function rh(t) {
          return H(t) || en(t) || !!(ba && t && t[ba]);
        }
        function Re(t, e) {
          var n = typeof t;
          return e = e ?? ge, !!e && (n == "number" || n != "symbol" && dc.test(t)) && t > -1 && t % 1 == 0 && t < e;
        }
        function Ot(t, e, n) {
          if (!gt(n))
            return !1;
          var i = typeof e;
          return (i == "number" ? qt(n) && Re(e, n.length) : i == "string" && e in n) ? pe(n[e], t) : !1;
        }
        function Qi(t, e) {
          if (H(t))
            return !1;
          var n = typeof t;
          return n == "number" || n == "symbol" || n == "boolean" || t == null || Xt(t) ? !0 : ju.test(t) || !Vu.test(t) || e != null && t in at(e);
        }
        function ih(t) {
          var e = typeof t;
          return e == "string" || e == "number" || e == "symbol" || e == "boolean" ? t !== "__proto__" : t === null;
        }
        function Vi(t) {
          var e = xr(t), n = u[e];
          if (typeof n != "function" || !(e in j.prototype))
            return !1;
          if (t === n)
            return !0;
          var i = Ji(n);
          return !!i && t === i[0];
        }
        function sh(t) {
          return !!wa && wa in t;
        }
        var ah = er ? Te : gs;
        function Wn(t) {
          var e = t && t.constructor, n = typeof e == "function" && e.prototype || cn;
          return t === n;
        }
        function yo(t) {
          return t === t && !gt(t);
        }
        function Mo(t, e) {
          return function(n) {
            return n == null ? !1 : n[t] === e && (e !== r || t in at(n));
          };
        }
        function oh(t) {
          var e = Tr(t, function(i) {
            return n.size === M && n.clear(), i;
          }), n = e.cache;
          return e;
        }
        function uh(t, e) {
          var n = t[1], i = e[1], o = n | i, c = o < (N | q | bt), h = i == bt && n == Z || i == bt && n == jt && t[7].length <= e[8] || i == (bt | jt) && e[7].length <= e[8] && n == Z;
          if (!(c || h))
            return t;
          i & N && (t[2] = e[2], o |= n & N ? 0 : K);
          var _ = e[3];
          if (_) {
            var w = t[3];
            t[3] = w ? no(w, _, e[4]) : _, t[4] = w ? Ne(t[3], I) : e[4];
          }
          return _ = e[5], _ && (w = t[5], t[5] = w ? ro(w, _, e[6]) : _, t[6] = w ? Ne(t[5], I) : e[6]), _ = e[7], _ && (t[7] = _), i & bt && (t[8] = t[8] == null ? e[8] : Et(t[8], e[8])), t[9] == null && (t[9] = e[9]), t[0] = e[0], t[1] = o, t;
        }
        function ch(t) {
          var e = [];
          if (t != null)
            for (var n in at(t))
              e.push(n);
          return e;
        }
        function lh(t) {
          return rr.call(t);
        }
        function Co(t, e, n) {
          return e = xt(e === r ? t.length - 1 : e, 0), function() {
            for (var i = arguments, o = -1, c = xt(i.length - e, 0), h = C(c); ++o < c; )
              h[o] = i[e + o];
            o = -1;
            for (var _ = C(e + 1); ++o < e; )
              _[o] = i[o];
            return _[e] = n(h), Zt(t, this, _);
          };
        }
        function bo(t, e) {
          return e.length < 2 ? t : Ve(t, ae(e, 0, -1));
        }
        function fh(t, e) {
          for (var n = t.length, i = Et(e.length, n), o = $t(t); i--; ) {
            var c = e[i];
            t[i] = Re(c, n) ? o[c] : r;
          }
          return t;
        }
        function ji(t, e) {
          if (!(e === "constructor" && typeof t[e] == "function") && e != "__proto__")
            return t[e];
        }
        var So = Io(Ka), Bn = xl || function(t, e) {
          return At.setTimeout(t, e);
        }, ts = Io(kf);
        function xo(t, e, n) {
          var i = e + "";
          return ts(t, nh(i, hh(jf(i), n)));
        }
        function Io(t) {
          var e = 0, n = 0;
          return function() {
            var i = El(), o = Zr - (i - n);
            if (n = i, o > 0) {
              if (++e >= zn)
                return arguments[0];
            } else
              e = 0;
            return t.apply(r, arguments);
          };
        }
        function Ar(t, e) {
          var n = -1, i = t.length, o = i - 1;
          for (e = e === r ? i : e; ++n < e; ) {
            var c = Di(n, o), h = t[c];
            t[c] = t[n], t[n] = h;
          }
          return t.length = e, t;
        }
        var Ao = oh(function(t) {
          var e = [];
          return t.charCodeAt(0) === 46 && e.push(""), t.replace(tc, function(n, i, o, c) {
            e.push(o ? c.replace(uc, "$1") : i || n);
          }), e;
        });
        function ye(t) {
          if (typeof t == "string" || Xt(t))
            return t;
          var e = t + "";
          return e == "0" && 1 / t == -be ? "-0" : e;
        }
        function tn(t) {
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
        function hh(t, e) {
          return ne(ft, function(n) {
            var i = "_." + n[0];
            e & n[1] && !Qn(t, i) && t.push(i);
          }), t.sort();
        }
        function Po(t) {
          if (t instanceof j)
            return t.clone();
          var e = new ie(t.__wrapped__, t.__chain__);
          return e.__actions__ = $t(t.__actions__), e.__index__ = t.__index__, e.__values__ = t.__values__, e;
        }
        function ph(t, e, n) {
          (n ? Ot(t, e, n) : e === r) ? e = 1 : e = xt(J(e), 0);
          var i = t == null ? 0 : t.length;
          if (!i || e < 1)
            return [];
          for (var o = 0, c = 0, h = C(cr(i / e)); o < i; )
            h[c++] = ae(t, o, o += e);
          return h;
        }
        function dh(t) {
          for (var e = -1, n = t == null ? 0 : t.length, i = 0, o = []; ++e < n; ) {
            var c = t[e];
            c && (o[i++] = c);
          }
          return o;
        }
        function gh() {
          var t = arguments.length;
          if (!t)
            return [];
          for (var e = C(t - 1), n = arguments[0], i = t; i--; )
            e[i - 1] = arguments[i];
          return De(H(n) ? $t(n) : [n], Pt(e, 1));
        }
        var _h = X(function(t, e) {
          return wt(t) ? Ln(t, Pt(e, 1, wt, !0)) : [];
        }), vh = X(function(t, e) {
          var n = oe(e);
          return wt(n) && (n = r), wt(t) ? Ln(t, Pt(e, 1, wt, !0), W(n, 2)) : [];
        }), mh = X(function(t, e) {
          var n = oe(e);
          return wt(n) && (n = r), wt(t) ? Ln(t, Pt(e, 1, wt, !0), r, n) : [];
        });
        function wh(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (e = n || e === r ? 1 : J(e), ae(t, e < 0 ? 0 : e, i)) : [];
        }
        function yh(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (e = n || e === r ? 1 : J(e), e = i - e, ae(t, 0, e < 0 ? 0 : e)) : [];
        }
        function Mh(t, e) {
          return t && t.length ? wr(t, W(e, 3), !0, !0) : [];
        }
        function Ch(t, e) {
          return t && t.length ? wr(t, W(e, 3), !0) : [];
        }
        function bh(t, e, n, i) {
          var o = t == null ? 0 : t.length;
          return o ? (n && typeof n != "number" && Ot(t, e, n) && (n = 0, i = o), gf(t, e, n, i)) : [];
        }
        function Eo(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = n == null ? 0 : J(n);
          return o < 0 && (o = xt(i + o, 0)), Vn(t, W(e, 3), o);
        }
        function Ro(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = i - 1;
          return n !== r && (o = J(n), o = n < 0 ? xt(i + o, 0) : Et(o, i - 1)), Vn(t, W(e, 3), o, !0);
        }
        function To(t) {
          var e = t == null ? 0 : t.length;
          return e ? Pt(t, 1) : [];
        }
        function Sh(t) {
          var e = t == null ? 0 : t.length;
          return e ? Pt(t, be) : [];
        }
        function xh(t, e) {
          var n = t == null ? 0 : t.length;
          return n ? (e = e === r ? 1 : J(e), Pt(t, e)) : [];
        }
        function Ih(t) {
          for (var e = -1, n = t == null ? 0 : t.length, i = {}; ++e < n; ) {
            var o = t[e];
            i[o[0]] = o[1];
          }
          return i;
        }
        function Fo(t) {
          return t && t.length ? t[0] : r;
        }
        function Ah(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = n == null ? 0 : J(n);
          return o < 0 && (o = xt(i + o, 0)), sn(t, e, o);
        }
        function Ph(t) {
          var e = t == null ? 0 : t.length;
          return e ? ae(t, 0, -1) : [];
        }
        var Eh = X(function(t) {
          var e = dt(t, $i);
          return e.length && e[0] === t[0] ? Ti(e) : [];
        }), Rh = X(function(t) {
          var e = oe(t), n = dt(t, $i);
          return e === oe(n) ? e = r : n.pop(), n.length && n[0] === t[0] ? Ti(n, W(e, 2)) : [];
        }), Th = X(function(t) {
          var e = oe(t), n = dt(t, $i);
          return e = typeof e == "function" ? e : r, e && n.pop(), n.length && n[0] === t[0] ? Ti(n, r, e) : [];
        });
        function Fh(t, e) {
          return t == null ? "" : Al.call(t, e);
        }
        function oe(t) {
          var e = t == null ? 0 : t.length;
          return e ? t[e - 1] : r;
        }
        function Lh(t, e, n) {
          var i = t == null ? 0 : t.length;
          if (!i)
            return -1;
          var o = i;
          return n !== r && (o = J(n), o = o < 0 ? xt(i + o, 0) : Et(o, i - 1)), e === e ? fl(t, e, o) : Vn(t, fa, o, !0);
        }
        function kh(t, e) {
          return t && t.length ? qa(t, J(e)) : r;
        }
        var Oh = X(Lo);
        function Lo(t, e) {
          return t && t.length && e && e.length ? Oi(t, e) : t;
        }
        function Dh(t, e, n) {
          return t && t.length && e && e.length ? Oi(t, e, W(n, 2)) : t;
        }
        function Nh(t, e, n) {
          return t && t.length && e && e.length ? Oi(t, e, r, n) : t;
        }
        var Wh = Ee(function(t, e) {
          var n = t == null ? 0 : t.length, i = Ai(t, e);
          return Ha(t, dt(e, function(o) {
            return Re(o, n) ? +o : o;
          }).sort(eo)), i;
        });
        function Bh(t, e) {
          var n = [];
          if (!(t && t.length))
            return n;
          var i = -1, o = [], c = t.length;
          for (e = W(e, 3); ++i < c; ) {
            var h = t[i];
            e(h, i, t) && (n.push(h), o.push(i));
          }
          return Ha(t, o), n;
        }
        function es(t) {
          return t == null ? t : Tl.call(t);
        }
        function Uh(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (n && typeof n != "number" && Ot(t, e, n) ? (e = 0, n = i) : (e = e == null ? 0 : J(e), n = n === r ? i : J(n)), ae(t, e, n)) : [];
        }
        function $h(t, e) {
          return mr(t, e);
        }
        function qh(t, e, n) {
          return Wi(t, e, W(n, 2));
        }
        function Gh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var i = mr(t, e);
            if (i < n && pe(t[i], e))
              return i;
          }
          return -1;
        }
        function zh(t, e) {
          return mr(t, e, !0);
        }
        function Hh(t, e, n) {
          return Wi(t, e, W(n, 2), !0);
        }
        function Kh(t, e) {
          var n = t == null ? 0 : t.length;
          if (n) {
            var i = mr(t, e, !0) - 1;
            if (pe(t[i], e))
              return i;
          }
          return -1;
        }
        function Zh(t) {
          return t && t.length ? Za(t) : [];
        }
        function Jh(t, e) {
          return t && t.length ? Za(t, W(e, 2)) : [];
        }
        function Yh(t) {
          var e = t == null ? 0 : t.length;
          return e ? ae(t, 1, e) : [];
        }
        function Xh(t, e, n) {
          return t && t.length ? (e = n || e === r ? 1 : J(e), ae(t, 0, e < 0 ? 0 : e)) : [];
        }
        function Qh(t, e, n) {
          var i = t == null ? 0 : t.length;
          return i ? (e = n || e === r ? 1 : J(e), e = i - e, ae(t, e < 0 ? 0 : e, i)) : [];
        }
        function Vh(t, e) {
          return t && t.length ? wr(t, W(e, 3), !1, !0) : [];
        }
        function jh(t, e) {
          return t && t.length ? wr(t, W(e, 3)) : [];
        }
        var tp = X(function(t) {
          return Ue(Pt(t, 1, wt, !0));
        }), ep = X(function(t) {
          var e = oe(t);
          return wt(e) && (e = r), Ue(Pt(t, 1, wt, !0), W(e, 2));
        }), np = X(function(t) {
          var e = oe(t);
          return e = typeof e == "function" ? e : r, Ue(Pt(t, 1, wt, !0), r, e);
        });
        function rp(t) {
          return t && t.length ? Ue(t) : [];
        }
        function ip(t, e) {
          return t && t.length ? Ue(t, W(e, 2)) : [];
        }
        function sp(t, e) {
          return e = typeof e == "function" ? e : r, t && t.length ? Ue(t, r, e) : [];
        }
        function ns(t) {
          if (!(t && t.length))
            return [];
          var e = 0;
          return t = Oe(t, function(n) {
            if (wt(n))
              return e = xt(n.length, e), !0;
          }), wi(e, function(n) {
            return dt(t, _i(n));
          });
        }
        function ko(t, e) {
          if (!(t && t.length))
            return [];
          var n = ns(t);
          return e == null ? n : dt(n, function(i) {
            return Zt(e, r, i);
          });
        }
        var ap = X(function(t, e) {
          return wt(t) ? Ln(t, e) : [];
        }), op = X(function(t) {
          return Ui(Oe(t, wt));
        }), up = X(function(t) {
          var e = oe(t);
          return wt(e) && (e = r), Ui(Oe(t, wt), W(e, 2));
        }), cp = X(function(t) {
          var e = oe(t);
          return e = typeof e == "function" ? e : r, Ui(Oe(t, wt), r, e);
        }), lp = X(ns);
        function fp(t, e) {
          return Qa(t || [], e || [], Fn);
        }
        function hp(t, e) {
          return Qa(t || [], e || [], Dn);
        }
        var pp = X(function(t) {
          var e = t.length, n = e > 1 ? t[e - 1] : r;
          return n = typeof n == "function" ? (t.pop(), n) : r, ko(t, n);
        });
        function Oo(t) {
          var e = u(t);
          return e.__chain__ = !0, e;
        }
        function dp(t, e) {
          return e(t), t;
        }
        function Pr(t, e) {
          return e(t);
        }
        var gp = Ee(function(t) {
          var e = t.length, n = e ? t[0] : 0, i = this.__wrapped__, o = function(c) {
            return Ai(c, t);
          };
          return e > 1 || this.__actions__.length || !(i instanceof j) || !Re(n) ? this.thru(o) : (i = i.slice(n, +n + (e ? 1 : 0)), i.__actions__.push({
            func: Pr,
            args: [o],
            thisArg: r
          }), new ie(i, this.__chain__).thru(function(c) {
            return e && !c.length && c.push(r), c;
          }));
        });
        function _p() {
          return Oo(this);
        }
        function vp() {
          return new ie(this.value(), this.__chain__);
        }
        function mp() {
          this.__values__ === r && (this.__values__ = Yo(this.value()));
          var t = this.__index__ >= this.__values__.length, e = t ? r : this.__values__[this.__index__++];
          return { done: t, value: e };
        }
        function wp() {
          return this;
        }
        function yp(t) {
          for (var e, n = this; n instanceof pr; ) {
            var i = Po(n);
            i.__index__ = 0, i.__values__ = r, e ? o.__wrapped__ = i : e = i;
            var o = i;
            n = n.__wrapped__;
          }
          return o.__wrapped__ = t, e;
        }
        function Mp() {
          var t = this.__wrapped__;
          if (t instanceof j) {
            var e = t;
            return this.__actions__.length && (e = new j(this)), e = e.reverse(), e.__actions__.push({
              func: Pr,
              args: [es],
              thisArg: r
            }), new ie(e, this.__chain__);
          }
          return this.thru(es);
        }
        function Cp() {
          return Xa(this.__wrapped__, this.__actions__);
        }
        var bp = yr(function(t, e, n) {
          st.call(t, n) ? ++t[n] : Ae(t, n, 1);
        });
        function Sp(t, e, n) {
          var i = H(t) ? ca : df;
          return n && Ot(t, e, n) && (e = r), i(t, W(e, 3));
        }
        function xp(t, e) {
          var n = H(t) ? Oe : La;
          return n(t, W(e, 3));
        }
        var Ip = oo(Eo), Ap = oo(Ro);
        function Pp(t, e) {
          return Pt(Er(t, e), 1);
        }
        function Ep(t, e) {
          return Pt(Er(t, e), be);
        }
        function Rp(t, e, n) {
          return n = n === r ? 1 : J(n), Pt(Er(t, e), n);
        }
        function Do(t, e) {
          var n = H(t) ? ne : Be;
          return n(t, W(e, 3));
        }
        function No(t, e) {
          var n = H(t) ? Jc : Fa;
          return n(t, W(e, 3));
        }
        var Tp = yr(function(t, e, n) {
          st.call(t, n) ? t[n].push(e) : Ae(t, n, [e]);
        });
        function Fp(t, e, n, i) {
          t = qt(t) ? t : vn(t), n = n && !i ? J(n) : 0;
          var o = t.length;
          return n < 0 && (n = xt(o + n, 0)), kr(t) ? n <= o && t.indexOf(e, n) > -1 : !!o && sn(t, e, n) > -1;
        }
        var Lp = X(function(t, e, n) {
          var i = -1, o = typeof e == "function", c = qt(t) ? C(t.length) : [];
          return Be(t, function(h) {
            c[++i] = o ? Zt(e, h, n) : kn(h, e, n);
          }), c;
        }), kp = yr(function(t, e, n) {
          Ae(t, n, e);
        });
        function Er(t, e) {
          var n = H(t) ? dt : Ba;
          return n(t, W(e, 3));
        }
        function Op(t, e, n, i) {
          return t == null ? [] : (H(e) || (e = e == null ? [] : [e]), n = i ? r : n, H(n) || (n = n == null ? [] : [n]), Ga(t, e, n));
        }
        var Dp = yr(function(t, e, n) {
          t[n ? 0 : 1].push(e);
        }, function() {
          return [[], []];
        });
        function Np(t, e, n) {
          var i = H(t) ? di : pa, o = arguments.length < 3;
          return i(t, W(e, 4), n, o, Be);
        }
        function Wp(t, e, n) {
          var i = H(t) ? Yc : pa, o = arguments.length < 3;
          return i(t, W(e, 4), n, o, Fa);
        }
        function Bp(t, e) {
          var n = H(t) ? Oe : La;
          return n(t, Fr(W(e, 3)));
        }
        function Up(t) {
          var e = H(t) ? Pa : Ff;
          return e(t);
        }
        function $p(t, e, n) {
          (n ? Ot(t, e, n) : e === r) ? e = 1 : e = J(e);
          var i = H(t) ? cf : Lf;
          return i(t, e);
        }
        function qp(t) {
          var e = H(t) ? lf : Of;
          return e(t);
        }
        function Gp(t) {
          if (t == null)
            return 0;
          if (qt(t))
            return kr(t) ? on(t) : t.length;
          var e = Rt(t);
          return e == vt || e == pt ? t.size : Li(t).length;
        }
        function zp(t, e, n) {
          var i = H(t) ? gi : Df;
          return n && Ot(t, e, n) && (e = r), i(t, W(e, 3));
        }
        var Hp = X(function(t, e) {
          if (t == null)
            return [];
          var n = e.length;
          return n > 1 && Ot(t, e[0], e[1]) ? e = [] : n > 2 && Ot(e[0], e[1], e[2]) && (e = [e[0]]), Ga(t, Pt(e, 1), []);
        }), Rr = Sl || function() {
          return At.Date.now();
        };
        function Kp(t, e) {
          if (typeof e != "function")
            throw new re(d);
          return t = J(t), function() {
            if (--t < 1)
              return e.apply(this, arguments);
          };
        }
        function Wo(t, e, n) {
          return e = n ? r : e, e = t && e == null ? t.length : e, Pe(t, bt, r, r, r, r, e);
        }
        function Bo(t, e) {
          var n;
          if (typeof e != "function")
            throw new re(d);
          return t = J(t), function() {
            return --t > 0 && (n = e.apply(this, arguments)), t <= 1 && (e = r), n;
          };
        }
        var rs = X(function(t, e, n) {
          var i = N;
          if (n.length) {
            var o = Ne(n, gn(rs));
            i |= _t;
          }
          return Pe(t, i, e, n, o);
        }), Uo = X(function(t, e, n) {
          var i = N | q;
          if (n.length) {
            var o = Ne(n, gn(Uo));
            i |= _t;
          }
          return Pe(e, i, t, n, o);
        });
        function $o(t, e, n) {
          e = n ? r : e;
          var i = Pe(t, Z, r, r, r, r, r, e);
          return i.placeholder = $o.placeholder, i;
        }
        function qo(t, e, n) {
          e = n ? r : e;
          var i = Pe(t, it, r, r, r, r, r, e);
          return i.placeholder = qo.placeholder, i;
        }
        function Go(t, e, n) {
          var i, o, c, h, _, w, S = 0, x = !1, A = !1, L = !0;
          if (typeof t != "function")
            throw new re(d);
          e = ue(e) || 0, gt(n) && (x = !!n.leading, A = "maxWait" in n, c = A ? xt(ue(n.maxWait) || 0, e) : c, L = "trailing" in n ? !!n.trailing : L);
          function D(yt) {
            var de = i, Le = o;
            return i = o = r, S = yt, h = t.apply(Le, de), h;
          }
          function B(yt) {
            return S = yt, _ = Bn(V, e), x ? D(yt) : h;
          }
          function Y(yt) {
            var de = yt - w, Le = yt - S, uu = e - de;
            return A ? Et(uu, c - Le) : uu;
          }
          function U(yt) {
            var de = yt - w, Le = yt - S;
            return w === r || de >= e || de < 0 || A && Le >= c;
          }
          function V() {
            var yt = Rr();
            if (U(yt))
              return tt(yt);
            _ = Bn(V, Y(yt));
          }
          function tt(yt) {
            return _ = r, L && i ? D(yt) : (i = o = r, h);
          }
          function Qt() {
            _ !== r && Va(_), S = 0, i = w = o = _ = r;
          }
          function Dt() {
            return _ === r ? h : tt(Rr());
          }
          function Vt() {
            var yt = Rr(), de = U(yt);
            if (i = arguments, o = this, w = yt, de) {
              if (_ === r)
                return B(w);
              if (A)
                return Va(_), _ = Bn(V, e), D(w);
            }
            return _ === r && (_ = Bn(V, e)), h;
          }
          return Vt.cancel = Qt, Vt.flush = Dt, Vt;
        }
        var Zp = X(function(t, e) {
          return Ta(t, 1, e);
        }), Jp = X(function(t, e, n) {
          return Ta(t, ue(e) || 0, n);
        });
        function Yp(t) {
          return Pe(t, Ht);
        }
        function Tr(t, e) {
          if (typeof t != "function" || e != null && typeof e != "function")
            throw new re(d);
          var n = function() {
            var i = arguments, o = e ? e.apply(this, i) : i[0], c = n.cache;
            if (c.has(o))
              return c.get(o);
            var h = t.apply(this, i);
            return n.cache = c.set(o, h) || c, h;
          };
          return n.cache = new (Tr.Cache || Ie)(), n;
        }
        Tr.Cache = Ie;
        function Fr(t) {
          if (typeof t != "function")
            throw new re(d);
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
        function Xp(t) {
          return Bo(2, t);
        }
        var Qp = Nf(function(t, e) {
          e = e.length == 1 && H(e[0]) ? dt(e[0], Jt(W())) : dt(Pt(e, 1), Jt(W()));
          var n = e.length;
          return X(function(i) {
            for (var o = -1, c = Et(i.length, n); ++o < c; )
              i[o] = e[o].call(this, i[o]);
            return Zt(t, this, i);
          });
        }), is = X(function(t, e) {
          var n = Ne(e, gn(is));
          return Pe(t, _t, r, e, n);
        }), zo = X(function(t, e) {
          var n = Ne(e, gn(zo));
          return Pe(t, Wt, r, e, n);
        }), Vp = Ee(function(t, e) {
          return Pe(t, jt, r, r, r, e);
        });
        function jp(t, e) {
          if (typeof t != "function")
            throw new re(d);
          return e = e === r ? e : J(e), X(t, e);
        }
        function td(t, e) {
          if (typeof t != "function")
            throw new re(d);
          return e = e == null ? 0 : xt(J(e), 0), X(function(n) {
            var i = n[e], o = qe(n, 0, e);
            return i && De(o, i), Zt(t, this, o);
          });
        }
        function ed(t, e, n) {
          var i = !0, o = !0;
          if (typeof t != "function")
            throw new re(d);
          return gt(n) && (i = "leading" in n ? !!n.leading : i, o = "trailing" in n ? !!n.trailing : o), Go(t, e, {
            leading: i,
            maxWait: e,
            trailing: o
          });
        }
        function nd(t) {
          return Wo(t, 1);
        }
        function rd(t, e) {
          return is(qi(e), t);
        }
        function id() {
          if (!arguments.length)
            return [];
          var t = arguments[0];
          return H(t) ? t : [t];
        }
        function sd(t) {
          return se(t, F);
        }
        function ad(t, e) {
          return e = typeof e == "function" ? e : r, se(t, F, e);
        }
        function od(t) {
          return se(t, m | F);
        }
        function ud(t, e) {
          return e = typeof e == "function" ? e : r, se(t, m | F, e);
        }
        function cd(t, e) {
          return e == null || Ra(t, e, It(e));
        }
        function pe(t, e) {
          return t === e || t !== t && e !== e;
        }
        var ld = Sr(Ri), fd = Sr(function(t, e) {
          return t >= e;
        }), en = Da(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Da : function(t) {
          return mt(t) && st.call(t, "callee") && !Ca.call(t, "callee");
        }, H = C.isArray, hd = ra ? Jt(ra) : yf;
        function qt(t) {
          return t != null && Lr(t.length) && !Te(t);
        }
        function wt(t) {
          return mt(t) && qt(t);
        }
        function pd(t) {
          return t === !0 || t === !1 || mt(t) && kt(t) == ct;
        }
        var Ge = Il || gs, dd = ia ? Jt(ia) : Mf;
        function gd(t) {
          return mt(t) && t.nodeType === 1 && !Un(t);
        }
        function _d(t) {
          if (t == null)
            return !0;
          if (qt(t) && (H(t) || typeof t == "string" || typeof t.splice == "function" || Ge(t) || _n(t) || en(t)))
            return !t.length;
          var e = Rt(t);
          if (e == vt || e == pt)
            return !t.size;
          if (Wn(t))
            return !Li(t).length;
          for (var n in t)
            if (st.call(t, n))
              return !1;
          return !0;
        }
        function vd(t, e) {
          return On(t, e);
        }
        function md(t, e, n) {
          n = typeof n == "function" ? n : r;
          var i = n ? n(t, e) : r;
          return i === r ? On(t, e, r, n) : !!i;
        }
        function ss(t) {
          if (!mt(t))
            return !1;
          var e = kt(t);
          return e == Ft || e == Kt || typeof t.message == "string" && typeof t.name == "string" && !Un(t);
        }
        function wd(t) {
          return typeof t == "number" && Sa(t);
        }
        function Te(t) {
          if (!gt(t))
            return !1;
          var e = kt(t);
          return e == Bt || e == _e || e == ot || e == le;
        }
        function Ho(t) {
          return typeof t == "number" && t == J(t);
        }
        function Lr(t) {
          return typeof t == "number" && t > -1 && t % 1 == 0 && t <= ge;
        }
        function gt(t) {
          var e = typeof t;
          return t != null && (e == "object" || e == "function");
        }
        function mt(t) {
          return t != null && typeof t == "object";
        }
        var Ko = sa ? Jt(sa) : bf;
        function yd(t, e) {
          return t === e || Fi(t, e, Yi(e));
        }
        function Md(t, e, n) {
          return n = typeof n == "function" ? n : r, Fi(t, e, Yi(e), n);
        }
        function Cd(t) {
          return Zo(t) && t != +t;
        }
        function bd(t) {
          if (ah(t))
            throw new z(p);
          return Na(t);
        }
        function Sd(t) {
          return t === null;
        }
        function xd(t) {
          return t == null;
        }
        function Zo(t) {
          return typeof t == "number" || mt(t) && kt(t) == Lt;
        }
        function Un(t) {
          if (!mt(t) || kt(t) != Ct)
            return !1;
          var e = ar(t);
          if (e === null)
            return !0;
          var n = st.call(e, "constructor") && e.constructor;
          return typeof n == "function" && n instanceof n && nr.call(n) == yl;
        }
        var as = aa ? Jt(aa) : Sf;
        function Id(t) {
          return Ho(t) && t >= -ge && t <= ge;
        }
        var Jo = oa ? Jt(oa) : xf;
        function kr(t) {
          return typeof t == "string" || !H(t) && mt(t) && kt(t) == ve;
        }
        function Xt(t) {
          return typeof t == "symbol" || mt(t) && kt(t) == Zn;
        }
        var _n = ua ? Jt(ua) : If;
        function Ad(t) {
          return t === r;
        }
        function Pd(t) {
          return mt(t) && Rt(t) == Sn;
        }
        function Ed(t) {
          return mt(t) && kt(t) == zu;
        }
        var Rd = Sr(ki), Td = Sr(function(t, e) {
          return t <= e;
        });
        function Yo(t) {
          if (!t)
            return [];
          if (qt(t))
            return kr(t) ? fe(t) : $t(t);
          if (An && t[An])
            return ul(t[An]());
          var e = Rt(t), n = e == vt ? Mi : e == pt ? jn : vn;
          return n(t);
        }
        function Fe(t) {
          if (!t)
            return t === 0 ? t : 0;
          if (t = ue(t), t === be || t === -be) {
            var e = t < 0 ? -1 : 1;
            return e * Kn;
          }
          return t === t ? t : 0;
        }
        function J(t) {
          var e = Fe(t), n = e % 1;
          return e === e ? n ? e - n : e : 0;
        }
        function Xo(t) {
          return t ? Qe(J(t), 0, k) : 0;
        }
        function ue(t) {
          if (typeof t == "number")
            return t;
          if (Xt(t))
            return Se;
          if (gt(t)) {
            var e = typeof t.valueOf == "function" ? t.valueOf() : t;
            t = gt(e) ? e + "" : e;
          }
          if (typeof t != "string")
            return t === 0 ? t : +t;
          t = da(t);
          var n = fc.test(t);
          return n || pc.test(t) ? Hc(t.slice(2), n ? 2 : 8) : lc.test(t) ? Se : +t;
        }
        function Qo(t) {
          return we(t, Gt(t));
        }
        function Fd(t) {
          return t ? Qe(J(t), -ge, ge) : t === 0 ? t : 0;
        }
        function rt(t) {
          return t == null ? "" : Yt(t);
        }
        var Ld = pn(function(t, e) {
          if (Wn(e) || qt(e)) {
            we(e, It(e), t);
            return;
          }
          for (var n in e)
            st.call(e, n) && Fn(t, n, e[n]);
        }), Vo = pn(function(t, e) {
          we(e, Gt(e), t);
        }), Or = pn(function(t, e, n, i) {
          we(e, Gt(e), t, i);
        }), kd = pn(function(t, e, n, i) {
          we(e, It(e), t, i);
        }), Od = Ee(Ai);
        function Dd(t, e) {
          var n = hn(t);
          return e == null ? n : Ea(n, e);
        }
        var Nd = X(function(t, e) {
          t = at(t);
          var n = -1, i = e.length, o = i > 2 ? e[2] : r;
          for (o && Ot(e[0], e[1], o) && (i = 1); ++n < i; )
            for (var c = e[n], h = Gt(c), _ = -1, w = h.length; ++_ < w; ) {
              var S = h[_], x = t[S];
              (x === r || pe(x, cn[S]) && !st.call(t, S)) && (t[S] = c[S]);
            }
          return t;
        }), Wd = X(function(t) {
          return t.push(r, go), Zt(jo, r, t);
        });
        function Bd(t, e) {
          return la(t, W(e, 3), me);
        }
        function Ud(t, e) {
          return la(t, W(e, 3), Ei);
        }
        function $d(t, e) {
          return t == null ? t : Pi(t, W(e, 3), Gt);
        }
        function qd(t, e) {
          return t == null ? t : ka(t, W(e, 3), Gt);
        }
        function Gd(t, e) {
          return t && me(t, W(e, 3));
        }
        function zd(t, e) {
          return t && Ei(t, W(e, 3));
        }
        function Hd(t) {
          return t == null ? [] : _r(t, It(t));
        }
        function Kd(t) {
          return t == null ? [] : _r(t, Gt(t));
        }
        function os(t, e, n) {
          var i = t == null ? r : Ve(t, e);
          return i === r ? n : i;
        }
        function Zd(t, e) {
          return t != null && mo(t, e, _f);
        }
        function us(t, e) {
          return t != null && mo(t, e, vf);
        }
        var Jd = co(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = rr.call(e)), t[e] = n;
        }, ls(zt)), Yd = co(function(t, e, n) {
          e != null && typeof e.toString != "function" && (e = rr.call(e)), st.call(t, e) ? t[e].push(n) : t[e] = [n];
        }, W), Xd = X(kn);
        function It(t) {
          return qt(t) ? Aa(t) : Li(t);
        }
        function Gt(t) {
          return qt(t) ? Aa(t, !0) : Af(t);
        }
        function Qd(t, e) {
          var n = {};
          return e = W(e, 3), me(t, function(i, o, c) {
            Ae(n, e(i, o, c), i);
          }), n;
        }
        function Vd(t, e) {
          var n = {};
          return e = W(e, 3), me(t, function(i, o, c) {
            Ae(n, o, e(i, o, c));
          }), n;
        }
        var jd = pn(function(t, e, n) {
          vr(t, e, n);
        }), jo = pn(function(t, e, n, i) {
          vr(t, e, n, i);
        }), tg = Ee(function(t, e) {
          var n = {};
          if (t == null)
            return n;
          var i = !1;
          e = dt(e, function(c) {
            return c = $e(c, t), i || (i = c.length > 1), c;
          }), we(t, Zi(t), n), i && (n = se(n, m | R | F, Jf));
          for (var o = e.length; o--; )
            Bi(n, e[o]);
          return n;
        });
        function eg(t, e) {
          return tu(t, Fr(W(e)));
        }
        var ng = Ee(function(t, e) {
          return t == null ? {} : Ef(t, e);
        });
        function tu(t, e) {
          if (t == null)
            return {};
          var n = dt(Zi(t), function(i) {
            return [i];
          });
          return e = W(e), za(t, n, function(i, o) {
            return e(i, o[0]);
          });
        }
        function rg(t, e, n) {
          e = $e(e, t);
          var i = -1, o = e.length;
          for (o || (o = 1, t = r); ++i < o; ) {
            var c = t == null ? r : t[ye(e[i])];
            c === r && (i = o, c = n), t = Te(c) ? c.call(t) : c;
          }
          return t;
        }
        function ig(t, e, n) {
          return t == null ? t : Dn(t, e, n);
        }
        function sg(t, e, n, i) {
          return i = typeof i == "function" ? i : r, t == null ? t : Dn(t, e, n, i);
        }
        var eu = ho(It), nu = ho(Gt);
        function ag(t, e, n) {
          var i = H(t), o = i || Ge(t) || _n(t);
          if (e = W(e, 4), n == null) {
            var c = t && t.constructor;
            o ? n = i ? new c() : [] : gt(t) ? n = Te(c) ? hn(ar(t)) : {} : n = {};
          }
          return (o ? ne : me)(t, function(h, _, w) {
            return e(n, h, _, w);
          }), n;
        }
        function og(t, e) {
          return t == null ? !0 : Bi(t, e);
        }
        function ug(t, e, n) {
          return t == null ? t : Ya(t, e, qi(n));
        }
        function cg(t, e, n, i) {
          return i = typeof i == "function" ? i : r, t == null ? t : Ya(t, e, qi(n), i);
        }
        function vn(t) {
          return t == null ? [] : yi(t, It(t));
        }
        function lg(t) {
          return t == null ? [] : yi(t, Gt(t));
        }
        function fg(t, e, n) {
          return n === r && (n = e, e = r), n !== r && (n = ue(n), n = n === n ? n : 0), e !== r && (e = ue(e), e = e === e ? e : 0), Qe(ue(t), e, n);
        }
        function hg(t, e, n) {
          return e = Fe(e), n === r ? (n = e, e = 0) : n = Fe(n), t = ue(t), mf(t, e, n);
        }
        function pg(t, e, n) {
          if (n && typeof n != "boolean" && Ot(t, e, n) && (e = n = r), n === r && (typeof e == "boolean" ? (n = e, e = r) : typeof t == "boolean" && (n = t, t = r)), t === r && e === r ? (t = 0, e = 1) : (t = Fe(t), e === r ? (e = t, t = 0) : e = Fe(e)), t > e) {
            var i = t;
            t = e, e = i;
          }
          if (n || t % 1 || e % 1) {
            var o = xa();
            return Et(t + o * (e - t + zc("1e-" + ((o + "").length - 1))), e);
          }
          return Di(t, e);
        }
        var dg = dn(function(t, e, n) {
          return e = e.toLowerCase(), t + (n ? ru(e) : e);
        });
        function ru(t) {
          return cs(rt(t).toLowerCase());
        }
        function iu(t) {
          return t = rt(t), t && t.replace(gc, rl).replace(kc, "");
        }
        function gg(t, e, n) {
          t = rt(t), e = Yt(e);
          var i = t.length;
          n = n === r ? i : Qe(J(n), 0, i);
          var o = n;
          return n -= e.length, n >= 0 && t.slice(n, o) == e;
        }
        function _g(t) {
          return t = rt(t), t && Yu.test(t) ? t.replace(ks, il) : t;
        }
        function vg(t) {
          return t = rt(t), t && ec.test(t) ? t.replace(ii, "\\$&") : t;
        }
        var mg = dn(function(t, e, n) {
          return t + (n ? "-" : "") + e.toLowerCase();
        }), wg = dn(function(t, e, n) {
          return t + (n ? " " : "") + e.toLowerCase();
        }), yg = ao("toLowerCase");
        function Mg(t, e, n) {
          t = rt(t), e = J(e);
          var i = e ? on(t) : 0;
          if (!e || i >= e)
            return t;
          var o = (e - i) / 2;
          return br(lr(o), n) + t + br(cr(o), n);
        }
        function Cg(t, e, n) {
          t = rt(t), e = J(e);
          var i = e ? on(t) : 0;
          return e && i < e ? t + br(e - i, n) : t;
        }
        function bg(t, e, n) {
          t = rt(t), e = J(e);
          var i = e ? on(t) : 0;
          return e && i < e ? br(e - i, n) + t : t;
        }
        function Sg(t, e, n) {
          return n || e == null ? e = 0 : e && (e = +e), Rl(rt(t).replace(si, ""), e || 0);
        }
        function xg(t, e, n) {
          return (n ? Ot(t, e, n) : e === r) ? e = 1 : e = J(e), Ni(rt(t), e);
        }
        function Ig() {
          var t = arguments, e = rt(t[0]);
          return t.length < 3 ? e : e.replace(t[1], t[2]);
        }
        var Ag = dn(function(t, e, n) {
          return t + (n ? "_" : "") + e.toLowerCase();
        });
        function Pg(t, e, n) {
          return n && typeof n != "number" && Ot(t, e, n) && (e = n = r), n = n === r ? k : n >>> 0, n ? (t = rt(t), t && (typeof e == "string" || e != null && !as(e)) && (e = Yt(e), !e && an(t)) ? qe(fe(t), 0, n) : t.split(e, n)) : [];
        }
        var Eg = dn(function(t, e, n) {
          return t + (n ? " " : "") + cs(e);
        });
        function Rg(t, e, n) {
          return t = rt(t), n = n == null ? 0 : Qe(J(n), 0, t.length), e = Yt(e), t.slice(n, n + e.length) == e;
        }
        function Tg(t, e, n) {
          var i = u.templateSettings;
          n && Ot(t, e, n) && (e = r), t = rt(t), e = Or({}, e, i, po);
          var o = Or({}, e.imports, i.imports, po), c = It(o), h = yi(o, c), _, w, S = 0, x = e.interpolate || Jn, A = "__p += '", L = Ci(
            (e.escape || Jn).source + "|" + x.source + "|" + (x === Os ? cc : Jn).source + "|" + (e.evaluate || Jn).source + "|$",
            "g"
          ), D = "//# sourceURL=" + (st.call(e, "sourceURL") ? (e.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Bc + "]") + `
`;
          t.replace(L, function(U, V, tt, Qt, Dt, Vt) {
            return tt || (tt = Qt), A += t.slice(S, Vt).replace(_c, sl), V && (_ = !0, A += `' +
__e(` + V + `) +
'`), Dt && (w = !0, A += `';
` + Dt + `;
__p += '`), tt && (A += `' +
((__t = (` + tt + `)) == null ? '' : __t) +
'`), S = Vt + U.length, U;
          }), A += `';
`;
          var B = st.call(e, "variable") && e.variable;
          if (!B)
            A = `with (obj) {
` + A + `
}
`;
          else if (oc.test(B))
            throw new z(g);
          A = (w ? A.replace(Hu, "") : A).replace(Ku, "$1").replace(Zu, "$1;"), A = "function(" + (B || "obj") + `) {
` + (B ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (_ ? ", __e = _.escape" : "") + (w ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + A + `return __p
}`;
          var Y = au(function() {
            return nt(c, D + "return " + A).apply(r, h);
          });
          if (Y.source = A, ss(Y))
            throw Y;
          return Y;
        }
        function Fg(t) {
          return rt(t).toLowerCase();
        }
        function Lg(t) {
          return rt(t).toUpperCase();
        }
        function kg(t, e, n) {
          if (t = rt(t), t && (n || e === r))
            return da(t);
          if (!t || !(e = Yt(e)))
            return t;
          var i = fe(t), o = fe(e), c = ga(i, o), h = _a(i, o) + 1;
          return qe(i, c, h).join("");
        }
        function Og(t, e, n) {
          if (t = rt(t), t && (n || e === r))
            return t.slice(0, ma(t) + 1);
          if (!t || !(e = Yt(e)))
            return t;
          var i = fe(t), o = _a(i, fe(e)) + 1;
          return qe(i, 0, o).join("");
        }
        function Dg(t, e, n) {
          if (t = rt(t), t && (n || e === r))
            return t.replace(si, "");
          if (!t || !(e = Yt(e)))
            return t;
          var i = fe(t), o = ga(i, fe(e));
          return qe(i, o).join("");
        }
        function Ng(t, e) {
          var n = Tt, i = Cn;
          if (gt(e)) {
            var o = "separator" in e ? e.separator : o;
            n = "length" in e ? J(e.length) : n, i = "omission" in e ? Yt(e.omission) : i;
          }
          t = rt(t);
          var c = t.length;
          if (an(t)) {
            var h = fe(t);
            c = h.length;
          }
          if (n >= c)
            return t;
          var _ = n - on(i);
          if (_ < 1)
            return i;
          var w = h ? qe(h, 0, _).join("") : t.slice(0, _);
          if (o === r)
            return w + i;
          if (h && (_ += w.length - _), as(o)) {
            if (t.slice(_).search(o)) {
              var S, x = w;
              for (o.global || (o = Ci(o.source, rt(Ds.exec(o)) + "g")), o.lastIndex = 0; S = o.exec(x); )
                var A = S.index;
              w = w.slice(0, A === r ? _ : A);
            }
          } else if (t.indexOf(Yt(o), _) != _) {
            var L = w.lastIndexOf(o);
            L > -1 && (w = w.slice(0, L));
          }
          return w + i;
        }
        function Wg(t) {
          return t = rt(t), t && Ju.test(t) ? t.replace(Ls, hl) : t;
        }
        var Bg = dn(function(t, e, n) {
          return t + (n ? " " : "") + e.toUpperCase();
        }), cs = ao("toUpperCase");
        function su(t, e, n) {
          return t = rt(t), e = n ? r : e, e === r ? ol(t) ? gl(t) : Vc(t) : t.match(e) || [];
        }
        var au = X(function(t, e) {
          try {
            return Zt(t, r, e);
          } catch (n) {
            return ss(n) ? n : new z(n);
          }
        }), Ug = Ee(function(t, e) {
          return ne(e, function(n) {
            n = ye(n), Ae(t, n, rs(t[n], t));
          }), t;
        });
        function $g(t) {
          var e = t == null ? 0 : t.length, n = W();
          return t = e ? dt(t, function(i) {
            if (typeof i[1] != "function")
              throw new re(d);
            return [n(i[0]), i[1]];
          }) : [], X(function(i) {
            for (var o = -1; ++o < e; ) {
              var c = t[o];
              if (Zt(c[0], this, i))
                return Zt(c[1], this, i);
            }
          });
        }
        function qg(t) {
          return pf(se(t, m));
        }
        function ls(t) {
          return function() {
            return t;
          };
        }
        function Gg(t, e) {
          return t == null || t !== t ? e : t;
        }
        var zg = uo(), Hg = uo(!0);
        function zt(t) {
          return t;
        }
        function fs(t) {
          return Wa(typeof t == "function" ? t : se(t, m));
        }
        function Kg(t) {
          return Ua(se(t, m));
        }
        function Zg(t, e) {
          return $a(t, se(e, m));
        }
        var Jg = X(function(t, e) {
          return function(n) {
            return kn(n, t, e);
          };
        }), Yg = X(function(t, e) {
          return function(n) {
            return kn(t, n, e);
          };
        });
        function hs(t, e, n) {
          var i = It(e), o = _r(e, i);
          n == null && !(gt(e) && (o.length || !i.length)) && (n = e, e = t, t = this, o = _r(e, It(e)));
          var c = !(gt(n) && "chain" in n) || !!n.chain, h = Te(t);
          return ne(o, function(_) {
            var w = e[_];
            t[_] = w, h && (t.prototype[_] = function() {
              var S = this.__chain__;
              if (c || S) {
                var x = t(this.__wrapped__), A = x.__actions__ = $t(this.__actions__);
                return A.push({ func: w, args: arguments, thisArg: t }), x.__chain__ = S, x;
              }
              return w.apply(t, De([this.value()], arguments));
            });
          }), t;
        }
        function Xg() {
          return At._ === this && (At._ = Ml), this;
        }
        function ps() {
        }
        function Qg(t) {
          return t = J(t), X(function(e) {
            return qa(e, t);
          });
        }
        var Vg = zi(dt), jg = zi(ca), t0 = zi(gi);
        function ou(t) {
          return Qi(t) ? _i(ye(t)) : Rf(t);
        }
        function e0(t) {
          return function(e) {
            return t == null ? r : Ve(t, e);
          };
        }
        var n0 = lo(), r0 = lo(!0);
        function ds() {
          return [];
        }
        function gs() {
          return !1;
        }
        function i0() {
          return {};
        }
        function s0() {
          return "";
        }
        function a0() {
          return !0;
        }
        function o0(t, e) {
          if (t = J(t), t < 1 || t > ge)
            return [];
          var n = k, i = Et(t, k);
          e = W(e), t -= k;
          for (var o = wi(i, e); ++n < t; )
            e(n);
          return o;
        }
        function u0(t) {
          return H(t) ? dt(t, ye) : Xt(t) ? [t] : $t(Ao(rt(t)));
        }
        function c0(t) {
          var e = ++wl;
          return rt(t) + e;
        }
        var l0 = Cr(function(t, e) {
          return t + e;
        }, 0), f0 = Hi("ceil"), h0 = Cr(function(t, e) {
          return t / e;
        }, 1), p0 = Hi("floor");
        function d0(t) {
          return t && t.length ? gr(t, zt, Ri) : r;
        }
        function g0(t, e) {
          return t && t.length ? gr(t, W(e, 2), Ri) : r;
        }
        function _0(t) {
          return ha(t, zt);
        }
        function v0(t, e) {
          return ha(t, W(e, 2));
        }
        function m0(t) {
          return t && t.length ? gr(t, zt, ki) : r;
        }
        function w0(t, e) {
          return t && t.length ? gr(t, W(e, 2), ki) : r;
        }
        var y0 = Cr(function(t, e) {
          return t * e;
        }, 1), M0 = Hi("round"), C0 = Cr(function(t, e) {
          return t - e;
        }, 0);
        function b0(t) {
          return t && t.length ? mi(t, zt) : 0;
        }
        function S0(t, e) {
          return t && t.length ? mi(t, W(e, 2)) : 0;
        }
        return u.after = Kp, u.ary = Wo, u.assign = Ld, u.assignIn = Vo, u.assignInWith = Or, u.assignWith = kd, u.at = Od, u.before = Bo, u.bind = rs, u.bindAll = Ug, u.bindKey = Uo, u.castArray = id, u.chain = Oo, u.chunk = ph, u.compact = dh, u.concat = gh, u.cond = $g, u.conforms = qg, u.constant = ls, u.countBy = bp, u.create = Dd, u.curry = $o, u.curryRight = qo, u.debounce = Go, u.defaults = Nd, u.defaultsDeep = Wd, u.defer = Zp, u.delay = Jp, u.difference = _h, u.differenceBy = vh, u.differenceWith = mh, u.drop = wh, u.dropRight = yh, u.dropRightWhile = Mh, u.dropWhile = Ch, u.fill = bh, u.filter = xp, u.flatMap = Pp, u.flatMapDeep = Ep, u.flatMapDepth = Rp, u.flatten = To, u.flattenDeep = Sh, u.flattenDepth = xh, u.flip = Yp, u.flow = zg, u.flowRight = Hg, u.fromPairs = Ih, u.functions = Hd, u.functionsIn = Kd, u.groupBy = Tp, u.initial = Ph, u.intersection = Eh, u.intersectionBy = Rh, u.intersectionWith = Th, u.invert = Jd, u.invertBy = Yd, u.invokeMap = Lp, u.iteratee = fs, u.keyBy = kp, u.keys = It, u.keysIn = Gt, u.map = Er, u.mapKeys = Qd, u.mapValues = Vd, u.matches = Kg, u.matchesProperty = Zg, u.memoize = Tr, u.merge = jd, u.mergeWith = jo, u.method = Jg, u.methodOf = Yg, u.mixin = hs, u.negate = Fr, u.nthArg = Qg, u.omit = tg, u.omitBy = eg, u.once = Xp, u.orderBy = Op, u.over = Vg, u.overArgs = Qp, u.overEvery = jg, u.overSome = t0, u.partial = is, u.partialRight = zo, u.partition = Dp, u.pick = ng, u.pickBy = tu, u.property = ou, u.propertyOf = e0, u.pull = Oh, u.pullAll = Lo, u.pullAllBy = Dh, u.pullAllWith = Nh, u.pullAt = Wh, u.range = n0, u.rangeRight = r0, u.rearg = Vp, u.reject = Bp, u.remove = Bh, u.rest = jp, u.reverse = es, u.sampleSize = $p, u.set = ig, u.setWith = sg, u.shuffle = qp, u.slice = Uh, u.sortBy = Hp, u.sortedUniq = Zh, u.sortedUniqBy = Jh, u.split = Pg, u.spread = td, u.tail = Yh, u.take = Xh, u.takeRight = Qh, u.takeRightWhile = Vh, u.takeWhile = jh, u.tap = dp, u.throttle = ed, u.thru = Pr, u.toArray = Yo, u.toPairs = eu, u.toPairsIn = nu, u.toPath = u0, u.toPlainObject = Qo, u.transform = ag, u.unary = nd, u.union = tp, u.unionBy = ep, u.unionWith = np, u.uniq = rp, u.uniqBy = ip, u.uniqWith = sp, u.unset = og, u.unzip = ns, u.unzipWith = ko, u.update = ug, u.updateWith = cg, u.values = vn, u.valuesIn = lg, u.without = ap, u.words = su, u.wrap = rd, u.xor = op, u.xorBy = up, u.xorWith = cp, u.zip = lp, u.zipObject = fp, u.zipObjectDeep = hp, u.zipWith = pp, u.entries = eu, u.entriesIn = nu, u.extend = Vo, u.extendWith = Or, hs(u, u), u.add = l0, u.attempt = au, u.camelCase = dg, u.capitalize = ru, u.ceil = f0, u.clamp = fg, u.clone = sd, u.cloneDeep = od, u.cloneDeepWith = ud, u.cloneWith = ad, u.conformsTo = cd, u.deburr = iu, u.defaultTo = Gg, u.divide = h0, u.endsWith = gg, u.eq = pe, u.escape = _g, u.escapeRegExp = vg, u.every = Sp, u.find = Ip, u.findIndex = Eo, u.findKey = Bd, u.findLast = Ap, u.findLastIndex = Ro, u.findLastKey = Ud, u.floor = p0, u.forEach = Do, u.forEachRight = No, u.forIn = $d, u.forInRight = qd, u.forOwn = Gd, u.forOwnRight = zd, u.get = os, u.gt = ld, u.gte = fd, u.has = Zd, u.hasIn = us, u.head = Fo, u.identity = zt, u.includes = Fp, u.indexOf = Ah, u.inRange = hg, u.invoke = Xd, u.isArguments = en, u.isArray = H, u.isArrayBuffer = hd, u.isArrayLike = qt, u.isArrayLikeObject = wt, u.isBoolean = pd, u.isBuffer = Ge, u.isDate = dd, u.isElement = gd, u.isEmpty = _d, u.isEqual = vd, u.isEqualWith = md, u.isError = ss, u.isFinite = wd, u.isFunction = Te, u.isInteger = Ho, u.isLength = Lr, u.isMap = Ko, u.isMatch = yd, u.isMatchWith = Md, u.isNaN = Cd, u.isNative = bd, u.isNil = xd, u.isNull = Sd, u.isNumber = Zo, u.isObject = gt, u.isObjectLike = mt, u.isPlainObject = Un, u.isRegExp = as, u.isSafeInteger = Id, u.isSet = Jo, u.isString = kr, u.isSymbol = Xt, u.isTypedArray = _n, u.isUndefined = Ad, u.isWeakMap = Pd, u.isWeakSet = Ed, u.join = Fh, u.kebabCase = mg, u.last = oe, u.lastIndexOf = Lh, u.lowerCase = wg, u.lowerFirst = yg, u.lt = Rd, u.lte = Td, u.max = d0, u.maxBy = g0, u.mean = _0, u.meanBy = v0, u.min = m0, u.minBy = w0, u.stubArray = ds, u.stubFalse = gs, u.stubObject = i0, u.stubString = s0, u.stubTrue = a0, u.multiply = y0, u.nth = kh, u.noConflict = Xg, u.noop = ps, u.now = Rr, u.pad = Mg, u.padEnd = Cg, u.padStart = bg, u.parseInt = Sg, u.random = pg, u.reduce = Np, u.reduceRight = Wp, u.repeat = xg, u.replace = Ig, u.result = rg, u.round = M0, u.runInContext = v, u.sample = Up, u.size = Gp, u.snakeCase = Ag, u.some = zp, u.sortedIndex = $h, u.sortedIndexBy = qh, u.sortedIndexOf = Gh, u.sortedLastIndex = zh, u.sortedLastIndexBy = Hh, u.sortedLastIndexOf = Kh, u.startCase = Eg, u.startsWith = Rg, u.subtract = C0, u.sum = b0, u.sumBy = S0, u.template = Tg, u.times = o0, u.toFinite = Fe, u.toInteger = J, u.toLength = Xo, u.toLower = Fg, u.toNumber = ue, u.toSafeInteger = Fd, u.toString = rt, u.toUpper = Lg, u.trim = kg, u.trimEnd = Og, u.trimStart = Dg, u.truncate = Ng, u.unescape = Wg, u.uniqueId = c0, u.upperCase = Bg, u.upperFirst = cs, u.each = Do, u.eachRight = No, u.first = Fo, hs(u, function() {
          var t = {};
          return me(u, function(e, n) {
            st.call(u.prototype, n) || (t[n] = e);
          }), t;
        }(), { chain: !1 }), u.VERSION = a, ne(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t) {
          u[t].placeholder = u;
        }), ne(["drop", "take"], function(t, e) {
          j.prototype[t] = function(n) {
            n = n === r ? 1 : xt(J(n), 0);
            var i = this.__filtered__ && !e ? new j(this) : this.clone();
            return i.__filtered__ ? i.__takeCount__ = Et(n, i.__takeCount__) : i.__views__.push({
              size: Et(n, k),
              type: t + (i.__dir__ < 0 ? "Right" : "")
            }), i;
          }, j.prototype[t + "Right"] = function(n) {
            return this.reverse()[t](n).reverse();
          };
        }), ne(["filter", "map", "takeWhile"], function(t, e) {
          var n = e + 1, i = n == bn || n == Jr;
          j.prototype[t] = function(o) {
            var c = this.clone();
            return c.__iteratees__.push({
              iteratee: W(o, 3),
              type: n
            }), c.__filtered__ = c.__filtered__ || i, c;
          };
        }), ne(["head", "last"], function(t, e) {
          var n = "take" + (e ? "Right" : "");
          j.prototype[t] = function() {
            return this[n](1).value()[0];
          };
        }), ne(["initial", "tail"], function(t, e) {
          var n = "drop" + (e ? "" : "Right");
          j.prototype[t] = function() {
            return this.__filtered__ ? new j(this) : this[n](1);
          };
        }), j.prototype.compact = function() {
          return this.filter(zt);
        }, j.prototype.find = function(t) {
          return this.filter(t).head();
        }, j.prototype.findLast = function(t) {
          return this.reverse().find(t);
        }, j.prototype.invokeMap = X(function(t, e) {
          return typeof t == "function" ? new j(this) : this.map(function(n) {
            return kn(n, t, e);
          });
        }), j.prototype.reject = function(t) {
          return this.filter(Fr(W(t)));
        }, j.prototype.slice = function(t, e) {
          t = J(t);
          var n = this;
          return n.__filtered__ && (t > 0 || e < 0) ? new j(n) : (t < 0 ? n = n.takeRight(-t) : t && (n = n.drop(t)), e !== r && (e = J(e), n = e < 0 ? n.dropRight(-e) : n.take(e - t)), n);
        }, j.prototype.takeRightWhile = function(t) {
          return this.reverse().takeWhile(t).reverse();
        }, j.prototype.toArray = function() {
          return this.take(k);
        }, me(j.prototype, function(t, e) {
          var n = /^(?:filter|find|map|reject)|While$/.test(e), i = /^(?:head|last)$/.test(e), o = u[i ? "take" + (e == "last" ? "Right" : "") : e], c = i || /^find/.test(e);
          o && (u.prototype[e] = function() {
            var h = this.__wrapped__, _ = i ? [1] : arguments, w = h instanceof j, S = _[0], x = w || H(h), A = function(V) {
              var tt = o.apply(u, De([V], _));
              return i && L ? tt[0] : tt;
            };
            x && n && typeof S == "function" && S.length != 1 && (w = x = !1);
            var L = this.__chain__, D = !!this.__actions__.length, B = c && !L, Y = w && !D;
            if (!c && x) {
              h = Y ? h : new j(this);
              var U = t.apply(h, _);
              return U.__actions__.push({ func: Pr, args: [A], thisArg: r }), new ie(U, L);
            }
            return B && Y ? t.apply(this, _) : (U = this.thru(A), B ? i ? U.value()[0] : U.value() : U);
          });
        }), ne(["pop", "push", "shift", "sort", "splice", "unshift"], function(t) {
          var e = tr[t], n = /^(?:push|sort|unshift)$/.test(t) ? "tap" : "thru", i = /^(?:pop|shift)$/.test(t);
          u.prototype[t] = function() {
            var o = arguments;
            if (i && !this.__chain__) {
              var c = this.value();
              return e.apply(H(c) ? c : [], o);
            }
            return this[n](function(h) {
              return e.apply(H(h) ? h : [], o);
            });
          };
        }), me(j.prototype, function(t, e) {
          var n = u[e];
          if (n) {
            var i = n.name + "";
            st.call(fn, i) || (fn[i] = []), fn[i].push({ name: e, func: n });
          }
        }), fn[Mr(r, q).name] = [{
          name: "wrapper",
          func: r
        }], j.prototype.clone = Nl, j.prototype.reverse = Wl, j.prototype.value = Bl, u.prototype.at = gp, u.prototype.chain = _p, u.prototype.commit = vp, u.prototype.next = mp, u.prototype.plant = yp, u.prototype.reverse = Mp, u.prototype.toJSON = u.prototype.valueOf = u.prototype.value = Cp, u.prototype.first = u.prototype.head, An && (u.prototype[An] = wp), u;
      }, un = _l();
      Ze ? ((Ze.exports = un)._ = un, fi._ = un) : At._ = un;
    }).call(k0);
  }(qn, qn.exports)), qn.exports;
}
var Eu = O0();
const Q = /* @__PURE__ */ Mu(Eu);
function Ru(f, s) {
  const r = Q.findLast(s.terrain, (a) => yn(a.percents[0] * s.dist, f.loc, 4));
  return r ? r.value / 100 + 1 : 1;
}
const D0 = [
  "altitude",
  "grade",
  "terrain",
  "heat",
  "dark",
  "strategy",
  "climbStrategy",
  "descentStrategy"
];
function Rs(f) {
  const s = new Ce().init(0);
  return f.forEach(({ factors: r, dist: a }) => {
    s.applyEach((l, p) => l + a * p, r);
  }), s.scaleEach(1 / Eu.sumBy(f, "dist")), s;
}
function N0(f, s) {
  let r = 0, a = 0;
  return f.forEach((l, p) => {
    const d = p === f.length - 1 ? s : f[p + 1].onset, g = l.type === "linear" ? l.value / 2 : l.value;
    a += (r + g) * (d - l.onset), r += l.value;
  }), a / s;
}
function W0(f) {
  return f < 30 ? 2 : f < 60 ? 5 : f < 90 ? 10 : f < 120 ? 15 : 20;
}
function B0(f, s, r) {
  let a = -N0(s, r);
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
class Tu {
  constructor(s, r) {
    P(this, "plan");
    P(this, "values");
    this.plan = s, this.values = r ? Q.cloneDeep(r) : [{ onset: 0, value: W0(this.plan.course.dist), type: "linear" }];
  }
  /**
   * Returns strategy factor at location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns  The strategy factor at input location.
   */
  at(s) {
    return 1 + B0(s, this.values, this.plan.course.dist) / 100;
  }
  addValue(s) {
    const r = this.values.findIndex((a) => a.onset >= s.onset);
    r >= 0 ? this.values.splice(r, 0, s) : this.values.push(s);
  }
}
function Is(f, s) {
  return s === void 0 ? f : (f - 1) * s + 1;
}
function U0(f, s) {
  var r, a;
  f.factors.altitude = Is(f.factors.altitude, (r = s.scales) == null ? void 0 : r.altitude), f.factors.dark = Is(f.factors.dark, (a = s.scales) == null ? void 0 : a.dark);
}
function Ts(f, s) {
  f.factors || (f.factors = new Ce()), Object.assign(f.factors, {
    grade: Es(f.grade),
    altitude: Cu(f.alt),
    terrain: Ru(f, s)
  });
}
function Gn(f, s) {
  var r, a, l, p, d, g;
  if (f.factors || (f.factors = new Ce()), Ts(f, s.course), s) {
    if (f.factors === void 0) throw new Error("no factors");
    f.factors.grade = Es(f.grade, s.gradeModel), f.factors.strategy = s.strategy.at(f.loc), (a = (r = s.strategies) == null ? void 0 : r.climbing) != null && a.filter(f) ? f.factors.climbStrategy = s.strategies.climbing.factor : f.factors.climbStrategy = ((l = s.strategies.climbing) == null ? void 0 : l.default) ?? 1, (d = (p = s.strategies) == null ? void 0 : p.descending) != null && d.filter(f) ? f.factors.descentStrategy = s.strategies.descending.factor : f.factors.descentStrategy = ((g = s.strategies.descending) == null ? void 0 : g.default) ?? 1, Object.assign(f.factors, {
      heat: s.heatModel ? Pu(f, s.heatModel) : 1,
      dark: s.event.sun ? Iu(f.tod, f.factors.terrain, s.event.sun) : 1
    });
  }
  s.scales && U0(f, s);
}
const u_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Factors: Ce,
  Strategy: Tu,
  applyScale: Is,
  factorKeys: mn,
  generateCourseFactors: Ts,
  generatePlanFactors: Gn,
  getAltitudeFactor: Cu,
  getDarkFactor: Iu,
  getGradeFactor: Es,
  getHeatFactor: Pu,
  getTerrainFactor: Ru,
  rollup: Rs,
  typeList: D0
}, Symbol.toStringTag, { value: "Module" }));
var ws = {}, du;
function $0() {
  return du || (du = 1, function(f) {
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
      var F = Math.atan2(l, a), T = Math.sqrt(a * a + l * l), E = Math.atan2(p, T);
      return new f.latlon(E * 180 / Math.PI, F * 180 / Math.PI);
    }, f.latlon.prototype.interpolate = function(r, a) {
      var l = this.distanceRadTo(r), p = this.bearingRadTo(r), d = this.lat.toRad(), g = this.lng.toRad();
      r.lat.toRad(), r.lng.toRad();
      for (var y = Math.sin(d), M = Math.cos(d), I = [], m = 0; m < a; m++) {
        var R = 1 / (a - 1) * m, F = l * R, T = Math.sin(F), E = Math.cos(F), N = Math.asin(y * E + M * T * Math.cos(p)), q = g + Math.atan2(Math.sin(p) * T * M, E - y * Math.sin(N)), K = N.toDeg(), Z = q.toDeg();
        for (K > 90 && (K = 90), K < -90 && (K = -90); Z > 180; ) Z -= 360;
        for (; Z <= -180; ) Z += 360;
        I.push(new f.latlon(K, Z));
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
      var d = r.lat.toRad(), g = r.lng.toRad(), y = l.lat.toRad(), M = l.lng.toRad(), I = a.toRad(), m = p.toRad(), R = y - d, F = M - g, T = 2 * Math.asin(Math.sqrt(Math.sin(R / 2) * Math.sin(R / 2) + Math.cos(d) * Math.cos(y) * Math.sin(F / 2) * Math.sin(F / 2)));
      if (T == 0) return null;
      var E = Math.acos((Math.sin(y) - Math.sin(d) * Math.cos(T)) / (Math.sin(T) * Math.cos(d)));
      isNaN(E) && (E = 0);
      var N = Math.acos((Math.sin(d) - Math.sin(y) * Math.cos(T)) / (Math.sin(T) * Math.cos(y)));
      if (Math.sin(M - g) > 0)
        var q = E, K = 2 * Math.PI - N;
      else
        q = 2 * Math.PI - E, K = N;
      var Z = (I - q + Math.PI) % (2 * Math.PI) - Math.PI, it = (K - m + Math.PI) % (2 * Math.PI) - Math.PI;
      if (Math.sin(Z) == 0 && Math.sin(it) == 0 || Math.sin(Z) * Math.sin(it) < 0) return null;
      var _t = Math.acos(-Math.cos(Z) * Math.cos(it) + Math.sin(Z) * Math.sin(it) * Math.cos(T)), Wt = Math.atan2(
        Math.sin(T) * Math.sin(Z) * Math.sin(it),
        Math.cos(it) + Math.cos(Z) * Math.cos(_t)
      ), bt = Math.asin(Math.sin(d) * Math.cos(Wt) + Math.cos(d) * Math.sin(Wt) * Math.cos(I)), jt = Math.atan2(
        Math.sin(I) * Math.sin(Wt) * Math.cos(d),
        Math.cos(Wt) - Math.sin(d) * Math.sin(bt)
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
      var F = (g + R + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return new f.latlon(M.toDeg(), F.toDeg());
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
  }(ws)), ws;
}
var q0 = $0();
function G0(f) {
  return "latlon" in f;
}
class Fs {
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
    return G0(this.source) ? this.source.latlon : new q0.latlon(this.lat, this.lon);
  }
  get lon() {
    return this.source.lon;
  }
  set lon(s) {
    this.source.lon = s;
  }
}
class Hr extends Fs {
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
function ys(f) {
  return "_course" in f;
}
class $r extends Hr {
  constructor(r, a, l) {
    super(a, a.loc, a.grade);
    P(this, "_course");
    P(this, "factors", new Ce());
    P(this, "_interpolated");
    P(this, "loop");
    P(this, "source");
    this._course = r, this.loop = l, this.source = a;
  }
  get grade() {
    return ys(this.source) ? this.source.grade : this.source.grade * (this.source.grade > 0 ? this._course.gainScale : this._course.lossScale);
  }
  get interpolated() {
    return (ys(this.source) ? this.source.interpolated : this._interpolated) || !1;
  }
  set interpolated(r) {
    this._interpolated = r;
  }
  get loc() {
    if (ys(this.source)) return this.source.loc;
    let r = this.source.loc * this._course.distScale;
    return this.loop && (r += this._course.loopDist * this.loop), r;
  }
}
function qr(f, s) {
  const r = f.filter((l) => l > 0 && Gr(l, s, 4));
  return r.unshift(0), r.map((l, p) => ({ start: l, end: r[p + 1] || s }));
}
function Fu(f) {
  switch (f) {
    case "kilometers":
      return 1;
    case "miles":
      return 0.621371;
    default:
      throw new Error("Invalid distance unit");
  }
}
function Wr(f) {
  return typeof f == "number" && !isNaN(f);
}
function z0(f, s, r) {
  f = [...f], s.interpolated && f.splice(f.findIndex((p) => p.loc > s.loc) - 1, 0, s), r.interpolated && f.splice(f.findIndex((p) => p.loc > r.loc) - 1, 0, r);
  const a = f.filter(
    (p, d) => d >= f.findIndex((g) => g === s) && d <= f.findIndex((g) => g === r)
  ), l = a.map((p, d) => ({
    factors: p.factors,
    dist: d === a.length - 1 ? 0 : a[d + 1].loc - a[d].loc
  }));
  return l.pop(), Rs(l);
}
class Lu {
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
class ku extends Lu {
  constructor(r, a) {
    super(a);
    P(this, "_course");
    P(this, "point1");
    P(this, "point2");
    this._course = r, this.point1 = a.point1, this.point2 = a.point2;
  }
}
class Ou extends Lu {
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
    return !Wr(this.point1.elapsed) || !Wr(this.point2.elapsed) || !Wr(this.point1.time) || !Wr(this.point2.time) ? 0 : this.point2.elapsed - this.point1.elapsed - (this.point2.time - this.point1.time);
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
    return this._factors || (this._factors = z0(this._plan.points, this.point1, this.point2));
  }
}
const Ms = Ke("CourseSplits");
class H0 {
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
    Ms("createSegments");
    const s = this.course.waypoints, r = this.calcSegments(
      qr(
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
    Ms(`createSplits:${s}`);
    const r = Fu(s), a = Q.range(this.course.dist * r).map((p) => p / r);
    this.course.dist - a[a.length - 1] > 1e-4 && a.push(this.course.dist);
    const l = this.calcSegments(qr(a, this.course.dist));
    if (!l.length) throw new Error("createSplits result is empty");
    return l;
  }
  calcSegments(s) {
    var R;
    Ms.extend("calcSegments")("exec");
    const a = this.course, l = a.points, p = [], d = [];
    let g, y, M = a.points[0], I;
    for (g = 0, y = s.length; g < y; g++) {
      const F = s[g];
      I && Mn((R = s[g - 1]) == null ? void 0 : R.end, F.start, 4) ? M = I : M = a.getPoint(F.start), I = a.getPoint(F.end);
      const T = F.end - F.start, E = new ku(this.course, {
        gain: 0,
        loss: 0,
        grade: T > 0 ? (I.alt - M.alt) / T / 10 * (I.alt - M.alt > 0 ? a.gainScale : a.lossScale) : 0,
        point1: M,
        point2: I
      }), N = new Ce().init(0);
      p.push(E), d.push(N);
    }
    const m = (F, T, E, N) => {
      const q = E.alt - T.alt;
      F[q > 0 ? "gain" : "loss"] += q * (q > 0 ? a.gainScale : a.lossScale), Ts(T, a);
      const K = E.loc - T.loc;
      N.applyEach((Z, it) => Z + it * K, T.factors);
    };
    g = 1;
    for (let F = 0; F < p.length; F++) {
      const T = p[F], E = d[F];
      for (; yn(l[g].loc, T.point1.loc, 4); ) g++;
      let N = T.point1;
      for (; g < l.length && yn(l[g].loc, T.point2.loc, 4); ) {
        const q = l[g];
        m(T, N, q, E), N = q, g++;
      }
      m(T, N, T.point2, E);
    }
    return p;
  }
}
function Du(f, s, r) {
  if (f.loc > s.loc && r > f.loc || s.loc > f.loc && r > s.loc)
    throw new Error("Input location must be between points");
  const a = Math.abs(f.loc - r), l = f.latlon.bearingTo(s.latlon), { lat: p, lng: d } = f.latlon.destinationPoint(l, a), g = f.grade, y = wn(f.loc, s.loc, f.alt, s.alt, r);
  return new Hr({ lat: p, lon: d, alt: y }, r, g);
}
class As {
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
    return this.loop >= 2 && this.type !== "finish" ? `${this.site.name} ${this.loop}` : this.site.name;
  }
  get description() {
    return this.site.description;
  }
  get loc() {
    return (this.site.percent + this.loop - 1) * this.course.loopDist;
  }
  set loc(s) {
    if (!Q.isNumber(s)) throw new Error("Wrong format for Waypoint.loc");
    this.type === "start" ? this.site.percent = 0 : this.type === "finish" ? this.site.percent = 1 : this.site.percent = s / this.course.loopDist % 1;
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
  get type() {
    return this.site.type;
  }
  get hasTypicalDelay() {
    return this.type === "aid" || this.type === "water" || this.loop >= 2 && this.type === "start";
  }
  get cutoff() {
    var s, r;
    return (r = (s = this.site.cutoffs) == null ? void 0 : s.find((a) => a.loop === this.loop)) == null ? void 0 : r.time;
  }
}
const gu = Ke("models:Waypoint");
class Ur {
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
  get id() {
    return this._data.id;
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
    switch (this.type) {
      case "start":
        return 0;
      case "finish":
        return 1;
      default:
        return this._data.percent;
    }
  }
  set percent(s) {
    this._data.percent = s;
  }
  get type() {
    return this._data.type;
  }
  get version() {
    return this.course.version;
  }
  get waypoints() {
    return "waypoints" in this._cache ? this._cache.waypoints : (gu(`generating waypoints array: ${this.name}`), this.type === "finish" ? this._cache.waypoints = [new As(this, this.course.loops)] : this._cache.waypoints = Q.range(this.course.loops).map((s) => new As(this, s + 1)), this._cache.waypoints);
  }
  refreshLLA() {
    gu("refreshLLA");
    let s, r, a;
    this.type === "start" ? { lat: s, lon: r, alt: a } = this.course.track.points[0] : this.type === "finish" ? { lat: s, lon: r, alt: a } = this.course.track.points[this.course.track.points.length - 1] : { lat: s, lon: r, alt: a } = this.course.track.getLLA(this.percent * this.course.track.dist), this._cache.lat = s, this._cache.lon = r, this._cache.alt = a;
  }
}
const $n = Ke("models:Course"), Nu = [
  { type: "paved", value: 0 },
  { type: "dirt road", value: 4 },
  { type: "doubletrack", value: 8 },
  { type: "singletrack", value: 15 },
  { type: "technical", value: 30 }
];
class K0 {
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
    $n("constructor"), this.track = s, this._data = r, this.version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  /**
   * Course cutoffs
   */
  get cutoffs() {
    return "cutoffs" in this.cache ? this.cache.cutoffs : (this.cache.cutoffs = this.waypoints.filter((s) => s.cutoff).map((s) => new Wu(s)), this.cache.cutoffs);
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
    $n("generating points array"), this.cache.points = new Array(this.track.points.length * this.loops);
    for (let s = 0; s < this.loops; s++)
      for (let r = 0; r < this.track.points.length; r++)
        this.points[r + s * this.track.points.length] = new $r(
          this,
          this.track.points[r],
          s
        );
    return this.cache.points;
  }
  get sites() {
    var s;
    if ("sites" in this.cache) return this.cache.sites;
    if (this.cache.sites = ((s = this._data.sites) == null ? void 0 : s.map((r) => new Ur(this, r))) || [
      new Ur(this, {
        id: String(Q.random(1e4, 2e4)),
        name: "Start",
        type: "start",
        percent: 0
      }),
      new Ur(this, {
        id: String(Q.random(3e4, 4e4)),
        name: "Finish",
        type: "finish",
        percent: 1
      })
    ], this.cache.sites.length < 2 || !this.cache.sites.find((r) => r.type === "start") || !this.cache.sites.find((r) => r.type === "finish"))
      throw new Error("Course must have at least a start and finish");
    return this.cache.sites;
  }
  get splits() {
    return "splits" in this.cache ? this.cache.splits : (this.cache.splits = new H0(this), this.cache.splits);
  }
  get stats() {
    if ("stats" in this.cache) return this.cache.stats;
    $n("stats:calculate");
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
        const l = Q.isNumber(r.value) ? r.value : Q.isString(r.value) ? ((g = Nu.find((M) => M.type === r.value)) == null ? void 0 : g.value) || 0 : r.value.value, p = typeof r == "string" ? r : Q.isObject(r.value) ? r.value.type : void 0;
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
    $n("update"), Object.assign(this._data, s), this.version++;
  }
  /**
   * Finds or creates a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns The CoursePoint at input location.
   */
  getPoint(s) {
    const r = this.points.findIndex((y) => zr(y.loc, s, 4)), a = this.points[r];
    if (Mn(a.loc, s, 4)) return a;
    $n(`getPoint: creating new CoursePoint at ${s}`);
    const l = r - 1, p = this.points[l], d = Du(
      p.source,
      a.source,
      s % this.loopDist / this.distScale
    ), g = new $r(this, d, Math.floor(s / this.loopDist));
    return g.interpolated = !0, g;
  }
  locationsToBreaks(s) {
    const r = s.filter((l) => l > 0 && Gr(l, this.dist, 4));
    return r.unshift(0), r.map((l, p) => ({ start: l, end: r[p + 1] || this.dist }));
  }
}
class Wu {
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
var Cs = { exports: {} }, _u;
function Z0() {
  return _u || (_u = 1, function(f, s) {
    (function() {
      var r = Math.PI, a = Math.sin, l = Math.cos, p = Math.tan, d = Math.asin, g = Math.atan2, y = Math.acos, M = r / 180, I = 1e3 * 60 * 60 * 24, m = 2440588, R = 2451545;
      function F(k) {
        return k.valueOf() / I - 0.5 + m;
      }
      function T(k) {
        return new Date((k + 0.5 - m) * I);
      }
      function E(k) {
        return F(k) - R;
      }
      var N = M * 23.4397;
      function q(k, $) {
        return g(a(k) * l(N) - p($) * a(N), l(k));
      }
      function K(k, $) {
        return d(a($) * l(N) + l($) * a(N) * a(k));
      }
      function Z(k, $, G) {
        return g(a(k), l(k) * a($) - p(G) * l($));
      }
      function it(k, $, G) {
        return d(a($) * a(G) + l($) * l(G) * l(k));
      }
      function _t(k, $) {
        return M * (280.16 + 360.9856235 * k) - $;
      }
      function Wt(k) {
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
      var Tt = {};
      Tt.getPosition = function(k, $, G) {
        var ft = M * -G, et = M * $, ht = E(k), ot = Ht(ht), ct = _t(ht, ft) - ot.ra;
        return {
          azimuth: Z(ct, et, ot.dec),
          altitude: it(ct, et, ot.dec)
        };
      };
      var Cn = Tt.times = [
        [-0.833, "sunrise", "sunset"],
        [-0.3, "sunriseEnd", "sunsetStart"],
        [-6, "dawn", "dusk"],
        [-12, "nauticalDawn", "nauticalDusk"],
        [-18, "nightEnd", "night"],
        [6, "goldenHourEnd", "goldenHour"]
      ];
      Tt.addTime = function(k, $, G) {
        Cn.push([k, $, G]);
      };
      var zn = 9e-4;
      function Zr(k, $) {
        return Math.round(k - zn - $ / (2 * r));
      }
      function bn(k, $, G) {
        return zn + (k + $) / (2 * r) + G;
      }
      function Hn(k, $, G) {
        return R + k + 53e-4 * a($) - 69e-4 * a(2 * G);
      }
      function Jr(k, $, G) {
        return y((a(k) - a($) * a(G)) / (l($) * l(G)));
      }
      function be(k) {
        return -2.076 * Math.sqrt(k) / 60;
      }
      function ge(k, $, G, ft, et, ht, ot) {
        var ct = Jr(k, G, ft), Mt = bn(ct, $, et);
        return Hn(Mt, ht, ot);
      }
      Tt.getTimes = function(k, $, G, ft) {
        ft = ft || 0;
        var et = M * -G, ht = M * $, ot = be(ft), ct = E(k), Mt = Zr(ct, et), Kt = bn(0, et, Mt), Ft = bt(Kt), Bt = jt(Ft), _e = K(Bt, 0), vt = Hn(Kt, Ft, Bt), Lt, ke, Ct, Ut, le, te, pt = {
          solarNoon: T(vt),
          nadir: T(vt - 0.5)
        };
        for (Lt = 0, ke = Cn.length; Lt < ke; Lt += 1)
          Ct = Cn[Lt], Ut = (Ct[0] + ot) * M, le = ge(Ut, et, ht, _e, Mt, Ft, Bt), te = vt - (le - vt), pt[Ct[1]] = T(te), pt[Ct[2]] = T(le);
        return pt;
      };
      function Kn(k) {
        var $ = M * (218.316 + 13.176396 * k), G = M * (134.963 + 13.064993 * k), ft = M * (93.272 + 13.22935 * k), et = $ + M * 6.289 * a(G), ht = M * 5.128 * a(ft), ot = 385001 - 20905 * l(G);
        return {
          ra: q(et, ht),
          dec: K(et, ht),
          dist: ot
        };
      }
      Tt.getMoonPosition = function(k, $, G) {
        var ft = M * -G, et = M * $, ht = E(k), ot = Kn(ht), ct = _t(ht, ft) - ot.ra, Mt = it(ct, et, ot.dec), Kt = g(a(ct), p(et) * l(ot.dec) - a(ot.dec) * l(ct));
        return Mt = Mt + Wt(Mt), {
          azimuth: Z(ct, et, ot.dec),
          altitude: Mt,
          distance: ot.dist,
          parallacticAngle: Kt
        };
      }, Tt.getMoonIllumination = function(k) {
        var $ = E(k || /* @__PURE__ */ new Date()), G = Ht($), ft = Kn($), et = 149598e3, ht = y(a(G.dec) * a(ft.dec) + l(G.dec) * l(ft.dec) * l(G.ra - ft.ra)), ot = g(et * a(ht), ft.dist - et * l(ht)), ct = g(l(G.dec) * a(G.ra - ft.ra), a(G.dec) * l(ft.dec) - l(G.dec) * a(ft.dec) * l(G.ra - ft.ra));
        return {
          fraction: (1 + l(ot)) / 2,
          phase: 0.5 + 0.5 * ot * (ct < 0 ? -1 : 1) / Math.PI,
          angle: ct
        };
      };
      function Se(k, $) {
        return new Date(k.valueOf() + $ * I / 24);
      }
      Tt.getMoonTimes = function(k, $, G, ft) {
        var et = new Date(k);
        ft ? et.setUTCHours(0, 0, 0, 0) : et.setHours(0, 0, 0, 0);
        for (var ht = 0.133 * M, ot = Tt.getMoonPosition(et, $, G).altitude - ht, ct, Mt, Kt, Ft, Bt, _e, vt, Lt, ke, Ct, Ut, le, te, pt = 1; pt <= 24 && (ct = Tt.getMoonPosition(Se(et, pt), $, G).altitude - ht, Mt = Tt.getMoonPosition(Se(et, pt + 1), $, G).altitude - ht, Bt = (ot + Mt) / 2 - ct, _e = (Mt - ot) / 2, vt = -_e / (2 * Bt), Lt = (Bt * vt + _e) * vt + ct, ke = _e * _e - 4 * Bt * ct, Ct = 0, ke >= 0 && (te = Math.sqrt(ke) / (Math.abs(Bt) * 2), Ut = vt - te, le = vt + te, Math.abs(Ut) <= 1 && Ct++, Math.abs(le) <= 1 && Ct++, Ut < -1 && (Ut = le)), Ct === 1 ? ot < 0 ? Kt = pt + Ut : Ft = pt + Ut : Ct === 2 && (Kt = pt + (Lt < 0 ? le : Ut), Ft = pt + (Lt < 0 ? Ut : le)), !(Kt && Ft)); pt += 2)
          ot = Mt;
        var ve = {};
        return Kt && (ve.rise = Se(et, Kt)), Ft && (ve.set = Se(et, Ft)), !Kt && !Ft && (ve[Lt > 0 ? "alwaysUp" : "alwaysDown"] = !0), ve;
      }, f.exports = Tt;
    })();
  }(Cs)), Cs.exports;
}
var vu = Z0();
function He(f, s) {
  const r = f.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !1,
    timeZone: s
  }).split(":").map((a) => Number(a));
  return r[0] * 60 * 60 + r[1] * 60 + r[2];
}
class J0 {
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
class Bu {
  constructor(s, r, a, l) {
    P(this, "start");
    P(this, "lat");
    P(this, "lon");
    P(this, "timezone");
    P(this, "sun");
    P(this, "startTime");
    this.start = s, this.lat = a, this.lon = l, this.timezone = r;
    const p = vu.getTimes(this.start, this.lat, this.lon), d = vu.getPosition(p.nadir, this.lat, this.lon);
    this.sun = new J0({
      nadir: He(p.nadir, this.timezone),
      dawn: He(p.dawn, this.timezone),
      sunrise: He(p.sunrise, this.timezone),
      dusk: He(p.dusk, this.timezone),
      sunset: He(p.sunset, this.timezone),
      noon: He(p.solarNoon, this.timezone),
      nadirAltitude: d.altitude * 180 / Math.PI
    }), this.startTime = He(this.start, this.timezone);
  }
  dateAtElapsed(s) {
    const r = new Date(this.start);
    return r.setTime(r.getTime() + s * 1e3), r;
  }
  elapsedToTimeOfDay(s) {
    return (this.startTime + s) % 86400;
  }
}
var bs = {}, mu;
function Y0() {
  return mu || (mu = 1, function(f) {
    (function() {
      var s = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
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
        var M = 1, I = g.length, m, R = "", F, T, E, N, q, K, Z, it;
        for (F = 0; F < I; F++)
          if (typeof g[F] == "string")
            R += g[F];
          else if (typeof g[F] == "object") {
            if (E = g[F], E.keys)
              for (m = y[M], T = 0; T < E.keys.length; T++) {
                if (m == null)
                  throw new Error(r('[sprintf] Cannot access property "%s" of undefined value "%s"', E.keys[T], E.keys[T - 1]));
                m = m[E.keys[T]];
              }
            else E.param_no ? m = y[E.param_no] : m = y[M++];
            if (s.not_type.test(E.type) && s.not_primitive.test(E.type) && m instanceof Function && (m = m()), s.numeric_arg.test(E.type) && typeof m != "number" && isNaN(m))
              throw new TypeError(r("[sprintf] expecting number but found %T", m));
            switch (s.number.test(E.type) && (Z = m >= 0), E.type) {
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
            s.json.test(E.type) ? R += m : (s.number.test(E.type) && (!Z || E.sign) ? (it = Z ? "+" : "-", m = m.toString().replace(s.sign, "")) : it = "", q = E.pad_char ? E.pad_char === "0" ? "0" : E.pad_char.charAt(1) : " ", K = E.width - (it + m).length, N = E.width && K > 0 ? q.repeat(K) : "", R += E.align ? it + m + N : q === "0" ? it + N + m : N + it + m);
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
              var R = [], F = M[2], T = [];
              if ((T = s.key.exec(F)) !== null)
                for (R.push(T[1]); (F = F.substring(T[0].length)) !== ""; )
                  if ((T = s.key_access.exec(F)) !== null)
                    R.push(T[1]);
                  else if ((T = s.index_access.exec(F)) !== null)
                    R.push(T[1]);
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
  }(bs)), bs;
}
var Uu = Y0();
const X0 = Ke("PaceChunk");
class Q0 {
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
class wu {
  constructor(s, r, a, l) {
    P(this, "constraints");
    P(this, "points");
    P(this, "plan");
    P(this, "delay");
    P(this, "factor");
    P(this, "factors", new Ce());
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
    const g = this.factor ? this.np : this.plan.pacing.pace, y = new Ce().init(0);
    for (let M = 1, I = s.length; M < I; M++) {
      l = s[M].loc - s[M - 1].loc, Gn(s[M - 1], this.plan), y.applyEach((R, F) => R + F * l, s[M - 1].factors);
      const m = s[M - 1].factors.combined;
      d += m * l, p = g * m * l, s[M].time = s[M - 1].time + p, a = s[M - 1].delay || 0, r += p + a, s[M].elapsed = r, this.plan.event.start && (s[M].tod = this.plan.event.elapsedToTimeOfDay(r));
    }
    Gn(s[s.length - 1], this.plan), this.factors = y.scaleEach(1 / this.dist), this.factor = d / this.dist;
  }
  /**
   * iterate applyPacing method until tests pass
   */
  calculate() {
    const a = X0.extend(
      Uu.vsprintf("calculate:%.2f-%.2f", [this.points[0].loc, this.points[this.points.length - 1].loc])
    );
    let l = this.factor || 0, p, d;
    const g = new Q0();
    for (d = 1; d <= 30; d++)
      if (this.applyPacing(), g.iterations = d >= 2, g.factor = !Q.round(l - this.factor, d === 30 ? 6 : 8), l = this.factor, g.target = Math.abs(
        (Q.isFunction(this.constraints[1]) ? this.constraints[1]() : this.constraints[1]) - this.points[this.points.length - 1].elapsed
      ) < 0.1, g.points = p && this.points.every((M, I) => Mn(M.elapsed, p[I], 0)) || !1, p = this.points.map((M) => M.elapsed), g.passing) {
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
const ce = Ke("Pacing");
class $u {
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
    ce("clearCache"), delete this._factor, delete this._factors;
  }
  get elapsed() {
    return ce("elapsed:get"), this.plan.points[this.plan.points.length - 1].elapsed;
  }
  get pace() {
    return ce("pace:get"), (this.elapsed - this.plan.delay) / this.plan.course.dist;
  }
  get factor() {
    return this._factor ? this._factor : (ce("factor:update"), this.chunks && (this._factor = Q.sum(this.chunks.map((s) => s.factor * s.dist)) / this.plan.course.dist), this._factor || 1);
  }
  clearFactor() {
    delete this._factor;
  }
  get factors() {
    return ce("factors:get"), this._factors || (ce("factors:update"), this._factors = Rs(this.chunks)), this._factors;
  }
  /**
   * check if this pacing is current
   */
  get isCurrent() {
    return this.version === this.plan.version;
  }
  get np() {
    return ce("np:get"), this.pace / this.factor;
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
    const s = ce.extend("calculate");
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
    }), Q.isFunction(this.chunks[this.chunks.length - 1].constraints[1]) && this.chunks.length > 2 && (s("rerunning last chunk"), this.chunks[this.chunks.length - 1].calculate()), ce(`pacing status=${this.status.success ? "PASS" : "FAIL"}.`); this.plan.points.find((d) => d.interpolated); ) {
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
    this.chunks = [new wu(this.plan, this.plan.points, [0, s], this.plan.delay)], this.plan.points.forEach((r) => {
      r._chunk = this.chunks[0];
    });
  }
  /**
   * calculate pacing for each pacing chunk
   */
  calcChunks() {
    ce("calcChunks"), this.clearCache(), this.chunks.filter((s) => !s.status).forEach((s) => s.calculate());
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
    ce.extend("split")(`breaking chunks at ${r.loc} km`);
    const p = s.points.findIndex((y) => y === r), d = Q.round(r.elapsed - r.time), g = new wu(this.plan, s.points.slice(0, p + 1), [0, a], d);
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
    ce(Uu.sprintf("calcChunks: merging %i&%i (%.2f&%.2f)", a, l, s.np, r.np)), s.points.pop(), s.points.push(...r.points), s.delay += r.delay, delete s.status, s.points.forEach((p) => {
      p._chunk = s;
    }), s.constraints = [s.constraints[0], r.constraints[1]], this.chunks.splice(l, 1), s.calculate();
  }
}
class Ps extends $r {
  constructor(r, a) {
    super(r.course, a, a.loop);
    P(this, "_plan");
    P(this, "_chunk");
    P(this, "delay", 0);
    P(this, "elapsed", 0);
    P(this, "factors", new Ce());
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
const Ss = Ke("PlanSplits");
class V0 {
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
    Ss("createSegments");
    const s = this.plan.course.waypoints, r = this.calcSegments(
      qr(
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
    Ss(`createSplits:${s}`);
    const r = Fu(s), a = Q.range(this.plan.course.dist * r).map(
      (p) => p / r
    );
    this.plan.course.dist - a[a.length - 1] > 1e-4 && a.push(this.plan.course.dist);
    const l = this.calcSegments(qr(a, this.plan.course.dist));
    if (!l.length) throw new Error("createSplits result is empty");
    return l;
  }
  calcSegments(s) {
    var F;
    Ss.extend("calcSegments")("exec"), this.plan.checkPacing();
    const a = this.plan, l = a.course, p = a.points, d = [], g = [];
    let y, M, I = a.points[0], m;
    for (y = 0, M = s.length; y < M; y++) {
      const T = s[y];
      m && Mn((F = s[y - 1]) == null ? void 0 : F.end, T.start, 4) ? I = m : I = a.getPoint(T.start), m = a.getPoint(T.end);
      const E = T.end - T.start, N = new Ou(this.plan, {
        gain: 0,
        loss: 0,
        grade: E > 0 ? (m.alt - I.alt) / E / 10 * (m.alt - I.alt > 0 ? l.gainScale : l.lossScale) : 0,
        point1: I,
        point2: m
      }), q = new Ce().init(0);
      d.push(N), g.push(q);
    }
    const R = (T, E, N, q) => {
      const K = N.alt - E.alt;
      T[K > 0 ? "gain" : "loss"] += K * (K > 0 ? l.gainScale : l.lossScale), Gn(E, a);
      const Z = N.loc - E.loc;
      q.applyEach((it, _t) => it + _t * Z, E.factors);
    };
    y = 1;
    for (let T = 0; T < d.length; T++) {
      const E = d[T], N = g[T];
      for (; yn(p[y].loc, E.point1.loc, 4); ) y++;
      let q = E.point1;
      for (; y < p.length && yn(p[y].loc, E.point2.loc, 4); ) {
        const K = p[y];
        R(E, q, K, N), q = K, y++;
      }
      R(E, q, E.point2, N), a && (E.delay = a.delays.filter((K) => zr(E.point1.loc, K.loc, 4) && Gr(E.point2.loc, K.loc, 4)).reduce((K, Z) => K + Z.delay, 0));
    }
    return d;
  }
}
const ze = Ke("models:Plan");
function yu(f) {
  if (!(!f || Object.keys(f).every((s) => {
    const r = f[s];
    return r === void 0 || r >= 0 && r <= 2;
  })))
    throw new Error("Plan scales must be between 0 and 2");
}
class j0 {
  constructor(s, r) {
    P(this, "_cache", {});
    P(this, "_data");
    P(this, "course");
    P(this, "pacing", new $u(this));
    P(this, "points");
    P(this, "splits", new V0(this));
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    P(this, "_version", 0);
    if (yu(r.scales), this.course = s, this._data = r, r.delays) {
      const a = s.sites.map((p) => p.id), l = r.delays.find((p) => !a.includes(p.siteId));
      if (l)
        throw console.error(`Site in plan delays is not in course sites (${String(l.siteId)})`), new Error("Site in plan delays is not in course sites.");
    }
    this.points = this.course.points.map((a) => new Ps(this, a)), this._version = 1;
  }
  get cache() {
    var s;
    return ((s = this._cache) == null ? void 0 : s.version) === this.version ? this._cache : (this._cache = { version: this.version }, this._cache);
  }
  get strategies() {
    var r;
    if ("strategies" in this._cache) return this._cache.strategies;
    this._cache.strategies = {};
    const s = ((r = this._data.strategies) == null ? void 0 : r.climbing) ?? 1;
    if (s !== 1) {
      let a = 0, l = 0;
      const p = (d) => d.grade >= 4;
      for (let d = 1, g = this.points.length; d < g; d++) {
        const y = this.points[d].loc - this.points[d - 1].loc;
        p(this.points[d - 1]) && (l += y, a += y * (1 - s));
      }
      this._cache.strategies.climbing = {
        default: a / (this.course.dist - l) + 1,
        factor: s,
        filter: p
      };
    }
    return this._cache.strategies;
  }
  get cutoffMargin() {
    return this._data.cutoffMargin;
  }
  get cutoffs() {
    var r;
    if ("cutoffs" in this.cache) return this.cache.cutoffs;
    this.cache.cutoffs = this.cutoffMargin ? ((r = this.course.cutoffs) == null ? void 0 : r.map((a) => new e_(this, a, this.getPoint(a.loc, !0)))) || [] : [];
    let s = 0;
    for (; this.cache.cutoffs.length - 1 >= s; ) {
      const a = this.cache.cutoffs[s];
      this.cache.cutoffs.find((l, p) => p > s && l.time <= a.time) ? (ze(`get cutoffs: deleting extraneous cutoff at ${a.loc} km`), this.cache.cutoffs.splice(s, 1)) : s++;
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
      ), p = l ? l.delay : a.hasTypicalDelay ? this.typicalDelay : 0;
      return new t_(a, p);
    }).filter((a) => a.delay > 0).sort((a, l) => a.loc - l.loc);
    let r = 0;
    for (; s.length - 1 >= r; )
      r > 0 && s[r].loc === s[r - 1].loc ? (ze(`get delays: merging delay at ${s[r].loc} km`), s[r - 1].delay += s[r].delay, s.splice(r, 1)) : r++;
    return this.cache.delays = s, this.cache.delays;
  }
  get event() {
    if ("event" in this.cache) return this.cache.event;
    if (this._data.start)
      return this.cache.event = new Bu(
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
    const l = bu(
      this.points.map((d) => d.elapsed),
      this.points.map((d) => d.loc),
      s.map((d) => d.elapsed)
    ), p = s.map((d, g) => ({ ...d, loc: l[g] }));
    return this.cache.events = { sun: p }, this.cache.events;
  }
  get gradeModel() {
    var a;
    if ("gradeModel" in this.cache) return this.cache.gradeModel;
    const s = ((a = this.scales) == null ? void 0 : a.descending) ?? 1, r = -Me.b / (2 * Me.a);
    return s !== 1 && (this.cache.gradeModel = (l) => Au(l < r ? r + (l - r) / s : l)), this.cache.gradeModel;
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
    ze("calculating stats.factors");
    const s = Q.fromPairs(
      mn.map((p) => {
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
    ze("calculating stats.sun");
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
    return "strategy" in this.cache ? this.cache.strategy : this.cache.strategy = new Tu(this, this._data.strategy);
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
    if (ze("checkPacing"), (!((s = this.pacing.status) != null && s.complete) || !this.pacing.isCurrent) && (ze("checkPacing: calculate"), this.pacing.calculate()), !((r = this.points) != null && r.length)) throw new Error("No plan points");
    return !0;
  }
  getDelayAtWaypoint(s) {
    var r;
    return ((r = this.delays.find((a) => a.waypoint === s)) == null ? void 0 : r.delay) || 0;
  }
  getPoint(s, r = !1) {
    const a = this.points.findIndex((y) => zr(y.loc, s, 4)), l = this.points[a];
    if (Mn(l.loc, s, 4)) return l;
    ze(`getPoint: ${r ? "inserting" : "creating"} new PlanPoint at ${s}`);
    const p = a - 1, d = this.points[p], g = new Ps(this, this.course.getPoint(s));
    return g.delay = Math.round(l.elapsed - d.elapsed - (l.time - d.time)), g.time = wn(d.loc, l.loc, d.time, l.time, g.loc), g.elapsed = d.elapsed + d.delay + (g.time - d.time), g.tod = this.event.elapsedToTimeOfDay(g.elapsed), Gn(g, this), r && this.points.splice(a, 0, g), g;
  }
  update(s) {
    yu(s.scales);
    const a = ["target", "method"].find((l) => l in s && Q.isNil(s[l]));
    if (a) throw new Error(`Plan.${a} cannot be set to null or undefined`);
    Object.assign(this._data, s), this._version++;
  }
}
class t_ {
  constructor(s, r) {
    P(this, "delay");
    P(this, "waypoint");
    this.waypoint = s, this.delay = r;
  }
  get loc() {
    return this.waypoint.loc;
  }
}
class e_ {
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
const qu = (f, s, r, a) => {
  const l = xu(f, s, r, a), p = [];
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
function n_(f, s) {
  return qu(
    s,
    f.map((a) => a.alt),
    s,
    0.05
  ).map((a) => a.grade);
}
const r_ = (f) => {
  let s = 0, r = 0;
  const a = [0];
  for (let l = 1, p = f.length; l < p; l++)
    s = Number(f[l - 1].latlon.distanceTo(f[l].latlon)), r += s, a.push(r);
  return a;
}, Br = Ke("models:Track");
class Kr {
  constructor(s) {
    P(this, "dist");
    P(this, "gain");
    P(this, "loss");
    P(this, "points");
    Br("Creating new Track object");
    const r = s.map((M) => new Fs(M)), a = r_(r), l = n_(r, a);
    this.points = r.map((M, I) => new Hr(M, a[I], l[I])), Br(`set-points - ${r.length} points`), Br("Calculating"), this.dist = this.points[this.points.length - 1].loc;
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
      r = Du(this.points[a - 1], this.points[a], s);
    }
    return Q.pick(r, ["lat", "lon", "alt"]);
  }
  getNearestPoint(s, r, a) {
    let p = this.points.findIndex((y) => y === r), d = this.points[p], g = 0;
    for (; a > 0.025; ) {
      const y = a / 5, M = [d];
      for (let R = 1; R <= 5; R++) {
        const F = d.loc + y * R;
        if (F <= this.dist) {
          for (; this.points[p + 1].loc < F && p < this.points.length - 1; )
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
    const a = Br.extend("reduceDensity");
    if (this.dist / s > r / 2)
      return a("Does not meet criteria"), this;
    const l = this.dist, p = Math.floor(l / s) + 1, d = Array(p).fill(0).map((I, m) => Nt(m++ * s, 3));
    d[d.length - 1] < l && d.push(l);
    const g = qu(
      this.points.map((I) => I.loc),
      this.points.map((I) => I.alt),
      d,
      2 * s
    ), y = d.map((I) => this.getLLA(I)).map((I, m) => ({
      lat: Nt(I.lat, 6),
      lon: Nt(I.lon, 6),
      alt: Nt(g[m].alt, 2)
    })), M = new Kr(y);
    return a(`Reduced from ${this.points.length} to ${M.points.length} points.`), M;
  }
}
function i_(f, s, r) {
  const a = f.map((l, p) => ({ lat: f[p], lon: s[p], alt: r[p] }));
  return new Kr(a);
}
const c_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Course: K0,
  CourseCutoff: Wu,
  CoursePoint: $r,
  CourseSegment: ku,
  Event: Bu,
  Pacing: $u,
  Plan: j0,
  PlanPoint: Ps,
  PlanSegment: Ou,
  Point: Fs,
  Site: Ur,
  Track: Kr,
  TrackPoint: Hr,
  Waypoint: As,
  createTrackFromArrays: i_,
  terrainTypes: Nu
}, Symbol.toStringTag, { value: "Module" })), l_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  dateToTODSeconds: He
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ce as Factors,
  c_ as Models,
  Tu as Strategy,
  N0 as adjustStrategy,
  a_ as enableDebug,
  u_ as factors,
  Du as interpolatePoint,
  o_ as math,
  L0 as scaleDark,
  l_ as util
};
