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
    IDLE = 0,
    NO_SSID_AVAIL = 1,
    CONNECTED = 3,
    CONNECT_FAILED = 4,
    CONNECT_WRONG_PASSWORD = 6,
    DISCONNECTED = 7,
    ERROR = 8,
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

async function postDataToEsp(url: string, params?: URLSearchParams) {
    return await fetch("/api" + url, {
        method: "POST",
        body: params,
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
    const params = new URLSearchParams();
    params.append("name", name);
    return await postDataToEsp("/plantName", params);
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
    const params = new URLSearchParams();
    params.append("ssid", ssid);
    params.append("password", password);
    return await postDataToEsp("/connect", params);
}

export async function resetEsp(resetFlag: ResetFlag) {
    const params = new URLSearchParams();
    params.append("resetFlag", String(resetFlag));
    return await postDataToEsp("/reset", params);
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

export async function setMqttCredentials(
    server: string,
    port: string,
    username: string,
    password: string,
    topic: string,
    clientId: string
) {
    const params = new URLSearchParams();
    params.append("server", server);
    params.append("port", port);
    params.append("user", username);
    params.append("password", password);
    params.append("topic", topic);
    params.append("clientId", clientId);
    return await postDataToEsp("/mqttSetup", params);
}

export async function setSensorId(id: number) {
    const params = new URLSearchParams();
    params.append("sensorId", id.toString());
    return await postDataToEsp("/sensorId", params);
}

export async function getSensorId() {
    return Number(await getDataFromEsp("/sensorId"));
}

export async function setSleepTimeout(timeout: number) {
    const params = new URLSearchParams();
    params.append("sleepTimeout", timeout.toString());
    return await postDataToEsp("/timeouts/sleep", params);
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