import React from 'react';
import Icon from './Icon';

interface HeaderProps {
  onExport: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport, isDarkMode, onToggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex justify-between items-center shadow-sm z-20">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Icon name="logo" className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">DTF Gang Sheet Builder</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800"
          aria-label="Toggle dark mode"
        >
          <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-6 h-6"/>
        </button>
        <button
          onClick={onExport}
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-slate-800"
        >
          <Icon name="download" className="w-5 h-5" />
          Export Sheet
        </button>
      </div>
    </header>
  );
};

export default Header;
