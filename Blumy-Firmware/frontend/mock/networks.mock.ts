import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/networks",
    body: [
        {
            rssi: -55,
            ssid: "MyWiFi",
            secure: 4,
        },
        {
            rssi: -66,
            ssid: "MyWiFi2",
            secure: 3,
        },
        {
            rssi: -77,
            ssid: "MyWiFi3",
            secure: 2,
        },
        {
            rssi: -77,
            ssid: "FRITZ!Box 7490",
            secure: 7,
        },
        {
            rssi: -30,
            ssid: "Strongest WiFi alive",
            secure: 7,
        },
        {
            rssi: -30,
            ssid: "Duplicate Wifi",
            secure: 7,
        },
        {
            rssi: -60,
            ssid: "Duplicate Wifi",
            secure: 7,
        },
    ],
});
