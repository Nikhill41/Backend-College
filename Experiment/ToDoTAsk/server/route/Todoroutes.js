// ─── Imports ──────────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const Todo    = require("../model/ToDo"); // import the Todo model

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// ── GET /tasks → Get all tasks from database ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const tasks = await Todo.find(); // fetch all todos from MongoDB
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks." });
  }
});

// ── POST /tasks → Add a new task ──────────────────────────────────────────────
// Expected body: { name: "Task name", priority: "high" or "low" }
router.post("/", async (req, res) => {
  try {
    const { name, priority } = req.body;

    // Validation — check if fields are present
    if (!name || !priority) {
      return res.status(400).json({ error: "Name and priority are required." });
    }

    // Create and save the new task
    const newTask = new Todo({ name, priority });
    await newTask.save();

    res.status(201).json(newTask); // 201 = Created
  } catch (error) {
    res.status(500).json({ error: "Failed to create task." });
  }
});

// ── PATCH /tasks/:id/toggle → Mark task as done or undone ────────────────────
router.patch("/:id/toggle", async (req, res) => {
  try {
    // Find the task by id
    const task = await Todo.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Flip the done value
    task.done = !task.done;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task." });
  }
});

// ── PUT /tasks/:id → Update task name or priority ────────────────────────────
// Expected body: { name: "New name", priority: "low" }
router.put("/:id", async (req, res) => {
  try {
    const { name, priority } = req.body;

    // Find task and update it
    const updatedTask = await Todo.findByIdAndUpdate(
      req.params.id,
      { name, priority },    // fields to update
      { new: true }          // return the updated task (not the old one)
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task." });
  }
});

// ── DELETE /tasks/:id → Delete a task ────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Todo.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task." });
  }
});

// ─── Export the router ────────────────────────────────────────────────────────
module.exports = router;