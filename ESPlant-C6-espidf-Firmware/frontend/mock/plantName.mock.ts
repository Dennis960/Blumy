import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/plantName",
        body: "\"Herbert\"",
    }
);