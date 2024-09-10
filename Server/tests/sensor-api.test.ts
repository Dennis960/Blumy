import { sensorReadings, sensors, users } from "$lib/server/db/schema";
import type SensorEntity from '$lib/server/entities/SensorEntity';
import type { ESPSensorReadingDTO } from '$lib/server/entities/SensorReadingEntity';
import { expect, test } from '@playwright/test';
import { count } from 'drizzle-orm';
import { createTestUser } from "./test-auth-service";
import { resetDatabase, testDb } from './test-db';

const API_URL = 'http://localhost:4173/api'

let testUser: typeof users.$inferSelect;

let testSensor: SensorEntity;

const testDate: Omit<ESPSensorReadingDTO, 'sensorAddress'> = {
    light: 1024,
    voltage: 3.2,
    temperature: 24.5,
    humidity: 53.10,
    isUsbConnected: false,
    moisture: 879,
    moistureStabilizationTime: 2034,
    isMoistureMeasurementSuccessful: true,
    humidityRaw: 123123,
    temperatureRaw: 123123,
    rssi: -36,
    duration: 3083,
}

async function countData() {
    return (await testDb.select({ count: count() }).from(sensorReadings))[0].count;
}

test.beforeEach(async () => {
    await resetDatabase();
    testUser = await createTestUser();
    testSensor = {
        sensorAddress: 99,
        name: 'test-sensor',
        imageBase64: null,
        fieldCapacity: 1024,
        permanentWiltingPoint: 100,
        lowerThreshold: 300,
        upperThreshold: 800,
        owner: testUser.id,
        writeToken: 'test-token-write',
        readToken: 'test-token-read',
    }
    await testDb
        .insert(sensors)
        .values(testSensor);
})

test('/data returns 401 if not authenticated', async () => {
    const response = await fetch(`${API_URL}/v2/data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testDate),
    })
    expect(response.status).toBe(401)
})

test('/data returns 403 if sending illegal token', async () => {
    const response = await fetch(`${API_URL}/v2/data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer doesnotexist',
        },
        body: JSON.stringify(testDate),
    })
    expect(response.status).toBe(401)
})

test('/data inserts data if authenticated', async () => {
    const beforeCount = await countData()

    const response = await fetch(`${API_URL}/v2/data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testSensor.writeToken}`,
        },
        body: JSON.stringify(testDate),
    })
    expect(response.status).toBe(200)

    const afterCount = await countData()

    expect(afterCount).toBe(beforeCount + 1)
})
