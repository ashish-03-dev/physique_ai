const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const Workout = require('../models/Workout');

// Middleware to extract userId from cookie
const getUserId = (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No userId in cookies' });
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(401).json({ error: 'Invalid userId format' });
  }
  req.userId = userId;
  next();
};

router.post('/generate-workout', getUserId, async (req, res) => {
  const userId = req.userId;

  try {
    const images = await Image.find({ userId, analysis: { $exists: true } });

    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'No analyzed images found for this user' });
    }

    // Calculate averages of measurements and proportions
    const measurementsSum = {
      height: 0, torso: 0, leg: 0, upperLeg: 0, lowerLeg: 0, arm: 0,
      upperArm: 0, forearm: 0, shoulderWidth: 0, hipWidth: 0, armSpan: 0,
      chest: 0, waist: 0, thigh: 0, calf: 0,
    };

    const proportionsSum = {
      legToHeight: 0, torsoToHeight: 0, armToHeight: 0, upperToLowerLeg: 0,
      upperToLowerArm: 0, armToLeg: 0, shoulderToHipRatio: 0, shoulderToHeight: 0,
      armSpanRatio: 0, chestToWaist: 0, thighToCalf: 0, chestToHeight: 0,
      waistToHeight: 0, thighToHeight: 0, calfToHeight: 0, shoulderToWaist: 0,
      hipToWaist: 0, armToTorso: 0, legToTorso: 0, chestToArm: 0, waistToLeg: 0,
    };

    images.forEach((image) => {
      const { measurements, proportions } = image.analysis;
      Object.keys(measurementsSum).forEach((key) => {
        measurementsSum[key] += measurements[key] || 0;
      });
      Object.keys(proportionsSum).forEach((key) => {
        proportionsSum[key] += proportions[key] || 0;
      });
    });

    const count = images.length;
    const averageMeasurements = {};
    const averageProportions = {};

    Object.keys(measurementsSum).forEach((key) => {
      averageMeasurements[key] = measurementsSum[key] / count;
    });
    Object.keys(proportionsSum).forEach((key) => {
      averageProportions[key] = proportionsSum[key] / count;
    });

    // Generate weekly workout plan based on proportions
    const weeklyPlan = {
      Monday: { exercises: [], focus: 'Lower Body', description: 'Leg strength focus' },
      Tuesday: { exercises: [], focus: 'Upper Body', description: 'Arm and shoulder development' },
      Wednesday: { exercises: [], focus: 'Core', description: 'Core stability and strength' },
      Thursday: { exercises: [], focus: 'Lower Body', description: 'Leg power and endurance' },
      Friday: { exercises: [], focus: 'Upper Body', description: 'Chest and back focus' },
      Saturday: { exercises: [], focus: 'Full Body', description: 'Overall strength and conditioning' },
      Sunday: { exercises: [], focus: 'Rest or Active Recovery', description: 'Light stretching or yoga' },
    };

    // Exercise templates
    const exerciseTemplates = {
      lowerBody: [
        { name: 'Squats', sets: 3, reps: 12 },
        { name: 'Lunges', sets: 3, reps: 10 },
        { name: 'Leg Press', sets: 3, reps: 15 },
        { name: 'Calf Raises', sets: 3, reps: 15 },
        { name: 'Deadlifts', sets: 3, reps: 10 },
      ],
      upperBody: [
        { name: 'Push-Ups', sets: 3, reps: 15 },
        { name: 'Pull-Ups', sets: 3, reps: 8 },
        { name: 'Shoulder Press', sets: 3, reps: 12 },
        { name: 'Bicep Curls', sets: 3, reps: 12 },
        { name: 'Tricep Dips', sets: 3, reps: 10 },
      ],
      core: [
        { name: 'Plank', sets: 3, duration: '30 seconds' },
        { name: 'Russian Twists', sets: 3, reps: 20 },
        { name: 'Crunches', sets: 3, reps: 15 },
        { name: 'Leg Raises', sets: 3, reps: 12 },
      ],
      fullBody: [
        { name: 'Burpees', sets: 3, reps: 10 },
        { name: 'Deadlifts', sets: 3, reps: 10 },
        { name: 'Bench Press', sets: 3, reps: 12 },
        { name: 'Bodyweight Squats', sets: 3, reps: 15 },
      ],
      recovery: [
        { name: 'Yoga Flow', sets: 1, duration: '20 minutes' },
        { name: 'Dynamic Stretching', sets: 1, duration: '15 minutes' },
      ],
    };

    // Prioritize based on proportions
    const priorities = [];

    if (averageProportions.legToHeight < 0.45 || averageProportions.thighToHeight < 0.25 || averageProportions.calfToHeight < 0.20) {
      priorities.push({ focus: 'Lower Body', priority: 3, reason: 'Below-average leg proportions' });
    }
    if (averageProportions.armToHeight < 0.35 || averageProportions.upperToLowerArm < 0.8 || averageProportions.chestToArm < 1.5) {
      priorities.push({ focus: 'Upper Body', priority: 2, reason: 'Below-average arm and chest proportions' });
    }
    if (averageProportions.torsoToHeight < 0.30 || averageProportions.chestToWaist < 1.2 || averageProportions.waistToHeight > 0.50) {
      priorities.push({ focus: 'Core', priority: 2, reason: 'Core development needed for stability and proportion' });
    }
    if (averageProportions.shoulderToHipRatio < 1.2 || averageProportions.shoulderToWaist < 1.3) {
      priorities.push({ focus: 'Upper Body', priority: 1, reason: 'Shoulder development for balanced physique' });
    }

    // Assign exercises based on priorities
    if (priorities.length > 0) {
      priorities.sort((a, b) => b.priority - a.priority);
      weeklyPlan.Monday.exercises = exerciseTemplates.lowerBody;
      weeklyPlan.Monday.description += ` (${priorities.find(p => p.focus === 'Lower Body')?.reason || 'General leg strength'})`;
      weeklyPlan.Tuesday.exercises = exerciseTemplates.upperBody;
      weeklyPlan.Tuesday.description += ` (${priorities.find(p => p.focus === 'Upper Body')?.reason || 'General upper body strength'})`;
      weeklyPlan.Wednesday.exercises = exerciseTemplates.core;
      weeklyPlan.Wednesday.description += ` (${priorities.find(p => p.focus === 'Core')?.reason || 'General core stability'})`;
      weeklyPlan.Thursday.exercises = exerciseTemplates.lowerBody.slice(0, 4);
      weeklyPlan.Friday.exercises = exerciseTemplates.upperBody.slice(0, 4);
      weeklyPlan.Saturday.exercises = exerciseTemplates.fullBody;
      weeklyPlan.Sunday.exercises = exerciseTemplates.recovery;
    } else {
      // Default balanced plan
      weeklyPlan.Monday.exercises = exerciseTemplates.lowerBody.slice(0, 4);
      weeklyPlan.Tuesday.exercises = exerciseTemplates.upperBody.slice(0, 4);
      weeklyPlan.Wednesday.exercises = exerciseTemplates.core;
      weeklyPlan.Thursday.exercises = exerciseTemplates.lowerBody.slice(0, 4);
      weeklyPlan.Friday.exercises = exerciseTemplates.upperBody.slice(0, 4);
      weeklyPlan.Saturday.exercises = exerciseTemplates.fullBody;
      weeklyPlan.Sunday.exercises = exerciseTemplates.recovery;
    }

    // Save workout to Workout model
    const workout = new Workout({
      userId,
      weeklyPlan,
      averageMeasurements,
      averageProportions,
      createdAt: new Date(),
    });

    await workout.save();

    res.json({
      status: 'success',
      message: 'Weekly workout plan generated and saved',
      workout: {
        id: workout._id,
        weeklyPlan,
        averageMeasurements,
        averageProportions,
        createdAt: workout.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating workout:', error.message);
    res.status(500).json({ error: 'Server error during workout generation', details: error.message });
  }
});

router.get('/my-workouts', getUserId, async (req, res) => {
  const userId = req.userId;

  try {
    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
    res.json({ status: 'success', workouts });
  } catch (error) {
    console.error('Error fetching workouts:', error.message);
    res.status(500).json({ error: 'Server error fetching workouts', details: error.message });
  }
});

module.exports = router;