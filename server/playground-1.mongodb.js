/* global use, db */

// Select the database to use.
use("autocode");

db.getCollection("users").updateOne(
    { email: "msveshnikov@gmail.com" },
    {
        $set: {
            tier: "Premium",
            subscriptionStatus: "active",
            stripeCustomerId: "cus_QjTq4Yu2EkwrwO7OR",
            stripeSubscriptionId: "sub_221Ps0sMAl2orw8XNzrO0vY64lky",
        },
    }
);

// Create index for username and email
db.users.dropIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// Insert sample users
db.users.insertMany([
    {
        email: "user1@example.com",
        password: "$2b$10$1234567890123456789012",
        tier: "Free",
        subscriptionStatus: "none",
        dailyRequests: 0,
        devices: [],
        lastRequestDate: new Date(),
    },
    {
        email: "user2@example.com",
        password: "$2b$10$2345678901234567890123",
        tier: "Premium",
        stripeCustomerId: "cus_123456789",
        subscriptionStatus: "active",
        stripeSubscriptionId: "sub_123456789",
        dailyRequests: 0,
        devices: [],
        lastRequestDate: new Date(),
    },
    {
        email: "user3@example.com",
        password: "$2b$10$3456789012345678901234",
        tier: "Enterprise",
        stripeCustomerId: "cus_987654321",
        subscriptionStatus: "active",
        stripeSubscriptionId: "sub_987654321",
        dailyRequests: 0,
        devices: [],
        lastRequestDate: new Date(),
    },
]);

// Create function to reset daily requests
db.system.js.save({
    _id: "resetDailyRequests",
    value: function () {
        const today = new Date().setHours(0, 0, 0, 0);
        db.users.updateMany(
            { lastRequestDate: { $lt: today } },
            { $set: { lastRequestDate: new Date(), dailyRequests: 0 } }
        );
    },
});

// Schedule the reset function to run daily
db.system.js.save({
    _id: "scheduledResetDailyRequests",
    value: function () {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const delay = midnight.getTime() - new Date().getTime();
        setTimeout(function () {
            db.eval("resetDailyRequests()");
            db.eval("scheduledResetDailyRequests()");
        }, delay);
    },
});

// Start the scheduled task
db.eval("scheduledResetDailyRequests()");

// Sample queries

// Get all Premium users
db.users.find({ tier: "Premium" });

// Get user by email
db.users.findOne({ email: "user2@example.com" });

// Update user's tier
db.users.updateOne(
    { email: "user1@example.com" },
    {
        $set: {
            tier: "Premium",
            subscriptionStatus: "active",
            stripeCustomerId: "cus_new123",
            stripeSubscriptionId: "sub_new123",
        },
    }
);

// Increment daily requests for a user
db.users.updateOne(
    { email: "user2@example.com" },
    { $inc: { dailyRequests: 1 }, $set: { lastRequestDate: new Date() } }
);

// Add a device to a user
db.users.updateOne({ email: "user3@example.com" }, { $addToSet: { devices: "device_id_123" } });

// Remove a device from a user
db.users.updateOne({ email: "user3@example.com" }, { $pull: { devices: "device_id_123" } });

// Get usage statistics
db.users.aggregate([
    {
        $group: {
            _id: "$tier",
            userCount: { $sum: 1 },
            totalRequests: { $sum: "$dailyRequests" },
            avgDevices: { $avg: { $size: "$devices" } },
        },
    },
    {
        $sort: { userCount: -1 },
    },
]);

// Get users close to their daily request limit
db.users.find({
    $or: [
        { tier: "Free", dailyRequests: { $gte: 90 } },
        { tier: "Premium", dailyRequests: { $gte: 900 } },
    ],
});

// Add admin user property
db.users.updateMany({}, { $set: { isAdmin: false } });

use("autocode");
db.users.updateOne({ email: "msveshnikov@gmail.com" }, { $set: { isAdmin: true } });

// Get all admin users
db.users.find({ isAdmin: true });
