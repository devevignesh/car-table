//  calculate engine score
const calculateEngineScores = cars => {
    // Get the maximum values for each engine specification
    const maxValues = {
        cc: Math.max(...cars.map(car => parseInt(car.engine.split(" ")[0]))),
        cylinder: Math.max(...cars.map(car => parseInt(car.cylinder))),
        maxPower: Math.max(...cars.map(car => parseInt(car.maxPower.split(" ")[0]))),
        maxTorque: Math.max(...cars.map(car => parseInt(car.maxTorque.split(" ")[0]))),
        engineType: Math.max(...cars.map(car => parseFloat(car.engineType.split(" ")[0])))
    };

    // Calculate the engine scores for each car
    const engineScores = cars.map(car => {
        const ccScore = (parseInt(car.engine.split(" ")[0]) / maxValues.cc) * 10;
        const cylinderScore = (parseInt(car.cylinder) / maxValues.cylinder) * 10;
        const maxPowerScore = (parseInt(car.maxPower.split(" ")[0]) / maxValues.maxPower) * 10;
        const maxTorqueScore = (parseInt(car.maxTorque.split(" ")[0]) / maxValues.maxTorque) * 10;
        const engineTypeScore =
            (parseFloat(car.engineType.split(" ")[0]) / maxValues.engineType) * 10;

        // Calculate the average score for the engine specifications
        const averageScore =
            (ccScore + cylinderScore + maxPowerScore + maxTorqueScore + engineTypeScore) / 5;

        // Round the score to one decimal place
        const engineScore = Math.round(averageScore * 10) / 10;

        return { ...car, engineScore };
    });

    return engineScores;
};

// calculate safety score
const calculateSafetyScores = cars => {
    const safetyScores = cars.map(car => {
        let score = 0;

        // Check if the car has a valid NCAP rating
        if (car.ncap && car.ncap !== "Not Rated" && car.ncap !== "NA") {
            const ncapRating = parseInt(car.ncap);
            score += (ncapRating / 5) * 3; // NCAP contributes to 3/10 of the score
        }

        // Check the number of airbags
        if (car.airBags && car.airBags !== "NA") {
            const airBags = parseInt(car.airBags);
            score += (airBags / 8) * 4; // Airbags contribute to 4/10 of the score
        }

        // Check for additional safety features
        const safetyFeatures = ["abs", "esp", "ebd", "hillHold", "tractionControl"];
        const additionalFeaturesCount = safetyFeatures.reduce((count, feature) => {
            return car[feature] ? count + 1 : count;
        }, 0);

        score += (additionalFeaturesCount / safetyFeatures.length) * 3; // Additional features contribute to 3/10 of the score

        // Calculate the safety score out of 10
        const safetyScore = Math.min(score, 10);
        return { ...car, safetyScore };
    });

    return safetyScores;
};

// calculate interior score
const calculateInteriorScores = cars => {
    const features = ["ac", "powerSteering", "infotainment", "smartConnectivity", "cruiseControl"];

    const maxFeatures = features.length;

    const interiorScores = cars.map(car => {
        let featuresScore = 0;

        // Give extra weightage to automatic AC
        if (car.ac === "Automatic") {
            featuresScore++;
        }

        // Calculate the score for other features
        featuresScore += features.reduce((score, feature) => {
            return car[feature] ? score + 1 : score;
        }, 0);

        const totalScore = (featuresScore / (maxFeatures + 1)) * 10;

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
        const featuresScore = features.reduce((score, feature) => {
            return car[feature] ? score + 1 : score;
        }, 0);

        const totalScore = (featuresScore / maxFeatures) * 10;

        // Round the score to one decimal place
        const exteriorScore = Math.round(totalScore * 10) / 10;

        return { ...car, exteriorScore };
    });

    return exteriorScores;
};

// calculate exterior score
const calculateFeatureScores = cars => {
    const items = ["camera"];

    const maxFeatures = items.length;

    const featureScores = cars.map(car => {
        const itemsScore = items.reduce((score, item) => {
            return car[item] ? score + 1 : score;
        }, 0);

        const totalScore = (itemsScore / maxFeatures) * 10;

        // Round the score to one decimal place
        const featureScore = Math.round(totalScore * 10) / 10;

        return { ...car, featureScore };
    });

    return featureScores;
};

// calculate dimension and weight score
const calculateDimensionWeightScores = cars => {
    const properties = ["length", "width", "height", "wheelBase", "groundClearance", "kerbWeight"];

    const maxProperties = properties.length;

    const maxValues = {};

    // Find the maximum value for each property
    properties.forEach(property => {
        const maxPropertyValue = Math.max(
            ...cars.map(car => {
                const value = car[property];
                const numericValue = parseFloat(value.split(" ")[0]) || 0; // Extract the numerical value
                return numericValue;
            })
        );
        maxValues[property] = maxPropertyValue;
    });

    const dimensionWeightScores = cars.map(car => {
        const propertiesScore = properties.reduce((score, property) => {
            const value = car[property];
            if (value) {
                const numericValue = parseFloat(value.split(" ")[0]) || 0; // Extract the numerical value
                const maxPropertyValue = maxValues[property];
                score += numericValue / maxPropertyValue;
            }
            return score;
        }, 0);

        const totalScore = (propertiesScore / maxProperties) * 10;

        // Round the score to one decimal place
        const dimensionWeightScore = Math.round(totalScore * 10) / 10;

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

                score += (value / max) * (maxScore / totalFeatures);
            }
        }

        // Round the score to one decimal place
        const capacityScore = parseFloat(score.toFixed(1))

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
