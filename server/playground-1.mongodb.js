/* global use, db */

// Select the database to use.
use("autocode");

db.getCollection("users").updateOne(
    { email: "illia.brylov@gmail.com" },
    {
        $set: {
            tier: "Premium",
            subscriptionStatus: "active",
            stripeCustomerId: "cus_QpwWtpamCYajlO",
            stripeSubscriptionId: "sub_1PyGdYAl2o8XNzrOEBwQ9vgI",
        },
    }
);

db.getCollection("users").updateOne({ email: "illia.brylov@gmail.com" }, { $set: { tier: "Premium" } });

// Create index for username and email
db.users.dropIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

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
db.users.updateOne({ email: "msveshnikov@gmail.com" }, { $set: { isAdmin: true, tier: "Premium" } });

// Get all admin users
db.users.find({ isAdmin: true });
