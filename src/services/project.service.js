const Project = require("../models/project.model");

exports.getActiveProjects = async () => {
  return await Project.find({ active: true });
};

exports.getProjectByGoal = async (goal, prefs = {}) => {

  const query = {
    goalType: goal,
    status: "available"
  };

  // map للمناطق
  const locationMap = {
    "اكتوبر": "6th of October",
    "6 اكتوبر": "6th of October",
    "october": "6th of October",
    "التجمع": "New Cairo",
    "القاهرة الجديدة": "New Cairo",
    "نيو كايرو": "New Cairo",
    "اسكندرية": "Alexandria",
    "الاسكندرية": "Alexandria"
  };

  if (prefs.location) {

    const mappedLocation =
      locationMap[prefs.location] || prefs.location;

    query.location = { $regex: mappedLocation, $options: "i" };
  }

  if (prefs.budget) {

    const budget = parseInt(prefs.budget.replace(/\D/g, ""));

    if (!isNaN(budget)) {

      query.$and = [
        { startingPrice: { $lte: budget } },
        { maxPrice: { $gte: budget } }
      ];

    }
  }

  if (prefs.duration) {

    const duration = parseInt(prefs.duration.replace(/\D/g, ""));

    if (!isNaN(duration)) {
      query.installmentYears = { $gte: duration };
    }

  }

  console.log("FILTER QUERY:", query);

  return await Project.find(query);
};