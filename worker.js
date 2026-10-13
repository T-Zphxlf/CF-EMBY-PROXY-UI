function tn(o) {
  const e = String(o || "").trim();
  if (!/^\d+$/.test(e)) return null;
  const t = Number(e);
  return Number.isFinite(t) ? t : null;
}
function so(o) {
  if (o == null) return "";
  try {
    return o instanceof ArrayBuffer ? new TextDecoder().decode(new Uint8Array(o)) : ArrayBuffer.isView(o) ? new TextDecoder().decode(o) : String(o || "");
  } catch {
    return "";
  }
}
async function Ys(o, e) {
  const t = Math.max(0, Math.floor(Number(e) || 0)), r = tn(o?.headers?.get?.("Content-Length"));
  if (Number.isFinite(r) && r > t) {
    try {
      Promise.resolve(o?.body?.cancel?.()).catch(() => {
      });
    } catch {
    }
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: r,
      exceeded: !0
    };
  }
  if (!o?.body) return {
    bodyBytes: /* @__PURE__ */ new Uint8Array(0),
    bytes: 0,
    exceeded: !1
  };
  const a = o.body.getReader(), n = [];
  let s = 0;
  try {
    for (; ; ) {
      const { done: l, value: u } = await a.read();
      if (l) break;
      const d = u instanceof Uint8Array ? u : new Uint8Array(u || 0);
      if (s + d.byteLength > t) {
        try {
          Promise.resolve(a.cancel()).catch(() => {
          });
        } catch {
        }
        return {
          bodyBytes: /* @__PURE__ */ new Uint8Array(0),
          bytes: s + d.byteLength,
          exceeded: !0
        };
      }
      n.push(d), s += d.byteLength;
    }
  } catch {
    return {
      bodyBytes: /* @__PURE__ */ new Uint8Array(0),
      bytes: s,
      exceeded: !0
    };
  } finally {
    try {
      a.releaseLock();
    } catch {
    }
  }
  const i = new Uint8Array(s);
  let c = 0;
  for (const l of n)
    i.set(l, c), c += l.byteLength;
  return {
    bodyBytes: i,
    bytes: s,
    exceeded: !1
  };
}
async function De(o, e) {
  const t = await Ys(o, e);
  return {
    text: t.exceeded ? "" : new TextDecoder().decode(t.bodyBytes),
    bytes: t.bytes,
    exceeded: t.exceeded
  };
}
function rn(o) {
  let e = /* @__PURE__ */ new WeakMap(), t = o(), r = t;
  return {
    get(a = null) {
      if (!a || typeof a != "object" && typeof a != "function") return t;
      let n = e.get(a);
      return n || (n = o(), e.set(a, n)), r = n, n;
    },
    current() {
      return r;
    },
    reset() {
      e = /* @__PURE__ */ new WeakMap(), t = o(), r = t;
    }
  };
}
function ml(o, e = 8192) {
  const t = Math.max(2, Math.floor(Number(e) || 8192)), r = Math.max(1, Math.min(32, Math.floor(t / 256))), a = Math.max(16, Math.min(512, Math.floor(t / Math.max(4, r * 2)))), n = 4, s = Math.max(8, Math.min(256, Math.floor(t / 32))), i = /* @__PURE__ */ new WeakSet();
  let c = 0, l = !1;
  const u = (f, m = 0) => {
    if (f == null) return f;
    if (typeof f == "string")
      return f.length <= a ? f : (l = !0, `${f.slice(0, a)}...`);
    if (typeof f == "number" || typeof f == "boolean") return f;
    if (typeof f == "bigint" || typeof f != "object") return String(f);
    if (i.has(f)) return "[Circular]";
    if (m >= n || c >= s)
      return l = !0, "[Truncated]";
    c += 1, i.add(f);
    try {
      if (Array.isArray(f)) {
        const g = [];
        for (let y = 0; y < f.length && y < r; y += 1) g.push(u(f[y], m + 1));
        return f.length > r && (l = !0, g.push("[Truncated]")), g;
      }
      const p = {};
      let h = 0;
      for (const g in f) {
        if (!Object.prototype.hasOwnProperty.call(f, g)) continue;
        if (h >= r) {
          l = !0, p._truncated = !0;
          break;
        }
        const y = g.length > a ? `${g.slice(0, a)}...` : g;
        p[y] = u(f[g], m + 1), h += 1;
      }
      return p;
    } finally {
      i.delete(f);
    }
  };
  try {
    const f = JSON.stringify(u(o));
    if (!l && f && f.length <= t) return f;
  } catch {
  }
  const d = JSON.stringify({ truncated: !0 });
  return d.length <= t ? d : "{}";
}
function ne(o = "") {
  const e = String(o || "");
  let t = 2166136261;
  for (let r = 0; r < e.length; r += 1)
    t ^= e.charCodeAt(r), t = Math.imul(t, 16777619);
  return (t >>> 0).toString(36);
}
function jo(o = []) {
  const e = Array.isArray(o) ? o : [o];
  let t = 2166136261;
  const r = (a) => {
    for (let n = 0; n < 32; n += 8)
      t ^= a >>> n & 255, t = Math.imul(t, 16777619);
  };
  r(e.length);
  for (const a of e) {
    const n = String(a ?? "");
    r(n.length);
    for (let s = 0; s < n.length; s += 1)
      t ^= n.charCodeAt(s), t = Math.imul(t, 16777619);
  }
  return (t >>> 0).toString(36);
}
function bn(o = "") {
  const e = new TextEncoder().encode(String(o || ""));
  let t = 14695981039346656037n;
  const r = 1099511628211n;
  for (const a of e)
    t ^= BigInt(a), t = BigInt.asUintN(64, t * r);
  return t.toString(16).padStart(16, "0");
}
async function On(o = "") {
  const e = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(o || "")));
  return [...new Uint8Array(e)].map((t) => t.toString(16).padStart(2, "0")).join("");
}
function ht(o) {
  const e = Array.isArray(o) ? o : String(o || "").split(/[\\r\\n,，;；|]+/), t = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    const n = String(a || "").trim();
    if (!n) continue;
    const s = n.toLowerCase();
    t.has(s) || (t.add(s), r.push(n));
  }
  return r;
}
function io(o) {
  const e = String(o || "").trim().toLowerCase();
  if (!e) return null;
  const t = e.includes("*"), r = e.replace(/^\*\./, "").replace(/^\*+/, "").replace(/\*+$/g, "").replace(/^\.+|\.+$/g, "");
  return r ? {
    hostname: r,
    wildcard: t
  } : null;
}
function re(o) {
  return io(o)?.hostname || "";
}
function Zt(o = []) {
  const e = Array.isArray(o) ? o : [o], t = [], r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const n = String(a || "").trim();
    !n || r.has(n) || (r.add(n), t.push(n));
  }
  return t;
}
function $(o) {
  return !!o && typeof o == "object" && !Array.isArray(o);
}
function le(o, e, t, r) {
  let a;
  if (typeof o == "number") a = o;
  else if (typeof o == "string") {
    const n = o.trim();
    if (!/^-?\d+$/.test(n)) return e;
    a = Number(n);
  } else return e;
  return Number.isFinite(a) ? Math.min(r, Math.max(t, Math.floor(a))) : e;
}
function pl(o, e, t, r) {
  const a = Number(o);
  return Number.isFinite(a) ? Math.min(r, Math.max(t, a)) : e;
}
function ua(o, e) {
  return !!o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, e);
}
function Pa(o) {
  return String(o || "").replace(/[\\%_]/g, "\\$&");
}
function gl(o) {
  const e = String(o || "").trim();
  return e ? /^(?:\d{1,3}\.){3}\d{1,3}$/.test(e) ? !0 : /^[0-9a-f:]+$/i.test(e) && e.includes(":") : !1;
}
function Vo(o) {
  const e = String(o || "").trim();
  return e ? /^[a-z]{3,4}$/i.test(e) : !1;
}
function hl() {
  return {
    phase: 0,
    lastRunAt: 0,
    iterators: {
      node: null,
      playbackRoute: null,
      crypto: null,
      rate: null,
      log: null,
      playbackInfo: null,
      failover: null,
      progress: null,
      monthlyTraffic: null
    }
  };
}
function yl() {
  const o = rn(() => ({ namespaces: /* @__PURE__ */ new Map() }));
  let e = "default";
  const t = (r, a = "default") => {
    const n = String(a || "default").trim() || "default";
    let s = r.namespaces.get(n);
    return s || (s = {
      ConfigCache: null,
      RuntimeConfigCacheGeneration: 0,
      SingleFlightTasks: /* @__PURE__ */ new Map()
    }, r.namespaces.set(n, s)), e = n, s;
  };
  return {
    get(r = null, a = "default") {
      return t(o.get(r), a);
    },
    current() {
      return t(o.current(), e);
    },
    reset() {
      o.reset(), e = "default";
    }
  };
}
function Sl() {
  const o = rn(() => ({
    KvDataMutationChain: Promise.resolve(),
    KvTidyMutationChain: Promise.resolve()
  }));
  return {
    get(e = null) {
      return o.get(e);
    },
    current() {
      return o.current();
    },
    reset() {
      o.reset();
    }
  };
}
function ur(o = globalThis) {
  try {
    return o?.caches?.default ?? null;
  } catch {
    return null;
  }
}
function vn(o = globalThis) {
  return o.crypto.subtle;
}
function qo(o) {
  return String(o || "").trim();
}
function _l(o = [], e = {}) {
  const t = /* @__PURE__ */ Object.create(null), r = /* @__PURE__ */ new Map();
  for (const s of o) {
    const i = qo(s?.name) || "anonymous", c = s?.handlers && typeof s.handlers == "object" ? s.handlers : s;
    for (const [l, u] of Object.entries(c || {})) {
      if (typeof u != "function") throw new TypeError(`Admin action ${l} from ${i} is not a function`);
      if (t[l]) throw new Error(`Duplicate admin action ${l}: ${r.get(l)} and ${i}`);
      t[l] = u, r.set(l, i);
    }
  }
  const a = Object.freeze({ ...e.aliases });
  for (const [s, i] of Object.entries(a)) if (!t[i]) throw new Error(`Admin action alias ${s} targets missing action ${i}`);
  for (const s of e.requiredActions || []) if (!t[s]) throw new Error(`Missing required admin action ${s}`);
  const n = Object.freeze({ ...t });
  return Object.freeze({
    handlers: n,
    names: Object.freeze(Object.keys(n).sort()),
    resolve(s) {
      const i = qo(s);
      return n[a[i] || i] || null;
    }
  });
}
function bl(o) {
  function e(r, a = null) {
    if (typeof r != "function") {
      const i = r;
      return (c) => e(c, i);
    }
    const n = o.get(a), s = n.KvDataMutationChain.catch(() => null).then(() => r());
    return n.KvDataMutationChain = s.catch(() => null), s;
  }
  function t(r, a = null) {
    if (typeof r != "function") {
      const i = r;
      return (c) => t(c, i);
    }
    const n = o.get(a), s = n.KvTidyMutationChain.catch(() => null).then(() => e(r, a));
    return n.KvTidyMutationChain = s.catch(() => null), s;
  }
  return Object.freeze({
    runDataMutation: e,
    runTidyMutation: t
  });
}
function El() {
  return rn(() => ({
    LogQueue: [],
    LogDedupe: /* @__PURE__ */ new Map(),
    LogFlushPending: !1,
    LogFlushTask: null,
    LogClearEpochMs: 0,
    LogLastFlushAt: 0,
    runtimeConfig: null
  }));
}
function dr(o = "") {
  return String(o || "").trim().toLowerCase().split(";", 1)[0].trim();
}
function an(o = "") {
  const e = dr(o);
  return e === "application/json" || e === "text/json" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(e);
}
function Js(o = "") {
  const e = dr(o);
  return e === "text/html" || e === "application/xhtml+xml";
}
function Tl(o = "", e = "text/html") {
  const t = dr(e);
  if (!Js(t)) return !1;
  const [r, a] = t.split("/", 2);
  let n = -1, s = 0;
  for (const i of String(o || "").split(",")) {
    const [c, ...l] = i.split(";"), [u, d] = dr(c).split("/", 2);
    let f = -1;
    if (u === r && d === a ? f = 2 : u === r && d === "*" ? f = 1 : u === "*" && d === "*" && (f = 0), f < n || f < 0) continue;
    let m = 1;
    for (const p of l) {
      const [h, g] = p.split("=", 2);
      if (String(h || "").trim().toLowerCase() !== "q") continue;
      const y = String(g || "").trim();
      m = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(y) ? Number(y) : 0;
      break;
    }
    f > n && (n = f, s = m);
  }
  return s > 0;
}
var Rl = Object.freeze({
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  408: "Request Timeout",
  409: "Conflict",
  429: "Too Many Requests",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout"
});
function Fn(o, e, t = {}) {
  const r = e?.response, a = Math.max(400, Number(t.status) || 502), n = String(t.statusText || Rl[a] || "Error").trim(), s = new Headers(r?.headers || {});
  [
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Content-Range",
    "Digest",
    "ETag",
    "Last-Modified",
    "Location",
    "Refresh",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach((u) => s.delete(u)), s.set("Content-Type", "application/json; charset=utf-8"), s.set("Cache-Control", "no-store"), s.delete("X-Proxy-Mime-Guard"), s.delete("X-Proxy-Contract-Guard");
  const i = String(t.guardHeader || "").trim(), c = String(t.guardValue || "").trim();
  i && c && s.set(i, c);
  const l = {
    error: String(t.error || n || "Error"),
    code: a,
    message: String(t.message || "The API response did not satisfy the proxy contract."),
    ...t.details && typeof t.details == "object" && !Array.isArray(t.details) ? { details: t.details } : {}
  };
  try {
    Promise.resolve(r?.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return o && typeof o == "object" && (o.proxyGuardState = c), {
    ...e,
    response: new Response(o?.requestMethod === "HEAD" ? null : JSON.stringify(l), {
      status: a,
      statusText: n,
      headers: s
    })
  };
}
function Al(o, e, t = {}) {
  const r = e?.response;
  if (!r || o?.requestTraits?.isApiRequest !== !0 || r.status === 101 || r.status === 204 || r.status === 205 || r.status === 304) return e;
  const a = typeof t.sanitizePath == "function" ? t.sanitizePath : (l) => String(l || "/"), n = r.headers.get("Content-Type");
  if ((o?.requestMethod === "GET" || o?.requestMethod === "HEAD") && a(o?.proxyPath || "/") === "/" && Tl(o?.request?.headers?.get("Accept"), n) || !Js(n)) return e;
  const s = typeof t.buildErrorState == "function" ? t.buildErrorState : Fn, i = Number(r.status) || 0, c = i >= 400;
  return s(o, e, {
    status: c ? i : void 0,
    statusText: c && String(r.statusText || "").trim() || void 0,
    message: "Upstream API returned an HTML document instead of API data.",
    guardHeader: "X-Proxy-Mime-Guard",
    guardValue: "html-document",
    details: {
      upstreamStatus: r.status,
      contentType: dr(n) || "missing"
    }
  });
}
var Cl = "playback-info", Qs = /* @__PURE__ */ new WeakSet();
function co(o) {
  if (!o || typeof o != "object" || Array.isArray(o)) return !1;
  const e = Object.getPrototypeOf(o);
  return e === Object.prototype || e === null;
}
function nn(o = "") {
  let e;
  try {
    e = JSON.parse(String(o || ""));
  } catch {
    return null;
  }
  return co(e) ? e : null;
}
function lo({ response: o, bodyText: e, bodyBytes: t, payload: r }) {
  if (!o || !co(r)) return null;
  const a = Object.freeze({
    contract: Cl,
    response: o,
    bodyText: String(e || ""),
    bodyBytes: Math.max(0, Number(t) || 0),
    payload: r
  });
  return Qs.add(a), a;
}
function rr(o) {
  return Qs.has(o) && o?.contract === "playback-info" && !!o.response && typeof o.bodyText == "string" && Number.isFinite(o.bodyBytes) && o.bodyBytes >= 0 && co(o.payload);
}
function En(o, e) {
  return Object.freeze({
    kind: "invalid",
    reason: e,
    details: Object.freeze({
      reason: e,
      upstreamStatus: Number(o?.status) || 0,
      contentType: dr(o?.headers?.get?.("Content-Type")) || "missing"
    })
  });
}
var wl = 256 * 1024;
async function Ll(o, e = {}) {
  const t = String(e.requestMethod || "GET").toUpperCase();
  if (!o || !(o.status >= 200 && o.status < 300) || t === "HEAD" || o.status === 204 || o.status === 205 || !o.body) return Object.freeze({ kind: "skip" });
  if (!an(o.headers.get("Content-Type"))) return En(o, "unsupported_content_type");
  const r = Number(e.maxBytes), a = Number.isFinite(r) && r > 0 ? Math.floor(r) : wl, n = await De(o.clone(), a);
  if (n.exceeded) return En(o, Number(n.bytes) > a ? "body_too_large" : "body_read_failed");
  const s = nn(n.text);
  return s ? Object.freeze({
    kind: "valid",
    representation: lo({
      response: o,
      bodyText: n.text,
      bodyBytes: n.bytes,
      payload: s
    })
  }) : En(o, "invalid_root_object");
}
function uo(o) {
  const e = o instanceof Headers ? new Headers(o) : new Headers(o || {});
  return [
    "Content-Encoding",
    "Content-Length",
    "Content-MD5",
    "Digest",
    "ETag",
    "Transfer-Encoding"
  ].forEach((t) => e.delete(t)), e.set("Content-Type", "application/json; charset=utf-8"), e;
}
function Ba(o) {
  if (typeof o != "string") return o;
  const e = o.trim();
  if (!e || !e.startsWith("{") && !e.startsWith("[")) return o;
  try {
    return JSON.parse(e);
  } catch {
    return o;
  }
}
function fo(o) {
  const e = Ba(o);
  if (!Array.isArray(e)) return {
    items: [],
    changed: !0
  };
  let t = e !== o;
  const r = [];
  for (const a of e) {
    const n = Ba(a);
    if (!n || typeof n != "object" || Array.isArray(n)) {
      t = !0;
      continue;
    }
    n !== a && (t = !0), r.push(n);
  }
  return {
    items: r,
    changed: t
  };
}
function Zs(o) {
  let e = o, t = !1;
  const r = (a, n) => {
    e === o && (e = { ...o }), e[a] = n, t = !0;
  };
  for (const a of ["MediaStreams", "MediaAttachments"]) {
    if (!Object.prototype.hasOwnProperty.call(o, a)) continue;
    const n = fo(o[a]);
    n.changed && r(a, n.items);
  }
  if (Object.prototype.hasOwnProperty.call(o, "RequiredHttpHeaders")) {
    const a = Ba(o.RequiredHttpHeaders);
    !a || typeof a != "object" || Array.isArray(a) ? r("RequiredHttpHeaders", {}) : a !== o.RequiredHttpHeaders && r("RequiredHttpHeaders", a);
  }
  return {
    mediaSource: e,
    changed: t
  };
}
function mo(o) {
  if (!o || typeof o != "object" || Array.isArray(o) || !Object.prototype.hasOwnProperty.call(o, "MediaSources")) return {
    payload: o,
    rewriteState: "not_needed"
  };
  const e = fo(o.MediaSources);
  let t = e.changed;
  const r = e.items.map((a) => {
    const n = Zs(a);
    return n.changed && (t = !0), n.mediaSource;
  });
  return t ? {
    payload: {
      ...o,
      MediaSources: r
    },
    rewriteState: "applied"
  } : {
    payload: o,
    rewriteState: "not_needed"
  };
}
function ei(o, e = {}) {
  const t = mo(o), r = t.payload;
  if (!r || typeof r != "object" || Array.isArray(r) || !Array.isArray(r.MediaSources)) return {
    payload: o,
    rewriteState: "not_needed"
  };
  const a = typeof e.buildProxyUrl == "function" ? e.buildProxyUrl : () => "";
  let n = t.rewriteState === "applied";
  const s = r.MediaSources.map((i) => {
    let c = i;
    const l = (p, h, g = {}) => {
      const y = Object.prototype.hasOwnProperty.call(c, p);
      g.onlyIfPresent === !0 && !y || c[p] === h && !(g.ensurePresent === !0 && !y) || (c === i && (c = { ...i }), c[p] = h, n = !0);
    }, u = String(i.DirectStreamUrl || "").trim(), d = String(i.Path || "").trim(), f = u || d, m = f ? a(f) : "";
    return m ? (l("DirectStreamUrl", m, { ensurePresent: !0 }), l("Path", m, { ensurePresent: !0 })) : l("Path", "", { ensurePresent: !0 }), l("IsRemote", !1, { ensurePresent: !0 }), l("Protocol", "Http", { ensurePresent: !0 }), l("SupportsTranscoding", !1, { ensurePresent: !0 }), l("TranscodingUrl", "", { ensurePresent: !0 }), l("TranscodingSubProtocol", "", { onlyIfPresent: !0 }), l("TranscodingContainer", "", { onlyIfPresent: !0 }), l("TranscodingType", "", { onlyIfPresent: !0 }), c;
  });
  return n ? {
    payload: {
      ...r,
      MediaSources: s
    },
    rewriteState: "applied"
  } : {
    payload: o,
    rewriteState: "not_needed"
  };
}
function Dl(o, e = {}) {
  if (!rr(o)) return {
    kind: "invalid",
    reason: "invalid_representation"
  };
  const t = e.rewriteEnabled === !0 ? ei(o.payload, { buildProxyUrl: e.buildProxyUrl }) : mo(o.payload);
  if (t.rewriteState !== "applied") return {
    kind: "valid",
    representation: o,
    rewriteState: e.rewriteEnabled === !0 ? "not_needed" : "passthrough"
  };
  const r = JSON.stringify(t.payload), a = new TextEncoder().encode(r).byteLength, n = o.response;
  try {
    Promise.resolve(n.body?.cancel?.()).catch(() => {
    });
  } catch {
  }
  return {
    kind: "valid",
    representation: lo({
      response: new Response(r, {
        status: n.status,
        statusText: n.statusText,
        headers: uo(n.headers)
      }),
      bodyText: r,
      bodyBytes: a,
      payload: t.payload
    }),
    rewriteState: "applied"
  };
}
var Nl = new TextEncoder();
function Un(o) {
  return Nl.encode(String(o || "")).byteLength;
}
function ti(o, e) {
  const t = Number(o?.status);
  if (!(t >= 200 && t < 300) || t === 204 || t === 205) return null;
  let r;
  try {
    r = new Headers(Array.isArray(o?.headers) ? o.headers : []);
  } catch {
    return null;
  }
  if (!an(r.get("Content-Type"))) return null;
  const a = String(o.bodyText || ""), n = Un(a), s = Number(e);
  if (Number.isFinite(s) && s > 0 && n > s) return null;
  const i = nn(a);
  return i ? {
    headers: r,
    bodyText: a,
    bodyBytes: n,
    payload: i
  } : null;
}
var Il = class {
  constructor(o = {}) {
    if (!(o.entries instanceof Map)) throw new TypeError("PlaybackInfoCacheStore requires a Map");
    this.entries = o.entries, this.now = typeof o.now == "function" ? o.now : Date.now, this.maxEntries = Math.max(1, Number(o.maxEntries) || 1), this.maxEntryBytes = Math.max(1, Number(o.maxEntryBytes) || 1), this.maxTotalBytes = Math.max(1, Number(o.maxTotalBytes) || 1);
  }
  cleanup(o = this.now()) {
    for (const [t, r] of this.entries) {
      const a = Number(r?.expiresAt) || 0;
      a > 0 && a <= o && this.entries.delete(t);
    }
    for (; this.entries.size > this.maxEntries; ) {
      const t = this.entries.keys().next().value;
      if (!t) break;
      this.entries.delete(t);
    }
    let e = 0;
    for (const t of this.entries.values()) {
      const r = Number(t?.bodyBytes), a = Number.isFinite(r) && r > 0 ? r : Un(t?.bodyText);
      t.bodyBytes = a, e += a;
    }
    for (; this.entries.size > 0 && e > this.maxTotalBytes; ) {
      const t = this.entries.keys().next().value;
      if (!t) break;
      const r = this.entries.get(t);
      e -= Number(r?.bodyBytes) || 0, this.entries.delete(t);
    }
  }
  set(o, e, t = {}) {
    if (!o || !rr(e)) return !1;
    const r = e.response;
    if (!(r.status >= 200 && r.status < 300) || r.status === 204 || r.status === 205 || !an(r.headers.get("Content-Type"))) return !1;
    const a = Un(e.bodyText);
    if (a > this.maxEntryBytes || !nn(e.bodyText)) return !1;
    const n = Math.max(0, Number(t.ttlMs) || 0);
    if (n <= 0) return !1;
    const s = uo(r.headers);
    s.delete("Set-Cookie");
    const i = this.now();
    return this.entries.delete(o), this.entries.set(o, {
      nodeName: String(t.nodeName || "").trim().toLowerCase(),
      nodeRevision: String(t.nodeRevision || "").trim(),
      playbackInfoRewrite: String(t.playbackInfoRewrite || "").trim(),
      status: r.status,
      statusText: r.statusText,
      headers: [...s.entries()],
      bodyText: e.bodyText,
      bodyBytes: a,
      storedAt: i,
      expiresAt: i + n
    }), this.cleanup(i), !0;
  }
  get(o) {
    if (!o) return null;
    this.cleanup();
    const e = this.entries.get(o);
    if (!e) return null;
    const t = ti(e, this.maxEntryBytes);
    if (!t)
      return this.entries.delete(o), null;
    let r;
    try {
      r = new Response(t.bodyText, {
        status: Number(e.status) || 200,
        statusText: String(e.statusText || ""),
        headers: t.headers
      });
    } catch {
      return this.entries.delete(o), null;
    }
    const a = lo({
      response: r,
      bodyText: t.bodyText,
      bodyBytes: t.bodyBytes,
      payload: t.payload
    });
    return this.entries.delete(o), this.entries.set(o, {
      ...e,
      bodyBytes: t.bodyBytes
    }), {
      representation: a,
      metadata: e
    };
  }
};
function Ml() {
  return {
    NodeCache: /* @__PURE__ */ new Map(),
    PlaybackRouteHotCache: /* @__PURE__ */ new Map(),
    NodesListCache: null,
    NodesRevisionCache: null,
    NodesIndexCache: null,
    NodesRevisionCacheGeneration: 0,
    NodeCacheResetGeneration: 0,
    NodeCacheGenerationNonce: 0,
    NodeCacheGenerationEvictionEpoch: 0,
    NodeCacheGenerations: /* @__PURE__ */ new Map(),
    SingleFlightTasks: /* @__PURE__ */ new Map(),
    NodeIndexMutationChain: Promise.resolve(),
    CleanupIterators: {
      node: null,
      playbackRoute: null
    },
    CleanupState: hl()
  };
}
var yt = rn(Ml), Se = (o = null) => yt.get(o), ar = El(), Ka = yl(), kn = Sl(), { runDataMutation: er, runTidyMutation: Pl } = bl(kn), te = {
  ProxyFailoverStateCache: /* @__PURE__ */ new Map(),
  CryptoKeyCache: /* @__PURE__ */ new Map(),
  PlaybackInfoResponseCache: /* @__PURE__ */ new Map(),
  PlaybackProgressRelay: /* @__PURE__ */ new Map(),
  MetadataPrewarmTasks: /* @__PURE__ */ new Map(),
  TmdbLookupCache: /* @__PURE__ */ new Map(),
  DashboardMonthlyTrafficCache: /* @__PURE__ */ new Map(),
  SingleFlightTasks: /* @__PURE__ */ new Map(),
  AdminRemoteShellCacheMutationChains: /* @__PURE__ */ new Map(),
  LogsReadinessProbeCache: /* @__PURE__ */ new WeakMap(),
  ProxyAccessRuleProfileCache: /* @__PURE__ */ new WeakMap()
};
for (const o of [
  "NodeCache",
  "PlaybackRouteHotCache",
  "NodesListCache",
  "NodesRevisionCache",
  "NodesIndexCache",
  "NodesRevisionCacheGeneration",
  "NodeCacheResetGeneration",
  "NodeCacheGenerationNonce",
  "NodeCacheGenerationEvictionEpoch",
  "NodeCacheGenerations"
]) Object.defineProperty(te, o, {
  enumerable: !0,
  configurable: !1,
  get: () => yt.current()[o],
  set: (e) => {
    yt.current()[o] = e;
  }
});
for (const o of ["ConfigCache", "RuntimeConfigCacheGeneration"]) Object.defineProperty(te, o, {
  enumerable: !0,
  configurable: !1,
  get: () => Ka.current()[o],
  set: (e) => {
    Ka.current()[o] = e;
  }
});
var We = {
  LogQueue: [],
  LogDedupe: /* @__PURE__ */ new Map(),
  RateLimitCache: /* @__PURE__ */ new Map(),
  LogFlushPending: !1,
  LogFlushTask: null,
  LogClearEpochMs: 0,
  LogLastFlushAt: 0,
  OpsStatusWriteChain: Promise.resolve(),
  NodeIndexMutationChain: Promise.resolve(),
  InitCheckWarnedFingerprints: /* @__PURE__ */ new Set(),
  TmdbCredentialOverrideWarned: !1
};
for (const o of ["CleanupState"]) Object.defineProperty(We, o, {
  enumerable: !0,
  configurable: !1,
  get: () => yt.current()[o],
  set: (e) => {
    yt.current()[o] = e;
  }
});
for (const o of ["KvDataMutationChain", "KvTidyMutationChain"]) Object.defineProperty(We, o, {
  enumerable: !0,
  configurable: !1,
  get: () => kn.current()[o],
  set: (e) => {
    kn.current()[o] = e;
  }
});
var Y = {
  D1SchemaReadyState: /* @__PURE__ */ new WeakMap(),
  D1DatabaseInitReady: /* @__PURE__ */ new WeakMap(),
  LogsBaseDbReady: /* @__PURE__ */ new WeakMap(),
  StatsHourlyDbReady: /* @__PURE__ */ new WeakMap(),
  DnsIpWorkspaceDbReady: /* @__PURE__ */ new WeakMap(),
  OpsStatusDbReady: /* @__PURE__ */ new WeakMap(),
  OpsStatusShadowCache: /* @__PURE__ */ new WeakMap(),
  AdminShellStatusWriteState: /* @__PURE__ */ new WeakMap(),
  ScheduledLeaseDbReady: /* @__PURE__ */ new WeakMap(),
  AuthFailuresDbReady: /* @__PURE__ */ new WeakMap(),
  CfDashboardCacheDbReady: /* @__PURE__ */ new WeakMap(),
  CfRuntimeCacheDbReady: /* @__PURE__ */ new WeakMap()
};
function xl(o) {
  const e = {}, t = {};
  for (const r of o) for (const a of Object.keys(r)) t[a] = {
    enumerable: !0,
    configurable: !1,
    get: () => r[a],
    set: (n) => {
      r[a] = n;
    }
  };
  return Object.defineProperties(e, t);
}
var Ol = xl([
  te,
  We,
  Y
]);
function se(o, e = "unknown_error") {
  const t = String(o?.message || "").trim();
  return t || String(o || "").trim() || e;
}
function Ne(o, e = 500) {
  const t = Number(o);
  if (Number.isFinite(t) && t >= 400 && t <= 599) return Math.floor(t);
  const r = Number(e);
  return Number.isFinite(r) && r >= 400 && r <= 599 ? Math.floor(r) : 500;
}
function on(o) {
  if (!o || typeof o != "object") return !1;
  const e = String(o?.code || "").trim(), t = Number(o?.status);
  return !!e || Number.isFinite(t) && t >= 400 && t <= 599;
}
function vl(o, e = {}) {
  const t = Ne(e?.status, 500), r = String(e?.code || "INTERNAL_ERROR").trim().toUpperCase() || "INTERNAL_ERROR", a = String(e?.message || "Server Error").trim() || "Server Error", n = on(o);
  return {
    status: n ? Ne(o?.status, t) : t,
    code: n && String(o?.code || r).trim().toUpperCase() || r,
    message: n && String(o?.message || a).trim() || a,
    details: n && o?.details !== void 0 ? o.details : e?.details !== void 0 ? e.details : null
  };
}
function ri(o = "get", e = {}, t = "unknown_error") {
  const r = $(e) ? e : {}, a = {
    dependency: "KV",
    operation: String(o || "").trim().toLowerCase() === "list" ? "list" : "get",
    reason: String(t || "unknown_error").trim() || "unknown_error"
  }, n = String(r.key || "").trim(), s = String(r.prefix || "").trim();
  return n && (a.key = n), s && (a.prefix = s), we("KV_READ_FAILED", "KV 读取异常", 503, a);
}
function po(o) {
  return on(o) && String(o?.code || "").trim().toUpperCase() === "KV_READ_FAILED" && String(o?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function Fl(o, e = "INTERNAL_ERROR", t = "Server Error", r = "admin.read.kv_read_failed") {
  if (!po(o)) return o;
  const a = we(e, t, 503, { ...$(o?.details) ? o.details : {} });
  return Ae(r, a, a.details), a;
}
function wt(o, e, t, r = "admin.read") {
  if (!po(o)) return o;
  const a = String(o?.details?.operation || "").trim().toLowerCase() === "list" ? "list" : "get";
  return Fl(o, e, t, `${String(r || "admin.read").trim() || "admin.read"}.kv_${a}_failed`);
}
function Ae(o, e, t = null, r = "warn") {
  const a = r === "error" ? "error" : "warn", n = String(o || "runtime_failure").trim() || "runtime_failure", s = $(t) ? { ...t } : {}, i = String(e?.code || "").trim(), c = Number(e?.status);
  i && (s.errorCode = i), Number.isFinite(c) && (s.errorStatus = Math.floor(c)), Object.keys(s).length > 0 ? console[a](`[${n}] ${se(e)}`, s) : console[a](`[${n}] ${se(e)}`);
}
async function pe(o, e, t = null, r = null) {
  try {
    return await o;
  } catch (a) {
    return Ae(e, a, t), r;
  }
}
function we(o = "CONFIG_INVALID", e = "配置无效", t = 400, r = null) {
  const a = new Error(String(e || "配置无效"));
  return a.code = String(o || "CONFIG_INVALID"), a.status = Ne(t, 400), r != null && (a.details = r), a;
}
function $t(o) {
  return o ? o.name === "AbortError" ? !0 : String(o.message || "").toLowerCase().includes("abort") : !1;
}
var ai = 4 * 1024 * 1024, sn = 64 * 1024, ni = Object.freeze({
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=15552000; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block"
}), sa = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Emby-Authorization, X-Emby-Token, X-Emby-Client, X-Emby-Device-Id, X-Emby-Device-Name, X-Emby-Client-Version, X-MediaBrowser-Authorization, X-MediaBrowser-Token"
});
function Ur(o, e) {
  const t = o.get("Vary");
  if (!t) {
    o.set("Vary", e);
    return;
  }
  const r = t.split(",").map((a) => a.trim()).filter(Boolean);
  r.includes(e) || r.push(e), o.set("Vary", r.join(", "));
}
function Ce(o) {
  return Object.entries(ni).forEach(([e, t]) => o.set(e, t)), o;
}
function Z(o) {
  return Array.isArray(o) || $(o) ? JSON.stringify(o) : o === void 0 ? "" : JSON.stringify(o);
}
var H = () => Date.now(), oi = (o) => new Promise((e) => setTimeout(e, Math.max(0, Number(o) || 0)));
function Ul(o) {
  let e = !1, t = () => {
  };
  const r = setTimeout(() => {
    e || (e = !0, t(!0));
  }, Math.max(0, Number(o) || 0));
  return {
    promise: new Promise((a) => {
      t = a;
    }),
    cancel() {
      return e ? !1 : (e = !0, clearTimeout(r), t(!1), !0);
    }
  };
}
var kl = Object.freeze({
  JwtExpiry: 3600 * 24 * 30,
  LoginLockDuration: 900,
  MaxLoginAttempts: 5
}), Mt = Object.freeze({
  CacheTTL: 6e4,
  NodeMissCacheTtlMs: 1e3,
  CryptoKeyCacheTTL: 86400,
  CryptoKeyCacheMax: 100,
  NodeCacheMax: 512,
  PlaybackRouteHotCacheTtlMs: 86400 * 1e3,
  PlaybackRouteHotCacheMax: 256,
  NodesRevisionCacheTtlMs: 1e3,
  NodesReadConcurrency: 12,
  CacheTtlImagesDays: 30,
  PingCacheMinutes: 10,
  PlaybackInfoCacheTtlSec: 60,
  PlaybackInfoCacheMax: 64,
  PlaybackInfoCacheEntryMaxBytes: 256 * 1024,
  PlaybackInfoCacheTotalMaxBytes: 4 * 1024 * 1024,
  VideoProgressForwardIntervalSec: 3,
  VideoProgressForwardSessionMax: 128,
  VideoProgressSnapshotMaxBytes: 32 * 1024,
  RateLimitCacheMax: 4096,
  D1SchemaReadyTtlMs: 600 * 1e3,
  OpsStatusReadCacheTtlMs: 15 * 1e3,
  AdminShellStatusStableWriteIntervalMs: 300 * 1e3,
  CleanupBudgetMs: 1,
  CleanupChunkSize: 64,
  CleanupMinIntervalMs: 1e3
}), Hl = Object.freeze({
  EnableHostPrefixProxy: !1,
  MultiLinkCopyPanelEnabled: !1,
  DashboardShowD1WriteHotspot: !1,
  DashboardShowKvD1Status: !1,
  UiRadiusPx: 10,
  NodePanelPingAutoSort: !1
}), $l = Object.freeze({
  LogRetentionDays: 7,
  LogRetentionDaysMax: 365,
  LogFlushDelayMinutes: 20,
  LogFlushCountThreshold: 100,
  LogBatchChunkSize: 50,
  LogBatchRetryCount: 2,
  LogBatchRetryBackoffMs: 75,
  LogQueryDefaultDays: 1,
  LogKeywordMaxWindowDays: 3,
  LogSearchMode: "fts",
  LogWriteMode: "info",
  LogVacuumMinIntervalMs: 10080 * 60 * 1e3,
  LogFtsRebuildMinIntervalMs: 10080 * 60 * 1e3,
  KvTidyIntervalMs: 3600 * 1e3,
  TgAlertDroppedBatchThreshold: 0,
  TgAlertFlushRetryThreshold: 0,
  TgAlertCooldownMinutes: 30,
  TgAlertOnScheduledFailure: !1,
  TgAlertKvUsageEnabled: !1,
  TgAlertKvUsageThresholdPercent: 80,
  TgAlertD1UsageEnabled: !1,
  TgAlertD1UsageThresholdPercent: 80,
  LogQueueMax: 512,
  LogQueueOverflowDropCount: 256,
  LogDedupeMax: 2048,
  LogDedupeTrimTarget: 1024
}), Bl = Object.freeze({
  ScheduledLeaseMinMs: 30 * 1e3,
  ScheduledLeaseMs: 300 * 1e3,
  ScheduleUtcOffsetMinutes: 480,
  TgDailyReportSummaryEnabled: !1,
  TgDailyReportKvEnabled: !1,
  TgDailyReportD1Enabled: !1,
  TgDailyReportClockTimes: ["09:00"]
}), Ke = Object.freeze({
  PingTimeoutMs: 1e4,
  HedgeFailoverEnabled: !1,
  HedgeProbePreferGet: !0,
  HedgeProbePath: "/emby/system/ping",
  HedgeProbeTimeoutMs: 2500,
  HedgeProbeParallelism: 2,
  HedgeWaitTimeoutMs: 3e3,
  HedgeLockTtlMs: 5e3,
  HedgePreferredTtlSec: 300,
  HedgeFailureCooldownSec: 30,
  HedgeWakeJitterMs: 200,
  UpstreamTimeoutMs: 8e3,
  UpstreamRetryAttempts: 0,
  ProxyStreamIdleTimeoutMs: 15e3,
  ProxyPlaylistIdleTimeoutMs: 12e3,
  BufferedRetryBodyMaxBytes: 256 * 1024,
  PrewarmCacheTtl: 120,
  MetadataPrewarmTimeoutMs: 3e3,
  PrewarmPrefetchBytes: 4 * 1024 * 1024,
  DefaultPlaybackInfoMode: "passthrough",
  DefaultRealClientIpMode: "forward",
  DefaultMediaAuthMode: "auto"
}), Kl = Object.freeze({
  DnsHistoryLimit: 5,
  DnsIpProbeCacheTtlSec: 600,
  DnsIpProbeTimeoutMs: 2500,
  DnsIpProbeConcurrency: 4,
  DnsIpWorkspaceSyncProbeLimit: 2,
  DnsIpSourceConcurrency: 4,
  DnsIpSourceFetchMaxBytes: 2 * 1024 * 1024,
  DnsIpSourceIpLimit: 5
}), zl = Object.freeze({
  CfQuotaPlanCacheMinutes: 60,
  CfQuotaPlanOverride: ""
}), Wl = Object.freeze({
  AssetHash: "v19.5",
  Version: "19.5"
}), Gl = Object.freeze({
  ...kl,
  ...Mt,
  ...Hl,
  ...$l,
  ...Bl,
  ...Ke,
  ...Kl,
  ...zl,
  ...Wl
}), F = Object.freeze({ Defaults: Gl });
function Oe(o) {
  return le(o, F.Defaults.ScheduleUtcOffsetMinutes, -720, 840);
}
function da(o = "", e = "00:00") {
  const t = String(e || "00:00").trim() || "00:00", r = String(o || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!r) return t;
  const a = Number(r[1]), n = Number(r[2]);
  return !Number.isInteger(a) || a < 0 || a > 23 || !Number.isInteger(n) || n < 0 || n > 59 ? t : `${String(a).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
}
function Dt(o = [], e = []) {
  const t = Array.isArray(o) ? o : String(o || "").split(/[\r\n,]+/), r = [], a = /* @__PURE__ */ new Set();
  for (const n of t) {
    const s = da(n, "");
    !s || a.has(s) || (a.add(s), r.push(s));
  }
  return r.sort((n, s) => Lr(n) - Lr(s)), r.length ? r : [...new Set((Array.isArray(e) ? e : [e]).map((n) => da(n, "")).filter(Boolean))].sort((n, s) => Lr(n) - Lr(s));
}
function Lr(o = "") {
  const e = da(o, "");
  if (!e) return -1;
  const [t, r] = e.split(":");
  return (Number(t) || 0) * 60 + (Number(r) || 0);
}
function jl(o = "") {
  const e = String(o || "").trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/);
  return e ? {
    dateKey: e[1],
    clockTime: da(e[2], "")
  } : {
    dateKey: "",
    clockTime: ""
  };
}
function Vl(o, e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Oe(e), r = o.getUTCFullYear(), a = String(o.getUTCMonth() + 1).padStart(2, "0"), n = String(o.getUTCDate()).padStart(2, "0"), s = String(o.getUTCHours()).padStart(2, "0"), i = String(o.getUTCMinutes()).padStart(2, "0"), c = String(o.getUTCSeconds()).padStart(2, "0"), l = String(o.getUTCMilliseconds()).padStart(3, "0"), u = t >= 0 ? "+" : "-", d = Math.abs(t);
  return `${r}-${a}-${n}T${s}:${i}:${c}.${l}${u}${String(Math.floor(d / 60)).padStart(2, "0")}:${String(d % 60).padStart(2, "0")}`;
}
function Aa(o = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Oe(e), r = t * 60 * 1e3, a = o instanceof Date ? new Date(o.getTime()) : new Date(o), n = a.getTime() + r, s = new Date(n), i = s.getUTCFullYear(), c = String(s.getUTCMonth() + 1).padStart(2, "0"), l = String(s.getUTCDate()).padStart(2, "0"), u = String(s.getUTCHours()).padStart(2, "0"), d = String(s.getUTCMinutes()).padStart(2, "0"), f = String(s.getUTCSeconds()).padStart(2, "0"), m = String(s.getUTCMilliseconds()).padStart(3, "0"), p = Number(u), h = Number(d);
  return {
    now: a,
    shiftedDate: s,
    utcOffsetMinutes: t,
    offsetLabel: go(t),
    dateKey: `${i}-${c}-${l}`,
    clockTime: `${u}:${d}`,
    hour: p,
    minute: h,
    second: Number(f),
    millisecond: Number(m),
    minuteOfDay: p * 60 + h,
    localIso: Vl(s, t)
  };
}
function Xo(o = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  return Aa(o, e).localIso;
}
function ot(o = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  return Aa(o, e);
}
function st(o = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes, t = "") {
  const r = Aa(o, e), a = da(t || r.clockTime, r.clockTime), n = Lr(a), s = Date.UTC(r.shiftedDate.getUTCFullYear(), r.shiftedDate.getUTCMonth(), r.shiftedDate.getUTCDate()) - r.utcOffsetMinutes * 60 * 1e3, i = s + 1440 * 60 * 1e3 - 1, c = s + Math.max(0, n) * 60 * 1e3;
  return {
    ...r,
    normalizedClockTime: a,
    plannedMinuteOfDay: n,
    plannedTs: c,
    plannedSlotKey: `${r.dateKey} ${a}`,
    startTs: s,
    endTs: i
  };
}
function ql(o = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const t = ot(o, e);
  return {
    ...t,
    slotKey: `${t.dateKey} ${t.clockTime}`
  };
}
function go(o = F.Defaults.ScheduleUtcOffsetMinutes) {
  const e = Oe(o), t = e >= 0 ? "+" : "-", r = Math.abs(e);
  return `UTC${t}${String(Math.floor(r / 60)).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`;
}
function Xl(o = {}, e = "") {
  const t = o?.fixedQueue && typeof o.fixedQueue == "object" ? o.fixedQueue : {};
  let r = String(t.localDateKey || "").trim(), a = Dt(t.executedSlots || [], []);
  if (!r) {
    const n = jl(o?.lastPlannedSlot || "");
    n.dateKey && n.dateKey === e && (r = n.dateKey, a = Dt([...a, n.clockTime], []));
  }
  return !e || r !== e ? {
    localDateKey: e,
    executedSlots: []
  } : {
    localDateKey: r,
    executedSlots: a
  };
}
function Yl(o = {}, e = [], t = F.Defaults.ScheduleUtcOffsetMinutes, r = /* @__PURE__ */ new Date()) {
  const a = Aa(r, t), n = Dt(e, []), s = Xl(o, a.dateKey);
  if (!n.length) return {
    due: !1,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: [],
    reason: "no_clock_times_configured"
  };
  const i = new Set(Dt(s.executedSlots || [], [])), c = n.filter((u) => Lr(u) <= a.minuteOfDay), l = c.filter((u) => !i.has(u));
  return l.length ? {
    due: !0,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: l,
    reason: "clock_slots_due"
  } : {
    due: !1,
    context: a,
    normalizedClockTimes: n,
    fixedQueue: s,
    dueSlots: [],
    reason: c.length ? "slot_already_processed" : "time_not_matched"
  };
}
function Bt(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Dr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "forward" ? "forward" : e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function Nr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "inherit" ? "inherit" : e === "rewrite" ? "rewrite" : e === "passthrough" ? "passthrough" : "inherit";
}
function nr(o = "") {
  return String(o || "").trim().toLowerCase() === "host_prefix" ? "host_prefix" : "kv_route";
}
function Ye(o = "") {
  return nr(o) === "host_prefix";
}
function si(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "emby" ? "emby" : e === "jellyfin" ? "jellyfin" : e === "passthrough" ? "passthrough" : "auto";
}
function Gt(o = "") {
  return String(o || "").trim().toLowerCase() === "rewrite" ? "rewrite" : F.Defaults.DefaultPlaybackInfoMode;
}
function ho(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "strip" ? "strip" : e === "disable" || e === "none" ? "disable" : "forward";
}
function kr(o) {
  return le(o, F.Defaults.DnsIpSourceIpLimit, 1, 1e3);
}
function cn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "direct" ? "direct" : e === "proxy" ? "proxy" : "inherit";
}
function Hr(o = {}) {
  return cn(o?.mainVideoStreamMode ?? o?.wangpanDirectMode ?? o?.wangpanMode);
}
function $r(o = [], e = "") {
  const t = Array.isArray(o) ? o : String(o || "").split(/[,，\r\n]+/), r = [], a = /* @__PURE__ */ new Set();
  for (const n of [...t, e]) {
    const s = String(n || "").trim().slice(0, 24), i = s.toLowerCase();
    if (!(!s || a.has(i)) && (a.add(i), r.push(s), r.length >= 20))
      break;
  }
  return r;
}
var Hn = /\b(?:(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)|[0-9a-f:]{2,})\b/gi, ii = {
  AKL: {
    cityName: "Auckland",
    countryCode: "NZ",
    countryName: "新西兰"
  },
  AMS: {
    cityName: "Amsterdam",
    countryCode: "NL",
    countryName: "荷兰"
  },
  ARN: {
    cityName: "Stockholm",
    countryCode: "SE",
    countryName: "瑞典"
  },
  ATL: {
    cityName: "Atlanta",
    countryCode: "US",
    countryName: "美国"
  },
  BKK: {
    cityName: "Bangkok",
    countryCode: "TH",
    countryName: "泰国"
  },
  BOM: {
    cityName: "Mumbai",
    countryCode: "IN",
    countryName: "印度"
  },
  CDG: {
    cityName: "Paris",
    countryCode: "FR",
    countryName: "法国"
  },
  CGK: {
    cityName: "Jakarta",
    countryCode: "ID",
    countryName: "印度尼西亚"
  },
  CPH: {
    cityName: "Copenhagen",
    countryCode: "DK",
    countryName: "丹麦"
  },
  DEL: {
    cityName: "Delhi",
    countryCode: "IN",
    countryName: "印度"
  },
  DFW: {
    cityName: "Dallas",
    countryCode: "US",
    countryName: "美国"
  },
  DOH: {
    cityName: "Doha",
    countryCode: "QA",
    countryName: "卡塔尔"
  },
  DXB: {
    cityName: "Dubai",
    countryCode: "AE",
    countryName: "阿联酋"
  },
  EWR: {
    cityName: "Newark",
    countryCode: "US",
    countryName: "美国"
  },
  FRA: {
    cityName: "Frankfurt",
    countryCode: "DE",
    countryName: "德国"
  },
  GRU: {
    cityName: "Sao Paulo",
    countryCode: "BR",
    countryName: "巴西"
  },
  HKG: {
    cityName: "Hong Kong",
    countryCode: "HK",
    countryName: "中国香港"
  },
  HND: {
    cityName: "Tokyo",
    countryCode: "JP",
    countryName: "日本"
  },
  IAD: {
    cityName: "Ashburn",
    countryCode: "US",
    countryName: "美国"
  },
  ICN: {
    cityName: "Seoul",
    countryCode: "KR",
    countryName: "韩国"
  },
  JNB: {
    cityName: "Johannesburg",
    countryCode: "ZA",
    countryName: "南非"
  },
  KIX: {
    cityName: "Osaka",
    countryCode: "JP",
    countryName: "日本"
  },
  KUL: {
    cityName: "Kuala Lumpur",
    countryCode: "MY",
    countryName: "马来西亚"
  },
  LAX: {
    cityName: "Los Angeles",
    countryCode: "US",
    countryName: "美国"
  },
  LHR: {
    cityName: "London",
    countryCode: "GB",
    countryName: "英国"
  },
  MAD: {
    cityName: "Madrid",
    countryCode: "ES",
    countryName: "西班牙"
  },
  MEL: {
    cityName: "Melbourne",
    countryCode: "AU",
    countryName: "澳大利亚"
  },
  MIA: {
    cityName: "Miami",
    countryCode: "US",
    countryName: "美国"
  },
  MNL: {
    cityName: "Manila",
    countryCode: "PH",
    countryName: "菲律宾"
  },
  MXP: {
    cityName: "Milan",
    countryCode: "IT",
    countryName: "意大利"
  },
  NRT: {
    cityName: "Tokyo",
    countryCode: "JP",
    countryName: "日本"
  },
  ORD: {
    cityName: "Chicago",
    countryCode: "US",
    countryName: "美国"
  },
  OSL: {
    cityName: "Oslo",
    countryCode: "NO",
    countryName: "挪威"
  },
  PHX: {
    cityName: "Phoenix",
    countryCode: "US",
    countryName: "美国"
  },
  PRG: {
    cityName: "Prague",
    countryCode: "CZ",
    countryName: "捷克"
  },
  SAN: {
    cityName: "San Diego",
    countryCode: "US",
    countryName: "美国"
  },
  SCL: {
    cityName: "Santiago",
    countryCode: "CL",
    countryName: "智利"
  },
  SEA: {
    cityName: "Seattle",
    countryCode: "US",
    countryName: "美国"
  },
  SFO: {
    cityName: "San Francisco",
    countryCode: "US",
    countryName: "美国"
  },
  SIN: {
    cityName: "Singapore",
    countryCode: "SG",
    countryName: "新加坡"
  },
  SJC: {
    cityName: "San Jose",
    countryCode: "US",
    countryName: "美国"
  },
  SYD: {
    cityName: "Sydney",
    countryCode: "AU",
    countryName: "澳大利亚"
  },
  TPE: {
    cityName: "Taipei",
    countryCode: "TW",
    countryName: "中国台湾"
  },
  VIE: {
    cityName: "Vienna",
    countryCode: "AT",
    countryName: "奥地利"
  },
  WAW: {
    cityName: "Warsaw",
    countryCode: "PL",
    countryName: "波兰"
  },
  YUL: {
    cityName: "Montreal",
    countryCode: "CA",
    countryName: "加拿大"
  },
  YVR: {
    cityName: "Vancouver",
    countryCode: "CA",
    countryName: "加拿大"
  },
  YYZ: {
    cityName: "Toronto",
    countryCode: "CA",
    countryName: "加拿大"
  }
}, Yo = Object.freeze((() => {
  const o = {};
  for (const e of Object.values(ii)) {
    const t = String(e?.countryCode || "").trim().toUpperCase(), r = String(e?.countryName || "").trim();
    !t || !r || o[t] || (o[t] = r);
  }
  return o.CN = o.CN || "中国", o.HK = o.HK || "中国香港", o.MO = o.MO || "中国澳门", o.TW = o.TW || "中国台湾", o;
})()), ea = null;
function Ca(o = "") {
  const e = String(o || "").trim();
  if (!e || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(e)) return !1;
  const t = e.split(".");
  return t.length === 4 && t.every((r) => {
    const a = Number(r);
    return Number.isInteger(a) && a >= 0 && a <= 255;
  });
}
function Jl(o = "") {
  if (!Ca(o)) return !1;
  const [e = 0, t = 0] = String(o || "").trim().split(".").map((r) => Number(r));
  return e === 10 || e === 127 || e === 169 && t === 254 || e === 172 && t >= 16 && t <= 31 ? !0 : e === 192 && t === 168;
}
function ln(o = "") {
  const e = String(o || "").trim();
  if (!e || !e.includes(":") || /\s/.test(e)) return !1;
  try {
    return new URL(`http://[${e}]/`), !0;
  } catch {
    return !1;
  }
}
function ci(o = "") {
  return String(o || "").trim().toUpperCase() === "IPV6" ? "IPv6" : "IPv4";
}
function qe(o = "") {
  return ln(o) ? "IPv6" : Ca(o) ? "IPv4" : "";
}
function yo(o = "", e = {}) {
  const t = String(o || ""), r = /* @__PURE__ */ new Set(), a = [], n = Number(e?.limit), s = Number.isFinite(n) && n > 0 ? Math.max(1, Math.floor(n)) : Number.POSITIVE_INFINITY, i = (l) => {
    const u = String(l || "").trim();
    if (!u) return !1;
    const d = qe(u);
    if (!d) return !1;
    const f = u.toLowerCase();
    return r.has(f) ? !1 : (r.add(f), a.push({
      ip: u,
      ipType: d
    }), a.length >= s);
  };
  Hn.lastIndex = 0;
  let c = null;
  for (; (c = Hn.exec(t)) !== null && !i(c[0]); ) ;
  return a;
}
function Ql(o = null) {
  const e = Array.isArray(o?.Answer) ? o.Answer : [], t = /* @__PURE__ */ new Set(), r = [];
  for (const a of e) {
    const n = String(a?.data || "").trim(), s = qe(n);
    if (!s) continue;
    const i = n.toLowerCase();
    t.has(i) || (t.add(i), r.push({
      ip: n,
      ipType: s
    }));
  }
  return r;
}
function Tn(o = "") {
  return String(o || "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}
function Zl(o = "") {
  const e = /* @__PURE__ */ new Map(), t = String(o || ""), r = t.match(/\[[0-9a-f:]{2,}\]/gi) || [];
  for (const n of r) {
    const s = String(n || "").replace(/^\[|\]$/g, "").trim();
    qe(s) && e.set(s.toLowerCase(), s);
  }
  const a = t.match(Hn) || [];
  for (const n of a) {
    const s = String(n || "").trim();
    qe(s) && e.set(s.toLowerCase(), s);
  }
  return [...e.values()];
}
function eu(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "联通" ? "联通" : e === "电信" ? "电信" : e === "移动" ? "移动" : e === "多线" ? "多线" : e === "ipv6" ? "ipv6" : "";
}
function Jo(o = "", e = "") {
  const t = eu(e);
  return t ? String(o || "").trim().toLowerCase() === t.toLowerCase() : !0;
}
function tu(o = "", e = "") {
  const t = /* @__PURE__ */ new Map(), r = (s, i = "") => {
    const c = String(s || "").trim(), l = qe(c);
    if (!l || Jl(c)) return;
    const u = c.toLowerCase(), d = Br(i), f = t.get(u);
    if (!f) {
      t.set(u, {
        ip: c,
        ipType: l,
        lineLabel: d
      });
      return;
    }
    !Br(f?.lineLabel) && d && t.set(u, {
      ...f,
      lineLabel: d
    });
  }, a = String(o || ""), n = a.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  for (const s of n) {
    const i = s.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
    if (i.length < 3) continue;
    const c = Tn(String(i[1] || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!Jo(c, e)) continue;
    const l = Zl(Tn(String(i[2] || "").replace(/<[^>]+>/g, " "))).find((u) => qe(u)) || "";
    l && r(l, c);
  }
  if (!t.size) {
    const s = Tn(a.replace(/<[^>]+>/g, `
`)), i = /(?:^|\n)\s*(?:\d+\s+)?(电信|联通|移动|多线|ipv6)\s+((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-f0-9]{1,4}:){2,}[a-f0-9:]{1,39})/gi;
    let c = null;
    for (; (c = i.exec(s)) !== null; )
      Jo(c[1], e) && r(c[2], c[1]);
  }
  return [...t.values()];
}
function ru(o = "", e = {}) {
  return yo(o, e);
}
function au(o = "") {
  const e = String(o || "").trim().toUpperCase(), t = ii[e];
  return e ? t ? {
    coloCode: e,
    cityName: String(t.cityName || e),
    countryCode: String(t.countryCode || "UNKNOWN"),
    countryName: String(t.countryName || "未知")
  } : {
    coloCode: e,
    cityName: e,
    countryCode: "UNKNOWN",
    countryName: "未知"
  } : {
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知"
  };
}
function nu(o = "") {
  const e = String(o || "").trim().toUpperCase();
  if (!e || e === "UNKNOWN") return "未知";
  if (Yo[e]) return Yo[e];
  try {
    if (ea === null && (ea = typeof Intl?.DisplayNames == "function" ? new Intl.DisplayNames(["zh-CN"], { type: "region" }) : !1), ea && typeof ea.of == "function") {
      const t = String(ea.of(e) || "").trim();
      if (t) return t;
    }
  } catch {
  }
  return e;
}
function li(o = "") {
  const e = String(o || "").trim();
  if (!e) return "";
  const t = e.match(/-([A-Za-z]{3,4})$/);
  return t ? String(t[1] || "").trim().toUpperCase() : "";
}
function ou(o = "") {
  return `dns-ip-source-${ne(o || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)}`;
}
function bt(o = "") {
  return String(o || "").trim().toLowerCase() === "domain" ? "domain" : "url";
}
var ui = Object.freeze([Object.freeze({
  id: "all",
  label: "麒麟优选",
  sourceType: "url",
  url: "https://api.uouin.com/cloudflare.html"
}), Object.freeze({
  id: "preferred",
  label: "CF-SPEED-DNS优选",
  sourceType: "url",
  url: "https://raw.githubusercontent.com/ZhiXuanWang/cf-speed-dns/refs/heads/main/ipTop10.html"
})]), di = Object.freeze([
  Object.freeze({
    id: "wetest_ipv4",
    label: "Wetest IPv4 API",
    sourceType: "url",
    url: "https://www.wetest.vip/api/cf2dns/get_cloudflare_ip?key=o1zrmHAF&type=v4"
  }),
  Object.freeze({
    id: "wetest_ipv6",
    label: "Wetest IPv6 API",
    sourceType: "url",
    url: "https://www.wetest.vip/api/cf2dns/get_cloudflare_ip?key=o1zrmHAF&type=v6"
  }),
  Object.freeze({
    id: "vps789_ip_api",
    label: "VPS789 优选IP API",
    sourceType: "url",
    url: "https://hhhhh.eu.org/vps789.txt"
  }),
  Object.freeze({
    id: "164746_source",
    label: "164746源",
    sourceType: "url",
    url: "https://ip.164746.xyz/"
  }),
  Object.freeze({
    id: "haogege_source",
    label: "haogege源",
    sourceType: "url",
    url: "https://hhhhh.eu.org/haogege.txt"
  }),
  Object.freeze({
    id: "bestcf_source",
    label: "bestcf源",
    sourceType: "url",
    url: "https://raw.githubusercontent.com/hubbylei/bestcf/main/bestcf.txt"
  })
]), su = Object.freeze([
  Object.freeze({
    label: "CM优选域名集合",
    url: "https://cf.090227.xyz/"
  }),
  Object.freeze({
    label: "NB优选",
    url: "https://www.byoip.top/"
  }),
  Object.freeze({
    label: "VPS789 域名优选",
    url: "https://vps789.com/cfip/?remarks=domain"
  })
]), iu = Object.freeze([Object.freeze({
  label: "VPS789 优选IP",
  url: "https://vps789.com/cfip/"
}), Object.freeze({
  label: "Wetest IPv4 优选",
  url: "https://www.wetest.vip/page/cloudflare/address_v4.html"
})]);
function cu(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "builtin" ? "builtin" : e === "preset" ? "preset" : "custom";
}
function fi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "preferred" ? "preferred" : e === "all" ? "all" : "";
}
function lu(o = "") {
  return String(o || "").trim().toLowerCase().replace(/[^a-z0-9_:-]+/g, "_");
}
function uu(o = "") {
  const e = fi(o);
  return ui.find((t) => t.id === e) || null;
}
function du(o = "") {
  const e = lu(o);
  return e && di.find((t) => t.id === e) || null;
}
function _r() {
  return {
    builtInSourceOptions: ui.map((o) => ({
      id: o.id,
      label: o.label,
      sourceType: o.sourceType,
      value: "domain" in o ? o.domain : o.url
    })),
    presetList: di.map((o) => ({
      id: o.id,
      label: o.label,
      sourceType: o.sourceType,
      value: "domain" in o ? o.domain : o.url
    })),
    preferredDomainLinks: su.map((o) => ({ ...o })),
    preferredIpLinks: iu.map((o) => ({ ...o }))
  };
}
function Br(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.includes("联通") ? "联通" : e.includes("电信") ? "电信" : e.includes("移动") ? "移动" : e.includes("多线") ? "多线" : e.includes("ipv6") ? "ipv6" : "";
}
function mi(o = {}) {
  const e = cu(o?.sourceKind || o?.source_kind || ""), t = e === "builtin" ? uu(o?.builtinId || o?.builtin_id || o?.presetId || o?.preset_id || o?.name) : null, r = e === "preset" ? du(o?.presetId || o?.preset_id || o?.builtinId || o?.builtin_id || o?.name) : null, a = t || r || null, n = bt(a?.sourceType || o?.sourceType || o?.source_type || ""), s = a && "url" in a ? a.url : "", i = a && "domain" in a ? a.domain : "", c = String(s || o?.url || "").trim(), l = re(i || o?.domain || ""), u = String(o?.name || a?.label || "").trim();
  return {
    sourceKind: e,
    builtinId: t?.id || "",
    presetId: r?.id || "",
    name: u,
    sourceType: n,
    url: c,
    domain: l,
    resolvedLabel: String(a?.label || "").trim()
  };
}
function pi(o = {}) {
  const e = mi(o);
  return bt(e.sourceType) === "domain" ? re(e.domain || "") : String(e.url || "").trim();
}
function or(o = {}) {
  return !!pi(o);
}
function fr(o = {}, e = {}) {
  const t = String(o?.ip || o?.content || "").trim(), r = qe(t);
  if (!t || !r) return null;
  const a = String(e.updatedAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()), n = String(o?.sourceKind || o?.source_kind || e.sourceKind || "manual").trim().toLowerCase() || "manual", s = String(o?.sourceLabel || o?.source_label || e.sourceLabel || "").trim(), i = Br(o?.lineLabel || o?.line_label || e.lineLabel || ""), c = String(o?.remark || "").trim();
  return {
    id: String(o?.id || `dns-ip-${ne(t.toLowerCase())}`),
    ip: t,
    ipType: r,
    sourceKind: n,
    sourceLabel: s,
    lineLabel: i,
    remark: c,
    createdAt: String(o?.createdAt || o?.created_at || e.createdAt || a),
    updatedAt: a
  };
}
function Nt(o = {}, e = 0) {
  const t = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), r = mi(o), a = r.sourceKind, n = bt(r.sourceType), s = String(r.builtinId || o?.builtinId || o?.builtin_id || "").trim(), i = String(r.presetId || o?.presetId || o?.preset_id || "").trim(), c = String(r.resolvedLabel || "").trim(), l = String(r.url || "").trim(), u = re(r.domain || ""), d = n === "domain" ? u : l, f = String(o?.name || c || "").trim(), m = o?.enabled, p = m == null ? !0 : !(m === !1 || m === 0 || String(m).trim() === "0");
  return {
    id: String(o?.id || ou(`${a}|${s}|${i}|${n}|${d}|${e}`)),
    name: f || c || `抓取源 ${Number(e) + 1}`,
    url: l,
    domain: u,
    sourceType: n,
    sourceKind: a,
    presetId: i,
    builtinId: s,
    enabled: p,
    sortOrder: Math.max(0, Number.parseInt(String(o?.sortOrder ?? o?.sort_order ?? e), 10) || 0),
    ipLimit: kr(o?.ipLimit ?? o?.ip_limit),
    lastFetchAt: String(o?.lastFetchAt || o?.last_fetch_at || ""),
    lastFetchStatus: String(o?.lastFetchStatus || o?.last_fetch_status || ""),
    lastFetchCount: Math.max(0, Number(o?.lastFetchCount ?? o?.last_fetch_count) || 0),
    createdAt: String(o?.createdAt || o?.created_at || t),
    updatedAt: String(o?.updatedAt || o?.updated_at || t)
  };
}
function mr(o = []) {
  const e = [], t = /* @__PURE__ */ new Map();
  for (const r of Array.isArray(o) ? o : []) {
    const a = fr(r);
    if (!a) continue;
    const n = String(a.ip || "").trim().toLowerCase();
    if (!n) continue;
    const s = t.get(n);
    if (s === void 0) {
      t.set(n, e.length), e.push(a);
      continue;
    }
    const i = e[s];
    i && !Br(i.lineLabel) && Br(a.lineLabel) && (e[s] = {
      ...i,
      lineLabel: a.lineLabel
    });
  }
  return e;
}
function fu(o = {}) {
  const e = fr(o);
  return e ? {
    ...e,
    probeStatus: "pending",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: ""
  } : null;
}
function So(o = []) {
  return mr(o).map((e) => fu(e)).filter(Boolean);
}
function un(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "success" ? "success" : e === "failed" ? "failed" : "empty";
}
function gi(o = {}, e = {}) {
  const t = Nt(e), r = mr(o?.items || []).slice(0, kr(t?.ipLimit)), a = un(o?.status || (r.length ? "success" : "empty"));
  return {
    id: String(o?.id || t?.id || ""),
    name: String(o?.name || t?.name || ""),
    sourceType: bt(o?.sourceType || t?.sourceType || ""),
    status: a,
    count: Math.max(0, Number(o?.count) || r.length),
    items: r,
    error: a === "failed" ? String(o?.error || "") : "",
    lastFetchAt: String(o?.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
  };
}
function hi(o = []) {
  return (Array.isArray(o) ? o : []).map((e) => {
    const t = gi(e, e), r = So(t?.items || []);
    return {
      id: String(t?.id || ""),
      name: String(t?.name || ""),
      sourceType: bt(t?.sourceType || ""),
      status: un(t?.status),
      count: Math.max(0, Number(t?.count) || r.length),
      items: r,
      error: String(t?.error || ""),
      lastFetchAt: String(t?.lastFetchAt || "")
    };
  });
}
function mu(o = []) {
  const e = Array.isArray(o) ? o : [];
  return e.length ? e.some((t) => un(t?.status) !== "failed") : !0;
}
function za(o) {
  const e = Number(o) || 0;
  return !Number.isFinite(e) || e <= 0 ? "" : new Date(e).toISOString();
}
function Fa(o = [], e = F.Defaults.DnsIpSourceFetchMaxBytes) {
  return ne(Z({
    maxBytes: le(e, F.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024),
    enabledSources: (Array.isArray(o) ? o : []).map((t, r) => Nt(t, r)).filter((t) => t.enabled === !0 && or(t)).map((t) => ({
      id: String(t.id || ""),
      name: String(t.name || ""),
      sourceType: bt(t.sourceType),
      target: pi(t),
      ipLimit: kr(t.ipLimit),
      enabled: t.enabled !== !1
    }))
  }));
}
function pu(o = "") {
  return String(o || "").trim().toLowerCase() === "shared_snapshot" ? "shared_snapshot" : "local_pool";
}
function yi(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : []) {
    const a = String(r?.ip || r || "").trim();
    if (!qe(a)) continue;
    const n = a.toLowerCase();
    t.has(n) || (t.add(n), e.push(a));
  }
  return {
    normalizedIps: e,
    deleteKeySet: t
  };
}
function Qo(o = [], e = /* @__PURE__ */ new Set()) {
  const t = [], r = [];
  for (const a of mr(o)) {
    const n = String(a?.ip || "").trim();
    if (n) {
      if (e.has(n.toLowerCase())) {
        r.push(a);
        continue;
      }
      t.push(a);
    }
  }
  return {
    keptItems: t,
    removedItems: r
  };
}
function gu(o = {}, e = []) {
  const { deleteKeySet: t } = yi(e), r = mr(o?.items || []), a = Array.isArray(o?.sourceResults) ? o.sourceResults : [];
  if (!t.size) return {
    deletedCount: 0,
    deletedIps: [],
    items: r,
    sourceResults: a
  };
  const { keptItems: n, removedItems: s } = Qo(r, t), i = new Set(s.map((l) => String(l?.ip || "").trim().toLowerCase()).filter(Boolean)), c = a.map((l) => {
    const { keptItems: u } = Qo(l?.items || [], i), d = un(l?.status) === "failed" ? "failed" : u.length ? "success" : "empty";
    return {
      id: String(l?.id || ""),
      name: String(l?.name || ""),
      sourceType: bt(l?.sourceType || l?.source_type || ""),
      status: d,
      count: u.length,
      items: u,
      error: d === "failed" ? String(l?.error || "") : "",
      lastFetchAt: String(l?.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
    };
  });
  return {
    deletedCount: s.length,
    deletedIps: s.map((l) => String(l?.ip || "").trim()).filter(Boolean),
    items: n,
    sourceResults: c
  };
}
function Ua(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "ok" ? "ok" : e === "pending" ? "pending" : e === "cf_header_missing" ? "cf_header_missing" : e === "non_cloudflare" ? "non_cloudflare" : e === "timeout" ? "timeout" : "network_error";
}
function Rn(o = []) {
  const e = Array.isArray(o) ? o : [], t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
  let a = 0, n = 0;
  for (const s of e) {
    ci(s?.ipType || s?.ip_type || s?.type || "") === "IPv6" ? n += 1 : a += 1;
    const i = String(s?.countryCode || s?.country_code || "").trim().toUpperCase(), c = String(s?.coloCode || s?.colo_code || "").trim().toUpperCase();
    i && t.add(i), c && r.add(c);
  }
  return {
    ipCount: e.length,
    ipv4Count: a,
    ipv6Count: n,
    countryCount: t.size,
    coloCount: r.size
  };
}
function hu(o = [], e = []) {
  const t = Array.isArray(o) ? o : [], r = Array.isArray(e) ? e : [];
  return {
    currentHost: Rn(t),
    sharedPool: Rn(r),
    combined: Rn([...t, ...r])
  };
}
function yu(o = "") {
  const e = String(o || "").trim().toLowerCase();
  if (!e) return "";
  const t = e.endsWith(".") ? e.slice(0, -1) : e;
  return !t || t.length > 253 || t.endsWith(".") || /\s|[:/@*?#\\]/.test(t) || Ca(t) || ln(t) || t.split(".").some((r) => !wa(r)) ? "" : t;
}
function ze(o) {
  return yu(o?.HOST);
}
function Kr(o) {
  return re(o?.LEGACY_HOST);
}
function Su(o) {
  const e = ze(o), t = Kr(o), r = _o(t, e);
  return r?.prefix ? {
    name: String(r.prefix || "").trim().toLowerCase(),
    reservedBy: t,
    reason: "legacy_host",
    legacyHost: t,
    host: e
  } : null;
}
function fa(o, e) {
  const t = re(o), r = re(e);
  return !t || !r ? !1 : t === r || t.endsWith(`.${r}`);
}
function wa(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return !e || e.length > 63 ? !1 : /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(e);
}
function jt(o = "") {
  const e = String(o || "").trim().toLowerCase().replace(/\.+$/, "");
  return !e || e.length > 253 || /\s|[:/@*]/.test(e) || Ca(e) || ln(e) || e.split(".").some((t) => !wa(t)) ? "" : e;
}
function Si(o = "") {
  const e = String(o || "").trim();
  return !e || jt(e) ? "" : "CNAME 指向必须是合法主机名，不能包含协议、端口、路径、通配符、空格或 IP 地址";
}
function _u(o = "", e = "defaultHostPrefixCnameTarget") {
  const t = Si(o);
  if (t)
    throw we("HOST_PREFIX_CNAME_TARGET_INVALID", t, 400, {
      field: e,
      value: String(o || "").trim()
    });
}
function Wa(o = null, e = {}, t = "") {
  return jt(o?.hostPrefixCnameTarget) || jt(e?.defaultHostPrefixCnameTarget) || re(t);
}
function _o(o = "", e = "") {
  const t = re(o), r = re(e);
  if (!t || !r || t === r) return null;
  const a = `.${r}`;
  if (!t.endsWith(a)) return null;
  const n = t.slice(0, -a.length);
  return !n || n.includes(".") || !wa(n) ? null : {
    hostname: t,
    host: r,
    prefix: n
  };
}
function _i(o) {
  const e = String(o || "").trim();
  if (!e) return null;
  const t = e.indexOf("/"), r = t === -1 ? e : e.slice(0, t), a = t === -1 ? "" : e.slice(t), n = io(r);
  return n ? {
    ...n,
    path: a,
    pattern: e
  } : null;
}
function bo(o, e = {}) {
  const t = String(e.path || "");
  let r = 0;
  return e.wildcard || (r += 100), o.includes(".workers.dev") && (r -= 20), t === "/" || t === "/*" ? r += 20 : t.endsWith("*") ? r += 10 : t && (r += 4), r += o.split(".").length * 4, r -= Math.min(t.length, 30), r;
}
var bu = "https://admin-local-index.invalid", Eu = "local-", Tu = "sys:admin_index_upload:v1:", Ru = "sys:admin_index_active:v2";
function Ir(o = "") {
  const e = String(o || "").trim();
  if (!e) return "";
  try {
    const t = new URL(e);
    return ["http:", "https:"].includes(t.protocol) ? t.toString() : "";
  } catch {
    return "";
  }
}
function Au(o = "") {
  const e = String(o || "").trim();
  return !(!e || /[\x00-\x20~^:?*[\\\]]/.test(e) || e.includes("..") || e.includes("@{") || e.includes("//") || e.startsWith("/") || e.endsWith("/") || e.endsWith(".") || e.endsWith(".lock"));
}
function mt(o = "") {
  const e = String(o || "").trim();
  return Au(e) ? e : "";
}
function Lt(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(e) ? e : "";
}
function zr(o = "") {
  const e = Lt(o);
  return e ? `${bu}/${e}/index.html` : "";
}
function Je(o = "") {
  const e = Ir(o);
  if (!e) return "";
  try {
    const t = new URL(e);
    return t.origin !== "https://admin-local-index.invalid" || t.search || t.hash ? "" : Lt(t.pathname.match(/^\/([a-f0-9]{64})\/index\.html$/i)?.[1] || "");
  } catch {
    return "";
  }
}
function Eo(o = "") {
  const e = Lt(o);
  return e ? `${Eu}${e}` : "";
}
function Cu(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.startsWith("local-") ? Lt(e.slice(6)) : "";
}
function pt(o = null, e = {}) {
  const t = Ir(($(e) ? e : {}).indexUrl), r = Je(t), a = !!r, n = a ? zr(r) : "";
  return {
    effectiveRef: r,
    effectiveRefType: a ? "local_upload" : "",
    configIndexUrl: t,
    envIndexUrl: "",
    indexUrl: n,
    persistedIndexUrl: n,
    indexUrlSource: a ? "local_upload" : "unset",
    isLocalUpload: a,
    localUploadRevision: r,
    assetRevision: a ? Eo(r) : "",
    hasGithubRelease: !1,
    hasLocalUpload: a,
    hasDerivedIndexUrl: !1,
    gateState: n ? "shell_ready" : "setup_required"
  };
}
function wu(o = {}) {
  const e = String($(o) && o.indexUrl || "").trim();
  if (!(!e || Je(e)))
    throw we("ADMIN_INDEX_SOURCE_UPLOAD_ONLY", "管理台 HTML 仅支持本地上传，请通过启动门或 Worker 和 HTML 更新面板提交 index.html", 400, { field: "indexUrl" });
}
function bi(o = {}, e = null) {
  const t = String(e?.HOST || "").trim(), r = ze(e), a = String(o?.cfZoneId || "").trim(), n = String(o?.cfApiToken || "").trim(), s = [], i = [];
  return t ? r || i.push("HOST") : s.push("HOST"), a || s.push("cfZoneId"), n || s.push("cfApiToken"), {
    host: r,
    cfZoneId: a,
    cfApiToken: n,
    missingFields: s,
    invalidFields: i
  };
}
function Ei(o = {}) {
  if (!(!Array.isArray(o?.invalidFields) || !o.invalidFields.includes("HOST")))
    throw we("HOST_PREFIX_HOST_INVALID", "HOST 必须是合法 DNS 主机名，不能包含协议、用户信息、端口、路径、通配符、下划线、空标签或 IP 地址", 400, {
      field: "HOST",
      reason: "invalid_hostname"
    });
}
function Lu(o = {}, e = null) {
  if (o?.enableHostPrefixProxy !== !0) return;
  const t = bi(o, e);
  if (Ei(t), !(t.missingFields.length <= 0))
    throw we("HOST_PREFIX_PROXY_CONFIG_REQUIRED", "启用域名前缀代理前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
      missingFields: t.missingFields,
      host: t.host
    });
}
function ia(o = {}, e = null) {
  const t = bi(o, e);
  if (Ei(t), t.missingFields.length <= 0) return t;
  throw we("HOST_PREFIX_DNS_CONFIG_REQUIRED", "保存域名前缀节点前，必须先配置 HOST、Cloudflare Zone ID 和 API 令牌", 400, {
    missingFields: t.missingFields,
    host: t.host
  });
}
function An(o = [], e = {}, t = null) {
  return (Array.isArray(o) ? o : [o]).some((r) => Ye(r?.nextNode?.entryMode)) ? ia(e, t) : null;
}
var Du = Ke.PingTimeoutMs, Nu = Ke.UpstreamTimeoutMs, $n = Ke.UpstreamRetryAttempts, Ti = Ke.HedgeProbePath, Iu = "/emby/system/info/public", To = Ke.HedgeProbeTimeoutMs, Ri = Ke.HedgeProbeParallelism, Ai = Ke.HedgeWaitTimeoutMs, Ci = Ke.HedgeLockTtlMs, aa = Ke.HedgePreferredTtlSec, wi = Ke.HedgeFailureCooldownSec, Li = Ke.HedgeWakeJitterMs, Di = Ke.BufferedRetryBodyMaxBytes, Mu = Ke.MetadataPrewarmTimeoutMs, Pu = Ke.PrewarmCacheTtl, xu = Mt.PlaybackInfoCacheTtlSec, Ro = Mt.PlaybackInfoCacheEntryMaxBytes, Ou = Mt.PlaybackInfoCacheTotalMaxBytes, Ni = Mt.VideoProgressForwardIntervalSec, vu = Mt.VideoProgressSnapshotMaxBytes, Ii = Mt.CacheTtlImagesDays, Fu = Mt.PlaybackRouteHotCacheTtlMs, sr = Mt.PlaybackRouteHotCacheMax, Mi = 12 * 1024 * 1024, Uu = Mi - 64 * 1024, ku = 2e6, Vt = 19e5, Zo = 50, Pi = 512 * 1024, Hu = 4, Ao = 8 * 1024 * 1024, Cn = 256 * 1024, Bn = 32, es = 64, ts = 64 * 1024, rs = 128, as = 8 * 1024, br = 4 * 1024, $u = Object.freeze([
  "displayName",
  "remark",
  "tag",
  "tagColor",
  "remarkColor",
  "secret",
  "hostPrefixCnameTarget",
  "hedgeProbePath"
]), ns = 500, xa = 1e4, Mr = 25e3, Oa = 1e4, Bu = 1e4, wn = 1e4, Ku = 600 * 1e3, zu = 120 * 1e3, at = 2, va = 2;
function Ln(o = "") {
  const e = String(o || "").trim().toUpperCase();
  return e.includes("INT") ? "INTEGER" : e.includes("CHAR") || e.includes("CLOB") || e.includes("TEXT") ? "TEXT" : e.includes("REAL") || e.includes("FLOA") || e.includes("DOUB") ? "REAL" : !e || e.includes("BLOB") ? "BLOB" : "NUMERIC";
}
var Wr = /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, Wu = /\.(?:js|css|woff2?|ttf|otf|map|webmanifest)$/i, pr = /\.(?:srt|ass|vtt|sub)$/i, Gr = /(?:\/Images\/|\/Icons\/|\/Branding\/|\/emby\/covers\/)/i, St = /\.(?:m3u8|mpd)$/i, xi = /\.(?:ts|m4s)$/i, Gu = /\.(?:mp4|m4v|m4a|ogv|webm|mkv|mov|avi|wmv|flv)$/i, Kn = /* @__PURE__ */ new Set([
  "host",
  "x-real-ip",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "forwarded",
  "connection",
  "upgrade",
  "transfer-encoding",
  "te",
  "keep-alive",
  "proxy-authorization",
  "proxy-authenticate",
  "trailer",
  "expect"
]), ju = /* @__PURE__ */ new Set([
  "cf-connecting-ip",
  "cf-connecting-ipv6",
  "cf-ipcountry",
  "cf-region",
  "cf-region-code",
  "cf-city",
  "cf-latitude",
  "cf-longitude",
  "cf-postal-code",
  "cf-subdivision",
  "cf-metro-code",
  "cf-timezone",
  "true-client-ip",
  "x-client-ip",
  "x-original-forwarded-for",
  "x-forwarded",
  "cdn-loop",
  "cf-visitor",
  "cf-ray",
  "cf-pseudo-ipv4"
]), Vu = /* @__PURE__ */ new Set([
  "access-control-allow-origin",
  "access-control-allow-methods",
  "access-control-allow-headers",
  "access-control-allow-credentials",
  "x-frame-options",
  "strict-transport-security",
  "x-content-type-options",
  "x-xss-protection",
  "referrer-policy",
  "x-powered-by",
  "server"
]), Co = "legacy_proxy_ctx", qu = 86400, ma = [Co, "emby_web_bypass"], Xu = /* @__PURE__ */ new Set([
  "users",
  "items",
  "videos",
  "audio",
  "livetv",
  "sessions",
  "system"
]);
function La(o, e, t = null) {
  const r = e.headers.get("Origin"), a = e.headers.get("Access-Control-Request-Headers") || sa["Access-Control-Allow-Headers"];
  return {
    "Access-Control-Allow-Origin": t || r || sa["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Methods": sa["Access-Control-Allow-Methods"],
    "Access-Control-Allow-Headers": a,
    "Access-Control-Expose-Headers": "Content-Length, Content-Range",
    "Access-Control-Max-Age": "86400"
  };
}
function It(o = "") {
  if (!o) return "";
  try {
    return decodeURIComponent(o);
  } catch {
    return o;
  }
}
function J(o) {
  let e = typeof o == "string" ? o : "/";
  return e ? (e.startsWith("/") || (e = "/" + e), e = e.replace(/^\/+/, "/"), e) : "/";
}
function pa(o = "") {
  let e = J(o);
  for (; ; ) {
    const a = e.replace(/%([0-9a-f]{2})/gi, (n, s) => {
      const i = Number.parseInt(s, 16);
      return i <= 127 ? String.fromCharCode(i) : n;
    });
    if (a === e) break;
    e = a;
  }
  const t = [];
  for (const a of e.replace(/\\/g, "/").toLowerCase().split("/"))
    !a || a === "." || (a === ".." ? t.pop() : t.push(a));
  const r = `/${t.join("/")}`;
  return r === "/web" || r.startsWith("/web/");
}
function ga(o = "") {
  const e = String(o || ""), t = new TextEncoder().encode(e);
  let r = "";
  for (const a of t) r += String.fromCharCode(a);
  return btoa(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function jr(o = "") {
  const e = String(o || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  if (!e) return "";
  const t = e.length % 4, r = e + (t ? "=".repeat(4 - t) : ""), a = atob(r), n = Uint8Array.from(a, (s) => s.charCodeAt(0));
  return new TextDecoder().decode(n);
}
function Oi(o) {
  const e = "/admin", t = String(o || "").trim();
  if (!t) return e;
  let r = J(t);
  return r = r.replace(/\/{2,}/g, "/"), r.length > 1 && (r = r.replace(/\/+$/, "")), !r || r === "/" || r.toLowerCase().startsWith("/api") ? e : r;
}
function vi(o, e) {
  const t = J(o || "/"), r = J(e || "/");
  return t === r || t.startsWith(r + "/");
}
function Ar(o, e) {
  const t = J(o || "/"), r = J(e || "/");
  return !r || r === "/" ? t === r : t === r || t === `${r}/`;
}
function it(o) {
  return Oi(o?.ADMIN_PATH);
}
function dn(o = "/admin") {
  const e = Oi(o);
  return e === "/" ? "/login" : `${e}/login`;
}
function wo(o) {
  return dn(it(o));
}
function Yu(o) {
  const e = it(o), t = J(e).toLowerCase(), r = [], a = t.split("/").filter(Boolean).map((n) => It(n).toLowerCase());
  return a.length === 1 && a[0] && r.push({
    name: a[0],
    reservedBy: e,
    reason: "admin_path"
  }), t === "/admin" && r.push({
    name: "api",
    reservedBy: "/api/auth/login",
    reason: "legacy_admin_login"
  }), r;
}
function Ju(o, e) {
  const t = String(o || "").trim().toLowerCase();
  return t && Yu(e).find((r) => r.name === t) || null;
}
function Fi(o = {}) {
  return String(o?.name || "").trim() ? String(o?.target || "").trim() ? !0 : Array.isArray(o?.lines) && o.lines.length > 0 : !1;
}
function os(o, e) {
  const t = Array.isArray(o) ? o : [o];
  for (const r of t) {
    if (!Fi(r) || Ye(r?.entryMode)) continue;
    const a = Ju(r?.name, e);
    if (a)
      return {
        ...a,
        name: String(r?.name || "").trim().toLowerCase()
      };
  }
  return null;
}
function Qu(o = {}, e = null) {
  if (!Ye(o?.entryMode)) return null;
  const t = String(o?.name || "").trim().toLowerCase();
  if (!t) return {
    code: "HOST_PREFIX_REQUIRED",
    message: "域名前缀不能为空",
    name: t
  };
  if (!wa(t)) return {
    code: "HOST_PREFIX_INVALID",
    message: "域名前缀仅支持小写字母、数字、连字符，且不能以下划线、点或连字符结尾",
    name: t
  };
  const r = Su(e);
  if (r && r.name === t) return {
    code: "HOST_PREFIX_RESERVED_BY_LEGACY_HOST",
    message: "该域名前缀已被旧部署子域兼容入口保留，请更换后重试",
    name: t,
    reservedBy: r.reservedBy,
    reason: r.reason,
    legacyHost: r.legacyHost,
    host: r.host
  };
  const a = Si(o?.hostPrefixCnameTarget);
  return a ? {
    code: "HOST_PREFIX_CNAME_TARGET_INVALID",
    message: a,
    field: "hostPrefixCnameTarget",
    value: String(o?.hostPrefixCnameTarget || "").trim(),
    name: t
  } : null;
}
function ss(o, e = null) {
  const t = Array.isArray(o) ? o : [o];
  for (const r of t) {
    if (!Fi(r)) continue;
    const a = Qu(r, e);
    if (a) return a;
  }
  return null;
}
function Zu(o) {
  const e = it(o);
  return e === "/" ? "/" : e;
}
function Te(o) {
  return String(o ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Vr(o) {
  return JSON.stringify(o).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
function $e(o, e = null) {
  const t = [];
  o?.JWT_SECRET || t.push("JWT_SECRET"), o?.ADMIN_PASS || t.push("ADMIN_PASS");
  const r = typeof e?.adminPath == "string" ? e.adminPath : it(o), a = typeof e?.loginPath == "string" ? e.loginPath : dn(r);
  return {
    ok: t.length === 0,
    missing: t,
    adminPath: r,
    loginPath: a,
    message: t.length ? `系统未初始化：缺少 ${t.join("、")}。` : "系统初始化检查通过。"
  };
}
function Ui(o, e = null) {
  const t = $e(o, e);
  if (t.ok) return t;
  const r = t.missing.join("|") || "unknown";
  return We.InitCheckWarnedFingerprints.has(r) || (We.InitCheckWarnedFingerprints.size >= 32 && We.InitCheckWarnedFingerprints.clear(), We.InitCheckWarnedFingerprints.add(r), console.warn(`[Init Check] ${t.message} 管理入口: ${t.adminPath}`)), t;
}
function zn(o) {
  if (!o || o.ok) return "";
  const e = Array.isArray(o.missing) && o.missing.length ? o.missing.map((t) => `<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">${Te(t)}</code>`).join(" ") : '<code class="rounded bg-amber-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">UNKNOWN</code>';
  return `<div id="init-health-banner" class="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-900 shadow-sm"><div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"><div class="font-semibold">系统未初始化</div><div class="text-xs text-amber-700">管理入口：${Te(o.adminPath || "/admin")}</div></div><p class="mt-2 leading-6">检测到关键环境变量缺失：${e}</p><p class="mt-1 text-xs leading-5 text-amber-700">请先在 Cloudflare Worker 环境变量中补齐后再使用管理台登录与敏感操作。</p></div>`;
}
function na(o) {
  return String(o?.cf?.colo || "").trim().toUpperCase() || "UNKNOWN";
}
function Ga(o) {
  return li(String(o?.headers?.get?.("CF-RAY") || o?.headers?.get?.("cf-ray") || "").trim());
}
function ed(o) {
  return String(o?.cf?.country || "").trim().toUpperCase() || "UNKNOWN";
}
function td(o) {
  const e = ed(o);
  return {
    countryCode: e,
    countryName: nu(e)
  };
}
function rd(o = {}, e = {}) {
  const { statusPort: t } = o, r = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy Admin Shell</title><script id="admin-bootstrap" type="application/json">__ADMIN_BOOTSTRAP_JSON__<\/script><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 44%,#020617 100%);color:#e2e8f0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.admin-fallback-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 18px}.admin-fallback-card{width:min(100%,980px);border:1px solid rgba(51,65,85,.92);border-radius:30px;background:rgba(15,23,42,.94);box-shadow:0 32px 96px rgba(2,6,23,.52);padding:28px;backdrop-filter:blur(20px)}.admin-fallback-pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 14px;background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.32);color:#bfdbfe;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}.admin-fallback-title{margin:20px 0 0;font-size:clamp(1.9rem,4vw,3rem);line-height:1.08;color:#fff}.admin-fallback-copy{margin:14px 0 0;max-width:54rem;color:#cbd5e1;font-size:15px;line-height:1.8}.admin-fallback-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px}.admin-fallback-stat{border:1px solid rgba(51,65,85,.9);border-radius:22px;background:rgba(2,6,23,.48);padding:16px}.admin-fallback-k{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b}.admin-fallback-v{margin-top:10px;font-size:15px;line-height:1.7;color:#f8fafc;word-break:break-word}.admin-fallback-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.admin-fallback-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:16px;padding:12px 18px;font-size:14px;font-weight:700;transition:transform .18s ease,background-color .18s ease,border-color .18s ease}.admin-fallback-btn:hover{transform:translateY(-1px)}.admin-fallback-btn-primary{background:#2563eb;color:#fff;border:1px solid rgba(147,197,253,.7);box-shadow:0 12px 28px rgba(37,99,235,.24)}.admin-fallback-btn-primary:hover{background:#1d4ed8;border-color:#93c5fd}.admin-fallback-btn-secondary{background:rgba(15,23,42,.5);color:#e2e8f0;border:1px solid rgba(51,65,85,.95)}.admin-fallback-btn-secondary:hover{background:rgba(30,41,59,.85)}.admin-fallback-panel{margin-top:24px;border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(2,6,23,.4);padding:20px}.admin-fallback-panel h2{margin:0;font-size:15px;color:#fff}.admin-fallback-panel p{margin:10px 0 0;font-size:14px;line-height:1.7;color:#cbd5e1}.admin-fallback-panel details{margin-top:16px}.admin-fallback-panel summary{cursor:pointer;color:#93c5fd;font-weight:700}.admin-fallback-panel pre{overflow:auto;margin:12px 0 0;padding:14px;border-radius:18px;background:#020617;color:#cbd5e1;font-size:12px;line-height:1.6}.admin-fallback-note{margin-top:16px;color:#94a3b8;font-size:13px;line-height:1.7}@media (max-width:640px){.admin-fallback-shell{padding:18px 12px}.admin-fallback-card,.admin-fallback-stat,.admin-fallback-panel{border-radius:22px}.admin-fallback-card{padding:22px}.admin-fallback-actions{flex-direction:column}.admin-fallback-btn{width:100%}}</style></head><body><main class="admin-fallback-shell"><section class="admin-fallback-card"><div class="admin-fallback-pill">Admin Shell</div><h1 class="admin-fallback-title">管理台壳层正在处理中</h1><p class="admin-fallback-copy">Worker 继续负责管理台壳、登录与统一后台 API；页面主体会根据当前状态注入设置页、远端壳或错误态内容。</p>__INIT_HEALTH_BANNER____ADMIN_APP_ROOT__</section></main></body></html>';
  let a = -1;
  const n = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="media-favicon-bg" x1="18%" y1="12%" x2="84%" y2="88%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#4f46e5"/>
        </linearGradient>
        <radialGradient id="media-favicon-highlight" cx="28%" cy="20%" r="72%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.34"/>
          <stop offset="55%" stop-color="#ffffff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#media-favicon-bg)"/>
      <rect x="4" y="4" width="56" height="56" rx="15" fill="url(#media-favicon-highlight)"/>
      <rect x="4.75" y="4.75" width="54.5" height="54.5" rx="14.25" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
      <path d="M24 18h8v28h-8zM24 18h18v6H24zM24 29h14v6H24zM24 40h18v6H24z" fill="#ffffff"/>
    </svg>`, s = '<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at top,#0f172a 0,#020617 48%,#020617 100%);color:#e2e8f0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}.landing-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 24px}.landing-card{width:min(100%,1100px);border:1px solid rgba(51,65,85,.9);border-radius:32px;background:rgba(15,23,42,.94);box-shadow:0 28px 90px rgba(2,6,23,.48);overflow:hidden}.landing-grid{display:grid;gap:0}.landing-primary,.landing-side{padding:32px}.landing-primary{text-align:left}.landing-side{border-top:1px solid rgba(51,65,85,.9);background:rgba(2,6,23,.55)}.landing-pill{display:inline-flex;align-items:center;border:1px solid rgba(59,130,246,.3);border-radius:999px;background:rgba(59,130,246,.1);padding:6px 12px;color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.landing-title{margin:20px 0 0;font-size:clamp(2rem,4vw,3.25rem);line-height:1.1;color:#fff}.landing-text{margin:16px 0 0;font-size:15px;line-height:1.8;color:#cbd5e1}.landing-text-muted{color:#94a3b8}.landing-highlight{font-weight:700;color:#fff}.landing-actions{display:flex;flex-direction:column;gap:12px;margin-top:32px}.landing-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:14px 20px;font-size:14px;font-weight:700;transition:background-color .18s ease,border-color .18s ease,transform .18s ease}.landing-btn:hover{transform:translateY(-1px)}.landing-btn-primary{border:1px solid rgba(147,197,253,.7);background:#2563eb;color:#fff;box-shadow:0 12px 28px rgba(37,99,235,.25)}.landing-btn-primary:hover{border-color:#93c5fd;background:#1d4ed8}.landing-btn-secondary{border:1px solid rgba(51,65,85,.95);background:rgba(15,23,42,.45);color:#e2e8f0}.landing-btn-secondary:hover{background:rgba(30,41,59,.8)}.landing-notes{border:1px solid rgba(51,65,85,.9);border-radius:24px;background:rgba(15,23,42,.72);padding:24px}.landing-notes-title{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#64748b}.landing-note-list{margin:16px 0 0;padding-left:18px;color:#cbd5e1;font-size:14px;line-height:1.75}.landing-note-list li+li{margin-top:12px}.landing-banner{margin-bottom:16px;border:1px solid rgba(252,211,77,.32);border-radius:18px;background:rgba(245,158,11,.12);padding:14px 16px;color:#fef3c7}.landing-banner-title{font-size:14px;font-weight:700;color:#fef3c7}.landing-banner-text{margin-top:6px;font-size:12px;line-height:1.6;color:rgba(254,243,199,.92)}@media (min-width:900px){.landing-grid{grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr)}.landing-primary,.landing-side{padding:40px}.landing-side{border-top:0;border-left:1px solid rgba(51,65,85,.9)}}@media (min-width:640px){.landing-actions{flex-direction:row}}@media (max-width:639px){.landing-shell{padding:24px 16px}.landing-card,.landing-notes{border-radius:24px}.landing-primary,.landing-side{padding:24px}.landing-btn{width:100%}}</style>';
  function i(B = "GET") {
    const G = new Headers({
      "Content-Type": "image/svg+xml;charset=UTF-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable"
    });
    return Ce(G), new Response(B === "HEAD" ? null : n, { headers: G });
  }
  const c = Object.freeze([
    "__ADMIN_BOOTSTRAP_JSON__",
    "__INIT_HEALTH_BANNER__",
    "__ADMIN_APP_ROOT__"
  ]), l = "embedded-fallback-v1", u = m(r), d = "minimal-split-parts", f = !0;
  function m(B = "") {
    const G = String(B || ""), X = [];
    let W = 0;
    for (const Q of c) {
      const oe = G.indexOf(Q, W);
      if (oe < 0) throw new Error(`missing admin html placeholder: ${Q}`);
      X.push(G.slice(W, oe)), W = oe + Q.length;
    }
    return X.push(G.slice(W)), X;
  }
  function p(B = [], G = {}) {
    let X = String(B[0] || "");
    for (let W = 0; W < c.length; W += 1) {
      const Q = c[W];
      X += String(G[Q] || ""), X += String(B[W + 1] || "");
    }
    return X;
  }
  const h = "__ADMIN_BOOTSTRAP_JSON__", g = "__INIT_HEALTH_BANNER__", y = "__ADMIN_APP_ROOT__", _ = "", S = "https://admin-shell-cache.invalid", A = "private, no-store, max-age=0", E = "public, max-age=31536000, immutable", T = 300 * 1e3, w = 2 * 1024 * 1024, D = "bootstrap-tailwind-assets-v3-active-index", k = "X-Admin-Shell-Cached-At", b = "X-Admin-Shell-Source-Etag", N = "X-Admin-Shell-Source-Last-Modified", R = "X-Admin-Shell-Source-Hash", x = "__release", O = "vendor", L = "__warm", v = "https://admin-release-vendor-cache.invalid", M = "https://admin-release-vendor-manifest.invalid", C = "public, max-age=31536000, immutable", I = "no-store, max-age=0", P = 8 * 1024 * 1024, U = 3, V = "X-Admin-Release-Vendor-Cached-At", j = "X-Admin-Release-Vendor-Source-Hash", K = Object.freeze([
    "dashboard",
    "nodes",
    "logs",
    "dns",
    "settings"
  ]), q = Object.freeze([
    "系统 UI",
    "代理与网络",
    "静态资源策略",
    "安全防护",
    "日志设置",
    "监控告警",
    "账号设置",
    "备份与恢复"
  ]), de = Object.freeze([
    "ui",
    "proxy",
    "security",
    "logs",
    "account"
  ]);
  function he() {
    return {
      truthSources: {
        primaryUi: "frontend/",
        templateHtml: "frontend/index.html",
        contractDoc: "worker.md"
      },
      bootstrapActions: {
        default: "getAdminBootstrap",
        settings: "getSettingsBootstrap"
      },
      primaryViews: [...K],
      settings: {
        visualSections: [...q],
        saveGroups: [...de]
      }
    };
  }
  function fe(B, G = $e(B), X = {}) {
    return {
      adminPath: it(B),
      loginPath: wo(B),
      initHealth: G,
      hostDomain: ze(B),
      contract: he(),
      shell: Et(B, G, X)
    };
  }
  function ie() {
    if (a >= 0) return a;
    if (!Array.isArray(u) || u.length !== c.length + 1)
      return a = 0, 0;
    const B = new TextEncoder();
    let G = 0;
    for (let X = 0; X < u.length; X += 1)
      G += B.encode(String(u[X] || "")).length, X < c.length && (G += B.encode(c[X]).length);
    return a = G, a;
  }
  function me(B = !1, G = "") {
    const X = String(G || "").trim().toLowerCase();
    return B ? "remote_ready" : X === "setup_required" ? "setup_required" : "embedded_only";
  }
  function Me(B = !1, G = f) {
    return B ? G ? "embedded_fallback_retained" : "legacy_inline_shell_active" : "embedded_fallback_missing";
  }
  function Ue(B = "embedded", G = "") {
    return String(B || "").trim().toLowerCase() === "gate" || String(G || "").trim() === "setup_gate" ? "setup_gate" : String(B || "").trim().toLowerCase() === "remote" ? "remote_shell" : String(G || "").trim() === "embedded_fallback" ? "embedded_fallback" : "embedded_shell";
  }
  function et(B = !1, G = "") {
    return B ? String(G || "").trim() === "embedded_fallback" ? "active" : "retained" : "missing";
  }
  function Et(B, G = $e(B), X = {}) {
    const W = pt(B, X), Q = W.indexUrl, oe = ie(), ge = !!Q, Xe = !!(B?.ASSETS && typeof B.ASSETS.fetch == "function"), dt = !ge && Xe ? "shell_ready" : W.gateState, Ge = oe > 0;
    let At = "";
    if (Q) try {
      At = new URL(Q).origin;
    } catch {
      At = "";
    }
    return {
      mode: ge ? "remote-preferred" : Xe ? "embedded" : "setup_required",
      lifecycleState: me(ge, dt),
      embeddedFallbackState: Ge ? "retained" : "missing",
      retirementState: Me(Ge),
      gateState: dt,
      indexUrl: W.indexUrl,
      indexUrlSource: W.indexUrlSource,
      effectiveRef: W.effectiveRef,
      remoteShellConfigured: ge,
      remoteShellIndexUrl: Q,
      remoteShellOrigin: At,
      bundledShellAvailable: Xe,
      bundledShellSource: Xe ? "frontend/dist/index.html" : "",
      initHealthOk: G?.ok === !0,
      embeddedFallbackAvailable: Ge,
      embeddedTemplateSource: d,
      embeddedTemplateMode: d,
      embeddedTemplateBytes: oe,
      finalUiHtmlRetired: f
    };
  }
  function Yr(B, G = {}) {
    return pt(B, G).indexUrl;
  }
  function Le(B = {}) {
    const G = $(B.shellState) ? B.shellState : {}, X = $(B.initHealth) ? B.initHealth : {}, W = $(B.indexState) ? B.indexState : {}, Q = String(B.remoteShellIndexUrl || G.remoteShellIndexUrl || W.indexUrl || "").trim(), oe = String(B.mode || "").trim().toLowerCase(), ge = oe === "remote" ? "remote" : oe === "gate" ? "gate" : "embedded", Xe = G.remoteShellConfigured === !0 || !!Q, dt = G.embeddedFallbackAvailable === !0, Ge = G.finalUiHtmlRetired !== !1, At = String(B.routeState || "").trim() || (ge === "remote" ? "remote_active" : ge === "gate" ? "setup_gate" : "embedded_active"), Zr = String(B.lifecycleState || G.lifecycleState || "").trim() || me(Xe, B.gateState || G.gateState || W.gateState || ""), Ut = String(B.embeddedFallbackState || G.embeddedFallbackState || "").trim() || et(dt, At), ul = String(B.retirementState || G.retirementState || "").trim() || Me(dt, Ge), dl = String(B.gateState || G.gateState || W.gateState || (Q ? "shell_ready" : "setup_required")).trim() || "setup_required";
    return {
      ...G,
      mode: ge,
      effectiveMode: Ue(ge, At),
      gateState: dl,
      lifecycleState: Zr,
      embeddedFallbackState: Ut,
      retirementState: ul,
      sourceType: String(B.sourceType || "").trim().toLowerCase() || (ge === "remote" ? "remote_fetch" : ge === "gate" ? "setup_gate" : "embedded_local"),
      routeState: At,
      indexUrl: String(B.indexUrl || G.indexUrl || W.indexUrl || Q).trim(),
      indexUrlSource: String(B.indexUrlSource || G.indexUrlSource || W.indexUrlSource || "").trim(),
      effectiveRef: String(B.effectiveRef || G.effectiveRef || W.effectiveRef || "").trim(),
      effectiveRefType: String(B.effectiveRefType || G.effectiveRefType || W.effectiveRefType || "").trim(),
      remoteShellIndexUrl: Q,
      remoteShellOrigin: String(G.remoteShellOrigin || "").trim(),
      remoteCacheState: String(B.remoteCacheState || "").trim().toLowerCase(),
      revalidateDue: B.revalidateDue === !0,
      lastFetchStatus: String(B.lastFetchStatus || "").trim().toLowerCase(),
      reason: String(B.reason || "").trim(),
      requestPath: String(B.requestPath || "").trim(),
      initHealthOk: X.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(X.missing) ? X.missing : []).map((fl) => String(fl || "").trim()).filter(Boolean))],
      fallbackRetained: dt,
      templateMode: String(G.embeddedTemplateMode || G.embeddedTemplateSource || "").trim() || d,
      finalUiHtmlRetired: Ge,
      updatedAt: String(B.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function Jr(B, G = {}, X = null) {
    const W = $(G.shellState) ? G.shellState : Et(B, G.initHealth, G.config || {}), Q = Le({
      ...G,
      shellState: W
    }), oe = t.resolveOpsStatusStores(B).db, { updatedAt: ge, ...Xe } = Q, dt = ne(Z(Xe)), Ge = oe ? Y.AdminShellStatusWriteState.get(oe) : null, At = Math.max(1e3, Number(F.Defaults.AdminShellStatusStableWriteIntervalMs) || 1e3);
    if (G.throttleStableWrites === !0 && Ge?.fingerprint === dt) {
      if (Ge.writePromise) return Ge.writePromise;
      if (H() - (Number(Ge.writtenAt) || 0) < At) return null;
    }
    const Zr = pe(Promise.resolve(t.patchOpsStatus(B, { adminShell: Q }, X)).then((Ut) => ({
      ok: !0,
      result: Ut
    })), "admin.shell_status_patch", {
      requestPath: Q.requestPath,
      mode: Q.mode,
      sourceType: Q.sourceType
    }, {
      ok: !1,
      result: null
    }).then((Ut) => (!oe || Y.AdminShellStatusWriteState.get(oe)?.writePromise !== Zr || (Ut?.ok === !0 ? Y.AdminShellStatusWriteState.set(oe, {
      fingerprint: dt,
      writtenAt: H(),
      writePromise: null
    }) : Ge ? Y.AdminShellStatusWriteState.set(oe, Ge) : Y.AdminShellStatusWriteState.delete(oe)), Ut?.result ?? null));
    return oe && Y.AdminShellStatusWriteState.set(oe, {
      fingerprint: dt,
      writtenAt: 0,
      writePromise: Zr
    }), Zr;
  }
  function tt(B = {}, G, X = {}, W = $e(G)) {
    const Q = $(B) ? B : {}, oe = pt(G, X), ge = Et(G, W, X);
    return {
      ...Q,
      adminShell: Le({
        ...$(Q.adminShell) ? Q.adminShell : {},
        shellState: ge,
        initHealth: W,
        indexState: oe,
        remoteShellIndexUrl: oe.indexUrl,
        gateState: oe.gateState,
        indexUrl: oe.indexUrl,
        indexUrlSource: oe.indexUrlSource,
        effectiveRef: oe.effectiveRef,
        effectiveRefType: oe.effectiveRefType,
        mode: $(Q.adminShell) && String(Q.adminShell.mode || "").trim() ? Q.adminShell.mode : oe.indexUrl ? "remote" : "gate",
        routeState: $(Q.adminShell) && String(Q.adminShell.routeState || "").trim() ? Q.adminShell.routeState : oe.indexUrl ? "remote_ready_idle" : "setup_gate",
        sourceType: $(Q.adminShell) && String(Q.adminShell.sourceType || "").trim() ? Q.adminShell.sourceType : oe.indexUrl ? "runtime_status" : "setup_gate"
      })
    };
  }
  function rt(B = "") {
    const G = String(B || "").trim();
    if (!G) return "已上传的管理台 HTML 暂时不可用，请重新上传。";
    if (G.startsWith("remote_shell_render_failed")) {
      const X = G.replace(/^remote_shell_render_failed:\s*/i, "").trim();
      return X ? `Worker 读取 index.html 失败：${X}` : "Worker 读取 index.html 失败。";
    }
    return G;
  }
  function yr(B = {}, G = {}, X = {}, W = {}) {
    const Q = String(B.adminPath || "/admin").trim() || "/admin", oe = String(W.remoteShellIndexUrl || G.remoteShellIndexUrl || "").trim(), ge = rt(W.reason || ""), Xe = `${Q}?setup=1`;
    return `<style>
        .admin-remote-error-shell{max-width:920px;margin:0 auto;padding:44px 20px 56px;color:#0f172a}
        .admin-remote-error-card{background:rgba(255,255,255,.96);border:1px solid rgba(248,113,113,.22);border-radius:28px;box-shadow:0 24px 80px rgba(15,23,42,.12);overflow:hidden}
        .dark .admin-remote-error-card{background:rgba(15,23,42,.94);border-color:rgba(248,113,113,.32);color:#e2e8f0}
        .admin-remote-error-head{padding:30px 30px 22px;border-bottom:1px solid rgba(248,113,113,.14)}
        .admin-remote-error-kicker{display:inline-flex;align-items:center;padding:7px 12px;border-radius:999px;background:rgba(239,68,68,.1);color:#b91c1c;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .dark .admin-remote-error-kicker{background:rgba(248,113,113,.16);color:#fecaca}
        .admin-remote-error-title{margin:16px 0 10px;font-size:clamp(28px,4.8vw,40px);line-height:1.05}
        .admin-remote-error-desc{margin:0;color:#475569;line-height:1.8}
        .dark .admin-remote-error-desc{color:#cbd5e1}
        .admin-remote-error-body{padding:26px 30px 30px}
        .admin-remote-error-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .admin-remote-error-stat{padding:15px 16px;border-radius:18px;background:#f8fafc;border:1px solid rgba(148,163,184,.16)}
        .dark .admin-remote-error-stat{background:#111827;border-color:rgba(71,85,105,.5)}
        .admin-remote-error-k{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b}
        .admin-remote-error-v{margin-top:8px;font-size:14px;line-height:1.7;color:#0f172a;word-break:break-word}
        .dark .admin-remote-error-v{color:#f8fafc}
        .admin-remote-error-actions{display:flex;flex-wrap:wrap;gap:12px;margin:22px 0 20px}
        .admin-remote-error-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:14px;font-weight:700;text-decoration:none}
        .admin-remote-error-btn-primary{background:#0f172a;color:#fff}
        .dark .admin-remote-error-btn-primary{background:#e2e8f0;color:#0f172a}
        .admin-remote-error-btn-secondary{background:#fff;border:1px solid rgba(148,163,184,.22);color:#334155}
        .dark .admin-remote-error-btn-secondary{background:#0f172a;border-color:rgba(71,85,105,.6);color:#e2e8f0}
        .admin-remote-error-note{margin:0;color:#64748b;line-height:1.8}
        .dark .admin-remote-error-note{color:#94a3b8}
        .admin-remote-error-debug{margin-top:18px}
        .admin-remote-error-debug pre{margin:12px 0 0;padding:16px;border-radius:18px;background:#0f172a;color:#e2e8f0;overflow:auto;font-size:12px;line-height:1.6}
        @media (max-width: 820px){
          .admin-remote-error-grid{grid-template-columns:1fr}
          .admin-remote-error-head,.admin-remote-error-body{padding:22px}
        }
      </style>
      <div class="admin-remote-error-shell">
        <section class="admin-remote-error-card">
          <div class="admin-remote-error-head">
            <div class="admin-remote-error-kicker">HTML Error</div>
            <h1 class="admin-remote-error-title">管理台 HTML 暂时不可用</h1>
            <p class="admin-remote-error-desc">${Te(ge)}</p>
          </div>
          <div class="admin-remote-error-body">
            <div class="admin-remote-error-grid">
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">错误原因</div><div class="admin-remote-error-v">${Te(ge)}</div></article>
              <article class="admin-remote-error-stat"><div class="admin-remote-error-k">本地版本标识</div><div class="admin-remote-error-v">${Te(oe || "未找到本地 HTML 版本")}</div></article>
            </div>
            <div class="admin-remote-error-actions">
              <a href="${Te(Q)}" class="admin-remote-error-btn admin-remote-error-btn-primary">刷新 /admin</a>
              <a href="${Te(Xe)}" class="admin-remote-error-btn admin-remote-error-btn-secondary">重新上传 index.html</a>
            </div>
            <p class="admin-remote-error-note">如果这里继续报错，请重新上传与当前 Worker 匹配的 index.html。</p>
          </div>
        </section>
      </div>`;
  }
  function Qr(B = {}, G = {}, X = {}, W = {}, Q = {}) {
    const oe = String(B.adminPath || "/admin").trim() || "/admin", ge = Q?.isLocalUpload === !0, Xe = Vr({ adminPath: oe });
    return `<style>
        .admin-gate-shell{max-width:720px;margin:0 auto;padding:48px 20px 64px;color:#0f172a}
        .admin-gate-card{background:#fff;border:1px solid #dbe3ee;border-radius:8px;box-shadow:0 18px 50px rgba(15,23,42,.1);overflow:hidden}
        .dark .admin-gate-card{background:#0f172a;border-color:#334155;color:#e2e8f0}
        .admin-gate-head{padding:24px 24px 18px;border-bottom:1px solid #e2e8f0}
        .dark .admin-gate-head{border-color:#334155}
        .admin-gate-kicker{margin:0 0 8px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase}
        .dark .admin-gate-kicker{color:#7dd3fc}
        .admin-gate-title{margin:0;font-size:24px;line-height:1.3}
        .admin-gate-body{padding:24px;display:grid;gap:18px}
        .admin-gate-field{display:grid;gap:8px;min-width:0}
        .admin-gate-label{font-size:13px;font-weight:700;color:#475569}
        .dark .admin-gate-label{color:#cbd5e1}
        .admin-gate-input{width:100%;min-width:0;padding:12px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#0f172a;font-size:14px;outline:none}
        .dark .admin-gate-input{background:#020617;color:#e2e8f0;border-color:#475569}
        .admin-gate-input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.14)}
        .admin-gate-hint{font-size:12px;line-height:1.6;color:#64748b;overflow-wrap:anywhere}
        .dark .admin-gate-hint{color:#94a3b8}
        .admin-gate-status{min-height:44px;padding:11px 12px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;line-height:1.6;overflow-wrap:anywhere}
        .dark .admin-gate-status{background:#111827;border-color:#334155;color:#cbd5e1}
        .admin-gate-status.is-error{background:#fff1f2;border-color:#fecdd3;color:#be123c}
        .dark .admin-gate-status.is-error{background:#4c0519;border-color:#881337;color:#fecdd3}
        .admin-gate-status.is-success{background:#ecfdf5;border-color:#a7f3d0;color:#166534}
        .dark .admin-gate-status.is-success{background:#052e16;border-color:#166534;color:#bbf7d0}
        .admin-gate-actions{display:flex;justify-content:flex-end}
        .admin-gate-btn{min-height:42px;padding:10px 16px;border:0;border-radius:6px;background:#0369a1;color:#fff;font-size:14px;font-weight:700;cursor:pointer}
        .admin-gate-btn:hover{background:#075985}
        .admin-gate-btn:disabled{cursor:wait;opacity:.65}
        @media (max-width:640px){.admin-gate-shell{padding:24px 12px 40px}.admin-gate-head,.admin-gate-body{padding:18px}.admin-gate-actions,.admin-gate-btn{width:100%}}
      </style>
      <div class="admin-gate-shell">
        <section class="admin-gate-card">
          <header class="admin-gate-head">
            <p class="admin-gate-kicker">Index Source</p>
            <h1 class="admin-gate-title">上传 index.html</h1>
          </header>
          <form id="admin-index-gate-form" class="admin-gate-body" novalidate>
            <label class="admin-gate-field">
              <span class="admin-gate-label">index.html</span>
              <input id="admin-gate-local-file" class="admin-gate-input" type="file" accept=".html,text/html" required />
              <span id="admin-gate-local-hint" class="admin-gate-hint">文件上限 2 MiB</span>
            </label>
            <div id="admin-gate-status" class="admin-gate-status${ge ? " is-success" : ""}" role="status" aria-live="polite">${ge ? "当前已有 HTML 版本，可上传新文件替换。" : "请选择 index.html。"}</div>
            <div class="admin-gate-actions">
              <button id="admin-gate-submit" type="submit" class="admin-gate-btn">上传并进入管理台</button>
            </div>
          </form>
        </section>
      </div>
      <script>
        const ADMIN_INDEX_GATE_RUNTIME = ${Xe};
        const gateForm = document.getElementById("admin-index-gate-form");
        const localFileInput = document.getElementById("admin-gate-local-file");
        const localFileHint = document.getElementById("admin-gate-local-hint");
        const submitButton = document.getElementById("admin-gate-submit");
        const gateStatus = document.getElementById("admin-gate-status");
        function setGateStatus(message, tone) {
          if (!gateStatus) return;
          gateStatus.textContent = message || "";
          gateStatus.classList.remove("is-error", "is-success");
          if (tone === "error") gateStatus.classList.add("is-error");
          if (tone === "success") gateStatus.classList.add("is-success");
        }
        function formatFileSize(bytes) {
          const value = Number(bytes) || 0;
          return value >= 1024 * 1024
            ? (value / (1024 * 1024)).toFixed(2) + " MiB"
            : Math.max(0, Math.round(value / 1024)) + " KiB";
        }
        function validateFile(file) {
          if (!file) return "请选择 index.html。";
          if (String(file.name || "").trim().toLowerCase() !== "index.html") return "文件名必须是 index.html。";
          if (file.size > 2 * 1024 * 1024) return "文件超过 2 MiB 上限。";
          return "";
        }
        localFileInput?.addEventListener("change", () => {
          const file = localFileInput.files?.[0];
          const error = validateFile(file);
          if (localFileHint) localFileHint.textContent = file ? file.name + " · " + formatFileSize(file.size) : "文件上限 2 MiB";
          setGateStatus(error || ("已选择 " + file.name + "。"), error ? "error" : "success");
        });
        gateForm?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const file = localFileInput?.files?.[0];
          const validationError = validateFile(file);
          if (validationError) {
            setGateStatus(validationError, "error");
            localFileInput?.focus();
            return;
          }
          if (submitButton) submitButton.disabled = true;
          if (localFileInput) localFileInput.disabled = true;
          setGateStatus("正在上传并校验 index.html...", "");
          let redirecting = false;
          try {
            const response = await fetch(ADMIN_INDEX_GATE_RUNTIME.adminPath || "/admin", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json", "Accept": "application/json" },
              body: JSON.stringify({
                action: "uploadAdminIndex",
                fileName: file.name,
                indexHtml: await file.text()
              })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              const message = payload?.message || payload?.error?.message || payload?.error || ("上传失败（HTTP " + response.status + "）");
              throw new Error(String(message || "上传失败"));
            }
            redirecting = true;
            setGateStatus("index.html 已更新，正在进入管理台...", "success");
            window.location.assign(ADMIN_INDEX_GATE_RUNTIME.adminPath || "/admin");
          } catch (error) {
            setGateStatus(error?.message ? "上传失败：" + error.message : "上传失败，请稍后重试。", "error");
          } finally {
            if (!redirecting) {
              if (submitButton) submitButton.disabled = false;
              if (localFileInput) localFileInput.disabled = false;
            }
          }
        });
      <\/script>`;
  }
  function ke(B = "{}", G = "", X = _) {
    return !Array.isArray(u) || u.length !== c.length + 1 ? "" : p(u, {
      [h]: String(B || "{}"),
      [g]: String(G || ""),
      [y]: String(X || _)
    });
  }
  function Xt(B = {}, G = null, X = _) {
    const W = $(B) ? B : {}, Q = $(G) ? G : $(W.initHealth) ? W.initHealth : {}, oe = {
      templateRevision: String(l).trim() || "admin-shell",
      adminPath: String(W.adminPath || "").trim(),
      loginPath: String(W.loginPath || "").trim(),
      hostDomain: re(W.hostDomain),
      contractHash: ne(Z(W.contract || he())),
      initHealthOk: Q.ok === !0,
      initHealthMissing: [...new Set((Array.isArray(Q.missing) ? Q.missing : []).map((ge) => String(ge || "").trim()).filter(Boolean))],
      appRootHash: ne(String(X || _))
    };
    return `${oe.templateRevision}-${ne(Z(oe))}`;
  }
  function lt(B = "") {
    return `"${String(B || "").trim()}"`;
  }
  function ut(B = "") {
    return String(B || "").trim().replace(/^W\//i, "").replace(/^"(.*)"$/, "$1");
  }
  function xt(B, G = "") {
    const X = String(B?.headers?.get?.("If-None-Match") || "").trim(), W = ut(G);
    return !X || !W ? !1 : X.split(",").some((Q) => {
      const oe = ut(Q);
      return oe === "*" || oe === W;
    });
  }
  function Tt(B, G = "") {
    const X = B instanceof Request ? new URL(B.url) : new URL(String(B || ""), S), W = new URL(X.pathname, S);
    return W.searchParams.set("remote", ne(String(G || "").trim())), new Request(W.toString(), { method: "GET" });
  }
  function Ot(B, G = "", X = {}) {
    const W = Tt(B, G), Q = new URL(W.url);
    return Q.searchParams.set("transform", D), Q.searchParams.set("bootstrap", ne(Z($(X) ? X : {}))), new Request(Q.toString(), { method: "GET" });
  }
  function Yt(B = "", G = "no-store, max-age=0") {
    const X = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": String(G || "no-store, max-age=0")
    });
    return Ce(X), B && X.set("ETag", lt(B)), X;
  }
  function Rt(B = "") {
    const G = String(B || "").trim();
    if (!G) return "";
    const X = Date.parse(G);
    return Number.isFinite(X) ? new Date(X).toUTCString() : "";
  }
  function Sr(B, G = "") {
    const X = String(B?.headers?.get?.("If-Modified-Since") || "").trim(), W = Rt(G);
    if (!X || !W) return !1;
    const Q = Date.parse(X), oe = Date.parse(W);
    return !Number.isFinite(Q) || !Number.isFinite(oe) ? !1 : Q >= oe;
  }
  function vt(B, G) {
    return String(B?.headers?.get?.("If-None-Match") || "").trim() ? xt(B, G?.headers?.get?.("ETag") || "") : Sr(B, G?.headers?.get?.("Last-Modified") || "");
  }
  function Ft(B, G = "no-store, max-age=0") {
    const X = new Headers({ "Cache-Control": String(G || "no-store, max-age=0") }), W = ut(B?.headers?.get?.("ETag") || ""), Q = Rt(B?.headers?.get?.("Last-Modified") || "");
    W && X.set("ETag", lt(W)), Q && X.set("Last-Modified", Q);
    const oe = String(B?.headers?.get?.("X-Admin-Shell-Revision") || "").trim();
    return oe && X.set("X-Admin-Shell-Revision", oe), Ce(X), new Response(null, {
      status: 304,
      headers: X
    });
  }
  return {
    ADMIN_FALLBACK_HTML_TEMPLATE: r,
    cachedAdminTemplateBytes: a,
    SITE_FAVICON_SVG: n,
    LANDING_PAGE_STYLE_HTML: s,
    renderFaviconResponse: i,
    ADMIN_HTML_DYNAMIC_PLACEHOLDERS: c,
    ADMIN_HTML_VARIANT_ETAG: l,
    ADMIN_HTML_PARTS_PLAIN: u,
    ADMIN_EMBEDDED_TEMPLATE_MODE: d,
    ADMIN_FINAL_UI_HTML_RETIRED: f,
    splitAdminHtmlTemplate: m,
    renderAdminHtmlTemplate: p,
    ADMIN_BOOTSTRAP_PLACEHOLDER: h,
    ADMIN_INIT_HEALTH_BANNER_PLACEHOLDER: g,
    ADMIN_APP_ROOT_PLACEHOLDER: y,
    ADMIN_APP_ROOT_HTML: _,
    ADMIN_HTML_CACHE_KEY_ORIGIN: S,
    ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL: A,
    ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL: E,
    ADMIN_REMOTE_SHELL_REVALIDATE_MS: T,
    ADMIN_REMOTE_SHELL_MAX_BYTES: w,
    ADMIN_REMOTE_SHELL_TRANSFORM_REVISION: D,
    ADMIN_REMOTE_SHELL_CACHED_AT_HEADER: k,
    ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER: b,
    ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER: N,
    ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER: R,
    ADMIN_RELEASE_PROXY_PATH_SEGMENT: x,
    ADMIN_RELEASE_VENDOR_PATH_SEGMENT: O,
    ADMIN_WARM_PATH_SEGMENT: L,
    ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN: v,
    ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN: M,
    ADMIN_RELEASE_VENDOR_CACHE_CONTROL: C,
    ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL: I,
    ADMIN_RELEASE_VENDOR_MAX_BYTES: P,
    ADMIN_WARM_VENDOR_CONCURRENCY: U,
    ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER: V,
    ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER: j,
    ADMIN_PRIMARY_VIEWS: K,
    ADMIN_SETTINGS_VISUAL_SECTIONS: q,
    ADMIN_SETTINGS_SAVE_GROUPS: de,
    buildAdminUiContract: he,
    buildAdminBootstrapPayload: fe,
    measureAdminShellTemplateBytes: ie,
    buildAdminShellLifecycleState: me,
    buildAdminShellRetirementState: Me,
    buildAdminShellEffectiveMode: Ue,
    buildAdminEmbeddedFallbackRuntimeState: et,
    buildAdminShellState: Et,
    resolveAdminShellIndexUrl: Yr,
    normalizeAdminShellRuntimeStatus: Le,
    patchAdminShellRuntimeStatus: Jr,
    withAdminShellRuntimeStatus: tt,
    describeAdminRemoteShellFailureReason: rt,
    buildAdminRemoteShellErrorContent: yr,
    buildAdminIndexSetupContent: Qr,
    renderAdminHtmlShell: ke,
    buildAdminHtmlVariantEtag: Xt,
    formatAdminHtmlEtag: lt,
    normalizeEtagToken: ut,
    requestHasMatchingEtag: xt,
    buildAdminRemoteShellLegacyCacheKeyRequest: Tt,
    buildAdminRemoteShellCacheKeyRequest: Ot,
    buildAdminHtmlResponseHeaders: Yt,
    normalizeAdminHttpDateHeader: Rt,
    requestHasMatchingLastModified: Sr,
    requestMatchesAdminHtmlResponse: vt,
    buildConditionalNotModifiedResponseFromStoredResponse: Ft
  };
}
function ad(o = {}, e = {}) {
  function t(C = "{}") {
    return `${s(C)}${r}`;
  }
  const r = '<script id="admin-bootstrap-loader">try{window.__ADMIN_BOOTSTRAP__=JSON.parse(document.getElementById("admin-bootstrap")?.textContent||"{}")}catch(_){window.__ADMIN_BOOTSTRAP__=window.__ADMIN_BOOTSTRAP__||{},window.__ADMIN_UI_BOOT_ERROR__=window.__ADMIN_UI_BOOT_ERROR__||"admin bootstrap parse failed: "+(_?.message||String(_||"unknown_error"))}<\/script>', a = '<script id="admin-tailwind-prelude">window.tailwind=window.tailwind||{};<\/script>', n = /* @__PURE__ */ new Set([
    "script",
    "style",
    "template",
    "textarea",
    "title",
    "noscript"
  ]);
  function s(C = "{}") {
    return `<script id="admin-bootstrap" type="application/json">${String(C || "{}")}<\/script>`;
  }
  function i(C = "") {
    return C === " " || C === "	" || C === `
` || C === "\f" || C === "\r";
  }
  function c(C, I) {
    let P = "";
    for (let U = I; U < C.length; U += 1) {
      const V = C[U];
      if (P)
        V === P && (P = "");
      else if (V === '"' || V === "'") P = V;
      else if (V === ">") return U;
    }
    return -1;
  }
  function l(C, I) {
    let P = I + 1;
    if (!/[A-Za-z]/.test(C[P] || "")) return null;
    const U = c(C, P);
    if (U < 0) return null;
    const V = P;
    for (; P < U && !i(C[P]) && C[P] !== "/"; ) P += 1;
    const j = C.slice(V, P).toLowerCase(), K = /* @__PURE__ */ new Map();
    for (; P < U; ) {
      for (; P < U && i(C[P]); ) P += 1;
      if (P >= U) break;
      if (C[P] === "/") {
        P += 1;
        continue;
      }
      const q = P;
      for (; P < U && !i(C[P]) && C[P] !== "=" && C[P] !== "/"; ) P += 1;
      if (P === q) {
        P += 1;
        continue;
      }
      const de = C.slice(q, P).toLowerCase();
      for (; P < U && i(C[P]); ) P += 1;
      let he = "", fe = !1, ie = -1, me = -1;
      if (C[P] === "=") {
        for (P += 1; P < U && i(C[P]); ) P += 1;
        const Me = C[P];
        if (Me === '"' || Me === "'") {
          for (fe = !0, P += 1, ie = P; P < U && C[P] !== Me; ) P += 1;
          me = P, he = C.slice(ie, me), P < U && (P += 1);
        } else {
          for (ie = P; P < U && !i(C[P]); ) P += 1;
          me = P, he = C.slice(ie, me);
        }
      }
      K.has(de) || K.set(de, {
        value: he,
        quoted: fe,
        valueStart: ie,
        valueEnd: me
      });
    }
    return {
      tagName: j,
      attributes: K,
      start: I,
      tagEnd: U
    };
  }
  function u(C, I, P, U) {
    const V = `</${P}`;
    let j = U;
    for (; j < C.length; ) {
      const K = I.indexOf(V, j);
      if (K < 0) return null;
      const q = C[K + V.length] || "";
      if (!q || i(q) || q === "/" || q === ">") {
        const de = c(C, K + V.length);
        return de >= 0 ? {
          start: K,
          tagEnd: de
        } : null;
      }
      j = K + V.length;
    }
    return null;
  }
  function* d(C = "") {
    const I = String(C || ""), P = I.toLowerCase();
    let U = 0;
    for (; U < I.length; ) {
      const V = I.indexOf("<", U);
      if (V < 0) return;
      if (I.startsWith("<!--", V)) {
        const fe = I.indexOf("-->", V + 4);
        U = fe < 0 ? I.length : fe + 3;
        continue;
      }
      const j = I[V + 1] || "";
      if (j === "!" || j === "?" || j === "/") {
        const fe = c(I, V + 2);
        if (fe < 0) return;
        U = fe + 1;
        continue;
      }
      const K = l(I, V);
      if (!K) {
        if (/[A-Za-z]/.test(j)) return;
        U = V + 1;
        continue;
      }
      const q = K.tagEnd + 1, de = n.has(K.tagName) ? u(I, P, K.tagName, q) : null, he = de ? de.start : q;
      if (U = de ? de.tagEnd + 1 : q, yield {
        ...K,
        contentStart: q,
        contentEnd: de || !n.has(K.tagName) ? he : I.length,
        contentTagEnd: de ? de.tagEnd : -1,
        contentClosed: !!de || !n.has(K.tagName)
      }, n.has(K.tagName) && !de) return;
    }
  }
  function f(C = "", I = "") {
    const P = String(C || ""), U = String(I || "");
    if (!P || !U) return P;
    let V = -1;
    for (const j of d(P)) {
      if (j.tagName === "head") {
        const K = j.tagEnd + 1;
        return `${P.slice(0, K)}${U}${P.slice(K)}`;
      }
      j.tagName === "body" && V < 0 && (V = j.tagEnd + 1);
    }
    return V >= 0 ? `${P.slice(0, V)}${U}${P.slice(V)}` : `${U}${P}`;
  }
  function m(C = "") {
    const I = String(C || "");
    if (!I) return I;
    let P = -1;
    for (const U of d(I)) {
      if (U.tagName !== "script" || !U.contentClosed) continue;
      if (U.attributes.get("id")?.value === "admin-tailwind-prelude") return I;
      if (P >= 0 || U.attributes.has("src")) continue;
      const V = I.slice(U.contentStart, U.contentEnd);
      /\btailwind\s*\.\s*config\s*=/i.test(V) && (P = U.start);
    }
    return P < 0 ? I : `${I.slice(0, P)}${a}${I.slice(P)}`;
  }
  function p(C = "", I = "{}") {
    const P = m(String(C || ""));
    if (!P) return P;
    const U = s(I);
    let V = null, j = null;
    for (const K of d(P)) {
      if (K.tagName !== "script" || !K.contentClosed) continue;
      const q = String(K.attributes.get("id")?.value || "").trim();
      q === "admin-bootstrap" && String(K.attributes.get("type")?.value || "").trim().toLowerCase() === "application/json" ? V = K : q === "admin-bootstrap-loader" && (j = K);
    }
    if (V && V.contentTagEnd >= V.tagEnd) {
      const K = P.slice(0, V.start), q = P.slice(V.contentTagEnd + 1);
      return `${K}${U}${j ? "" : r}${q}`;
    }
    return j ? `${P.slice(0, j.start)}${U}${P.slice(j.start)}` : f(P, t(I));
  }
  function h(C) {
    const I = String(C?.tagName || "").trim().toLowerCase();
    let P = "", U = "";
    if (I === "script" && C.attributes?.has("src"))
      P = "src", U = "script";
    else if (I === "link" && C.attributes?.has("href")) {
      const q = new Set(String(C.attributes.get("rel")?.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean)), de = String(C.attributes.get("as")?.value || "").trim().toLowerCase();
      q.has("stylesheet") ? U = "css" : q.has("modulepreload") ? U = "script" : (q.has("preload") || q.has("prefetch")) && de === "style" ? U = "css" : (q.has("preload") || q.has("prefetch")) && de === "script" && (U = "script"), U && (P = "href");
    }
    if (!P || !U) return null;
    const V = C.attributes.get(P), j = Number(V?.valueStart), K = Number(V?.valueEnd);
    return !Number.isInteger(j) || !Number.isInteger(K) || j < 0 || K < j ? null : {
      rawValue: String(V?.value || ""),
      assetKind: U,
      valueStart: j,
      valueEnd: K
    };
  }
  function g(C = "") {
    const I = [];
    for (const P of d(C)) {
      const U = h(P);
      U && I.push(U);
    }
    return I;
  }
  function y(C = "") {
    for (const I of d(C))
      if (I.tagName === "script" && String(I.attributes.get("type")?.value || "").trim().toLowerCase() === "importmap")
        return !0;
    return !1;
  }
  function _(C = "", I = "") {
    const P = String(C || "");
    if (!P) return [];
    let U = null;
    try {
      U = new URL(String(I || "").trim());
    } catch {
      U = null;
    }
    const V = [];
    for (const j of g(P)) {
      const K = String(j.rawValue || "").trim();
      if (!(!K || /^data:/i.test(K) || /^javascript:/i.test(K)))
        try {
          const q = U ? new URL(K, U).toString() : new URL(K).toString();
          V.push({
            rawValue: K,
            normalizedUrl: q,
            assetKind: j.assetKind
          });
        } catch {
          continue;
        }
    }
    return V.filter((j, K, q) => q.findIndex((de) => de.normalizedUrl === j.normalizedUrl) === K);
  }
  function S(C = "", I = "") {
    return _(C, I).map((P) => P.normalizedUrl);
  }
  function A(C = "") {
    return String(C || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function E(C = "", I = "") {
    const P = String(C || "").trim(), U = String(I || "").trim().toLowerCase() === "css" ? "css" : "js";
    return P ? `${ne(P)}.${U}` : "";
  }
  function T(C = "/admin", I = "", P = "") {
    const U = J(C || "/admin").replace(/\/+$/, "") || "/admin", V = mt(I), j = String(P || "").trim();
    return !V || !j ? "" : `${U}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/${encodeURIComponent(V)}/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/${encodeURIComponent(j)}`;
  }
  function w(C = "", I = {}) {
    const P = _(C, I.baseUrl || I.sourceUrl || "").map((U) => ({
      assetKey: E(U.normalizedUrl, U.assetKind),
      assetKind: U.assetKind,
      upstreamUrl: U.normalizedUrl
    })).filter((U) => U.assetKey && U.upstreamUrl).filter((U, V, j) => j.findIndex((K) => K.assetKey === U.assetKey) === V);
    return {
      version: 1,
      releaseTag: mt(I.releaseTag),
      sourceUrl: Ir(I.sourceUrl || I.baseUrl || ""),
      entries: P
    };
  }
  function D(C = "", I = {}, P = {}) {
    const U = String(C || "");
    if (!U) return U;
    const V = String(P.adminPath || "/admin").trim() || "/admin", j = mt(P.releaseTag), K = new Map((Array.isArray(I?.entries) ? I.entries : []).map((fe) => [String(fe?.upstreamUrl || "").trim(), String(fe?.assetKey || "").trim()]));
    if (!j || K.size === 0) return U;
    let q = null;
    try {
      q = new URL(String(P.baseUrl || P.sourceUrl || "").trim());
    } catch {
      q = null;
    }
    const de = [];
    for (const fe of g(U)) {
      const ie = String(fe.rawValue || "").trim();
      if (!(!ie || /^data:/i.test(ie) || /^javascript:/i.test(ie)))
        try {
          const me = q ? new URL(ie, q).toString() : new URL(ie).toString(), Me = K.get(me), Ue = T(V, j, Me);
          if (!Me || !Ue) continue;
          de.push({
            start: fe.valueStart,
            end: fe.valueEnd,
            value: Ue
          });
        } catch {
          continue;
        }
    }
    let he = U;
    for (const fe of de.sort((ie, me) => me.start - ie.start)) he = `${he.slice(0, fe.start)}${fe.value}${he.slice(fe.end)}`;
    return he;
  }
  function k(C = {}) {
    const I = $(C) ? C : {};
    return {
      version: Number(I.version) || 1,
      releaseTag: mt(I.releaseTag),
      sourceUrl: Ir(I.sourceUrl),
      entries: (Array.isArray(I.entries) ? I.entries : []).map((P) => ({
        assetKey: String(P?.assetKey || "").trim(),
        assetKind: String(P?.assetKind || "").trim().toLowerCase() === "css" ? "css" : "script",
        upstreamUrl: Ir(P?.upstreamUrl)
      })).filter((P) => P.assetKey && P.upstreamUrl)
    };
  }
  function b(C = "") {
    let I = null;
    try {
      I = new URL(String(C || "").trim());
    } catch {
      return !1;
    }
    const P = I.hostname.replace(/\.+$/, "");
    if (!/(^|\.)jsdelivr\.net$/i.test(P) || !/^\/gh\/[^/]+\/[^/]+\//i.test(I.pathname)) return !1;
    const U = I.pathname.match(/^\/gh\/[^/]+\/[^@/]+@([^/]+)\//i);
    if (!U) return !0;
    const V = decodeURIComponent(String(U[1] || "").trim());
    return V ? !(/^[0-9a-f]{7,40}$/i.test(V) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(V)) : !0;
  }
  function N(C = "") {
    const I = String(C || ""), P = [], U = (j = "") => /[A-Za-z0-9_$]/.test(j), V = (j) => {
      let K = j;
      for (; K < I.length; ) {
        if (/\s/.test(I[K])) {
          K += 1;
          continue;
        }
        if (I.startsWith("//", K)) {
          const q = I.indexOf(`
`, K + 2);
          K = q < 0 ? I.length : q + 1;
          continue;
        }
        if (I.startsWith("/*", K)) {
          const q = I.indexOf("*/", K + 2);
          K = q < 0 ? I.length : q + 2;
          continue;
        }
        break;
      }
      return K;
    };
    for (let j = 0; j < I.length; ) {
      if (I.startsWith("import", j) && !U(I[j - 1]) && !U(I[j + 6])) {
        let K = j - 1;
        for (; K >= 0 && /\s/.test(I[K]); ) K -= 1;
        const q = V(j + 6);
        I[K] !== "." && I[q] === "(" && P.push({
          index: j,
          reference: I.slice(j, q + 1)
        });
      }
      j += 1;
    }
    return P;
  }
  function R(C = "") {
    const I = String(C || "");
    for (const P of d(I)) {
      if (P.tagName !== "script" || !P.contentClosed || P.attributes.get("src")?.value) continue;
      const U = String(P.attributes.get("type")?.value || "").trim().toLowerCase().split(";")[0];
      if (!(U && ![
        "module",
        "text/javascript",
        "application/javascript",
        "text/ecmascript",
        "application/ecmascript"
      ].includes(U)) && N(I.slice(P.contentStart, P.contentEnd)).length > 0)
        return !0;
    }
    return !1;
  }
  function x(C = "", I = "") {
    const P = _(C, I), U = [];
    y(C) && U.push("远端 index.html 不允许 importmap；所有运行时依赖必须通过显式 script/link 标签交付"), R(C) && U.push("index.html 不允许 inline 动态 import()；所有运行时依赖必须通过显式 script/link 标签交付");
    for (const V of P) {
      const j = String(V?.rawValue || "").trim(), K = String(V?.normalizedUrl || "").trim();
      let q = "", de = "";
      try {
        const he = new URL(K);
        q = he.hostname.replace(/\.+$/, "").toLowerCase(), de = he.pathname;
      } catch {
      }
      if (!/^(?:https?:)?\/\//i.test(j)) {
        U.push(`远端 index.html 不允许相对或本地 bundle 资源：${j}`);
        continue;
      }
      if (q === "esm.sh" || q.endsWith(".esm.sh")) {
        U.push(`esm.sh 资产不再允许：${K}`);
        continue;
      }
      if (q === "raw.githubusercontent.com") {
        U.push(`raw.githubusercontent.com 资产不再允许：${K}`);
        continue;
      }
      if (q === "github.com" && /^\/[^/]+\/[^/]+\/releases\/download\//i.test(de)) {
        U.push(`浏览器直连 GitHub Release 资产不再允许：${K}`);
        continue;
      }
    }
    return U;
  }
  function O(C = "") {
    for (const I of d(C)) {
      if (n.has(I.tagName)) continue;
      const P = I.attributes.get("id");
      if (P?.quoted && P.value === "app") return !0;
    }
    return !1;
  }
  function L(C = "") {
    const I = String(C || "").trim();
    return I ? /<!doctype\s+html\b/i.test(I) || /<html\b/i.test(I) : !1;
  }
  function v(C = "", I = !1) {
    const P = String(C || "").trim().toLowerCase();
    return !P || P.includes("text/html") || P.includes("application/xhtml+xml") ? !0 : I ? P.startsWith("text/plain") || P.startsWith("application/octet-stream") : !1;
  }
  function M(C = {}) {
    const I = $(C.bootstrap) ? C.bootstrap : {}, P = $(C.initHealth) ? C.initHealth : $(I.initHealth) ? I.initHealth : {};
    return `admin-remote-shell-${ne(Z({
      templateRevision: "admin-remote-shell",
      sourceHash: ne(String(C.sourceUrl || "").trim()),
      originEtag: e.normalizeEtagToken(C.originEtag || ""),
      originLastModified: e.normalizeAdminHttpDateHeader(C.originLastModified || ""),
      htmlHash: ne(String(C.html || "")),
      variantSeed: e.buildAdminHtmlVariantEtag(I, P, "remote-admin-shell")
    }))}`;
  }
  return {
    buildAdminRemoteBootstrapMarkup: t,
    ADMIN_REMOTE_BOOTSTRAP_LOADER_HTML: r,
    ADMIN_REMOTE_TAILWIND_PRELUDE_HTML: a,
    ADMIN_HTML_SKIPPED_CONTENT_TAGS: n,
    buildAdminRemoteBootstrapScriptMarkup: s,
    isAdminHtmlSpace: i,
    findAdminHtmlTagEnd: c,
    parseAdminHtmlOpeningTag: l,
    findAdminHtmlClosingTag: u,
    iterateAdminHtmlOpeningTags: d,
    injectMarkupIntoHtmlDocument: f,
    ensureAdminRemoteTailwindConfigGlobal: m,
    applyAdminRemoteBootstrapMarkup: p,
    getAdminRemoteShellAssetReference: h,
    collectAdminRemoteShellAssetReferences: g,
    hasAdminRemoteShellImportMap: y,
    extractAdminRemoteShellAssetDescriptors: _,
    extractAdminRemoteShellAssetUrls: S,
    escapeRegexForRoute: A,
    buildAdminReleaseVendorAssetKey: E,
    buildAdminReleaseVendorProxyPath: T,
    buildAdminReleaseVendorManifest: w,
    rewriteAdminRemoteShellAssetUrlsToProxy: D,
    normalizeAdminReleaseVendorManifestRecord: k,
    isMutableJsdelivrGithubAssetUrl: b,
    collectAdminInlineDynamicImports: N,
    hasAdminRemoteShellInlineDynamicImport: R,
    getAdminRemoteShellAssetPolicyViolations: x,
    hasAdminRemoteShellAppRoot: O,
    hasAdminRemoteShellHtmlDocument: L,
    isAcceptedAdminHtmlDocumentContentType: v,
    buildAdminRemoteShellVariantEtag: M
  };
}
function Be(o, e) {
  return fetch(o, e);
}
function ki(o = {}) {
  const e = {};
  if (!o || typeof o != "object" || Array.isArray(o)) return e;
  for (const [t, r] of Object.entries(o)) {
    const a = String(t || "").trim().toLowerCase();
    !a || e[a] !== void 0 || (e[a] = r);
  }
  return e;
}
function is(o = {}, e = []) {
  const t = ki(o);
  for (const r of Array.isArray(e) ? e : [e]) {
    const a = String(r || "").trim().toLowerCase();
    if (!a) continue;
    const n = t[a];
    if (!(n == null || n === ""))
      return n;
  }
  return "";
}
function ct(o = []) {
  return (Array.isArray(o) ? o : [o]).map((e) => String(e ?? "").trim()).filter(Boolean).join(":");
}
async function Kt(o, e) {
  return await fn(te.SingleFlightTasks, o, e);
}
async function fn(o, e, t) {
  const r = String(e || "").trim();
  if (!r) return await t();
  const a = o.get(r);
  if (a) return await a;
  const n = Promise.resolve().then(() => t()).finally(() => {
    o.get(r) === n && o.delete(r);
  });
  return o.set(r, n), await n;
}
function Lo(o) {
  return String(o?.__CONFIG_CACHE_NAMESPACE || o?.__WORKER_CACHE_SCOPE || "default").trim() || "default";
}
function mn(o) {
  return Ka.get(Na(o), Lo(o));
}
function cs(o) {
  return mn(o).ConfigCache?.data || null;
}
function ja(o) {
  if (arguments.length === 0) {
    Ka.reset();
    return;
  }
  const e = mn(o);
  e.RuntimeConfigCacheGeneration += 1, e.ConfigCache = null;
}
function nd(o, e) {
  const t = mn(o);
  t.RuntimeConfigCacheGeneration += 1, t.ConfigCache = {
    data: e,
    exp: Date.now() + F.Defaults.CacheTTL,
    namespace: Lo(o)
  };
}
async function Wn(o, e) {
  const t = String(o), r = (te.AdminRemoteShellCacheMutationChains.get(t) || Promise.resolve()).catch(() => null).then(() => e()).finally(() => {
    te.AdminRemoteShellCacheMutationChains.get(t) === r && te.AdminRemoteShellCacheMutationChains.delete(t);
  });
  return te.AdminRemoteShellCacheMutationChains.set(t, r), await r;
}
function od(o = {}, e = {}) {
  function t(b = "", N = {}) {
    const R = e.buildAdminHtmlResponseHeaders(N.variantEtag || "", e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL), x = Number.parseInt(String(N.cachedAt || ""), 10);
    R.set(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER, String(Number.isFinite(x) && x > 0 ? x : H()));
    const O = e.normalizeEtagToken(N.originEtag || "");
    O && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER, O);
    const L = e.normalizeAdminHttpDateHeader(N.originLastModified || "");
    L && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER, L);
    const v = ne(String(N.sourceUrl || "").trim());
    v && R.set(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER, v);
    const M = Lt(N.shellRevision || Je(N.sourceUrl));
    return M && R.set("X-Admin-Shell-Revision", M), new Response(String(b || ""), {
      status: 200,
      headers: R
    });
  }
  async function r(b) {
    if (!b) return null;
    try {
      const N = await De(b, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (N.exceeded) return null;
      const R = new Headers(b.headers || {});
      return R.delete("Content-Length"), new Response(N.text, {
        status: Number(b.status) || 200,
        statusText: String(b.statusText || ""),
        headers: R
      });
    } catch {
      return null;
    }
  }
  async function a(b, N, R, x) {
    const O = await De(b, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (O.exceeded) throw new Error("legacy remote admin shell too large");
    const L = O.text, v = e.applyAdminRemoteBootstrapMarkup(L, Vr(R)), M = b.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || "", C = e.normalizeAdminHttpDateHeader(b.headers.get(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || ""), I = e.normalizeAdminHttpDateHeader(b.headers.get("Last-Modified") || "") || C;
    return t(v, {
      variantEtag: e.buildAdminRemoteShellVariantEtag({
        html: v,
        bootstrap: R,
        initHealth: x,
        sourceUrl: N,
        originEtag: M,
        originLastModified: C || I
      }),
      lastModified: I,
      originEtag: M,
      originLastModified: C || I,
      sourceUrl: N,
      cachedAt: _(b)
    });
  }
  function n(b, N = "GET") {
    if (!b) return new Response("Remote admin shell unavailable", { status: 502 });
    const R = new Headers(b.headers || {});
    return R.set("Content-Type", "text/html;charset=UTF-8"), R.set("Cache-Control", e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL), R.delete(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER), R.delete(e.ADMIN_REMOTE_SHELL_SOURCE_HASH_HEADER), Ce(R), new Response(N === "HEAD" ? null : b.body, {
      status: b.status,
      statusText: b.statusText,
      headers: R
    });
  }
  function s(b = "", N = "") {
    const R = new URL(`/${encodeURIComponent(mt(b) || "release")}`, e.ADMIN_RELEASE_VENDOR_MANIFEST_CACHE_KEY_ORIGIN);
    return R.searchParams.set("source", ne(String(N || "").trim())), new Request(R.toString(), { method: "GET" });
  }
  function i(b = "", N = "", R = "") {
    const x = new URL(`/${encodeURIComponent(mt(b) || "release")}/${encodeURIComponent(String(N || "").trim())}`, e.ADMIN_RELEASE_VENDOR_CACHE_KEY_ORIGIN);
    return x.searchParams.set("source", ne(String(R || "").trim())), new Request(x.toString(), { method: "GET" });
  }
  function c(b = {}, N = "") {
    const R = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": e.ADMIN_REMOTE_SHELL_EDGE_CACHE_CONTROL
    }), x = String(N || b?.sourceUrl || "").trim();
    return R.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(H())), x && R.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ne(x)), new Response(JSON.stringify(b), {
      status: 200,
      headers: R
    });
  }
  function l(b = "", N = "script") {
    const R = String(b || "").trim().toLowerCase(), x = String(N || "").trim().toLowerCase() === "css" ? "css" : "script";
    return R ? x === "css" ? R.includes("text/css") || R.includes("application/css") || R.startsWith("text/plain") : R.includes("javascript") || R.includes("ecmascript") || R.startsWith("text/plain") || R.startsWith("application/octet-stream") : !0;
  }
  function u(b, N = "GET") {
    const R = new Headers(b.headers);
    return R.set("Cache-Control", String(b.headers.get("Cache-Control") || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL).trim() || e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL), R.delete(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER), R.delete(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER), Ce(R), new Response(N === "HEAD" ? null : b.body, {
      status: b.status,
      statusText: b.statusText,
      headers: R
    });
  }
  async function d(b, N = "", R = "") {
    if (!b || typeof b.match != "function") return null;
    const x = await b.match(s(N, R));
    if (!x) return null;
    try {
      const O = await De(x, Pi);
      return O.exceeded ? null : e.normalizeAdminReleaseVendorManifestRecord(JSON.parse(O.text));
    } catch {
      return null;
    }
  }
  async function f(b = "", N = "") {
    const R = mt(b), x = Ir(N);
    if (!R || !x) return null;
    const O = await Be(x, { method: "GET" });
    if (!O.ok) throw new Error(`release index fetch failed: HTTP ${O.status}`);
    const L = String(O.headers.get("Content-Type") || "").trim().toLowerCase(), v = Number.parseInt(String(O.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(v) && v > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index too large: ${v} bytes`);
    const M = await De(O, e.ADMIN_REMOTE_SHELL_MAX_BYTES), C = M.text, I = M.bytes;
    if (M.exceeded || !C || I > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`release index payload invalid: ${I} bytes`);
    const P = e.hasAdminRemoteShellHtmlDocument(C);
    if (!e.isAcceptedAdminHtmlDocumentContentType(L, P)) throw new Error(`release index content-type invalid: ${L}`);
    if (!P) throw new Error("release index payload invalid: html document expected");
    if (!e.hasAdminRemoteShellAppRoot(C)) throw new Error("release index missing #app root");
    const U = e.getAdminRemoteShellAssetPolicyViolations(C, x);
    if (U.length > 0) throw new Error(`release index asset policy invalid: ${U.slice(0, 3).join(" | ")}`);
    return e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(C, {
      releaseTag: R,
      sourceUrl: x
    }));
  }
  async function m(b, N = {}, R = null) {
    const x = e.normalizeAdminReleaseVendorManifestRecord(N);
    if (!b || typeof b.put != "function" || !x.releaseTag || !x.sourceUrl) return x;
    const O = pe(b.put(s(x.releaseTag, x.sourceUrl), c(x, x.sourceUrl)), "admin.release_vendor_manifest_cache_write", { releaseTag: x.releaseTag }, null);
    return R && typeof R.waitUntil == "function" ? R.waitUntil(O) : await O, x;
  }
  async function p(b, N = "", R = "", x = null) {
    const O = await d(b, N, R);
    if (O?.entries?.length) return O;
    const L = await f(N, R);
    return L ? (await m(b, L, x), L) : null;
  }
  function h(b = {}, N = "") {
    const R = String(N || "").trim();
    return R && (Array.isArray(b?.entries) ? b.entries : []).find((x) => String(x?.assetKey || "").trim() === R) || null;
  }
  function g(b = "", N = "/admin") {
    const R = J(N || "/admin").replace(/\/+$/, "") || "/admin", x = J(b || "/"), O = new RegExp(`^${e.escapeRegexForRoute(R)}/${e.ADMIN_RELEASE_PROXY_PATH_SEGMENT}/([^/]+)/${e.ADMIN_RELEASE_VENDOR_PATH_SEGMENT}/([^/]+)/*$`, "i"), L = x.match(O);
    if (!L) return null;
    try {
      return {
        releaseTag: mt(decodeURIComponent(String(L[1] || ""))),
        assetKey: String(decodeURIComponent(String(L[2] || "")) || "").trim()
      };
    } catch {
      return null;
    }
  }
  function y(b = "", N = "/admin") {
    const R = J(N || "/admin").replace(/\/+$/, "") || "/admin";
    return (J(b || "/").replace(/\/+$/, "") || "/").toLowerCase() === `${R}/${e.ADMIN_WARM_PATH_SEGMENT}`.toLowerCase();
  }
  function _(b) {
    const N = Number.parseInt(String(b?.headers?.get?.(e.ADMIN_REMOTE_SHELL_CACHED_AT_HEADER) || ""), 10);
    return Number.isFinite(N) && N > 0 ? N : 0;
  }
  function S(b) {
    const N = _(b);
    return N ? H() - N >= e.ADMIN_REMOTE_SHELL_REVALIDATE_MS : !0;
  }
  function A(b = "", N = "", R = {}) {
    const x = String(b || ""), O = String(R.sourceLabel || "admin shell").trim() || "admin shell", L = String(R.contentType || "").trim().toLowerCase(), v = new TextEncoder().encode(x).length;
    if (!x || v > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`${O} payload invalid: ${v} bytes`);
    const M = e.hasAdminRemoteShellHtmlDocument(x);
    if (!e.isAcceptedAdminHtmlDocumentContentType(L, M)) throw new Error(`${O} content-type invalid: ${L}`);
    if (!M) throw new Error(`${O} payload invalid: html document expected`);
    if (!e.hasAdminRemoteShellAppRoot(x)) throw new Error(`${O} missing #app root`);
    const C = e.getAdminRemoteShellAssetPolicyViolations(x, N);
    if (C.length > 0) throw new Error(`${O} asset policy invalid: ${C.slice(0, 3).join(" | ")}`);
    return {
      html: x,
      bytes: v
    };
  }
  function E(b = "", N = {}, R = {}, x = "", O = {}) {
    const L = A(b, x, O), v = mt(O.assetRevision || O.releaseTag), M = v ? e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(L.html, {
      releaseTag: v,
      sourceUrl: x
    })) : null, C = M?.entries?.length ? e.rewriteAdminRemoteShellAssetUrlsToProxy(L.html, M, {
      adminPath: String(O.adminPath || N?.adminPath || "/admin").trim() || "/admin",
      releaseTag: v,
      sourceUrl: x
    }) : L.html, I = e.applyAdminRemoteBootstrapMarkup(C, Vr(N)), P = e.normalizeAdminHttpDateHeader(O.lastModified || "") || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toUTCString(), U = String(O.originEtag || "").trim();
    return {
      storedResponse: t(I, {
        variantEtag: e.buildAdminRemoteShellVariantEtag({
          html: I,
          bootstrap: N,
          initHealth: R,
          sourceUrl: x,
          originEtag: U,
          originLastModified: P
        }),
        lastModified: P,
        originEtag: U,
        originLastModified: P,
        sourceUrl: x,
        shellRevision: Je(x)
      }),
      vendorManifest: M
    };
  }
  async function T(b = "", N = "index.html") {
    const R = String(b || ""), x = await On(R), O = zr(x);
    let L;
    try {
      L = A(R, O, {
        sourceLabel: "local admin index",
        contentType: "text/html"
      });
    } catch (C) {
      throw C && typeof C == "object" && (C.code = String(C.code || "ADMIN_INDEX_UPLOAD_INVALID"), C.status = Ne(C.status, 400)), C;
    }
    const v = Eo(x), M = e.normalizeAdminReleaseVendorManifestRecord(e.buildAdminReleaseVendorManifest(L.html, {
      releaseTag: v,
      sourceUrl: O
    }));
    return {
      version: 1,
      revision: x,
      assetRevision: v,
      sourceUrl: O,
      fileName: (String(N || "index.html").trim().replace(/^.*[\\/]/, "") || "index.html").slice(0, 180),
      uploadedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      bytes: L.bytes,
      html: L.html,
      manifest: M
    };
  }
  async function w(b, N, R, x = null, O = {}) {
    if (Je(b)) {
      const q = typeof O.loadLocalIndexRecord == "function" ? await O.loadLocalIndexRecord() : null;
      if (!q?.html) throw new Error("local admin index upload is missing");
      return E(q.html, N, R, b, {
        sourceLabel: "local admin index",
        contentType: "text/html",
        adminPath: O.adminPath,
        assetRevision: O.assetRevision || q.assetRevision,
        lastModified: q.uploadedAt
      });
    }
    const L = new Headers(), v = e.normalizeEtagToken(x?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_ETAG_HEADER) || ""), M = e.normalizeAdminHttpDateHeader(x?.headers?.get?.(e.ADMIN_REMOTE_SHELL_SOURCE_LAST_MODIFIED_HEADER) || "");
    v && L.set("If-None-Match", v), M && L.set("If-Modified-Since", M);
    const C = await Be(b, {
      method: "GET",
      headers: L
    });
    if (C.status === 304 && x) {
      const q = await De(x, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
      if (q.exceeded) throw new Error("cached remote admin shell too large");
      const de = q.text;
      return {
        storedResponse: t(de, {
          variantEtag: e.normalizeEtagToken(x.headers.get("ETag") || ""),
          lastModified: e.normalizeAdminHttpDateHeader(x.headers.get("Last-Modified") || ""),
          originEtag: v,
          originLastModified: M,
          sourceUrl: b
        }),
        vendorManifest: null
      };
    }
    if (!C.ok) throw new Error(`remote admin shell fetch failed: HTTP ${C.status}`);
    const I = String(C.headers.get("Content-Type") || "").trim().toLowerCase(), P = Number.parseInt(String(C.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(P) && P > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell too large: ${P} bytes`);
    const U = await De(C, e.ADMIN_REMOTE_SHELL_MAX_BYTES), V = U.text, j = U.bytes;
    if (U.exceeded || !V || j > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`remote admin shell payload invalid: ${j} bytes`);
    const K = e.normalizeAdminHttpDateHeader(C.headers.get("Last-Modified") || "") || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toUTCString();
    return E(V, N, R, b, {
      sourceLabel: "remote admin shell",
      contentType: I,
      adminPath: O.adminPath,
      assetRevision: O.assetRevision || O.releaseTag,
      lastModified: K,
      originEtag: C.headers.get("ETag") || ""
    });
  }
  async function D(b, N, R, x, O, L, v, M = {}, C = null) {
    if (!N || typeof N.put != "function") return null;
    const I = await w(x, O, L, v, M), P = I?.storedResponse || null;
    return P ? (await N.put(R, P.clone()), I?.vendorManifest?.entries?.length && await m(N, I.vendorManifest, C), P) : null;
  }
  async function k(b, N, R, x, O, L = {}) {
    return Kt(ct(["admin_remote_shell_cold_load", N.url]), () => Wn(N.url, async () => {
      if (b && typeof b.match == "function") {
        const C = await b.match(N);
        if (C) {
          const I = await e.materializeAdminRemoteShellCachedResponse(C);
          if (I) return {
            storedResponse: I,
            vendorManifest: null,
            loadedFromCache: !0
          };
        }
      }
      const v = await w(R, x, O, null, L), M = v?.storedResponse || null;
      return M ? (b && typeof b.put == "function" && (await b.put(N, M.clone()), v?.vendorManifest?.entries?.length && await m(b, v.vendorManifest, null)), {
        ...v,
        loadedFromCache: !1
      }) : v;
    }));
  }
  return {
    buildAdminRemoteShellStoredResponse: t,
    materializeAdminRemoteShellCachedResponse: r,
    migrateLegacyAdminRemoteShellStoredResponse: a,
    buildAdminRemoteShellClientResponse: n,
    buildAdminReleaseVendorManifestCacheKeyRequest: s,
    buildAdminReleaseVendorAssetCacheKeyRequest: i,
    buildAdminReleaseVendorManifestResponse: c,
    isAcceptedAdminReleaseVendorContentType: l,
    buildAdminReleaseVendorClientResponse: u,
    readAdminReleaseVendorManifestFromCache: d,
    buildAdminReleaseVendorManifestFromSource: f,
    cacheAdminReleaseVendorManifest: m,
    getOrCreateAdminReleaseVendorManifest: p,
    resolveAdminReleaseVendorManifestEntry: h,
    resolveAdminReleaseVendorRouteMatch: g,
    isAdminWarmRoute: y,
    getAdminRemoteShellCachedAt: _,
    shouldRevalidateAdminRemoteShell: S,
    validateAdminShellHtmlSource: A,
    buildAdminShellStoredPayloadFromHtml: E,
    buildAdminLocalIndexUploadRecord: T,
    fetchAdminRemoteShellStoredResponse: w,
    revalidateAdminRemoteShellCache: D,
    loadAdminRemoteShellColdCache: k
  };
}
function sd(o = {}, e = {}) {
  const { indexRepository: t } = o;
  async function r(u, d, f, m = $e(d), p = {}) {
    const h = d?.ASSETS;
    if (!h || typeof h.fetch != "function") return null;
    const g = new URL("/index.html", u.url), y = await h.fetch(new Request(g, {
      method: "GET",
      headers: { Accept: "text/html" }
    }));
    if (!y?.ok) throw new Error(`bundled admin shell fetch failed: HTTP ${Number(y?.status) || 0}`);
    const _ = Number.parseInt(String(y.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(_) && _ > e.ADMIN_REMOTE_SHELL_MAX_BYTES) throw new Error(`bundled admin shell too large: ${_} bytes`);
    const S = await De(y, e.ADMIN_REMOTE_SHELL_MAX_BYTES);
    if (S.exceeded || !S.text) throw new Error(`bundled admin shell payload invalid: ${S.bytes} bytes`);
    const A = e.buildAdminShellState(d, m, p), E = e.buildAdminBootstrapPayload(d, m, p), T = pt(d, p), w = g.toString(), D = e.buildAdminShellStoredPayloadFromHtml(S.text, E, m, w, {
      sourceLabel: "bundled admin shell",
      contentType: y.headers.get("Content-Type") || "text/html",
      adminPath: E.adminPath,
      lastModified: y.headers.get("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT",
      originEtag: y.headers.get("ETag") || ""
    })?.storedResponse || null;
    if (!D) throw new Error("bundled admin shell response is unavailable");
    return await e.patchAdminShellRuntimeStatus(d, {
      shellState: A,
      initHealth: m,
      indexState: T,
      mode: "embedded",
      sourceType: "static_assets",
      routeState: "embedded_active",
      gateState: "shell_ready",
      lifecycleState: "embedded_only",
      embeddedFallbackState: "active",
      remoteCacheState: "bypassed",
      lastFetchStatus: "loaded",
      reason: "served_bundled_admin_shell",
      requestPath: new URL(u.url).pathname,
      indexUrl: w,
      indexUrlSource: "worker_assets",
      effectiveRef: "frontend/dist/index.html",
      effectiveRefType: "static_assets"
    }, f), e.requestMatchesAdminHtmlResponse(u, D) ? e.buildConditionalNotModifiedResponseFromStoredResponse(D, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(D, u.method);
  }
  async function a(u, d, f, m = $e(d), p = {}, h = "index_url_not_configured") {
    const g = pt(d, p), y = e.buildAdminShellState(d, m, p), _ = e.buildAdminBootstrapPayload(d, m, p), S = Vr(_), A = zn(m), E = new URL(u.url).pathname;
    await e.patchAdminShellRuntimeStatus(d, {
      shellState: y,
      initHealth: m,
      indexState: g,
      remoteShellIndexUrl: g.indexUrl,
      mode: "gate",
      sourceType: "setup_gate",
      routeState: "setup_gate",
      remoteCacheState: "bypassed",
      lastFetchStatus: "skipped",
      reason: h,
      requestPath: E
    }, f);
    const T = e.buildAdminIndexSetupContent(_, y, m, p, g), w = e.renderAdminHtmlShell(S, A, T);
    return new Response(u.method === "HEAD" ? null : w, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function n(u) {
    const d = String(new URL(u.url).searchParams.get("setup") || "").trim().toLowerCase();
    return d === "1" || d === "true";
  }
  async function s(u, d, f, m = $e(d), p = {}, h = {}) {
    const g = e.buildAdminShellState(d, m, h), y = e.buildAdminBootstrapPayload(d, m, h), _ = pt(d, h), S = Vr(y), A = zn(m), E = new URL(u.url).pathname, T = {
      ...p,
      shellState: g,
      initHealth: m,
      indexState: _,
      remoteShellIndexUrl: p.remoteShellIndexUrl || g.remoteShellIndexUrl || _.indexUrl || "",
      mode: "remote_error",
      sourceType: p.sourceType || "remote_error",
      routeState: p.routeState || "remote_error",
      remoteCacheState: p.remoteCacheState || "bypassed",
      lastFetchStatus: p.lastFetchStatus || "failed",
      reason: p.reason || "remote_shell_render_failed",
      requestPath: E
    }, w = e.buildAdminRemoteShellErrorContent(y, g, m, T);
    await e.patchAdminShellRuntimeStatus(d, T, f);
    const D = e.renderAdminHtmlShell(S, A, w);
    return new Response(u.method === "HEAD" ? null : D, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  async function i(u, d, f, m = $e(d), p = e.resolveAdminShellIndexUrl(d), h = {}) {
    const g = ur(), y = e.buildAdminShellState(d, m, h), _ = e.buildAdminBootstrapPayload(d, m, h), S = pt(d, h), A = {
      releaseTag: S.assetRevision || S.releaseTag,
      assetRevision: S.assetRevision || S.releaseTag,
      adminPath: _.adminPath,
      ...S.isLocalUpload ? { loadLocalIndexRecord: () => t.getAdminIndexUploadRecord(t.getKV(d), S.localUploadRevision) } : {}
    }, E = e.buildAdminRemoteShellCacheKeyRequest(u, p, _), T = e.buildAdminRemoteShellLegacyCacheKeyRequest(u, p), w = new URL(u.url).pathname;
    if (g && typeof g.match == "function") {
      const N = await Kt(ct(["admin_remote_shell_cache_read", E.url]), async () => {
        const O = await g.match(E);
        if (O) {
          const M = await e.materializeAdminRemoteShellCachedResponse(O);
          if (M) return {
            storedResponse: M,
            legacyCacheMigrated: !1
          };
        }
        const L = await g.match(T);
        if (!L) return null;
        const v = await pe(e.migrateLegacyAdminRemoteShellStoredResponse(L, p, _, m), "admin.remote_shell_legacy_cache_read", {
          path: w,
          remoteShellIndexUrl: p
        }, null);
        return v ? await Wn(E.url, async () => {
          const M = await g.match(E);
          if (M) {
            const C = await e.materializeAdminRemoteShellCachedResponse(M);
            if (C) return {
              storedResponse: C,
              legacyCacheMigrated: !1
            };
          }
          return typeof g.put == "function" && await pe(g.put(E, v.clone()), "admin.remote_shell_legacy_cache_migrate", {
            path: w,
            remoteShellIndexUrl: p
          }, null), {
            storedResponse: v,
            legacyCacheMigrated: !0
          };
        }) : null;
      }), R = N === null ? null : N.storedResponse.clone(), x = N !== null && N.legacyCacheMigrated;
      if (R) {
        const O = e.shouldRevalidateAdminRemoteShell(R);
        let L = null;
        if (O) {
          const C = R.clone();
          L = Kt(ct(["admin_remote_shell_revalidate", E.url]), async () => pe(Wn(E.url, () => e.revalidateAdminRemoteShellCache(u, g, E, p, _, m, C, A, f)), "admin.remote_shell_revalidate", {
            path: w,
            remoteShellIndexUrl: p
          }, null));
        }
        const v = e.patchAdminShellRuntimeStatus(d, {
          shellState: y,
          initHealth: m,
          indexState: S,
          remoteShellIndexUrl: p,
          mode: "remote",
          sourceType: x ? "remote_legacy_cache" : "remote_cache",
          routeState: "remote_active",
          remoteCacheState: x ? O ? "legacy_stale_hit" : "legacy_hit" : O ? "stale_hit" : "hit",
          revalidateDue: O,
          lastFetchStatus: "cached",
          reason: x ? O ? "migrated_legacy_remote_shell_and_scheduled_revalidate" : "migrated_legacy_remote_shell" : O ? "served_cached_remote_shell_and_scheduled_revalidate" : "served_cached_remote_shell",
          requestPath: w,
          throttleStableWrites: !0
        }, null), M = L ? Promise.all([L, v]) : v;
        return f && typeof f.waitUntil == "function" && f.waitUntil(M), e.requestMatchesAdminHtmlResponse(u, R) ? e.buildConditionalNotModifiedResponseFromStoredResponse(R, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(R, u.method);
      }
    }
    const D = await e.loadAdminRemoteShellColdCache(g, E, p, _, m, A), k = (D?.storedResponse ? {
      ...D,
      storedResponse: D.storedResponse.clone()
    } : D)?.storedResponse || null;
    if (!k) throw new Error("remote admin shell payload missing");
    const b = Kt(ct(["admin_remote_shell_cold_status", E.url]), () => e.patchAdminShellRuntimeStatus(d, {
      shellState: y,
      initHealth: m,
      indexState: S,
      remoteShellIndexUrl: p,
      mode: "remote",
      sourceType: D?.loadedFromCache ? "remote_cache" : "remote_fetch",
      routeState: "remote_active",
      remoteCacheState: D?.loadedFromCache ? "filled_while_waiting" : "miss",
      lastFetchStatus: D?.loadedFromCache ? "cached" : "fetched",
      reason: D?.loadedFromCache ? "served_cache_filled_while_waiting" : "fetched_remote_shell_index",
      requestPath: w
    }, null));
    return f && typeof f.waitUntil == "function" ? f.waitUntil(b) : await b, e.requestMatchesAdminHtmlResponse(u, k) ? e.buildConditionalNotModifiedResponseFromStoredResponse(k, e.ADMIN_REMOTE_SHELL_BROWSER_CACHE_CONTROL) : e.buildAdminRemoteShellClientResponse(k, u.method);
  }
  function c(u = "Release vendor asset unavailable", d = 502) {
    const f = new Headers({
      "Content-Type": "text/plain;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(f), new Response(String(u || "Release vendor asset unavailable"), {
      status: d,
      headers: f
    });
  }
  async function l(u, d, f, m = null, p = {}) {
    const h = mt(m?.releaseTag), g = String(m?.assetKey || "").trim();
    if (!h || !g) return c("Release vendor asset not found", 404);
    const y = ur(), _ = Cu(h);
    if (!_) return c("Local index vendor asset not found", 404);
    const S = _ ? await t.getAdminIndexUploadRecord(t.getKV(d), _) : null;
    if (_ && !S) return c("Local index vendor asset not found", 404);
    const A = S?.sourceUrl || "";
    if (!A) return c("Release vendor asset not found", 404);
    let E = null;
    S?.manifest ? (E = await e.readAdminReleaseVendorManifestFromCache(y, h, A), E || (E = await e.cacheAdminReleaseVendorManifest(y, S.manifest, f))) : E = await e.getOrCreateAdminReleaseVendorManifest(y, h, A, f);
    const T = e.resolveAdminReleaseVendorManifestEntry(E, g);
    if (!T?.upstreamUrl) return c("Release vendor asset not found", 404);
    const w = e.isMutableJsdelivrGithubAssetUrl(T.upstreamUrl), D = w ? e.ADMIN_RELEASE_VENDOR_MUTABLE_CACHE_CONTROL : e.ADMIN_RELEASE_VENDOR_CACHE_CONTROL, k = e.buildAdminReleaseVendorAssetCacheKeyRequest(h, g, T.upstreamUrl);
    if (!w && y && typeof y.match == "function") {
      const I = await y.match(k);
      if (I)
        return e.requestMatchesAdminHtmlResponse(u, I) ? e.buildConditionalNotModifiedResponseFromStoredResponse(I, D) : e.buildAdminReleaseVendorClientResponse(I, u.method);
    }
    let b = null;
    try {
      b = await Be(T.upstreamUrl, {
        method: "GET",
        headers: { Accept: T.assetKind === "css" ? "text/css, text/plain;q=0.9, */*;q=0.1" : "application/javascript, text/javascript, text/plain;q=0.9, */*;q=0.1" }
      });
    } catch (I) {
      return c(`Release vendor asset fetch failed: ${String(I?.message || I || "unknown_error").trim() || "unknown_error"}`, 502);
    }
    if (!b.ok) return c(b.status === 404 ? "Release vendor asset not found" : `Release vendor asset fetch failed (HTTP ${b.status})`, b.status === 404 ? 404 : 502);
    const N = String(b.headers.get("Content-Type") || "").trim();
    if (!e.isAcceptedAdminReleaseVendorContentType(N, T.assetKind)) return c(`Release vendor asset content-type invalid: ${N || "unknown"}`, 502);
    const R = Number.parseInt(String(b.headers.get("Content-Length") || ""), 10);
    if (Number.isFinite(R) && R > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset too large: ${R} bytes`, 502);
    const x = await Ys(b, e.ADMIN_RELEASE_VENDOR_MAX_BYTES), O = x.bytes;
    if (x.exceeded || !O || O > e.ADMIN_RELEASE_VENDOR_MAX_BYTES) return c(`Release vendor asset payload invalid: ${O} bytes`, 502);
    const L = new Headers({ "Cache-Control": D }), v = e.normalizeEtagToken(b.headers.get("ETag") || ""), M = e.normalizeAdminHttpDateHeader(b.headers.get("Last-Modified") || "");
    N && L.set("Content-Type", N), v && L.set("ETag", e.formatAdminHtmlEtag(v)), M && L.set("Last-Modified", M), L.set(e.ADMIN_RELEASE_VENDOR_CACHED_AT_HEADER, String(H())), L.set(e.ADMIN_RELEASE_VENDOR_SOURCE_HASH_HEADER, ne(T.upstreamUrl));
    const C = new Response(x.bodyBytes, {
      status: 200,
      headers: L
    });
    if (!w && y && typeof y.put == "function") {
      const I = pe(y.put(k, C.clone()), "admin.release_vendor_cache_write", {
        releaseTag: h,
        assetKey: g
      }, null);
      f && typeof f.waitUntil == "function" ? f.waitUntil(I) : await I;
    }
    return e.requestMatchesAdminHtmlResponse(u, C) ? e.buildConditionalNotModifiedResponseFromStoredResponse(C, D) : e.buildAdminReleaseVendorClientResponse(C, u.method);
  }
  return {
    renderBundledAdminPage: r,
    renderAdminIndexSetupPage: a,
    isAdminIndexSetupForced: n,
    renderAdminRemoteShellErrorPage: s,
    renderRemoteAdminPage: i,
    buildAdminReleaseVendorErrorResponse: c,
    renderAdminReleaseVendorAsset: l
  };
}
function id(o = {}) {
  return {
    ...ni,
    ...sa,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0",
    ...o
  };
}
function ee(o, e = 200, t = {}) {
  return new Response(JSON.stringify(o), {
    status: e,
    headers: id(t)
  });
}
function z(o, e, t = 400, r = null, a = {}) {
  const n = {
    ok: !1,
    error: {
      code: o,
      message: e
    }
  };
  return r != null && (n.error.details = r), ee(n, t, a);
}
async function cd(o) {
  const e = new Headers(o.headers || {});
  if (e.set("Content-Type", "application/json; charset=utf-8"), e.set("Cache-Control", "no-store, max-age=0"), Object.entries(sa).forEach(([c, l]) => e.set(c, l)), Ce(e), o.ok) return new Response(o.body, {
    status: o.status,
    headers: e
  });
  const t = await De(o, sn);
  let r = null;
  const a = t.text;
  try {
    r = JSON.parse(a);
  } catch {
  }
  const n = r?.error?.code || (typeof r?.error == "string" ? r.error.toUpperCase() : `HTTP_${o.status}`), s = r?.error?.message || r?.message || (typeof r?.error == "string" ? r.error : a || o.statusText || "request_failed"), i = r?.error?.details ?? r?.details ?? null;
  return z(n, s, o.status || 500, i);
}
function Pr(o = "") {
  return String(o || "").trim().toLowerCase() === "simplified" ? "simplified" : "legacy";
}
function Hi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "balanced" ? "balanced" : e === "aggressive" ? "aggressive" : "compat";
}
function Do(o = {}) {
  const e = o?.enableH2 === !0, t = o?.enableH3 === !0;
  return !e && !t ? "compat" : o?.peakDowngrade === !1 ? "aggressive" : "balanced";
}
var $i = Object.freeze([
  {
    kind: "summary",
    configKey: "tgDailyReportSummaryEnabled"
  },
  {
    kind: "kv",
    configKey: "tgDailyReportKvEnabled"
  },
  {
    kind: "d1",
    configKey: "tgDailyReportD1Enabled"
  }
]);
function Bi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "summary" || e === "kv" || e === "d1" ? e : "";
}
function ld(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : [o]) {
    const a = Bi(r);
    !a || t.has(a) || (t.add(a), e.push(a));
  }
  return e;
}
function ud(o = {}) {
  return $i.some(({ configKey: e }) => ua(o, e));
}
function Ki(o = {}, e = o) {
  const t = o && typeof o == "object" ? o : {}, r = e && typeof e == "object" ? e : {};
  return t.tgDailyReportEnabled === !0 && !ud(r);
}
function dd(o = {}, e = {}) {
  const t = o && typeof o == "object" ? o : {};
  return Ki(t, e && typeof e == "object" ? e : {}) ? (t.tgDailyReportSummaryEnabled = !0, t.tgDailyReportKvEnabled = !1, t.tgDailyReportD1Enabled = !1, t) : (t.tgDailyReportSummaryEnabled = t.tgDailyReportSummaryEnabled === !0, t.tgDailyReportKvEnabled = t.tgDailyReportKvEnabled === !0, t.tgDailyReportD1Enabled = t.tgDailyReportD1Enabled === !0, t);
}
function zi(o = {}, e = o, t = {}) {
  const r = o && typeof o == "object" ? o : {}, a = ld(t?.reportKinds);
  if (a.length > 0) return a;
  const n = $i.filter(({ configKey: s }) => r[s] === !0).map(({ kind: s }) => s);
  return n.length > 0 ? n : t?.fallbackAllWhenLegacy === !0 && Ki(r, e) ? ["summary"] : [];
}
function fd(o = {}) {
  return Pr(o?.routingDecisionMode);
}
function xr(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "legacy" || e === "simplified" ? e : "inherit";
}
function md(o = {}, e = {}) {
  const t = xr(o?.routingDecisionMode);
  return t === "inherit" ? fd(e) : t;
}
function ir(o) {
  const e = String(o ?? "").trim();
  if (!e) return "";
  if (!/^\d{1,5}$/.test(e)) return null;
  const t = Number(e);
  return !Number.isInteger(t) || t < 1 || t > 65535 ? null : String(t);
}
function pd(o) {
  return o === "http:" ? "80" : o === "https:" ? "443" : "";
}
function gd(o) {
  const e = String(o?.username || ""), t = String(o?.password || "");
  return !e && !t ? "" : `${e}${t ? `:${t}` : ""}@`;
}
function hd(o, e = "") {
  if (!(o instanceof URL)) return "";
  const t = String(o.protocol || "").trim().toLowerCase();
  if (!["http:", "https:"].includes(t)) return "";
  const r = ir(e);
  if (r === null) return "";
  const a = String(o.hostname || "").trim();
  if (!a) return "";
  const n = String(o.pathname || "/") || "/", s = String(o.search || ""), i = String(o.hash || "");
  return `${t}//${gd(o)}${a}${r ? `:${r}` : ""}${n}${s}${i}`.replace(/\/$/, "");
}
function ls(o, e = "", t = "") {
  const r = String(o || "").trim();
  if (!r) return null;
  try {
    const a = new URL(r);
    if (!["http:", "https:"].includes(a.protocol)) return null;
    const n = ir(a.port), s = ir(e), i = ir(t);
    return n === null || s === null || i === null ? null : hd(a, n || s || i || pd(a.protocol)) || null;
  } catch {
    return null;
  }
}
function yd(o = "") {
  const e = String(o || "").trim();
  if (!e) return !1;
  try {
    const t = new URL(e);
    if (!["http:", "https:"].includes(t.protocol)) return !1;
    const r = e.match(/^[a-z][a-z0-9+.-]*:\/\/([^/?#]*)/i);
    if (!r) return !1;
    let a = String(r[1] || "");
    const n = a.lastIndexOf("@");
    if (n >= 0 && (a = a.slice(n + 1)), !a) return !1;
    if (a.startsWith("[")) {
      const s = a.indexOf("]");
      return s < 0 ? !1 : /^:\d+$/.test(a.slice(s + 1));
    }
    return /:\d+$/.test(a);
  } catch {
    return !1;
  }
}
function us(o = "") {
  const e = String(o || "").trim();
  if (!e) return !1;
  try {
    const t = new URL(e);
    return ["http:", "https:"].includes(t.protocol) ? !yd(e) : !1;
  } catch {
    return !1;
  }
}
function _e(o) {
  return JSON.stringify(String(o ?? ""));
}
function Pt(o = "/") {
  const e = J(o || "/");
  return e === "/" ? "" : e.replace(/\/+$/, "");
}
function pn(o) {
  try {
    const e = o instanceof URL ? o : new URL(String(o || ""));
    if (!["http:", "https:"].includes(e.protocol)) return null;
    const t = String(e.origin || "").trim();
    if (!t) return null;
    const r = Pt(e.pathname);
    return {
      targetUrl: e,
      originText: t,
      normalizedBasePath: r,
      absoluteBasePrefix: `${t}${r}`
    };
  } catch {
    return null;
  }
}
function je(o) {
  return Ze(o) ? String(o.absoluteBasePrefix || o.originText || "").trim() : "";
}
function Sd(o = []) {
  return ne(Z((Array.isArray(o) ? o : []).map((e) => je(e)).filter(Boolean)));
}
function _d(o = []) {
  return new Set((Array.isArray(o) ? o : []).map((e) => je(e)).filter(Boolean)).size;
}
function Da(o = "", e = F.Defaults.HedgeProbePath) {
  const t = String(o || e || "").trim() || String(e || "/emby/system/ping").trim() || "/emby/system/ping";
  try {
    return J(new URL(t, "https://hedge-probe.invalid").pathname || "/");
  } catch {
    return J(t);
  }
}
function ca(o = "") {
  const e = String(o || "").trim();
  return e ? Da(e, F.Defaults.HedgeProbePath) : "";
}
function Ze(o) {
  return !!o && typeof o == "object" && o.targetUrl instanceof URL && typeof o.originText == "string" && typeof o.normalizedBasePath == "string" && typeof o.absoluteBasePrefix == "string";
}
function ds(o = "") {
  const e = String(o || "");
  return e ? e.startsWith("?") ? e : `?${e}` : "";
}
function bd(o = "GET", e = {}, t = {}) {
  const r = String(o || "GET").toUpperCase();
  return !(r !== "GET" && r !== "HEAD" || e?.isSegment !== !0 || e?.isWsUpgrade === !0 || t.playbackRelayTargetUrl instanceof URL || t.protocolFallbackRetry === !0 || t.isExternalRedirect === !0);
}
var No = ["proxyMode", "mode"], Io = [
  "direct",
  "sourceDirect",
  "directSource",
  "direct2xx"
], Ed = [
  "wangpanMode",
  "videoThrottling",
  "interceptMs"
], Wi = "__playback-relay", Gi = "__pb_target", Gn = "__pb_abs", jn = Object.freeze({
  main: "",
  proxy_a: "__proxy-a",
  proxy_b: "__proxy-b"
});
function Td(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, t = [];
  let r = !1;
  const a = ir(e.port), n = Array.isArray(e.lines) ? e.lines.reduce((i, c) => i + (ir(c?.port) ? 1 : 0), 0) : 0, s = Array.isArray(e.lines) && e.lines.length ? e.lines.reduce((i, c) => ir(c?.port) || a ? i : i + (us(c?.target) ? 1 : 0), 0) : a ? 0 : String(e.target || "").split(",").map((i) => i.trim()).filter(Boolean).reduce((i, c) => i + (us(c) ? 1 : 0), 0);
  for (const i of No) {
    if (!Object.prototype.hasOwnProperty.call(e, i)) continue;
    t.push(i);
    const c = String(e[i] || "").trim().toLowerCase();
    [
      "direct",
      "source-direct",
      "origin-direct",
      "node-direct"
    ].includes(c) && (r = !0);
  }
  for (const i of Io)
    Object.prototype.hasOwnProperty.call(e, i) && (t.push(i), e[i] === !0 && (r = !0));
  for (const i of Ed)
    Object.prototype.hasOwnProperty.call(e, i) && t.push(i);
  return {
    legacyKeysPresent: Zt(t),
    shouldAddToSourceDirectNodes: r,
    topLevelPortPresent: a !== null && a !== "",
    linePortCount: n,
    defaultPortNodePresent: s > 0,
    defaultPortLineCount: s
  };
}
function Rd(o, e = {}) {
  const t = Hr(o);
  return {
    mode: t,
    forceVideoDirect: t === "direct",
    forceVideoProxy: t === "proxy"
  };
}
function Ad(o = {}) {
  return si(o?.defaultMediaAuthMode);
}
function Va(o = {}) {
  return ua(o, "defaultPlaybackInfoMode") ? Gt(o?.defaultPlaybackInfoMode) : Reflect.get(o, "playbackInfoAutoProxy") !== void 0 ? Reflect.get(o, "playbackInfoAutoProxy") !== !1 ? "rewrite" : "passthrough" : Reflect.get(o, "playbackInfoBlockWangpanProxy") !== void 0 ? "rewrite" : F.Defaults.DefaultPlaybackInfoMode;
}
function Cd(o = {}) {
  return Gt(Va(o));
}
function wd(o = {}) {
  return ho(o?.defaultRealClientIpMode);
}
function Ld(o = {}, e = {}) {
  const t = o || {}, r = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "mediaAuthMode") ? Bt(t.mediaAuthMode) : "auto";
  return r === "inherit" ? Ad(e) : r;
}
function Dd(o = {}, e = {}) {
  const t = o || {}, r = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "playbackInfoMode") ? Nr(t.playbackInfoMode) : "inherit";
  return r === "inherit" ? Cd(e) : r;
}
function Nd(o = {}, e = {}) {
  const t = o || {}, r = o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "realClientIpMode") ? Dr(t.realClientIpMode) : "forward";
  return r === "inherit" ? wd(e) : r;
}
function Id(o = {}, e = {}) {
  const t = o || {};
  return (o && typeof o == "object" && Object.prototype.hasOwnProperty.call(o, "hedgeProbePath") ? ca(t.hedgeProbePath) : "") || Da(e?.hedgeProbePath, F.Defaults.HedgeProbePath);
}
function Md(o) {
  const e = ho(typeof o == "string" ? o : o?.realClientIpMode);
  return e === "forward" ? "full" : e === "strip" ? "real-ip-only" : e === "disable" ? "none" : "full";
}
function ji(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "proxy_a" || e === "__proxy-a" ? "proxy_a" : e === "proxy_b" || e === "__proxy-b" ? "proxy_b" : "main";
}
function Pd(o = "main") {
  return jn[ji(o)] || "";
}
function Vi(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? e === jn.proxy_a ? "proxy_a" : e === jn.proxy_b ? "proxy_b" : "main" : "main";
}
function oa(o = "") {
  const e = String(o || "");
  if (!e) return {
    linkVariant: "main",
    remaining: "",
    needsTrailingSlashRedirect: !1
  };
  const t = e.startsWith("/") ? e : "/" + e, r = t.split("/"), a = Vi(It(r[1] || ""));
  return a === "main" ? {
    linkVariant: a,
    remaining: J(t),
    needsTrailingSlashRedirect: !1
  } : {
    linkVariant: a,
    remaining: J("/" + r.slice(2).join("/")),
    needsTrailingSlashRedirect: r.length === 2 && !t.endsWith("/")
  };
}
function Na(o = {}) {
  return o.ENI_KV || o.KV || o.EMBY_KV || o.EMBY_PROXY || null;
}
function xd(o = {}) {
  return o.DB || o.D1 || o.PROXY_LOGS || null;
}
var Od = 16 * 1024;
async function gt(o, e) {
  const t = new TextEncoder(), r = Date.now();
  let a = te.CryptoKeyCache.get(o);
  for ((!a || a.exp <= r) && (a = {
    key: await vn().importKey("raw", t.encode(o), {
      name: "HMAC",
      hash: "SHA-256"
    }, !1, ["sign"]),
    exp: r + F.Defaults.CryptoKeyCacheTTL * 1e3
  }), te.CryptoKeyCache.has(o) && te.CryptoKeyCache.delete(o), te.CryptoKeyCache.set(o, a); te.CryptoKeyCache.size > F.Defaults.CryptoKeyCacheMax; ) {
    const s = te.CryptoKeyCache.keys().next().value;
    if (s === void 0) break;
    te.CryptoKeyCache.delete(s);
  }
  const n = await vn().sign("HMAC", a.key, t.encode(e));
  return btoa(String.fromCharCode(...new Uint8Array(n))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var vd = class {
  constructor({ actionHandlers: o, bindingService: e, configReader: t, repository: r, requestModel: a, shellService: n }) {
    this.actionHandlers = Object.freeze({ ...o }), this.bindingService = e, this.configReader = t, this.repository = r, this.requestModel = a, this.shellService = n, this.actionAliases = Object.freeze({
      import: "saveOrImport",
      save: "saveOrImport"
    }), this.#t();
  }
  async handle(o, e, t) {
    const r = this.#c(o, e), { requestHost: a, configuredHost: n, configuredLegacyHost: s } = r, i = o.method, c = i === "GET" || i === "HEAD";
    if (c && r.pathnameLower === "/favicon.ico") return this.#_(i);
    const l = await this.configReader.getRuntimeConfig(e), u = !!(s && s !== n && a === s), d = l.enableHostPrefixProxy === !0 && !!n && !u, f = d ? _o(a, n) : null, m = !!(d && a !== n && a.endsWith(`.${n}`));
    if (f || m) return null;
    if (i === "GET" && r.normalizedPathname === "/") return this.#m(e, r.initHealth);
    const p = c ? this.#b(r.normalizedPathname, r.adminPath) : null;
    if (p)
      return await this.#a(o, e) ? this.#y(o, e, t, p, l) : this.#T("Unauthorized", 401);
    if (c && this.#E(r.normalizedPathname, r.adminPath))
      return await this.#a(o, e) ? this.#S(o, e, r.initHealth, l) : this.#g(o, r.adminLoginPath);
    if (c && Ar(r.pathnameLower, r.adminLoginPathLower))
      return await this.#a(o, e) ? this.#g(o, r.adminPath) : this.#p(o, e, r.initHealth);
    if (c && Ar(r.pathnameLower, r.adminPathLower))
      return await this.#a(o, e) ? this.#h(o, e, t, r.initHealth) : this.#g(o, r.adminLoginPath);
    if (i === "OPTIONS" && this.#r(r)) return this.#i(o, e, null);
    if (i === "POST" && (Ar(r.pathnameLower, r.adminLoginPathLower) || this.#n(r))) return this.#l(o, e);
    if (i !== "POST" || !Ar(r.pathnameLower, r.adminPathLower)) return null;
    if (!await this.#a(o, e)) return z("UNAUTHORIZED", "未授权", 401);
    try {
      return await cd(await this.#s(o, e, t));
    } catch (h) {
      const g = vl(h, {
        code: "INTERNAL_ERROR",
        message: "Server Error",
        status: 500
      });
      return Ae("admin_api.unhandled_error", h, {
        path: r.pathnameLower,
        method: i,
        responseCode: g.code,
        responseStatus: g.status
      }, "error"), z(g.code, g.message, g.status, g.details);
    }
  }
  #t() {
    for (const [o, e] of Object.entries(this.actionHandlers)) {
      if (!this.#e(o)) throw new TypeError("Admin action names cannot be empty");
      if (typeof e != "function") throw new TypeError(`Admin action ${o} is not a function`);
    }
    for (const [o, e] of Object.entries(this.actionAliases)) if (!this.actionHandlers[e]) throw new Error(`Admin action alias ${o} targets missing action ${e}`);
  }
  #e(o) {
    return String(o || "").trim();
  }
  #o(o) {
    const e = this.#e(o), t = this.actionAliases[e] || e;
    return this.actionHandlers[t] || null;
  }
  async #s(o, e, t) {
    const r = this.bindingService.getKV(e);
    if (!r) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
    let a;
    try {
      const i = await De(o, Mi);
      if (i.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
      a = JSON.parse(i.text || "");
    } catch {
      return z("INVALID_JSON", "请求 JSON 无效", 400);
    }
    const n = this.requestModel.normalizeAdminActionRequest(a);
    if (!n) return z("INVALID_REQUEST", "请求体必须是 JSON 对象", 400);
    const s = this.#o(n.action);
    return s ? s(n.data, {
      action: n.action,
      meta: n.meta,
      request: o,
      env: e,
      ctx: t,
      kv: r,
      db: this.bindingService.getDB(e)
    }) : z("INVALID_ACTION", "未知的管理动作", 400, { action: n.action || null });
  }
  #n(o) {
    return o.adminPathLower === "/admin" && o.pathnameLower === "/api/auth/login" && o.root === "api" && o.segments[1] === "auth" && o.segments[2] === "login";
  }
  #r(o) {
    return vi(o.pathnameLower, o.adminPathLower) || Ar(o.pathnameLower, o.adminLoginPathLower) || this.#n(o);
  }
  #i(o, e, t, r = 200) {
    return this.shellService.buildEdgeCorsResponse(La(e, o), t, r, { mergeOriginVary: !0 });
  }
  #c(o, e) {
    const t = new URL(o.url), r = re(t.hostname), a = J(t.pathname), n = a.toLowerCase(), s = it(e), i = s.toLowerCase(), c = dn(s), l = c.toLowerCase(), u = Ui(e, {
      adminPath: s,
      loginPath: c
    }), d = a.split("/").filter(Boolean), f = d[0] || "", m = It(f).toLowerCase();
    return {
      initHealth: u,
      requestUrl: t,
      requestHost: r,
      configuredHost: ze(e),
      configuredLegacyHost: Kr(e),
      normalizedPathname: a,
      pathnameLower: n,
      adminPath: s,
      adminPathLower: i,
      adminLoginPath: c,
      adminLoginPathLower: l,
      segments: d,
      rootRaw: f,
      root: m
    };
  }
  async #l(o, e) {
    const t = o.headers.get("cf-connecting-ip") || "unknown", r = this.repository.getDB(e), a = Zu(e), n = await this.configReader.getRuntimeConfig(e), s = Math.max(1, parseInt(n.jwtExpiryDays) || 30) * 86400;
    try {
      const i = await pe(this.repository.getAuthFailureEntry(r, t), "auth.login.read_auth_failure", { ip: t }, null), c = Math.max(0, Number(i?.failCount) || 0);
      if (c >= F.Defaults.MaxLoginAttempts) return z("TOO_MANY_ATTEMPTS", "账户已锁定，请稍后再试", 429);
      let l = "";
      if ((o.headers.get("content-type") || "").includes("application/json")) {
        const d = await De(o, Od);
        if (d.exceeded) return z("REQUEST_TOO_LARGE", "请求体过大", 413);
        const f = JSON.parse(d.text || "{}");
        l = typeof f.password == "string" ? f.password : "";
      }
      if (!e.JWT_SECRET) return z("SERVER_MISCONFIGURED", "JWT_SECRET 未配置", 503);
      if (!e.ADMIN_PASS) return z("SERVER_MISCONFIGURED", "ADMIN_PASS 未配置", 503);
      if (l && l === e.ADMIN_PASS) {
        i && await pe(this.repository.deleteAuthFailureEntry(r, t), "auth.login.clear_auth_failure", { ip: t }, !1);
        const d = await this.#u(e.JWT_SECRET, s);
        return ee({
          ok: !0,
          expiresIn: s
        }, 200, { "Set-Cookie": `auth_token=${d}; Path=${a}; Max-Age=${s}; HttpOnly; Secure; SameSite=Strict` });
      }
      const u = c + 1;
      return await pe(this.repository.upsertAuthFailureEntry(r, t, {
        failCount: u,
        expiresAt: H() + F.Defaults.LoginLockDuration * 1e3
      }), "auth.login.write_auth_failure", {
        ip: t,
        nextFailCount: u
      }, null), ee({
        ok: !1,
        error: {
          code: "INVALID_PASSWORD",
          message: "密码错误"
        },
        remain: Math.max(0, F.Defaults.MaxLoginAttempts - u)
      }, 401);
    } catch (i) {
      return z("INVALID_REQUEST", "请求无效", 400, { reason: i.message });
    }
  }
  async #a(o, e) {
    try {
      const t = e.JWT_SECRET;
      if (!t) return !1;
      const r = o.headers.get("Authorization") || "";
      let a = r.startsWith("Bearer ") ? r.slice(7) : null;
      if (!a) {
        const n = (o.headers.get("Cookie") || "").match(/(?:^|;\s*)auth_token=([^;]+)/);
        a = n ? n[1] : null;
      }
      return a ? await this.#d(a, t) : !1;
    } catch {
      return !1;
    }
  }
  async #u(o, e) {
    const t = btoa(JSON.stringify({
      alg: "HS256",
      typ: "JWT"
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), r = btoa(JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + e
    })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${t}.${r}.${await this.#f(o, `${t}.${r}`)}`;
  }
  async #d(o, e) {
    const t = o.split(".");
    if (t.length !== 3 || t[2] !== await this.#f(e, `${t[0]}.${t[1]}`)) return !1;
    try {
      return JSON.parse(atob(t[1].replace(/-/g, "+").replace(/_/g, "/"))).exp > Math.floor(Date.now() / 1e3);
    } catch {
      return !1;
    }
  }
  async #f(o, e) {
    return gt(o, e);
  }
  #m(o, e) {
    return this.shellService.renderLandingPage(o, e);
  }
  #p(o, e, t) {
    return this.shellService.renderAdminLoginPage(o, e, t);
  }
  #h(o, e, t, r) {
    return this.shellService.renderAdminPage(o, e, t, r);
  }
  #y(o, e, t, r, a) {
    return this.shellService.renderAdminReleaseVendorAsset(o, e, t, r, a);
  }
  #S(o, e, t, r) {
    return this.shellService.renderAdminWarmResponse(o, e, t, r);
  }
  #_(o) {
    return this.shellService.renderFaviconResponse(o);
  }
  #b(o, e) {
    return this.shellService.resolveAdminReleaseVendorRouteMatch(o, e);
  }
  #E(o, e) {
    return this.shellService.isAdminWarmRoute(o, e);
  }
  #g(o, e) {
    return this.shellService.buildRequestPathRedirectResponse(o, e);
  }
  #T(...o) {
    return this.shellService.buildAdminReleaseVendorErrorResponse(...o);
  }
};
function qi(o = "", e = "") {
  const t = String(o || "").trim().toLowerCase(), r = String(e || "").trim().toLowerCase();
  return r === "image" || t.includes("/images/") || t.includes("/emby/covers/") || /\.(jpe?g|png|webp|gif)(?:$|[?#])/.test(t) ? "image_poster" : t.includes("/sessions/playing") || t.includes("/playbackinfo") ? "playback_info" : t.includes("/users/authenticate") ? "auth" : t.includes("/items/") || t.includes("/shows/") || t.includes("/movies/") || t.includes("/users/") ? "media_metadata" : r || "api";
}
function Fd(o = "", e = "") {
  return qi(o, e) === "playback_info";
}
function Ud(o = "", e = "") {
  const t = String(o || "").trim().toLowerCase(), r = String(e || "").trim().toLowerCase();
  return r === "stream" || r === "segment" || r === "manifest" ? !0 : /\/stream(?:$|[/?])/.test(t) || t.includes("/master.m3u8") || /\/videos\/[^/]+\/(?:original|download|file)(?:$|[/?])/.test(t) || /\/items\/[^/]+\/download(?:$|[/?])/.test(t) || t.includes("static=true") || t.includes("download=true");
}
function Xi(o) {
  return String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_") === "poster_manifest" ? "poster_manifest" : "poster";
}
function Yi(o) {
  const e = String(o || "").trim().toLowerCase();
  return e === "fts" ? "fts" : e === "like" ? "like" : F.Defaults.LogSearchMode;
}
function Ji(o) {
  return String(o || "").trim().toLowerCase() === "error" ? "error" : F.Defaults.LogWriteMode;
}
function kd(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "playback" || e === "playback_info" ? "playback_info" : e === "image" ? "image" : e === "api" ? "api" : e === "auth" ? "auth" : "";
}
function Hd(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "4xx" || e === "status_4xx" ? "4xx" : e === "5xx" || e === "status_5xx" ? "5xx" : "";
}
function fs(o) {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "direct" ? "direct" : e === "proxy" || e === "proxied" ? "proxy" : "";
}
function $d(o = "") {
  const e = String(o || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return e === "connect_timeout" ? "connect_timeout" : e === "idle_timeout" ? "idle_timeout" : e === "tls_handshake_failed" ? "tls_handshake_failed" : e === "http_version_fallback" ? "http_version_fallback" : e === "redirect_loop" ? "redirect_loop" : e === "redirect_limit_exceeded" ? "redirect_limit_exceeded" : e === "range_unsatisfied" ? "range_unsatisfied" : e === "upstream_4xx" ? "upstream_4xx" : e === "upstream_5xx" ? "upstream_5xx" : e === "unknown_fetch_error" ? "unknown_fetch_error" : "";
}
var Bd = Object.freeze({
  400: Object.freeze({
    code: "bad_request",
    text: "请求格式无效或参数不符合上游要求"
  }),
  401: Object.freeze({
    code: "unauthorized",
    text: "请求缺少有效身份凭证，或当前登录态已失效"
  }),
  403: Object.freeze({
    code: "forbidden",
    text: "请求已被识别，但当前账号、策略或源站规则拒绝访问"
  }),
  404: Object.freeze({
    code: "not_found",
    text: "请求路径或目标资源不存在"
  }),
  405: Object.freeze({
    code: "method_not_allowed",
    text: "当前请求方法不被目标接口允许"
  }),
  429: Object.freeze({
    code: "too_many_requests",
    text: "请求频率超过当前限流阈值，服务暂时拒绝继续处理"
  }),
  500: Object.freeze({
    code: "internal_server_error",
    text: "源站或代理在处理请求时发生内部错误"
  }),
  501: Object.freeze({
    code: "not_implemented",
    text: "源站或上游链路尚未实现当前请求所需能力"
  }),
  502: Object.freeze({
    code: "bad_gateway",
    text: "网关无法从上游获得有效响应，或源站当前不可达"
  }),
  503: Object.freeze({
    code: "service_unavailable",
    text: "源站暂时不可用，可能处于维护、重启或过载状态"
  }),
  504: Object.freeze({
    code: "gateway_timeout",
    text: "网关等待上游响应超时"
  }),
  505: Object.freeze({
    code: "http_version_not_supported",
    text: "目标链路不支持当前请求所使用的 HTTP 版本"
  }),
  520: Object.freeze({
    code: "cf_unknown_origin_error",
    text: "Cloudflare 已到达源站，但源站返回了无法归类的异常响应"
  }),
  521: Object.freeze({
    code: "cf_web_server_down",
    text: "Cloudflare 已到达源站网络，但源站拒绝连接或未监听目标端口"
  }),
  522: Object.freeze({
    code: "cf_connection_timed_out",
    text: "Cloudflare 与源站建立连接超时"
  }),
  523: Object.freeze({
    code: "cf_origin_unreachable",
    text: "Cloudflare 无法路由到源站网络，或源站 DNS/网络不可达"
  }),
  524: Object.freeze({
    code: "cf_origin_timeout",
    text: "Cloudflare 已与源站建立连接，但源站在超时窗口内未返回完整响应"
  }),
  525: Object.freeze({
    code: "cf_ssl_handshake_failed",
    text: "Cloudflare 与源站的 TLS 握手失败"
  }),
  526: Object.freeze({
    code: "cf_invalid_ssl_certificate",
    text: "Cloudflare 校验源站证书时判定该证书无效"
  }),
  530: Object.freeze({
    code: "cf_origin_dns_error",
    text: "源站 DNS 解析或 Cloudflare 到源站的访问链路存在致命错误"
  })
});
function Kd(o) {
  const e = Math.trunc(Number(o) || 0);
  if (!Number.isFinite(e) || e <= 0) return {
    code: null,
    text: null
  };
  const t = Bd[e];
  return t ? {
    code: t.code,
    text: t.text
  } : {
    code: null,
    text: null
  };
}
function zd(o) {
  const e = String(o || "").trim();
  return e ? /\b(?:AND|OR|NOT|NEAR)\b/i.test(e) || /(?:^|\s)(?:node_name|request_path|user_agent|error_detail)\s*:/i.test(e) || /(?:^|\s)[^\s"]+\*/.test(e) ? !0 : /^"(?:[^"]|"")+"$/.test(e) : !1;
}
function Qi(o) {
  return `"${String(o || "").replace(/"/g, '""')}"`;
}
function Wd(o) {
  return `${Qi(o)}*`;
}
function Gd(o) {
  return String(o || "").replace(/(^|\s)((?:node_name|request_path|user_agent|error_detail)\s*:\s*)([^"\s()]+)(?=\s|$)/gi, (e, t, r, a) => `${t}${r}${Qi(a)}`);
}
function jd(o) {
  const e = String(o || "").trim();
  return e ? zd(e) ? Gd(e) : e.split(/\s+/).filter(Boolean).map((t) => Wd(t)).join(" AND ") : "";
}
function Zi(o = null) {
  if (!o || typeof o != "object") return null;
  const e = Math.floor(Number(o.timestamp)), t = Math.floor(Number(o.id));
  return !Number.isFinite(e) || !Number.isFinite(t) || e < 0 || t < 0 ? null : {
    timestamp: e,
    id: t
  };
}
function Vd(o = null) {
  return Zi({
    timestamp: Number(o?.timestamp),
    id: Number(o?.id)
  });
}
function ce(o) {
  return `"${String(o || "").replace(/"/g, '""')}"`;
}
function Cr(o) {
  return String(o || "").toLowerCase().replace(/["`[\]]/g, "").replace(/\s+/g, " ").trim();
}
function Mo(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "paid" ? "paid" : e === "free" ? "free" : "";
}
function gr(o = "") {
  const e = String(o || "").trim().toUpperCase();
  return e === "A" || e === "AAAA" || e === "CNAME";
}
function ka(o, e, t = {}) {
  const r = String(o || "").trim().toUpperCase(), a = String(e || "").trim(), n = t.allowCname !== !1;
  if (!gr(r)) return "Type 仅允许 A / AAAA / CNAME";
  if (!n && r === "CNAME") return "A 模式仅允许 A / AAAA";
  if (!a) return "Content 不能为空";
  if (r === "A" && !Ca(a)) return "A 记录 Content 必须是合法 IPv4 地址";
  if (r === "AAAA" && !ln(a)) return "AAAA 记录 Content 必须是合法 IPv6 地址";
  if (r === "CNAME") {
    if (/\s/.test(a)) return "CNAME 记录 Content 不能包含空格";
    if (a.length > 255) return "CNAME 记录 Content 过长";
  }
  return "";
}
function qd(o = "") {
  const e = String(o || "").trim();
  return e ? ka("CNAME", e) ? "" : e : "";
}
var Xd = [
  "logIncludeClientIp",
  "logIncludeColo",
  "logIncludeUa"
], Yd = [
  "playbackInfoAutoProxy",
  "playbackInfoBlockWangpanProxy",
  "sameOriginRedirectProxy",
  "externalRedirectProxy",
  "clientVisibleSameOriginRedirects",
  "clientVisibleExternalRedirects",
  "clientVisibleRedirects",
  "enableWangpanDirect",
  "wangpandirect",
  "tgDailyReportTime"
], ec = ["directSourceNodes", "nodeDirectList"], Jd = ["sourceSameOriginProxy", "forceExternalProxy"], tc = [
  "enableH2",
  "enableH3",
  "peakDowngrade"
], ms = [
  ...Xd,
  ...Yd,
  ...ec,
  ...Jd,
  ...tc
], rc = {
  allowedFields: [
    "uiRadiusPx",
    "settingsExperienceMode",
    "indexUrl",
    "cfQuotaPlanOverride",
    "protocolStrategy",
    "protocolFallback",
    "enableHostPrefixProxy",
    "enablePrewarm",
    "prewarmDepth",
    "prewarmCacheTtl",
    "prewarmPrefetchBytes",
    "disablePrewarmPrefetch",
    "routingDecisionMode",
    "playbackInfoCacheEnabled",
    "playbackInfoCacheTtlSec",
    "videoProgressForwardEnabled",
    "videoProgressForwardIntervalSec",
    "defaultPlaybackInfoMode",
    "defaultRealClientIpMode",
    "defaultMediaAuthMode",
    "directStaticAssets",
    "directHlsDash",
    "multiLinkCopyPanelEnabled",
    "dashboardShowD1WriteHotspot",
    "dashboardShowKvD1Status",
    "sourceDirectNodes",
    "dnsDefaultFallbackCname",
    "defaultHostPrefixCnameTarget",
    "pingTimeout",
    "pingCacheMinutes",
    "hedgeFailoverEnabled",
    "hedgeProbePreferGet",
    "hedgeProbePath",
    "hedgeProbeTimeoutMs",
    "hedgeProbeParallelism",
    "hedgeWaitTimeoutMs",
    "hedgeLockTtlMs",
    "hedgePreferredTtlSec",
    "hedgeFailureCooldownSec",
    "hedgeWakeJitterMs",
    "upstreamTimeoutMs",
    "upstreamRetryAttempts",
    "geoAllowlist",
    "geoBlocklist",
    "ipBlacklist",
    "rateLimitRpm",
    "cacheTtlImages",
    "corsOrigins",
    "logEnabled",
    "logSearchMode",
    "logWriteMode",
    "logWriteClientIp",
    "logWriteColo",
    "logWriteUa",
    "logDisplayClientIp",
    "logDisplayColo",
    "logDisplayUa",
    "logWriteImagePoster",
    "logWriteMediaMetadata",
    "logRetentionDays",
    "logWriteDelayMinutes",
    "logFlushCountThreshold",
    "logBatchChunkSize",
    "logBatchRetryCount",
    "logBatchRetryBackoffMs",
    "scheduledLeaseMs",
    "scheduleUtcOffsetMinutes",
    "tgDailyReportEnabled",
    "tgDailyReportSummaryEnabled",
    "tgDailyReportKvEnabled",
    "tgDailyReportD1Enabled",
    "tgDailyReportClockTimes",
    "tgBotToken",
    "tgChatId",
    "tgAlertDroppedBatchThreshold",
    "tgAlertFlushRetryThreshold",
    "tgAlertOnScheduledFailure",
    "tgAlertKvUsageEnabled",
    "tgAlertKvUsageThresholdPercent",
    "tgAlertD1UsageEnabled",
    "tgAlertD1UsageThresholdPercent",
    "tgAlertCooldownMinutes",
    "jwtExpiryDays",
    "cfAccountId",
    "cfZoneId",
    "cfApiToken",
    "cfKvNamespaceId",
    "cfD1DatabaseId",
    "cfQuotaPlanCacheMinutes",
    "tmdbApiReadToken",
    "tmdbApiV3Key",
    "tmdbLanguage"
  ],
  aliasFields: {},
  trimFields: [
    "tgBotToken",
    "tgChatId",
    "cfAccountId",
    "cfZoneId",
    "cfApiToken",
    "cfKvNamespaceId",
    "cfD1DatabaseId",
    "tmdbApiReadToken",
    "tmdbApiV3Key",
    "tmdbLanguage",
    "indexUrl",
    "cfQuotaPlanOverride",
    "corsOrigins",
    "geoAllowlist",
    "geoBlocklist",
    "ipBlacklist",
    "dnsDefaultFallbackCname",
    "defaultHostPrefixCnameTarget",
    "prewarmDepth",
    "hedgeProbePath",
    "logSearchMode",
    "logWriteMode",
    "routingDecisionMode",
    "protocolStrategy",
    "defaultPlaybackInfoMode",
    "defaultRealClientIpMode",
    "defaultMediaAuthMode"
  ],
  arrayNormalizers: { sourceDirectNodes: "nodeNameList" },
  integerFields: {
    logRetentionDays: {
      fallback: F.Defaults.LogRetentionDays,
      min: 1,
      max: F.Defaults.LogRetentionDaysMax
    },
    logFlushCountThreshold: {
      fallback: F.Defaults.LogFlushCountThreshold,
      min: 1,
      max: 5e3
    },
    logBatchChunkSize: {
      fallback: F.Defaults.LogBatchChunkSize,
      min: 1,
      max: 100
    },
    logBatchRetryCount: {
      fallback: F.Defaults.LogBatchRetryCount,
      min: 0,
      max: 5
    },
    logBatchRetryBackoffMs: {
      fallback: F.Defaults.LogBatchRetryBackoffMs,
      min: 0,
      max: 5e3
    },
    scheduledLeaseMs: {
      fallback: F.Defaults.ScheduledLeaseMs,
      min: F.Defaults.ScheduledLeaseMinMs,
      max: 900 * 1e3
    },
    uiRadiusPx: {
      fallback: F.Defaults.UiRadiusPx,
      min: 0,
      max: 48
    },
    tgAlertDroppedBatchThreshold: {
      fallback: F.Defaults.TgAlertDroppedBatchThreshold,
      min: 0,
      max: 5e3
    },
    tgAlertFlushRetryThreshold: {
      fallback: F.Defaults.TgAlertFlushRetryThreshold,
      min: 0,
      max: 10
    },
    tgAlertKvUsageThresholdPercent: {
      fallback: F.Defaults.TgAlertKvUsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertD1UsageThresholdPercent: {
      fallback: F.Defaults.TgAlertD1UsageThresholdPercent,
      min: 1,
      max: 100
    },
    tgAlertCooldownMinutes: {
      fallback: F.Defaults.TgAlertCooldownMinutes,
      min: 1,
      max: 1440
    },
    cacheTtlImages: {
      fallback: F.Defaults.CacheTtlImagesDays,
      min: 0,
      max: 365
    },
    pingTimeout: {
      fallback: F.Defaults.PingTimeoutMs,
      min: 1e3,
      max: 18e4
    },
    pingCacheMinutes: {
      fallback: F.Defaults.PingCacheMinutes,
      min: 0,
      max: 1440
    },
    hedgeProbeTimeoutMs: {
      fallback: F.Defaults.HedgeProbeTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeProbeParallelism: {
      fallback: F.Defaults.HedgeProbeParallelism,
      min: 1,
      max: 2
    },
    hedgeWaitTimeoutMs: {
      fallback: F.Defaults.HedgeWaitTimeoutMs,
      min: 250,
      max: 1e4
    },
    hedgeLockTtlMs: {
      fallback: F.Defaults.HedgeLockTtlMs,
      min: 1e3,
      max: 1e4
    },
    hedgePreferredTtlSec: {
      fallback: F.Defaults.HedgePreferredTtlSec,
      min: 30,
      max: 3600
    },
    hedgeFailureCooldownSec: {
      fallback: F.Defaults.HedgeFailureCooldownSec,
      min: 1,
      max: 300
    },
    hedgeWakeJitterMs: {
      fallback: F.Defaults.HedgeWakeJitterMs,
      min: 0,
      max: 1e3
    },
    cfQuotaPlanCacheMinutes: {
      fallback: F.Defaults.CfQuotaPlanCacheMinutes,
      min: 1,
      max: 1440
    },
    upstreamTimeoutMs: {
      fallback: F.Defaults.UpstreamTimeoutMs,
      min: 0,
      max: 18e4
    },
    upstreamRetryAttempts: {
      fallback: F.Defaults.UpstreamRetryAttempts,
      min: 0,
      max: 3
    },
    prewarmCacheTtl: {
      fallback: F.Defaults.PrewarmCacheTtl,
      min: 0,
      max: 3600
    },
    prewarmPrefetchBytes: {
      fallback: F.Defaults.PrewarmPrefetchBytes,
      min: 0,
      max: Ao
    },
    playbackInfoCacheTtlSec: {
      fallback: F.Defaults.PlaybackInfoCacheTtlSec,
      min: 0,
      max: 60
    },
    videoProgressForwardIntervalSec: {
      fallback: F.Defaults.VideoProgressForwardIntervalSec,
      min: 0,
      max: 60
    },
    scheduleUtcOffsetMinutes: {
      fallback: F.Defaults.ScheduleUtcOffsetMinutes,
      min: -720,
      max: 840
    }
  },
  numberFields: { logWriteDelayMinutes: {
    fallback: F.Defaults.LogFlushDelayMinutes,
    min: 0,
    max: 1440
  } },
  booleanTrueFields: [
    "protocolFallback",
    "enablePrewarm",
    "playbackInfoCacheEnabled",
    "videoProgressForwardEnabled",
    "hedgeProbePreferGet",
    "logEnabled",
    "logWriteClientIp",
    "logWriteColo",
    "logWriteUa",
    "logDisplayClientIp",
    "logDisplayColo",
    "logDisplayUa"
  ],
  booleanFalseFields: [
    "tgAlertOnScheduledFailure",
    "tgAlertKvUsageEnabled",
    "tgAlertD1UsageEnabled",
    "tgDailyReportEnabled",
    "tgDailyReportSummaryEnabled",
    "tgDailyReportKvEnabled",
    "tgDailyReportD1Enabled",
    "directStaticAssets",
    "directHlsDash",
    "multiLinkCopyPanelEnabled",
    "dashboardShowD1WriteHotspot",
    "dashboardShowKvD1Status",
    "enableHostPrefixProxy",
    "hedgeFailoverEnabled",
    "disablePrewarmPrefetch",
    "logWriteImagePoster",
    "logWriteMediaMetadata"
  ]
};
function Qd(o = {}, e = {}) {
  for (const [t, r] of Object.entries(e.aliasFields || {}))
    if (!(o[t] !== void 0 && o[t] !== null) && Array.isArray(r)) {
      for (const a of r)
        if (!(o[a] === void 0 || o[a] === null)) {
          o[t] = o[a];
          break;
        }
    }
  return o;
}
function Zd(o = {}, e = {}) {
  const t = Array.isArray(e.allowedFields) ? e.allowedFields : [];
  if (!t.length) return o;
  const r = {};
  for (const a of t)
    Object.prototype.hasOwnProperty.call(o, a) && (r[a] = o[a]);
  return r;
}
function ef(o = {}, e = rc, t = {}) {
  let r = o && typeof o == "object" && !Array.isArray(o) ? { ...o } : {};
  r = Qd(r, e);
  for (const a of e.trimFields || [])
    r[a] === void 0 || r[a] === null || (r[a] = String(r[a]).trim());
  for (const [a, n] of Object.entries(e.arrayNormalizers || {}))
    Array.isArray(r[a]) && n === "nodeNameList" && typeof t.normalizeNodeNameList == "function" && (r[a] = t.normalizeNodeNameList(r[a]));
  for (const [a, n] of Object.entries(e.integerFields || {})) r[a] = le(r[a], n.fallback, n.min, n.max);
  for (const [a, n] of Object.entries(e.numberFields || {})) r[a] = pl(r[a], n.fallback, n.min, n.max);
  for (const a of e.booleanTrueFields || []) r[a] = r[a] !== !1;
  for (const a of e.booleanFalseFields || []) r[a] = r[a] === !0;
  return Zd(r, e);
}
function ac(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, t = { ...e };
  let r = !1;
  const a = [], n = [], s = {};
  for (const c of ms)
    Object.prototype.hasOwnProperty.call(e, c) && a.push(c);
  const i = (c, l) => {
    const u = String(c || "").trim(), d = String(l || "").trim();
    !u || !d || (n.push(d), s[u] || (s[u] = []), s[u].push(d));
  };
  if (!Object.prototype.hasOwnProperty.call(t, "sourceDirectNodes")) {
    for (const c of ec)
      if (Object.prototype.hasOwnProperty.call(e, c)) {
        t.sourceDirectNodes = ht(e[c]), r = !0, i(c, "sourceDirectNodes");
        break;
      }
  }
  if (!Object.prototype.hasOwnProperty.call(t, "logWriteClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (t.logWriteClientIp = e.logIncludeClientIp !== !1, r = !0, i("logIncludeClientIp", "logWriteClientIp")), !Object.prototype.hasOwnProperty.call(t, "logDisplayClientIp") && Reflect.get(e, "logIncludeClientIp") !== void 0 && (t.logDisplayClientIp = e.logIncludeClientIp !== !1, r = !0, i("logIncludeClientIp", "logDisplayClientIp")), !Object.prototype.hasOwnProperty.call(t, "logWriteColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (t.logWriteColo = e.logIncludeColo !== !1, r = !0, i("logIncludeColo", "logWriteColo")), !Object.prototype.hasOwnProperty.call(t, "logDisplayColo") && Reflect.get(e, "logIncludeColo") !== void 0 && (t.logDisplayColo = e.logIncludeColo !== !1, r = !0, i("logIncludeColo", "logDisplayColo")), !Object.prototype.hasOwnProperty.call(t, "logWriteUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (t.logWriteUa = e.logIncludeUa !== !1, r = !0, i("logIncludeUa", "logWriteUa")), !Object.prototype.hasOwnProperty.call(t, "logDisplayUa") && Reflect.get(e, "logIncludeUa") !== void 0 && (t.logDisplayUa = e.logIncludeUa !== !1, r = !0, i("logIncludeUa", "logDisplayUa")), !Object.prototype.hasOwnProperty.call(t, "protocolStrategy")) {
    let c = !1;
    for (const l of tc)
      Object.prototype.hasOwnProperty.call(e, l) && (i(l, "protocolStrategy"), c = !0);
    c && (t.protocolStrategy = Do(e), r = !0);
  }
  Object.prototype.hasOwnProperty.call(t, "defaultPlaybackInfoMode") || (Reflect.get(e, "playbackInfoAutoProxy") !== void 0 ? (t.defaultPlaybackInfoMode = Va(e), r = !0, i("playbackInfoAutoProxy", "defaultPlaybackInfoMode")) : Reflect.get(e, "playbackInfoBlockWangpanProxy") !== void 0 && (t.defaultPlaybackInfoMode = Va(e), r = !0, i("playbackInfoBlockWangpanProxy", "defaultPlaybackInfoMode"))), Object.prototype.hasOwnProperty.call(t, "tgDailyReportClockTimes") || (t.tgDailyReportClockTimes = Dt(Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") ? e.tgDailyReportTime : e.tgDailyReportClockTimes, F.Defaults.TgDailyReportClockTimes), Object.prototype.hasOwnProperty.call(e, "tgDailyReportTime") && (r = !0, i("tgDailyReportTime", "tgDailyReportClockTimes")));
  for (const c of ms)
    Object.prototype.hasOwnProperty.call(t, c) && (delete t[c], r = !0);
  return {
    config: t,
    migrated: r,
    legacyKeysPresent: Zt(a),
    deletedLegacyFieldCount: Zt(a).length,
    migratedConfigKeys: Zt(n),
    migratedKeyMap: Object.fromEntries(Object.entries(s).map(([c, l]) => [c, Zt(l)]))
  };
}
function ae(o = {}) {
  const { config: e } = ac(o && typeof o == "object" && !Array.isArray(o) ? o : {});
  return nc(e);
}
function nc(o = {}) {
  const e = ef({
    ...o,
    defaultPlaybackInfoMode: ua(o, "defaultPlaybackInfoMode") ? Reflect.get(o, "defaultPlaybackInfoMode") : Va(o),
    protocolStrategy: ua(o, "protocolStrategy") ? Reflect.get(o, "protocolStrategy") : Do(o)
  }, rc, { normalizeNodeNameList: ht });
  e.prewarmDepth = Xi(e.prewarmDepth), e.hedgeProbePath = Da(e.hedgeProbePath, F.Defaults.HedgeProbePath), e.dnsDefaultFallbackCname = qd(e.dnsDefaultFallbackCname), e.defaultHostPrefixCnameTarget = jt(e.defaultHostPrefixCnameTarget), e.settingsExperienceMode = String(e.settingsExperienceMode || "").trim().toLowerCase() === "expert" ? "expert" : "novice", e.cfQuotaPlanOverride = Mo(e.cfQuotaPlanOverride), e.logSearchMode = Yi(e.logSearchMode), e.logWriteMode = Ji(e.logWriteMode), e.routingDecisionMode = Pr(e.routingDecisionMode), e.protocolStrategy = Hi(e.protocolStrategy), e.defaultPlaybackInfoMode = Gt(e.defaultPlaybackInfoMode), e.defaultRealClientIpMode = ho(e.defaultRealClientIpMode), e.defaultMediaAuthMode = si(e.defaultMediaAuthMode), e.scheduleUtcOffsetMinutes = Oe(e.scheduleUtcOffsetMinutes), e.tgDailyReportClockTimes = Dt(e.tgDailyReportClockTimes, F.Defaults.TgDailyReportClockTimes);
  const t = Je(e.indexUrl);
  return e.indexUrl = t ? zr(t) : "", dd(e, o), e;
}
var oc = [
  "cfApiToken",
  "tgBotToken",
  "tmdbApiReadToken",
  "tmdbApiV3Key"
];
function ps(o = {}) {
  const e = ae(o);
  for (const t of oc) delete e[t];
  return e;
}
function Ct(o = {}) {
  return ae(o);
}
function sc(o = {}, e = {}) {
  const t = $(o) ? { ...o } : {}, r = ae(e);
  for (const a of oc)
    Object.prototype.hasOwnProperty.call(t, a) || String(r[a] || "").length > 0 && (t[a] = r[a]);
  return t;
}
function Dn(o = {}, e = {}) {
  const t = sc(o, e), r = Je(ae(e).indexUrl);
  return t.indexUrl = r ? zr(r) : "", t;
}
function tf(o = "", e = {}) {
  const t = String(o || "").trim();
  if (!t) return;
  const r = t.split(".").pop() || "", a = ne(Z(ae(e)));
  if (r !== a)
    throw we("CONFIG_REVISION_CONFLICT", "配置版本已变化，请刷新设置后重新提交", 409, {
      expectedRevision: t,
      currentHash: a
    });
}
function rf(o = {}) {
  const e = ac(o);
  return {
    cleanedConfig: nc(e.config),
    legacyKeysPresent: e.legacyKeysPresent,
    deletedLegacyFieldCount: e.deletedLegacyFieldCount,
    migratedConfigKeys: e.migratedConfigKeys,
    migratedKeyMap: e.migratedKeyMap
  };
}
function Ht(o = "", e = "") {
  const t = String(o || "").trim() || "empty";
  return `${String(e || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()}.${t}`;
}
function Vn(o, e = {}) {
  const t = ne(Z(o)), r = String(e.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  return {
    ...e,
    hash: t,
    updatedAt: r,
    revision: Ht(t, r)
  };
}
function af(o = {}, e = {}) {
  const t = ae(o), r = ae(e), a = [.../* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)])].sort(), n = [];
  for (const s of a)
    Z(t[s]) !== Z(r[s]) && n.push({
      key: s,
      previousValue: t[s],
      nextValue: r[s]
    });
  return n;
}
function nf(o = [], e = 20) {
  const t = Math.max(1, Number(e) || 20);
  return [...new Set((Array.isArray(o) ? o : [o]).map((r) => String(r ?? "").trim()).filter(Boolean))].slice(0, t);
}
function ft(o = "", e = "", t = [], r = {}) {
  const a = nf(t, r.limit), n = Number(r.count), s = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : a.length, i = String(r.note || "").trim();
  return {
    key: String(o || "").trim(),
    label: String(e || "").trim(),
    count: s,
    countIsLowerBound: r.countIsLowerBound === !0,
    samples: a,
    truncated: s > a.length,
    note: i
  };
}
function be(o, e, t = "", r = "", a = [], n = 0, s = "") {
  return e && o.push(ft(t, r, a, {
    count: n,
    note: s
  })), o;
}
function of(o = {}) {
  const e = [], t = Zt(o.configFieldTargets || []);
  if (t.length > 0) {
    const i = [];
    o.sourceDirectNodesFromLegacyNodes === !0 && i.push("包含节点遗留直连标记折叠进 sourceDirectNodes"), e.push(ft("config_current_fields", "全局设置当前字段", t, {
      count: t.length,
      note: i.join("；") || "会把旧版配置别名收敛到当前 schema。"
    }));
  }
  const r = Math.max(0, Math.floor(Number(o.migratedTopLevelPortNodeCount) || 0)), a = Math.max(0, Math.floor(Number(o.migratedLinePortCount) || 0)), n = Math.max(0, Math.floor(Number(o.migratedDefaultPortNodeCount) || 0)), s = Math.max(0, Math.floor(Number(o.migratedDefaultPortLineCount) || 0));
  if (r > 0 || a > 0 || n > 0 || s > 0) {
    const i = [];
    r > 0 && i.push(`旧版顶层 node.port 节点 ${r} 个`), a > 0 && i.push(`旧版 lines[].port 线路 ${a} 条`), n > 0 && i.push(`隐式默认端口节点 ${n} 个`), s > 0 && i.push(`按协议补齐默认端口线路 ${s} 条`), e.push(ft("node_current_fields", "节点当前字段", ["lines[].target"], {
      count: 1,
      note: `会把端口统一收敛到当前字段。${i.join("，")}。`
    }));
  }
  return e;
}
function sf(o = []) {
  return (Array.isArray(o) ? o : []).map((e) => e?.name || e?.id);
}
async function xe(o, e, t = {}) {
  if (!o) return null;
  const r = String(e || "").trim(), a = $(t) ? t : {};
  try {
    return Object.prototype.hasOwnProperty.call(a, "type") ? await o.get(r, { type: a.type }) : await o.get(r);
  } catch (n) {
    throw ri("get", { key: r }, se(n));
  }
}
async function cf(o, e = {}) {
  if (!o || typeof o.list != "function") return {
    keys: [],
    list_complete: !0,
    cursor: ""
  };
  const t = $(e) ? e : {}, r = String(t.prefix || "").trim(), a = String(t.cursor || "").trim();
  try {
    return a ? await o.list({
      prefix: r,
      cursor: a
    }) : await o.list({ prefix: r });
  } catch (n) {
    throw ri("list", { prefix: r }, se(n));
  }
}
var lf = "sys:theme";
function ic(o, e = {}) {
  const t = String(o || "").trim(), r = t.toLowerCase(), a = String(e.zoneId || "").trim(), n = {
    status: "CF 查询失败",
    hint: "Cloudflare 查询失败，请检查 Zone ID、API 令牌与资源范围",
    detail: t || (a ? `当前查询的 Zone ID: ${a}` : "")
  };
  return t ? r.includes("unknown field") || r.includes("unknown enum") || r.includes("error parsing args") ? {
    status: "Schema 不兼容",
    hint: "当前账号可用的 GraphQL schema 与脚本查询字段不一致",
    detail: t
  } : r.includes("cf_graphql_http_429") || r.includes("rate limit") || r.includes("too many requests") ? {
    status: "请求过于频繁",
    hint: "Cloudflare GraphQL 已限流，请稍后再试",
    detail: t
  } : r.includes("invalid token") || r.includes("authentication") || r.includes("cf_graphql_http_401") ? {
    status: "令牌无效",
    hint: "Cloudflare API 令牌无效，或未启用 GraphQL Analytics 访问",
    detail: t
  } : r.includes("not authorized") || r.includes("permission") || r.includes("forbidden") || r.includes("unauthorized") || r.includes("cf_graphql_http_403") ? {
    status: "权限或范围不匹配",
    hint: "令牌权限不足，或 Account / Zone Resources 未覆盖当前查询",
    detail: t + (a ? ` | Zone ID: ${a}` : "")
  } : r.includes("zone") && (r.includes("not found") || r.includes("invalid") || r.includes("unknown")) ? {
    status: "Zone ID 无效",
    hint: "Zone ID 无效，或当前令牌无法访问这个 Zone",
    detail: t + (a ? ` | Zone ID: ${a}` : "")
  } : r.includes("cf_graphql_http_400") ? {
    status: "请求参数无效",
    hint: "GraphQL 请求参数无效，请检查 Zone ID 与筛选条件",
    detail: t + (a ? ` | Zone ID: ${a}` : "")
  } : n : n;
}
async function cc(o) {
  return ae(await o.get("sys:theme", { type: "json" }) || {});
}
async function Re(o) {
  const e = Na(o);
  if (!e) return {};
  const t = Lo(o), r = mn(o), a = r.ConfigCache;
  if (a?.exp > H() && a.data) return a.data;
  const n = r.RuntimeConfigCacheGeneration;
  return await fn(r.SingleFlightTasks, ct([
    "runtime_config",
    t,
    n
  ]), async () => {
    const s = r.ConfigCache;
    if (s?.exp > H() && s.data) return s.data;
    const i = s?.data && typeof s.data == "object" ? s.data : a?.data && typeof a.data == "object" ? a.data : null;
    let c = i || {};
    try {
      c = await cc(e);
    } catch (l) {
      const u = i && typeof i == "object";
      Ae("runtime_config.load_failed", l, {
        cacheNamespace: t,
        configKey: lf,
        usedCachedConfig: u === !0
      }), c = u ? i : ae({});
    }
    return r.RuntimeConfigCacheGeneration === n && (r.ConfigCache = {
      data: c,
      exp: H() + F.Defaults.CacheTTL,
      namespace: t
    }), c;
  });
}
async function ue(o) {
  const e = Na(o);
  return e ? await cc(e) : {};
}
function uf(o = {}, e = {}) {
  const { indexRepository: t } = o;
  async function r(f, m, p, h = $e(m), g = null) {
    const y = $(g) ? ae(g) : ae(await ue(m)), _ = await t.getAdminActiveIndexRecord(t.getKV(m)), S = _ ? ae({
      ...y,
      indexUrl: _.sourceUrl
    }) : y;
    if (e.isAdminIndexSetupForced(f)) return e.renderAdminIndexSetupPage(f, m, p, h, S, "manual_setup_requested");
    const A = pt(m, S);
    if (!A.indexUrl) {
      try {
        const T = await e.renderBundledAdminPage(f, m, p, h, S);
        if (T) return T;
      } catch (T) {
        return Ae("admin.bundled_shell_render", T, { path: new URL(f.url).pathname }), e.renderAdminIndexSetupPage(f, m, p, h, S, "bundled_shell_render_failed");
      }
      return e.renderAdminIndexSetupPage(f, m, p, h, S);
    }
    const E = A.indexUrl;
    if (E) try {
      const T = await e.renderRemoteAdminPage(f, m, p, h, E, S);
      if (T) return T;
    } catch (T) {
      return Ae("admin.remote_shell_render", T, {
        path: new URL(f.url).pathname,
        remoteShellIndexUrl: E
      }), e.renderAdminRemoteShellErrorPage(f, m, p, h, {
        indexState: A,
        remoteShellIndexUrl: E,
        sourceType: "remote_error",
        routeState: "remote_error",
        remoteCacheState: "bypassed",
        lastFetchStatus: "failed",
        reason: `remote_shell_render_failed: ${String(T?.message || T || "unknown_error").trim()}`
      }, S);
    }
    return e.renderAdminIndexSetupPage(f, m, p, h, S, "index_url_not_configured");
  }
  async function a(f = [], m) {
    const p = Array.isArray(f) ? f : [];
    if (typeof m != "function" || p.length === 0) return [];
    const h = Array.from({ length: p.length });
    let g = 0;
    const y = async () => {
      for (; g < p.length; ) {
        const _ = g;
        g += 1, h[_] = await m(p[_], _);
      }
    };
    return await Promise.all(Array.from({ length: Math.min(e.ADMIN_WARM_VENDOR_CONCURRENCY, p.length) }, () => y())), h;
  }
  function n(f) {
    return new Request(f, {
      method: "HEAD",
      headers: { Accept: "*/*" },
      cache: "no-store"
    });
  }
  function s(f) {
    return f?.ok === !0 || Number(f?.status) === 304;
  }
  async function i(f, m, p = $e(m), h = null) {
    const g = $(h) ? ae(h) : ae(await ue(m)), y = pt(m, g);
    if (!y.indexUrl) return z("ADMIN_INDEX_NOT_CONFIGURED", "管理台 index.html 尚未配置", 409);
    const _ = [], S = { waitUntil(M) {
      _.push(Promise.resolve(M));
    } }, A = it(m), E = new URL(f.url);
    E.pathname = A, E.search = "";
    const T = await e.renderRemoteAdminPage(n(E), m, S, p, y.indexUrl, g);
    await Promise.all(_.splice(0));
    const w = ur(), D = y.assetRevision || y.releaseTag, k = y.isLocalUpload ? await t.getAdminIndexUploadRecord(t.getKV(m), y.localUploadRevision) : null;
    let b = null;
    k?.manifest ? (b = await e.readAdminReleaseVendorManifestFromCache(w, D, y.indexUrl), b || (b = await e.cacheAdminReleaseVendorManifest(w, k.manifest, S))) : b = await e.getOrCreateAdminReleaseVendorManifest(w, D, y.indexUrl, S);
    const N = (Array.isArray(b?.entries) ? b.entries : []).filter((M) => M?.assetKey && !e.isMutableJsdelivrGithubAssetUrl(M.upstreamUrl)), R = await a(N, async (M) => {
      const C = e.buildAdminReleaseVendorProxyPath(A, D, M.assetKey), I = new URL(f.url);
      return I.pathname = C, I.search = "", e.renderAdminReleaseVendorAsset(n(I), m, S, {
        releaseTag: D,
        assetKey: M.assetKey
      }, g);
    });
    await Promise.all(_.splice(0));
    const x = R.filter((M) => !s(M)).length, O = s(T), L = JSON.stringify({
      ok: O && x === 0,
      shellStatus: Number(T?.status) || 0,
      warmedAssetCount: N.length - x,
      failedAssetCount: x
    }), v = new Headers({
      "Content-Type": "application/json;charset=UTF-8",
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(v), new Response(f.method === "HEAD" ? null : L, {
      status: O && x === 0 ? 200 : 502,
      headers: v
    });
  }
  function c(f, m = $e(f)) {
    const p = it(f), h = m.ok ? "" : `<div class="landing-banner"><div class="landing-banner-title">系统未初始化</div><div class="landing-banner-text">缺少关键环境变量：${m.missing.map((_) => Te(_)).join("、")}</div></div>`, g = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Emby Proxy V19.5</title>${e.LANDING_PAGE_STYLE_HTML}</head><body><main class="landing-shell"><section class="landing-card"><div class="landing-grid"><div class="landing-primary">${h}<div class="landing-pill">Headless Edge Relay</div><h1 class="landing-title">Emby Proxy V19.5</h1><p class="landing-text">为了极致优化视频代理性能，根路径默认只保留无头中继与说明壳；真正的管理台入口固定收口到 <span class="landing-highlight">${Te(p)}</span>，并由 Worker 读取随部署发布或已上传的 <code>index.html</code> 返回。</p><div class="landing-actions"><a href="${Te(p)}" class="landing-btn landing-btn-primary">访问 ${Te(p)}</a><a href="https://github.com/axuitomo/CF-EMBY-PROXY-UI" target="_blank" rel="noopener noreferrer" class="landing-btn landing-btn-secondary">查看项目说明</a></div></div><div class="landing-side"><div class="landing-notes"><div class="landing-notes-title">Routing Notes</div><ul class="landing-note-list"><li>根路径仅提供静态说明页，不承载实时配置数据。</li><li><code>${Te(p)}</code> 只负责返回管理台壳与 bootstrap，动态数据继续走 <code>POST ${Te(p)}</code> API。</li><li>正式真相源固定为 <code>frontend/</code>、<code>worker.js</code> 与 <code>worker.md</code>。</li><li>媒体代理、日志与 KV / D1 逻辑保持原 Worker 主链路不变。</li></ul></div></div></div></section></main></body></html>`, y = new Headers({
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    });
    return Ce(y), y.set("X-Frame-Options", "DENY"), new Response(g, { headers: y });
  }
  function l(f, m = "/", p = 302) {
    const h = new URL(f.url);
    h.pathname = J(m || "/"), h.search = "", h.hash = "";
    const g = new Headers({
      Location: h.toString(),
      "Cache-Control": "no-store, max-age=0"
    });
    return Ce(g), new Response(null, {
      status: p,
      headers: g
    });
  }
  async function u(f, m, p = $e(m)) {
    const h = it(m), g = wo(m), y = zn(p), _ = Vr({
      adminPath: h,
      loginPath: g,
      initHealth: p,
      contract: e.buildAdminUiContract()
    }), S = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>Worker 管理台登录</title><style>
        :root {
          color-scheme: light;
          font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          --bg-a: #091428;
          --bg-b: #123055;
          --panel: rgba(8, 20, 38, 0.88);
          --panel-border: rgba(148, 163, 184, 0.24);
          --text-main: #e5eefc;
          --text-muted: rgba(226, 232, 240, 0.8);
          --accent: #6ee7f9;
          --accent-strong: #2dd4bf;
          --danger-bg: rgba(248, 113, 113, 0.14);
          --danger-border: rgba(248, 113, 113, 0.3);
          --danger-text: #fecaca;
          --success-bg: rgba(74, 222, 128, 0.12);
          --success-border: rgba(74, 222, 128, 0.28);
          --success-text: #bbf7d0;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          color: var(--text-main);
          background:
            radial-gradient(circle at top left, rgba(96, 165, 250, 0.32), transparent 38%),
            radial-gradient(circle at 85% 15%, rgba(45, 212, 191, 0.2), transparent 22%),
            linear-gradient(135deg, var(--bg-a), var(--bg-b));
        }
        a { color: inherit; }
        .login-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 32px 20px;
        }
        .login-card {
          width: min(100%, 960px);
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--panel-border);
          background: var(--panel);
          box-shadow: 0 28px 120px rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(22px);
        }
        .login-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(320px, 420px);
        }
        .login-hero {
          padding: 42px 42px 36px;
          border-right: 1px solid rgba(148, 163, 184, 0.18);
        }
        .login-form {
          padding: 42px 32px 36px;
          background: rgba(2, 6, 23, 0.18);
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(229, 238, 252, 0.78);
          background: rgba(15, 23, 42, 0.36);
          border: 1px solid rgba(148, 163, 184, 0.18);
        }
        .title {
          margin: 18px 0 12px;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1.05;
        }
        .subtitle, .hint, .meta-item, .status {
          color: var(--text-muted);
          line-height: 1.7;
        }
        .meta-grid {
          margin-top: 26px;
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .meta-card {
          padding: 16px 18px;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.32);
          border: 1px solid rgba(148, 163, 184, 0.14);
        }
        .meta-label {
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(148, 163, 184, 0.88);
        }
        .meta-value {
          margin-top: 8px;
          font-size: 15px;
          color: var(--text-main);
          word-break: break-all;
        }
        .actions {
          margin-top: 26px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .action-link, .submit-btn {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          text-decoration: none;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        }
        .action-link:hover, .submit-btn:hover { transform: translateY(-1px); }
        .action-link.primary, .submit-btn {
          background: linear-gradient(135deg, var(--accent-strong), var(--accent));
          color: #082032;
          border-color: transparent;
        }
        .action-link.secondary {
          background: rgba(15, 23, 42, 0.38);
          color: var(--text-main);
        }
        .form-panel {
          display: grid;
          gap: 18px;
        }
        .form-title {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
        }
        .field {
          display: grid;
          gap: 10px;
        }
        .field-label {
          font-size: 13px;
          color: rgba(226, 232, 240, 0.82);
        }
        .field-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(15, 23, 42, 0.58);
          color: var(--text-main);
          font-size: 15px;
          outline: none;
        }
        .field-input:focus {
          border-color: rgba(110, 231, 249, 0.72);
          box-shadow: 0 0 0 4px rgba(110, 231, 249, 0.14);
        }
        .submit-btn {
          width: 100%;
          cursor: pointer;
        }
        .submit-btn[disabled] {
          cursor: wait;
          opacity: 0.72;
          transform: none;
        }
        .status {
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(15, 23, 42, 0.36);
          font-size: 14px;
        }
        .status.is-error {
          color: var(--danger-text);
          background: var(--danger-bg);
          border-color: var(--danger-border);
        }
        .status.is-success {
          color: var(--success-text);
          background: var(--success-bg);
          border-color: var(--success-border);
        }
        .hint {
          font-size: 13px;
          margin: 0;
        }
        .noscript {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger-text);
          font-size: 13px;
          line-height: 1.7;
        }
        @media (max-width: 860px) {
          .login-grid { grid-template-columns: 1fr; }
          .login-hero { border-right: none; border-bottom: 1px solid rgba(148, 163, 184, 0.18); padding: 34px 24px 24px; }
          .login-form { padding: 28px 24px 30px; }
          .meta-grid { grid-template-columns: 1fr; }
        }
      </style></head><body><main class="login-shell"><section class="login-card"><div>${y}</div><div class="login-grid"><section class="login-hero"><div class="eyebrow">Worker Admin Access</div><h1 class="title">登录管理台壳层</h1><p class="subtitle">这个入口只负责建立 Worker 的同源登录态。登录成功后会直接返回主控制台，后续的节点治理、日志诊断、DNS/IP 池与发布操作继续复用同一份 Cookie。</p><div class="meta-grid"><article class="meta-card"><div class="meta-label">Admin Path</div><div class="meta-value">${Te(h)}</div></article><article class="meta-card"><div class="meta-label">Login Endpoint</div><div class="meta-value">POST ${Te(g)}</div></article><article class="meta-card"><div class="meta-label">Init Health</div><div class="meta-value">${p.ok ? "已通过" : `未通过：${Te((Array.isArray(p.missing) ? p.missing : []).join(" / ") || "请检查环境变量")}`}</div></article><article class="meta-card"><div class="meta-label">Current Mode</div><div class="meta-value">独立登录壳，不再复用 /admin 远端 shell</div></article></div><div class="actions"><a href="${Te(h)}" class="action-link secondary">返回管理台</a><a href="/" class="action-link primary">回到根路径说明页</a></div></section><section class="login-form"><form id="admin-login-form" class="form-panel" action="${Te(g)}" method="post" novalidate><div><p class="form-title">输入管理密码</p><p class="hint">页面会继续调用已有的 <code>POST ${Te(g)}</code> JSON 登录接口，不会新增第二套鉴权协议。</p></div><label class="field" for="admin-login-password"><span class="field-label">管理密码</span><input id="admin-login-password" name="password" type="password" class="field-input" autocomplete="current-password" placeholder="请输入 ADMIN_PASS" required /></label><button id="admin-login-submit" type="submit" class="submit-btn">登录并进入控制台</button><div id="admin-login-status" class="status" role="status" aria-live="polite">等待输入密码。登录成功后会跳转到 ${Te(h)}。</div></form><noscript><div class="noscript">当前登录壳需要浏览器启用 JavaScript，因为 Worker 现阶段继续复用原有 JSON 登录接口来写入 Cookie。</div></noscript></section></div></section></main><script>
        const ADMIN_LOGIN_RUNTIME = ${_};
        const form = document.getElementById("admin-login-form");
        const passwordInput = document.getElementById("admin-login-password");
        const submitButton = document.getElementById("admin-login-submit");
        const statusNode = document.getElementById("admin-login-status");

        function updateStatus(message, tone) {
          if (!statusNode) return;
          statusNode.textContent = message || "";
          statusNode.classList.remove("is-error", "is-success");
          if (tone === "error") statusNode.classList.add("is-error");
          if (tone === "success") statusNode.classList.add("is-success");
        }

        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const password = String(passwordInput?.value || "");
          if (!password) {
            updateStatus("请输入管理密码。", "error");
            passwordInput?.focus();
            return;
          }
          if (submitButton) submitButton.disabled = true;
          updateStatus("正在验证密码并建立 Cookie 会话...", "");
          try {
            const response = await fetch(ADMIN_LOGIN_RUNTIME.loginPath, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              credentials: "same-origin",
              body: JSON.stringify({ password })
            });
            const payload = await response.json().catch(() => ({}));
            if (response.ok && payload && payload.ok === true) {
              updateStatus("登录成功，正在进入控制台...", "success");
              void fetch((ADMIN_LOGIN_RUNTIME.adminPath || "/admin").replace(/\\/+$/, "") + "/__warm", {
                method: "HEAD",
                credentials: "same-origin",
                cache: "no-store",
                keepalive: true
              }).catch(() => null);
              window.location.assign(ADMIN_LOGIN_RUNTIME.adminPath || "/admin");
              return;
            }
            const baseErrorMessage = payload?.error?.message || payload?.message || (response.status ? ("登录失败（HTTP " + response.status + "）") : "登录失败");
            const remainingAttempts = Number.isFinite(Number(payload?.remain))
              ? Math.max(0, Number(payload.remain))
              : null;
            const errorMessage = remainingAttempts === null
              ? baseErrorMessage
              : remainingAttempts > 0
                ? baseErrorMessage + "，还可尝试 " + remainingAttempts + " 次。"
                : baseErrorMessage + "，已达到失败次数上限，请稍后重试。";
            updateStatus(errorMessage, "error");
          } catch (error) {
            updateStatus(error?.message ? ("登录请求失败：" + error.message) : "登录请求失败，请稍后重试。", "error");
          } finally {
            if (submitButton) submitButton.disabled = false;
          }
        });

        passwordInput?.focus();
      <\/script></body></html>`;
    return new Response(f?.method === "HEAD" ? null : S, { headers: e.buildAdminHtmlResponseHeaders("", "no-store, max-age=0") });
  }
  function d(f, m, p = 200, h = {}) {
    const g = new Headers(f);
    return Ce(g), h.mergeOriginVary === !0 && g.get("Access-Control-Allow-Origin") !== "*" && Ur(g, "Origin"), new Response(m, {
      status: p,
      headers: g
    });
  }
  return {
    renderAdminPage: r,
    warmAdminReleaseVendorEntries: a,
    buildAdminWarmSubrequest: n,
    isAdminWarmResponseSuccessful: s,
    renderAdminWarmResponse: i,
    renderLandingPage: c,
    buildRequestPathRedirectResponse: l,
    renderAdminLoginPage: u,
    buildEdgeCorsResponse: d
  };
}
function Po(o = "") {
  return /(?:^|\/)smartstrm(?:$|[/?])/i.test(String(o || ""));
}
function ha(o = "") {
  return qa(o) || /\/audio\/[^/]+(?:\/|$)/i.test(String(o || "")) || /\/livetv\/[^/]+(?:\/|$)/i.test(String(o || "")) || Po(o);
}
function df(o = "") {
  const e = String(o || "").trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(e) || e.startsWith("//");
}
function lc(o = "") {
  return /\/playbackinfo(?:$|[/?])/i.test(String(o || ""));
}
function qa(o = "") {
  const e = J(o);
  return lc(e) || Po(e) || St.test(e) || xi.test(e) ? !0 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/i.test(e) || /\/items\/[^/]+\/download\b/i.test(e);
}
function uc(o = "") {
  return /\/sessions\/playing\/progress(?:$|[/?])/i.test(String(o || ""));
}
function dc(o = "") {
  return /\/sessions\/playing\/stopped(?:$|[/?])/i.test(String(o || ""));
}
function ff(o = "") {
  return /\/sessions\/playing\/ping(?:$|[/?])/i.test(String(o || ""));
}
function mf(o = "") {
  const e = String(o || "");
  return uc(e) || dc(e) || ff(e) ? !1 : /\/sessions\/playing(?:\/started)?(?:$|[/?])/i.test(e);
}
function pf(o = {}, e = {}) {
  function t(r, a) {
    let n = a;
    const s = It(r[n]);
    let i = Vi(s) === "main" ? "/" + s : "";
    for (n += 1; n < r.length; n += 1) i += "/" + It(r[n]);
    return qa(i || "/");
  }
  return { isPlaybackCriticalSegments: t };
}
function gf(o = {}) {
  const e = {};
  for (const [t, r] of Object.entries(rd(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(ad(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(od(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(sd(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(uf(o, e))) e[t] = r;
  for (const [t, r] of Object.entries(pf(o, e))) e[t] = r;
  return e;
}
function Xa(o) {
  if (!o || o === 0) return "0 B";
  const e = 1024, t = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ], r = Math.floor(Math.log(o) / Math.log(e));
  return parseFloat((o / Math.pow(e, r)).toFixed(2)) + " " + t[r];
}
var fc = 1024 * 1024 * 1024, hf = 500 * 1024 * 1024, yf = 10 * 1024 * 1024 * 1024, xo = Object.freeze({
  planClass: "free",
  planLabel: "FREE",
  periodLabel: "今日",
  kv: {
    read: 1e5,
    write: 1e3,
    delete: 1e3,
    list: 1e3,
    storageBytes: fc
  },
  d1: {
    rowsRead: 5e6,
    rowsWritten: 1e5,
    storageBytes: hf
  }
}), mc = Object.freeze({
  planClass: "paid",
  planLabel: "PAID",
  periodLabel: "本月",
  kv: {
    read: 1e7,
    write: 1e6,
    delete: 1e6,
    list: 1e6,
    storageBytes: fc
  },
  d1: {
    rowsRead: 25e9,
    rowsWritten: 5e7,
    storageBytes: yf
  }
}), Sf = Object.freeze({
  free: xo,
  paid: mc
});
function ye(o) {
  const e = Number(o);
  return Number.isFinite(e) ? Math.max(0, Math.round(e)).toLocaleString("en-US") : "0";
}
function ya(o) {
  const e = Number(o);
  return !Number.isFinite(e) || e <= 0 ? 0 : e >= 100 ? 100 : Math.max(0, Math.round(e * 10) / 10);
}
function _f(o = 0) {
  const e = Number(o);
  return !Number.isFinite(e) || e <= 0 ? "slate" : e >= 90 ? "danger" : e >= 70 ? "warning" : "success";
}
function Sa(o = "") {
  return String(o || "").trim().toLowerCase() || "bundled";
}
function pc(o = "") {
  const e = Sa(o);
  return e === "standard" || e === "unbound" ? {
    ...mc,
    usageModel: e
  } : {
    ...xo,
    usageModel: e
  };
}
function qn(o = {}) {
  const e = Mo(o?.override);
  return e ? {
    ..._a(e),
    usageModel: Sa(o?.usageModel),
    override: e
  } : {
    ...pc(o?.usageModel),
    override: ""
  };
}
function _a(o = "free") {
  return Sf[String(o || "").trim().toLowerCase() === "paid" ? "paid" : "free"] || xo;
}
async function bf(o = {}) {
  const e = ae($(o) ? o : {}), t = Mo(e.cfQuotaPlanOverride);
  if (t) return qn({ override: t });
  const r = String(e.cfAccountId || "").trim(), a = String(e.cfApiToken || "").trim();
  if (!r || !a) return {
    ..._a("free"),
    usageModel: Sa("bundled"),
    override: ""
  };
  try {
    return qn({ usageModel: await _c(r, a) });
  } catch {
    return {
      ..._a("free"),
      usageModel: Sa("bundled"),
      override: ""
    };
  }
}
function Ef(o = {}) {
  const e = $(o) ? o : {}, t = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), r = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), a = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), n = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0)), s = Math.max(0, n - t), i = String(e.planLabel || "").trim() || "FREE", c = String(e.periodLabel || "").trim() || "今日";
  return n <= t ? "" : `KV 整理已拦截：当前 ${i} 计划 · ${c} 写入上限为 ${ye(t)}，本次预计写入 ${ye(r)} 次，最坏回滚写回 ${ye(a)} 次，最坏共 ${ye(n)} 次，超出 ${ye(s)} 次。`;
}
function Tf(o = {}) {
  const e = $(o) ? o : {}, t = String(e.planLabel || "").trim() || "FREE", r = String(e.periodLabel || "").trim() || "今日", a = Math.max(1, Math.floor(Number(e.writeLimit) || 0)), n = Math.max(0, Math.floor(Number(e.estimatedPutCount) || 0)), s = Math.max(0, Math.floor(Number(e.estimatedDeleteCount) || 0)), i = Math.max(0, Math.floor(Number(e.estimatedRollbackWriteCount) || 0)), c = Math.max(0, Math.floor(Number(e.estimatedWorstCaseWriteCount) || 0));
  return `KV 配额预算：${t} 计划 · ${r}，预计 put ${ye(n)} 次，delete ${ye(s)} 次，最坏回滚写回 ${ye(i)} 次，最坏写入 ${ye(c)} / ${ye(a)}。`;
}
function Rf(o = "free", e = /* @__PURE__ */ new Date()) {
  const t = String(o || "").trim().toLowerCase() === "paid" ? "paid" : "free", r = e instanceof Date ? new Date(e.getTime()) : new Date(e || Date.now()), a = r.toISOString();
  if (t === "paid") {
    const i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), 1, 0, 0, 0, 0)), c = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return {
      planClass: t,
      periodLabel: "本月",
      startIso: i.toISOString(),
      endIso: a,
      resetAtIso: c.toISOString(),
      cacheBucketKey: `${r.getUTCFullYear()}-${String(r.getUTCMonth() + 1).padStart(2, "0")}`
    };
  }
  const n = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate(), 0, 0, 0, 0)), s = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate() + 1, 0, 0, 0, 0));
  return {
    planClass: t,
    periodLabel: "今日",
    startIso: n.toISOString(),
    endIso: a,
    resetAtIso: s.toISOString(),
    cacheBucketKey: n.toISOString().slice(0, 10)
  };
}
function kt(o, e = "cloudflare_runtime_error") {
  return String(o?.message || o || e).trim().replace(/\s+/g, " ").slice(0, 240) || e;
}
function gs(o, e = "count") {
  return e === "bytes" ? Xa(Math.max(0, Number(o) || 0)) : ye(o);
}
function hs(o = 0, e = H()) {
  const t = Math.max(0, Number(o) || 0), r = Math.max(t, Number(e) || H());
  if (t <= 0) return "";
  const a = Math.max(0, r - t);
  return a < 60 * 1e3 ? "缓存年龄：不到 1 分钟" : a < 3600 * 1e3 ? `缓存年龄：${Math.max(1, Math.round(a / (60 * 1e3)))} 分钟` : `缓存年龄：${Math.max(1, Math.round(a / (3600 * 1e3)))} 小时`;
}
function Er({ key: o = "", label: e = "", used: t = 0, limit: r = 0, kind: a = "count" } = {}) {
  const n = Math.max(0, Number(t) || 0), s = Math.max(0, Number(r) || 0), i = s > 0 ? n / s * 100 : 0, c = ya(i);
  return {
    key: String(o || "").trim(),
    label: String(e || "").trim(),
    usedValue: n,
    limitValue: s,
    usedText: gs(n, a),
    limitText: gs(s, a),
    percent: c,
    percentText: `${c % 1 === 0 ? Math.round(c) : c}%`,
    tone: _f(i),
    rawPercent: i
  };
}
function ys(o = []) {
  return (Array.isArray(o) ? o : []).filter((e) => Number(e?.rawPercent) > 100).map((e) => String(e?.label || "").trim()).filter(Boolean);
}
function Ya(o = {}, e = {}) {
  const t = (Array.isArray(o.metrics) ? o.metrics : []).map((r) => ({
    key: String(r?.key || "").trim(),
    label: String(r?.label || "").trim(),
    usedText: String(r?.usedText || "").trim(),
    limitText: String(r?.limitText || "").trim(),
    percent: ya(r?.percent),
    percentText: String(r?.percentText || `${ya(r?.percent)}%`).trim(),
    tone: String(r?.tone || "slate").trim() || "slate"
  })).filter((r) => r.key && r.label);
  return {
    title: String(o.title || e.title || "Cloudflare").trim() || "Cloudflare",
    status: String(o.status || e.status || "idle").trim() || "idle",
    summary: String(o.summary || e.summary || "暂无运行记录").trim() || "暂无运行记录",
    detail: String(o.detail || e.detail || "").trim(),
    lines: (Array.isArray(o.lines) ? o.lines : Array.isArray(e.lines) ? e.lines : []).map((r) => String(r || "").trim()).filter(Boolean),
    planLabel: String(o.planLabel || e.planLabel || "").trim(),
    periodLabel: String(o.periodLabel || e.periodLabel || "").trim(),
    resourceLabel: String(o.resourceLabel || e.resourceLabel || "").trim(),
    metrics: t
  };
}
function Tr(o = "", e = "", t = "") {
  return Ya({
    title: o,
    status: "skipped",
    summary: e,
    detail: t
  });
}
function Rr(o = "", e = "", t = "") {
  return Ya({
    title: o,
    status: "failed",
    summary: e,
    detail: t
  });
}
function Af(o = "", e = {}, t = 0, r = []) {
  const a = Math.max(1, Math.min(100, Math.round(Number(t) || 0))), n = e && typeof e == "object" ? e : {}, s = (Array.isArray(r) ? r : []).map((p) => ({
    label: String(p?.label || "").trim(),
    percentText: String(p?.percentText || `${ya(p?.percent)}%`).trim()
  })).filter((p) => p.label), i = String(n.resourceLabel || "").trim() || String(o || "").trim(), c = String(n.planLabel || "").trim(), l = String(n.periodLabel || "").trim(), u = [i], d = [c, l].filter(Boolean);
  d.length > 0 && u.push(`（${d.join(" / ")}）`);
  const f = s.map((p) => `${p.label} ${p.percentText}`).join("、"), m = String(n.status || "").trim().toLowerCase() === "partial_failure" ? "（使用缓存数据）" : "";
  return `${String(o || "Cloudflare").trim() || "Cloudflare"} 使用量达到阈值：${u.join("")}，${f}（阈值 ${a}%）${m}`;
}
function Nn(o = [], e = []) {
  const t = new Set((Array.isArray(e) ? e : [e]).map((r) => String(r || "").trim()).filter(Boolean));
  for (const r of Array.isArray(o) ? o : []) {
    const a = String(r?.key || "").trim();
    if (!t.has(a)) continue;
    const n = String(r?.percentText || "").trim();
    if (n) return n;
    if (r?.percent !== void 0 && r?.percent !== null) return `${ya(r.percent)}%`;
  }
  return "暂不可用";
}
function Cf(o = {}, e = {}) {
  const t = o && typeof o == "object" ? o : {}, r = e && typeof e == "object" ? e : {}, a = String(t.requestCountDisplay || "").trim() || (t.todayRequests === null || t.todayRequests === void 0 ? "暂不可用" : String(Number(t.todayRequests) || 0)), n = String(t.todayTraffic || "").trim() || "暂不可用", s = String(t.monthlyTraffic || "").trim() || "暂不可用", i = Math.max(0, Number(t.playCount) || 0), c = Math.max(0, Number(t.infoCount) || 0);
  return [
    `📊 EMBY-PROXY每日报表${r.dateKey ? ` (${r.dateKey})` : ""}`,
    "",
    `请求数: ${a}`,
    `视频流量 (CF 总计): ${n}`,
    `本月流量 (CF 总计): ${s}`,
    `请求: 播放请求 ${ye(i)} 次 | 获取播放信息 ${ye(c)} 次`,
    "#Cloudflare #Emby #日报"
  ].map((l) => String(l || "").trim()).filter((l, u, d) => !(l === "" && (u === 0 || d[u - 1] === ""))).join(`
`);
}
function wf(o = "", e = {}, t = {}) {
  const r = Bi(o);
  if (r === "summary") return Cf(e, t);
  const a = r === "d1" ? "d1" : "kv", n = e && typeof e == "object" ? e : {}, s = t && typeof t == "object" ? t : {}, i = a === "d1" ? "D1 数据库每日消耗报告" : "KV 数据库每日消耗报告", c = a === "d1" ? "#D1" : "#KV", l = Array.isArray(n.metrics) ? n.metrics : [], u = s.dateKey ? ` (${s.dateKey})` : "", d = String(n.planLabel || "").trim(), f = String(n.periodLabel || "").trim(), m = d || f ? `${d || "未知"} 计划 X ${f || "当前"}配额` : String(n.summary || "").trim() || "暂不可用", p = Nn(l, a === "d1" ? ["rowsRead", "read"] : ["read", "rowsRead"]), h = Nn(l, a === "d1" ? ["rowsWritten", "write"] : ["write", "rowsWritten"]), g = Nn(l, ["storage"]);
  return [
    `📊 ${i}${u}`,
    `配额口径：${m}`,
    `读取使用率：${p}`,
    `写入使用率：${h}`,
    `存储使用率：${g}`,
    `#Cloudflare ${c} #日报`
  ].map((y) => String(y || "").trim()).filter((y, _, S) => !(y === "" && (_ === 0 || S[_ - 1] === ""))).join(`
`);
}
function Ss(o = null, e = "") {
  const t = (Array.isArray(o?.errors) ? o.errors : []).map((a) => {
    const n = String(a?.code || "").trim(), s = String(a?.message || "").trim();
    return n && s ? `${n}: ${s}` : s || n;
  }).filter(Boolean);
  if (t.length > 0) return t.join("; ");
  const r = String(e || "").trim();
  return r ? r.replace(/\s+/g, " ").slice(0, 300) : "";
}
async function Ee(o, e, t = {}) {
  const r = t && typeof t == "object" ? t : {};
  let a = {};
  const n = r?.headers;
  n && (n instanceof Headers ? a = Object.fromEntries(n.entries()) : typeof n == "object" && (a = n));
  const s = typeof FormData < "u" && r?.body instanceof FormData, i = await Be(o, {
    ...r,
    headers: {
      Authorization: `Bearer ${e}`,
      ...s ? {} : { "Content-Type": "application/json" },
      ...a
    }
  }), c = await De(i, ai);
  if (c.exceeded) throw new Error("cf_api_response_too_large");
  const l = c.text;
  let u = null;
  if (l) try {
    u = JSON.parse(l);
  } catch {
  }
  if (!i.ok) {
    const d = Number(i.status) || 0, f = Ss(u, l), m = /* @__PURE__ */ new Error(f ? `cf_api_http_${d}: ${f}` : `cf_api_http_${d}`);
    throw m.status = d, m;
  }
  if (!u || typeof u != "object") return {};
  if (u?.success === !1) {
    const d = Ss(u, l);
    throw new Error(d || "cf_api_error");
  }
  return u;
}
async function gc(o, e, t) {
  const r = t && typeof t == "object" ? {
    query: e,
    variables: t
  } : { query: e }, a = await Be("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${o}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(r)
  });
  if (!a.ok) throw new Error(`cf_graphql_http_${a.status}`);
  const n = await De(a, ai);
  if (n.exceeded) throw new Error("cf_graphql_response_too_large");
  const s = JSON.parse(n.text);
  if (Array.isArray(s?.errors) && s.errors.length) throw new Error(s.errors.map((i) => i?.message).filter(Boolean).join("; ") || "cf_graphql_error");
  return s;
}
async function hc(o, e, t, r) {
  return (await gc(e, t, r))?.data?.viewer?.zones?.[0] || null;
}
async function _s(o, e, t, r) {
  const a = await hc(o, e, `
            query {
              viewer {
                zones(filter: { zoneTag: ${_e(o)} }) {
                  series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${_e(new Date(t).toISOString())}, datetime_leq: ${_e(new Date(r).toISOString())} }) {
                    sum { edgeResponseBytes }
                  }
                }
              }
            }`);
  if (!a) throw new Error("cf_graphql_empty_zone");
  return (Array.isArray(a.series) ? a.series : []).reduce((n, s) => n + Math.max(0, Number(s?.sum?.edgeResponseBytes) || 0), 0);
}
async function gn(o, e, t, r) {
  return (await gc(e, t, r))?.data?.viewer?.accounts?.[0] || null;
}
async function yc(o, e) {
  return !o || !e ? null : (await Ee(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(o).trim())}`, e))?.result || null;
}
async function Sc(o, e, t = {}) {
  const r = String(o || "").trim();
  return await pe(yc(r, e), String(t?.scope || "cloudflare.zone_lookup"), {
    zoneId: r,
    ...$(t?.context) ? t.context : {}
  }, null);
}
async function Oo(o, e, t = {}) {
  const r = await yc(o, e), a = String(r?.name || "").trim();
  if (r && a) return r;
  const n = /* @__PURE__ */ new Error("cf_zone_context_missing");
  throw n.code = "CF_ZONE_CONTEXT_MISSING", n.status = 400, n.details = {
    zoneId: String(o || "").trim(),
    scope: String(t?.scope || "").trim()
  }, n;
}
async function _c(o, e) {
  const t = String(o || "").trim(), r = String(e || "").trim();
  return !t || !r ? "" : Sa((await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/account-settings`, r))?.result?.default_usage_model);
}
async function Lf(o, e, t) {
  const r = String(o || "").trim(), a = String(e || "").trim(), n = String(t || "").trim();
  return !r || !a || !n ? null : (await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/storage/kv/namespaces/${encodeURIComponent(a)}`, n))?.result || null;
}
async function bs(o, e, t) {
  const r = String(o || "").trim(), a = String(e || "").trim(), n = String(t || "").trim();
  return !r || !a || !n ? null : (await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/d1/database/${encodeURIComponent(a)}`, n))?.result || null;
}
async function Df({ accountId: o, apiToken: e, namespaceId: t, startIso: r, endIso: a }) {
  const n = String(o || "").trim(), s = String(e || "").trim(), i = String(t || "").trim();
  if (!n || !s || !i) return null;
  const c = await gn(n, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(n)} }) {
          kvOperationsAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${_e(i)}
              datetime_geq: ${_e(String(r || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
            }
          ) {
            dimensions { actionType }
            sum { requests }
          }
          kvStorageAdaptiveGroups(
            limit: 1000
            filter: {
              namespaceId: ${_e(i)}
              datetime_geq: ${_e(String(r || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
            }
          ) {
            max { byteCount }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  const l = Array.isArray(c?.kvOperationsAdaptiveGroups) ? c.kvOperationsAdaptiveGroups : [], u = Array.isArray(c?.kvStorageAdaptiveGroups) ? c.kvStorageAdaptiveGroups : [], d = {
    readCount: 0,
    writeCount: 0,
    deleteCount: 0,
    listCount: 0,
    storageBytes: 0
  };
  for (const f of l) {
    const m = String(f?.dimensions?.actionType || "").trim().toLowerCase(), p = Math.max(0, Number(f?.sum?.requests) || 0);
    m === "read" ? d.readCount += p : m === "write" ? d.writeCount += p : m === "delete" ? d.deleteCount += p : m === "list" && (d.listCount += p);
  }
  for (const f of u) d.storageBytes = Math.max(d.storageBytes, Math.max(0, Number(f?.max?.byteCount) || 0));
  return d;
}
async function Nf({ accountId: o, apiToken: e, databaseId: t, startIso: r, endIso: a }) {
  const n = String(o || "").trim(), s = String(e || "").trim(), i = String(t || "").trim();
  if (!n || !s || !i) return null;
  const c = await gn(n, s, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(n)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 1000
            filter: {
              databaseId: ${_e(i)}
              datetime_geq: ${_e(String(r || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
            }
          ) {
            sum { rowsRead rowsWritten readQueries writeQueries }
          }
        }
      }
    }`);
  if (!c) throw new Error("cf_graphql_empty_account");
  return (Array.isArray(c?.d1AnalyticsAdaptiveGroups) ? c.d1AnalyticsAdaptiveGroups : []).reduce((l, u) => ({
    rowsRead: l.rowsRead + Math.max(0, Number(u?.sum?.rowsRead) || 0),
    rowsWritten: l.rowsWritten + Math.max(0, Number(u?.sum?.rowsWritten) || 0),
    readQueries: l.readQueries + Math.max(0, Number(u?.sum?.readQueries) || 0),
    writeQueries: l.writeQueries + Math.max(0, Number(u?.sum?.writeQueries) || 0)
  }), {
    rowsRead: 0,
    rowsWritten: 0,
    readQueries: 0,
    writeQueries: 0
  });
}
async function If({ accountId: o, apiToken: e, databaseId: t, startIso: r, endIso: a, utcOffsetMinutes: n = F.Defaults.ScheduleUtcOffsetMinutes }) {
  const s = String(o || "").trim(), i = String(e || "").trim(), c = String(t || "").trim();
  if (!s || !i || !c) return [];
  const l = await gn(s, i, `
    query {
      viewer {
        accounts(filter: { accountTag: ${_e(s)} }) {
          d1AnalyticsAdaptiveGroups(
            limit: 10000
            filter: {
              databaseId: ${_e(c)}
              datetime_geq: ${_e(String(r || "").trim())}
              datetime_leq: ${_e(String(a || "").trim())}
            }
          ) {
            dimensions { datetimeHour }
            sum { rowsWritten writeQueries }
          }
        }
      }
    }`);
  if (!l) throw new Error("cf_graphql_empty_account");
  const u = Array.isArray(l?.d1AnalyticsAdaptiveGroups) ? l.d1AnalyticsAdaptiveGroups : [], d = /* @__PURE__ */ new Map();
  for (const f of u) {
    const m = String(f?.dimensions?.datetimeHour || "").trim();
    if (!m) continue;
    const p = Date.parse(m);
    if (!Number.isFinite(p)) continue;
    const h = ot(new Date(p), n), g = `${h.dateKey}:${h.hour}`, y = d.get(g) || {
      dateKey: h.dateKey,
      hour: h.hour,
      rowsWritten: 0,
      writeQueries: 0
    };
    y.rowsWritten += Math.max(0, Number(f?.sum?.rowsWritten) || 0), y.writeQueries += Math.max(0, Number(f?.sum?.writeQueries) || 0), d.set(g, y);
  }
  return [...d.values()].sort((f, m) => f.dateKey !== m.dateKey ? String(f.dateKey).localeCompare(String(m.dateKey)) : Number(f.hour) - Number(m.hour));
}
async function Mf({ cfAccountId: o, cfZoneId: e, cfApiToken: t, startIso: r, endIso: a, utcOffsetMinutes: n = F.Defaults.ScheduleUtcOffsetMinutes }) {
  if (!o || !t) return null;
  const s = await gn(o, t, `
  query {
    viewer {
      accounts(filter: { accountTag: ${_e(o)} }) {
        workersInvocationsAdaptive(limit: 10000, filter: { datetime_geq: ${_e(r)}, datetime_leq: ${_e(a)} }) {
          dimensions { datetime scriptName status }
          sum { requests }
        }
      }
    }
  }`), i = Array.isArray(s?.workersInvocationsAdaptive) ? s.workersInvocationsAdaptive : [], c = Array.from({ length: 24 }, (u, d) => ({
    label: String(d).padStart(2, "0") + ":00",
    total: 0
  }));
  let l = 0;
  for (const u of i) {
    const d = Number(u?.sum?.requests) || 0;
    l += d;
    const f = u?.dimensions?.datetime;
    if (!f) continue;
    const m = new Date(f);
    if (Number.isNaN(m.getTime())) continue;
    const p = ot(m, n).hour;
    c[p] && (c[p].total += d);
  }
  return {
    totalRequests: l,
    hourlySeries: c
  };
}
async function Pf({ cfAccountId: o, cfZoneId: e, cfApiToken: t, zoneNameFallback: r = "" }) {
  const a = [], n = (s, i = {}) => {
    const c = io(s);
    if (!c) return;
    const l = i.wildcard === !0 || c.wildcard === !0;
    a.push({
      hostname: c.hostname,
      path: String(i.path || ""),
      wildcard: l,
      score: bo(c.hostname, {
        wildcard: l,
        path: i.path || ""
      })
    });
  };
  if (o && e) try {
    const s = await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o).trim())}/workers/domains?zone_id=${encodeURIComponent(String(e).trim())}`, t);
    for (const i of s?.result || []) n(i?.hostname);
  } catch (s) {
    console.log("CF Workers domains lookup failed, will try routes", s);
  }
  if (!a.length && e) try {
    let s = 1, i = 1;
    do {
      const c = await Ee(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(e).trim())}/workers/routes?page=${s}&per_page=100`, t);
      i = Number(c?.result_info?.total_pages || c?.result_info?.totalPages || 1);
      for (const l of c?.result || []) {
        const u = _i(l?.pattern);
        u && n(u.hostname, {
          wildcard: u.wildcard,
          path: u.path
        });
      }
      s += 1;
    } while (s <= i && s <= 5);
  } catch (s) {
    console.log("CF Workers routes lookup failed", s);
  }
  return a.length ? (a.sort((s, i) => i.score - s.score || s.hostname.length - i.hostname.length || s.hostname.localeCompare(i.hostname)), a[0].hostname) : r || "未知域名 (请配置 CF 联动)";
}
function qt(o = "") {
  const e = String(o || "").trim();
  return /^[a-z0-9_][a-z0-9-_]*$/i.test(e) ? e : "";
}
function hn(o) {
  if (o !== void 0)
    try {
      return JSON.parse(JSON.stringify(o));
    } catch {
      return null;
    }
}
function He(o, e = [], t = {}) {
  if (typeof o == "string") return String(o).trim();
  if (!o || typeof o != "object") return "";
  const r = Array.isArray(e) ? e : [], a = [
    "id",
    "value",
    "name",
    "region",
    "provider",
    "providerId",
    "hostname",
    "host"
  ], n = r.length ? r : a, s = t?.allowFallback !== !1, i = [n];
  s && r.length && i.push(a);
  const c = /* @__PURE__ */ new Set();
  for (const l of i) for (const u of l) {
    if (c.has(u)) continue;
    c.add(u);
    const d = o?.[u];
    if (typeof d == "string" && d.trim()) return d.trim();
    if (!(!d || typeof d != "object"))
      for (const f of l) {
        const m = d?.[f];
        if (typeof m == "string" && m.trim()) return m.trim();
      }
  }
  return "";
}
function xf(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? e === "aws" ? "AWS" : e === "gcp" || e === "google" ? "GCP" : e === "azure" ? "Azure" : e.toUpperCase() : "";
}
function Of(o = "", e = "") {
  const t = String(o || "").trim().toLowerCase().replace(/_/g, "-"), r = String(e || "").trim().toLowerCase(), a = `${r}:${t}`;
  if (!t && !r) return {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
  const n = (s = []) => s.some((i) => a.includes(String(i || "").trim().toLowerCase()));
  return n([
    "wnam",
    "enam",
    "americas",
    "latam",
    "northamerica",
    "southamerica",
    "canada",
    "brazil",
    "mexico",
    "chile",
    "argentina",
    "eastus",
    "westus",
    "centralus",
    "northcentralus",
    "southcentralus",
    "us-east",
    "us-west",
    "us-central",
    "us-south",
    "ca-central",
    "ca-east",
    "sa-east",
    "na-",
    "sa-",
    "us-",
    "ca-"
  ]) ? {
    key: "americas",
    label: "美洲",
    sortOrder: 0
  } : n([
    "apac",
    "asia",
    "ap-",
    "australia",
    "japan",
    "korea",
    "singapore",
    "taiwan",
    "hongkong",
    "india",
    "jakarta",
    "sydney",
    "melbourne",
    "tokyo",
    "osaka",
    "seoul",
    "mumbai",
    "delhi",
    "perth",
    "newzealand"
  ]) ? {
    key: "asia-pacific",
    label: "亚太",
    sortOrder: 1
  } : n([
    "weur",
    "eeur",
    "europe",
    "eu-",
    "france",
    "germany",
    "italy",
    "spain",
    "poland",
    "sweden",
    "norway",
    "switzerland",
    "netherlands",
    "belgium",
    "ireland",
    "westeurope",
    "northeurope",
    "finland",
    "uk",
    "london"
  ]) ? {
    key: "europe",
    label: "欧洲",
    sortOrder: 2
  } : n([
    "mea",
    "middleeast",
    "me-",
    "af-",
    "africa",
    "uae",
    "qatar",
    "saudi",
    "israel",
    "bahrain",
    "kuwait",
    "southafrica",
    "johannesburg",
    "capetown",
    "doha",
    "telaviv"
  ]) ? {
    key: "middle-east-africa",
    label: "中东与非洲",
    sortOrder: 3
  } : {
    key: "other",
    label: "其他",
    sortOrder: 9
  };
}
function vf(o) {
  return Array.isArray(o) ? o : o && typeof o == "object" ? [o] : typeof o == "string" && o.trim() ? [{ value: o }] : [];
}
function Ff(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  for (const r of Array.isArray(o) ? o : []) {
    const a = String(r?.id || r?.provider || r?.providerId || "").trim().toLowerCase();
    if (!a) continue;
    const n = xf(a);
    for (const s of Array.isArray(r?.regions) ? r.regions : []) {
      const i = String(s?.id || s?.region || s?.value || "").trim();
      if (!i) continue;
      const c = `${a}:${i}`;
      if (t.has(c)) continue;
      t.add(c);
      const l = Of(i, a);
      e.push({
        provider: a,
        region: i,
        value: c,
        providerLabel: n,
        regionLabel: i,
        geoKey: l.key,
        geoLabel: l.label,
        geoSortOrder: l.sortOrder
      });
    }
  }
  return e.sort((r, a) => String(r.providerLabel || r.provider || "").localeCompare(String(a.providerLabel || a.provider || "")) || Number(r.geoSortOrder || 0) - Number(a.geoSortOrder || 0) || String(r.regionLabel || r.region || "").localeCompare(String(a.regionLabel || a.region || "")) || String(r.value || "").localeCompare(String(a.value || "")));
}
function Or(o, e = "", t = []) {
  const r = He(o, [
    "region",
    "value",
    "id"
  ]);
  if (!r) return "";
  if (r.includes(":")) return r;
  const a = He(e, [
    "provider",
    "providerId",
    "id",
    "value"
  ]).toLowerCase();
  if (a) return `${a}:${r}`;
  const n = (Array.isArray(t) ? t : []).filter((s) => String(s?.region || "").trim() === r || String(s?.value || "").trim() === r);
  return n.length === 1 ? String(n[0]?.value || "").trim() : r;
}
function ba(o = {}, e = []) {
  const t = o && typeof o == "object" ? o : {}, r = String(t?.mode || "").trim().toLowerCase(), a = vf(t?.target), n = Or(t?.region, t?.provider || t?.providerId || "", e), s = a.find((_) => !!Or(He(_, [
    "region",
    "value",
    "id"
  ]), He(_, ["provider", "providerId"]), e)), i = s ? Or(He(s, [
    "region",
    "value",
    "id"
  ]), He(s, ["provider", "providerId"]), e) : "", c = He(t?.hostname, ["hostname"], { allowFallback: !1 }) || He(t, ["hostname"], { allowFallback: !1 }), l = He(a.find((_) => He(_, ["hostname"], { allowFallback: !1 })), ["hostname"], { allowFallback: !1 }), u = He(t?.host, ["host"], { allowFallback: !1 }) || He(t, ["host"], { allowFallback: !1 }), d = He(a.find((_) => He(_, ["host"], { allowFallback: !1 })), ["host"], { allowFallback: !1 }), f = He(a[0], ["value", "id"]);
  let m = "default", p = "__default__", h = "", g = "default", y = "";
  return r === "smart" ? (m = "smart", p = "__smart__", g = "smart") : r === "targeted" ? c || l ? (m = "hostname", p = "", h = c || l, g = "") : u || d ? (m = "host", p = "", h = u || d, g = "") : (m = "targeted", p = i || n || "", h = p || f || "", g = "") : n ? (m = "region", p = n, g = "region", y = n) : c ? (m = "hostname", p = "", h = c, g = "") : u ? (m = "host", p = "", h = u, g = "") : (i || a.length > 0) && (m = "targeted", p = i || "", h = p || f || "", g = ""), {
    currentMode: m,
    currentValue: p,
    currentTarget: h,
    selectedMode: g,
    selectedRegion: y,
    isTargetedOverride: m === "hostname" || m === "host" || m === "targeted"
  };
}
function bc(o = []) {
  return (Array.isArray(o) ? o : []).filter((e) => e && typeof e == "object").map((e) => {
    const t = String(e.scope || "").trim(), r = String(e.permission || "").trim(), a = String(e.alternative || "").trim(), n = String(e.note || "").trim(), s = [];
    return t && s.push(`${t}级`), r && s.push(`"${r}"`), a && s.push(`（若当前令牌仅授予写权限，可改用 "${a}"）`), n && s.push(`：${n}`), s.join("");
  }).filter(Boolean);
}
function Ec(o = "", e = {}) {
  const t = String(o || "").trim().toLowerCase();
  if (t === "discovery") {
    const r = e?.includeRouteFallback !== !1, a = [{
      scope: "账号",
      permission: "Workers Scripts Read",
      alternative: "Workers Scripts Write",
      note: "用于读取 Workers Domains，按当前 host 自动识别脚本"
    }];
    return r && a.push({
      scope: "Zone",
      permission: "Workers Routes Read",
      alternative: "Workers Routes Write",
      note: "当 Domains 未命中时，允许继续从 Workers Routes 回退识别脚本"
    }), a;
  }
  return t === "settings_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Worker Settings"
  }] : t === "regions_read" ? [{
    scope: "账号",
    permission: "Workers Scripts Read",
    alternative: "Workers Scripts Write",
    note: "用于读取 Placement 区域列表"
  }] : t === "settings_write" ? [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "用于写入 Worker Settings / Placement"
  }] : [];
}
function Uf(o = "", e = "读取", t = {}) {
  const r = bc(Ec(o, t));
  return r.length <= 0 ? `Cloudflare Worker 放置${e}失败：API Token 权限不足` : `Cloudflare Worker 放置${e}失败：API Token 权限不足。至少需要：${r.join("；")}`;
}
function yn(o = "WORKER_PLACEMENT_FORBIDDEN", e = "", t = "读取", r = {}) {
  return we(o, Uf(e, t, r), 403, {
    permissionKind: String(e || "").trim(),
    requiredPermissions: Ec(e, r)
  });
}
function Xn(o = {}) {
  const e = o && typeof o == "object" && !Array.isArray(o) ? o : {}, t = Object.prototype.hasOwnProperty.call(e, "currentValue"), r = Object.prototype.hasOwnProperty.call(e, "selectedMode");
  return {
    configured: e.configured === !0,
    scriptName: String(e.scriptName || "").trim(),
    requestHost: re(e.requestHost || ""),
    currentMode: String(e.currentMode || "default").trim().toLowerCase() || "default",
    currentValue: t ? String(e.currentValue ?? "").trim() : "__default__",
    currentTarget: String(e.currentTarget || "").trim(),
    selectedMode: r ? String(e.selectedMode ?? "").trim().toLowerCase() : "default",
    selectedRegion: String(e.selectedRegion || "").trim(),
    options: Array.isArray(e.options) ? e.options : [],
    warning: String(e.warning || "").trim(),
    error: String(e.error || "").trim()
  };
}
function kf(o = "", e = "", t = !1) {
  const r = re(o), a = re(e);
  return !r || !a ? !1 : t ? r === a || r.endsWith(`.${a}`) : r === a;
}
function Hf(o = "", e = "/") {
  const t = String(o || "").trim(), r = String(e || "/").trim() || "/";
  return !t || t === "/" || t === "/*" ? !0 : t.endsWith("*") ? r.startsWith(t.slice(0, -1)) : r === t;
}
function $f(o = {}) {
  const e = re(o?.hostname || ""), t = qt(o?.service || o?.script || o?.name || "");
  return !e || !t ? null : {
    source: "domains",
    hostname: e,
    wildcard: !1,
    path: "/",
    scriptName: t,
    score: bo(e, {
      wildcard: !1,
      path: "/"
    })
  };
}
function Bf(o = {}) {
  const e = _i(o?.pattern), t = qt(o?.script || o?.service || o?.name || "");
  return !e || !t ? null : {
    source: "routes",
    hostname: e.hostname,
    wildcard: e.wildcard === !0,
    path: e.path || "/",
    pattern: e.pattern,
    scriptName: t,
    score: bo(e.hostname, {
      wildcard: e.wildcard === !0,
      path: e.path || "/"
    })
  };
}
function Es(o = [], e = "", t = "/") {
  const r = re(e), a = String(t || "/").trim() || "/", n = [];
  for (const s of Array.isArray(o) ? o : [])
    !s?.scriptName || !s?.hostname || kf(r, s.hostname, s.wildcard === !0) && Hf(s.path || "/", a) && n.push({
      ...s,
      exactHostname: r === re(s.hostname),
      exactPath: String(s.path || "/") === a
    });
  return n.length > 0 ? (n.sort((s, i) => Number(i.exactHostname) - Number(s.exactHostname) || Number(i.exactPath) - Number(s.exactPath) || Number(i.score || 0) - Number(s.score || 0) || String(s.hostname || "").length - String(i.hostname || "").length || String(s.scriptName || "").localeCompare(String(i.scriptName || ""))), n[0]) : null;
}
async function Tc(o, e) {
  const t = String(o || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  let a = null;
  try {
    a = await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(t)}/workers/placement/regions`, r);
  } catch (n) {
    throw Number(n?.status) === 403 ? yn("WORKER_PLACEMENT_REGIONS_FORBIDDEN", "regions_read", "读取") : n;
  }
  return Ff(a?.result?.providers);
}
async function Kf(o, e, t = {}) {
  const r = String(o || "").trim(), a = String(e || "").trim();
  if (!r || !a) return [];
  const n = new URL(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(r)}/workers/domains`), s = String(t?.zoneId || "").trim(), i = re(t?.hostname || ""), c = qt(t?.service || "");
  s && n.searchParams.set("zone_id", s), i && n.searchParams.set("hostname", i), c && n.searchParams.set("service", c);
  const l = await Ee(n.toString(), a);
  return Array.isArray(l?.result) ? l.result : [];
}
async function zf(o, e) {
  const t = String(o || "").trim(), r = String(e || "").trim();
  if (!t || !r) return [];
  const a = [];
  let n = 1, s = 1;
  do {
    const i = await Ee(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(t)}/workers/routes?page=${n}&per_page=100`, r);
    Array.isArray(i?.result) && a.push(...i.result), s = Number(i?.result_info?.total_pages || i?.result_info?.totalPages || 1), n += 1;
  } while (n <= s && n <= 10);
  return a;
}
async function vo({ cfAccountId: o, cfZoneId: e, cfApiToken: t, request: r }) {
  const a = new URL(r?.url || "https://invalid.local/"), n = re(a.hostname), s = String(a.pathname || "/").trim() || "/";
  if (!n) throw we("WORKER_PLACEMENT_HOST_INVALID", "当前请求 host 无效，无法识别 Worker 脚本", 400);
  const i = [], c = /* @__PURE__ */ new Set();
  let l = null, u = !1, d = !1;
  const f = [{
    zoneId: e,
    hostname: n
  }, { hostname: n }];
  for (const m of f) {
    const p = JSON.stringify({
      zoneId: String(m?.zoneId || "").trim(),
      hostname: re(m?.hostname || "")
    });
    if (!c.has(`query:${p}`)) {
      c.add(`query:${p}`);
      try {
        const h = await Kf(o, t, m);
        for (const y of h) {
          const _ = $f(y);
          if (!_) continue;
          const S = `${_.source}|${_.scriptName}|${_.hostname}|${_.path}`;
          c.has(S) || (c.add(S), i.push(_));
        }
        const g = Es(i, n, s);
        if (g?.scriptName) return {
          requestHost: n,
          requestPath: s,
          scriptName: g.scriptName,
          resolvedBy: g.source
        };
      } catch (h) {
        l = h, Number(h?.status) === 403 && (u = !0), console.warn("[worker_placement.resolve_script.domains_failed]", {
          requestHost: n,
          zoneId: String(m?.zoneId || "").trim(),
          hostname: re(m?.hostname || ""),
          reason: se(h)
        });
      }
    }
  }
  try {
    const m = Es(await zf(e, t).then((p) => p.map((h) => Bf(h)).filter(Boolean)), n, s);
    if (m?.scriptName) return {
      requestHost: n,
      requestPath: s,
      scriptName: m.scriptName,
      resolvedBy: m.source
    };
  } catch (m) {
    l = m, Number(m?.status) === 403 && (d = !0), console.warn("[worker_placement.resolve_script.routes_failed]", {
      requestHost: n,
      zoneId: String(e || "").trim(),
      reason: se(m)
    });
  }
  throw u || d ? yn("WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN", "discovery", "读取", { includeRouteFallback: d }) : l || we("WORKER_PLACEMENT_SCRIPT_UNRESOLVED", "未能根据当前站点自动识别 Worker 脚本，请确认当前 host 已绑定到该 Zone 的 Workers Domain 或 Workers Route", 400, { requestHost: n });
}
async function Ja(o, e, t) {
  let r = null;
  try {
    r = await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(t || "").trim());
  } catch (a) {
    throw Number(a?.status) === 403 ? yn("WORKER_PLACEMENT_SETTINGS_READ_FORBIDDEN", "settings_read", "读取") : a;
  }
  return $(r?.result) ? r.result : {};
}
async function qr(o, e, t, r = {}) {
  const a = new FormData();
  a.append("settings", new Blob([JSON.stringify(r && typeof r == "object" ? r : {})], { type: "application/json" }), "settings.json");
  let n = null;
  try {
    n = await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(String(o || "").trim())}/workers/scripts/${encodeURIComponent(String(e || "").trim())}/settings`, String(t || "").trim(), {
      method: "PATCH",
      body: a
    });
  } catch (s) {
    throw Number(s?.status) === 403 ? yn("WORKER_PLACEMENT_SETTINGS_WRITE_FORBIDDEN", "settings_write", "保存") : s;
  }
  return $(n?.result) ? n.result : {};
}
function Qa(o, e = "read") {
  const t = e === "write" ? "保存" : e === "default" ? "恢复默认" : "读取", r = String(o?.message || o || "").trim() || `Worker 放置${t}失败`, a = Number(o?.status) || Number(/cf_api_http_(\d+)/i.exec(r)?.[1] || 0), n = String(o?.code || "").trim().toUpperCase();
  return n.startsWith("WORKER_PLACEMENT_") && String(o?.message || "").trim() ? o.message : a === 401 ? `Cloudflare Worker 放置${t}失败：API Token 无效` : a === 403 ? `Cloudflare Worker 放置${t}失败：API Token 权限不足` : a === 404 && e !== "read" ? "Cloudflare Worker 放置保存失败：未找到目标 Worker 脚本" : a === 404 ? "Cloudflare Worker 放置读取失败：未找到目标 Worker 脚本" : n === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || n === "WORKER_PLACEMENT_HOST_INVALID" || n === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? o.message : r;
}
function Fo(o = {}) {
  const e = String(o?.cfAccountId || "").trim(), t = String(o?.cfZoneId || "").trim(), r = String(o?.cfApiToken || "").trim(), a = [];
  if (e || a.push("cfAccountId"), t || a.push("cfZoneId"), r || a.push("cfApiToken"), a.length <= 0) return {
    cfAccountId: e,
    cfZoneId: t,
    cfApiToken: r
  };
  throw we("WORKER_PLACEMENT_CONFIG_REQUIRED", "请先在账号设置中填写并保存 Cloudflare Account ID、Zone ID 与 API Token", 400, { missingFields: a });
}
function Uo(o = "") {
  const e = qt(o);
  return e ? `sys:worker_placement_region:v1:${e}` : "";
}
function zt(o = "WORKER_PLACEMENT_KV_FAILED", e = "Worker 放置 KV 持久化失败", t = null) {
  return we(o, e, 503, t);
}
function Wf(o) {
  return on(o) && String(o?.code || "").trim().toUpperCase().startsWith("WORKER_PLACEMENT_") && String(o?.details?.dependency || "").trim().toUpperCase() === "KV";
}
function Rc(o = {}, e = "") {
  const t = qt(e);
  if (!t || !$(o)) return null;
  const r = Or(o?.region, o?.provider || o?.providerId || "", []);
  return r ? {
    scriptName: t,
    region: r,
    updatedAt: String(o?.updatedAt || "").trim()
  } : null;
}
async function Ac(o, e = "") {
  if (!o) return null;
  const t = Uo(e);
  return t ? Rc(await xe(o, t, { type: "json" }), e) : null;
}
async function Cc(o, e = "", t = "") {
  if (!o) throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 未配置", {
    dependency: "KV",
    operation: "put",
    reason: "kv_not_configured"
  });
  const r = Uo(e), a = qt(e), n = Or(t, "", []);
  if (!r || !a || !n) throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：Region 数据无效", {
    dependency: "KV",
    operation: "put",
    key: r,
    scriptName: a,
    region: n,
    reason: "invalid_region_override"
  });
  const s = {
    scriptName: a,
    region: n,
    updatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await o.put(r, JSON.stringify(s));
  } catch (i) {
    throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", "Worker 放置 Region 持久化失败：KV 写入异常", {
      dependency: "KV",
      operation: "put",
      key: r,
      scriptName: a,
      region: n,
      reason: se(i)
    });
  }
  return s;
}
async function Ts(o, e = "") {
  if (!o) throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 未配置", {
    dependency: "KV",
    operation: "delete",
    reason: "kv_not_configured"
  });
  const t = Uo(e), r = qt(e);
  if (!t || !r) return !1;
  try {
    await o.delete(t);
  } catch (a) {
    throw zt("WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", "Worker 放置 Region 清理失败：KV 删除异常", {
      dependency: "KV",
      operation: "delete",
      key: t,
      scriptName: r,
      reason: se(a)
    });
  }
  return !0;
}
function Gf(o = "") {
  const e = String(o || "").trim();
  return e ? `当前已保存的 Worker Placement Region（${e}）已不在 Cloudflare 可选区域列表中，请重新选择并保存` : "当前已保存的 Worker Placement Region 已不在 Cloudflare 可选区域列表中，请重新选择并保存";
}
function Rs(o = "", e = "", t = "", r = [], a = {}) {
  const n = Or(t, "", r), s = Array.isArray(r) ? r : [], i = s.find((u) => String(u?.value || "").trim() === n) || null, c = a?.regionError || null;
  let l = String(a?.error || "").trim();
  return !l && c ? l = Qa(c, "read") : !l && n && s.length > 0 && !i && (l = Gf(n)), Xn({
    configured: a?.configured !== !1,
    scriptName: o,
    requestHost: e,
    currentMode: "region",
    currentValue: n,
    currentTarget: "",
    selectedMode: "region",
    selectedRegion: n,
    options: s,
    warning: "",
    error: l
  });
}
async function In(o, e, t, r = {}) {
  let a = !1, n = !1, s = "";
  try {
    const i = Rc(r?.previousOverride, e), c = r?.originalState && typeof r.originalState == "object" ? r.originalState : ba(r?.originalPlacement, r?.regionOptions);
    if (i?.region)
      return a = !0, await qr(o, e, t, { placement: { region: i.region } }), n = !0, {
        rollbackAttempted: a,
        rollbackSucceeded: n,
        rollbackError: s
      };
    a = !0, String(c?.currentMode || "").trim().toLowerCase() === "default" ? await wc(o, e, t, r?.regionOptions) : await qr(o, e, t, { placement: hn(r?.originalPlacement) }), n = !0;
  } catch (i) {
    n = !1, s = se(i);
  }
  return {
    rollbackAttempted: a,
    rollbackSucceeded: n,
    rollbackError: s
  };
}
async function As(o = {}, e, t = {}) {
  let r = "", a = "";
  try {
    const n = Fo(o), s = await vo({
      ...n,
      request: e
    });
    r = s.scriptName, a = s.requestHost;
    const i = await Ac(t?.kv, s.scriptName);
    let c = [], l = null;
    try {
      c = await Tc(n.cfAccountId, n.cfApiToken);
    } catch (d) {
      l = d;
    }
    if (i?.region) return Rs(s.scriptName, s.requestHost, i.region, c, {
      configured: !l,
      regionError: l
    });
    const u = ba(hn((await Ja(n.cfAccountId, s.scriptName, n.cfApiToken))?.placement), c);
    return u.currentMode === "region" && u.currentValue ? (await Cc(t?.kv, s.scriptName, u.currentValue), Rs(s.scriptName, s.requestHost, u.currentValue, c, {
      configured: !l,
      regionError: l
    })) : Xn({
      configured: !l,
      scriptName: s.scriptName,
      requestHost: s.requestHost,
      currentMode: u.currentMode,
      currentValue: u.currentValue,
      currentTarget: u.currentTarget,
      selectedMode: u.selectedMode,
      selectedRegion: u.selectedRegion,
      options: c,
      warning: "",
      error: l ? Qa(l, "read") : ""
    });
  } catch (n) {
    if (po(n) || Wf(n) || t?.softFail !== !0) throw n;
    return Xn({
      configured: !1,
      scriptName: r,
      requestHost: a,
      selectedMode: "",
      currentMode: "default",
      currentValue: "__default__",
      error: Qa(n, "read")
    });
  }
}
async function wc(o, e, t, r = []) {
  const a = await Ja(o, e, t), n = hn(a?.placement), s = ba(n, r);
  if (s.currentMode === "default") return {
    settings: a,
    placementState: s,
    clearedBy: "already_default"
  };
  for (const u of [{
    tag: "empty_object",
    patch: { placement: {} }
  }, {
    tag: "null",
    patch: { placement: null }
  }]) {
    await qr(o, e, t, u.patch);
    const d = await Ja(o, e, t), f = ba(d?.placement, r);
    if (f.currentMode === "default") return {
      settings: d,
      placementState: f,
      clearedBy: u.tag
    };
  }
  let i = !1, c = !1, l = "";
  if (n !== void 0) {
    i = !0;
    try {
      await qr(o, e, t, { placement: n }), c = !0;
    } catch (u) {
      c = !1, l = se(u);
    }
  }
  throw we("WORKER_PLACEMENT_DEFAULT_BLOCKED", "Cloudflare 当前接口未验证出可安全恢复 Default Placement；本次已停止，未使用近似映射", 409, {
    scriptName: e,
    rollbackAttempted: i,
    rollbackSucceeded: c,
    rollbackError: l
  });
}
function jf(o = {}, e = {}) {
  const { kernel: t } = o, { CacheManager: r, buildAdminShellState: a, buildAdminUiContract: n, withAdminShellRuntimeStatus: s } = o;
  return {
    async getDashboardSnapshot(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await ue(c);
      return ee(await t.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getDashboardStats(i, { env: c, ctx: l, kv: u, db: d }) {
      const f = await ue(c), m = await t.getDashboardSnapshotPayload(c, {
        ctx: l,
        kv: u,
        db: d,
        config: f,
        forceRefresh: i?.forceRefresh === !0
      });
      return ee({
        ...m?.stats && typeof m.stats == "object" ? m.stats : {},
        cacheMeta: m?.cacheMeta && typeof m.cacheMeta == "object" ? m.cacheMeta : {}
      });
    },
    async getMonthlyTrafficStats(i, { env: c, ctx: l }) {
      const u = await ue(c);
      return ee(await t.getDashboardMonthlyTrafficPayload(c, {
        ctx: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      }));
    },
    async getRuntimeStatus(i, { env: c, db: l }) {
      const u = await ue(c), d = await t.getRuntimeStatusPayload(c, {
        db: l,
        config: u,
        forceRefresh: i?.forceRefresh === !0
      });
      return ee({
        status: d?.status && typeof d.status == "object" ? d.status : {},
        cacheMeta: d?.cacheMeta && typeof d.cacheMeta == "object" ? d.cacheMeta : {}
      });
    },
    async getAdminBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      try {
        const f = await ue(c), m = $e(c), [p, h] = await Promise.all([r.getNodesListStrict(c, l), t.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        })]), g = await t.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: p
        });
        return ee({
          adminPath: it(c),
          loginPath: wo(c),
          initHealth: m,
          config: Ct(f),
          hostDomain: ze(c),
          legacyHost: Kr(c),
          contract: n(),
          nodes: p,
          shell: a(c, m, f),
          runtimeStatus: h?.status && typeof h.status == "object" ? h.status : s({}, c, f, m),
          revisions: g,
          generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (f) {
        throw wt(f, "ADMIN_BOOTSTRAP_READ_FAILED", "管理台启动数据加载失败：KV 读取异常", "admin.read.bootstrap");
      }
    },
    async getSettingsBootstrap(i, { env: c, ctx: l, kv: u, db: d }) {
      let f;
      try {
        f = await ue(c);
      } catch (g) {
        throw wt(g, "SETTINGS_BOOTSTRAP_READ_FAILED", "设置页加载失败：KV 读取异常", "admin.read.settings_bootstrap");
      }
      let m = [], p = {}, h = {};
      try {
        m = await r.getNodesListStrict(c, l);
      } catch (g) {
        console.warn("[settings_bootstrap.nodes_degraded]", se(g));
      }
      try {
        const g = await t.getRuntimeStatusPayload(c, {
          ctx: l,
          kv: u,
          db: d,
          config: f
        });
        p = g?.status && typeof g.status == "object" ? g.status : {};
      } catch (g) {
        console.warn("[settings_bootstrap.runtime_status_degraded]", se(g));
      }
      try {
        h = await t.getAdminRevisionsForRead({
          env: c,
          kv: u,
          db: d
        }, {
          ctx: l,
          config: f,
          nodes: m
        });
      } catch (g) {
        console.warn("[settings_bootstrap.revisions_degraded]", se(g));
      }
      return ee({
        config: Ct(f),
        hostDomain: ze(c),
        legacyHost: Kr(c),
        contract: n(),
        nodes: m,
        runtimeStatus: s(p, c, f, $e(c)),
        revisions: h,
        generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    },
    async getWorkerPlacementStatus(i, { env: c, request: l, kv: u }) {
      try {
        return ee(await As(await ue(c), l, {
          softFail: !0,
          kv: u
        }));
      } catch (d) {
        throw wt(d, "WORKER_PLACEMENT_READ_FAILED", "Worker 放置状态读取失败：KV 读取异常", "admin.read.worker_placement");
      }
    },
    async saveWorkerPlacement(i, { env: c, request: l, kv: u }) {
      let d;
      try {
        d = await ue(c);
      } catch (m) {
        throw wt(m, "WORKER_PLACEMENT_SAVE_FAILED", "Worker 放置保存失败：KV 读取异常", "admin.write.worker_placement");
      }
      const f = String(i?.mode || "").trim().toLowerCase();
      if (f !== "default" && f !== "smart" && f !== "region") return z("WORKER_PLACEMENT_MODE_INVALID", "请选择有效的 Worker 放置模式");
      try {
        const m = Fo(d), p = await vo({
          ...m,
          request: l
        }), h = await Ac(u, p.scriptName), g = await Tc(m.cfAccountId, m.cfApiToken), y = hn((await Ja(m.cfAccountId, p.scriptName, m.cfApiToken))?.placement), _ = ba(y, g);
        if (f === "region") {
          const S = String(i?.region || "").trim(), A = g.find((E) => String(E?.value || "").trim() === S);
          if (!A) return z("WORKER_PLACEMENT_REGION_INVALID", "所选 Placement 区域已失效，请刷新后重试");
          await qr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { region: A.value } });
          try {
            await Cc(u, p.scriptName, A.value);
          } catch (E) {
            const T = await In(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: h,
              originalPlacement: y,
              originalState: _,
              regionOptions: g
            });
            throw zt(E?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_WRITE_FAILED", String(E?.message || "Worker 放置 Region 持久化失败：KV 写入异常"), {
              ...$(E?.details) ? E.details : {},
              requestedMode: f,
              dependency: "KV",
              region: A.value,
              rollbackAttempted: T.rollbackAttempted,
              rollbackSucceeded: T.rollbackSucceeded,
              rollbackError: T.rollbackError
            });
          }
        } else if (f === "smart") {
          if (await qr(m.cfAccountId, p.scriptName, m.cfApiToken, { placement: { mode: "smart" } }), h) try {
            await Ts(u, p.scriptName);
          } catch (S) {
            const A = await In(m.cfAccountId, p.scriptName, m.cfApiToken, {
              previousOverride: h,
              originalPlacement: y,
              originalState: _,
              regionOptions: g
            });
            throw zt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
              ...$(S?.details) ? S.details : {},
              requestedMode: f,
              dependency: "KV",
              rollbackAttempted: A.rollbackAttempted,
              rollbackSucceeded: A.rollbackSucceeded,
              rollbackError: A.rollbackError
            });
          }
        } else if (await wc(m.cfAccountId, p.scriptName, m.cfApiToken, g), h) try {
          await Ts(u, p.scriptName);
        } catch (S) {
          const A = await In(m.cfAccountId, p.scriptName, m.cfApiToken, {
            previousOverride: h,
            originalPlacement: y,
            originalState: _,
            regionOptions: g
          });
          throw zt(S?.code || "WORKER_PLACEMENT_REGION_OVERRIDE_DELETE_FAILED", String(S?.message || "Worker 放置 Region 清理失败：KV 删除异常"), {
            ...$(S?.details) ? S.details : {},
            requestedMode: f,
            dependency: "KV",
            rollbackAttempted: A.rollbackAttempted,
            rollbackSucceeded: A.rollbackSucceeded,
            rollbackError: A.rollbackError
          });
        }
        return ee(await As(d, l, {
          softFail: !1,
          kv: u
        }));
      } catch (m) {
        return z("WORKER_PLACEMENT_SAVE_FAILED", Qa(m, f === "default" ? "default" : "write"), Ne(m?.status, f === "default" ? 409 : 400), $(m?.details) ? m.details : null);
      }
    }
  };
}
var Lc = 600 * 1e3, Vf = Lc;
function nt(o = "", e = "manual") {
  const t = String(e || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", r = String(o || "").trim().toLowerCase();
  return t !== "manual" ? "smart" : r === "full" ? "full" : "smart";
}
function qf(o = "", e = "manual") {
  return nt(o, e) === "full";
}
function ko(o = "worker.js") {
  const e = String(o || "").trim().split(/[\\/]+/).pop() || "";
  return e && /\.js$/i.test(e) ? e : "";
}
function Dc(o = "") {
  const e = String(o || "");
  return e && (/(^|\n)\s*export\s+/m.test(e) || /(^|\n)\s*import\s+(?:[\w*{]|["'])/m.test(e)) ? "module" : "service-worker";
}
function Xf(o = "", e = "worker.js") {
  const t = ko(e);
  if (t.toLowerCase() !== "worker.js") throw we("WORKER_UPLOAD_FILE_NAME_INVALID", "Worker 文件名必须是 worker.js", 400, { fileName: t || String(e || "").trim() });
  const r = String(o || ""), a = new TextEncoder().encode(r).length;
  if (!r.trim()) throw we("WORKER_UPLOAD_EMPTY", "worker.js 不能为空", 400);
  if (a > 3145728) throw we("WORKER_UPLOAD_TOO_LARGE", `worker.js 体积超过限制（${a} bytes）`, 400, {
    contentLength: a,
    maxBytes: em
  });
  return {
    fileName: t,
    scriptContent: r,
    contentLength: a,
    syntax: Dc(r)
  };
}
function Yf(o = "", e = "module") {
  const t = ko(o) || "worker.js";
  return e === "module" ? { main_module: t } : { body_part: t };
}
function Jf(o = "module") {
  return o === "module" ? "application/javascript+module" : "application/javascript";
}
function Nc() {
  return [{
    scope: "账号",
    permission: "Workers Scripts Write",
    alternative: "",
    note: "这是账号级 Worker 脚本编辑权限，用于上传 .js 文件并仅更新脚本代码，不修改 bindings 或 settings"
  }];
}
function Ic(o = "更新") {
  const e = bc(Nc());
  return e.length > 0 ? `Cloudflare Worker 脚本${o}失败：API Token 权限不足。至少需要：${e.join("；")}` : `Cloudflare Worker 脚本${o}失败：API Token 权限不足`;
}
function Qf(o = "WORKER_SCRIPT_UPDATE_FORBIDDEN", e = "更新") {
  return we(o, Ic(e), 403, { requiredPermissions: Nc() });
}
async function Zf(o, e, t, r, a = {}) {
  const n = String(o || "").trim(), s = qt(e), i = String(t || "").trim(), c = ko(a?.fileName) || "worker.js", l = String(r || ""), u = Dc(l), d = new FormData();
  d.append("metadata", new Blob([JSON.stringify(Yf(c, u))], { type: "application/json" }), "metadata.json"), d.append("files", new Blob([l], { type: Jf(u) }), c);
  let f = null;
  try {
    f = await Ee(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(n)}/workers/scripts/${encodeURIComponent(s)}/content`, i, {
      method: "PUT",
      body: d
    });
  } catch (m) {
    throw Number(m?.status) === 403 ? Qf("WORKER_SCRIPT_UPDATE_FORBIDDEN", "更新") : m;
  }
  return {
    syntax: u,
    fileName: c,
    result: $(f?.result) ? f.result : {}
  };
}
function Cs(o) {
  const e = String(o?.message || o || "").trim() || "Worker 脚本更新失败", t = Number(o?.status) || Number(/cf_api_http_(\d+)/i.exec(e)?.[1] || 0), r = String(o?.code || "").trim().toUpperCase();
  return r === "WORKER_SCRIPT_UPDATE_FORBIDDEN" && String(o?.message || "").trim() ? o.message : r === "WORKER_PLACEMENT_SCRIPT_DISCOVERY_FORBIDDEN" ? String(o?.message || "").replace("Cloudflare Worker 放置读取失败", "Cloudflare Worker 脚本定位失败").trim() : r === "WORKER_PLACEMENT_SCRIPT_UNRESOLVED" || r === "WORKER_PLACEMENT_HOST_INVALID" || r === "WORKER_PLACEMENT_CONFIG_REQUIRED" ? e : t === 401 ? "Cloudflare Worker 和 HTML 更新失败：API Token 无效" : t === 403 ? Ic("更新") : t === 404 ? "Cloudflare Worker 和 HTML 更新失败：未找到目标 Worker 脚本" : e;
}
var em = 3 * 1024 * 1024;
function tm(o = {}, e = {}) {
  const { kernel: t } = o, { buildAdminLocalIndexUploadRecord: r } = o;
  return {
    async loadConfig(a, { env: n, kv: s, db: i, ctx: c }) {
      try {
        const l = await ue(n), u = await t.getAdminRevisionsForRead({
          env: n,
          kv: s,
          db: i
        }, {
          ctx: c,
          config: l
        });
        return ee({
          config: Ct(l),
          revisions: u
        });
      } catch (l) {
        throw wt(l, "CONFIG_READ_FAILED", "设置读取失败：KV 读取异常", "admin.read.config");
      }
    },
    async previewConfig(a, { env: n, kv: s, ctx: i }) {
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : {};
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const l = await ue(n), u = await t.prepareRuntimeConfigPersistence(Dn(c, l), {
        env: n,
        kv: s,
        ctx: i
      });
      return ee({
        config: Ct(u.nextConfig),
        hostPrefixDnsSyncCount: u.dnsPlans.length
      });
    },
    async previewTidyData(a, { env: n, kv: s, db: i }) {
      const c = String(a?.scope || "kv").trim().toLowerCase() === "d1" ? "d1" : "kv";
      try {
        if (c === "d1") {
          if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
          const d = await t.buildD1TidyPlan(n, {
            db: i,
            kv: s,
            maintenanceMode: nt(a?.maintenanceMode, "manual")
          }), f = d.schemaStatus?.schemaReady !== !0, m = f ? "" : await t.createD1TidyPlanToken(n, d);
          return ee({
            success: !0,
            scope: "d1",
            planHash: f ? "" : d.planHash,
            planToken: m,
            planExpiresAt: m ? new Date(H() + Vf).toISOString() : "",
            requiresSchemaInitialization: f,
            summary: d.summary,
            ...d.preview
          });
        }
        if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
        const l = await t.buildKvTidyPlan(n, {
          kv: s,
          db: i
        }), u = await t.createKvTidyPlanToken(n, l);
        return ee({
          success: !0,
          scope: "kv",
          planHash: l.planHash,
          planToken: u,
          planExpiresAt: new Date(H() + Lc).toISOString(),
          summary: l.summary,
          ...l.preview
        });
      } catch (l) {
        const u = l?.message || String(l);
        return z(String(l?.code || "TIDY_PREVIEW_FAILED"), u, Ne(l?.status, 500), {
          scope: c,
          ...$(l?.details) ? l.details : {}
        });
      }
    },
    async updateWorkerAndAdminIndex(a, { env: n, request: s, kv: i, ctx: c }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      let l;
      try {
        l = await ue(n);
      } catch (S) {
        throw wt(S, "WORKER_HTML_UPDATE_FAILED", "Worker 和 HTML 更新失败：KV 读取异常", "admin.write.worker_html");
      }
      const u = typeof a?.workerScriptContent == "string" ? a.workerScriptContent : "", d = typeof a?.indexHtml == "string" ? a.indexHtml : "";
      if (!u.trim() || !d.trim()) return z("WORKER_HTML_FILES_REQUIRED", "必须同时上传 worker.js 和 index.html，缺一不可", 400, {
        workerFileProvided: !!u.trim(),
        indexFileProvided: !!d.trim()
      });
      let f, m;
      try {
        f = Xf(u, a?.workerFileName);
        const S = String(a?.indexFileName || "").trim().split(/[\\/]+/).pop() || "";
        if (S.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: S || String(a?.indexFileName || "").trim() });
        m = await r(d, S);
      } catch (S) {
        return z(String(S?.code || "WORKER_HTML_VALIDATION_FAILED"), se(S, "Worker 或 HTML 文件校验失败"), Ne(S?.status, 400), $(S?.details) ? S.details : null);
      }
      let p, h;
      try {
        p = Fo(l), h = await vo({
          ...p,
          request: s
        });
      } catch (S) {
        return z(String(S?.code || "WORKER_SCRIPT_CONTEXT_FAILED"), Cs(S), Ne(S?.status, 400), $(S?.details) ? S.details : null);
      }
      let g;
      try {
        g = await t.persistAdminIndexUpload(m, {
          env: n,
          kv: i,
          ctx: c
        });
      } catch (S) {
        return z(String(S?.code || "ADMIN_INDEX_UPLOAD_FAILED"), se(S, "index.html 激活失败"), Ne(S?.status, 500), $(S?.details) ? S.details : null);
      }
      let y;
      try {
        y = await Zf(p.cfAccountId, h.scriptName, p.cfApiToken, f.scriptContent, { fileName: f.fileName });
      } catch (S) {
        let A = !1, E = !1, T = "", w = "";
        try {
          const D = await t.rollbackAdminIndexUploadActivation(g.previousConfig, g.config, {
            env: n,
            kv: i,
            ctx: c
          });
          A = !0, E = D.skipped === !0, T = String(D.reason || "").trim();
        } catch (D) {
          w = se(D, "rollback_failed");
        }
        return z(String(S?.code || "WORKER_HTML_UPDATE_FAILED"), Cs(S), Ne(S?.status, 400), {
          ...$(S?.details) ? S.details : {},
          htmlRollbackAttempted: !0,
          htmlRollbackSucceeded: A,
          htmlRollbackSkipped: E,
          htmlRollbackReason: T,
          htmlRollbackError: w
        });
      }
      const _ = y.result;
      return ee({
        success: !0,
        scriptName: h.scriptName,
        requestHost: h.requestHost,
        worker: {
          fileName: y.fileName,
          bytes: f.contentLength,
          syntax: y.syntax,
          modifiedOn: String(_?.modified_on || _?.modifiedOn || "").trim(),
          etag: String(_?.etag || "").trim(),
          handlers: Array.isArray(_?.handlers) ? _.handlers : [],
          hasModules: _?.has_modules === !0 || _?.hasModules === !0
        },
        html: {
          fileName: g.record.fileName,
          bytes: g.record.bytes,
          revision: g.record.revision,
          uploadedAt: g.record.uploadedAt
        },
        config: Ct(g.config),
        revisions: await t.getAdminRevisions(n, {
          ctx: c,
          config: g.config
        })
      });
    },
    async saveConfig(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = await ue(n), l = a.config ? await t.persistRuntimeConfig(Dn(a.config, c), {
        env: n,
        kv: i,
        ctx: s,
        expectedConfigRevision: a?.expectedConfigRevision,
        mutationId: a?.mutationId,
        forceKvCommit: !0
      }) : c, u = await t.getAdminRevisions(n, {
        ctx: s,
        config: l
      });
      return ee({
        success: !0,
        committed: !0,
        config: Ct(l),
        revision: String(u.configRevision || ""),
        revisions: u
      });
    },
    async uploadAdminIndex(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      try {
        const c = String(a?.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (c.toLowerCase() !== "index.html") return z("ADMIN_INDEX_UPLOAD_FILE_NAME_INVALID", "HTML 文件名必须是 index.html", 400, { fileName: c || String(a?.fileName || "").trim() });
        const l = await r(a?.indexHtml, c), u = await t.persistAdminIndexUpload(l, {
          env: n,
          kv: i,
          ctx: s
        });
        return ee({
          success: !0,
          source: "local_upload",
          revision: u.record.revision,
          assetRevision: u.record.assetRevision,
          sourceUrl: u.record.sourceUrl,
          fileName: u.record.fileName,
          bytes: u.record.bytes,
          uploadedAt: u.record.uploadedAt,
          config: Ct(u.config),
          revisions: await t.getAdminRevisions(n, {
            ctx: s,
            config: u.config
          })
        });
      } catch (c) {
        return z(String(c?.code || "ADMIN_INDEX_UPLOAD_FAILED"), se(c, "本地 index.html 上传失败"), Ne(c?.status, 500), $(c?.details) ? c.details : null);
      }
    },
    async exportConfig(a, { env: n, ctx: s, request: i }) {
      const c = t.getKV(n), l = a?.includeSecrets === !0;
      if (l && String(i.headers.get("X-Admin-Confirm") || "").trim() !== "exportConfig") return z("CONFIRMATION_REQUIRED", "Exporting secrets requires explicit confirmation", 428);
      const u = await ue(n), d = pt(n, u), f = c && d.localUploadRevision ? await t.getAdminIndexUploadRecord(c, d.localUploadRevision) : null, m = c ? (await t.loadAllNodeEntitiesFromKvStrict(c, { ctx: s })).filter(Boolean) : [], p = {
        version: F.Defaults.Version,
        exportTime: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        nodes: m,
        config: l ? u : ps(u),
        adminIndexUpload: f ? {
          version: f.version,
          revision: f.revision,
          fileName: f.fileName,
          uploadedAt: f.uploadedAt,
          bytes: f.bytes,
          html: f.html
        } : null,
        secretsRedacted: l !== !0,
        containsSecrets: l === !0
      }, h = new TextEncoder().encode(JSON.stringify({
        action: "importFull",
        ...p
      })).length;
      return h > 12517376 ? z("FULL_BACKUP_TOO_LARGE", "完整备份超过安全回导上限，请先分别导出节点与设置并精简超大节点字段", 413, {
        importRequestBytes: h,
        maxBytes: Uu,
        nodeCount: p.nodes.length,
        adminIndexBytes: Number(f?.bytes) || 0
      }) : ee(p);
    },
    async exportSettings(a, { env: n, request: s }) {
      const i = a?.includeSecrets === !0;
      if (i && String(s.headers.get("X-Admin-Confirm") || "").trim() !== "exportSettings") return z("CONFIRMATION_REQUIRED", "导出完整密钥需要显式确认", 428);
      const c = await ue(n);
      return ee({
        version: F.Defaults.Version,
        type: "settings-only",
        exportTime: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        config: i ? c : ps(c),
        secretsRedacted: i !== !0,
        containsSecrets: i === !0
      });
    },
    async importSettings(a, { env: n, ctx: s, kv: i }) {
      if (!i) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace", 503);
      const c = a?.config && typeof a.config == "object" && !Array.isArray(a.config) ? a.config : a?.settings && typeof a.settings == "object" && !Array.isArray(a.settings) ? a.settings : null;
      if (!c) return z("INVALID_SETTINGS_BACKUP", "设置备份文件无效，缺少 config/settings 对象");
      const l = await ue(n), u = await t.persistRuntimeConfig(Dn(c, l), {
        env: n,
        kv: i,
        ctx: s,
        forceKvCommit: !0
      }), d = await t.getAdminRevisions(n, {
        ctx: s,
        config: u
      });
      return ee({
        success: !0,
        config: Ct(u),
        revisions: d,
        generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
function rm(o = {}, e = {}) {
  const { kernel: t } = o, { CacheManager: r } = o;
  return {
    async list(a, { env: n, ctx: s, kv: i, db: c }) {
      try {
        const l = await r.getNodesListStrict(n, s);
        return ee({
          nodes: l,
          revisions: await t.getAdminRevisionsForRead({
            env: n,
            kv: i,
            db: c
          }, {
            ctx: s,
            nodes: l
          })
        });
      } catch (l) {
        throw wt(l, "NODE_LIST_READ_FAILED", "节点列表读取失败：KV 读取异常", "admin.read.nodes");
      }
    },
    async getDashboardD1WriteHotspot(a, { env: n, ctx: s }) {
      const i = await ue(n);
      return ee(await t.buildDashboardD1WriteHotspotPayload(n, {
        config: i,
        nowMs: H()
      }));
    },
    async getDashboardCoreStats(a, { env: n, ctx: s, kv: i, db: c }) {
      const l = await ue(n);
      return ee(await t.buildDashboardStatsPayload(n, {
        ctx: s,
        kv: i,
        db: c,
        config: l,
        skipD1WriteHotspot: !0
      }));
    },
    async getDashboardCachedSnapshot(a, { env: n, db: s }) {
      const i = await ue(n);
      return ee({ snapshot: await t.getDashboardCachedSnapshotPayload(n, {
        db: s,
        config: i
      }) });
    },
    async getNode(a, { env: n, ctx: s, kv: i, db: c }) {
      const l = String(a?.name || "").trim();
      if (!l) return z("NODE_NAME_REQUIRED", "请提供节点路径");
      const u = await t.getNodeForRead(l, n);
      if (!u) return z("NODE_NOT_FOUND", "节点不存在", 404);
      const d = {
        name: l.toLowerCase(),
        ...u
      }, f = qm(l, u);
      return ee({
        success: !0,
        node: d,
        warnings: f ? [f] : [],
        revisions: await t.getAdminRevisionsForRead({
          env: n,
          kv: i,
          db: c
        }, { ctx: s })
      });
    }
  };
}
function Yn(o = [], e = {}) {
  const t = e.renameMap instanceof Map ? e.renameMap : new Map(Object.entries(e.renameMap && typeof e.renameMap == "object" ? e.renameMap : {})), r = /* @__PURE__ */ new Map();
  for (const [l, u] of t.entries()) {
    const d = String(l || "").trim().toLowerCase(), f = String(u || "").trim();
    !d || !f || r.set(d, f);
  }
  const a = new Set(ht(e.removedNames || []).map((l) => String(l || "").trim().toLowerCase()).filter(Boolean)), n = e.allowedNames === void 0 ? null : ht(e.allowedNames || []).map((l) => [String(l || "").trim().toLowerCase(), String(l || "").trim()]).filter(([l, u]) => l && u), s = n ? new Map(n) : null, i = [], c = /* @__PURE__ */ new Set();
  for (const l of ht(o)) {
    const u = String(l || "").trim().toLowerCase();
    if (!u || a.has(u)) continue;
    const d = r.get(u) || String(l || "").trim(), f = d.toLowerCase();
    !f || a.has(f) || s && !s.has(f) || c.has(f) || (c.add(f), i.push(s?.get(f) || d));
  }
  return i;
}
function am(o, e = null, t = "") {
  const r = String(o?.proxyMode || o?.mode || "").trim().toLowerCase();
  if ([
    "direct",
    "source-direct",
    "origin-direct",
    "node-direct"
  ].includes(r) || o?.direct === !0 || o?.sourceDirect === !0 || o?.directSource === !0 || o?.direct2xx === !0) return !0;
  const a = `${$r(o?.tags, o?.tag).join(" ")} ${o?.remark || ""}`;
  return /(?:^|[\s[(【])(?:直连|source-direct|origin-direct|node-direct)(?:$|[\s\])】])/i.test(a);
}
function nm(o, e = null, t = "") {
  const r = Hr(o);
  return r === "direct" ? !0 : r === "proxy" ? !1 : am(o, e, t);
}
function Ea(o, e) {
  if (!o) return null;
  try {
    return new URL(o, e instanceof URL ? e : String(e || ""));
  } catch {
    return null;
  }
}
function om(o, e = "GET") {
  const t = String(e || "GET").toUpperCase();
  return o === 303 && t !== "GET" && t !== "HEAD" || (o === 301 || o === 302) && t === "POST" ? "GET" : t;
}
function sm(o = {}, e = {}) {
  const t = Hi(ua(o, "protocolStrategy") ? o?.protocolStrategy : Do(o)), r = Number.isFinite(Number(e.hourUtc8)) ? Number(e.hourUtc8) : (/* @__PURE__ */ (/* @__PURE__ */ new Date()).getUTCHours() + 8) % 24, a = r >= 20 && r < 24;
  return t === "aggressive" ? {
    strategy: t,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !1,
    forceH1: !1,
    isPeakHour: a
  } : t === "balanced" ? {
    strategy: t,
    enableH2: !0,
    enableH3: !0,
    peakDowngrade: !0,
    forceH1: a,
    isPeakHour: a
  } : {
    strategy: "compat",
    enableH2: !1,
    enableH3: !1,
    peakDowngrade: !0,
    forceH1: !0,
    isPeakHour: a
  };
}
function im(o = {}, e = {}) {
  const { kernel: t } = o, { CacheManager: r, buildAdminLocalIndexUploadRecord: a } = o;
  return {
    async saveOrImport(n, { action: s, ctx: i, kv: c, env: l }) {
      const u = s === "save" ? [n] : n.nodes, d = os(u, l);
      if (d) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, d);
      const f = ss(u, l);
      return f ? z(f.code, f.message, 400, f) : await er(c)(async () => {
        const m = [], p = /* @__PURE__ */ new Map(), h = [], g = ze(l), y = await ue(l);
        for (const E of u) {
          if (!E.name || !E.target && !(Array.isArray(E.lines) && E.lines.length)) continue;
          const T = String(E.name).toLowerCase(), w = E.originalName ? String(E.originalName).toLowerCase() : null, D = !!(w && w !== T);
          if (s === "save" && (!w || w !== T) && await c.get(`${t.PREFIX}${T}`, { type: "json" }))
            return z("NODE_NAME_CONFLICT", "节点路径已存在，请更换后重试", 409, { name: T });
          let k = {};
          D ? k = await c.get(`${t.PREFIX}${w}`, { type: "json" }) || {} : k = await c.get(`${t.PREFIX}${T}`, { type: "json" }) || {};
          const b = t.buildPreparedNodeMutation(E, k, {
            previousName: w || T,
            nextName: T
          });
          if (!b) continue;
          const N = Qe(T, b.nextNode);
          if (N) return z("NODE_RESOURCE_LIMIT_EXCEEDED", "节点配置超过 Worker 资源限制", 400, N);
          b.dnsPlan = t.buildHostPrefixDnsSyncPlan(b.previousName, b.previousNode, b.nextName, b.nextNode, g, {
            config: y,
            forceUpsert: !0
          }), h.push(b), b.isRename && p.set(b.previousName, b.nextName), m.push(T);
        }
        if (s === "save" && m.length === 0) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        An(h, y, l);
        const _ = m.length > 0 || p.size > 0;
        let S = !1, A = null;
        try {
          await t.applyPreparedNodeMutations(h, {
            env: l,
            kv: c,
            ctx: i,
            requestHost: g
          }), S = h.some((b) => b?.nodeChanged === !0);
          const E = _ ? await t.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: s === "import"
          }) : null, T = Array.isArray(E?.summaries) ? E.summaries : await r.getNodesList(l, i), w = new Map((Array.isArray(T) ? T : []).map((b) => [String(b?.name || "").toLowerCase().trim(), b])), D = m.map((b) => w.get(String(b || "").toLowerCase().trim()) || null).filter(Boolean), k = Array.isArray(E?.index) ? E.index : Array.isArray(T) ? T.map((b) => b?.name) : [];
          if ((p.size > 0 || s === "save" && D.length === 1) && (A = await t.captureRuntimeConfigRollbackState(l, c), p.size > 0 && await t.commitSourceDirectNodesConfigWithinMutation(l, c, i, {
            renameMap: p,
            allowedNames: k,
            source: s === "import" ? "node_import" : "node_save",
            note: [...p.entries()].map(([b, N]) => `${b}->${N}`).join(",")
          }), s === "save" && D.length === 1)) {
            const b = D[0];
            await t.commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(l, c, i, {
              originalName: n.originalName,
              nodeName: b?.name,
              mode: b?.mainVideoStreamMode,
              source: "node_save",
              note: String(b?.name || "").trim()
            });
          }
          return ee({
            success: !0,
            node: s === "save" ? D[0] : void 0,
            nodes: T,
            importedNodes: s === "import" ? D : void 0,
            revisions: await t.getAdminRevisions(l, {
              ctx: i,
              nodes: T
            })
          });
        } catch (E) {
          let T = "", w = "";
          if (A) try {
            await t.restoreCapturedRuntimeConfigState(A, {
              env: l,
              kv: c,
              ctx: i
            });
          } catch (D) {
            T = se(D, "config_restore_failed");
          }
          if (S) try {
            await t.rollbackPreparedNodeMutations(h, {
              env: l,
              kv: c,
              ctx: i,
              requestHost: g,
              rebuildIndexes: !0
            });
          } catch (D) {
            w = se(D, "rollback_failed");
          }
          throw E && typeof E == "object" && (String(E.code || "").trim() || (E.code = "NODE_MUTATION_FAILED"), E.status = Ne(E.status, 500), (A || S) && (E.details = {
            ...$(E.details) ? E.details : {},
            rollbackAttempted: !0,
            configRollbackError: T,
            nodeRollbackError: w
          })), E;
        }
      });
    },
    async saveMainVideoStreamPolicyShortcuts(n, { env: s, ctx: i, kv: c }) {
      return c ? await er(c)(async () => {
        const l = await t.loadAllNodeEntitiesFromKvStrict(c, { ctx: i }), u = Array.isArray(l) ? l.map((T) => T?.name) : [], d = Yn(n?.selectedNodeNames || [], { allowedNames: u }), f = new Set(d.map((T) => String(T || "").trim().toLowerCase()).filter(Boolean));
        let m = 0;
        const p = ze(s), h = await ue(s), g = [];
        for (const T of Array.isArray(l) ? l : []) {
          if (!$(T)) continue;
          const w = String(T.name || "").trim().toLowerCase();
          if (!w) continue;
          const D = Hr(T);
          let k = D;
          if (f.has(w) ? k = "direct" : D === "direct" && (k = "inherit"), k !== D) {
            const { name: b, ...N } = T, R = {
              name: w,
              ...N,
              mainVideoStreamMode: k
            }, x = t.buildPreparedNodeMutation(R, T, {
              previousName: w,
              nextName: w
            });
            if (!x) continue;
            x.nextNode = t.normalizeNode(w, x.nextNode || R, { dropLegacyDirectRouting: !0 }).data, x.dnsPlan = t.buildHostPrefixDnsSyncPlan(x.previousName, x.previousNode, x.nextName, x.nextNode, p, {
              config: h,
              forceUpsert: !0
            }), g.push(x), m += 1;
          }
        }
        An(g, h, s);
        const y = Z(h.sourceDirectNodes || []) !== Z(d), _ = m > 0 || y ? await t.captureRuntimeConfigRollbackState(s, c) : null;
        let S = null, A = h;
        try {
          m > 0 && (await t.applyPreparedNodeMutations(g, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: p
          }), S = await t.rebuildNodeIndexesFromKv(c, { ctx: i })), y && (A = await t.commitRuntimeConfig({
            ...h,
            sourceDirectNodes: d
          }, {
            env: s,
            kv: c,
            ctx: i
          }));
        } catch (T) {
          let w = "", D = "";
          if (_) try {
            await t.restoreCapturedRuntimeConfigState(_, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (k) {
            w = se(k, "config_restore_failed");
          }
          if (m > 0) try {
            await t.rollbackPreparedNodeMutations(g, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: p,
              rebuildIndexes: !0
            });
          } catch (k) {
            D = se(k, "rollback_failed");
          }
          throw T && typeof T == "object" && (String(T.code || "").trim() || (T.code = "NODE_MUTATION_FAILED"), T.status = Ne(T.status, 500), T.details = {
            ...$(T.details) ? T.details : {},
            rollbackAttempted: !0,
            configRollbackError: w,
            nodeRollbackError: D
          }), T;
        }
        const E = Array.isArray(S?.summaries) ? S.summaries : await r.getNodesList(s, i);
        return ee({
          success: !0,
          selectedNodeNames: d,
          updatedNodeCount: m,
          config: Ct(A),
          nodes: E,
          revisions: await t.getAdminRevisions(s, {
            ctx: i,
            config: A,
            nodes: E
          })
        });
      }) : z("KV_UNAVAILABLE", "KV 未绑定或不可用", 500);
    },
    async importFull(n, { env: s, ctx: i, kv: c }) {
      const l = os(n?.nodes, s);
      if (l) return z("NODE_NAME_RESERVED", "节点路径与系统保留路由冲突，请更换后重试", 409, l);
      const u = ss(n?.nodes, s);
      if (u) return z(u.code, u.message, 400, u);
      const d = Je(n?.config?.indexUrl || "");
      let f = null;
      if ($(n?.adminIndexUpload)) {
        const m = String(n.adminIndexUpload.fileName || "").trim().split(/[\\/]+/).pop() || "";
        if (m.toLowerCase() !== "index.html") return z("ADMIN_INDEX_BACKUP_INVALID", "完整备份中的 HTML 文件名必须是 index.html", 400);
        try {
          f = await a(n.adminIndexUpload.html, m);
        } catch (p) {
          return z(String(p?.code || "ADMIN_INDEX_BACKUP_INVALID"), se(p, "完整备份中的 index.html 无效"), Ne(p?.status, 400), $(p?.details) ? p.details : null);
        }
        if (d && f.revision !== d) return z("ADMIN_INDEX_BACKUP_REVISION_MISMATCH", "完整备份中的 index.html 与配置版本不一致", 400, {
          expectedRevision: d,
          actualRevision: f.revision
        });
      }
      return d && !f && !await t.getAdminIndexUploadRecord(c, d) ? z("ADMIN_INDEX_BACKUP_MISSING", "完整备份缺少当前配置引用的 index.html", 400, { revision: d }) : await er(c)(async () => {
        const m = await ue(s), p = n.config ? await t.captureRuntimeConfigRollbackState(s, c) : null, h = n.config ? sc(n.config, m) : null, g = h ? ae(h) : m, y = ze(s), _ = f ? t.buildAdminIndexUploadKey(f.revision) : "", S = _ ? await c.get(_) : null, A = n.config ? await c.get(t.ADMIN_ACTIVE_INDEX_KEY) : null, E = d ? f || await t.getAdminIndexUploadRecord(c, d) : null, T = [];
        if (Array.isArray(n.nodes)) for (const N of n.nodes) {
          if (!N.name || !N.target && !(Array.isArray(N.lines) && N.lines.length)) continue;
          const R = String(N.name).toLowerCase(), x = await c.get(`${t.PREFIX}${R}`, { type: "json" }) || {}, O = t.buildPreparedNodeMutation(N, x, {
            previousName: R,
            nextName: R
          });
          O && (O.dnsPlan = t.buildHostPrefixDnsSyncPlan(O.previousName, O.previousNode, O.nextName, O.nextNode, y, {
            previousConfig: m,
            nextConfig: g,
            forceUpsert: !0
          }), T.push(O));
        }
        An(T, g, s);
        let w = null, D = !1;
        try {
          _ && await c.put(_, JSON.stringify(f)), h && (E ? await c.put(t.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(E)) : await c.delete(t.ADMIN_ACTIVE_INDEX_KEY)), h && (w = await t.commitRuntimeConfig(h, {
            env: s,
            kv: c,
            ctx: i
          })), T.length > 0 && (await t.applyPreparedNodeMutations(T, {
            env: s,
            kv: c,
            ctx: i,
            requestHost: y
          }), D = !0, await t.rebuildNodeIndexesFromKv(c, {
            ctx: i,
            syncLegacyIndex: !0
          }));
        } catch (N) {
          let R = "", x = "", O = "";
          if (D) try {
            await t.rollbackPreparedNodeMutations(T, {
              env: s,
              kv: c,
              ctx: i,
              requestHost: y,
              rebuildIndexes: !0
            });
          } catch (L) {
            x = se(L, "rollback_failed");
          }
          if (p) try {
            await t.restoreCapturedRuntimeConfigAndDnsState(p, {
              env: s,
              kv: c,
              ctx: i
            });
          } catch (L) {
            R = se(L, "config_restore_failed");
          }
          if (_) try {
            S === null ? await c.delete(_) : await c.put(_, S);
          } catch (L) {
            O = se(L, "admin_index_restore_failed");
          }
          if (n.config) try {
            A === null ? await c.delete(t.ADMIN_ACTIVE_INDEX_KEY) : await c.put(t.ADMIN_ACTIVE_INDEX_KEY, A);
          } catch (L) {
            O = [O, se(L, "active_admin_index_restore_failed")].filter(Boolean).join("; ");
          }
          throw N && typeof N == "object" && (String(N.code || "").trim() || (N.code = "IMPORT_FULL_FAILED"), N.status = Ne(N.status, 500), N.details = {
            ...$(N.details) ? N.details : {},
            rollbackAttempted: !!p || D || !!_,
            configRollbackError: R,
            nodeRollbackError: x,
            adminIndexRollbackError: O
          }), N;
        }
        const k = w || await Re(s), b = await r.getNodesList(s, i);
        return ee({
          success: !0,
          config: k,
          nodes: b,
          adminIndexUpload: f ? {
            revision: f.revision,
            fileName: f.fileName,
            bytes: f.bytes
          } : null,
          revisions: await t.getAdminRevisions(s, {
            ctx: i,
            config: k,
            nodes: b
          })
        });
      });
    },
    async delete(n, { ctx: s, kv: i, env: c }) {
      return await er(i)(async () => {
        if (n.name) {
          const l = String(n.name).toLowerCase(), u = await ue(c), d = await i.get(`${t.PREFIX}${l}`, { type: "json" }) || null, f = d ? t.normalizeNode(l, d || {}).data : null, m = {
            previousName: l,
            previousNode: f,
            nextName: l,
            nextNode: null,
            isRename: !1,
            nodeChanged: !!f,
            isSemanticNoop: !f,
            dnsPlan: t.buildHostPrefixDnsSyncPlan(l, f, "", null, ze(c), { config: u })
          }, p = ze(c);
          let h = !1, g = null;
          try {
            await t.applyPreparedNodeMutations([m], {
              env: c,
              kv: i,
              ctx: s,
              requestHost: p
            }), h = m.nodeChanged === !0;
            const y = await t.rebuildNodeIndexesFromKv(i, { ctx: s });
            g = await t.captureRuntimeConfigRollbackState(c, i), await t.commitSourceDirectNodesConfigWithinMutation(c, i, s, {
              removedNames: [l],
              allowedNames: Array.isArray(y?.index) ? y.index : [],
              source: "node_delete",
              note: l
            });
          } catch (y) {
            let _ = "", S = "";
            if (g) try {
              await t.restoreCapturedRuntimeConfigState(g, {
                env: c,
                kv: i,
                ctx: s
              });
            } catch (A) {
              _ = se(A, "config_restore_failed");
            }
            if (h) try {
              await t.rollbackPreparedNodeMutations([m], {
                env: c,
                kv: i,
                ctx: s,
                requestHost: p,
                rebuildIndexes: !0
              });
            } catch (A) {
              S = se(A, "rollback_failed");
            }
            throw y && typeof y == "object" && (String(y.code || "").trim() || (y.code = "NODE_DELETE_FAILED"), y.status = Ne(y.status, 500), (g || h) && (y.details = {
              ...$(y.details) ? y.details : {},
              rollbackAttempted: !0,
              configRollbackError: _,
              nodeRollbackError: S
            })), y;
          }
        }
        return ee({
          success: !0,
          revisions: await t.getAdminRevisions(c, { ctx: s })
        });
      });
    },
    async purgeCache(n, { kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "purgeCache") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      const c = await s.get(t.CONFIG_KEY, { type: "json" }) || {};
      if (!c.cfZoneId || !c.cfApiToken) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        return (await Be(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(String(c.cfZoneId).trim())}/purge_cache`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${c.cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ purge_everything: !0 })
        })).ok ? ee({ success: !0 }) : z("PURGE_FAILED", "清理失败，请检查密钥权限");
      } catch (l) {
        return z("PURGE_ERROR", l.message);
      }
    }
  };
}
function cm(o = {}, e = {}) {
  const { kernel: t } = o;
  return {
    async tidyKvData(r, { env: a, ctx: n, kv: s, db: i }) {
      if (!s) return z("KV_NOT_CONFIGURED", "请先绑定 ENI_KV / KV Namespace");
      try {
        const c = await t.tidyKvData(a, {
          kv: s,
          db: i,
          ctx: n,
          planToken: String(r?.planToken || "").trim()
        }), l = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
        return await pe(t.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "success",
          lastSuccessAt: l,
          lastTriggeredBy: "manual",
          summary: c.summary
        } } }), "manual.tidy_kv.patch_success_status", null, null), ee({
          success: !0,
          ...c
        });
      } catch (c) {
        const l = c?.message || String(c);
        return await pe(t.patchOpsStatus(a, { scheduled: { kvTidy: {
          status: "failed",
          lastErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastError: l,
          lastTriggeredBy: "manual"
        } } }), "manual.tidy_kv.patch_failed_status", { message: l }, null), z(String(c?.code || "KV_TIDY_FAILED"), l, Ne(c?.status, 500), $(c?.details) ? c.details : null);
      }
    },
    async tidyD1Data(r, { env: a, ctx: n, kv: s, db: i }) {
      if (!i) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      try {
        const c = nt(r?.maintenanceMode, "manual"), l = await t.tidyD1Data(a, {
          db: i,
          kv: s,
          ctx: n,
          maintenanceMode: c,
          planToken: String(r?.planToken || "").trim()
        }), u = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), d = t.buildD1TidyStatusPayload(l.summary, {
          mode: "manual",
          maintenanceMode: c,
          triggeredBy: "manual",
          timestamp: u
        });
        return await pe(t.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...d } }), "manual.tidy_d1.patch_success_status", null, null), ee({
          success: !0,
          ...l
        });
      } catch (c) {
        const l = c?.message || String(c), u = t.buildD1TidyStatusPayload({
          status: "failed",
          lastError: l,
          maintenanceMode: nt(r?.maintenanceMode, "manual")
        }, {
          mode: "manual",
          maintenanceMode: nt(r?.maintenanceMode, "manual"),
          triggeredBy: "manual",
          timestamp: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        });
        return await pe(t.patchOpsStatus({
          kv: s,
          db: i
        }, { scheduled: { ...u } }), "manual.tidy_d1.patch_failed_status", { message: l }, null), z("D1_TIDY_FAILED", l, 500);
      }
    }
  };
}
function lm(o = "") {
  return String(o || "").trim().toLowerCase() === "a" ? "a" : "cname";
}
function Wt(o = {}) {
  return {
    id: String(o?.id || "").trim(),
    type: String(o?.type || "").trim().toUpperCase(),
    name: re(o?.name),
    content: String(o?.content || "").trim(),
    ttl: Number(o?.ttl) || 1,
    proxied: o?.proxied === !0,
    comment: typeof o?.comment == "string" ? o.comment : void 0,
    tags: Array.isArray(o?.tags) ? o.tags.map((e) => String(e)) : void 0
  };
}
async function vr(o, e, t = {}) {
  const r = [];
  let a = 1, n = 1;
  const s = 100, i = re(t?.nameExact || "");
  do {
    const c = new URL(`https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(o)}/dns_records`);
    c.searchParams.set("page", String(a)), c.searchParams.set("per_page", String(s)), i && c.searchParams.set("name.exact", i);
    const l = await Ee(c.toString(), e);
    Array.isArray(l?.result) && r.push(...l.result.map((u) => Wt(u)).filter((u) => u.id && u.name)), n = Number(l?.result_info?.total_pages || l?.result_info?.totalPages || 1), a += 1;
  } while (a <= n && a <= 20);
  return r;
}
function la(o = {}, e = {}) {
  const t = {
    type: String(e.type || o?.type || "A").trim().toUpperCase(),
    name: re(e.host || o?.name),
    content: String(e.content || "").trim(),
    ttl: Number(o?.ttl) || 1,
    proxied: o?.proxied === !0
  };
  return typeof o?.comment == "string" && (t.comment = o.comment), Array.isArray(o?.tags) && (t.tags = o.tags.map((r) => String(r))), t;
}
function um(o = "", e = "") {
  const t = String(o || "").trim().toUpperCase(), r = String(e || "").trim();
  return r ? t === "A" ? r : r.toLowerCase() : "";
}
function Fr(o = "", e = "") {
  const t = String(o || "").trim().toUpperCase(), r = um(t, e);
  return !t || !r ? "" : `${t}|${r}`;
}
function dm(o = []) {
  const e = [], t = /* @__PURE__ */ new Set();
  let r = 0;
  for (const a of Array.isArray(o) ? o : []) {
    const n = String(a?.type || "").trim().toUpperCase(), s = String(a?.content || "").trim(), i = Fr(n, s);
    if (i) {
      if (t.has(i)) {
        r += 1;
        continue;
      }
      t.add(i), e.push({
        type: n,
        content: s,
        ttl: Number(a?.ttl) || 1,
        proxied: a?.proxied === !0,
        comment: typeof a?.comment == "string" ? a.comment : void 0,
        tags: Array.isArray(a?.tags) ? a.tags.map((c) => String(c)) : void 0
      });
    }
  }
  return {
    records: e,
    duplicateCount: r
  };
}
function ws(o = "", e = 0) {
  return {
    type: String(o || "").trim().toUpperCase(),
    desiredCount: Math.max(0, Number(e) || 0),
    identicalCount: 0,
    updatedCount: 0,
    createdCount: 0,
    deletedCount: 0
  };
}
function fm(o = "a", e = {}, t = {}) {
  const r = {};
  let a = 0, n = 0, s = 0, i = 0, c = 0;
  for (const u of [
    "A",
    "AAAA",
    "CNAME"
  ]) {
    const d = e?.[u];
    !d || typeof d != "object" || (r[u] = {
      type: u,
      desiredCount: Math.max(0, Number(d.desiredCount) || 0),
      identicalCount: Math.max(0, Number(d.identicalCount) || 0),
      updatedCount: Math.max(0, Number(d.updatedCount) || 0),
      createdCount: Math.max(0, Number(d.createdCount) || 0),
      deletedCount: Math.max(0, Number(d.deletedCount) || 0)
    }, a += r[u].desiredCount, n += r[u].identicalCount, s += r[u].updatedCount, i += r[u].createdCount, c += r[u].deletedCount);
  }
  const l = s + i + c;
  return {
    mode: String(o || "a").trim().toLowerCase(),
    desiredCount: a,
    identicalCount: n,
    updatedCount: s,
    createdCount: i,
    deletedCount: c,
    changedCount: l,
    dedupedDesiredCount: Math.max(0, Number(t?.dedupedDesiredCount) || 0),
    familySummaries: r,
    unchangedOnly: l === 0 && n > 0
  };
}
async function mm(o = {}, e) {
  const t = String(o?.cfZoneId || "").trim(), r = String(o?.cfApiToken || "").trim();
  if (!t || !r) throw new Error("cf_api_missing");
  const a = re(new URL(e.url).hostname), n = await Sc(t, r, {
    scope: "dns.resolve_admin_context.zone_lookup",
    context: { requestHost: a }
  }), s = await vr(t, r), i = String(n?.name || "").trim() || "", c = i || re(s[0]?.name || "");
  let l = a;
  fa(l, c || i) || (l = re(await Pf({
    cfAccountId: o.cfAccountId,
    cfZoneId: t,
    cfApiToken: r,
    zoneNameFallback: c || i || a
  })));
  const u = s.filter((f) => gr(f.type)), d = l ? u.filter((f) => re(f.name) === l) : u;
  return {
    cfZoneId: t,
    cfApiToken: r,
    zone: n,
    zoneName: i,
    currentHost: l,
    requestHost: a,
    totalRecords: s.length,
    editableRecords: u,
    currentHostRecords: d
  };
}
function pm(o = {}) {
  const e = ae(o), t = String(e.cfZoneId || "").trim(), r = String(e.cfApiToken || "").trim();
  if (!t || !r) {
    const a = /* @__PURE__ */ new Error("请在账号设置中完善 Zone ID 和 API 令牌");
    throw a.code = "CF_API_ERROR", a.status = 400, a;
  }
  return {
    cfZoneId: t,
    cfApiToken: r
  };
}
function gm(o = []) {
  return {
    A: ws("A", o.filter((e) => e.type === "A").length),
    AAAA: ws("AAAA", o.filter((e) => e.type === "AAAA").length)
  };
}
function hm(o = "", e = [], t = []) {
  const r = /* @__PURE__ */ new Map(), a = [];
  let n = 0;
  for (const i of e) {
    const c = Fr(o, i?.content);
    c && r.set(c, (r.get(c) || 0) + 1);
  }
  for (const i of t) {
    const c = Fr(o, i?.content), l = r.get(c) || 0;
    if (l > 0) {
      n += 1, r.set(c, l - 1);
      continue;
    }
    a.push(i);
  }
  const s = [];
  for (const i of e) {
    const c = Fr(o, i?.content), l = r.get(c) || 0;
    l <= 0 || (s.push(i), r.set(c, l - 1));
  }
  return {
    identicalCount: n,
    reusableCurrentRecords: a,
    pendingDesiredRecords: s
  };
}
function Mc(o = "", e = "", t = "", r = "", a = {}) {
  const n = async () => (await vr(o, e, { nameExact: t })).filter((s) => re(s.name) === t && gr(s.type));
  return {
    async deleteRecord(s) {
      s?.id && await Ee(`${r}/${encodeURIComponent(s.id)}`, e, { method: "DELETE" });
    },
    async updateRecord(s, i, c) {
      const l = la(s, {
        host: t,
        type: i,
        content: c
      });
      return Wt((await Ee(`${r}/${encodeURIComponent(s.id)}`, e, {
        method: "PUT",
        body: JSON.stringify(l)
      }))?.result || {
        id: s.id,
        ...l
      });
    },
    async createRecord(s, i, c = a) {
      const l = la(c, {
        host: t,
        type: s,
        content: i
      });
      try {
        return {
          record: Wt((await Ee(r, e, {
            method: "POST",
            body: JSON.stringify(l)
          }))?.result || l),
          reusedExisting: !1
        };
      } catch (u) {
        if (String(u?.message || u || "").includes("81058")) {
          const d = (await n()).find((f) => re(f?.name) === t && String(f?.type || "").toUpperCase() === String(s || "").trim().toUpperCase() && Fr(f?.type, f?.content) === Fr(s, i));
          if (d) return {
            record: Wt(d),
            reusedExisting: !0
          };
        }
        throw u;
      }
    },
    async listCurrentHostRecords() {
      return await n();
    }
  };
}
async function Ls(o = "", e = [], t = [], r = {}, a = {}) {
  const n = hm(o, e, t);
  r.identicalCount += n.identicalCount;
  const { reusableCurrentRecords: s, pendingDesiredRecords: i } = n;
  for (let c = 0; c < i.length; c += 1) {
    const l = i[c], u = s[c];
    if (u) {
      await a.updateRecord(u, o, l.content), r.updatedCount += 1;
      continue;
    }
    (await a.createRecord(o, l.content, t[0]))?.reusedExisting === !0 ? r.identicalCount += 1 : r.createdCount += 1;
  }
  for (let c = i.length; c < s.length; c += 1)
    await a.deleteRecord(s[c]), r.deletedCount += 1;
}
async function ym({ env: o, kv: e, dnsHistoryRepository: t, config: r, host: a, mode: n = "a", desiredRecords: s = [], requestHost: i = "", skipHistory: c = !1, includeAllRecords: l = !0, includeHistory: u = !0 }) {
  const { cfZoneId: d, cfApiToken: f } = pm(r || await Re(o));
  let m = !1, p = !1, h = "";
  const g = dm(s), y = g.records, _ = gm(y);
  try {
    const S = await Oo(d, f, { scope: "dns.persist_records.zone_lookup" }), A = String(S?.name || "").trim() || "";
    if (A && !fa(a, A)) {
      const M = /* @__PURE__ */ new Error("当前站点不在该 Zone 下");
      throw M.code = "INVALID_HOST", M.status = 400, M;
    }
    const E = (await vr(d, f, { nameExact: a })).filter((M) => re(M.name) === a && gr(M.type)), T = {
      baseRecord: E[0] || {
        name: a,
        ttl: 1,
        proxied: !1
      },
      zoneRecordsUrl: `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(d)}/dns_records`
    }, w = Mc(d, f, a, T.zoneRecordsUrl, T.baseRecord), D = E.map((M) => Wt(M));
    let k = !1;
    const b = {
      ...w,
      async deleteRecord(M) {
        return k = !0, await w.deleteRecord(M);
      },
      async updateRecord(M, C, I) {
        return k = !0, await w.updateRecord(M, C, I);
      },
      async createRecord(M, C, I) {
        return k = !0, await w.createRecord(M, C, I);
      }
    };
    let N = [], R = null;
    try {
      if (n === "cname") {
        const M = E.filter((j) => j.type === "CNAME"), C = E.filter((j) => j.type === "A" || j.type === "AAAA");
        for (const j of C) await b.deleteRecord(j);
        for (let j = 1; j < M.length; j += 1) await b.deleteRecord(M[j]);
        const I = M[0] || null, P = y[0], U = Number(P?.ttl) || 1, V = P?.proxied === !0;
        if (I) {
          const j = String(I.content || "").trim() !== P.content, K = Number(I.ttl) !== U, q = I.proxied === !0 !== V;
          (j || K || q) && await b.updateRecord({
            ...I,
            ttl: U,
            proxied: V
          }, "CNAME", P.content);
        } else await b.createRecord("CNAME", P.content, {
          ...T.baseRecord,
          ttl: U,
          proxied: V
        });
        N = await vr(d, f, { nameExact: a }), c || (R = await t.recordDnsHostHistory(e, d, a, {
          name: a,
          type: "CNAME",
          content: P.content,
          actor: "admin",
          source: "ui",
          requestHost: i,
          savedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        const M = E.filter((C) => C.type === "CNAME");
        for (const C of M) await b.deleteRecord(C);
        await Ls("A", y.filter((C) => C.type === "A"), E.filter((C) => C.type === "A"), _.A, b), await Ls("AAAA", y.filter((C) => C.type === "AAAA"), E.filter((C) => C.type === "AAAA"), _.AAAA, b), N = await vr(d, f, { nameExact: a });
      }
    } catch (M) {
      if (k) {
        m = !0;
        try {
          const C = await w.listCurrentHostRecords();
          for (const I of C) await w.deleteRecord(I);
          for (const I of D) await w.createRecord(I.type, I.content, I);
          p = !0;
        } catch (C) {
          p = !1, h = String(C?.message || C || "unknown_rollback_error");
        }
      }
      throw M;
    }
    const x = N.filter((M) => gr(M.type)), O = x.filter((M) => re(M.name) === a), L = u === !0 ? R || await t.getDnsHostHistory(e, d, a) : [], v = n === "a" ? fm(n, _, { dedupedDesiredCount: g.duplicateCount }) : null;
    return {
      ok: !0,
      zoneId: d,
      zoneName: A,
      currentHost: a,
      totalRecords: N.length,
      editableRecordCount: x.length,
      filteredCount: O.length,
      records: O,
      ...l === !0 ? { allRecords: x } : {},
      allRecordsIncluded: l === !0,
      history: L,
      mode: n,
      syncSummary: v,
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: h
    };
  } catch (S) {
    throw S.details = {
      ...S?.details && typeof S.details == "object" ? S.details : {},
      rollbackAttempted: m,
      rollbackSucceeded: p,
      rollbackError: h
    }, S;
  }
}
function Sm(o = {}, e = {}) {
  const { kernel: t } = o, { persistCloudflareDnsRecordsForHost: r } = o;
  return {
    async listDnsRecords(a, { env: n, kv: s, request: i }) {
      const c = ae(await Re(n)), l = String(c.cfZoneId || "").trim(), u = String(c.cfApiToken || "").trim(), d = a?.includeAllRecords !== !1;
      if (!l || !u) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const f = await mm(c, i), m = f.currentHostRecords, p = f.currentHost ? await t.getDnsHostHistory(s, l, f.currentHost) : [];
        return ee({
          ok: !0,
          zoneId: l,
          zoneName: f.zoneName,
          currentHost: f.currentHost,
          totalRecords: f.totalRecords,
          editableRecordCount: f.editableRecords.length,
          filteredCount: m.length,
          records: m,
          ...d === !0 ? { allRecords: f.editableRecords } : {},
          allRecordsIncluded: d === !0,
          history: p
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return z("CF_DNS_LIST_FAILED", m.includes("cf_api_http_403") ? "Cloudflare DNS 读取失败：API 令牌权限不足（需要 Zone.DNS:Read）" : m.includes("cf_api_http_401") ? "Cloudflare DNS 读取失败：API 令牌无效" : "Cloudflare DNS 读取失败", 400, { reason: m });
      }
    },
    async setDnsHistoryFallback(a, { env: n, kv: s }) {
      const i = re(a?.host || ""), c = String(a?.entryId || "").trim(), l = a?.enabled !== !1;
      if (!i) return z("MISSING_PARAMS", "host 不能为空");
      if (l && !c) return z("MISSING_PARAMS", "entryId 不能为空");
      const u = ae(await Re(n)), d = String(u.cfZoneId || "").trim();
      if (!d) return z("CF_API_ERROR", "请先在账号设置中保存 Zone ID");
      try {
        return ee({
          ok: !0,
          history: await t.setDnsHostHistoryPreferredFallback(s, d, i, c, l)
        });
      } catch (f) {
        const m = String(f?.message || f || "unknown_error");
        return m.includes("dns_history_entry_not_found") ? z("DNS_HISTORY_ENTRY_NOT_FOUND", "指定的 DNS 历史记录不存在", 404) : z("DNS_HISTORY_FALLBACK_UPDATE_FAILED", "设置 DNS 默认回退值失败", 400, { reason: m });
      }
    },
    async createDnsRecord(a, n) {
      return e.updateDnsRecord(a, n);
    },
    async updateDnsRecord(a, { env: n, kv: s, request: i }) {
      const c = String(i.headers.get("X-Admin-Confirm") || "").trim();
      if (c !== "updateDnsRecord" && c !== "createDnsRecord") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const l = String(a?.recordId || a?.id || "").trim(), u = re(a?.host || a?.name || ""), d = String(a?.type || "").trim().toUpperCase(), f = String(a?.content || "").trim(), m = a?.skipHistory === !0;
      if (!gr(d)) return z("INVALID_TYPE", "Type 仅允许 A / AAAA / CNAME");
      const p = ka(d, f);
      if (p) return z("INVALID_CONTENT", p);
      if (!l && !u) return z("MISSING_PARAMS", "host 不能为空");
      const h = ae(await Re(n)), g = String(h.cfZoneId || "").trim(), y = String(h.cfApiToken || "").trim();
      if (!g || !y) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      let _ = null, S = !1, A = !1, E = "";
      try {
        const T = await Oo(g, y, { scope: "dns.update_record.zone_lookup" }), w = String(T?.name || "").trim(), D = re(new URL(i.url).hostname);
        let k = null;
        if (l) {
          const N = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(g)}/dns_records/${encodeURIComponent(l)}`, R = Wt((await Ee(N, y))?.result || null);
          if (!R?.id) return z("NOT_FOUND", "DNS 记录不存在", 404);
          const x = String(R?.type || "").toUpperCase();
          if (!gr(x)) return z("UNSUPPORTED_RECORD_TYPE", "该 DNS 记录类型不支持编辑", 400, { currentType: x });
          const O = u || R.name;
          if (!O) return z("MISSING_PARAMS", "host 不能为空");
          if (w && !fa(O, w)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const L = la(R, {
            host: O,
            type: d,
            content: f
          });
          k = Wt((await Ee(N, y, {
            method: "PUT",
            body: JSON.stringify(L)
          }))?.result || {
            id: l,
            ...L
          }), _ = async () => {
            const v = la(R, {
              host: R.name,
              type: R.type,
              content: R.content
            });
            await Ee(N, y, {
              method: "PUT",
              body: JSON.stringify(v)
            });
          };
        } else {
          if (w && !fa(u, w)) return z("INVALID_HOST", "记录名称必须位于当前 Zone 下");
          const N = `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(g)}/dns_records`, R = la({
            name: u,
            ttl: 1,
            proxied: !1
          }, {
            host: u,
            type: d,
            content: f
          });
          k = Wt((await Ee(N, y, {
            method: "POST",
            body: JSON.stringify(R)
          }))?.result || R), _ = async () => {
            if (!k?.id) throw new Error("created_dns_record_id_missing");
            await Ee(`${N}/${encodeURIComponent(k.id)}`, y, { method: "DELETE" });
          };
        }
        let b;
        try {
          b = k.type === "CNAME" && !m ? await t.recordDnsHostHistory(s, g, k.name, {
            name: k.name,
            type: k.type,
            content: k.content,
            actor: "admin",
            source: "ui",
            requestHost: D,
            savedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
          }) : await t.getDnsHostHistory(s, g, k.name);
        } catch (N) {
          if (S = typeof _ == "function", S) try {
            await _(), A = !0;
          } catch (R) {
            E = se(R, "dns_rollback_failed");
          }
          throw N;
        }
        return ee({
          ok: !0,
          record: k,
          history: b
        });
      } catch (T) {
        const w = String(T?.message || T || "unknown_error");
        return z("CF_DNS_UPDATE_FAILED", w.includes("cf_api_http_403") ? "Cloudflare DNS 更新失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : w.includes("cf_api_http_401") ? "Cloudflare DNS 更新失败：API 令牌无效" : "Cloudflare DNS 更新失败", 400, {
          reason: w,
          rollbackAttempted: S,
          rollbackSucceeded: A,
          rollbackError: E
        });
      }
    },
    async saveDnsRecords(a, { env: n, kv: s, request: i }) {
      if (i.headers.get("X-Admin-Confirm") !== "saveDnsRecords") return z("CONFIRMATION_REQUIRED", "敏感 DNS 操作需要显式确认头", 428);
      const c = lm(a?.mode), l = re(a?.host || ""), u = a?.includeAllRecords === !0, d = Array.isArray(a?.records) ? a.records : [];
      if (!l) return z("MISSING_PARAMS", "host 不能为空");
      const f = [];
      if (c === "cname") {
        const g = String(d[0]?.content || "").trim(), y = ka("CNAME", g);
        if (y) return z("INVALID_CONTENT", y);
        f.push({
          type: "CNAME",
          content: g
        });
      } else {
        const g = d.map((y) => ({
          type: String(y?.type || "").trim().toUpperCase(),
          content: String(y?.content || "").trim()
        })).filter((y) => y.type || y.content);
        if (!g.length) return z("INVALID_CONTENT", "A 模式至少保留 1 条 A / AAAA 记录");
        for (const y of g) {
          if (!["A", "AAAA"].includes(y.type)) return z("INVALID_TYPE", "A 模式仅允许 A / AAAA");
          const _ = ka(y.type, y.content, { allowCname: !1 });
          if (_) return z("INVALID_CONTENT", _);
          f.push(y);
        }
      }
      const m = ae(await Re(n)), p = String(m.cfZoneId || "").trim(), h = String(m.cfApiToken || "").trim();
      if (!p || !h) return z("CF_API_ERROR", "请在账号设置中完善 Zone ID 和 API 令牌");
      try {
        const g = re(new URL(i.url).hostname);
        return ee(await r({
          env: n,
          kv: s,
          config: m,
          host: l,
          mode: c,
          desiredRecords: f,
          requestHost: g,
          skipHistory: !1,
          includeAllRecords: u
        }));
      } catch (g) {
        const y = String(g?.message || g || "unknown_error");
        return z("CF_DNS_SAVE_FAILED", y.includes("cf_api_http_403") ? "Cloudflare DNS 保存失败：API 令牌权限不足（需要 Zone.DNS:Edit）" : y.includes("cf_api_http_401") ? "Cloudflare DNS 保存失败：API 令牌无效" : "Cloudflare DNS 保存失败", 400, {
          reason: y,
          rollbackAttempted: g?.details?.rollbackAttempted === !0,
          rollbackSucceeded: g?.details?.rollbackSucceeded === !0,
          rollbackError: String(g?.details?.rollbackError || "")
        });
      }
    }
  };
}
async function Xr(o, e, t) {
  const r = Array.isArray(o) ? o : [];
  if (r.length === 0) return [];
  if (typeof t != "function") throw new TypeError("worker must be a function");
  const a = Number(e), n = Number.isFinite(a) && a > 0 ? Math.min(r.length, Math.max(1, Math.floor(a))) : 1, s = Array.from({ length: r.length });
  let i = 0;
  const c = Array.from({ length: n }, async () => {
    for (; i < r.length; ) {
      const l = i;
      i += 1;
      const u = Promise.resolve().then(() => t(r[l]));
      s[l] = u, await u.catch(() => {
      });
    }
  });
  return await Promise.all(c), Promise.all(s);
}
var _m = Object.freeze([{
  id: "cloudflare",
  label: "Cloudflare",
  endpoint: "https://cloudflare-dns.com/dns-query"
}]), Pc = 30 * 1e3, bm = Pc, Em = "emby-proxy-ui-dns-probe/1.0", Tm = 2400 * 1e3, Rm = 35 * 1e3, Am = "dns_ip_pool_fetch_lock:", Cm = "sys:dns_ip_pool_fetch_lock:v1:";
function wm(o = {}, e = [], t = {}) {
  const r = /* @__PURE__ */ new Set(), a = [];
  for (const s of Array.isArray(e) ? e : []) {
    const i = fr(s);
    if (!i) continue;
    const c = String(i.ip || "").trim().toLowerCase();
    !c || r.has(c) || (r.add(c), a.push(i));
  }
  const n = a.slice(0, kr(o?.ipLimit));
  return {
    id: String(o?.id || ""),
    name: String(o?.name || ""),
    sourceType: bt(o?.sourceType || o?.source_type || ""),
    status: n.length > 0 ? "success" : "empty",
    count: n.length,
    items: n,
    lastFetchAt: String(t.lastFetchAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString())
  };
}
async function Lm(o = {}, e = F.Defaults.DnsIpSourceFetchMaxBytes) {
  const t = String(o?.url || "").trim();
  if (!t) throw new Error("empty_source_url");
  const r = new AbortController(), a = setTimeout(() => r.abort(), Pc);
  try {
    const n = await Be(t, {
      redirect: "follow",
      signal: r.signal
    });
    if (!n.ok) throw new Error(`HTTP_${n.status}`);
    const s = await De(n, e);
    if (s.exceeded) throw new Error("SOURCE_TOO_LARGE");
    const i = s.text, c = fi(o?.builtinId || o?.builtin_id || "");
    return (c === "all" ? tu(i) : c === "preferred" ? ru(i, { limit: kr(o?.ipLimit) }) : yo(i, { limit: kr(o?.ipLimit) })).map((l) => ({
      ...l,
      sourceKind: "api",
      sourceLabel: o?.name || t
    }));
  } catch (n) {
    throw $t(n) ? new Error("FETCH_TIMEOUT") : n;
  } finally {
    clearTimeout(a);
  }
}
function Dm(o = {}, e = "", t = "A") {
  const r = new URL(String(o?.endpoint || ""));
  return r.searchParams.set("name", re(e)), r.searchParams.set("type", String(t || "A").toUpperCase()), r;
}
async function Nm(o = {}, e = "", t = "A") {
  const r = new AbortController(), a = setTimeout(() => r.abort(), bm);
  try {
    const n = await Be(Dm(o, e, t).toString(), {
      headers: { accept: "application/dns-json" },
      redirect: "follow",
      signal: r.signal
    });
    if (!n.ok) throw new Error(`DOH_HTTP_${n.status}`);
    const s = await De(n, sn);
    return Ql(s.exceeded ? null : JSON.parse(s.text || "null")).map((i) => ({
      ...i,
      sourceKind: "domain",
      sourceLabel: String(e || "").trim()
    }));
  } catch (n) {
    throw $t(n) ? new Error("DOH_TIMEOUT") : n;
  } finally {
    clearTimeout(a);
  }
}
function Im(o = []) {
  const e = (Array.isArray(o) ? o : []).map((n) => Array.isArray(n) ? [...n] : []).filter((n) => n.length > 0), t = [], r = /* @__PURE__ */ new Set();
  let a = e.length > 0;
  for (; a; ) {
    a = !1;
    for (const n of e) {
      for (; n.length; ) {
        const s = n.shift(), i = String(s?.ip || "").trim().toLowerCase();
        if (!(!i || r.has(i))) {
          r.add(i), t.push(s);
          break;
        }
      }
      n.length && (a = !0);
    }
  }
  return t;
}
async function Mm(o = {}) {
  const e = re(o?.domain || "");
  if (!e) throw new Error("empty_source_domain");
  const t = [], r = [], a = [];
  for (const i of ["A", "AAAA"]) for (const c of _m) a.push({
    resolver: c,
    recordType: i
  });
  const n = await Xr(a, Math.min(2, Math.max(1, a.length)), async ({ resolver: i, recordType: c }) => {
    try {
      return {
        resolver: i,
        recordType: c,
        items: await Nm(i, e, c),
        error: ""
      };
    } catch (l) {
      return {
        resolver: i,
        recordType: c,
        items: [],
        error: String(l?.message || l || "unknown_doh_error")
      };
    }
  });
  for (const i of n) {
    const c = Array.isArray(i?.items) ? i.items : [];
    if (c.length) {
      t.push(c);
      continue;
    }
    String(i?.error || "").trim() && r.push(`${String(i?.resolver?.id || "resolver")}:${String(i?.recordType || "A")}=${String(i?.error || "unknown_doh_error")}`);
  }
  const s = Im(t);
  if (!s.length && n.length > 0 && r.length === n.length) {
    const i = r.every((c) => String(c || "").includes("DOH_TIMEOUT"));
    throw new Error(i ? "DOH_TIMEOUT" : r.join("; "));
  }
  return s.map((i) => ({
    ...i,
    sourceKind: "domain",
    sourceLabel: o?.name || e
  }));
}
async function Pm(o = {}, e = F.Defaults.DnsIpSourceFetchMaxBytes) {
  const t = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), r = Nt(o);
  try {
    return wm(r, r.sourceType === "domain" ? await Mm(r) : await Lm(r, e), { lastFetchAt: t });
  } catch (a) {
    return {
      id: String(r?.id || ""),
      name: String(r?.name || ""),
      sourceType: bt(r?.sourceType || r?.source_type || ""),
      status: "failed",
      count: 0,
      items: [],
      error: String(a?.message || a || "unknown_error"),
      lastFetchAt: t
    };
  }
}
async function Ds(o, e = "", t = "UNKNOWN", r = {}) {
  const { probeRepository: a } = r, n = String(e || "").trim(), s = qe(n), i = String(t || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  if (!n || !s) return {
    ip: n,
    entryColo: i,
    probeStatus: "network_error",
    latencyMs: null,
    cfRay: "",
    coloCode: "",
    cityName: "",
    countryCode: "UNKNOWN",
    countryName: "未知",
    probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: H()
  };
  if (o && r.forceRefresh !== !0 && r.skipCacheRead !== !0) {
    const m = await a.getDnsIpProbeCacheEntry(o, n, i);
    if (m) return m;
  }
  const c = new AbortController(), l = setTimeout(() => c.abort(), le(r.probeTimeoutMs ?? r.timeoutMs, F.Defaults.DnsIpProbeTimeoutMs, 250, 3e4)), u = H(), d = s === "IPv6" ? `http://[${n}]/` : `http://${n}/`, f = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  try {
    const m = await Be(d, {
      headers: { "user-agent": Em },
      method: "HEAD",
      redirect: "manual",
      signal: c.signal
    }), p = Math.max(0, H() - u), h = String(m.headers.get("CF-RAY") || m.headers.get("cf-ray") || "").trim(), g = String(m.headers.get("Server") || m.headers.get("server") || "").trim(), y = li(h), _ = y ? "ok" : /cloudflare/i.test(g) ? "cf_header_missing" : "non_cloudflare", S = au(y), A = {
      ip: n,
      entryColo: i,
      probeStatus: _,
      latencyMs: p,
      cfRay: h,
      coloCode: S.coloCode,
      cityName: S.cityName,
      countryCode: S.countryCode,
      countryName: S.countryName,
      probedAt: f,
      expiresAt: H() + F.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return o && r.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(o, A), A;
  } catch (m) {
    const p = {
      ip: n,
      entryColo: i,
      probeStatus: $t(m) ? "timeout" : "network_error",
      latencyMs: null,
      cfRay: "",
      coloCode: "",
      cityName: "",
      countryCode: "UNKNOWN",
      countryName: "未知",
      probedAt: f,
      expiresAt: H() + F.Defaults.DnsIpProbeCacheTtlSec * 1e3
    };
    return o && r.skipCacheWrite !== !0 && await a.upsertDnsIpProbeCacheEntry(o, p), p;
  } finally {
    clearTimeout(l);
  }
}
async function xc(o = [], e, t = "UNKNOWN", r = {}) {
  const a = [], n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set(), i = String(t || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
  for (const S of Array.isArray(o) ? o : []) {
    const A = String(S?.ip || S?.content || "").trim(), E = qe(A) || ci(S?.ipType || S?.ip_type || S?.type || "");
    if (!A || !E) continue;
    const T = {
      id: String(S?.id || S?.recordId || `${r.scope || "dns"}-${ne(`${A}|${S?.sourceKind || S?.source_kind || ""}`)}`),
      ip: A,
      ipType: E,
      recordId: String(S?.recordId || S?.id || ""),
      host: String(S?.host || S?.name || r.host || ""),
      sourceKind: String(S?.sourceKind || S?.source_kind || r.scope || "shared_pool"),
      sourceLabel: String(S?.sourceLabel || S?.source_label || r.sourceLabel || ""),
      lineLabel: Br(S?.lineLabel || S?.line_label || ""),
      remark: String(S?.remark || ""),
      createdAt: String(S?.createdAt || S?.created_at || ""),
      updatedAt: String(S?.updatedAt || S?.updated_at || ""),
      probeStatus: Ua(S?.probeStatus || S?.probe_status || ""),
      latencyMs: Number.isFinite(Number(S?.latencyMs ?? S?.latency_ms)) ? Math.max(0, Math.round(Number(S?.latencyMs ?? S?.latency_ms))) : null,
      cfRay: String(S?.cfRay || S?.cf_ray || ""),
      coloCode: String(S?.coloCode || S?.colo_code || "").trim().toUpperCase(),
      cityName: String(S?.cityName || S?.city_name || ""),
      countryCode: String(S?.countryCode || S?.country_code || "").trim().toUpperCase() || "UNKNOWN",
      countryName: String(S?.countryName || S?.country_name || "") || "未知",
      probedAt: String(S?.probedAt || S?.probed_at || "")
    };
    a.push(T), n.set(A.toLowerCase(), A);
  }
  if (!a.length) return {
    items: [],
    probeEntryColo: i,
    probeDataSource: "cache"
  };
  const c = /* @__PURE__ */ new Map(), l = [], u = [...n.values()], d = e ? await r.probeRepository.getDnsIpProbeCacheEntries(e, u, i) : [];
  for (const S of Array.isArray(d) ? d : []) {
    const A = String(S?.ip || "").trim().toLowerCase();
    A && c.set(A, S);
  }
  for (const S of u)
    c.has(String(S || "").toLowerCase()) && r.forceRefresh !== !0 || l.push(S);
  const f = r.deferProbe === !0 && !!r.ctx?.waitUntil, m = le(r.syncProbeLimit, F.Defaults.DnsIpWorkspaceSyncProbeLimit, 0, 64), p = f && l.length > m ? l.slice(0, m) : l, h = f && l.length > m ? l.slice(m) : [], g = le(r.probeConcurrency, F.Defaults.DnsIpProbeConcurrency, 1, 4);
  let y = "cache";
  p.length > 0 && (y = "live_sync"), h.length > 0 && (y = "live_deferred");
  const _ = await Xr(p, g, async (S) => {
    const A = await Ds(e, S, t, {
      ...r,
      skipCacheRead: !0,
      skipCacheWrite: !0
    });
    return c.set(String(S || "").toLowerCase(), A), A;
  });
  return e && _.length && await r.probeRepository.upsertDnsIpProbeCacheEntries(e, _), h.length && (h.forEach((S) => s.add(String(S || "").toLowerCase())), r.ctx.waitUntil((async () => {
    const S = await Xr(h, g, (A) => Ds(e, A, t, {
      ...r,
      skipCacheRead: !0,
      skipCacheWrite: !0
    }));
    e && S.length && await r.probeRepository.upsertDnsIpProbeCacheEntries(e, S);
  })().catch((S) => {
    console.warn("[DNS IP Workspace] Deferred probe failed:", S?.message || S);
  }))), {
    items: a.map((S) => {
      const A = c.get(S.ip.toLowerCase());
      return A ? {
        ...S,
        probeStatus: A.probeStatus,
        latencyMs: A.latencyMs,
        cfRay: A.cfRay,
        coloCode: A.coloCode,
        cityName: A.cityName,
        countryCode: A.countryCode,
        countryName: A.countryName,
        probedAt: A.probedAt
      } : S;
    }).map((S) => !s.has(String(S.ip || "").toLowerCase()) || String(S.probedAt || "").trim() ? S : {
      ...S,
      probeStatus: "pending"
    }),
    probeEntryColo: i,
    probeDataSource: Jn(y)
  };
}
function xm(o = {}) {
  const e = So(o?.items || []);
  return {
    sourceResults: hi(o?.sourceResults || []),
    importedCount: Math.max(0, Number(o?.importedCount) || e.length),
    items: e,
    enabledSourceCount: Math.max(0, Number(o?.enabledSourceCount) || 0),
    cachedAt: za(o?.cachedAtMs),
    expiresAt: za(o?.expiresAtMs)
  };
}
async function Om(o = [], e, t = "UNKNOWN", r = null, a = {}) {
  const n = r && typeof r.waitUntil == "function" ? r : { waitUntil() {
  } }, s = await xc(o, e, t, {
    probeRepository: a.probeRepository,
    forceRefresh: !1,
    scope: "shared_pool",
    ctx: n,
    deferProbe: !0,
    syncProbeLimit: le(a?.syncProbeLimit, 0, 0, 64),
    probeTimeoutMs: le(a?.probeTimeoutMs, 500, 250, 3e4)
  });
  return Array.isArray(s?.items) ? s.items : [];
}
function Jn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "live_deferred" ? "live_deferred" : e === "live_sync" ? "live_sync" : "cache";
}
function vm(o = "", e = "") {
  const t = Jn(o), r = Jn(e), a = {
    cache: 0,
    live_sync: 1,
    live_deferred: 2
  };
  return (a[r] || 0) > (a[t] || 0) ? r : t;
}
function Fm(o = {}) {
  const e = [];
  Array.isArray(o?.localPoolItems) && e.push(...o.localPoolItems), Array.isArray(o?.poolItems) && e.push(...o.poolItems), Array.isArray(o?.sharedPoolItems) && e.push(...o.sharedPoolItems);
  const t = [], r = /* @__PURE__ */ new Set();
  for (const a of e) {
    const n = fr(a);
    if (!n) continue;
    const s = String(n.ip || "").trim().toLowerCase();
    !s || r.has(s) || (r.add(s), t.push({
      ...a,
      ...n
    }));
  }
  return t;
}
function Um(o = [], e = []) {
  const t = /* @__PURE__ */ new Map(), r = (a) => {
    for (const n of Array.isArray(a) ? a : []) {
      const s = fr(n);
      s && t.set(String(s.ip || "").trim().toLowerCase(), {
        ...n,
        ...s
      });
    }
  };
  return r(o), r(e), [...t.values()];
}
function km(o = "") {
  return `${Am}${String(o || "").trim()}`;
}
async function Hm({ kv: o = null, db: e = null, leaseRepository: t = null } = {}, r = "") {
  const a = km(r);
  if (!a || a === "dns_ip_pool_fetch_lock:") return {
    acquired: !1,
    reason: "empty_signature"
  };
  const n = `${H()}-${Math.random().toString(36).slice(2, 10)}`;
  return e ? {
    ...await t.tryAcquireScheduledLeaseWithDb(e, {
      scope: a,
      token: n,
      owner: "dns_ip_pool_fetch",
      leaseMs: Rm
    }),
    token: n,
    key: a
  } : {
    acquired: !1,
    reason: "db_unavailable",
    backend: "d1",
    token: n,
    key: a
  };
}
async function $m({ kv: o = null, db: e = null, leaseRepository: t = null } = {}, r = null) {
  if (!r?.token) return !1;
  const a = String(r?.key || "").trim();
  return e && a ? await t.releaseScheduledLeaseWithDb(e, r.token, { scope: a }) : !1;
}
async function Bm({ kv: o = null, db: e = null, ctx: t = null, sourceList: r = [], maxBytes: a = F.Defaults.DnsIpSourceFetchMaxBytes, poolRepository: n = null } = {}) {
  const s = (Array.isArray(r) ? r : []).map((S, A) => Nt(S, A)), i = s.filter((S) => S.enabled === !0 && or(S)), c = le(F.Defaults.DnsIpSourceConcurrency, F.Defaults.DnsIpSourceConcurrency, 1, 4), l = await Xr(i, i.some((S) => bt(S?.sourceType) === "domain") ? Math.min(c, 2) : c, async (S) => Pm(S, a)), u = [], d = /* @__PURE__ */ new Map();
  for (const S of l)
    d.set(String(S?.id || ""), S), Array.isArray(S?.items) && u.push(...S.items);
  const f = s.map((S, A) => {
    const E = d.get(String(S?.id || ""));
    return Nt(E ? {
      ...S,
      lastFetchAt: E.lastFetchAt,
      lastFetchStatus: E.status,
      lastFetchCount: E.count
    } : S, A);
  }), m = await pe(n.persistDnsIpPoolSources({
    kv: o,
    db: e
  }, f, null), "dns_ip_pool.refresh.persist_source_state", {
    sourceCount: f.length,
    enabledSourceCount: i.length
  }, f), p = mr(u), h = So(p), g = hi(l);
  let y = "", _ = "";
  if (e) {
    const S = Fa(s, a);
    if (S && mu(l)) {
      const A = H(), E = A + Tm, T = await n.upsertDnsIpPoolFetchCacheEntry(e, {
        signature: S,
        items: p,
        sourceResults: l,
        importedCount: h.length,
        enabledSourceCount: i.length,
        cachedAtMs: A,
        expiresAtMs: E,
        createdAt: new Date(A).toISOString(),
        updatedAt: new Date(A).toISOString()
      });
      y = za(T?.cachedAtMs), _ = za(T?.expiresAtMs);
    }
  }
  return i.length && await pe(n.bumpDnsIpPoolRevision({
    kv: o,
    db: e
  }, {
    lastFetchAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
    lastFetchSourceCount: i.length,
    lastFetchImportedCount: h.length
  }, null), "dns_ip_pool.refresh.bump_revision", {
    enabledSourceCount: i.length,
    importedCount: h.length
  }, null), {
    sourceList: m,
    sourceResults: g,
    importedCount: h.length,
    items: h,
    enabledSourceCount: i.length,
    cachedAt: y,
    expiresAt: _
  };
}
function Km(o = {}, e = {}) {
  const { kernel: t } = o, { buildDnsIpPoolWorkspacePreviewItems: r, buildDnsIpWorkspaceItems: a, releaseDnsIpPoolFetchRefreshLock: n, runDnsIpPoolSourcesLiveRefresh: s, tryAcquireDnsIpPoolFetchRefreshLock: i } = o;
  return {
    async getDnsIpWorkspace(c, { env: l, kv: u, db: d, request: f, ctx: m }) {
      try {
        const p = c?.forceRefresh === !0;
        d && await t.ensureDnsIpWorkspaceSchema(d);
        const h = await ue(l), g = na(f), y = td(f);
        let _ = await t.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        });
        const S = Fm(c), A = F.Defaults.DnsIpSourceFetchMaxBytes, E = _.filter((L) => L.enabled === !0 && or(L));
        let T = [], w = "empty", D = !1;
        if (p && E.length > 0) {
          const L = await s({
            kv: u,
            db: d,
            ctx: m,
            sourceList: _,
            maxBytes: A
          });
          _ = Array.isArray(L?.sourceList) ? L.sourceList : _, T = Array.isArray(L?.items) ? L.items : [], w = "live_sync";
        } else {
          const L = Fa(_, A), v = d && L ? await t.getDnsIpPoolFetchCacheEntry(d, L) : null;
          if (v)
            T = Array.isArray(v?.items) ? v.items : [], w = "cache";
          else if (E.length > 0 && m?.waitUntil && L) {
            const M = await i({
              kv: u,
              db: d
            }, L);
            M?.acquired === !0 && (D = !0, w = "live_deferred", m.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: _,
                  maxBytes: A
                });
              } catch (C) {
                console.warn("[DNS IP Workspace] background source snapshot refresh failed:", C?.message || C);
              } finally {
                await n({
                  kv: u,
                  db: d
                }, M);
              }
            })()));
          }
        }
        const k = Um(T, S), b = await a(k, d, g, {
          forceRefresh: p,
          scope: "shared_pool",
          ctx: m,
          deferProbe: !0,
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        }), N = [], R = Array.isArray(b?.items) ? b.items : [], x = await t.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool"), O = /* @__PURE__ */ new Map();
        for (const L of R) {
          const v = String(L?.countryCode || "").trim().toUpperCase();
          if (!v) continue;
          const M = O.get(v) || {
            code: v,
            name: String(L?.countryName || "未知"),
            count: 0
          };
          M.count += 1, O.set(v, M);
        }
        return ee({
          zoneId: String(h.cfZoneId || "").trim(),
          zoneName: "",
          host: "",
          requestColo: g,
          probeEntryColo: g,
          probeDataSource: vm("cache", b?.probeDataSource),
          sourceSnapshotStatus: w,
          backgroundRefreshQueued: D,
          requestCountryCode: y.countryCode,
          requestCountryName: y.countryName,
          currentHostItems: N,
          sharedPoolItems: R,
          sourceList: _,
          availableCountries: [...O.values()].sort((L, v) => String(L.code || "").localeCompare(String(v.code || ""))),
          summary: hu(N, R),
          dnsIpPoolRevision: t.getDnsIpPoolRevisionFromStatus(x),
          generatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          ..._r(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, {
            ctx: m,
            config: h
          })
        });
      } catch (p) {
        throw wt(p, "DNS_IP_WORKSPACE_READ_FAILED", "独立 IP 池工作区读取失败：KV 读取异常", "admin.read.dns_ip_workspace");
      }
    },
    async importDnsIpPoolItems(c, { env: l, kv: u, db: d, request: f }) {
      const m = String(c?.text || c?.content || "").trim();
      if (!m) return z("EMPTY_IMPORT_TEXT", "请先提供要导入的文本内容");
      const p = String(c?.sourceKind || "manual").trim().toLowerCase() || "manual", h = String(c?.sourceLabel || "").trim() || (p === "file" ? "文件导入" : "手动导入"), g = yo(m).map((S) => ({
        ...S,
        sourceKind: p,
        sourceLabel: h
      })), y = await a(g, d, na(f), {
        scope: "shared_pool",
        forceRefresh: !1
      }), _ = Array.isArray(y?.items) ? y.items : [];
      return ee({
        success: !0,
        importedCount: _.length,
        items: _,
        revisions: await t.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async saveDnsIpPoolSources(c, { env: l, kv: u, db: d, ctx: f }) {
      if (!d) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
      const m = await t.persistDnsIpPoolSources({
        kv: u,
        db: d
      }, c?.sources || [], f);
      return await t.bumpDnsIpPoolRevision({
        kv: u,
        db: d
      }, {
        lastSourceConfigAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        sourceCount: m.length
      }, f), ee({
        success: !0,
        sourceList: m,
        dnsIpPoolRevision: await t.getOpsStatusSection({
          kv: u,
          db: d
        }, "dnsIpPool").then((p) => t.getDnsIpPoolRevisionFromStatus(p)).catch(() => ""),
        ..._r(),
        revisions: await t.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async getDnsIpPoolSources(c, { env: l, kv: u, db: d }) {
      try {
        if (!d) return ee({
          success: !0,
          sourceList: [],
          dnsIpPoolRevision: "",
          ..._r(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: await ue(l) })
        });
        d && await t.ensureDnsIpWorkspaceSchema(d);
        const [f, m, p] = await Promise.all([
          ue(l),
          t.getDnsIpPoolSourcesForRead({
            kv: u,
            db: d
          }),
          t.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool")
        ]);
        return ee({
          success: !0,
          sourceList: m,
          dnsIpPoolRevision: t.getDnsIpPoolRevisionFromStatus(p),
          ..._r(),
          revisions: await t.getAdminRevisionsForRead({
            env: l,
            kv: u,
            db: d
          }, { config: f })
        });
      } catch (f) {
        throw wt(f, "DNS_IP_POOL_SOURCES_READ_FAILED", "独立 IP 池抓取源读取失败：D1 读取异常", "admin.read.dns_ip_pool_sources");
      }
    },
    async refreshDnsIpPoolFromSources(c, { env: l, kv: u, db: d, ctx: f, request: m }) {
      try {
        if (!d) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        d && await t.ensureDnsIpWorkspaceSchema(d);
        const p = le(c?.maxBytes, F.Defaults.DnsIpSourceFetchMaxBytes, 1024, 8 * 1024 * 1024), h = await t.getDnsIpPoolSources({
          kv: u,
          db: d
        }), g = Fa(h, p), y = d && g ? await t.getDnsIpPoolFetchCacheEntry(d, g) : null;
        if (y) {
          let A = !1;
          if (f?.waitUntil) {
            const w = await i({
              kv: u,
              db: d
            }, g);
            w?.acquired === !0 && (A = !0, f.waitUntil((async () => {
              try {
                await s({
                  kv: u,
                  db: d,
                  sourceList: h,
                  maxBytes: p
                });
              } catch (D) {
                console.warn("[DNS IP Pool] background refresh failed:", D?.message || D);
              } finally {
                await n({
                  kv: u,
                  db: d
                }, w);
              }
            })()));
          }
          const E = xm(y), T = await r(E.items, d, na(m), f, { syncProbeLimit: 0 });
          return ee({
            success: !0,
            sourceResults: E.sourceResults,
            sourceList: h,
            importedCount: E.importedCount,
            items: T,
            cacheStatus: "d1",
            backgroundRefreshQueued: A,
            cachedAt: E.cachedAt,
            expiresAt: E.expiresAt,
            dnsIpPoolRevision: await t.getOpsStatusSection({
              kv: u,
              db: d
            }, "dnsIpPool").then((w) => t.getDnsIpPoolRevisionFromStatus(w)).catch(() => ""),
            ..._r(),
            revisions: await t.getAdminRevisions({
              env: l,
              kv: u,
              db: d
            })
          });
        }
        const _ = await s({
          kv: u,
          db: d,
          ctx: f,
          sourceList: h,
          maxBytes: p
        }), S = await r(_.items, d, na(m), f, {
          syncProbeLimit: 0,
          probeTimeoutMs: 500
        });
        return ee({
          success: !0,
          sourceResults: _.sourceResults,
          sourceList: _.sourceList,
          importedCount: _.importedCount,
          items: S,
          cacheStatus: "live",
          backgroundRefreshQueued: !1,
          cachedAt: _.cachedAt,
          expiresAt: _.expiresAt,
          dnsIpPoolRevision: await t.getOpsStatusSection({
            kv: u,
            db: d
          }, "dnsIpPool").then((A) => t.getDnsIpPoolRevisionFromStatus(A)).catch(() => ""),
          ..._r(),
          revisions: await t.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      } catch (p) {
        if (on(p)) throw p;
        const h = se(p, "unknown_error"), g = /* @__PURE__ */ new Error(`更新服务端共享快照失败: ${h}`);
        throw g.code = "DNS_IP_POOL_REFRESH_FAILED", g.status = 500, g.details = { reason: h }, g;
      }
    },
    async deleteDnsIpPoolItems(c, { env: l, kv: u, db: d, ctx: f }) {
      d && await t.ensureDnsIpWorkspaceSchema(d);
      const m = pu(c?.target);
      if (m === "shared_snapshot") {
        if (!d) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库");
        const h = await t.getDnsIpPoolSourcesForRead({
          kv: u,
          db: d
        }), g = Fa(h, F.Defaults.DnsIpSourceFetchMaxBytes), y = g ? await t.getDnsIpPoolFetchCacheEntry(d, g) : null, _ = gu(y, c?.ips || []);
        if (y && g && _.deletedCount > 0) {
          const S = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), A = Math.max(0, Number(y?.cachedAtMs) || 0), E = Math.max(A, Number(y?.expiresAtMs) || A), T = Math.max(0, Number(y?.enabledSourceCount) || (Array.isArray(h) ? h.filter((w) => w?.enabled === !0 && or(w)).length : 0));
          await t.upsertDnsIpPoolFetchCacheEntry(d, {
            signature: g,
            items: _.items,
            sourceResults: _.sourceResults,
            importedCount: _.items.length,
            enabledSourceCount: T,
            cachedAtMs: A,
            expiresAtMs: E,
            createdAt: String(y?.createdAt || S),
            updatedAt: S
          }), await t.bumpDnsIpPoolRevision({
            kv: u,
            db: d
          }, {
            lastSnapshotDeleteAt: S,
            lastSnapshotDeleteCount: _.deletedCount
          }, f);
        }
        return ee({
          success: !0,
          target: m,
          deletedCount: _.deletedCount,
          deletedIps: _.deletedIps,
          revisions: await t.getAdminRevisions({
            env: l,
            kv: u,
            db: d
          })
        });
      }
      const p = yi(c?.ips || []).normalizedIps;
      return ee({
        success: !0,
        target: m,
        deletedCount: d ? await t.deleteDnsIpPoolItems(d, p) : p.length,
        revisions: await t.getAdminRevisions({
          env: l,
          kv: u,
          db: d
        })
      });
    },
    async fillDnsDraftFromIpPool(c) {
      const l = [];
      for (const f of Array.isArray(c?.ips) ? c.ips : []) {
        const m = String(f?.ip || f || "").trim(), p = qe(m);
        !m || !p || l.push({
          type: p === "IPv6" ? "AAAA" : "A",
          content: m
        });
      }
      if (!l.length) return z("EMPTY_IP_SELECTION", "请先选择至少一个可用 IP");
      const u = [], d = /* @__PURE__ */ new Set();
      for (const f of l) {
        const m = `${f.type}:${f.content.toLowerCase()}`;
        d.has(m) || (d.add(m), u.push(f));
      }
      return u.sort((f, m) => f.type !== m.type ? f.type.localeCompare(m.type) : f.content.localeCompare(m.content)), ee({
        success: !0,
        mode: "a",
        records: u
      });
    }
  };
}
function zm(o = {}, e = {}) {
  const { kernel: t } = o;
  return {
    async testTelegram(r) {
      const { tgBotToken: a, tgChatId: n } = r;
      if (!a || !n) return z("MISSING_PARAMS", "请先填写 Bot Token 和 Chat ID");
      try {
        return await t.sendTelegramMessage({
          tgBotToken: a,
          tgChatId: n,
          text: `✅ Emby Proxy: Telegram 机器人测试通知成功！
如果您能看到这条消息，说明您的通知配置完全正确。`
        }), ee({ success: !0 });
      } catch (s) {
        return z("NETWORK_ERROR", s.message);
      }
    },
    async sendDailyReport(r, { env: a }) {
      try {
        const n = await t.sendDailyTelegramReport(a);
        return ee({
          success: !0,
          sentCount: Number(n?.sentCount) || 0,
          reportKinds: Array.isArray(n?.reportKinds) ? n.reportKinds : []
        });
      } catch (n) {
        return z("REPORT_FAILED", n.message);
      }
    },
    async sendPredictedAlert(r, { env: a }) {
      try {
        const n = await t.maybeSendRuntimeAlerts(a, null, {
          ignoreCooldown: !0,
          persistState: !1,
          triggeredBy: "manual_predict"
        });
        return ee({
          success: !0,
          sent: n?.sent === !0,
          issueCount: Number(n?.issueCount) || 0,
          reason: String(n?.reason || "").trim()
        });
      } catch (n) {
        return z("ALERT_PREDICT_FAILED", n.message);
      }
    },
    async pingNode(r, { env: a, ctx: n }) {
      const s = await Re(a), i = le(r.timeout, s.pingTimeout ?? Du, 1e3, 18e4);
      if (r.target) {
        const _ = t.normalizeSingleTarget(r.target);
        if (!_) return z("INVALID_TARGET", "目标源站必须是有效的 http/https URL");
        const S = await t.pingTarget(_, i);
        return ee({
          ...S.ok ? { ms: S.elapsedMs } : {},
          probe: S,
          target: _,
          usedCache: !1,
          scope: "target"
        });
      }
      const c = String(r.name || "").trim(), l = await t.getNode(c, a, n);
      if (!l || !Array.isArray(l.lines) || !l.lines.length) return z("NOT_FOUND", "节点不存在");
      const u = String(r.lineId || "").trim(), d = u ? l.lines.filter((_) => _.id === u) : l.lines.slice();
      if (u && !d.length) return z("LINE_NOT_FOUND", "线路不存在", 404);
      const f = await Promise.all(d.map(async (_) => {
        const S = await t.pingTarget(_.target, i);
        return {
          id: String(_?.id || "").trim(),
          name: String(_?.name || "").trim(),
          target: String(_?.target || "").trim(),
          latencyMs: S.ok ? S.elapsedMs : null,
          probe: S,
          latencyUpdatedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        };
      })), m = l.lines.map((_) => {
        const S = f.find((A) => A.id === _.id);
        return S ? {
          id: S.id,
          name: S.name,
          target: S.target,
          latencyMs: S.latencyMs,
          probe: S.probe,
          latencyUpdatedAt: S.latencyUpdatedAt
        } : {
          id: String(_?.id || "").trim(),
          name: String(_?.name || "").trim(),
          target: String(_?.target || "").trim()
        };
      }), p = t.resolveActiveLineId(l.activeLineId, m, m), h = t.getActiveNodeLine({
        ...l,
        lines: m,
        activeLineId: p
      }), g = u ? m.find((_) => _.id === u) : h, y = t.buildNodeSummary(c.toLowerCase(), l).summary || { name: c.toLowerCase() };
      return ee({
        ...g?.probe?.ok ? { ms: g.probe.elapsedMs } : {},
        probe: g?.probe || null,
        usedCache: !1,
        sorted: !1,
        activeLineId: p,
        activeLineName: h?.name || "",
        line: g || null,
        node: {
          ...y,
          lines: m,
          activeLineId: p
        }
      });
    }
  };
}
function Wm(o = {}, e = {}) {
  const { kernel: t } = o, { LogQueryPlanner: r } = o;
  return {
    async getLogs(a, { db: n, env: s }) {
      if (!n) return ee({ error: "D1 not configured" }, 500);
      const i = r.normalizeRequest(a), { filters: c } = i, l = s ? await Re(s) : {}, u = await t.resolveLogsReadiness({
        db: n,
        kv: t.getKV(s)
      }), d = r.resolveSearch(c, l, u);
      if (d.errorResponse) return d.errorResponse;
      const { effectiveSearchMode: f, searchFallbackReason: m } = d;
      if (l.logEnabled === !1) return r.buildDisabledResponse(i, u, f, m);
      if (u.schemaReady !== !0) return z("LOG_SCHEMA_NOT_READY", "日志表尚未初始化，请先点击“初始化日志表”", 400, {
        effectiveSearchMode: f,
        searchFallbackReason: m,
        revisions: { logsRevision: u.revision }
      });
      const p = r.buildSqlPlan(c, i, l, f);
      if (p.errorResponse) return p.errorResponse;
      const h = await r.executeSqlPlan(n, i, p);
      return h.errorResponse ? h.errorResponse : r.buildSuccessResponse(i, u, {
        logs: h.logs,
        total: h.total,
        totalPages: h.totalPages,
        searchMode: h.searchMode,
        effectiveSearchMode: f,
        searchFallbackReason: m,
        hasPrevPage: h.hasPrevPage,
        hasNextPage: h.hasNextPage,
        nextCursor: h.nextCursor
      });
    },
    async clearLogs(a, { db: n, env: s, ctx: i, request: c }) {
      if (c.headers.get("X-Admin-Confirm") !== "clearLogs") return z("CONFIRMATION_REQUIRED", "敏感操作需要显式确认头", 428);
      if (!n) return ee({ error: "D1 not configured" }, 500);
      await t.ensureLogsBaseSchema(n), await t.ensureStatsHourlySchema(n);
      const l = H(), u = ar.get(n);
      u.LogClearEpochMs = Math.max(u.LogClearEpochMs || 0, l), await t.patchOpsStatus(s || n, { log: {
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString()
      } }, i);
      const d = u.LogFlushTask;
      if (d) try {
        await d;
      } catch {
      }
      u.LogQueue.length = 0, u.LogDedupe.clear(), u.LogLastFlushAt = 0, await n.prepare(`DELETE FROM ${t.LOGS_TABLE}`).run(), await t.clearStatsHourly(n).catch(() => !1);
      let f = !1;
      try {
        f = await t.rebuildLogsFts(n);
      } catch (g) {
        console.warn("clearLogs FTS rebuild failed", g);
      }
      const m = await t.isLogsFtsReady(n), p = await t.hasStatsHourlyTable(n), h = await t.bumpLogsRevision(s || { db: n }, {
        schemaReady: !0,
        ftsReady: m,
        statsReady: p,
        clearEpochMs: l,
        clearEpochAt: new Date(l).toISOString(),
        lastClearAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      }, i);
      return ee({
        success: !0,
        ftsRebuilt: f,
        revisions: { logsRevision: t.getLogsRevisionFromStatus(h?.log || h) }
      });
    },
    async getD1SchemaStatus(a, { db: n, env: s }) {
      if (!n) return z("D1_NOT_CONFIGURED", "请先绑定 D1 / PROXY_LOGS 数据库", 503);
      const i = await t.buildD1SchemaRepairPlan(n);
      let c = {
        token: "",
        expiresAt: 0
      };
      return i.phase === "destructive" && i.blockingIssues.length === 0 && (c = await t.createD1SchemaRepairToken(s, i)), ee({
        success: !0,
        status: {
          ...i.status,
          repairableIssues: i.repairableIssues,
          highRiskIssues: i.highRiskIssues,
          blockingIssues: i.blockingIssues
        },
        repairPlan: {
          version: i.version,
          phase: i.phase,
          contractVersion: i.contractVersion,
          contractHash: i.contractHash,
          schemaCookie: i.schemaCookie,
          planHash: i.planHash,
          risk: i.risk,
          repairableIssues: i.repairableIssues,
          highRiskIssues: i.highRiskIssues,
          blockingIssues: i.blockingIssues,
          steps: i.steps,
          repairToken: c.token,
          expiresAt: c.expiresAt ? (/* @__PURE__ */ new Date(c.expiresAt * 1e3)).toISOString() : ""
        }
      });
    },
    async initLogsDb(a, { db: n, env: s, request: i }) {
      if (!n) return z("D1_NOT_CONFIGURED", "D1 database is not configured", 503);
      const c = await t.initializeD1Database(n, {
        includeFts: !0,
        env: s,
        repairMode: String(a?.repairMode || "safe").trim() || "safe",
        repairToken: String(a?.repairToken || "").trim(),
        confirmHighRisk: String(i?.headers?.get("X-Admin-Confirm") || "").trim() === "repairD1Schema"
      }), l = c.status, u = l.ftsReady === !0, d = l.tables?.[t.STATS_HOURLY_TABLE] === !0, f = l.schemaReady === !0 ? await t.bumpLogsRevision(n, {
        schemaReady: !0,
        ftsReady: u,
        statsReady: d,
        categoryEnabled: !0
      }) : null;
      return ee({
        success: c.completed === !0 || c.pendingHighRisk === !0,
        schemaReady: l.schemaReady === !0,
        pendingHighRisk: c.pendingHighRisk === !0,
        categoryEnabled: !0,
        ftsReady: u,
        statsReady: d,
        initialization: c,
        steps: c.steps,
        status: l,
        revisions: f ? { logsRevision: t.getLogsRevisionFromStatus(f?.log || f) } : {}
      });
    }
  };
}
function Gm(o = {}) {
  const { kernel: e } = o, t = {}, r = _l([
    {
      name: "dashboard",
      handlers: jf({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "config",
      handlers: tm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "backup",
      handlers: rm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "nodes",
      handlers: im({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "maintenance",
      handlers: cm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "dns-records",
      handlers: Sm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "dns-pool",
      handlers: Km({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "notifications",
      handlers: zm({
        ...o,
        kernel: e
      }, t)
    },
    {
      name: "database",
      handlers: Wm({
        ...o,
        kernel: e
      }, t)
    }
  ], { aliases: {
    import: "saveOrImport",
    save: "saveOrImport"
  } });
  for (const [a, n] of Object.entries(r.handlers)) t[a] = n;
  return r;
}
function jm(o = {}) {
  return { adminActionHandlers: Gm(o).handlers };
}
function Ve(o, e) {
  const t = $(o) ? o : {}, r = $(e) ? e : {}, a = { ...t };
  for (const [n, s] of Object.entries(r))
    s !== void 0 && ($(s) && $(t[n]) ? a[n] = Ve(t[n], s) : $(s) ? a[n] = Ve({}, s) : a[n] = s);
  return a;
}
function Ie(o, e, t, r) {
  o.has(e) && o.delete(e), o.set(e, t);
  const a = Math.floor(Number(r));
  if (!(!Number.isFinite(a) || a < 1))
    for (; o.size > a; ) {
      const n = o.keys().next().value;
      if (n === void 0) break;
      o.delete(n);
    }
}
function Za(o, e) {
  if (!o.has(e)) return;
  const t = o.get(e);
  return o.delete(e), o.set(e, t), t;
}
function cr(o = void 0) {
  const e = o === void 0 ? yt.current() : Se(o);
  e.NodesRevisionCacheGeneration += 1, e.NodesRevisionCache = null;
}
function Ns(o, e = null) {
  const t = Se(e);
  t.NodesRevisionCacheGeneration += 1, t.NodesRevisionCache = {
    loaded: !0,
    revision: String(o || "").trim(),
    exp: Date.now() + F.Defaults.NodesRevisionCacheTtlMs
  };
}
function Pe(o, e = yt.current()) {
  const t = String(o || "").trim().toLowerCase(), r = t && Number(e.NodeCacheGenerations.get(t)) || 0, a = r ? `node:${r}` : `missing:${e.NodeCacheGenerationEvictionEpoch}`;
  return `${e.NodeCacheResetGeneration}:${a}`;
}
function Vm(o = [], e = yt.current()) {
  for (const t of Array.isArray(o) ? o : [o]) {
    const r = String(t || "").trim().toLowerCase();
    if (!r) continue;
    !e.NodeCacheGenerations.has(r) && e.NodeCacheGenerations.size >= F.Defaults.NodeCacheMax && (e.NodeCacheGenerationEvictionEpoch += 1);
    const a = ++e.NodeCacheGenerationNonce;
    Ie(e.NodeCacheGenerations, r, a, F.Defaults.NodeCacheMax);
  }
}
function Is(o = yt.current()) {
  o.NodeCacheResetGeneration += 1, o.NodeCacheGenerations.clear();
}
function Fe(o) {
  return new TextEncoder().encode(String(o ?? "")).byteLength;
}
function Oc(o, e, t = {}) {
  const r = Fe(e), a = Math.max(1, Number(t.limitBytes) || Vt), n = /* @__PURE__ */ new Error(`D1 value exceeds the ${a}-byte compatibility budget`);
  return n.code = "D1_VALUE_TOO_LARGE", n.status = 400, n.details = {
    field: String(o || "value"),
    actualBytes: r,
    limitBytes: a,
    platformLimitBytes: ku
  }, n;
}
function Ha(o, e, t = {}) {
  if (Fe(e) > Math.max(1, Number(t.limitBytes) || Vt)) throw Oc(o, e, t);
  return e;
}
function Qe(o, e = {}) {
  const t = String(o || "").trim().toLowerCase(), r = $(e) ? e : {}, a = Array.isArray(r.lines) ? r.lines : [];
  if (a.length > Bn) return {
    nodeName: t,
    field: "lines",
    actual: a.length,
    limit: Bn
  };
  const n = $(r.headers) ? r.headers : {}, s = Object.entries(n);
  if (s.length > es) return {
    nodeName: t,
    field: "headers.count",
    actual: s.length,
    limit: es
  };
  let i = 0;
  for (const [l, u] of s) {
    const d = Fe(l), f = Fe(u);
    if (d > rs) return {
      nodeName: t,
      field: `headers.${l}.keyBytes`,
      actual: d,
      limit: rs
    };
    if (f > as) return {
      nodeName: t,
      field: `headers.${l}.valueBytes`,
      actual: f,
      limit: as
    };
    i += d + f;
  }
  if (i > ts) return {
    nodeName: t,
    field: "headers.bytes",
    actual: i,
    limit: ts
  };
  for (const l of $u) {
    const u = Fe(r[l]);
    if (u > br) return {
      nodeName: t,
      field: l,
      actual: u,
      limit: br
    };
  }
  for (let l = 0; l < (Array.isArray(r.tags) ? r.tags.length : 0); l += 1) {
    const u = Fe(r.tags[l]);
    if (u > br) return {
      nodeName: t,
      field: `tags.${l}`,
      actual: u,
      limit: br
    };
  }
  for (let l = 0; l < a.length; l += 1) for (const u of [
    "id",
    "name",
    "target"
  ]) {
    const d = Fe(a[l]?.[u]);
    if (d > br) return {
      nodeName: t,
      field: `lines.${l}.${u}`,
      actual: d,
      limit: br
    };
  }
  let c = 0;
  try {
    c = Fe(JSON.stringify(r));
  } catch {
    return {
      nodeName: t,
      field: "record",
      actual: null,
      limit: Cn
    };
  }
  return c > Cn ? {
    nodeName: t,
    field: "record.bytes",
    actual: c,
    limit: Cn
  } : null;
}
function qm(o, e = {}) {
  const t = Qe(o, e);
  return t ? {
    code: "NODE_RESOURCE_LIMIT_EXCEEDED",
    ...t
  } : null;
}
async function wr(o, e = null) {
  const t = Se(e), r = t.NodeIndexMutationChain.catch(() => null).then(async () => {
    t.NodesListCache = null, t.NodesIndexCache = null, cr(e);
    try {
      return await o();
    } catch (a) {
      throw t.NodesListCache = null, t.NodesIndexCache = null, cr(e), a;
    }
  });
  return t.NodeIndexMutationChain = r.catch(() => null), await r;
}
var Xm = "cf_dashboard_cache:", vc = "sys:cf_dash_cache", Ym = 1800 * 1e3, Ms = 1440 * 60 * 1e3, Jm = "sys:cf_daily_traffic", $a = 7, Qm = 1080 * 60 * 60, Zm = $a;
function Qn(o, e = "") {
  return `${Xm}${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function Ps(o, e = "") {
  return `${vc}:${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
function xs(o = /* @__PURE__ */ new Date(), e = F.Defaults.ScheduleUtcOffsetMinutes) {
  const t = Aa(o, e), r = t.shiftedDate.getUTCFullYear(), a = t.shiftedDate.getUTCMonth(), n = Date.UTC(r, a, 1) - t.utcOffsetMinutes * 60 * 1e3, s = Date.UTC(r, a + 1, 1) - t.utcOffsetMinutes * 60 * 1e3, i = t.now.getTime();
  return {
    ...t,
    monthKey: `${r}-${String(a + 1).padStart(2, "0")}`,
    periodLabel: `${r}年${a + 1}月`,
    startTs: n,
    endTs: Math.min(Math.max(n, i), s - 1),
    nextMonthTs: s
  };
}
function ep(o = "", e = "", t = 0) {
  return [
    "dashboard_monthly_traffic",
    1,
    encodeURIComponent(String(o || "default").trim() || "default"),
    encodeURIComponent(String(e || "current").trim() || "current"),
    Oe(t)
  ].join(":");
}
function tp(o = "") {
  const e = String(o || "").trim();
  return e ? new Request(`https://dashboard-monthly-traffic-cache.invalid/${encodeURIComponent(e)}`) : null;
}
function Fc(o = "", e = "") {
  return `${Jm}:${encodeURIComponent(String(o || "default").trim() || "default")}:${encodeURIComponent(String(e || "current").trim() || "current")}`;
}
async function Os(o, e, t) {
  if (!o || typeof o.get != "function" || !t) return null;
  const r = Fc(e, t);
  try {
    const a = await o.get(r, { type: "json" }), n = Number(a?.bytes);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch (a) {
    return Ae("dashboard.daily_traffic_archive_read_failed", a, { cacheKey: r }), null;
  }
}
async function vs(o, e, { dateKey: t = "", bytes: r = 0, dayEndTs: a = 0 } = {}) {
  if (!o || typeof o.put != "function" || !t) return !1;
  const n = Fc(e, t);
  try {
    return await o.put(n, JSON.stringify({
      bytes: Math.max(0, Number(r) || 0),
      dateKey: t,
      dayEndTs: Math.max(0, Number(a) || 0)
    }), { expirationTtl: Qm }), !0;
  } catch (s) {
    return Ae("dashboard.daily_traffic_archive_write_failed", s, { cacheKey: n }), !1;
  }
}
function Jt(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {};
  return {
    period: "month",
    periodKey: String(e.periodKey || "").trim(),
    periodLabel: String(e.periodLabel || "本月").trim() || "本月",
    traffic: String(e.traffic || "0 B").trim() || "0 B",
    totalBytes: Math.max(0, Number(e.totalBytes) || 0),
    cfAnalyticsLoaded: e.cfAnalyticsLoaded === !0,
    cfAnalyticsStatus: String(e.cfAnalyticsStatus || "").trim(),
    cfAnalyticsError: String(e.cfAnalyticsError || "").trim(),
    cfAnalyticsDetail: String(e.cfAnalyticsDetail || "").trim(),
    trafficSourceText: String(e.trafficSourceText || "本月视频流量口径：CF Zone 总流量（edgeResponseBytes）").trim(),
    generatedAt: String(e.generatedAt || "").trim(),
    cacheStatus: String(e.cacheStatus || "live").trim().toLowerCase() || "live",
    warning: String(e.warning || "").trim()
  };
}
function rp(o = "", e = "") {
  const t = String(o || "").trim();
  return t ? String(e || "").trim().toLowerCase() === "workers_usage" && t.includes("Cloudflare Workers Usage") ? "今日请求量口径：Cloudflare Workers Usage" : t : "";
}
function ap(o = "") {
  const e = String(o || "").trim();
  return e ? e.includes("请求数已对齐 Workers Usage") ? "Cloudflare 统计正常" : e : "";
}
function np(o = "", e = "") {
  const t = String(o || "").trim();
  if (!t) return "";
  const r = String(e || "").trim().toLowerCase();
  return t.includes("已对齐脚本") || r === "workers_usage" && t.includes("脚本:") ? "" : t;
}
var op = [
  "周日",
  "周一",
  "周二",
  "周三",
  "周四",
  "周五",
  "周六"
];
function Uc() {
  return Array.from({ length: 24 }, (o, e) => String(e).padStart(2, "0"));
}
function Zn(o = "") {
  const e = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(o || "").trim());
  if (!e) return String(o || "").trim() || "-";
  const t = op[new Date(Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))).getUTCDay()] || "";
  return `${e[2]}-${e[3]}${t ? ` ${t}` : ""}`;
}
function kc(o = "", e = 0, t = 0, r = 0, a = 0) {
  const n = Math.max(0, Math.min(23, Number(e) || 0)), s = Math.max(0, Number(t) || 0), i = Math.max(0, Number(r) || 0), c = Math.max(0, Math.min(1, Number(a) || 0)), l = `${String(n).padStart(2, "0")}:00`, u = s > 0 ? Math.min(0.88, Number((0.12 + c * 0.68).toFixed(3))) : 0.04;
  return {
    key: `${o}:${n}`,
    hour: n,
    hourLabel: l,
    rowsWritten: s,
    writeQueries: i,
    intensity: c,
    className: s > 0 ? "d1-heat-cell is-active" : "d1-heat-cell is-empty",
    style: `--d1-heat-alpha:${u}`,
    title: `${o} ${l} · 写入 ${ye(s)} 行 · SQL 写 ${ye(i)} 次`
  };
}
function en(o = {}) {
  const e = Oe(o.utcOffsetMinutes), t = Math.max(0, Number(o.nowMs) || H()), r = st(new Date(t), e).startTs - 8640 * 60 * 1e3, a = Array.from({ length: 7 }, (n, s) => {
    const i = ot(r + s * 24 * 60 * 60 * 1e3, e);
    return {
      key: i.dateKey,
      dateKey: i.dateKey,
      label: Zn(i.dateKey),
      cells: Array.from({ length: 24 }, (c, l) => kc(i.dateKey, l))
    };
  });
  return {
    title: "D1 写入热点图",
    status: String(o.status || "idle").trim().toLowerCase() || "idle",
    source: String(o.source || "").trim(),
    summary: String(o.summary || "D1 写入热点尚未加载").trim() || "D1 写入热点尚未加载",
    detail: String(o.detail || "").trim(),
    periodLabel: String(o.periodLabel || `最近 7 天 · ${go(e)}`).trim(),
    hourLabels: Uc(),
    rows: a,
    available: !1,
    totalRowsWritten: 0,
    totalWriteQueries: 0,
    peakLabel: "",
    legendMaxLabel: "0"
  };
}
function sp(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, t = en({ status: "idle" });
  return {
    ...t,
    ...e,
    title: String(e.title || t.title).trim() || t.title,
    status: String(e.status || t.status).trim().toLowerCase() || t.status,
    source: String(e.source || t.source).trim(),
    summary: String(e.summary || t.summary).trim() || t.summary,
    detail: String(e.detail || t.detail).trim(),
    periodLabel: String(e.periodLabel || t.periodLabel).trim() || t.periodLabel,
    hourLabels: Array.isArray(e.hourLabels) && e.hourLabels.length ? e.hourLabels.map((r) => String(r || "").trim()).filter(Boolean) : t.hourLabels,
    rows: Array.isArray(e.rows) ? e.rows : t.rows,
    available: e.available === !0,
    totalRowsWritten: Math.max(0, Number(e.totalRowsWritten) || 0),
    totalWriteQueries: Math.max(0, Number(e.totalWriteQueries) || 0),
    peakLabel: String(e.peakLabel || "").trim(),
    legendMaxLabel: String(e.legendMaxLabel || "0").trim() || "0"
  };
}
function Ho(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, t = String(e.requestSource || "").trim().toLowerCase();
  return e.requestSourceText = rp(e.requestSourceText, t), e.cfAnalyticsStatus = ap(e.cfAnalyticsStatus), e.cfAnalyticsDetail = np(e.cfAnalyticsDetail, t), e.d1WriteHotspot = sp(e.d1WriteHotspot), e;
}
function $o(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e === "cache" || e === "stale" || e === "live" ? e : "live";
}
function Hc(o, e = "dashboard_snapshot_failed") {
  const t = kt(o, e);
  return t.length <= 220 ? t : `${t.slice(0, 217)}...`;
}
function Bo(o = {}) {
  const e = $o(o.cacheStatus || o.status), t = Math.max(0, Number(o.cachedAt) || 0);
  return {
    cacheStatus: e,
    cachedAt: t,
    expiresAt: Math.max(t, Number(o.expiresAt) || t),
    updatedAt: Math.max(t, Number(o.updatedAt) || t),
    generatedAt: String(o.generatedAt || "").trim(),
    warning: String(o.warning || "").trim(),
    partial: o.partial === !0 || e === "stale"
  };
}
function eo(o = {}) {
  const e = o && typeof o == "object" ? { ...o } : {}, t = Ho(!$(e.stats) && (Array.isArray(e.hourlySeries) || Object.prototype.hasOwnProperty.call(e, "todayRequests") || Object.prototype.hasOwnProperty.call(e, "todayTraffic")) ? e : $(e.stats) ? e.stats : {}), r = $(e.runtimeStatus) ? { ...e.runtimeStatus } : {}, a = $(e.cacheMeta) ? e.cacheMeta : {}, n = Bo({
    cacheStatus: a.cacheStatus || t.cacheStatus || "live",
    cachedAt: a.cachedAt,
    expiresAt: a.expiresAt,
    updatedAt: a.updatedAt,
    generatedAt: a.generatedAt || t.generatedAt || "",
    warning: a.warning,
    partial: a.partial === !0
  });
  return t.cacheStatus = $o(t.cacheStatus || n.cacheStatus), {
    stats: t,
    runtimeStatus: r,
    cacheMeta: n
  };
}
function ta(o = {}, e = "live", t = {}) {
  const r = eo(o), a = $o(e || r.cacheMeta.cacheStatus);
  return {
    stats: Ho({
      ...r.stats,
      cacheStatus: a
    }),
    runtimeStatus: $(r.runtimeStatus) ? { ...r.runtimeStatus } : {},
    cacheMeta: Bo({
      ...r.cacheMeta,
      ...t,
      cacheStatus: a,
      generatedAt: String(t.generatedAt || r.cacheMeta.generatedAt || r.stats.generatedAt || "").trim()
    })
  };
}
function to(o) {
  if (!(!o || typeof o != "object")) {
    try {
      o.cancelScheduledDelay?.();
    } catch {
    }
    o.cancelScheduledDelay = null, o.pendingSnapshot = null, o.scheduledFlushAt = 0, o.scheduledPromise = null, o.waitUntilCtx = null;
  }
}
function tr(o) {
  const e = te.PlaybackProgressRelay;
  if (!(e instanceof Map)) return !1;
  const t = e.get(o);
  return t && to(t), e.delete(o);
}
function Fs(o, e) {
  const t = te.PlaybackProgressRelay;
  if (!(t instanceof Map)) return !1;
  const r = Math.max(1, Number(F.Defaults.VideoProgressForwardSessionMax) || 1);
  if (!t.has(o) && t.size >= r) {
    let a = "";
    for (const [n, s] of t) if (!s?.activeFlushPromise) {
      a = n;
      break;
    }
    if (!a) return !1;
    tr(a);
  }
  return t.has(o) && t.delete(o), t.set(o, e), !0;
}
function hr(o, e = "/") {
  const t = Ze(o) ? new URL(o.targetUrl.toString()) : o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), r = Ze(o) ? o.normalizedBasePath : Pt(t.pathname), a = J(e);
  return t.pathname = (a === "/" ? r ? `${r}/` : "/" : `${r}${a}`) || "/", t.search = "", t.hash = "", t;
}
var ip = /* @__PURE__ */ new Set(["emby", "mediabrowser"]);
function Us(o = "/") {
  return J(o).split("/").filter(Boolean);
}
function cp(o = "/", e = "") {
  const t = J(o), r = String(e || "").trim();
  if (!r || r === "/") return null;
  const a = t.toLowerCase(), n = r.toLowerCase();
  return a !== n && !a.startsWith(`${n}/`) ? null : J(t.slice(r.length) || "/");
}
function lp(o = "/", e = "") {
  const t = Us(e), r = Us(o);
  if (!t.length || !r.length) return null;
  const a = String(t[t.length - 1] || "").toLowerCase(), n = String(r[0] || "").toLowerCase();
  return !a || a !== n || !ip.has(a) ? null : J(`/${r.slice(1).join("/")}`);
}
function $c(o, e = "/") {
  const t = Ze(o) ? o : pn(o);
  if (!t) return null;
  const r = J(e), a = t.normalizedBasePath;
  let n = r;
  if (a) {
    const s = cp(r, a);
    if (s !== null) n = s;
    else {
      const i = lp(r, a);
      i !== null && (n = i);
    }
  }
  return hr(t, n);
}
function up(o, e = "/", t = "") {
  if (!Ze(o)) {
    const s = hr(o, e);
    return s.search = ds(t), s.toString();
  }
  const r = J(e), a = ds(t), n = o.absoluteBasePrefix || o.originText;
  return `${(r === "/" ? `${n}/` : `${n}${r}`) || `${o.originText}/`}${a}`;
}
function Ia(o, e) {
  try {
    const t = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), r = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
    if (t.origin !== r.origin) return {
      resolvedUrl: t,
      proxyPath: null
    };
    const a = Pt(r.pathname);
    let n = t.pathname || "/";
    if (a) if (n === a || n === `${a}/`) n = "/";
    else if (n.startsWith(`${a}/`)) n = n.slice(a.length);
    else return {
      resolvedUrl: t,
      proxyPath: null
    };
    return {
      resolvedUrl: t,
      proxyPath: J(n)
    };
  } catch {
    return {
      resolvedUrl: null,
      proxyPath: null
    };
  }
}
function ks(o, e, t, r, a = {}) {
  try {
    const { resolvedUrl: n, proxyPath: s } = Ia(o, e);
    return n ? s ? `${_t(t, r, a)}${s === "/" ? "/" : s}${n.search}${n.hash}` : n.toString() : null;
  } catch {
    return null;
  }
}
function Bc(o = "") {
  const e = J(o), t = e.toLowerCase();
  let r = -1;
  for (const a of [
    "/items/",
    "/videos/",
    "/audio/",
    "/livetv/"
  ]) {
    const n = t.indexOf(a);
    n > 0 && (r === -1 || n < r) && (r = n);
  }
  return r <= 0 ? "" : Pt(e.slice(0, r));
}
function Ko(o = "", e = "") {
  const t = J(o), r = Pt(e);
  if (!r) return t;
  const a = t.toLowerCase(), n = r.toLowerCase();
  return a === n ? "/" : a.startsWith(`${n}/`) ? J(t.slice(r.length) || "/") : t;
}
function ro(o = "", e = "") {
  const t = Pt(e);
  if (!t) return J(o);
  let r = J(o);
  for (; ; ) {
    if (r === t || r === `${t}/`) return "/";
    if (!r.startsWith(`${t}/`)) return r;
    r = J(r.slice(t.length) || "/");
  }
}
function dp(o = "", e = null, t = "") {
  let r = J(o);
  return r = ro(r, t), r = ro(r, e instanceof URL ? e.pathname : "/"), r;
}
function fp(o = "", e = "", t = null, r = null, a = "") {
  const n = String(o || "").trim();
  if (!n) return null;
  let s = null;
  if (r) try {
    s = r instanceof URL ? new URL(r.toString()) : new URL(String(r || ""));
  } catch {
    s = null;
  }
  let i;
  try {
    if (df(n)) {
      i = new URL(n, s || "https://playback-info.local/");
      const u = String(i.protocol || "").toLowerCase(), d = String(s?.origin || "").trim().toLowerCase();
      if (!["http:", "https:"].includes(u) || !d || i.origin.toLowerCase() !== d) return null;
    } else i = new URL(n, "https://playback-info.local/");
  } catch {
    return null;
  }
  const c = dp(i.pathname || "/", t, a), l = Ko(c, Bc(c));
  return ha(l) ? {
    proxyPath: J(l),
    search: i.search || "",
    hash: i.hash || ""
  } : null;
}
function mp(o = "", e = "", t = null) {
  let r = J(o);
  const a = Bc(e);
  if (a) {
    const u = ro(r, a);
    u !== r && ha(u) && (r = u);
  }
  const n = Pt(t instanceof URL ? t.pathname : "/");
  if (!a || !n) return r;
  const s = `${a}${n}`, i = r.toLowerCase(), c = s.toLowerCase();
  if (i !== c && !i.startsWith(`${c}/`)) return r;
  const l = J(`${a}${r.slice(s.length) || "/"}`);
  return ha(l) ? l : r;
}
function pp(o = "") {
  return Gt(o) === "rewrite" ? "relative" : "";
}
function Kc(o) {
  [
    "Age",
    "Accept-Ranges",
    "Content-Disposition",
    "Content-Encoding",
    "Content-Language",
    "Content-Length",
    "Content-Location",
    "Content-Range",
    "Content-Type",
    "ETag",
    "Expires",
    "Last-Modified",
    "Set-Cookie",
    "Transfer-Encoding"
  ].forEach((e) => o.delete(e));
}
function gp(o = "/", e = null) {
  const t = J(e instanceof URL ? e.pathname : o), r = new URLSearchParams(e instanceof URL ? e.search : String(e || ""));
  for (; r.has(Gn); ) r.delete(Gn);
  const a = r.toString();
  return `${t}${a ? `?${a}` : ""}`;
}
function _t(o, e, t = {}) {
  const r = Pd(t?.linkVariant), a = r ? "/" + encodeURIComponent(r) : "";
  if (Ye(t?.entryMode)) return a;
  const n = encodeURIComponent(String(o || "")), s = e ? "/" + encodeURIComponent(String(e)) : "";
  return "/" + n + s + a;
}
function zc(o, e, t, r = "/", a = {}) {
  const n = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), s = J(r), i = new URL(n.origin);
  return i.pathname = `${_t(e, t, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}${s === "/" ? "/" : s}`, i.search = String(a.search || ""), i.hash = String(a.hash || ""), i;
}
function hp(o, e, t, r, a = {}) {
  const n = r instanceof URL ? new URL(r.toString()) : new URL(String(r || "")), s = new URL(o instanceof URL ? o.origin : String(o || ""));
  return s.pathname = `${_t(e, t, {
    linkVariant: a.linkVariant,
    entryMode: a.entryMode
  })}/${Wi}${n.pathname || "/"}`, s.search = n.search || "", s.searchParams.append(Gi, ga(n.toString())), s.hash = "", s;
}
function yp(o = "", e = "", t = "", r = {}) {
  let a = J(o);
  const n = String(e || "").trim();
  if (!n && !Ye(r?.entryMode)) return a;
  const s = [...new Set([
    "proxy_a",
    "proxy_b",
    "main"
  ].map((c) => _t(n, t, {
    linkVariant: c,
    entryMode: r.entryMode
  })).filter((c) => c && c !== "/"))].sort((c, l) => l.length - c.length);
  if (!s.length) return a;
  let i = !0;
  for (; i; ) {
    i = !1;
    for (const c of s) {
      const l = Ko(a, c);
      if (l !== a) {
        a = l, i = !0;
        break;
      }
    }
  }
  return a;
}
function Sp(o = null) {
  const e = String(o?.routeContextDiagnostics?.routeKind || "").trim();
  return e !== "host_prefix_path_compat" && e !== "legacy_host_prefix_path_compat" ? "" : _t(o?.nodeName, o?.nodeKey, {
    linkVariant: o?.linkVariant,
    entryMode: "kv_route"
  });
}
function _p(o = "", e = "") {
  const t = J(o), r = Pt(e);
  if (!r || r === "/") return t;
  const a = t.toLowerCase(), n = r.toLowerCase();
  return a === n || a.startsWith(`${n}/`) ? t : `${r}${t === "/" ? "/" : t}`;
}
function bp(o = "", e = null) {
  const t = J(o), r = `/${Wi}`;
  if (!t.startsWith(r)) return null;
  const a = e instanceof URL && [...e.searchParams.getAll("__pb_target")].pop() || "";
  if (!a) return { error: "missing_target" };
  let n;
  try {
    n = new URL(jr(a));
  } catch {
    return { error: "invalid_target" };
  }
  return ["http:", "https:"].includes(String(n.protocol || "").toLowerCase()) ? {
    targetUrl: n,
    visibleProxyPath: J(t.slice(r.length) || "/")
  } : { error: "unsupported_target" };
}
function Hs(o = "", e = null, t = "") {
  const r = J(o), a = r.search(/https?:\/\//i);
  if (a <= 0) return null;
  let n;
  try {
    n = e instanceof URL ? new URL(e.toString()) : new URL(String(e || ""));
  } catch {
    return null;
  }
  let s;
  try {
    s = new URL(r.slice(a));
  } catch {
    return null;
  }
  if (String(s.origin || "").toLowerCase() !== String(n.origin || "").toLowerCase()) return null;
  const i = Pt(t), c = J(s.pathname || "/"), l = i ? Ko(c, i) : c;
  if (i && l === c && c.toLowerCase() !== i.toLowerCase()) return null;
  const u = J(r.slice(0, a) || "/"), d = [l];
  if (u !== "/") {
    const f = u.toLowerCase(), m = l.toLowerCase();
    m !== f && !m.startsWith(`${f}/`) && d.unshift(J(`${u}${l === "/" ? "/" : l}`));
  }
  for (const f of d)
    if (ha(J(oa(f).remaining || f)))
      return {
        kind: "embedded_absolute",
        originalPath: r,
        normalizedPath: J(f),
        embeddedUrl: s.toString()
      };
  return null;
}
function Ta(o) {
  const e = /* @__PURE__ */ new Map();
  if (!o || typeof o != "string") return e;
  for (const t of o.split(";")) {
    const r = t.trim();
    if (!r) continue;
    const a = r.indexOf("="), n = (a === -1 ? r : r.slice(0, a)).trim(), s = a === -1 ? "" : r.slice(a + 1).trim();
    n && e.set(n, s);
  }
  return e;
}
function Wc(o) {
  const e = [];
  for (const [t, r] of o.entries()) e.push(r === "" ? t : `${t}=${r}`);
  return e.join("; ");
}
function zo(o, e = []) {
  const t = new Set((Array.isArray(e) ? e : [e]).map((a) => String(a || "").trim().toLowerCase()).filter(Boolean)), r = Ta(o);
  if (t.size > 0)
    for (const a of r.keys()) t.has(String(a).trim().toLowerCase()) && r.delete(a);
  return Wc(r) || null;
}
function $s(o, e, t = ["auth_token"]) {
  const r = new Set(t.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean)), a = Ta(o);
  for (const s of a.keys()) r.has(String(s).trim().toLowerCase()) && a.delete(s);
  const n = Ta(e);
  for (const [s, i] of n.entries())
    r.has(String(s).trim().toLowerCase()) || a.set(s, i);
  return Wc(a) || null;
}
function Bs(o = "") {
  const e = J(o).split("/").filter(Boolean);
  if (e.length === 0) return !1;
  const t = It(e[0]).toLowerCase();
  return Xu.has(t);
}
async function Ep(o = "", e = "", t = null, r = {}) {
  const a = String(o || "").trim().toLowerCase(), n = re(e), s = String(t?.JWT_SECRET || "").trim();
  if (!a || !n || !s) return "";
  const i = Math.max(0, Math.floor(Number(r.nowMs ?? H()) / 1e3)), c = Math.max(1, Math.trunc(Number(r.maxAgeSec) || 86400)), l = ga(JSON.stringify({
    v: 1,
    node: a,
    host: n,
    iat: i,
    exp: i + c
  }));
  if (!l) return "";
  const u = await gt(s, l);
  return u ? `${l}.${u}` : "";
}
async function Tp(o = "", e = null, t = {}) {
  const r = String(o || "").trim(), a = String(e?.JWT_SECRET || "").trim();
  if (!r) return {
    ok: !1,
    reason: "missing_cookie"
  };
  if (!a) return {
    ok: !1,
    reason: "missing_secret"
  };
  const n = r.indexOf(".");
  if (n <= 0 || n === r.length - 1) return {
    ok: !1,
    reason: "malformed_cookie"
  };
  const s = r.slice(0, n), i = r.slice(n + 1), c = await gt(a, s);
  if (!c || i !== c) return {
    ok: !1,
    reason: "bad_signature"
  };
  let l = null;
  try {
    l = JSON.parse(jr(s));
  } catch {
    return {
      ok: !1,
      reason: "malformed_payload"
    };
  }
  const u = {
    v: Number(l?.v) || 0,
    node: String(l?.node || "").trim().toLowerCase(),
    host: re(l?.host || ""),
    iat: Math.max(0, Math.floor(Number(l?.iat) || 0)),
    exp: Math.max(0, Math.floor(Number(l?.exp) || 0))
  };
  if (u.v !== 1 || !u.node || !u.host || !u.iat || !u.exp || u.exp <= u.iat) return {
    ok: !1,
    reason: "invalid_payload",
    payload: u
  };
  const d = re(t.requestHost || "");
  if (d && u.host !== d) return {
    ok: !1,
    reason: "host_mismatch",
    payload: u
  };
  const f = Math.max(0, Math.floor(Number(t.nowMs ?? H()) / 1e3));
  return u.exp <= f ? {
    ok: !1,
    reason: "expired",
    payload: u
  } : {
    ok: !0,
    payload: u
  };
}
function Rp(o = "") {
  const e = String(o || "").trim();
  return e ? `${Co}=${e}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${qu}` : Gc();
}
function Gc() {
  return `${Co}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
function Sn(o = "GET", e = null) {
  const t = e ? new Headers(e) : new Headers();
  return t.set("Content-Type", "text/plain; charset=utf-8"), t.set("Cache-Control", "no-store, max-age=0"), Ce(t), t.get("Access-Control-Allow-Origin") !== "*" && Ur(t, "Origin"), new Response(o === "HEAD" ? null : "Not Found", {
    status: 404,
    headers: t
  });
}
function Ma(o = "") {
  return String(o || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
var jc = /* @__PURE__ */ new Set([
  "authorization",
  "x-emby-authorization",
  "x-mediabrowser-authorization"
]), Ap = /* @__PURE__ */ new Set(["x-emby-token", "x-mediabrowser-token"]), Cp = /* @__PURE__ */ new Set(["x-emby-device-id", "x-mediabrowser-device-id"]), Vc = /* @__PURE__ */ new Set([
  ...jc,
  ...Ap,
  ...Cp
]);
function _n(o) {
  if (o instanceof Headers) return [...o.entries()];
  if (o && typeof o == "object" && typeof o.entries == "function") try {
    return [...o.entries()].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  if (o && typeof o == "object" && typeof o[Symbol.iterator] == "function") try {
    return [...o].filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]);
  } catch {
  }
  return Array.isArray(o) ? o.filter((e) => Array.isArray(e) && e.length >= 2).map((e) => [String(e[0] || ""), String(e[1] ?? "")]) : o && typeof o == "object" ? Object.entries(o).map(([e, t]) => [String(e || ""), String(t ?? "")]) : [];
}
var qc = [
  "authorization",
  "api-key",
  "apikey",
  "access-key",
  "accesskey",
  "access-token",
  "accesstoken",
  "session",
  "credential",
  "signature",
  "secret",
  "auth",
  "token"
], wp = [
  "emby",
  "jellyfin",
  "mediabrowser",
  "api_key",
  ...qc
];
function Xc(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return !e || Vc.has(e) || e === "cookie" ? !1 : qc.some((t) => e.includes(t));
}
function Lp(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e ? wp.some((t) => e.includes(t)) : !1;
}
var Yc = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization",
  "deviceid",
  "xembydeviceid",
  "xembydevicename",
  "xembyclient",
  "xembyclientversion",
  "xmediabrowserdeviceid",
  "xmediabrowserdevicename",
  "xmediabrowserclient",
  "xmediabrowserclientversion",
  "client",
  "clientid",
  "devicename",
  "userid",
  "playsessionid",
  "sessionid"
]), Jc = "identity-http-v2", Dp = Object.freeze([
  "Range",
  "If-None-Match",
  "If-Modified-Since"
]), Np = [
  /^\/Videos\/[^/]+\/(?:main|master|stream)\.m3u8$/i,
  /^\/Videos\/[^/]+\/(?:manifest|main|master|stream)\.mpd$/i,
  /^\/Audio\/[^/]+\/(?:main|master|stream)\.m3u8$/i
], Ip = /* @__PURE__ */ new Set([
  "mediasourceid",
  "static",
  "tag",
  "audiostreamindex",
  "subtitlestreamindex",
  "subtitlemethod",
  "starttimeticks"
]);
function Qc(o = "") {
  return Yc.has(Ma(o));
}
function Mp(o) {
  const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || ""));
  e.hash = "";
  const t = [];
  for (const [r, a] of e.searchParams.entries())
    Qc(r) || t.push([r, a]);
  t.sort((r, a) => {
    const n = r[0].localeCompare(a[0]);
    return n !== 0 ? n : String(r[1]).localeCompare(String(a[1]));
  }), e.search = "";
  for (const [r, a] of t) e.searchParams.append(r, a);
  return e;
}
function Zc(o) {
  const e = o instanceof Request ? new URL(o.url) : new URL(String(o || "")), t = [];
  for (const [s, i] of e.searchParams.entries()) {
    const c = Ma(s);
    Yc.has(c) && t.push([c, String(i)]);
  }
  t.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  });
  const r = o instanceof Request ? o.headers : new Headers(), a = [];
  for (const [s, i] of r.entries()) {
    const c = String(s || "").trim().toLowerCase();
    !c || !Vc.has(c) && !Xc(c) || a.push([c, String(i)]);
  }
  const n = zo(r.get("Cookie") || "", ["auth_token", ...ma]);
  return n && a.push(["cookie", n]), a.sort((s, i) => {
    const c = s[0].localeCompare(i[0]);
    return c !== 0 ? c : s[1].localeCompare(i[1]);
  }), {
    queryEntries: t,
    headerEntries: a
  };
}
function Pp(o) {
  const e = Zc(o);
  return e.queryEntries.length > 0 || e.headerEntries.length > 0;
}
async function el(o) {
  const e = Zc(o), t = await vn().digest("SHA-256", new TextEncoder().encode(Z(e)));
  return [...new Uint8Array(t)].map((r) => r.toString(16).padStart(2, "0")).join("");
}
async function xp(o, e) {
  return await el(new Request(e instanceof URL ? e.toString() : String(e || ""), { headers: o.headers }));
}
function tl(o = "", e = {}) {
  const t = St.test(String(o || ""));
  return ne(`${Jc}:${t ? "manifest" : "asset"}:${t ? Math.max(0, Number(e.prewarmCacheTtl) || 0) : Math.max(0, Number(e.imageCacheMaxAge) || 0)}`);
}
function Op(o, e) {
  if (!(o instanceof Request) || !(e instanceof Request) || e.headers.has("If-Range")) return null;
  const t = new Headers();
  for (const r of Dp) {
    const a = e.headers.get(r);
    a && t.set(r, a);
  }
  return new Request(o.url, {
    method: "GET",
    headers: t
  });
}
function vp(o = "") {
  const e = String(o || ""), t = /\/(?:Videos|Audio)\/.+$/i.exec(e);
  return t ? t[0] : e;
}
function Fp(o) {
  try {
    return new Request(Mp(o).toString(), { method: "GET" });
  } catch {
    return null;
  }
}
function Up(o = {}) {
  const e = Array.isArray(o?.lines) ? o.lines.slice() : [];
  if (e.length > 1) {
    const t = String(o?.activeLineId || "").trim();
    if (t) {
      const r = e.findIndex((a) => String(a?.id || "").trim() === t);
      if (r > 0) {
        const [a] = e.splice(r, 1);
        e.unshift(a);
      }
    }
  }
  return e.length > 0 ? e.map((t) => String(t?.target || "").trim()).filter(Boolean) : String(o?.target || "").split(",").map((t) => t.trim()).filter(Boolean);
}
function ao(o = "", e = {}) {
  const t = String(o || "").trim().toLowerCase(), r = nr(e?.entryMode), a = _n(e?.headers).map(([n, s]) => [String(n || "").trim().toLowerCase(), String(s ?? "").trim()]).filter(([n]) => !!n).sort((n, s) => {
    const i = n[0].localeCompare(s[0]);
    return i !== 0 ? i : n[1].localeCompare(s[1]);
  });
  return ne(Z({
    nodeName: t,
    entryMode: r,
    secret: r === "host_prefix" ? "" : String(e?.secret || "").trim(),
    tags: $r(e?.tags, e?.tag),
    remark: String(e?.remark || "").trim(),
    activeLineId: String(e?.activeLineId || "").trim(),
    orderedTargets: Up(e),
    headers: a,
    playbackInfoMode: String(e?.playbackInfoMode || "").trim().toLowerCase(),
    mediaAuthMode: String(e?.mediaAuthMode || "").trim().toLowerCase(),
    realClientIpMode: String(e?.realClientIpMode || "").trim().toLowerCase(),
    routingDecisionMode: String(e?.routingDecisionMode || "").trim().toLowerCase(),
    mainVideoStreamMode: String(e?.mainVideoStreamMode || e?.wangpanDirectMode || e?.wangpanMode || "").trim().toLowerCase()
  }));
}
function rl(o = []) {
  const e = /* @__PURE__ */ new Set();
  for (const t of Array.isArray(o) ? o : [o]) {
    const r = String(t || "").trim().toLowerCase();
    r && e.add(r);
  }
  return e;
}
function al(o = []) {
  const e = rl(o);
  if (!e.size) return;
  const t = te.PlaybackInfoResponseCache;
  if (t instanceof Map) for (const [r, a] of t.entries()) {
    const n = String(a?.nodeName || "").trim().toLowerCase();
    e.has(n) && t.delete(r);
  }
}
function nl(o = []) {
  const e = rl(o);
  if (!e.size) return;
  const t = te.PlaybackProgressRelay;
  if (!(!(t instanceof Map) || t.size <= 0))
    for (const [r, a] of t.entries()) {
      const n = String(a?.nodeName || a?.pendingSnapshot?.nodeName || "").trim().toLowerCase();
      !n || !e.has(n) || tr(r);
    }
}
function ol(o, e, t, r = "/", a = {}) {
  try {
    const n = String(a.identityPartition || "").trim(), s = String(a.cachePolicyRevision || "").trim();
    if (!n || !s) return null;
    const i = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), c = J(r), l = new URL(i.origin);
    l.pathname = `${_t(e, t, {
      linkVariant: "main",
      entryMode: a.entryMode
    })}${c === "/" ? "/" : c}`, l.search = String(a.search || "");
    const u = String(a.nodeCacheRevision || "").trim();
    return u && l.searchParams.set("__proxyrev", u), l.searchParams.set("__metadatarev", Jc), l.searchParams.set("__identity", n), l.searchParams.set("__policy", s), l.hash = "", Fp(l);
  } catch {
    return null;
  }
}
function kp(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || ""));
    for (const [t, r] of e.searchParams.entries()) {
      const a = String(t || "").toLowerCase(), n = String(r || "").toLowerCase();
      if (a.includes("transcod") || n.includes("transcod")) return !0;
    }
    return !1;
  } catch {
    return !0;
  }
}
function Hp(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = vp(e.pathname || "");
    if (!St.test(t) || kp(e) || !Np.some((r) => r.test(t))) return !1;
    for (const [r] of e.searchParams.entries())
      if (!Qc(r) && !Ip.has(Ma(r)))
        return !1;
    return !0;
  } catch {
    return !1;
  }
}
function no(o) {
  try {
    const e = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), t = e.pathname || "";
    return Gr.test(t) || Wr.test(t) || pr.test(t) ? !0 : St.test(t) ? Hp(e) : !1;
  } catch {
    return !1;
  }
}
function $p(o = "") {
  const e = String(o || "").toLowerCase();
  return e ? /\.(?:mp4|m4v|mkv|mov|avi|wmv|flv|ts|m4s)(?:$|[?#])/.test(e) ? !0 : St.test(e) || pr.test(e) ? !1 : /\/videos\/[^/]+\/(?:stream|original|download|file)\b/.test(e) || /\/items\/[^/]+\/download\b/.test(e) : !1;
}
function oo(o, e = /* @__PURE__ */ new Set(), t = 0) {
  if (o == null || t > 5) return e;
  if (typeof o == "string") {
    const r = o.trim();
    if (r && /^(?:https?:\/\/|\/)/i.test(r)) {
      const a = r.toLowerCase(), n = a.split(/[?#]/, 1)[0] || a;
      (St.test(n) || pr.test(n) || Gr.test(a) || Wr.test(n)) && e.add(r);
    }
    return e;
  }
  return Array.isArray(o) ? (o.slice(0, 24).forEach((r) => oo(r, e, t + 1)), e) : (typeof o == "object" && Object.values(o).slice(0, 32).forEach((r) => oo(r, e, t + 1)), e);
}
function Bp(o = "") {
  const e = /^\/Items\/([^/]+)(?:\/|$)/i.exec(String(o || ""));
  return e ? It(e[1]) : "";
}
function Ks(o = "") {
  const e = String(o || "").toLowerCase();
  return Gr.test(e) || Wr.test(e) ? 0 : St.test(e) ? 1 : pr.test(e) ? 2 : 3;
}
function Kp(o = {}, e = {}) {
  return {
    async createKvTidyPlanToken(t, r = {}, a = {}) {
      const n = String(t?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the KV tidy plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? H()) / 1e3)), i = s + Math.max(60, Math.floor(Number(a.ttlMs) || 6e5) / 1e3), c = ga(JSON.stringify({
        version: 1,
        scope: "kv",
        planHash: String(r?.planHash || e.buildKvTidyPlanHash(r)).trim(),
        issuedAt: s,
        expiresAt: i
      }));
      return `${c}.${await gt(n, c)}`;
    },
    async verifyKvTidyPlanToken(t, r = "", a = {}) {
      const n = String(t?.JWT_SECRET || "").trim(), s = String(r || "").trim();
      if (!n) {
        const d = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the KV tidy plan");
        throw d.code = "SERVER_MISCONFIGURED", d.status = 503, d;
      }
      const i = s.indexOf(".");
      if (i <= 0 || i === s.length - 1) {
        const d = /* @__PURE__ */ new Error("KV tidy plan token is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      const c = s.slice(0, i);
      if (s.slice(i + 1) !== await gt(n, c)) {
        const d = /* @__PURE__ */ new Error("KV tidy plan token signature is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      let l = null;
      try {
        l = JSON.parse(jr(c));
      } catch {
        l = null;
      }
      const u = Math.max(0, Math.floor(Number(a.nowMs ?? H()) / 1e3));
      if (!$(l) || l.version !== 1 || l.scope !== "kv" || !String(l.planHash || "").trim()) {
        const d = /* @__PURE__ */ new Error("KV tidy plan token payload is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      if (Number(l.expiresAt) <= u) {
        const d = /* @__PURE__ */ new Error("KV tidy plan has expired");
        throw d.code = "TIDY_PLAN_STALE", d.status = 409, d.details = {
          reason: "expired",
          expiresAt: Number(l.expiresAt) || 0
        }, d;
      }
      return l;
    },
    buildD1TidyPlanHash(t = {}) {
      const r = $(t?.schemaStatus) ? t.schemaStatus : {};
      return ne(Z({
        scope: "d1",
        mode: String(t?.mode || "manual"),
        maintenanceMode: String(t?.maintenanceMode || "smart"),
        nowMs: Number(t?.nowMs) || 0,
        retentionDays: Number(t?.retentionDays) || 0,
        retentionCutoffMs: Number(t?.retentionCutoffMs) || 0,
        utcOffsetMinutes: Number(t?.utcOffsetMinutes) || 0,
        scheduledNowMs: Number(t?.scheduledNowMs) || 0,
        dayWindow: $(t?.dayWindow) ? t.dayWindow : {},
        statsBucketDate: String(t?.statsBucketDate || ""),
        statsStartTs: Number(t?.statsStartTs) || 0,
        statsEndTs: Number(t?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(t?.statsUtcOffsetMinutes) || 0,
        schemaStatus: {
          schemaReady: r.schemaReady === !0,
          tables: $(r.tables) ? r.tables : {},
          columns: $(r.columns) ? r.columns : {},
          indexes: $(r.indexes) ? r.indexes : {},
          constraints: $(r.constraints) ? r.constraints : {},
          ftsReady: r.ftsReady === !0,
          issues: Array.isArray(r.issues) ? r.issues : []
        },
        flags: $(t?.flags) ? t.flags : {},
        summary: $(t?.summary) ? t.summary : {},
        preview: $(t?.preview) ? t.preview : {},
        d1DnsIpPoolSources: Array.isArray(t?.d1DnsIpPoolSources) ? t.d1DnsIpPoolSources : []
      }));
    },
    async createD1TidyPlanToken(t, r = {}, a = {}) {
      const n = String(t?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 tidy plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.issuedAtMs ?? H()) / 1e3)), i = s + Math.max(60, Math.floor(Number(a.ttlMs) || 6e5) / 1e3), c = ga(JSON.stringify({
        version: 1,
        scope: "d1",
        planHash: String(r?.planHash || e.buildD1TidyPlanHash(r)).trim(),
        planNowMs: Number(r?.nowMs) || 0,
        scheduledNowMs: Number(r?.scheduledNowMs) || Number(r?.nowMs) || 0,
        maintenanceMode: String(r?.maintenanceMode || "smart"),
        statsBucketDate: String(r?.statsBucketDate || ""),
        statsStartTs: Number(r?.statsStartTs) || 0,
        statsEndTs: Number(r?.statsEndTs) || 0,
        statsUtcOffsetMinutes: Number(r?.statsUtcOffsetMinutes) || 0,
        issuedAt: s,
        expiresAt: i
      }));
      return `${c}.${await gt(n, c)}`;
    },
    async verifyD1TidyPlanToken(t, r = "", a = {}) {
      const n = String(t?.JWT_SECRET || "").trim(), s = String(r || "").trim();
      if (!n) {
        const d = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 tidy plan");
        throw d.code = "SERVER_MISCONFIGURED", d.status = 503, d;
      }
      const i = s.indexOf(".");
      if (i <= 0 || i === s.length - 1) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan token is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      const c = s.slice(0, i);
      if (s.slice(i + 1) !== await gt(n, c)) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan token signature is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      let l = null;
      try {
        l = JSON.parse(jr(c));
      } catch {
        l = null;
      }
      const u = Math.max(0, Math.floor(Number(a.nowMs ?? H()) / 1e3));
      if (!$(l) || l.version !== 1 || l.scope !== "d1" || !String(l.planHash || "").trim() || !(Number(l.planNowMs) > 0)) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan token payload is invalid");
        throw d.code = "TIDY_PLAN_INVALID", d.status = 409, d;
      }
      if (Number(l.expiresAt) <= u) {
        const d = /* @__PURE__ */ new Error("D1 tidy plan has expired");
        throw d.code = "TIDY_PLAN_STALE", d.status = 409, d.details = {
          reason: "expired",
          expiresAt: Number(l.expiresAt) || 0
        }, d;
      }
      return l;
    },
    async resolveKvTidyQuotaBudget(t, r = [], a = {}) {
      const n = a.kv || e.getKV(t), s = await bf(ae(a.config || {})), i = Math.max(1, Math.floor(Number(s?.kv?.write) || 0)), c = (Array.isArray(r) ? r : []).map((g) => ({
        type: String(g?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(g?.key || "").trim()
      })).filter((g) => g.key), l = c.filter((g) => g.type === "put").length, u = c.filter((g) => g.type === "delete").length, d = n ? await e.captureRawKvEntries(n, c.map((g) => g.key)) : [], f = d.filter((g) => g?.exists === !0).length, m = d.filter((g) => g?.exists !== !0).length, p = l + u + f + m, h = {
        planClass: String(s?.planClass || "free").trim().toLowerCase() === "paid" ? "paid" : "free",
        planLabel: String(s?.planLabel || "").trim() || "FREE",
        periodLabel: String(s?.periodLabel || "").trim() || "今日",
        writeLimit: i,
        estimatedPutCount: l,
        estimatedDeleteCount: u,
        estimatedRollbackWriteCount: f,
        estimatedRollbackDeleteCount: m,
        estimatedWorstCaseWriteCount: p,
        blocked: p > i,
        reason: ""
      };
      return h.reason = h.blocked === !0 ? Ef(h) : "", h;
    },
    async buildKvTidyPlan(t, r = {}) {
      const a = r.kv || e.getKV(t);
      if (!a) throw new Error("KV not configured");
      const n = (await e.listKvKeysStrict(a)).sort(), s = n.filter((W) => W.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), { rawStoredSummaryIndexText: i, storedSummaryIndexState: c, previousFullIndexBytes: l } = await e.readStoredNodesSummaryState(a), { nodeNames: u, removableKeys: d, untouchedOtherKeyCount: f, opsStatusKeyCount: m, dnsRecordHistoryKeyCount: p, dnsIpPoolSourceKeyCount: h, configMetaKeyCount: g, snapshotMetaKeyCount: y, nodeIndexMetaKeyCount: _, telegramAlertStateKeyCount: S, loginFailureKeyCount: A, dnsFetchLockKeyCount: E } = await e.classifyKvTidyKeys(a, n), T = await e.readRepairableRuntimeConfig(a), w = $(T.rawConfig) ? T.rawConfig : {}, D = rf(w);
      let k = D.cleanedConfig;
      const b = [...D.migratedConfigKeys], N = await e.captureRawKvEntries(a, [
        e.CONFIG_KEY,
        e.NODES_INDEX_KEY,
        e.NODES_SUMMARY_INDEX_KEY
      ]), R = String(N.find((W) => W?.key === e.NODES_INDEX_KEY)?.value || ""), { nextTidyConfig: x, rewrittenNodes: O, fullEntityNodes: L, rewrittenNodeCount: v, deletedLegacyNodeFieldCount: M, migratedTopLevelPortNodeCount: C, migratedLinePortCount: I, migratedDefaultPortNodeCount: P, migratedDefaultPortLineCount: U } = await e.collectKvTidyNodeMutations(a, u, k, N), V = Z(k) !== Z(x);
      V && (k = x, b.push("sourceDirectNodes"));
      const j = await e.readRevisionMetaForRead(a, e.CONFIG_META_KEY), K = {
        configRevision: String(j?.revision || ""),
        configContentHash: ne(Z(w))
      }, q = n.includes(e.CONFIG_SNAPSHOTS_KEY), de = T.hadMalformedValue || Z(w) !== Z(k), he = af(T.config, k), fe = e.collectUnreferencedAdminIndexUploadKeys(k, [], s);
      for (const W of fe) d.add(W);
      n.includes(e.CONFIG_SNAPSHOTS_KEY) && d.add(e.CONFIG_SNAPSHOTS_KEY), n.includes(e.CONFIG_SNAPSHOTS_META_KEY) && d.add(e.CONFIG_SNAPSHOTS_META_KEY);
      const ie = e.normalizeNodeSummaryIndex(L).nodes, me = e.normalizeNodeIndex(ie.map((W) => W?.name)), Me = JSON.stringify(me), Ue = JSON.stringify(ie), et = new TextEncoder().encode(Ue).length, Et = l - et, Yr = e.buildLegacyConfigCacheKeys(T.config, k), Le = [...d].sort(), Jr = [.../* @__PURE__ */ new Set([...Yr, ...Le])].filter(Boolean).sort(), tt = [];
      de && tt.push({
        type: "put",
        key: e.CONFIG_KEY,
        value: JSON.stringify(k)
      });
      for (const W of O) tt.push({
        type: "put",
        key: `${e.PREFIX}${W.name}`,
        value: JSON.stringify(W.data)
      });
      R !== Me && tt.push({
        type: "put",
        key: e.NODES_INDEX_KEY,
        value: Me
      }), i !== Ue && tt.push({
        type: "put",
        key: e.NODES_SUMMARY_INDEX_KEY,
        value: Ue
      });
      for (const W of Jr) tt.push({
        type: "delete",
        key: W,
        value: ""
      });
      const rt = await e.resolveKvTidyQuotaBudget(t, tt, {
        kv: a,
        config: k
      }), yr = {
        scannedKeyCount: n.length,
        preservedNodeKeyCount: u.length,
        rebuiltNodeCount: me.length,
        rewrittenNodeCount: v,
        configWasMalformed: T.hadMalformedValue,
        configReadSource: T.source,
        configRewritten: de,
        migratedConfigKeys: Zt(b),
        deletedLegacyFieldCount: D.deletedLegacyFieldCount + M,
        deletedLegacyConfigFieldCount: D.deletedLegacyFieldCount,
        deletedLegacyNodeFieldCount: M,
        migratedTopLevelPortNodeCount: C,
        migratedLinePortCount: I,
        migratedDefaultPortNodeCount: P,
        migratedDefaultPortLineCount: U,
        deletedKeyCount: Le.length,
        deletedCacheKeyCount: Le.filter((W) => W === "sys:cf_dash_cache" || W.startsWith("sys:cf_dash_cache:")).length,
        deletedScheduledLockKeyCount: Le.filter((W) => W === e.LEGACY_SCHEDULED_LOCK_KEY).length,
        deletedLoginFailureKeyCount: A,
        deletedDnsIpPoolSourceKeyCount: h,
        deletedOpsStatusKeyCount: m,
        deletedTelegramAlertStateKeyCount: S,
        deletedDnsFetchLockKeyCount: E,
        deletedAdminIndexUploadCount: fe.length,
        untouchedOtherKeyCount: f,
        previousFullIndexBytes: l,
        nextSummaryIndexBytes: et,
        savedBytes: Et
      }, Qr = of({
        configFieldTargets: yr.migratedConfigKeys,
        sourceDirectNodesFromLegacyNodes: V,
        migratedTopLevelPortNodeCount: C,
        migratedLinePortCount: I,
        migratedDefaultPortNodeCount: P,
        migratedDefaultPortLineCount: U
      }), ke = [], Xt = Le.filter((W) => W === "sys:cf_dash_cache" || W.startsWith("sys:cf_dash_cache:")), lt = Le.filter((W) => W.startsWith("fail:")), ut = Le.filter((W) => W === e.LEGACY_DNS_IP_POOL_SOURCES_KEY), xt = Le.filter((W) => W === e.LEGACY_OPS_STATUS_KEY || Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS).includes(W)), Tt = Le.filter((W) => W === e.LEGACY_TELEGRAM_ALERT_STATE_KEY), Ot = Le.filter((W) => W === e.LEGACY_SCHEDULED_LOCK_KEY), Yt = Le.filter((W) => W.startsWith(Cm)), Rt = Le.filter((W) => W.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)), Sr = O.map((W) => W.name);
      be(ke, Xt.length > 0, "cf_dash_cache", "Cloudflare 仪表盘缓存", Xt, Xt.length, "会删除遗留的 sys:cf_dash_cache 及其按日期 / Zone 生成的缓存键。"), be(ke, lt.length > 0, "login_failures", "旧版登录失败计数", lt, lt.length, "会删除旧版 fail:* 登录失败计数键，后续仅保留 D1 auth_failures。"), be(ke, ut.length > 0, "dns_ip_pool_sources", "旧版 DNS IP 池源配置", ut, ut.length, "会删除旧版 sys:dns_ip_pool_sources:v1，后续只保留 D1 dns_ip_pool_sources。"), be(ke, xt.length > 0, "ops_status", "旧版运维状态键", xt, xt.length, "会删除 sys:ops_status:v1 与 sys:ops_status:*，后续只保留 D1 sys_status。"), be(ke, Tt.length > 0, "telegram_alert_state", "旧版 Telegram 告警冷却状态", Tt, Tt.length, "会删除 sys:telegram_alert_state:v1，后续只保留 D1 sys_status scope。"), be(ke, Ot.length > 0, "scheduled_lock", "旧版定时租约键", Ot, Ot.length, "会删除 sys:scheduled_lock:v1，后续只保留 D1 sys_locks。"), be(ke, Yt.length > 0, "dns_fetch_lock", "旧版 DNS 抓取锁键", Yt, Yt.length, "会删除 sys:dns_ip_pool_fetch_lock:v1:*，后续只保留 D1 sys_locks。"), be(ke, q || y > 0, "legacy_config_snapshot_keys", "停用的设置历史键", [e.CONFIG_SNAPSHOTS_KEY, e.CONFIG_SNAPSHOTS_META_KEY], Number(q) + +(y > 0), "会删除已停用的设置历史键及其元数据。"), be(ke, Rt.length > 0, "admin_index_uploads", "未引用的本地 HTML 版本", Rt, Rt.length, "只保留当前配置引用的内容寻址 index.html。");
      const vt = [];
      if (de && be(vt, !0, "runtime_config", "全局设置 sys:theme", [...D.legacyKeysPresent, ...he.map((W) => W.key)], 1, "会把旧版设置字段吸收到当前 schema，并以后端 sanitizeRuntimeConfig() 结果回写。"), v > 0) {
        const W = [];
        C > 0 && W.push(`旧版顶层 node.port 节点 ${C} 个`), I > 0 && W.push(`旧版 lines[].port 线路 ${I} 条`), P > 0 && W.push(`隐式默认端口节点 ${P} 个`), U > 0 && W.push(`按协议补齐默认端口线路 ${U} 条`), be(vt, !0, "node_entities", "节点实体 node:* 标准化重写", Sr, v, W.length ? `会把端口并入 lines[].target，并移除旧版节点字段。${W.join("，")}。` : "会移除旧版节点字段，并统一回写当前节点 schema。");
      }
      be(vt, !0, "node_indexes", "节点索引 / 节点摘要索引", [e.NODES_INDEX_KEY, e.NODES_SUMMARY_INDEX_KEY], 2, `会按当前 node:* 实体重新生成轻量 name 索引与节点摘要索引，并把旧镜像压缩收敛为摘要格式（${l} -> ${et} bytes，节省 ${Et} bytes）。`);
      const Ft = [ft("node_entities_preserved", "node:* 节点实体", u, {
        count: u.length,
        note: "不会整批删除 node:*，只会按需重写必要节点。"
      })];
      p > 0 && be(Ft, !0, "dns_record_history", "DNS 历史记录", n.filter((W) => W.startsWith(e.DNS_RECORD_HISTORY_PREFIX)), p, "不会删除 sys:dns_record_history:v1:*。");
      const B = g + _;
      B > 0 && be(Ft, !0, "meta_keys", "配置 / 索引元信息", [e.CONFIG_META_KEY, e.NODES_INDEX_META_KEY], B, "不会删除这些 revision / meta 键。");
      const G = [];
      T.hadMalformedValue && G.push(`检测到异常 sys:theme（来源: ${T.source}），整理时会按当前 schema 修复。`), C > 0 && G.push(`检测到 ${C} 个旧节点仍使用顶层 node.port；整理后会把端口并入 lines[].target。`), I > 0 && G.push(`检测到 ${I} 条旧线路仍使用独立 lines[].port；整理后会把端口并入 lines[].target。`), (P > 0 || U > 0) && G.push(`检测到 ${P} 个节点 / ${U} 条线路仍未显式写端口；整理后会按协议补齐为 :443 / :80。`), c?.legacyMirrorDetected === !0 && G.push(`检测到旧版 sys:nodes_index_full:v2 仍保存完整节点镜像；本次会按 node:* 重建并收敛为摘要索引（${l} -> ${et} bytes）。`), f > 0 && G.push(`发现 ${f} 个未列入整理白名单的 KV 键，本次不会自动删除。`), ke.length === 0 && !de && v === 0 && G.push("当前没有检测到需要执行的 KV 清理动作；本次更多是一轮一致性巡检。"), G.push(Tf(rt)), rt.blocked === !0 && rt.reason && G.push(rt.reason);
      const X = {
        scope: "kv",
        scannedKeys: n,
        config: k,
        nodesIndex: me,
        rebuiltNodeSummaries: ie,
        revisions: K,
        summary: yr,
        quotaBudget: rt,
        mutationPlan: tt,
        preview: {
          scope: "kv",
          quotaBudget: rt,
          fieldGroups: Qr,
          deleteGroups: ke,
          rewriteGroups: vt,
          preserveGroups: Ft,
          warnings: G
        }
      };
      return X.planHash = e.buildKvTidyPlanHash(X), X;
    },
    async applyKvTidyPlan(t, r = {}) {
      const a = r.kv || e.getKV(r.env);
      if (!a) throw new Error("KV not configured");
      const n = Se(a), s = Array.isArray(t?.mutationPlan) ? t.mutationPlan : [];
      try {
        await e.applyKvMutationsWithRollback(a, s);
      } catch (i) {
        throw ja(r.env), n.NodesListCache = null, n.NodesIndexCache = null, cr(a), Is(n), n.NodeCache.clear(), n.PlaybackRouteHotCache.clear(), i;
      }
      return ja(r.env), Is(n), n.NodeCache.clear(), n.PlaybackRouteHotCache.clear(), Array.isArray(t?.nodesIndex) && t.nodesIndex.length > 0 && (al(t.nodesIndex), nl(t.nodesIndex)), e.primeNodeSummaryCaches(Array.isArray(t?.rebuiltNodeSummaries) ? t.rebuiltNodeSummaries : [], a), n.NodesIndexCache = {
        data: Array.isArray(t?.nodesIndex) ? t.nodesIndex : [],
        exp: H() + 6e4
      }, e.buildTidyResult(t, { ...t?.summary }, "kv", {
        config: t?.config || {},
        nodesIndex: Array.isArray(t?.nodesIndex) ? t.nodesIndex : []
      });
    },
    async tidyKvData(t, r = {}) {
      return await Pl(r.kv || e.getKV(t))(async () => {
        const a = await e.verifyKvTidyPlanToken(t, r.planToken), n = await e.buildKvTidyPlan(t, r);
        if (String(n.planHash || "") !== String(a.planHash || "")) {
          const s = /* @__PURE__ */ new Error("KV tidy data changed after preview");
          throw s.code = "TIDY_PLAN_STALE", s.status = 409, s.details = {
            reason: "plan_changed",
            previewPlanHash: String(a.planHash || ""),
            currentPlanHash: String(n.planHash || "")
          }, s;
        }
        if (n?.quotaBudget?.blocked === !0) {
          const s = String(n?.quotaBudget?.reason || "KV tidy write budget exceeded").trim() || "KV tidy write budget exceeded", i = new Error(s);
          throw i.code = "KV_TIDY_WRITE_LIMIT_EXCEEDED", i.status = 409, i.details = { quotaBudget: n.quotaBudget }, i;
        }
        return await e.applyKvTidyPlan(n, {
          ...r,
          env: t
        });
      });
    }
  };
}
function zp(o = {}, e = {}) {
  const { D1TidyExecutor: t, D1TidyPlanner: r } = o;
  return {
    async readD1Count(a, n, s = []) {
      if (!a || !n) return 0;
      try {
        let i = a.prepare(n);
        Array.isArray(s) && s.length && (i = i.bind(...s));
        const c = await i.first();
        return Math.max(0, Math.floor(Number(c?.total ?? c?.count ?? c?.c ?? c?.value) || 0));
      } catch {
        return 0;
      }
    },
    getPreviousD1TidyState(a = {}, n = null) {
      const s = $(a) ? a : {}, i = $(s.d1Tidy) ? s.d1Tidy : {};
      return Ve($(n) ? n : $(s.cleanup) ? s.cleanup : {}, i);
    },
    buildD1TidyStatusPayload(a = {}, n = {}) {
      const s = String(n.mode || a.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", i = nt(n.maintenanceMode || a.maintenanceMode, s), c = String(n.triggeredBy || (s === "scheduled" ? "scheduled" : "manual")).trim() || (s === "scheduled" ? "scheduled" : "manual"), l = String(n.timestamp || a.finishedAt || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()).trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), u = String(n.status || a.status || "success").trim() || "success", d = String(n.lastError || a.lastError || "").trim(), f = u === "failed" || u === "partial_failure", m = u === "skipped" || u === "deferred", p = {
        status: u,
        lastSuccessAt: !f && !m ? l : "",
        lastSkippedAt: m ? l : "",
        lastErrorAt: f ? l : "",
        lastError: f ? d : "",
        lastTriggeredBy: c,
        mode: s,
        maintenanceMode: i
      }, h = Math.max(0, Number(a.logRetentionDays ?? a.retentionDays) || 0);
      return {
        d1Tidy: {
          ...p,
          retentionDays: h,
          deletedExpiredLogCount: Math.max(0, Number(a.deletedExpiredLogCount) || 0),
          deletedExpiredLockCount: Math.max(0, Number(a.deletedExpiredLockCount) || 0),
          deletedExpiredFetchCacheCount: Math.max(0, Number(a.deletedExpiredFetchCacheCount) || 0),
          deletedExpiredProbeCacheCount: Math.max(0, Number(a.deletedExpiredProbeCacheCount) || 0),
          deletedExpiredAuthFailureCount: Math.max(0, Number(a.deletedExpiredAuthFailureCount) || 0),
          deletedExpiredDashboardCacheCount: Math.max(0, Number(a.deletedExpiredDashboardCacheCount) || 0),
          preservedLogCount: Math.max(0, Number(a.preservedLogCount) || 0),
          rebuiltStatsHourly: a.rebuiltStatsHourly === !0,
          rebuiltLogsFts: a.rebuiltLogsFts === !0,
          alignedStatsWindow: a.alignedStatsWindow === !0,
          dnsIpPoolSourceAction: String(a.dnsIpPoolSourceAction || "").trim(),
          ftsRebuildStatus: String(a.ftsRebuildStatus || "").trim(),
          optimizeStatus: String(a.optimizeStatus || "").trim(),
          statsRebuildStatus: String(a.statsRebuildStatus || "").trim(),
          reason: String(a.reason || "").trim(),
          summary: a
        },
        cleanup: {
          ...p,
          retentionDays: h,
          ftsRebuildStatus: String(a.ftsRebuildStatus || (a.rebuiltLogsFts === !0 ? "success" : "")).trim(),
          ftsRebuildRecovered: a.ftsRebuildRecovered === !0,
          lastFtsRebuildAt: String(a.lastFtsRebuildAt || "").trim(),
          ftsRebuildError: String(a.ftsRebuildError || "").trim(),
          optimizeStatus: String(a.optimizeStatus || (a.optimizedDb === !0 ? "success" : "")).trim(),
          lastOptimizeAt: String(a.lastOptimizeAt || "").trim(),
          optimizeError: String(a.optimizeError || "").trim(),
          statsAlignStatus: String(a.statsAlignStatus || "").trim(),
          statsAlignError: String(a.statsAlignError || "").trim(),
          statsRebuildStatus: String(a.statsRebuildStatus || (a.rebuiltStatsHourly === !0 ? "success" : "")).trim(),
          statsRebuildError: String(a.statsRebuildError || "").trim(),
          reason: String(a.reason || "").trim()
        }
      };
    },
    buildTidyResult(a = {}, n = {}, s = "kv", i = {}) {
      const c = $(a?.preview) ? a.preview : e.createEmptyTidyPreview(s);
      return {
        ...i,
        summary: n,
        preview: c,
        quotaBudget: $(a?.quotaBudget) ? a.quotaBudget : $(c?.quotaBudget) ? c.quotaBudget : null,
        fieldGroups: Array.isArray(c?.fieldGroups) ? c.fieldGroups : [],
        deleteGroups: Array.isArray(c?.deleteGroups) ? c.deleteGroups : [],
        rewriteGroups: Array.isArray(c?.rewriteGroups) ? c.rewriteGroups : [],
        preserveGroups: Array.isArray(c?.preserveGroups) ? c.preserveGroups : [],
        warnings: Array.isArray(c?.warnings) ? c.warnings : []
      };
    },
    async buildD1TidyPlan(a, n = {}) {
      const s = n.db || e.getDB(a), i = n.kv || e.getKV(a) || null;
      if (!s) throw new Error("D1 not configured");
      const c = n.schemaStatus?.schemaReady === !0 ? n.schemaStatus : await e.getD1SchemaReadiness(s, {
        allowAttestedFastPath: !0,
        env: a
      });
      if (c.schemaReady !== !0) {
        const S = e.createEmptyTidyPreview("d1");
        return S.warnings.push("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。"), {
          scope: "d1",
          mode: "manual",
          maintenanceMode: nt(n.maintenanceMode, "manual"),
          schemaStatus: c,
          flags: {},
          summary: {
            status: "blocked",
            schemaReady: !1,
            requiresSchemaInitialization: !0,
            issues: c.issues
          },
          preview: S,
          planHash: ""
        };
      }
      const l = ae(n.config || (a ? await Re(a) : {})), u = r.buildContext(l, n), d = r.attachPreviousState(e, u, n.previousCleanupStatus);
      d.schemaStatus = c, d.logQueuePendingCount = ar.get(s).LogQueue.length;
      const f = await r.readFacts(e, s, i, d), m = r.buildSourcePolicy(f.d1DnsIpPoolSources), p = r.buildFlags(e, d, f, m), h = r.buildSummary(d, f, m, p), g = c.schemaReady === !0;
      h.schemaReady = g, h.requiresSchemaInitialization = !g;
      const y = r.buildPreview(d, f, m, p);
      g || y.warnings.unshift("D1 结构尚未通过运行时兼容检查；本预览不授权删除，必须先完成统一“初始化 DB”并重新预览。");
      const _ = {
        scope: "d1",
        mode: d.mode,
        maintenanceMode: d.maintenanceMode,
        config: l,
        nowMs: d.nowTimestamp,
        retentionDays: d.retentionDays,
        retentionCutoffMs: d.retentionCutoffMs,
        utcOffsetMinutes: d.utcOffsetMinutes,
        scheduledNowMs: d.scheduledNow.getTime(),
        dayWindow: d.dayWindow,
        statsBucketDate: d.statsBucketDate,
        statsStartTs: d.statsStartTs,
        statsEndTs: d.statsEndTs,
        statsUtcOffsetMinutes: d.statsUtcOffsetMinutes,
        statsRetentionBoundaryDate: f.statsRetentionBoundaryDate,
        d1DnsIpPoolSources: f.d1DnsIpPoolSources,
        kvDnsIpPoolSources: f.kvDnsIpPoolSources,
        dnsIpPoolSourceAction: m.dnsIpPoolSourceAction,
        skipDnsIpPoolSourceCleanup: m.skipDnsIpPoolSourceCleanup,
        previousD1State: d.previousD1State,
        schemaStatus: c,
        flags: p,
        summary: h,
        preview: y
      };
      return _.planHash = e.buildD1TidyPlanHash(_), _;
    },
    async applyD1TidyPlan(a, n = {}) {
      const s = n.env, i = n.db || e.getDB(s), c = n.kv || e.getKV(s) || null;
      if (!i) throw new Error("D1 not configured");
      const l = n.schemaStatus?.schemaReady === !0 ? n.schemaStatus : a?.schemaStatus?.schemaReady === !0 ? a.schemaStatus : await e.getD1SchemaReadiness(i, {
        allowAttestedFastPath: !0,
        env: s
      });
      if (l.schemaReady !== !0) {
        const b = /* @__PURE__ */ new Error("D1 schema must pass runtime compatibility checks before tidy execution");
        throw b.code = "D1_SCHEMA_INCOMPATIBLE", b.status = 409, b.details = {
          issues: l.issues,
          autoRepairPolicy: l.autoRepairPolicy
        }, b;
      }
      const u = a || await e.buildD1TidyPlan(s, {
        ...n,
        db: i,
        kv: c
      }), d = String(u?.mode || n.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", f = nt(u?.maintenanceMode || n.maintenanceMode, d), m = $(u?.flags) ? u.flags : {}, p = typeof n.beforeEachStep == "function" ? n.beforeEachStep : async () => {
      }, h = {
        kv: c,
        db: i
      }, g = d === "scheduled", y = t.createSummary(u, d, m);
      y.maintenanceMode = f;
      let _ = !1;
      const S = (b, N, R, x) => {
        const O = R?.message || String(R);
        if (b && (y[b] = "failed"), N && (y[N] = O), y.lastError = O, y.status = y.status === "failed" ? "failed" : "partial_failure", console.error(`${x}: `, R), !g) throw R;
        return !1;
      }, A = ar.get(i);
      A.LogFlushTask && await Promise.resolve(A.LogFlushTask).catch(() => {
      });
      const E = H(), T = t.buildDeleteScopes(e, u, m, i), w = await t.runBudgetedDeleteScopes(T, y, p, { startedAt: E });
      if (y.hasMore = w.hasMore, y.remainingScopes = w.remainingScopes, y.budget = w.budget, _ = w.budget.processedRows > 0, m.rebuildStatsHourly === !0 && H() - E < Mr) try {
        await p("resetStatsHourly"), await e.clearStatsHourly(i), y.alignedStatsWindow = !0, y.statsAlignStatus = "success", y.statsRebuildStatus = "reset_for_new_logs", _ = !0;
      } catch (b) {
        S("statsRebuildStatus", "statsRebuildError", b, "D1 stats reset Error");
      }
      else
        y.statsAlignStatus = m.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped", y.statsRebuildStatus = m.rebuildStatsHourly === !0 ? "deferred_budget" : "skipped";
      const D = () => H() - E < Mr;
      if (m.rebuildLogsFtsDeferred === !0) y.ftsRebuildStatus = m.ftsRebuildDeferredReason || "deferred_size_guard";
      else if (m.rebuildLogsFts === !0 && (y.hasMore || !D())) y.ftsRebuildStatus = "deferred_budget";
      else if (m.rebuildLogsFts === !0) try {
        await p("rebuildLogsFts");
        let b = !1;
        await e.hasLogsFtsTable(i) ? b = await e.rebuildLogsFts(i) : b = (await e.ensureLogsFtsSchema(i)).rebuilt === !0, y.rebuiltLogsFts = b === !0, y.ftsRebuildStatus = b === !0 ? "success" : "skipped", y.lastFtsRebuildAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), _ = _ || b === !0;
      } catch (b) {
        S("ftsRebuildStatus", "ftsRebuildError", b, "D1 logs FTS rebuild Error");
      }
      if (m.optimizeDb === !0 && !y.hasMore && D()) try {
        await p("optimizeLogsDb"), await e.optimizeLogsDb(i), y.optimizedDb = !0, y.optimizeStatus = "success", y.lastOptimizeAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), _ = !0;
      } catch (b) {
        S("optimizeStatus", "optimizeError", b, d === "scheduled" ? "Scheduled DB optimize Error" : "D1 optimize Error");
      }
      else m.optimizeDb === !0 && (y.optimizeStatus = "deferred_budget");
      y.budget.durationMs = Math.max(0, H() - E), y.budget.durationMs >= Mr && !y.budget.exhaustedBy && (y.budget.exhaustedBy = "time_limit"), await p("patchLogStatus");
      const k = await t.patchLogStatus(e, i, h, u, y, m, n);
      if (y.status !== "partial_failure" && y.status !== "failed") if (y.hasMore)
        y.status = "success", y.reason = "maintenance_budget_exhausted";
      else if (d === "scheduled") {
        const b = m.rebuildLogsFtsDeferred === !0 || m.optimizeDbDeferred === !0;
        _ ? y.status = "success" : (y.status = "skipped", y.reason = b ? "maintenance_deferred" : "no_expired_data");
      } else y.status = "success";
      return y.finishedAt = k, e.buildTidyResult(u, y, "d1");
    },
    async tidyD1Data(a, n = {}) {
      const s = String(n.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", i = nt(n.maintenanceMode, s), c = n.db || e.getDB(a);
      if (!c) throw new Error("D1 not configured");
      if (s === "manual") {
        const d = await e.verifyD1TidyPlanToken(a, n.planToken), f = await e.getD1SchemaReadiness(c, {
          allowAttestedFastPath: !0,
          env: a
        });
        if (f.schemaReady !== !0) {
          const p = /* @__PURE__ */ new Error("D1 schema changed after preview; initialize and preview again");
          throw p.code = "TIDY_PLAN_STALE", p.status = 409, p.details = {
            reason: "schema_changed",
            issues: f.issues
          }, p;
        }
        const m = await e.buildD1TidyPlan(a, {
          ...n,
          db: c,
          mode: s,
          maintenanceMode: nt(d.maintenanceMode, s),
          nowMs: Number(d.planNowMs),
          scheduledNow: new Date(Number(d.scheduledNowMs) || Number(d.planNowMs)),
          statsBucketDate: String(d.statsBucketDate || ""),
          statsStartTs: Number(d.statsStartTs) || 0,
          statsEndTs: Number(d.statsEndTs) || 0,
          statsUtcOffsetMinutes: Number(d.statsUtcOffsetMinutes) || 0,
          schemaStatus: f
        });
        if (String(m.planHash || "") !== String(d.planHash || "")) {
          const p = /* @__PURE__ */ new Error("D1 tidy data changed after preview");
          throw p.code = "TIDY_PLAN_STALE", p.status = 409, p.details = {
            reason: "plan_changed",
            previewPlanHash: String(d.planHash || ""),
            currentPlanHash: String(m.planHash || "")
          }, p;
        }
        return {
          ...await e.applyD1TidyPlan(m, {
            ...n,
            db: c,
            env: a,
            mode: s,
            maintenanceMode: m.maintenanceMode,
            schemaStatus: f
          }),
          schema: f
        };
      }
      let l = await e.getD1SchemaReadiness(c, {
        allowAttestedFastPath: !0,
        env: a
      });
      if (l.schemaReady !== !0 && (await e.buildD1SchemaRepairPlan(c)).phase === "safe" && (await e.initializeD1Database(c, {
        includeFts: !0,
        env: a,
        repairMode: "safe"
      }), l = await e.getD1SchemaReadiness(c, {
        allowAttestedFastPath: !0,
        env: a
      })), l.schemaReady !== !0) {
        const d = /* @__PURE__ */ new Error("D1 schema is not initialized");
        throw d.code = "D1_SCHEMA_NOT_READY", d.status = 409, d.details = { issues: l.issues }, d;
      }
      const u = n.plan || await e.buildD1TidyPlan(a, {
        ...n,
        db: c,
        mode: s,
        maintenanceMode: i,
        schemaStatus: l
      });
      return {
        ...await e.applyD1TidyPlan(u, {
          ...n,
          db: c,
          env: a,
          schemaStatus: l
        }),
        schema: l
      };
    },
    shouldRunLogsOptimize(a, n = {}) {
      const s = Number(n.nowMs) || H(), i = Math.max(0, Number(n.minIntervalMs) || F.Defaults.LogVacuumMinIntervalMs);
      if (n.force === !0) return !0;
      const c = typeof a == "string" ? new Date(a).getTime() : NaN;
      return Number.isFinite(c) ? s - c >= i : !0;
    },
    shouldRunLogsFtsRebuild(a, n = {}) {
      return e.shouldRunLogsOptimize(a, {
        ...n,
        minIntervalMs: Math.max(0, Number(n.minIntervalMs) || F.Defaults.LogFtsRebuildMinIntervalMs)
      });
    },
    async optimizeLogsDb(a) {
      return a ? (await a.prepare("PRAGMA optimize").run(), !0) : !1;
    }
  };
}
function Wp(o = {}, e = {}) {
  const { buildAdminReleaseVendorManifest: t, normalizeAdminReleaseVendorManifestRecord: r, validateAdminShellHtmlSource: a } = o;
  return {
    async readLegacyConfigSnapshotRecordsStrict(n) {
      if (!n) return [];
      const s = await xe(n, e.CONFIG_SNAPSHOTS_KEY, { type: "json" });
      if (s == null) return [];
      if (Array.isArray(s)) return s;
      const i = /* @__PURE__ */ new Error("Stored legacy config snapshot records are invalid");
      throw i.code = "CONFIG_SNAPSHOTS_INVALID", i.status = 409, i;
    },
    buildAdminIndexUploadKey(n = "") {
      const s = Lt(n);
      return s ? `${e.ADMIN_INDEX_UPLOAD_PREFIX}${s}` : "";
    },
    normalizeAdminIndexUploadRecord(n = {}, s = "") {
      if (!$(n)) return null;
      const i = Lt(n.revision), c = Lt(s);
      if (!i || c && i !== c) return null;
      const l = zr(i), u = Eo(i), d = String(n.html || "");
      return d ? {
        version: Number(n.version) || 1,
        revision: i,
        assetRevision: u,
        sourceUrl: l,
        fileName: String(n.fileName || "index.html").trim() || "index.html",
        uploadedAt: String(n.uploadedAt || "").trim(),
        bytes: Number(n.bytes) || new TextEncoder().encode(d).length,
        html: d,
        manifest: r(n.manifest || {})
      } : null;
    },
    async validateAdminIndexUploadRecord(n = {}, s = "") {
      const i = e.normalizeAdminIndexUploadRecord(n, s);
      if (!i || await On(i.html) !== i.revision) return null;
      try {
        const c = a(i.html, i.sourceUrl, {
          sourceLabel: "local admin index",
          contentType: "text/html"
        });
        return {
          ...i,
          bytes: c.bytes,
          manifest: r(t(c.html, {
            releaseTag: i.assetRevision,
            sourceUrl: i.sourceUrl
          }))
        };
      } catch {
        return null;
      }
    },
    async getAdminActiveIndexRecord(n) {
      return n ? e.validateAdminIndexUploadRecord(await xe(n, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" })) : null;
    },
    async getAdminIndexUploadRecord(n, s = "") {
      const i = e.buildAdminIndexUploadKey(s);
      if (!n || !i) return null;
      const c = await e.validateAdminIndexUploadRecord(await xe(n, i, { type: "json" }), s);
      return c || e.validateAdminIndexUploadRecord(await xe(n, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), s);
    },
    collectReferencedAdminIndexUploadRevisions(n = {}, s = []) {
      const i = /* @__PURE__ */ new Set(), c = (l) => {
        const u = Je(l?.indexUrl || "");
        u && i.add(u);
      };
      c(n);
      for (const l of Array.isArray(s) ? s : []) c(l?.config);
      return i;
    },
    collectUnreferencedAdminIndexUploadKeys(n = {}, s = [], i = []) {
      const c = e.collectReferencedAdminIndexUploadRevisions(n, s);
      return (Array.isArray(i) ? i : []).filter((l) => {
        const u = String(l || "").trim();
        if (!u.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX)) return !1;
        const d = Lt(u.slice(e.ADMIN_INDEX_UPLOAD_PREFIX.length));
        return d && !c.has(d);
      });
    },
    async persistAdminIndexUpload(n = {}, s = {}) {
      const { env: i, kv: c, ctx: l } = s;
      if (!c) {
        const d = /* @__PURE__ */ new Error("KV namespace is required to persist the local admin index");
        throw d.code = "KV_NOT_CONFIGURED", d.status = 503, d;
      }
      const u = e.normalizeAdminIndexUploadRecord(n, n?.revision);
      if (!u) {
        const d = /* @__PURE__ */ new Error("本地 index.html 上传记录无效");
        throw d.code = "ADMIN_INDEX_UPLOAD_INVALID", d.status = 400, d;
      }
      return await er(c)(async () => {
        const d = e.buildAdminIndexUploadKey(u.revision), f = await xe(c, d, { type: "json" }), m = await xe(c, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" });
        let p = e.normalizeAdminIndexUploadRecord(f, u.revision);
        p && await On(p.html) !== u.revision && (p = null);
        const h = p || u;
        p || await c.put(d, JSON.stringify(u)), await c.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h));
        try {
          const g = i ? await ue(i) : ae(await xe(c, e.CONFIG_KEY, { type: "json" }) || {});
          return {
            config: await e.commitRuntimeConfig({
              ...g,
              indexUrl: h.sourceUrl
            }, {
              env: i,
              kv: c,
              ctx: l
            }),
            previousConfig: g,
            record: h
          };
        } catch (g) {
          throw await pe(m ? c.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(m)) : c.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_upload_rollback", { revision: u.revision }, null), p || await pe(f ? c.put(d, JSON.stringify(f)) : c.delete(d), "admin.local_index_upload_rollback", { revision: u.revision }, null), g;
        }
      });
    },
    async rollbackAdminIndexUploadActivation(n = {}, s = {}, i = {}) {
      const { env: c, kv: l, ctx: u } = i;
      if (!l) {
        const d = /* @__PURE__ */ new Error("KV namespace is required to roll back the local admin index");
        throw d.code = "KV_NOT_CONFIGURED", d.status = 503, d;
      }
      return await er(l)(async () => {
        const d = c ? await ue(c) : ae(await xe(l, e.CONFIG_KEY, { type: "json" }) || {}), f = Je(s?.indexUrl || ""), m = Je(d?.indexUrl || "");
        if (!f || m !== f) return {
          config: d,
          skipped: !0,
          reason: m ? "superseded_by_newer_admin_index" : "admin_index_already_restored"
        };
        const p = Je(n?.indexUrl || ""), h = await xe(l, e.ADMIN_ACTIVE_INDEX_KEY, { type: "json" }), g = p ? await e.getAdminIndexUploadRecord(l, p) : null;
        g ? await l.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(g)) : await l.delete(e.ADMIN_ACTIVE_INDEX_KEY);
        try {
          return {
            config: await e.commitRuntimeConfig({
              ...d,
              indexUrl: p ? zr(p) : ""
            }, {
              env: c,
              kv: l,
              ctx: u
            }),
            skipped: !1,
            reason: ""
          };
        } catch (y) {
          throw await pe(h ? l.put(e.ADMIN_ACTIVE_INDEX_KEY, JSON.stringify(h)) : l.delete(e.ADMIN_ACTIVE_INDEX_KEY), "admin.active_index_rollback_restore", { revision: f }, null), y;
        }
      });
    },
    async captureRuntimeConfigRollbackState(n, s) {
      if (!s) return {
        config: ae(n ? await Re(n) : {}),
        kvEntries: []
      };
      const i = n ? await ue(n) : ae(await xe(s, e.CONFIG_KEY, { type: "json" }) || {}), c = [
        e.CONFIG_KEY,
        e.CONFIG_META_KEY,
        e.CONFIG_SNAPSHOTS_KEY,
        e.CONFIG_SNAPSHOTS_META_KEY,
        ...e.buildLegacyConfigCacheKeys(i)
      ];
      return {
        config: i,
        kvEntries: await e.captureRawKvEntries(s, c)
      };
    },
    async restoreCapturedRuntimeConfigState(n = {}, s = {}) {
      const i = s.kv, c = ae(n?.config || {});
      if (!i) return c;
      const l = Array.isArray(n?.kvEntries) ? n.kvEntries : [];
      if (l.length > 0) {
        const u = l.map((d) => d?.exists === !0 ? {
          type: "put",
          key: String(d?.key || "").trim(),
          value: String(d?.value ?? "")
        } : {
          type: "delete",
          key: String(d?.key || "").trim(),
          value: ""
        });
        await e.applyKvMutationsWithRollback(i, u);
      }
      return ja(s.env), s.env ? await Re(s.env) : c;
    },
    async restoreCapturedRuntimeConfigAndDnsState(n = {}, s = {}) {
      const i = ae(n?.config || {});
      let c = null, l = null, u = i;
      try {
        await e.commitRuntimeConfig(i, {
          env: s.env,
          kv: s.kv,
          ctx: s.ctx
        });
      } catch (d) {
        c = d;
      }
      try {
        u = await e.restoreCapturedRuntimeConfigState(n, s);
      } catch (d) {
        l = d;
      }
      if (c || l) {
        const d = new Error([c ? `dns:${se(c, "restore_failed")}` : "", l ? `kv:${se(l, "restore_failed")}` : ""].filter(Boolean).join("; "));
        throw d.code = "CONFIG_DNS_RESTORE_FAILED", d.status = 500, d.details = {
          dnsRestoreError: c ? se(c, "restore_failed") : "",
          kvRestoreError: l ? se(l, "restore_failed") : ""
        }, d;
      }
      return u;
    }
  };
}
function Gp(o = {}, e = {}) {
  return {
    async persistRuntimeConfig(t, r = {}) {
      return await er(r.kv || Na(r.env))(() => e.commitRuntimeConfig(t, {
        ...r,
        forceKvCommit: !0
      }));
    },
    async prepareRuntimeConfigPersistence(t, r = {}) {
      const { env: a, kv: n, ctx: s } = r;
      if (!n) {
        const d = /* @__PURE__ */ new Error("KV namespace is required to persist runtime config");
        throw d.code = "KV_NOT_CONFIGURED", d.status = 503, d;
      }
      _u(t?.defaultHostPrefixCnameTarget);
      const i = a ? await ue(a) : ae(await xe(n, e.CONFIG_KEY, { type: "json" }) || {}), c = ae(t);
      wu(t), Lu(c, a);
      const l = ze(a), u = Wa(null, i, l) !== Wa(null, c, l) ? (await e.loadAllNodeEntitiesFromKvStrict(n, { ctx: s })).filter((d) => Ye(d?.entryMode) && !jt(d?.hostPrefixCnameTarget)) : [];
      return u.length > 0 && ia(c, a), {
        prevConfig: i,
        nextConfig: c,
        configuredHost: l,
        dnsPlans: u.map((d) => e.buildHostPrefixDnsSyncPlan(d.name, d, d.name, d, l, {
          previousConfig: i,
          nextConfig: c
        })).filter((d) => d.changed === !0),
        ctx: s,
        kv: n,
        env: a
      };
    },
    async buildRuntimeConfigMutationPlan(t, r, a) {
      const n = await e.readLegacyConfigSnapshotRecordsStrict(t), s = e.normalizeRevisionMeta(Vn(a)), i = [
        {
          type: "delete",
          key: e.CONFIG_SNAPSHOTS_KEY,
          value: ""
        },
        {
          type: "delete",
          key: e.CONFIG_SNAPSHOTS_META_KEY,
          value: ""
        },
        {
          type: "put",
          key: e.CONFIG_KEY,
          value: JSON.stringify(a)
        },
        {
          type: "put",
          key: e.CONFIG_META_KEY,
          value: JSON.stringify(s)
        }
      ];
      for (const u of e.buildLegacyConfigCacheKeys(r, a)) i.push({
        type: "delete",
        key: u,
        value: ""
      });
      const c = e.collectReferencedAdminIndexUploadRevisions(r, n), l = e.collectReferencedAdminIndexUploadRevisions(a, []);
      for (const u of c)
        l.has(u) || i.push({
          type: "delete",
          key: e.buildAdminIndexUploadKey(u),
          value: ""
        });
      return i;
    },
    async commitRuntimeConfig(t, r = {}) {
      const { prevConfig: a, nextConfig: n, configuredHost: s, dnsPlans: i, ctx: c, kv: l, env: u } = await e.prepareRuntimeConfigPersistence(t, r);
      if (tf(r.expectedConfigRevision, a), Z(a) === Z(n))
        return await e.ensureConfigMeta(l, n, { ctx: c }), n;
      const d = [];
      let f = null, m = !1;
      try {
        for (const h of i)
          f = h, await e.persistHostPrefixDnsSyncPlan(h, {
            env: u,
            kv: l,
            ctx: c,
            config: n,
            requestHost: s
          }), d.push(h), f = null;
        m = !0;
        const p = await e.buildRuntimeConfigMutationPlan(l, a, n);
        return await e.applyKvMutationsWithRollback(l, p), u ? nd(u, n) : ja(), await e.invalidateDashboardSnapshotCacheForConfigChange(u, {
          prevConfig: a,
          nextConfig: n
        }), n;
      } catch (p) {
        const h = [], g = f ? [...d, f] : d;
        for (let y = g.length - 1; y >= 0; y -= 1) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: g[y].rollbackSteps }, {
            env: u,
            kv: l,
            ctx: c,
            config: n,
            requestHost: s,
            skipHistory: !0
          });
        } catch (_) {
          h.push(se(_, "dns_rollback_failed"));
        }
        if (p && typeof p == "object") {
          const y = Array.isArray(p?.details?.rollbackConflicts) ? p.details.rollbackConflicts : [], _ = Array.isArray(p?.details?.rollbackFailures) ? p.details.rollbackFailures : [];
          p.details = {
            ...$(p.details) ? p.details : {},
            hostPrefixDnsSyncAttempted: i.length > 0,
            hostPrefixDnsSyncedCount: d.length,
            failedHostPrefixDnsHost: String(f?.nextDnsHost || f?.previousDnsHost || ""),
            rollbackAttempted: g.length > 0 || m,
            rollbackSucceeded: h.length === 0 && y.length === 0 && _.length === 0,
            rollbackError: [...h, ..._].join("; "),
            rollbackConflicts: y
          };
        }
        throw p;
      }
    },
    async commitSourceDirectNodesConfigWithinMutation(t, r, a, n = {}) {
      if (!r) return null;
      const s = t ? await ue(t) : ae(await r.get(e.CONFIG_KEY, { type: "json" }) || {}), i = ht(s.sourceDirectNodes || []), c = Yn(i, {
        renameMap: n.renameMap,
        removedNames: n.removedNames,
        allowedNames: n.allowedNames
      });
      return Z(i) === Z(c) ? s : e.commitRuntimeConfig({
        ...s,
        sourceDirectNodes: c
      }, {
        env: t,
        kv: r,
        ctx: a
      });
    },
    async commitSingleNodeMainVideoStreamShortcutShadowWithinMutation(t, r, a, n = {}) {
      if (!r) return null;
      const s = t ? await ue(t) : ae(await r.get(e.CONFIG_KEY, { type: "json" }) || {}), i = String(n.originalName || "").trim().toLowerCase(), c = String(n.nodeName || "").trim().toLowerCase(), l = cn(n.mode);
      let u = ht(s.sourceDirectNodes || []);
      return i && i !== c && (u = Yn(u, { renameMap: { [i]: c } })), u = u.filter((d) => String(d || "").trim().toLowerCase() !== c), c && l === "direct" && u.push(c), u = ht(u), Z(s.sourceDirectNodes || []) === Z(u) ? s : e.commitRuntimeConfig({
        ...s,
        sourceDirectNodes: u
      }, {
        env: t,
        kv: r,
        ctx: a
      });
    }
  };
}
function jp(o = {}, e = {}) {
  return {
    async sendTelegramMessage({ tgBotToken: t, tgChatId: r, text: a }) {
      const n = String(t || "").trim(), s = String(r || "").trim();
      if (!n || !s) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const i = await De(await Be(`https://api.telegram.org/bot${n}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: s,
          text: String(a || "")
        })
      }), sn);
      if (i.exceeded) throw new Error("Telegram API response too large");
      const c = JSON.parse(i.text);
      if (!c.ok) throw new Error(c.description || "Telegram API 返回错误");
      return c;
    },
    async buildDailyTelegramSummaryPayload(t, r = {}) {
      const a = ae(r?.config || await ue(t)), n = r?.now instanceof Date ? new Date(r.now.getTime()) : new Date(r?.now || /* @__PURE__ */ new Date()), s = r?.dayWindow && typeof r.dayWindow == "object" ? r.dayWindow : st(n, a.scheduleUtcOffsetMinutes), [i, c] = await Promise.all([e.buildDashboardStatsPayload(t, {
        config: a,
        dayWindow: s,
        nowMs: n.getTime(),
        skipD1WriteHotspot: !0
      }), e.getDashboardMonthlyTrafficPayload(t, {
        config: a,
        ctx: r?.ctx || null,
        nowMs: n.getTime()
      })]);
      return {
        zoneName: String(i?.zoneName || "").trim(),
        requestCountDisplay: String(i?.requestCountDisplay || "").trim() || (i?.todayRequests === null || i?.todayRequests === void 0 ? "暂不可用" : String(Number(i?.todayRequests) || 0)),
        requestSourceText: String(i?.requestSourceText || "").trim(),
        todayTraffic: String(i?.todayTraffic || "").trim() || "暂不可用",
        monthlyTraffic: String(c?.traffic || "").trim() || "暂不可用",
        trafficSourceText: String(i?.trafficSourceText || "").trim(),
        playCount: Math.max(0, Number(i?.playCount) || 0),
        infoCount: Math.max(0, Number(i?.infoCount) || 0),
        nodeCount: Math.max(0, Number(i?.nodeCount) || 0),
        todayRequests: i?.todayRequests ?? null
      };
    },
    async sendDailyTelegramReport(t, r = {}) {
      const a = e.getDB(t), n = e.getKV(t);
      if (!a || !n) throw new Error("Database or KV not configured");
      const s = await n.get(e.CONFIG_KEY, { type: "json" }) || {}, i = ae(s), c = String(i.tgBotToken || "").trim(), l = String(i.tgChatId || "").trim();
      if (!c || !l) throw new Error("请先完善 Telegram Bot Token 和 Chat ID 配置");
      const u = r?.now instanceof Date ? new Date(r.now.getTime()) : new Date(r?.now || /* @__PURE__ */ new Date()), d = st(u, i.scheduleUtcOffsetMinutes), f = zi(i, s, {
        reportKinds: r?.reportKinds,
        fallbackAllWhenLegacy: !0
      });
      if (!f.length) throw new Error("请先至少启用一个日报类型");
      const m = f.includes("summary") ? await e.buildDailyTelegramSummaryPayload(t, {
        config: i,
        now: u,
        dayWindow: d
      }) : null, p = f.some((g) => g !== "summary") ? await e.getCloudflareRuntimeQuotaStatus(t, {
        config: i,
        db: a
      }) : null, h = [];
      for (const g of f) {
        const y = wf(g, g === "summary" ? m : p?.[g], d);
        await e.sendTelegramMessage({
          tgBotToken: c,
          tgChatId: l,
          text: y
        }), h.push({
          kind: g,
          text: y
        });
      }
      return {
        success: h.length > 0,
        sentCount: h.length,
        reportKinds: f,
        messages: h
      };
    },
    async maybeSendRuntimeAlerts(t, r = null, a = {}) {
      const n = e.getDB(t);
      if (!n) return {
        sent: !1,
        reason: "db_unavailable"
      };
      if (!await e.ensureSysStatusTable(n)) return {
        sent: !1,
        reason: "db_init_failed"
      };
      const s = ae(await Re(t)), i = a && typeof a == "object" ? a : {}, c = String(s.tgBotToken || "").trim(), l = String(s.tgChatId || "").trim();
      if (!c || !l) return {
        sent: !1,
        reason: "telegram_not_configured"
      };
      const u = le(s.tgAlertDroppedBatchThreshold, F.Defaults.TgAlertDroppedBatchThreshold, 0, 5e3), d = le(s.tgAlertFlushRetryThreshold, F.Defaults.TgAlertFlushRetryThreshold, 0, 10), f = le(s.tgAlertCooldownMinutes, F.Defaults.TgAlertCooldownMinutes, 1, 1440), m = s.tgAlertOnScheduledFailure === !0, p = s.tgAlertKvUsageEnabled === !0, h = s.tgAlertD1UsageEnabled === !0, g = le(s.tgAlertKvUsageThresholdPercent, F.Defaults.TgAlertKvUsageThresholdPercent, 1, 100), y = le(s.tgAlertD1UsageThresholdPercent, F.Defaults.TgAlertD1UsageThresholdPercent, 1, 100);
      if (u <= 0 && d <= 0 && !m && !p && !h) return {
        sent: !1,
        reason: "thresholds_disabled"
      };
      const _ = await e.getOpsStatus(t), S = _ && typeof _.log == "object" ? _.log : {}, A = r && typeof r == "object" && Object.keys(r).length ? r : _ && typeof _.scheduled == "object" ? _.scheduled : {}, E = [], T = Number(S.lastDroppedBatchSize) || 0;
      u > 0 && T >= u && E.push({
        code: "log_drop",
        message: `日志刷盘疑似丢弃批次：${T} 条（阈值 ${u}）`,
        eventAt: S.lastFlushErrorAt || S.lastOverflowAt || S.updatedAt || _.updatedAt || ""
      });
      const w = Number(S.lastFlushRetryCount) || 0;
      d > 0 && w >= d && E.push({
        code: "log_retry",
        message: `D1 写入重试次数偏高：${w} 次（阈值 ${d}）`,
        eventAt: S.lastFlushAt || S.lastFlushErrorAt || S.updatedAt || _.updatedAt || ""
      });
      const D = String(A.status || "").toLowerCase();
      if (m && (D === "failed" || D === "partial_failure")) {
        const L = [];
        for (const [v, M] of Object.entries({
          cleanup: "日志清理",
          tgDailyReport: "每日报表",
          alerts: "异常告警"
        })) {
          const C = A?.[v];
          if (!C || typeof C != "object") continue;
          const I = String(C.status || "").trim(), P = String(C.lastError || "").trim();
          !P && I !== "failed" && I !== "partial_failure" || L.push(`${M}：${I || "failed"}${P ? `，错误：${P}` : ""}`);
        }
        E.push({
          code: "scheduled_failure",
          message: L.length ? `定时任务状态异常：${L.join("；")}` : `定时任务状态异常：${A.status}${A.lastError ? `，错误：${A.lastError}` : ""}`,
          eventAt: A.lastFinishedAt || A.lastErrorAt || A.updatedAt || _.updatedAt || ""
        });
      }
      if (p || h) {
        const L = await e.getCloudflareRuntimeQuotaStatus(t, {
          config: s,
          db: n
        }), v = [{
          enabled: p,
          threshold: g,
          code: "cf_kv_usage",
          title: "KV",
          card: L?.kv
        }, {
          enabled: h,
          threshold: y,
          code: "cf_d1_usage",
          title: "D1",
          card: L?.d1
        }];
        for (const M of v) {
          if (M.enabled !== !0) continue;
          const C = M.card && typeof M.card == "object" ? M.card : {}, I = String(C.status || "").trim().toLowerCase();
          if (I !== "success" && I !== "partial_failure") continue;
          const P = (Array.isArray(C.metrics) ? C.metrics : []).filter((V) => Number(V?.percent) >= M.threshold);
          if (!P.length) continue;
          const U = P.map((V) => `${String(V?.key || "").trim()}:${String(V?.percentText || "").trim()}`).filter(Boolean).join(",");
          E.push({
            code: M.code,
            message: Af(M.title, C, M.threshold, P),
            eventAt: `${String(C.resourceLabel || M.title || "").trim()}|${String(C.planLabel || "").trim()}|${String(C.periodLabel || "").trim()}|${U}|${I}`
          });
        }
      }
      if (!E.length) return {
        sent: !1,
        reason: "no_alerts"
      };
      const k = JSON.stringify(E.map((L) => ({
        code: L.code,
        eventAt: L.eventAt,
        message: L.message
      }))), b = await e.getOpsStatusPayloadFromDb(n, e.TELEGRAM_ALERT_STATE_DB_SCOPE), N = Date.now(), R = f * 60 * 1e3;
      if (i.ignoreCooldown !== !0 && b && b.signature === k && Number(b.sentAtMs) > 0 && N - Number(b.sentAtMs) < R) return {
        sent: !1,
        reason: "cooldown_active"
      };
      const x = ql(/* @__PURE__ */ new Date(), s.scheduleUtcOffsetMinutes), O = [
        "⚠️ Emby Proxy 运行时异常告警",
        "",
        ...E.map((L) => `- ${L.message}`),
        "",
        `时间：${x.dateKey} ${x.clockTime} (${x.offsetLabel})`,
        "#Emby #Alert"
      ];
      return await e.sendTelegramMessage({
        tgBotToken: c,
        tgChatId: l,
        text: O.join(`
`)
      }), i.persistState !== !1 && (await e.putOpsStatusPayloadToDb(n, e.TELEGRAM_ALERT_STATE_DB_SCOPE, {
        signature: k,
        sentAt: new Date(N).toISOString(),
        sentAtMs: N,
        issues: E
      }, N) || Ae("telegram_alert_state.write_failed", /* @__PURE__ */ new Error("telegram alert cooldown state not persisted"), { issueCount: E.length })), {
        sent: !0,
        issueCount: E.length,
        reason: "alert_sent"
      };
    }
  };
}
function Vp(o = {}, e = {}) {
  return {
    ...Kp(o, e),
    ...zp(o, e),
    ...Wp(o, e),
    ...Gp(o, e),
    ...jp(o, e)
  };
}
var qp = class {
  constructor({ logger: o, service: e }) {
    this.logger = o, this.service = e;
  }
  handle(o, e, t) {
    if (!t || typeof t.waitUntil != "function") throw new TypeError("ScheduledMaintenanceFacade.handle requires ctx.waitUntil");
    const r = this.#p(o, e, t);
    t.waitUntil(r);
  }
  #t(o = {}, ...e) {
    for (const t of e) {
      if (!t) continue;
      const r = o?.[t];
      if ($(r)) return r;
    }
    return {};
  }
  #e(o = "success") {
    return o === "success" ? "partial_failure" : o;
  }
  #o(o = {}, e = "") {
    const t = String(e || o?.localDateKey || "");
    return t ? {
      ...o,
      localDateKey: t,
      executedSlots: Dt(o?.executedSlots || [], [])
    } : {
      ...o,
      executedSlots: Dt(o?.executedSlots || [], [])
    };
  }
  #s(o = {}, e = "", t = "") {
    return this.#o({
      ...o,
      executedSlots: [...o?.executedSlots || [], t]
    }, e);
  }
  #n(o = "", e = []) {
    const t = e[e.length - 1] || "";
    return {
      processedSlots: e,
      lastPlannedSlot: t ? `${o} ${t}` : "",
      reason: e.length > 1 ? "clock_slots_processed" : "clock_slot_processed"
    };
  }
  #r(o = {}, e = "", t = "", r = {}) {
    return {
      ...o,
      status: "skipped",
      lastSkippedAt: e,
      reason: t,
      ...r
    };
  }
  #i(o = {}, e = "", t = {}) {
    return {
      ...o,
      status: "success",
      lastSuccessAt: e,
      ...t
    };
  }
  #c(o = {}, e = "", t = "", r = {}) {
    return {
      ...o,
      status: "failed",
      lastErrorAt: e,
      lastError: t,
      ...r
    };
  }
  #l(o = "") {
    return async (e, t, r = null, a = null) => {
      try {
        return await e;
      } catch (n) {
        return this.logger.error(`scheduled.${t}`, n, {
          leaseToken: o,
          ...$(r) ? r : {}
        }), a;
      }
    };
  }
  #a(o, e, t) {
    return { scheduled: {
      lastSkippedAt: o,
      lastSkipReason: t,
      lock: {
        status: "busy",
        reason: t,
        expiresAt: e.lock?.expiresAt || null,
        backend: String(e?.backend || e?.lock?.backend || "").trim() || "d1"
      }
    } };
  }
  #u(o, e, t = "d1") {
    const r = String(e || "scheduled_skipped").trim() || "scheduled_skipped";
    return { scheduled: {
      status: "skipped",
      lastSkippedAt: o,
      lastSkipReason: r,
      lastFinishedAt: o,
      lock: {
        status: "skipped",
        reason: r,
        backend: String(t || "").trim() || "d1"
      }
    } };
  }
  #d(o, e, t, r) {
    return { scheduled: {
      status: "running",
      lastStartedAt: o,
      lock: {
        status: "held",
        token: e,
        expiresAt: t.lock?.expiresAt || H() + r
      }
    } };
  }
  #f(o, e, t) {
    return o.lostReason ? {
      status: "lost",
      reason: o.lostReason,
      lastCheckedAt: e
    } : {
      status: t ? "released" : "release_skipped",
      releasedAt: e
    };
  }
  #m({ leaseStores: o, leaseToken: e, scheduledLeaseMs: t, leaseBackend: r = "", initialLock: a = null }) {
    const n = {
      active: !0,
      lostReason: null,
      lock: a
    }, s = async () => {
      if (!n.active) return null;
      const l = await this.service.renewScheduledLease(o, e, t, { backend: r });
      return l ? (n.lock = l, l) : (n.active = !1, n.lostReason = n.lostReason || "lease_lost", null);
    }, i = async () => {
      if (!n.active) throw new Error(n.lostReason || "scheduled_lease_lost");
      const l = await s();
      if (!l) throw new Error(n.lostReason || "scheduled_lease_lost");
      return l;
    }, c = Math.max(5e3, Math.min(Math.floor(t / 3), 6e4));
    return {
      leaseState: n,
      ensureActive: i,
      keepalivePromise: (async () => {
        for (; n.active; ) {
          let l = c;
          for (; n.active && l > 0; ) {
            const u = Math.min(l, 1e3);
            await oi(u), l -= u;
          }
          if (!n.active) break;
          await s();
        }
      })().catch((l) => {
        n.active = !1, n.lostReason = n.lostReason || "lease_renew_failed", this.logger.error("scheduled.lease_keepalive", l, {
          leaseToken: e,
          backend: r || "unknown",
          lostReason: n.lostReason
        });
      })
    };
  }
  async #p(o, e, t) {
    const r = this.service.getDB(e), a = this.service.getKV(e);
    if (!a && !r) return;
    const n = { db: r }, s = await Re(e), i = Oe(s?.scheduleUtcOffsetMinutes), c = o?.scheduledTime !== void 0 ? new Date(o.scheduledTime) : /* @__PURE__ */ new Date(), l = Xo(c, i), u = (w = /* @__PURE__ */ new Date()) => Xo(w, i), d = le(s?.scheduledLeaseMs, F.Defaults.ScheduledLeaseMs, F.Defaults.ScheduledLeaseMinMs, 900 * 1e3), f = `${H()}-${Math.random().toString(36).slice(2, 10)}`, m = this.#l(f), p = async (w) => {
      const D = String(w || "db_unavailable").trim() || "db_unavailable";
      await m(this.service.patchOpsStatus(e, this.#u(l, D, "d1")), "patch_skipped_status", {
        reason: D,
        backend: "d1"
      }, null);
    };
    if (!r) {
      await p("db_not_configured");
      return;
    }
    const h = await this.service.tryAcquireScheduledLeaseWithDb(r, {
      token: f,
      leaseMs: d
    });
    if (!h.acquired) {
      const w = String(h.reason || "lease_not_acquired");
      if (w === "db_not_configured" || w === "db_unavailable" || w === "db_init_failed") {
        await p(w);
        return;
      }
      await m(this.service.patchOpsStatus(e, this.#a(l, h, w)), "patch_busy_status", { reason: w }, null);
      return;
    }
    const g = String(h.backend || h.lock?.backend || "").trim().toLowerCase(), { leaseState: y, ensureActive: _, keepalivePromise: S } = this.#m({
      leaseStores: n,
      leaseToken: f,
      scheduledLeaseMs: d,
      leaseBackend: g,
      initialLock: h.lock || null
    }), A = l;
    await m(this.service.patchOpsStatus(e, this.#d(A, f, y, d)), "patch_running_status", { startedAt: A }, null);
    const E = {
      status: "success",
      lastStartedAt: A,
      lastFinishedAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastError: null,
      d1Tidy: {},
      cleanup: {},
      kvTidy: {},
      tgDailyReport: {},
      alerts: {}
    }, T = () => u(/* @__PURE__ */ new Date());
    try {
      const w = s || {}, D = await m(this.service.getOpsStatusSection(e, "scheduled"), "read_previous_status", null, {});
      if (r) try {
        await _();
        const M = st(c, w.scheduleUtcOffsetMinutes), C = M.dateKey, I = M.startTs, P = M.endTs, U = Oe(w.scheduleUtcOffsetMinutes), V = this.service.getPreviousD1TidyState(D), j = await this.service.tidyD1Data(e, {
          db: r,
          kv: a,
          ctx: t,
          config: w,
          mode: "scheduled",
          maintenanceMode: "smart",
          previousScheduledState: D,
          previousCleanupStatus: V,
          scheduledNow: c,
          dayWindow: M,
          statsBucketDate: C,
          statsStartTs: I,
          statsEndTs: P,
          statsUtcOffsetMinutes: U,
          beforeEachStep: _
        }), K = T(), q = this.service.buildD1TidyStatusPayload(j.summary, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: K
        });
        E.d1Tidy = q.d1Tidy, E.cleanup = q.cleanup, (E.d1Tidy.status === "partial_failure" || E.d1Tidy.status === "failed") && (E.status = "partial_failure"), await _();
      } catch (M) {
        E.status = "partial_failure";
        const C = this.service.buildD1TidyStatusPayload({
          status: "failed",
          lastError: M?.message || String(M),
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: T()
        });
        E.d1Tidy = C.d1Tidy, E.cleanup = C.cleanup, this.logger.error("Scheduled DB Cleanup Error: ", M);
      }
      else {
        const M = this.service.buildD1TidyStatusPayload({
          status: "skipped",
          reason: "db_not_configured",
          maintenanceMode: "smart"
        }, {
          mode: "scheduled",
          maintenanceMode: "smart",
          triggeredBy: "scheduled",
          timestamp: T()
        });
        E.d1Tidy = M.d1Tidy, E.cleanup = M.cleanup;
      }
      try {
        await _();
        const M = await this.service.snapshotCfDailyTrafficArchive(e, {
          config: w,
          nowMs: c.getTime()
        });
        E.cfTrafficArchive = {
          status: String(M?.status || "success"),
          storedCount: Math.max(0, Number(M?.storedCount) || 0),
          lastFinishedAt: T()
        }, M?.status === "partial_failure" && (E.status = this.#e(E.status));
      } catch (M) {
        E.status = this.#e(E.status), E.cfTrafficArchive = {
          status: "failed",
          lastError: M?.message || String(M),
          lastFinishedAt: T()
        }, this.logger.error("Scheduled CF traffic archive Error: ", M);
      }
      E.kvTidy = {
        ...this.#t(D, "kvTidy"),
        mode: "manual_only",
        lastAutoSkipAt: T(),
        autoSkipReason: "manual_only"
      };
      const { tgBotToken: k, tgChatId: b } = w, N = this.#t(D, "tgDailyReport", "report"), R = this.#t(D, "alerts"), x = Dt(w.tgDailyReportClockTimes, F.Defaults.TgDailyReportClockTimes), O = Yl(N, x, i, c), L = zi(w, w), v = {
        ...N,
        clockTimes: x,
        reportKinds: L
      };
      if (w.tgDailyReportEnabled === !0) {
        let M = this.#o(O.fixedQueue);
        if (!L.length) E.tgDailyReport = this.#r(v, T(), "report_kinds_disabled", { fixedQueue: M });
        else if (!k || !b) E.tgDailyReport = this.#r(v, T(), "telegram_not_configured", { fixedQueue: M });
        else if (O.due !== !0) E.tgDailyReport = this.#r(v, T(), O.reason || "time_not_matched", { fixedQueue: M });
        else {
          let C = [], I = null, P = 0;
          for (const U of O.dueSlots) try {
            await _();
            const V = await this.service.sendDailyTelegramReport(e, {
              now: c,
              reportKinds: L
            });
            P += Number(V?.sentCount) || 0, C.push(U), M = this.#s(M, O.context.dateKey, U);
          } catch (V) {
            I = V, this.logger.error("Scheduled Daily Report Error: ", V);
            break;
          }
          I ? (E.status = this.#e(E.status), E.tgDailyReport = this.#c(v, T(), I?.message || String(I), {
            fixedQueue: M,
            processedSlots: C
          })) : E.tgDailyReport = this.#i(v, T(), {
            fixedQueue: M,
            sentCount: P,
            ...this.#n(O.context.dateKey, C)
          });
        }
      } else E.tgDailyReport = this.#r(v, T(), "disabled", { fixedQueue: O.fixedQueue });
      try {
        await _();
        const M = await this.service.maybeSendRuntimeAlerts(e, E), C = T();
        E.alerts = M.sent === !0 ? this.#i(R, C, {
          lastPolledAt: C,
          lastSkippedAt: R.lastSkippedAt || "",
          issueCount: Number(M.issueCount) || 0,
          reason: M.reason || "alert_sent"
        }) : this.#r(R, C, M.reason || "no_alerts", {
          lastPolledAt: C,
          lastSuccessAt: R.lastSuccessAt || "",
          issueCount: Number(M.issueCount) || 0
        });
      } catch (M) {
        E.status = this.#e(E.status);
        const C = T();
        E.alerts = this.#c(R, C, M?.message || String(M), { lastPolledAt: C }), this.logger.error("Scheduled Alert Error: ", M);
      }
    } catch (w) {
      E.status = "failed", E.lastErrorAt = T(), E.lastError = w?.message || String(w), this.logger.error("Scheduled Task Error: ", w);
    } finally {
      y.active = !1, await S;
      const w = T();
      E.lastFinishedAt = w, E.status === "success" && (E.lastSuccessAt = w);
      const D = y.lostReason ? !1 : await m(this.service.releaseScheduledLease(n, f, { backend: g }), "release_lease", { backend: g }, !1);
      E.lock = this.#f(y, w, D), await m(this.service.patchOpsStatus(e, { scheduled: E }), "patch_final_status", {
        finishedAt: w,
        finalStatus: E.status,
        leaseLostReason: y.lostReason || ""
      }, null);
    }
  }
};
function Xp(o = {}, e = {}) {
  return {
    sanitizeHeaders(t) {
      if (!t || typeof t != "object" || Array.isArray(t)) return {};
      const r = {};
      for (const [a, n] of Object.entries(t)) {
        const s = String(a || "").trim();
        s && (Kn.has(s.toLowerCase()) || (r[s] = String(n ?? "")));
      }
      return r;
    },
    normalizeTargets(t) {
      const r = String(t || "").split(",").map((n) => n.trim()).filter(Boolean);
      if (!r.length) return null;
      const a = [];
      for (const n of r) {
        const s = ls(n);
        if (!s) return null;
        a.push(s);
      }
      return a.length ? a.join(",") : null;
    },
    normalizeSingleTarget(t) {
      const r = e.normalizeTargets(t);
      if (!r) return null;
      const [a] = r.split(",").map((n) => n.trim()).filter(Boolean);
      return a || null;
    },
    normalizeTargetPort(t) {
      const r = String(t ?? "").trim();
      if (!r) return "";
      if (!/^\d{1,5}$/.test(r)) return null;
      const a = Number(r);
      return !Number.isInteger(a) || a < 1 || a > 65535 ? null : String(a);
    },
    buildTargetWithPort(t, r = "", a = "") {
      return ls(t, r, a);
    },
    buildDefaultLineName(t) {
      return `线路${Number(t) + 1}`;
    },
    normalizeLineId(t, r = 0) {
      return String(t || "").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || `line-${Number(r) + 1}`;
    },
    parseLatencyMs(t) {
      if (t === "" || t === null || t === void 0) return null;
      const r = Number(t);
      return !Number.isFinite(r) || r < 0 ? null : Math.round(r);
    },
    normalizeIsoDatetime(t) {
      if (!t) return "";
      const r = new Date(t);
      return Number.isFinite(r.getTime()) ? r.toISOString() : "";
    },
    normalizeLines(t, r = "", a = "") {
      const n = String(e.normalizeTargets(r) || "").split(",").map((d) => d.trim()).filter(Boolean), s = e.normalizeTargetPort(a), i = s === null ? "" : s, c = Array.isArray(t) && t.length ? t : n.map((d, f) => ({
        id: `line-${f + 1}`,
        name: e.buildDefaultLineName(f),
        target: d
      }));
      if (!c.length) return [];
      const l = [], u = /* @__PURE__ */ new Set();
      return c.forEach((d, f) => {
        const m = d && typeof d == "object" && !Array.isArray(d) ? d : { target: d };
        let p = e.normalizeSingleTarget(e.buildTargetWithPort(m?.target, m?.port, i));
        if (!p && n[f] && (p = e.normalizeSingleTarget(e.buildTargetWithPort(n[f], m?.port, i))), !p) return;
        const h = e.normalizeLineId(m?.id, f);
        let g = h, y = 2;
        for (; u.has(g); )
          g = `${h}-${y}`, y += 1;
        u.add(g), l.push({
          id: g,
          name: String(m?.name || "").trim() || e.buildDefaultLineName(f),
          target: p
        });
      }), l;
    },
    resolveActiveLineId(t, r, a = [], n = "") {
      if (!Array.isArray(r) || !r.length) return "";
      const s = String(t || "").trim();
      if (s && r.some((i) => i.id === s)) return s;
      if (Array.isArray(a)) for (const i of a) {
        if (!i || typeof i != "object" || Array.isArray(i) || i.enabled !== !0) continue;
        const c = String(i.id || "").trim();
        if (c && r.some((d) => d.id === c)) return c;
        const l = e.normalizeSingleTarget(e.buildTargetWithPort(i.target, i.port, n));
        if (!l) continue;
        const u = r.find((d) => d.target === l);
        if (u) return u.id;
      }
      return r[0].id;
    },
    buildLegacyTargetFromLines(t = []) {
      return (Array.isArray(t) ? t : []).map((r) => String(r?.target || "").trim()).filter(Boolean).join(",");
    },
    getActiveNodeLine(t) {
      const r = Array.isArray(t?.lines) ? t.lines : [];
      if (!r.length) return null;
      const a = String(t?.activeLineId || "").trim();
      return r.find((n) => n.id === a) || r[0];
    },
    getOrderedNodeLines(t) {
      const r = Array.isArray(t?.lines) ? t.lines.slice() : [];
      if (r.length <= 1) return r;
      const a = e.getActiveNodeLine(t);
      return a ? [a, ...r.filter((n) => n.id !== a.id)] : r;
    },
    sortNodeLinesByLatency(t = []) {
      return (Array.isArray(t) ? t : []).map((r, a) => ({
        line: r,
        index: a
      })).sort((r, a) => {
        const n = Number.isFinite(r.line?.latencyMs) ? r.line.latencyMs : Number.POSITIVE_INFINITY, s = Number.isFinite(a.line?.latencyMs) ? a.line.latencyMs : Number.POSITIVE_INFINITY;
        return n !== s ? n - s : r.index - a.index;
      }).map((r) => r.line);
    },
    isPingCacheFresh(t, r) {
      const a = Number(t?.latencyMs), n = Date.parse(String(t?.latencyUpdatedAt || ""));
      if (!Number.isFinite(a) || !Number.isFinite(n)) return !1;
      const s = Math.max(0, Number(r) || 0) * 60 * 1e3;
      return s <= 0 ? !1 : H() - n < s;
    }
  };
}
function Mn(o = "") {
  const e = String(o || "").trim().toLowerCase();
  return e.startsWith("emby ") ? "emby" : e.startsWith("mediabrowser ") ? "mediabrowser" : "";
}
function Yp(o = "", e = "") {
  const t = String(o || "").trim();
  if (!t) return "";
  const r = t.replace(/^[^\s]+\s+/i, "").trim();
  return r ? e === "emby" ? `Emby ${r}` : e === "mediabrowser" ? `MediaBrowser ${r}` : t : t;
}
function sl(o = "") {
  const e = String(o || "").trim();
  if (!e) return {};
  const t = e.replace(/^[^\s]+\s+/i, "").trim();
  if (!t || !t.includes("=")) return {};
  const r = {}, a = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*(?:"([^"]*)"|([^,]+))/g;
  let n;
  for (; (n = a.exec(t)) !== null; ) {
    const s = String(n[1] || "").trim().toLowerCase(), i = String(n[2] !== void 0 ? n[2] : n[3] || "").trim();
    !s || !i || Object.prototype.hasOwnProperty.call(r, s) || (r[s] = i);
  }
  return r;
}
var il = /* @__PURE__ */ new Set([
  "apikey",
  "accesstoken",
  "token",
  "authorization",
  "xembytoken",
  "xembyauthorization",
  "xmediabrowsertoken",
  "xmediabrowserauthorization"
]), cl = /* @__PURE__ */ new Set([
  "deviceid",
  "xembydeviceid",
  "xmediabrowserdeviceid"
]);
function zs(o, e) {
  const t = o instanceof URL ? o : null;
  if (!t || !(e instanceof Set)) return !1;
  for (const r of t.searchParams.keys()) if (e.has(Ma(r))) return !0;
  return !1;
}
function ve(o, e = "") {
  if (o instanceof Headers) return o.get(e) || "";
  const t = String(e || "").trim().toLowerCase();
  for (const [r, a] of _n(o))
    if (String(r || "").trim().toLowerCase() === t)
      return String(a ?? "");
  return "";
}
function Jp(o = "") {
  const e = String(o ?? "").replace(/[\r\n]+/g, " ").trim();
  if (!e) return "";
  let t = "";
  for (const r of e) {
    const a = r.charCodeAt(0);
    if (a === 9 || a >= 32 && a <= 126 || a >= 160 && a <= 255) {
      t += r;
      continue;
    }
    t += encodeURIComponent(r);
  }
  return t;
}
function Qp(o) {
  const e = new Headers();
  for (const [t, r] of _n(o)) {
    const a = String(t || "").trim();
    if (!a) continue;
    const n = String(r ?? "");
    try {
      e.set(a, n);
    } catch {
      const s = Jp(n);
      if (!s) continue;
      try {
        e.set(a, s);
      } catch {
      }
    }
  }
  return e;
}
function Wo(o) {
  const e = {
    token: "",
    deviceId: ""
  };
  for (const t of ["X-Emby-Token", "X-MediaBrowser-Token"]) {
    const r = ve(o, t).trim();
    if (r) {
      e.token = r;
      break;
    }
  }
  for (const t of [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ]) {
    const r = ve(o, t).trim();
    if (!r) continue;
    const a = sl(r);
    if (!e.token && a.token && (e.token = a.token), !e.deviceId && a.deviceid && (e.deviceId = a.deviceid), !e.token) {
      const n = /^Bearer\s+(.+)$/i.exec(r);
      n?.[1] && (e.token = n[1].trim());
    }
  }
  if (!e.deviceId) for (const t of ["X-Emby-Device-Id"]) {
    const r = ve(o, t).trim();
    if (r) {
      e.deviceId = r;
      break;
    }
  }
  return e;
}
function Zp(o = "") {
  const e = String(o || "").trim();
  if (!e || /^Bearer\s+.+$/i.test(e)) return !0;
  const t = sl(e);
  return !!String(t.token || "").trim();
}
function Ra(o) {
  const e = Wo(o), t = [], r = [], a = zo(ve(o, "Cookie"), ma);
  if (a) {
    for (const d of Ta(a).keys())
      if (Lp(d)) {
        r.push("cookie");
        break;
      }
  }
  for (const d of jc) {
    const f = ve(o, d).trim();
    f && (Zp(f) || t.push(d));
  }
  for (const [d, f] of _n(o)) {
    const m = String(d || "").trim().toLowerCase(), p = String(f || "").trim();
    !m || !p || Xc(m) && t.push(m);
  }
  const n = [...new Set(t)], s = [...new Set(r)], i = !!String(e.token || "").trim() || !!String(e.deviceId || "").trim(), c = n.length > 0, l = s.length > 0, u = !c && !l;
  return {
    canDirect: u,
    reason: u ? "" : "direct_transport_incompatible",
    headerAuthHeaders: n,
    cookieAuthHeaders: s,
    hasQueryAuth: i,
    hasHeaderAuth: c,
    hasCookieAuth: l,
    auth: e
  };
}
function Go(o, e, t = "") {
  const r = o instanceof URL ? new URL(o.toString()) : new URL(String(o || "")), a = (e && typeof e == "object" && "auth" in e ? e : { auth: Wo(e) }).auth || {}, n = Bt(t), s = n === "jellyfin" ? ["ApiKey"] : n === "emby" ? ["api_key"] : ["api_key", "ApiKey"];
  if (a.token && !zs(r, il)) for (const i of s) r.searchParams.set(i, a.token);
  return a.deviceId && !zs(r, cl) && r.searchParams.set("DeviceId", a.deviceId), r;
}
function eg(o, e = "") {
  const t = String(e || "").trim().replace(/["\\]/g, "");
  return t ? `${o === "emby" ? "Emby" : "MediaBrowser"} Token="${t}"` : "";
}
function Ws(o, e = "auto") {
  const t = Bt(e);
  if (t === "passthrough") return o;
  const r = o.get("Authorization")?.trim() || "", a = o.get("X-Emby-Authorization")?.trim() || "", n = o.get("X-MediaBrowser-Authorization")?.trim() || "", s = Mn(r), i = Mn(n), c = Mn(a), l = t === "emby" ? "emby" : t === "jellyfin" ? "mediabrowser" : "";
  let u = s ? r : i ? n : c ? a : "";
  if (!u && l) {
    const d = ve(o, "X-Emby-Token").trim() || ve(o, "X-MediaBrowser-Token").trim() || ve(o, "X-Emby-Auth-Token").trim() || ve(o, "X-MediaBrowser-Auth-Token").trim(), f = /^Bearer\s+(.+)$/i.exec(r);
    u = eg(l, d || (f ? f[1] : ""));
  }
  return u && (u = Yp(u, l || s || i || c || ""), o.set("Authorization", u), o.set("X-Emby-Authorization", u), o.delete("X-MediaBrowser-Authorization")), o;
}
function Gs(o, e = {}) {
  if (!(o instanceof Headers)) return o;
  const t = e.dropTokenHeaders !== !1;
  return [
    "Authorization",
    "X-Emby-Authorization",
    "X-MediaBrowser-Authorization"
  ].forEach((r) => o.delete(r)), t && [
    "X-Emby-Token",
    "X-MediaBrowser-Token",
    "X-Emby-Auth-Token",
    "X-MediaBrowser-Auth-Token"
  ].forEach((r) => o.delete(r)), o;
}
function tg() {
  const o = {};
  for (const e of ["direct", "proxy"]) {
    o[e] = {};
    for (const t of [
      "none",
      "query",
      "header",
      "cookie"
    ]) {
      o[e][t] = {};
      for (const r of [
        "none",
        "same_origin",
        "external"
      ]) o[e][t][r] = {
        deliveryMode: e,
        authCarrier: t,
        redirectScope: r,
        clientVisibleRedirect: e === "direct" && r !== "none",
        workerFollowRedirect: e === "proxy",
        reasonCode: e === "direct" ? r === "none" ? "entry_direct" : "client_redirect" : "worker_follow_redirect"
      };
    }
  }
  return Object.freeze(o);
}
var rg = tg();
function js(o = {}) {
  const e = o && typeof o == "object" ? o : null, t = String(o?.corsOrigins || ""), r = String(o?.ipBlacklist || ""), a = String(o?.geoAllowlist || ""), n = String(o?.geoBlocklist || ""), s = e ? te.ProxyAccessRuleProfileCache.get(e) : null;
  if (s && s.corsOriginsRaw === t && s.ipBlacklistRaw === r && s.geoAllowlistRaw === a && s.geoBlocklistRaw === n) return s;
  const i = (u, d = !1) => {
    const f = [], m = /* @__PURE__ */ new Set();
    for (const p of u.split(",")) {
      const h = p.trim(), g = d ? h.toUpperCase() : h;
      !g || m.has(g) || (m.add(g), f.push(g));
    }
    return {
      values: f,
      valueSet: m
    };
  }, c = i(t), l = {
    corsOriginsRaw: t,
    ipBlacklistRaw: r,
    geoAllowlistRaw: a,
    geoBlocklistRaw: n,
    corsOrigins: c.values,
    corsOriginSet: c.valueSet,
    ipBlacklist: i(r).valueSet,
    geoAllowlist: i(a, !0).valueSet,
    geoBlocklist: i(n, !0).valueSet
  };
  return e && te.ProxyAccessRuleProfileCache.set(e, l), l;
}
function ag(o = {}, e = {}) {
  const { persistCloudflareDnsRecordsForHost: t } = o;
  return {
    normalizeNode(r, a, n = {}) {
      const s = { ...a };
      let i = !1;
      const c = e.normalizeTargetPort(s.port), l = e.normalizeLines(s.lines, s.target, c || ""), u = e.resolveActiveLineId(s.activeLineId, l, Array.isArray(s.lines) ? s.lines : [], c || ""), d = e.buildLegacyTargetFromLines(l);
      JSON.stringify(l) !== JSON.stringify(Array.isArray(s.lines) ? s.lines : []) && (i = !0), String(s.activeLineId || "") !== u && (i = !0), String(s.target || "") !== d && (i = !0), s.lines = l, s.activeLineId = u, s.target = d, Object.prototype.hasOwnProperty.call(s, "port") && (delete s.port, i = !0), s.secret === void 0 && (s.secret = "", i = !0);
      const f = $r(s.tags, s.tag), m = f[0] || "";
      JSON.stringify(f) !== JSON.stringify(Array.isArray(s.tags) ? s.tags : []) && (i = !0), String(s.tag || "") !== m && (i = !0), s.tags = f, s.tag = m;
      const p = [["server", "Record"].join(""), ["media", "Aggregation"].join("")];
      for (const k of Object.keys(s).filter((b) => p.some((N) => b.startsWith(N))))
        delete s[k], i = !0;
      s.remark === void 0 && (s.remark = "", i = !0), s.tagColor === void 0 && (s.tagColor = "", i = !0), s.remarkColor === void 0 && (s.remarkColor = "", i = !0), s.displayName === void 0 && (s.displayName = "", i = !0);
      const h = s.tmdbAggregationEnabled === !0;
      s.tmdbAggregationEnabled !== h && (i = !0), s.tmdbAggregationEnabled = h;
      const g = nr(s.entryMode);
      String(s.entryMode || "") !== g && (i = !0), s.entryMode = g, g === "host_prefix" && String(s.secret ?? "") !== "" && (s.secret = "", i = !0);
      const y = g === "host_prefix" ? jt(s.hostPrefixCnameTarget) : "";
      String(s.hostPrefixCnameTarget || "") !== y && (i = !0), s.hostPrefixCnameTarget = y;
      const _ = Nr(s.playbackInfoMode);
      String(s.playbackInfoMode || "") !== _ && (i = !0), s.playbackInfoMode = _;
      const S = Bt(s.mediaAuthMode);
      String(s.mediaAuthMode || "") !== S && (i = !0), s.mediaAuthMode = S;
      const A = Dr(s.realClientIpMode);
      String(s.realClientIpMode || "") !== A && (i = !0), s.realClientIpMode = A;
      const E = ca(s.hedgeProbePath);
      String(s.hedgeProbePath || "") !== E && (i = !0), s.hedgeProbePath = E;
      const T = Hr(s);
      String(s.mainVideoStreamMode || "") !== T && (i = !0), s.mainVideoStreamMode = T;
      const w = xr(s.routingDecisionMode);
      if (String(s.routingDecisionMode || "") !== w && (i = !0), s.routingDecisionMode = w, Object.prototype.hasOwnProperty.call(s, "wangpanDirectMode") && (delete s.wangpanDirectMode, i = !0), Object.prototype.hasOwnProperty.call(s, "wangpanMode") && (delete s.wangpanMode, i = !0), n && typeof n == "object" && "dropLegacyDirectRouting" in n && n.dropLegacyDirectRouting === !0) for (const k of [...No, ...Io])
        Object.prototype.hasOwnProperty.call(s, k) && (delete s[k], i = !0);
      const D = e.sanitizeHeaders(s.headers);
      return JSON.stringify(D) !== JSON.stringify(s.headers || {}) && (i = !0), s.headers = D, delete s.videoThrottling, delete s.interceptMs, s.schemaVersion !== 6 && (s.schemaVersion = 6, i = !0), Object.prototype.hasOwnProperty.call(s, "createdAt") && (delete s.createdAt, i = !0), Object.prototype.hasOwnProperty.call(s, "updatedAt") && (delete s.updatedAt, i = !0), {
        data: s,
        changed: i
      };
    },
    buildComparableNodePayload(r = {}, a = {}) {
      if (!$(r)) return null;
      const n = { ...r };
      a.includeName !== !0 && delete n.name, delete n.createdAt, delete n.updatedAt;
      const s = (i) => {
        if (Array.isArray(i)) return i.map((c) => s(c));
        if ($(i)) {
          const c = {};
          for (const l of Object.keys(i).sort()) c[l] = s(i[l]);
          return c;
        }
        return i;
      };
      return s(n);
    },
    areNodePayloadsEquivalent(r = {}, a = {}, n = {}) {
      const s = e.buildComparableNodePayload(r, n), i = e.buildComparableNodePayload(a, n);
      return Z(s) === Z(i);
    },
    buildNodeRecord(r, a, n = {}) {
      let s = a?.headers !== void 0 ? a.headers : n.headers;
      if (typeof s == "string") try {
        s = JSON.parse(s);
      } catch {
        s = {};
      }
      const i = {};
      for (const p of ["proxyMode", "mode"]) {
        const h = a?.[p] !== void 0 ? a[p] : n[p];
        h !== void 0 && (i[p] = String(h || "").trim());
      }
      for (const p of [
        "direct",
        "sourceDirect",
        "directSource",
        "direct2xx"
      ]) a?.[p] !== void 0 ? i[p] = a[p] === !0 : n[p] !== void 0 && (i[p] = n[p] === !0);
      const c = Array.isArray(a?.lines) ? a.lines : a?.target !== void 0 ? [] : n.lines, l = a?.target !== void 0 ? a.target : n.target, u = a?.port !== void 0 ? a.port : n.port, d = e.normalizeLines(c, l, u);
      if (!d.length) return null;
      const f = e.resolveActiveLineId(a?.activeLineId !== void 0 ? a.activeLineId : n.activeLineId, d, Array.isArray(a?.lines) ? a.lines : n.lines, u), m = a?.mainVideoStreamMode !== void 0 ? a.mainVideoStreamMode : a?.wangpanDirectMode !== void 0 ? a.wangpanDirectMode : a?.wangpanMode;
      return e.normalizeNode(r, {
        target: e.buildLegacyTargetFromLines(d),
        lines: d,
        activeLineId: f,
        ...i,
        entryMode: a?.entryMode !== void 0 ? nr(a.entryMode) : nr(n.entryMode),
        hostPrefixCnameTarget: a?.hostPrefixCnameTarget !== void 0 ? a.hostPrefixCnameTarget : n.hostPrefixCnameTarget,
        secret: a?.secret !== void 0 ? a.secret : n.secret || "",
        tag: a?.tag !== void 0 ? a.tag : n.tag || "",
        tags: a?.tags !== void 0 ? a.tags : a?.tag !== void 0 ? [a.tag, ...$r(n.tags, n.tag).filter((p) => p.toLowerCase() !== String(n.tag || "").trim().toLowerCase())] : n.tags,
        remark: a?.remark !== void 0 ? a.remark : n.remark || "",
        tagColor: a?.tagColor !== void 0 ? String(a.tagColor || "").trim() : n.tagColor || "",
        remarkColor: a?.remarkColor !== void 0 ? String(a.remarkColor || "").trim() : n.remarkColor || "",
        displayName: a?.displayName !== void 0 ? String(a.displayName || "").trim() : n.displayName || "",
        tmdbAggregationEnabled: a?.tmdbAggregationEnabled !== void 0 ? a.tmdbAggregationEnabled === !0 : n.tmdbAggregationEnabled === !0,
        playbackInfoMode: a?.playbackInfoMode !== void 0 ? Nr(a.playbackInfoMode) : Nr(n.playbackInfoMode),
        mediaAuthMode: a?.mediaAuthMode !== void 0 ? Bt(a.mediaAuthMode) : Bt(n.mediaAuthMode),
        realClientIpMode: a?.realClientIpMode !== void 0 ? Dr(a.realClientIpMode) : Dr(n.realClientIpMode),
        hedgeProbePath: a?.hedgeProbePath !== void 0 ? ca(a.hedgeProbePath) : ca(n.hedgeProbePath),
        routingDecisionMode: a?.routingDecisionMode !== void 0 ? xr(a.routingDecisionMode) : xr(n.routingDecisionMode),
        mainVideoStreamMode: m !== void 0 ? cn(m) : Hr(n),
        headers: e.sanitizeHeaders(s),
        schemaVersion: 6
      }).data;
    },
    buildHostPrefixDnsRecordHost(r = "", a = "") {
      const n = String(r || "").trim().toLowerCase(), s = re(a);
      return !s || !wa(n) ? "" : `${n}.${s}`;
    },
    buildHostPrefixDnsSyncPlan(r = "", a = null, n = "", s = null, i = "", c = {}) {
      const l = re(i), u = a && Ye(a?.entryMode) ? e.buildHostPrefixDnsRecordHost(r, l) : "", d = s && Ye(s?.entryMode) ? e.buildHostPrefixDnsRecordHost(n, l) : "", f = u ? Wa(a, c.previousConfig || c.config || {}, l) : "", m = d ? Wa(s, c.nextConfig || c.config || {}, l) : "", p = [], h = [];
      return u && u !== d && p.push({
        type: "delete",
        host: u
      }), d && (c.forceUpsert === !0 || d !== u || m !== f) && p.push({
        type: "upsert",
        host: d,
        cnameTarget: m
      }), d && d !== u && h.push({
        type: "delete",
        host: d
      }), u && u !== d ? h.push({
        type: "upsert",
        host: u,
        cnameTarget: f
      }) : u && m !== f && h.push({
        type: "upsert",
        host: u,
        cnameTarget: f
      }), {
        hostRoot: l,
        previousDnsHost: u,
        nextDnsHost: d,
        previousCnameTarget: f,
        nextCnameTarget: m,
        steps: p,
        rollbackSteps: h,
        changed: p.length > 0
      };
    },
    buildPreparedNodeMutation(r = {}, a = {}, n = {}) {
      const s = String(n.nextName || r?.name || "").trim().toLowerCase();
      if (!s) return null;
      const i = String(n.previousName || r?.originalName || s).trim().toLowerCase() || s, c = e.buildNodeRecord(s, r, a);
      if (!c) return null;
      const l = $(a) && Object.keys(a).length ? e.normalizeNode(i, a || {}).data : null, u = i !== s, d = !u && !!l && e.areNodePayloadsEquivalent(l, c);
      return {
        previousName: i,
        previousNode: l,
        nextName: s,
        nextNode: c,
        isRename: u,
        nodeChanged: u || !d,
        isSemanticNoop: d,
        dnsPlan: null
      };
    },
    async upsertHostPrefixDnsRecord(r = "", a = {}) {
      const n = re(r);
      if (!n) return null;
      const s = a.config || await Re(a.env), i = ia(s, a.env), c = jt(a.cnameTarget) || re(i.host);
      return await t({
        env: a.env,
        kv: a.kv,
        config: s,
        host: n,
        mode: "cname",
        desiredRecords: [{
          type: "CNAME",
          content: c,
          ttl: 1,
          proxied: !1
        }],
        requestHost: re(a.requestHost || i.host),
        skipHistory: a.skipHistory === !0,
        includeAllRecords: !1
      });
    },
    async deleteHostPrefixDnsRecord(r = "", a = {}) {
      const n = re(r);
      if (!n) return null;
      const s = ia(a.config || await Re(a.env), a.env), i = String(s.cfZoneId || "").trim(), c = String(s.cfApiToken || "").trim(), l = await Oo(i, c, { scope: "node.host_prefix_dns_delete.zone_lookup" }), u = String(l?.name || "").trim();
      if (u && !fa(n, u)) throw we("INVALID_HOST", "当前子域不在 Cloudflare Zone 下", 400, {
        host: n,
        zoneName: u
      });
      const d = (await vr(i, c, { nameExact: n })).filter((m) => re(m?.name) === n && String(m?.type || "").trim().toUpperCase() === "CNAME");
      if (!d.length) return {
        ok: !0,
        deletedCount: 0,
        host: n
      };
      const f = Mc(i, c, n, `https://api.cloudflare.com/client/v4/zones/${encodeURIComponent(i)}/dns_records`, d[0] || {
        name: n,
        ttl: 1,
        proxied: !1
      });
      for (const m of d) await f.deleteRecord(m);
      return {
        ok: !0,
        deletedCount: d.length,
        host: n
      };
    },
    async persistHostPrefixDnsSyncPlan(r = {}, a = {}) {
      const n = Array.isArray(r?.steps) ? r.steps : [];
      if (!n.length) return null;
      ia(a.config || await Re(a.env), a.env);
      for (const s of n) {
        if (String(s?.type || "").trim().toLowerCase() === "delete") {
          await e.deleteHostPrefixDnsRecord(s.host, a);
          continue;
        }
        String(s?.type || "").trim().toLowerCase() === "upsert" && await e.upsertHostPrefixDnsRecord(s.host, {
          ...a,
          cnameTarget: s.cnameTarget
        });
      }
      return {
        changed: !0,
        stepCount: n.length
      };
    },
    async applyPreparedNodeMutation(r = {}, a = {}) {
      const n = a.kv;
      if (!n || r?.nodeChanged !== !0) return !1;
      const s = String(r?.previousName || "").trim().toLowerCase(), i = String(r?.nextName || "").trim().toLowerCase();
      return r?.nextNode ? await n.put(`${e.PREFIX}${i}`, JSON.stringify(r.nextNode)) : i && await n.delete(`${e.PREFIX}${i}`), s && i && s !== i && await n.delete(`${e.PREFIX}${s}`), e.invalidateNodeCaches([s, i], {
        invalidateList: !0,
        kv: n
      }), !0;
    },
    async rollbackPreparedNodeMutation(r = {}, a = {}) {
      const n = a.kv;
      if (!n || r?.nodeChanged !== !0) return !1;
      const s = String(r?.previousName || "").trim().toLowerCase(), i = String(r?.nextName || "").trim().toLowerCase();
      return s && (r?.previousNode ? await n.put(`${e.PREFIX}${s}`, JSON.stringify(r.previousNode)) : await n.delete(`${e.PREFIX}${s}`)), i && i !== s && await n.delete(`${e.PREFIX}${i}`), e.invalidateNodeCaches([s, i], {
        invalidateList: !0,
        kv: n
      }), !0;
    },
    async rollbackPreparedNodeMutations(r = [], a = {}) {
      const n = a.kv;
      if (!n) return { rolledBackNodeCount: 0 };
      const s = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!s.length) return { rolledBackNodeCount: 0 };
      const i = s.some((u) => u?.dnsPlan?.changed === !0) ? a.config || await Re(a.env) : null;
      let c = 0;
      const l = [];
      for (let u = s.length - 1; u >= 0; u -= 1) {
        const d = s[u];
        if (d?.dnsPlan?.changed === !0) try {
          await e.persistHostPrefixDnsSyncPlan({ steps: d?.dnsPlan?.rollbackSteps || [] }, {
            ...a,
            config: i,
            skipHistory: !0
          });
        } catch (f) {
          l.push(`dns:${se(f, "rollback_failed")}`);
        }
        if (d?.nodeChanged === !0) try {
          await e.rollbackPreparedNodeMutation(d, a), c += 1;
        } catch (f) {
          l.push(`node:${se(f, "rollback_failed")}`);
        }
      }
      if (a.rebuildIndexes === !0) try {
        await e.rebuildNodeIndexesFromKv(n, {
          ctx: a.ctx,
          syncLegacyIndex: !0
        });
      } catch (u) {
        l.push(`rebuild_indexes:${se(u, "rollback_failed")}`);
      }
      if (l.length > 0) throw new Error(l.join("; "));
      return { rolledBackNodeCount: c };
    },
    async applyPreparedNodeMutations(r = [], a = {}) {
      if (!a.kv) return { mutatedNodeCount: 0 };
      const n = (Array.isArray(r) ? r : []).filter(Boolean);
      if (!n.length) return { mutatedNodeCount: 0 };
      const s = n.some((f) => f?.dnsPlan?.changed === !0) ? await Re(a.env) : null;
      let i = 0;
      const c = [];
      let l = !1, u = !0, d = "";
      try {
        for (const f of n)
          c.push(f), f?.nodeChanged === !0 && (await e.applyPreparedNodeMutation(f, a), i += 1), f?.dnsPlan?.changed === !0 && await e.persistHostPrefixDnsSyncPlan(f.dnsPlan, {
            ...a,
            config: s
          });
        return { mutatedNodeCount: i };
      } catch (f) {
        l = c.length > 0;
        try {
          await e.rollbackPreparedNodeMutations(c, {
            ...a,
            config: s,
            rebuildIndexes: !1
          });
        } catch (m) {
          u = !1, d = se(m, "rollback_failed");
        }
        throw f && typeof f == "object" && (String(f.code || "").trim() || (f.code = "NODE_MUTATION_FAILED"), f.status = Ne(f.status, 500), f.details = {
          ...$(f.details) ? f.details : {},
          rollbackAttempted: l,
          rollbackSucceeded: u,
          rollbackError: d
        }), f;
      }
    }
  };
}
function ng(o = {}, e = {}) {
  return {
    async pingTarget(t, r) {
      const a = H(), n = Iu, s = (m = {}) => ({
        ok: m.ok === !0,
        reason: String(m.reason || "network_error"),
        statusCode: Number.isInteger(m.statusCode) ? m.statusCode : null,
        elapsedMs: Math.max(0, H() - a),
        methodUsed: m.methodUsed === "HEAD" || m.methodUsed === "GET" ? m.methodUsed : null,
        probePath: n
      }), i = pn(String(t || "").trim());
      if (!i) return s({ reason: "invalid_target" });
      const c = $c(i, n);
      if (!c) return s({ reason: "invalid_target" });
      const l = new AbortController();
      let u = !1;
      const d = "GET", f = setTimeout(() => {
        u = !0, l.abort();
      }, r);
      try {
        const m = await Be(c.toString(), {
          method: "GET",
          signal: l.signal
        }), p = Number(m.status);
        try {
          m.body?.cancel?.();
        } catch {
        }
        const h = p >= 200 && p < 400;
        return s({
          ok: h,
          reason: h ? p < 300 ? "ok" : "redirect" : "http_error",
          statusCode: p,
          methodUsed: d
        });
      } catch (m) {
        const p = [
          m?.name,
          m?.message,
          m?.cause?.name,
          m?.cause?.message
        ].map((g) => String(g || "")).join(" "), h = /\b(?:tls|ssl|x509|certificate|handshake)\b/i.test(p);
        return s({
          reason: u ? "timeout" : h ? "tls_error" : "network_error",
          methodUsed: d
        });
      } finally {
        clearTimeout(f);
      }
    },
    async getNode(t, r, a) {
      t = String(t).toLowerCase();
      const n = e.getKV(r);
      if (!n) return null;
      const s = Se(n), i = Pe(t, s), c = s.NodeCache.get(t);
      if (c && c.exp > Date.now()) {
        const u = await e.getNodesRevision(n), d = String(c?.nodesRevision || "").trim();
        if (Pe(t, s) === i && (!d || !u || d === u))
          return Za(s.NodeCache, t), c.data;
        Pe(t, s) === i && s.NodeCache.delete(t);
      }
      const l = Pe(t, s);
      return await fn(s.SingleFlightTasks, ct([
        "proxy_node",
        t,
        l
      ]), async () => {
        try {
          const u = await n.get(`${e.PREFIX}${t}`, { type: "json" });
          if (Pe(t, s) !== l) return null;
          if (!u) {
            const h = await e.getNodesSummaryIndex(n, { ctx: a });
            if (Array.isArray(h)) if (h.some((g) => String(g?.name || "").toLowerCase().trim() === t)) {
              const g = e.rebuildNodeIndexesFromKv(n, { ctx: a });
              a ? a.waitUntil(g) : await g;
            } else {
              const g = await e.getNodesRevision(n);
              Pe(t, s) === l && Ie(s.NodeCache, t, {
                data: null,
                exp: Date.now() + F.Defaults.NodeMissCacheTtlMs,
                nodesRevision: g
              }, F.Defaults.NodeCacheMax);
            }
            return null;
          }
          const { data: d, changed: f } = e.normalizeNode(t, u);
          if (Qe(t, d))
            return s.NodeCache.delete(t), s.PlaybackRouteHotCache.delete(t), d;
          if (f) {
            const h = n.put(`${e.PREFIX}${t}`, JSON.stringify(d));
            a ? a.waitUntil(h) : await h;
          }
          const m = e.upsertNodeSummaryEntry(t, d, {
            kv: n,
            ctx: a
          });
          let p = await e.getNodesRevision(n);
          return p ? a ? a.waitUntil(m) : await m : (await m, p = await e.getNodesRevision(n)), Pe(t, s) !== l ? null : (Ie(s.NodeCache, t, {
            data: d,
            exp: Date.now() + F.Defaults.CacheTTL,
            nodesRevision: p
          }, F.Defaults.NodeCacheMax), d);
        } catch {
          return null;
        }
      });
    },
    async getNodeForRead(t, r) {
      t = String(t).toLowerCase();
      const a = e.getKV(r);
      if (!a) return null;
      const n = Se(a), s = Pe(t, n), i = n.NodeCache.get(t);
      if (i?.data === null) n.NodeCache.delete(t);
      else if (i && i.exp > Date.now()) {
        const l = await e.getNodesRevision(a), u = String(i?.nodesRevision || "").trim();
        if (Pe(t, n) === s && (!u || !l || u === l))
          return Za(n.NodeCache, t), i.data;
        Pe(t, n) === s && n.NodeCache.delete(t);
      }
      const c = Pe(t, n);
      try {
        const l = await a.get(`${e.PREFIX}${t}`, { type: "json" });
        if (Pe(t, n) !== c || !l) return null;
        const u = e.normalizeNode(t, l).data;
        if (Qe(t, u))
          return n.NodeCache.delete(t), n.PlaybackRouteHotCache.delete(t), u;
        const d = await e.getNodesRevision(a);
        return Pe(t, n) !== c ? null : (Ie(n.NodeCache, t, {
          data: u,
          exp: Date.now() + F.Defaults.CacheTTL,
          nodesRevision: d
        }, F.Defaults.NodeCacheMax), u);
      } catch {
        return null;
      }
    },
    normalizeAdminActionRequest(t) {
      if (!t || typeof t != "object" || Array.isArray(t)) return null;
      const r = t.payload && typeof t.payload == "object" && !Array.isArray(t.payload) ? { ...t.payload } : null, a = String(t.action ?? r?.action ?? "").trim(), n = t.meta && typeof t.meta == "object" && !Array.isArray(t.meta) ? { ...t.meta } : {};
      return {
        action: a,
        data: r ? {
          ...r,
          action: a,
          meta: n
        } : {
          ...t,
          action: a,
          meta: n
        },
        meta: n
      };
    }
  };
}
function og(o = {}, e = {}) {
  return {
    ...Xp(o, e),
    ...ag(o, e),
    ...ng(o, e)
  };
}
var Pn = "proxy_logs_fts";
function sg(o = {}) {
  const e = {
    buildResponse(t = {}) {
      return ee(t);
    },
    buildRange(t, r) {
      return {
        startDate: new Date(t).toISOString(),
        endDate: new Date(r).toISOString()
      };
    },
    normalizeRequest(t = {}) {
      const { page: r = 1, pageSize: a = 50, filters: n = {} } = t, s = Math.max(1, parseInt(r, 10) || 1), i = Math.min(200, Math.max(1, parseInt(a, 10) || 50)), c = String(t?.paginationMode || "").trim().toLowerCase(), l = Zi(t?.pageCursor), u = c !== "offset" && (s === 1 || !!l), d = (s - 1) * i, f = Date.now(), m = F.Defaults.LogQueryDefaultDays * 24 * 60 * 60 * 1e3, p = (_) => {
        if (!_) return null;
        const S = new Date(String(_)).getTime();
        return Number.isFinite(S) ? S : null;
      }, h = (_) => {
        if (!_) return null;
        const S = /* @__PURE__ */ (/* @__PURE__ */ new Date(String(_) + "T23:59:59.999")).getTime();
        return Number.isFinite(S) ? S : null;
      };
      let g = p(n.startDate), y = h(n.endDate);
      return Number.isFinite(y) || (y = f), Number.isFinite(g) || (g = Math.max(0, y - m)), g > y && ([g, y] = [Math.max(0, y - m), y]), {
        filters: n,
        safePage: s,
        safePageSize: i,
        requestedPageCursor: l,
        useSeekPagination: u,
        offset: d,
        startTs: g,
        endTs: y
      };
    },
    resolveSearch(t = {}, r = {}, a = {}) {
      const n = String(t.searchMode || "").trim().toLowerCase(), s = n === "fts" || n === "like";
      let i = Yi(t.searchMode || r.logSearchMode), c = "";
      if (i === "fts" && a.ftsReady !== !0) {
        if (s) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化日志表”", 400, {
          searchMode: "fts",
          effectiveSearchMode: "fts",
          searchFallbackReason: ""
        }) };
        i = "like", c = "fts_not_ready";
      }
      return {
        effectiveSearchMode: i,
        searchFallbackReason: c
      };
    },
    buildBasePayload(t = {}, r = {}, a = {}) {
      return {
        page: t.safePage,
        pageSize: t.safePageSize,
        paginationMode: t.useSeekPagination ? "seek" : "offset",
        pageCursor: t.requestedPageCursor,
        revisions: { logsRevision: r.revision },
        range: e.buildRange(t.startTs, t.endTs),
        ...a
      };
    },
    buildDisabledResponse(t = {}, r = {}, a = "", n = "") {
      return e.buildResponse(e.buildBasePayload(t, r, {
        logs: [],
        total: 0,
        totalPages: 1,
        searchMode: a,
        effectiveSearchMode: a,
        searchFallbackReason: n,
        totalExact: !0,
        hasPrevPage: !1,
        hasNextPage: !1,
        nextCursor: null,
        disabled: !0
      }));
    },
    buildSuccessResponse(t = {}, r = {}, a = {}) {
      return e.buildResponse(e.buildBasePayload(t, r, {
        logs: a.logs,
        total: a.total,
        totalPages: a.totalPages,
        searchMode: a.searchMode,
        effectiveSearchMode: a.effectiveSearchMode,
        searchFallbackReason: a.searchFallbackReason,
        totalExact: t.useSeekPagination !== !0,
        hasPrevPage: a.hasPrevPage,
        hasNextPage: a.hasNextPage,
        nextCursor: a.nextCursor
      }));
    },
    buildDisplayState(t = {}) {
      return {
        displayClientIp: t.logDisplayClientIp !== !1,
        displayColo: t.logDisplayColo !== !1,
        displayUa: t.logDisplayUa !== !1
      };
    },
    buildSqlPlan(t = {}, r = {}, a = {}, n = "") {
      const { startTs: s, endTs: i } = r, c = e.buildDisplayState(a), l = kd(t.requestGroup), u = Hd(t.statusGroup), d = ["proxy_logs.timestamp >= ?", "proxy_logs.timestamp <= ?"], f = [s, i], m = (E, ...T) => {
        d.push(E), T.length > 0 && f.push(...T);
      }, p = "LOWER(proxy_logs.request_path)", h = String(t.keyword || "").trim();
      let g = !1;
      if (h) {
        const E = F.Defaults.LogKeywordMaxWindowDays * 24 * 60 * 60 * 1e3;
        if (i - s > E) return { errorResponse: z("LOG_QUERY_RANGE_TOO_WIDE", `关键词搜索必须限制在 ${F.Defaults.LogKeywordMaxWindowDays} 天内`, 400, { maxWindowDays: F.Defaults.LogKeywordMaxWindowDays }) };
        if (/^\d{3}$/.test(h)) m("proxy_logs.status_code = ?", Number(h));
        else if (gl(h) || Vo(h)) {
          const T = [], w = [];
          if (c.displayClientIp && (T.push("proxy_logs.client_ip = ?"), w.push(h)), c.displayColo) {
            const D = Vo(h) ? h.toUpperCase() : h;
            T.push("COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, '') = ?"), w.push(D), T.push("COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') = ?"), w.push(D);
          }
          m(T.length ? `(${T.join(" OR ")})` : "1 = 0", ...w);
        } else if (n === "fts")
          m(`${Pn} MATCH ?`, jd(h)), g = !0;
        else {
          const T = `%${Pa(h)}%`;
          if (Fe(T) > Zo) return { errorResponse: z("LOG_QUERY_KEYWORD_TOO_LONG", "LIKE 搜索关键词过长", 400, { maxPatternBytes: Zo }) };
          const w = [
            "proxy_logs.node_name LIKE ? ESCAPE '\\'",
            "proxy_logs.request_path LIKE ? ESCAPE '\\'",
            "proxy_logs.detail_json LIKE ? ESCAPE '\\'"
          ];
          f.push(T, T, T), c.displayClientIp && (w.push("proxy_logs.client_ip LIKE ? ESCAPE '\\'"), f.push(T)), c.displayUa && (w.push("proxy_logs.user_agent LIKE ? ESCAPE '\\'"), f.push(T)), w.push("proxy_logs.error_detail LIKE ? ESCAPE '\\'"), f.push(T), m(`(${w.join(" OR ")})`);
        }
      }
      t.category && m("proxy_logs.category = ?", String(t.category)), l === "playback_info" ? (m("proxy_logs.category = ?", "api"), m(`(${p} LIKE ? ESCAPE '\\' OR ${p} LIKE ? ESCAPE '\\')`, "%/playbackinfo%", "%/sessions/playing%")) : l === "image" ? m("proxy_logs.category = ?", "image") : l === "api" ? (m("proxy_logs.category = ?", "api"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/playbackinfo%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/sessions/playing%"), m(`${p} NOT LIKE ? ESCAPE '\\'`, "%/users/authenticate%")) : l === "auth" && (m("proxy_logs.category = ?", "api"), m(`${p} LIKE ? ESCAPE '\\'`, "%/users/authenticate%")), u === "4xx" ? m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 400, 500) : u === "5xx" && m("proxy_logs.status_code >= ? AND proxy_logs.status_code < ?", 500, 600);
      const y = fs(t.deliveryMode || "");
      if (y) {
        const E = "LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.deliveryMode') AS TEXT), ''))", T = y === "direct" ? ["Direct=entry_307", "Redirect=client_redirect"] : [
          "Redirect=proxied_follow",
          "Flow=managed",
          "Flow=passthrough"
        ];
        m(`(
          ${E} = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND (${T.map(() => "proxy_logs.error_detail LIKE ? ESCAPE '\\'").join(" OR ")})
          )
        )`, y, ...T.map((w) => `%${Pa(w)}%`));
      }
      const _ = $d(t.protocolFailureReason || "");
      if (_ && m(`(
          LOWER(COALESCE(CAST(json_extract(proxy_logs.detail_json, '$.protocolFailureReason') AS TEXT), '')) = ?
          OR (
            COALESCE(proxy_logs.detail_json, '') = ''
            AND proxy_logs.error_detail LIKE ? ESCAPE '\\'
          )
        )`, _, `%${Pa(_)}%`), t.playbackMode) {
        const E = String(t.playbackMode || "").trim();
        fs(E) || m("proxy_logs.error_detail LIKE ? ESCAPE '\\'", `%${Pa(`Playback=${E}`)}%`);
      }
      const S = g ? `FROM proxy_logs INNER JOIN ${Pn} ON ${Pn}.rowid = proxy_logs.id` : "FROM proxy_logs", A = `SELECT proxy_logs.*,
          ${c.displayClientIp ? "NULLIF(proxy_logs.client_ip, '') AS client_ip" : "NULL AS client_ip"},
          ${c.displayColo ? `COALESCE(proxy_logs.inbound_colo, proxy_logs.inbound_ip, proxy_logs.client_ip, '') AS inbound_colo,
        COALESCE(proxy_logs.outbound_colo, proxy_logs.outbound_ip, '') AS outbound_colo` : `'' AS inbound_colo,
        '' AS outbound_colo`},
          ${c.displayUa ? "proxy_logs.user_agent AS user_agent" : "NULL AS user_agent"},
          proxy_logs.detail_json AS detail_json`;
      return {
        searchMode: n,
        useFtsKeyword: g,
        whereClause: d,
        params: f,
        fromClause: S,
        selectClause: A,
        orderByClause: "ORDER BY proxy_logs.timestamp DESC, proxy_logs.id DESC"
      };
    },
    async executeSqlPlan(t, r = {}, a = {}) {
      const { safePage: n, safePageSize: s, requestedPageCursor: i, useSeekPagination: c, offset: l } = r, { whereClause: u = [], params: d = [], fromClause: f = "", selectClause: m = "", orderByClause: p = "", useFtsKeyword: h = !1, searchMode: g = "" } = a, y = "WHERE " + u.join(" AND ");
      let _ = 0, S = 1, A = n > 1, E = !1, T = null, w = [];
      try {
        if (c) {
          const D = u.slice(), k = d.slice();
          i && (D.push("(proxy_logs.timestamp < ? OR (proxy_logs.timestamp = ? AND proxy_logs.id < ?))"), k.push(i.timestamp, i.timestamp, i.id));
          const b = "WHERE " + D.join(" AND "), N = await t.prepare(`${m} ${f} ${b} ${p} LIMIT ?`).bind(...k, s + 1).all(), R = Array.isArray(N?.results) ? N.results : [];
          E = R.length > s, w = E ? R.slice(0, s) : R, T = E ? Vd(w[w.length - 1]) : null, _ = null, S = E ? n + 1 : n;
        } else {
          _ = (await t.prepare(`SELECT COUNT(*) as total ${f} ${y}`).bind(...d).first())?.total || 0;
          const D = await t.prepare(`${m} ${f} ${y} ${p} LIMIT ? OFFSET ?`).bind(...d, s, l).all();
          w = Array.isArray(D?.results) ? D.results : [], S = Math.ceil(_ / s) || 1, A = n > 1, E = n < S;
        }
      } catch (D) {
        const k = String(D?.message || D || "");
        if (h && /no such table:\s*proxy_logs_fts/i.test(k)) return { errorResponse: z("LOG_FTS_NOT_READY", "FTS5 虚拟表尚未初始化，请先点击“初始化日志表”", 400, { searchMode: g }) };
        if (h && /fts5/i.test(k)) return { errorResponse: z("LOG_FTS_QUERY_INVALID", "FTS 查询语法无效，请检查引号、布尔表达式或前缀写法", 400, { detail: k }) };
        throw D;
      }
      return {
        logs: w,
        total: _,
        totalPages: S,
        hasPrevPage: A,
        hasNextPage: E,
        nextCursor: T,
        searchMode: g
      };
    }
  };
  return e;
}
var ig = "sys_status";
function cg(o = {}) {
  const { logRepository: e } = o, t = {
    error(r, a, n = null) {
      Ae(r, a, n, "error");
    },
    scheduleFlush(r, a) {
      const n = e.getDB(r), s = ar.get(n);
      if (!n || !a || s.LogFlushPending) return null;
      s.LogFlushPending = !0;
      const i = t.flush(r).finally(() => {
        s.LogFlushTask === i && (s.LogFlushTask = null), s.LogFlushPending = !1, s.LogLastFlushAt = H();
      });
      return s.LogFlushTask = i, a.waitUntil(i), i;
    },
    record(r, a, n) {
      const s = e.getDB(r);
      if (!s || !a) return;
      const i = ar.get(s);
      if (n.requestMethod === "OPTIONS") return;
      const c = $(n.runtimeConfig) ? n.runtimeConfig : cs(r) || {};
      if (i.runtimeConfig = c, c.logEnabled === !1) {
        i.LogQueue.length > 0 && (i.LogQueue.length = 0), i.LogDedupe.clear();
        return;
      }
      const l = Number(n.statusCode) || 0, u = Ji(c.logWriteMode);
      if (u === "error" && (l < 400 || l >= 600)) return;
      const d = qi(n.requestPath, n.category);
      if (d === "image_poster" && c.logWriteImagePoster !== !0 || d === "media_metadata" && c.logWriteMediaMetadata !== !0) return;
      const f = c.logWriteClientIp !== !1, m = c.logWriteColo !== !1, p = c.logWriteUa !== !1, h = (x, O) => String(x || "").slice(0, O), g = h(n.inboundColo || n.inboundIp || n.clientIp || "unknown", 32), y = h(n.outboundColo || n.outboundIp || "", 32), _ = f ? h(n.clientIp || "unknown", 128) : "", S = h(n.nodeName || "unknown", 128) || "unknown", A = h(n.requestPath || "/", 2048) || "/", E = H(), T = Math.max(0, Number(i.LogClearEpochMs) || 0), w = E <= T ? T + 1 : E;
      let D = 0;
      if (n.requestMethod === "HEAD" ? D = 3e5 : (n.category === "segment" || n.category === "prewarm") && (D = 3e4), D > 0) {
        const x = [
          S,
          n.requestMethod || "GET",
          l,
          A,
          _,
          y
        ].join("|"), O = i.LogDedupe.get(x);
        if (O && E - O < D) return;
        if (i.LogDedupe.set(x, E), i.LogDedupe.size > F.Defaults.LogDedupeMax) {
          for (const [L, v] of i.LogDedupe)
            if (i.LogDedupe.has(L) && ((E - v > D || i.LogDedupe.size > F.Defaults.LogDedupeTrimTarget) && i.LogDedupe.delete(L), i.LogDedupe.size <= F.Defaults.LogDedupeTrimTarget))
              break;
        }
      }
      if (i.LogQueue.push({
        timestamp: w,
        nodeName: S,
        requestPath: A,
        requestMethod: n.requestMethod || "GET",
        statusCode: l,
        responseTime: Number(n.responseTime) || 0,
        clientIp: _,
        inboundColo: m ? g : null,
        outboundColo: m ? y : null,
        userAgent: p && h(n.userAgent, 512) || null,
        referer: h(n.referer, 1024) || null,
        category: n.category || "api",
        errorDetail: h(n.errorDetail, 2048) || null,
        detailJson: n.detailJson ? ml(n.detailJson) : null,
        createdAt: new Date(w).toISOString()
      }), i.LogQueue.length > F.Defaults.LogQueueMax) {
        const x = Math.min(F.Defaults.LogQueueOverflowDropCount, i.LogQueue.length);
        i.LogQueue.splice(0, x), e.patchOpsStatus(r, { log: {
          lastOverflowAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastOverflowDropCount: x,
          queueLengthAfterDrop: i.LogQueue.length
        } }, a), console.error(`Log queue overflow, dropping ${x} logs to preserve isolate headroom.`);
      }
      i.LogLastFlushAt || (i.LogLastFlushAt = E);
      const k = Number(c.logWriteDelayMinutes), b = Number(c.logFlushCountThreshold), N = Math.max(0, Number.isFinite(k) ? k * 6e4 : F.Defaults.LogFlushDelayMinutes * 6e4), R = Math.max(1, Number.isFinite(b) ? Math.floor(b) : F.Defaults.LogFlushCountThreshold);
      (u === "error" || i.LogQueue.length >= R || N === 0 || E - i.LogLastFlushAt >= N) && t.scheduleFlush(r, a);
    },
    async flush(r) {
      const a = e.getDB(r), n = ar.get(a);
      if (!a || n.LogQueue.length === 0) return;
      const s = $(n.runtimeConfig) ? n.runtimeConfig : cs(r) || {}, i = Oe(s.scheduleUtcOffsetMinutes);
      if (s.logEnabled === !1) {
        n.LogQueue.length = 0, n.LogDedupe.clear();
        return;
      }
      await e.ensureSysStatusTable(a);
      const c = await e.resolveLogsReadiness({
        db: a,
        kv: e.getKV(r)
      });
      if (c.schemaReady !== !0) {
        const T = n.LogQueue.length;
        n.LogQueue.length = 0, n.LogDedupe.clear(), await e.patchOpsStatus(r, { log: {
          schemaReady: !1,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          lastFlushAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "schema_not_ready",
          lastFlushError: "proxy_logs schema not initialized",
          lastFlushErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushRetryCount: 0,
          lastDroppedBatchSize: T,
          lastFlushWrittenBeforeError: 0,
          queueLengthAfterFlush: 0
        } });
        return;
      }
      const l = Number(s.logBatchChunkSize), u = Number(s.logBatchRetryCount), d = Number(s.logBatchRetryBackoffMs), f = le(l, F.Defaults.LogBatchChunkSize, 1, 100), m = le(u, F.Defaults.LogBatchRetryCount, 0, 5), p = le(d, F.Defaults.LogBatchRetryBackoffMs, 0, 5e3), h = e.getOpsStatusDbScope("log");
      let g = 0, y = 0, _ = 0, S = 0;
      const A = /* @__PURE__ */ new Map(), E = (T = []) => {
        const w = e.summarizeStatsHourlyEntries(T, { utcOffsetMinutes: i });
        for (const D of w) {
          const k = `${D.bucketDate}:${D.bucketHour}`, b = A.get(k) || {
            bucketDate: D.bucketDate,
            bucketHour: D.bucketHour,
            requestCount: 0,
            playCount: 0,
            playbackInfoCount: 0
          };
          b.requestCount += Math.max(0, Number(D.requestCount) || 0), b.playCount += Math.max(0, Number(D.playCount) || 0), b.playbackInfoCount += Math.max(0, Number(D.playbackInfoCount) || 0), A.set(k, b);
        }
      };
      try {
        const T = Math.max(n.LogClearEpochMs || 0, await e.getLogClearEpochMs(r));
        for (; n.LogQueue.length > 0; ) {
          const D = n.LogQueue.splice(0, f).filter((R) => (Number(R?.timestamp) || 0) > T);
          if (!D.length) continue;
          _ = D.length, S = 0;
          const k = JSON.stringify(D);
          if (Fe(k) > Vt) throw Oc("proxy_logs.batch", k);
          const b = a.prepare(`INSERT INTO proxy_logs (timestamp, node_name, request_path, request_method, status_code, response_time, client_ip, inbound_colo, outbound_colo, user_agent, referer, category, error_detail, detail_json, created_at)
						SELECT
							CAST(json_extract(entry.value, '$.timestamp') AS INTEGER),
							json_extract(entry.value, '$.nodeName'), json_extract(entry.value, '$.requestPath'), json_extract(entry.value, '$.requestMethod'),
							CAST(json_extract(entry.value, '$.statusCode') AS INTEGER), CAST(json_extract(entry.value, '$.responseTime') AS INTEGER),
							json_extract(entry.value, '$.clientIp'), json_extract(entry.value, '$.inboundColo'), json_extract(entry.value, '$.outboundColo'),
							json_extract(entry.value, '$.userAgent'), json_extract(entry.value, '$.referer'), json_extract(entry.value, '$.category'),
							json_extract(entry.value, '$.errorDetail'), json_extract(entry.value, '$.detailJson'), json_extract(entry.value, '$.createdAt')
						FROM json_each(?) AS entry
						WHERE CAST(json_extract(entry.value, '$.timestamp') AS INTEGER) > COALESCE((
							SELECT CAST(json_extract(payload, '$.clearEpochMs') AS INTEGER)
							FROM ${ig}
							WHERE scope = ?
							LIMIT 1
						), 0)`).bind(k, h);
          let N = 0;
          for (; ; ) try {
            await b.run();
            break;
          } catch (R) {
            if (N >= m) throw R;
            N += 1, y += 1, p > 0 && await oi(p * N);
          }
          c.statsReady === !0 && E(D), g += D.length, S += D.length;
        }
        if (c.statsReady === !0 && A.size > 0) try {
          await e.upsertStatsHourlyBuckets(a, [...A.values()], { useBatch: !0 });
        } catch (D) {
          console.warn("upsertStatsHourlyBuckets failed", D);
        }
        const w = {
          schemaReady: !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushCount: g,
          lastFlushStatus: "success",
          lastFlushRetryCount: y,
          queueLengthAfterFlush: n.LogQueue.length,
          lastFlushError: null,
          lastFlushErrorAt: null,
          lastDroppedBatchSize: 0,
          lastFlushWrittenBeforeError: 0
        };
        g > 0 ? await e.bumpLogsRevision(r, w) : await e.patchOpsStatus(r, { log: w });
      } catch (T) {
        await e.patchOpsStatus(r, { log: {
          schemaReady: c.schemaReady === !0,
          ftsReady: c.ftsReady === !0,
          statsReady: c.statsReady === !0,
          statsUtcOffsetMinutes: i,
          lastFlushErrorAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
          lastFlushStatus: "failed",
          lastFlushError: T?.message || String(T),
          lastFlushRetryCount: y,
          lastDroppedBatchSize: Math.max(0, _ - S),
          lastFlushWrittenBeforeError: g,
          queueLengthAfterFlush: n.LogQueue.length
        } }), console.log("Log flush failed, dropping batch.", T);
      }
    }
  };
  return t;
}
var xn = "sys_status", Qt = "sys_locks", ra = "scheduled", Vs = Object.freeze({
  log: "ops_status:log",
  scheduled: "ops_status:scheduled",
  dnsIpPool: "ops_status:dns_ip_pool"
});
function lg(o = {}) {
  const { bindingPort: e, schemaReadinessPort: t, statusPersistence: r } = o, a = {
    async getOpsStatusPayloadFromDb(n, s) {
      if (!n || !s) return null;
      const i = r.getOpsStatusPayloadCache(n), c = i?.get(String(s));
      if (c && Number(c.expiresAt) > H()) return c.payload;
      if (c && i.delete(String(s)), !await r.ensureSysStatusTable(n)) return null;
      try {
        const l = await n.prepare(`SELECT payload FROM ${xn} WHERE scope = ? LIMIT 1`).bind(s).first(), u = l?.payload ? typeof l.payload == "string" ? JSON.parse(l.payload) : l.payload : null;
        return r.cacheOpsStatusPayload(n, s, u), u;
      } catch {
        return i?.delete(String(s)), null;
      }
    },
    async getOpsStatusPayloadFromDbStrict(n, s) {
      if (!n || !s) throw new Error("D1 status scope is not configured");
      if (!await r.ensureSysStatusTable(n)) {
        const c = /* @__PURE__ */ new Error("D1 sys_status table is unavailable");
        throw c.code = "D1_COMPATIBILITY_REQUIRED", c.status = 409, c;
      }
      const i = await n.prepare(`SELECT payload FROM ${xn} WHERE scope = ? LIMIT 1`).bind(s).first();
      return i?.payload ? typeof i.payload == "string" ? JSON.parse(i.payload) : i.payload : null;
    },
    async putOpsStatusPayloadToDb(n, s, i, c) {
      if (!n || !s || !i || typeof i != "object" || !await r.ensureSysStatusTable(n)) return !1;
      const l = JSON.stringify(i);
      return Fe(l) > Vt ? !1 : (await n.prepare(`INSERT INTO ${xn} (scope, payload, updated_at) VALUES (?, ?, ?)
		ON CONFLICT(scope) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`).bind(s, l, Number(c) || H()).run(), r.cacheOpsStatusPayload(n, s, i), !0);
    },
    getOpsStatusSectionEntries() {
      return Object.entries(Vs);
    },
    async getOpsStatusRootFromStores(n) {
      const s = n?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusPayloadFromDb(s, r.getOpsStatusDbScope()), c = i && typeof i == "object" ? i : {}, l = r.getOpsStatusShadowPatch(s);
      return Ve(c, l && typeof l == "object" ? l : {});
    },
    async getOpsStatusRoot(n) {
      return a.getOpsStatusRootFromStores(r.resolveOpsStatusStores(n));
    },
    async getOpsStatusSectionFromStores(n, s) {
      const i = n?.db || null;
      if (!s) return {};
      if (!Vs[s]) return {};
      const c = async () => {
        if (!i) return null;
        const f = await a.getOpsStatusPayloadFromDb(i, r.getOpsStatusDbScope(s));
        return f && typeof f == "object" ? f : null;
      }, [l, u] = await Promise.all([a.getOpsStatusRootFromStores(n), c()]), d = l && typeof l[s] == "object" ? l[s] : {};
      return Ve(u && typeof u == "object" ? u : {}, d);
    },
    async getOpsStatusSection(n, s) {
      return a.getOpsStatusSectionFromStores(r.resolveOpsStatusStores(n), s);
    },
    async getOpsStatusFromStores(n) {
      const s = n?.db || null;
      if (!s) return {};
      const i = await a.getOpsStatusRootFromStores(n), c = i && typeof i == "object" ? { ...i } : {};
      let l = typeof c.updatedAt == "string" ? c.updatedAt : "";
      const u = await Promise.all(a.getOpsStatusSectionEntries().map(async ([d]) => {
        const f = await a.getOpsStatusPayloadFromDb(s, r.getOpsStatusDbScope(d)), m = i && typeof i[d] == "object" ? i[d] : {};
        return [d, Ve(f && typeof f == "object" ? f : {}, m)];
      }));
      for (const [d, f] of u)
        !f || typeof f != "object" || Object.keys(f).length && (c[d] = Ve(c[d], f), typeof f.updatedAt == "string" && f.updatedAt > l && (l = f.updatedAt));
      return l && (c.updatedAt = l), c;
    },
    async getOpsStatus(n) {
      return a.getOpsStatusFromStores(r.resolveOpsStatusStores(n));
    },
    getLogClearEpochMsFromStatus(n) {
      const s = Number(n?.clearEpochMs);
      return Number.isFinite(s) && s > 0 ? Math.floor(s) : 0;
    },
    async getLogClearEpochMs(n) {
      const s = await a.getOpsStatusSection(n, "log"), i = a.getLogClearEpochMsFromStatus(s), c = ar.get(r.resolveOpsStatusStores(n).db);
      return i > c.LogClearEpochMs && (c.LogClearEpochMs = i), i;
    },
    async patchOpsStatus(n, s, i = null) {
      const c = r.resolveOpsStatusStores(n);
      if (!c.db) return {};
      const l = s && typeof s == "object" ? s : {}, u = Object.keys(l);
      if (!u.length) return await a.getOpsStatusFromStores(c);
      const d = r.buildOpsStatusRootPatch(l);
      if (!Object.keys(d).length) return await a.getOpsStatusFromStores(c);
      const f = r.getOpsStatusShadowState(c.db);
      f && (f.pendingPatch = Ve(f.pendingPatch && typeof f.pendingPatch == "object" ? f.pendingPatch : {}, d));
      const m = async () => await r.flushOpsStatusShadow(c, { patchKeys: u }), p = Promise.resolve(We.OpsStatusWriteChain).catch((h) => {
        Ae("ops_status.write_chain.previous_failure", h, { patchKeys: u });
      }).then(m);
      return We.OpsStatusWriteChain = p.catch((h) => {
        Ae("ops_status.write_chain.current_failure", h, { patchKeys: u });
      }), i ? i.waitUntil(p) : await p, p;
    },
    resolveScheduledLeaseStores(n) {
      return n && typeof n == "object" && !Array.isArray(n) && ("db" in n || "kv" in n) ? {
        db: n.db || null,
        kv: n.kv || null
      } : n && typeof n.prepare == "function" ? {
        db: n,
        kv: null
      } : n && typeof n.get == "function" ? {
        db: null,
        kv: n
      } : {
        db: e.getDB(n),
        kv: e.getKV(n)
      };
    },
    async ensureScheduledLeaseTable(n) {
      if (!n || typeof n.prepare != "function") return !1;
      if (t.isD1SchemaReadyCached(n, "scheduledLeaseTable")) return !0;
      let s = Y.ScheduledLeaseDbReady.get(n);
      s || (s = (async () => {
        try {
          return await n.prepare(`CREATE TABLE IF NOT EXISTS ${Qt} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`).run(), await n.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at ON ${Qt} (expires_at DESC)`).run(), t.markD1SchemaReady(n, "scheduledLeaseTable"), !0;
        } catch (i) {
          return console.warn("scheduled lease table init failed", i), !1;
        }
      })(), Y.ScheduledLeaseDbReady.set(n, s));
      try {
        return await s;
      } finally {
        Y.ScheduledLeaseDbReady.get(n) === s && Y.ScheduledLeaseDbReady.delete(n);
      }
    },
    normalizeScheduledLeaseLock(n, s = "") {
      if (!n || typeof n != "object") return null;
      const i = String(n.token || "").trim();
      if (!i) return null;
      const c = String(n.owner || "scheduled").trim() || "scheduled", l = Number(n.expiresAt ?? n.expires_at ?? 0), u = Number(n.acquiredAtMs ?? n.acquired_at), d = Number(n.renewedAtMs ?? n.renewed_at);
      return {
        token: i,
        owner: c,
        acquiredAt: typeof n.acquiredAt == "string" ? n.acquiredAt : Number.isFinite(u) && u > 0 ? new Date(u).toISOString() : "",
        renewedAt: typeof n.renewedAt == "string" ? n.renewedAt : Number.isFinite(d) && d > 0 ? new Date(d).toISOString() : "",
        expiresAt: Number.isFinite(l) ? l : 0,
        backend: s || String(n.backend || "").trim() || ""
      };
    },
    async getScheduledLeaseLockFromDb(n, s = ra) {
      if (!n || !await a.ensureScheduledLeaseTable(n)) return null;
      try {
        const i = await n.prepare(`SELECT token, owner, acquired_at, renewed_at, expires_at FROM ${Qt} WHERE scope = ? LIMIT 1`).bind(String(s || ra)).first();
        return a.normalizeScheduledLeaseLock(i, "d1");
      } catch {
        return null;
      }
    },
    async tryAcquireScheduledLeaseWithDb(n, s = {}) {
      if (!n) return {
        acquired: !1,
        reason: "db_unavailable",
        backend: "d1"
      };
      if (!await a.ensureScheduledLeaseTable(n)) return {
        acquired: !1,
        reason: "db_init_failed",
        backend: "d1"
      };
      const i = H(), c = Math.max(F.Defaults.ScheduledLeaseMinMs, Number(s.leaseMs) || F.Defaults.ScheduledLeaseMs), l = String(s.token || `${i}-${Math.random().toString(36).slice(2, 10)}`), u = String(s.owner || "scheduled"), d = String(s.scope || ra), f = i + c;
      try {
        await n.prepare(`INSERT INTO ${Qt} (scope, token, owner, acquired_at, renewed_at, expires_at)
          VALUES (?, ?, ?, ?, NULL, ?)
          ON CONFLICT(scope) DO UPDATE SET
            token = excluded.token,
            owner = excluded.owner,
            acquired_at = excluded.acquired_at,
            renewed_at = NULL,
            expires_at = excluded.expires_at
          WHERE ${Qt}.expires_at <= ?`).bind(d, l, u, i, f, i).run();
        const m = await a.getScheduledLeaseLockFromDb(n, d);
        return m && m.token === l ? {
          acquired: !0,
          leaseMs: c,
          backend: "d1",
          lock: m
        } : m && Number(m.expiresAt) > i ? {
          acquired: !1,
          reason: "lease_held",
          backend: "d1",
          lock: m
        } : {
          acquired: !1,
          reason: "lease_contended",
          backend: "d1",
          lock: m
        };
      } catch (m) {
        return console.warn("scheduled lease acquire failed", m), {
          acquired: !1,
          reason: "db_unavailable",
          backend: "d1"
        };
      }
    },
    async tryAcquireScheduledLease(n, s = {}) {
      const i = a.resolveScheduledLeaseStores(n);
      return i.db ? await a.tryAcquireScheduledLeaseWithDb(i.db, s) : {
        acquired: !1,
        reason: "db_not_configured",
        backend: "d1"
      };
    },
    async renewScheduledLeaseWithDb(n, s, i, c = {}) {
      if (!n || !s || !await a.ensureScheduledLeaseTable(n)) return null;
      const l = H(), u = Math.max(F.Defaults.ScheduledLeaseMinMs, Number(i) || F.Defaults.ScheduledLeaseMs), d = String(c.scope || ra);
      try {
        await n.prepare(`UPDATE ${Qt}
          SET owner = ?, renewed_at = ?, expires_at = ?
          WHERE scope = ? AND token = ?`).bind(String(c.owner || "scheduled"), l, l + u, d, String(s)).run();
        const f = await a.getScheduledLeaseLockFromDb(n, d);
        return f && f.token === String(s) ? f : null;
      } catch {
        return null;
      }
    },
    async renewScheduledLease(n, s, i, c = {}) {
      const l = a.resolveScheduledLeaseStores(n);
      return l.db ? await a.renewScheduledLeaseWithDb(l.db, s, i, c) : null;
    },
    async releaseScheduledLeaseWithDb(n, s, i = {}) {
      if (!n || !s || !await a.ensureScheduledLeaseTable(n)) return !1;
      const c = String(i.scope || ra);
      try {
        return await n.prepare(`DELETE FROM ${Qt} WHERE scope = ? AND token = ?`).bind(c, String(s)).run(), !0;
      } catch {
        return !1;
      }
    },
    async releaseScheduledLease(n, s, i = {}) {
      const c = a.resolveScheduledLeaseStores(n);
      return c.db ? await a.releaseScheduledLeaseWithDb(c.db, s, i) : !1;
    }
  };
  return a;
}
function lr(o, e = "") {
  const t = String(o || "request_aborted").trim() || "request_aborted", r = new Error(e ? `${t}_${e}` : t);
  return t === "client_aborted" ? r.code = "CLIENT_ABORTED" : t === "downstream_cancelled" ? r.code = "DOWNSTREAM_CANCELLED" : t === "stream_idle_timeout" ? r.code = "STREAM_IDLE_TIMEOUT" : r.code = "REQUEST_ABORTED", r;
}
function ll(o) {
  const e = new AbortController();
  let t = "", r = null, a = null, n = null;
  const s = /* @__PURE__ */ new Set(), i = (l) => {
    if (s.size)
      for (const u of [...s]) try {
        u(l);
      } catch {
      }
  }, c = (l = "request_aborted") => {
    const u = String(l || "request_aborted").trim() || "request_aborted";
    if (t || (t = u), a && !a.signal.aborted) try {
      a.abort(t);
    } catch {
    }
    if (!e.signal.aborted) try {
      e.abort(t);
    } catch {
    }
    i(t);
  };
  if (o && typeof o.addEventListener == "function") {
    const l = () => c("client_aborted");
    o.aborted ? l() : (o.addEventListener("abort", l, { once: !0 }), r = () => o.removeEventListener("abort", l));
  }
  return {
    signal: e.signal,
    abort: c,
    isAborted() {
      return e.signal.aborted === !0 || !!t;
    },
    getAbortReason() {
      return t;
    },
    onAbort(l) {
      if (typeof l != "function") return () => {
      };
      if (t || e.signal.aborted) {
        try {
          l(t || "request_aborted");
        } catch {
        }
        return () => {
        };
      }
      return s.add(l), () => s.delete(l);
    },
    setActiveFetchController(l) {
      if (n && (n(), n = null), a = l || null, !l) return () => {
      };
      const u = () => {
        try {
          l.abort(t || "request_aborted");
        } catch {
        }
      };
      return t || e.signal.aborted ? u() : e.signal.addEventListener("abort", u, { once: !0 }), n = () => {
        e.signal.removeEventListener("abort", u), a === l && (a = null);
      }, () => {
        if (!n) return;
        const d = n;
        n = null, d();
      };
    },
    dispose() {
      if (r && (r(), r = null), n) {
        const l = n;
        n = null, l();
      } else a = null;
      s.clear();
    }
  };
}
function ug(o = []) {
  const e = new AbortController(), t = [], r = (a = "linked_abort") => {
    if (!e.signal.aborted)
      try {
        e.abort(a);
      } catch {
      }
  };
  for (const a of Array.isArray(o) ? o : [o]) {
    if (!a || typeof a.addEventListener != "function") continue;
    const n = () => r(a.reason || "linked_abort");
    if (a.aborted) {
      n();
      continue;
    }
    a.addEventListener("abort", n, { once: !0 }), t.push(() => a.removeEventListener("abort", n));
  }
  return {
    signal: e.signal,
    abort(a = "linked_abort") {
      r(a);
    },
    dispose() {
      for (const a of t.splice(0)) try {
        a();
      } catch {
      }
    }
  };
}
async function dg(o, e, t = null) {
  return await new Promise((r, a) => {
    let n = !1, s = null, i = () => {
    };
    const c = (u) => {
      if (!n) {
        n = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        r(u);
      }
    }, l = (u) => {
      if (!n) {
        n = !0, s !== null && clearTimeout(s);
        try {
          i();
        } catch {
        }
        a(u);
      }
    };
    t?.onAbort && (i = t.onAbort((u) => l(lr(u)))), Number(e) > 0 && (s = setTimeout(() => c({
      timedOut: !0,
      value: null
    }), Math.max(0, Number(e) || 0))), Promise.resolve(o).then((u) => c({
      timedOut: !1,
      value: u
    }), l);
  });
}
async function fg(o, e = null) {
  const t = Math.max(0, Number(o) || 0);
  if (!(t <= 0))
    return await new Promise((r, a) => {
      let n = !1, s = () => {
      };
      const i = setTimeout(() => {
        if (!n) {
          n = !0;
          try {
            s();
          } catch {
          }
          r();
        }
      }, t);
      e?.onAbort && (s = e.onAbort((c) => {
        n || (n = !0, clearTimeout(i), a(lr(c)));
      }));
    });
}
function mg(o = {}, e = {}) {
  return {
    async tryServeMetadataCache(t) {
      if (!t.metadataCache || !t.metadataCacheKey) return null;
      try {
        const r = Op(t.metadataCacheKey, t.request);
        if (!r) return null;
        const a = await t.metadataCache.match(r);
        if (!a) return null;
        const n = e.buildProxyResponseHeaders(a, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
          enableH3: t.enableH3,
          forceH1: t.forceH1,
          imageCacheMaxAge: t.imageCacheMaxAge
        });
        return e.recordAccessLog(t, {
          statusCode: a.status,
          category: e.classifyProxyLogCategory(t.requestTraits),
          errorDetail: e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(a), e.buildStreamDiagnosticDetail(t, a, {
            flow: "cache_hit",
            source: "worker_cache",
            cacheStatus: "WORKER_CACHE"
          })),
          detailJson: e.buildStructuredLogDetail(t, { statusCode: a.status }, {
            deliveryMode: "proxy",
            redirectMode: "worker_cache",
            decisionReason: "worker_cache_hit",
            protocolFailureReason: Number(a.status) >= 400 ? e.classifyProtocolFailureReason(e.extractProxyErrorDetail(a) || a.statusText || "", { upstreamStatus: a.status }) : null,
            upstreamStatus: a.status
          }),
          outboundColo: ""
        }), new Response(a.body, {
          status: a.status,
          statusText: a.statusText,
          headers: n
        });
      } catch {
        return null;
      }
    },
    async resolveEarlyResponse(t) {
      if (t.requestMethod === "OPTIONS") return e.buildOptionsResponse(t);
      const r = e.evaluateFirewall(t.currentConfig, t.clientIp, t.country, t.finalOrigin);
      if (r) return r;
      const a = e.applyRateLimit(t.currentConfig, t.clientIp, t.requestTraits, t.startTime, t.finalOrigin);
      return a || await e.tryServeMetadataCache(t);
    },
    shouldGuardClientDirectForRequest(t = {}, r = {}) {
      return String(r?.action || "").trim().toUpperCase() !== "DIRECT" || String(r?.reason || "").trim() === "stream_body_direct" ? !1 : t?.isBigStream === !0 || t?.isManifest === !0 || t?.isSegment === !0;
    },
    enforceStrictClientDirectAuthPolicy(t, r, a, n = {}) {
      if (!e.shouldGuardClientDirectForRequest(t?.requestTraits, r)) return r;
      const s = a?.clientRedirectAuthPolicy || Ra(a?.newHeaders);
      return a && typeof a == "object" && (a.clientRedirectAuthPolicy = s), t.directRedirectAuthReason = s.reason || "", r;
    },
    createDirectTransportIncompatibleError(t, r = {}) {
      const a = /* @__PURE__ */ new Error("direct_transport_incompatible");
      return a.code = "DIRECT_TRANSPORT_INCOMPATIBLE", a.redirectTrace = r.redirectTrace || t?.redirectTrace || null, a;
    },
    async maybeProbeEntryDirectRangeRedirectResponse(t, r, a, n) {
      if (typeof a != "function") return null;
      const s = e.resolveEntryDirectTargetUrl(t, r);
      let i = null, c = () => {
      };
      const l = ll(t?.request?.signal);
      try {
        const g = await e.performFetchWithTimeout(s, a, {
          method: "HEAD",
          timeoutMs: t.upstreamTimeoutMs,
          requestLifecycle: l
        });
        i = g.response, c = typeof g.releaseFetchController == "function" ? g.releaseFetchController : () => {
        };
      } catch {
        return c(), l.dispose(), null;
      }
      if (!(i.status >= 300 && i.status < 400)) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const u = Ea(i.headers.get("Location"), s);
      if (!u) {
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), null;
      }
      const d = t.playbackRelayTargetUrl instanceof URL ? t.playbackRelayTargetUrl : r, f = Ia(u, d).proxyPath || (u.origin === d?.origin ? u.pathname : null);
      if (f && pa(f)) {
        const g = e.createRedirectTrace(t.requestUrl);
        e.recordRedirectTraceHop(g, i.status, u, {
          isSameOriginRedirect: !0,
          traceAction: "blocked_web"
        }), e.finalizeRedirectTrace(g, {
          terminalMode: "web_proxy_disabled",
          finalStatus: 404,
          finalHost: u.hostname || ""
        }), t.redirectTrace = g, t.defaultOutboundColo = Ga(i) || "";
        try {
          i.body?.cancel?.();
        } catch {
        }
        return c(), l.dispose(), e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, 404, t.defaultOutboundColo, {
          redirectTrace: g,
          decisionReason: "web_proxy_disabled"
        })), Sn(t.requestMethod, t.dynamicCors);
      }
      const m = e.buildClientVisibleRedirectUrl(u, t.playbackRelayTargetUrl || r, t.nodeName, t.nodeKey, t.requestUrl, { entryMode: t.entryMode }) || u, p = e.createRedirectTrace(t.requestUrl);
      e.recordRedirectTraceHop(p, i.status, u, {
        isSameOriginRedirect: u.origin === s.origin,
        traceAction: "direct",
        dataPlaneMode: n?.dataPlaneMode
      }), e.finalizeRedirectTrace(p, {
        terminalMode: "client_redirect",
        finalStatus: i.status,
        finalHost: String(u.hostname || "").trim().toLowerCase()
      }), t.redirectTrace = p, t.defaultOutboundColo = Ga(i) || "";
      const h = e.buildProxyResponseHeaders(i, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        imageCacheMaxAge: t.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(h, i, r, t.nodeName, t.nodeKey, m, s, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode
      }), e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, i.status, t.defaultOutboundColo || "", {
        directRedirectUrl: m,
        redirectTrace: p,
        decisionReason: String(n?.reason || n?.traceLabel || "").trim()
      })), c(), l.dispose(), new Response(t.requestMethod === "HEAD" ? null : i.body, {
        status: i.status,
        statusText: i.statusText,
        headers: h
      });
    },
    async maybeBuildEntryDirectResponse(t, r, a = null, n = null) {
      if (t?.forceWorkerProxy === !0) return null;
      const s = e.enforceStrictClientDirectAuthPolicy(t, t.entryRoutingDecision, a, {
        redirectStatus: t.entryRoutingDecision?.redirectStatus || 307,
        redirectMethod: t.requestMethod
      });
      if (t.entryRoutingDecision = s, s?.phase !== "entry" || s?.action !== "DIRECT") return null;
      const i = (Ze(r[0]) ? r[0] : null)?.targetUrl || null;
      if (!(i instanceof URL)) return null;
      const c = a?.clientRedirectAuthPolicy || Ra(a?.newHeaders || t.request.headers);
      if (a && typeof a == "object" && (a.clientRedirectAuthPolicy = c), t?.requestTraits?.isBigStream === !0 && t?.requestTraits?.rangeHeader && c.hasQueryAuth !== !0 && c.hasHeaderAuth !== !0 && c.hasCookieAuth !== !0) {
        const f = await e.maybeProbeEntryDirectRangeRedirectResponse(t, i, n, s);
        if (f) return f;
      }
      if (c.canDirect !== !0)
        throw t.directRedirectAuthReason = c.reason || "direct_transport_incompatible", e.createDirectTransportIncompatibleError(t);
      const l = Go(e.resolveEntryDirectTargetUrl(t, i), c, t.effectiveMediaAuthMode), u = new Response(null, {
        status: 307,
        statusText: "Temporary Redirect"
      }), d = e.buildProxyResponseHeaders(u, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        imageCacheMaxAge: t.imageCacheMaxAge
      });
      return e.applyProxyRedirectHeaders(d, u, i, t.nodeName, t.nodeKey, l, l, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode
      }), e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, 307, "")), new Response(null, {
        status: 307,
        statusText: "Temporary Redirect",
        headers: d
      });
    },
    createBuildFetchOptions(t, r) {
      const { requestMethod: a, requestTraits: n, protocolFallback: s } = t, { newHeaders: i, adminCustomHeaders: c, preparedBody: l, preparedBodyMode: u } = r, d = r?.transportTemplate || null, f = Array.isArray(d?.baseHeaderEntries) ? d.baseHeaderEntries : [...i.entries()], m = d ? d.adminCustomHasOrigin === !0 : c.has("origin"), p = d ? d.adminCustomHasReferer === !0 : c.has("referer"), h = d ? d.hasOriginHeader === !0 : i.has("Origin"), g = d ? d.hasRefererHeader === !0 : i.has("Referer"), y = String(d?.refererOrigin || "").trim(), _ = String(d?.refererPathAndSearch || "/") || "/";
      return async (S, A = {}) => {
        const E = new Headers(f), T = (S instanceof URL ? S : new URL(String(S))).origin, w = A.method || a, D = A.bodyMode || u, k = A.body !== void 0 ? A.body : l, b = A.isExternalRedirect === !0, N = A.protocolFallbackRetry === !0, R = A.stripAuthOnProtocolFallback === !0;
        if (h && !m && E.set("Origin", T), g && !p)
          if (d) y ? y !== T && E.set("Referer", `${T}${_}`) : E.set("Referer", T + "/");
          else try {
            const O = new URL(E.get("Referer") || "");
            if (O.origin !== T) {
              const L = new URL(`${O.pathname || "/"}${O.search || ""}`, T);
              E.set("Referer", L.toString());
            }
          } catch {
            E.set("Referer", T + "/");
          }
        if (b) {
          const O = [];
          if (c instanceof Set) for (const L of c) {
            if (L === "cookie") continue;
            const v = i.get(L);
            v !== null && O.push([L, v]);
          }
          Gs(E), E.delete("Cookie"), d?.adminCookie && E.set("Cookie", d.adminCookie);
          for (const [L, v] of O) E.set(L, v);
          m || E.delete("Origin"), p || E.delete("Referer");
        }
        N && s && (R && Gs(E), E.set("Connection", "keep-alive")), (n.isBigStream || n.isSmartStrmMedia || n.isManifest || n.isSegment) && n.rangeHeader && !E.has("Range") && E.set("Range", n.rangeHeader), (n.isBigStream || n.isSmartStrmMedia || n.isManifest || n.isSegment) && n.ifRangeHeader && !E.has("If-Range") && E.set("If-Range", n.ifRangeHeader), (w === "GET" || w === "HEAD") && E.delete("Content-Length");
        const x = {
          method: w,
          headers: E,
          redirect: "manual"
        };
        return n.isMetadataCacheable && (x.cache = "no-store"), w !== "GET" && w !== "HEAD" && (D === "buffered" && k !== null && k !== void 0 ? x.body = k.slice(0) : D === "stream" && (x.body = k)), x;
      };
    }
  };
}
function pg(o = {}, e = {}) {
  return {
    async executeUpstreamFlow(t, r, a) {
      const n = /* @__PURE__ */ new Set([
        500,
        502,
        503,
        504,
        522,
        523,
        524,
        525,
        526,
        530
      ]), s = t.requestTraits?.isSmartStrmMedia === !0 ? {
        mode: "proxy",
        forceVideoDirect: !1,
        forceVideoProxy: !1
      } : Rd(t.node, t.currentConfig), i = e.createRedirectTrace(t.requestUrl), c = bd(t.requestMethod, t.requestTraits, { playbackRelayTargetUrl: t.playbackRelayTargetUrl });
      t.redirectTrace = i;
      const l = t.playbackRelayTargetUrl ? await e.fetchAbsoluteWithRetryLoop({
        execution: t,
        absoluteUrl: t.playbackRelayTargetUrl,
        buildFetchOptions: a,
        fetchOptions: {
          method: t.requestMethod,
          bodyMode: r.preparedBodyMode,
          body: r.preparedBody,
          isExternalRedirect: !0
        },
        retryableStatuses: n,
        protocolFallback: t.protocolFallback,
        preparedBodyMode: r.preparedBodyMode,
        allowAutomaticRetry: r.allowAutomaticRetry,
        stripAuthOnProtocolFallback: t.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: t.upstreamTimeoutMs,
        maxExtraAttempts: r.allowAutomaticRetry && r.allowSameTargetRetry !== !1 ? t.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: t.requestLifecycle
      }) : await e.fetchUpstreamWithRetryLoop({
        execution: t,
        retryTargetRecords: r.retryTargetRecords,
        proxyPath: t.proxyPath,
        requestUrl: t.requestUrl,
        buildFetchOptions: a,
        retryableStatuses: n,
        protocolFallback: t.protocolFallback,
        preparedBodyMode: r.preparedBodyMode,
        allowAutomaticRetry: r.allowAutomaticRetry,
        stripAuthOnProtocolFallback: t.requestTraits.canStripAuthOnProtocolFallback,
        upstreamTimeoutMs: t.upstreamTimeoutMs,
        maxExtraAttempts: r.allowAutomaticRetry && r.allowSameTargetRetry !== !1 ? t.upstreamRetryAttempts : 0,
        isRetry: !1,
        requestLifecycle: t.requestLifecycle,
        segmentFastPathEnabled: c
      });
      let u = l.response, d = l.targetRecord || null, f = d?.targetUrl || (t.playbackRelayTargetUrl instanceof URL ? new URL(t.playbackRelayTargetUrl.toString()) : null), m = l.finalUrl, p = l.releaseFetchController, h = l.protocolFallbackRetry === !0, g = l.protocolFallbackRetryFailed === !0, y = !1, _ = null, S = 0, A = t.requestMethod, E = r.preparedBodyMode, T = r.preparedBody;
      for (t.defaultOutboundColo = Ga(u) || ""; u.status >= 300 && u.status < 400 && S < 8; ) {
        const w = Number(u.status) || 0, D = Ea(u.headers.get("Location"), m || f);
        if (!D) {
          e.finalizeRedirectTrace(i, {
            terminalMode: "invalid_redirect_target",
            finalStatus: w,
            finalHost: m?.hostname || f?.hostname || ""
          });
          break;
        }
        const k = Ia(D, f).proxyPath || (D.origin === f?.origin ? D.pathname : null);
        if (k && pa(k)) {
          e.recordRedirectTraceHop(i, w, D, {
            isSameOriginRedirect: !0,
            traceAction: "blocked_web"
          }), e.finalizeRedirectTrace(i, {
            terminalMode: "web_proxy_disabled",
            finalStatus: 404,
            finalHost: D.hostname || ""
          });
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            p?.();
          } catch {
          }
          u = Sn(t.requestMethod, t.dynamicCors), m = D, p = null, S += 1;
          break;
        }
        const b = e.enforceStrictClientDirectAuthPolicy(t, e.getRoutingDecision({
          phase: "redirect",
          nextUrl: D,
          activeTargetBase: f,
          redirectMethod: A,
          redirectBodyMode: E,
          forceWorkerProxy: t.forceWorkerProxy === !0,
          forceWorkerProxyReason: t.forceWorkerProxyReason,
          currentStatus: u.status,
          policy: {
            forceVideoDirect: s.forceVideoDirect === !0,
            forceVideoProxy: s.forceVideoProxy === !0,
            currentStatus: u.status
          },
          routingDecisionMode: t.routingDecisionMode
        }), r, {
          redirectStatus: u.status,
          redirectMethod: A,
          redirectBodyMode: E
        });
        if (e.recordRedirectTraceHop(i, w, D, b), b.action === "DIRECT") {
          const L = r.clientRedirectAuthPolicy || Ra(r.newHeaders);
          if (L.canDirect !== !0)
            throw t.directRedirectAuthReason = L.reason || "direct_transport_incompatible", e.finalizeRedirectTrace(i, {
              terminalMode: "direct_incompatible",
              finalStatus: 409,
              finalHost: D.hostname || ""
            }), e.createDirectTransportIncompatibleError(t, { redirectTrace: i });
          const v = e.buildClientVisibleRedirectUrl(D, f, t.nodeName, t.nodeKey, t.requestUrl, {
            preserveWorkerProxy: b.preserveWorkerProxy === !0,
            linkVariant: t.linkVariant,
            entryMode: t.entryMode
          }) || D;
          _ = b.preserveWorkerProxy === !0 ? v : Go(v, r.clientRedirectAuthPolicy || r.newHeaders, t.effectiveMediaAuthMode), e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: w,
            finalHost: _.hostname || D.hostname || ""
          });
          break;
        }
        const N = b.nextMethod, R = b.nextBodyMode, x = R === "none" ? null : T;
        try {
          u.body?.cancel?.();
        } catch {
        }
        try {
          p?.();
        } catch {
        }
        let O;
        try {
          O = await e.fetchAbsoluteWithRetryLoop({
            absoluteUrl: D,
            buildFetchOptions: a,
            fetchOptions: {
              method: N,
              bodyMode: R,
              body: x,
              isExternalRedirect: !b.isSameOriginRedirect
            },
            retryableStatuses: n,
            protocolFallback: t.protocolFallback,
            preparedBodyMode: R,
            allowAutomaticRetry: r.allowAutomaticRetry,
            stripAuthOnProtocolFallback: t.requestTraits.canStripAuthOnProtocolFallback,
            upstreamTimeoutMs: t.upstreamTimeoutMs,
            maxExtraAttempts: r.allowAutomaticRetry && r.allowSameTargetRetry !== !1 ? t.upstreamRetryAttempts : 0,
            isRetry: !1,
            requestLifecycle: t.requestLifecycle
          });
        } catch (L) {
          if (t.requestTraits?.isImage && !b.isSameOriginRedirect) {
            _ = e.buildClientVisibleRedirectUrl(D, f, t.nodeName, t.nodeKey, t.requestUrl, {
              preserveWorkerProxy: !1,
              linkVariant: t.linkVariant,
              entryMode: t.entryMode
            }) || D, e.finalizeRedirectTrace(i, {
              terminalMode: "client_redirect",
              finalStatus: w || 301,
              finalHost: _.hostname || D.hostname || ""
            }), u = new Response(null, {
              status: w || 301,
              statusText: "Moved Permanently"
            }), m = D, p = null;
            break;
          }
          throw e.finalizeRedirectTrace(i, {
            terminalMode: "proxy_error_after_redirect",
            finalStatus: w,
            finalHost: D.hostname || ""
          }), L && typeof L == "object" && (L.redirectTrace = i), L;
        }
        if (u = O.response, m = O.finalUrl, p = O.releaseFetchController, h = h || O.protocolFallbackRetry === !0, g = g || O.protocolFallbackRetryFailed === !0, A = N, E = R, T = x, t.defaultOutboundColo = Ga(u) || "", b.isSameOriginRedirect || (y = !0), S += 1, t.requestTraits?.isImage && !b.isSameOriginRedirect && u.status >= 400) {
          try {
            u.body?.cancel?.();
          } catch {
          }
          try {
            O.releaseFetchController?.();
          } catch {
          }
          _ = e.buildClientVisibleRedirectUrl(D, f, t.nodeName, t.nodeKey, t.requestUrl, {
            preserveWorkerProxy: !1,
            linkVariant: t.linkVariant,
            entryMode: t.entryMode
          }) || D, e.finalizeRedirectTrace(i, {
            terminalMode: "client_redirect",
            finalStatus: w || 301,
            finalHost: _.hostname || D.hostname || ""
          }), u = new Response(null, {
            status: w || 301,
            statusText: "Moved Permanently"
          }), m = D, p = null;
          break;
        }
      }
      if (!i.terminalMode && (i.hops.length > 0 || i.finalStatus > 0)) {
        const w = Number(u?.status) || 0;
        if (w >= 300 && w < 400) {
          const D = Ea(u.headers.get("Location"), m || f);
          e.finalizeRedirectTrace(i, {
            terminalMode: S >= 8 ? "redirect_limit" : "upstream_redirect_passthrough",
            finalStatus: w,
            finalHost: D?.hostname || m?.hostname || f?.hostname || ""
          });
        } else e.finalizeRedirectTrace(i, {
          terminalMode: i.hops.length > 0 ? "proxied_follow" : "no_redirect",
          finalStatus: w,
          finalHost: m?.hostname || f?.hostname || ""
        });
      }
      return {
        response: u,
        finalUrl: m,
        activeTargetRecord: d,
        activeTargetBase: f,
        releaseFetchController: p,
        proxiedExternalRedirect: y,
        directRedirectUrl: _,
        protocolFallbackRetry: h,
        protocolFallbackRetryFailed: g,
        redirectTrace: i
      };
    },
    async buildSuccessResponse(t, r, a, n = null) {
      let s = await e.guardApiResponseMime(t, a);
      t?.requestTraits?.isPlaybackInfoRequest === !0 && (s = await e.guardPlaybackInfoResponseContract(t, s), rr(s.playbackInfoRepresentation) && (s = await e.maybeRewritePlaybackInfoResponse(t, s)));
      const i = String(s.redirectTrace?.terminalMode || t?.redirectTrace?.terminalMode || ""), c = t?.playbackAbsoluteFallbackEligible === !0 && !s.directRedirectUrl && i !== "web_proxy_disabled" && Number(s.response.status) === 404;
      c && (t.playbackFallback = "relative_307");
      const l = e.shouldLogDirectAccess(t, { directRedirectUrl: s.directRedirectUrl }), u = l ? "" : e.buildRedirectDiagnosticDetail(s.redirectTrace || t.redirectTrace), d = s.response.status, f = c ? 307 : s.directRedirectUrl && Number(s.redirectTrace?.finalStatus) || d, m = c ? "Temporary Redirect" : s.response.statusText;
      e.markFailoverBusinessSuccess(t, s.activeTargetRecord, { status: d });
      const p = e.buildProxyResponseHeaders(s.response, t.request, t.dynamicCors, t.finalOrigin, t.requestTraits, {
        enableH3: t.enableH3,
        forceH1: t.forceH1,
        proxiedExternalRedirect: s.proxiedExternalRedirect,
        imageCacheMaxAge: t.imageCacheMaxAge
      });
      e.applyProxyRedirectHeaders(p, s.response, s.activeTargetBase, t.nodeName, t.nodeKey, s.directRedirectUrl, s.finalUrl, {
        linkVariant: t.linkVariant,
        entryMode: t.entryMode
      }), c && (Kc(p), p.set("Location", t.playbackAbsoluteFallbackLocation || "/"), p.set("Cache-Control", "no-store"));
      const h = !c && e.shouldManageProxyResponseBody(t, s), g = t.defaultOutboundColo || "", y = e.buildRuntimeDiagnosticDetail(t), _ = l ? e.buildDirectAccessDiagnosticDetail(t, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || t.redirectTrace
      }) : e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(s.response), e.buildStreamDiagnosticDetail(t, s.response, {
        flow: h ? "managed" : "passthrough",
        source: "upstream",
        upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
        protocolFallbackRetry: s.protocolFallbackRetry === !0,
        idleTimeoutMs: h ? e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs) : 0
      })), e.appendLogDiagnosticDetail(y, u)), S = l ? e.buildDirectAccessLogPayload(t, f, g, {
        directRedirectUrl: s.directRedirectUrl,
        redirectTrace: s.redirectTrace || t.redirectTrace
      }) : {
        statusCode: c ? f : d,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: _,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: c ? f : d }, {
          transport: null,
          deliveryMode: "proxy",
          redirectTrace: s.redirectTrace || t.redirectTrace,
          redirectMode: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          redirectUrl: s.finalUrl,
          decisionReason: c ? "playback_relative_fallback" : s.redirectTrace?.terminalMode || "proxied_follow",
          protocolFailureReason: s.protocolFallbackRetry === !0 || s.protocolFallbackRetryFailed === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            upstreamStatus: d,
            protocolFallbackRetry: !0
          }) : Number(d) >= 400 ? e.classifyProtocolFailureReason(_ || s.response.statusText || "", {
            upstreamStatus: d,
            protocolFallbackRetry: s.protocolFallbackRetry === !0
          }) : null,
          protocolFallbackRetry: s.protocolFallbackRetry === !0,
          playbackInfoCache: t.playbackInfoCacheState,
          playbackInfoCacheTtlSec: t.playbackInfoCacheTtlSec,
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamHost: s.finalUrl?.hostname || s.activeTargetBase?.hostname || "",
          upstreamStatus: d
        }),
        outboundColo: g
      };
      if (h || e.recordAccessLog(t, S), t.metadataCacheKey && t.ctx && s.response.status === 200) {
        const T = s.response.clone();
        t.ctx.waitUntil(e.storeMetadataCache(t.metadataCacheKey, T, t.requestTraits, {
          sourceUrl: t.requestUrl,
          prewarmCacheTtl: t.requestTraits.prewarmCacheTtl,
          imageCacheMaxAge: t.imageCacheMaxAge,
          proxiedExternalRedirect: s.proxiedExternalRedirect === !0
        }));
      }
      t.requestTraits.isPlaybackInfoRequest === !0 && await e.storePlaybackInfoResponseCache(t, s.response, null, s.playbackInfoRepresentation), e.scheduleMetadataPrewarmResponse(t.request, s.response, t.requestTraits, s.activeTargetBase, r, t.nodeName, t.nodeKey, t.requestUrl, t.ctx, {
        proxyPath: t.proxyPath,
        prewarmCacheTtl: t.requestTraits.prewarmCacheTtl,
        imageCacheMaxAge: t.imageCacheMaxAge,
        nodeCacheRevision: t.nodeDerivedCacheRevision,
        entryMode: t.entryMode,
        identityPartition: t.metadataCacheIdentityPartition
      }), e.maybeScheduleBackgroundFailoverRefresh(t, s);
      const A = s.response;
      if (c) {
        try {
          s.response.body?.cancel?.();
        } catch {
        }
        try {
          s.releaseFetchController?.();
        } catch {
        }
        return t.requestLifecycle?.dispose?.(), new Response(null, {
          status: f,
          statusText: m,
          headers: p
        });
      }
      if (s.response.status === 101 && A.webSocket) {
        try {
          s.releaseFetchController?.();
        } catch {
        }
        t.requestLifecycle?.dispose?.();
        const T = {
          status: 101,
          statusText: s.response.statusText,
          headers: p,
          webSocket: A.webSocket
        };
        return new Response(null, T);
      }
      let E;
      return h ? E = e.buildManagedProxyResponseBody(t, s, S) : E = e.buildPassthroughProxyResponseBody(t, s), new Response(E, {
        status: f,
        statusText: m,
        headers: p
      });
    }
  };
}
function gg(o = {}, e = {}) {
  return {
    buildErrorResponse(t, r) {
      const a = r?.message || String(r || "网关或 CF Workers 内部崩溃"), n = String(r?.code || "").toUpperCase(), s = e.buildRedirectDiagnosticDetail(r?.redirectTrace || t.redirectTrace), i = e.buildRuntimeDiagnosticDetail(t);
      let c = 502, l = "Bad Gateway", u = {
        error: "Bad Gateway",
        code: 502,
        message: "All proxy attempts failed."
      };
      n === "UPSTREAM_TIMEOUT" || n === "STREAM_IDLE_TIMEOUT" ? (c = 504, l = "Gateway Timeout", u = {
        error: "Gateway Timeout",
        code: 504,
        message: "Upstream response timed out."
      }) : n === "DIRECT_TRANSPORT_INCOMPATIBLE" ? (c = 409, l = "Conflict", u = {
        error: "Conflict",
        code: 409,
        message: "DIRECT mode is strict and will not fall back to proxy when custom auth headers or cookies are required."
      }) : (n === "CLIENT_ABORTED" || n === "DOWNSTREAM_CANCELLED" || n === "REQUEST_ABORTED") && (c = 499, l = "Client Closed Request", u = {
        error: "Client Closed Request",
        code: 499,
        message: "Client closed request."
      });
      try {
        t.requestLifecycle?.abort?.(n ? n.toLowerCase() : "proxy_error");
      } catch {
      }
      t.requestLifecycle?.dispose?.(), n === "DIRECT_TRANSPORT_INCOMPATIBLE" ? e.recordAccessLog(t, e.buildDirectAccessLogPayload(t, c, t.defaultOutboundColo || "", { redirectTrace: r?.redirectTrace || t.redirectTrace })) : e.recordAccessLog(t, {
        statusCode: c,
        category: c === 499 ? e.classifyProxyLogCategory(t.requestTraits || {}) : "error",
        errorDetail: e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(t, null, {
          flow: "proxy_error",
          source: "upstream_pending",
          upstreamHost: r?.lastFinalUrl?.hostname || r?.lastTargetBase?.hostname || "",
          idleTimeoutMs: e.resolveResponseStreamIdleTimeoutMs(t.requestTraits || {}, t.upstreamTimeoutMs)
        })), e.appendLogDiagnosticDetail(i, s)),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: c }, {
          deliveryMode: "proxy",
          redirectTrace: r?.redirectTrace || t.redirectTrace,
          redirectMode: "proxy_error",
          redirectUrl: r?.lastFinalUrl,
          decisionReason: n || "proxy_error",
          protocolFailureReason: e.classifyProtocolFailureReason(r, {
            errorCode: n,
            message: a,
            protocolFallbackRetry: !1,
            upstreamStatus: c
          }),
          playbackInfoCache: t.playbackInfoCacheState,
          playbackInfoCacheTtlSec: t.playbackInfoCacheTtlSec,
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamHost: r?.lastFinalUrl?.hostname || r?.lastTargetBase?.hostname || "",
          upstreamStatus: c
        }),
        outboundColo: t.defaultOutboundColo || ""
      });
      const d = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": t.finalOrigin || "*",
        "Cache-Control": "no-store"
      });
      return t.finalOrigin !== "*" && Ur(d, "Origin"), Ce(d), new Response(JSON.stringify(u), {
        status: c,
        statusText: l,
        headers: d
      });
    },
    async handle(t, r, a, n, s, i, c, l = {}) {
      if (pa(a)) {
        const g = $(l.runtimeConfig) ? l.runtimeConfig : {}, y = La(i, t, e.resolveCorsOrigin(g, t));
        return Sn(t.method, y);
      }
      let u = await e.prepareExecutionContext(t, r, a, n, s, i, c, l);
      if (u.invalidResponse) return u.invalidResponse;
      const d = await e.resolveEarlyResponse(u);
      if (d) return d;
      let { targetRecords: f, invalidResponse: m } = e.parseTargetRecords(u.node, u.finalOrigin, { cachedTargetRecords: u.playbackRouteHotTargetRecords });
      if (m) return m;
      let p = e.prepareFailoverOverlay(u, f);
      u.defaultOutboundColo = "";
      let h = null;
      try {
        h = await e.buildProxyRequestState(u.request, u.node, u.proxyPath, u.requestUrl, u.clientIp, u.requestTraits, u.forceH1, p, {
          effectiveRealClientIpMode: u.effectiveRealClientIpMode,
          effectiveMediaAuthMode: u.effectiveMediaAuthMode
        });
        const g = await e.tryServePlaybackInfoResponseCache(u, h);
        if (g) return g;
        const y = e.createBuildFetchOptions(u, h), _ = await e.maybeBuildEntryDirectResponse(u, f, h, y);
        if (_) return _;
        const S = await e.maybeHandlePlaybackProgressRelay(u, h, y, h.retryTargetRecords);
        if (S) return S;
        u.requestLifecycle = ll(u.request?.signal);
        const A = await e.executeUpstreamFlow(u, h, y);
        return await e.buildSuccessResponse(u, y, A, h);
      } catch (g) {
        return e.buildErrorResponse(u, g);
      }
    }
  };
}
function hg(o = {}, e = {}) {
  return {
    ...mg(o, e),
    ...pg(o, e),
    ...gg(o, e)
  };
}
function yg(o = {}, e = {}) {
  return {
    resolveEntryDirectTargetUrl(t, r) {
      if (t?.playbackRelayTargetUrl instanceof URL) return new URL(t.playbackRelayTargetUrl.toString());
      const a = hr(r, t?.proxyPath || "/");
      return a.search = String(t?.requestUrl?.search || ""), a;
    },
    classifyProxyLogCategory(t) {
      return t.isSegment ? "segment" : t.isManifest ? "manifest" : t.isBigStream || t.isSmartStrmMedia ? "stream" : t.isImage ? "image" : t.isSubtitle ? "subtitle" : t.isStaticFile ? "asset" : t.isWsUpgrade ? "websocket" : "api";
    },
    extractProxyErrorDetail(t) {
      if (t.status < 400) return null;
      const r = [], a = t.headers.get("Server");
      a && r.push(`Server: ${a}`);
      const n = t.headers.get("CF-Ray");
      n && r.push(`CF-Ray: ${n}`);
      const s = t.headers.get("X-Application-Error-Code") || t.headers.get("X-Emby-Error") || t.headers.get("X-MediaBrowser-Error");
      s && r.push(`Media-Server-Error: ${s}`);
      const i = t.headers.get("CF-Cache-Status");
      return i && r.push(`CF-Cache: ${i}`), r.length > 0 ? r.join(" | ") : t.statusText;
    },
    appendLogDiagnosticDetail(t, r) {
      const a = [], n = (i) => {
        const c = String(i || "").trim();
        c && (a.includes(c) || a.push(c));
      };
      if (n(t), n(r), !a.length) return null;
      const s = a.join(" | ");
      return s.length > 1200 ? s.slice(0, 1197) + "..." : s;
    },
    shouldLogDirectAccess(t, r = {}) {
      return !!(e.isEntryDirectDataPlaneMode(t?.entryRoutingDecision?.dataPlaneMode) || r.directRedirectUrl);
    },
    buildDirectAccessDiagnosticDetail(t, r = {}) {
      let a = "直连";
      a = e.appendLogDiagnosticDetail(a, `RoutingMode=${Pr(t?.routingDecisionMode)}`), a = e.appendLogDiagnosticDetail(a, e.buildTargetHotCacheDiagnosticDetail(t));
      const n = t?.entryRoutingDecision;
      return e.isEntryDirectDataPlaneMode(n?.dataPlaneMode) && (a = e.appendLogDiagnosticDetail(a, `Direct=entry_307 | Reason=${String(n?.reason || n?.traceLabel || "entry_direct").trim() || "entry_direct"}`)), a = e.appendLogDiagnosticDetail(a, e.buildPlaybackUrlDiagnosticDetail(t)), a = e.appendLogDiagnosticDetail(a, t?.directRedirectAuthReason ? `DirectAuth=${t.directRedirectAuthReason}` : ""), a = e.appendLogDiagnosticDetail(a, e.buildRouteContextDiagnosticDetail(t)), a = e.appendLogDiagnosticDetail(a, e.buildStreamDiagnosticDetail(t, null, {
        force: !0,
        flow: r.directRedirectUrl ? "client_redirect" : "entry_direct",
        source: "client_visible_redirect"
      })), (r.directRedirectUrl || r.redirectTrace) && (a = e.appendLogDiagnosticDetail(a, e.buildRedirectDiagnosticDetail(r.redirectTrace || t?.redirectTrace))), a;
    },
    buildDirectAccessLogPayload(t, r, a = "", n = {}) {
      return {
        statusCode: r,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: e.buildDirectAccessDiagnosticDetail(t, n),
        detailJson: e.buildStructuredLogDetail(t, { statusCode: r }, {
          ...n,
          deliveryMode: "direct",
          redirectMode: n.directRedirectUrl ? "client_redirect" : "entry_307",
          decisionReason: String(n.decisionReason || t?.directRedirectAuthReason || t?.entryRoutingDecision?.reason || t?.entryRoutingDecision?.traceLabel || "").trim()
        }),
        outboundColo: a
      };
    },
    buildStreamDiagnosticDetail(t, r, a = {}) {
      const n = t?.requestTraits || {};
      if (!(a.force === !0 || n.isBigStream === !0 || n.isSmartStrmMedia === !0 || n.isSegment === !0 || n.isManifest === !0)) return "";
      const s = r?.headers, i = [], c = (l, u) => {
        const d = String(u || "").trim();
        d && i.push(`${l}=${d.length > 160 ? d.slice(0, 157) + "..." : d}`);
      };
      return c("Flow", a.flow || "passthrough"), c("Kind", e.classifyProxyLogCategory(n)), c("Source", a.source || "upstream"), c("Range", n.rangeHeader || t?.request?.headers?.get("Range")), c("Content-Range", s?.get("Content-Range")), c("Length", s?.get("Content-Length")), c("Accept-Ranges", s?.get("Accept-Ranges")), c("Cache", a.cacheStatus || s?.get("CF-Cache-Status")), c("Upstream", a.upstreamHost || a.upstreamUrlHost), c("RoutingMode", Pr(t?.routingDecisionMode)), c("DirectAuth", t?.directRedirectAuthReason), a.protocolFallbackRetry === !0 && c("Retry", "protocol_fallback"), Number(a.idleTimeoutMs) > 0 && c("Idle", `${Number(a.idleTimeoutMs)}ms`), i.join(" | ");
    },
    buildPlaybackInfoCacheDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      const r = Gt(t?.effectivePlaybackInfoMode), a = String(t?.playbackInfoCacheState || "").trim(), n = String(t?.playbackInfoRewrite || "").trim(), s = [`PlaybackInfoMode=${r}`];
      return n && s.push(`PlaybackInfoRewrite=${n}`), a && s.push(`PlaybackInfoCache=${a}`), Number(t?.playbackInfoCacheTtlSec) > 0 && s.push(`PlaybackInfoCacheTtl=${Number(t.playbackInfoCacheTtlSec)}s`), s.join(" | ");
    },
    buildPlaybackUrlDiagnosticDetail(t) {
      const r = String(t?.playbackUrlMode || "").trim(), a = String(t?.playbackFallback || "").trim(), n = String(t?.playbackPathFix || "").trim(), s = String(t?.rewritePlaybackEntry || "").trim(), i = [];
      return r && i.push(`PlaybackUrlMode=${r}`), a && i.push(`PlaybackFallback=${a}`), n && i.push(`PlaybackPathFix=${n}`), s && i.push(`RewritePlaybackEntry=${s}`), i.join(" | ");
    },
    buildTargetHotCacheDiagnosticDetail(t) {
      const r = String(t?.nodeCacheState || t?.targetHotCacheState || "").trim();
      return r ? t?.nodeCacheState ? `NodeCacheState=${r}` : `TargetHotCache=${r}` : "";
    },
    buildRouteContextDiagnosticDetail(t) {
      const r = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null;
      if (!r) return "";
      const a = [], n = (s, i) => {
        const c = String(i || "").trim();
        c && a.push(`${s}=${c}`);
      };
      return n("RouteKind", r.routeKind), n("RequestHost", r.requestHost), n("ConfiguredHost", r.configuredHost), n("ConfiguredLegacyHost", r.configuredLegacyHost), a.push(`LegacyHostRequest=${r.isLegacyHostRequest === !0 ? "true" : "false"}`), a.join(" | ");
    },
    buildRuntimeDiagnosticDetail(t) {
      return e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.appendLogDiagnosticDetail(e.buildTargetHotCacheDiagnosticDetail(t), e.buildPlaybackInfoCacheDiagnosticDetail(t)), e.buildFailoverDiagnosticDetail(t)), e.buildPlaybackUrlDiagnosticDetail(t)), e.appendLogDiagnosticDetail(e.buildProgressRelayDiagnosticDetail(t), e.buildRouteContextDiagnosticDetail(t)));
    },
    buildProgressRelayDiagnosticDetail(t) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return "";
      const r = String(t?.progressForwardMode || "").trim();
      if (!r) return "";
      const a = [`ProgressRelay=${r}`];
      Number(t?.videoProgressForwardIntervalSec) > 0 && a.push(`ProgressInterval=${Number(t.videoProgressForwardIntervalSec)}s`);
      const n = String(t?.progressForwardSessionKey || "").trim();
      return n && a.push(`ProgressSession=${ne(n)}`), a.join(" | ");
    },
    collectLogAuthKinds(t, r = null) {
      const a = /* @__PURE__ */ new Set(), n = t?.requestUrl instanceof URL ? t.requestUrl : null;
      if (n) for (const c of n.searchParams.keys()) {
        const l = Ma(c);
        if (il.has(l) || cl.has(l)) {
          a.add("query");
          break;
        }
      }
      const s = r?.newHeaders || t?.request?.headers || new Headers(), i = r?.clientRedirectAuthPolicy || Ra(s);
      return i.hasQueryAuth && a.add("query"), i.hasHeaderAuth && a.add("header"), i.hasCookieAuth && a.add("cookie"), [...a];
    },
    pickPrimaryAuthCarrier(t = []) {
      return (t || []).includes("query") ? "query" : (t || []).includes("header") ? "header" : (t || []).includes("cookie") ? "cookie" : "none";
    },
    resolveRedirectScope(t, r) {
      if (!t) return "none";
      try {
        const a = t instanceof URL ? t : new URL(String(t || "")), n = r instanceof URL ? r : new URL(String(r || ""));
        return a.origin === n.origin ? "same_origin" : "external";
      } catch {
        return "external";
      }
    },
    resolveRoutingCapability(t = "proxy", r = [], a = "none") {
      const n = String(t || "").trim().toLowerCase() === "direct" ? "direct" : "proxy", s = e.pickPrimaryAuthCarrier(r), i = a === "same_origin" || a === "external" ? a : "none";
      return rg?.[n]?.[s]?.[i] || {
        deliveryMode: n,
        authCarrier: s,
        redirectScope: i,
        clientVisibleRedirect: n === "direct" && i !== "none",
        workerFollowRedirect: n !== "direct",
        reasonCode: n === "direct" ? "client_redirect" : "worker_follow_redirect"
      };
    },
    classifyProtocolFailureReason(t, r = {}) {
      const a = String(r.errorCode || t?.code || "").trim().toUpperCase(), n = String(r.message || t?.message || t || "").trim().toLowerCase(), s = Number(r.upstreamStatus) || 0;
      return String(r.abortReason || "").trim().toLowerCase() === "stream_idle_timeout" || a === "STREAM_IDLE_TIMEOUT" ? "idle_timeout" : a === "UPSTREAM_TIMEOUT" || n.includes("timed out") || n.includes("timeout") ? "connect_timeout" : n.includes("redirect loop") ? "redirect_loop" : n.includes("too many redirects") || n.includes("redirect limit") ? "redirect_limit_exceeded" : n.includes("tls") || n.includes("ssl") || n.includes("certificate") ? "tls_handshake_failed" : r.protocolFallbackRetry === !0 || n.includes("protocol_fallback") ? "http_version_fallback" : s === 416 || n.includes("range") && (n.includes("416") || n.includes("unsatisfied") || n.includes("satisfiable")) ? "range_unsatisfied" : s >= 400 && s < 500 ? "upstream_4xx" : s >= 500 ? "upstream_5xx" : "unknown_fetch_error";
    },
    buildStructuredLogDetail(t, r = {}, a = {}) {
      const n = String(a.deliveryMode || (e.shouldLogDirectAccess(t, { directRedirectUrl: a.directRedirectUrl }) ? "direct" : "proxy")).trim().toLowerCase() === "direct" ? "direct" : "proxy", s = e.collectLogAuthKinds(t, a.transport), i = a.redirectScope || e.resolveRedirectScope(a.directRedirectUrl || a.redirectUrl || a.finalUrl, t?.requestUrl), c = e.resolveRoutingCapability(n, s, i), l = Number(a.upstreamStatus || r.statusCode || 0) || 0, u = Kd(l), d = t?.routeContextDiagnostics && typeof t.routeContextDiagnostics == "object" ? t.routeContextDiagnostics : null, f = Array.isArray(a.authKindsForwarded) ? [...new Set(a.authKindsForwarded.map((p) => String(p || "").trim().toLowerCase()).filter(Boolean))] : n === "direct" ? s.filter((p) => p === "query") : s, m = e.ensureFailoverTelemetry(t);
      return {
        routingMode: Pr(t?.routingDecisionMode),
        entryDecision: t?.entryRoutingDecision ? {
          dataPlaneMode: String(t.entryRoutingDecision.dataPlaneMode || "").trim(),
          reason: String(t.entryRoutingDecision.reason || t.entryRoutingDecision.traceLabel || "").trim()
        } : null,
        redirectDecision: a.redirectDecision && typeof a.redirectDecision == "object" ? a.redirectDecision : {
          mode: String(a.redirectMode || a.redirectTrace?.terminalMode || c.reasonCode || "").trim(),
          reason: String(a.decisionReason || t?.directRedirectAuthReason || c.reasonCode || "").trim()
        },
        deliveryMode: n,
        redirectScope: i,
        authKindsPresent: s,
        authKindsForwarded: f,
        decisionReason: String(a.decisionReason || t?.directRedirectAuthReason || c.reasonCode || "").trim(),
        routeKind: String(d?.routeKind || "").trim() || null,
        requestHost: String(d?.requestHost || "").trim() || null,
        configuredHost: String(d?.configuredHost || "").trim() || null,
        configuredLegacyHost: String(d?.configuredLegacyHost || "").trim() || null,
        isLegacyHostRequest: d?.isLegacyHostRequest === !0,
        statusReasonCode: u.code,
        statusReasonText: u.text,
        protocolFailureReason: String(a.protocolFailureReason || "").trim() || null,
        protocolFallbackRetry: a.protocolFallbackRetry === !0,
        failoverState: e.buildFailoverStateSummary(t),
        probeReason: String(a.probeReason || m.probeReason || "").trim() || null,
        probeWinner: String(a.probeWinner || m.probeWinner || "").trim() || null,
        probeElapsedMs: Math.max(0, Math.round(Number(a.probeElapsedMs ?? m.probeElapsedMs) || 0)) || null,
        waitJoinMs: Math.max(0, Math.round(Number(a.waitJoinMs ?? m.waitJoinMs) || 0)) || null,
        demotedTarget: String(a.demotedTarget || m.demotedTarget || "").trim() || null,
        preferredTarget: String(a.preferredTarget || m.preferredTarget || "").trim() || null,
        fastFailReason: String(a.fastFailReason || m.fastFailReason || "").trim() || null,
        targetHotCache: String(a.targetHotCache || t?.targetHotCacheState || "").trim() || null,
        nodeCacheState: String(a.nodeCacheState || t?.nodeCacheState || "").trim() || null,
        playbackInfoCache: String(a.playbackInfoCache || t?.playbackInfoCacheState || "").trim() || null,
        playbackInfoCacheTtlSec: Number.isFinite(Number(a.playbackInfoCacheTtlSec)) ? Math.max(0, Math.trunc(Number(a.playbackInfoCacheTtlSec))) : Math.max(0, Math.trunc(Number(t?.playbackInfoCacheTtlSec) || 0)),
        playbackInfoMode: t?.requestTraits?.isPlaybackInfoRequest === !0 ? Gt(a.playbackInfoMode || t?.effectivePlaybackInfoMode) : null,
        playbackInfoRewrite: t?.requestTraits?.isPlaybackInfoRequest === !0 && String(a.playbackInfoRewrite || t?.playbackInfoRewrite || "").trim() || null,
        playbackUrlMode: String(a.playbackUrlMode || t?.playbackUrlMode || "").trim() || null,
        playbackFallback: String(a.playbackFallback || t?.playbackFallback || "").trim() || null,
        playbackPathFix: String(a.playbackPathFix || t?.playbackPathFix || "").trim() || null,
        rewritePlaybackEntry: String(a.rewritePlaybackEntry || t?.rewritePlaybackEntry || "").trim() || null,
        progressRelayMode: String(a.progressRelayMode || t?.progressForwardMode || "").trim() || null,
        progressIntervalSec: Number.isFinite(Number(a.progressIntervalSec)) ? Math.max(0, Math.trunc(Number(a.progressIntervalSec))) : Math.max(0, Math.trunc(Number(t?.videoProgressForwardIntervalSec) || 0)),
        rangeRequest: !!String(t?.request?.headers?.get("Range") || "").trim(),
        upstreamHost: String(a.upstreamHost || a.upstreamUrlHost || a.finalUrl?.hostname || "").trim(),
        upstreamStatus: l
      };
    },
    createRedirectTrace(t) {
      return {
        initialUrl: t ? String(t) : "",
        hops: [],
        terminalMode: "",
        finalStatus: 0,
        finalHost: ""
      };
    },
    recordRedirectTraceHop(t, r, a, n = {}) {
      !t || !a || t.hops.push({
        status: Number(r) || 0,
        kind: n.isSameOriginRedirect === !0 ? "same" : "external",
        action: String(n.traceAction || (e.isEntryDirectDataPlaneMode(n.dataPlaneMode) ? "direct" : "proxy")).trim() || "proxy",
        host: String(a.hostname || "").trim().toLowerCase()
      });
    },
    finalizeRedirectTrace(t, r = {}) {
      if (!t || typeof t != "object") return null;
      const a = String(r.terminalMode || t.terminalMode || "").trim();
      a && (t.terminalMode = a);
      const n = Number(r.finalStatus);
      Number.isFinite(n) && n > 0 && (t.finalStatus = n);
      const s = String(r.finalHost || "").trim().toLowerCase();
      return s && (t.finalHost = s), t;
    },
    buildRedirectDiagnosticDetail(t) {
      if (!t || typeof t != "object") return "";
      const r = Array.isArray(t.hops) ? t.hops : [], a = r.length, n = String(t.terminalMode || "").trim(), s = Number(t.finalStatus) || 0, i = String(t.finalHost || "").trim().toLowerCase();
      if (!a && !n && s <= 0 && !i) return "";
      const c = [];
      n && c.push(`Redirect=${n}`), c.push(`RedirectHops=${a}`);
      const l = r.map((u) => {
        const d = Number(u?.status) || 0, f = String(u?.kind || "").trim() || "unknown", m = String(u?.action || "").trim() || "proxy", p = String(u?.host || "").trim().toLowerCase();
        return [
          d || "0",
          f,
          m,
          p
        ].filter(Boolean).join(":");
      }).filter(Boolean).join(">");
      return l && c.push(`RedirectChain=${l.length > 240 ? l.slice(0, 237) + "..." : l}`), s > 0 && c.push(`RedirectFinal=${s}`), i && c.push(`RedirectFinalHost=${i}`), c.join(" | ");
    }
  };
}
function Sg(o = {}, e = {}) {
  return {
    buildProxyErrorState: Fn,
    async guardApiResponseMime(t, r) {
      return Al(t, r, {
        sanitizePath: J,
        buildErrorState: Fn
      });
    },
    buildMetadataCacheStorageResponse(t, r, a = {}) {
      const n = new Headers(t.headers);
      return n.delete("Set-Cookie"), r.isImage || r.isSubtitle ? n.set("Cache-Control", `public, max-age=${Math.max(0, Number(a.imageCacheMaxAge) || 0)}`) : r.isManifest && n.set("Cache-Control", `public, max-age=${Math.max(0, Number(a.prewarmCacheTtl) || 0)}`), new Response(t.body, {
        status: t.status,
        statusText: t.statusText,
        headers: n
      });
    },
    async storeMetadataCache(t, r, a, n = {}) {
      const s = ur();
      if (!s || !t || !r || r.status !== 200 || n.proxiedExternalRedirect === !0 || a.isManifest && !no(n.sourceUrl)) return !1;
      try {
        return await s.put(t, e.buildMetadataCacheStorageResponse(r, a, n)), !0;
      } catch {
        return !1;
      }
    },
    resolveMetadataTarget(t, r, a, n) {
      const s = String(t || "").trim();
      if (!s) return null;
      let i;
      try {
        if (/^https?:\/\//i.test(s)) i = new URL(s);
        else {
          const u = new URL(s, "https://metadata-prewarm.invalid");
          i = hr(r, u.pathname || "/"), i.search = u.search || "", i.hash = u.hash || "";
        }
      } catch {
        return null;
      }
      if ($p(i.pathname)) return null;
      const { proxyPath: c } = Ia(i, r);
      if (!c) return null;
      const l = c || "/";
      return Gr.test(l) || Wr.test(l) || St.test(l) || pr.test(l) ? {
        upstreamUrl: i,
        proxyPath: l,
        proxySearch: i.search || ""
      } : null;
    },
    buildMetadataPrewarmTargets(t, r, a, n, s, i) {
      const c = /* @__PURE__ */ new Map(), l = Bp(t);
      if (l) {
        const u = e.resolveMetadataTarget(`/Items/${encodeURIComponent(l)}/Images/Primary`, a, n, s);
        u && c.set(`${u.proxyPath}${u.proxySearch}`, u);
      }
      return i !== "poster" && oo(r).forEach((u) => {
        const d = e.resolveMetadataTarget(u, a, n, s);
        d && c.set(`${d.proxyPath}${d.proxySearch}`, d);
      }), [...c.values()].sort((u, d) => Ks(u.proxyPath) - Ks(d.proxyPath)).slice(0, 4);
    },
    buildBudgetedPrewarmResponse(t, r) {
      const a = Math.max(0, Math.floor(Number(r) || 0)), n = tn(t?.headers?.get("Content-Length"));
      if (a <= 0 || Number.isFinite(n) && n > a) {
        try {
          Promise.resolve(t?.body?.cancel?.()).catch(() => {
          });
        } catch {
        }
        return null;
      }
      if (!t?.body) return {
        response: t,
        getBytes: () => 0
      };
      const s = t.body.getReader();
      let i = 0, c = !1;
      const l = () => {
        if (!c) {
          c = !0;
          try {
            s.releaseLock();
          } catch {
          }
        }
      }, u = new ReadableStream({
        async pull(d) {
          try {
            const { done: f, value: m } = await s.read();
            if (f) {
              l(), d.close();
              return;
            }
            const p = m instanceof Uint8Array ? m : new Uint8Array(m || 0);
            if (i + p.byteLength > a) {
              try {
                await s.cancel("metadata_prewarm_budget_exceeded");
              } catch {
              }
              l(), d.error(/* @__PURE__ */ new Error("metadata_prewarm_budget_exceeded"));
              return;
            }
            i += p.byteLength, d.enqueue(p);
          } catch (f) {
            l(), d.error(f);
          }
        },
        async cancel(d) {
          try {
            await s.cancel(d);
          } catch {
          }
          l();
        }
      });
      return {
        response: new Response(u, {
          status: t.status,
          statusText: t.statusText,
          headers: t.headers
        }),
        getBytes: () => i
      };
    },
    async runMetadataPrewarmSingleFlight(t, r) {
      const a = te.MetadataPrewarmTasks, n = t instanceof Request ? t.url : String(t || "");
      if (!n) return {
        skipped: !0,
        result: null
      };
      const s = a.get(n);
      if (s) return {
        joined: !0,
        result: await s
      };
      if (a.size >= Hu) return {
        skipped: !0,
        result: null
      };
      const i = Promise.resolve().then(r).finally(() => {
        a.get(n) === i && a.delete(n);
      });
      return a.set(n, i), {
        joined: !1,
        result: await i
      };
    },
    scheduleMetadataPrewarmResponse(t, r, a, n, s, i, c, l, u, d = {}) {
      if (!u || t.method !== "GET" || a.enablePrewarm !== !0 || a.isPlaybackInfoRequest === !0 || a.isImage || a.isSubtitle || a.isManifest || a.isSegment || a.isBigStream || !(r.status >= 200 && r.status < 300) || !an(r.headers.get("Content-Type"))) return;
      let f;
      try {
        f = r.clone();
      } catch {
        return;
      }
      const m = (async () => {
        const p = await De(f, Pi);
        if (p.exceeded) return;
        let h;
        try {
          h = JSON.parse(p.text);
        } catch {
          return;
        }
        const g = e.buildMetadataPrewarmTargets(d.proxyPath, h, n, i, c, a.prewarmDepth);
        if (!g.length) return;
        const y = ur();
        if (!y) return;
        let _ = le(a.prewarmPrefetchBytes, F.Defaults.PrewarmPrefetchBytes, 0, Ao);
        for (const S of g) {
          if (_ <= 0) break;
          if (!no(S.upstreamUrl)) continue;
          const A = await xp(t, S.upstreamUrl), E = ol(l, i, c, S.proxyPath, {
            search: S.proxySearch,
            nodeCacheRevision: d.nodeCacheRevision,
            entryMode: d.entryMode,
            identityPartition: A,
            cachePolicyRevision: tl(S.proxyPath, d)
          });
          if (E) {
            if (y && E) try {
              if (await y.match(E)) continue;
            } catch {
            }
            try {
              const T = await e.runMetadataPrewarmSingleFlight(E, async () => {
                const w = await s(S.upstreamUrl, { method: "GET" });
                w.cache = "no-store";
                const D = new Headers(w.headers);
                D.delete("Range"), D.delete("If-Modified-Since"), D.delete("If-None-Match"), D.set("X-Metadata-Prewarm", "1"), w.headers = D;
                const k = new AbortController();
                w.signal = k.signal;
                const b = le(d.prewarmTimeoutMs, Mu, 250, 1e4), N = setTimeout(() => k.abort(), b);
                try {
                  const R = await Be(S.upstreamUrl.toString(), w);
                  if (R.status !== 200) {
                    try {
                      await R.body?.cancel?.();
                    } catch {
                    }
                    return {
                      cached: !1,
                      bytes: 0
                    };
                  }
                  const x = e.buildBudgetedPrewarmResponse(R, _);
                  if (!x) return {
                    cached: !1,
                    bytes: 0
                  };
                  const O = {
                    isImage: Gr.test(S.proxyPath) || Wr.test(S.proxyPath),
                    isSubtitle: pr.test(S.proxyPath),
                    isManifest: St.test(S.proxyPath)
                  };
                  return {
                    cached: await e.storeMetadataCache(E, x.response, O, {
                      ...d,
                      sourceUrl: S.upstreamUrl
                    }),
                    bytes: x.getBytes()
                  };
                } finally {
                  clearTimeout(N), k.abort();
                }
              });
              !T.joined && T.result && (_ = Math.max(0, _ - (Number(T.result.bytes) || 0)));
            } catch {
            }
          }
        }
      })().catch(() => {
      });
      return u.waitUntil(m), m;
    },
    shouldRetryWithProtocolFallback(t, r = {}) {
      return !(t.status !== 403 || r.isRetry !== !1 || r.protocolFallback !== !0 || r.allowAutomaticRetry !== !0 || r.preparedBodyMode === "stream" || r.stripAuthOnProtocolFallback !== !0);
    },
    async resolveProtocolFallbackRetry(t, r, a) {
      let n = null, s = null;
      try {
        n = await a();
      } catch (l) {
        s = l;
      }
      if (s && $t(s)) {
        try {
          r.body?.cancel?.();
        } catch {
        }
        try {
          t.releaseFetchController?.();
        } catch {
        }
        throw s;
      }
      const i = n?.response || null;
      if (!s && i && (i.status === 101 || i.status < 400)) {
        try {
          r.body?.cancel?.();
        } catch {
        }
        try {
          t.releaseFetchController?.();
        } catch {
        }
        return n;
      }
      if (i) try {
        i.body?.cancel?.();
      } catch {
      }
      try {
        n?.releaseFetchController?.();
      } catch {
      }
      const c = Number(i?.status) || 0;
      return Ae("proxy.protocol_fallback_retry_failed", s || /* @__PURE__ */ new Error(`protocol fallback retry returned ${c || "no_response"}`), {
        upstreamStatus: Number(r?.status) || 0,
        protocolFallbackRetryStatus: c
      }), {
        ...t,
        protocolFallbackRetry: !1,
        protocolFallbackRetryFailed: !0
      };
    },
    resolveResponseStreamIdleTimeoutMs(t) {
      return t?.isManifest === !0 ? F.Defaults.ProxyPlaylistIdleTimeoutMs : t?.isSegment === !0 ? F.Defaults.ProxyStreamIdleTimeoutMs : 0;
    },
    shouldManageProxyResponseBody(t, r) {
      return (t.requestTraits.isSegment === !0 || t.requestTraits.isManifest === !0) && t.requestMethod !== "HEAD" && r.response.status !== 101 && !!r.response.body;
    },
    buildPassthroughProxyResponseBody(t, r) {
      const a = t.requestMethod === "HEAD" ? null : r.response.body;
      try {
        r.releaseFetchController?.();
      } catch {
      }
      return t.requestLifecycle?.dispose?.(), a;
    },
    buildManagedProxyResponseBody(t, r, a) {
      const n = r.response.body, s = t.requestLifecycle, i = a && typeof a == "object" ? a : {
        statusCode: r.response.status,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: null,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: r.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          upstreamStatus: r.response.status
        })
      };
      if (!n || t.requestMethod === "HEAD" || !s) {
        try {
          r.releaseFetchController?.();
        } catch {
        }
        return s?.dispose?.(), t.requestMethod === "HEAD" ? null : n;
      }
      const c = n.getReader(), l = e.resolveResponseStreamIdleTimeoutMs(t.requestTraits, t.upstreamTimeoutMs), u = {
        ...i,
        detailJson: i?.detailJson || e.buildStructuredLogDetail(t, { statusCode: r.response.status }, {
          deliveryMode: "proxy",
          redirectMode: "proxied_follow",
          decisionReason: "proxied_follow",
          protocolFailureReason: r.protocolFallbackRetry === !0 || r.protocolFallbackRetryFailed === !0 ? e.classifyProtocolFailureReason("protocol_fallback", {
            protocolFallbackRetry: !0,
            upstreamStatus: r.response.status
          }) : Number(r.response.status) >= 400 ? e.classifyProtocolFailureReason(i?.errorDetail || r.response.statusText || "", { upstreamStatus: r.response.status }) : null,
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          upstreamStatus: r.response.status
        }),
        errorDetail: e.appendLogDiagnosticDetail(i.errorDetail, e.buildStreamDiagnosticDetail(t, r.response, {
          flow: "managed",
          source: "upstream",
          upstreamHost: r.finalUrl?.hostname || r.activeTargetBase?.hostname || "",
          idleTimeoutMs: l
        }))
      };
      let d = !1, f = null, m = null, p = () => {
      }, h = !1;
      const g = (A = {}) => {
        if (h) return;
        h = !0;
        const E = {
          ...u,
          ...$(A) ? A : {}
        };
        E.errorDetail = e.appendLogDiagnosticDetail(A.errorDetail, u.errorDetail), E.detailJson = {
          ...u.detailJson,
          ...A.detailJson && typeof A.detailJson == "object" ? A.detailJson : {},
          protocolFailureReason: A?.detailJson?.protocolFailureReason || (Number(E.statusCode) >= 400 ? e.classifyProtocolFailureReason(E.errorDetail, {
            upstreamStatus: E.statusCode,
            protocolFallbackRetry: u?.detailJson?.protocolFallbackRetry === !0
          }) : u?.detailJson?.protocolFailureReason || null),
          upstreamStatus: Number(E.statusCode) || 0
        }, e.recordAccessLog(t, E);
      }, y = () => {
        m !== null && (clearTimeout(m), m = null);
      }, _ = () => {
        if (!d) {
          d = !0, y();
          try {
            p();
          } catch {
          }
          p = () => {
          };
          try {
            c.releaseLock();
          } catch {
          }
          try {
            r.releaseFetchController?.();
          } catch {
          }
          s.dispose();
        }
      }, S = () => {
        d || l <= 0 || (y(), m = setTimeout(() => s.abort("stream_idle_timeout"), l));
      };
      return p = s.onAbort((A) => {
        d || (y(), A === "stream_idle_timeout" ? g({
          statusCode: 504,
          category: "error",
          errorDetail: `stream_idle_timeout_${l}ms`
        }) : A === "client_aborted" || A === "downstream_cancelled" ? g({
          statusCode: 499,
          category: e.classifyProxyLogCategory(t.requestTraits),
          errorDetail: A
        }) : A && g({
          statusCode: 502,
          category: "error",
          errorDetail: String(A)
        }), Promise.resolve(c.cancel(A)).catch(() => {
        }).finally(() => {
          d || _();
        }));
      }), new ReadableStream({
        pull: async (A) => {
          if (!d)
            return f || (S(), f = (async () => {
              try {
                const { done: E, value: T } = await c.read();
                if (y(), E) {
                  const w = s.getAbortReason();
                  if (_(), w === "stream_idle_timeout") {
                    try {
                      A.error(lr(w, `${l}ms`));
                    } catch {
                    }
                    return;
                  }
                  g(), A.close();
                  return;
                }
                A.enqueue(T), S();
              } catch (E) {
                y();
                const T = s.getAbortReason(), w = T === "stream_idle_timeout" ? lr(T, `${l}ms`) : T ? lr(T) : E;
                if (_(), T === "client_aborted" || T === "downstream_cancelled") {
                  g({
                    statusCode: 499,
                    category: e.classifyProxyLogCategory(t.requestTraits),
                    errorDetail: T
                  });
                  try {
                    A.close();
                  } catch {
                  }
                  return;
                }
                g(T === "stream_idle_timeout" ? {
                  statusCode: 504,
                  category: "error",
                  errorDetail: `stream_idle_timeout_${l}ms`
                } : {
                  statusCode: 502,
                  category: "error",
                  errorDetail: E?.message || String(E)
                });
                try {
                  A.error(w);
                } catch {
                }
              } finally {
                f = null;
              }
            })(), f);
        },
        cancel: async (A) => {
          if (!d) {
            s.abort("downstream_cancelled"), y();
            try {
              await c.cancel(A);
            } catch {
            }
            g({
              statusCode: 499,
              category: e.classifyProxyLogCategory(t.requestTraits),
              errorDetail: "downstream_cancelled"
            }), _();
          }
        }
      });
    }
  };
}
function _g(o = {}, e = {}) {
  return {
    async performFetchWithTimeout(t, r, a = {}) {
      const n = await r(t, a), s = Math.max(0, Number(a.timeoutMs) || 0), i = a.requestLifecycle || null;
      let c = null, l = null, u = !1, d = () => {
      };
      (s > 0 || i) && (l = new AbortController(), n.signal = l.signal, i && (d = i.setActiveFetchController(l)), s > 0 && (c = setTimeout(() => {
        u = !0, l.abort(`upstream_timeout_${s}ms`);
      }, s)));
      try {
        return {
          response: await Be(t.toString(), n),
          finalUrl: t,
          releaseFetchController: d
        };
      } catch (f) {
        if (d(), u) {
          const m = /* @__PURE__ */ new Error(`upstream_timeout_${s}ms`);
          throw m.code = "UPSTREAM_TIMEOUT", m;
        }
        if (i && $t(f)) {
          const m = i.getAbortReason();
          if (m) throw lr(m);
        }
        throw f;
      } finally {
        c !== null && clearTimeout(c);
      }
    },
    async performUpstreamFetch(t, r, a, n, s = {}) {
      const i = s.useFastSegmentBuilder === !0, c = i ? new URL(up(t, r, a?.search || "")) : hr(t, r);
      return i || (c.search = a.search), {
        ...await e.performFetchWithTimeout(c, n, s),
        targetRecord: t
      };
    },
    async fetchAbsoluteWithRetryLoop(t) {
      let r = null;
      const a = t.absoluteUrl instanceof URL ? new URL(t.absoluteUrl.toString()) : new URL(String(t.absoluteUrl || "")), n = Math.max(1, le(t.maxExtraAttempts, $n, 0, 3) + 1);
      for (let s = 0; s < n; s++) {
        const i = t.isRetry === !0 || s > 0;
        try {
          const c = await e.performFetchWithTimeout(a, t.buildFetchOptions, {
            ...t.fetchOptions,
            isRetry: i,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle
          }), l = c.response;
          if (l.status === 101) return {
            ...c,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(l, {
            ...t,
            isRetry: i
          })) return await e.resolveProtocolFallbackRetry(c, l, () => e.fetchAbsoluteWithRetryLoop({
            ...t,
            isRetry: !0,
            protocolFallbackRetry: !0
          }));
          const u = s === n - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(l.status) || u) return {
            ...c,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          try {
            l.body?.cancel?.();
          } catch {
          }
          try {
            c.releaseFetchController?.();
          } catch {
          }
        } catch (c) {
          r = c;
          const l = s === n - 1;
          if (t.allowAutomaticRetry !== !0 || l)
            throw c && typeof c == "object" && (c.lastFinalUrl = a), c;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = a), r || /* @__PURE__ */ new Error("redirect_fetch_failed");
    },
    async fetchUpstreamWithRetryLoop(t) {
      let r = null, a = Array.isArray(t.retryTargetRecords) ? t.retryTargetRecords.slice() : [], n = a[0], s = hr(n, t.proxyPath);
      s.search = t.requestUrl.search;
      const i = Math.max(1, le(t.maxExtraAttempts, $n, 0, 3) + 1);
      for (let c = 0; c < i; c++) for (let l = 0; l < a.length; l++) {
        const u = a[l];
        n = u;
        const d = t.isRetry === !0 || c > 0;
        try {
          const f = await e.performUpstreamFetch(u, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
            isRetry: d,
            protocolFallbackRetry: t.protocolFallbackRetry === !0,
            stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
            timeoutMs: t.upstreamTimeoutMs,
            requestLifecycle: t.requestLifecycle,
            useFastSegmentBuilder: t.segmentFastPathEnabled === !0 && d !== !0 && t.protocolFallbackRetry !== !0
          });
          s = f.finalUrl;
          const m = f.response;
          if (m.status === 101) return {
            ...f,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          if (e.shouldRetryWithProtocolFallback(m, {
            ...t,
            isRetry: d
          })) return await e.resolveProtocolFallbackRetry(f, m, () => e.fetchUpstreamWithRetryLoop({
            ...t,
            isRetry: !0,
            protocolFallbackRetry: !0
          }));
          const p = l === a.length - 1, h = c === i - 1;
          if (t.allowAutomaticRetry !== !0 || !t.retryableStatuses.has(m.status) || p && h) return {
            ...f,
            protocolFallbackRetry: t.protocolFallbackRetry === !0
          };
          const g = await e.maybeRunForegroundFailoverWait(t, {
            targetRecord: u,
            responseStatus: m.status,
            reason: `upstream_status_${m.status}`
          });
          if (g?.upstream) {
            const y = g.upstream;
            n = y.targetRecord || u, s = y.finalUrl || s;
            const _ = y.response;
            if (_.status === 101) return {
              ...y,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
            if (!t.retryableStatuses.has(_.status)) return {
              ...y,
              protocolFallbackRetry: t.protocolFallbackRetry === !0
            };
          } else g?.error && (r = g.error);
          try {
            m.body?.cancel?.();
          } catch {
          }
          try {
            f.releaseFetchController?.();
          } catch {
          }
          if (t.execution?.failoverContext?.eligible) {
            const y = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
            a = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, y);
          }
        } catch (f) {
          r = f;
          const m = String(f?.code || "").trim().toUpperCase();
          if (![
            "CLIENT_ABORTED",
            "DOWNSTREAM_CANCELLED",
            "REQUEST_ABORTED"
          ].includes(m)) {
            const g = await e.maybeRunForegroundFailoverWait(t, {
              targetRecord: u,
              reason: m || "network_error"
            });
            if (g?.upstream) {
              const y = g.upstream;
              n = y.targetRecord || u, s = y.finalUrl || s;
              const _ = y.response;
              if (_.status === 101) return {
                ...y,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
              if (!t.retryableStatuses.has(_.status)) return {
                ...y,
                protocolFallbackRetry: t.protocolFallbackRetry === !0
              };
            } else g?.error && (r = g.error);
            if (t.execution?.failoverContext?.eligible) {
              const y = e.getFailoverStateSnapshot(t.execution.failoverContext.cacheKey, t.execution.failoverContext.preferredTtlMs);
              a = e.reorderRetryTargetsForFailover(t.execution.failoverContext.originalTargetRecords, y);
            }
          }
          const p = l === a.length - 1, h = c === i - 1;
          if (p && h)
            throw f && typeof f == "object" && (f.lastFinalUrl = s, f.lastTargetRecord = n, f.lastTargetBase = n?.targetUrl || null), f;
        }
      }
      throw r && typeof r == "object" && (r.lastFinalUrl = s, r.lastTargetRecord = n, r.lastTargetBase = n?.targetUrl || null), r || /* @__PURE__ */ new Error("upstream_fetch_failed");
    }
  };
}
function bg(o = {}, e = {}) {
  const { Logger: t } = o;
  return {
    recordAccessLog(r, a = {}) {
      const n = {
        nodeName: r.nodeName,
        requestPath: r.proxyPath,
        requestMethod: r.requestMethod,
        responseTime: Date.now() - r.startTime,
        clientIp: r.clientIp || "unknown",
        inboundColo: r.logInboundColo || "UNKNOWN",
        outboundColo: a.outboundColo || a.outboundIp || r.defaultOutboundColo || "",
        userAgent: r.request.headers.get("User-Agent"),
        referer: r.request.headers.get("Referer"),
        runtimeConfig: r.currentConfig,
        ...a
      };
      t.record(r.env, r.ctx, n);
    },
    buildOptionsResponse(r) {
      const a = new Headers(r.dynamicCors);
      return Ce(a), r.finalOrigin !== "*" && Ur(a, "Origin"), new Response(null, { headers: a });
    }
  };
}
function Eg(o = {}, e = {}) {
  return {
    ...yg(o, e),
    ...Sg(o, e),
    ..._g(o, e),
    ...bg(o, e)
  };
}
var qs = 4096, Tg = 1440 * 60 * 1e3, Rg = 60 * 1e3;
function Xs(o, e, t) {
  const r = new URL(o.toString());
  return r.searchParams.delete("AnyProviderIdEquals"), r.searchParams.set("SearchTerm", e), /^\d{4}$/.test(t) ? r.searchParams.set("Years", t) : r.searchParams.delete("Years"), r;
}
async function Ag(o, e = {}, t = {}) {
  const r = o?.searchParams?.get?.("AnyProviderIdEquals")?.match(/tmdb\.(\d+)/i);
  if (!r) return null;
  const a = String(t?.tmdbApiReadToken || "").trim(), n = String(t?.tmdbApiV3Key || "").trim(), s = String(e?.TMDB_API_READ_TOKEN || "").trim(), i = String(e?.TMDB_API_KEY || "").trim(), c = !!(a || n), l = c ? a : s, u = c ? n : i;
  if (!l && !u) return null;
  c && (s || i) && We.TmdbCredentialOverrideWarned !== !0 && (We.TmdbCredentialOverrideWarned = !0, Ae("tmdb.credentials_override", "account settings TMDB credentials override TMDB_* environment variables", {
    configReadToken: a ? "set" : "unset",
    configApiKey: n ? "set" : "unset",
    envReadToken: s ? "set" : "unset",
    envApiKey: i ? "set" : "unset"
  }));
  const d = String(o.searchParams.get("IncludeItemTypes") || "").toLowerCase();
  if (d.includes("episode") || d.includes("season")) return null;
  const f = d.includes("movie"), m = f ? "movie" : "tv", p = String(t?.tmdbLanguage || e?.TMDB_LANGUAGE || "zh-CN").trim() || "zh-CN", h = `${p}:${m}:${r[1]}`, g = te.TmdbLookupCache.get(h);
  if (g && Number(g.expiresAt) > H())
    return g.failed === !0 ? null : Xs(o, g.title, g.year);
  const y = () => Ie(te.TmdbLookupCache, h, {
    failed: !0,
    expiresAt: H() + Rg
  }, qs), _ = new URL(`https://api.themoviedb.org/3/${m}/${r[1]}`);
  _.searchParams.set("language", p), u && !l && _.searchParams.set("api_key", u);
  const S = new Headers({ accept: "application/json" });
  l && S.set("Authorization", `Bearer ${l}`);
  const A = new AbortController(), E = setTimeout(() => A.abort("tmdb_timeout"), 5e3);
  try {
    const T = await fetch(_, {
      headers: S,
      signal: A.signal
    });
    if (!T.ok)
      return console.warn(`TMDB ${m} lookup failed: ${T.status}`), y(), null;
    const w = await T.json(), D = String(f ? w?.title || "" : w?.name || "").trim(), k = String(f ? w?.release_date || "" : w?.first_air_date || "").slice(0, 4);
    return D ? (Ie(te.TmdbLookupCache, h, {
      title: D,
      year: k,
      expiresAt: H() + Tg
    }, qs), Xs(o, D, k)) : (y(), null);
  } catch (T) {
    return console.warn("TMDB request conversion failed:", T?.message || T), y(), null;
  } finally {
    clearTimeout(E);
  }
}
function Cg(o = {}, e = {}) {
  const { CacheManager: t } = o, r = new Il({
    entries: te.PlaybackInfoResponseCache,
    now: H,
    maxEntries: F.Defaults.PlaybackInfoCacheMax,
    maxEntryBytes: Ro,
    maxTotalBytes: Ou
  });
  return {
    async prepareExecutionContext(a, n, s, i, c, l, u, d = {}) {
      const f = Date.now(), m = a.method;
      if (t.maybeCleanup(l), !n || !n.target) return { invalidResponse: new Response("Invalid Node", {
        status: 502,
        headers: Ce(new Headers())
      }) };
      const p = $(d.runtimeConfig) ? d.runtimeConfig : await Re(l), h = d.requestUrl || new URL(a.url), g = d.runtimeRouteContext && typeof d.runtimeRouteContext == "object" ? d.runtimeRouteContext : null, y = typeof g?.requestHost == "string" ? g.requestHost : re(h.hostname), _ = typeof g?.configuredHost == "string" ? g.configuredHost : ze(l), S = typeof g?.configuredLegacyHost == "string" ? g.configuredLegacyHost : Kr(l), A = nr(d.entryMode || n?.entryMode), E = String(d.routeKindOverride || "").trim(), T = !!(S && S !== _ && y && y === S), w = {
        requestHost: y,
        configuredHost: _,
        configuredLegacyHost: S,
        isLegacyHostRequest: T,
        routeKind: E || (T ? "legacy_host_kv_route" : A === "host_prefix" ? "host_prefix" : "kv_route")
      }, D = J(s), k = String(d?.pathNormalizationState?.kind || "").trim(), b = a.headers.get("cf-connecting-ip") || "unknown", N = na(a), R = b, x = a.cf?.country || "UNKNOWN", O = e.resolveCorsOrigin(p, a), L = La(l, a, O), v = ji(d.linkVariant), M = bp(D, h);
      if (M?.error) return { invalidResponse: new Response("Invalid Playback Relay", {
        status: 400,
        headers: Ce(new Headers(L))
      }) };
      const C = h.searchParams.has("__pb_abs") && (!!M || ha(D));
      let I = h;
      const P = M?.visibleProxyPath || D, U = M?.targetUrl instanceof URL ? M.targetUrl.pathname : "";
      if (pa(P) || U && pa(U)) return { invalidResponse: Sn(m, L) };
      if ((M || C) && (I = new URL(h)), M) {
        I.searchParams.delete(Gi);
        const ge = zc(h, i, c, P, {
          linkVariant: v,
          entryMode: d.entryMode
        });
        I.pathname = ge.pathname;
      }
      if (C && I.searchParams.delete(Gn), n.tmdbAggregationEnabled === !0 && (m === "GET" || m === "HEAD")) {
        const ge = await Ag(I, l, p);
        ge && (I = ge);
      }
      const V = nm(n, p, i), j = e.classifyRequest(a, P, I, p, {
        nodeDirectSource: V,
        directStaticAssets: p.directStaticAssets === !0,
        directHlsDash: p.directHlsDash === !0
      }), K = Dd(n, p), q = pp(K), de = K === "rewrite" && M?.targetUrl instanceof URL ? "proxy" : "", he = v !== "main" ? "link_variant_force_proxy" : de ? "rewrite_playback_entry_proxy" : "", fe = !!he, ie = fe ? {
        ...j,
        nodeDirectMedia: !1,
        directStaticAssets: !1,
        directHlsDash: !1,
        legacyEntryOffloadEnabled: !1,
        legacyEntryOffloadReason: "",
        direct307Mode: !1,
        enablePrewarm: p.enablePrewarm !== !1,
        isMetadataCacheable: m === "GET" && j.isWsUpgrade !== !0 && (j.isImage === !0 || j.isSubtitle === !0 || j.isManifest === !0)
      } : j, me = sm(p), Me = p.protocolFallback !== !1, Ue = le(p.upstreamTimeoutMs, Nu, 0, 18e4), et = le(p.upstreamRetryAttempts, $n, 0, 3), Et = p.hedgeFailoverEnabled === !0, Yr = p.hedgeProbePreferGet !== !1, Le = Id(n, p), Jr = le(p.hedgeProbeTimeoutMs, To, 250, 1e4), tt = le(p.hedgeProbeParallelism, Ri, 1, 2), rt = le(p.hedgeWaitTimeoutMs, Ai, 250, 1e4), yr = le(p.hedgeLockTtlMs, Ci, 1e3, 1e4), Qr = le(p.hedgePreferredTtlSec, aa, 30, 3600), ke = le(p.hedgeFailureCooldownSec, wi, 1, 300), Xt = le(p.hedgeWakeJitterMs, Li, 0, 1e3), lt = le(p.cacheTtlImages, Ii, 0, 365) * 86400, ut = me.enableH3 === !0, xt = me.forceH1 === !0, Tt = p.playbackInfoCacheEnabled !== !1, Ot = le(p.playbackInfoCacheTtlSec, xu, 0, 60), Yt = p.videoProgressForwardEnabled !== !1, Rt = le(p.videoProgressForwardIntervalSec, Ni, 0, 60), Sr = Nd(n, p), vt = Ld(n, p), Ft = String(d.nodeCacheRevision || "").trim() || ao(i, n), B = ie.isMetadataCacheable ? await el(a) : "", G = ie.isMetadataCacheable ? tl(P, {
        imageCacheMaxAge: lt,
        prewarmCacheTtl: ie.prewarmCacheTtl
      }) : "", X = ie.isMetadataCacheable && no(I) ? ol(I, i, c, P, {
        search: I.search,
        nodeCacheRevision: Ft,
        entryMode: d.entryMode,
        identityPartition: B,
        cachePolicyRevision: G
      }) : null, W = X ? ur() : null, Q = md(n, p), oe = e.getRoutingDecision({
        phase: "entry",
        request: a,
        requestUrl: I,
        proxyPath: P,
        requestTraits: ie,
        currentConfig: p,
        node: n,
        nodeName: i,
        nodeKey: c,
        linkVariant: v,
        forceWorkerProxy: fe,
        forceWorkerProxyReason: he,
        routingDecisionMode: Q
      });
      return {
        request: a,
        requestMethod: m,
        node: n,
        nodeName: i,
        nodeKey: c,
        entryMode: A,
        env: l,
        ctx: u,
        startTime: f,
        currentConfig: p,
        rawRequestUrl: h,
        requestUrl: I,
        requestOrigin: h.origin,
        rawProxyPath: D,
        proxyPath: P,
        linkVariant: v,
        forceWorkerProxy: fe,
        forceWorkerProxyReason: he,
        clientIp: R,
        inboundIp: b,
        logInboundColo: N,
        country: x,
        finalOrigin: O,
        dynamicCors: L,
        routeContextDiagnostics: w,
        requestTraits: ie,
        protocolStrategy: me.strategy,
        routingDecisionMode: Q,
        entryRoutingDecision: oe,
        enableH3: ut,
        forceH1: xt,
        protocolFallback: Me,
        upstreamTimeoutMs: Ue,
        upstreamRetryAttempts: et,
        hedgeFailoverEnabled: Et,
        hedgeProbePreferGet: Yr,
        hedgeProbePath: Le,
        hedgeProbeTimeoutMs: Jr,
        hedgeProbeParallelism: tt,
        hedgeWaitTimeoutMs: rt,
        hedgeLockTtlMs: yr,
        hedgePreferredTtlSec: Qr,
        hedgeFailureCooldownSec: ke,
        hedgeWakeJitterMs: Xt,
        playbackInfoCacheEnabled: Tt,
        playbackInfoCacheTtlSec: Ot,
        effectivePlaybackInfoMode: K,
        playbackInfoRewriteUrlMode: q,
        playbackInfoCacheState: ie.isPlaybackInfoRequest === !0 ? Tt && Ot > 0 ? "miss" : "skip" : "",
        playbackInfoCacheKey: "",
        playbackInfoRewrite: ie.isPlaybackInfoRequest === !0 && K === "passthrough" ? "passthrough" : "",
        playbackAbsoluteFallbackEligible: C,
        playbackAbsoluteFallbackLocation: C ? gp(D, h) : "",
        playbackUrlMode: C ? "absolute" : ie.isPlaybackInfoRequest === !0 && K === "rewrite" ? String(q || "relative") : "",
        playbackFallback: C ? "none" : "",
        playbackPathFix: k,
        rewritePlaybackEntry: de,
        playbackRelayTargetUrl: M?.targetUrl instanceof URL ? M.targetUrl : null,
        targetHotCacheState: String(d.targetHotCacheState || "").trim() || (ie.isPlaybackCriticalRequest === !0 ? "miss" : "skip"),
        nodeCacheState: String(d.nodeCacheState || "").trim(),
        playbackRouteHotTargetRecords: Array.isArray(d.cachedTargetRecords) ? d.cachedTargetRecords : null,
        videoProgressForwardEnabled: Yt,
        videoProgressForwardIntervalSec: Rt,
        effectiveRealClientIpMode: Sr,
        effectiveMediaAuthMode: vt,
        nodeDerivedCacheRevision: Ft,
        failoverContext: null,
        failoverTelemetry: null,
        failoverForegroundWaitUsed: !1,
        progressForwardMode: "",
        progressForwardSessionKey: "",
        imageCacheMaxAge: lt,
        metadataCacheKey: X,
        metadataCache: W,
        metadataCacheIdentityPartition: B,
        metadataCachePolicyRevision: G,
        redirectTrace: null
      };
    },
    cleanupPlaybackInfoResponseCache(a = H()) {
      r.cleanup(a);
    },
    buildPlaybackInfoAuthSignature(a, n = null) {
      const s = a?.requestUrl instanceof URL ? a.requestUrl : null, i = n?.newHeaders || a?.request?.headers || null, c = Wo(i), l = zo(ve(i, "Cookie"), ma);
      return jo([
        s ? ne(s.searchParams.get("api_key") || s.searchParams.get("ApiKey") || s.searchParams.get("X-Emby-Token") || s.searchParams.get("X-MediaBrowser-Token") || "") : "",
        c?.token ? ne(c.token) : "",
        c?.deviceId ? ne(c.deviceId) : "",
        ve(i, "Authorization") ? ne(ve(i, "Authorization")) : "",
        ve(i, "X-Emby-Authorization") ? ne(ve(i, "X-Emby-Authorization")) : "",
        ve(i, "X-MediaBrowser-Authorization") ? ne(ve(i, "X-MediaBrowser-Authorization")) : "",
        l ? ne(l) : ""
      ]);
    },
    buildPlaybackInfoCacheKey(a, n = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return "";
      if (a.playbackInfoCacheEnabled !== !0 || Number(a.playbackInfoCacheTtlSec) <= 0)
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const s = a.requestMethod;
      if (s !== "GET" && s !== "HEAD" && n?.preparedBodyMode !== "buffered")
        return a.playbackInfoCacheState = "skip", a.playbackInfoCacheKey = "", "";
      const i = n?.preparedBodyMode === "buffered" ? String(n?.preparedBodyText || so(n?.preparedBody)) : "", c = `playback-info:${jo([
        String(a?.nodeName || "").trim(),
        String(a?.nodeDerivedCacheRevision || "").trim(),
        s,
        String(a?.proxyPath || "").trim(),
        String(a?.requestUrl?.search || "").trim(),
        i ? ne(i) : "",
        e.buildPlaybackInfoAuthSignature(a, n),
        Gt(a?.effectivePlaybackInfoMode),
        String(a?.playbackInfoRewriteUrlMode || "relative")
      ])}`;
      return a.playbackInfoCacheKey = c, c;
    },
    async storePlaybackInfoResponseCache(a, n, s = null, i = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return !1;
      const c = a.playbackInfoCacheKey || e.buildPlaybackInfoCacheKey(a, s);
      return !c || !rr(i) || i.response !== n ? !1 : r.set(c, i, {
        nodeName: String(a?.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(a?.nodeDerivedCacheRevision || "").trim(),
        playbackInfoRewrite: String(a?.playbackInfoRewrite || "").trim(),
        ttlMs: Math.max(0, Number(a?.playbackInfoCacheTtlSec) || 0) * 1e3
      });
    },
    async tryServePlaybackInfoResponseCache(a, n = null) {
      if (a?.requestTraits?.isPlaybackInfoRequest !== !0) return null;
      const s = e.buildPlaybackInfoCacheKey(a, n);
      if (!s) return null;
      const i = r.get(s);
      if (!i)
        return a.playbackInfoCacheState = a.playbackInfoCacheState === "skip" ? "skip" : "miss", null;
      const c = i.metadata, l = i.representation, u = l.response, d = l.bodyText;
      a.playbackInfoCacheState = "hit", a.playbackInfoRewrite = String(c?.playbackInfoRewrite || a?.playbackInfoRewrite || "").trim();
      const f = e.buildProxyResponseHeaders(u, a.request, a.dynamicCors, a.finalOrigin, a.requestTraits, {
        enableH3: a.enableH3,
        forceH1: a.forceH1,
        imageCacheMaxAge: a.imageCacheMaxAge
      }), m = e.appendLogDiagnosticDetail(e.extractProxyErrorDetail(u), e.buildRuntimeDiagnosticDetail(a));
      return e.recordAccessLog(a, {
        statusCode: u.status,
        category: e.classifyProxyLogCategory(a.requestTraits),
        errorDetail: m,
        detailJson: e.buildStructuredLogDetail(a, { statusCode: u.status }, {
          deliveryMode: "proxy",
          redirectMode: "playback_info_cache",
          decisionReason: "playback_info_cache_hit",
          playbackInfoCache: a.playbackInfoCacheState,
          playbackInfoCacheTtlSec: a.playbackInfoCacheTtlSec,
          upstreamStatus: u.status
        }),
        outboundColo: ""
      }), new Response(a.requestMethod === "HEAD" ? null : d, {
        status: u.status,
        statusText: u.statusText,
        headers: f
      });
    }
  };
}
function wg(o = {}, e = {}) {
  return {
    parsePlaybackSessionControlPayload(t, r = null) {
      if (t?.playbackSessionControlPayload) return t.playbackSessionControlPayload;
      const a = t?.requestUrl instanceof URL ? t.requestUrl : null, n = {};
      if (a) for (const [u, d] of a.searchParams.entries()) {
        const f = String(u || "").trim().toLowerCase();
        !f || n[f] !== void 0 || (n[f] = d);
      }
      const s = {
        query: n,
        body: {},
        parseError: !1,
        parseMode: "query_only",
        parseErrorReason: ""
      }, i = t.requestMethod;
      if (i === "GET" || i === "HEAD")
        return t && (t.playbackSessionControlPayload = s), s;
      if (r?.preparedBodyMode === "stream")
        return s.parseError = !0, s.parseMode = "stream", s.parseErrorReason = "unbuffered_body", t && (t.playbackSessionControlPayload = s), s;
      const c = String(r?.preparedBodyText || so(r?.preparedBody));
      if (!c.trim())
        return t && (t.playbackSessionControlPayload = s), s;
      const l = String(r?.newHeaders?.get("Content-Type") || t?.request?.headers?.get("Content-Type") || "").toLowerCase().split(";", 1)[0].trim();
      try {
        if (l === "application/json" || l === "text/json" || l === "text/plain" || /^application\/[a-z0-9!#$&^_.+-]+\+json$/i.test(l)) {
          const u = JSON.parse(c);
          if (!$(u)) throw new TypeError("playback_control_body_not_object");
          s.body = ki(u), s.parseMode = l === "text/plain" ? "text_plain_json" : "json";
        } else if (l === "application/x-www-form-urlencoded") {
          const u = {};
          for (const [d, f] of new URLSearchParams(c).entries()) {
            const m = String(d || "").trim().toLowerCase();
            !m || u[m] !== void 0 || (u[m] = f);
          }
          s.body = u, s.parseMode = "form";
        } else
          s.parseError = !0, s.parseMode = "unsupported", s.parseErrorReason = "unsupported_content_type";
      } catch {
        s.parseError = !0, s.parseMode = l === "text/plain" ? "text_plain_invalid" : "invalid", s.parseErrorReason = "invalid_body";
      }
      return t && (t.playbackSessionControlPayload = s), s;
    },
    resolvePlaybackProgressSessionKey(t, r = null) {
      const a = e.parsePlaybackSessionControlPayload(t, r), n = (h = []) => {
        const g = is(a.query, h);
        if (String(g || "").trim()) return String(g).trim();
        const y = is(a.body, h);
        return String(y || "").trim();
      }, s = n(["SessionId"]), i = n(["PlaySessionId"]), c = n(["DeviceId"]), l = n(["ItemId"]), u = String(t?.nodeName || "unknown").trim().toLowerCase() || "unknown";
      let d = "", f = "", m = "weak";
      if (s)
        d = `session:${s}`, f = `session:${s}`, m = "strong";
      else if (i)
        d = `play:${i}`, f = `play:${i}`, m = "strong";
      else if (c)
        d = `device-item:${c}:${l}`, f = `device:${c}`;
      else {
        const h = t?.request?.headers;
        d = `fallback:${bn([
          h?.get?.("Authorization"),
          h?.get?.("X-Emby-Token"),
          h?.get?.("X-MediaBrowser-Token"),
          h?.get?.("X-Emby-Device-Id"),
          c,
          t?.clientIp,
          l
        ].map((g) => String(g || "").trim()).join("|"))}`, f = d;
      }
      const p = bn(`${u}|${f}`);
      return {
        sessionKey: `${u}|${d}`,
        sessionIdentityFingerprint: p,
        sessionFingerprint: bn(`${p}|${l}`),
        sessionStrength: m,
        itemId: l,
        parseError: a.parseError === !0
      };
    }
  };
}
function Lg(o = {}, e = {}) {
  return {
    buildPlaybackProgressRelayEntry(t = 0, r = null) {
      return {
        lastForwardAt: 0,
        lastTouchedAt: H(),
        intervalMs: Math.max(0, Number(t) || 0),
        waitUntilCtx: r || null,
        nodeName: "",
        nodeRevision: "",
        pendingSnapshot: null,
        scheduledFlushAt: 0,
        scheduledPromise: null,
        cancelScheduledDelay: null,
        activeFlushPromise: null,
        terminalState: "",
        terminalAt: 0,
        terminalTombstoneUntil: 0
      };
    },
    getPlaybackProgressRelayTerminalTtlMs(t = 0) {
      return Math.max(600 * 1e3, Math.max(1, Number(t) || 0) * 20);
    },
    isPlaybackProgressRelayTerminal(t, r = H()) {
      return !t || String(t.terminalState || "").trim().toLowerCase() !== "stopped" ? !1 : Number(t.terminalTombstoneUntil || 0) > r;
    },
    markPlaybackProgressRelayStopped(t, r) {
      const a = te.PlaybackProgressRelay;
      if (!(a instanceof Map) || !t) return null;
      const n = Math.max(0, Number(r?.videoProgressForwardIntervalSec) || 0) * 1e3, s = a.get(t) || e.buildPlaybackProgressRelayEntry(n, r?.ctx || null), i = H();
      s.intervalMs = n > 0 ? n : Math.max(0, Number(s.intervalMs) || 0), s.waitUntilCtx = r?.ctx || s.waitUntilCtx || null, s.nodeName = String(r?.nodeName || s.nodeName || "").trim().toLowerCase(), s.nodeRevision = String(r?.nodeDerivedCacheRevision || s.nodeRevision || "").trim();
      try {
        s.cancelScheduledDelay?.();
      } catch {
      }
      return s.cancelScheduledDelay = null, s.scheduledPromise = null, s.pendingSnapshot = null, s.scheduledFlushAt = 0, s.terminalState = "stopped", s.terminalAt = i, s.terminalTombstoneUntil = i + e.getPlaybackProgressRelayTerminalTtlMs(s.intervalMs), s.lastTouchedAt = i, Fs(t, s) ? s : (to(s), null);
    },
    cleanupPlaybackProgressRelay(t = H()) {
      const r = te.PlaybackProgressRelay;
      if (!(r instanceof Map) || r.size <= 0) return;
      const a = Math.max(3e4, Math.max(1, Number(Ni) || 1) * 2e4);
      for (const [s, i] of r) {
        const c = Number(i?.lastTouchedAt || i?.lastForwardAt || 0) || 0, l = !!i?.pendingSnapshot || !!i?.activeFlushPromise, u = Number(i?.terminalTombstoneUntil || 0) || 0;
        if (u > 0) {
          !l && u <= t && tr(s);
          continue;
        }
        !l && c > 0 && c + a <= t && tr(s);
      }
      const n = Math.max(1, Number(F.Defaults.VideoProgressForwardSessionMax) || 1);
      for (; r.size > n; ) {
        let s = "";
        for (const [i, c] of r) if (!c?.activeFlushPromise) {
          s = i;
          break;
        }
        if (!s) break;
        tr(s);
      }
    },
    buildPlaybackProgressSnapshot(t, r, a, n) {
      if (!t || !r || typeof a != "function" || !Ze(n) || (r.preparedBodyMode === "buffered" && Number(r.preparedBody?.byteLength) || 0) > vu) return null;
      const s = r.preparedBodyMode === "buffered" && r.preparedBody ? r.preparedBody.slice(0) : r.preparedBody;
      return {
        ctx: t.ctx,
        nodeName: String(t.nodeName || "").trim().toLowerCase(),
        nodeRevision: String(t.nodeDerivedCacheRevision || "").trim(),
        targetRecord: n,
        proxyPath: String(t.proxyPath || "/"),
        requestUrl: new URL(t.requestUrl.toString()),
        buildFetchOptions: a,
        requestMethod: String(t.request?.method || "POST").toUpperCase(),
        preparedBodyMode: r.preparedBodyMode,
        preparedBody: s,
        upstreamTimeoutMs: t.upstreamTimeoutMs
      };
    },
    schedulePlaybackProgressRelayFlush(t, r) {
      if (!r?.pendingSnapshot || r?.scheduledFlushAt > 0 || e.isPlaybackProgressRelayTerminal(r)) return;
      const a = Math.max(0, Number(r.intervalMs) || 0);
      if (a <= 0) return;
      const n = Math.max(H(), Number(r.lastForwardAt) || 0) + a;
      r.scheduledFlushAt = n, r.lastTouchedAt = H();
      const s = Ul(Math.max(0, n - H())), i = (async () => {
        if (!await s.promise) return;
        const l = te.PlaybackProgressRelay.get(t);
        !l || l !== r || Number(l.scheduledFlushAt) !== n || (l.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(t, {
          background: !0,
          attachToCtx: !1
        }));
      })().finally(() => {
        r.scheduledPromise === i && (r.scheduledPromise = null, r.cancelScheduledDelay = null);
      });
      r.scheduledPromise = i, r.cancelScheduledDelay = s.cancel;
      const c = r.waitUntilCtx || r.pendingSnapshot?.ctx || null;
      c?.waitUntil && c.waitUntil(i);
    },
    async forwardPlaybackProgressSnapshot(t) {
      if (!t) return null;
      const r = await e.performUpstreamFetch(t.targetRecord, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
        method: t.requestMethod,
        bodyMode: t.preparedBodyMode,
        body: t.preparedBody,
        timeoutMs: t.upstreamTimeoutMs
      });
      try {
        try {
          await r.response.body?.cancel?.();
        } catch {
        }
      } finally {
        try {
          r.releaseFetchController?.();
        } catch {
        }
      }
      return r.response;
    },
    async flushPlaybackProgressRelayEntry(t, r = {}) {
      const a = te.PlaybackProgressRelay, n = a.get(t);
      if (!n || e.isPlaybackProgressRelayTerminal(n)) return !1;
      if (n.activeFlushPromise) {
        if (r.background === !0) return !1;
        try {
          await n.activeFlushPromise;
        } catch {
        }
      }
      if (!n.pendingSnapshot) return !1;
      const s = n.pendingSnapshot;
      n.pendingSnapshot = null;
      try {
        n.cancelScheduledDelay?.();
      } catch {
      }
      n.cancelScheduledDelay = null, n.scheduledPromise = null, n.scheduledFlushAt = 0, n.lastForwardAt = H(), n.lastTouchedAt = n.lastForwardAt;
      const i = (async () => {
        try {
          return await e.forwardPlaybackProgressSnapshot(s), !0;
        } catch {
          const c = a.get(t);
          return c && c === n && !c.pendingSnapshot && (c.pendingSnapshot = s, c.lastForwardAt = H(), c.lastTouchedAt = c.lastForwardAt), !1;
        } finally {
          const c = a.get(t);
          c && c === n && (c.activeFlushPromise = null, c.lastTouchedAt = H(), c.pendingSnapshot && e.schedulePlaybackProgressRelayFlush(t, c));
        }
      })();
      return n.activeFlushPromise = i, r.attachToCtx === !0 && n.waitUntilCtx?.waitUntil && n.waitUntilCtx.waitUntil(i), await i === !0;
    },
    async flushPlaybackProgressBeforeStopped(t) {
      const r = String(t?.progressForwardSessionKey || "").trim();
      if (!r) return !1;
      const a = te.PlaybackProgressRelay.get(r);
      if (!a) return !1;
      if (a.activeFlushPromise) try {
        await a.activeFlushPromise;
      } catch {
      }
      if (!a.pendingSnapshot) return !1;
      try {
        a.cancelScheduledDelay?.();
      } catch {
      }
      return a.cancelScheduledDelay = null, a.scheduledPromise = null, a.scheduledFlushAt = 0, await e.flushPlaybackProgressRelayEntry(r, {
        background: !1,
        attachToCtx: !1
      });
    },
    buildPlaybackProgressThrottleResponse(t) {
      const r = e.buildEdgeResponseHeaders(t.finalOrigin), a = e.buildProgressRelayDiagnosticDetail(t);
      return e.recordAccessLog(t, {
        statusCode: 204,
        category: e.classifyProxyLogCategory(t.requestTraits),
        errorDetail: a,
        detailJson: e.buildStructuredLogDetail(t, { statusCode: 204 }, {
          deliveryMode: "proxy",
          redirectMode: "progress_relay",
          decisionReason: t.progressForwardMode || "progress_relay_throttled",
          progressRelayMode: t.progressForwardMode,
          progressIntervalSec: t.videoProgressForwardIntervalSec,
          upstreamStatus: 204
        }),
        outboundColo: t.defaultOutboundColo || ""
      }), new Response(null, {
        status: 204,
        statusText: "No Content",
        headers: r
      });
    },
    async maybeHandlePlaybackProgressRelay(t, r, a, n = []) {
      if (t?.requestTraits?.isPlaybackSessionControlRequest !== !0) return null;
      const s = Math.max(0, Number(t?.videoProgressForwardIntervalSec) || 0);
      if (t?.videoProgressForwardEnabled !== !0 || s <= 0 || !t?.ctx?.waitUntil)
        return t.progressForwardMode = "pass_through", null;
      const i = e.resolvePlaybackProgressSessionKey(t, r);
      if (t.progressForwardSessionKey = String(i.sessionKey || "").trim(), i.parseError)
        return t.progressForwardMode = "parse_bypass", null;
      if (t.requestTraits.isPlaybackStartedRequest === !0)
        return t.progressForwardMode = "started_passthrough", t.progressForwardSessionKey && tr(t.progressForwardSessionKey), null;
      if (t.requestTraits.isPlaybackStoppedRequest === !0)
        return t.progressForwardMode = await e.flushPlaybackProgressBeforeStopped(t) ? "flush_before_stopped" : "stopped_passthrough", t.progressForwardSessionKey && e.markPlaybackProgressRelayStopped(t.progressForwardSessionKey, t), null;
      if (t.requestTraits.isPlaybackProgressRequest !== !0) return null;
      const c = Ze(n[0]) ? n[0] : null;
      if (!c)
        return t.progressForwardMode = "pass_through", null;
      if (t.requestMethod !== "GET" && t.requestMethod !== "HEAD" && r?.preparedBodyMode !== "buffered")
        return t.progressForwardMode = "unbuffered_bypass", null;
      const l = te.PlaybackProgressRelay;
      e.cleanupPlaybackProgressRelay();
      const u = t.progressForwardSessionKey || `fallback:${t.clientIp}:${t.proxyPath}`;
      let d = l.get(u);
      d || (d = e.buildPlaybackProgressRelayEntry(s * 1e3, t.ctx)), d.intervalMs = s * 1e3, d.waitUntilCtx = t.ctx, d.nodeName = String(t.nodeName || "").trim().toLowerCase(), d.nodeRevision = String(t.nodeDerivedCacheRevision || "").trim();
      const f = H();
      if (d.lastTouchedAt = f, e.isPlaybackProgressRelayTerminal(d, f))
        return t.progressForwardMode = "late_progress_dropped_after_stopped", e.buildPlaybackProgressThrottleResponse(t);
      if (d.terminalState = "", d.terminalAt = 0, d.terminalTombstoneUntil = 0, !Fs(u, d))
        return to(d), t.progressForwardMode = "capacity_bypass", null;
      if (!(d.lastForwardAt > 0 && f - d.lastForwardAt < d.intervalMs) && !d.activeFlushPromise && !d.pendingSnapshot)
        return d.pendingSnapshot = null, d.scheduledFlushAt = 0, d.lastForwardAt = f, t.progressForwardMode = "forward_now", null;
      const m = e.buildPlaybackProgressSnapshot(t, r, a, c);
      return m ? (d.pendingSnapshot = m, d.lastTouchedAt = f, t.progressForwardMode = "throttled_204", e.schedulePlaybackProgressRelayFlush(u, d), e.buildPlaybackProgressThrottleResponse(t)) : (t.progressForwardMode = "snapshot_bypass", null);
    }
  };
}
function Dg(o = {}, e = {}) {
  return {
    ...Cg(o, e),
    ...wg(o, e),
    ...Lg(o, e)
  };
}
function Ng(o = {}, e = {}) {
  const { nodeRepository: t } = o;
  return {
    resolveCorsOrigin(r, a) {
      const n = a.headers.get("Origin"), s = js(r);
      return s.corsOrigins.length > 0 ? n && s.corsOriginSet.has(n) ? n : s.corsOrigins[0] : n || "*";
    },
    buildEdgeResponseHeaders(r, a = {}) {
      const n = new Headers({
        "Access-Control-Allow-Origin": r,
        "Cache-Control": "no-store",
        ...a
      });
      return Ce(n), n;
    },
    classifyRequest(r, a, n, s, i = {}) {
      const c = r.method, l = r.headers.get("Range"), u = r.headers.get("If-Range"), d = Gr.test(a) || Wr.test(a), f = Wu.test(a), m = pr.test(a), p = St.test(a), h = xi.test(a), g = Po(a), y = r.headers.get("Upgrade")?.toLowerCase() === "websocket", _ = lc(a), S = uc(a), A = dc(a), E = mf(a), T = S || A || E, w = Gu.test(a) || /\/videos\/[^/]+\/(stream|original|download|file)/i.test(a) || /\/items\/[^/]+\/download/i.test(a) || n.searchParams.get("Static") === "true" || n.searchParams.get("Download") === "true", D = c === "GET" || c === "HEAD", k = w && !p && !h && !m && !d, b = _ || g || k || p || h, N = !d && !f && !m && !p && !h && !g && !k && !y, R = i.nodeDirectSource === !0 && D && k, x = i.directStaticAssets === !0 && D && f, O = i.directHlsDash === !0 && D && (p || h), L = R ? "entry_direct_media" : x ? "entry_direct_static_asset" : O ? "entry_direct_hls_dash" : "", v = !!L, M = v;
      return {
        rangeHeader: l,
        ifRangeHeader: u,
        enablePrewarm: s.enablePrewarm !== !1 && !v,
        prewarmCacheTtl: le(s.prewarmCacheTtl, Pu, 0, 3600),
        prewarmDepth: Xi(s.prewarmDepth),
        prewarmPrefetchBytes: s.disablePrewarmPrefetch === !0 ? 0 : le(s.prewarmPrefetchBytes, F.Defaults.PrewarmPrefetchBytes, 0, Ao),
        isImage: d,
        isStaticFile: f,
        isSubtitle: m,
        isManifest: p,
        isSegment: h,
        isSmartStrmMedia: g,
        isWsUpgrade: y,
        looksLikeVideoRoute: w,
        isBigStream: k,
        isPlaybackCriticalRequest: b,
        isApiRequest: N,
        isPlaybackInfoRequest: _,
        isPlaybackProgressRequest: S,
        isPlaybackStoppedRequest: A,
        isPlaybackStartedRequest: E,
        isPlaybackSessionControlRequest: T,
        isMetadataCacheable: c === "GET" && !y && !v && (d || m || p),
        isCacheableAsset: c === "GET" && !y && (d || f || m || h || p),
        nodeDirectMedia: R,
        directStaticAssets: x,
        directHlsDash: O,
        legacyEntryOffloadEnabled: v,
        legacyEntryOffloadReason: L,
        canStripAuthOnProtocolFallback: D && !N && (g || k || p || h),
        direct307Mode: M
      };
    },
    isEntryDirectDataPlaneMode(r) {
      const a = String(r || "").trim();
      return a === "entry_direct" || a === "legacy_entry_offload";
    },
    buildRoutingDecision(r = {}) {
      const a = String(r.action || "PROXY").trim().toUpperCase() === "DIRECT" ? "DIRECT" : "PROXY", n = String(r.phase || "unknown").trim() || "unknown", s = String(r.reason || "").trim() || (a === "DIRECT" ? "direct" : "proxy"), i = String(r.traceAction || (a === "DIRECT" ? "direct" : "proxy")).trim() || (a === "DIRECT" ? "direct" : "proxy"), c = String(r.traceLabel || s).trim() || s, l = Number(r.redirectStatus);
      return {
        phase: n,
        action: a,
        dataPlaneMode: String(r.dataPlaneMode || "").trim() || (a === "DIRECT" ? "redirect_direct" : "worker_proxy"),
        nextMethod: r.nextMethod || null,
        nextBodyMode: r.nextBodyMode || "none",
        isSameOriginRedirect: r.isSameOriginRedirect === !0,
        preserveWorkerProxy: r.preserveWorkerProxy === !0,
        reason: s,
        traceAction: i,
        redirectStatus: Number.isFinite(l) && l > 0 ? Math.floor(l) : 0,
        traceLabel: c
      };
    },
    buildLegacyEntryRoutingDecision(r = {}) {
      if (r.legacyEntryOffloadEnabled === !0) {
        const a = String(r.legacyEntryOffloadReason || "entry_direct").trim() || "entry_direct";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "DIRECT",
          dataPlaneMode: "entry_direct",
          reason: a,
          traceAction: "direct",
          redirectStatus: 307,
          traceLabel: a
        });
      }
      return e.buildRoutingDecision({
        phase: "entry",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "worker_proxy",
        traceAction: "proxy",
        traceLabel: "worker_proxy"
      });
    },
    buildSimplifiedEntryRoutingDecision(r = {}) {
      const a = r.requestTraits || {}, n = a.nodeDirectMedia ? "entry_direct_media" : a.directStaticAssets ? "entry_direct_static_asset" : a.directHlsDash ? "entry_direct_hls_dash" : "";
      return n ? e.buildRoutingDecision({
        phase: "entry",
        action: "DIRECT",
        dataPlaneMode: "entry_direct",
        reason: n,
        traceAction: "direct",
        redirectStatus: 307,
        traceLabel: n
      }) : e.buildRoutingDecision({
        phase: "entry",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "worker_proxy",
        traceAction: "proxy",
        traceLabel: "worker_proxy"
      });
    },
    getRoutingDecision(r = {}) {
      const a = String(r.phase || "").trim().toLowerCase();
      return a === "entry" ? e.getEntryRoutingDecision(r) : a === "redirect" ? e.getRedirectRoutingDecision(r) : e.buildRoutingDecision({
        phase: a || "unknown",
        action: "PROXY",
        dataPlaneMode: "worker_proxy",
        reason: "unsupported_phase",
        traceAction: "proxy",
        traceLabel: "unsupported_phase"
      });
    },
    getEntryRoutingDecision(r = {}) {
      if (r.forceWorkerProxy === !0) {
        const a = String(r.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: "entry",
          action: "PROXY",
          dataPlaneMode: "worker_proxy",
          reason: a,
          traceAction: "proxy",
          traceLabel: a
        });
      }
      return Pr(r.routingDecisionMode) === "legacy" ? e.buildLegacyEntryRoutingDecision(r.requestTraits) : e.buildSimplifiedEntryRoutingDecision(r);
    },
    buildSimplifiedRedirectRoutingDecision(r, a, n, s, i = {}, c = {}) {
      const l = r.origin === a.origin, u = i.forceVideoDirect === !0, d = i.forceVideoProxy === !0, f = om(i.currentStatus, n);
      let m = s;
      if ((f === "GET" || f === "HEAD") && (m = "none"), c.forceWorkerProxy === !0) {
        const p = String(c.forceWorkerProxyReason || "").trim() || "link_variant_force_proxy";
        return e.buildRoutingDecision({
          phase: c.phase || "redirect",
          action: "PROXY",
          dataPlaneMode: "worker_proxy_follow",
          nextMethod: f,
          nextBodyMode: m,
          isSameOriginRedirect: l,
          preserveWorkerProxy: !1,
          reason: p,
          traceAction: "proxy",
          redirectStatus: c.redirectStatus || i.currentStatus,
          traceLabel: p
        });
      }
      return u ? e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "DIRECT",
        dataPlaneMode: "redirect_direct",
        nextBodyMode: s,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "node_video_direct",
        traceAction: "direct",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: "node_video_direct"
      }) : s === "stream" ? e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "DIRECT",
        dataPlaneMode: "redirect_direct",
        nextBodyMode: s,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "stream_body_direct",
        traceAction: "direct",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: "stream_body_direct"
      }) : e.buildRoutingDecision({
        phase: c.phase || "redirect",
        action: "PROXY",
        dataPlaneMode: "worker_proxy_follow",
        nextMethod: f,
        nextBodyMode: m,
        isSameOriginRedirect: l,
        preserveWorkerProxy: !1,
        reason: "proxy_follow",
        traceAction: "proxy",
        redirectStatus: c.redirectStatus || i.currentStatus,
        traceLabel: d ? "node_video_proxy" : "proxy_follow"
      });
    },
    getRedirectRoutingDecision(r = {}) {
      return e.buildSimplifiedRedirectRoutingDecision(r.nextUrl, r.activeTargetBase, r.redirectMethod, r.redirectBodyMode, r.policy, {
        phase: "redirect",
        forceWorkerProxy: r.forceWorkerProxy === !0,
        forceWorkerProxyReason: r.forceWorkerProxyReason,
        redirectStatus: r.currentStatus || r.policy?.currentStatus
      });
    },
    evaluateFirewall(r, a, n, s) {
      const i = js(r);
      return i.ipBlacklist.has(a) ? new Response("Forbidden by IP Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : i.geoAllowlist.size > 0 && !i.geoAllowlist.has(n) || i.geoBlocklist.size > 0 && i.geoBlocklist.has(n) ? new Response("Forbidden by Geo Firewall", {
        status: 403,
        headers: e.buildEdgeResponseHeaders(s)
      }) : null;
    },
    applyRateLimit(r, a, n, s, i) {
      const c = parseInt(r.rateLimitRpm) || 0;
      if (!(c > 0 && n.isPlaybackCriticalRequest !== !0)) return null;
      let l = We.RateLimitCache.get(a);
      return (!l || s > l.resetAt) && (l = {
        count: 0,
        resetAt: s + 6e4
      }), l.count += 1, Ie(We.RateLimitCache, a, l, F.Defaults.RateLimitCacheMax), l.count > c ? new Response("Rate Limit Exceeded", {
        status: 429,
        headers: e.buildEdgeResponseHeaders(i)
      }) : null;
    },
    parseTargetRecords(r, a, n = {}) {
      const s = Array.isArray(n.cachedTargetRecords) ? n.cachedTargetRecords : [];
      if (s.length > 0 && s.every(Ze)) return {
        targetRecords: s,
        invalidResponse: null
      };
      const i = t.getOrderedNodeLines(r), c = (i.length ? i.map((l) => l.target) : String(r.target || "").split(",").map((l) => l.trim()).filter(Boolean)).map((l) => pn(l)).filter(Ze);
      return c.length ? {
        targetRecords: c,
        invalidResponse: null
      } : {
        targetRecords: c,
        invalidResponse: new Response("Invalid Node Target", {
          status: 502,
          headers: e.buildEdgeResponseHeaders(a)
        })
      };
    }
  };
}
function Ig(o) {
  if (!o || !o.body) return !0;
  const e = tn(o?.headers?.get("Content-Length"));
  return Number.isFinite(e) && e >= 0 && e <= Di;
}
function Mg(o = {}, e = {}) {
  const { nodeRepository: t } = o;
  return {
    ensureFailoverTelemetry(r) {
      const a = r?.failoverTelemetry && typeof r.failoverTelemetry == "object" ? r.failoverTelemetry : {};
      return a.overlay = String(a.overlay || "").trim(), a.probeReason = String(a.probeReason || "").trim(), a.probeWinner = String(a.probeWinner || "").trim(), a.probeElapsedMs = Math.max(0, Math.round(Number(a.probeElapsedMs) || 0)), a.waitJoinMs = Math.max(0, Math.round(Number(a.waitJoinMs) || 0)), a.demotedTarget = String(a.demotedTarget || "").trim(), a.preferredTarget = String(a.preferredTarget || "").trim(), a.fastFailReason = String(a.fastFailReason || "").trim(), r && typeof r == "object" && (r.failoverTelemetry = a), a;
    },
    isFailoverEligible(r, a = []) {
      if (r?.hedgeFailoverEnabled !== !0) return {
        eligible: !1,
        reason: "disabled"
      };
      if (r.requestMethod !== "GET" && r.requestMethod !== "HEAD") {
        if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return {
          eligible: !1,
          reason: "non_idempotent"
        };
        if (!Ig(r.request)) return {
          eligible: !1,
          reason: "non_replayable_body"
        };
      }
      return r?.requestTraits?.isWsUpgrade === !0 ? {
        eligible: !1,
        reason: "websocket"
      } : r?.playbackRelayTargetUrl instanceof URL ? {
        eligible: !1,
        reason: "absolute_target"
      } : _d(a) < 2 ? {
        eligible: !1,
        reason: "single_target"
      } : {
        eligible: !0,
        reason: "eligible"
      };
    },
    buildFailoverCacheKey(r, a, n) {
      return [
        String(r || "").toLowerCase().trim(),
        String(a || "").trim(),
        String(n || "").trim()
      ].filter(Boolean).join(":");
    },
    pruneFailoverStateEntry(r, a = aa * 1e3, n = H()) {
      if (!r || typeof r != "object") return null;
      r.failingTargets instanceof Map || (r.failingTargets = /* @__PURE__ */ new Map());
      for (const [d, f] of r.failingTargets) Number(f) <= n && r.failingTargets.delete(d);
      Number(r.preferredTargetExpiresAt) <= n && (r.preferredTargetKey = "", r.preferredTargetExpiresAt = 0);
      const s = Number(r.lastProbeResult?.completedAt) || 0;
      r.lastProbeResult && s > 0 && s + Math.max(1e3, Number(a) || 0) <= n && (r.lastProbeResult = null), r.inFlightProbe && Number(r.inFlightProbe.expiresAt) <= n && (r.inFlightProbe = null);
      const i = !!String(r.preferredTargetKey || "").trim(), c = r.failingTargets.size > 0, l = !!r.inFlightProbe, u = !!r.lastProbeResult;
      return i || c || l || u ? r : null;
    },
    getOrCreateFailoverStateEntry(r, a = aa * 1e3) {
      const n = String(r || "").trim();
      if (!n) return null;
      const s = te.ProxyFailoverStateCache;
      let i = s.get(n);
      (!i || typeof i != "object") && (i = {
        preferredTargetKey: "",
        preferredTargetExpiresAt: 0,
        failingTargets: /* @__PURE__ */ new Map(),
        inFlightProbe: null,
        lastProbeResult: null
      });
      const c = e.pruneFailoverStateEntry(i, a, H()) || i;
      return Ie(s, n, c, sr), c;
    },
    getFailoverStateSnapshot(r, a = aa * 1e3) {
      const n = String(r || "").trim();
      if (!n) return null;
      const s = te.ProxyFailoverStateCache, i = s.get(n);
      if (!i) return null;
      const c = e.pruneFailoverStateEntry(i, a, H());
      return c ? (Za(s, n), {
        preferredTargetKey: String(c.preferredTargetKey || "").trim(),
        failingTargetKeys: [...c.failingTargets.keys()].map((l) => String(l || "").trim()).filter(Boolean),
        probeWinnerTargetKey: String(c.lastProbeResult?.status || "") === "ok" ? String(c.lastProbeResult?.winnerTargetKey || "").trim() : "",
        lastProbeResult: c.lastProbeResult && typeof c.lastProbeResult == "object" ? { ...c.lastProbeResult } : null,
        inFlightProbe: c.inFlightProbe ? {
          startedAt: Number(c.inFlightProbe.startedAt) || 0,
          reason: String(c.inFlightProbe.reason || "").trim()
        } : null
      }) : (s.delete(n), null);
    },
    buildFailoverStateSummary(r) {
      const a = r?.failoverContext && typeof r.failoverContext == "object" ? r.failoverContext : null, n = e.ensureFailoverTelemetry(r), s = a?.cacheKey ? e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs) : null;
      return {
        enabled: a?.enabled === !0,
        eligible: a?.eligible === !0,
        cacheKey: String(a?.cacheKey || "").trim() || null,
        reason: String(a?.eligibilityReason || "").trim() || null,
        overlay: String(n.overlay || "").trim() || null,
        preferredTarget: String(n.preferredTarget || s?.preferredTargetKey || "").trim() || null,
        probeWinner: String(n.probeWinner || s?.probeWinnerTargetKey || "").trim() || null,
        demotedTargets: Array.isArray(s?.failingTargetKeys) ? s.failingTargetKeys : [],
        inFlight: s?.inFlightProbe ? { reason: String(s.inFlightProbe.reason || "").trim() || null } : null
      };
    },
    buildFailoverDiagnosticDetail(r) {
      const a = r?.failoverContext && typeof r.failoverContext == "object" ? r.failoverContext : null;
      if (!a?.enabled) return "";
      const n = e.ensureFailoverTelemetry(r), s = e.buildFailoverStateSummary(r), i = [`Failover=${String(n.overlay || a.eligibilityReason || "ready").trim() || "ready"}`];
      return s.preferredTarget && i.push(`PreferredTarget=${s.preferredTarget}`), n.demotedTarget && i.push(`DemotedTarget=${n.demotedTarget}`), n.probeWinner && i.push(`ProbeWinner=${n.probeWinner}`), n.waitJoinMs > 0 && i.push(`WaitJoin=${n.waitJoinMs}ms`), n.fastFailReason && i.push(`FastFail=${n.fastFailReason}`), i.join(" | ");
    },
    reorderRetryTargetsForFailover(r, a = {}) {
      const n = Array.isArray(r) ? r.slice() : [];
      if (n.length <= 1) return n;
      const s = new Set((Array.isArray(a?.failingTargetKeys) ? a.failingTargetKeys : []).map((m) => String(m || "").trim()).filter(Boolean)), i = String(a?.preferredTargetKey || "").trim(), c = String(a?.probeWinnerTargetKey || "").trim(), l = i && !s.has(i) ? i : c && !s.has(c) ? c : "";
      if (!l && s.size <= 0) return n;
      const u = [], d = [], f = [];
      for (const m of n) {
        const p = je(m);
        if (l && p === l && u.length <= 0 && !s.has(p)) {
          u.push(m);
          continue;
        }
        if (s.has(p)) {
          f.push(m);
          continue;
        }
        d.push(m);
      }
      return [
        ...u,
        ...d,
        ...f
      ];
    },
    prepareFailoverOverlay(r, a = []) {
      const n = e.ensureFailoverTelemetry(r), s = Sd(a), i = Math.max(1e3, (Number(r?.hedgePreferredTtlSec) || aa) * 1e3), c = e.isFailoverEligible(r, a), l = e.buildFailoverCacheKey(r?.nodeName, s, r?.nodeDerivedCacheRevision), u = c.eligible ? e.getFailoverStateSnapshot(l, i) : null, d = c.eligible ? e.reorderRetryTargetsForFailover(a, u) : Array.isArray(a) ? a.slice() : [];
      let f = "disabled";
      return r?.hedgeFailoverEnabled === !0 && (c.eligible ? u?.preferredTargetKey ? f = "preferred_reordered" : u?.probeWinnerTargetKey ? f = "probe_hint_reordered" : Array.isArray(u?.failingTargetKeys) && u.failingTargetKeys.length > 0 ? f = "failure_demoted" : f = "ready" : f = c.reason || "ineligible"), n.overlay = f, n.preferredTarget = String(u?.preferredTargetKey || "").trim(), r.failoverContext = {
        enabled: r?.hedgeFailoverEnabled === !0,
        eligible: c.eligible,
        eligibilityReason: c.reason,
        cacheKey: l,
        orderedTargetSignature: s,
        preferredTtlMs: i,
        probePath: Da(r?.hedgeProbePath, Ti),
        probePreferGet: r?.hedgeProbePreferGet !== !1,
        probeTimeoutMs: Math.max(250, Number(r?.hedgeProbeTimeoutMs) || To),
        probeParallelism: Math.max(1, Math.min(2, Number(r?.hedgeProbeParallelism) || Ri)),
        waitTimeoutMs: Math.max(250, Number(r?.hedgeWaitTimeoutMs) || Ai),
        lockTtlMs: Math.max(1e3, Number(r?.hedgeLockTtlMs) || Ci),
        failureCooldownMs: Math.max(1e3, (Number(r?.hedgeFailureCooldownSec) || wi) * 1e3),
        wakeJitterMs: Math.max(0, Number(r?.hedgeWakeJitterMs) || Li),
        originalTargetRecords: Array.isArray(a) ? a.slice() : [],
        retryTargetRecords: d.slice(),
        snapshot: u
      }, d;
    },
    maybeInvalidateHotSnapshotOnFailover(r, a) {
      if (String(r?.targetHotCacheState || "").trim() !== "hit") return;
      const n = je(a);
      n && (Array.isArray(r?.playbackRouteHotTargetRecords) ? r.playbackRouteHotTargetRecords : []).map((s) => je(s)).filter(Boolean).includes(n) && t.invalidatePlaybackRouteHotCache(r?.nodeName, r?.env);
    },
    markFailoverTargetFailure(r, a, n = "", s = {}) {
      const i = r?.failoverContext;
      if (!i?.eligible) return;
      const c = je(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(r), u = e.getOrCreateFailoverStateEntry(i.cacheKey, i.preferredTtlMs);
      u && (u.failingTargets.set(c, H() + i.failureCooldownMs), String(u.preferredTargetKey || "").trim() === c && (u.preferredTargetKey = "", u.preferredTargetExpiresAt = 0), Ie(te.ProxyFailoverStateCache, i.cacheKey, u, sr), l.overlay = String(s.overlay || "target_demoted").trim() || "target_demoted", l.demotedTarget = c, l.fastFailReason = String(n || s.fastFailReason || l.fastFailReason || "").trim(), e.maybeInvalidateHotSnapshotOnFailover(r, a));
    },
    markFailoverBusinessSuccess(r, a, n = {}) {
      const s = r?.failoverContext;
      if (!s?.eligible) return;
      const i = Number(n.status) || 0;
      if (!(i >= 200 && i < 300 || i === 206 || i >= 300 && i < 400)) return;
      const c = je(a);
      if (!c) return;
      const l = e.ensureFailoverTelemetry(r), u = e.getOrCreateFailoverStateEntry(s.cacheKey, s.preferredTtlMs);
      u && (u.failingTargets.delete(c), u.preferredTargetKey = c, u.preferredTargetExpiresAt = H() + s.preferredTtlMs, Ie(te.ProxyFailoverStateCache, s.cacheKey, u, sr), l.overlay = String(n.overlay || "preferred_promoted").trim() || "preferred_promoted", l.preferredTarget = c);
    },
    getFailoverProbeCandidates(r, a = {}) {
      const n = r?.failoverContext;
      if (!n?.eligible) return [];
      const s = e.getFailoverStateSnapshot(n.cacheKey, n.preferredTtlMs), i = e.reorderRetryTargetsForFailover(n.originalTargetRecords, s), c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = je(a.failedTargetRecord), d = je(a.activeTargetRecord), f = String(a.excludeTargetKey || "").trim();
      return u && c.add(u), d && c.add(d), f && c.add(f), i.filter((m) => {
        const p = je(m);
        return !p || c.has(p) || l.has(p) ? !1 : (l.add(p), !0);
      }).slice(0, n.probeParallelism);
    }
  };
}
function Pg(o = {}, e = {}) {
  return {
    buildFailoverProbeHeaders() {
      return new Headers({
        Accept: "*/*",
        "Cache-Control": "no-store",
        Pragma: "no-cache"
      });
    },
    async performFailoverProbeRequest(t, r, a, n, s = null) {
      const i = ug([
        t?.request?.signal,
        t?.requestLifecycle?.signal,
        s
      ]);
      let c = null, l = !1;
      try {
        return n > 0 && (c = setTimeout(() => {
          l = !0, i.abort(`probe_timeout_${n}ms`);
        }, n)), await Be(r.toString(), {
          method: a,
          headers: e.buildFailoverProbeHeaders(),
          redirect: "manual",
          signal: i.signal
        });
      } catch (u) {
        if (l) {
          const d = /* @__PURE__ */ new Error(`probe_timeout_${n}ms`);
          throw d.code = "UPSTREAM_TIMEOUT", d;
        }
        throw t?.requestLifecycle?.getAbortReason?.() && $t(u) ? lr(t.requestLifecycle.getAbortReason()) : u;
      } finally {
        c !== null && clearTimeout(c), i.dispose();
      }
    },
    async runFailoverProbeCandidate(t, r, a = {}) {
      const n = t?.failoverContext, s = n?.probePath || Da(t?.hedgeProbePath, Ti), i = Math.max(250, Number(n?.probeTimeoutMs) || To), c = je(r), l = $c(r, s);
      if (!l) return {
        ok: !1,
        status: 0,
        targetRecord: r,
        targetKey: c,
        reason: "invalid_probe_target",
        elapsedMs: 0
      };
      const u = H();
      let d = null;
      const f = n?.probePreferGet !== !1;
      let m = f ? "GET" : "HEAD";
      try {
        if (d = await e.performFailoverProbeRequest(t, l, m, i, a.parentSignal || null), !f && (d.status === 405 || d.status === 501)) {
          try {
            d.body?.cancel?.();
          } catch {
          }
          m = "GET", d = await e.performFailoverProbeRequest(t, l, "GET", i, a.parentSignal || null);
        }
        const p = Math.max(0, H() - u), h = Number(d.status) || 0;
        if (h >= 200 && h < 400) {
          const g = d.status;
          try {
            d.body?.cancel?.();
          } catch {
          }
          return {
            ok: !0,
            status: g,
            targetRecord: r,
            targetKey: c,
            methodUsed: m,
            elapsedMs: p
          };
        }
        try {
          d.body?.cancel?.();
        } catch {
        }
        return {
          ok: !1,
          status: d.status,
          targetRecord: r,
          targetKey: c,
          reason: `probe_status_${Number(d.status) || 0}`,
          elapsedMs: p
        };
      } catch (p) {
        const h = Math.max(0, H() - u), g = String(p?.code || "").trim().toUpperCase(), y = String(t?.requestLifecycle?.getAbortReason?.() || "").trim();
        return y ? {
          ok: !1,
          targetRecord: r,
          targetKey: c,
          reason: y.toLowerCase(),
          elapsedMs: h,
          aborted: !0
        } : String(a.parentSignal?.reason || "").trim() === "probe_winner" && $t(p) ? {
          ok: !1,
          targetRecord: r,
          targetKey: c,
          reason: "probe_winner_aborted",
          elapsedMs: h,
          aborted: !0
        } : {
          ok: !1,
          targetRecord: r,
          targetKey: c,
          reason: g === "UPSTREAM_TIMEOUT" ? "probe_timeout" : "probe_network_error",
          elapsedMs: h,
          aborted: $t(p)
        };
      }
    },
    async runFailoverProbeTask(t, r, a = {}) {
      const n = t?.failoverContext;
      if (!n?.eligible) return {
        status: "skipped",
        reason: "ineligible",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const s = Array.isArray(r) ? r.slice(0, n.probeParallelism) : [];
      if (!s.length) return {
        status: "skipped",
        reason: "no_candidates",
        winnerTargetRecord: null,
        winnerTargetKey: "",
        elapsedMs: 0,
        attempts: []
      };
      const i = new AbortController(), c = [];
      let l = null;
      const u = H();
      await Promise.all(s.map(async (_) => {
        const S = await e.runFailoverProbeCandidate(t, _, { parentSignal: i.signal });
        if (c.push(S), !l && S?.ok === !0) {
          l = S;
          try {
            i.abort("probe_winner");
          } catch {
          }
        }
      }));
      const d = Math.max(0, H() - u), f = e.getOrCreateFailoverStateEntry(n.cacheKey, n.preferredTtlMs), m = l ? "ok" : "miss", p = l ? String(a.reason || "probe_ok").trim() || "probe_ok" : String(c.find((_) => _?.aborted !== !0 && _?.reason)?.reason || "probe_no_winner").trim() || "probe_no_winner", h = l && typeof l == "object" ? l : null, g = String(h ? h.targetKey : "").trim(), y = h ? h.targetRecord : null;
      return f && (f.lastProbeResult = {
        status: m,
        reason: p,
        winnerTargetKey: g,
        completedAt: H(),
        elapsedMs: d
      }, Ie(te.ProxyFailoverStateCache, n.cacheKey, f, sr)), {
        status: m,
        reason: p,
        winnerTargetRecord: y,
        winnerTargetKey: g,
        elapsedMs: d,
        attempts: c
      };
    },
    startOrJoinFailoverProbe(t, r = {}) {
      const a = t?.failoverContext, n = e.ensureFailoverTelemetry(t);
      if (!a?.eligible) return null;
      const s = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs), i = H();
      if (s?.inFlightProbe && Number(s.inFlightProbe.expiresAt) > i && s.inFlightProbe.promise)
        return n.overlay = (r.background === !0 ? "background_probe_joined" : "probe_joined").trim(), {
          joined: !0,
          startedAt: Number(s.inFlightProbe.startedAt) || i,
          promise: s.inFlightProbe.promise
        };
      const c = e.getFailoverProbeCandidates(t, r);
      if (!c.length)
        return n.fastFailReason = "no_probe_candidates", n.overlay = "no_probe_candidates", {
          joined: !1,
          startedAt: i,
          promise: Promise.resolve({
            status: "skipped",
            reason: "no_candidates",
            winnerTargetRecord: null,
            winnerTargetKey: "",
            elapsedMs: 0,
            attempts: []
          })
        };
      const l = `${i}-${Math.random().toString(36).slice(2, 10)}`, u = e.runFailoverProbeTask(t, c, r).finally(() => {
        const d = e.getOrCreateFailoverStateEntry(a.cacheKey, a.preferredTtlMs);
        !d?.inFlightProbe || String(d.inFlightProbe.token || "").trim() !== l || (d.inFlightProbe = null, Ie(te.ProxyFailoverStateCache, a.cacheKey, d, sr));
      });
      return s && (s.inFlightProbe = {
        token: l,
        startedAt: i,
        expiresAt: i + a.lockTtlMs,
        reason: String(r.reason || "").trim(),
        promise: u
      }, Ie(te.ProxyFailoverStateCache, a.cacheKey, s, sr)), n.overlay = (r.background === !0 ? "background_probe_started" : "probe_started").trim(), {
        joined: !1,
        startedAt: i,
        promise: u
      };
    },
    async maybeRunForegroundFailoverWait(t, r = {}) {
      const a = t?.execution, n = a?.failoverContext, s = e.ensureFailoverTelemetry(a);
      if (!n?.eligible || a?.failoverForegroundWaitUsed === !0) return null;
      a.failoverForegroundWaitUsed = !0;
      const i = r.targetRecord, c = Number(r.responseStatus) || 0, l = String(r.reason || (c > 0 ? `upstream_status_${c}` : "retryable_failure")).trim() || "retryable_failure";
      e.markFailoverTargetFailure(a, i, l, { overlay: "failure_demoted" });
      const u = e.startOrJoinFailoverProbe(a, {
        reason: l,
        failedTargetRecord: i
      });
      if (!u?.promise) return null;
      const d = await dg(u.promise, n.waitTimeoutMs, a?.requestLifecycle);
      if (s.waitJoinMs = d.timedOut === !0 ? n.waitTimeoutMs : Math.max(0, H() - Number(u.startedAt || H())), d.timedOut === !0)
        return s.overlay = "probe_wait_timeout", s.fastFailReason = "probe_wait_timeout", null;
      const f = d.value && typeof d.value == "object" ? d.value : null;
      if (s.probeReason = u.joined === !0 ? "join_existing_probe" : l, s.probeElapsedMs = Math.max(0, Number(f?.elapsedMs) || 0), s.probeWinner = String(f?.winnerTargetKey || "").trim(), !f || f.status !== "ok" || !Ze(f.winnerTargetRecord))
        return s.overlay = "probe_miss", s.fastFailReason = String(f?.reason || "probe_no_winner").trim() || "probe_no_winner", null;
      const m = je(i), p = je(f.winnerTargetRecord);
      if (!p || p === m)
        return s.overlay = "probe_miss", s.fastFailReason = "probe_reused_failed_target", null;
      n.wakeJitterMs > 0 && await fg(Math.floor(Math.random() * (n.wakeJitterMs + 1)), a?.requestLifecycle);
      try {
        const h = await e.performUpstreamFetch(f.winnerTargetRecord, t.proxyPath, t.requestUrl, t.buildFetchOptions, {
          isRetry: !0,
          protocolFallbackRetry: t.protocolFallbackRetry === !0,
          stripAuthOnProtocolFallback: t.stripAuthOnProtocolFallback === !0,
          timeoutMs: t.upstreamTimeoutMs,
          requestLifecycle: t.requestLifecycle,
          useFastSegmentBuilder: !1
        });
        if (s.overlay = "wake_retry", h.response.status === 101 || !t.retryableStatuses.has(h.response.status)) return { upstream: h };
        e.markFailoverTargetFailure(a, f.winnerTargetRecord, `upstream_status_${h.response.status}`, { overlay: "wake_retry_failed" }), s.fastFailReason = `wake_retry_status_${h.response.status}`;
        try {
          h.response.body?.cancel?.();
        } catch {
        }
        try {
          h.releaseFetchController?.();
        } catch {
        }
        return null;
      } catch (h) {
        const g = String(h?.code || "").trim().toUpperCase();
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(g) || (e.markFailoverTargetFailure(a, f.winnerTargetRecord, g || "wake_retry_error", { overlay: "wake_retry_failed" }), s.fastFailReason = String(g || "wake_retry_error").trim().toLowerCase() || "wake_retry_error"), h && typeof h == "object") {
          const y = hr(f.winnerTargetRecord, t.proxyPath);
          y.search = String(t.requestUrl?.search || ""), h.lastFinalUrl = y, h.lastTargetRecord = f.winnerTargetRecord, h.lastTargetBase = f.winnerTargetRecord?.targetUrl || null;
        }
        if ([
          "CLIENT_ABORTED",
          "DOWNSTREAM_CANCELLED",
          "REQUEST_ABORTED"
        ].includes(g)) throw h;
        return { error: h };
      }
    },
    maybeScheduleBackgroundFailoverRefresh(t, r = {}) {
      const a = t?.failoverContext;
      if (!a?.eligible || !t?.ctx) return;
      const n = e.getFailoverStateSnapshot(a.cacheKey, a.preferredTtlMs);
      if ((Array.isArray(n?.failingTargetKeys) ? n.failingTargetKeys : []).length <= 0) return;
      const s = Number(n?.lastProbeResult?.completedAt) || 0;
      if (s > 0 && s + a.preferredTtlMs > H() || n?.inFlightProbe) return;
      const i = e.startOrJoinFailoverProbe(t, {
        reason: "stale_refresh",
        activeTargetRecord: r?.activeTargetRecord || null,
        background: !0
      });
      i?.promise && t.ctx.waitUntil(Promise.resolve(i.promise).catch(() => {
      }));
    }
  };
}
function xg(o = {}, e = {}) {
  return {
    ...Ng(o, e),
    ...Mg(o, e),
    ...Pg(o, e)
  };
}
function Og(o = {}, e = {}) {
  const t = {
    async buildProxyRequestState(r, a, n, s, i, c, l, u, d = {}) {
      const f = Qp(r.headers);
      Kn.forEach((v) => f.delete(v));
      const m = /* @__PURE__ */ new Set();
      let p = null;
      if (a.headers && typeof a.headers == "object") for (const [v, M] of Object.entries(a.headers)) {
        const C = String(v).toLowerCase();
        Kn.has(C) || (m.add(C), C === "cookie" ? p = String(M) : f.set(v, String(M)));
      }
      const h = $s(f.get("Cookie"), p, ["auth_token", ...ma]);
      h ? f.set("Cookie", h) : f.delete("Cookie");
      const g = p ? $s(null, p, ["auth_token", ...ma]) : null;
      Ws(f, d.effectiveMediaAuthMode || a.mediaAuthMode);
      const y = Md(d.effectiveRealClientIpMode || a.realClientIpMode);
      y === "none" && ju.forEach((v) => f.delete(v)), (y === "full" || y === "real-ip-only") && f.set("X-Real-IP", i), y === "full" && f.set("X-Forwarded-For", i), f.set("X-Forwarded-Host", s.host), f.set("X-Forwarded-Proto", s.protocol.replace(":", "")), c.isWsUpgrade ? (f.set("Upgrade", "websocket"), f.set("Connection", "Upgrade")) : l && f.set("Connection", "keep-alive"), (c.isBigStream || c.isSmartStrmMedia || c.isSegment || c.isManifest) && !m.has("referer") && f.delete("Referer");
      const _ = m.has("origin"), S = m.has("referer"), A = f.has("Origin"), E = f.has("Referer");
      let T = "", w = "/";
      if (E && !S) try {
        const v = new URL(f.get("Referer") || "");
        T = String(v.origin || "").trim(), w = `${v.pathname || "/"}${v.search || ""}` || "/";
      } catch {
        T = "", w = "/";
      }
      const D = {
        baseHeaderEntries: [...f.entries()],
        hasOriginHeader: A,
        hasRefererHeader: E,
        adminCustomHasOrigin: _,
        adminCustomHasReferer: S,
        refererOrigin: T,
        refererPathAndSearch: w,
        adminCookie: g
      }, k = r.method !== "GET" && r.method !== "HEAD";
      let b = null, N = "none", R = "";
      if (k && r.body) {
        const v = tn(r.headers.get("Content-Length"));
        if (Number.isFinite(v) && v >= 0 && v <= Di) try {
          b = await r.clone().arrayBuffer(), N = "buffered", (c.isPlaybackInfoRequest === !0 || c.isPlaybackSessionControlRequest === !0) && (R = so(b));
        } catch {
          b = r.body, N = "stream";
        }
        else
          b = r.body, N = "stream";
      }
      const x = c?.isPlaybackInfoRequest === !0 && N !== "stream", O = !k || x, L = O ? u : u.slice(0, 1);
      return {
        newHeaders: f,
        adminCustomHeaders: m,
        transportTemplate: D,
        preparedBody: b,
        preparedBodyMode: N,
        preparedBodyText: R,
        retryTargetRecords: L,
        allowAutomaticRetry: O,
        allowSameTargetRetry: !k,
        clientRedirectAuthPolicy: Ra(f)
      };
    },
    buildProxyResponseHeaders(r, a, n, s, i, c = {}) {
      const l = new Headers(r.headers);
      Vu.forEach((f) => l.delete(f)), l.set("Access-Control-Allow-Origin", s), n && n["Access-Control-Expose-Headers"] && l.set("Access-Control-Expose-Headers", n["Access-Control-Expose-Headers"]), n && n["Access-Control-Allow-Methods"] && l.set("Access-Control-Allow-Methods", n["Access-Control-Allow-Methods"]);
      const u = a.headers.get("Access-Control-Request-Headers");
      u ? (l.set("Access-Control-Allow-Headers", u), Ur(l, "Access-Control-Request-Headers")) : n && n["Access-Control-Allow-Headers"] && l.set("Access-Control-Allow-Headers", n["Access-Control-Allow-Headers"]), s !== "*" && Ur(l, "Origin"), (!c.enableH3 || c.forceH1) && l.delete("Alt-Svc");
      const d = le(c.imageCacheMaxAge, Ii * 86400, 0, 365 * 86400);
      if (r.status >= 400 || i.isManifest || i.isBigStream || i.isSmartStrmMedia) l.set("Cache-Control", "no-store");
      else if (c.proxiedExternalRedirect) l.set("Cache-Control", "no-store");
      else if (i.isImage || i.isStaticFile || i.isSubtitle) {
        const f = Pp(a) ? "private" : "public";
        l.set("Cache-Control", `${f}, max-age=${d}`);
      }
      return Ce(l), l;
    },
    applyProxyRedirectHeaders(r, a, n, s, i, c, l, u = {}) {
      if (c) {
        Kc(r), r.set("Location", c.toString()), r.set("Cache-Control", "no-store");
        return;
      }
      if (!(a.status >= 300 && a.status < 400)) return;
      const d = r.get("Location");
      if (!d) return;
      const f = ks(Ea(d, l || n), n, s, i, {
        linkVariant: u.linkVariant,
        entryMode: u.entryMode
      });
      f && r.set("Location", f);
    },
    buildClientVisibleRedirectUrl(r, a, n, s, i, c = {}) {
      const l = r instanceof URL ? r : Ea(r, a);
      if (!l) return null;
      if (c.preserveWorkerProxy !== !0) return l;
      const u = ks(l, a, n, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      }), d = _t(n, s, {
        linkVariant: c.linkVariant,
        entryMode: c.entryMode
      });
      if (!u || !String(u).startsWith(d)) return l;
      try {
        const f = i instanceof URL ? i : new URL(String(i || ""));
        return new URL(u, f);
      } catch {
        return l;
      }
    },
    buildPlaybackInfoClientVisibleUrl(r, a = "/", n = {}) {
      const s = J(a), i = String(n.search || ""), c = String(n.hash || "");
      return String(r?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? zc(r?.requestUrl || r?.rawRequestUrl || "https://playback-info.local/", r?.nodeName, r?.nodeKey, s, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode,
        search: i,
        hash: c
      }).toString() : `${_p(yp(s, r?.nodeName, r?.nodeKey, { entryMode: r?.entryMode }), Sp(r))}${i}${c}`;
    },
    buildPlaybackInfoProxyUrl(r, a, n, s) {
      const i = String(a || "").trim();
      if (!i) return "";
      const c = fp(i, r?.proxyPath || "/", n, r?.requestUrl || r?.rawRequestUrl || s, _t(r?.nodeName, r?.nodeKey, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode
      }));
      if (c) return t.buildPlaybackInfoClientVisibleUrl(r, c.proxyPath, {
        search: c.search,
        hash: c.hash
      });
      let l;
      try {
        const d = s instanceof URL ? s : new URL(String(s || ""));
        l = new URL(i, d);
      } catch {
        return i;
      }
      if (!["http:", "https:"].includes(String(l.protocol || "").toLowerCase())) return i;
      if (n) {
        const { resolvedUrl: d, proxyPath: f } = Ia(l, n);
        if (d && f) {
          const m = mp(f, r?.proxyPath || "/", n);
          return t.buildPlaybackInfoClientVisibleUrl(r, m, {
            search: d.search,
            hash: d.hash
          });
        }
      }
      const u = hp(r?.requestUrl || r?.rawRequestUrl || "https://playback-info.local/", r?.nodeName, r?.nodeKey, l, {
        linkVariant: r?.linkVariant,
        entryMode: r?.entryMode
      });
      return String(r?.playbackInfoRewriteUrlMode || "").trim() === "absolute" ? u.toString() : t.buildPlaybackInfoClientVisibleUrl(r, u.pathname || "/", {
        search: u.search || "",
        hash: u.hash || ""
      });
    },
    sanitizePlaybackInfoSerializedResponseHeaders: uo,
    parsePlaybackInfoRootObject: nn,
    normalizeMediaAuthHeaders: Ws,
    appendMediaRedirectAuthToUrl: Go,
    buildPlaybackInfoContractErrorState(r, a, n = "invalid_payload", s = null) {
      const i = a?.response;
      return r.playbackInfoRewrite = "rejected", e.buildProxyErrorState(r, a, {
        message: "Upstream PlaybackInfo response must be a JSON object.",
        guardHeader: "X-Proxy-Contract-Guard",
        guardValue: "playback-info",
        details: $(s) ? s : {
          reason: String(n || "invalid_payload"),
          upstreamStatus: Number(i?.status) || 0,
          contentType: dr(i?.headers?.get?.("Content-Type")) || "missing"
        }
      });
    },
    async guardPlaybackInfoResponseContract(r, a) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0 || rr(a?.playbackInfoRepresentation) && a.playbackInfoRepresentation.response === a?.response) return a;
      const n = await Ll(a?.response, {
        requestMethod: r.requestMethod,
        maxBytes: Ro
      });
      return n.kind === "skip" ? a : n.kind === "invalid" ? n.reason === "body_too_large" ? (r.playbackInfoRewrite = "skipped_oversized", a) : t.buildPlaybackInfoContractErrorState(r, a, n.reason, n.details) : {
        ...a,
        playbackInfoRepresentation: n.representation
      };
    },
    decodePlaybackInfoJsonValue: Ba,
    normalizePlaybackInfoObjectArray: fo,
    sanitizePlaybackInfoMediaSource: Zs,
    sanitizePlaybackInfoMediaSourcesPayload: mo,
    rewritePlaybackInfoPayload(r, a, n, s) {
      return ei(a, { buildProxyUrl: (i) => t.buildPlaybackInfoProxyUrl(r, i, n, s) });
    },
    async maybeRewritePlaybackInfoResponse(r, a) {
      if (r?.requestTraits?.isPlaybackInfoRequest !== !0) return a;
      const n = Gt(r?.effectivePlaybackInfoMode) === "rewrite", s = n ? "not_needed" : "passthrough", i = a?.response;
      if (!i || !(i.status >= 200 && i.status < 300) || r.requestMethod === "HEAD" || i.status === 204 || i.status === 205 || !i.body)
        return r.playbackInfoRewrite !== "rejected" && (r.playbackInfoRewrite = s), a;
      if ((!rr(a?.playbackInfoRepresentation) || a.playbackInfoRepresentation.response !== i) && (a = await t.guardPlaybackInfoResponseContract(r, a), !rr(a?.playbackInfoRepresentation)))
        return a;
      try {
        const c = Dl(a.playbackInfoRepresentation, {
          rewriteEnabled: n,
          buildProxyUrl: (l) => t.buildPlaybackInfoProxyUrl(r, l, a?.activeTargetBase, a?.finalUrl || new URL(String(r?.requestUrl || r?.rawRequestUrl || "")))
        });
        return c.kind !== "valid" ? t.buildPlaybackInfoContractErrorState(r, a, c.reason || "normalization_failed") : (r.playbackInfoRewrite = c.rewriteState, {
          ...a,
          response: c.representation.response,
          playbackInfoRepresentation: c.representation
        });
      } catch {
        return t.buildPlaybackInfoContractErrorState(r, a, "normalization_failed");
      }
    }
  };
  return t;
}
function vg({ configReader: o, nodeRepository: e, logger: t, cachePort: r, fetchPort: a }) {
  const n = {}, s = {
    CacheManager: r,
    Logger: t,
    configReader: o,
    fetchPort: a,
    nodeRepository: e
  }, i = [
    hg(s, n),
    Eg(s, n),
    Dg(s, n),
    xg(s, n),
    Og(s, n)
  ];
  for (const c of i) for (const [l, u] of Object.entries(c)) n[l] = u;
  return n;
}
function Fg({ configReader: o, nodeRepository: e, logger: t, cachePort: r, fetchPort: a }) {
  const n = vg({
    configReader: o,
    nodeRepository: e,
    logger: t,
    cachePort: r,
    fetchPort: a
  });
  return Object.freeze({
    handle: (...s) => n.handle(...s),
    testingSupport: n
  });
}
function Ug(o = {}, e = {}) {
  return {
    getStatsBucketParts(t, r = F.Defaults.ScheduleUtcOffsetMinutes) {
      const a = ot(Number(t) || 0, r);
      return {
        bucketDate: a.dateKey,
        bucketHour: a.hour
      };
    },
    summarizeStatsHourlyEntries(t = [], r = {}) {
      const a = Oe(r.utcOffsetMinutes), n = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(t) ? t : []) {
        const i = Number(s?.timestamp) || 0;
        if (i <= 0) continue;
        const { bucketDate: c, bucketHour: l } = e.getStatsBucketParts(i, a), u = `${c}:${l}`, d = n.get(u) || {
          bucketDate: c,
          bucketHour: l,
          requestCount: 0,
          playCount: 0,
          playbackInfoCount: 0
        };
        d.requestCount += 1, Ud(s?.requestPath, s?.category) && (d.playCount += 1), Fd(s?.requestPath, s?.category) && (d.playbackInfoCount += 1), n.set(u, d);
      }
      return [...n.values()].sort((s, i) => s.bucketDate !== i.bucketDate ? String(s.bucketDate).localeCompare(String(i.bucketDate)) : Number(s.bucketHour) - Number(i.bucketHour));
    },
    async incrementStatsHourly(t, r = [], a = {}) {
      if (!t || !await e.hasStatsHourlyTable(t)) return !1;
      const n = e.summarizeStatsHourlyEntries(r, a);
      return n.length ? await e.upsertStatsHourlyBuckets(t, n, a) : !0;
    },
    async upsertStatsHourlyBuckets(t, r = [], a = {}) {
      if (!t || !await e.hasStatsHourlyTable(t)) return !1;
      const n = (Array.isArray(r) ? r : []).map((c) => ({
        bucketDate: String(c?.bucketDate || "").trim(),
        bucketHour: Math.max(0, Number(c?.bucketHour) || 0),
        requestCount: Math.max(0, Number(c?.requestCount) || 0),
        playCount: Math.max(0, Number(c?.playCount) || 0),
        playbackInfoCount: Math.max(0, Number(c?.playbackInfoCount) || 0)
      })).filter((c) => c.bucketDate);
      if (!n.length) return !0;
      const s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = Ha("proxy_stats_hourly.batch", JSON.stringify(n));
      return await t.prepare(`INSERT INTO ${e.STATS_HOURLY_TABLE} (
				bucket_date, bucket_hour, request_count, play_count, playback_info_count, updated_at
			)
			SELECT json_extract(entry.value, '$.bucketDate'), CAST(json_extract(entry.value, '$.bucketHour') AS INTEGER),
				CAST(json_extract(entry.value, '$.requestCount') AS INTEGER), CAST(json_extract(entry.value, '$.playCount') AS INTEGER),
				CAST(json_extract(entry.value, '$.playbackInfoCount') AS INTEGER), ?
			FROM json_each(?) AS entry
			WHERE 1
			ON CONFLICT(bucket_date, bucket_hour) DO UPDATE SET
				request_count = ${e.STATS_HOURLY_TABLE}.request_count + excluded.request_count,
				play_count = ${e.STATS_HOURLY_TABLE}.play_count + excluded.play_count,
				playback_info_count = ${e.STATS_HOURLY_TABLE}.playback_info_count + excluded.playback_info_count,
				updated_at = excluded.updated_at`).bind(s, i).run(), !0;
    },
    async clearStatsHourly(t) {
      return !t || !await e.hasStatsHourlyTable(t) ? !1 : (await t.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE}`).run(), !0);
    },
    getStatsUtcOffsetMinutesFromStatus(t = {}) {
      const r = Number(t?.statsUtcOffsetMinutes);
      return Number.isFinite(r) ? Oe(r) : null;
    },
    async getDailyStatsHourly(t, r) {
      if (!t || !r || !await e.hasStatsHourlyTable(t)) return [];
      try {
        const a = await t.prepare(`SELECT bucket_hour, request_count, play_count, playback_info_count
              FROM ${e.STATS_HOURLY_TABLE}
              WHERE bucket_date = ?
              ORDER BY bucket_hour ASC`).bind(String(r)).all();
        return Array.isArray(a?.results) ? a.results : [];
      } catch {
        return [];
      }
    },
    async rebuildStatsHourlyForDate(t, r = {}) {
      if (!t) return !1;
      const a = String(r.bucketDate || "").trim();
      return a ? (await e.ensureStatsHourlySchema(t), await t.prepare(`DELETE FROM ${e.STATS_HOURLY_TABLE} WHERE bucket_date = ?`).bind(a).run(), !0) : !1;
    },
    async rebuildStatsHourlyWindow(t, r = {}) {
      return t ? (await e.ensureStatsHourlySchema(t), await e.clearStatsHourly(t), !0) : !1;
    },
    async ensureStatsHourlyWindowAligned(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = a?.db || null;
      if (!n || !await e.hasStatsHourlyTable(n)) return {
        rebuilt: !1,
        reason: "stats_unavailable"
      };
      const s = ae(r.config || {}), i = Oe(s.scheduleUtcOffsetMinutes), c = await e.getOpsStatusSection(a, "log");
      if (e.getStatsUtcOffsetMinutesFromStatus(c) === i && r.force !== !0) return {
        rebuilt: !1,
        reason: "already_aligned",
        utcOffsetMinutes: i
      };
      const l = r.now instanceof Date ? r.now : /* @__PURE__ */ new Date(), u = le(s.logRetentionDays, F.Defaults.LogRetentionDays, 1, F.Defaults.LogRetentionDaysMax), d = Math.max(0, l.getTime() - u * 24 * 60 * 60 * 1e3), f = l.getTime();
      return await e.rebuildStatsHourlyWindow(n, {
        startTs: d,
        endTs: f,
        utcOffsetMinutes: i
      }), await e.patchOpsStatus(a, { log: {
        schemaReady: !0,
        statsReady: !0,
        statsUtcOffsetMinutes: i,
        statsAlignedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
        statsAlignedWindowStartAt: new Date(d).toISOString(),
        statsAlignedWindowEndAt: new Date(f).toISOString()
      } }), {
        rebuilt: !0,
        utcOffsetMinutes: i,
        startTs: d,
        endTs: f
      };
    },
    getLegacyLogsFtsTriggerNames() {
      return new Set([
        String(e.LOGS_FTS_INSERT_TRIGGER || "").toLowerCase(),
        `${e.LOGS_TABLE}_ai`,
        `${e.LOGS_TABLE}_au`,
        `${e.LOGS_TABLE}_ad`,
        `${e.LOGS_FTS_TABLE}_ai`,
        `${e.LOGS_FTS_TABLE}_au`,
        `${e.LOGS_FTS_TABLE}_ad`
      ].map((t) => String(t || "").toLowerCase()));
    },
    isLogsFtsSyncTrigger(t) {
      const r = String(t?.name || "").trim();
      return r ? e.getLegacyLogsFtsTriggerNames().has(r.toLowerCase()) ? !0 : Cr(t?.sql || "").includes(e.LOGS_FTS_TABLE.toLowerCase()) : !1;
    },
    async dropLogsFtsSyncTriggers(t) {
      if (!t) return 0;
      let r = 0, a = [];
      try {
        a = (await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(e.LOGS_TABLE).all())?.results || [];
      } catch {
      }
      for (const n of a) {
        const s = String(n?.name || "").trim();
        s && e.isLogsFtsSyncTrigger(n) && (await t.prepare(`DROP TRIGGER IF EXISTS ${ce(s)}`).run(), r += 1);
      }
      return r;
    },
    async rebuildLogsFts(t) {
      return !t || !await e.hasLogsFtsTable(t) ? !1 : (await t.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), !0);
    },
    async ensureLogsFtsSchema(t, r = {}) {
      if (!t) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      const a = r.forceRecreate === !0;
      r.baseSchemaReady !== !0 && await e.ensureLogsBaseSchema(t);
      const n = await e.getLogsFtsReadiness(t);
      if (n.ready && !a) return {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      if (n.tableReady && !a) {
        const l = /* @__PURE__ */ new Error("Existing FTS schema does not match the current contract");
        throw l.code = "D1_SCHEMA_INCOMPATIBLE", l.status = 409, l.details = { phase: "fts_preflight" }, l;
      }
      let s = !1, i = 0;
      a && (i = await e.dropLogsFtsSyncTriggers(t), await t.prepare(`DROP TABLE IF EXISTS ${e.LOGS_FTS_TABLE}`).run(), s = !0), await t.prepare(`CREATE VIRTUAL TABLE IF NOT EXISTS ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`).run(), a && (i += await e.dropLogsFtsSyncTriggers(t)), await t.prepare(`CREATE TRIGGER IF NOT EXISTS ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
            INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
            VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
          END;`).run();
      const c = (await t.prepare(`SELECT COUNT(*) as total FROM ${e.LOGS_TABLE}`).first())?.total || 0;
      return await t.prepare(`INSERT INTO ${e.LOGS_FTS_TABLE}(${e.LOGS_FTS_TABLE}) VALUES('rebuild')`).run(), {
        migratedRows: c,
        droppedTriggers: i,
        rebuilt: !0,
        recreated: s
      };
    }
  };
}
function kg(o = {}, e = {}) {
  return {
    async ensureDnsIpWorkspaceSchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "dnsIpWorkspaceSchema")) return !0;
      let r = Y.DnsIpWorkspaceDbReady.get(t);
      r || (r = (async () => (await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_ITEMS_TABLE} (
                id TEXT PRIMARY KEY,
                ip TEXT NOT NULL UNIQUE,
                ip_type TEXT NOT NULL,
                source_kind TEXT NOT NULL,
                source_label TEXT,
                line_label TEXT NOT NULL DEFAULT '',
                remark TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`).run(), await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_SOURCES_TABLE} (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                source_type TEXT NOT NULL DEFAULT 'url',
                domain TEXT,
                source_kind TEXT NOT NULL DEFAULT 'custom',
                preset_id TEXT NOT NULL DEFAULT '',
                builtin_id TEXT NOT NULL DEFAULT '',
                enabled INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER NOT NULL DEFAULT 0,
                ip_limit INTEGER NOT NULL DEFAULT 5,
                last_fetch_at TEXT,
                last_fetch_status TEXT,
                last_fetch_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`).run(), await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
                signature TEXT PRIMARY KEY,
                items_json TEXT NOT NULL,
                source_results_json TEXT NOT NULL,
                imported_count INTEGER NOT NULL DEFAULT 0,
                enabled_source_count INTEGER NOT NULL DEFAULT 0,
                cached_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`).run(), await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.DNS_IP_PROBE_CACHE_TABLE} (
                ip TEXT NOT NULL,
                entry_colo TEXT NOT NULL,
                probe_status TEXT NOT NULL,
                latency_ms INTEGER,
                cf_ray TEXT,
                colo_code TEXT,
                city_name TEXT,
                country_code TEXT,
                country_name TEXT,
                probed_at TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                PRIMARY KEY (ip, entry_colo)
              )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`).run(), e.markD1SchemaReady(t, "dnsIpWorkspaceSchema"), !0))().catch((a) => {
        throw Y.DnsIpWorkspaceDbReady.delete(t), a;
      }), Y.DnsIpWorkspaceDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.DnsIpWorkspaceDbReady.get(t) === r && Y.DnsIpWorkspaceDbReady.delete(t);
      }
    },
    getDnsIpPoolRevisionFromStatus(t = {}) {
      const r = String(t?.revision || "").trim();
      return r || Ht("dns_ip_pool", String(t?.updatedAt || "").trim());
    },
    async bumpDnsIpPoolRevision(t, r = {}, a = null) {
      const n = await e.getOpsStatusSection(t, "dnsIpPool"), s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = ne(`${e.getDnsIpPoolRevisionFromStatus(n)}:${s}:${Z(r)}`);
      return await e.patchOpsStatus(t, { dnsIpPool: {
        ...r,
        revision: Ht(i, s),
        updatedAt: s
      } }, a);
    },
    async getDnsIpPoolItems(t) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const r = await t.prepare(`SELECT id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
              FROM ${e.DNS_IP_POOL_ITEMS_TABLE}
              ORDER BY updated_at DESC, ip ASC`).all();
        return (Array.isArray(r?.results) ? r.results : []).map((a) => fr(a)).filter(Boolean);
      } catch {
        return [];
      }
    },
    async upsertDnsIpPoolItems(t, r = [], a = {}) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const n = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), s = /* @__PURE__ */ new Map();
      for (const u of Array.isArray(r) ? r : []) {
        const d = fr(u, {
          createdAt: n,
          updatedAt: n,
          sourceKind: a.sourceKind,
          sourceLabel: a.sourceLabel
        });
        d && s.set(d.ip.toLowerCase(), d);
      }
      const i = [...s.values()];
      if (!i.length) return [];
      const c = JSON.stringify(i.map((u) => ({
        id: u.id,
        ip: u.ip,
        ipType: u.ipType,
        sourceKind: u.sourceKind,
        sourceLabel: u.sourceLabel,
        lineLabel: u.lineLabel,
        remark: u.remark,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      })));
      Ha("dns_ip_pool_items.batch", c);
      const l = t.prepare(`INSERT INTO ${e.DNS_IP_POOL_ITEMS_TABLE} (
            id, ip, ip_type, source_kind, source_label, line_label, remark, created_at, updated_at
          )
          SELECT
            json_extract(entry.value, '$.id'),
            json_extract(entry.value, '$.ip'),
            json_extract(entry.value, '$.ipType'),
            json_extract(entry.value, '$.sourceKind'),
            json_extract(entry.value, '$.sourceLabel'),
            json_extract(entry.value, '$.lineLabel'),
            json_extract(entry.value, '$.remark'),
            json_extract(entry.value, '$.createdAt'),
            json_extract(entry.value, '$.updatedAt')
          FROM json_each(?) AS entry
          WHERE 1
          ON CONFLICT(ip) DO UPDATE SET
            ip_type = excluded.ip_type,
            source_kind = excluded.source_kind,
            source_label = excluded.source_label,
            line_label = CASE WHEN COALESCE(excluded.line_label, '') != '' THEN excluded.line_label ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.line_label END,
            remark = CASE WHEN COALESCE(excluded.remark, '') != '' THEN excluded.remark ELSE ${e.DNS_IP_POOL_ITEMS_TABLE}.remark END,
            updated_at = excluded.updated_at`).bind(c);
      return await t.batch([l]), i;
    },
    async deleteDnsIpPoolItems(t, r = []) {
      if (!t) return 0;
      await e.ensureDnsIpWorkspaceSchema(t);
      const a = [...new Set((Array.isArray(r) ? r : []).map((s) => String(s || "").trim()).filter((s) => qe(s)))];
      if (!a.length) return 0;
      const n = JSON.stringify(a);
      return Ha("dns_ip_pool_items.delete_batch", n), await t.batch([t.prepare(`DELETE FROM ${e.DNS_IP_POOL_ITEMS_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(n), t.prepare(`DELETE FROM ${e.DNS_IP_PROBE_CACHE_TABLE} WHERE ip IN (SELECT value FROM json_each(?))`).bind(n)]), a.length;
    },
    async getDnsIpPoolSourcesFromDb(t, r = {}) {
      if (!t) return [];
      r.schemaReady !== !0 && await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const a = await t.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
              FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
              ORDER BY sort_order ASC, updated_at ASC`).all();
        return (Array.isArray(a?.results) ? a.results : []).map((n, s) => Nt(n, s)).filter((n) => or(n));
      } catch {
        return [];
      }
    },
    async getDnsIpPoolSourcesFromDbStrict(t) {
      if (!t) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(t);
      const r = await t.prepare(`SELECT id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
            FROM ${e.DNS_IP_POOL_SOURCES_TABLE}
            ORDER BY sort_order ASC, updated_at ASC`).all();
      return (Array.isArray(r?.results) ? r.results : []).map((a, n) => Nt(a, n)).filter((a) => or(a));
    },
    async getDnsIpPoolSources(t) {
      const r = e.resolveOpsStatusStores(t)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(r);
    },
    async getDnsIpPoolSourcesForRead(t) {
      const r = e.resolveOpsStatusStores(t)?.db || null;
      return await e.getDnsIpPoolSourcesFromDb(r);
    },
    async persistDnsIpPoolSources(t, r = [], a = null) {
      const n = (Array.isArray(r) ? r : []).map((c, l) => Nt(c, l)).filter((c) => or(c)), s = e.resolveOpsStatusStores(t)?.db || null;
      if (!s) throw new Error("D1 not configured");
      await e.ensureDnsIpWorkspaceSchema(s);
      const i = [s.prepare(`DELETE FROM ${e.DNS_IP_POOL_SOURCES_TABLE}`)];
      if (n.length) {
        const c = JSON.stringify(n.map((l) => ({
          id: l.id,
          name: l.name,
          url: l.url,
          sourceType: l.sourceType,
          domain: l.domain,
          sourceKind: l.sourceKind,
          presetId: l.presetId,
          builtinId: l.builtinId,
          enabled: l.enabled ? 1 : 0,
          sortOrder: l.sortOrder,
          ipLimit: l.ipLimit,
          lastFetchAt: l.lastFetchAt,
          lastFetchStatus: l.lastFetchStatus,
          lastFetchCount: l.lastFetchCount,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt
        })));
        Ha("dns_ip_pool_sources.batch", c), i.push(s.prepare(`INSERT INTO ${e.DNS_IP_POOL_SOURCES_TABLE} (
            id, name, url, source_type, domain, source_kind, preset_id, builtin_id, enabled, sort_order, ip_limit, last_fetch_at, last_fetch_status, last_fetch_count, created_at, updated_at
          ) SELECT
            json_extract(entry.value, '$.id'),
            json_extract(entry.value, '$.name'),
            json_extract(entry.value, '$.url'),
            json_extract(entry.value, '$.sourceType'),
            json_extract(entry.value, '$.domain'),
            json_extract(entry.value, '$.sourceKind'),
            json_extract(entry.value, '$.presetId'),
            json_extract(entry.value, '$.builtinId'),
            json_extract(entry.value, '$.enabled'),
            json_extract(entry.value, '$.sortOrder'),
            json_extract(entry.value, '$.ipLimit'),
            json_extract(entry.value, '$.lastFetchAt'),
            json_extract(entry.value, '$.lastFetchStatus'),
            json_extract(entry.value, '$.lastFetchCount'),
            json_extract(entry.value, '$.createdAt'),
            json_extract(entry.value, '$.updatedAt')
          FROM json_each(?) AS entry`).bind(c));
      }
      return await s.batch(i), n;
    },
    async updateDnsIpPoolSourceFetchState(t, r = "", a = {}) {
      if (!t || !r) return !1;
      await e.ensureDnsIpWorkspaceSchema(t);
      const n = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
      return await t.prepare(`UPDATE ${e.DNS_IP_POOL_SOURCES_TABLE}
            SET last_fetch_at = ?, last_fetch_status = ?, last_fetch_count = ?, updated_at = ?
            WHERE id = ?`).bind(String(a.lastFetchAt || n), String(a.lastFetchStatus || ""), Math.max(0, Number(a.lastFetchCount) || 0), n, String(r)).run(), !0;
    },
    async getDnsIpPoolFetchCacheEntry(t, r = "") {
      if (!t || !r) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const a = await t.prepare(`SELECT signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
              FROM ${e.DNS_IP_POOL_FETCH_CACHE_TABLE}
              WHERE signature = ? AND expires_at > ?
              LIMIT 1`).bind(String(r), H()).first();
        if (!a) return null;
        const n = JSON.parse(String(a.items_json || "[]")), s = JSON.parse(String(a.source_results_json || "[]")), i = mr(Array.isArray(n) ? n : []), c = Array.isArray(s) ? s : [];
        return {
          signature: String(a.signature || ""),
          items: i,
          sourceResults: c,
          importedCount: Math.max(0, Number(a.imported_count) || i.length),
          enabledSourceCount: Math.max(0, Number(a.enabled_source_count) || 0),
          cachedAtMs: Math.max(0, Number(a.cached_at) || 0),
          expiresAtMs: Math.max(0, Number(a.expires_at) || 0),
          createdAt: String(a.created_at || ""),
          updatedAt: String(a.updated_at || "")
        };
      } catch {
        return null;
      }
    },
    async upsertDnsIpPoolFetchCacheEntry(t, r = {}) {
      if (!t) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      const a = String(r?.signature || "").trim();
      if (!a) return null;
      const n = mr(r?.items || []), s = (Array.isArray(r?.sourceResults) ? r.sourceResults : []).map((h) => gi(h, h)), i = Math.max(0, Number(r?.cachedAtMs ?? r?.cached_at ?? H()) || H()), c = Math.max(i, Number(r?.expiresAtMs ?? r?.expires_at ?? i + 24e5) || i + 24e5), l = String(r?.createdAt || r?.created_at || new Date(i).toISOString()), u = String(r?.updatedAt || r?.updated_at || new Date(i).toISOString()), d = Math.max(0, Number(r?.importedCount ?? r?.imported_count) || n.length), f = Math.max(0, Number(r?.enabledSourceCount ?? r?.enabled_source_count) || 0), m = JSON.stringify(n), p = JSON.stringify(s);
      return Fe(m) + Fe(p) > Vt ? null : (await t.prepare(`INSERT INTO ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (
            signature, items_json, source_results_json, imported_count, enabled_source_count, cached_at, expires_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(signature) DO UPDATE SET
            items_json = excluded.items_json,
            source_results_json = excluded.source_results_json,
            imported_count = excluded.imported_count,
            enabled_source_count = excluded.enabled_source_count,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
				updated_at = excluded.updated_at`).bind(a, m, p, d, f, i, c, l, u).run(), {
        signature: a,
        items: n,
        sourceResults: s,
        importedCount: d,
        enabledSourceCount: f,
        cachedAtMs: i,
        expiresAtMs: c,
        createdAt: l,
        updatedAt: u
      });
    },
    async getDnsIpProbeCacheEntry(t, r = "", a = "") {
      if (!t || !r || !a) return null;
      await e.ensureDnsIpWorkspaceSchema(t);
      try {
        const n = await t.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
              FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
              WHERE ip = ? AND entry_colo = ? AND expires_at > ?
              LIMIT 1`).bind(String(r), String(a).toUpperCase(), H()).first();
        return n ? {
          ip: String(n.ip || ""),
          entryColo: String(n.entry_colo || "").toUpperCase(),
          probeStatus: Ua(n.probe_status),
          latencyMs: Number.isFinite(Number(n.latency_ms)) ? Math.round(Number(n.latency_ms)) : null,
          cfRay: String(n.cf_ray || ""),
          coloCode: String(n.colo_code || "").toUpperCase(),
          cityName: String(n.city_name || ""),
          countryCode: String(n.country_code || "").toUpperCase(),
          countryName: String(n.country_name || ""),
          probedAt: String(n.probed_at || ""),
          expiresAt: Math.max(0, Number(n.expires_at) || 0)
        } : null;
      } catch {
        return null;
      }
    },
    async getDnsIpProbeCacheEntries(t, r = [], a = "") {
      if (!t || !a) return [];
      const n = [...new Set((Array.isArray(r) ? r : []).map((c) => String(c || "").trim()).filter(Boolean))];
      if (!n.length) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const s = [], i = H();
      try {
        for (let c = 0; c < n.length; c += 98) {
          const l = n.slice(c, c + 98);
          if (!l.length) continue;
          const u = l.map(() => "?").join(", "), d = await t.prepare(`SELECT ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
                FROM ${e.DNS_IP_PROBE_CACHE_TABLE}
                WHERE entry_colo = ? AND expires_at > ? AND ip IN (${u})`).bind(String(a).toUpperCase(), i, ...l).all();
          s.push(...Array.isArray(d?.results) ? d.results : []);
        }
      } catch {
        return [];
      }
      return s.map((c) => ({
        ip: String(c?.ip || ""),
        entryColo: String(c?.entry_colo || "").toUpperCase(),
        probeStatus: Ua(c?.probe_status),
        latencyMs: Number.isFinite(Number(c?.latency_ms)) ? Math.round(Number(c?.latency_ms)) : null,
        cfRay: String(c?.cf_ray || ""),
        coloCode: String(c?.colo_code || "").toUpperCase(),
        cityName: String(c?.city_name || ""),
        countryCode: String(c?.country_code || "").toUpperCase(),
        countryName: String(c?.country_name || ""),
        probedAt: String(c?.probed_at || ""),
        expiresAt: Math.max(0, Number(c?.expires_at) || 0)
      }));
    },
    async upsertDnsIpProbeCacheEntries(t, r = []) {
      if (!t) return [];
      await e.ensureDnsIpWorkspaceSchema(t);
      const a = (Array.isArray(r) ? r : []).map((s) => ({
        ip: String(s?.ip || "").trim(),
        entryColo: String(s?.entryColo || s?.entry_colo || "").trim().toUpperCase(),
        probeStatus: Ua(s?.probeStatus || s?.probe_status || ""),
        latencyMs: Number.isFinite(Number(s?.latencyMs ?? s?.latency_ms)) ? Math.round(Number(s?.latencyMs ?? s?.latency_ms)) : null,
        cfRay: String(s?.cfRay || s?.cf_ray || ""),
        coloCode: String(s?.coloCode || s?.colo_code || "").toUpperCase(),
        cityName: String(s?.cityName || s?.city_name || ""),
        countryCode: String(s?.countryCode || s?.country_code || "").toUpperCase(),
        countryName: String(s?.countryName || s?.country_name || ""),
        probedAt: String(s?.probedAt || s?.probed_at || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()),
        expiresAt: Math.max(H(), Number(s?.expiresAt ?? s?.expires_at) || 0)
      })).filter((s) => qe(s.ip) && s.entryColo);
      if (!a.length) return [];
      const n = JSON.stringify(a);
      return Fe(n) > Vt ? [] : (await t.prepare(`INSERT INTO ${e.DNS_IP_PROBE_CACHE_TABLE} (
				ip, entry_colo, probe_status, latency_ms, cf_ray, colo_code, city_name, country_code, country_name, probed_at, expires_at
			) SELECT
				json_extract(entry.value, '$.ip'),
				json_extract(entry.value, '$.entryColo'),
				json_extract(entry.value, '$.probeStatus'),
				json_extract(entry.value, '$.latencyMs'),
				json_extract(entry.value, '$.cfRay'),
				json_extract(entry.value, '$.coloCode'),
				json_extract(entry.value, '$.cityName'),
				json_extract(entry.value, '$.countryCode'),
				json_extract(entry.value, '$.countryName'),
				json_extract(entry.value, '$.probedAt'),
				json_extract(entry.value, '$.expiresAt')
			FROM json_each(?) AS entry
			WHERE 1
			ON CONFLICT(ip, entry_colo) DO UPDATE SET
            probe_status = excluded.probe_status,
            latency_ms = excluded.latency_ms,
            cf_ray = excluded.cf_ray,
            colo_code = excluded.colo_code,
            city_name = excluded.city_name,
            country_code = excluded.country_code,
            country_name = excluded.country_name,
            probed_at = excluded.probed_at,
				expires_at = excluded.expires_at`).bind(n).run(), a);
    },
    async upsertDnsIpProbeCacheEntry(t, r = {}) {
      return (await e.upsertDnsIpProbeCacheEntries(t, [r]))[0] || null;
    }
  };
}
function Hg(o = {}, e = {}) {
  return {
    resolveOpsStatusStores(t) {
      return t && typeof t == "object" && !Array.isArray(t) && ("kv" in t || "db" in t) ? {
        kv: t.kv || null,
        db: t.db || null
      } : t && typeof t.prepare == "function" ? {
        kv: null,
        db: t
      } : t && typeof t.get == "function" ? {
        kv: t,
        db: null
      } : {
        kv: e.getKV(t),
        db: e.getDB(t)
      };
    },
    getOpsStatusDbScope(t = "") {
      return t ? e.OPS_STATUS_SECTION_SCOPES[t] || `ops_status:${t}` : e.OPS_STATUS_DB_SCOPE_ROOT;
    },
    getOpsStatusShadowState(t) {
      if (!t || typeof t.prepare != "function") return null;
      let r = Y.OpsStatusShadowCache.get(t);
      return r || (r = {
        pendingPatch: {},
        flushPromise: null,
        payloadCache: /* @__PURE__ */ new Map()
      }, Y.OpsStatusShadowCache.set(t, r)), r;
    },
    getOpsStatusShadowPatch(t) {
      const r = e.getOpsStatusShadowState(t);
      return $(r?.pendingPatch) ? r.pendingPatch : {};
    },
    getOpsStatusPayloadCache(t) {
      const r = e.getOpsStatusShadowState(t);
      return r ? (r.payloadCache instanceof Map || (r.payloadCache = /* @__PURE__ */ new Map()), r.payloadCache) : null;
    },
    cacheOpsStatusPayload(t, r, a) {
      const n = e.getOpsStatusPayloadCache(t);
      n && Ie(n, String(r || ""), {
        payload: a && typeof a == "object" ? a : null,
        expiresAt: H() + Math.max(1e3, Number(F.Defaults.OpsStatusReadCacheTtlMs) || 1e3)
      }, 8);
    },
    buildOpsStatusRootPatch(t = {}) {
      const r = t && typeof t == "object" ? t : {}, a = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), n = {};
      for (const [s, i] of Object.entries(r)) {
        if (e.OPS_STATUS_SECTION_SCOPES[s]) {
          const c = Ve(n[s], i);
          c.updatedAt = a, n[s] = c;
          continue;
        }
        n[s] = i;
      }
      return n;
    },
    async flushOpsStatusShadow(t, r = {}) {
      const a = t?.db || null;
      if (!a) return {};
      const n = Array.isArray(r.patchKeys) ? r.patchKeys : [], s = e.getOpsStatusShadowState(a);
      if (!s) return {};
      if (s.flushPromise) return s.flushPromise;
      const i = (async () => {
        const c = $(s.pendingPatch) ? s.pendingPatch : {};
        if (!Object.keys(c).length) return await e.getOpsStatusFromStores(t);
        s.pendingPatch = {};
        try {
          const l = H(), u = new Date(l).toISOString();
          if (!await e.ensureSysStatusTable(a))
            return Ae("ops_status.db_unavailable", /* @__PURE__ */ new Error("sys_status table unavailable"), { patchKeys: n }), s.pendingPatch = Ve(c, s.pendingPatch), await e.getOpsStatusFromStores(t);
          const d = await e.getOpsStatusPayloadFromDb(a, e.getOpsStatusDbScope()), f = Ve(d && typeof d == "object" ? d : {}, c);
          return f.updatedAt = u, await e.putOpsStatusPayloadToDb(a, e.getOpsStatusDbScope(), f, l), Ve(f, e.getOpsStatusShadowPatch(a));
        } catch (l) {
          throw s.pendingPatch = Ve(c, s.pendingPatch), l;
        }
      })().finally(() => {
        s.flushPromise === i && (s.flushPromise = null);
      });
      return s.flushPromise = i, i;
    },
    async ensureSysStatusTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "sysStatusTable")) return !0;
      let r = Y.OpsStatusDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.SYS_STATUS_TABLE} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`).run(), e.markD1SchemaReady(t, "sysStatusTable"), !0;
        } catch (a) {
          return console.warn("sys_status init failed", a), !1;
        }
      })(), Y.OpsStatusDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.OpsStatusDbReady.get(t) === r && Y.OpsStatusDbReady.delete(t);
      }
    },
    async ensureAuthFailuresTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "authFailuresTable")) return !0;
      let r = Y.AuthFailuresDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.AUTH_FAILURES_TABLE} (
                  ip TEXT PRIMARY KEY,
                  fail_count INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`).run(), e.markD1SchemaReady(t, "authFailuresTable"), !0;
        } catch (a) {
          return console.warn("auth_failures init failed", a), !1;
        }
      })(), Y.AuthFailuresDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.AuthFailuresDbReady.get(t) === r && Y.AuthFailuresDbReady.delete(t);
      }
    },
    async getAuthFailureEntry(t, r = "") {
      const a = String(r || "").trim();
      if (!a || !t || !await e.ensureAuthFailuresTable(t)) return null;
      try {
        const n = await t.prepare(`SELECT ip, fail_count, expires_at, updated_at
              FROM ${e.AUTH_FAILURES_TABLE}
              WHERE ip = ?
              LIMIT 1`).bind(a).first();
        if (!n) return null;
        const s = Number(n?.expires_at ?? n?.expiresAt) || 0;
        return s > 0 && s <= H() ? (await e.deleteAuthFailureEntry(t, a).catch(() => !1), null) : {
          ip: a,
          failCount: Math.max(0, Number(n?.fail_count ?? n?.failCount) || 0),
          expiresAt: s,
          updatedAt: Number(n?.updated_at ?? n?.updatedAt) || 0
        };
      } catch (n) {
        return Ae("auth_failures.read_failed", n, { ip: a }), null;
      }
    },
    async upsertAuthFailureEntry(t, r = "", a = {}) {
      const n = String(r || "").trim();
      if (!n || !t || !await e.ensureAuthFailuresTable(t)) return null;
      const s = Math.max(0, Number(a?.failCount) || 0), i = Math.max(0, Number(a?.expiresAt) || 0), c = Math.max(0, Number(a?.updatedAt) || H());
      return await t.prepare(`INSERT INTO ${e.AUTH_FAILURES_TABLE} (ip, fail_count, expires_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET
              fail_count = excluded.fail_count,
              expires_at = excluded.expires_at,
              updated_at = excluded.updated_at`).bind(n, s, i, c).run(), {
        ip: n,
        failCount: s,
        expiresAt: i,
        updatedAt: c
      };
    },
    async deleteAuthFailureEntry(t, r = "") {
      const a = String(r || "").trim();
      return !a || !t || !await e.ensureAuthFailuresTable(t) ? !1 : (await t.prepare(`DELETE FROM ${e.AUTH_FAILURES_TABLE} WHERE ip = ?`).bind(a).run(), !0);
    }
  };
}
function $g(o = {}, e = {}) {
  return {
    async ensureCfDashboardCacheTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "cfDashboardCacheTable")) return !0;
      let r = Y.CfDashboardCacheDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_DASH_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  zone_id TEXT NOT NULL,
                  bucket_date TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  version INTEGER NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(t, "cfDashboardCacheTable"), !0;
        } catch (a) {
          return console.warn("cf_dashboard_cache init failed", a), !1;
        }
      })(), Y.CfDashboardCacheDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.CfDashboardCacheDbReady.get(t) === r && Y.CfDashboardCacheDbReady.delete(t);
      }
    },
    async getCfDashboardCacheEntry(t, r = "", a = {}) {
      const n = String(r || "").trim();
      if (!n || !t || !await e.ensureCfDashboardCacheTable(t)) return null;
      const s = Math.max(0, Number(a.nowMs) || H()), i = a.includeExpired === !0, c = i ? `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
                FROM ${e.CF_DASH_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let l = t.prepare(c).bind(n);
        i || (l = t.prepare(c).bind(n, s));
        const u = await l.first();
        if (!u?.payload) return null;
        let d = null;
        try {
          d = JSON.parse(String(u.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: n,
          zoneId: String(u?.zone_id || u?.zoneId || ""),
          bucketDate: String(u?.bucket_date || u?.bucketDate || ""),
          payload: eo(d),
          version: Number(u?.version) || 0,
          cachedAt: Number(u?.cached_at ?? u?.cachedAt) || 0,
          expiresAt: Number(u?.expires_at ?? u?.expiresAt) || 0,
          updatedAt: Number(u?.updated_at ?? u?.updatedAt) || 0
        };
      } catch (l) {
        return Ae("cf_dashboard_cache.read_failed", l, { cacheKey: n }), null;
      }
    },
    async putCfDashboardCacheEntry(t, r = {}) {
      if (!t || !await e.ensureCfDashboardCacheTable(t)) return null;
      const a = String(r?.cacheKey || "").trim();
      if (!a) return null;
      const n = String(r?.zoneId || "").trim() || "default", s = String(r?.bucketDate || "").trim() || "current", i = Math.max(0, Number(r?.version) || 0), c = Math.max(0, Number(r?.cachedAt) || H()), l = Math.max(c, Number(r?.expiresAt) || c), u = Math.max(c, Number(r?.updatedAt) || c), d = JSON.stringify(eo(r?.payload || {}));
      return Fe(d) > Vt ? null : (await t.prepare(`INSERT INTO ${e.CF_DASH_CACHE_TABLE} (
            cache_key, zone_id, bucket_date, payload, version, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            zone_id = excluded.zone_id,
            bucket_date = excluded.bucket_date,
            payload = excluded.payload,
            version = excluded.version,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(a, n, s, d, i, c, l, u).run(), {
        cacheKey: a,
        zoneId: n,
        bucketDate: s,
        version: i,
        cachedAt: c,
        expiresAt: l,
        updatedAt: u
      });
    },
    async deleteCfDashboardCacheEntry(t, r = "") {
      const a = String(r || "").trim();
      if (!a || !t || !await e.ensureCfDashboardCacheTable(t)) return !1;
      try {
        return await t.prepare(`DELETE FROM ${e.CF_DASH_CACHE_TABLE} WHERE cache_key = ?`).bind(a).run(), !0;
      } catch (n) {
        return Ae("cf_dashboard_cache.delete_failed", n, { cacheKey: a }), !1;
      }
    },
    async invalidateDashboardSnapshotCacheForConfigChange(t, r = {}) {
      const a = r?.db || e.getDB(t);
      if (!a) return 0;
      const n = Math.max(0, Number(r.nowMs) || H()), s = /* @__PURE__ */ new Set();
      for (const i of [r?.prevConfig, r?.nextConfig]) {
        if (!i || typeof i != "object") continue;
        const c = ae(i), l = st(new Date(n), c.scheduleUtcOffsetMinutes);
        s.add(Qn(c.cfZoneId, l.dateKey));
      }
      return s.size ? (await pe(Promise.all([...s].map((i) => e.deleteCfDashboardCacheEntry(a, i))), "dashboard.cache_invalidate", { cacheKeys: [...s] }, null), s.size) : 0;
    },
    async ensureCfRuntimeCacheTable(t) {
      if (!t || typeof t.prepare != "function") return !1;
      if (e.isD1SchemaReadyCached(t, "cfRuntimeCacheTable")) return !0;
      let r = Y.CfRuntimeCacheDbReady.get(t);
      r || (r = (async () => {
        try {
          return await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.CF_RUNTIME_CACHE_TABLE} (
                  cache_key TEXT PRIMARY KEY,
                  cache_group TEXT NOT NULL,
                  resource_id TEXT NOT NULL,
                  payload TEXT NOT NULL,
                  cached_at INTEGER NOT NULL,
                  expires_at INTEGER NOT NULL,
                  updated_at INTEGER NOT NULL
                )`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`).run(), e.markD1SchemaReady(t, "cfRuntimeCacheTable"), !0;
        } catch (a) {
          return console.warn("cf_runtime_cache init failed", a), !1;
        }
      })(), Y.CfRuntimeCacheDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.CfRuntimeCacheDbReady.get(t) === r && Y.CfRuntimeCacheDbReady.delete(t);
      }
    },
    async getCfRuntimeCacheEntry(t, r = "", a = {}) {
      const n = String(r || "").trim();
      if (!n || !t || !await e.ensureCfRuntimeCacheTable(t)) return null;
      const s = Math.max(0, Number(a.nowMs) || H()), i = a.includeExpired === !0, c = i ? `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ?
                LIMIT 1` : `SELECT cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
                FROM ${e.CF_RUNTIME_CACHE_TABLE}
                WHERE cache_key = ? AND expires_at > ?
                LIMIT 1`;
      try {
        let l = t.prepare(c).bind(n);
        i || (l = t.prepare(c).bind(n, s));
        const u = await l.first();
        if (!u?.payload) return null;
        let d = null;
        try {
          d = JSON.parse(String(u.payload || "{}"));
        } catch {
          return null;
        }
        return {
          cacheKey: n,
          cacheGroup: String(u?.cache_group || u?.cacheGroup || ""),
          resourceId: String(u?.resource_id || u?.resourceId || ""),
          payload: ($(d), d),
          cachedAt: Number(u?.cached_at ?? u?.cachedAt) || 0,
          expiresAt: Number(u?.expires_at ?? u?.expiresAt) || 0,
          updatedAt: Number(u?.updated_at ?? u?.updatedAt) || 0
        };
      } catch (l) {
        return Ae("cf_runtime_cache.read_failed", l, { cacheKey: n }), null;
      }
    },
    async putCfRuntimeCacheEntry(t, r = {}) {
      if (!t || !await e.ensureCfRuntimeCacheTable(t)) return null;
      const a = String(r?.cacheKey || "").trim();
      if (!a) return null;
      const n = String(r?.cacheGroup || "").trim() || "runtime", s = String(r?.resourceId || "").trim() || "default", i = Math.max(0, Number(r?.cachedAt) || H()), c = Math.max(i, Number(r?.expiresAt) || i), l = Math.max(i, Number(r?.updatedAt) || i), u = JSON.stringify(r?.payload ?? {});
      return Fe(u) > Vt ? null : (await t.prepare(`INSERT INTO ${e.CF_RUNTIME_CACHE_TABLE} (
            cache_key, cache_group, resource_id, payload, cached_at, expires_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(cache_key) DO UPDATE SET
            cache_group = excluded.cache_group,
            resource_id = excluded.resource_id,
            payload = excluded.payload,
            cached_at = excluded.cached_at,
            expires_at = excluded.expires_at,
            updated_at = excluded.updated_at`).bind(a, n, s, u, i, c, l).run(), {
        cacheKey: a,
        cacheGroup: n,
        resourceId: s,
        cachedAt: i,
        expiresAt: c,
        updatedAt: l
      });
    },
    async loadCfRuntimeCachePayload(t, r = {}) {
      const a = String(r.cacheKey || "").trim(), n = String(r.cacheGroup || "").trim() || "runtime", s = String(r.resourceId || "").trim() || "default", i = Math.max(1e3, Number(r.ttlMs) || 3e5), c = Math.max(0, Number(r.nowMs) || H()), l = r.skipCacheRead === !0, u = typeof r.loader == "function" ? r.loader : null;
      if (!a || !u) throw new Error("cf_runtime_cache_loader_missing");
      const d = t ? await e.getCfRuntimeCacheEntry(t, a, {
        nowMs: c,
        includeExpired: !0
      }) : null, f = !l && d && d.expiresAt > c ? d : null;
      if (f?.payload !== void 0) return {
        payload: f.payload,
        cachedAt: f.cachedAt,
        expiresAt: f.expiresAt,
        updatedAt: f.updatedAt,
        stale: !1,
        source: "d1_cache",
        error: null
      };
      const m = d;
      try {
        return {
          payload: await Kt(ct([
            "cf_runtime",
            n,
            a
          ]), async () => {
            const p = await u();
            return t && await pe(e.putCfRuntimeCacheEntry(t, {
              cacheKey: a,
              cacheGroup: n,
              resourceId: s,
              payload: p,
              cachedAt: c,
              expiresAt: c + i,
              updatedAt: c
            }), "cf_runtime_cache.write", {
              cacheKey: a,
              cacheGroup: n,
              resourceId: s
            }, null), p;
          }),
          cachedAt: c,
          expiresAt: c + i,
          updatedAt: c,
          stale: !1,
          source: t ? "live_then_cached" : "live",
          error: null
        };
      } catch (p) {
        if (m?.payload !== void 0 && r.allowStale !== !1) return {
          payload: m.payload,
          cachedAt: m.cachedAt,
          expiresAt: m.expiresAt,
          updatedAt: m.updatedAt,
          stale: !0,
          source: "stale_cache",
          error: p
        };
        throw p;
      }
    }
  };
}
function Bg(o = {}, e = {}) {
  return {
    buildCloudflareKvQuotaCard({ planProfile: t = {}, planState: r = {}, usageState: a = {}, namespaceId: n = "", nowTimestamp: s = H() } = {}) {
      const i = _a(t?.planClass), c = $(a?.payload) ? a.payload : {}, l = String(c.namespaceTitle || t?.resourceMeta?.kv?.namespaceTitle || n || "未命名 Namespace").trim(), u = [
        Er({
          key: "read",
          label: "读",
          used: c.readCount,
          limit: i.kv.read,
          kind: "count"
        }),
        Er({
          key: "write",
          label: "写",
          used: c.writeCount,
          limit: i.kv.write,
          kind: "count"
        }),
        Er({
          key: "storage",
          label: "容量",
          used: c.storageBytes,
          limit: i.kv.storageBytes,
          kind: "bytes"
        })
      ], d = [];
      r?.stale === !0 && d.push("计划信息"), a?.stale === !0 && d.push("实时指标");
      const f = [];
      d.length > 0 && f.push(`${d.join("、")} 使用 stale cache`), f.push(`delete：${ye(c.deleteCount)} / ${ye(i.kv.delete)}`), f.push(`list：${ye(c.listCount)} / ${ye(i.kv.list)}`), f.push(`命名空间：${l}`);
      const m = hs(a?.cachedAt, s);
      m && f.push(m), f.push(i.planClass === "paid" ? "容量条按 1 GB included quota 展示，PAID 下这是 included quota，不是硬停止线" : "容量条按 1 GB included quota 展示");
      const p = ys(u);
      return p.length > 0 && f.push(`超额项目：${p.join("、")}（进度条按 100% 封顶）`), a?.error && f.push(`Cloudflare 详情：${kt(a.error)}`), Ya({
        title: "KV",
        status: d.length > 0 ? "partial_failure" : "success",
        summary: `${i.planLabel} 计划 · ${i.periodLabel}配额`,
        detail: f.join("；"),
        planLabel: i.planLabel,
        periodLabel: i.periodLabel,
        resourceLabel: l,
        metrics: u
      });
    },
    buildCloudflareD1QuotaCard({ planProfile: t = {}, planState: r = {}, usageState: a = {}, databaseId: n = "", nowTimestamp: s = H() } = {}) {
      const i = _a(t?.planClass), c = $(a?.payload) ? a.payload : {}, l = String(c.databaseName || t?.resourceMeta?.d1?.databaseName || n || "未命名数据库").trim(), u = [
        Er({
          key: "rowsRead",
          label: "读",
          used: c.rowsRead,
          limit: i.d1.rowsRead,
          kind: "count"
        }),
        Er({
          key: "rowsWritten",
          label: "写",
          used: c.rowsWritten,
          limit: i.d1.rowsWritten,
          kind: "count"
        }),
        Er({
          key: "storage",
          label: "容量",
          used: c.fileSizeBytes,
          limit: i.d1.storageBytes,
          kind: "bytes"
        })
      ], d = [];
      r?.stale === !0 && d.push("计划信息"), a?.stale === !0 && d.push("实时指标");
      const f = [];
      d.length > 0 && f.push(`${d.join("、")} 使用 stale cache`), f.push(`SQL 次数：读 ${ye(c.readQueries)} / 写 ${ye(c.writeQueries)}`), f.push(`数据库：${l}`);
      const m = hs(a?.cachedAt, s);
      m && f.push(m), f.push(`容量条按单库硬上限 ${Xa(i.d1.storageBytes)} 展示`);
      const p = ys(u);
      return p.length > 0 && f.push(`超额项目：${p.join("、")}（进度条按 100% 封顶）`), a?.error && f.push(`Cloudflare 详情：${kt(a.error)}`), Ya({
        title: "D1",
        status: d.length > 0 ? "partial_failure" : "success",
        summary: `${i.planLabel} 计划 · ${i.periodLabel}配额`,
        detail: f.join("；"),
        planLabel: i.planLabel,
        periodLabel: i.periodLabel,
        resourceLabel: l,
        metrics: u
      });
    },
    async buildDashboardD1WriteHotspotPayload(t, r = {}) {
      const a = ae(r?.config || await ue(t)), n = Math.max(0, Number(r?.nowMs) || H()), s = Oe(a.scheduleUtcOffsetMinutes), i = String(a.cfAccountId || "").trim(), c = String(a.cfApiToken || "").trim(), l = String(a.cfD1DatabaseId || "").trim(), u = {
        utcOffsetMinutes: s,
        nowMs: n,
        source: "cloudflare_d1_analytics"
      };
      if (!i || !c || !l) return en({
        ...u,
        status: "unconfigured",
        summary: "D1 写入热点尚未启用",
        detail: "请先在账号设置中填写 Cloudflare 账号 ID、API 令牌与 D1 Database ID。"
      });
      const d = st(new Date(n), s).startTs - 8640 * 60 * 1e3, f = await If({
        accountId: i,
        apiToken: c,
        databaseId: l,
        startIso: new Date(d).toISOString(),
        endIso: new Date(n).toISOString(),
        utcOffsetMinutes: s
      }), m = new Map(f.map((E) => [`${E.dateKey}:${E.hour}`, E])), p = Uc(), h = [];
      let g = 0, y = 0, _ = 0, S = null;
      for (const E of f)
        g += Math.max(0, Number(E?.rowsWritten) || 0), y += Math.max(0, Number(E?.writeQueries) || 0), (Number(E?.rowsWritten) || 0) > _ && (_ = Math.max(0, Number(E?.rowsWritten) || 0), S = E);
      for (let E = 0; E < 7; E += 1) {
        const T = ot(d + E * 24 * 60 * 60 * 1e3, s).dateKey;
        h.push({
          key: T,
          dateKey: T,
          label: Zn(T),
          cells: Array.from({ length: 24 }, (w, D) => {
            const k = m.get(`${T}:${D}`) || null, b = Math.max(0, Number(k?.rowsWritten) || 0), N = Math.max(0, Number(k?.writeQueries) || 0), R = _ > 0 ? b / _ : 0;
            return kc(T, D, b, N, R);
          })
        });
      }
      const A = S ? `峰值：${Zn(S.dateKey)} ${String(S.hour).padStart(2, "0")}:00 写入 ${ye(S.rowsWritten)} 行 / SQL ${ye(S.writeQueries)} 次` : "";
      return {
        title: "D1 写入热点图",
        status: "success",
        source: "cloudflare_d1_analytics",
        summary: g > 0 ? `最近 7 天累计写入 ${ye(g)} 行` : "最近 7 天未检测到 D1 写入",
        detail: g > 0 ? "热点强度按 rowsWritten 计算；悬停单元格可查看对应小时的 SQL 写次数。" : "Cloudflare D1 Analytics 当前窗口内没有返回 rowsWritten 数据。",
        periodLabel: `最近 7 天 · ${go(s)}`,
        hourLabels: p,
        rows: h,
        available: g > 0,
        totalRowsWritten: g,
        totalWriteQueries: y,
        peakLabel: A,
        legendMaxLabel: ye(_)
      };
    },
    async buildDashboardMonthlyTrafficPayload(t, r = {}) {
      const a = ae(r?.config || await ue(t)), n = Math.max(0, Number(r.nowMs) || H()), s = r?.monthWindow || xs(new Date(n), a.scheduleUtcOffsetMinutes), i = String(a.cfZoneId || "").trim(), c = String(a.cfApiToken || "").trim(), l = {
        period: "month",
        periodKey: s.monthKey,
        periodLabel: s.periodLabel,
        generatedAt: new Date(n).toISOString(),
        cacheStatus: "live"
      };
      if (!i || !c) return Jt({
        ...l,
        traffic: "未配置",
        cfAnalyticsLoaded: !1,
        cfAnalyticsStatus: "未配置 Cloudflare",
        cfAnalyticsError: "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌",
        trafficSourceText: "本月视频流量：未配置 Cloudflare，无法获取 CF Zone 总流量"
      });
      const u = 1440 * 60 * 1e3, d = Oe(a.scheduleUtcOffsetMinutes), f = r?.kv || e.getKV(t), m = n - $a * u, p = [];
      for (let T = s.startTs; T <= s.endTs; T += u) p.push({
        startTs: T,
        endTs: Math.min(s.endTs, T + u - 1),
        dateKey: ot(new Date(T), d).dateKey
      });
      let h = 0, g = 0, y = 0, _ = 0, S = null;
      const A = 4;
      for (let T = 0; T < p.length; T += A) {
        const w = await Promise.all(p.slice(T, T + A).map(async ({ startTs: D, endTs: k, dateKey: b }) => {
          const N = await Os(f, i, b);
          let R = null;
          try {
            R = await _s(i, c, D, k);
          } catch (x) {
            S = S || x;
          }
          return R === null ? N !== null ? {
            bytes: N,
            source: "archive"
          } : {
            bytes: 0,
            source: "missing"
          } : (k < n && D >= m && N === null && await vs(f, i, {
            dateKey: b,
            bytes: R,
            dayEndTs: k
          }), R === 0 && N !== null ? {
            bytes: N,
            source: "archive"
          } : R === 0 && D < m ? {
            bytes: 0,
            source: "missing"
          } : {
            bytes: R,
            source: "cf"
          });
        }));
        for (const D of w)
          h += Math.max(0, Number(D?.bytes) || 0), D?.source === "archive" ? g += 1 : D?.source === "missing" ? y += 1 : D?.source === "cf" && (_ += 1);
      }
      if (_ === 0 && g === 0 && S) throw S;
      const E = y > 0 ? `本地归档缺失 ${y} 天（免费版 CF Zone 分析仅保留约 ${$a} 天）` : "";
      return Jt({
        ...l,
        traffic: Xa(h),
        totalBytes: h,
        cfAnalyticsLoaded: !0,
        cfAnalyticsStatus: y > 0 ? "Cloudflare 统计正常（部分日期缺失）" : "Cloudflare 统计正常",
        cfAnalyticsError: "",
        cfAnalyticsDetail: E,
        trafficSourceText: `${s.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）${g > 0 ? `（本地归档 ${g} 天）` : ""}${E ? `；${E}` : ""}`,
        warning: E
      });
    },
    async snapshotCfDailyTrafficArchive(t, r = {}) {
      const a = ae(r?.config || await ue(t)), n = r?.kv || e.getKV(t), s = String(a.cfZoneId || "").trim(), i = String(a.cfApiToken || "").trim();
      if (!n || !s || !i) return {
        status: "skipped",
        storedCount: 0,
        errors: []
      };
      const c = Math.max(0, Number(r?.nowMs) || H()), l = Oe(a.scheduleUtcOffsetMinutes), u = st(new Date(c), l), d = 1440 * 60 * 1e3, f = c - $a * d;
      let m = 0;
      const p = [];
      for (let h = 1; h <= Zm; h += 1) {
        const g = u.startTs - h * d, y = g + d - 1, _ = ot(new Date(g), l).dateKey;
        if (!(g < f) && await Os(n, s, _) === null)
          try {
            await vs(n, s, {
              dateKey: _,
              bytes: await _s(s, i, g, y),
              dayEndTs: y
            }) && (m += 1);
          } catch (S) {
            p.push(String(S?.message || S));
          }
      }
      return {
        status: p.length > 0 ? "partial_failure" : "success",
        storedCount: m,
        errors: p
      };
    },
    async getDashboardMonthlyTrafficPayload(t, r = {}) {
      const a = ae(r?.config || await ue(t)), n = r?.ctx || null, s = r?.forceRefresh === !0, i = Math.max(0, Number(r.nowMs) || H()), c = r?.monthWindow || xs(new Date(i), a.scheduleUtcOffsetMinutes), l = String(a.cfZoneId || "").trim();
      if (!l || !String(a.cfApiToken || "").trim()) return await e.buildDashboardMonthlyTrafficPayload(t, {
        config: a,
        monthWindow: c,
        nowMs: i
      });
      const u = ep(l, c.monthKey, a.scheduleUtcOffsetMinutes), d = tp(u), f = ur();
      let m = null;
      const p = te.DashboardMonthlyTrafficCache.get(u);
      if (p?.staleUntil > i) {
        if (Ie(te.DashboardMonthlyTrafficCache, u, p, 64), m = p, !s && p.expiresAt > i) return Jt({
          ...p.payload,
          cacheStatus: "cache"
        });
      } else p && te.DashboardMonthlyTrafficCache.delete(u);
      if (f && d) try {
        const h = await f.match(d);
        if (h) {
          const g = await De(h, sn), y = g.exceeded ? null : JSON.parse(g.text || "null");
          if (Number(y?.version) === 1 && String(y?.cacheKey || "") === u && Number(y?.staleUntil) > i && (m = {
            payload: Jt(y.payload),
            cachedAt: Number(y.cachedAt) || 0,
            expiresAt: Number(y.expiresAt) || 0,
            staleUntil: Number(y.staleUntil) || 0
          }, Ie(te.DashboardMonthlyTrafficCache, u, m, 64), !s && m.expiresAt > i))
            return Jt({
              ...m.payload,
              cacheStatus: "cache"
            });
        }
      } catch (h) {
        Ae("dashboard.monthly_traffic_cache_read_failed", h, { cacheKey: u });
      }
      try {
        return await Kt(ct([
          "dashboard_monthly_traffic",
          u,
          s ? "force" : "default"
        ]), async () => {
          const h = await e.buildDashboardMonthlyTrafficPayload(t, {
            config: a,
            monthWindow: c,
            nowMs: i
          }), g = i, y = g + Ym, _ = g + Ms, S = {
            version: 1,
            cacheKey: u,
            cachedAt: g,
            expiresAt: y,
            staleUntil: _,
            payload: h
          };
          if (Ie(te.DashboardMonthlyTrafficCache, u, {
            payload: h,
            cachedAt: g,
            expiresAt: y,
            staleUntil: _
          }, 64), f && d) {
            const A = f.put(d, new Response(JSON.stringify(S), { headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": `public, max-age=${Math.floor(Ms / 1e3)}`
            } }));
            n ? n.waitUntil(pe(A, "dashboard.monthly_traffic_cache_write", { cacheKey: u }, null)) : await pe(A, "dashboard.monthly_traffic_cache_write", { cacheKey: u }, null);
          }
          return h;
        });
      } catch (h) {
        if (m?.payload && m.staleUntil > i) return Jt({
          ...m.payload,
          cacheStatus: "stale",
          warning: Hc(h, "monthly_traffic_refresh_failed")
        });
        const g = ic(h?.message || h, { zoneId: l });
        return Jt({
          periodKey: c.monthKey,
          periodLabel: c.periodLabel,
          traffic: "CF 查询失败",
          cfAnalyticsLoaded: !1,
          cfAnalyticsStatus: g.status,
          cfAnalyticsError: g.hint,
          cfAnalyticsDetail: g.detail,
          trafficSourceText: `${c.periodLabel}视频流量：CF Zone 总流量（edgeResponseBytes）`,
          generatedAt: new Date(i).toISOString(),
          cacheStatus: "live"
        });
      }
    }
  };
}
function Kg(o = {}, e = {}) {
  const { CacheManager: t, withAdminShellRuntimeStatus: r } = o;
  return {
    async buildDashboardStatsPayload(a, n = {}) {
      const s = n?.ctx || null, i = n?.kv || e.getKV(a), c = n?.db || e.getDB(a), l = ae(n?.config || await ue(a)), u = Math.max(0, Number(n.nowMs) || H()), d = n?.dayWindow || st(new Date(u), l.scheduleUtcOffsetMinutes), f = n?.skipD1WriteHotspot !== !1, m = f ? null : e.buildDashboardD1WriteHotspotPayload(a, {
        config: l,
        nowMs: u
      });
      let p = null, h = "未配置", g = 0, y = !1, _ = !1, S = "", A = "", E = "", T = "pending", w = "等待数据加载", D = "视频流量口径：CF Zone 总流量", k = new Date(u).toISOString(), b = Array.from({ length: 24 }, (U, V) => ({
        label: String(V).padStart(2, "0") + ":00",
        total: 0
      })), N = 0, R = 0, x = "", O = en({
        utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
        nowMs: u
      });
      g = (await t.getNodesListStrict(a, s)).length || 0;
      const L = d.dateKey, v = d.startTs, M = d.endTs, C = String(l.cfZoneId || "").trim(), I = String(l.cfApiToken || "").trim();
      if (C && I) {
        const U = new Date(v).toISOString(), V = new Date(M).toISOString(), j = `
                query {
                  viewer {
                    zones(filter: { zoneTag: ${_e(C)} }) {
                      series: httpRequestsAdaptiveGroups(limit: 10000, filter: { datetime_geq: ${_e(U)}, datetime_leq: ${_e(V)} }) {
                        count
                        dimensions { datetimeHour }
                        sum { edgeResponseBytes }
                      }
                    }
                  }
                }`;
        try {
          const K = await Sc(C, I, {
            scope: "dashboard.stats.zone_lookup",
            context: { feature: "dashboard_stats" }
          });
          x = String(K?.name || "").trim();
          const q = await hc(C, I, j);
          if (q) {
            let de = 0, he = 0, fe = Array.from({ length: 24 }, (ie, me) => ({
              label: String(me).padStart(2, "0") + ":00",
              total: 0
            }));
            (Array.isArray(q.series) ? [...q.series].sort((ie, me) => String(ie?.dimensions?.datetimeHour || "").localeCompare(String(me?.dimensions?.datetimeHour || ""))) : []).forEach((ie) => {
              const me = Number(ie.count) || 0, Me = Number(ie.sum?.edgeResponseBytes) || 0;
              de += me, he += Me;
              const Ue = ie?.dimensions?.datetimeHour;
              if (Ue && !Number.isNaN(new Date(Ue).getTime())) {
                const et = ot(new Date(Ue), l.scheduleUtcOffsetMinutes).hour;
                fe[et].total += me;
              }
            }), h = Xa(he), y = !0, S = "Cloudflare 统计正常", D = "视频流量当前对齐：CF Zone 总流量（edgeResponseBytes）";
            try {
              const ie = await Mf({
                cfAccountId: String(l.cfAccountId || "").trim(),
                cfZoneId: C,
                cfApiToken: I,
                startIso: U,
                endIso: V,
                utcOffsetMinutes: l.scheduleUtcOffsetMinutes
              });
              ie && Number.isFinite(ie.totalRequests) && (p = ie.totalRequests, b = ie.hourlySeries, _ = !0, T = "workers_usage", w = "今日请求量口径：Cloudflare Workers Usage", S = "Cloudflare 统计正常");
            } catch (ie) {
              console.log("CF workers usage fetch failed", ie);
            }
            _ || (p = de, b = fe, _ = !0, T = "zone_analytics", w = "今日请求量当前对齐：Cloudflare Zone Analytics");
          } else
            S = "Zone 未命中", A = "GraphQL 返回空；请检查 Zone ID 或权限", h = "CF 无统计数据";
        } catch (K) {
          const q = ic(K?.message || K, { zoneId: C });
          S = q.status, A = q.hint, E = q.detail, h = "CF 查询失败";
        }
      } else
        S = "未配置 Cloudflare", A = "请在账号设置中填写并保存 Cloudflare Zone ID 与 API 令牌", D = "视频流量当前对齐：未配置 Cloudflare，无法获取 CF Zone 总流量";
      if (c) try {
        await e.ensureStatsHourlyWindowAligned({
          db: c,
          kv: i
        }, {
          config: l,
          now: d.now
        });
        const U = await e.resolveLogsReadiness({
          db: c,
          kv: i
        }), V = U.statsReady === !0 ? await e.getDailyStatsHourly(c, L) : [];
        if (N = V.reduce((j, K) => j + (Number(K?.play_count || K?.playCount) || 0), 0), R = V.reduce((j, K) => j + (Number(K?.playback_info_count || K?.playbackInfoCount) || 0), 0), !_ && U.statsReady === !0) {
          p = V.reduce((j, K) => j + (Number(K?.request_count || K?.requestCount) || 0), 0), b = Array.from({ length: 24 }, (j, K) => ({
            label: String(K).padStart(2, "0") + ":00",
            total: 0
          }));
          for (const j of V) {
            const K = Number.parseInt(String(j?.bucket_hour ?? j?.bucketHour), 10);
            !Number.isNaN(K) && b[K] && (b[K].total += Number(j?.request_count || j?.requestCount) || 0);
          }
          _ = !0, T = "d1_hourly_stats", w = "今日请求量当前对齐：本地 D1 预聚合";
        }
      } catch (U) {
        console.log("DB aggregated stats read failed:", U);
      }
      if (_ || (p = null, !C || !I ? (T = "unconfigured", w = c ? "今日请求量暂不可用：未配置 Cloudflare 联动，且本地 D1 日志未初始化或不可读" : "今日请求量未配置：未绑定 D1，且未配置 Cloudflare 联动") : (T = "pending", w = c ? "今日请求量暂不可用：Cloudflare 请求数查询失败，且本地 D1 日志未初始化或不可读" : "今日请求量暂不可用：Cloudflare 请求数查询失败，且未绑定 D1")), !f) try {
        O = await m;
      } catch (U) {
        console.log("D1 write hotspot read failed:", U), O = en({
          utcOffsetMinutes: l.scheduleUtcOffsetMinutes,
          nowMs: u,
          status: "failed",
          source: "cloudflare_d1_analytics",
          summary: "D1 写入热点暂不可用",
          detail: kt(U, "d1_write_hotspot_failed")
        });
      }
      const P = p == null ? T === "unconfigured" ? "未配置" : "暂不可用" : String(Number(p) || 0);
      return Ho({
        todayRequests: p,
        requestCountDisplay: P,
        todayTraffic: h,
        hourlySeries: b,
        requestSource: T,
        requestSourceText: w,
        trafficSourceText: D,
        generatedAt: k,
        zoneName: x,
        cfAnalyticsLoaded: y,
        cfAnalyticsStatus: S,
        cfAnalyticsError: A,
        cfAnalyticsDetail: E,
        playCount: N,
        infoCount: R,
        nodeCount: g,
        cacheStatus: "live",
        d1WriteHotspot: O
      });
    },
    async buildDashboardRuntimeStatusPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = ae(n?.config || await ue(a)), l = n?.forceRefresh === !0, u = await e.getOpsStatus({
        kv: i,
        db: s
      });
      let d = {
        kv: Tr("KV", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。"),
        d1: Tr("D1", "Cloudflare 配额尚未加载", "等待运行状态接口返回 Cloudflare 配额数据。")
      };
      try {
        d = await e.getCloudflareRuntimeQuotaStatus(a, {
          config: c,
          db: s,
          forceRefresh: l
        });
      } catch (f) {
        const m = kt(f, "runtime_config_read_failed");
        d = {
          kv: Rr("KV", "Cloudflare 配额读取失败", m),
          d1: Rr("D1", "Cloudflare 配额读取失败", m)
        };
      }
      return {
        ...u && typeof u == "object" ? u : {},
        cloudflare: d
      };
    },
    async getRuntimeStatusPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = ae(n?.config || await ue(a)), l = $e(a), u = n?.forceRefresh === !0, d = Math.max(0, Number(n.nowMs) || H()), f = await Kt(ct(["runtime_status", u ? "force" : "default"]), async () => e.buildDashboardRuntimeStatusPayload(a, {
        kv: i,
        db: s,
        config: c,
        forceRefresh: u
      }));
      return {
        status: r(f, a, c, l),
        cacheMeta: Bo({
          cacheStatus: "live",
          cachedAt: d,
          expiresAt: d,
          updatedAt: d,
          generatedAt: new Date(d).toISOString(),
          warning: "",
          partial: !1
        })
      };
    },
    async getDashboardSnapshotPayload(a, n = {}) {
      const s = n?.db || e.getDB(a), i = n?.kv || e.getKV(a), c = n?.ctx || null, l = ae(n?.config || await ue(a)), u = n?.forceRefresh === !0, d = Math.max(0, Number(n.nowMs) || H()), f = n?.dayWindow || st(new Date(d), l.scheduleUtcOffsetMinutes), m = String(l.cfZoneId || "").trim(), p = Qn(m, f.dateKey), h = s ? await e.getCfDashboardCacheEntry(s, p, {
        nowMs: d,
        includeExpired: !0
      }) : null;
      if (!u && s) {
        const y = h && h.expiresAt > d ? h : null;
        if (y && y.version === 8) return ta(y.payload, "cache", {
          cachedAt: y.cachedAt,
          expiresAt: y.expiresAt,
          updatedAt: y.updatedAt,
          generatedAt: y.payload?.cacheMeta?.generatedAt || y.payload?.stats?.generatedAt || new Date(y.cachedAt || d).toISOString(),
          warning: ""
        });
      }
      const g = h;
      try {
        const y = await Kt(ct([
          "dashboard_snapshot",
          p,
          u ? "force" : "default"
        ]), async () => {
          const [_, S] = await Promise.all([e.buildDashboardStatsPayload(a, {
            ctx: c,
            kv: i,
            db: s,
            config: l,
            dayWindow: f,
            nowMs: d
          }), e.buildDashboardRuntimeStatusPayload(a, {
            kv: i,
            db: s,
            config: l,
            forceRefresh: u
          })]), A = ta({
            stats: _,
            runtimeStatus: S,
            cacheMeta: { generatedAt: _.generatedAt }
          }, "live", {
            cachedAt: d,
            expiresAt: d + 3600 * 1e3,
            updatedAt: d,
            generatedAt: _.generatedAt,
            warning: ""
          });
          if (s) {
            const E = e.putCfDashboardCacheEntry(s, {
              cacheKey: p,
              zoneId: m || "default",
              bucketDate: f.dateKey,
              payload: A,
              version: 8,
              cachedAt: d,
              expiresAt: d + 36e5,
              updatedAt: d
            });
            c ? c.waitUntil(pe(E, "dashboard.cache_write", { cacheKey: p }, null)) : await pe(E, "dashboard.cache_write", { cacheKey: p }, null);
          }
          return A;
        });
        return ta(y, "live", {
          cachedAt: d,
          expiresAt: d + 3600 * 1e3,
          updatedAt: d,
          generatedAt: y?.stats?.generatedAt || ""
        });
      } catch (y) {
        if (g && g.version === 8) return ta(g.payload, "stale", {
          cachedAt: g.cachedAt,
          expiresAt: g.expiresAt,
          updatedAt: g.updatedAt,
          generatedAt: g.payload?.cacheMeta?.generatedAt || g.payload?.stats?.generatedAt || new Date(g.cachedAt || d).toISOString(),
          warning: Hc(y),
          partial: !0
        });
        throw y;
      }
    },
    async getDashboardCachedSnapshotPayload(a, n = {}) {
      const s = n?.db || e.getDB(a);
      if (!s) return null;
      const i = ae(n?.config || await ue(a)), c = Math.max(0, Number(n.nowMs) || H()), l = st(new Date(c), i.scheduleUtcOffsetMinutes), u = Qn(String(i.cfZoneId || "").trim(), l.dateKey), d = await e.getCfDashboardCacheEntry(s, u, {
        nowMs: c,
        includeExpired: !0
      });
      return !d || d.version !== 8 ? null : ta(d.payload, d.expiresAt > c ? "cache" : "stale", {
        cachedAt: d.cachedAt,
        expiresAt: d.expiresAt,
        updatedAt: d.updatedAt,
        generatedAt: d.payload?.cacheMeta?.generatedAt || d.payload?.stats?.generatedAt || "",
        warning: d.expiresAt > c ? "" : "dashboard_cache_expired",
        partial: d.expiresAt <= c
      });
    },
    async getCloudflareRuntimeQuotaStatus(a, n = {}) {
      const s = n?.db || e.getDB(a), i = ae(n?.config || {}), c = n?.forceRefresh === !0, l = String(i.cfAccountId || "").trim(), u = String(i.cfApiToken || "").trim(), d = String(i.cfKvNamespaceId || "").trim(), f = String(i.cfD1DatabaseId || "").trim();
      if (!l || !u) return {
        kv: Tr("KV", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。"),
        d1: Tr("D1", "未配置 Cloudflare 账号联动", "请先在账号设置中填写 Cloudflare 账号 ID 与 API 令牌。")
      };
      const m = H(), p = le(i.cfQuotaPlanCacheMinutes, F.Defaults.CfQuotaPlanCacheMinutes, 1, 1440), h = p * 60 * 1e3;
      let g;
      try {
        g = await e.loadCfRuntimeCachePayload(s, {
          cacheKey: `plan_profile:${l}:${d || "-"}:${f || "-"}`,
          cacheGroup: "plan_profile",
          resourceId: l,
          ttlMs: p * 60 * 1e3,
          nowMs: m,
          skipCacheRead: c,
          loader: async () => {
            const T = pc(await _c(l, u)), [w, D] = await Promise.all([d ? pe(Lf(l, d, u), "cf_runtime.plan_profile.kv_details", {
              accountId: l,
              namespaceId: d
            }, null) : null, f ? pe(bs(l, f, u), "cf_runtime.plan_profile.d1_details", {
              accountId: l,
              databaseId: f
            }, null) : null]);
            return {
              planClass: T.planClass,
              planLabel: T.planLabel,
              periodLabel: T.periodLabel,
              usageModel: T.usageModel,
              resourceMeta: {
                kv: { namespaceTitle: String(w?.title || "").trim() },
                d1: { databaseName: String(D?.name || "").trim() }
              }
            };
          }
        });
      } catch (T) {
        const w = kt(T);
        return {
          kv: Rr("KV", "Cloudflare 计划信息读取失败", w),
          d1: Rr("D1", "Cloudflare 计划信息读取失败", w)
        };
      }
      const y = $(g?.payload) ? g.payload : {}, _ = {
        ...qn({
          usageModel: y.usageModel || y.planClass,
          override: i.cfQuotaPlanOverride
        }),
        resourceMeta: {
          kv: { namespaceTitle: String(y?.resourceMeta?.kv?.namespaceTitle || "").trim() },
          d1: { databaseName: String(y?.resourceMeta?.d1?.databaseName || "").trim() }
        }
      }, S = Rf(_.planClass), [A, E] = await Promise.all([(async () => {
        if (!d) return Tr("KV", "未配置 KV Namespace", "请在账号设置中填写 Cloudflare KV Namespace ID。");
        try {
          const T = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:kv:${l}:${d}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `kv:${d}`,
            ttlMs: h,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => ({
              ...await Df({
                accountId: l,
                apiToken: u,
                namespaceId: d,
                startIso: S.startIso,
                endIso: S.endIso
              }),
              namespaceTitle: String(_?.resourceMeta?.kv?.namespaceTitle || d).trim()
            })
          });
          return e.buildCloudflareKvQuotaCard({
            planProfile: _,
            planState: g,
            usageState: T,
            namespaceId: d,
            nowTimestamp: m
          });
        } catch (T) {
          return Rr("KV", "KV 指标读取失败", kt(T));
        }
      })(), (async () => {
        if (!f) return Tr("D1", "未配置 D1 数据库", "请在账号设置中填写 Cloudflare D1 Database ID。");
        try {
          const T = await e.loadCfRuntimeCachePayload(s, {
            cacheKey: `usage_metrics:d1:${l}:${f}:${S.cacheBucketKey}`,
            cacheGroup: "usage_metrics",
            resourceId: `d1:${f}`,
            ttlMs: h,
            nowMs: m,
            skipCacheRead: c,
            loader: async () => {
              const [w, D] = await Promise.all([Nf({
                accountId: l,
                apiToken: u,
                databaseId: f,
                startIso: S.startIso,
                endIso: S.endIso
              }), bs(l, f, u)]);
              return {
                ...w,
                databaseName: String(D?.name || _?.resourceMeta?.d1?.databaseName || f).trim(),
                fileSizeBytes: Math.max(0, Number(D?.file_size ?? D?.fileSize) || 0)
              };
            }
          });
          return e.buildCloudflareD1QuotaCard({
            planProfile: _,
            planState: g,
            usageState: T,
            databaseId: f,
            nowTimestamp: m
          });
        } catch (T) {
          return Rr("D1", "D1 指标读取失败", kt(T));
        }
      })()]);
      return {
        kv: A,
        d1: E
      };
    }
  };
}
function zg(o = {}, e = {}) {
  return {
    ...Ug(o, e),
    ...kg(o, e),
    ...Hg(o, e),
    ...$g(o, e),
    ...Bg(o, e),
    ...Kg(o, e)
  };
}
function Wg(o = {}, e = {}) {
  return {
    getKV(t) {
      return Na(t);
    },
    getDB(t) {
      return xd(t);
    },
    buildD1CreateTableSql(t, r = t, a = {}) {
      const n = ce(r), s = `CREATE TABLE${a.ifNotExists === !0 ? " IF NOT EXISTS" : ""}`, i = {
        [e.D1_SCHEMA_META_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, contract_version INTEGER NOT NULL, contract_hash TEXT NOT NULL, schema_fingerprint TEXT NOT NULL, schema_cookie INTEGER NOT NULL, last_plan_hash TEXT NOT NULL, verified_at TEXT NOT NULL, attestation TEXT NOT NULL, migration_owner TEXT, lease_expires_at INTEGER)`,
        [e.SYS_STATUS_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.SCHEDULED_LOCKS_TABLE]: `${s} ${n} (scope TEXT PRIMARY KEY, token TEXT NOT NULL, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, renewed_at INTEGER, expires_at INTEGER NOT NULL)`,
        [e.AUTH_FAILURES_TABLE]: `${s} ${n} (ip TEXT PRIMARY KEY, fail_count INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_DASH_CACHE_TABLE]: `${s} ${n} (cache_key TEXT PRIMARY KEY, zone_id TEXT NOT NULL, bucket_date TEXT NOT NULL, payload TEXT NOT NULL, version INTEGER NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.CF_RUNTIME_CACHE_TABLE]: `${s} ${n} (cache_key TEXT PRIMARY KEY, cache_group TEXT NOT NULL, resource_id TEXT NOT NULL, payload TEXT NOT NULL, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
        [e.DNS_IP_POOL_ITEMS_TABLE]: `${s} ${n} (id TEXT PRIMARY KEY, ip TEXT NOT NULL UNIQUE, ip_type TEXT NOT NULL, source_kind TEXT NOT NULL, source_label TEXT, line_label TEXT NOT NULL DEFAULT '', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_SOURCES_TABLE]: `${s} ${n} (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, source_type TEXT NOT NULL DEFAULT 'url', domain TEXT, source_kind TEXT NOT NULL DEFAULT 'custom', preset_id TEXT NOT NULL DEFAULT '', builtin_id TEXT NOT NULL DEFAULT '', enabled INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, ip_limit INTEGER NOT NULL DEFAULT 5, last_fetch_at TEXT, last_fetch_status TEXT, last_fetch_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: `${s} ${n} (signature TEXT PRIMARY KEY, items_json TEXT NOT NULL, source_results_json TEXT NOT NULL, imported_count INTEGER NOT NULL DEFAULT 0, enabled_source_count INTEGER NOT NULL DEFAULT 0, cached_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
        [e.DNS_IP_PROBE_CACHE_TABLE]: `${s} ${n} (ip TEXT NOT NULL, entry_colo TEXT NOT NULL, probe_status TEXT NOT NULL, latency_ms INTEGER, cf_ray TEXT, colo_code TEXT, city_name TEXT, country_code TEXT, country_name TEXT, probed_at TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (ip, entry_colo))`,
        [e.LOGS_TABLE]: `${s} ${n} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`,
        [e.STATS_HOURLY_TABLE]: `${s} ${n} (bucket_date TEXT NOT NULL, bucket_hour INTEGER NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, play_count INTEGER NOT NULL DEFAULT 0, playback_info_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY (bucket_date, bucket_hour))`
      }[t];
      if (!i) throw new Error(`Unknown D1 schema table: ${t}`);
      return i;
    },
    getD1LogsFtsContractSql() {
      return {
        createTable: `CREATE VIRTUAL TABLE ${e.LOGS_FTS_TABLE} USING fts5(node_name, request_path, user_agent, error_detail, detail_json, content='${e.LOGS_TABLE}', content_rowid='id', tokenize='unicode61')`,
        createTrigger: `CREATE TRIGGER ${e.LOGS_FTS_INSERT_TRIGGER} AFTER INSERT ON ${e.LOGS_TABLE} BEGIN
          INSERT INTO ${e.LOGS_FTS_TABLE}(rowid, node_name, request_path, user_agent, error_detail, detail_json)
          VALUES (new.id, new.node_name, new.request_path, COALESCE(new.user_agent, ''), COALESCE(new.error_detail, ''), COALESCE(new.detail_json, ''));
        END;`
      };
    },
    getD1ContractHash() {
      const t = e.getD1CurrentSchemaContract();
      return ne(Z({
        version: at,
        createTables: Object.keys(t.columns).sort().map((r) => [r, e.buildD1CreateTableSql(r)]),
        columns: t.columns,
        columnAffinities: t.columnAffinities,
        primaryKeys: t.primaryKeys,
        indexes: t.indexes,
        uniqueIndexes: t.uniqueIndexes,
        fts: e.getD1LogsFtsContractSql(),
        safeColumnAdditions: e.getD1RuntimeColumnAdditions()
      }));
    },
    async getD1SchemaCookie(t) {
      return 0;
    },
    buildD1SchemaAttestationPayload(t = {}) {
      return Z({
        scope: "main",
        contractVersion: Math.max(0, Number(t.contractVersion ?? t.contract_version) || 0),
        contractHash: String((t.contractHash ?? t.contract_hash) || ""),
        schemaFingerprint: String((t.schemaFingerprint ?? t.schema_fingerprint) || ""),
        schemaCookie: Math.max(0, Number(t.schemaCookie ?? t.schema_cookie) || 0),
        lastPlanHash: String((t.lastPlanHash ?? t.last_plan_hash) || ""),
        verifiedAt: String((t.verifiedAt ?? t.verified_at) || "")
      });
    },
    async signD1SchemaAttestation(t, r = {}) {
      const a = String(t?.JWT_SECRET || "").trim();
      return a ? await gt(a, e.buildD1SchemaAttestationPayload(r)) : "";
    },
    async readD1SchemaMeta(t) {
      try {
        return await t.prepare(`SELECT scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at FROM ${ce(e.D1_SCHEMA_META_TABLE)} WHERE scope = 'main' LIMIT 1`).first();
      } catch {
        return null;
      }
    },
    async verifyD1SchemaAttestation(t, r) {
      const a = await e.readD1SchemaMeta(t);
      if (!a) return {
        valid: !1,
        reason: "missing_meta"
      };
      const n = Math.max(0, Number(a.contract_version) || 0);
      if (n > at) return {
        valid: !1,
        blocked: !0,
        reason: "schema_version_ahead",
        meta: a
      };
      if (n !== at) return {
        valid: !1,
        reason: "version_mismatch",
        meta: a
      };
      if (String(a.contract_hash || "") !== e.getD1ContractHash()) return {
        valid: !1,
        reason: "contract_hash_mismatch",
        meta: a
      };
      const s = await e.getD1SchemaCookie(t);
      if (Math.max(0, Number(a.schema_cookie) || 0) !== s) return {
        valid: !1,
        reason: "schema_cookie_changed",
        meta: a,
        schemaCookie: s
      };
      const i = await e.getD1SchemaFingerprint(t);
      if (String(a.schema_fingerprint || "") !== i) return {
        valid: !1,
        reason: "schema_fingerprint_changed",
        meta: a,
        schemaCookie: s,
        schemaFingerprint: i
      };
      const c = await e.signD1SchemaAttestation(r, a);
      return !c || c !== String(a.attestation || "") ? {
        valid: !1,
        reason: "invalid_attestation",
        meta: a,
        schemaCookie: s
      } : {
        valid: !0,
        meta: a,
        schemaCookie: s,
        schemaFingerprint: i
      };
    },
    async writeVerifiedD1SchemaMeta(t, r, a = {}) {
      const n = e.getD1ContractHash(), s = String(a?.schemaFingerprint || "") || await e.getD1SchemaFingerprint(t), i = await e.getD1SchemaCookie(t), c = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), l = {
        contractVersion: at,
        contractHash: n,
        schemaFingerprint: s,
        schemaCookie: i,
        lastPlanHash: String(a?.planHash || ""),
        verifiedAt: c
      }, u = await e.signD1SchemaAttestation(r, l);
      return u ? (await t.prepare(`INSERT INTO ${ce(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
        ON CONFLICT(scope) DO UPDATE SET contract_version = excluded.contract_version, contract_hash = excluded.contract_hash, schema_fingerprint = excluded.schema_fingerprint, schema_cookie = excluded.schema_cookie, last_plan_hash = excluded.last_plan_hash, verified_at = excluded.verified_at, attestation = excluded.attestation, migration_owner = NULL, lease_expires_at = NULL`).bind(at, n, s, i, l.lastPlanHash, c, u).run(), {
        written: !0,
        attestation: u,
        ...l
      }) : {
        written: !1,
        reason: "missing_secret",
        ...l
      };
    },
    async acquireD1SchemaRepairLease(t, r, a = {}) {
      const n = Math.max(0, Number(a.nowMs ?? H()) || 0), s = n + zu, i = await t.prepare(`INSERT INTO ${ce(e.D1_SCHEMA_META_TABLE)} (scope, contract_version, contract_hash, schema_fingerprint, schema_cookie, last_plan_hash, verified_at, attestation, migration_owner, lease_expires_at)
        VALUES ('main', 0, '', '', 0, '', '', '', ?, ?)
        ON CONFLICT(scope) DO UPDATE SET migration_owner = excluded.migration_owner, lease_expires_at = excluded.lease_expires_at
        WHERE ${ce(e.D1_SCHEMA_META_TABLE)}.migration_owner IS NULL OR ${ce(e.D1_SCHEMA_META_TABLE)}.lease_expires_at IS NULL OR ${ce(e.D1_SCHEMA_META_TABLE)}.lease_expires_at < ? OR ${ce(e.D1_SCHEMA_META_TABLE)}.migration_owner = excluded.migration_owner`).bind(r, s, n).run();
      if (Math.max(0, Number(i?.meta?.changes ?? i?.changes) || 0) < 1) {
        const c = /* @__PURE__ */ new Error("D1 schema repair is already running");
        throw c.code = "D1_SCHEMA_REPAIR_IN_PROGRESS", c.status = 409, c.details = { leaseExpiresAt: s }, c;
      }
      return {
        owner: r,
        leaseExpiresAt: s
      };
    },
    async releaseD1SchemaRepairLease(t, r) {
      return r ? (await t.prepare(`UPDATE ${ce(e.D1_SCHEMA_META_TABLE)} SET migration_owner = NULL, lease_expires_at = NULL WHERE scope = 'main' AND migration_owner = ?`).bind(r).run(), !0) : !1;
    },
    getD1UniqueIndexContract() {
      return { ux_dns_ip_pool_items_ip: {
        table: e.DNS_IP_POOL_ITEMS_TABLE,
        columns: ["ip"],
        createSql: `CREATE UNIQUE INDEX ux_dns_ip_pool_items_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (ip)`
      } };
    },
    getD1RuntimeIndexContract() {
      return {
        idx_sys_locks_expires_at: {
          table: e.SCHEDULED_LOCKS_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_sys_locks_expires_at ON ${e.SCHEDULED_LOCKS_TABLE} (expires_at DESC)`
        },
        idx_auth_failures_expires_at: {
          table: e.AUTH_FAILURES_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_auth_failures_expires_at ON ${e.AUTH_FAILURES_TABLE} (expires_at)`
        },
        idx_cf_dashboard_cache_expires_at: {
          table: e.CF_DASH_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_cf_dashboard_cache_expires_at ON ${e.CF_DASH_CACHE_TABLE} (expires_at)`
        },
        idx_cf_runtime_cache_expires_at: {
          table: e.CF_RUNTIME_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_cf_runtime_cache_expires_at ON ${e.CF_RUNTIME_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_pool_items_updated_ip: {
          table: e.DNS_IP_POOL_ITEMS_TABLE,
          columns: ["updated_at", "ip"],
          createSql: `CREATE INDEX idx_dns_ip_pool_items_updated_ip ON ${e.DNS_IP_POOL_ITEMS_TABLE} (updated_at DESC, ip ASC)`
        },
        idx_dns_ip_pool_sources_sort: {
          table: e.DNS_IP_POOL_SOURCES_TABLE,
          columns: ["sort_order", "updated_at"],
          createSql: `CREATE INDEX idx_dns_ip_pool_sources_sort ON ${e.DNS_IP_POOL_SOURCES_TABLE} (sort_order ASC, updated_at ASC)`
        },
        idx_dns_ip_pool_fetch_cache_expires: {
          table: e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_dns_ip_pool_fetch_cache_expires ON ${e.DNS_IP_POOL_FETCH_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_probe_cache_expire: {
          table: e.DNS_IP_PROBE_CACHE_TABLE,
          columns: ["expires_at"],
          createSql: `CREATE INDEX idx_dns_ip_probe_cache_expire ON ${e.DNS_IP_PROBE_CACHE_TABLE} (expires_at)`
        },
        idx_dns_ip_probe_cache_colo_ip_expires: {
          table: e.DNS_IP_PROBE_CACHE_TABLE,
          columns: [
            "entry_colo",
            "ip",
            "expires_at"
          ],
          createSql: `CREATE INDEX idx_dns_ip_probe_cache_colo_ip_expires ON ${e.DNS_IP_PROBE_CACHE_TABLE} (entry_colo, ip, expires_at)`
        },
        idx_proxy_logs_timestamp: {
          table: e.LOGS_TABLE,
          columns: ["timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`
        },
        idx_proxy_logs_client_time: {
          table: e.LOGS_TABLE,
          columns: ["client_ip", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`
        },
        idx_proxy_logs_status_time: {
          table: e.LOGS_TABLE,
          columns: ["status_code", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`
        },
        idx_proxy_logs_category_time: {
          table: e.LOGS_TABLE,
          columns: ["category", "timestamp"],
          createSql: `CREATE INDEX idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`
        }
      };
    },
    getD1RuntimeColumnAdditions() {
      return {
        [e.D1_SCHEMA_META_TABLE]: {
          contract_version: "INTEGER NOT NULL DEFAULT 0",
          contract_hash: "TEXT NOT NULL DEFAULT ''",
          schema_fingerprint: "TEXT NOT NULL DEFAULT ''",
          schema_cookie: "INTEGER NOT NULL DEFAULT 0",
          last_plan_hash: "TEXT NOT NULL DEFAULT ''",
          verified_at: "TEXT NOT NULL DEFAULT ''",
          attestation: "TEXT NOT NULL DEFAULT ''",
          migration_owner: "TEXT",
          lease_expires_at: "INTEGER"
        },
        [e.SYS_STATUS_TABLE]: {
          payload: "TEXT NOT NULL DEFAULT '{}'",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.SCHEDULED_LOCKS_TABLE]: {
          token: "TEXT NOT NULL DEFAULT ''",
          owner: "TEXT NOT NULL DEFAULT ''",
          acquired_at: "INTEGER NOT NULL DEFAULT 0",
          renewed_at: "INTEGER",
          expires_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.AUTH_FAILURES_TABLE]: {
          fail_count: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.CF_DASH_CACHE_TABLE]: {
          zone_id: "TEXT NOT NULL DEFAULT ''",
          bucket_date: "TEXT NOT NULL DEFAULT ''",
          payload: "TEXT NOT NULL DEFAULT '{}'",
          version: "INTEGER NOT NULL DEFAULT 0",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.CF_RUNTIME_CACHE_TABLE]: {
          cache_group: "TEXT NOT NULL DEFAULT ''",
          resource_id: "TEXT NOT NULL DEFAULT ''",
          payload: "TEXT NOT NULL DEFAULT '{}'",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.DNS_IP_POOL_ITEMS_TABLE]: {
          ip_type: "TEXT NOT NULL DEFAULT ''",
          source_kind: "TEXT NOT NULL DEFAULT ''",
          source_label: "TEXT",
          line_label: "TEXT NOT NULL DEFAULT ''",
          remark: "TEXT",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_POOL_SOURCES_TABLE]: {
          name: "TEXT NOT NULL DEFAULT ''",
          url: "TEXT NOT NULL DEFAULT ''",
          source_type: "TEXT NOT NULL DEFAULT 'url'",
          domain: "TEXT",
          source_kind: "TEXT NOT NULL DEFAULT 'custom'",
          preset_id: "TEXT NOT NULL DEFAULT ''",
          builtin_id: "TEXT NOT NULL DEFAULT ''",
          enabled: "INTEGER NOT NULL DEFAULT 1",
          sort_order: "INTEGER NOT NULL DEFAULT 0",
          ip_limit: "INTEGER NOT NULL DEFAULT 5",
          last_fetch_at: "TEXT",
          last_fetch_status: "TEXT",
          last_fetch_count: "INTEGER NOT NULL DEFAULT 0",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: {
          items_json: "TEXT NOT NULL DEFAULT '[]'",
          source_results_json: "TEXT NOT NULL DEFAULT '[]'",
          imported_count: "INTEGER NOT NULL DEFAULT 0",
          enabled_source_count: "INTEGER NOT NULL DEFAULT 0",
          cached_at: "INTEGER NOT NULL DEFAULT 0",
          expires_at: "INTEGER NOT NULL DEFAULT 0",
          created_at: "TEXT NOT NULL DEFAULT ''",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        },
        [e.DNS_IP_PROBE_CACHE_TABLE]: {
          probe_status: "TEXT NOT NULL DEFAULT ''",
          latency_ms: "INTEGER",
          cf_ray: "TEXT",
          colo_code: "TEXT",
          city_name: "TEXT",
          country_code: "TEXT",
          country_name: "TEXT",
          probed_at: "TEXT NOT NULL DEFAULT ''",
          expires_at: "INTEGER NOT NULL DEFAULT 0"
        },
        [e.LOGS_TABLE]: {
          timestamp: "INTEGER NOT NULL DEFAULT 0",
          node_name: "TEXT NOT NULL DEFAULT ''",
          request_path: "TEXT NOT NULL DEFAULT ''",
          request_method: "TEXT NOT NULL DEFAULT ''",
          status_code: "INTEGER NOT NULL DEFAULT 0",
          response_time: "INTEGER NOT NULL DEFAULT 0",
          client_ip: "TEXT NOT NULL DEFAULT ''",
          inbound_colo: "TEXT",
          outbound_colo: "TEXT",
          user_agent: "TEXT",
          referer: "TEXT",
          category: "TEXT DEFAULT 'api'",
          error_detail: "TEXT",
          detail_json: "TEXT",
          created_at: "TEXT NOT NULL DEFAULT ''",
          inbound_ip: "TEXT",
          outbound_ip: "TEXT"
        },
        [e.STATS_HOURLY_TABLE]: {
          request_count: "INTEGER NOT NULL DEFAULT 0",
          play_count: "INTEGER NOT NULL DEFAULT 0",
          playback_info_count: "INTEGER NOT NULL DEFAULT 0",
          updated_at: "TEXT NOT NULL DEFAULT ''"
        }
      };
    },
    getD1RequiredPrimaryKeyContract() {
      return {
        [e.D1_SCHEMA_META_TABLE]: ["scope"],
        [e.SYS_STATUS_TABLE]: ["scope"],
        [e.SCHEDULED_LOCKS_TABLE]: ["scope"],
        [e.AUTH_FAILURES_TABLE]: ["ip"],
        [e.CF_DASH_CACHE_TABLE]: ["cache_key"],
        [e.CF_RUNTIME_CACHE_TABLE]: ["cache_key"],
        [e.DNS_IP_POOL_ITEMS_TABLE]: ["id"],
        [e.DNS_IP_POOL_SOURCES_TABLE]: ["id"],
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: ["signature"],
        [e.DNS_IP_PROBE_CACHE_TABLE]: ["ip", "entry_colo"],
        [e.LOGS_TABLE]: ["id"],
        [e.STATS_HOURLY_TABLE]: ["bucket_date", "bucket_hour"]
      };
    },
    getD1SchemaReadyState(t) {
      if (!t || typeof t.prepare != "function") return null;
      let r = Y.D1SchemaReadyState.get(t);
      return r instanceof Map || (r = /* @__PURE__ */ new Map(), Y.D1SchemaReadyState.set(t, r)), r;
    },
    isD1SchemaReadyCached(t, r) {
      const a = e.getD1SchemaReadyState(t);
      return !!a && (Number(a.get(String(r || ""))) || 0) > H();
    },
    markD1SchemaReady(t, r) {
      const a = e.getD1SchemaReadyState(t);
      a && a.set(String(r || ""), H() + Math.max(1e3, Number(F.Defaults.D1SchemaReadyTtlMs) || 1e3));
    },
    clearD1SchemaReady(t, r = []) {
      const a = Y.D1SchemaReadyState.get(t);
      if (!(a instanceof Map)) return;
      const n = (Array.isArray(r) ? r : [r]).map((s) => String(s || "").trim()).filter(Boolean);
      if (!n.length) {
        a.clear();
        return;
      }
      for (const s of n) a.delete(s);
    },
    normalizeRevisionMeta(t, r) {
      const a = $(t) ? t : {}, n = $(r) ? r : {}, s = String(a.updatedAt || n.updatedAt || "").trim(), i = String(a.hash || n.hash || "").trim();
      return {
        ...n,
        ...a,
        updatedAt: s,
        hash: i,
        revision: String(a.revision || n.revision || Ht(i, s)).trim()
      };
    },
    async readRevisionMeta(t, r, a) {
      if (!t || !r) return e.normalizeRevisionMeta({}, a);
      try {
        return e.normalizeRevisionMeta(await t.get(r, { type: "json" }), a);
      } catch {
        return e.normalizeRevisionMeta({}, a);
      }
    },
    async readRevisionMetaForRead(t, r, a) {
      if (!t || !r) return null;
      const n = await xe(t, r, { type: "json" });
      return $(n) ? e.normalizeRevisionMeta(n, a) : null;
    },
    async writeRevisionMeta(t, r, a, n = null) {
      if (!t || !r) return a;
      const s = t.put(r, JSON.stringify(a));
      return n && n.waitUntil(s), await s, a;
    },
    async ensureConfigMeta(t, r = null, a = {}) {
      const n = ae(r ?? (await t?.get(e.CONFIG_KEY, { type: "json" }) || {})), s = e.normalizeRevisionMeta(Vn(n)), i = await e.readRevisionMeta(t, e.CONFIG_META_KEY);
      return i.hash === s.hash && i.revision ? i : await e.writeRevisionMeta(t, e.CONFIG_META_KEY, s, a.ctx);
    },
    buildNodesIndexMeta(t = [], r = [], a = {}) {
      const n = e.normalizeNodeIndex(t), s = e.normalizeNodeSummaryIndex(r).nodes, i = String(a.updatedAt || "").trim() || /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), c = ne(Z(n)), l = ne(Z(s)), u = ne(`${c}:${l}:${n.length}`);
      return {
        revision: Ht(u, i),
        updatedAt: i,
        hash: u,
        count: n.length,
        indexHash: c,
        fullIndexHash: l
      };
    },
    async ensureNodesIndexMeta(t, r = {}) {
      if (!t) return e.buildNodesIndexMeta([], []);
      let a = Array.isArray(r.nodes) ? e.normalizeNodeSummaryIndex(r.nodes).nodes : null;
      if (!a) {
        const c = await e.getNodesSummaryIndex(t, { ctx: r.ctx });
        a = Array.isArray(c) ? c : [];
      }
      const n = Array.isArray(r.index) ? e.normalizeNodeIndex(r.index) : e.normalizeNodeIndex(a.map((c) => c?.name)), s = e.buildNodesIndexMeta(n, a, r), i = await e.readRevisionMeta(t, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      });
      return i.indexHash === s.indexHash && i.fullIndexHash === s.fullIndexHash && Number(i.count) === Number(s.count) && i.revision ? i : await wr(async () => {
        const c = await e.loadNodeSummariesForMutation(t, { ctx: r.ctx });
        return (await e.commitNodesSummaryIndexMutation(c, {
          kv: t,
          ctx: r.ctx
        })).meta;
      }, t);
    },
    async getNodesRevision(t, r = {}) {
      if (!t) return "";
      const a = Se(t), n = H();
      if (r.forceFresh !== !0 && a.NodesRevisionCache?.loaded === !0 && a.NodesRevisionCache.exp > n) return String(a.NodesRevisionCache.revision || "").trim();
      const s = a.NodesRevisionCacheGeneration;
      return await fn(a.SingleFlightTasks, ct(["nodes_revision", s]), async () => {
        const i = a.NodesRevisionCache;
        if (r.forceFresh !== !0 && i?.loaded === !0 && i.exp > H()) return String(i.revision || "").trim();
        let c = null;
        try {
          c = await t.get(e.NODES_INDEX_META_KEY, { type: "json" });
        } catch {
          return "";
        }
        const l = $(c) ? String(c.revision || "").trim() : "";
        return a.NodesRevisionCacheGeneration === s && (a.NodesRevisionCache = {
          loaded: !0,
          revision: l,
          exp: H() + F.Defaults.NodesRevisionCacheTtlMs
        }), l;
      });
    },
    getLogsRevisionFromStatus(t = {}) {
      const r = String(t?.revision || "").trim();
      return r || Ht("logs", String(t?.updatedAt || "").trim());
    },
    async bumpLogsRevision(t, r = {}, a = null) {
      const n = await e.getOpsStatusSection(t, "log"), s = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), i = ne(`${e.getLogsRevisionFromStatus(n)}:${s}:${Z(r)}`);
      return await e.patchOpsStatus(t, { log: {
        ...r,
        revision: Ht(i, s),
        updatedAt: s
      } }, a);
    },
    async getAdminRevisions(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = a.kv, s = a.db, [i, c, l, u] = await Promise.all([
        e.ensureConfigMeta(n, r.config, { ctx: r.ctx }),
        e.ensureNodesIndexMeta(n, {
          ctx: r.ctx,
          index: r.nodes?.map?.((d) => d?.name),
          nodes: r.nodes
        }),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "dnsIpPool")
      ]);
      return {
        configRevision: String(i?.revision || ""),
        nodesRevision: String(c?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    },
    async getAdminRevisionsForRead(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = a.kv, s = a.db, [i, c, l, u] = await Promise.all([
        e.readRevisionMetaForRead(n, e.CONFIG_META_KEY),
        e.readRevisionMetaForRead(n, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "log"),
        e.getOpsStatusSection({
          kv: n,
          db: s
        }, "dnsIpPool")
      ]), d = r.config !== void 0 ? r.config : await xe(n, e.CONFIG_KEY, { type: "json" }) || {}, f = e.normalizeRevisionMeta(Vn(ae(d), { updatedAt: String(i?.updatedAt || "").trim() })), m = String(i?.revision || "").trim().split(".").pop() || "", p = i?.hash === f.hash && m === f.hash ? i : f;
      let h = c;
      if (!h) {
        const g = Array.isArray(r.nodes) ? r.nodes : await e.getNodesSummaryIndexStrict(n, { ctx: r.ctx });
        h = e.buildNodesIndexMeta((Array.isArray(g) ? g : []).map((y) => y?.name), Array.isArray(g) ? g : []);
      }
      return {
        configRevision: String(p?.revision || ""),
        nodesRevision: String(h?.revision || ""),
        logsRevision: e.getLogsRevisionFromStatus(l),
        dnsIpPoolRevision: e.getDnsIpPoolRevisionFromStatus(u)
      };
    }
  };
}
function Gg(o = {}, e = {}) {
  return {
    async hasLogsFtsTable(t) {
      if (!t) return !1;
      try {
        const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first();
        return String(r?.name || "") === e.LOGS_FTS_TABLE;
      } catch {
        return !1;
      }
    },
    async getLogsFtsReadiness(t) {
      if (!t || !await e.hasLogsFtsTable(t)) return {
        tableReady: !1,
        virtualTableReady: !1,
        columnsReady: !1,
        triggerReady: !1,
        ready: !1
      };
      const r = await e.getTableColumns(t, e.LOGS_FTS_TABLE), a = [
        "node_name",
        "request_path",
        "user_agent",
        "error_detail",
        "detail_json"
      ].every((p) => r.has(p)), [n, s] = await Promise.all([t.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_FTS_TABLE).first(), t.prepare("SELECT name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger' AND name = ? LIMIT 1").bind(e.LOGS_FTS_INSERT_TRIGGER).first()]), i = Cr(n?.sql || "").replace(/'/g, ""), c = /^create\s+virtual\s+table\b/.test(i) && /\busing\s+fts5\s*\(/.test(i) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(i) && /\bcontent_rowid\s*=\s*id\b/.test(i), l = Cr(s?.sql || ""), u = l.replace(/\s+/g, ""), d = `insert into ${e.LOGS_FTS_TABLE} (
            rowid, node_name, request_path, user_agent, error_detail, detail_json
          ) values (
            new.id, new.node_name, new.request_path,
            coalesce(new.user_agent, ''), coalesce(new.error_detail, ''), coalesce(new.detail_json, '')
          )`.replace(/\s+/g, ""), f = u.includes(d), m = String(s?.name || "") === e.LOGS_FTS_INSERT_TRIGGER && String(s?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(l) && new RegExp(`\\binsert\\s+into\\s+${e.LOGS_FTS_TABLE}\\s*\\(`).test(l) && f;
      return {
        tableReady: !0,
        virtualTableReady: c,
        columnsReady: a,
        triggerReady: m,
        ready: c && a && m
      };
    },
    async isLogsFtsReady(t) {
      return (await e.getLogsFtsReadiness(t)).ready === !0;
    },
    async hasLogsBaseTable(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "logsTableExists")) return !0;
      try {
        const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.LOGS_TABLE).first(), a = String(r?.name || "") === e.LOGS_TABLE;
        return a && e.markD1SchemaReady(t, "logsTableExists"), a;
      } catch {
        return !1;
      }
    },
    async hasStatsHourlyTable(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "statsTableExists")) return !0;
      try {
        const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1").bind(e.STATS_HOURLY_TABLE).first(), a = String(r?.name || "") === e.STATS_HOURLY_TABLE;
        return a && e.markD1SchemaReady(t, "statsTableExists"), a;
      } catch {
        return !1;
      }
    },
    async getTableColumnDefinitions(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA table_xinfo(${ce(r)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || "").toLowerCase(),
          type: String(a?.type || "").trim().toUpperCase(),
          affinity: Ln(a?.type),
          primaryKeyOrder: Math.max(0, Number(a?.pk) || 0),
          notNull: Number(a?.notnull) === 1,
          defaultValue: a?.dflt_value ?? null,
          hidden: Math.max(0, Number(a?.hidden) || 0)
        })).filter((a) => a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          tableName: String(r),
          cause: se(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getTableColumns(t, r) {
      const a = await e.getTableColumnDefinitions(t, r);
      return new Set(a.map((n) => n.name));
    },
    async getIndexKeyColumns(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA index_xinfo(${ce(r)})`).all())?.results || []).map((a) => ({
          order: Math.max(0, Number(a?.seqno) || 0),
          name: String(a?.name || "").toLowerCase(),
          key: a?.key === void 0 || Number(a.key) === 1,
          expression: Number(a?.cid) === -2 || !String(a?.name || "").trim()
        })).filter((a) => a.key).sort((a, n) => a.order - n.order).map((a) => a.expression ? "<expression>" : a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          indexName: String(r),
          cause: se(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getTableIndexDefinitions(t, r) {
      if (!t || !r) return [];
      try {
        return ((await t.prepare(`PRAGMA index_list(${ce(r)})`).all())?.results || []).map((a) => ({
          name: String(a?.name || ""),
          unique: Number(a?.unique) === 1,
          partial: Number(a?.partial) === 1
        })).filter((a) => a.name);
      } catch (a) {
        const n = /* @__PURE__ */ new Error(`D1 schema inspection failed for ${r}`);
        throw n.code = "D1_SCHEMA_INSPECTION_FAILED", n.status = 503, n.details = {
          tableName: String(r),
          cause: se(a, "d1_pragma_failed")
        }, n;
      }
    },
    async getD1TableNameSet(t) {
      if (!t) return /* @__PURE__ */ new Set();
      const r = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
      return new Set((r?.results || []).map((a) => String(a?.name || "")).filter(Boolean));
    },
    async getD1SchemaSnapshot(t) {
      if (!t) return {
        objects: [],
        columns: [],
        indexes: []
      };
      const r = Object.keys(e.getD1CurrentSchemaContract().columns), a = [...r, e.LOGS_FTS_TABLE], n = a.map(() => "?").join(", "), s = r.map(() => "?").join(", "), [i, c, l] = await Promise.all([
        t.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all(),
        t.prepare(`SELECT schema_table.name AS table_name, column_info.name, column_info.type, column_info."notnull" AS is_not_null,
					column_info.dflt_value, column_info.pk, column_info.hidden
					FROM sqlite_master AS schema_table
					JOIN pragma_table_xinfo(schema_table.name) AS column_info
					WHERE schema_table.type = 'table' AND schema_table.name IN (${n})
					ORDER BY schema_table.name, column_info.cid`).bind(...a).all(),
        t.prepare(`SELECT schema_index.tbl_name AS table_name, index_list.name AS index_name, index_list."unique" AS is_unique,
					index_list.partial, index_list.origin, index_column.seqno, index_column.cid, index_column.name AS column_name, index_column."key" AS is_key
					FROM sqlite_master AS schema_index
					JOIN pragma_index_list(schema_index.tbl_name) AS index_list ON index_list.name = schema_index.name
					JOIN pragma_index_xinfo(index_list.name) AS index_column
					WHERE schema_index.type = 'index' AND schema_index.tbl_name IN (${s})
					ORDER BY schema_index.tbl_name, index_list.name, index_column.seqno`).bind(...r).all()
      ]);
      return {
        objects: i?.results || [],
        columns: c?.results || [],
        indexes: l?.results || []
      };
    },
    getD1CurrentSchemaContract() {
      const t = e.getD1RequiredPrimaryKeyContract(), r = {
        [e.D1_SCHEMA_META_TABLE]: { scope: "TEXT" },
        [e.SYS_STATUS_TABLE]: { scope: "TEXT" },
        [e.SCHEDULED_LOCKS_TABLE]: { scope: "TEXT" },
        [e.AUTH_FAILURES_TABLE]: { ip: "TEXT" },
        [e.CF_DASH_CACHE_TABLE]: { cache_key: "TEXT" },
        [e.CF_RUNTIME_CACHE_TABLE]: { cache_key: "TEXT" },
        [e.DNS_IP_POOL_ITEMS_TABLE]: {
          id: "TEXT",
          ip: "TEXT"
        },
        [e.DNS_IP_POOL_SOURCES_TABLE]: { id: "TEXT" },
        [e.DNS_IP_POOL_FETCH_CACHE_TABLE]: { signature: "TEXT" },
        [e.DNS_IP_PROBE_CACHE_TABLE]: {
          ip: "TEXT",
          entry_colo: "TEXT"
        },
        [e.LOGS_TABLE]: { id: "INTEGER" },
        [e.STATS_HOURLY_TABLE]: {
          bucket_date: "TEXT",
          bucket_hour: "INTEGER"
        }
      }, a = Object.fromEntries(Object.entries(e.getD1RuntimeColumnAdditions()).map(([n, s]) => {
        const i = Object.fromEntries(Object.entries(s).map(([c, l]) => [c, String(l || "").trim().split(/\s+/, 1)[0].toUpperCase()]));
        return [n, {
          ...r[n],
          ...i
        }];
      }));
      return {
        columns: Object.fromEntries(Object.entries(a).map(([n, s]) => [n, Object.keys(s)])),
        columnTypes: a,
        columnAffinities: Object.fromEntries(Object.entries(a).map(([n, s]) => [n, Object.fromEntries(Object.entries(s).map(([i, c]) => [i, Ln(c)]))])),
        primaryKeys: t,
        indexes: e.getD1RuntimeIndexContract(),
        uniqueIndexes: e.getD1UniqueIndexContract()
      };
    },
    async getD1SchemaFingerprint(t) {
      return t ? ne(Z((await t.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('table', 'index', 'trigger') ORDER BY type, name").all())?.results || [])) : "";
    },
    async getD1SchemaStatus(t, r = {}) {
      if (!t) return {
        tables: {},
        columns: {},
        indexes: {},
        constraints: {
          primaryKeys: {},
          uniqueKeys: {}
        },
        ftsReady: !1,
        fts: {},
        schemaReady: !1,
        issues: ["db_not_configured"]
      };
      const a = e.getD1CurrentSchemaContract(), n = r.snapshot || await e.getD1SchemaSnapshot(t), s = n.objects || [], i = new Set(s.filter((b) => b?.type === "table").map((b) => String(b?.name || "")).filter(Boolean)), c = /* @__PURE__ */ new Map();
      for (const b of n.indexes || []) {
        const N = String(b?.index_name || "");
        if (!N) continue;
        let R = c.get(N);
        R || (R = {
          name: N,
          table: String(b?.table_name || ""),
          unique: Number(b?.is_unique) === 1,
          partial: Number(b?.partial) === 1,
          origin: String(b?.origin || ""),
          columns: []
        }, c.set(N, R)), (b?.is_key === void 0 || Number(b.is_key) === 1) && R.columns.push({
          order: Math.max(0, Number(b?.seqno) || 0),
          name: Number(b?.cid) === -2 || !String(b?.column_name || "").trim() ? "<expression>" : String(b.column_name).toLowerCase()
        });
      }
      for (const b of c.values()) b.columns = b.columns.sort((N, R) => N.order - R.order).map((N) => N.name);
      const l = /* @__PURE__ */ new Map();
      for (const b of n.columns || []) {
        const N = String(b?.table_name || "");
        l.has(N) || l.set(N, []), l.get(N).push({
          name: String(b?.name || "").toLowerCase(),
          type: String(b?.type || "").trim().toUpperCase(),
          affinity: Ln(b?.type),
          primaryKeyOrder: Math.max(0, Number(b?.pk) || 0),
          notNull: Number(b?.is_not_null) === 1,
          defaultValue: b?.dflt_value ?? null,
          hidden: Math.max(0, Number(b?.hidden) || 0)
        });
      }
      const u = Object.fromEntries(Object.keys(a.columns).map((b) => [b, i.has(b)])), d = {}, f = {}, m = [];
      for (const [b, N] of Object.entries(a.columns)) {
        if (!i.has(b)) {
          d[b] = Object.fromEntries(N.map((M) => [M, !1])), f[b] = !1, m.push(`missing_table:${b}`);
          continue;
        }
        const R = l.get(b) || [], x = new Map(R.map((M) => [M.name, M]));
        d[b] = Object.fromEntries(N.map((M) => {
          const C = x.get(M), I = String(a.columnAffinities?.[b]?.[M] || "").toUpperCase(), P = b === e.LOGS_TABLE && M === "id";
          return [M, !!C && (!I || C.affinity === I) && (!P || C.type === "INTEGER")];
        }));
        for (const [M, C] of Object.entries(d[b])) if (!C) {
          const I = x.get(M);
          m.push(I ? `invalid_column_affinity:${b}.${M}` : `missing_column:${b}.${M}`);
        }
        const O = R.filter((M) => M.primaryKeyOrder > 0).sort((M, C) => M.primaryKeyOrder - C.primaryKeyOrder).map((M) => M.name), L = b === e.LOGS_TABLE ? R.find((M) => M.name === "id") : null;
        f[b] = Z(O) === Z(a.primaryKeys[b] || []) && (!L || L.type === "INTEGER"), f[b] || m.push(`invalid_primary_key:${b}`);
        const v = R.filter((M) => !N.includes(M.name) && M.notNull && M.defaultValue === null && M.primaryKeyOrder === 0).map((M) => M.name);
        v.length && m.push(`unsupported_required_columns:${b}:${v.join(",")}`);
      }
      let p = !1;
      if (i.has(e.DNS_IP_POOL_ITEMS_TABLE)) {
        for (const b of [...c.values()].filter((N) => N.table === e.DNS_IP_POOL_ITEMS_TABLE && N.unique && !N.partial)) if (Z(b.columns) === Z(["ip"])) {
          p = !0;
          break;
        }
        p || m.push(`missing_unique_key:${e.DNS_IP_POOL_ITEMS_TABLE}.ip`);
      }
      const h = {};
      for (const [b, N] of Object.entries(a.indexes)) {
        const R = c.get(b);
        if (!R) {
          h[b] = !1, m.push(`missing_index:${b}`);
          continue;
        }
        h[b] = R.table === N.table && R.unique === !1 && R.partial === !1 && Z(R.columns) === Z(N.columns), h[b] || m.push(`invalid_index:${b}`);
      }
      for (const b of Object.keys(a.columns)) {
        const N = [a.primaryKeys?.[b] || [], ...Object.values(a.uniqueIndexes || {}).filter((x) => x.table === b).map((x) => x.columns)], R = [...c.values()].filter((x) => x.table === b && x.unique && !x.partial && !N.some((O) => Z(O) === Z(x.columns))).map((x) => x.name);
        R.length && m.push(`unsupported_unique_indexes:${b}:${R.join(",")}`);
      }
      const g = /* @__PURE__ */ new Set([String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase()]);
      for (const b of Object.keys(a.columns)) {
        const N = [], R = [];
        for (const x of s) {
          if (x?.type !== "trigger" || String(x?.tbl_name || "") !== b) continue;
          const O = String(x?.name || "");
          !O || g.has(O.toLowerCase()) || (b === e.LOGS_TABLE && e.isLogsFtsSyncTrigger(x) ? R.push(O) : N.push(O));
        }
        N.length && m.push(`unsupported_triggers:${b}:${N.join(",")}`), R.length && m.push(`legacy_fts_trigger:${b}:${R.join(",")}`);
      }
      const y = s.find((b) => b?.type === "table" && String(b?.name || "") === e.LOGS_FTS_TABLE), _ = s.find((b) => b?.type === "trigger" && String(b?.name || "") === e.LOGS_FTS_INSERT_TRIGGER), S = new Set((l.get(e.LOGS_FTS_TABLE) || []).map((b) => b.name)), A = Cr(y?.sql || "").replace(/'/g, ""), E = Cr(_?.sql || ""), T = E.replace(/\s+/g, ""), w = `insertinto${e.LOGS_FTS_TABLE}(rowid,node_name,request_path,user_agent,error_detail,detail_json)values(new.id,new.node_name,new.request_path,coalesce(new.user_agent,''),coalesce(new.error_detail,''),coalesce(new.detail_json,''))`, D = {
        tableReady: !!y,
        virtualTableReady: !!y && /^create\s+virtual\s+table\b/.test(A) && /\busing\s+fts5\s*\(/.test(A) && new RegExp(`\\bcontent\\s*=\\s*${e.LOGS_TABLE}\\b`).test(A) && /\bcontent_rowid\s*=\s*id\b/.test(A),
        columnsReady: [
          "node_name",
          "request_path",
          "user_agent",
          "error_detail",
          "detail_json"
        ].every((b) => S.has(b)),
        triggerReady: String(_?.tbl_name || "") === e.LOGS_TABLE && new RegExp(`\\bafter\\s+insert\\s+on\\s+${e.LOGS_TABLE}\\b`).test(E) && T.includes(w)
      };
      D.ready = D.virtualTableReady && D.columnsReady && D.triggerReady, D.ready || m.push(D.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`);
      const k = m.length === 0 && Object.values(u).every(Boolean) && Object.values(d).every((b) => Object.values(b).every(Boolean)) && Object.values(f).every(Boolean) && p && Object.values(h).every(Boolean) && D.ready;
      return {
        tables: u,
        columns: d,
        indexes: h,
        constraints: {
          primaryKeys: f,
          uniqueKeys: { [`${e.DNS_IP_POOL_ITEMS_TABLE}.ip`]: p }
        },
        ftsReady: D.ready,
        fts: D,
        schemaReady: k,
        issues: m
      };
    },
    async getD1SchemaReadiness(t, r = {}) {
      if (r.allowAttestedFastPath === !0 && r.env) {
        const a = await e.verifyD1SchemaAttestation(t, r.env);
        if (a.blocked) return {
          ...await e.getD1SchemaStatus(t),
          fastPath: !1,
          attested: a
        };
        if (a.valid) return {
          schemaReady: !0,
          fastPath: !0,
          contractVersion: at,
          contractHash: e.getD1ContractHash(),
          schemaFingerprint: String(a.meta?.schema_fingerprint || ""),
          schemaCookie: a.schemaCookie,
          issues: []
        };
      }
      return {
        ...await e.getD1SchemaStatus(t),
        fastPath: !1
      };
    },
    async probeD1UniqueKeyRepair(t, r, a = []) {
      const n = ce(r), s = a.map((u) => ce(u)), i = s.map((u) => `${u} IS NULL OR (typeof(${u}) = 'text' AND trim(${u}) = '')`).join(" OR "), [c, l] = await Promise.all([t.prepare(`SELECT 1 AS present FROM ${n} WHERE ${i} LIMIT 1`).first(), t.prepare(`SELECT 1 AS present FROM ${n} GROUP BY ${s.join(", ")} HAVING COUNT(*) > 1 LIMIT 1`).first()]);
      return {
        empty: !!c,
        duplicate: !!l
      };
    },
    async probeD1PrimaryKeyRepair(t, r, a) {
      const n = await e.getTableColumnDefinitions(t, r), s = r === e.LOGS_TABLE, i = new Set(a.columns?.[r] || []), c = a.primaryKeys?.[r] || [], l = new Map(n.map((g) => [g.name, g])), u = [];
      for (const g of c) {
        const y = l.get(g), _ = a.columnAffinities?.[r]?.[g];
        y ? (y.affinity !== _ || r === e.LOGS_TABLE && g === "id" && y.type !== "INTEGER") && u.push(`invalid_column_affinity:${r}.${g}`) : s || u.push(`missing_key_column:${r}.${g}`);
      }
      const d = n.filter((g) => !i.has(g.name)).map((g) => g.name);
      !s && d.length && u.push(`unsupported_extra_columns:${r}:${d.join(",")}`), !s && n.some((g) => g.hidden > 0) && u.push(`unsupported_hidden_columns:${r}`), ((await t.prepare(`PRAGMA foreign_key_list(${ce(r)})`).all())?.results || []).length && u.push(`unsupported_foreign_keys:${r}`);
      const f = ((await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'trigger' AND tbl_name = ?").bind(r).all())?.results || []).filter((g) => {
        if (r !== e.LOGS_TABLE) return !0;
        const y = String(g?.name || "").toLowerCase(), _ = Cr(g?.sql || "");
        return !(y === String(e.LOGS_FTS_INSERT_TRIGGER).toLowerCase() || y === `${e.LOGS_TABLE}_ai` || y === `${e.LOGS_TABLE}_au` || y === `${e.LOGS_TABLE}_ad` || _.includes(String(e.LOGS_FTS_TABLE).toLowerCase()));
      });
      !s && f.length && u.push(`unsupported_triggers:${r}:${f.map((g) => String(g?.name || "")).join(",")}`);
      const m = [`__d1_repair_${r}_`, `__d1_backup_${r}_`], p = await t.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND (name GLOB ? OR name GLOB ?) LIMIT 1").bind(`${m[0]}*`, `${m[1]}*`).first();
      p?.name && u.push(`repair_artifact_present:${r}:${String(p.name)}`);
      let h = null;
      if (!s) {
        const g = ce(r), y = await t.prepare(`SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${g} LIMIT ${wn + 1})`).first();
        h = Math.max(0, Number(y?.total) || 0);
      }
      if (!s && h > wn && u.push(`rebuild_row_limit_exceeded:${r}:${h}`), !s && !u.length) {
        const g = await e.probeD1UniqueKeyRepair(t, r, c);
        g.empty && u.push(`primary_key_empty:${r}`), g.duplicate && u.push(`primary_key_duplicate:${r}`);
      }
      return {
        repairable: u.length === 0,
        rowCount: h,
        estimatedRowsIsLowerBound: h !== null && h > wn,
        rowCountMeasured: h !== null,
        allowsDataLoss: s,
        blockers: u
      };
    },
    async buildD1SchemaRepairPlan(t) {
      const r = await e.getD1SchemaSnapshot(t), a = await e.getD1SchemaStatus(t, { snapshot: r }), n = e.getD1CurrentSchemaContract(), s = ne(Z(r.objects || [])), i = await e.getD1SchemaCookie(t), c = e.getD1ContractHash(), l = await e.readD1SchemaMeta(t), u = [], d = [], f = [], m = [], p = (R, x, O = "low", L = 0, v = {}) => m.push({
        kind: R,
        target: x,
        risk: O,
        estimatedRows: L === null ? null : Math.max(0, Number(L) || 0),
        ...v
      }), h = Math.max(0, Number(l?.contract_version) || 0), g = h > at ? `schema_version_ahead:${h}` : "";
      for (const [R, x] of Object.entries(a.tables || {})) {
        if (!x) {
          const L = `missing_table:${R}`;
          u.push(L), p("create_table", R);
          continue;
        }
        const O = R === e.LOGS_TABLE && a.constraints?.primaryKeys?.[R] !== !0;
        for (const [L, v] of Object.entries(a.columns?.[R] || {})) {
          if (v) continue;
          const M = `${R}.${L}`, C = (a.issues || []).find((I) => String(I).endsWith(M)) || `missing_column:${M}`;
          O && String(C).startsWith("missing_column:") ? d.push(C) : String(C).startsWith("missing_column:") && e.getD1RuntimeColumnAdditions()?.[R]?.[L] ? (u.push(C), p("add_column", M)) : f.push(C);
        }
        if (a.constraints?.primaryKeys?.[R] !== !0) {
          const L = `invalid_primary_key:${R}`, v = await e.probeD1PrimaryKeyRepair(t, R, n);
          v.repairable ? (d.push(L), p(v.allowsDataLoss === !0 ? "recreate_log_table" : "rebuild_table", R, "high", v.rowCount, {
            allowsDataLoss: v.allowsDataLoss === !0,
            willDiscardData: v.allowsDataLoss === !0,
            dataMode: v.allowsDataLoss === !0 ? "discard" : "copy",
            estimatedRowsIsLowerBound: v.estimatedRowsIsLowerBound === !0,
            rowCountMeasured: v.rowCountMeasured === !0
          })) : f.push(L, ...v.blockers);
        }
      }
      for (const R of a.issues || []) if (/^unsupported_(?:required_columns|unique_indexes|triggers):/.test(String(R))) {
        const x = String(R).split(":", 2)[1];
        if (x === e.LOGS_TABLE && a.constraints?.primaryKeys?.[x] !== !0) continue;
        f.push(R);
      }
      for (const R of a.issues || []) {
        const x = /^legacy_fts_trigger:([^:]+):(.+)$/.exec(String(R));
        if (!x) continue;
        const O = x[1];
        for (const L of x[2].split(",")) {
          const v = L.trim();
          v && (u.push(`legacy_fts_trigger:${O}:${v}`), p("drop_trigger", v));
        }
      }
      const y = `${e.DNS_IP_POOL_ITEMS_TABLE}.ip`;
      if (a.tables?.[e.DNS_IP_POOL_ITEMS_TABLE] && a.constraints?.uniqueKeys?.[y] !== !0 && a.columns?.[e.DNS_IP_POOL_ITEMS_TABLE]?.ip === !0) {
        const R = await e.probeD1UniqueKeyRepair(t, e.DNS_IP_POOL_ITEMS_TABLE, ["ip"]);
        R.empty && f.push(`unique_key_empty:${y}`), R.duplicate && f.push(`unique_key_duplicate:${y}`), !R.empty && !R.duplicate && (u.push(`missing_unique_key:${y}`), p("create_unique_index", "ux_dns_ip_pool_items_ip"));
      }
      const _ = m.some((R) => R.kind === "recreate_log_table" && R.target === e.LOGS_TABLE);
      for (const [R, x] of Object.entries(a.indexes || {})) if (!x) {
        const O = (a.issues || []).includes(`invalid_index:${R}`) ? `invalid_index:${R}` : `missing_index:${R}`;
        u.push(O), _ && n.indexes?.[R]?.table === e.LOGS_TABLE || p(O.startsWith("invalid_") ? "repair_index" : "create_index", R);
      }
      if (a.ftsReady !== !0) {
        const R = a.fts?.tableReady ? "fts_contract_invalid" : `missing_table:${e.LOGS_FTS_TABLE}`;
        u.push(R), _ || p(a.fts?.tableReady ? "recreate_fts" : "create_fts", e.LOGS_FTS_TABLE);
      }
      const S = (R) => [...new Set(R.map((x) => String(x || "").trim()).filter(Boolean))], A = S(u), E = S(d), T = S(f);
      g && (T.length || E.length ? T.push(g) : (A.push(g), p("reattest_contract_version", e.D1_SCHEMA_META_TABLE)));
      const w = [...new Map(m.map((R) => [`${R.kind}:${R.target}`, R])).values()].sort((R, x) => `${R.risk}:${R.kind}:${R.target}`.localeCompare(`${x.risk}:${x.kind}:${x.target}`)), D = w.filter((R) => R.risk !== "high"), k = w.filter((R) => R.risk === "high"), b = T.length ? "blocked" : E.length ? "high" : A.length ? "low" : "none", N = T.length ? "blocked" : D.length ? "safe" : k.length ? "destructive" : "ready";
      return {
        version: va,
        phase: N,
        contractVersion: at,
        contractHash: c,
        schemaCookie: i,
        planHash: ne(Z({
          version: va,
          contractVersion: at,
          contractHash: c,
          schemaCookie: i,
          schemaFingerprint: s,
          phase: N,
          repairableIssues: A,
          highRiskIssues: E,
          blockingIssues: T,
          steps: w
        })),
        schemaFingerprint: s,
        risk: b,
        repairableIssues: A,
        highRiskIssues: E,
        blockingIssues: T,
        steps: w,
        status: a
      };
    },
    async createD1SchemaRepairToken(t, r, a = {}) {
      const n = String(t?.JWT_SECRET || "").trim();
      if (!n) {
        const l = /* @__PURE__ */ new Error("JWT_SECRET is required to sign the D1 schema repair plan");
        throw l.code = "SERVER_MISCONFIGURED", l.status = 503, l;
      }
      const s = Math.max(0, Math.floor(Number(a.nowMs ?? H()) / 1e3)), i = s + Math.floor(Ku / 1e3), c = ga(JSON.stringify({
        version: va,
        scope: "d1_schema_repair",
        phase: String(r?.phase || ""),
        contractVersion: Math.max(0, Number(r?.contractVersion) || 0),
        contractHash: String(r?.contractHash || ""),
        schemaCookie: Math.max(0, Number(r?.schemaCookie) || 0),
        planHash: String(r?.planHash || ""),
        schemaFingerprint: String(r?.schemaFingerprint || ""),
        destructiveTargets: (r?.steps || []).filter((l) => l?.risk === "high").map((l) => String(l?.target || "")),
        issuedAt: s,
        expiresAt: i
      }));
      return {
        token: `${c}.${await gt(n, c)}`,
        expiresAt: i
      };
    },
    async verifyD1SchemaRepairToken(t, r, a, n = {}) {
      const s = String(t?.JWT_SECRET || "").trim(), i = String(r || "").trim(), c = (m, p = {}) => {
        const h = /* @__PURE__ */ new Error("D1 schema repair plan is stale");
        return h.code = "D1_SCHEMA_REPAIR_PLAN_STALE", h.status = 409, h.details = {
          reason: m,
          ...p
        }, h;
      };
      if (!s) {
        const m = /* @__PURE__ */ new Error("JWT_SECRET is required to verify the D1 schema repair plan");
        throw m.code = "SERVER_MISCONFIGURED", m.status = 503, m;
      }
      const l = i.indexOf(".");
      if (l <= 0 || l === i.length - 1) throw c("invalid_token");
      const u = i.slice(0, l);
      if (i.slice(l + 1) !== await gt(s, u)) throw c("invalid_signature");
      let d = null;
      try {
        d = JSON.parse(jr(u));
      } catch {
      }
      if (!$(d) || d.version !== va || d.scope !== "d1_schema_repair" || d.phase !== "destructive") throw c("invalid_payload");
      const f = Math.max(0, Math.floor(Number(n.nowMs ?? H()) / 1e3));
      if (Number(d.expiresAt) <= f) throw c("expired", { expiresAt: Number(d.expiresAt) || 0 });
      if (String(d.planHash || "") !== String(a?.planHash || "") || String(d.schemaFingerprint || "") !== String(a?.schemaFingerprint || "") || Number(d.schemaCookie) !== Number(a?.schemaCookie) || String(d.contractHash || "") !== String(a?.contractHash || "") || Number(d.contractVersion) !== Number(a?.contractVersion)) throw c("schema_changed", {
        previewPlanHash: String(d.planHash || ""),
        currentPlanHash: String(a?.planHash || "")
      });
      return d;
    },
    getD1SchemaRepairTokenPlanHash(t) {
      const r = String(t || "").trim().split(".", 1)[0];
      if (!r) return "";
      try {
        const a = JSON.parse(jr(r));
        return a?.scope === "d1_schema_repair" ? String(a?.planHash || "").trim() : "";
      } catch {
        return "";
      }
    },
    async getD1TimeTravelBookmark(t) {
      if (!t || typeof t.withSession != "function") {
        const r = /* @__PURE__ */ new Error("D1 Time Travel bookmark is unavailable on this binding");
        throw r.code = "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE", r.status = 409, r.details = { reason: "sessions_api_unavailable" }, r;
      }
      try {
        const r = t.withSession("first-primary");
        if (!r || typeof r.prepare != "function" || typeof r.getBookmark != "function") throw new Error("invalid_d1_session");
        await r.prepare("SELECT 1 AS bookmark_probe").run();
        const a = String(r.getBookmark() || "").trim();
        if (!a) throw new Error("empty_bookmark");
        return {
          bookmark: a,
          consistency: "first-primary",
          capturedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        };
      } catch (r) {
        if (String(r?.code || "") === "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE") throw r;
        const a = /* @__PURE__ */ new Error("Unable to capture a D1 Time Travel bookmark");
        throw a.code = "D1_SCHEMA_REPAIR_RECOVERY_UNAVAILABLE", a.status = 409, a.details = {
          reason: "bookmark_failed",
          cause: se(r, "bookmark_failed")
        }, a;
      }
    },
    async ensureD1KnownColumns(t, r = {}) {
      const a = await e.getD1TableNameSet(t), n = new Set(Array.isArray(r.skipTables) ? r.skipTables : []), s = [];
      for (const [i, c] of Object.entries(e.getD1RuntimeColumnAdditions())) {
        if (!a.has(i) || n.has(i)) continue;
        const l = await e.getTableColumns(t, i);
        for (const [u, d] of Object.entries(c))
          l.has(u) || (await t.prepare(`ALTER TABLE ${ce(i)} ADD COLUMN ${ce(u)} ${d}`).run(), l.add(u), s.push(`${i}.${u}`));
      }
      return s;
    },
    async repairD1RuntimeIndexes(t, r = {}) {
      const a = await e.getD1TableNameSet(t), n = new Set(Array.isArray(r.skipTables) ? r.skipTables : []), s = [], i = [];
      for (const [c, l] of Object.entries(e.getD1RuntimeIndexContract())) {
        if (!a.has(l.table) || n.has(l.table)) continue;
        const u = await t.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(c).first();
        let d = !1;
        if (u) {
          const f = (await e.getTableIndexDefinitions(t, l.table)).find((m) => m.name === c);
          d = String(u?.tbl_name || "") === l.table && f?.unique === !1 && f?.partial === !1 && Z(await e.getIndexKeyColumns(t, c)) === Z(l.columns);
        }
        d || (u ? (await t.prepare(`DROP INDEX IF EXISTS ${ce(c)}`).run(), i.push(c)) : s.push(c), await t.prepare(l.createSql).run());
      }
      return {
        createdIndexes: s,
        repairedIndexes: i
      };
    },
    async ensureD1UniqueIndexes(t) {
      const r = [];
      for (const [a, n] of Object.entries(e.getD1UniqueIndexContract())) {
        if (!(await e.getD1TableNameSet(t)).has(n.table)) continue;
        let s = !1;
        for (const i of (await e.getTableIndexDefinitions(t, n.table)).filter((c) => c.unique && !c.partial)) if (Z(await e.getIndexKeyColumns(t, i.name)) === Z(n.columns)) {
          s = !0;
          break;
        }
        s || (await t.prepare("SELECT tbl_name FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1").bind(a).first() && await t.prepare(`DROP INDEX IF EXISTS ${ce(a)}`).run(), await t.prepare(n.createSql).run(), r.push(a));
      }
      return r;
    },
    async rebuildD1TableWithShadow(t, r, a) {
      const n = e.getD1CurrentSchemaContract();
      if (!Object.prototype.hasOwnProperty.call(n.columns, r)) throw new Error(`Unknown D1 rebuild table: ${r}`);
      if (r === e.LOGS_TABLE) throw new Error("proxy_logs must use destructive atomic recreation");
      const s = String(a?.planHash || "repair").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "repair", i = `__d1_repair_${r}_${s}`, c = `__d1_backup_${r}_${s}`, l = await e.getD1TableNameSet(t);
      if (l.has(i) || l.has(c)) {
        const m = /* @__PURE__ */ new Error("D1 schema repair temporary table already exists");
        throw m.code = "D1_SCHEMA_REPAIR_BLOCKED", m.status = 409, m.details = {
          phase: "preflight",
          blockingIssues: [`repair_artifact_present:${r}`]
        }, m;
      }
      const u = n.columns[r].map((m) => ce(m)).join(", "), d = (await t.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(r).all())?.results || [];
      await t.prepare(e.buildD1CreateTableSql(r, i)).run();
      try {
        await t.batch([
          t.prepare(`INSERT INTO ${ce(i)} (${u}) SELECT ${u} FROM ${ce(r)}`),
          t.prepare(`ALTER TABLE ${ce(r)} RENAME TO ${ce(c)}`),
          t.prepare(`ALTER TABLE ${ce(i)} RENAME TO ${ce(r)}`),
          ...d.map((m) => t.prepare(`DROP INDEX ${ce(m.name)}`)),
          ...d.map((m) => t.prepare(String(m.sql)))
        ]);
      } catch (m) {
        throw await t.prepare(`DROP TABLE IF EXISTS ${ce(i)}`).run().catch(() => {
        }), m;
      }
      const f = await t.prepare(`SELECT COUNT(*) AS total FROM ${ce(r)}`).first();
      return {
        table: r,
        rowCount: Math.max(0, Number(f?.total) || 0),
        allowsDataLoss: !1,
        willDiscardData: !1,
        dataMode: "copy",
        backupTable: c,
        originalIndexes: d
      };
    },
    async recreateD1LogsDestructively(t, r) {
      const a = (r?.steps || []).find((i) => i?.kind === "recreate_log_table" && i?.target === e.LOGS_TABLE);
      if (!a || a.willDiscardData !== !0 || a.dataMode !== "discard") throw new Error("Missing destructive proxy_logs repair step");
      const n = e.getD1LogsFtsContractSql(), s = Object.values(e.getD1RuntimeIndexContract()).filter((i) => i.table === e.LOGS_TABLE);
      return await t.batch([
        t.prepare(`DROP TABLE IF EXISTS ${ce(e.LOGS_FTS_TABLE)}`),
        t.prepare(`DROP TABLE ${ce(e.LOGS_TABLE)}`),
        t.prepare(e.buildD1CreateTableSql(e.LOGS_TABLE)),
        ...s.map((i) => t.prepare(i.createSql)),
        t.prepare(n.createTable),
        t.prepare(n.createTrigger)
      ]), {
        table: e.LOGS_TABLE,
        rowCount: 0,
        rowCountMeasured: !1,
        discardedRows: null,
        discardedRowsIsLowerBound: !1,
        allowsDataLoss: !0,
        willDiscardData: !0,
        dataMode: "discard"
      };
    },
    async rollbackD1RebuiltTables(t, r = []) {
      for (const a of [...r].reverse()) {
        const n = String(a?.table || ""), s = String(a?.backupTable || "");
        if (!(!n || !s || !(await e.getD1TableNameSet(t)).has(s))) {
          n === e.LOGS_TABLE && (await e.dropLogsFtsSyncTriggers(t).catch(() => 0), await t.prepare(`DROP TABLE IF EXISTS ${ce(e.LOGS_FTS_TABLE)}`).run().catch(() => {
          }));
          for (const i of (await t.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL").bind(n).all())?.results || []) await t.prepare(`DROP INDEX IF EXISTS ${ce(i.name)}`).run().catch(() => {
          });
          await t.batch([t.prepare(`DROP TABLE IF EXISTS ${ce(n)}`), t.prepare(`ALTER TABLE ${ce(s)} RENAME TO ${ce(n)}`)]);
          for (const i of a.originalIndexes || []) {
            const c = String(i?.sql || "").replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (l, u) => `CREATE ${u || ""}INDEX IF NOT EXISTS `);
            c && await t.prepare(c).run().catch(() => {
            });
          }
          n === e.LOGS_TABLE && await e.ensureLogsFtsSchema(t, { forceRecreate: !0 }).catch(() => {
          });
        }
      }
    },
    async assertD1CurrentSchema(t) {
      const r = await e.buildD1SchemaRepairPlan(t);
      if (r.blockingIssues.length) {
        const a = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw a.code = "D1_SCHEMA_REPAIR_BLOCKED", a.status = 409, a.details = {
          phase: "preflight",
          blockingIssues: r.blockingIssues,
          repairPlan: r
        }, a;
      }
      return r;
    },
    async initializeD1Database(t, r = {}) {
      if (!t) {
        const c = /* @__PURE__ */ new Error("D1 not configured");
        throw c.code = "D1_NOT_CONFIGURED", c.status = 503, c;
      }
      const a = r.includeFts === !1 ? "logs-core" : "logs-fts";
      let n = Y.D1DatabaseInitReady.get(t);
      (!n || !(n.inFlight instanceof Map)) && (n = {
        tail: Promise.resolve(),
        inFlight: /* @__PURE__ */ new Map()
      }, Y.D1DatabaseInitReady.set(t, n));
      const s = `${a}:${e.getD1SchemaRepairTokenPlanHash(r.repairToken) || "automatic"}`;
      let i = n.inFlight.get(s);
      i || (i = Promise.resolve(n.tail).catch(() => {
      }).then(() => e.runD1DatabaseInitialization(t, {
        ...r,
        profile: a
      })), n.tail = i.catch(() => {
      }), n.inFlight.set(s, i));
      try {
        return await i;
      } finally {
        n.inFlight.get(s) === i && n.inFlight.delete(s);
      }
    },
    async runD1DatabaseInitialization(t, r = {}) {
      const a = r.profile || (r.includeFts === !1 ? "logs-core" : "logs-fts"), n = String(r.repairMode || (String(r.repairToken || "").trim() ? "confirmed-destructive" : "safe"));
      e.invalidateD1SchemaReadiness(t, "all");
      const s = await e.buildD1SchemaRepairPlan(t), i = new Set(Object.entries(s.status?.tables || {}).filter(([, f]) => f === !0).map(([f]) => f));
      if (s.status?.fts?.tableReady === !0 && i.add(e.LOGS_FTS_TABLE), s.blockingIssues.length) {
        const f = /* @__PURE__ */ new Error("D1 schema repair is blocked by incompatible data or table shape");
        throw f.code = "D1_SCHEMA_REPAIR_BLOCKED", f.status = 409, f.details = {
          phase: "preflight",
          blockingIssues: s.blockingIssues,
          repairPlan: s
        }, f;
      }
      let c = null;
      if (s.phase === "safe" && n === "confirmed-destructive") {
        const f = /* @__PURE__ */ new Error("D1 schema repair must complete safe preparation before destructive repair");
        throw f.code = "D1_SCHEMA_REPAIR_PREPARATION_REQUIRED", f.status = 409, f.details = { repairPlan: s }, f;
      }
      if (s.phase === "destructive") {
        if (r.confirmHighRisk !== !0 || !String(r.repairToken || "").trim()) {
          const f = r.env ? await e.createD1SchemaRepairToken(r.env, s) : {
            token: "",
            expiresAt: 0
          }, m = /* @__PURE__ */ new Error("D1 schema repair requires explicit confirmation");
          throw m.code = "D1_SCHEMA_REPAIR_CONFIRMATION_REQUIRED", m.status = 428, m.details = { repairPlan: {
            ...s,
            repairToken: f.token,
            expiresAt: f.expiresAt ? (/* @__PURE__ */ new Date(f.expiresAt * 1e3)).toISOString() : ""
          } }, m;
        }
        await e.verifyD1SchemaRepairToken(r.env, r.repairToken, s), c = await e.getD1TimeTravelBookmark(t);
      }
      const l = [], u = [];
      let d = "";
      try {
        if (s.steps.find((L) => L.kind === "create_table" && L.target === e.D1_SCHEMA_META_TABLE && L.risk !== "high") && (await t.prepare(e.buildD1CreateTableSql(e.D1_SCHEMA_META_TABLE, e.D1_SCHEMA_META_TABLE, { ifNotExists: !0 })).run(), u.push({
          kind: "create_table",
          target: e.D1_SCHEMA_META_TABLE
        })), (s.phase === "safe" || s.phase === "destructive") && (d = String(globalThis.crypto?.randomUUID?.() || `${H()}-${Math.random()}`), await e.acquireD1SchemaRepairLease(t, d)), s.phase === "destructive") {
          const L = await e.buildD1SchemaRepairPlan(t);
          await e.verifyD1SchemaRepairToken(r.env, r.repairToken, L);
        }
        const f = s.phase === "safe" ? s.steps.filter((L) => L.risk !== "high") : s.phase === "destructive" ? s.steps.filter((L) => L.risk === "high") : [], m = f.filter((L) => L.kind === "create_table" && L.target !== e.LOGS_FTS_TABLE && L.target !== e.D1_SCHEMA_META_TABLE).map((L) => L.target);
        for (const L of m)
          await t.prepare(e.buildD1CreateTableSql(L, L, { ifNotExists: !0 })).run(), u.push({
            kind: "create_table",
            target: L
          });
        const p = f.filter((L) => L.kind === "drop_trigger").map((L) => L.target);
        for (const L of p)
          await t.prepare(`DROP TRIGGER IF EXISTS ${ce(L)}`).run(), u.push({
            kind: "drop_trigger",
            target: L
          });
        const h = f.filter((L) => L.kind === "rebuild_table").map((L) => L.target), g = f.find((L) => L.kind === "recreate_log_table" && L.target === e.LOGS_TABLE), y = [];
        for (const L of f.filter((v) => v.kind === "add_column")) {
          const [v, M] = String(L.target || "").split(".", 2), C = e.getD1RuntimeColumnAdditions()?.[v]?.[M];
          if (!C) throw new Error(`Unknown D1 column addition: ${L.target}`);
          await t.prepare(`ALTER TABLE ${ce(v)} ADD COLUMN ${ce(M)} ${C}`).run(), y.push(L.target), u.push({
            kind: "add_column",
            target: L.target
          });
        }
        for (const L of h)
          l.push(await e.rebuildD1TableWithShadow(t, L, s)), u.push({
            kind: "rebuild_table",
            target: L
          });
        g && (l.push(await e.recreateD1LogsDestructively(t, s)), u.push({
          kind: "recreate_log_table",
          target: e.LOGS_TABLE
        }));
        const _ = g ? Object.entries(e.getD1RuntimeIndexContract()).filter(([, L]) => L.table === e.LOGS_TABLE).map(([L]) => L) : [], S = {
          createdIndexes: [],
          repairedIndexes: []
        };
        for (const L of f.filter((v) => v.kind === "create_index" || v.kind === "repair_index")) {
          const v = e.getD1RuntimeIndexContract()?.[L.target];
          if (!v) throw new Error(`Unknown D1 runtime index: ${L.target}`);
          L.kind === "repair_index" && await t.prepare(`DROP INDEX IF EXISTS ${ce(L.target)}`).run(), await t.prepare(v.createSql).run(), S[L.kind === "repair_index" ? "repairedIndexes" : "createdIndexes"].push(L.target), u.push({
            kind: L.kind,
            target: L.target
          });
        }
        const A = [];
        for (const L of f.filter((v) => v.kind === "create_unique_index")) {
          const v = e.getD1UniqueIndexContract()?.[L.target];
          if (!v) throw new Error(`Unknown D1 unique index: ${L.target}`);
          await t.prepare(v.createSql).run(), A.push(L.target), u.push({
            kind: L.kind,
            target: L.target
          });
        }
        let E = {
          rebuilt: !1,
          recreated: !1
        };
        const T = f.find((L) => L.target === e.LOGS_FTS_TABLE);
        T && r.includeFts !== !1 && (E = await e.ensureLogsFtsSchema(t, {
          forceRecreate: !0,
          baseSchemaReady: !0
        })), E?.rebuilt === !0 && u.push({
          kind: String(T?.kind || "create_fts"),
          target: e.LOGS_FTS_TABLE
        }), e.invalidateD1SchemaReadiness(t, "all");
        const w = await e.getD1SchemaSnapshot(t), D = await e.getD1SchemaStatus(t, { snapshot: w }), k = ne(Z(w.objects || [])), b = (D.schemaReady ? null : await e.buildD1SchemaRepairPlan(t))?.phase === "destructive";
        if (!D.schemaReady && !b) {
          const L = /* @__PURE__ */ new Error("D1 schema repair did not produce the current contract");
          throw L.code = "D1_SCHEMA_REPAIR_FAILED", L.status = 503, L.details = {
            phase: "final_status",
            issues: D.issues
          }, L;
        }
        const N = l.filter((L) => L?.backupTable);
        N.length && await t.batch(N.map((L) => t.prepare(`DROP TABLE IF EXISTS ${ce(L.backupTable)}`)));
        let R = {
          written: !1,
          reason: "pending_high_risk"
        };
        D.schemaReady && (s.phase === "ready" ? R = (await e.verifyD1SchemaAttestation(t, r.env)).valid ? {
          written: !1,
          reused: !0,
          contractVersion: at,
          contractHash: s.contractHash
        } : await e.writeVerifiedD1SchemaMeta(t, r.env, {
          ...s,
          schemaFingerprint: k
        }) : R = await e.writeVerifiedD1SchemaMeta(t, r.env, {
          ...s,
          schemaFingerprint: k
        }));
        const x = /* @__PURE__ */ new Set([...Object.keys(e.getD1CurrentSchemaContract().columns), e.LOGS_FTS_TABLE]), O = w.objects.filter((L) => L?.type === "table").map((L) => String(L?.name || "")).filter((L) => x.has(L) && !i.has(L));
        return {
          profile: a,
          phase: s.phase,
          completed: D.schemaReady,
          pendingHighRisk: b,
          schemaReady: D.schemaReady,
          contractVersion: at,
          contractHash: s.contractHash,
          planHash: s.planHash,
          risk: s.risk,
          createdTables: O,
          addedColumns: y,
          createdIndexes: [...S.createdIndexes, ..._],
          repairedIndexes: S.repairedIndexes,
          uniqueIndexesCreated: A,
          droppedTriggers: p,
          rebuiltTables: l.map(({ table: L, rowCount: v, rowCountMeasured: M, discardedRows: C, discardedRowsIsLowerBound: I, willDiscardData: P, dataMode: U }) => P ? {
            table: L,
            rowCount: v,
            rowCountMeasured: M,
            discardedRows: C,
            discardedRowsIsLowerBound: I,
            allowsDataLoss: !0,
            willDiscardData: !0,
            dataMode: U
          } : {
            table: L,
            rowCount: v
          }),
          ftsRebuilt: E?.rebuilt === !0,
          ftsRecreated: g ? !0 : E?.recreated === !0 && s.status?.fts?.tableReady === !0,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || ""),
          schemaMeta: R,
          steps: s.steps.map((L) => ({
            ...L,
            ready: u.some((v) => v.kind === L.kind && v.target === L.target) || D.schemaReady
          })),
          status: D
        };
      } catch (f) {
        l.length && await e.rollbackD1RebuiltTables(t, l).catch(() => {
        }), e.invalidateD1SchemaReadiness(t, "all");
        let m = [];
        try {
          m = (await e.getD1SchemaStatus(t))?.issues || [];
        } catch {
        }
        if (f && typeof f == "object" && (f.details = {
          ...$(f.details) ? f.details : {},
          executedSteps: u,
          remainingIssues: m,
          recoveryBookmark: String(c?.bookmark || ""),
          bookmarkCapturedAt: String(c?.capturedAt || "")
        }), String(f?.code || "").startsWith("D1_SCHEMA_REPAIR_")) throw f;
        const p = new Error(se(f, "D1 schema repair failed"));
        throw p.code = "D1_SCHEMA_REPAIR_FAILED", p.status = 503, p.details = {
          ...$(f?.details) ? f.details : {},
          phase: "execution"
        }, p;
      } finally {
        d && await e.releaseD1SchemaRepairLease(t, d).catch(() => {
        });
      }
    },
    async probeLogsReadiness(t, r = {}) {
      if (!t) return {
        schemaReady: !1,
        ftsReady: !1,
        statsReady: !1,
        probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      };
      const a = te.LogsReadinessProbeCache.get(t), n = Math.max(1e3, Number(r.maxAgeMs) || 15e3);
      if (r.force !== !0 && a && H() - a.ts < n) return a.data;
      const [s, i, c] = await Promise.all([
        e.hasLogsBaseTable(t),
        e.isLogsFtsReady(t),
        e.hasStatsHourlyTable(t)
      ]), l = {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        probedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      };
      return te.LogsReadinessProbeCache.set(t, {
        ts: H(),
        data: l
      }), l;
    },
    async resolveLogsReadiness(t, r = {}) {
      const a = e.resolveOpsStatusStores(t), n = await e.getOpsStatusSection(a, "log"), s = n?.schemaReady === !0, i = n?.ftsReady === !0, c = n?.statsReady === !0;
      return s && c && (i || r.requireFts !== !0) || !a.db ? {
        schemaReady: s,
        ftsReady: i,
        statsReady: c,
        revision: e.getLogsRevisionFromStatus(n),
        source: "status",
        logStatus: n
      } : {
        ...await e.probeLogsReadiness(a.db, r),
        revision: e.getLogsRevisionFromStatus(n),
        source: "probe",
        logStatus: n
      };
    }
  };
}
function jg(o = {}, e = {}) {
  return {
    async ensureLogsBaseSchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "logsBaseSchema")) return !0;
      let r = Y.LogsBaseDbReady.get(t);
      r || (r = (async () => (await t.prepare(`CREATE TABLE IF NOT EXISTS ${e.LOGS_TABLE} (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER NOT NULL, node_name TEXT NOT NULL, request_path TEXT NOT NULL, request_method TEXT NOT NULL, status_code INTEGER NOT NULL, response_time INTEGER NOT NULL, client_ip TEXT NOT NULL, inbound_colo TEXT, outbound_colo TEXT, user_agent TEXT, referer TEXT, category TEXT DEFAULT 'api', error_detail TEXT, detail_json TEXT, created_at TEXT NOT NULL, inbound_ip TEXT, outbound_ip TEXT)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp ON ${e.LOGS_TABLE} (timestamp)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time ON ${e.LOGS_TABLE} (client_ip, timestamp DESC)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time ON ${e.LOGS_TABLE} (status_code, timestamp)`).run(), await t.prepare(`CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time ON ${e.LOGS_TABLE} (category, timestamp)`).run(), e.markD1SchemaReady(t, "logsBaseSchema"), e.markD1SchemaReady(t, "logsTableExists"), te.LogsReadinessProbeCache.delete(t), !0))().catch((a) => {
        throw Y.LogsBaseDbReady.delete(t), a;
      }), Y.LogsBaseDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.LogsBaseDbReady.get(t) === r && Y.LogsBaseDbReady.delete(t);
      }
    },
    async ensureStatsHourlySchema(t) {
      if (!t) return !1;
      if (e.isD1SchemaReadyCached(t, "statsHourlySchema")) return !0;
      let r = Y.StatsHourlyDbReady.get(t);
      r || (r = t.prepare(`CREATE TABLE IF NOT EXISTS ${e.STATS_HOURLY_TABLE} (
              bucket_date TEXT NOT NULL,
              bucket_hour INTEGER NOT NULL,
              request_count INTEGER NOT NULL DEFAULT 0,
              play_count INTEGER NOT NULL DEFAULT 0,
              playback_info_count INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL,
              PRIMARY KEY (bucket_date, bucket_hour)
            )`).run().then(() => (e.markD1SchemaReady(t, "statsHourlySchema"), e.markD1SchemaReady(t, "statsTableExists"), te.LogsReadinessProbeCache.delete(t), !0)).catch((a) => {
        throw Y.StatsHourlyDbReady.delete(t), a;
      }), Y.StatsHourlyDbReady.set(t, r));
      try {
        return await r;
      } finally {
        Y.StatsHourlyDbReady.get(t) === r && Y.StatsHourlyDbReady.delete(t);
      }
    }
  };
}
function Vg(o = {}, e = {}) {
  return {
    normalizeD1SchemaProfile(t = "") {
      const r = String(t || "").trim().toLowerCase();
      return r === "runtime-core" || r === "logs-core" || r === "logs-fts" ? r : "logs-core";
    },
    invalidateD1SchemaReadiness(t, r = "all") {
      if (!t) return;
      const a = String(r || "all").trim().toLowerCase();
      if ((a === "all" || a === "logs") && (e.clearD1SchemaReady(t, [
        "logsBaseSchema",
        "logsTableExists",
        "statsHourlySchema",
        "statsTableExists"
      ]), Y.LogsBaseDbReady.delete(t), Y.StatsHourlyDbReady.delete(t), te.LogsReadinessProbeCache.delete(t)), a === "all") {
        e.clearD1SchemaReady(t);
        const n = Y.OpsStatusShadowCache.get(t);
        n?.payloadCache instanceof Map && n.payloadCache.clear(), Y.AdminShellStatusWriteState.delete(t), Y.DnsIpWorkspaceDbReady.delete(t), Y.OpsStatusDbReady.delete(t), Y.ScheduledLeaseDbReady.delete(t), Y.AuthFailuresDbReady.delete(t), Y.CfDashboardCacheDbReady.delete(t), Y.CfRuntimeCacheDbReady.delete(t);
      }
    },
    async bootstrapD1Schema(t, r = "logs-core") {
      const a = e.normalizeD1SchemaProfile(r);
      if (!t) return {
        profile: a,
        runtimeTablesReady: !1,
        schemaReady: !1,
        statsReady: !1,
        ftsReady: !1,
        ftsResult: {
          migratedRows: 0,
          droppedTriggers: 0,
          rebuilt: !1,
          recreated: !1
        },
        steps: []
      };
      const n = [
        {
          name: "ensureSysStatusTable",
          run: () => e.ensureSysStatusTable(t)
        },
        {
          name: "ensureScheduledLeaseTable",
          run: () => e.ensureScheduledLeaseTable(t)
        },
        {
          name: "ensureDnsIpWorkspaceSchema",
          run: () => e.ensureDnsIpWorkspaceSchema(t)
        },
        {
          name: "ensureAuthFailuresTable",
          run: () => e.ensureAuthFailuresTable(t)
        },
        {
          name: "ensureCfDashboardCacheTable",
          run: () => e.ensureCfDashboardCacheTable(t)
        },
        {
          name: "ensureCfRuntimeCacheTable",
          run: () => e.ensureCfRuntimeCacheTable(t)
        }
      ], s = [{
        name: "ensureLogsBaseSchema",
        run: () => e.ensureLogsBaseSchema(t)
      }, {
        name: "ensureStatsHourlySchema",
        run: () => e.ensureStatsHourlySchema(t)
      }], i = a === "runtime-core" ? n : a === "logs-fts" ? [
        ...n,
        ...s,
        {
          name: "ensureLogsFtsSchema",
          run: () => e.ensureLogsFtsSchema(t)
        }
      ] : [...n, ...s], c = [];
      let l = {
        migratedRows: 0,
        droppedTriggers: 0,
        rebuilt: !1,
        recreated: !1
      };
      for (const u of i) {
        const d = await u.run();
        u.name === "ensureLogsFtsSchema" && $(d) && (l = {
          migratedRows: Math.max(0, Number(d.migratedRows) || 0),
          droppedTriggers: Math.max(0, Number(d.droppedTriggers) || 0),
          rebuilt: d.rebuilt === !0,
          recreated: d.recreated === !0
        }), c.push({
          name: u.name,
          ready: u.name === "ensureLogsFtsSchema" ? await e.isLogsFtsReady(t) : d === !0
        });
      }
      return te.LogsReadinessProbeCache.delete(t), {
        profile: a,
        runtimeTablesReady: n.every((u) => c.some((d) => d.name === u.name && d.ready === !0)),
        schemaReady: await e.hasLogsBaseTable(t),
        statsReady: await e.hasStatsHourlyTable(t),
        ftsReady: await e.isLogsFtsReady(t),
        ftsResult: l,
        steps: c
      };
    }
  };
}
function qg(o = {}, e = {}) {
  return {
    ...Wg(o, e),
    ...Gg(o, e),
    ...jg(o, e),
    ...Vg(o, e)
  };
}
function Xg() {
  const o = {
    createSummary(e = {}, t = "manual", r = {}) {
      return {
        ...e.summary,
        mode: t,
        deletedExpiredLogCount: 0,
        deletedExpiredLockCount: 0,
        deletedExpiredFetchCacheCount: 0,
        deletedExpiredProbeCacheCount: 0,
        deletedExpiredAuthFailureCount: 0,
        deletedExpiredDashboardCacheCount: 0,
        deletedExpiredRuntimeCacheCount: 0,
        deletedExpiredStatsHourlyCount: 0,
        rebuiltStatsHourly: !1,
        rebuiltLogsFts: !1,
        alignedStatsWindow: !1,
        optimizedDb: !1,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        statsAlignStatus: r.alignStatsWindow ? "pending" : "skipped",
        statsAlignError: "",
        statsRebuildStatus: r.rebuildStatsHourly ? "pending" : "skipped",
        statsRebuildError: "",
        ftsRebuildStatus: r.rebuildLogsFts ? "pending" : r.rebuildLogsFtsDeferred ? "deferred" : "skipped",
        ftsRebuildRecovered: !1,
        ftsRebuildError: "",
        optimizeStatus: r.optimizeDb ? "pending" : r.optimizeDbDeferred ? "deferred" : "skipped",
        optimizeError: "",
        status: t === "scheduled" ? "skipped" : "success",
        reason: ""
      };
    },
    buildDeleteScopes(e, t = {}, r = {}, a) {
      return [
        [
          r.deleteExpiredLogs,
          "proxy_logs",
          "deletedExpiredLogCount",
          "deleteExpiredLogs",
          e.LOGS_TABLE,
          "timestamp < ?",
          [t.retentionCutoffMs]
        ],
        [
          r.deleteExpiredLocks,
          "sys_locks",
          "deletedExpiredLockCount",
          "deleteExpiredLocks",
          e.SCHEDULED_LOCKS_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredFetchCache,
          "dns_ip_pool_fetch_cache",
          "deletedExpiredFetchCacheCount",
          "deleteExpiredFetchCache",
          e.DNS_IP_POOL_FETCH_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredProbeCache,
          "dns_ip_probe_cache",
          "deletedExpiredProbeCacheCount",
          "deleteExpiredProbeCache",
          e.DNS_IP_PROBE_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredAuthFailures,
          "auth_failures",
          "deletedExpiredAuthFailureCount",
          "deleteExpiredAuthFailures",
          e.AUTH_FAILURES_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredDashboardCache,
          "cf_dashboard_cache",
          "deletedExpiredDashboardCacheCount",
          "deleteExpiredDashboardCache",
          e.CF_DASH_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredRuntimeCache,
          "cf_runtime_cache",
          "deletedExpiredRuntimeCacheCount",
          "deleteExpiredRuntimeCache",
          e.CF_RUNTIME_CACHE_TABLE,
          "expires_at <= ?",
          [t.nowMs]
        ],
        [
          r.deleteExpiredStatsHourly,
          "proxy_stats_hourly",
          "deletedExpiredStatsHourlyCount",
          "deleteExpiredStatsHourly",
          e.STATS_HOURLY_TABLE,
          "bucket_date < ?",
          [t.statsRetentionBoundaryDate]
        ]
      ].filter(([n]) => n === !0).map(([, n, s, i, c, l, u]) => ({
        key: n,
        summaryKey: s,
        stepName: i,
        tableName: c,
        whereClause: l,
        bindParams: u,
        db: a
      }));
    },
    readChanges(e) {
      const t = Number(e?.meta?.changes ?? e?.changes ?? 0);
      return Number.isFinite(t) ? Math.max(0, Math.floor(t)) : 0;
    },
    async hasScopeRows(e) {
      return !!await e.db.prepare(`SELECT 1 AS present FROM ${e.tableName} WHERE ${e.whereClause} LIMIT 1`).bind(...e.bindParams).first();
    },
    async runBudgetedDeleteScopes(e = [], t = {}, r = async (n) => {
    }, a = {}) {
      const n = Number(a.startedAt) || H();
      let s = 0, i = "", c = [...e];
      for (; c.length > 0 && !i; ) {
        const d = [];
        for (const f of c) {
          if (s >= xa) {
            i = "row_limit";
            break;
          }
          if (H() - n >= Mr) {
            i = "time_limit";
            break;
          }
          await r(f.stepName);
          const m = Math.min(ns, xa - s), p = await f.db.prepare(`DELETE FROM ${f.tableName} WHERE rowid IN (SELECT rowid FROM ${f.tableName} WHERE ${f.whereClause} ORDER BY rowid LIMIT ?)`).bind(...f.bindParams, m).run(), h = o.readChanges(p);
          s += h, t[f.summaryKey] = Math.max(0, Number(t[f.summaryKey]) || 0) + h, h >= m && d.push(f);
        }
        c = d;
      }
      const l = [];
      for (const d of e) await o.hasScopeRows(d) && l.push(d.key);
      const u = Math.max(0, H() - n);
      return !i && l.length > 0 && (i = u >= Mr ? "time_limit" : s >= xa ? "row_limit" : ""), {
        hasMore: l.length > 0,
        remainingScopes: l,
        budget: {
          batchSize: ns,
          rowLimit: xa,
          timeLimitMs: Mr,
          processedRows: s,
          durationMs: u,
          exhaustedBy: i || null
        }
      };
    },
    async patchLogStatus(e, t, r, a, n, s, i = {}) {
      const c = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), l = String(a?.mode || i.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", u = {
        schemaReady: !0,
        ftsReady: !0,
        statsReady: !0,
        categoryEnabled: !0
      };
      return (s.rebuildStatsHourly !== !0 || n.alignedStatsWindow === !0) && (u.statsUtcOffsetMinutes = a.statsUtcOffsetMinutes ?? a.utcOffsetMinutes), (n.rebuiltStatsHourly === !0 || n.alignedStatsWindow === !0) && (u.statsAlignedAt = c, u.statsAlignedWindowStartAt = new Date((l === "scheduled" ? a.statsStartTs : a.retentionCutoffMs) || a.retentionCutoffMs).toISOString(), u.statsAlignedWindowEndAt = new Date((l === "scheduled" ? a.statsEndTs : a.nowMs) || a.nowMs).toISOString()), l === "scheduled" && s.deleteExpiredLogs === !0 && Number(n.deletedExpiredLogCount) > 0 ? await e.bumpLogsRevision(r, u, i.ctx).catch(() => {
      }) : await pe(e.patchOpsStatus(r, { log: u }, i.ctx), "d1_tidy.patch_log_status", { mode: l }, null), c;
    }
  };
  return o;
}
function Yg() {
  return {
    async readBoundedCount(o, e, t = "", r = []) {
      const a = String(t || "").trim(), n = `SELECT COUNT(*) AS total FROM (SELECT 1 FROM ${e}${a ? ` WHERE ${a}` : ""} LIMIT ${Oa + 1})`, s = await o.prepare(n).bind(...r).first(), i = Math.max(0, Number(s?.total ?? s?.count) || 0);
      return {
        count: Math.min(Oa, i),
        countIsLowerBound: i >= Oa,
        exceedsLimit: i > Oa
      };
    },
    buildContext(o = {}, e = {}) {
      const t = String(e.mode || "manual").trim().toLowerCase() === "scheduled" ? "scheduled" : "manual", r = nt(e.maintenanceMode, t), a = e.scheduledNow instanceof Date ? new Date(e.scheduledNow.getTime()) : new Date(e.scheduledNow || H()), n = Number(e.nowMs) || (t === "scheduled" ? a.getTime() : H()), s = le(o.logRetentionDays, F.Defaults.LogRetentionDays, 1, F.Defaults.LogRetentionDaysMax), i = Math.max(0, n - s * 24 * 60 * 60 * 1e3), c = Oe(o.scheduleUtcOffsetMinutes), l = $(e.dayWindow) ? e.dayWindow : st(a, o.scheduleUtcOffsetMinutes);
      return {
        mode: t,
        maintenanceMode: r,
        runtimeConfig: o,
        scheduledNow: a,
        nowTimestamp: n,
        retentionDays: s,
        retentionCutoffMs: i,
        utcOffsetMinutes: c,
        dayWindow: l,
        statsBucketDate: String(e.statsBucketDate || l?.dateKey || "").trim(),
        statsStartTs: Number(e.statsStartTs ?? l?.startTs) || 0,
        statsEndTs: Number(e.statsEndTs ?? l?.endTs) || 0,
        statsUtcOffsetMinutes: Oe(e.statsUtcOffsetMinutes ?? l?.utcOffsetMinutes ?? o.scheduleUtcOffsetMinutes),
        previousScheduledState: $(e.previousScheduledState) ? e.previousScheduledState : {},
        previousD1State: null,
        lastFtsRebuildAt: "",
        lastOptimizeAt: ""
      };
    },
    attachPreviousState(o, e, t = null) {
      const r = o.getPreviousD1TidyState(e.previousScheduledState, t), a = typeof r.lastFtsRebuildAt == "string" ? r.lastFtsRebuildAt : "", n = typeof r.lastOptimizeAt == "string" ? r.lastOptimizeAt : "";
      return {
        ...e,
        previousD1State: r,
        lastFtsRebuildAt: a,
        lastOptimizeAt: n || (typeof r.lastVacuumAt == "string" ? r.lastVacuumAt : "")
      };
    },
    async readFacts(o, e, t, r) {
      const a = await this.readBoundedCount(e, o.LOGS_TABLE, "timestamp < ?", [r.retentionCutoffMs]), n = await this.readBoundedCount(e, o.LOGS_TABLE, "timestamp >= ?", [r.retentionCutoffMs]), s = await this.readBoundedCount(e, o.SCHEDULED_LOCKS_TABLE, "expires_at <= ?", [r.nowTimestamp]), i = await this.readBoundedCount(e, o.DNS_IP_POOL_FETCH_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), c = await this.readBoundedCount(e, o.DNS_IP_PROBE_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), l = await this.readBoundedCount(e, o.AUTH_FAILURES_TABLE, "expires_at <= ?", [r.nowTimestamp]), u = await this.readBoundedCount(e, o.CF_DASH_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), d = await this.readBoundedCount(e, o.CF_RUNTIME_CACHE_TABLE, "expires_at <= ?", [r.nowTimestamp]), f = await this.readBoundedCount(e, o.STATS_HOURLY_TABLE), m = ot(r.retentionCutoffMs, r.utcOffsetMinutes).dateKey, p = await this.readBoundedCount(e, o.STATS_HOURLY_TABLE, "bucket_date < ?", [m]), h = await this.readBoundedCount(e, o.DNS_IP_POOL_ITEMS_TABLE), g = await this.readBoundedCount(e, o.DNS_IP_POOL_SOURCES_TABLE), y = await this.readBoundedCount(e, o.SYS_STATUS_TABLE), _ = await o.getOpsStatusSection({
        db: e,
        kv: t
      }, "log");
      return {
        deletedExpiredLogCount: a.count,
        preservedLogCount: n.count,
        preservedLogCountExceedsLimit: n.exceedsLimit,
        deletedExpiredLockCount: s.count,
        deletedExpiredFetchCacheCount: i.count,
        deletedExpiredProbeCacheCount: c.count,
        deletedExpiredAuthFailureCount: l.count,
        deletedExpiredDashboardCacheCount: u.count,
        deletedExpiredRuntimeCacheCount: d.count,
        deletedExpiredStatsHourlyCount: p.count,
        statsRetentionBoundaryDate: m,
        statsHourlyRowCount: f.count,
        dnsIpPoolItemCount: h.count,
        dnsIpPoolSourceCount: g.count,
        sysStatusCount: y.count,
        statsUtcOffsetMinutes: o.getStatsUtcOffsetMinutesFromStatus(_),
        countLowerBounds: {
          proxy_logs: a.countIsLowerBound,
          proxy_logs_retained: n.countIsLowerBound,
          proxy_logs_fts: n.countIsLowerBound,
          sys_locks: s.countIsLowerBound,
          dns_ip_pool_fetch_cache: i.countIsLowerBound,
          dns_ip_probe_cache: c.countIsLowerBound,
          auth_failures: l.countIsLowerBound,
          cf_dashboard_cache: u.countIsLowerBound,
          cf_runtime_cache: d.countIsLowerBound,
          proxy_stats_hourly: f.countIsLowerBound || p.countIsLowerBound,
          dns_ip_pool_items: h.countIsLowerBound,
          sys_status: y.countIsLowerBound
        },
        ftsReady: r.schemaStatus?.schemaReady === !0 || await o.isLogsFtsReady(e),
        d1DnsIpPoolSources: await o.getDnsIpPoolSourcesFromDb(e, { schemaReady: r.schemaStatus?.schemaReady === !0 }),
        kvDnsIpPoolSources: []
      };
    },
    buildSourcePolicy(o = []) {
      return {
        dnsIpPoolSourceAction: Array.isArray(o) && o.length > 0 ? "preserve_d1_primary" : "noop",
        skipDnsIpPoolSourceCleanup: !0
      };
    },
    buildFlags(o, e, t, r) {
      const a = t.deletedExpiredLogCount > 0, n = qf(e.maintenanceMode, e.mode), s = o.shouldRunLogsFtsRebuild(e.lastFtsRebuildAt, { nowMs: e.nowTimestamp }), i = (!t.ftsReady || n || a) && s, c = t.preservedLogCount > Bu || t.preservedLogCountExceedsLimit === !0, l = i && !c, u = n ? !0 : a && o.shouldRunLogsOptimize(e.lastOptimizeAt, { nowMs: e.nowTimestamp }), d = n || t.statsUtcOffsetMinutes !== e.utcOffsetMinutes;
      return {
        deleteExpiredLogs: a,
        deleteExpiredLocks: t.deletedExpiredLockCount > 0,
        deleteExpiredFetchCache: t.deletedExpiredFetchCacheCount > 0,
        deleteExpiredProbeCache: t.deletedExpiredProbeCacheCount > 0,
        deleteExpiredAuthFailures: t.deletedExpiredAuthFailureCount > 0,
        deleteExpiredDashboardCache: t.deletedExpiredDashboardCacheCount > 0,
        deleteExpiredRuntimeCache: t.deletedExpiredRuntimeCacheCount > 0,
        deleteExpiredStatsHourly: t.deletedExpiredStatsHourlyCount > 0,
        rebuildStatsHourly: d,
        rebuildLogsFts: l,
        rebuildLogsFtsDeferred: i && !l,
        ftsRebuildDeferredReason: c ? "deferred_size_guard" : "",
        rebuildLogsFtsForceRecreate: !1,
        optimizeDb: u,
        optimizeDbDeferred: e.mode === "scheduled" && a && u !== !0,
        alignStatsWindow: d,
        rebuildDailyStats: !1,
        processDnsIpPoolSources: !1
      };
    },
    buildPreview(o, e, t, r) {
      const a = [], n = sf(e.d1DnsIpPoolSources);
      be(a, e.deletedExpiredLogCount > 0, "proxy_logs", "超保留期 proxy_logs 日志", [], e.deletedExpiredLogCount, `只会删除早于 ${new Date(o.retentionCutoffMs).toISOString()} 的日志。`), be(a, e.deletedExpiredLockCount > 0, "sys_locks", "过期 sys_locks 定时租约", [], e.deletedExpiredLockCount, "只会删除 expires_at 已过期的租约记录。"), be(a, e.deletedExpiredFetchCacheCount > 0, "dns_ip_pool_fetch_cache", "过期 dns_ip_pool_fetch_cache 聚合缓存", [], e.deletedExpiredFetchCacheCount, "只会删除 expires_at 已过期的 API 抓取聚合缓存。"), be(a, e.deletedExpiredProbeCacheCount > 0, "dns_ip_probe_cache", "过期 dns_ip_probe_cache 探测缓存", [], e.deletedExpiredProbeCacheCount, "只会删除 expires_at 已过期的探测缓存。"), be(a, e.deletedExpiredAuthFailureCount > 0, "auth_failures", "过期 auth_failures 登录失败计数", [], e.deletedExpiredAuthFailureCount, "只会删除 expires_at 已过期的登录失败计数。"), be(a, e.deletedExpiredDashboardCacheCount > 0, "cf_dashboard_cache", "过期 cf_dashboard_cache 仪表盘缓存", [], e.deletedExpiredDashboardCacheCount, "只会删除 expires_at 已过期的仪表盘缓存。"), be(a, e.deletedExpiredRuntimeCacheCount > 0, "cf_runtime_cache", "过期 cf_runtime_cache 运行缓存", [], e.deletedExpiredRuntimeCacheCount, "只会删除 expires_at 已过期的运行缓存。"), be(a, e.deletedExpiredStatsHourlyCount > 0, "proxy_stats_hourly_expired", "过期 proxy_stats_hourly 日期桶", [], e.deletedExpiredStatsHourlyCount, `只删除早于边界日 ${e.statsRetentionBoundaryDate} 的统计桶。`);
      const s = [
        ft("proxy_stats_hourly", "proxy_stats_hourly 统计表", [], {
          count: Math.max(1, e.statsHourlyRowCount),
          note: r.rebuildStatsHourly ? `会清空当前统计（当前行数 ${e.statsHourlyRowCount}），并从后续新日志重新累计，不扫描历史日志。` : `保留当前统计，仅分页删除保留期边界前的日期桶（当前行数 ${e.statsHourlyRowCount}）。`
        }),
        ft("proxy_logs_fts", "proxy_logs_fts 全文索引", [], {
          count: Math.max(1, e.preservedLogCount),
          note: r.ftsRebuildDeferredReason === "deferred_size_guard" ? "基础日志超过 10000 行，本轮不会自动 rebuild。" : e.ftsReady ? "仅在无清理积压、预算有余量且满足最小间隔时重建。" : "当前未检测到 FTS 表，整理时会按资源预算决定是否补建。"
        }),
        ft("scheduled_d1_tidy", "scheduled.d1Tidy 运行状态", ["scheduled.d1Tidy"], {
          count: 1,
          note: "整理完成后会写入一份新的运行状态摘要。"
        })
      ], i = [
        ft("proxy_logs_retained", "保留期内 proxy_logs 日志", [], {
          count: e.preservedLogCount,
          note: `会保留最近 ${o.retentionDays} 天的日志。`
        }),
        ft("dns_ip_pool_items", "dns_ip_pool_items 共享 IP 池", [], {
          count: e.dnsIpPoolItemCount,
          note: "不会删除 dns_ip_pool_items。"
        }),
        ft("sys_status", "sys_status 运行状态", [], {
          count: e.sysStatusCount,
          note: "不会删除 sys_status 中的有效运行状态。"
        })
      ];
      be(i, e.d1DnsIpPoolSources.length > 0, "dns_ip_pool_sources_d1_primary", "dns_ip_pool_sources 主数据", n, e.d1DnsIpPoolSources.length, "dns_ip_pool_sources 现在是正式主数据，本次不会迁回 KV，也不会清空该表。");
      const c = { proxy_stats_hourly_expired: "proxy_stats_hourly" };
      for (const d of [
        ...a,
        ...s,
        ...i
      ]) {
        const f = c[d.key] || d.key;
        e.countLowerBounds?.[f] === !0 && (d.countIsLowerBound = !0);
      }
      const l = [], u = Math.max(0, Number(o.logQueuePendingCount) || 0);
      return u > 0 && l.push(`执行前会先尝试 flush ${u} 条内存日志，再开始清理 D1。`), l.push(o.maintenanceMode === "full" ? "当前为 full 维护模式；统计会清空后重新累计，FTS 与 optimize 仍受大小、积压、间隔和时间预算约束。" : "当前为 smart 维护模式，只在检测到必要条件且预算允许时执行较重的统计、FTS 与 optimize。"), a.length === 0 && l.push(o.mode === "scheduled" ? "当前定时 D1 维护没有检测到需要删除的旧数据，本轮会按计划检查统计与索引维护。" : "当前没有检测到需要删除的 D1 旧数据；本次主要会执行统计表与 FTS 维护。"), {
        scope: "d1",
        fieldGroups: [],
        deleteGroups: a,
        rewriteGroups: s,
        preserveGroups: i,
        warnings: l
      };
    },
    buildSummary(o, e, t, r = {}) {
      return {
        mode: o.mode,
        maintenanceMode: o.maintenanceMode,
        logRetentionDays: o.retentionDays,
        retentionCutoffAt: new Date(o.retentionCutoffMs).toISOString(),
        deletedExpiredLogCount: e.deletedExpiredLogCount,
        preservedLogCount: e.preservedLogCount,
        deletedExpiredLockCount: e.deletedExpiredLockCount,
        deletedExpiredFetchCacheCount: e.deletedExpiredFetchCacheCount,
        deletedExpiredProbeCacheCount: e.deletedExpiredProbeCacheCount,
        deletedExpiredAuthFailureCount: e.deletedExpiredAuthFailureCount,
        deletedExpiredDashboardCacheCount: e.deletedExpiredDashboardCacheCount,
        deletedExpiredRuntimeCacheCount: e.deletedExpiredRuntimeCacheCount,
        deletedExpiredStatsHourlyCount: e.deletedExpiredStatsHourlyCount,
        rebuiltStatsHourly: r.rebuildStatsHourly === !0,
        rebuiltLogsFts: r.rebuildLogsFts === !0,
        alignedStatsWindow: r.alignStatsWindow === !0,
        migratedDnsIpPoolSourcesToKvCount: 0,
        clearedLegacyDnsIpPoolSourcesCount: 0,
        preservedDnsIpPoolItemCount: e.dnsIpPoolItemCount,
        preservedDnsIpPoolSourceCount: e.dnsIpPoolSourceCount,
        preservedSysStatusCount: e.sysStatusCount,
        logQueuePendingCount: Math.max(0, Number(o.logQueuePendingCount) || 0),
        dnsIpPoolSourceAction: t.dnsIpPoolSourceAction,
        lastFtsRebuildAt: o.lastFtsRebuildAt,
        lastOptimizeAt: o.lastOptimizeAt
      };
    }
  };
}
var Jg = Object.freeze({
  PREFIX: "node:",
  CONFIG_KEY: "sys:theme",
  NODES_INDEX_KEY: "sys:nodes_index:v1",
  NODES_SUMMARY_INDEX_KEY: "sys:nodes_index_full:v2",
  ADMIN_INDEX_UPLOAD_PREFIX: Tu,
  ADMIN_ACTIVE_INDEX_KEY: Ru,
  LEGACY_OPS_STATUS_KEY: "sys:ops_status:v1",
  LEGACY_SCHEDULED_LOCK_KEY: "sys:scheduled_lock:v1",
  WORKER_PLACEMENT_REGION_OVERRIDE_PREFIX: "sys:worker_placement_region:v1:",
  CONFIG_SNAPSHOTS_KEY: "sys:config_snapshots:v1",
  CONFIG_META_KEY: "sys:config_meta:v1",
  CONFIG_SNAPSHOTS_META_KEY: "sys:config_snapshots_meta:v1",
  NODES_INDEX_META_KEY: "sys:nodes_index_meta:v1",
  LEGACY_DNS_IP_POOL_SOURCES_KEY: "sys:dns_ip_pool_sources:v1",
  DNS_RECORD_HISTORY_PREFIX: "sys:dns_record_history:v1:",
  LEGACY_TELEGRAM_ALERT_STATE_KEY: "sys:telegram_alert_state:v1",
  SYS_STATUS_TABLE: "sys_status",
  D1_SCHEMA_META_TABLE: "d1_schema_meta",
  SCHEDULED_LOCKS_TABLE: "sys_locks",
  SCHEDULED_LOCK_SCOPE: "scheduled",
  LOGS_TABLE: "proxy_logs",
  LOGS_FTS_TABLE: "proxy_logs_fts",
  LOGS_FTS_INSERT_TRIGGER: "proxy_logs_fts_ai",
  STATS_HOURLY_TABLE: "proxy_stats_hourly",
  AUTH_FAILURES_TABLE: "auth_failures",
  CF_DASH_CACHE_TABLE: "cf_dashboard_cache",
  CF_RUNTIME_CACHE_TABLE: "cf_runtime_cache",
  DNS_IP_POOL_ITEMS_TABLE: "dns_ip_pool_items",
  DNS_IP_POOL_SOURCES_TABLE: "dns_ip_pool_sources",
  DNS_IP_POOL_FETCH_CACHE_TABLE: "dns_ip_pool_fetch_cache",
  DNS_IP_PROBE_CACHE_TABLE: "dns_ip_probe_cache",
  OPS_STATUS_DB_SCOPE_ROOT: "ops_status:root",
  TELEGRAM_ALERT_STATE_DB_SCOPE: "telegram_alert_state",
  OPS_STATUS_SECTION_SCOPES: Object.freeze({
    log: "ops_status:log",
    scheduled: "ops_status:scheduled",
    dnsIpPool: "ops_status:dns_ip_pool"
  }),
  LEGACY_OPS_STATUS_SECTION_KEYS: Object.freeze({
    log: "sys:ops_status:log:v1",
    scheduled: "sys:ops_status:scheduled:v1",
    dnsIpPool: "sys:ops_status:dns_ip_pool:v1"
  })
});
function Qg(o = {}) {
  const { nodeRepository: e } = o;
  return {
    async getNodesList(t, r) {
      const a = e.getKV(t);
      if (!a) return [];
      const n = Se(a);
      if (n.NodesListCache && n.NodesListCache.exp > H()) return n.NodesListCache.data;
      const s = await e.getNodesSummaryIndex(a, { ctx: r });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKv(a, { ctx: r });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async getNodesListStrict(t, r) {
      const a = e.getKV(t);
      if (!a) return [];
      const n = Se(a);
      if (n.NodesListCache && n.NodesListCache.exp > H()) return n.NodesListCache.data;
      const s = await e.getNodesSummaryIndexStrict(a, { ctx: r });
      if (Array.isArray(s)) return s;
      const i = await e.rebuildNodeIndexesFromKvStrict(a, { ctx: r });
      return Array.isArray(i?.summaries) ? i.summaries : [];
    },
    async invalidateList(t, r = null) {
      const a = e.getKV(r), n = Se(a);
      n.NodesListCache = null, n.NodesIndexCache = null, cr(a);
    },
    maybeCleanup(t = null) {
      const r = t ? Se(e.getKV(t)) : yt.current(), a = H(), n = r.CleanupState;
      if (a - (n.lastRunAt || 0) < F.Defaults.CleanupMinIntervalMs) return;
      n.lastRunAt = a;
      const s = F.Defaults.CleanupBudgetMs, i = F.Defaults.CleanupChunkSize, c = n.iterators || (n.iterators = {
        node: null,
        playbackRoute: null,
        crypto: null,
        rate: null,
        log: null,
        playbackInfo: null,
        failover: null,
        progress: null,
        monthlyTraffic: null
      }), l = a, u = (d, f, m, p = c, h = (g) => d.delete(g)) => {
        let g = p[m];
        g || (g = d.entries(), p[m] = g);
        let y = 0;
        for (; y < i && (y === 0 || H() - l < s); ) {
          const _ = g.next();
          if (_.done) {
            p[m] = null;
            break;
          }
          y += 1;
          const [S, A] = _.value;
          d.has(S) && f(A, a) && h(S);
        }
      };
      if (n.phase === 0)
        u(r.NodeCache, (d) => d?.exp && d.exp < a, "node", r.CleanupIterators), n.phase = 1;
      else if (n.phase === 1)
        u(r.PlaybackRouteHotCache, (d) => !d || Number(d.expiresAt) <= a, "playbackRoute", r.CleanupIterators), n.phase = 2;
      else if (n.phase === 2)
        u(te.CryptoKeyCache, (d) => d?.exp && d.exp < a, "crypto"), n.phase = 3;
      else if (n.phase === 3)
        u(We.RateLimitCache, (d) => !d || d.resetAt < a, "rate"), n.phase = 4;
      else if (n.phase === 4) n.phase = 5;
      else if (n.phase === 5)
        u(te.PlaybackInfoResponseCache, (d) => !d || (Number(d.expiresAt) || 0) <= a || !ti(d, Ro), "playbackInfo", c), n.phase = 6;
      else if (n.phase === 6)
        u(te.ProxyFailoverStateCache, (d) => {
          if (!d || typeof d != "object") return !0;
          if (d.failingTargets instanceof Map)
            for (const [y, _] of d.failingTargets) Number(_) <= a && d.failingTargets.delete(y);
          const f = Number(d.preferredTargetExpiresAt) > a, m = d.failingTargets instanceof Map && d.failingTargets.size > 0, p = !!d.inFlightProbe && Number(d.inFlightProbe.expiresAt) > a, h = Number(d.lastProbeResult?.completedAt) || 0, g = !!d.lastProbeResult && h + F.Defaults.HedgePreferredTtlSec * 1e3 > a;
          return !f && !m && !p && !g;
        }, "failover"), n.phase = 7;
      else if (n.phase === 7) {
        const d = Math.max(3e4, Math.max(1, Number(F.Defaults.VideoProgressForwardIntervalSec) || 1) * 2e4);
        u(te.PlaybackProgressRelay, (f) => {
          if (!f || f.pendingSnapshot || f.activeFlushPromise) return !f;
          const m = Number(f.terminalTombstoneUntil) || 0;
          if (m > 0) return m < a;
          const p = Number(f.lastTouchedAt || f.lastForwardAt) || 0;
          return p > 0 && p + d <= a;
        }, "progress", c, tr), n.phase = 8;
      } else
        u(te.DashboardMonthlyTrafficCache, (d) => !d || (Number(d.staleUntil) || 0) <= a, "monthlyTraffic"), n.phase = 0;
    }
  };
}
function Zg(o = {}, e = {}) {
  return {
    normalizeNodeIndex(t = []) {
      return [...new Set((Array.isArray(t) ? t : []).map((r) => String(r || "").toLowerCase().trim()).filter(Boolean))];
    },
    normalizeNodeSummaryPayload(t, r = {}) {
      if (!$(r)) return null;
      const a = String(t || r.name || "").toLowerCase().trim();
      if (!a) return null;
      const n = e.normalizeLines(r.lines, r.target, r.port).slice(0, Bn);
      if (!n.length) return null;
      const s = e.resolveActiveLineId(r.activeLineId, n, Array.isArray(r.lines) ? r.lines : [], r.port), i = nr(r.entryMode);
      return {
        name: a,
        cacheRevision: ao(a, r),
        displayName: String(r.displayName ?? ""),
        entryMode: i,
        hostPrefixCnameTarget: i === "host_prefix" ? jt(r.hostPrefixCnameTarget) : "",
        secret: i === "host_prefix" ? "" : String(r.secret ?? ""),
        tag: $r(r.tags, r.tag)[0] || "",
        tags: $r(r.tags, r.tag),
        tagColor: String(r.tagColor ?? ""),
        remark: String(r.remark ?? ""),
        tmdbAggregationEnabled: r.tmdbAggregationEnabled === !0,
        lines: n.map((c) => ({
          id: String(c.id || "").trim(),
          name: String(c.name || "").trim(),
          target: String(c.target || "").trim()
        })),
        activeLineId: s,
        playbackInfoMode: Nr(r.playbackInfoMode),
        mediaAuthMode: Bt(r.mediaAuthMode),
        realClientIpMode: Dr(r.realClientIpMode),
        hedgeProbePath: ca(r.hedgeProbePath),
        routingDecisionMode: xr(r.routingDecisionMode),
        mainVideoStreamMode: cn(r.mainVideoStreamMode ?? r.wangpanDirectMode ?? r.wangpanMode)
      };
    },
    buildComparableNodeSummary(t = {}) {
      return e.normalizeNodeSummaryPayload(t?.name, t);
    },
    areNodeSummariesEquivalent(t = {}, r = {}) {
      return Z(e.buildComparableNodeSummary(t)) === Z(e.buildComparableNodeSummary(r));
    },
    hasLegacyNodeMirrorFields(t = {}) {
      return $(t) ? Object.prototype.hasOwnProperty.call(t, "headers") || Object.prototype.hasOwnProperty.call(t, "target") || Object.prototype.hasOwnProperty.call(t, "port") || Object.prototype.hasOwnProperty.call(t, "schemaVersion") || Object.prototype.hasOwnProperty.call(t, "createdAt") || Object.prototype.hasOwnProperty.call(t, "updatedAt") || Object.prototype.hasOwnProperty.call(t, "remarkColor") || Object.prototype.hasOwnProperty.call(t, "wangpanDirectMode") || Object.prototype.hasOwnProperty.call(t, "wangpanMode") || [...No, ...Io].some((r) => Object.prototype.hasOwnProperty.call(t, r)) ? !0 : (Array.isArray(t.lines) ? t.lines : []).some((r) => $(r) ? Object.prototype.hasOwnProperty.call(r, "port") || Object.prototype.hasOwnProperty.call(r, "latencyMs") || Object.prototype.hasOwnProperty.call(r, "latencyUpdatedAt") : !1) : !1;
    },
    summaryEntryRequiresNodeEntityRebuild(t = {}) {
      if (!$(t) || e.hasLegacyNodeMirrorFields(t)) return !0;
      const r = Array.isArray(t.lines) ? t.lines : [], a = e.normalizeLines(r, t.target, t.port);
      if (!a.length || r.length !== a.length) return !0;
      for (let n = 0; n < a.length; n += 1) {
        const s = r[n], i = a[n];
        if (!$(s) || !$(i) || String(s.target || "").trim() !== String(i.target || "").trim()) return !0;
      }
      return String(t.activeLineId || "").trim() !== e.resolveActiveLineId(t.activeLineId, a, r, t.port);
    },
    buildNodeSummary(t, r = {}, a = {}) {
      const n = String(t || r.name || "").toLowerCase().trim();
      if (!n || !$(r)) return {
        summary: null,
        changed: !1,
        legacyMirrorDetected: !1
      };
      const s = e.normalizeNode(n, r, a), i = e.normalizeNodeSummaryPayload(n, s.data);
      if (!i) return {
        summary: null,
        changed: !0,
        legacyMirrorDetected: e.hasLegacyNodeMirrorFields(r)
      };
      const c = e.normalizeNodeSummaryPayload(n, r), l = e.hasLegacyNodeMirrorFields(r);
      return {
        summary: i,
        changed: l || !e.areNodeSummariesEquivalent(c, i),
        legacyMirrorDetected: l
      };
    },
    normalizeNodeSummaryIndex(t = []) {
      const r = [], a = /* @__PURE__ */ new Set();
      let n = !1, s = !1, i = !1;
      for (const c of Array.isArray(t) ? t : []) {
        if (!$(c)) {
          n = !0, i = !0;
          continue;
        }
        const l = String(c.name || "").trim(), u = l.toLowerCase();
        if (!u || a.has(u)) {
          n = !0, i = !0;
          continue;
        }
        const { name: d, ...f } = c, m = e.buildNodeSummary(u, f);
        if (!m.summary) {
          n = !0, i = !0;
          continue;
        }
        (m.changed || l !== u) && (n = !0), m.legacyMirrorDetected && (s = !0), e.summaryEntryRequiresNodeEntityRebuild(f) && (i = !0), r.push(m.summary), a.add(u);
      }
      return {
        nodes: r,
        changed: n,
        legacyMirrorDetected: s,
        requiresRebuild: i
      };
    },
    primeNodeSummaryCaches(t = [], r = null) {
      const a = Se(r), n = Array.isArray(t) ? t.filter((i) => $(i) && i.name) : [], s = e.normalizeNodeIndex(n.map((i) => i.name));
      return a.NodesListCache = {
        data: n.map((i) => ({ ...i })),
        exp: H() + 6e4
      }, a.NodesIndexCache = {
        data: s,
        exp: H() + 6e4
      }, n;
    },
    async getNodesSummaryIndex(t, r = {}) {
      if (!t) return null;
      const a = Se(t);
      if (r.useCache !== !1 && a.NodesListCache?.exp > H() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const n = a.NodesRevisionCacheGeneration;
      let s = null;
      try {
        s = await t.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      } catch {
        return null;
      }
      if (a.NodesRevisionCacheGeneration !== n) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : null;
      if (!Array.isArray(s)) return null;
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKv(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i.nodes, t) : i.nodes;
    },
    async getNodesSummaryIndexStrict(t, r = {}) {
      if (!t) return null;
      const a = Se(t);
      if (r.useCache !== !1 && a.NodesListCache?.exp > H() && Array.isArray(a.NodesListCache.data)) return a.NodesListCache.data;
      const n = a.NodesRevisionCacheGeneration, s = await xe(t, e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (a.NodesRevisionCacheGeneration !== n) return Array.isArray(s) ? e.normalizeNodeSummaryIndex(s).nodes : [];
      if (!Array.isArray(s)) {
        const c = await e.rebuildNodeIndexesFromKvStrict(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      const i = e.normalizeNodeSummaryIndex(s);
      if (i.requiresRebuild === !0) {
        const c = await e.rebuildNodeIndexesFromKvStrict(t, { ctx: r.ctx });
        return Array.isArray(c?.summaries) ? c.summaries : [];
      }
      return a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i.nodes, t) : i.nodes;
    },
    async loadNodeSummariesForMutation(t, r = {}) {
      const a = await t.get(e.NODES_SUMMARY_INDEX_KEY, { type: "json" });
      if (Array.isArray(a)) {
        const n = e.normalizeNodeSummaryIndex(a);
        if (n.requiresRebuild !== !0) return n.nodes;
      }
      return (await e.loadAllNodeEntitiesFromKvStrict(t, { ctx: r.ctx })).map((n) => e.buildNodeSummary(n?.name, n).summary).filter(Boolean);
    },
    async commitNodesSummaryIndexMutation(t, r = {}) {
      const { kv: a, ctx: n, syncLegacyIndex: s = !1 } = r, i = e.normalizeNodeSummaryIndex(t).nodes, c = e.normalizeNodeIndex(i.map((h) => h.name)), l = e.buildNodesIndexMeta(c, i), u = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
        count: 0,
        indexHash: "",
        fullIndexHash: ""
      }), d = [];
      (u.fullIndexHash !== l.fullIndexHash || !u.revision) && d.push(a.put(e.NODES_SUMMARY_INDEX_KEY, JSON.stringify(i))), s !== !1 && (u.indexHash !== l.indexHash || !u.revision) && d.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
      const f = u.indexHash !== l.indexHash || u.fullIndexHash !== l.fullIndexHash || Number(u.count) !== Number(l.count) || !u.revision;
      if (d.length > 0) {
        const h = Promise.all(d);
        n && n.waitUntil(h), await h;
      }
      if (f) {
        const h = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(l));
        n && n.waitUntil(h), await h;
      }
      const m = e.primeNodeSummaryCaches(i, a), p = f ? l : u;
      return Ns(p.revision, a), {
        summaries: m,
        meta: p
      };
    },
    async persistNodesSummaryIndex(t, r = {}) {
      const { kv: a, ctx: n, syncLegacyIndex: s = !1 } = r, i = e.normalizeNodeSummaryIndex(t).nodes;
      if (!a) {
        const c = e.primeNodeSummaryCaches(i, a);
        return cr(a), c;
      }
      return await wr(async () => (await e.commitNodesSummaryIndexMutation(i, {
        kv: a,
        ctx: n,
        syncLegacyIndex: s
      })).summaries, a);
    },
    async listNodeEntityKeys(t) {
      return (await e.listKvKeys(t, { prefix: e.PREFIX })).map((r) => String(r || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async listNodeEntityKeysStrict(t) {
      return (await e.listKvKeysStrict(t, { prefix: e.PREFIX })).map((r) => String(r || "").replace(e.PREFIX, "").toLowerCase().trim()).filter(Boolean);
    },
    async loadAllNodeEntitiesFromKv(t, r = {}) {
      const { ctx: a } = r;
      return t ? (await Xr(await e.listNodeEntityKeys(t), F.Defaults.NodesReadConcurrency, async (n) => {
        try {
          const s = await t.get(`${e.PREFIX}${n}`, { type: "json" });
          if (!s) return null;
          const i = e.normalizeNode(n, s);
          if (i.changed && !Qe(n, i.data)) {
            const c = t.put(`${e.PREFIX}${n}`, JSON.stringify(i.data));
            a ? a.waitUntil(c) : await c;
          }
          return {
            name: n,
            ...i.data
          };
        } catch {
          return null;
        }
      })).filter(Boolean) : [];
    },
    async loadAllNodeEntitiesFromKvStrict(t, r = {}) {
      return t ? (await Xr(await e.listNodeEntityKeysStrict(t), F.Defaults.NodesReadConcurrency, async (a) => {
        const n = await xe(t, `${e.PREFIX}${a}`, { type: "json" });
        return n ? {
          name: a,
          ...e.normalizeNode(a, n).data
        } : null;
      })).filter(Boolean) : [];
    },
    async rebuildNodeIndexesFromKv(t, r = {}) {
      const { ctx: a, syncLegacyIndex: n = !1 } = r;
      return t ? await wr(async () => {
        const s = await e.loadAllNodeEntitiesFromKvStrict(t, { ctx: a }), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = await e.commitNodesSummaryIndexMutation(i, {
          kv: t,
          ctx: a,
          syncLegacyIndex: n
        });
        return {
          index: e.normalizeNodeIndex(c.summaries.map((l) => l?.name)),
          summaries: c.summaries,
          nodes: s
        };
      }, t) : {
        index: [],
        summaries: [],
        nodes: []
      };
    },
    async rebuildNodeIndexesFromKvStrict(t, r = {}) {
      if (!t) return {
        index: [],
        summaries: [],
        nodes: []
      };
      const a = Se(t), n = a.NodesRevisionCacheGeneration, s = await e.loadAllNodeEntitiesFromKvStrict(t, r), i = s.map((l) => e.buildNodeSummary(l?.name, l).summary).filter(Boolean), c = a.NodesRevisionCacheGeneration === n ? e.primeNodeSummaryCaches(i, t) : i;
      return {
        index: e.normalizeNodeIndex(c.map((l) => l?.name)),
        summaries: c,
        nodes: s
      };
    },
    async upsertNodeSummaryEntry(t, r, a = {}) {
      const { kv: n, ctx: s } = a;
      if (!n) return null;
      const i = String(t || "").toLowerCase().trim();
      if (!i || Qe(i, r)) return null;
      const c = e.buildNodeSummary(i, r).summary;
      if (!c) return null;
      const l = Se(n), u = l.NodesListCache?.exp > H() && Array.isArray(l.NodesListCache.data) ? l.NodesListCache.data.find((d) => String(d?.name || "").toLowerCase().trim() === i) : null;
      return u && e.areNodeSummariesEquivalent(u, c) ? u : await wr(async () => {
        const d = await e.loadNodeSummariesForMutation(n, { ctx: s });
        let f = !1;
        const m = d.map((p) => String(p?.name || "").toLowerCase().trim() !== i ? p : (f = !0, e.areNodeSummariesEquivalent(p, c) ? p : c));
        return f || m.push(c), (await e.commitNodesSummaryIndexMutation(m, {
          kv: n,
          ctx: s
        })).summaries.find((p) => String(p?.name || "").toLowerCase().trim() === i) || c;
      }, n);
    },
    async removeNodeSummaryEntry(t, r = {}) {
      const { kv: a, ctx: n } = r;
      if (!a) return [];
      const s = String(t || "").toLowerCase().trim();
      return await wr(async () => {
        const i = (await e.loadNodeSummariesForMutation(a, { ctx: n })).filter((c) => String(c?.name || "").toLowerCase().trim() !== s);
        return (await e.commitNodesSummaryIndexMutation(i, {
          kv: a,
          ctx: n
        })).summaries;
      }, a);
    },
    async getNodesIndex(t) {
      if (!t) return [];
      const r = Se(t);
      if (r.NodesIndexCache?.exp > H() && Array.isArray(r.NodesIndexCache.data)) return [...r.NodesIndexCache.data];
      if (r.NodesListCache?.exp > H() && Array.isArray(r.NodesListCache.data)) {
        const s = e.normalizeNodeIndex(r.NodesListCache.data.map((i) => i?.name));
        return r.NodesIndexCache = {
          data: s,
          exp: H() + 6e4
        }, [...s];
      }
      const a = r.NodesRevisionCacheGeneration, n = e.normalizeNodeIndex(await t.get(e.NODES_INDEX_KEY, { type: "json" }) || []);
      if (r.NodesRevisionCacheGeneration !== a) return [...n];
      if (!n.length) {
        const s = await e.rebuildNodeIndexesFromKv(t);
        return [...e.normalizeNodeIndex(s.index)];
      }
      return r.NodesRevisionCacheGeneration === a && (r.NodesIndexCache = {
        data: n,
        exp: H() + 6e4
      }), [...n];
    },
    buildPlaybackRouteHotSignature(t, r = {}) {
      const a = String(t || "").toLowerCase().trim(), n = ne(Z(e.getOrderedNodeLines(r).map((s) => String(s?.target || "").trim()).filter(Boolean)));
      return {
        cacheKey: `${a}:${String(r?.activeLineId || "").trim()}:${n}`,
        orderedTargetSignature: n
      };
    },
    buildPlaybackRouteHotSnapshot(t, r = {}, a = {}) {
      const n = String(t || "").toLowerCase().trim();
      if (!n || !$(r) || Qe(n, r)) return null;
      const s = e.getOrderedNodeLines(r), i = (s.length ? s.map((m) => m?.target) : String(r.target || "").split(",").map((m) => m.trim()).filter(Boolean)).map((m) => pn(m)).filter(Ze);
      if (!i.length) return null;
      const c = Array.isArray(r.lines) ? r.lines.map((m) => $(m) ? { ...m } : m) : [], l = $(r.headers) ? { ...r.headers } : {}, u = {
        ...r,
        lines: c,
        headers: l
      }, { cacheKey: d, orderedTargetSignature: f } = e.buildPlaybackRouteHotSignature(n, u);
      return {
        nodeName: n,
        cacheKey: d,
        expiresAt: H() + Fu,
        nodesRevision: String(a.nodesRevision || "").trim(),
        nodeCacheRevision: ao(n, u),
        orderedTargetSignature: f,
        secret: String(u.secret || "").trim(),
        headers: l,
        lines: c,
        activeLineId: String(u.activeLineId || "").trim(),
        mainVideoStreamMode: Hr(u),
        playbackInfoMode: Nr(u.playbackInfoMode),
        mediaAuthMode: Bt(u.mediaAuthMode),
        realClientIpMode: Dr(u.realClientIpMode),
        routingDecisionMode: xr(u.routingDecisionMode),
        targetRecords: i,
        nodeData: u
      };
    },
    getPlaybackRouteHotSnapshot(t, r = null) {
      const a = String(t || "").toLowerCase().trim();
      if (!a) return null;
      const n = Se(r ? e.getKV(r) : null).PlaybackRouteHotCache, s = n.get(a);
      return s ? Number(s.expiresAt) <= H() ? (n.delete(a), null) : (Za(n, a), s) : null;
    },
    async getVerifiedPlaybackRouteHotSnapshot(t, r) {
      const a = e.getKV(r), n = Se(a), s = Pe(t, n), i = e.getPlaybackRouteHotSnapshot(t, r);
      if (!i) return null;
      if (!a) return i;
      const c = await e.getNodesRevision(a);
      return Pe(t, n) !== s ? null : !i.nodesRevision || !c || i.nodesRevision === c ? i : (e.invalidatePlaybackRouteHotCache(t, r), null);
    },
    setPlaybackRouteHotSnapshot(t, r = {}, a = {}, n = null) {
      const s = e.buildPlaybackRouteHotSnapshot(t, r, a);
      return s ? (Ie(Se(n ? e.getKV(n) : null).PlaybackRouteHotCache, s.nodeName, s, sr), s) : null;
    },
    async primePlaybackRouteHotSnapshot(t, r = {}, a) {
      const n = e.getKV(a), s = Se(n), i = Pe(t, s), c = n ? await e.getNodesRevision(n) : "";
      return Pe(t, s) !== i ? null : e.setPlaybackRouteHotSnapshot(t, r, { nodesRevision: c }, a);
    },
    invalidatePlaybackRouteHotCache(t = [], r = null) {
      const a = Se(r ? e.getKV(r) : null).PlaybackRouteHotCache;
      for (const n of Array.isArray(t) ? t : [t]) {
        const s = String(n || "").toLowerCase().trim();
        s && a.delete(s);
      }
    },
    invalidateNodeCaches(t = [], r = {}) {
      const a = r.kv || (r.env ? e.getKV(r.env) : null), n = Se(a), s = [];
      for (const i of Array.isArray(t) ? t : [t]) {
        const c = String(i || "").toLowerCase().trim();
        c && (s.push(c), n.NodeCache.delete(c), n.PlaybackRouteHotCache.delete(c));
      }
      s.length > 0 && (Vm(s, n), al(s), nl(s)), r.invalidateList && (n.NodesListCache = null, n.NodesIndexCache = null, cr(a));
    },
    async persistNodesIndex(t, r = {}) {
      const { kv: a, ctx: n, invalidateList: s = !1 } = r, i = Se(a), c = e.normalizeNodeIndex(t);
      return s && (i.NodesListCache = null), a ? await wr(async () => {
        const l = await e.readRevisionMeta(a, e.NODES_INDEX_META_KEY, {
          count: 0,
          indexHash: "",
          fullIndexHash: ""
        }), u = ne(Z(c)), d = l.indexHash === u && l.revision ? l.updatedAt : /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(), f = {
          ...l,
          updatedAt: d,
          revision: l.indexHash === u && l.revision ? l.revision : Ht(ne(`${u}:${l.fullIndexHash || ""}:${c.length}`), d),
          hash: l.hash || "",
          count: c.length,
          indexHash: u,
          fullIndexHash: String(l.fullIndexHash || "")
        }, m = [];
        (l.indexHash !== u || !l.revision) && m.push(a.put(e.NODES_INDEX_KEY, JSON.stringify(c)));
        const p = l.indexHash !== u || Number(l.count) !== c.length || !l.revision;
        if (m.length > 0) {
          const h = Promise.all(m);
          n && n.waitUntil(h), await h;
        }
        if (p) {
          const h = a.put(e.NODES_INDEX_META_KEY, JSON.stringify(f));
          n && n.waitUntil(h), await h;
        }
        return i.NodesIndexCache = {
          data: c,
          exp: H() + 6e4
        }, Ns(f.revision, a), c;
      }, a) : (i.NodesIndexCache = {
        data: c,
        exp: H() + 6e4
      }, cr(a), c);
    }
  };
}
function eh(o = {}, e = {}) {
  return {
    getDnsRecordHistoryKey(t, r) {
      const a = encodeURIComponent(String(t || "").trim() || "default"), n = encodeURIComponent(String(r || "").trim() || "unknown");
      return `${e.DNS_RECORD_HISTORY_PREFIX}${a}:${n}`;
    },
    getDnsHostHistoryRecordId(t) {
      return `host:${re(t) || "unknown"}`;
    },
    normalizeDnsHistoryValueKey(t, r) {
      return `${String(t || "").trim().toUpperCase()}::${String(r || "").trim().toLowerCase()}`;
    },
    normalizeDnsRecordHistoryEntry(t = {}) {
      const r = t && typeof t == "object" ? t : {}, a = String(r.type || "").trim().toUpperCase(), n = String(r.content || "").trim(), s = String(r.savedAt || r.updatedAt || r.createdAt || "").trim(), i = s ? new Date(s) : null, c = i && !Number.isNaN(i.getTime()) ? i.toISOString() : "", l = String(r.name || "").trim(), u = String(r.actor || "admin").trim() || "admin", d = String(r.source || "ui").trim() || "ui", f = re(r.requestHost), m = [
        a,
        n.toLowerCase(),
        l.toLowerCase(),
        f,
        c || s,
        d.toLowerCase()
      ].join("|");
      return {
        id: String(r.id || `dns-hist-${ne(m || "empty")}`),
        name: l,
        type: a,
        content: n,
        savedAt: c,
        actor: u,
        source: d,
        requestHost: f,
        preferredFallback: r.preferredFallback === !0
      };
    },
    normalizeDnsRecordHistory(t = []) {
      const r = [], a = /* @__PURE__ */ new Map();
      for (const s of Array.isArray(t) ? t : []) {
        const i = e.normalizeDnsRecordHistoryEntry(s);
        if (i.type !== "CNAME" || !i.content) continue;
        const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = a.get(c);
        if (Number.isInteger(l) && l >= 0) {
          i.preferredFallback === !0 && r[l] && (r[l].preferredFallback = !0);
          continue;
        }
        if (a.set(c, r.length), r.push(i), r.length >= F.Defaults.DnsHistoryLimit) break;
      }
      let n = !1;
      for (const s of r)
        if (s.preferredFallback === !0) {
          if (n) {
            s.preferredFallback = !1;
            continue;
          }
          n = !0;
        }
      return r;
    },
    async getDnsRecordHistory(t, r, a) {
      if (!t || !r || !a) return [];
      try {
        const n = await t.get(e.getDnsRecordHistoryKey(r, a), { type: "json" });
        return e.normalizeDnsRecordHistory(n);
      } catch {
        return [];
      }
    },
    async getDnsRecordHistoryForMutation(t, r, a) {
      if (!t || !r || !a) return [];
      const n = await t.get(e.getDnsRecordHistoryKey(r, a), { type: "json" });
      return e.normalizeDnsRecordHistory(n);
    },
    async persistDnsRecordHistory(t, r, a, n) {
      if (!t || !r || !a) return [];
      const s = e.normalizeDnsRecordHistory(n);
      return await t.put(e.getDnsRecordHistoryKey(r, a), JSON.stringify(s)), s;
    },
    async recordDnsRecordHistory(t, r, a, n = {}) {
      if (!t || !r || !a) return [];
      const s = await e.getDnsRecordHistoryForMutation(t, r, a), i = e.normalizeDnsRecordHistoryEntry(n);
      if (i.type !== "CNAME" || !i.content) return s;
      s.find((u) => e.normalizeDnsHistoryValueKey(u?.type, u?.content) === e.normalizeDnsHistoryValueKey(i.type, i.content))?.preferredFallback === !0 && (i.preferredFallback = !0);
      const c = e.normalizeDnsHistoryValueKey(i.type, i.content), l = s[0] ? e.normalizeDnsHistoryValueKey(s[0].type, s[0].content) : "";
      return l && l === c ? s : e.persistDnsRecordHistory(t, r, a, [i, ...s]);
    },
    async getDnsHostHistory(t, r, a) {
      return e.getDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a));
    },
    async persistDnsHostHistory(t, r, a, n) {
      return e.persistDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a), n);
    },
    async recordDnsHostHistory(t, r, a, n = {}) {
      return e.recordDnsRecordHistory(t, r, e.getDnsHostHistoryRecordId(a), n);
    },
    async setDnsHostHistoryPreferredFallback(t, r, a, n = "", s = !0) {
      if (!t || !r || !a) return [];
      const i = await e.getDnsHostHistory(t, r, a), c = String(n || "").trim();
      let l = !1;
      const u = i.map((d) => {
        const f = c && String(d?.id || "").trim() === c;
        return f && (l = !0), {
          ...d,
          preferredFallback: s === !0 ? f : !1
        };
      });
      if (s === !0 && c && !l) throw new Error("dns_history_entry_not_found");
      return e.persistDnsHostHistory(t, r, a, u);
    },
    getCurrentDateKey(t = /* @__PURE__ */ new Date(), r = F.Defaults.ScheduleUtcOffsetMinutes) {
      return ot(t, r).dateKey;
    }
  };
}
function th(o = {}, e = {}) {
  return {
    buildLegacyConfigCacheKeys(...t) {
      const r = /* @__PURE__ */ new Set([vc]);
      for (const a of t) {
        const n = e.getCurrentDateKey(/* @__PURE__ */ new Date(), a?.scheduleUtcOffsetMinutes);
        r.add(Ps(a?.cfZoneId)), r.add(Ps(a?.cfZoneId, n));
      }
      return [...r].filter(Boolean);
    },
    async listKvKeys(t, r = {}) {
      if (!t || typeof t.list != "function") return [];
      const a = String(r.prefix || ""), n = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = s ? await t.list({
          prefix: a,
          cursor: s
        }) : await t.list({ prefix: a });
        for (const f of u?.keys || []) {
          const m = String(f?.name || "").trim();
          m && n.push(m);
        }
        const d = typeof u?.cursor == "string" ? u.cursor : "";
        if (u?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!d || d === s || l.has(d)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: d,
            reason: d ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(d), s = d;
      }
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw u.code = "KV_SCAN_INCOMPLETE", u.status = 409, u.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(n)];
    },
    async listKvKeysStrict(t, r = {}) {
      if (!t || typeof t.list != "function") return [];
      const a = String(r.prefix || ""), n = [];
      let s = "", i = 0, c = !1;
      const l = /* @__PURE__ */ new Set();
      for (; i < 1e3; ) {
        i += 1;
        const u = await cf(t, s ? {
          prefix: a,
          cursor: s
        } : { prefix: a });
        for (const f of u?.keys || []) {
          const m = String(f?.name || "").trim();
          m && n.push(m);
        }
        const d = typeof u?.cursor == "string" ? u.cursor : "";
        if (u?.list_complete === !0) {
          c = !0;
          break;
        }
        if (!d || d === s || l.has(d)) {
          const f = /* @__PURE__ */ new Error("KV key scan did not complete");
          throw f.code = "KV_SCAN_INCOMPLETE", f.status = 409, f.details = {
            prefix: a,
            pageCount: i,
            cursor: d,
            reason: d ? "repeated_cursor" : "missing_cursor"
          }, f;
        }
        l.add(d), s = d;
      }
      if (!c) {
        const u = /* @__PURE__ */ new Error("KV key scan exceeded the page safety limit");
        throw u.code = "KV_SCAN_INCOMPLETE", u.status = 409, u.details = {
          prefix: a,
          pageCount: i,
          cursor: s,
          reason: "page_limit"
        }, u;
      }
      return [...new Set(n)];
    },
    async readRepairableRuntimeConfig(t) {
      if (!t) return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      let r = null;
      try {
        r = await t.get(e.CONFIG_KEY);
      } catch (a) {
        const n = /* @__PURE__ */ new Error("KV tidy could not read the runtime config");
        throw n.code = "KV_TIDY_CONFIG_READ_FAILED", n.status = 503, n.details = {
          key: e.CONFIG_KEY,
          cause: se(a, "kv_read_failed")
        }, n;
      }
      if (r == null || r === "") return {
        config: {},
        rawConfig: {},
        hadMalformedValue: !1,
        source: "missing",
        rawText: null
      };
      try {
        const a = JSON.parse(String(r));
        return {
          config: ae($(a) ? a : {}),
          rawConfig: $(a) ? a : {},
          hadMalformedValue: !$(a),
          source: "text_json",
          rawText: String(r)
        };
      } catch {
        return {
          config: {},
          rawConfig: {},
          hadMalformedValue: !0,
          source: "text_invalid_json",
          rawText: String(r)
        };
      }
    },
    async readRawKvEntry(t, r) {
      if (!t) return {
        exists: !1,
        value: null
      };
      const a = await t.get(r);
      return a == null ? {
        exists: !1,
        value: null
      } : {
        exists: !0,
        value: String(a)
      };
    },
    async captureRawKvEntries(t, r = []) {
      const a = [], n = /* @__PURE__ */ new Set();
      for (const s of Array.isArray(r) ? r : []) {
        const i = String(s || "").trim();
        !i || n.has(i) || (n.add(i), a.push({
          key: i,
          ...await e.readRawKvEntry(t, i)
        }));
      }
      return a;
    },
    async applyKvMutationsWithRollback(t, r = []) {
      if (!t) return [];
      const a = [], n = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Set();
      for (const l of Array.isArray(r) ? r : []) {
        const u = String(l?.key || "").trim();
        if (!u) continue;
        const d = String(l?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put";
        a.push({
          type: d,
          key: u,
          value: String(l?.value ?? "")
        }), !s.has(u) && (s.add(u), n.set(u, {
          key: u,
          ...await e.readRawKvEntry(t, u)
        }));
      }
      const i = [], c = /* @__PURE__ */ new Map();
      try {
        for (const l of a)
          l.type === "delete" ? await t.delete(l.key) : await t.put(l.key, l.value), c.has(l.key) || i.push(l.key), c.set(l.key, l.type === "delete" ? {
            exists: !1,
            value: null
          } : {
            exists: !0,
            value: l.value
          });
        return a;
      } catch (l) {
        const u = [], d = [];
        for (let f = i.length - 1; f >= 0; f -= 1) {
          const m = i[f], p = n.get(m), h = c.get(m);
          if (!(!p || !h))
            try {
              const g = await e.readRawKvEntry(t, m);
              if (!(g.exists === h.exists && (h.exists !== !0 || g.value === h.value))) {
                d.push(m);
                continue;
              }
              p.exists ? await t.put(p.key, p.value) : await t.delete(p.key);
            } catch (g) {
              u.push(`${p.key}:${g?.message || String(g)}`);
            }
        }
        if (u.length > 0 || d.length > 0) {
          const f = /* @__PURE__ */ new Error(`${l?.message || String(l)}; rollback_incomplete`);
          throw f.code = "KV_MUTATION_ROLLBACK_CONFLICT", f.status = 409, f.details = {
            rollbackConflicts: d,
            rollbackFailures: u,
            originalError: se(l, "kv_mutation_failed")
          }, f;
        }
        throw l;
      }
    }
  };
}
function rh(o = {}, e = {}) {
  return {
    createEmptyTidyPreview(t = "kv") {
      return {
        scope: String(t || "kv").trim() || "kv",
        fieldGroups: [],
        deleteGroups: [],
        rewriteGroups: [],
        preserveGroups: [],
        warnings: []
      };
    },
    async readStoredNodesSummaryState(t) {
      const r = String(await t.get(e.NODES_SUMMARY_INDEX_KEY) || "");
      let a = null;
      try {
        a = r ? JSON.parse(r) : null;
      } catch {
        a = null;
      }
      return {
        rawStoredSummaryIndexText: r,
        storedSummaryIndexState: Array.isArray(a) ? e.normalizeNodeSummaryIndex(a) : null,
        previousFullIndexBytes: r ? new TextEncoder().encode(r).length : 0
      };
    },
    async classifyKvTidyKeys(t, r = []) {
      const a = [], n = /* @__PURE__ */ new Set(), s = new Set(Object.values(e.LEGACY_OPS_STATUS_SECTION_KEYS));
      let i = 0, c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = 0, h = 0, g = 0;
      for (const y of r)
        if (y) {
          if (y.startsWith(e.PREFIX)) {
            a.push(y.slice(e.PREFIX.length));
            continue;
          }
          if (y.startsWith("fail:")) {
            n.add(y), h += 1;
            continue;
          }
          if (y === "sys:cf_dash_cache" || y.startsWith("sys:cf_dash_cache:")) {
            n.add(y);
            continue;
          }
          if (y === e.LEGACY_SCHEDULED_LOCK_KEY) {
            n.add(y);
            continue;
          }
          if (y.startsWith("sys:dns_ip_pool_fetch_lock:v1:")) {
            n.add(y), g += 1;
            continue;
          }
          if (y === e.CONFIG_META_KEY) {
            d += 1;
            continue;
          }
          if (y === e.CONFIG_SNAPSHOTS_META_KEY) {
            f += 1;
            continue;
          }
          if (y === e.NODES_INDEX_META_KEY) {
            m += 1;
            continue;
          }
          if (y === e.LEGACY_DNS_IP_POOL_SOURCES_KEY) {
            i += 1;
            continue;
          }
          if (y === e.LEGACY_TELEGRAM_ALERT_STATE_KEY) {
            i += 1;
            continue;
          }
          if (s.has(y) || y === e.LEGACY_OPS_STATUS_KEY) {
            i += 1;
            continue;
          }
          if (y.startsWith(e.DNS_RECORD_HISTORY_PREFIX)) {
            l += 1;
            continue;
          }
          y.startsWith(e.ADMIN_INDEX_UPLOAD_PREFIX) || y === e.CONFIG_KEY || y === e.NODES_INDEX_KEY || y === e.NODES_SUMMARY_INDEX_KEY || y === e.CONFIG_SNAPSHOTS_KEY || (i += 1);
        }
      return {
        nodeNames: a,
        removableKeys: n,
        untouchedOtherKeyCount: i,
        opsStatusKeyCount: c,
        dnsRecordHistoryKeyCount: l,
        dnsIpPoolSourceKeyCount: u,
        configMetaKeyCount: d,
        snapshotMetaKeyCount: f,
        nodeIndexMetaKeyCount: m,
        telegramAlertStateKeyCount: p,
        loginFailureKeyCount: h,
        dnsFetchLockKeyCount: g
      };
    },
    async collectKvTidyNodeMutations(t, r = [], a = {}, n = []) {
      const s = [], i = [];
      let c = 0, l = 0, u = 0, d = 0, f = 0, m = 0, p = ht(a.sourceDirectNodes || []);
      const h = [];
      for (const y of r) {
        const _ = `${e.PREFIX}${y}`;
        let S = null;
        try {
          S = await xe(t, _, { type: "json" });
        } catch (w) {
          const D = /* @__PURE__ */ new Error(`KV tidy could not read node ${y}`);
          throw D.code = "KV_TIDY_NODE_READ_FAILED", D.status = 503, D.details = {
            key: _,
            nodeName: y,
            cause: se(w, "kv_read_failed")
          }, D;
        }
        if (!$(S)) {
          const w = /* @__PURE__ */ new Error(`KV tidy found an invalid node entity: ${y}`);
          throw w.code = "KV_TIDY_NODE_INVALID", w.status = 409, w.details = {
            key: _,
            nodeName: y
          }, w;
        }
        const A = Td(S);
        A.shouldAddToSourceDirectNodes && (p = ht([...p, y])), A.topLevelPortPresent && (u += 1), d += Number(A.linePortCount) || 0, A.defaultPortNodePresent && (f += 1), m += Number(A.defaultPortLineCount) || 0, l += A.legacyKeysPresent.length;
        const { data: E, changed: T } = e.normalizeNode(y, S, { dropLegacyDirectRouting: !0 });
        i.push({
          name: y,
          ...E
        }), !Qe(y, E) && T && (h.push({
          key: _,
          ...await e.readRawKvEntry(t, _)
        }), c += 1, s.push({
          name: y,
          data: E
        }));
      }
      let g = a;
      return Z(g.sourceDirectNodes || []) !== Z(p) && (g = ae({
        ...g,
        sourceDirectNodes: p
      })), {
        nextTidyConfig: g,
        rewrittenNodes: s,
        fullEntityNodes: i,
        rewrittenNodeCount: c,
        deletedLegacyNodeFieldCount: l,
        migratedTopLevelPortNodeCount: u,
        migratedLinePortCount: d,
        migratedDefaultPortNodeCount: f,
        migratedDefaultPortLineCount: m,
        rollbackKvEntries: [...n, ...h]
      };
    },
    buildKvTidyNoteParts(t = {}, r = {}) {
      const a = [];
      return Array.isArray(t.legacyKeysPresent) && t.legacyKeysPresent.length && a.push(`legacy_keys=${t.legacyKeysPresent.join(",")}`), Number(t.rewrittenNodeCount) > 0 && a.push(`rewritten_nodes=${t.rewrittenNodeCount}`), Number(t.migratedTopLevelPortNodeCount) > 0 && a.push(`top_level_port_nodes=${t.migratedTopLevelPortNodeCount}`), Number(t.migratedLinePortCount) > 0 && a.push(`line_ports=${t.migratedLinePortCount}`), Number(t.migratedDefaultPortNodeCount) > 0 && a.push(`default_port_nodes=${t.migratedDefaultPortNodeCount}`), Number(t.migratedDefaultPortLineCount) > 0 && a.push(`default_port_lines=${t.migratedDefaultPortLineCount}`), r.includeRepairSource === !0 && r.repairedConfig?.hadMalformedValue && a.push(`${r.repairLabel || "config_source"}=${r.repairedConfig.source}`), a;
    },
    buildKvTidyPlanHash(t = {}) {
      const r = (Array.isArray(t?.mutationPlan) ? t.mutationPlan : []).map((a) => ({
        type: String(a?.type || "put").trim().toLowerCase() === "delete" ? "delete" : "put",
        key: String(a?.key || "").trim(),
        value: String(a?.value ?? "")
      }));
      return ne(Z({
        scope: "kv",
        scannedKeys: [...new Set(Array.isArray(t?.scannedKeys) ? t.scannedKeys : [])].sort(),
        revisions: $(t?.revisions) ? t.revisions : {},
        mutationPlan: r,
        rebuiltNodeSummaries: Array.isArray(t?.rebuiltNodeSummaries) ? t.rebuiltNodeSummaries : []
      }));
    }
  };
}
function ah(o = {}, e = {}) {
  return {
    ...Zg(o, e),
    ...eh(o, e),
    ...th(o, e),
    ...rh(o, e)
  };
}
var nh = class {
  constructor({ configReader: o, httpService: e, nodeRouteReader: t, proxyApi: r }) {
    this.configReader = o, this.httpService = e, this.nodeRouteReader = t, this.proxyApi = r;
  }
  #t(o, e, t, r = 200) {
    return this.httpService.buildCorsResponse(La(e, o), t, r, { mergeOriginVary: !0 });
  }
  #e(o, e) {
    const t = new URL(o.url);
    t.pathname = e + "/";
    const r = new Headers({
      Location: t.toString(),
      "Cache-Control": "no-store"
    });
    Ce(r);
    const a = o.method === "GET" || o.method === "HEAD" ? 301 : 307;
    return new Response(null, {
      status: a,
      headers: r
    });
  }
  #o(o, e = "") {
    const t = String(e || "").trim();
    if (!o || !t || o.status === 101) return o;
    const r = new Headers(o.headers || {});
    return r.append("Set-Cookie", t), new Response(o.body, {
      status: o.status,
      statusText: o.statusText,
      headers: r
    });
  }
  #s(o, e) {
    const t = this.#t(o, e, "Not Found", 404);
    return this.#o(t, Gc());
  }
  async #n(o, e, t, r) {
    if (!o || o.status === 101) return o;
    const a = await Ep(t, e, r);
    return a ? this.#o(o, Rp(a)) : o;
  }
  #r(o) {
    const e = o.segments;
    return e.length <= 1 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 1) ? !0 : e.length <= 2 ? !1 : this.httpService.isPlaybackCriticalSegments(e, 2);
  }
  async #i(o, e, t, r) {
    if (!o.root) return null;
    const a = this.#r(o);
    let n = a ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(o.root, e) : null, s = a ? n ? "hit" : "miss" : "skip";
    const i = n?.nodeData || await this.nodeRouteReader.getNode(o.root, e, t);
    if (!i) return null;
    const c = Qe(o.root, i) ? "oversized_bypass" : "";
    if (c && (s = c), Ye(i?.entryMode)) return null;
    const l = i.secret, u = _t(o.root, l), d = 1 + o.rootRaw.length, f = o.normalizedPathname.substring(d), m = Hs(f, o.requestUrl, u), p = m?.normalizedPath || f, h = `/${o.rootRaw}${p === "/" ? "/" : p}`, g = m ? h.split("/").filter(Boolean) : o.segments;
    let y = d;
    if (l) {
      const T = g[1] || "";
      if (It(T) !== l) return null;
      y += 1 + T.length;
    }
    const _ = h.substring(y), S = m ? (() => {
      const T = new URL(o.requestUrl.toString());
      return T.pathname = h, T;
    })() : o.requestUrl, A = oa(_);
    let E = A.remaining;
    return _ === "" && !S.pathname.endsWith("/") || A.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, h) } : (E === "" && (E = "/"), a && !n && (n = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(o.root, i, e)), {
      nodeData: i,
      secret: l,
      remaining: J(E),
      linkVariant: A.linkVariant,
      requestUrl: S,
      pathNormalizationState: m,
      playbackRouteHotSnapshot: n,
      targetHotCacheState: s,
      nodeCacheState: c,
      entryMode: "kv_route"
    });
  }
  #c(o) {
    return o ? qa(oa(o.normalizedPathname)?.remaining || "/") : !1;
  }
  async #l(o, e, t, r) {
    const a = o?.hostPrefixMatch;
    if (!a?.prefix) return null;
    const n = a.prefix, s = this.#c(o);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(n, e, t);
    if (!l || !Ye(l?.entryMode)) return null;
    const u = Qe(n, l) ? "oversized_bypass" : "";
    u && (c = u);
    const d = oa(o.normalizedPathname);
    let f = d.remaining;
    return d.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, o.normalizedPathname) } : (f === "" && (f = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n, l, e)), {
      nodeData: l,
      secret: "",
      remaining: J(f),
      linkVariant: d.linkVariant,
      requestUrl: o.requestUrl,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: u,
      entryMode: "host_prefix"
    });
  }
  #a(o) {
    const e = o?.requestHost || "", t = o?.configuredHost || "", r = o?.configuredLegacyHost || "";
    return e ? t && e === t ? !0 : !!(r && r !== t && e === r) : !1;
  }
  async #u(o, e, t, r, a = {}) {
    if (!this.#a(o) || !o?.root) return null;
    const n = o.root, s = this.#r(o);
    let i = s ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(n, e) : null, c = s ? i ? "hit" : "miss" : "skip";
    const l = i?.nodeData || await this.nodeRouteReader.getNode(n, e, t);
    if (!l || !Ye(l?.entryMode)) return null;
    const u = Qe(n, l) ? "oversized_bypass" : "";
    u && (c = u);
    const d = _t(n, "", { entryMode: "kv_route" }), f = 1 + o.rootRaw.length, m = o.normalizedPathname.substring(f), p = Hs(m, o.requestUrl, d), h = p?.normalizedPath || m, g = `/${o.rootRaw}${h === "/" ? "/" : h}`, y = g.substring(f), _ = p ? (() => {
      const E = new URL(o.requestUrl.toString());
      return E.pathname = g, E;
    })() : o.requestUrl, S = oa(y);
    let A = S.remaining;
    return y === "" && !_.pathname.endsWith("/") || S.needsTrailingSlashRedirect === !0 ? { response: this.#e(r, g) } : (A === "" && (A = "/"), s && !i && (i = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(n, l, e)), {
      nodeData: l,
      nodeName: n,
      secret: "",
      remaining: J(A),
      linkVariant: S.linkVariant,
      requestUrl: _,
      pathNormalizationState: p,
      playbackRouteHotSnapshot: i,
      targetHotCacheState: c,
      nodeCacheState: u,
      entryMode: "kv_route",
      routeKindOverride: a.isLegacyHostRequest === !0 ? "legacy_host_prefix_path_compat" : "host_prefix_path_compat",
      attachLegacyProxyContext: a.isLegacyHostRequest === !0
    });
  }
  async #d(o, e, t, r) {
    if (!Bs(o?.normalizedPathname)) return null;
    const a = r.headers.get("Cookie") || "", n = String(Ta(a).get("legacy_proxy_ctx") || "").trim();
    if (!n) return null;
    const s = await Tp(n, e, { requestHost: o.requestHost });
    if (s?.ok !== !0) return { response: this.#s(r, e) };
    const i = String(s.payload?.node || "").trim().toLowerCase();
    if (!i) return { response: this.#s(r, e) };
    const c = qa(o.normalizedPathname);
    let l = c ? await this.nodeRouteReader.getVerifiedPlaybackRouteHotSnapshot(i, e) : null, u = c ? l ? "hit" : "miss" : "skip";
    const d = l?.nodeData || await this.nodeRouteReader.getNode(i, e, t);
    if (!d) return { response: this.#s(r, e) };
    const f = Qe(i, d) ? "oversized_bypass" : "";
    f && (u = f);
    const m = Ye(d?.entryMode);
    return c && !l && (l = await this.nodeRouteReader.primePlaybackRouteHotSnapshot(i, d, e)), {
      nodeData: d,
      nodeName: i,
      secret: m ? "" : d.secret,
      remaining: o.normalizedPathname,
      linkVariant: "main",
      requestUrl: o.requestUrl,
      playbackRouteHotSnapshot: l,
      targetHotCacheState: u,
      nodeCacheState: f,
      entryMode: "kv_route",
      routeKindOverride: m ? "legacy_host_context_cookie_host_prefix_compat" : "legacy_host_context_cookie"
    };
  }
  async handle(o, e, t, r) {
    if (!r) throw new TypeError("NodeProxyFacade.handle requires routeContext");
    const { requestHost: a, configuredHost: n, configuredLegacyHost: s } = r, i = await this.configReader.getRuntimeConfig(e), c = !!(s && s !== n && a === s), l = i.enableHostPrefixProxy === !0 && !!n && !c;
    r.hostPrefixMatch = l ? _o(a, n) : null;
    const u = !!(l && a !== n && a.endsWith(`.${n}`));
    if (r.hostPrefixMatch) {
      const m = await this.#l(r, e, t, o);
      return m?.response ? m.response : m?.nodeData ? this.proxyApi.handle(o, m.nodeData, m.remaining, r.hostPrefixMatch.prefix, m.secret, e, t, {
        requestUrl: m.requestUrl || r.requestUrl,
        linkVariant: m.linkVariant,
        targetHotCacheState: m.targetHotCacheState,
        nodeCacheState: m.nodeCacheState,
        cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: m.entryMode
      }) : this.#t(o, e, "Not Found", 404);
    }
    if (u) return this.#t(o, e, "Not Found", 404);
    const d = await this.#u(r, e, t, o, { isLegacyHostRequest: c });
    if (d?.response) return d.response;
    if (d?.nodeData) {
      const m = await this.proxyApi.handle(o, d.nodeData, d.remaining, d.nodeName, d.secret, e, t, {
        requestUrl: d.requestUrl || r.requestUrl,
        linkVariant: d.linkVariant,
        pathNormalizationState: d.pathNormalizationState,
        targetHotCacheState: d.targetHotCacheState,
        nodeCacheState: d.nodeCacheState,
        cachedTargetRecords: Array.isArray(d.playbackRouteHotSnapshot?.targetRecords) ? d.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: d.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: d.entryMode,
        routeKindOverride: d.routeKindOverride
      });
      return d.attachLegacyProxyContext === !0 ? await this.#n(m, a, d.nodeName, e) : m;
    }
    const f = await this.#i(r, e, t, o);
    if (f?.response) return f.response;
    if (f?.nodeData) {
      const m = await this.proxyApi.handle(o, f.nodeData, f.remaining, r.root, f.secret, e, t, {
        requestUrl: f.requestUrl || r.requestUrl,
        linkVariant: f.linkVariant,
        pathNormalizationState: f.pathNormalizationState,
        targetHotCacheState: f.targetHotCacheState,
        nodeCacheState: f.nodeCacheState,
        cachedTargetRecords: Array.isArray(f.playbackRouteHotSnapshot?.targetRecords) ? f.playbackRouteHotSnapshot.targetRecords : null,
        nodeCacheRevision: f.playbackRouteHotSnapshot?.nodeCacheRevision || "",
        runtimeConfig: i,
        runtimeRouteContext: r,
        entryMode: f.entryMode
      });
      return c ? await this.#n(m, a, r.root, e) : m;
    }
    if (c && Bs(r.normalizedPathname)) {
      const m = await this.#d(r, e, t, o);
      if (m?.response) return m.response;
      if (m?.nodeData) {
        const p = await this.proxyApi.handle(o, m.nodeData, m.remaining, m.nodeName, m.secret, e, t, {
          requestUrl: m.requestUrl || r.requestUrl,
          linkVariant: m.linkVariant,
          targetHotCacheState: m.targetHotCacheState,
          nodeCacheState: m.nodeCacheState,
          cachedTargetRecords: Array.isArray(m.playbackRouteHotSnapshot?.targetRecords) ? m.playbackRouteHotSnapshot.targetRecords : null,
          nodeCacheRevision: m.playbackRouteHotSnapshot?.nodeCacheRevision || "",
          runtimeConfig: i,
          runtimeRouteContext: r,
          entryMode: m.entryMode,
          routeKindOverride: m.routeKindOverride
        });
        return this.#n(p, a, m.nodeName, e);
      }
    }
    return this.#t(o, e, "Not Found", 404);
  }
};
function oh(o) {
  return Object.freeze({
    persistCloudflareDnsRecordsForHost(e) {
      return ym({
        ...e,
        dnsHistoryRepository: o
      });
    },
    buildDnsIpWorkspaceItems(e, t, r, a = {}) {
      return xc(e, t, r, {
        ...a,
        probeRepository: o
      });
    },
    buildDnsIpPoolWorkspacePreviewItems(e, t, r, a, n = {}) {
      return Om(e, t, r, a, {
        ...n,
        probeRepository: o
      });
    },
    tryAcquireDnsIpPoolFetchRefreshLock(e, t) {
      return Hm({
        ...e,
        leaseRepository: o
      }, t);
    },
    releaseDnsIpPoolFetchRefreshLock(e, t) {
      return $m({
        ...e,
        leaseRepository: o
      }, t);
    },
    runDnsIpPoolSourcesLiveRefresh(e) {
      return Bm({
        ...e,
        poolRepository: o
      });
    }
  });
}
function sh(o, e) {
  const t = e.shellService, r = [
    jm({
      kernel: o,
      bindingPort: o,
      CacheManager: e.cacheManager,
      LogQueryPlanner: e.logQueryPlanner,
      Logger: e.logger,
      requestModel: o,
      buildAdminLocalIndexUploadRecord: t.buildAdminLocalIndexUploadRecord,
      buildAdminShellState: t.buildAdminShellState,
      buildAdminUiContract: t.buildAdminUiContract,
      buildDnsIpPoolWorkspacePreviewItems: e.dns.buildDnsIpPoolWorkspacePreviewItems,
      buildDnsIpWorkspaceItems: e.dns.buildDnsIpWorkspaceItems,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost,
      releaseDnsIpPoolFetchRefreshLock: e.dns.releaseDnsIpPoolFetchRefreshLock,
      runDnsIpPoolSourcesLiveRefresh: e.dns.runDnsIpPoolSourcesLiveRefresh,
      tryAcquireDnsIpPoolFetchRefreshLock: e.dns.tryAcquireDnsIpPoolFetchRefreshLock,
      withAdminShellRuntimeStatus: t.withAdminShellRuntimeStatus
    }),
    Vp({
      D1TidyExecutor: e.d1TidyExecutor,
      D1TidyPlanner: e.d1TidyPlanner,
      Logger: e.logger,
      buildAdminReleaseVendorManifest: t.buildAdminReleaseVendorManifest,
      normalizeAdminReleaseVendorManifestRecord: t.normalizeAdminReleaseVendorManifestRecord,
      validateAdminShellHtmlSource: t.validateAdminShellHtmlSource
    }, o),
    og({
      CacheManager: e.cacheManager,
      persistCloudflareDnsRecordsForHost: e.dns.persistCloudflareDnsRecordsForHost
    }, o),
    lg({
      bindingPort: o,
      schemaReadinessPort: o,
      statusPersistence: o
    }),
    zg({
      CacheManager: e.cacheManager,
      withAdminShellRuntimeStatus: t.withAdminShellRuntimeStatus
    }, o),
    qg({}, o),
    ah({}, o)
  ];
  for (const a of r) for (const [n, s] of Object.entries(a)) o[n] = s;
  return o;
}
function ih({ includeTestingSupport: o = !1 } = {}) {
  const e = { ...Jg }, t = Object.freeze({ getRuntimeConfig: Re }), r = Qg({ nodeRepository: e }), a = cg({ logRepository: e }), n = gf({
    indexRepository: e,
    statusPort: e
  });
  sh(e, {
    cacheManager: r,
    d1TidyExecutor: Xg(),
    d1TidyPlanner: Yg(),
    dns: oh(e),
    logger: a,
    logQueryPlanner: sg(),
    shellService: n
  });
  const s = Fg({
    cachePort: r,
    configReader: t,
    fetchPort: { fetchRequest: Be },
    logger: a,
    nodeRepository: e
  }), i = new vd({
    actionHandlers: e.adminActionHandlers,
    bindingService: e,
    configReader: t,
    repository: e,
    requestModel: e,
    shellService: n
  }), c = new nh({
    configReader: t,
    httpService: Object.freeze({
      buildCorsResponse: n.buildEdgeCorsResponse,
      isPlaybackCriticalSegments: n.isPlaybackCriticalSegments
    }),
    nodeRouteReader: e,
    proxyApi: s
  }), l = new qp({
    logger: a,
    service: e
  }), u = (m, p) => {
    const h = new URL(m.url), g = re(h.hostname), y = J(h.pathname), _ = y.toLowerCase(), S = it(p), A = S.toLowerCase(), E = dn(S), T = E.toLowerCase(), w = Ui(p, {
      adminPath: S,
      loginPath: E
    }), D = y.split("/").filter(Boolean), k = D[0] || "", b = It(k).toLowerCase();
    return {
      initHealth: w,
      requestUrl: h,
      requestHost: g,
      configuredHost: ze(p),
      configuredLegacyHost: Kr(p),
      normalizedPathname: y,
      pathnameLower: _,
      adminPath: S,
      adminPathLower: A,
      adminLoginPath: E,
      adminLoginPathLower: T,
      segments: D,
      rootRaw: k,
      root: b
    };
  }, d = (m, p) => (p === "GET" || p === "HEAD") && m.pathnameLower === "/favicon.ico" || p === "GET" && m.normalizedPathname === "/" || vi(m.pathnameLower, m.adminPathLower) || Ar(m.pathnameLower, m.adminLoginPathLower) ? !0 : m.adminPathLower === "/admin" && m.pathnameLower === "/api/auth/login" && m.root === "api" && m.segments[1] === "auth" && m.segments[2] === "login", f = {
    adminConsole: i,
    nodeProxy: c,
    scheduledMaintenance: l,
    workerHandler: Object.freeze({
      async fetch(m, p, h) {
        const g = u(m, p), y = m.method;
        if (!((y === "GET" || y === "HEAD") && g.pathnameLower === "/favicon.ico")) {
          const _ = await t.getRuntimeConfig(p), S = !!(g.configuredLegacyHost && g.configuredLegacyHost !== g.configuredHost && g.requestHost === g.configuredLegacyHost);
          if (_.enableHostPrefixProxy === !0 && g.configuredHost && !S && g.requestHost !== g.configuredHost && g.requestHost.endsWith(`.${g.configuredHost}`)) return c.handle(m, p, h, g);
        }
        if (d(g, y)) {
          const _ = await i.handle(m, p, h);
          if (_) return _;
        }
        return c.handle(m, p, h, g);
      },
      scheduled(m, p, h) {
        return l.handle(m, p, h);
      }
    })
  };
  return o === !0 && (f.testingSupport = Object.freeze({
    cacheManager: r,
    kernel: e,
    logger: a,
    shellService: n,
    buildNodeRouteContext: u,
    buildRouteCorsResponse(m, p, h, g = 200) {
      return n.buildEdgeCorsResponse(La(p, m), h, g, { mergeOriginVary: !0 });
    },
    isPlaybackCriticalRouteContext(m) {
      const p = Array.isArray(m?.segments) ? m.segments : [];
      return p.length <= 1 ? !1 : n.isPlaybackCriticalSegments(p, 1) ? !0 : p.length > 2 && n.isPlaybackCriticalSegments(p, 2);
    },
    isolateState: Ol,
    proxyService: s.testingSupport
  })), Object.freeze(f);
}
var { workerHandler: ch } = ih();
export {
  ch as default
};
