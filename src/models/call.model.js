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
  status: {
    type: String,
    default: "in-progress",
  },
  duration: Number,
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model("Call", callSchema);