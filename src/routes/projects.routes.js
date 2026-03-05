const express = require("express");
const router = express.Router();
const Project = require("../models/project.model");

// Get all active projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;