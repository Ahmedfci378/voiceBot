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
socket.on("new_chat", ({ sessionId }) => {
  // لو المستخدم بعت sessionId نستعمله، لو لأ نستخدم socket.id
  const id = sessionId || socket.id;

  // مسح الـ session القديم
  const memory = require("../utils/chatbot.memory");
  memory.clearSession(id);

  // إرسال تأكيد للـ frontend
  socket.emit("chat_reset", {
    message: "تم بدء محادثة جديدة ✅",
    sessionId: id
  });

  console.log("🔄 New chat started for session:", id);
});

    });

};

