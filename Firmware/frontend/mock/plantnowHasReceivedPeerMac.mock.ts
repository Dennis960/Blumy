import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/plantnow/hasReceivedPeerMac",
    // body: "\"AA:BB:CC:DD:EE:FF\"", // uncomment to simulate another blumy wanting to connect
});
