import { loadingState } from "./states";
export type Network = {
    rssi: number;
    ssid: string;
    bssid: string;
    channel: number;
    secure: number;
    hidden: boolean;
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

export enum ResetFlag {
    SENSOR_FLAG = 0,
    CONFIGURATION_FLAG = 1,
}

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

async function postDataToEsp(url: string, params: Record<string, string> | string) {
    const body = typeof params === "string" ? params : Object.entries(params).map(([key, value]) => key + "=" + value).join("\n") + "\n";
    return await fetch("/api" + url, {
        method: "POST",
        body,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
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

async function uploadFile(file: File, url: string) {
    const formData = new FormData();
    formData.append("upload", file);
    return await fetch("/api" + url, {
        method: "POST",
        body: formData,
    });
}

export async function setPlantName(name: string) {
    return await postDataToEsp("/plantName", name);
}

export async function getPlantName() {
    return await getDataFromEsp("/plantName");
}

export async function getNetworks(): Promise<Network[]> {
    return await getDataFromEsp("/networks");
}

export async function getConnectedNetwork(): Promise<Network> {
    return await getDataFromEsp("/connectedNetwork");
}

export async function connectToNetwork(ssid: string, password: string) {
    return await postDataToEsp("/connect", {ssid, password});
}

export async function resetEsp(resetFlag: ResetFlag) {
    return await postDataToEsp("/reset", String(resetFlag));
}

/**
 * @returns WifiStatus
 */
export async function isEspConnected(): Promise<WifiStatus> {
    const res = await getDataFromEsp("/isConnected");
    if (res == null) {
        return WifiStatus.ERROR;
    }
    return Number(res);
}

export interface HttpCloudConfiguration extends Record<string, string>{
    type: 'http'
    sensorId: string,
    url: string
    auth: string
}

export interface MqttCloudConfiguration extends Record<string, string>{
    type: 'mqtt'
    sensorId: string,
    server: string,
    port: string,
    username: string,
    password: string,
    topic: string,
    clientId: string
}

export interface BlumyCloudConfiguration extends Record<string, string> {
    type: 'cloud'
    token: string
}

export type CloudConfiguration = HttpCloudConfiguration | MqttCloudConfiguration | BlumyCloudConfiguration;

export async function setCloudCredentials(config: CloudConfiguration) {
    if (config.type === 'http') {
        return await postDataToEsp("/cloudSetup/http", config);
    } else if (config.type === 'mqtt') {
        return await postDataToEsp("/cloudSetup/mqtt", config);
    } else if (config.type === 'cloud') {
        return await postDataToEsp("/cloudSetup/blumy", config);
    }
}

export async function setSleepTimeout(timeout: number) {
    timeout = Math.round(timeout);
    return await postDataToEsp("/timeouts/sleep", timeout.toString());
}

export async function getSleepTimeout() {
    return Number(await getDataFromEsp("/timeouts/sleep"));
}

export async function getUpdatePercentage() {
    return Number(await getDataFromEsp("/update/percentage"));
}

export async function updateFs(file: File) {
    return await uploadFile(file, "/update/littlefs");
}

export async function updateFirmware(file: File) {
    return await uploadFile(file, "/update/firmware");
}

export async function getSensorValue() {
    return Number(await getDataFromEsp("/sensor/value"));
}