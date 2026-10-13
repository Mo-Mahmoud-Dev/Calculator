/* ==========================================================================
   sw.js — Service Worker لتطبيق الحاسبة (GitHub Pages)
   ========================================================================== */

// مهم: غيّر الإصدار (v2 → v3) كل ما تعدّل أي ملف، عشان المتصفح يحمّل النسخة الجديدة
const CACHE_VERSION = 'v2';
const CACHE_NAME = `calc-cache-${CACHE_VERSION}`;

// مسار الموقع الأساسي على GitHub Pages
const BASE = '/Calculator/';

// كل الملفات اللي لازم تتحفظ عشان الحاسبة تشتغل أوفلاين
const PRECACHE_URLS = [
  BASE,
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'script.js',
  BASE + 'math.js',
  BASE + 'manifest.json',
  BASE + 'offline.html',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png'
];

/* ---------- INSTALL: تخزين الملفات الأساسية ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE: حذف الكاش القديم ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('calc-cache-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- FETCH: استراتيجيات التخزين ---------- */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // نتعامل مع GET من نفس الدومين بس
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // لو الموقع مش داخل مسار /Calculator/ ما نتدخلش
  if (!url.pathname.startsWith(BASE)) return;

  // 1) تنقل بين الصفحات: الشبكة أولاً، وبعدين الكاش، وبعدين صفحة offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(BASE + 'offline.html'))
        )
    );
    return;
  }

  // 2) باقي الملفات (CSS, JS, صور): من الكاش فوراً، وتحديثها في الخلفية
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
