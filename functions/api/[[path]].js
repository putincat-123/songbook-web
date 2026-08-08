export async function onRequest(context) {
  const { request, params } = context;

  const path = Array.isArray(params.path)
    ? params.path.join("/")
    : params.path || "";

  const incomingUrl = new URL(request.url);

  const targetUrl = new URL(
    `https://streamer-songbook.vercel.app/api/${path}`
  );

  // 保留原本 query string
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);

  // 由 Cloudflare Server 呼叫 Vercel，
  // 不需要把瀏覽器的 Origin 傳過去
  headers.delete("origin");
  headers.delete("host");

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "follow",
    });

    const responseHeaders = new Headers(response.headers);

    // 回到瀏覽器時已經是同源 /api，
    // 不需要 Vercel 原本的 CORS header
    responseHeaders.delete("access-control-allow-origin");
    responseHeaders.delete("access-control-allow-credentials");

    responseHeaders.set("X-Songbook-Proxy", "cloudflare");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Cloudflare API proxy error:", error);

    return Response.json(
      {
        ok: false,
        error: "api proxy failed",
      },
      {
        status: 502,
      }
    );
  }
}
