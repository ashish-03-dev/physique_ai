const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  allJoints: {
    type: [[Number]], // 2D array: [ [x, y, z], ... ]
    default: undefined
  },
  cam_t: {
    type: [Number], // [x, y, z]
    default: undefined
  },
  measurements: {
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
    calf: Number
  },
  proportions: {
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
    waistToLeg: Number
  }
}, { _id: false });

const imageSchema = new mongoose.Schema({
  userId: String,
  imageId: String,
  originalFilename: String,
  storedFilename: String,
  filePath: String,
  meshGenerated: { type: Boolean, default: false },
  meshPath: String,
  analysis: analysisSchema,
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', imageSchema);