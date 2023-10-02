import { migrateDatabase } from "./migrations.js";
await migrateDatabase();

// send notifications every day at 8, 12, 16 and 20
import NotificationService from "./services/NotificationService.js";
import cron from "node-cron";
cron.schedule("0 8,12,16,20 * * *", async () => {
  await NotificationService.triggerPushNotifications();
});

import express from "express";
import sirv from "sirv";
const app = express();
app.use(express.json({ limit: "10mb" })); // allow image upload

const PORT = 4803;

// use mqtt-listener
import "./mqtt-listener.js";

import api from "./api.js";
// serve api
app.use("/api", api);

// serve pages
app.use("/pages", sirv("pages", { single: true, dev: true }));
// serve dashboard
app.use("/dashboard", sirv("dashboard", { single: true }));

// redirect root to dashboard
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// default 404 error page
app.use((req, res) => {
  res.status(404).send("Sorry, but this page does not exist.");
});

app.listen(PORT);
console.log(`Server listening on port ${PORT}`);
