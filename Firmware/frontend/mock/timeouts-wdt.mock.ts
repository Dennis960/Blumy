import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/timeouts/wdt",
        body: 20000,
    }
);