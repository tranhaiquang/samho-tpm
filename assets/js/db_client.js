/**
 * SAMHO_DB — shared Supabase/PostgREST client.
 *
 * Replaces the ~25 hand-rolled fetch + header-triple call sites, the ~14
 * `!response.ok` throw blocks, the 3 friendlyError duplicates, the 3
 * pagination dialects (offset loop / Range headers / silent limit=1000), the
 * string-concat query URLs, and the config-mutating table discovery.
 *
 * Ports & adapters (category 4 — true external, mock at the boundary):
 *   - Transport port: request({method, path, query, headers, body})
 *       -> {status, headers (lowercased), jsonText}. Production uses the
 *       fetchTransport adapter below; tests inject a memory transport.
 *   - AuthHeadersSupplier port: () => object. Production supplies
 *       window.SAMHO_AUTH.authHeaders, resolved lazily per request.
 *
 * The module logic (headers, pagination loop, error normalization, query
 * building, discovery) lives entirely against the transport port, so it is
 * testable without any network or DOM.
 */
(function () {
  "use strict";

  const DEFAULT_PAGE_SIZE = 1000;

  // FilterValue grammar (design 2A):
  //   - primitive                     ->  eq.<value>
  //   - Array<primitive>              ->  in.(a,b)  (string members double-quoted)
  //   - { op, value }                 ->  <op>.<value>  (array value -> "(a,b)")
  //   - string already starting with a PostgREST operator  ->  passed through verbatim
  const OP_RE = /^(eq|neq|gt|gte|lt|lte|like|ilike|in|is|cs|cd|ov|sl|sr|nx|nxl|nxr|adj|not)\./;

  function serializeFilterValue(value) {
    if (Array.isArray(value)) {
      const inner = value
        .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '\\"')}"` : String(v)))
        .join(",");
      return `in.(${inner})`;
    }
    if (value && typeof value === "object" && typeof value.op === "string" && "value" in value) {
      const inner = Array.isArray(value.value) ? `(${value.value.join(",")})` : value.value;
      return `${value.op}.${inner}`;
    }
    return `eq.${value}`;
  }

  function applyFilters(params, where) {
    if (!where) return;
    const entries = Array.isArray(where) ? where : Object.entries(where);
    entries.forEach((entry) => {
      let key = entry[0];
      let value = entry[1];
      // [col, op, value] triple form — allows duplicate columns (e.g. gte + lte on due_date)
      if (Array.isArray(entry) && entry.length === 3) {
        value = { op: entry[1], value: entry[2] };
      }
      if (value == null || value === "") return;
      if (typeof value === "string" && OP_RE.test(value)) {
        params.append(key, value);
        return;
      }
      if (Array.isArray(value) && value.length === 0) return;
      params.append(key, serializeFilterValue(value));
    });
  }

  function buildQuery({ columns, where, order, limit, offset }) {
    const params = new URLSearchParams();
    params.set("select", Array.isArray(columns) ? columns.join(",") : columns || "*");
    applyFilters(params, where);
    if (order) {
      const orders = Array.isArray(order) ? order : [order];
      params.set("order", orders.join(","));
    }
    if (limit != null) params.set("limit", String(limit));
    if (offset != null) params.set("offset", String(offset));
    return params.toString();
  }

  /**
   * @param {Object} deps
   * @param {Transport} deps.transport       Port 1 (required): request(spec) -> {status, headers, jsonText}
   * @param {string}    deps.anonKey         Supabase anon key (apikey + Bearer fallback)
   * @param {Function}  [deps.authHeaders]   Port 2: () => object, called per request (default none)
   * @param {number}    [deps.defaultPageSize]  internal auto-pagination step (default 1000)
   */
  function createDbClient({ transport, anonKey, authHeaders = () => ({}), defaultPageSize = DEFAULT_PAGE_SIZE }) {
    if (!transport) throw new Error("createDbClient: a transport is required.");
    if (!anonKey) throw new Error("createDbClient: anonKey is required.");

    function composeHeaders(extra) {
      return { apikey: anonKey, Authorization: `Bearer ${anonKey}`, ...authHeaders(), ...(extra || {}) };
    }

    function normalizeError(res) {
      let code = "", message = "";
      try {
        const body = JSON.parse(res.jsonText || "{}");
        code = body.code || "";
        message = body.message || "";
      } catch { /* non-JSON body */ }
      if (!message) message = res.jsonText || `Request failed (${res.status}).`;
      const error = new Error(message);
      error.status = res.status;
      error.code = code;
      return error;
    }

    async function rawRequest(spec) {
      let res;
      try {
        res = await transport.request({
          method: spec.method || "GET",
          path: spec.path,
          query: spec.query || "",
          headers: composeHeaders(spec.headers),
          body: spec.body != null ? spec.body : null
        });
      } catch (err) {
        const error = new Error("Unable to connect. Please check your network and try again.");
        error.status = 0;
        error.code = "network";
        error.cause = err;
        throw error;
      }
      if (res.status < 200 || res.status >= 300) throw normalizeError(res);
      return res;
    }

    function parseBody(res) {
      const text = (res.jsonText || "").trim();
      if (!text) return null;
      try { return JSON.parse(text); } catch { return text; }
    }

    /** Low-level escape hatch: full header composition + error normalization applied. */
    async function request(spec) {
      const res = await rawRequest(spec);
      return parseBody(res);
    }

    /**
     * Fetch rows. Omitting `limit` auto-paginates to completion (never
     * silently truncates at 1000); passing `limit` makes a hard cap explicit.
     */
    async function select(table, options = {}) {
      const pageSize = options.pageSize || defaultPageSize;
      const totalLimit = options.limit;
      const all = totalLimit == null;
      const rows = [];
      let offset = options.offset || 0;
      let pages = 0;
      const maxPages = options.maxPages || 200;
      while (true) {
        const remaining = all ? pageSize : totalLimit - rows.length;
        if (remaining <= 0) break;
        const query = buildQuery({
          columns: options.columns,
          where: options.where,
          order: options.order,
          limit: Math.min(remaining, pageSize),
          offset
        });
        const res = await rawRequest({ method: "GET", path: table, query, headers: options.headers });
        const page = parseBody(res) || [];
        if (!Array.isArray(page)) { rows.push(page); break; }
        rows.push(...page);
        if (all && page.length < pageSize) break;
        if (!all && rows.length >= totalLimit) break;
        if (page.length === 0) break;
        offset += pageSize;
        if (++pages >= maxPages) break;
      }
      return rows;
    }

    /** Single row (limit 1) or null. */
    async function getOne(table, options = {}) {
      const query = buildQuery({ columns: options.columns, where: options.where, order: options.order, limit: 1, offset: options.offset });
      const res = await rawRequest({ method: "GET", path: table, query, headers: options.headers });
      const rows = parseBody(res);
      return Array.isArray(rows) ? (rows[0] || null) : rows;
    }

    /** @param {boolean} [options.returning] return the inserted row(s) (return=representation). */
    async function insert(table, payload, options = {}) {
      const res = await rawRequest({
        method: "POST",
        path: table,
        headers: { "Content-Type": "application/json", Prefer: options.returning ? "return=representation" : "return=minimal" },
        body: JSON.stringify(payload)
      });
      return options.returning ? parseBody(res) : null;
    }

    /** PATCH; refuses a filterless update. Returns affected rows ([] = RLS no-op). */
    async function update(table, where, payload) {
      if (!where || Object.keys(where).length === 0) {
        throw new Error("SAMHO_DB.update requires a where match (refusing to update all rows).");
      }
      const params = new URLSearchParams();
      applyFilters(params, where);
      const res = await rawRequest({
        method: "PATCH",
        path: table,
        query: params.toString(),
        headers: { "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(payload)
      });
      return parseBody(res) || [];
    }

    /** DELETE; refuses a filterless delete. Returns deleted rows. */
    async function remove(table, where) {
      if (!where || Object.keys(where).length === 0) {
        throw new Error("SAMHO_DB.remove requires a where match (refusing to delete all rows).");
      }
      const params = new URLSearchParams();
      applyFilters(params, where);
      const res = await rawRequest({
        method: "DELETE",
        path: table,
        query: params.toString(),
        headers: { Prefer: "return=representation" }
      });
      return parseBody(res) || [];
    }

    /** Call an RPC function. GET when no args, POST otherwise. */
    async function rpc(name, args) {
      const res = await rawRequest({
        method: args != null ? "POST" : "GET",
        path: `rpc/${encodeURIComponent(name)}`,
        headers: args != null ? { "Content-Type": "application/json" } : undefined,
        body: args != null ? JSON.stringify(args) : null
      });
      return parseBody(res);
    }

    /** Exact row count via Prefer: count=exact + content-range. */
    async function count(table, where = {}) {
      const params = new URLSearchParams();
      params.set("select", "id");
      applyFilters(params, where);
      params.set("limit", "1");
      const res = await rawRequest({
        method: "GET",
        path: table,
        query: params.toString(),
        headers: { Prefer: "count=exact" }
      });
      const range = String((res.headers && res.headers["content-range"]) || "");
      const match = range.match(/\/(\d+)$/);
      if (match) return Number(match[1]);
      const rows = parseBody(res);
      return Array.isArray(rows) ? rows.length : 0;
    }

    /**
     * Probe candidate table names; first 2xx wins. Returns { table, rows }.
     * NEVER mutates shared config — callers keep the resolved name locally.
     */
    async function discover(tables, options = {}) {
      const candidates = [...new Set(tables.filter(Boolean))];
      const errors = [];
      for (const table of candidates) {
        try {
          const rows = await select(table, options);
          return { table, rows };
        } catch (err) {
          errors.push(`${table}: ${err.message}`);
        }
      }
      const error = new Error(`None of the candidate tables responded. ${errors.join(" | ")}`);
      error.status = 0;
      throw error;
    }

    /** Normalize a thrown error to a user-facing message. */
    function friendly(error, action) {
      return window.SAMHO_ERRORS && typeof window.SAMHO_ERRORS.message === "function"
        ? window.SAMHO_ERRORS.message(error, action)
        : String(error?.message || error || "Error.");
    }

    return { select, get: select, getOne, insert, update, remove, rpc, count, discover, friendly, request };
  }

  /** Production Transport adapter (Port 1) over real fetch. */
  function fetchTransport(baseUrl) {
    return {
      async request({ method = "GET", path, query = "", headers = {}, body = null }) {
        const url = query ? `${baseUrl}/${path}?${query}` : `${baseUrl}/${path}`;
        const init = { method, headers };
        if (body != null) init.body = body;
        const res = await fetch(url, init);
        const jsonText = await res.text();
        const responseHeaders = {};
        if (res.headers && typeof res.headers.forEach === "function") {
          res.headers.forEach((value, key) => { responseHeaders[String(key).toLowerCase()] = value; });
        }
        return { status: res.status, headers: responseHeaders, jsonText };
      }
    };
  }

  window.createDbClient = createDbClient;

  const config = window.SAMHO_SUPABASE;
  if (config && config.url && config.anonKey) {
    window.SAMHO_DB = createDbClient({
      transport: fetchTransport(config.url),
      anonKey: config.anonKey,
      authHeaders: () => (window.SAMHO_AUTH?.authHeaders?.() || {})
    });
  }
})();
