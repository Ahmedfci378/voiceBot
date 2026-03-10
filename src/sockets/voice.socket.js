const { Server } = require("socket.io");
const sttService = require("../services/stt.service");
const llmService = require("../services/llm.service");
const ttsService = require("../services/tts.service");

function setupSockets(server, allowedOrigin) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Browser connected:", socket.id);

    socket.on("user_audio", async (audioBuffer) => {
      try {
        const transcript = await sttService.transcribeAudio(audioBuffer);
        const llmResponse = await llmService.getResponse(transcript);
        const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);
        socket.emit("bot_audio", ttsAudio.buffer);
      } catch (err) {
        console.error(err);
        socket.emit("bot_audio", null);
      }
    });

    socket.on("user_message", async ({ sessionId, message }) => {
      try {
        const llmResponse = await llmService.getResponse(message);
        const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);
        socket.emit("bot_audio", ttsAudio.buffer);
        socket.emit("bot_response", { message: llmResponse });
      } catch (err) {
        console.error(err);
        socket.emit("bot_audio", null);
      }
    });
  });
}

module.exports = { setupSockets };