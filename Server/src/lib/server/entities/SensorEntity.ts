import type { SensorConfigurationDTO } from '$lib/types/api';

type RedactedSensorEntity = Omit<SensorEntity, 'owner' | 'readToken' | 'writeToken'>;

export default class SensorEntity {
	constructor(
		public sensorAddress: number,
		public name: string,
		public fieldCapacity: number, // sensor unit
		public permanentWiltingPoint: number,
		public lowerThreshold: number, // relative to fieldCapacity
		public upperThreshold: number,
		public owner: string | null,
		public writeToken: string,
		public readToken: string
	) {}

	public static async fromDTO(
		id: number,
		dto: SensorConfigurationDTO
	): Promise<RedactedSensorEntity> {
		return {
			sensorAddress: id,
			name: dto.name,
			fieldCapacity: dto.fieldCapacity,
			permanentWiltingPoint: dto.permanentWiltingPoint,
			lowerThreshold: dto.lowerThreshold,
			upperThreshold: dto.upperThreshold
		};
	}

	public static toDTO(entity: RedactedSensorEntity): SensorConfigurationDTO {
		return {
			name: entity.name,
			fieldCapacity: entity.fieldCapacity,
			permanentWiltingPoint: entity.permanentWiltingPoint,
			lowerThreshold: entity.lowerThreshold,
			upperThreshold: entity.upperThreshold
		};
	}
}
