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
    usb: boolean;
}

export interface HttpCloudConfiguration extends Record<string, string> {
    type: "http";
    sensorId: string;
    url: string;
    auth: string;
}

export interface MqttCloudConfiguration extends Record<string, string> {
    type: "mqtt";
    sensorId: string;
    server: string;
    port: string;
    username: string;
    password: string;
    topic: string;
    clientId: string;
}

export interface BlumyCloudConfiguration extends Record<string, string> {
    type: "cloud";
    token: string;
}

export type CloudConfiguration =
    | HttpCloudConfiguration
    | MqttCloudConfiguration
    | BlumyCloudConfiguration;

/* fetch loading state indicator */
const fetch = new Proxy(window.fetch, {
    apply: async (target, thisArgs, args) => {
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

async function getDataFromEsp(url: string) {
    return await fetch("/api" + url)
        .then((response) => response.json())
        .catch((error) => {
            console.error(error);
            return null;
        });
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

export async function isConnected(): Promise<WifiStatus> {
    const res = await getDataFromEsp("/isConnected");
    if (res == null) {
        return WifiStatus.ERROR;
    }
    return Number(res);
}

export async function getConnectedNetwork(): Promise<{ ssid: string, status: WifiStatus }> {
    return await getDataFromEsp("/connectedNetwork");
}

export async function setCloudCredentials(config: CloudConfiguration) {
    if (config.type === "http") {
        return await postDataToEsp("/cloudSetup/http", config);
    } else if (config.type === "mqtt") {
        return await postDataToEsp("/cloudSetup/mqtt", config);
    } else if (config.type === "cloud") {
        return await postDataToEsp("/cloudSetup/blumy", config);
    }
}

export async function getCloudCredentials<T extends CloudConfiguration["type"]>(
    type: T
): Promise<
    T extends "http"
        ? HttpCloudConfiguration
        : T extends "mqtt"
        ? MqttCloudConfiguration
        : BlumyCloudConfiguration
> {
    if (type === "http") {
        return await getDataFromEsp("/cloudSetup/http");
    } else if (type === "mqtt") {
        return await getDataFromEsp("/cloudSetup/mqtt");
    } else if (type === "cloud") {
        return await getDataFromEsp("/cloudSetup/blumy");
    }
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

export async function getUpdatePercentage() {
    return Number(await getDataFromEsp("/update/percentage"));
}

export async function getSensorData(): Promise<SensorData> {
    return await getDataFromEsp("/sensor/data");
}

export async function hardResetEsp() {
    return await postDataToEsp("/hardReset");
}

export async function updateFirmware(url: string) {
    return await postDataToEsp("/update/firmware", url);
}

export async function getUpdateFirmwareUrl(): Promise<{ url: string }> {
    return await getDataFromEsp("/update/firmware");
}
