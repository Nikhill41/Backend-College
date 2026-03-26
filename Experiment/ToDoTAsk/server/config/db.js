// ─── Import Mongoose ──────────────────────────────────────────────────────────
const mongoose = require("mongoose");

// ─── Connect Function ─────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    // ✅ Just pass the URI — no extra options needed in Mongoose 7+
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.log("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;