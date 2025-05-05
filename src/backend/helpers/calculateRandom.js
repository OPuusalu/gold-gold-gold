export function calculateRandom(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid or empty item list');
    }

    const random = Math.random();
    let rarity;

    // Determine the rarity of the item
    if (random < 0.5) rarity = 'MIL-SPEC';
    else if (random < 0.8) rarity = 'RESTRICTED';
    else if (random < 0.95) rarity = 'CLASSIFIED';
    else if (random < 0.99) rarity = 'COVERT';
    else rarity = 'GOLD';

    // Filter items by rarity
    const filtered = items.filter(item => item.Rarity === rarity);

    if (filtered.length === 0) {
        throw new Error(`No items with rarity '${rarity}' found`);
    }

    // Select a random item from the filtered list
    const selected = filtered[Math.floor(Math.random() * filtered.length)];

    return selected;
}