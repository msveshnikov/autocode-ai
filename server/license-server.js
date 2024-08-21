import express from "express";
import { json } from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.JWT_SECRET || "your-secret-key";

app.use(json());

const users = [];
const licenses = {};

app.post("/register", async (req, res) => {
    const { username, password, tier } = req.body;
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), username, password: hashedPassword, tier };
    users.push(user);
    const token = jwt.sign({ id: user.id, username: user.username, tier: user.tier }, secretKey);
    res.json({ token });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, tier: user.tier }, secretKey);
    res.json({ token });
});

app.post("/check", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        const { id, tier } = decoded;
        const license = licenses[id] || { requestsToday: 0, lastReset: new Date() };
        const today = new Date();
        if (today.getDate() !== license.lastReset.getDate()) {
            license.requestsToday = 0;
            license.lastReset = today;
        }
        const maxRequests = tier === "Premium" ? Infinity : 10;
        if (license.requestsToday >= maxRequests) {
            return res.status(403).json({ error: "Daily limit exceeded" });
        }
        license.requestsToday++;
        licenses[id] = license;
        res.json({ valid: true, tier, requestsToday: license.requestsToday });
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.listen(port, () => {
    console.log(`License server running on port ${port}`);
});

export default app;
