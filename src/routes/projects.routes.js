const express = require("express");
const router = express.Router();
const Project = require("../models/project.model");

/* ===============================
   GET ALL PROJECTS
=================================*/
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

/* ===============================
   CREATE NEW PROJECT
=================================*/
router.post("/", async (req, res) => {
  try {
    const {
      name,
      location,
      type,
      startingPrice,
      maxPrice,
      installmentYears,
      description,
      features,
      status,
    } = req.body;

    // Validation بسيطة
    if (!name || !location || !type || !startingPrice || !maxPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newProject = await Project.create({
      name,
      location,
      type,
      startingPrice,
      maxPrice,
      installmentYears,
      description,
      features,
      status,
    });

    res.status(201).json({
      success: true,
      data: newProject,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ===============================
   DELETE PROJECT
=================================*/
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;