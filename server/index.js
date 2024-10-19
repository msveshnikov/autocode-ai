import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import paymentRoutes from "./routes/payment.js";
import dashboardRoutes from "./routes/dashboard.js";
import redeemRoutes from "./routes/redeem.js";
import licenseServer from "./license-server.js";
import dotenv from "dotenv";
import { generateRedeemCodes } from "./models/code.js";
import Code from "./models/code.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app.use((req, res, next) => {
    if (req.originalUrl === "/payment/webhook") {
        next();
    } else {
        express.json()(req, res, next);
    }
});
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
app.use("/dashboard", dashboardRoutes);
app.use("/redeem", redeemRoutes);

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

app.get("/privacy", (req, res) => {
    res.render("privacy");
});

app.get("/terms", (req, res) => {
    res.render("terms");
});

app.get("/forgot-password", (req, res) => {
    res.render("forgot");
});

app.get("/reset-password/:token", (req, res) => {
    res.render("reset", { token: req.params.token });
});

app.get("/redeem", (req, res) => {
    res.render("redeem");
});

app.use((req, res) => {
    res.status(404).render("404");
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).render("500");
});

const generateCodesIfEmpty = async () => {
    const codesCount = await Code.countDocuments();
    if (codesCount === 0) {
        await generateRedeemCodes();
    }
};

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await generateCodesIfEmpty();
});

process.on("uncaughtException", (err, origin) => {
    console.error(`Caught exception: ${err}`, `Exception origin: ${origin}`);
});

export default app;
