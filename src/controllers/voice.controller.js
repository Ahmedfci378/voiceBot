const twilio = require("twilio");
const voiceService = require("../services/voice.service");
const Call = require("../models/call.model");
const memoryStore = require("../utils/memory.store");

exports.handleIncomingCall = async (req, res) => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.gather({
      input: "speech",
      language: "ar-EG", // مهم جدًا عشان عربي
      action: `${process.env.BASE_URL}/api/voice/process`,
      method: "POST",
      speechTimeout: "auto",
        timeout: 5

    }).say(
      { language: "ar-EG", voice: "alice" },
  "مرحبًا، معك ممثل من شركة بالم هيلز. هل هذا وقت مناسب للحديث لثواني فقط؟" 
   );

    res.type("text/xml");
    res.send(twiml.toString());

  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};

exports.processSpeech = async (req, res) => {
  try {
    const { SpeechResult, CallSid, From, To } = req.body;

    const aiResponse = await voiceService.handleUserMessage(
      CallSid,
      From,
      To,
      SpeechResult || ""
    );

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(aiResponse);
    twiml.redirect(`${process.env.BASE_URL}/api/voice`);
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error(error);
  }
};

exports.handleCallStatus = async (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;

  await Call.findOneAndUpdate(
    { callSid: CallSid },
    {
      status: CallStatus,
      duration: CallDuration,
    }
  );

  memoryStore.clearConversation(CallSid);

  res.sendStatus(200);
};