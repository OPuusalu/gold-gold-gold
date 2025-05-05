import express from 'express';
import cors from 'cors';
import { cases } from './data/caseData.js';
import { calculateRandom } from './helpers/calculateRandom.js';

const app = express();

// Set the port for the server
const PORT = 4445;

// Enable CORS for frontend requests
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

const users = [
    {
        id: 1,
        token: 'abc55',
        coins: 2300
    }
]

// POST route to verify user by their token
app.post('/api/verify', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ 
            valid: false,
            error: 'Token is required' 
        });
    }

    const user = users.find(u => u.token === token);
    
    if (!user) {
        return res.status(401).json({ 
            valid: false,
            error: 'Invalid token' 
        });
    }

    // Successful verification
    return res.json({ 
        valid: true,
        user: {
            id: user.id,
            coins: user.coins
        }
    });
});

// GET route to fetch coins by user's token
app.get('/api/coins/:token', (req, res) => {
    const userToken = req.params.token;
    
    const user = users.find(u => u.token === userToken);
    
    if (!user) {
        return res.status(404).json({ error: `User not found` });
    }
    
    res.json({ coins: user.coins });
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
        const user = users.find(u => u.token === userToken);
        if (!user) {
            return res.status(401).json({ message: 'Invalid user token' });
        }

        const caseData = cases.find(c => c.id === caseId);
        if (!caseData) {
            return res.status(404).json({ message: 'Case not found' });
        }

        if (user.coins >= caseData.price) {
            user.coins -= caseData.price;
        } else {
            return res.json(301).json({ message: 'Invalid coin count' })
        }
        const winningItem = calculateRandom(caseData.items);
        
        if (winningItem?.Value > 0) {
            user.coins += winningItem.Value;
        }

        return res.json({
            item: winningItem,
            newCoinBalance: user.coins
        });

    } catch (error) {
        console.error(error);
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