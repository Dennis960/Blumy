import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/timeouts/configurationMode",
        body: 60000,
    }
);