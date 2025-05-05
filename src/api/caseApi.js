import { CaseItem } from '../models/CaseItem';

export const fetchRandomItem = async (caseId) => {
    try {
        const response = await fetch(`http://localhost:4445/api/cases/${caseId}/random`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId }),
        });

        if (!response.ok) throw new Error('Failed to fetch random item');

        const data = await response.json();
        
        if (!data.Name || !data.Path || !data.Value || !data.Rarity) {
            throw new Error('Invalid data structure received');
        }

        // Create and return a new CaseItem instance
        const caseItem = new CaseItem(data.Name, data.Path, data.Value, data.Rarity);
        return caseItem;

    } catch (error) {
        console.error('Error fetching random item:', error);
        throw error;  // Re-throw the error after logging it
    }
};

export const openCaseQuery = async (caseId, userToken) => {
  try {
    const response = await fetch(`http://localhost:4445/api/cases/${caseId}/open/${userToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caseId: caseId,
        userToken: userToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to open case');
    }

    const data = await response.json();
    
    if (!data.item || !data.newCoinBalance) {
      throw new Error('Invalid response structure');
    }

    return {data};
    
  } catch (err) {
  console.error('Case opening error:', err.message);
  }
}