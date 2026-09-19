export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const backendUrl = env.API_BACKEND_URL || "http://localhost:3001";
    
    const targetUrl = new URL(url.pathname + url.search, backendUrl);
    
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "follow"
    });

    try {
      const response = await fetch(modifiedRequest);
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Acquit-Worker-Proxy", "Cloudflare-Edge");
      newHeaders.set("X-Frame-Options", "SAMEORIGIN");
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Gateway Error", details: err.message }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
