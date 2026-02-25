const twilio = require("twilio");
const voiceService = require("../services/voice.service");

exports.handleIncomingCall = async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.gather({
    input: "speech",
    action: "/api/voice/process",
    method: "POST"
  }).say("Hello, this is Ahmed from our company. Is this a good time to talk?");

  res.type("text/xml");
  res.send(twiml.toString());
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
    twiml.redirect("/api/voice");

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