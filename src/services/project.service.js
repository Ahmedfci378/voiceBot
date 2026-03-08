const Project = require("../models/project.model");

exports.getActiveProjects = async () => {
  return await Project.find({ active: true });
};

exports.getProjectByGoal = async (goal, prefs = {}) => {

  const query = {
    type: goal,
    status: "available"
  };

  // فلترة حسب المنطقة
  if (prefs.location) {
    query.location = { $regex: prefs.location, $options: "i" };
  }

  // فلترة حسب الميزانية
  if (prefs.budget) {
    const budget = parseInt(prefs.budget.replace(/\D/g, ""));
    if (!isNaN(budget)) {
      query.startingPrice = { $lte: budget };
    }
  }

  // فلترة حسب مدة التقسيط
  if (prefs.duration) {
    const duration = parseInt(prefs.duration.replace(/\D/g, ""));
    if (!isNaN(duration)) {
      query.installmentYears = { $lte: duration };
    }
  }

  return await Project.find(query);
};