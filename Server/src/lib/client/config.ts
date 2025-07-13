/** The minimum voltage of the batteries where the sensor is still operational */
export const MIN_BATTERY_VOLTAGE = 2.2;
/** The maximum voltage that the batteries can have when new */
export const MAX_BATTERY_VOLTAGE = 3.0;
/** The voltage threshold below which the battery is considered empty */
export const BATTERY_EMPTY_THRESHOLD = 2.3;
/** The voltage threshold below which the battery is considered low */
export const BATTERY_LOW_THRESHOLD = 2.35;
/** The voltage threshold above which the sensor is considered to be connected via USB */
export const USB_CONNECTED_THRESHOLD = 4.0;
/** The minimum voltage to show in the graph */
export const MIN_VOLTAGE_GRAPH = 0;
/** The maximum voltage to show in the graph */
export const MAX_VOLTAGE_GRAPH = 5;

/** If no data was received in this duration the sensor is considered offline */
export const OFFLINE_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

/** The rssi value above which the connection is considered strong */
export const RSSI_STRONG_THRESHOLD = -55;
/** The rssi value above which the connection is considered moderate */
export const RSSI_MODERATE_THRESHOLD = -67;
/** The minimum rssi to show in the graph */
export const MIN_RSSI_GRAPH = -80;
/** The maximum rssi to show in the graph */
export const MAX_RSSI_GRAPH = -45;

/** The maximum raw moisture value coming from the sensor */
export const MAX_FIELD_CAPACITY = 2500;

/** The default sensor configuration for the moisture thresholds */
export const defaultSensorConfig = {
	fieldCapacity: MAX_FIELD_CAPACITY * 0.85,
	permanentWiltingPoint: MAX_FIELD_CAPACITY * 0.15,
	upperThreshold: 0.75,
	lowerThreshold: 0.4
};
