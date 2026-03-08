const Project = require("../models/project.model");

exports.getActiveProjects = async () => {
  return await Project.find({ active: true });
};

exports.getProjectByGoal = async (goal) => {
  return await Project.find({
    type: goal,
    status: "available"
  });
};