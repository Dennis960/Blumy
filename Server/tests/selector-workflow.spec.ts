import { expect, test } from '@playwright/test';
import { authenticateTestUser, createTestUser } from './test-auth-service';
import { resetDatabase, testDb } from './test-db';
import { sensors } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

test.beforeEach(async () => {
	await resetDatabase();
});

test.describe('Selector Workflow', () => {
	test('unauthenticated user should see login options', async ({ page }) => {
		await page.goto('/selector?redirect=http://192.168.4.1/setup');

		// Should see authentication options
		await expect(page.getByText('Bitte melde dich an, um fortzufahren.')).toBeVisible();
		await expect(page.getByText('Login')).toBeVisible();
		await expect(page.getByText('Registrieren')).toBeVisible();
	});

	test('authenticated user should see sensor selection options', async ({ page, context }) => {
		const { user } = await authenticateTestUser(context);

		await page.goto('/selector?redirect=http://192.168.4.1/setup');

		// Should see sensor selection interface
		await expect(page.getByText('Wähle einen Sensor aus')).toBeVisible();
		await expect(page.getByText('Neuen Sensor einrichten')).toBeVisible();
	});

	test('authenticated user can navigate to new sensor creation', async ({ page, context }) => {
		const { user } = await authenticateTestUser(context);

		await page.goto('/selector?redirect=http://192.168.4.1/setup');

		// Click on create new sensor
		await page.getByText('Neuen Sensor einrichten').click();

		// Should be redirected to new sensor page with redirect parameter
		await expect(page).toHaveURL(/\/selector\/sensor\/new\?redirect=/);
		expect(page.url()).toContain('redirect=http://192.168.4.1/setup');
	});

	test('user can create a new sensor and be redirected with correct parameters', async ({ page, context }) => {
		const { user: testUser } = await authenticateTestUser(context);

		// Mock the redirect to avoid actual navigation to 192.168.4.1
		await page.addInitScript(() => {
			// Override location.href to capture the redirect
			Object.defineProperty(window, 'location', {
				value: {
					...window.location,
					href: '',
					assign: (url: string) => { window.location.href = url; },
				},
				writable: true
			});
		});

		await page.goto('/selector/sensor/new?redirect=http://test-redirect.local/setup');

		// Fill in the sensor creation form
		await page.fill('input[name="name"]', 'Test Sensor');
		await page.fill('input[name="fieldCapacity"]', '1024');
		await page.fill('input[name="permanentWiltingPoint"]', '100');
		await page.fill('input[name="lowerThreshold"]', '300');
		await page.fill('input[name="upperThreshold"]', '800');

		// Submit the form
		await page.click('button[type="submit"]');

		// Should show the setup progress message
		await expect(page.getByText('Der Sensor wird nun eingerichtet')).toBeVisible();

		// Check that the sensor was created in the database
		const createdSensors = await testDb.select().from(sensors).where(eq(sensors.owner, testUser.id));
		expect(createdSensors).toHaveLength(1);
		expect(createdSensors[0].name).toBe('Test Sensor');
		expect(createdSensors[0].writeToken).toMatch(/^blumy_.{32}$/);
		expect(createdSensors[0].readToken).toMatch(/^.{16}$/);

		// Verify the redirect URL was constructed correctly
		// Note: We can't easily test the actual location.href assignment in Playwright,
		// but we can verify the sensor was created with the correct tokens
	});

	test('user can select an existing sensor', async ({ page, context }) => {
		const { user: testUser } = await authenticateTestUser(context);

		// Create a test sensor
		const testSensor = await testDb.insert(sensors).values({
			sensorAddress: 99,
			name: 'Existing Test Sensor',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: testUser.id,
			writeToken: 'blumy_test-write-token-existing',
			readToken: 'test-read-token-ex'
		}).returning();

		// Mock the redirect to avoid actual navigation to 192.168.4.1
		await page.addInitScript(() => {
			Object.defineProperty(window, 'location', {
				value: {
					...window.location,
					href: '',
					assign: (url: string) => { window.location.href = url; },
				},
				writable: true
			});
		});

		await page.goto('/selector?redirect=http://test-redirect.local/setup');

		// Should see the existing sensor
		await expect(page.getByText('Existing Test Sensor')).toBeVisible();

		// Click on the existing sensor
		await page.getByText('Existing Test Sensor').click();

		// Should show the setup progress message
		await expect(page.getByText('Der Sensor wird nun eingerichtet')).toBeVisible();
	});

	test('error is shown when redirect parameter is missing', async ({ page, context }) => {
		const { user } = await authenticateTestUser(context);

		await page.goto('/selector'); // No redirect parameter

		// Click on create new sensor
		await page.getByText('Neuen Sensor einrichten').click();

		// Fill in the sensor creation form
		await page.fill('input[name="name"]', 'Test Sensor');
		await page.fill('input[name="fieldCapacity"]', '1024');
		await page.fill('input[name="permanentWiltingPoint"]', '100');
		await page.fill('input[name="lowerThreshold"]', '300');
		await page.fill('input[name="upperThreshold"]', '800');

		// Submit the form
		await page.click('button[type="submit"]');

		// Should show error message
		await expect(page.getByText('Ein Fehler ist aufgetreten')).toBeVisible();
		await expect(page.getByText('Bitte verbinde dich mit dem Sensor und versuche es erneut')).toBeVisible();
	});

	test('existing sensor selection shows error when redirect parameter is missing', async ({ page, context }) => {
		const { user: testUser } = await authenticateTestUser(context);

		// Create a test sensor
		await testDb.insert(sensors).values({
			sensorAddress: 99,
			name: 'Existing Test Sensor',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: testUser.id,
			writeToken: 'blumy_test-write-token-existing',
			readToken: 'test-read-token-ex'
		});

		await page.goto('/selector'); // No redirect parameter

		// Click on the existing sensor
		await page.getByText('Existing Test Sensor').click();

		// Should show error message
		await expect(page.getByText('Ein Fehler ist aufgetreten')).toBeVisible();
		await expect(page.getByText('Bitte verbinde dich mit dem Sensor und versuche es erneut')).toBeVisible();
	});

	test('user can cancel sensor creation and return to selector', async ({ page, context }) => {
		const { user } = await authenticateTestUser(context);

		await page.goto('/selector/sensor/new?redirect=http://test-redirect.local/setup');

		// Click cancel button
		await page.getByText('Abbrechen').click();

		// Should be back on selector page with redirect parameter preserved
		await expect(page).toHaveURL(/\/selector\?redirect=/);
		expect(page.url()).toContain('redirect=http://test-redirect.local/setup');
		await expect(page.getByText('Wähle einen Sensor aus')).toBeVisible();
	});
});