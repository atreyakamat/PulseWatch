import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pulsewatch_secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Env-driven admin user (defaults provided for local/dev use)
  const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "atreya").trim();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "homelab@123";

  const ADMIN_USER = {
    id: 1,
    username: ADMIN_USERNAME,
  } as const;

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return done(null, ADMIN_USER);
      }
      return done(null, false);
    }),
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: number, done) => {
    if (id === ADMIN_USER.id) {
      done(null, ADMIN_USER);
    } else {
      done(null, false);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
