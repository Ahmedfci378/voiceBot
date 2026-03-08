const voiceService = require("../services/voice.service");

module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("🟢 Browser connected:", socket.id);

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

    });

};

