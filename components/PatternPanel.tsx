
import React from 'react';
import { Pattern } from '../types';
import Icon from './Icon';

interface PatternPanelProps {
  pattern: Pattern;
  onUpdate: (props: Partial<Pattern>) => void;
  onClear: () => void;
}

const PatternPanel: React.FC<PatternPanelProps> = ({ pattern, onUpdate, onClear }) => {
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: parseFloat(value) || 0 });
  };
  
  return (
    <aside className="w-72 bg-white dark:bg-slate-800 p-4 border-l border-gray-200 dark:border-slate-700 flex flex-col gap-6 z-10 shadow-md">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Pattern Properties</h2>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Tiling</h3>
        <div className="space-y-4">
             <div className="w-full">
                <label className="text-xs text-gray-400 dark:text-gray-500 block" htmlFor="tileSize">Tile Size (in)</label>
                <input
                    id="tileSize"
                    name="tileSize"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={pattern.tileSize.toFixed(2)}
                    onChange={handleNumericChange}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="w-full">
                <label className="text-xs text-gray-400 dark:text-gray-500 block" htmlFor="spacing">Spacing (in)</label>
                <input
                    id="spacing"
                    name="spacing"
                    type="number"
                    step="0.05"
                    min="0"
                    value={pattern.spacing.toFixed(2)}
                    onChange={handleNumericChange}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Rotation Jitter</h3>
        <div className="flex items-center gap-2">
            <input
                type="range"
                min="0"
                max="180"
                name="rotationJitter"
                value={pattern.rotationJitter}
                onChange={handleNumericChange}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-center">{Math.round(pattern.rotationJitter)}°</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
         <button
            onClick={onClear}
            className="w-full p-2 bg-red-50 dark:bg-red-900/40 rounded-md hover:bg-red-100 dark:hover:bg-red-900/60 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-300 font-medium"
        >
            <Icon name="delete" className="w-4 h-4"/>
            Clear Pattern
        </button>
      </div>
    </aside>
  );
};

export default PatternPanel;