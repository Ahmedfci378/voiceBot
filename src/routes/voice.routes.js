const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voice.controller");

router.all("/", voiceController.handleIncomingCall);
router.post("/process", voiceController.processSpeech);
router.post("/status", voiceController.handleCallStatus);

module.exports = router;