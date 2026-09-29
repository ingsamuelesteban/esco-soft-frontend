self.addEventListener('push', function (e) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const data = e.data ? e.data.json() : {};
    
    const options = {
        body: data.body || 'Tienes un nuevo mensaje.',
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-72x72.png',
        data: data.data || { action_url: '/' }
    };

    e.waitUntil(self.registration.showNotification(data.title || 'EscoSoft', options));
});

self.addEventListener('notificationclick', function (e) {
    e.notification.close();
    
    const targetUrl = e.notification.data.action_url || '/';

    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Focus if tab exists
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    return client.navigate(targetUrl);
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
