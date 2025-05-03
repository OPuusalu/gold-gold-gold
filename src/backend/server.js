import express from 'express';
import cors from 'cors';

const app = express();

// Set the port for the server
const PORT = 4445;

// Enable CORS for frontend requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// POST route to receive case items and return one random item
app.post('/api/random-item', (req, res) => {
    const { items } = req.body;

    // Check if items are valid
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid or empty case item list' });
    }

    // Normal case opening logic with rarity distribution
    const random = Math.random();
    let rarity;

    // Determine the rarity of the item
    if (random < 0.5) rarity = 'MIL-SPEC';
    else if (random < 0.8) rarity = 'RESTRICTED';
    else if (random < 0.95) rarity = 'CLASSIFIED';
    else if (random < 0.99) rarity = 'COVERT';
    else rarity = 'GOLD';

    // Filter items by rarity
    const filtered = items.filter(item => item.Rarity == rarity);
      
    if (filtered.length === 0) {
        return res.status(404).json({ error: `No items with rarity '${rarity}' found` });
    }    

    // Select a random item from the filtered list
    const selected = filtered[Math.floor(Math.random() * filtered.length)];
    res.json(selected); // Return the selected item
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});