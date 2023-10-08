import passport from "../config/passport.js";
import { Router } from "express";

const router = Router();

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["openid"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.use(passport.authenticate("bearer", { session: false }));

export default router;
