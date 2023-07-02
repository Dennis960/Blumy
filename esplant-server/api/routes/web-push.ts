import { Router } from "express";
import webpush, { PushSubscription } from "web-push";
import SubscriptionController from "../controllers/SubscriptionController.js";
import NotificationService from "../services/NotificationService.js";

const router = Router();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const vapidEmail = process.env.VAPID_EMAIL;

if (!publicVapidKey) {
  throw new Error("VAPID_PUBLIC_KEY not found");
}

if (!privateVapidKey) {
  throw new Error("VAPID_PRIVATE_KEY not found");
}

if (!vapidEmail) {
  throw new Error("VAPID_EMAIL not found");
}

webpush.setVapidDetails(
  "mailto:" + vapidEmail,
  publicVapidKey,
  privateVapidKey
);

router.get("/vapid-public-key", (req, res) => {
  res.send(publicVapidKey);
});

router.post("/sensors/:id/subscribe", async (req, res) => {
  const subscription: PushSubscription = req.body;
  await SubscriptionController.subscribe(parseInt(req.params.id), subscription);
  res.send({});
});

router.post("/sensors/:id/unsubscribe", async (req, res) => {
  const subscription: PushSubscription = req.body;
  await SubscriptionController.unsubscribe(
    parseInt(req.params.id),
    subscription
  );
  res.send({});
});

router.post("/sensors/:id/check-subscription", async (req, res) => {
  const subscription: PushSubscription = req.body;
  const subscribed = await SubscriptionController.getIsSubscribed(
    parseInt(req.params.id),
    subscription
  );
  res.send(subscribed);
});

/* TODO remove - for testing only */
router.get("/cron", async (req, res) => {
  await NotificationService.triggerPushNotifications();
  res.send({});
});

export default router;
