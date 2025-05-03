import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchRandomItem } from "./api/caseApi";
import { CASE_CONFIG } from "./models/caseConfiguration";

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const RARITY_COLORS = {
  'MIL-SPEC': '#4b69ff',
  'RESTRICTED': '#8847ff',
  'CLASSIFIED': '#d32ce6',
  'COVERT': '#eb4b4b',
  'GOLD': '#ffd700'
};

export default function CaseOpen({ coins, setCoins, onBack, caseData }) {
    const [itemWidth, setItemWidth] = useState(CASE_CONFIG.ITEM_WIDTH());
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
        return () => window.removeEventListener('resize', handleResize);
      }, []);

    // Generate initial paths when component mounts
    useEffect(() => {
        const abortController = new AbortController();

        const generateInitialPaths = async () => {
            try {
                const initialPaths = await Promise.all(
                    Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, async (_, index) => {
                        const randomItemData = await fetchRandomItem(caseData.items);
                        return randomItemData ? randomItemData.Path : '';
                    })
                );
                
                const nextSpinPaths = await Promise.all(
                    Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, async (_, index) => {
                        const randomItemData = await fetchRandomItem(caseData.items);
                        return randomItemData ? randomItemData.Path : '';
                    })
                );

                setState(prev => ({
                    ...prev,
                    paths: initialPaths,
                    nextPaths: nextSpinPaths
                }));
            } catch (err) {
                if (!abortController.signal.aborted) {
                    console.error('Failed to load paths ', err);
                }
            }
        };
        
        generateInitialPaths();
        return () => abortController.abort();
    }, [caseData]);

    const openCase = async () => {
        if (coins < caseData.price) return;

        animationKey.current += 1;
        setState(prev => ({ ...prev, xPosition: 0 }));
        
        // Reset view
        setState(prev => ({ ...prev, description: { ...prev.description, visible: false } }));
        setState(prev => ({ ...prev, isOpening: true }));
        setCoins(c => c - caseData.price);
        
        const currentPaths = [...state.paths];
        const winningItem = await fetchRandomItem(caseData.items);
        const newItems = generateItems(winningItem, currentPaths);
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
                const randomItemData = await fetchRandomItem(caseData.items);
                return randomItemData ? randomItemData.Path : '';
            })
        );
        setState(prev => ({ ...prev, nextPaths: newNextPaths }));

        setTimeout(() => {
            const description = `You won ${winningItem.Name} ( ${winningItem.Value > 0 ? `+${winningItem.Value}🪙` : ''} )`;
            setState(prev => ({
                ...prev,
                description: { text: description, visible: true },
                isOpening: false,
                paths: [...prev.nextPaths]
            }));
            
            if(winningItem.Value > 0) {
                setCoins(c => c + winningItem.Value);
            }
        }, 3000);
    };

    const renderAnimation = () => (
        <div 
            id="items-container" 
            style={{
                display: 'flex',
                overflow: 'hidden',
                width: '100%',
                minWidth: itemWidth * 6,
                borderRadius: '16px',
                position: 'relative',
                padding: '16px',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                border: '2px solidrgb(0, 0, 0)'
            }}
        >
            <div 
                id="red-line"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '7%',
                    bottom: '7%',
                    width: '3px',
                    background: 'linear-gradient(to bottom, #ff0000, #cc0000)',
                    zIndex: 2,
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(255,0,0,0.3)'
                }}
            />
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
                    ease: 'easeOut'
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
                    key={index}
                    id={`item-${index}`}
                    style={{
                        width: itemWidth,
                        height: itemWidth,
                        minWidth: '60px',
                        aspectRatio: '1/1',
                        backgroundImage: `url(${item?.Path || ''})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: `2px solid ${rarityColor}`,
                        borderRadius: '5px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        margin: `0 ${CASE_CONFIG.ITEM_MARGIN}px`,
                        boxSizing: 'border-box',
                        position: 'relative',
                    }}
                >
                    {/* Corner indicators */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: `2px solid ${rarityColor}`,
                        borderRadius: '5px',
                        pointerEvents: 'none',
                    }}/>
                    
                    {/* Top-left corner triangle */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        borderTop: '15px solid transparent',
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderBottom: `15px solid ${rarityColor}`,
                        transform: 'rotate(-135deg)',
                        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
                    }}/>
                    
                    {/* Bottom-right corner triangle */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 0,
                        height: 0,
                        borderTop: '15px solid transparent',
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderBottom: `15px solid ${rarityColor}`,
                        transform: 'rotate(45deg)',
                        filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.3))'
                    }}/>

                    {/* Rarity text label */}
                    {item?.Rarity && (
                        <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            padding: '2px 6px',
                            fontSize: '0.7rem',
                            borderRadius: '3px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                        }}>
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
        <div
            id="page-container"
            style={{ 
                position: 'relative',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                minWidth: 6 * itemWidth,
                boxSizing: 'border-box',
                overflowX: 'hidden'
            }}
        >   
            <div 
                id="main-container"
                style={{
                    maxWidth: 6 * itemWidth,
                    display: 'flex',
                    marginTop: '90px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    ':before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.6,
                        zIndex: 0
                    }
                }}
            >
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
                            transition: 'transform 0.3s ease',
                            ':hover': {
                                transform: 'rotateY(10deg)'
                            }
                        }} 
                    />
                ) : (
                    renderAnimation()
                )}
            </div>
            
            <div id='win-text-container'
                style={{ 
                    position: 'relative',
                    width: '100%',
                    textAlign: 'center',
                    padding: '1.5rem',
                    maxWidth: 6 * itemWidth,
                    borderRadius: '8px',
                    margin: '1rem 0',
                    zIndex: 3,
                }}>
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
                        flexWrap: 'wrap' // Allow wrapping on small screens
                    }}
                >
                    <span style={{ 
                        color: '#48bb78', 
                        fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' // Responsive emoji size
                    }}>
                        🎉
                    </span>
                    {state.description.text}
                </motion.h2>
            </div>
    
            <button 
                type="button" 
                onClick={openCase} 
                disabled={state.isOpening || coins < caseData.price} 
                style={{ 
                    margin: '2rem 0',
                    padding: '1rem 2rem',
                    fontSize: 'clamp(1rem, 4vw, 1.5rem)',
                    fontWeight: '700',
                    background: state.isOpening 
                    ? 'linear-gradient(145deg, #e2e8f0, #cbd5e0)' 
                    : 'linear-gradient(145deg,rgb(56, 56, 56),rgb(62, 72, 81))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: state.isOpening 
                    ? '0 2px 4px rgba(0,0,0,0.1)' 
                    : '0 4px 6px -1px rgba(17, 17, 17, 0.3), 0 2px 4px -1px rgba(21, 31, 39, 0.2)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    ':hover:not(:disabled)': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 15px -3px rgba(66, 153, 225, 0.3), 0 4px 6px -2px rgba(66, 153, 225, 0.2)'
                    },
                    ':active:not(:disabled)': {
                    transform: 'translateY(0)'
                    },
                    ':disabled': {
                    opacity: 0.7,
                    cursor: 'not-allowed'
                    },
                    ':before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '30%',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px 12px 0 0'
                    }
                }}
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
                        🌀
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