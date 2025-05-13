import { useState, useEffect } from 'react';
import './style/App.css';
import CaseOpen from './caseOpen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [coins, setCoins] = useState(1000);
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const existingToken = localStorage.getItem('userToken');
    const tokenToVerify = tokenFromUrl || existingToken;
  
    const verifyToken = async (token) => {
      try {
        console.log('Verifying user token')
        const response = await fetch('http://localhost:4445/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });
  
        const data = await response.json();
  
        if (!response.ok || !data.valid) {
          throw new Error(data.error || 'Invalid token');
        }
  
        if (tokenFromUrl) {
          localStorage.setItem('userToken', tokenFromUrl);
        }
        
        setIsAuthenticated(true);
        console.log('User verified successfully')
      } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
      }
    };

    const fetchCoins = async () => {
      try {
          console.log('Fetching coins from /api/coins/:userToken')
          const token = localStorage.getItem('userToken');
          if (!token) return;
          
          const response = await fetch(`http://localhost:4445/api/coins/${token}`);
          if (!response.ok) throw new Error('Failed to fetch coins');
          
          const data = await response.json();
          setCoins(data.coins);
          console.log('Coins fetched successfully')
      } catch (error) {
          console.error('Coin fetch error:', error);
      }
    };
  
    const fetchCases = async () => {
      try {
        console.log("Fetching cases from /api/cases/")
        const response = await fetch('http://localhost:4445/api/cases/');
        if (!response.ok) throw new Error('Failed to fetch cases');
        const data = await response.json();
        setCases(data);
        console.log("Cases fetched successfully")
      } catch (error) {
        console.error('Case fetch error:', error);
      }
    };
  
    if (tokenToVerify) {
      verifyToken(tokenToVerify).then(fetchCases).then(fetchCoins);
    } else {
      setIsAuthenticated(false);
      fetchCases();
    }
  }, []);

  if (isAuthenticated === null) {
    return <div className="auth-loading">🔄 Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div className="auth-denied">🔒 Access Denied</div>;
  }

  return (
    <div className="app-container">
      {/*Header*/}
      <header className="app-header">
        <button
          onClick={() => setSelectedCase(null)}
          className={`back-button ${selectedCase ? 'visible' : ''}`}
        >
          ← Back to Cases
        </button>
        
        <div className="coin-display">
          {coins}🪙
        </div>
      </header>

      {/*Main content area*/}
      <main className="main-content">
        {!selectedCase ? (
          <div className="cases-container">
            {cases ? cases.map((c) => (
              <div 
                key={c.id}
                className="case-card"
                onClick={() => setSelectedCase(c)}
              >
                <img
                  className="case-image"
                  src={c.image} 
                  alt={c.name} 
                />
                <h3>{c.name}</h3>
                <p>Cost: {c.price}🪙</p>
              </div>
            )) : (
              <div className="cases-loading">Loading cases...</div>
            )}
          </div>
        ) : (
          <CaseOpen 
            coins={coins} 
            setCoins={setCoins} 
            caseId={selectedCase.id}
          />
        )}
      </main>

      {/* Legal footer
      <footer className="app-footer">
        <div>
          This website is not affiliated with or endorsed by Valve Corporation. 
          Counter-Strike, Counter-Strike 2, CS2, and all associated logos, 
          characters, designs, and images are trademarks and/or copyright 
          material of Valve Corporation. All rights reserved.
        </div>
        <div className="footer-secondary">
          All in-game content depictions are the intellectual property of their 
          respective owners and are used here for educational/fan purposes only.
        </div>
      </footer>
      */}
    </div>
  );
}

export default App;