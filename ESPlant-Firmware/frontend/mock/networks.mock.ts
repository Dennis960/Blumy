import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/networks",
    body: [
        {
            rssi: -55,
            ssid: "MyWiFi",
            bssid: "00:11:22:33:44:55",
            channel: 1,
            secure: 4,
            hidden: false,
        },
        {
            rssi: -66,
            ssid: "MyWiFi2",
            bssid: "00:11:22:33:44:56",
            channel: 6,
            secure: 3,
            hidden: false,
        },
        {
            rssi: -77,
            ssid: "MyWiFi3",
            bssid: "00:11:22:33:44:57",
            channel: 11,
            secure: 2,
            hidden: false,
        },
        {
            rssi: -77,
            ssid: "FRITZ!Box 7490",
            bssid: "00:11:22:33:44:57",
            channel: 11,
            secure: 7,
            hidden: false,
        },
        {
            rssi: -30,
            ssid: "Strongest WiFi alive",
            bssid: "00:11:22:33:44:57",
            channel: 11,
            secure: 7,
            hidden: false,
        },
    ],
});
