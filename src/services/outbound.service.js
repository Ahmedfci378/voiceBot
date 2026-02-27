const twilio = require("twilio");

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("Twilio credentials are missing");
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
  TOKEN: process.env.TWILIO_AUTH_TOKEN,
  PHONE: process.env.TWILIO_PHONE_NUMBER,
  BASE: process.env.BASE_URL
});
    const call = await client.calls.create({
      to: toNumber,
      from: process.env.TWILIO_PHONE_NUMBER,

      // مهم جدًا يكون endpoint مخصص للـ outbound مش نفس inbound
      url: `${process.env.BASE_URL}/api/outbound`,

      statusCallback: `${process.env.BASE_URL}/api/voice/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    console.log("Outbound Call Created:", call.sid);

    return call;

  } catch (error) {
    console.error("Outbound Error:", error.message);
    throw error;
  }
};