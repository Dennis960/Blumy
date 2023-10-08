import { Router } from "express";
import session from "express-session";
import KnexSessionStoreFactory from "connect-session-knex";
import passport from "../config/passport.js";
import { knex } from "../config/knex.js";

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
router.use(passport.initialize());
router.use(passport.session());

export default router;
