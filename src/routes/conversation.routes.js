const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation.model");

router.get("/", async (req, res) => {

  try {

    const convo = await Conversation.findOne({
      sessionId: req.params.sessionId
    });

    res.json(convo);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;