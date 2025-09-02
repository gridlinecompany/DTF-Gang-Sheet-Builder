import React from 'react';

interface LoadingModalProps {
  message: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-12 h-12 border-4 border-t-indigo-600 border-gray-200 dark:border-slate-600 rounded-full animate-spin"></div>
        <p className="text-gray-700 dark:text-gray-200 font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingModal;
