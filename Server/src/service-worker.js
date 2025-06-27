/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

sw.addEventListener('push', (event) => {
	const data = event.data.json();
	event.waitUntil(
		sw.registration.showNotification(data.title, {
			body: data.body,
			data: { url: data.url } // Pass the URL in notification data
		})
	);
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url;
	if (url) {
		sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
			// Check if the URL is already open
			for (let client of windowClients) {
				if (client.url === url && 'focus' in client) {
					return client.focus();
				}
			}
			// Otherwise, open a new tab/window
			if (sw.clients.openWindow) {
				return sw.clients.openWindow(url);
			}
		})
	}
});

sw.addEventListener('install', () => {
	sw.skipWaiting();
});
