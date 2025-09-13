const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

router.post('/', async (req, res) => {
  const { imageId, actualHeight } = req.body;

  if (!imageId) {
    return res.status(400).json({ error: 'imageId is required' });
  }

  if (!actualHeight || isNaN(actualHeight) || actualHeight <= 0) {
    return res.status(400).json({ error: 'Valid actualHeight in centimeters is required' });
  }

  try {
    const image = await Image.findOne({ imageId });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (!image.meshGenerated || !image.meshPath) {
      return res.status(400).json({ error: 'Mesh not generated for this image' });
    }

    if (image.analysis) {
      return res.status(400).json({ error: 'Analysis already performed for this image' });
    }

    const meshDir = path.dirname(image.meshPath);
    const absoluteMeshDir = path.join(__dirname, '..', meshDir);
    const files = fs.readdirSync(absoluteMeshDir);
    const npzFile = files.find(f => f.endsWith('.npz'));
    if (!npzFile) {
      return res.status(400).json({ error: `No NPZ file found in ${meshDir}` });
    }

    const npzPath = path.join(meshDir, npzFile).replace(/\\/g, '/');
    const absoluteNpzPath = path.join(__dirname, '..', npzPath);

    if (!fs.existsSync(absoluteNpzPath)) {
      return res.status(400).json({ error: `NPZ file not found at ${npzPath}` });
    }

    const fastApiUrl = 'http://localhost:8000/analyze';
    const response = await axios.post(fastApiUrl, { npz_path: absoluteNpzPath });

    if (response.data.status !== 'success') {
      return res.status(500).json({ error: 'Analysis failed', details: response.data.error });
    }

    const proportions = response.data.proportions;
    const joints = proportions.allJoints;

    if (!Array.isArray(joints) || joints.length !== 44) {
      return res.status(500).json({ error: 'Invalid joint data from analysis' });
    }

    // Pull out joints by index
    const headTop = joints[38];
    const leftHeel = joints[21];
    const rightHeel = joints[24];
    const pelvis = joints[8];
    const neck = joints[1];
    const leftShoulder = joints[5];
    const rightShoulder = joints[2];
    const leftHip = joints[12];
    const rightHip = joints[9];
    const leftElbow = joints[6];
    const rightElbow = joints[3];
    const leftWrist = joints[36];
    const rightWrist = joints[31];
    const leftKnee = joints[13];
    const rightKnee = joints[10];

    // Measurements (in model units)
    const modelHeight = distance(headTop, leftHeel);
    const modelTorso = distance(neck, pelvis);
    const modelLeftLeg = distance(leftHip, leftKnee) + distance(leftKnee, leftHeel);
    const modelRightLeg = distance(rightHip, rightKnee) + distance(rightKnee, rightHeel);
    const modelLeg = (modelLeftLeg + modelRightLeg) / 2;
    const modelUpperLeg = (distance(leftHip, leftKnee) + distance(rightHip, rightKnee)) / 2;
    const modelLowerLeg = (distance(leftKnee, leftHeel) + distance(rightKnee, rightHeel)) / 2;
    const modelArm = (distance(leftShoulder, leftWrist) + distance(rightShoulder, rightWrist)) / 2;
    const modelUpperArm = (distance(leftShoulder, leftElbow) + distance(rightShoulder, rightElbow)) / 2;
    const modelForearm = (distance(leftElbow, leftWrist) + distance(rightElbow, rightWrist)) / 2;
    const modelShoulderWidth = distance(leftShoulder, rightShoulder);
    const modelHipWidth = distance(leftHip, rightHip);
    const modelArmSpan = distance(leftWrist, rightWrist);
    const modelChest = distance(leftShoulder, rightShoulder);
    const modelWaist = distance(leftHip, rightHip);
    const modelThigh = (distance(leftHip, leftKnee) + distance(rightHip, rightKnee)) / 2;
    const modelCalf = (distance(leftKnee, leftHeel) + distance(rightKnee, rightHeel)) / 2;

    // Scale factor
    const scaleFactor = actualHeight / modelHeight;

    // Measurements (scaled to centimeters)
    const measurements = {
      height: modelHeight * scaleFactor,
      torso: modelTorso * scaleFactor,
      leg: modelLeg * scaleFactor,
      upperLeg: modelUpperLeg * scaleFactor,
      lowerLeg: modelLowerLeg * scaleFactor,
      arm: modelArm * scaleFactor,
      upperArm: modelUpperArm * scaleFactor,
      forearm: modelForearm * scaleFactor,
      shoulderWidth: modelShoulderWidth * scaleFactor,
      hipWidth: modelHipWidth * scaleFactor,
      armSpan: modelArmSpan * scaleFactor,
      chest: modelChest * scaleFactor,
      waist: modelWaist * scaleFactor,
      thigh: modelThigh * scaleFactor,
      calf: modelCalf * scaleFactor,
    };

    // Extended proportions with permutations
    const proportionsCalc = {
      legToHeight: measurements.leg / measurements.height,
      torsoToHeight: measurements.torso / measurements.height,
      armToHeight: measurements.arm / measurements.height,
      upperToLowerLeg: measurements.upperLeg / measurements.lowerLeg,
      upperToLowerArm: measurements.upperArm / measurements.forearm,
      armToLeg: measurements.arm / measurements.leg,
      shoulderToHipRatio: measurements.shoulderWidth / measurements.hipWidth,
      shoulderToHeight: measurements.shoulderWidth / measurements.height,
      armSpanRatio: measurements.armSpan / measurements.height,
      chestToWaist: measurements.chest / measurements.waist,
      thighToCalf: measurements.thigh / measurements.calf,
      chestToHeight: measurements.chest / measurements.height,
      waistToHeight: measurements.waist / measurements.height,
      thighToHeight: measurements.thigh / measurements.height,
      calfToHeight: measurements.calf / measurements.height,
      shoulderToWaist: measurements.shoulderWidth / measurements.waist,
      hipToWaist: measurements.hipWidth / measurements.waist,
      armToTorso: measurements.arm / measurements.torso,
      legToTorso: measurements.leg / measurements.torso,
      chestToArm: measurements.chest / measurements.arm,
      waistToLeg: measurements.waist / measurements.leg,
    };

    // Save analysis
    image.analysis = {
      allJoints: joints,
      measurements,
      proportions: proportionsCalc,
      actualHeight,
    };

    await image.save();

    res.json({ status: 'success', message: 'Analysis complete', analysis: image.analysis });
  } catch (error) {
    console.error('Error during analysis:', error.message);
    if (error.response) {
      console.error('FASTAPI ERROR RESPONSE:', error.response.data);
      console.error('FASTAPI STATUS:', error.response.status);
    } else if (error.request) {
      console.error('No response received from FastAPI:', error.request);
    } else {
      console.error('Error config:', error.config);
    }
    res.status(500).json({ error: 'Server error during analysis', details: error.message });
  }
});

module.exports = router;