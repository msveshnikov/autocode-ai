/* global use, db */

// Select the database to use.
use("autocode");

db.getCollection("users").updateOne({ email: "msveshnikov@gmail.com" }, { $set: { tier: "Premium", subscriptionStatus:"active",     stripeCustomerId:"cus_QjTq4Yu2EkwrwO7OR", stripeSubscriptionId:"sub_221Ps0sMAl2orw8XNzrO0vY64lky"} });


// Create index for username and email
db.users.dropIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// Insert sample users
db.users.insertMany([
    {
        username: "user1",
        email: "user1@example.com",
        password: "$2b$10$1234567890123456789012",
        tier: "Free",
        dailyRequests: 0,
        devices: 1,
    },
    {
        username: "user2",
        email: "user2@example.com",
        password: "$2b$10$2345678901234567890123",
        tier: "Premium",
        stripeCustomerId: "cus_123456789",
        dailyRequests: 0,
        devices: 5,
    },
    {
        username: "user3",
        email: "user3@example.com",
        password: "$2b$10$3456789012345678901234",
        tier: "Enterprise",
        stripeCustomerId: "cus_987654321",
        dailyRequests: 0,
        devices: 15,
    },
]);

// Create function to reset daily requests
db.system.js.save({
    _id: "resetDailyRequests",
    value: function () {
        const today = new Date().toISOString().split("T")[0];
        db.users.updateMany(
            { lastRequestDate: { $ne: today } },
            { $set: { lastRequestDate: today, dailyRequests: 0 } }
        );
    },
});

// Start the scheduled task
db.eval("scheduledResetDailyRequests()");

// Sample query to get user information
db.users.find({ tier: "Premium" }, { username: 1, email: 1, tier: 1, dailyRequests: 1, devices: 1 });

// Sample aggregation to get usage statistics
db.users.aggregate([
    {
        $group: {
            _id: "$tier",
            userCount: { $sum: 1 },
            totalRequests: { $sum: "$dailyRequests" },
            avgDevices: { $avg: "$devices" },
        },
    },
    {
        $sort: { userCount: -1 },
    },
]);
