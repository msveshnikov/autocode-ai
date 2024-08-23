import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import flash from "connect-flash";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import paymentRoutes from "./routes/payment.js";
import licenseServer from "./license-server.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app.use(helmet({ contentSecurityPolicy: false }));
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

app.use("/license", licenseServer);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("combined"));
app.use(flash());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on("uncaughtException", (err, origin) => {
    console.error(`Caught exception: ${err}`, `Exception origin: ${origin}`);
});

export default app;
