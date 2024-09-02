import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/cloudSetup/http",
    body: {
        sensorId: "45",
        url: "http://blumy-server.com",
        auth: "???",
    },
});
