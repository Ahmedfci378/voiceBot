require("dotenv").config();
const express = require("express");
const cors = require("cors");
const voiceRoutes = require("./routes/voice.routes");
const outboundRoutes = require("./routes/outbound.routes");

const mongoose = require("mongoose");

const OpenAI = require("openai");
const callRoutes = require("./routes/call.routes");


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



const app = express();

/* ===============================
   ✅ CORS FIX (ADDED)
=================================*/
const allowedOrigins = [
  "https://voice-bot-front.vercel.app",
  "http://localhost:3001"
];

app.use(cors({
  origin: function (origin, callback) {
    // يسمح بالطلبات من Postman (من غير origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


/* =============================== */

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/voice", voiceRoutes);

app.use("/api/outbound", outboundRoutes);


app.use("/api/calls", callRoutes);

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

// Test Route
app.get("/test", (req, res) => {
  res.send("Server is working");
});

module.exports = app;