const profileService = require('../services/profileService');
const { validateNameParam } = require('../utils/validators');

// UUID v7 validation regex
const isValidUUIDv7 = (id) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

const createProfile = async (req, res) => {
    try {
        const { name } = req.body;

        // Input validation
        const validationError = validateNameParam(name);
        if (validationError) {
            return res.status(validationError.status).json({
                status: 'error',
                message: validationError.message
            });
        }

        // Create profile
        const result = await profileService.createProfile(name);

        if (result.exists) {
            return res.status(200).json({
                status: 'success',
                message: 'Profile already exists',
                data: result.profile
            });
        }

        return res.status(201).json({
            status: 'success',
            data: result.profile
        });

    } catch (error) {
        console.error('Create profile error:', error);

        // Handle external API errors
        if (error.apiName) {
            return res.status(502).json({
                status: 'error',
                message: `${error.apiName} returned an invalid response`
            });
        }

        // Handle other errors
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate UUID format
        if (!isValidUUIDv7(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid profile ID format'
            });
        }

        const profile = await profileService.getProfileById(id);

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: profile
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const getAllProfiles = async (req, res) => {
    try {
        const { gender, country_id, age_group } = req.query;

        const filters = {};
        if (gender) filters.gender = gender;
        if (country_id) filters.country_id = country_id;
        if (age_group) filters.age_group = age_group;

        const profiles = await profileService.getAllProfiles(filters);

        return res.status(200).json({
            status: 'success',
            count: profiles.length,
            data: profiles
        });

    } catch (error) {
        console.error('Get all profiles error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate UUID format
        if (!isValidUUIDv7(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid profile ID format'
            });
        }

        const profile = await profileService.deleteProfile(id);

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        return res.status(204).send();

    } catch (error) {
        console.error('Delete profile error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createProfile,
    getProfile,
    getAllProfiles,
    deleteProfile
};