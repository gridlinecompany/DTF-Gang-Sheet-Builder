
import React, { forwardRef } from 'react';
import { SheetImage, SheetSize, Pattern } from '../types';
import { PIXELS_PER_INCH_DISPLAY } from '../constants';
import ImageElement from './ImageElement';
import PatternLayer from './PatternLayer';

interface CanvasProps {
  sheetSize: SheetSize;
  images: SheetImage[];
  pattern: Pattern | null | undefined;
  selectedImageIds: string[];
  padding: number;
  onSelectImage: (id: string, e: React.MouseEvent) => void;
  onUpdateImage: (id:string, props: Partial<SheetImage>) => void;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
    ({ sheetSize, images, pattern, selectedImageIds, onSelectImage, onUpdateImage, padding }, ref) => {
    const canvasStyle = {
      width: `${sheetSize.width * PIXELS_PER_INCH_DISPLAY}px`,
      height: `${sheetSize.height * PIXELS_PER_INCH_DISPLAY}px`,
    };
    
    const darkCheckers = `linear-gradient(45deg, #4a5568 25%, transparent 25%), linear-gradient(-45deg, #4a5568 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #4a5568 75%), linear-gradient(-45deg, transparent 75%, #4a5568 75%)`;


    return (
      <div 
        ref={ref} 
        className="bg-slate-700 shadow-lg relative overflow-hidden" 
        style={canvasStyle}
      >
        <div 
          className="absolute inset-0 bg-repeat export-hidden" 
          style={{
            backgroundImage: darkCheckers,
            backgroundSize: `20px 20px`,
            backgroundPosition: `0 0, 0 10px, 10px -10px, -10px 0px`
          }}
        ></div>

        <div className="absolute inset-0 pointer-events-none export-hidden" style={{
            border: `${padding * PIXELS_PER_INCH_DISPLAY}px solid transparent`,
        }}>
            <div className="w-full h-full border border-dashed border-red-500 opacity-70"></div>
        </div>

        <div className="absolute inset-0">
         {pattern && <PatternLayer sheetSize={sheetSize} padding={padding} pattern={pattern} />}
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
