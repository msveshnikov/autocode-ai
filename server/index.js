import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import paymentRoutes from "./routes/payment.js";
import licenseServer from "./license-server.js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);
// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === "/payment/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("combined"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use("/license", licenseServer);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
    res.render("landing", { user: req.cookies.token });
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

app.use((req, res) => {
    res.status(404).render("404");
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).render("500");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on("uncaughtException", (err, origin) => {
    console.error(`Caught exception: ${err}`, `Exception origin: ${origin}`);
});

export default app;
