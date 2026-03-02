const express = require("express");
const router = express.Router();
const outboundController = require("../controllers/outbound.controller");



router.post("/", outboundController.handleOutboundCall);

router.post("/call", outboundController.triggerCall);

module.exports = router;