import { CaseItem } from '../models/CaseItem';

export const fetchRandomItem = async (items) => {
    const response = await fetch('http://localhost:4445/api/random-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  
    if (!response.ok) throw new Error('Failed to fetch random item');

    const data = await response.json();
    const caseItem = new CaseItem(data.Name, data.Path, data.Value, data.Rarity);
    
    return caseItem;
};