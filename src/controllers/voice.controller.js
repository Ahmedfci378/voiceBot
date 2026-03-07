const twilio = require("twilio");
const voiceService = require("../services/voice.service");
const Call = require("../models/call.model");
const memoryStore = require("../utils/memory.store");



exports.handleIncomingCall = async (req, res) => {
  try {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.gather({
   input: "speech",
  language: "ar-EG",
  speechModel: "phone_call",
  enhanced: true,
  timeout: 15,
  speechTimeout: "auto",
  action: `${process.env.BASE_URL}/api/voice/process`,
  method: "POST"

    }).say(
      { language: "ar-EG", voice: "alice" },
  "مرحبًا، معك ممثل من شركة بالم هيلز. هل هذا وقت مناسب للحديث لثواني فقط؟" 
   );
        twiml.redirect(`${process.env.BASE_URL}/api/voice`);

    res.type("text/xml");
    res.send(twiml.toString());

  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};

exports.processSpeech = async (req, res) => {
  console.log("PROCESS SPEECH HIT");
  try {
    const { SpeechResult, CallSid, From, To } = req.body;

    if (!SpeechResult) {
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.redirect(`${process.env.BASE_URL}/api/voice`);
      return res.type("text/xml").send(twiml.toString());
    }

    const aiResponse = await voiceService.handleUserMessage(
      CallSid,
      From,
      To,
      SpeechResult
    );

    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say({
      voice: "alice",
      language: "ar-EG"
    }, aiResponse);

    twiml.redirect(`${process.env.BASE_URL}/api/voice`);

    res.type("text/xml").send(twiml.toString());

  } catch (error) {
    console.error("PROCESS ERROR:", error);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.redirect(`${process.env.BASE_URL}/api/voice`);

    res.type("text/xml").send(twiml.toString());
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