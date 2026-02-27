const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Call = require("../models/call.model");

/**
 * GET /api/calls
 * Get all calls with pagination & optional status filtering
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};

    // Optional filtering by status
    if (status) {
      query.status = status;
    }

    const calls = await Call.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Call.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: calls,
    });

  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});


/**
 * GET /api/calls/:id
 * Get single call by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Call ID format",
      });
    }

    const call = await Call.findById(id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      });
    }

    res.status(200).json({
      success: true,
      data: call,
    });

  } catch (error) {
    console.error("Error fetching call:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;