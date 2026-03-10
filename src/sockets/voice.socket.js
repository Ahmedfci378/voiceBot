const voiceService = require("../services/voice.service");
const audioService = require("../services/audio.service");
const fs = require("fs");
const path = require("path");

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("🟢 Browser connected:", socket.id);

    /* ===============================
       USER TEXT MESSAGE
    ================================ */

    socket.on("user_message", async ({ sessionId, message }) => {

      try {

        const response = await voiceService.handleUserMessage(
          sessionId,
          message
        );

        socket.emit("bot_response", {
          message: response
        });

      } catch (error) {

        console.error(error);

        socket.emit("bot_response", {
          message: "حدث خطأ مؤقت."
        });

      }

    });

    /* ===============================
       USER AUDIO MESSAGE
    ================================ */

    socket.on("user_audio", async ({ sessionId, audio }) => {

      try {

        const filePath = path.join(__dirname, "../temp/audio.webm");

        fs.writeFileSync(filePath, Buffer.from(audio));

        const transcript = await audioService.speechToText(filePath);

        console.log("User said:", transcript);

        const aiResponse = await voiceService.handleUserMessage(
          sessionId,
          transcript
        );

        const audioReply = await audioService.textToSpeech(aiResponse);

        socket.emit("bot_audio", audioReply);

      } catch (error) {

        console.error(error);

        socket.emit("bot_response", {
          message: "حدث خطأ فى معالجة الصوت"
        });

      }

    });

    /* ===============================
       NEW CHAT
    ================================ */

    socket.on("new_chat", ({ sessionId }) => {

      const memory = require("../utils/chatbot.memory");

      memory.clearSession(sessionId);

      socket.emit("chat_reset", {
        message: "تم بدء محادثة جديدة ✅",
        sessionId
      });

      console.log("🔄 New chat started:", sessionId);

    });

  });

};