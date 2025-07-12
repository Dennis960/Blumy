/**The minimum voltage of the batteries where the sensor is still operational */
export const MIN_BATTERY_VOLTAGE = 2.2;
/**The maximum voltage that the batteries can have when new */
export const MAX_BATTERY_VOLTAGE = 3.0;
/**The voltage threshold below which the battery is considered empty */
export const BATTERY_EMPTY_THRESHOLD = 2.3;
/**The voltage threshold below which the battery is considered low */
export const BATTERY_LOW_THRESHOLD = 2.35;
/**The voltage threshold above which the sensor is considered to be connected via USB */
export const USB_CONNECTED_THRESHOLD = 4.0;
/**The minimum voltage to show in the graph */
export const MIN_VOLTAGE_GRAPH = 0;
/**The maximum voltage to show in the graph */
export const MAX_VOLTAGE_GRAPH = 5;

/**If no data was received in this duration the sensor is considered offline */
export const OFFLINE_TIMEOUT = 120 * 60 * 1000; // 2 hours

/**The rssi value above which the connection is considered strong */
export const RSSI_STRONG_THRESHOLD = -55;
/**The rssi value above which the connection is considered moderate */
export const RSSI_MODERATE_THRESHOLD = -67;