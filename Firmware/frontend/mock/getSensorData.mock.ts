import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/sensor/data",
    body: {
        temperature: 25.5,
        humidity: 50,
        light: 0.7,
        moisture: 645,
        voltage: 2.8,
    },
});
