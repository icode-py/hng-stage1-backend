# HNG Internship Stage 1 - Data Persistence & API Design

## Live API URL
`https://your-app-name.up.railway.app`

## Endpoints

### 1. Create Profile
**POST** `/api/profiles`
```json
{
  "name": "ella"
}

2. Get All Profiles
GET /api/profiles
Query params: ?gender=male&country_id=NG&age_group=adult

3. Get Single Profile
GET /api/profiles/{id}


4. Delete Profile
DELETE /api/profiles/{id}

Example Responses
Success (201 Created

Tech Stack
Node.js/Express

MongoDB/Mongoose

UUID v7

Axios

Local Setup
bash
npm install
cp .env.example .env
# Add your MongoDB URI to .env
npm run dev

Author
Okereke Chima Emmanuel