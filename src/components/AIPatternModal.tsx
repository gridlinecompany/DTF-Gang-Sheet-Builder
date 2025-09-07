
import React, { useState } from 'react';
import Icon from './Icon';
import { generateSeamlessPattern, PatternGenerationParams } from '../services/geminiService';

interface AIPatternModalProps {
    onClose: () => void;
    onSubmit: (params: { imageSrc: string; tileSize: number; spacing: number; rotationJitter: number; }) => void;
    initialGutter: number;
}

const AIPatternModal: React.FC<AIPatternModalProps> = ({ onClose, onSubmit, initialGutter }) => {
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('default');
    const [colors, setColors] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    
    const [tileSize, setTileSize] = useState(3);
    const [spacing, setSpacing] = useState(initialGutter);
    const [rotationJitter, setRotationJitter] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageSrc, setGeneratedImageSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description for your pattern.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        setGeneratedImageSrc(null);
        try {
            const params: PatternGenerationParams = {
                prompt,
                style,
                colors,
                negativePrompt
            };
            const imageSrc = await generateSeamlessPattern(params);
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="ai-pattern-modal-title">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <header className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="ai-pattern-modal-title" className="text-xl font-bold">AI Pattern Generator</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-2xl leading-none" aria-label="Close modal">&times;</button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Panel: Controls */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="prompt" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">1. Describe your pattern</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., cute cartoon cats, psychedelic mushrooms, vintage floral..."
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                                aria-required="true"
                            />
                        </div>

                        <div>
                            <label htmlFor="style" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">2. Choose an Art Style</label>
                            <select
                                id="style"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="default">Default</option>
                                <option value="photorealistic">Photorealistic</option>
                                <option value="watercolor">Watercolor</option>
                                <option value="cartoon">Cartoon</option>
                                <option value="line-art">Line Art</option>
                                <option value="vector">Flat / Vector</option>
                                <option value="pixel-art">Pixel Art</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="colors" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">3. Dominant Colors <span className="text-gray-400 font-normal">(optional)</span></label>
                            <input
                                id="colors"
                                type="text"
                                value={colors}
                                onChange={(e) => setColors(e.target.value)}
                                placeholder="e.g., navy blue, cream, gold"
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="negativePrompt" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">4. Things to avoid <span className="text-gray-400 font-normal">(optional)</span></label>
                            <textarea
                                id="negativePrompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="e.g., text, watermarks, blurry"
                                className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                            />
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-4 mt-auto">
                             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tiling Options</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tile-size" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tile Size (in)</label>
                                    <input id="tile-size" type="number" value={tileSize} min="0.5" step="0.1" onChange={e => setTileSize(parseFloat(e.target.value) || 1)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                                <div>
                                    <label htmlFor="spacing" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Spacing (in)</label>
                                    <input id="spacing" type="number" value={spacing} min="0" step="0.05" onChange={e => setSpacing(parseFloat(e.target.value) || 0)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="rotation" className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Rotation Jitter ({rotationJitter}°)</label>
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
                        </div>
                    </div>

                    {/* Right Panel: Preview & Generate Button */}
                    <div className="flex flex-col">
                         <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 block">5. Generate & Preview</label>
                         <div className="aspect-square w-full bg-gray-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700" aria-live="polite">
                            {isGenerating && (
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <div className="w-8 h-8 border-2 border-t-indigo-500 border-gray-200 dark:border-slate-600 rounded-full animate-spin"></div>
                                    <span>Generating...</span>
                                </div>
                            )}
                            {error && <p className="text-red-500 text-center p-4">{error}</p>}
                            {!isGenerating && !generatedImageSrc && !error && <p className="text-gray-400">Preview will appear here</p>}
                            {generatedImageSrc && (
                                <img src={generatedImageSrc} alt="Generated pattern tile" className="w-full h-full object-cover"/>
                            )}
                         </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-wait mt-4"
                        >
                            <Icon name="wand" className="w-5 h-5" />
                            {isGenerating ? 'Generating...' : 'Generate Pattern'}
                        </button>
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
