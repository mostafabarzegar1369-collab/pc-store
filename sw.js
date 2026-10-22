const CACHE_NAME = 'partzone-v1';
const ASSETS = [
  './',
  './index.html',
  './product.html',
  './cart.html',
  './style.css',
  './script.js',
  './images/icon-192.png',
  './images/icon-512.png'
];

// نصب و کش کردن فایل‌ها
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// فعال‌سازی و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

// استراتژی: اول کش، بعد شبکه (برای سرعت بالا)
self.addEventListener('fetch', (e) => {
  // درخواست‌های دیتابیس Supabase رو کش نکن
  if (e.request.url.includes('supabase.co')) return;
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});