const Project = require("../models/project.model");

exports.getActiveProjects = async () => {
  return await Project.find({ active: true });
};

exports.getProjectsByGoal = async (goal) => {
  return await Project.find({
    type: goal,
    active: true
  });
};