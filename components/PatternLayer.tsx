
import React from 'react';
import { SheetSize, Pattern } from '../types';
import { PIXELS_PER_INCH_DISPLAY } from '../constants';

interface PatternLayerProps {
    sheetSize: SheetSize;
    padding: number;
    pattern: Pattern;
}

// A simple pseudo-random number generator for consistent jitter
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const PatternLayer: React.FC<PatternLayerProps> = ({ sheetSize, padding, pattern }) => {
    const { imageSrc, tileSize, spacing, rotationJitter } = pattern;
    const tiles: React.ReactNode[] = [];

    const sheetWidthPx = sheetSize.width * PIXELS_PER_INCH_DISPLAY;
    const sheetHeightPx = sheetSize.height * PIXELS_PER_INCH_DISPLAY;
    const tileSizePx = tileSize * PIXELS_PER_INCH_DISPLAY;
    const spacingPx = spacing * PIXELS_PER_INCH_DISPLAY;
    const paddingPx = padding * PIXELS_PER_INCH_DISPLAY;

    const effectiveWidth = sheetWidthPx - 2 * paddingPx;
    const effectiveHeight = sheetHeightPx - 2 * paddingPx;
    
    if (tileSizePx <= 0) return null; // Avoid infinite loops

    let y = paddingPx;
    while (y < paddingPx + effectiveHeight) {
        let x = paddingPx;
        while (x < paddingPx + effectiveWidth) {
            // Check if the tile starts within bounds
            if (x < sheetWidthPx - paddingPx && y < sheetHeightPx - paddingPx) {
                const seed = x * sheetWidthPx + y; // Create a unique seed for each tile position
                const randomVal = seededRandom(seed);
                const rotation = (randomVal - 0.5) * 2 * rotationJitter; // a value between -jitter and +jitter
                
                tiles.push(
                    <div
                        key={`${x}-${y}`}
                        style={{
                            position: 'absolute',
                            left: `${x}px`,
                            top: `${y}px`,
                            width: `${tileSizePx}px`,
                            height: `${tileSizePx}px`,
                            transform: `rotate(${rotation}deg)`,
                            backgroundImage: `url(${imageSrc})`,
                            backgroundSize: 'cover',
                            zIndex: 0, // Ensure it's behind everything
                        }}
                    />
                );
            }
            x += tileSizePx + spacingPx;
        }
        y += tileSizePx + spacingPx;
    }

    return <>{tiles}</>;
};

export default PatternLayer;
