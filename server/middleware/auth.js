import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { getIpFromRequest } from "../utils.js";

export const authCookie = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

export const checkDeviceLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const deviceLimit = user.tier === "Free" ? 3 : user.tier === "Premium" ? 20 : Infinity;

        const deviceIp = getIpFromRequest(req);
        if (!user.devices.includes(deviceIp)) {
            if (user.devices.length >= deviceLimit) {
                return res.status(403).json({ error: "Device limit reached" });
            }
            user.addDevice(deviceIp);
            await user.save();
        }

        next();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export default {
    authCookie,
    checkDeviceLimit,
    isAdmin,
};
