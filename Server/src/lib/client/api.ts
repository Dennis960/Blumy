import type { SensorCreatedDTO, SensorDTO } from '$lib/types/api';

export enum DATA_DEPENDENCY {
	SENSOR = 'SENSOR',
	SENSOR_OVERVIEW = 'SENSOR_OVERVIEW',
	SENSOR_VALUE_DISTRIBUTION = 'SENSOR_VALUE_DISTRIBUTION'
}

export class MyURL {
	constructor(
		public pathname: string,
		public searchParams: URLSearchParams = new URLSearchParams()
	) {
		this.pathname = pathname;
		this.searchParams = searchParams;
	}

	addPath(path: string) {
		this.pathname += `/${path}`;
		return this;
	}

	addSearchParam(key: string, value: string) {
		this.searchParams.append(key, value);
		return this;
	}

	toString() {
		if (this.searchParams.toString() === '') return this.pathname;
		return `${this.pathname}?${this.searchParams.toString()}`;
	}
}

/**
 * @param _fetch Specify the fetch function to use. Use event.fetch if available because it is faster.
 */
export function clientApi(_fetch: typeof fetch = fetch, baseUrl: string = '') {
	const url = new MyURL(baseUrl).addPath('api');
	const fetchWithInit = <T>(
		init: RequestInit | undefined,
		parse: (res: Response) => Promise<T>
	) => {
		let responseCache: Promise<Response> | undefined = undefined;
		const response = () => {
			if (responseCache === undefined) responseCache = _fetch(url.toString(), init);
			return responseCache;
		};
		return {
			response: response,
			parse: async () => parse(await response()),
			url: url.toString()
		};
	};
	const fetch = <T>(parse: (res: Response) => Promise<T>) => fetchWithInit<T>(undefined, parse);
	return {
		currentAccount: () => {
			url.addPath('currentAccount');
			return {
				updateEmail: (email: string) => {
					url.addPath('email');
					return fetchWithInit(
						{
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({ email })
						},
						(res) => res.text()
					);
				},
				updatePassword: (currentPassword: string, newPassword: string) => {
					url.addPath('password');
					return fetchWithInit(
						{
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								currentPassword,
								newPassword
							})
						},
						(res) => res.text()
					);
				},
				delete: () => {
					return fetchWithInit(
						{
							method: 'DELETE'
						},
						(res) => res.text()
					);
				}
			};
		},
		auth: () => {
			url.addPath('auth');
			return {
				default: () => {
					url.addPath('default');
					return {
						login: (email: string, password: string) => {
							url.addPath('login');
							return fetchWithInit(
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify({ email, password })
								},
								(res) => res.text()
							);
						},
						register: (email: string, password: string) => {
							url.addPath('register');
							return fetchWithInit(
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify({ email, password })
								},
								(res) => res.text()
							);
						}
					};
				},
				google: () => {
					url.addPath('google');
					return {
						login: (redirectUrl?: string) => {
							url.addPath('login');
							if (redirectUrl) url.addSearchParam('redirectUrl', redirectUrl);
							return fetchWithInit(
								{
									method: 'POST'
								},
								(res) => res.text()
							);
						},
						callback: () => {
							url.addPath('callback');
							return fetch((res) => res.text());
						}
					};
				},
				logout: () => {
					url.addPath('logout');
					return fetchWithInit(
						{
							method: 'POST'
						},
						(res) => res.text()
					);
				}
			};
		},
		sensors: () => {
			url.addPath('sensors');
			return {
				create: (config: FormData) => {
					return fetchWithInit<SensorCreatedDTO>(
						{
							method: 'POST',
							body: config
						},
						(res) => res.json()
					);
				},
				withId: (id: number, readToken?: string) => {
					url.addPath(id.toString());
					if (readToken) url.addSearchParam('token', readToken);
					return {
						update: (config: FormData) => {
							url.addPath('settings');
							return fetchWithInit<SensorDTO>(
								{
									method: 'PUT',
									body: config
								},
								(res) => res.json()
							);
						},
						delete: () => {
							return fetchWithInit(
								{
									method: 'DELETE'
								},
								(res) => res.text()
							);
						},
						checkSubscription: (subscription: PushSubscription) => {
							url.addPath('check-subscription');
							return fetchWithInit<boolean>(
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify(subscription)
								},
								(res) => res.json()
							);
						},
						submitSubscription: (subscription: PushSubscription) => {
							url.addPath('subscribe');
							return fetchWithInit<boolean>(
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify(subscription)
								},
								(res) => res.json()
							);
						},
						submitUnsubscription: (subscription: PushSubscription) => {
							url.addPath('unsubscribe');
							return fetchWithInit<boolean>(
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/json'
									},
									body: JSON.stringify(subscription)
								},
								(res) => res.json()
							);
						},
						getImage: (token: string) => {
							url.addPath('image');
							url.addSearchParam('token', token);
							return fetchWithInit<Blob>(undefined, (res) => res.blob());
						}
					};
				}
			};
		},
		sensorList: () => {
			url.addPath('sensorList');
			return {
				withIdsAndTokens: (
					sensors: {
						id: number;
						readToken: string;
					}[]
				) => {
					return fetchWithInit<SensorDTO[]>(
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(sensors)
						},
						(res) => res.json()
					);
				}
			};
		},
		setupSensorOnLocalEsp: (writeToken: string, redirectUrl: string) => {
			const originHttp = window.location.origin.replace('https', 'http');
			const urlObj = new URL(redirectUrl);
			const query = new URLSearchParams(urlObj.search);
			query.set('token', writeToken);
			query.set('blumyUrl', `${originHttp}/api/v2/data`);
			urlObj.search = query.toString();
			location.href = urlObj.toString();
		}
	};
}
