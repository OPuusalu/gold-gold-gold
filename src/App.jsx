  import { useState, useEffect } from 'react';
  import './App.css';
  import CaseOpen from './caseOpen';
  import { CaseItem } from './models/CaseItem';
  import { path } from 'framer-motion/client';

  function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [coins, setCoins] = useState(1000);
    const [selectedCase, setSelectedCase] = useState(null);

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        localStorage.setItem('userToken', tokenFromUrl); // store for later use
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }, []);

    // Add case data
    const cases = [
      { 
        id: 1, 
        name: 'Fever Case', 
        price: 10, 
        image: 'src/assets/cases/fever/fever-case.png',
        items: [
          new CaseItem('M4A4 | Choppa', 'src/assets/cases/fever/M4A4Choppa.png', 5, 'MIL-SPEC'),
          new CaseItem('MAG-7 | Resupply', 'src/assets/cases/fever/MAG-7Resupply.png', 5, 'MIL-SPEC'),
          new CaseItem('SSG 08 | Memorial', 'src/assets/cases/fever/SSG08Memorial.png', 5, 'MIL-SPEC'),
          new CaseItem('P2000 | Sure Grip', 'src/assets/cases/fever/P2000SureGrip.png', 5, 'MIL-SPEC'),
          new CaseItem('USP-S | PC-GRN', 'src/assets/cases/fever/USP-SPC-GRN.png', 5, 'MIL-SPEC'),
          new CaseItem('MP9 | Nexus', 'src/assets/cases/fever/MP9Nexus.png', 5, 'MIL-SPEC'),
          new CaseItem('XM1014 | Mockingbird', 'src/assets/cases/fever/XM1014Mockingbird.png', 5, 'MIL-SPEC'),
          new CaseItem('Desert Eagle | Serpent Strike', 'src/assets/cases/fever/DesertEagleSerpentStrike.png', 10, 'RESTRICTED'),
          new CaseItem('Zeus x27 | Tosai', 'src/assets/cases/fever/Zeusx27Tosai.png', 10, 'RESTRICTED'),
          new CaseItem('Nova | Rising Sun', 'src/assets/cases/fever/NovaRisingSun.png', 10, 'RESTRICTED'),
          new CaseItem('Galil AR | Control', 'src/assets/cases/fever/GalilARControl.png', 10, 'RESTRICTED'),
          new CaseItem('P90 | Wave Breaker', 'src/assets/cases/fever/P90WaveBreaker.png', 10, 'RESTRICTED'),
          new CaseItem('AK-47 | Searing Rage', 'src/assets/cases/fever/AK-47SearingRage.png', 25, 'CLASSIFIED'),
          new CaseItem('Glock-18 | Shinobu', 'src/assets/cases/fever/Glock-18Shinobu.png', 25, 'CLASSIFIED'),
          new CaseItem('UMP-45 | K.O. Factory', 'src/assets/cases/fever/UMP-45KOFactory.png', 25, 'CLASSIFIED'),
          new CaseItem('FAMAS | Bad Trip', 'src/assets/cases/fever/FAMASBadTrip.png', 50, 'COVERT'),
          new CaseItem('AWP | Printstream', 'src/assets/cases/fever/AWPPrintstream.png', 50, 'COVERT'),
          new CaseItem('Extraordinary rare item', 'src/assets/rare-item.png', 1000, 'GOLD')
        ]
      },        
      { 
        id: 2, 
        name: 'Case 2',
        price: 50, 
        image: "src/assets/cases/fever/fever-case.png",
        items: [
           
        ]
      },
      { 
        id: 3, 
        name: 'Case 3',
        price: 100, 
        image: "src/assets/cases/fever/fever-case.png",
        items: [
          
        ]
      }
    ];

    if (isAuthenticated === null) {
      return <div style={{ textAlign: 'center', paddingTop: '20vh' }}>🔄 Checking authentication...</div>;
    }

    if (!isAuthenticated) {
      return <div style={{ textAlign: 'center', paddingTop: '20vh' }}>🔒 Access Denied</div>;
    }

    return (
      <div style={{ height: '100%', padding: '20px' }}>
        <div style={{ 
          position: 'fixed',
          top: 30,
          right: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '12px 24px',
          borderRadius: '20px',
          color: 'white',
          zIndex: 999,
          fontSize: '20px'
        }}>
          {coins}🪙
        </div>
        
        {!selectedCase ? (
          <div style={{
            alignItems: 'center',
            gap: '20px',
            display: 'flex'
          }}>
            {cases.map((c) => (
              <div 
                key={c.id}
                style={{
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedCase(c)}
              >
                <img 
                  src={c.image} 
                  alt={c.name} 
                />
                <h3>{c.name}</h3>
                <p>Cost: {c.price}🪙</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <CaseOpen 
              coins={coins} 
              setCoins={setCoins} 
              onBack={() => setSelectedCase(null)}
              caseData={selectedCase}
            />
          </div>
        )}
      </div>
    );
  }

  export default App;