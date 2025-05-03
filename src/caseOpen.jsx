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
        
        const randomEndXpos = randomInRange(
            CASE_CONFIG.REWARD_INDEX * CASE_CONFIG.ITEM_WIDTH - 120,
            CASE_CONFIG.REWARD_INDEX * CASE_CONFIG.ITEM_WIDTH - 20
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
                backgroundColor: '#f0f0f0',
                borderRadius: '10px',
                position: 'relative',
                padding: '10px',
                boxSizing: 'border-box',
            }}
        >
            <div 
                id="red-line"
                style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'red',
                    zIndex: 2,
                }}
            />
            <motion.div
                style={{
                    display: 'flex',
                    width: CASE_CONFIG.TOTAL_ITEMS * (CASE_CONFIG.ITEM_WIDTH + CASE_CONFIG.ITEM_MARGIN * 2),
                    height: CASE_CONFIG.ITEM_WIDTH,
                    position: 'relative',
                    zIndex: 1,
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
            style={{ position: 'relative' }}
        >
            <button
                onClick={onBack}
                style={{
                    margin: '10px'
                }}
            >
                ← Back to Cases
            </button>
            
            <div 
                id="main-container"
                style={{
                    border: '2px solid #ccc',
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    padding: '10px',
                    height: CASE_CONFIG.ITEM_WIDTH + 20,
                    boxSizing: 'content-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {!state.isCaseOpened ? (
                    <img 
                        src={caseData.image} 
                        alt={caseData.name} 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain',
                            display: 'block'
                        }} 
                    />
                ) : (
                    renderAnimation()
                )}
            </div>
            
            <div style={{ 
                position: 'absolute',
                top: -40, // Position above the button
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                width: '100%',
                textAlign: 'center'
            }}>
                <motion.h2 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: state.description.visible ? 1 : 0 }} 
                    transition={{ duration: state.description.visible ? 0.1 : 0 }}
                    style={{ margin: 0 }}
                >
                    {state.description.text}
                </motion.h2>
            </div>

            <button 
                type="button" 
                onClick={openCase} 
                disabled={state.isOpening || coins < caseData.price} 
                style={{ marginTop: '10px', position: 'relative' }}
            >
                SPIN ({caseData.price}🪙)
            </button>
        </div>
    );
}