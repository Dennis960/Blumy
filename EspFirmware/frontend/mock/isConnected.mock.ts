import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/isConnected",
        body: 3,
    }
);