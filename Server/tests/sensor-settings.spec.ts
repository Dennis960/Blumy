import { expect, test } from '@playwright/test';
import { authenticateTestUser } from './test-auth-service';
import { resetDatabase, testDb } from './test-db';
import { sensors, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

test.beforeEach(async () => {
	await resetDatabase();
});

test.describe('Sensor Settings API', () => {
	test('authenticated user can update sensor settings', async ({ request }) => {
		const { user: testUser, cookie } = await authenticateTestUser();

		// Create a test sensor
		const [testSensor] = await testDb.insert(sensors).values({
			name: 'Original Sensor Name',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: testUser.id,
			writeToken: 'blumy_test-write-token',
			readToken: 'test-read-token'
		}).returning();

		// Create FormData for the update
		const formData = new FormData();
		formData.append('name', 'Updated Sensor Name');
		formData.append('fieldCapacity', '2048');
		formData.append('permanentWiltingPoint', '150');
		formData.append('lowerThreshold', '400');
		formData.append('upperThreshold', '900');
		formData.append('image', new File([''], 'empty.png', { type: 'image/png' }));

		// Update sensor settings with authentication cookie
		const response = await request.put(`/api/sensors/${testSensor.sensorAddress}/settings`, {
			data: formData,
			headers: {
				'Cookie': `${cookie.name}=${cookie.value}`
			}
		});

		expect(response.status()).toBe(200);

		const updatedConfig = await response.json();
		expect(updatedConfig).toMatchObject({
			name: 'Updated Sensor Name',
			fieldCapacity: 2048,
			permanentWiltingPoint: 150,
			lowerThreshold: 400,
			upperThreshold: 900
		});

		// Verify the sensor was updated in the database
		const [updatedSensor] = await testDb.select().from(sensors)
			.where(eq(sensors.sensorAddress, testSensor.sensorAddress));
		
		expect(updatedSensor.name).toBe('Updated Sensor Name');
		expect(updatedSensor.fieldCapacity).toBe(2048);
		expect(updatedSensor.permanentWiltingPoint).toBe(150);
		expect(updatedSensor.lowerThreshold).toBe(400);
		expect(updatedSensor.upperThreshold).toBe(900);
	});

	test('unauthenticated user cannot update sensor settings', async ({ request }) => {
		// Create a test user to own the sensor
		const [testUser] = await testDb.insert(users).values({
			id: 'test-user-for-unauth-test',
			email: 'unauth-test@example.com',
			username: 'unauthuser',
			avatarUrl: 'https://example.com/avatar.png'
		}).returning();
		
		// Create a test sensor (without authenticating)
		const [testSensor] = await testDb.insert(sensors).values({
			sensorAddress: 99,
			name: 'Test Sensor',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: testUser.id,
			writeToken: 'blumy_test-write-token',
			readToken: 'test-read-token'
		}).returning();

		const formData = new FormData();
		formData.append('name', 'Hacked Name');
		formData.append('fieldCapacity', '999');
		formData.append('permanentWiltingPoint', '50');
		formData.append('lowerThreshold', '100');
		formData.append('upperThreshold', '200');
		formData.append('image', new File([''], 'empty.png', { type: 'image/png' }));

		const response = await request.put(`/api/sensors/${testSensor.sensorAddress}/settings`, {
			data: formData
		});

		// Should be unauthorized
		expect(response.status()).toBe(302); // Redirect to login
	});

	test('user cannot update another users sensor', async ({ request }) => {
		const { user: testUser, cookie } = await authenticateTestUser();

		// Create another user
		const otherUser = await testDb.insert(users).values({
			id: `other-user-${Date.now()}`,
			email: `other-${Date.now()}@example.com`,
		}).returning().then((users) => users[0]);

		// Create a sensor owned by the other user
		const [otherUserSensor] = await testDb.insert(sensors).values({
			name: 'Other Users Sensor',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: otherUser.id,
			writeToken: 'blumy_other-write-token',
			readToken: 'other-read-token'
		}).returning();

		const formData = new FormData();
		formData.append('name', 'Hacked Name');
		formData.append('fieldCapacity', '999');
		formData.append('permanentWiltingPoint', '50');
		formData.append('lowerThreshold', '100');
		formData.append('upperThreshold', '200');
		formData.append('image', new File([''], 'empty.png', { type: 'image/png' }));

		const response = await request.put(`/api/sensors/${otherUserSensor.sensorAddress}/settings`, {
			data: formData,
			headers: {
				'Cookie': `${cookie.name}=${cookie.value}`
			}
		});

		// Should be forbidden
		expect(response.status()).toBe(403);

		// Verify the sensor was NOT updated
		const [unchangedSensor] = await testDb.select().from(sensors)
			.where(eq(sensors.sensorAddress, otherUserSensor.sensorAddress));
		
		expect(unchangedSensor.name).toBe('Other Users Sensor');
		expect(unchangedSensor.fieldCapacity).toBe(1024);
	});

	test('sensor creation endpoint works correctly', async ({ page }) => {
		const { user: testUser, cookie } = await authenticateTestUser(page.context());

		// Navigate to the sensor creation form
		await page.goto('/selector/sensor/new?redirect=http://192.168.4.1/setup');
		
		// Fill out the form
		await page.fill('input[name="name"]', 'New API Sensor');
		await page.fill('input[name="permanentWiltingPoint"]', '120');
		await page.fill('input[name="lowerThreshold"]', '350');
		await page.fill('input[name="upperThreshold"]', '850');
		await page.fill('input[name="fieldCapacity"]', '1536');
		
		// Upload a fake image file
		const fileInput = page.locator('input[name="image"]');
		await fileInput.setInputFiles({
			name: 'test.png',
			mimeType: 'image/png',
			buffer: Buffer.from('fake-png-data')
		});

		// Submit the form and wait for the response
		const [response] = await Promise.all([
			page.waitForResponse('/api/sensors'),
			page.locator('button[type="submit"]').click()
		]);

		expect(response.status()).toBe(200);

		const responseData = await response.json();
		expect(responseData).toHaveProperty('id');
		expect(responseData).toHaveProperty('tokens');
		expect(responseData.tokens).toHaveProperty('read');
		expect(responseData.tokens).toHaveProperty('write');
		expect(responseData.tokens.write).toMatch(/^blumy_.{32}$/);
		expect(responseData.tokens.read).toMatch(/^.{16}$/);

		expect(responseData.config).toMatchObject({
			name: 'New API Sensor',
			fieldCapacity: 1536,
			permanentWiltingPoint: 120,
			lowerThreshold: 350,
			upperThreshold: 850
		});

		// Verify the sensor was created in the database
		const dbSensors = await testDb.select().from(sensors)
			.where(eq(sensors.owner, testUser.id));
		
		expect(dbSensors).toHaveLength(1);
		expect(dbSensors[0].name).toBe('New API Sensor');
		expect(dbSensors[0].sensorAddress).toBe(createdSensor.id);
	});

	test('unauthenticated user cannot create sensor', async ({ request }) => {
		const formData = new FormData();
		formData.append('name', 'Unauthorized Sensor');
		formData.append('fieldCapacity', '1024');
		formData.append('permanentWiltingPoint', '100');
		formData.append('lowerThreshold', '300');
		formData.append('upperThreshold', '800');
		formData.append('image', new File([''], 'empty.png', { type: 'image/png' }));

		// Make request without authentication cookie
		const response = await request.post('/api/sensors', {
			data: formData
		});

		// Should be unauthorized/redirected
		expect(response.status()).toBe(302);

		// Verify no sensor was created
		const dbSensors = await testDb.select().from(sensors);
		expect(dbSensors).toHaveLength(0);
	});
});