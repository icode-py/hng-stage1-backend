const profileService = require('../services/profileService');
const nlpService = require('../services/nlpService');
const { validateNameParam } = require('../utils/validators');

const isValidUUIDv7 = (id) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

const createProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const validationError = validateNameParam(name);
        if (validationError) {
            return res.status(validationError.status).json({
                status: 'error',
                message: validationError.message
            });
        }

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

        if (error.apiName) {
            return res.status(502).json({
                status: 'error',
                message: `${error.apiName} returned an invalid response`
            });
        }

        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const { id } = req.params;

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
        const {
            gender,
            age_group,
            country_id,
            min_age,
            max_age,
            min_gender_probability,
            min_country_probability,
            sort_by,
            order,
            page,
            limit
        } = req.query;

        // Validate query parameters
        const validSortBy = ['age', 'created_at', 'gender_probability'];
        const validOrder = ['asc', 'desc'];

        if (sort_by && !validSortBy.includes(sort_by)) {
            return res.status(422).json({
                status: 'error',
                message: 'Invalid query parameters'
            });
        }

        if (order && !validOrder.includes(order)) {
            return res.status(422).json({
                status: 'error',
                message: 'Invalid query parameters'
            });
        }

        const filters = {};
        if (gender) filters.gender = gender;
        if (age_group) filters.age_group = age_group;
        if (country_id) filters.country_id = country_id;
        if (min_age) filters.min_age = min_age;
        if (max_age) filters.max_age = max_age;
        if (min_gender_probability) filters.min_gender_probability = min_gender_probability;
        if (min_country_probability) filters.min_country_probability = min_country_probability;

        const options = {
            sort_by,
            order,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        };

        const result = await profileService.getAllProfiles(filters, options);

        // ENSURE EXACT FORMAT
        return res.status(200).json({
            status: 'success',
            page: result.page,
            limit: result.limit,
            total: result.total,
            data: result.profiles
        });

    } catch (error) {
        console.error('Get all profiles error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const searchProfiles = async (req, res) => {
    try {
        const { q, page, limit } = req.query;

        if (!q || q.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Search query is required'
            });
        }

        const filters = nlpService.parseQuery(q);

        // DEBUG: Log the parsed filters
        console.log('Query:', q);
        console.log('Parsed filters:', JSON.stringify(filters));

        if (!filters) {
            return res.status(400).json({
                status: 'error',
                message: 'Unable to interpret query'
            });
        }

        const options = {
            page: page || 1,
            limit: limit || 10
        };

        const result = await profileService.getAllProfiles(filters, options);

        return res.status(200).json({
            status: 'success',
            page: result.page,
            limit: result.limit,
            total: result.total,
            data: result.profiles
        });

    } catch (error) {
        console.error('Search profiles error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;

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
    searchProfiles,
    deleteProfile
};