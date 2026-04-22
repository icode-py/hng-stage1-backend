# HNG Internship Stage 2 - Intelligence Query Engine

## Live API URL
`https://hng-stage1-backend-production-3530.up.railway.app`

## Overview
This API provides advanced querying capabilities for demographic profile data, including filtering, sorting, pagination, and natural language search.

## Database Schema
| Field | Type | Notes |
|-------|------|-------|
| id | UUID v7 | Primary key |
| name | VARCHAR + UNIQUE | Person's full name |
| gender | VARCHAR | "male" or "female" |
| gender_probability | FLOAT | Confidence score |
| age | INT | Exact age |
| age_group | VARCHAR | child, teenager, adult, senior |
| country_id | VARCHAR(2) | ISO code (NG, US, etc.) |
| country_name | VARCHAR | Full country name |
| country_probability | FLOAT | Confidence score |
| created_at | TIMESTAMP | Auto-generated UTC |

## Endpoints

### 1. Get All Profiles (with Advanced Filtering)
**GET** `/api/profiles`

**Supported Filters:**
| Parameter | Description | Example |
|-----------|-------------|---------|
| gender | Filter by gender | `gender=male` |
| age_group | Filter by age group | `age_group=adult` |
| country_id | Filter by country code | `country_id=NG` |
| min_age | Minimum age | `min_age=25` |
| max_age | Maximum age | `max_age=40` |
| min_gender_probability | Minimum gender confidence | `min_gender_probability=0.7` |
| min_country_probability | Minimum country confidence | `min_country_probability=0.5` |

**Sorting:**
| Parameter | Values | Default |
|-----------|--------|---------|
| sort_by | age, created_at, gender_probability | created_at |
| order | asc, desc | desc |

**Pagination:**
| Parameter | Values | Default |
|-----------|--------|---------|
| page | Integer ≥ 1 | 1 |
| limit | Integer 1-50 | 10 |

**Example:**

GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10


### 2. Natural Language Search
**GET** `/api/profiles/search`

**Example:**

GET /api/profiles/search?q=young males from nigeria

text

### 3. Get Single Profile
**GET** `/api/profiles/{id}`

### 4. Create Profile
**POST** `/api/profiles`

{ "name": "john" }

### 5. Delete Profile
DELETE /api/profiles/{id}

Natural Language Parsing Approach
Supported Keywords and Mappings
Gender Keywords:

Male: male, males, man, men, boy, boys

Female: female, females, woman, women, girl, girls

Age Group Keywords:

Keyword	Age Range
child	0-12
teenager	13-19
adult	20-59
senior	60+
Special Keywords:

Keyword	Mapping
young	min_age=16, max_age=24
Age Patterns:

"above X" / "over X" / "older than X" → min_age=X

"below X" / "under X" / "younger than X" → max_age=X

"age X" / "X years old" → exact age match

Country Patterns:

"from X" where X is country name

Direct country names (e.g., "nigeria", "france")

Country aliases (e.g., "usa" → US, "uk" → GB)

Parsing Logic
The parser uses a rule-based approach with the following steps:

Tokenization: Converts query to lowercase for case-insensitive matching

Pattern Matching: Applies regex patterns to identify structured phrases

Keyword Lookup: Checks against predefined keyword dictionaries

Filter Construction: Builds MongoDB query filters from matched patterns

Conflict Resolution: Later matches override earlier ones for same filter type

Example Query Translations
Query	Filters Applied
"young males"	gender=male, min_age=16, max_age=24
"females above 30"	gender=female, min_age=30
"people from angola"	country_id=AO
"adult males from kenya"	gender=male, age_group=adult, country_id=KE
"male and female teenagers above 17"	age_group=teenager, min_age=17
"young women from brazil"	gender=female, min_age=16, max_age=24, country_id=BR

Limitations
What the parser does NOT handle:

Complex Boolean Logic: No support for OR conditions (e.g., "males OR females")

Negation: Cannot handle "not", "except", "excluding"

Nested Conditions: No support for parenthetical grouping

Multiple Countries: Only the first matched country is used

Ambiguous Terms: Words like "old" without context may be misinterpreted

Probability Filters: Natural language cannot specify confidence thresholds

Multiple Age Ranges: Cannot handle "between 20 and 30 or above 50"

Fuzzy Matching: Exact keyword matching only; typos will fail

Edge Cases Intentionally Not Handled:

Queries with conflicting conditions (e.g., "young seniors")

Non-English queries

Punctuation-heavy queries

Extremely long queries (>500 characters)



Response Format
Success Response
json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 2026,
  "data": [...]
}
Error Response
json
{
  "status": "error",
  "message": "Error description"
}


Tech Stack
Node.js / Express

MongoDB / Mongoose

UUID v7

Axios

Local Setup
bash
npm install
npm run seed  # Seed database with 2026 profiles
npm run dev
Performance Optimizations
Database indexes on all filterable fields (gender, age_group, country_id, age, probabilities)

Pagination limits (max 50 per page) to prevent memory issues

Lean queries for reduced memory footprint

Query optimization through proper MongoDB query construction

Author
Okereke Chima Emmanuel