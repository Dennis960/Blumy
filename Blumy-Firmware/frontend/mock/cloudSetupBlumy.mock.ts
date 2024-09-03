import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/cloudSetup/blumy",
    body: {
        token: "blumy_c8nu8r9zr23rch",
        url: "http://blumy.cloud/api/v2/data",
    },
});
