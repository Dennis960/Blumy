import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock(
    {
        url: "/api/update/firmware",
        method: "POST",
        body: "OK",
    }
);