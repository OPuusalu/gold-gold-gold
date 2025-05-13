import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { aiCases } from './data/caseData.js';
import { calculateRandom } from './helpers/calculateRandom.js';

const app = express();

// Set the port for the server
const PORT = 4445;

// Enable CORS for frontend requests
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

const BASE_URI = "https://evolved-weasel-literate.ngrok-free.app/api";

// loading ai generated cases
const cases = aiCases;

// POST route to verify user by their token
app.post('/api/verify', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    try {
        const response = await fetch(`${BASE_URI}/User/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return res.status(401).json({ valid: false, error: 'Invalid token' });
        }

        const user = await response.json();

        // Check if basic user data exists
        if (user && user.id && user.username) {
            return res.json({ valid: true, user });
        } else {
            return res.status(401).json({ valid: false, error: 'Invalid user data' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ valid: false, error: 'Internal server error' });
    }
});

// GET route to fetch coins by user's token
app.get('/api/coins/:token', async (req, res) => {
    const token = req.params.token;

    try {
        const response = await axios.post(`${BASE_URI}/Transaction/balance`, null, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const coinAmount = response.data.currency;
        res.json({ coins: coinAmount });
    } catch (error) {
        console.error('Error fetching coin balance:', error.message);
        res.status(500).json({ error: 'Failed to fetch coin balance' });
    }
});

// GET route to fetch all cases
app.get('/api/cases/', (_, res) => {
    res.json(cases);
});

// GET route to fetch a case by its ID
app.get('/api/cases/:id', (req, res) => {
    const caseId = parseInt(req.params.id);
    
    const foundCase = cases.find(c => c.id === caseId);

    if (!foundCase) {
        return res.status(404).json({ error: `Case with ID ${caseId} not found` });
    }

    res.json(foundCase);
});

// POST route to open a case
app.post('/api/cases/:id/open/:userToken', async (req, res) => {
    const caseId = Number(req.params.id);
    const userToken = req.params.userToken;

    try {
        const caseData = cases.find(c => c.id === caseId);
        if (!caseData) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Random winning item
        const winningItem = calculateRandom(caseData.items);

        const amount = -caseData.price + winningItem.Value

        await axios.post(`${BASE_URI}/Transaction/addBalance`, { Amount: amount }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        // Request new balance
        const response = await axios.post(`${BASE_URI}/Transaction/balance`, null, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        const coinAmount = response.data.currency;

        return res.json({
            item: winningItem,
            newCoinBalance: coinAmount
        });

    } catch (error) {
        console.error('Error during case opening:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// POST route to receive case items and return one random item
app.post('/api/cases/:id/random', (req, res) => {
    const caseId = parseInt(req.body.caseId);
    const caseData = cases.find(c => c.id === caseId);

    try {
        if (!caseData || !caseData.items) {
            return res.status(400).json({ error: 'Invalid caseId or case items not found' });
        }

        const randomItem = calculateRandom(caseData.items);

        res.status(200).json(randomItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});