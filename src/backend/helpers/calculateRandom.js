export function calculateRandom(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid or empty item list');
    }

    const random = Math.random();
    let rarity;

    // Determine the rarity of the item
    if (random < 0.4) rarity = 'COMMON';
    else if (random < 0.75) rarity = 'UNCOMMON';
    else if (random < 0.90) rarity = 'RARE';
    else if (random < 0.95) rarity = 'EPIC';
    else rarity = 'GOLDEN';

    // Filter items by rarity
    const filtered = items.filter(item => item.Rarity === rarity);

    if (filtered.length === 0) {
        throw new Error(`No items with rarity '${rarity}' found`);
    }

    // Select a random item from the filtered list
    const selected = filtered[Math.floor(Math.random() * filtered.length)];

    return selected;
}