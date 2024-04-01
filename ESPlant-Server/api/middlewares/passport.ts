import { Router } from "express";
import session from "express-session";
import KnexSessionStoreFactory from "connect-session-knex";
import passport, { AuthenticatedUser } from "../config/passport.js";
import { knex } from "../config/knex.js";
import { AuthenticateCallback } from "passport";

const SESSION_SECRET = process.env.SESSION_SECRET!;
if (SESSION_SECRET == undefined) {
  throw new Error("SESSION_SECRET must be set");
}

const router = Router();

const KnexSessionStore = KnexSessionStoreFactory(session);

router.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new KnexSessionStore({
      knex,
      createtable: false,
    }),
  })
);
router.use(passport.session());

// attempt to validate tokens on all routes
router.use((req, res, next) => {
  const callback: AuthenticateCallback = (err, user, info, status) => {
    if (err) {
      return next(err)
    }
    if (user) {
      req.user = user as AuthenticatedUser
    }
    // if authentication is not successful, do nothing - continue
    return next()
  };
  passport.authenticate("bearer", { session: false }, callback)(req, res, next);
});

export default router;
