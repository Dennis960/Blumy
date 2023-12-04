import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import UserRepository from "../repositories/UserRepository.js";
import SensorRepository from "../repositories/SensorRepository.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

if (GOOGLE_CLIENT_ID == undefined) {
  throw new Error("GOOGLE_CLIENT_ID must be set");
}
if (GOOGLE_CLIENT_SECRET == undefined) {
  throw new Error("GOOGLE_CLIENT_SECRET must be set");
}

interface AuthenticatedUser {
  kind: "user" | "sensor";
  userId?: number;
  sensorId?: number;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env["GOOGLE_CALLBACK_URL"] ?? "/api/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      const user = await UserRepository.findOrCreate({
        googleId: profile.id,
      });

      return done(null, {
        kind: "user",
        userId: user.id,
      } satisfies AuthenticatedUser);
    }
  )
);

// TODO for backwards compatibility, sensor auth is not enabled yet
passport.use(
  new BearerStrategy(async function (token, done) {
    const sensorId = await SensorRepository.getIdByToken(token);

    if (sensorId == null) {
      return done(null, false);
    }

    return done(null, {
      kind: "sensor",
      sensorId,
    } satisfies AuthenticatedUser);
  })
);

passport.serializeUser<AuthenticatedUser>(function (user, done) {
  done(null, user);
});

passport.deserializeUser<AuthenticatedUser>(function (user, done) {
  done(null, user);
});

export default passport;
