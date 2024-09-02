import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/timeouts/sleep",
        body: 1800000,
    }
);