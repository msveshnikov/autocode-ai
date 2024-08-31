// utils.js

import crypto from "crypto";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getIpFromRequest = (req) => {
    const ips = (
        req.headers["x-real-ip"] ||
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        ""
    ).split(",");
    return ips[0].trim();
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const sanitizeInput = (input) => {
    return input.replace(/[&<>"']/g, (char) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[char];
    });
};

export const generatePasswordResetToken = () => {
    return crypto.randomBytes(20).toString("hex");
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const templatePath = path.join(__dirname, "templates", "reset.html");
    let html = await fs.readFile(templatePath, "utf-8");
    html = html.replace("{{resetUrl}}", resetUrl);

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset Request",
        html,
    };

    await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const templatePath = path.join(__dirname, "templates", "welcome.html");
    const html = await fs.readFile(templatePath, "utf-8");

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Welcome to AutoCode",
        html,
    };

    await transporter.sendMail(mailOptions);
};
