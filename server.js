const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://voice-bot-front.vercel.app",
    methods: ["GET", "POST"]
  }
});

require("./src/sockets/voice.socket")(io);

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});