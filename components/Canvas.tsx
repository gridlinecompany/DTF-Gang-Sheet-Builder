import React, { forwardRef } from 'react';
import { SheetImage, SheetSize } from '../types';
import { PIXELS_PER_INCH_DISPLAY } from '../constants';
import ImageElement from './ImageElement';

interface CanvasProps {
  sheetSize: SheetSize;
  images: SheetImage[];
  selectedImageIds: string[];
  isDarkMode: boolean;
  padding: number;
  onSelectImage: (id: string, e: React.MouseEvent) => void;
  onUpdateImage: (id:string, props: Partial<SheetImage>) => void;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
    ({ sheetSize, images, selectedImageIds, onSelectImage, onUpdateImage, isDarkMode, padding }, ref) => {
    const canvasStyle = {
      width: `${sheetSize.width * PIXELS_PER_INCH_DISPLAY}px`,
      height: `${sheetSize.height * PIXELS_PER_INCH_DISPLAY}px`,
    };
    
    const lightCheckers = `linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)`;
    const darkCheckers = `linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)`;


    return (
      <div 
        ref={ref} 
        className="bg-white dark:bg-slate-700 shadow-lg relative overflow-hidden" 
        style={canvasStyle}
      >
        <div 
          className="absolute inset-0 bg-repeat" 
          style={{
            backgroundImage: isDarkMode ? darkCheckers : lightCheckers,
            backgroundSize: `20px 20px`,
            backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
          }}
        ></div>

        <div className="absolute inset-0 pointer-events-none" style={{
            border: `${padding * PIXELS_PER_INCH_DISPLAY}px solid transparent`,
        }}>
            <div className="w-full h-full border border-dashed border-red-500 opacity-70"></div>
        </div>

        <div className="absolute inset-0">
         {images.map((image) => (
            <ImageElement
                key={image.id}
                image={image}
                isSelected={selectedImageIds.includes(image.id)}
                onSelect={onSelectImage}
                onUpdate={onUpdateImage}
            />
         ))}
        </div>
      </div>
    );
});

Canvas.displayName = "Canvas";

export default Canvas;
