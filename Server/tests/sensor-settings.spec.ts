import { expect, test } from '@playwright/test';
import { authenticateTestUser } from './test-auth-service';
import { resetDatabase, testDb } from './test-db';
import { sensors } from '$lib/server/db/schema';

test.beforeEach(async () => {
	await resetDatabase();
});

test.describe('Sensor Settings API', () => {
	test('authenticated user can update sensor settings', async ({ request }) => {
		const { user: testUser, cookie } = await authenticateTestUser();

		// Create a test sensor
		const [testSensor] = await testDb.insert(sensors).values({
			sensorAddress: 99,
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
			.where(sensors.sensorAddress.eq(testSensor.sensorAddress));
		
		expect(updatedSensor.name).toBe('Updated Sensor Name');
		expect(updatedSensor.fieldCapacity).toBe(2048);
		expect(updatedSensor.permanentWiltingPoint).toBe(150);
		expect(updatedSensor.lowerThreshold).toBe(400);
		expect(updatedSensor.upperThreshold).toBe(900);
	});

	test('unauthenticated user cannot update sensor settings', async ({ request }) => {
		// Create a test sensor (without authenticating)
		const [testSensor] = await testDb.insert(sensors).values({
			sensorAddress: 99,
			name: 'Test Sensor',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: 'some-other-user',
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

		// Create a sensor owned by a different user
		const [otherUserSensor] = await testDb.insert(sensors).values({
			sensorAddress: 99,
			name: 'Other Users Sensor',
			imageBase64: null,
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			owner: 'different-user-id',
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
			.where(sensors.sensorAddress.eq(otherUserSensor.sensorAddress));
		
		expect(unchangedSensor.name).toBe('Other Users Sensor');
		expect(unchangedSensor.fieldCapacity).toBe(1024);
	});

	test('sensor creation endpoint works correctly', async ({ request }) => {
		const { user: testUser, cookie } = await authenticateTestUser();

		const formData = new FormData();
		formData.append('name', 'New API Sensor');
		formData.append('fieldCapacity', '1536');
		formData.append('permanentWiltingPoint', '120');
		formData.append('lowerThreshold', '350');
		formData.append('upperThreshold', '850');
		formData.append('image', new File([''], 'empty.png', { type: 'image/png' }));

		const response = await request.post('/api/sensors', {
			data: formData,
			headers: {
				'Cookie': `${cookie.name}=${cookie.value}`
			}
		});

		expect(response.status()).toBe(200);

		const createdSensor = await response.json();
		expect(createdSensor).toHaveProperty('id');
		expect(createdSensor).toHaveProperty('tokens');
		expect(createdSensor.tokens).toHaveProperty('read');
		expect(createdSensor.tokens).toHaveProperty('write');
		expect(createdSensor.tokens.write).toMatch(/^blumy_.{32}$/);
		expect(createdSensor.tokens.read).toMatch(/^.{16}$/);

		expect(createdSensor.config).toMatchObject({
			name: 'New API Sensor',
			fieldCapacity: 1536,
			permanentWiltingPoint: 120,
			lowerThreshold: 350,
			upperThreshold: 850
		});

		// Verify the sensor was created in the database
		const dbSensors = await testDb.select().from(sensors)
			.where(sensors.owner.eq(testUser.id));
		
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