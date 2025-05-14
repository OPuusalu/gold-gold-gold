import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import './style/caseOpen.css';
import { fetchRandomItem, openCaseQuery } from "./api/caseApi";
import { CASE_CONFIG } from "./models/caseConfiguration";

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const RARITY_COLORS = {
  'COMMON': '#4b69ff',
  'UNCOMMON': '#8847ff',
  'RARE': '#d32ce6',
  'EPIC': '#eb4b4b',
  'GOLDEN': '#ffd700'
};

export default function CaseOpen({ coins, setCoins, caseId }) {
    const [itemWidth, setItemWidth] = useState(CASE_CONFIG.ITEM_WIDTH());
    const [caseData, setCaseData] = useState([]);
    const [state, setState] = useState({
        renderedItems: [],
        xPosition: 0,
        isCaseOpened: false,
        description: { text: '', visible: false },
        isOpening: false,
        paths: [],
        nextPaths: []
    });
    const animationKey = useRef(0);
    
    useEffect(() => {
        const handleResize = () => {
          setItemWidth(CASE_CONFIG.ITEM_WIDTH());
        };
        
        window.addEventListener('resize', handleResize);
        
        fetch(`https://leopard-sensible-commonly.ngrok-free.app/api/cases/${caseId}`)
        .then(res => res.json())
        .then(data => { setCaseData(data); })
        .catch(err => { console.log(err); });
        
        return () => window.removeEventListener('resize', handleResize);
      }, []);

    // Generate initial paths when caseData is available
    useEffect(() => {
        if (!caseData || caseData.length === 0) {
            return;
        }

        const generatePaths = async () => {
            try {
                const [initialPaths, nextSpinPaths] = await Promise.all([
                    Promise.all(Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, () => 
                        fetchRandomItem(caseData.id).then(item => item?.Path || '')
                    )),
                    Promise.all(Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, () => 
                        fetchRandomItem(caseData.id).then(item => item?.Path || '')
                    ))
                ]);

                setState(prev => ({
                    ...prev,
                    paths: initialPaths,
                    nextPaths: nextSpinPaths,
                    renderedItems: generateItems(null, initialPaths)
                }));
            } catch (err) {
                console.error('Failed to load paths:', err);
            }
        };

        generatePaths();
    }, [caseData]);

    const openCase = async () => {

        const token = localStorage.getItem('userToken');
        const response = await openCaseQuery(caseData.id, token);
        const { item, newCoinBalance } = response.data;

        // doesn't affect actual coin count, just to make it seem it changes right after pressing the button
        setCoins(coins - caseData.price);

        animationKey.current += 1;
        setState(prev => ({ ...prev, xPosition: 0 }));
        
        // Reset view
        setState(prev => ({ ...prev, description: { ...prev.description, visible: false } }));
        setState(prev => ({ ...prev, isOpening: true }));
        
        const currentPaths = [...state.paths];
        const newItems = generateItems(item, currentPaths);
        setState(prev => ({ ...prev, renderedItems: newItems }));
                
        // so what's going on here:
        // 16 is the padding of the items container
        // Since after the items-container gets placed into the screen in the middle is 3rd item, so
        // we add 6 times one item margin
        // next we take 3 off reward item index, for same reason, and then multiply it by item width + 2 times the margin
        // finally we add half of item width and one margin to get the centre of reward item
        const rewardItemCentre = 16 + 6 * CASE_CONFIG.ITEM_MARGIN + (CASE_CONFIG.REWARD_INDEX - 3) * (itemWidth + 2 * CASE_CONFIG.ITEM_MARGIN) + itemWidth/2 + CASE_CONFIG.ITEM_MARGIN;
        const VARIATION = itemWidth * 0.4;

        const randomEndXpos = randomInRange(rewardItemCentre - VARIATION, rewardItemCentre + VARIATION);

        setState(prev => ({ ...prev, xPosition: -randomEndXpos, isCaseOpened: true }));

        const newNextPaths = await Promise.all(
            Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, async (_, index) => {
                const randomItemData = await fetchRandomItem(caseData.id);
                return randomItemData ? randomItemData.Path : '';
            })
        );
        setState(prev => ({ ...prev, nextPaths: newNextPaths }));

        setTimeout(() => {
            const description = `You won ${item.Name} ( ${item.Value > 0 ? `+${item.Value}🪙` : ''} )`;
            setState(prev => ({
                ...prev,
                description: { text: description, visible: true },
                isOpening: false,
                paths: [...prev.nextPaths]
            }));
            
            setCoins(newCoinBalance);
        }, 3000);
    };

    const renderAnimation = () => (
        <div id="items-container" style={{ minWidth: itemWidth * 6 }}>
            <div id="red-line"/>
            <motion.div
                style={{
                    display: 'flex',
                    width: CASE_CONFIG.TOTAL_ITEMS * (itemWidth + CASE_CONFIG.ITEM_MARGIN * 2),
                    height: itemWidth,
                    position: 'relative',
                    zIndex: 1,
                    alignItems: 'center'
                }}
                key={animationKey.current}
                animate={{ x: state.xPosition }}
                transition={{ 
                    duration: CASE_CONFIG.ANIMATION_DURATION,
                    ease: 'easeOut',
                    damping: 20,
                    stiffness: 300
                }}
            >
                {state.renderedItems}
            </motion.div>
        </div>
    );

    const generateItems = useCallback((winningItem, pathsToUse) => {
        return Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, (_, index) => {
            const item = index === CASE_CONFIG.REWARD_INDEX ? 
                winningItem : 
                caseData.items.find(i => i.Path === pathsToUse[index]);
            
            const rarityColor = RARITY_COLORS[item?.Rarity] || '#ccc';

            return (
                <div
                    className="item-element"
                    key={index}
                    id={`item-${index}`}
                    style={{
                        width: itemWidth,
                        height: itemWidth,
                        backgroundImage: `url(${item?.Path || ''})`,
                        border: `2px solid ${rarityColor}`,
                        margin: `0 ${CASE_CONFIG.ITEM_MARGIN}px`
                    }}
                >
                    {/* Corner indicators */}
                    <div id="item-corner-indicator" style={{ border: `2px solid ${rarityColor}`}}/>
                    
                    {/* Top-left corner triangle */}
                    <div id="item-corner-triangle" style={{ bottom: 0, left: 0, borderBottom: `15px solid ${rarityColor}`, transform: 'rotate(-135deg)'}}/>
                    
                    {/* Bottom-right corner triangle */}
                    <div id="item-corner-triangle" style={{ top: 0, right: 0, borderBottom: `15px solid ${rarityColor}`, transform: 'rotate(45deg)'}}/>

                    {/* Rarity text label */}
                    {item?.Rarity && (
                        <div id="item-rarity-label">
                            {item.Rarity}
                        </div>
                    )}
                </div>
            );
        });
    }, [
        CASE_CONFIG.TOTAL_ITEMS,
        CASE_CONFIG.REWARD_INDEX,
        CASE_CONFIG.ITEM_MARGIN,
        itemWidth,
        caseData.items
    ]);

    return (
        <div id="page-container" style={{ minWidth: 6 * itemWidth }}>   
            <div id="main-container" style={{ maxWidth: 6 * itemWidth }}>
                {!state.isCaseOpened ? (
                    <img 
                        src={caseData.image} 
                        alt={caseData.name} 
                        style={{ 
                            maxWidth: '80%', 
                            maxHeight: '80%', 
                            objectFit: 'contain',
                            display: 'block',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                            transform: 'rotateY(0deg)',
                            transition: 'transform 0.3s ease'
                        }} 
                    />
                ) : (
                    renderAnimation()
                )}
            </div>
            
            <div id='win-text-container'
                style={{ maxWidth: 6 * itemWidth}}>
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                        opacity: state.description.visible ? 1 : 0,
                        y: state.description.visible ? 0 : 10
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ 
                        margin: 0,
                        fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                        color: 'white',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}
                >
                    <span style={{ color: '#48bb78', fontSize: 'clamp(1rem, 4vw, 1.5rem)'}}/>
                    {state.description.text}
                </motion.h2>
            </div>
    
            <button
                id="open-case-button"
                type="button"
                className="open-case-btn"
                onClick={openCase}
                disabled={state.isOpening || coins < caseData.price}
                >
                {state.isOpening ? (
                    <span style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                    }}>
                    <span style={{ 
                        animation: 'spin 1s linear infinite',
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                    }}>
                        ⏳
                    </span>
                    Spinning...
                    </span>
                ) : (
                    <span style={{ position: 'relative', zIndex: 1 }}>
                    SPIN ({caseData.price}🪙)
                    </span>
                )}
                </button>
        </div>
    );
}