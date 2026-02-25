// models/call.model.js
const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
  from: String,
  to: String,
  transcript: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Call", callSchema);