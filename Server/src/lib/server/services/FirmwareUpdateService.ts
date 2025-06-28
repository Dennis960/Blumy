import { env as publicEnv } from '$env/dynamic/public';

export default class FirmwareUpdateService {
	private static latestFirmwareUrl: string | null = null;
	private static latestFirmwareVersion: number | null = null;
	private static url = 'http://firmware.blumy.cloud/firmware/';

	private static async fetchFirmwareVersions(): Promise<number[]> {
		if (publicEnv.PUBLIC_MODE === 'test-ci' || publicEnv.PUBLIC_MODE === 'test') {
			console.log('Skipping firmware version fetch in test mode');
			return [1];
		}
		try {
			const response = await fetch(this.url);
			if (!response.ok) {
				throw new Error(`Failed to fetch directory listing: ${response.statusText}`);
			}

			const html = await response.text();

			const regex = /href="firmware-([^"]*?)\.bin"/g;

			const versions: number[] = [];
			let match;
			while ((match = regex.exec(html)) !== null) {
				versions.push(Number(match[1]));
			}

			return versions;
		} catch (error) {
			console.error('Error fetching firmware list:', error);
			return [];
		}
	}

	static async fetchAndSaveLatestFirmwareVersion() {
		const versions = await this.fetchFirmwareVersions();
		if (versions.length === 0) {
			return;
		}
		const latestVersion = Math.max(...versions);
		const latestFirmwareUrl = `${this.url}firmware-${latestVersion}.bin`;
		if (this.latestFirmwareUrl !== latestFirmwareUrl) {
			console.log(`Latest firmware version updated: ${latestVersion}`);
			this.latestFirmwareUrl = `${this.url}firmware-${latestVersion}.bin`;
			this.latestFirmwareVersion = latestVersion;
		}
	}

	static getLatestFirmwareUrl(): string | null {
		return this.latestFirmwareUrl;
	}

	static getLatestFirmwareVersion(): number | null {
		return this.latestFirmwareVersion;
	}
}
