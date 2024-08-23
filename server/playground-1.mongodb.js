/* global use, db */

// Select the database to use.
// MongoDB Playground
use("autocode");

// Create users collection with schema validation
db.createCollection("users", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["username", "email", "password", "tier"],
            properties: {
                username: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                email: {
                    bsonType: "string",
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                    description: "must be a valid email address and is required",
                },
                password: {
                    bsonType: "string",
                    description: "must be a string and is required",
                },
                tier: {
                    enum: ["Free", "Premium", "Enterprise"],
                    description: "can only be one of the enum values and is required",
                },
                stripeCustomerId: {
                    bsonType: "string",
                    description: "must be a string if the field exists",
                },
                googleId: {
                    bsonType: "string",
                    description: "must be a string if the field exists",
                },
                lastRequestDate: {
                    bsonType: "string",
                    description: "must be a string if the field exists",
                },
                dailyRequests: {
                    bsonType: "int",
                    minimum: 0,
                    description: "must be a non-negative integer",
                },
                devices: {
                    bsonType: "int",
                    minimum: 0,
                    description: "must be a non-negative integer",
                },
                name: {
                    bsonType: "string",
                    description: "must be a string if the field exists",
                },
            },
        },
    },
});

// Create index for username and email
db.users.createIndex({ username: 1 }, { unique: true });
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
