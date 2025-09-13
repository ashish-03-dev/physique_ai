const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number },
  reps: { type: Number },
  duration: { type: String },
});

const dayPlanSchema = new mongoose.Schema({
  exercises: [exerciseSchema],
  focus: { type: String, required: true },
  description: { type: String, required: true },
});

const workoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  weeklyPlan: {
    Monday: dayPlanSchema,
    Tuesday: dayPlanSchema,
    Wednesday: dayPlanSchema,
    Thursday: dayPlanSchema,
    Friday: dayPlanSchema,
    Saturday: dayPlanSchema,
    Sunday: dayPlanSchema,
  },
  averageMeasurements: {
    height: Number,
    torso: Number,
    leg: Number,
    upperLeg: Number,
    lowerLeg: Number,
    arm: Number,
    upperArm: Number,
    forearm: Number,
    shoulderWidth: Number,
    hipWidth: Number,
    armSpan: Number,
    chest: Number,
    waist: Number,
    thigh: Number,
    calf: Number,
  },
  averageProportions: {
    legToHeight: Number,
    torsoToHeight: Number,
    armToHeight: Number,
    upperToLowerLeg: Number,
    upperToLowerArm: Number,
    armToLeg: Number,
    shoulderToHipRatio: Number,
    shoulderToHeight: Number,
    armSpanRatio: Number,
    chestToWaist: Number,
    thighToCalf: Number,
    chestToHeight: Number,
    waistToHeight: Number,
    thighToHeight: Number,
    calfToHeight: Number,
    shoulderToWaist: Number,
    hipToWaist: Number,
    armToTorso: Number,
    legToTorso: Number,
    chestToArm: Number,
    waistToLeg: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Workout', workoutSchema);