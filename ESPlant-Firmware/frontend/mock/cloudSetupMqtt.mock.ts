import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/cloudSetup/mqtt",
    body: {
        sensorId: "45",
        server: "blumy-server.com",
        port: 1883,
        username: "blumy-user",
        password: "blumy123",
        topic: "blumy-topic",
        clientId: "blumy-client",
    },
});
