const { Server } = require("socket.io");
const sttService = require("../services/stt.service");
const llmService = require("../services/llm.service");
const ttsService = require("../services/tts.service");
const conversationService = require("../services/conversation.service");

function setupSockets(server, allowedOrigin) {

  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {

    console.log("🟢 Browser connected:", socket.id);

    socket.on("user_message", async ({ sessionId, message }) => {

      try {

        // save user message
        await conversationService.saveMessage(
          sessionId,
          "user",
          message
        );

        const llmResponse = await llmService.getResponse(message);

        // save AI response
        await conversationService.saveMessage(
          sessionId,
          "assistant",
          llmResponse
        );

        const ttsAudio = await ttsService.synthesizeSpeech(llmResponse);

        socket.emit("bot_audio", ttsAudio.buffer);

        socket.emit("bot_response", {
          message: llmResponse
        });

      } catch (err) {

        console.error(err);
        socket.emit("bot_audio", null);

      }
    });

  });

}

module.exports = { setupSockets };