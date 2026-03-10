require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const sttService = require("./src/services/stt.service");
const llmService = require("./src/services/llm.service");
const ttsService = require("./src/services/tts.service");

const app = express();
const server = http.createServer(app);
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://your-deployment-domain.com" // لينك الديبولويمنت
    : "http://localhost:3001";           // لينك التطوير المحلي

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Browser connected:", socket.id);

  socket.on("user_audio", async (audioBuffer) => {
    try {
      // 1️⃣ STT
      const transcript = await sttService.transcribeAudio(audioBuffer);

      // 2️⃣ LLM
      const llmResponse = await llmService.getResponse(transcript);

      // 3️⃣ TTS
      const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);

      // إرسال الصوت للمتصفح
// بدل emit Buffer مباشرة
    socket.emit("bot_audio", ttsAudio.buffer); // ArrayBuffer
    } catch (err) {
      console.error(err);
      socket.emit("bot_audio", null);
    }
  });

    // ==========================
  // التعامل مع النصوص مباشرة
  // ==========================
  socket.on("user_message", async ({ sessionId, message }) => {
    try {
      const llmResponse = await llmService.getResponse(message);
      const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);
      
      // إرسال الصوت + النص للمتصفح
      socket.emit("bot_audio", ttsAudio);
      socket.emit("bot_response", { message: llmResponse });
    } catch (err) {
      console.error(err);
      socket.emit("bot_audio", null);
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT || 3000);
});