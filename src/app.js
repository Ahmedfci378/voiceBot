require("dotenv").config();
const express = require("express");
const voiceRoutes = require("./routes/voice.routes");
const outboundRoutes = require("./routes/outbound.routes");

const mongoose = require("mongoose");



const app = express();

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));

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

app.get("/ai-test", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say hello in one short sentence." }
      ],
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use("/api/outbound", outboundRoutes);
// Test Route
app.get("/test", (req, res) => {
  res.send("Server is working");
});

module.exports = app;