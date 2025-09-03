import React from 'react';
import { Sheet } from '../types';
import Icon from './Icon';

interface SheetTabsProps {
    sheets: Sheet[];
    activeSheetId: string;
    onSelectSheet: (id: string) => void;
    onAddSheet: () => void;
}

const SheetTabs: React.FC<SheetTabsProps> = ({ sheets, activeSheetId, onSelectSheet, onAddSheet }) => {
    return (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 pt-2 flex items-center gap-2">
            {sheets.map((sheet) => (
                <button
                    key={sheet.id}
                    onClick={() => onSelectSheet(sheet.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none ${
                        activeSheetId === sheet.id
                            ? 'bg-gray-200 dark:bg-slate-800 border-gray-200 dark:border-slate-700 border-t border-x text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                >
                    {sheet.name}
                </button>
            ))}
            <button
                onClick={onAddSheet}
                className="p-2 ml-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none"
                aria-label="Add new sheet"
            >
                <Icon name="plus" className="w-5 h-5"/>
            </button>
        </div>
    );
};

export default SheetTabs;
