const twilio = require("twilio");
const voiceService = require("../services/voice.service");
const Call = require("../models/call.model");
const memoryStore = require("../utils/memory.store");


// ==============================
// HANDLE INCOMING CALL
// ==============================
exports.handleIncomingCall = async (req, res) => {
  log("VOICE HIT");
  try {
    const twiml = new twilio.twiml.VoiceResponse();

    const gather = twiml.gather({
      input: "speech",
      language: "ar-EG",
      speechModel: "phone_call",
      enhanced: true,
      timeout: 15,
      speechTimeout: "auto",
      action: `${process.env.BASE_URL}/api/voice/process`,
      method: "POST"
    });

    gather.say(
      { voice: "alice", language: "ar-EG" },
      "مرحبًا، معك ممثل من شركة بالم هيلز. هل هذا وقت مناسب للحديث لثواني فقط؟"
    );

    res.type("text/xml").send(twiml.toString());

  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};


// ==============================
// PROCESS SPEECH
// ==============================
exports.processSpeech = async (req, res) => {
  console.log("PROCESS SPEECH HIT");

  try {
    const { SpeechResult, CallSid, From, To } = req.body;

    const twiml = new twilio.twiml.VoiceResponse();

    if (!SpeechResult) {
      const gather = twiml.gather({
        input: "speech",
        language: "ar-EG",
        action: `${process.env.BASE_URL}/api/voice/process`,
        method: "POST"
      });

      gather.say("ممكن تعيد كلامك؟");

      return res.type("text/xml").send(twiml.toString());
    }

    // 🔥 هنا AI
    const aiResponse = await voiceService.handleUserMessage(
      CallSid,
      From,
      To,
      SpeechResult
    );

    // AI يرد
    twiml.say(
      { voice: "alice", language: "ar-EG" },
      aiResponse
    );

    // 🔁 نرجع Gather جديد (بدون redirect)
    const gather = twiml.gather({
      input: "speech",
      language: "ar-EG",
      speechModel: "phone_call",
      enhanced: true,
      timeout: 15,
      speechTimeout: "auto",
      action: `${process.env.BASE_URL}/api/voice/process`,
      method: "POST"
    });

    gather.say("هل تحب أكمل معاك؟");

    res.type("text/xml").send(twiml.toString());

  } catch (error) {
    console.error("PROCESS ERROR:", error);

    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say(
      { voice: "alice", language: "ar-EG" },
      "حصل خطأ مؤقت. حاول مرة أخرى."
    );

    res.type("text/xml").send(twiml.toString());
  }
};


// ==============================
// CALL STATUS
// ==============================
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