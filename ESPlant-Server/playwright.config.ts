import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		stdout: "pipe",
		stderr: "pipe",
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		launchOptions: {
			ignoreDefaultArgs: ['--disable-extensions'],
			args: [
				'--disable-web-security',
				'--disable-features=IsolateOrigins,site-per-process',
			],
		},
	},
	reporter: "line",
};

export default config;
