import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/update/firmware",
    method: "GET",
    body: { url: "http://cloud.blumy.com/firmware.bin" },
});
