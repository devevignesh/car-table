import carTableData from "./car-data.json";

export const lookupModel = ({ brand }) => {
    const matchingCars = carTableData.filter(car => car.brand === brand);

    const allModels = [...new Set(matchingCars.flatMap(car => car.model))];

    return allModels;
};

export const lookupVarintByModel = ({ brand, model }) => {
    const brandData = carTableData.find(car => car.brand === brand);
    if (!brandData) return [];

    const modelVariant = brandData.variant.find(variant => variant.model === model);
    if (!modelVariant) return [];

    return modelVariant.versions;
};
