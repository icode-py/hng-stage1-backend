const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => require('../utils/uuid').generateUUIDv7()
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    gender_probability: {
        type: Number,
        required: true
    },
    sample_size: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    age_group: {
        type: String,
        enum: ['child', 'teenager', 'adult', 'senior'],
        required: true
    },
    country_id: {
        type: String,
        required: true
    },
    country_probability: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: () => new Date()
    }
}, {
    timestamps: false,
    versionKey: false
});

// Convert _id to id in JSON responses
profileSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Profile', profileSchema);