const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function corsHeaders(origin, allowed) {
  const list = (allowed || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = origin && (list.includes("*") || list.includes(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin : list[0] || "",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id, X-Acquit-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...SECURITY_HEADERS,
      ...extra,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...SECURITY_HEADERS, ...cors } });
    }

    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return json(
        { status: "ok", service: "acquit-ai-worker", ts: new Date().toISOString() },
        200,
        cors
      );
    }

    const apiOrigin = (env.API_ORIGIN || "").replace(/\/$/, "");
    if (!apiOrigin || !/^https?:\/\//i.test(apiOrigin)) {
      return json(
        { error: "API_ORIGIN not configured or invalid" },
        503,
        cors
      );
    }

    if (env.WORKER_AUTH_TOKEN) {
      const token = request.headers.get("X-Acquit-Token");
      if (token !== env.WORKER_AUTH_TOKEN && !url.pathname.startsWith("/api/public")) {
        return json({ error: "unauthorized" }, 401, cors);
      }
    }

    const target = new URL(url.pathname + url.search, apiOrigin);
    const headers = new Headers(request.headers);
    headers.set("X-Forwarded-Host", url.host);
    headers.set("X-Request-Id", request.headers.get("X-Request-Id") || crypto.randomUUID());
    headers.delete("host");

    let upstream;
    try {
      upstream = await fetch(target.toString(), {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      });
    } catch (err) {
      return json({ error: "bad_gateway", detail: "upstream unreachable" }, 502, cors);
    }

    const out = new Headers(upstream.headers);
    Object.entries({ ...SECURITY_HEADERS, ...cors }).forEach(([k, v]) => out.set(k, v));

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  },
};
