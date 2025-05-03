import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CaseItem } from "./models/CaseItem";

const PORT = import.meta.env.VITE_API_PORT; // for Vite

const itemWidth = 100; // px
const itemMargin = 5; // px
const visibleItems = 7; // number of items visible in container
const totalItems = 30;
const rewardItemIndex = totalItems - 1 - Math.ceil(visibleItems/2);
const containerWidth = (itemWidth + 10) * visibleItems; // Adjusted for spacing

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function CaseOpen({ coins, setCoins, onBack, caseData }) {
    const [renderedItems, setRenderedItems] = useState([]); // State for rendered items
    const [animationElement, setAnimationElement] = useState(null);
    const [xPosition, setXPosition] = useState(0);
    const [isCaseOpened, setIsCaseOpened] = useState(false); // New state to track if the case has been opened
    const [itemDescription, setItemDescription] = useState(''); // New state for item description
    const [showDescription, setShowDescription] = useState(false); // State to control description visibility
    const [isOpening, setIsOpening] = useState(false); // New state for opening status
    const [paths, setPaths] = useState([]);

    const openCase = async () => {
        if (coins < caseData.price) return;
        setCoins(c => c - caseData.price);

        const itemPaths = await Promise.all(
            Array.from({ length: totalItems }, async (_, index) => {
              const randomItemData = await randomItem();
              return randomItemData ? randomItemData.Path : '';
            })
          );
      
        setPaths(itemPaths);
        setIsOpening(true);
        resetView();
        
        const winningItem = await randomItem(); // Wait for randomItem to resolve
        const newItems = generateItems(winningItem); // Generate new items
        setRenderedItems(newItems); // Set the rendered items state after getting the item
        
        const randomEndXpos = randomInRange(rewardItemIndex * itemWidth - 120, rewardItemIndex * itemWidth - 20);
        setXPosition(-randomEndXpos);
        setIsCaseOpened(true); // Update state to indicate the case has been opened

        // Set item description after 3 seconds
        setTimeout(() => {
            const description = `You won ${winningItem.Name} ( ${winningItem.Value > 0 ? `+${winningItem.Value}🪙` : ''} )`;
            setItemDescription(description);
            setShowDescription(true);
            setIsOpening(false);
            if(winningItem.Value > 0) {
              setCoins(c => c + winningItem.Value);
            }
        }, 3000);
    };

    useEffect(() => {
        if (renderedItems.length > 0) {
            generateAnimation();
        }
    }, [renderedItems]); // Re-run animation generation when renderedItems change

    const generateAnimation = () => {
        const animation = (
            <div 
                id="items-container" 
                style={{
                    display: 'flex',
                    overflow: 'hidden',
                    width: containerWidth,
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
                            width: totalItems * (itemWidth + itemMargin * 2),
                            height: itemWidth,
                            position: 'relative',
                            zIndex: 1,
                        }}
                        animate={{ x: xPosition }} // Use xPosition for animation
                        transition={{ duration: 3 }} // Animation duration
                    >
                        {renderedItems} {/* Render the items from the state */}
                    </motion.div>
                </div>
            );
            setAnimationElement(animation);
        };

    const generateItems = (winningItem) => {
        const newItems = Array.from({ length: totalItems }, (_, index) => (
            <div
                key={index}
                id={`item-${index}`}
                style={{
                width: itemWidth,
                height: itemWidth,
                backgroundImage:
                    index === rewardItemIndex
                    ? `url(${winningItem.Path})`
                    : `url(${paths[index] || ''})`, // Use the paths stored in the state
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid #ccc',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: `0 ${itemMargin}px`,
                boxSizing: 'border-box',
                }}
            />
        ));        
        return newItems; // Return the array of animated JSX elements
    };

    const randomItem = async () => {
        const response = await fetch('http://localhost:4445/api/random-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: caseData.items }),
        });
    
        if (!response.ok) {
            console.error('Failed to fetch random item:', await response.text());
            return null;
        }
    
        const data = await response.json();
        const caseItem = new CaseItem(data.Name, data.Path, data.Value, data.Rarity);

        return caseItem;
    };    

    const resetView = () => {
        setShowDescription(false);
        setRenderedItems([]); // Clear rendered items to show an empty screen
        setAnimationElement(null);
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
                    height: itemWidth + 20,
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
                    animationElement
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