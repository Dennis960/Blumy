/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

self.addEventListener('push', (event) => {
	const data = event.data.json();
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body
		})
	);
});

self.addEventListener('install', () => {
	self.skipWaiting(); // immediately activate the new service worker
});
