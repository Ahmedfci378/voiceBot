const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.makeOutboundCall = async (toNumber) => {
  return await client.calls.create({
    to: toNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `${process.env.BASE_URL}/api/voice`, 
    statusCallback: `${process.env.BASE_URL}/api/voice/status`,
    statusCallbackEvent: ["completed"]
  });
};