// ─── Imports ──────────────────────────────────────────────────────────────────
require('dotenv').config()
const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");               // MongoDB connection
const todoRoutes = require("./route/Todoroutes"); // Todo routes

// ─── Initialize Express App ───────────────────────────────────────────────────
const app  = express();
const PORT = 5600;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  "origin":"http://localhost:5173",
  credentials:true
}));          // allows frontend (React) to talk to this server
app.use(express.json());  // lets us read JSON from request body

// ─── Routes ───────────────────────────────────────────────────────────────────
// All todo routes are handled under /tasks
app.use("/tasks", todoRoutes);

// ─── Default Route (just to check server is running) ─────────────────────────
app.get("/", (req, res) => {
  res.send("✅ Todo Server is running!");
});

// ─── Start the Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});