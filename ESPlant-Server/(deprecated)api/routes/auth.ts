import passport from "../config/passport.js";
import { Router } from "express";
import { isUser } from "../middlewares/authenticated.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["openid"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: FRONTEND_URL,
    failureRedirect: FRONTEND_URL,
  })
);

router.get("/profile", isUser, (req, res) => {
  res.json(req.user);
});

export default router;
