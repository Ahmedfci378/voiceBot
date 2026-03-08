const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// إعداد Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://voice-bot-front.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

// ربط ملف الـ sockets
require("./src/sockets/voice.socket")(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});