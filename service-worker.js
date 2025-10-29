// Service Worker for PassVault PWA

const CACHE_NAME = "passvault-cache-v1";

const urlsToCache = [
  "index.html",
  "manifest.json",
  "favicon.ico",
  "assets/icons/icon-192x192.png",
  "assets/icons/icon-512x512.png",

  // CSS Files
  "css/base.css",
  "css/animations.css",
  "css/components/bottom-nav-bar.css",
  "css/components/change-login-password-modal.css",
  "css/components/change-master-password-modal.css",
  "css/components/custom-select.css",
  "css/components/draggable.css",
  "css/components/edit-modal.css",
  "css/components/export-modal.css",
  "css/components/import-modal.css",
  "css/components/login-page.css",
  "css/components/name-edit-modal.css",
  "css/components/notification-center.css",
  "css/components/password-item.css",
  "css/components/search-bar.css",
  "css/components/settings-page.css",
  "css/components/tags-and-categories-page.css",
  "css/components/unlock-page.css",

  // JS Files
  "js/main.js",
  "js/App.js",
  "js/store.js",
  "js/crypto.js",
  "js/firebase.js",
  "js/icons.js",
  "js/utils.js",

  // JS Components
  "js/components/BottomNavBar.js",
  "js/components/ChangeLoginPasswordModal.js",
  "js/components/ChangeMasterPasswordModal.js",
  "js/components/CustomSelect.js",
  "js/components/EditModal.js",
  "js/components/ExportModal.js",
  "js/components/HomePage.js",
  "js/components/ImportModal.js",
  "js/components/LoginPage.js",
  "js/components/NameEditModal.js",
  "js/components/NotificationCenter.js",
  "js/components/PasswordItem.js",
  "js/components/PinnedPage.js",
  "js/components/SettingsPage.js",
  "js/components/TagsAndCategoriesPage.js",
  "js/components/UnlockPage.js",

  // CDN Libraries
  "https://unpkg.com/vue@3/dist/vue.global.js",
  "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js",
  "https://cdn.jsdelivr.net/npm/vuedraggable@4.1.0/dist/vuedraggable.umd.min.js",
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js",
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js",
  "https://esm.sh/lucide-vue-next",
];

// 1. 安裝 Service Worker
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. 啟用 Service Worker
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. 攔截網路請求
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  if (event.request.url.includes("firestore.googleapis.com")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        console.log(
          `[Service Worker] Fetch failed for ${event.request.url}, trying cache.`
        );
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
        });
      })
  );
});
