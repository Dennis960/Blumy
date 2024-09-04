import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/connectedNetwork",
        body: {
            ssid: "Best WiFi",
            rssi: -50,
            status: 0,
        }
    }
);