import express from "express";
import api from "./api.js";

const app = express();

const PORT = 4803;

// serve api
app.use("/api", api);

// serve app
app.use("/", express.static("app"));
app.get("/*", (req, res) => {
  res.sendFile("/app/index.html", { root: "." });
});

// default 404 error page
app.use((req, res) => {
  res.status(404).send("Sorry, but this page does not exist.");
});

app.listen(PORT);
