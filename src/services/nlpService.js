const { getAllCountries } = require('./countryService');

class NaturalLanguageParser {
    constructor() {
        // Age group mappings
        this.ageGroups = {
            'child': { min: 0, max: 12 },
            'teenager': { min: 13, max: 19 },
            'adult': { min: 20, max: 59 },
            'senior': { min: 60, max: 150 }
        };

        // Special keywords
        this.specialMappings = {
            'young': { min_age: 16, max_age: 24 }
        };

        // Gender keywords - EXPANDED
        this.genderKeywords = {
            'male': 'male',
            'males': 'male',
            'man': 'male',
            'men': 'male',
            'boy': 'male',
            'boys': 'male',
            'female': 'female',
            'females': 'female',
            'woman': 'female',
            'women': 'female',
            'girl': 'female',
            'girls': 'female'
        };

        // Country mappings
        this.countries = require('./countryService').getAllCountries();
        this.countryAliases = {
            'usa': 'US',
            'america': 'US',
            'uk': 'GB',
            'britain': 'GB',
            'england': 'GB',
            'uae': 'AE',
            'emirates': 'AE',
            'nigeria': 'NG'
        };
    }

    parseQuery(queryString) {
        if (!queryString || typeof queryString !== 'string') {
            return null;
        }

        const query = queryString.toLowerCase().trim();
        const filters = {};
        let foundMatch = false;

        // Parse age-related terms
        if (this.parseAgeTerms(query, filters)) foundMatch = true;

        // Parse gender
        if (this.parseGender(query, filters)) foundMatch = true;

        // Parse age groups
        if (this.parseAgeGroups(query, filters)) foundMatch = true;

        // Parse countries
        if (this.parseCountries(query, filters)) foundMatch = true;

        // Parse "above X" patterns
        if (this.parseAbovePattern(query, filters)) foundMatch = true;

        // Parse "below/under X" patterns
        if (this.parseBelowPattern(query, filters)) foundMatch = true;

        // Handle combined gender queries like "male and female"
        if (query.includes('male and female') || query.includes('female and male')) {
            // Remove gender filter since it could be either
            delete filters.gender;
            foundMatch = true;
        }

        if (!foundMatch) {
            return null;
        }

        return filters;
    }

    parseAgeTerms(query, filters) {
        let found = false;

        // Handle "young"
        if (query.includes('young')) {
            filters.min_age = 16;
            filters.max_age = 24;
            found = true;
        }

        // Handle specific ages
        const agePattern = /(?:age\s+)?(\d+)(?:\s*(?:years?\s*old|y\/o|yo))?/g;
        let match;
        while ((match = agePattern.exec(query)) !== null) {
            const age = parseInt(match[1]);
            if (!isNaN(age) && age >= 0 && age <= 150) {
                filters.age = age;
                found = true;
            }
        }

        return found;
    }

    parseGender(query, filters) {
        // Check for "male and female" pattern - don't set gender filter
        if (query.includes('male and female') || query.includes('female and male')) {
            return true; // Found match but don't filter
        }

        for (const [keyword, gender] of Object.entries(this.genderKeywords)) {
            if (query.includes(keyword)) {
                filters.gender = gender;
                return true;
            }
        }
        return false;
    }

    parseAgeGroups(query, filters) {
        for (const [group, range] of Object.entries(this.ageGroups)) {
            if (query.includes(group)) {
                filters.age_group = group;
                if (!filters.min_age && !filters.max_age && !filters.age) {
                    filters.min_age = range.min;
                    filters.max_age = range.max;
                }
                return true;
            }
        }
        return false;
    }

    parseCountries(query, filters) {
        // Check "people from X" pattern first
        const peoplePattern = /people\s+from\s+([a-z\s]+?)(?:\s|$)/;
        const peopleMatch = query.match(peoplePattern);
        if (peopleMatch) {
            const countryName = peopleMatch[1].trim();
            for (const [code, name] of Object.entries(this.countries)) {
                if (name.toLowerCase() === countryName) {
                    filters.country_id = code;
                    return true;
                }
            }
            // Check aliases
            for (const [alias, code] of Object.entries(this.countryAliases)) {
                if (countryName === alias) {
                    filters.country_id = code;
                    return true;
                }
            }
        }

        // Check country aliases
        for (const [alias, code] of Object.entries(this.countryAliases)) {
            if (query.includes(alias)) {
                filters.country_id = code;
                return true;
            }
        }

        // Check full country names
        for (const [code, name] of Object.entries(this.countries)) {
            if (query.includes(name.toLowerCase())) {
                filters.country_id = code;
                return true;
            }
        }

        // Check for "from X" pattern
        const fromPattern = /from\s+([a-z\s]+?)(?:\s|$)/;
        const fromMatch = query.match(fromPattern);
        if (fromMatch) {
            const countryName = fromMatch[1].trim();
            for (const [code, name] of Object.entries(this.countries)) {
                if (name.toLowerCase() === countryName) {
                    filters.country_id = code;
                    return true;
                }
            }
            // Check aliases
            for (const [alias, code] of Object.entries(this.countryAliases)) {
                if (countryName === alias) {
                    filters.country_id = code;
                    return true;
                }
            }
        }

        return false;
    }

    parseAbovePattern(query, filters) {
        const abovePattern = /(?:above|over|older\s+than|>\s*)(\d+)/;
        const match = query.match(abovePattern);
        if (match) {
            const age = parseInt(match[1]);
            if (!isNaN(age)) {
                filters.min_age = age;
                return true;
            }
        }
        return false;
    }

    parseBelowPattern(query, filters) {
        const belowPattern = /(?:below|under|younger\s+than|<\s*)(\d+)/;
        const match = query.match(belowPattern);
        if (match) {
            const age = parseInt(match[1]);
            if (!isNaN(age)) {
                filters.max_age = age;
                return true;
            }
        }
        return false;
    }
}

module.exports = new NaturalLanguageParser();
