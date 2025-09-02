import React, { useState, useCallback } from 'react';
import Icon from './Icon';
import { useDropzone } from 'react-dropzone';
import { DPI } from '../constants';

type BulkImage = {
    src: string;
    file: File;
    quantity: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
};

interface BulkUploadModalProps {
  onClose: () => void;
  onSubmit: (images: BulkImage[]) => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onSubmit }) => {
    const [images, setImages] = useState<BulkImage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setIsProcessing(true);
        const newImagesPromises = acceptedFiles.map(file => 
            new Promise<BulkImage>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve({
                            src: img.src,
                            file,
                            quantity: 1,
                            width: img.width / DPI,
                            height: img.height / DPI,
                            originalWidth: img.width,
                            originalHeight: img.height,
                        });
                    };
                    img.onerror = reject;
                    img.src = e.target?.result as string;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            })
        );

        Promise.all(newImagesPromises).then(newImages => {
            setImages(prev => [...prev, ...newImages]);
            setIsProcessing(false);
        }).catch(err => {
            console.error("Error processing files:", err);
            alert("Some images could not be loaded.");
            setIsProcessing(false);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: { 'image/*': ['.png', '.jpeg', '.jpg', '.webp'] }
    });

    const updateImage = (index: number, newProps: Partial<BulkImage>) => {
        setImages(prev => prev.map((img, i) => i === index ? { ...img, ...newProps } : img));
    };

    const handleWidthChange = (index: number, newWidth: number) => {
        const img = images[index];
        const aspectRatio = img.originalHeight / img.originalWidth;
        updateImage(index, { width: newWidth, height: newWidth * aspectRatio });
    };

    const handleHeightChange = (index: number, newHeight: number) => {
        const img = images[index];
        const aspectRatio = img.originalWidth / img.originalHeight;
        updateImage(index, { height: newHeight, width: newHeight * aspectRatio });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSubmit = () => {
        onSubmit(images);
        onClose();
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Bulk Upload & Nest</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">&times;</button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
            <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                <input {...getInputProps()} />
                <Icon name="upload" className="w-10 h-10 mx-auto text-gray-400 mb-2"/>
                <p className="text-gray-600 dark:text-gray-300">Drag & drop images here, or click to select files</p>
                {isProcessing && <p className="text-sm text-indigo-500 mt-2">Processing images...</p>}
            </div>

            <div className="space-y-3">
                {images.map((image, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-md">
                        <img src={image.src} alt={image.file.name} className="w-16 h-16 object-contain rounded-sm bg-white dark:bg-slate-600"/>
                        <div className="flex-1 text-sm text-ellipsis overflow-hidden whitespace-nowrap" title={image.file.name}>{image.file.name}</div>
                        <div className="flex items-center gap-2">
                             <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block">Qty</label>
                                <input type="number" value={image.quantity} min="1" onChange={e => updateImage(index, { quantity: parseInt(e.target.value) || 1 })} className="w-16 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block">W (in)</label>
                                <input type="number" value={image.width.toFixed(2)} step="0.1" onChange={e => handleWidthChange(index, parseFloat(e.target.value) || 0)} className="w-20 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                             <div>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block">H (in)</label>
                                <input type="number" value={image.height.toFixed(2)} step="0.1" onChange={e => handleHeightChange(index, parseFloat(e.target.value) || 0)} className="w-20 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                        </div>
                        <button onClick={() => removeImage(index)} className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                            <Icon name="delete" className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
            <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 font-semibold">Cancel</button>
            <button onClick={handleSubmit} disabled={images.length === 0} className="py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                Add {images.reduce((acc, img) => acc + img.quantity, 0)} Images & Nest
            </button>
        </footer>
      </div>
    </div>
  );
};

export default BulkUploadModal;
