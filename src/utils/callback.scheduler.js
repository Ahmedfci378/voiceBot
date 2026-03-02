const outboundService = require("../services/outbound.service");

function scheduleCallback(call) {
  if (!call.callbackAt) return;

  const delay = new Date(call.callbackAt) - new Date();

  if (delay <= 0) return;

  setTimeout(async () => {
    try {
      console.log("⏰ Running scheduled callback...");

      await outboundService.makeOutboundCall(call.to);

    } catch (error) {
      console.error("Callback Error:", error.message);
    }
  }, delay);
}

module.exports = { scheduleCallback };