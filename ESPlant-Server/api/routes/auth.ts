import passport from "../config/passport.js";
import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticated.js";

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

// TODO for backwards compatibility, sensor auth is not enabled yet
//router.use(passport.authenticate("bearer", { session: false }))

router.get("/profile", isAuthenticated, (req, res) => {
  res.json(req.user);
});

export default router;
