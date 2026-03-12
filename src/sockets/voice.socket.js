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

 socket.on("audio_message", async ({ sessionId, audioBuffer }) => {
  try {
    // 1️⃣ نفك الـ ArrayBuffer لو جاي من Frontend
    const buffer = Buffer.from(audioBuffer);

    // 2️⃣ نفريغ الصوت باستخدام Whisper
    const text = await sttService.transcribeAudio(buffer);

        socket.emit("bot_response", { message: text, role: "user" });

    // 3️⃣ حفظ الرسالة
    await conversationService.saveMessage(sessionId, "user", text);

    // 4️⃣ التعامل مع LLM
    const llmResponse = await llmService.getResponse(text);
    await conversationService.saveMessage(sessionId, "assistant", llmResponse);

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