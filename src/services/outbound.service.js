const twilio = require("twilio");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("Twilio credentials are missing");
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// =====================
// MAKE OUTBOUND CALL
// =====================
exports.makeOutboundCall = async (toNumber) => {
  try {
    if (!toNumber) {
      throw new Error("Destination number is required");
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error("TWILIO_PHONE_NUMBER is missing");
    }

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL is missing");
    }

    console.log("ENV CHECK:", {
      SID: process.env.TWILIO_ACCOUNT_SID,
      PHONE: process.env.TWILIO_PHONE_NUMBER,
      BASE: process.env.BASE_URL
    });

    const call = await client.calls.create({
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER,

      // Twilio هيطلب TwiML من هنا لما المكالمة تبدأ
      url: `${process.env.BASE_URL}/api/outbound`,

      statusCallback: `${process.env.BASE_URL}/api/voice/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    console.log("Outbound Call Created:", call.sid);

    return call;

  } catch (error) {
    console.error("Outbound Error:", error);
    throw error;
  }
};

// =====================
// GENERATE TWIML
// =====================
exports.getOutboundTwiml = () => {
  try {
    const twiml = new VoiceResponse();

    twiml.say(
      { voice: "alice", language: "en-US" },
      "Hello, this is your AI assistant calling."
    );

    return twiml.toString();

  } catch (error) {
    console.error("TwiML generation error:", error);
    return null;
  }
};