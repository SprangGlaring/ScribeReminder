// public/sw.js
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());

self.addEventListener('push', function(e){
  const data = e.data ? e.data.json() : { title: 'ScribeReminder', body: '提醒' };
  self.registration.showNotification(data.title, { body: data.body });
});
