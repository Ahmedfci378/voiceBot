const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
  },
  content: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const callSchema = new mongoose.Schema({
  callSid: {
    type: String,
    required: true,
    unique: true,
  },
  from: String,
  to: String,

  stage: {
    type: String,
    enum: [
      "intro",
      "permission",
      "launch",
      "qualification",
      "callback",
      "end"
    ],
    default: "intro"
  },

  callbackAt: {
    type: Date
  },

  status: {
    type: String,
    default: "in-progress",
  },
  goal: {
  type: String,
  enum: ["residential", "investment"]
},
preferredLocation: String,
budget: String,

  duration: Number,
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model("Call", callSchema);