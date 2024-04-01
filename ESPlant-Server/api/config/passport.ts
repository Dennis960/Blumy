import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyFunctionWithRequest as GoogleVerifyFunctionWithRequest,
} from "passport-google-oauth2";
import {
  Strategy as BearerStrategy,
  VerifyFunctionWithRequest as BearerVerifyFunctionWithRequest,
} from "passport-http-bearer";
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

export interface AuthenticatedUser {
  kind: "user" | "sensor-read" | "sensor-write";
  userId?: number;
  sensorId?: number;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}

const verifyGoogle: GoogleVerifyFunctionWithRequest = async (
  req,
  accessToken,
  refreshToken,
  profile,
  done
) => {
  if (req.user != undefined) {
    // token auth overrides google auth (session)
    return done(null, req.user);
  }

  const user = await UserRepository.findOrCreate({
    googleId: profile.id,
  });

  return done(null, {
    kind: "user",
    userId: user.id,
  } satisfies AuthenticatedUser);
};

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env["GOOGLE_CALLBACK_URL"] ?? "/api/auth/google/callback",
      passReqToCallback: true,
    },
    verifyGoogle
  )
);

const verifyBearer: BearerVerifyFunctionWithRequest = async function (
  req,
  token,
  done
) {
  let sensorId: number | undefined = undefined;

  sensorId = await SensorRepository.getIdByWriteToken(token);
  if (sensorId != undefined) {
    return done(null, {
      kind: "sensor-write",
      sensorId,
    } satisfies AuthenticatedUser);
  }

  sensorId = await SensorRepository.getIdByReadToken(token);
  if (sensorId != undefined) {
    return done(null, {
      kind: "sensor-read",
      sensorId,
    } satisfies AuthenticatedUser);
  }

  return done(null, false);
};

passport.use(new BearerStrategy({ passReqToCallback: true }, verifyBearer));

passport.serializeUser<AuthenticatedUser>(function (user, done) {
  done(null, user);
});

passport.deserializeUser<AuthenticatedUser>(function (user, done) {
  done(null, user);
});

export default passport;
