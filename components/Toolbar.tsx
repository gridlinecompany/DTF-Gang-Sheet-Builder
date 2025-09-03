
import React, { useRef } from 'react';
import { SheetSize } from '../types';
import Icon from './Icon';

interface ToolbarProps {
  onAddImage: (file: File) => void;
  sheetSize: SheetSize;
  onSizeChange: (size: SheetSize) => void;
  padding: number;
  onPaddingChange: (padding: number) => void;
  gutter: number;
  onGutterChange: (gutter: number) => void;
  onAutoNest: () => void;
  onBulkUpload: () => void;
  onAIPatternFill: () => void;
  allowRotation: boolean;
  onAllowRotationChange: (allow: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    onAddImage, 
    sheetSize, 
    onSizeChange, 
    padding, 
    onPaddingChange, 
    gutter, 
    onGutterChange, 
    onAutoNest, 
    onBulkUpload,
    onAIPatternFill,
    allowRotation,
    onAllowRotationChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddImage(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    onSizeChange({
        ...sheetSize,
        [dimension]: value,
    });
  };


  return (
    <aside className="w-64 bg-white dark:bg-slate-800 p-4 border-r border-gray-200 dark:border-slate-700 flex flex-col gap-6 z-10 shadow-md">
       <div className="space-y-4">
        <div>
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Sheet Size</label>
            <div className="flex gap-2">
                 <div className="w-1/2">
                    <label htmlFor="custom-width" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Width (in)</label>
                    <input
                        id="custom-width"
                        type="number"
                        step="0.1"
                        min="1"
                        value={sheetSize.width}
                        onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="custom-height" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Height (in)</label>
                    <input
                        id="custom-height"
                        type="number"
                        step="0.1"
                        min="1"
                        value={sheetSize.height}
                        onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <div className="w-1/2">
                <label htmlFor="padding" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Padding (in)</label>
                <input
                    id="padding"
                    type="number"
                    step="0.1"
                    min="0"
                    value={padding}
                    onChange={(e) => onPaddingChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div className="w-1/2">
                <label htmlFor="gutter" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Gutter (in)</label>
                 <input
                    id="gutter"
                    type="number"
                    step="0.1"
                    min="0"
                    value={gutter}
                    onChange={(e) => onGutterChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
      </div>

      <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded-md">
            <label htmlFor="allow-rotation" className="text-sm font-semibold text-gray-500 dark:text-gray-400 cursor-pointer">
                Allow Rotation
            </label>
            <div className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    id="allow-rotation"
                    className="sr-only peer"
                    checked={allowRotation}
                    onChange={(e) => onAllowRotationChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-indigo-600"></div>
            </div>
          </div>
          <button
            onClick={onAutoNest}
            className="w-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Icon name="nest" className="w-5 h-5" />
            Auto Nest All
          </button>
          <button
            onClick={onAIPatternFill}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Icon name="wand" className="w-5 h-5" />
            AI Pattern Fill
          </button>
           <button
            onClick={onBulkUpload}
            className="w-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Icon name="upload" className="w-5 h-5" />
            Bulk Upload
          </button>
          <button
            onClick={handleUploadClick}
            className="w-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors border-2 border-dashed border-indigo-200 dark:border-indigo-700"
          >
            <Icon name="upload" className="w-5 h-5" />
            Upload Single Image
          </button>
      </div>

       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
      />
    </aside>
  );
};

export default Toolbar;
