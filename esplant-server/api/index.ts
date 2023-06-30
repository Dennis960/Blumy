import express from "express";
import api from "./api.js";
import { migrateDatabase } from "./migrations.js";

await migrateDatabase();

const app = express();

const PORT = 4803;

// use mqtt-listener
import "./mqtt-listener.js";

// serve api
app.use("/api", api);

// serve app
app.use("/app", express.static("app"));
app.get("/app*", (_req, res) => {
  res.sendFile("/app/index.html", { root: "." });
});

// serve dashboard
app.use("/", express.static("dashboard"));
app.get("/*", (_req, res) => {
  res.sendFile("/dashboard/index.html", { root: "." });
});

// default 404 error page
app.use((req, res) => {
  res.status(404).send("Sorry, but this page does not exist.");
});

app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
