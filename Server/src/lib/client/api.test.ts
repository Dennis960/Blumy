import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Selector Workflow URL Construction Logic', () => {
	it('should correctly construct redirect URL parameters', () => {
		const writeToken = 'blumy_test-write-token-12345678';
		const redirectUrl = 'http://192.168.4.1/setup?existingParam=value';
		const originHttp = 'http://example.com';

		// Simulate the logic from setupSensorOnLocalEsp
		const urlObj = new URL(redirectUrl);
		const query = new URLSearchParams(urlObj.search);
		query.set('token', writeToken);
		query.set('blumyUrl', `${originHttp}/api/v2/data`);
		urlObj.search = query.toString();

		const constructedUrl = urlObj.toString();

		// Verify the URL was constructed correctly
		const parsedUrl = new URL(constructedUrl);
		expect(parsedUrl.searchParams.get('token')).toBe(writeToken);
		expect(parsedUrl.searchParams.get('blumyUrl')).toBe('http://example.com/api/v2/data');
		expect(parsedUrl.searchParams.get('existingParam')).toBe('value');
		expect(parsedUrl.hostname).toBe('192.168.4.1');
		expect(parsedUrl.pathname).toBe('/setup');
	});

	it('should handle HTTPS to HTTP conversion correctly', () => {
		const writeToken = 'blumy_test-token';
		const redirectUrl = 'http://192.168.4.1/setup';
		const httpsOrigin = 'https://blumy.example.com';
		const originHttp = httpsOrigin.replace('https', 'http');

		const urlObj = new URL(redirectUrl);
		const query = new URLSearchParams(urlObj.search);
		query.set('token', writeToken);
		query.set('blumyUrl', `${originHttp}/api/v2/data`);
		urlObj.search = query.toString();

		const constructedUrl = urlObj.toString();
		const parsedUrl = new URL(constructedUrl);

		expect(parsedUrl.searchParams.get('blumyUrl')).toBe('http://blumy.example.com/api/v2/data');
	});

	it('should preserve existing query parameters', () => {
		const writeToken = 'blumy_test-token';
		const redirectUrl = 'http://192.168.4.1/setup?wifi=TestNetwork&timeout=30';
		const originHttp = 'http://example.com';

		const urlObj = new URL(redirectUrl);
		const query = new URLSearchParams(urlObj.search);
		query.set('token', writeToken);
		query.set('blumyUrl', `${originHttp}/api/v2/data`);
		urlObj.search = query.toString();

		const constructedUrl = urlObj.toString();
		const parsedUrl = new URL(constructedUrl);

		expect(parsedUrl.searchParams.get('wifi')).toBe('TestNetwork');
		expect(parsedUrl.searchParams.get('timeout')).toBe('30');
		expect(parsedUrl.searchParams.get('token')).toBe(writeToken);
		expect(parsedUrl.searchParams.get('blumyUrl')).toBe('http://example.com/api/v2/data');
	});

	it('should work with different redirect URL formats', () => {
		const writeToken = 'blumy_test-token';
		const redirectUrl = 'http://test-server.local:8080/configure';
		const originHttp = 'http://example.com';

		const urlObj = new URL(redirectUrl);
		const query = new URLSearchParams(urlObj.search);
		query.set('token', writeToken);
		query.set('blumyUrl', `${originHttp}/api/v2/data`);
		urlObj.search = query.toString();

		const constructedUrl = urlObj.toString();
		const parsedUrl = new URL(constructedUrl);

		expect(parsedUrl.hostname).toBe('test-server.local');
		expect(parsedUrl.port).toBe('8080');
		expect(parsedUrl.pathname).toBe('/configure');
		expect(parsedUrl.searchParams.get('token')).toBe(writeToken);
		expect(parsedUrl.searchParams.get('blumyUrl')).toBe('http://example.com/api/v2/data');
	});

	it('should handle various token formats correctly', () => {
		const tokens = [
			'blumy_abcdefghijklmnopqrstuvwxyz123456',
			'blumy_ABC123DEF456GHI789JKL012MNO345',
			'blumy_mixed123CASEletters456numbers'
		];
		const redirectUrl = 'http://192.168.4.1/setup';
		const originHttp = 'http://example.com';

		tokens.forEach(writeToken => {
			const urlObj = new URL(redirectUrl);
			const query = new URLSearchParams(urlObj.search);
			query.set('token', writeToken);
			query.set('blumyUrl', `${originHttp}/api/v2/data`);
			urlObj.search = query.toString();

			const constructedUrl = urlObj.toString();
			const parsedUrl = new URL(constructedUrl);

			expect(parsedUrl.searchParams.get('token')).toBe(writeToken);
			expect(parsedUrl.searchParams.get('blumyUrl')).toBe('http://example.com/api/v2/data');
		});
	});
});