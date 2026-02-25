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