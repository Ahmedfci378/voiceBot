const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation.model");

// conversation.routes.js
router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ createdAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;