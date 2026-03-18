const express = require("express");
const app = express();
const PORT = 3400;

const todoRoutes = require("./routes/router");

app.use(express.json());

app.use("/api", todoRoutes);

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});