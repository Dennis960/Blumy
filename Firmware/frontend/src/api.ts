import { loadingState } from "./states";
export type Network = {
    rssi: number;
    ssid: string;
    secure: number;
};

export enum WifiStatus {
    CONNECTED = 0,
    DISCONNECTED = 1,
    UNINITIALIZED = 2,
    FAIL = 3,
    PASSWORD_WRONG = 4,
    PENDING = 5,
    ERROR = 10,
}

export interface SensorData {
    temperature: number;
    humidity: number;
    light: number;
    moisture: number;
    voltage: number;
}

export const cloudConfigurationTypes = ["http", "mqtt", "blumy"] as const;

export type CloudConfigurationType = (typeof cloudConfigurationTypes)[number];

export interface HttpCloudConfiguration extends Record<string, string> {
    type: (typeof cloudConfigurationTypes)[0];
    sensorId: string;
    url: string;
    auth: string;
}

export interface MqttCloudConfiguration extends Record<string, string> {
    type: (typeof cloudConfigurationTypes)[1];
    sensorId: string;
    server: string;
    port: string;
    username: string;
    password: string;
    topic: string;
    clientId: string;
}

export interface BlumyCloudConfiguration extends Record<string, string> {
    type: (typeof cloudConfigurationTypes)[2];
    token: string;
    url: string;
}

export type CloudConfiguration =
    | HttpCloudConfiguration
    | MqttCloudConfiguration
    | BlumyCloudConfiguration;

/* fetch loading state indicator */
const fetch = new Proxy(window.fetch, {
    apply: async (target, thisArgs, args: [RequestInfo, RequestInit?]) => {
        loadingState.state++;
        try {
            const res = await target.apply(thisArgs, args);
            return res;
        } finally {
            loadingState.state--;
        }
    },
});

async function postDataToEsp(
    url: string,
    params?: Record<string, string> | string
) {
    const body = params
        ? typeof params === "string"
            ? params
            : Object.entries(params)
                  .map(([key, value]) => key + "=" + value)
                  .join("\n") + "\n"
        : undefined;
    return await fetch("/api" + url, {
        method: "POST",
        body,
    });
}

async function getDataFromEsp(
    url: string,
    _fetch: typeof window.fetch = fetch
) {
    return await _fetch("/api" + url)
        .then((response) => response.json())
        .catch(() => null);
}

async function getDataFromEspWithoutLoadingState(url: string) {
    return await getDataFromEsp(url, window.fetch);
}

export async function connectToNetwork(ssid: string, password: string) {
    return await postDataToEsp("/connect", { ssid, password });
}

export async function resetEsp() {
    return await postDataToEsp("/reset");
}

export async function getNetworks(): Promise<Network[]> {
    return await getDataFromEsp("/networks");
}

export async function isConnected(
    enableLoadingState = true
): Promise<WifiStatus> {
    const res = await (enableLoadingState
        ? getDataFromEsp
        : getDataFromEspWithoutLoadingState)("/isConnected");
    if (res == null) {
        return WifiStatus.ERROR;
    }
    return Number(res);
}

export async function getConnectedNetwork(enableLoadingState = true): Promise<{
    ssid: string;
    status: WifiStatus;
    rssi: number;
}> {
    return await (enableLoadingState
        ? getDataFromEsp
        : getDataFromEspWithoutLoadingState)("/connectedNetwork");
}

export async function setCloudCredentials(config: CloudConfiguration) {
    return await postDataToEsp(`/cloudSetup/${config.type}`, config);
}

export async function getCloudCredentials<T extends CloudConfigurationType>(
    type: T
): Promise<
    T extends "http"
        ? HttpCloudConfiguration
        : T extends "mqtt"
        ? MqttCloudConfiguration
        : BlumyCloudConfiguration
> {
    return await getDataFromEsp(`/cloudSetup/${type}`);
}

export async function testCloudConnection(
    config: CloudConfiguration
): Promise<boolean> {
    return await postDataToEsp(`/cloudTest/${config.type}`, config).then(
        (res) => res.json()
    );
}

export async function disableCloudConnection(key: CloudConfigurationType) {
    return await postDataToEsp(`/cloudDisable/${key}`);
}

export async function setSleepTimeout(timeout: number) {
    timeout = Math.round(timeout);
    return await postDataToEsp("/timeouts/sleep", timeout.toString());
}

export async function getSleepTimeout() {
    return Number(await getDataFromEsp("/timeouts/sleep"));
}

export async function setConfigurationModeTimeout(timeout: number) {
    timeout = Math.round(timeout);
    return await postDataToEsp(
        "/timeouts/configurationMode",
        timeout.toString()
    );
}

export async function getConfigurationModeTimeout() {
    return Number(await getDataFromEsp("/timeouts/configurationMode"));
}

export async function setMqttMessageTimeout(timeout: number) {
    timeout = Math.round(timeout);
    return await postDataToEsp("/timeouts/mqttMessage", timeout.toString());
}

export async function getMqttMessageTimeout() {
    return Number(await getDataFromEsp("/timeouts/mqttMessage"));
}

export async function setWatchDogTimeout(timeout: number) {
    timeout = Math.round(timeout);
    return await postDataToEsp("/timeouts/wdt", timeout.toString());
}

export async function getWatchDogTimeout() {
    return Number(await getDataFromEsp("/timeouts/wdt"));
}

export async function getUpdatePercentage() {
    return Number(
        await getDataFromEspWithoutLoadingState("/update/percentage")
    );
}

export async function getSensorData(): Promise<SensorData> {
    return await getDataFromEsp("/sensor/data");
}

export async function factoryResetEsp() {
    return await postDataToEsp("/factoryReset");
}

export async function updateFirmware(url: string) {
    return await postDataToEsp("/update/firmware", { url });
}

export async function getUpdateFirmwareUrl(): Promise<{ url: string }> {
    return await getDataFromEsp("/update/firmware");
}

export async function checkUpdateAvailable(url: string): Promise<boolean> {
    return await postDataToEsp("/update/check", { url }).then((res) =>
        res.json()
    );
}

export async function getFirmwareVersion(): Promise<number> {
    return await getDataFromEsp("/firmware/version");
}

export async function getLedBrightness(): Promise<number> {
    return await getDataFromEsp("/led/brightness");
}

export async function setLedBrightness(brightness: number) {
    brightness = Math.round(brightness);
    return await postDataToEsp("/led/brightness", brightness.toString());
}

export async function plantnowHasReceivedPeerMac(): Promise<string> {
    return await getDataFromEsp("/plantnow/hasReceivedPeerMac", window.fetch);
}

export async function plantnowSendCredentials(): Promise<boolean> {
    return await postDataToEsp("/plantnow/sendWifiCredentials").then(
        (res) => res.ok
    );
}

export async function plantnowSendCloudSetupBlumy(creds: {
    token: string;
    url: string;
}): Promise<boolean> {
    return await postDataToEsp("/plantnow/sendCloudSetup/blumy", creds).then(
        (res) => res.ok
    );
}
