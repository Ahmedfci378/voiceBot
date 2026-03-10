require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const sttService = require("./src/services/stt.service");
const llmService = require("./src/services/llm.service");
const ttsService = require("./src/services/tts.service");

// ==========================
// اتصال MongoDB
// ==========================
mongoose.connect(process.env.MONGODB_URI)

.then(() => console.log("🟢 MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
const server = http.createServer(app);

// ==========================
// CORS & allowed origin
// ==========================
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://voice-bot-front.vercel.app/" // لينك الديبولويمنت
    : "http://localhost:3001";           // لينك التطوير المحلي

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"]
  },
});

// ==========================
// Socket connection
// ==========================
io.on("connection", (socket) => {
  console.log("🟢 Browser connected:", socket.id);

  // ==========================
  // استقبال صوت المستخدم
  // ==========================
  socket.on("user_audio", async (audioBuffer) => {
    try {
      // 1️⃣ STT
      const transcript = await sttService.transcribeAudio(audioBuffer);

      // 2️⃣ LLM مع DB context
      const llmResponse = await llmService.getResponse(transcript);

      // 3️⃣ TTS
      const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);

      // إرسال الصوت فقط للمتصفح
      socket.emit("bot_audio", ttsAudio.buffer);

    } catch (err) {
      console.error(err);
      socket.emit("bot_audio", null);
    }
  });

  // ==========================
  // استقبال نصوص مباشرة
  // ==========================
  socket.on("user_message", async ({ sessionId, message }) => {
    try {
      // نستخدم نفس الدالة الجديدة في llm.service.js
      const llmResponse = await llmService.getResponse(message);
      const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);

      // إرسال الصوت + النص للمتصفح
      socket.emit("bot_audio", ttsAudio.buffer);
      socket.emit("bot_response", { message: llmResponse });
    } catch (err) {
      console.error(err);
      socket.emit("bot_audio", null);
    }
  });
});

// ==========================
// بدء السيرفر
// ==========================
server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});