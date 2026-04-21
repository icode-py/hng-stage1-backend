require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Profile = require('../models/Profile');
const { getCountryName } = require('../services/countryService');
const { generateUUIDv7 } = require('../utils/uuid');
const { getAgeGroup } = require('../utils/ageGroup');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://stinoemmanuel6_db_user:zTDBtf1TFgdsFoAZ@stage1cluster.be6shg7.mongodb.net/hng-stage1?retryWrites=true&w=majority';

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read the JSON file
        const filePath = path.join(__dirname, '../../data/profiles_2026.json');
        const data = await fs.readFile(filePath, 'utf8');
        const profiles = JSON.parse(data);

        console.log(`Found ${profiles.length} profiles in JSON file`);

        let inserted = 0;
        let skipped = 0;

        for (const profileData of profiles) {
            try {
                // Check if profile already exists
                const existingProfile = await Profile.findOne({
                    name: profileData.name.toLowerCase().trim()
                });

                if (existingProfile) {
                    skipped++;
                    continue;
                }

                // Calculate age group
                const age_group = getAgeGroup(profileData.age);

                // Get country name
                const country_name = getCountryName(profileData.country_id);

                // Create new profile with UUID v7
                const profile = new Profile({
                    _id: generateUUIDv7(),
                    name: profileData.name.toLowerCase().trim(),
                    gender: profileData.gender,
                    gender_probability: profileData.gender_probability,
                    age: profileData.age,
                    age_group: age_group,
                    country_id: profileData.country_id.toUpperCase(),
                    country_name: country_name,
                    country_probability: profileData.country_probability,
                    created_at: new Date()
                });

                await profile.save();
                inserted++;

                if (inserted % 100 === 0) {
                    console.log(`Inserted ${inserted} profiles...`);
                }
            } catch (error) {
                console.error(`Error processing profile ${profileData.name}:`, error.message);
            }
        }

        console.log(`\n🌱 Seeding complete!`);
        console.log(`✅ Inserted: ${inserted} profiles`);
        console.log(`⏭️ Skipped (already exist): ${skipped} profiles`);

        const totalCount = await Profile.countDocuments();
        console.log(`📊 Total profiles in database: ${totalCount}`);

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedDatabase();