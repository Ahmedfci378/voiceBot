require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const { setupSockets } = require("./src/sockets/voice.socket"); // ملف منفصل

// اتصال MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🟢 MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
const server = http.createServer(app);

// CORS & allowed origin
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://voice-bot-front.vercel.app"
    : "http://localhost:3001";

// setup sockets
setupSockets(server, allowedOrigin);

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});