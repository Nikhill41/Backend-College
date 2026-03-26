const mongoose = require("mongoose");

// ─── Define the Schema (shape of a task in the database) ─────────────────────
const todoSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },

    // Priority — only "high" or "low" are valid values
    priority: {
      type:     String,
      enum:     ["high", "low"],
      required: true,
    },

    // Is the task completed?
    done: {
      type:    Boolean,
      default: false,  // every new task starts as not done
    },
  },

  // ── Schema Options ─────────────────────────────────────────────────────────
  {
    timestamps: true, // auto adds: createdAt, updatedAt
  }
);

// ─── Create the Model from the Schema ────────────────────────────────────────
// "Todo" → mongoose will create a collection called "todos" in MongoDB
const Todo = mongoose.model("Todo", todoSchema);

// ─── Export the Model ─────────────────────────────────────────────────────────
module.exports = Todo;