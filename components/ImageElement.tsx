import React, { useRef, useCallback, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { SheetImage } from '../types';
import { PIXELS_PER_INCH_DISPLAY } from '../constants';
import Icon from './Icon';

interface ImageElementProps {
  image: SheetImage;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onUpdate: (id: string, props: Partial<SheetImage>) => void;
}

const ImageElement: React.FC<ImageElementProps> = ({ image, isSelected, onSelect, onUpdate }) => {
  // Fix: The ref for the Rnd component should be of type Rnd, not HTMLDivElement.
  const nodeRef = useRef<Rnd>(null);

  // --- Rotation Handlers ---
  const handleRotate = useCallback((e: MouseEvent) => {
    e.preventDefault();
    // Fix: Access the DOM element through the Rnd component instance ref.
    if (!nodeRef.current?.resizableElement.current) return;
    
    // Use the Rnd component's bounding box for calculating the center
    const rect = nodeRef.current.resizableElement.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    onUpdate(image.id, { rotation: angle + 90 }); // +90 to align handle correctly
  }, [image.id, onUpdate]);

  const handleStopRotate = useCallback(() => {
    window.removeEventListener('mousemove', handleRotate);
    window.removeEventListener('mouseup', handleStopRotate);
  }, [handleRotate]);

  const handleStartRotate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.addEventListener('mousemove', handleRotate);
    window.addEventListener('mouseup', handleStopRotate);
  }, [handleRotate, handleStopRotate]);

  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleRotate);
        window.removeEventListener('mouseup', handleStopRotate);
    }
  }, [handleRotate, handleStopRotate]);

  // --- AABB (Axis-Aligned Bounding Box) Calculation ---
  const originalWidthPx = image.width * PIXELS_PER_INCH_DISPLAY;
  const originalHeightPx = image.height * PIXELS_PER_INCH_DISPLAY;

  const angleRad = (image.rotation % 360) * (Math.PI / 180);
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  const aabbWidth = Math.abs(originalWidthPx * cosAngle) + Math.abs(originalHeightPx * sinAngle);
  const aabbHeight = Math.abs(originalWidthPx * sinAngle) + Math.abs(originalHeightPx * cosAngle);

  // --- Interaction Handlers that respect AABB ---
  const handleDragStop = (_e: any, d: { x: number; y: number; }) => {
    onUpdate(image.id, { x: d.x, y: d.y });
  };

  const handleResizeStop = (
      _e: any, 
      _direction: any, 
      ref: HTMLElement, 
      _delta: any, 
      position: { x: number, y: number }
  ) => {
      const newAabbWidth = ref.offsetWidth;
      const aspectRatio = originalHeightPx > 0 ? originalHeightPx / originalWidthPx : 0;

      // Back-calculate the new intrinsic width from the new AABB width
      const denominator = Math.abs(cosAngle) + aspectRatio * Math.abs(sinAngle);
      const newOriginalWidthPx = denominator > 0 ? newAabbWidth / denominator : 0;
      const newOriginalHeightPx = newOriginalWidthPx * aspectRatio;
      
      onUpdate(image.id, {
          width: newOriginalWidthPx / PIXELS_PER_INCH_DISPLAY,
          height: newOriginalHeightPx / PIXELS_PER_INCH_DISPLAY,
          x: position.x,
          y: position.y,
      });
  };

  const handleInteractionStart = (e: React.MouseEvent) => {
    onSelect(image.id, e);
  };

  return (
    <Rnd
      ref={nodeRef}
      style={{
        border: isSelected ? '2px solid #4f46e5' : 'none',
        zIndex: image.zIndex,
      }}
      size={{ width: aabbWidth, height: aabbHeight }}
      position={{ x: image.x, y: image.y }}
      onDragStart={(e) => handleInteractionStart(e as unknown as React.MouseEvent)}
      onDragStop={handleDragStop}
      onResizeStart={(e) => handleInteractionStart(e as unknown as React.MouseEvent)}
      onResizeStop={handleResizeStop}
      lockAspectRatio
      bounds="parent"
    >
      <div
        onClick={(e) => { e.stopPropagation(); handleInteractionStart(e); }}
        className="w-full h-full relative"
      >
        <div
          className="absolute"
          style={{
            width: `${originalWidthPx}px`,
            height: `${originalHeightPx}px`,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
          }}
        >
          <img src={image.src} className="w-full h-full" alt="Uploaded design" draggable="false" />
        </div>
        {isSelected && (
          <>
            <div 
              onMouseDown={handleStartRotate}
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-600 rounded-full cursor-alias flex items-center justify-center text-white"
            >
              <Icon name="rotate" className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-slate-900 text-white dark:text-gray-200 text-xs px-2 py-1 rounded">
                {`${image.width.toFixed(2)}" x ${image.height.toFixed(2)}"`}
            </div>
          </>
        )}
      </div>
    </Rnd>
  );
};

export default ImageElement;