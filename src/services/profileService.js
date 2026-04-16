const Profile = require('../models/Profile');
const { getGenderData } = require('./genderizeService');
const { getAgeData } = require('./agifyService');
const { getNationalityData } = require('./nationalizeService');
const { getAgeGroup } = require('../utils/ageGroupHelper');

const createProfile = async (name) => {
    const normalizedName = name.trim().toLowerCase();

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ name: normalizedName });
    if (existingProfile) {
        return {
            exists: true,
            profile: existingProfile
        };
    }

    try {
        // Call all three APIs in parallel
        const [genderData, ageData, nationalityData] = await Promise.all([
            getGenderData(normalizedName),
            getAgeData(normalizedName),
            getNationalityData(normalizedName)
        ]);

        // Calculate age group
        const age_group = getAgeGroup(ageData.age);

        // Create new profile
        const profile = await Profile.create({
            name: normalizedName,
            gender: genderData.gender,
            gender_probability: genderData.gender_probability,
            sample_size: genderData.sample_size,
            age: ageData.age,
            age_group,
            country_id: nationalityData.country_id,
            country_probability: nationalityData.country_probability
        });

        return {
            exists: false,
            profile
        };
    } catch (error) {
        // If any API fails, throw error with API name
        if (error.apiName) {
            throw error;
        }
        throw new Error('Failed to create profile');
    }
};

const getProfileById = async (id) => {
    const profile = await Profile.findById(id);
    return profile;
};

const getAllProfiles = async (filters = {}) => {
    const query = {};

    if (filters.gender) {
        query.gender = filters.gender.toLowerCase();
    }

    if (filters.country_id) {
        query.country_id = filters.country_id.toUpperCase();
    }

    if (filters.age_group) {
        query.age_group = filters.age_group.toLowerCase();
    }

    const profiles = await Profile.find(query).select('id name gender age age_group country_id');
    return profiles;
};

const deleteProfile = async (id) => {
    const result = await Profile.findByIdAndDelete(id);
    return result;
};

module.exports = {
    createProfile,
    getProfileById,
    getAllProfiles,
    deleteProfile
};