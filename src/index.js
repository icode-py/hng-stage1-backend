const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const profileController = require('./controllers/profileController');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (no env check)
connectDB().catch(err => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.post('/api/profiles', (req, res, next) => {
    profileController.createProfile(req, res).catch(next);
});

app.get('/api/profiles', (req, res, next) => {
    profileController.getAllProfiles(req, res).catch(next);
});

app.get('/api/profiles/:id', (req, res, next) => {
    profileController.getProfile(req, res).catch(next);
});

app.delete('/api/profiles/:id', (req, res, next) => {
    profileController.deleteProfile(req, res).catch(next);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'success', message: 'Server is running' });
});

// Root
app.get('/', (req, res) => {
    res.json({
        message: 'HNG Stage 1 Backend API',
        endpoints: {
            createProfile: 'POST /api/profiles',
            getAllProfiles: 'GET /api/profiles',
            getProfile: 'GET /api/profiles/:id',
            deleteProfile: 'DELETE /api/profiles/:id'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});