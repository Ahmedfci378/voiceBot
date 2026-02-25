require("dotenv").config();
const express = require("express");
const voiceRoutes = require("./routes/voice.routes");
const outboundRoutes = require("./routes/outbound.routes");



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/voice", voiceRoutes);
// app.all("/api/voice", (req, res) => {
//   res.type("text/xml");
//   res.send(`
//     <Response>
//       <Say voice="alice">
//         Webhook is working.
//       </Say>
//     </Response>
//   `);
// });
app.use("/api/outbound", outboundRoutes);
// Test Route
app.get("/test", (req, res) => {
  res.send("Server is working");
});

module.exports = app;