import React from 'react';
import Icon from './Icon';

interface ZoomControlsProps {
    zoom: number;
    onZoomChange: (newZoom: number) => void;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4.0;
const ZOOM_STEP = 0.1;

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomChange }) => {
    
    const handleZoomIn = () => {
        onZoomChange(Math.min(zoom + ZOOM_STEP, ZOOM_MAX));
    };
    
    const handleZoomOut = () => {
        onZoomChange(Math.max(zoom - ZOOM_STEP, ZOOM_MIN));
    };

    const handleZoomReset = () => {
        onZoomChange(1);
    };

    return (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 export-hidden">
            <button
                onClick={handleZoomOut}
                disabled={zoom <= ZOOM_MIN}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom out"
            >
                <Icon name="minus" className="w-5 h-5" />
            </button>
            <button
                onClick={handleZoomReset}
                className="text-sm font-semibold px-2 w-16 text-center"
                aria-label="Reset zoom"
            >
                {Math.round(zoom * 100)}%
            </button>
            <button
                onClick={handleZoomIn}
                disabled={zoom >= ZOOM_MAX}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Zoom in"
            >
                <Icon name="plus" className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ZoomControls;