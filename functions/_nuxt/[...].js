export async function onRequest(context) {
  // 对 _nuxt/ 路径返回 404，避免 SPA fallback 把旧 chunk 重定向到 index.html
  return new Response('Not Found', { status: 404 })
}
