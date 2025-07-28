import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SensorConfigurationDTO } from '$lib/types/api';
import SensorController from './SensorController';
import SensorRepository from '../repositories/SensorRepository';
import SensorEntity from '../entities/SensorEntity';
import type { sensors } from '../db/schema';

// Mock the SensorRepository
vi.mock('../repositories/SensorRepository', () => ({
	default: {
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

// Mock the SensorEntity to avoid Sharp image processing
vi.mock('../entities/SensorEntity', () => ({
	default: {
		fromDTO: vi.fn(),
		toDTO: vi.fn()
	}
}));

describe('SensorController', () => {
	let sensorController: SensorController;
	const mockSensorRepository = vi.mocked(SensorRepository);
	const mockSensorEntity = vi.mocked(SensorEntity);

	beforeEach(() => {
		sensorController = new SensorController();
		vi.clearAllMocks();
		
		// Mock SensorEntity.fromDTO to return a simple redacted entity
		mockSensorEntity.fromDTO.mockResolvedValue({
			sensorAddress: 0,
			name: 'Test Sensor',
			imageBase64: 'processed-base64-image',
			fieldCapacity: 1024,
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800
		});

		// Mock SensorEntity.toDTO to return a configuration
		mockSensorEntity.toDTO.mockReturnValue({
			name: 'Test Sensor',
			imageBase64: 'processed-base64-image',
			permanentWiltingPoint: 100,
			lowerThreshold: 300,
			upperThreshold: 800,
			fieldCapacity: 1024
		});
	});

	describe('create', () => {
		it('should create a sensor with valid configuration', async () => {
			// Arrange
			const ownerId = 'test-user-id';
			const config: SensorConfigurationDTO = {
				name: 'Test Sensor',
				imageBase64: 'base64string',
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				fieldCapacity: 1024
			};

			const mockCreatedSensor: typeof sensors.$inferSelect = {
				sensorAddress: 1,
				name: 'Test Sensor',
				imageBase64: 'processed-base64-image',
				fieldCapacity: 1024,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				owner: ownerId,
				writeToken: 'blumy_test-write-token-12345678',
				readToken: 'test-read-token-16'
			};

			mockSensorRepository.create.mockResolvedValue(mockCreatedSensor);

			// Act
			const result = await sensorController.create(ownerId, config);

			// Assert
			expect(mockSensorEntity.fromDTO).toHaveBeenCalledWith(0, config);
			expect(mockSensorRepository.create).toHaveBeenCalledOnce();
			
			const createCall = mockSensorRepository.create.mock.calls[0][0];
			expect(createCall).toMatchObject({
				name: 'Test Sensor',
				imageBase64: 'processed-base64-image',
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				fieldCapacity: 1024,
				owner: ownerId,
				sensorAddress: undefined
			});

			// Check that tokens are generated
			expect(createCall.writeToken).toMatch(/^blumy_.{32}$/);
			expect(createCall.readToken).toMatch(/^.{16}$/);

			// Check return value
			expect(result).toEqual({
				tokens: {
					read: 'test-read-token-16',
					write: 'blumy_test-write-token-12345678'
				},
				id: 1,
				config: {
					name: 'Test Sensor',
					imageBase64: 'processed-base64-image',
					permanentWiltingPoint: 100,
					lowerThreshold: 300,
					upperThreshold: 800,
					fieldCapacity: 1024
				}
			});
		});

		it('should generate unique write tokens with blumy_ prefix', async () => {
			const ownerId = 'test-user';
			const config: SensorConfigurationDTO = {
				name: 'Test',
				imageBase64: undefined,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				fieldCapacity: 1024
			};

			// Update mock for no image case
			mockSensorEntity.fromDTO.mockResolvedValue({
				sensorAddress: 0,
				name: 'Test',
				imageBase64: null,
				fieldCapacity: 1024,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800
			});

			const mockSensor: typeof sensors.$inferSelect = {
				sensorAddress: 1,
				name: 'Test',
				imageBase64: null,
				fieldCapacity: 1024,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				owner: ownerId,
				writeToken: 'blumy_abcdefghijklmnopqrstuvwxyz123456',
				readToken: 'abcdefghijklmnop'
			};

			mockSensorRepository.create.mockResolvedValue(mockSensor);

			// Create multiple sensors
			await sensorController.create(ownerId, config);
			await sensorController.create(ownerId, config);

			const call1 = mockSensorRepository.create.mock.calls[0][0];
			const call2 = mockSensorRepository.create.mock.calls[1][0];

			// Both should have blumy_ prefix and 32 chars after
			expect(call1.writeToken).toMatch(/^blumy_.{32}$/);
			expect(call2.writeToken).toMatch(/^blumy_.{32}$/);
			
			// Tokens should be different (though this could theoretically fail due to randomness)
			expect(call1.writeToken).not.toBe(call2.writeToken);
			expect(call1.readToken).not.toBe(call2.readToken);
		});

		it('should generate read tokens with 16 characters', async () => {
			const ownerId = 'test-user';
			const config: SensorConfigurationDTO = {
				name: 'Test',
				imageBase64: undefined,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				fieldCapacity: 1024
			};

			// Update mock for no image case
			mockSensorEntity.fromDTO.mockResolvedValue({
				sensorAddress: 0,
				name: 'Test',
				imageBase64: null,
				fieldCapacity: 1024,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800
			});

			const mockSensor: typeof sensors.$inferSelect = {
				sensorAddress: 1,
				name: 'Test',
				imageBase64: null,
				fieldCapacity: 1024,
				permanentWiltingPoint: 100,
				lowerThreshold: 300,
				upperThreshold: 800,
				owner: ownerId,
				writeToken: 'blumy_abcdefghijklmnopqrstuvwxyz123456',
				readToken: 'abcdefghijklmnop'
			};

			mockSensorRepository.create.mockResolvedValue(mockSensor);

			await sensorController.create(ownerId, config);

			const createCall = mockSensorRepository.create.mock.calls[0][0];
			expect(createCall.readToken).toMatch(/^.{16}$/);
		});
	});
});