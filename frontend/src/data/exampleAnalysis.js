const exampleAnalysis = {
  physique_type: "Mesomorph",
  symmetry_score: 85,
  ratios: {
    shoulder_to_waist: { current: 1.48, ideal: 1.618, delta: "+9.3%" },
    thigh_to_calf: { current: 1.2, ideal: 1.4, delta: "+16.7%" },
    chest_to_waist: { current: 1.3, ideal: 1.5, delta: "+15.4%" },
  },
  recommendations: [
    "Increase delts by 12% for ideal shoulder taper",
    "Focus on quad development for balanced legs",
    "Enhance chest volume through targeted exercises",
  ],
  muscle_volumes: {
    biceps: { current: 200, target: 230, unit: "cm³" },
    delts: { current: 450, target: 500, unit: "cm³" },
    chest: { current: 600, target: 700, unit: "cm³" },
  },
};

export default exampleAnalysis;
