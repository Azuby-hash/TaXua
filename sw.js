// Service worker: lưu trang và ảnh để xem offline. Ưu tiên bản đã lưu, có mạng thì cập nhật nền.
const CACHE = 'taxua-offline'; // v2: thử lại ảnh lỗi
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate' || /index\.html$|\/$/.test(new URL(e.request.url).pathname);
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const get = () => fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()).catch(() => {}); return r; });
    // mạng chập chờn hoặc iPhone huỷ yêu cầu khi tải nhiều ảnh cùng lúc: thử lại 1 lần, rồi mới dùng bản lưu
    const net = get().catch(() => new Promise(ok => setTimeout(ok, 600)).then(get)).catch(() => hit || Response.error());
    // trang chính: lấy mạng trước để luôn có bản mới, mất mạng thì dùng bản lưu
    if (isPage) return net;
    return hit || net;
  }));
});
