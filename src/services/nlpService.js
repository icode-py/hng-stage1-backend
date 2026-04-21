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

        // Gender keywords
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
        this.countries = getAllCountries();
        this.countryAliases = {
            'usa': 'US',
            'america': 'US',
            'uk': 'GB',
            'britain': 'GB',
            'england': 'GB',
            'uae': 'AE',
            'emirates': 'AE'
        };
    }

    parseQuery(queryString) {
        if (!queryString || typeof queryString !== 'string') {
            return null;
        }

        const query = queryString.toLowerCase().trim();
        const filters = {};

        // Parse age-related terms
        this.parseAgeTerms(query, filters);

        // Parse gender
        this.parseGender(query, filters);

        // Parse age groups
        this.parseAgeGroups(query, filters);

        // Parse countries
        this.parseCountries(query, filters);

        // Parse "above X" patterns
        this.parseAbovePattern(query, filters);

        // Parse "below/under X" patterns
        this.parseBelowPattern(query, filters);

        // Check if we found any filters
        if (Object.keys(filters).length === 0) {
            return null;
        }

        return filters;
    }

    parseAgeTerms(query, filters) {
        // Handle "young"
        if (query.includes('young')) {
            Object.assign(filters, this.specialMappings.young);
        }

        // Handle specific ages (e.g., "age 25", "25 years old")
        const agePattern = /(?:age\s+)?(\d+)(?:\s*(?:years?\s*old|y\/o|yo))?/g;
        let match;
        while ((match = agePattern.exec(query)) !== null) {
            const age = parseInt(match[1]);
            if (!isNaN(age) && age >= 0 && age <= 150) {
                filters.age = age;
            }
        }
    }

    parseGender(query, filters) {
        for (const [keyword, gender] of Object.entries(this.genderKeywords)) {
            if (query.includes(keyword)) {
                filters.gender = gender;
                break;
            }
        }
    }

    parseAgeGroups(query, filters) {
        for (const [group, range] of Object.entries(this.ageGroups)) {
            if (query.includes(group)) {
                filters.age_group = group;
                // If no specific age filters set, use the group's range
                if (!filters.min_age && !filters.max_age && !filters.age) {
                    filters.min_age = range.min;
                    filters.max_age = range.max;
                }
                break;
            }
        }
    }

    parseCountries(query, filters) {
        // Check country aliases first
        for (const [alias, code] of Object.entries(this.countryAliases)) {
            if (query.includes(alias)) {
                filters.country_id = code;
                return;
            }
        }

        // Check full country names
        for (const [code, name] of Object.entries(this.countries)) {
            if (query.includes(name.toLowerCase())) {
                filters.country_id = code;
                return;
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
                    break;
                }
            }
        }
    }

    parseAbovePattern(query, filters) {
        const abovePattern = /(?:above|over|older\s+than|>\s*)(\d+)/;
        const match = query.match(abovePattern);
        if (match) {
            const age = parseInt(match[1]);
            if (!isNaN(age)) {
                filters.min_age = age;
            }
        }
    }

    parseBelowPattern(query, filters) {
        const belowPattern = /(?:below|under|younger\s+than|<\s*)(\d+)/;
        const match = query.match(belowPattern);
        if (match) {
            const age = parseInt(match[1]);
            if (!isNaN(age)) {
                filters.max_age = age;
            }
        }
    }
}

module.exports = new NaturalLanguageParser();