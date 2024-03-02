//  calculate engine score
const calculateEngineScores = cars => {
    // Get the maximum values for each engine specification
    const maxValues = {
        cc: Math.max(...cars.map(car => parseFloat(car.engine.split(" ")[0]))),
        cylinder: Math.max(...cars.map(car => parseFloat(car.cylinder))),
        maxPower: Math.max(...cars.map(car => parseFloat(car.maxPower.split(" ")[0]))),
        maxTorque: Math.max(...cars.map(car => parseFloat(car.maxTorque.split(" ")[0]))),
        engineType: Math.max(...cars.map(car => parseFloat(car.engineType.split(" ")[0])))
    };

    // Calculate the engine scores for each car
    const engineScores = cars.map(car => {
        const ccScore = (parseFloat(car.engine.split(" ")[0]) / maxValues.cc) * 10;
        const cylinderScore = (parseFloat(car.cylinder) / maxValues.cylinder) * 10;
        const maxPowerScore = (parseFloat(car.maxPower.split(" ")[0]) / maxValues.maxPower) * 10;
        const maxTorqueScore = (parseFloat(car.maxTorque.split(" ")[0]) / maxValues.maxTorque) * 10;
        const engineTypeScore =
            (parseFloat(car.engineType.split(" ")[0]) / maxValues.engineType) * 10;

        // Calculate the average score for the engine specifications
        const averageScore =
            (ccScore + cylinderScore + maxPowerScore + maxTorqueScore + engineTypeScore) / 5;

        // Round the score to one decimal place
        const engineScore = parseFloat(averageScore.toFixed(1));

        return { ...car, engineScore };
    });

    return engineScores;
};

// calculate safety score
const calculateSafetyScores = cars => {
    const safetyScores = cars.map(car => {
        let score = 0;

        // Check if the car has a valid NCAP rating
        if (car.ncap !== "Not Rated") {
            const ncapRating = parseInt(car.ncap);
            score += (ncapRating / 5) * 3; // NCAP contributes to 3/10 of the score
        }

        // Calculate the score for the number of airbags
        const airBags = parseInt(car.airBags);
        score += (airBags / 6) * 4; // Airbags contribute to 4/10 of the score

        // Check for additional safety features
        const additionalFeatures = {
            abs: "Anti-lock Braking System",
            esp: "Electronic Stability Program",
            ebd: "Electronic Brakeforce Distribution",
            hillHold: "Hill Hold Control",
            tractionControl: "Traction Control"
        };

        const additionalFeaturesCount = Object.keys(additionalFeatures).reduce((count, feature) => {
            return car[feature] ? count + 1 : count;
        }, 0);

        score += (additionalFeaturesCount / Object.keys(additionalFeatures).length) * 3; // Additional features contribute to 3/10 of the score

        // Round the safety score to one decimal place
        const safetyScore = parseFloat(score.toFixed(1));
        return { ...car, safetyScore };
    });

    return safetyScores;
};

// calculate interior score
const calculateInteriorScores = cars => {
    const features = ["ac", "powerSteering", "infotainment", "smartConnectivity", "cruiseControl", "engineButton"];

    const maxFeatures = features.length;

    const interiorScores = cars.map(car => {
        let featuresScore = 0;

        // Give extra weightage to automatic AC
        if (car.ac === "Automatic") {
            featuresScore++;
        }

        if (car.smartConnectivity === "Both") {
            // Both Android Auto and Apple car play
            featuresScore += 2;
        } else if (car.smartConnectivity === "Android Auto" || car.smartConnectivity === "Apple Car Play") {
            // Only Android Auto or Apple car play
            featuresScore++;
        }

        // Calculate the score for other features
        featuresScore += features.reduce((score, feature) => {
            return car[feature] ? score + 1 : score;
        }, 0);

        const totalScore = (featuresScore / (maxFeatures + 3)) * 10; // Adding extra weightage for smart connectivity

        const safetyScore = parseFloat(totalScore.toFixed(1));

        // Round the score to one decimal place
        const interiorScore = Math.round(totalScore * 10) / 10;

        return { ...car, interiorScore };
    });

    return interiorScores;
};

// calculate exterior score
const calculateExteriorScores = cars => {
    const features = ["sunroof"];

    const maxFeatures = features.length;

    const exteriorScores = cars.map(car => {
        let featuresScore = 0;

        // Give extra weightage to cars with a sunroof
        if (car.sunroof) {
            featuresScore++;
        }

        // Calculate the score for other features
        featuresScore += features.reduce((score, feature) => {
            return car[feature] ? score + 1 : score;
        }, 0);

        const totalScore = (featuresScore / (maxFeatures + 1)) * 10;

        // Round the score to one decimal place
        const exteriorScore = Math.round(totalScore * 10) / 10;

        return { ...car, exteriorScore };
    });

    return exteriorScores;
};

// calculate features score
const calculateFeatureScores = cars => {
    const items = ["camera"]; // Update this array to include additional features in the future
  
    const numFeatures = items.length;
    const maxScore = 10;
  
    const featureScores = cars.map(car => {
      let score = 0;
  
      // Calculate score for camera option
      if (car.camera === "360") {
        score += maxScore; // Full score for "360" option
      } else if (car.camera === "Rear") {
        score += maxScore / 2; // Half score for "Rear" option
      } else if (car.camera !== "NA") {
        score += maxScore / numFeatures; // Distribute equal weightage for other camera options
      }
  
      // Calculate score for other features
      const featureCount = items.reduce((count, item) => {
        return car[item] ? count + 1 : count;
      }, 0);
  
      if (numFeatures > 1 && featureCount > 0) {
        const featureWeightage = (maxScore - score) / (numFeatures - 1); // Distribute remaining weightage among other features
        score += featureCount * featureWeightage;
      }
  
      // Round the score to one decimal place
      const featureScore = Math.round(score * 10) / 10;
  
      return { ...car, featureScore };
    });
  
    return featureScores;
  };

// calculate dimension and weight score
const calculateDimensionWeightScores = cars => {
    const properties = ["length", "width", "height", "wheelBase", "groundClearance"];
    const maxProperties = properties.length;

    const maxValues = {};

    // Find the maximum value for each property
    properties.forEach(property => {
        const maxPropertyValue = Math.max(
            ...cars.map(car => {
                const value = car[property];
                const numericValue = value ? parseFloat(value.split(" ")[0]) : 0;
                return numericValue;
            })
        );
        maxValues[property] = maxPropertyValue;
    });

    const dimensionWeightScores = cars.map(car => {
        let propertiesScore = 0;

        properties.forEach(property => {
            const value = car[property];
            if (value) {
                const numericValue = parseFloat(value.split(" ")[0]) || 0; // Extract the numerical value
                const maxPropertyValue = maxValues[property];
                if (maxPropertyValue > 0) {
                    const featureScore = numericValue / maxPropertyValue;
                    propertiesScore += featureScore;
                }
            }
        });

        const totalScore = (propertiesScore / maxProperties) * 10;

        // Round the score to one decimal place
        const dimensionWeightScore = parseFloat(totalScore.toFixed(1));

        return { ...car, dimensionWeightScore };
    });

    return dimensionWeightScores;
};

// calculate capacity score
const calculateCapacityScores = cars => {
    const maxValues = {
        boot: Math.max(...cars.map(car => parseInt(car.boot))),
        fuelTank: Math.max(...cars.map(car => parseInt(car.fuelTank)))
    };

    const totalFeatures = Object.keys(maxValues).length;
    const maxScore = 10;

    const capacityScores = cars.map(car => {
        let score = 0;

        for (const capacity in car) {
            if (["boot", "fuelTank"].includes(capacity)) {
                const value = parseInt(car[capacity]);
                const max = maxValues[capacity];

                if (max > 0) {
                    const featureScore = (value / max) * (maxScore / totalFeatures);
                    score += featureScore;
                }
            }
        }

        // Round the score to one decimal place
        const capacityScore = parseFloat(score.toFixed(1));

        return { ...car, capacityScore };
    });

    return capacityScores;
};

export const calculateScores = cars => {
    const engineScores = calculateEngineScores(cars);
    const safetyScores = calculateSafetyScores(cars);
    const interiorScores = calculateInteriorScores(cars);
    const exteriorScores = calculateExteriorScores(cars);
    const featureScores = calculateFeatureScores(cars);
    const dimensionWeightScores = calculateDimensionWeightScores(cars);
    const capacityScores = calculateCapacityScores(cars);

    const categories = [
        { name: "Engine & Transmission", key: "engine", scores: engineScores },
        { name: "Safety", key: "safety", scores: safetyScores },
        { name: "Interior, Comfort & Convenience", key: "interior", scores: interiorScores },
        { name: "Exterior", key: "exterior", scores: exteriorScores },
        { name: "Features", key: "feature", scores: featureScores },
        { name: "Dimension & Weight", key: "dimensionWeight", scores: dimensionWeightScores },
        { name: "Capacity", key: "capacity", scores: capacityScores }
    ];

    const combinedData = categories.map(category => {
        const categoryScores = {
            category: category.name
        };

        cars.forEach(car => {
            const carModel = car.model;

            categoryScores[carModel] = getCategoryScore(carModel, category.key, category.scores);
        });

        return categoryScores;
    });

    return combinedData;
};

const getCategoryScore = (carModel, categoryKey, scores) => {
    return scores.find(item => item.model === carModel)[`${categoryKey}Score`];
};
