import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { fetchRandomItem } from "./api/caseApi";
import { CASE_CONFIG } from "./models/caseConfiguration"

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function CaseOpen({ coins, setCoins, onBack, caseData }) {
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

    // Generate initial paths when component mounts
    useEffect(() => {
        const abortController = new AbortController();

        const generateInitialPaths = async () => {
            try{
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
        
        const rewardPosition = CASE_CONFIG.REWARD_INDEX * (CASE_CONFIG.ITEM_WIDTH + 2 * CASE_CONFIG.ITEM_MARGIN) + CASE_CONFIG.ITEM_WIDTH;
        const containerCenter = CASE_CONFIG.CONTAINER_WIDTH / 2;
        const itemCenterOffset = CASE_CONFIG.ITEM_WIDTH / 2;
        
        // Set random variation range (±40px)
        const VARIATION = CASE_CONFIG.ITEM_WIDTH * 0.4;
        
        const randomEndXpos = randomInRange(
            rewardPosition - containerCenter + itemCenterOffset - VARIATION,
            rewardPosition - containerCenter + itemCenterOffset + VARIATION
        );

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
                width: CASE_CONFIG.CONTAINER_WIDTH,
                background: 'linear-gradient(145deg, #ffffff, #f1f5f9)',
                borderRadius: '16px',
                position: 'relative',
                padding: '16px',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                border: '2px solid #e2e8f0'
            }}
        >
            <div 
                id="red-line"
                style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '10%',
                    bottom: '10%',
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
                    width: CASE_CONFIG.TOTAL_ITEMS * (CASE_CONFIG.ITEM_WIDTH + CASE_CONFIG.ITEM_MARGIN * 2),
                    height: CASE_CONFIG.ITEM_WIDTH,
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
        return Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, (_, index) => (
          <div
            key={index}
            id={`item-${index}`}
            style={{
              width: CASE_CONFIG.ITEM_WIDTH,
              height: CASE_CONFIG.ITEM_WIDTH,
              backgroundImage: `url(${
                index === CASE_CONFIG.REWARD_INDEX 
                  ? winningItem.Path 
                  : pathsToUse[index] || ''
              })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '2px solid #ccc',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              margin: `0 ${CASE_CONFIG.ITEM_MARGIN}px`,
              boxSizing: 'border-box',
            }}
          />
        ));
      }, [
        CASE_CONFIG.TOTAL_ITEMS,
        CASE_CONFIG.ITEM_WIDTH,
        CASE_CONFIG.REWARD_INDEX,
        CASE_CONFIG.ITEM_MARGIN
      ]);

      return (
        <div
            id="page-container"
            style={{ 
                position: 'relative',
                padding: '2rem',
                fontFamily: "'Inter', sans-serif",
                background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4a5568',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    ':hover': {
                        background: '#2d3748',
                        transform: 'translateY(-1px)'
                    }
                }}
            >
                ← Back to Cases
            </button>
            
            <div 
                id="main-container"
                style={{
                    border: '3px solid #e2e8f0',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    padding: '24px',
                    width: '90vw',
                    maxWidth: '1200px',
                    minHeight: '400px',
                    minWidth: CASE_CONFIG.ITEM_WIDTH * (CASE_CONFIG.VISIBLE_ITEMS - 1),
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(12px)',
                    marginTop: '3rem',
                    position: 'relative',
                    overflow: 'hidden',
                    ':before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(45deg, #f8fafc 0%, #f1f5f9 100%)',
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
            
            <div style={{ 
                position: 'relative',
                width: '100%',
                maxWidth: '1200px',
                textAlign: 'center',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #e2e8f0',
                margin: '1rem 0',
                zIndex: 3
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
                        fontSize: '1.8rem',
                        color: '#2d3748',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}
                >
                    <span style={{ color: '#48bb78', fontSize: '2rem' }}>🎉</span>
                    {state.description.text}
                </motion.h2>
            </div>
    
            <button 
                type="button" 
                onClick={openCase} 
                disabled={state.isOpening || coins < caseData.price} 
                style={{ 
                    margin: '2rem 0',
                    padding: '1.5rem 3rem',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    background: state.isOpening ? '#cbd5e0' : '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: state.isOpening 
                        ? 'none' 
                        : '0 4px 6px -1px rgba(66, 153, 225, 0.3), 0 2px 4px -1px rgba(66, 153, 225, 0.2)',
                    ':hover:not(:disabled)': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 15px -3px rgba(66, 153, 225, 0.3), 0 4px 6px -2px rgba(66, 153, 225, 0.2)'
                    },
                    ':active:not(:disabled)': {
                        transform: 'translateY(0)'
                    }
                }}
            >
                {state.isOpening ? (
                    <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ animation: 'spin 1s linear infinite' }}>🌀</span>
                        Spinning...
                    </span>
                ) : (
                    `SPIN (${caseData.price}🪙)`
                )}
            </button>
        </div>
    );
}