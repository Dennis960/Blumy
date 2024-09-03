import { defineMock } from "vite-plugin-mock-dev-server";

export default defineMock({
    url: "/api/update/check",
    method: "POST",
    body: "true",
});
