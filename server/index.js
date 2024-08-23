import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";
import licenseServer from "./license-server.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import paymentRoutes from "./routes/payment.js";
import User from "./models/user.js";
import dotenv from "dotenv";
import i18n from "i18n";
import cookieParser from "cookie-parser";
import session from "express-session";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

mongoose.connect(process.env.MONGODB_URI);

i18n.configure({
    locales: ["en", "es", "fr"],
    directory: path.join(__dirname, "locales"),
    defaultLocale: "en",
    cookie: "lang",
});

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_TOKEN,
        },
        async (jwtPayload, done) => {
            try {
                const user = await User.findById(jwtPayload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        tier: "Free",
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(i18n.init);
app.use("/license", licenseServer);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/payment", paymentRoutes);

app.get("/", async (req, res) => {
    res.render("landing");
});

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const user = await User.findById(userId);
        if (user) {
            user.tier = "Premium";
            user.stripeCustomerId = session.customer;
            await user.save();
        }
    }

    res.json({ received: true });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
