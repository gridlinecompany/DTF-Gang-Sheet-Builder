
import React, { useState } from 'react';
import Icon from './Icon';
import { generateSeamlessPattern } from '../services/geminiService';

interface AIPatternModalProps {
    onClose: () => void;
    onSubmit: (params: { imageSrc: string; tileSize: number; spacing: number; rotationJitter: number; }) => void;
    initialGutter: number;
}

const AIPatternModal: React.FC<AIPatternModalProps> = ({ onClose, onSubmit, initialGutter }) => {
    const [prompt, setPrompt] = useState('');
    const [tileSize, setTileSize] = useState(3);
    const [spacing, setSpacing] = useState(initialGutter);
    const [rotationJitter, setRotationJitter] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt to generate a pattern.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        setGeneratedImageSrc(null);
        try {
            const imageSrc = await generateSeamlessPattern(prompt);
            setGeneratedImageSrc(imageSrc);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred during pattern generation.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = () => {
        if (!generatedImageSrc) return;
        onSubmit({
            imageSrc: generatedImageSrc,
            tileSize,
            spacing,
            rotationJitter,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <header className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">AI Pattern Generator</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-2xl leading-none" aria-label="Close modal">&times;</button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-6">
                    {/* Left Panel: Controls */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <label htmlFor="prompt" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Describe your pattern</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., cute cartoon cats, psychedelic mushrooms, vintage floral..."
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tile-size" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Tile Size (in)</label>
                                <input id="tile-size" type="number" value={tileSize} min="0.5" step="0.1" onChange={e => setTileSize(parseFloat(e.target.value) || 1)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                            <div>
                                <label htmlFor="spacing" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Spacing (in)</label>
                                <input id="spacing" type="number" value={spacing} min="0" step="0.05" onChange={e => setSpacing(parseFloat(e.target.value) || 0)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="rotation" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Rotation Jitter ({rotationJitter}°)</label>
                             <input
                                id="rotation"
                                type="range"
                                min="0"
                                max="180"
                                value={rotationJitter}
                                onChange={e => setRotationJitter(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                         <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            <Icon name="wand" className="w-5 h-5" />
                            {isGenerating ? 'Generating...' : 'Generate Pattern'}
                        </button>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="flex flex-col">
                         <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">Preview</label>
                         <div className="aspect-square w-full bg-gray-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center overflow-hidden">
                            {isGenerating && (
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <div className="w-8 h-8 border-2 border-t-indigo-500 border-gray-200 dark:border-slate-600 rounded-full animate-spin"></div>
                                    <span>Generating...</span>
                                </div>
                            )}
                            {error && <p className="text-red-500 text-center p-4">{error}</p>}
                            {generatedImageSrc && (
                                <img src={generatedImageSrc} alt="Generated pattern tile" className="w-full h-full object-cover"/>
                            )}
                         </div>
                    </div>
                </main>

                <footer className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 font-semibold">Cancel</button>
                    <button onClick={handleSubmit} disabled={!generatedImageSrc || isGenerating} className="py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                       Fill Sheet With Pattern
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AIPatternModal;
