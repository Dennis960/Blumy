import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		stdout: "pipe",
		stderr: "pipe",
	},
	workers: 1,
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		// Use system Chrome instead of downloading Playwright browsers
		channel: 'chrome',
		launchOptions: {
			ignoreDefaultArgs: ['--disable-extensions'],
			args: [
				'--disable-web-security',
				'--disable-features=IsolateOrigins,site-per-process',
			],
		},
	},
	projects: [
		{
			name: 'chromium',
			use: { 
				// Use system Chrome
				channel: 'chrome',
			},
		},
	],
	reporter: [["line"], ["playwright-ctrf-json-reporter", {
		outputDir: "test-results",
	}]],
};

export default config;
