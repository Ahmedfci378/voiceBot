const outboundService = require("../services/outbound.service");

exports.triggerCall = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const call = await outboundService.makeOutboundCall(phoneNumber);

    res.json({
      success: true,
      callSid: call.sid
    });
  } catch (error) {
  console.error("TWILIO ERROR:", error);
  res.status(500).json({ 
    success: false,
    message: error.message,
    code: error.code
  });
}
};



exports.handleOutboundCall = async (req, res) => {
  try {
    const twiml = outboundService.getOutboundTwiml();

    if (!twiml) {
      return res.status(500).send("TwiML generation failed");
    }

    res.set("Content-Type", "text/xml");
    res.status(200).send(twiml);

  } catch (error) {
    console.error("Outbound TwiML Error:", error);
    res.status(500).send("Internal Server Error");
  }
};