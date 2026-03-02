const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

  location: { type: String, required: true },

  type: {
    type: String,
    enum: ["residential", "investment"],
    required: true,
  },

  startingPrice: {
    type: Number,
    required: true,
  },

  maxPrice: {
    type: Number,
    required: true,
  },

  installmentYears: Number,

  description: String,

  features: [String],

  active: {
    type: Boolean,
    default: true,
  },
  downPayment: {
  type: Number
},

}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);