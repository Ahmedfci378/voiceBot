require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./src/app"); // ملف app.js منفصل
const { setupSockets } = require("./src/sockets/voice.socket"); // ملف منفصل

// اتصال MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🟢 MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const server = http.createServer(app);

// CORS & allowed origin
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://voice-bot-front.vercel.app"
    : "http://localhost:3001";
    "http://localhost:3000";

// setup sockets
setupSockets(server, allowedOrigin);

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});