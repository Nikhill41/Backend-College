const express = require('express');
const app = express();
const PORT = 3400;

const todoRoutes = require("./routes/router");


// Add CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json());

app.use("/api", todoRoutes);

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});