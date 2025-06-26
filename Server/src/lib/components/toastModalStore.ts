import { dev } from '$app/environment';
import { get, writable } from 'svelte/store';

export type CustomToastType = 'success' | 'error' | 'info' | 'warning';

export type CustomToast = {
	id: string;
	type: CustomToastType;
	message: string;
	numberOfDuplicates: number;
	onDeleteTimeout?: NodeJS.Timeout;
	lastUpdate: Date;
};

export const toastStore = writable<CustomToast[]>([]);

export function addToast(
	toast: {
		message: string;
		type: CustomToastType;
		consoleLog?: any;
		consoleError?: any;
	},
	lifeTime: number = 5000
) {
	if (dev) {
		if (toast.consoleError) {
			console.error(toast.consoleError);
		}
		if (toast.consoleLog) {
			console.log(toast.consoleLog);
		}
	}

	const duplicateToast = get(toastStore).find(
		(t) => t.message === toast.message && t.type === toast.type
	);
	if (duplicateToast) {
		duplicateToast.numberOfDuplicates++;
		if (duplicateToast.onDeleteTimeout) {
			clearTimeout(duplicateToast.onDeleteTimeout);
		}
		duplicateToast.onDeleteTimeout = setTimeout(() => {
			toastStore.update((toasts) => toasts.filter((toast) => toast.id !== duplicateToast.id));
		}, lifeTime);
		duplicateToast.lastUpdate = new Date();
		toastStore.update((toasts) => toasts);
		return;
	}
	const newToast: CustomToast = {
		id: Math.random().toString(36).substring(7),
		type: toast.type,
		message: toast.message,
		numberOfDuplicates: 1,
		onDeleteTimeout: setTimeout(() => {
			toastStore.update((toasts) => toasts.filter((toast) => toast.id !== newToast.id));
		}, lifeTime),
		lastUpdate: new Date()
	};
	toastStore.update((toasts) => [...toasts, newToast]);
}

export function removeToast(id: string) {
	const toast = get(toastStore).find((toast) => toast.id === id);
	if (toast && toast.onDeleteTimeout) {
		clearTimeout(toast.onDeleteTimeout);
	}
	toastStore.update((toasts) => toasts.filter((toast) => toast.id !== id));
}
