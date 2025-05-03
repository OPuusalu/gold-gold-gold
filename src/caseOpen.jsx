import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fetchRandomItem } from "./api/caseApi";
import { CASE_CONFIG } from "./models/caseConfiguration"

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function CaseOpen({ coins, setCoins, onBack, caseData }) {
    const [renderedItems, setRenderedItems] = useState([]); // State for rendered items
    const [xPosition, setXPosition] = useState(0);
    const [isCaseOpened, setIsCaseOpened] = useState(false); // New state to track if the case has been opened
    const [itemDescription, setItemDescription] = useState(''); // New state for item description
    const [showDescription, setShowDescription] = useState(false); // State to control description visibility
    const [isOpening, setIsOpening] = useState(false); // New state for opening status
    const [paths, setPaths] = useState([]);
    const [nextPaths, setNextPaths] = useState([]); // New state for next spin's paths
    const animationKey = useRef(0);

    // Generate initial paths when component mounts
    useEffect(() => {
        const generateInitialPaths = async () => {
            const initialPaths = await Promise.all(
                Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, async (_, index) => {
                    const randomItemData = await fetchRandomItem(caseData.items);
                    return randomItemData ? randomItemData.Path : '';
                })
            );
            setPaths(initialPaths);
            
            // Also generate paths for the next spin
            const nextSpinPaths = await Promise.all(
                Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, async (_, index) => {
                    const randomItemData = await fetchRandomItem(caseData.items);
                    return randomItemData ? randomItemData.Path : '';
                })
            );
            setNextPaths(nextSpinPaths);
        };
        
        generateInitialPaths();
    }, [caseData]); // Regenerate when caseData changes

    const openCase = async () => {
        if (coins < caseData.price) return;

        animationKey.current += 1;
        setXPosition(0);
        
        resetView();
        setIsOpening(true);
        setCoins(c => c - caseData.price);
        
        const currentPaths = [...paths];
        const winningItem = await fetchRandomItem(caseData.items);
        const newItems = generateItems(winningItem, currentPaths); // Generate new items with current paths
        setRenderedItems(newItems); // Set the rendered items state after getting the item
        
        const randomEndXpos = randomInRange(CASE_CONFIG.REWARD_INDEX * CASE_CONFIG.ITEM_WIDTH - 120, CASE_CONFIG.REWARD_INDEX * CASE_CONFIG.ITEM_WIDTH - 20);
        setXPosition(-randomEndXpos);
        setIsCaseOpened(true); // Update state to indicate the case has been opened

        // Generate paths for next spin while current spin is happening
        const newNextPaths = await Promise.all(
            Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, async (_, index) => {
                const randomItemData = await fetchRandomItem(caseData.items);
                return randomItemData ? randomItemData.Path : '';
            })
        );
        setNextPaths(newNextPaths);

        // Set item description after 3 seconds
        setTimeout(() => {
            const description = `You won ${winningItem.Name} ( ${winningItem.Value > 0 ? `+${winningItem.Value}🪙` : ''} )`;
            setItemDescription(description);
            setShowDescription(true);
            setIsOpening(false);
            if(winningItem.Value > 0) {
                setCoins(c => c + winningItem.Value);
            }
            
            // Update paths for next spin
            setPaths([...nextPaths]);
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
                animate={{ x: xPosition }}
                transition={{ 
                    duration: CASE_CONFIG.ANIMATION_DURATION,
                    ease: 'easeOut'
                 }}
            >
                {renderedItems}
            </motion.div>
        </div>
    );

    const generateItems = (winningItem, pathsToUse) => {
        const newItems = Array.from({ length: CASE_CONFIG.TOTAL_ITEMS }, (_, index) => (
            <div
                key={index}
                id={`item-${index}`}
                style={{
                width: CASE_CONFIG.ITEM_WIDTH,
                height: CASE_CONFIG.ITEM_WIDTH,
                backgroundImage:
                    index === CASE_CONFIG.REWARD_INDEX
                    ? `url(${winningItem.Path})`
                    : `url(${pathsToUse[index] || ''})`, // Use the provided paths
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
        return newItems; // Return the array of animated JSX elements
    };

    const resetView = () => {
        setShowDescription(false);
    };

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
                {!isCaseOpened ? (
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
                    animate={{ opacity: showDescription ? 1 : 0 }} 
                    transition={{ duration: showDescription ? 0.1 : 0 }}
                    style={{ margin: 0 }}
                >
                    {itemDescription}
                </motion.h2>
            </div>

            <button 
                type="button" 
                onClick={openCase} 
                disabled={isOpening || coins < caseData.price} 
                style={{ marginTop: '10px', position: 'relative' }}
            >
                SPIN ({caseData.price}🪙)
            </button>
        </div>
    );
}