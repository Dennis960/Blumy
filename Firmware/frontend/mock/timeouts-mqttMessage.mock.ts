import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/timeouts/mqttMessage",
        body: 5000,
    }
);