/**
 * Acquit.ai — Cloudflare API Proxy Worker
 * Secure reverse proxy with CORS enforcement, security headers,
 * and request forwarding to the Acquit backend API.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle Preflight CORS Requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Acquit-Case-Id",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Health check endpoint
    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "acquit-ai-api-proxy",
          timestamp: new Date().toISOString(),
          region: request.cf?.colo || "global",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 3. Upstream API Target configuration
    const upstreamBase = env?.API_UPSTREAM_URL || "http://localhost:3001";
    const targetUrl = new URL(url.pathname + url.search, upstreamBase);

    // 4. Construct proxy request preserving headers
    const newHeaders = new Headers(request.headers);
    newHeaders.set("X-Forwarded-Host", url.host);
    newHeaders.set("X-Forwarded-Proto", url.protocol.replace(":", ""));
    newHeaders.set("X-Acquit-Proxy", "cloudflare-worker");

    try {
      const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "follow",
      });

      // 5. Build response with secure headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", request.headers.get("Origin") || "*");
      responseHeaders.set("Access-Control-Allow-Credentials", "true");
      responseHeaders.set("X-Content-Type-Options", "nosniff");
      responseHeaders.set("X-Frame-Options", "SAMEORIGIN");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Upstream Service Unavailable",
          details: err instanceof Error ? err.message : String(err),
          target: targetUrl.origin,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
