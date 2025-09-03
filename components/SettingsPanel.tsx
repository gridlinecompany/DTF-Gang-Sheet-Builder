
import React, { ChangeEvent, useState, useEffect } from 'react';
import { SheetImage } from '../types';
import Icon from './Icon';

interface SettingsPanelProps {
  image: SheetImage;
  onUpdate: (props: Partial<SheetImage>) => void;
  onDelete: () => void;
  onGridFill: (id: string, rows: number, cols: number) => void;
  onRemoveBackground: (id: string) => void;
  onSmartTrim: (id: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ image, onUpdate, onDelete, onGridFill, onRemoveBackground, onSmartTrim }) => {
  const [gridRows, setGridRows] = useState(1);
  const [gridCols, setGridCols] = useState(1);

  // Reset grid inputs when selected image changes
  useEffect(() => {
    setGridRows(1);
    setGridCols(1);
  }, [image.id]);

  const handleNumericChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: parseFloat(value) || 0 });
  };
  
  return (
    <aside className="w-72 bg-white dark:bg-slate-800 p-4 border-l border-gray-200 dark:border-slate-700 flex flex-col gap-6 z-10 shadow-md">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Properties</h2>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Dimensions (inches)</h3>
        <div className="flex gap-2">
            <div className="w-1/2">
                <label className="text-xs text-gray-400 dark:text-gray-500 block" htmlFor="width">W</label>
                <input
                    id="width"
                    name="width"
                    type="number"
                    value={image.width.toFixed(2)}
                    onChange={handleNumericChange}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="w-1/2">
                <label className="text-xs text-gray-400 dark:text-gray-500 block" htmlFor="height">H</label>
                <input
                    id="height"
                    name="height"
                    type="number"
                    value={image.height.toFixed(2)}
                    onChange={handleNumericChange}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Rotation</h3>
        <div className="flex items-center gap-2">
            <input
                type="range"
                min="0"
                max="360"
                name="rotation"
                value={image.rotation}
                onChange={handleNumericChange}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-center">{Math.round(image.rotation)}°</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
        <div className="space-y-2">
           <div className="flex gap-2">
                <div className="w-1/2">
                    <label className="text-xs text-gray-400 dark:text-gray-500 block" htmlFor="rows">Rows</label>
                    <input id="rows" type="number" value={gridRows} min="1" onChange={e => setGridRows(parseInt(e.target.value) || 1)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="w-1/2">
                    <label className="text-xs text-gray-400 dark:text-gray-500 block" htmlFor="cols">Cols</label>
                    <input id="cols" type="number" value={gridCols} min="1" onChange={e => setGridCols(parseInt(e.target.value) || 1)} className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
           </div>
            <button
                onClick={() => onGridFill(image.id, gridRows, gridCols)}
                disabled={gridRows * gridCols <= 1}
                className="w-full p-2 bg-gray-100 dark:bg-slate-700 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Icon name="duplicate" className="w-4 h-4"/>
                Grid Fill
            </button>
             <button
                onClick={onDelete}
                className="w-full p-2 bg-red-50 dark:bg-red-900/40 rounded-md hover:bg-red-100 dark:hover:bg-red-900/60 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-300 font-medium"
            >
                <Icon name="delete" className="w-4 h-4"/>
                Delete
            </button>
        </div>
      </div>

       <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">AI Tools</h3>
        <div className="space-y-2">
             <button
                onClick={() => onSmartTrim(image.id)}
                className="w-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors"
            >
                <Icon name="trim" className="w-5 h-5"/>
                AI Smart Trim
            </button>
            <button
                onClick={() => onRemoveBackground(image.id)}
                className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
            >
                <Icon name="sparkles" className="w-5 h-5"/>
                Remove Background
            </button>
        </div>
      </div>

    </aside>
  );
};

export default SettingsPanel;
