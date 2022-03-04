const express = require("express");
const dotenv = require("dotenv");
const connection = require("./db/connection")
dotenv.config();
// connection to DB
connection();
const app = express();
// Apply Middlewares
app.use(express.json());
// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));

// Running The Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(
    `Server is runnign in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

module.exports = server;
