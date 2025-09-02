
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { SheetImage, SheetSize, Sheet } from './types';
import { SHEET_SIZES, DPI, PIXELS_PER_INCH_DISPLAY } from './constants';
import Header from './components/Header';
import Canvas from './components/Canvas';
import SettingsPanel from './components/SettingsPanel';
import Toolbar from './components/Toolbar';
import LoadingModal from './components/LoadingModal';
import { removeBackground as removeBgService } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import SheetTabs from './components/SheetTabs';
import BulkUploadModal from './components/BulkUploadModal';

// Type for the packing algorithm's internal node structure
type PackerNode = {
  x: number;
  y: number;
  width: number;
  height: number;
  used?: boolean;
  down?: PackerNode;
  right?: PackerNode;
};


const App: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([
    { id: crypto.randomUUID(), name: 'Sheet 1', sheetSize: SHEET_SIZES[1], images: [] }
  ]);
  const [activeSheetId, setActiveSheetId] = useState<string>(sheets[0].id);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [padding, setPadding] = useState(0.5); // in inches
  const [gutter, setGutter] = useState(0.5); // in inches
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [allowRotation, setAllowRotation] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nextZIndex = useRef(1);

  const activeSheet = sheets.find(s => s.id === activeSheetId)!;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  // Ensure there's always an active sheet if the current one is deleted
  useEffect(() => {
    if (!sheets.find(s => s.id === activeSheetId) && sheets.length > 0) {
        setActiveSheetId(sheets[0].id);
    }
  }, [sheets, activeSheetId]);
  
  const handleAllowRotationChange = (checked: boolean) => {
    setAllowRotation(checked);
  };

  const updateSheet = (id: string, newProps: Partial<Sheet>) => {
     setSheets(prev => prev.map(s => s.id === id ? { ...s, ...newProps } : s));
  };

  const addImage = async (file: File) => {
    try {
      const { base64, width, height } = await fileToBase64(file);
      const isFirstImage = activeSheet.images.length === 0;
      const paddingPx = padding * PIXELS_PER_INCH_DISPLAY;

      const newImage: SheetImage = {
        id: crypto.randomUUID(),
        src: base64,
        originalMimeType: file.type,
        x: isFirstImage ? paddingPx : 50,
        y: isFirstImage ? paddingPx : 50,
        width: width / DPI,
        height: height / DPI,
        rotation: 0,
        zIndex: nextZIndex.current++,
      };
      updateSheet(activeSheetId, { images: [...activeSheet.images, newImage] });
      setSelectedImageIds([newImage.id]);
    } catch (error) {
      console.error("Error adding image:", error);
      alert("Failed to load image. Please try a different file.");
    }
  };

  const updateImage = (id: string, newProps: Partial<SheetImage>) => {
    updateSheet(activeSheetId, {
        images: activeSheet.images.map(img => (img.id === id ? { ...img, ...newProps } : img))
    });
  };

  const updateSelectedImages = (newProps: Partial<SheetImage>) => {
    updateSheet(activeSheetId, {
        images: activeSheet.images.map(img => (selectedImageIds.includes(img.id) ? { ...img, ...newProps } : img))
    });
  };
  
  const handleSelectImage = (id: string, e?: React.MouseEvent) => {
    const isCtrlOrCmd = e?.metaKey || e?.ctrlKey;
    
    setSelectedImageIds(prev => {
        if (isCtrlOrCmd) {
            if (prev.includes(id)) {
                return prev.filter(selectedId => selectedId !== id);
            } else {
                return [...prev, id];
            }
        } else {
            if (prev.includes(id) && prev.length === 1) {
                return prev;
            }
            return [id];
        }
    });

    const image = activeSheet.images.find(img => img.id === id);
    if (image && image.zIndex !== nextZIndex.current - 1) {
      updateImage(id, { zIndex: nextZIndex.current++ });
    }
  };

  const deselectImage = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedImageIds([]);
    }
  };
  
  const primarySelectedImage = activeSheet.images.find((img) => img.id === selectedImageIds[selectedImageIds.length - 1]);

  const deleteSelectedImages = () => {
    updateSheet(activeSheetId, {
        images: activeSheet.images.filter((img) => !selectedImageIds.includes(img.id))
    });
    setSelectedImageIds([]);
  };

  const handleGridFill = (id: string, rows: number, cols: number) => {
    const original = activeSheet.images.find((img) => img.id === id);
    if (!original) return;

    const newImages: SheetImage[] = [];
    const gutterPx = gutter * PIXELS_PER_INCH_DISPLAY;
    const imgWidthPx = original.width * PIXELS_PER_INCH_DISPLAY;
    const imgHeightPx = original.height * PIXELS_PER_INCH_DISPLAY;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (i === 0 && j === 0) continue; // Skip original
            
            const newImage: SheetImage = {
                ...original,
                id: crypto.randomUUID(),
                x: original.x + j * (imgWidthPx + gutterPx),
                y: original.y + i * (imgHeightPx + gutterPx),
                zIndex: nextZIndex.current++,
            };
            newImages.push(newImage);
        }
    }
    
    updateSheet(activeSheetId, { images: [...activeSheet.images, ...newImages] });
  };

  /**
   * A robust 2D bin packing algorithm using a binary tree approach.
   * This is a complete rewrite to address packing inefficiencies and rotation issues.
   */
  const packOntoSingleSheet = (imagesToPack: SheetImage[], sheetSize: SheetSize, allowRotation: boolean) => {
    const paddingPx = padding * PIXELS_PER_INCH_DISPLAY;
    const gutterPx = gutter * PIXELS_PER_INCH_DISPLAY;
    const sheetWidthPx = sheetSize.width * PIXELS_PER_INCH_DISPLAY;
    const sheetHeightPx = sheetSize.height * PIXELS_PER_INCH_DISPLAY;

    const packArea = {
        width: sheetWidthPx - 2 * paddingPx,
        height: sheetHeightPx - 2 * paddingPx,
    };
    
    // If printable area is invalid, return everything as unplaced.
    if (packArea.width <= 0 || packArea.height <= 0) {
        return { placedImages: [], unplacedImages: imagesToPack };
    }

    const root: PackerNode = { x: paddingPx, y: paddingPx, width: packArea.width, height: packArea.height };
    const placedImages: SheetImage[] = [];
    
    const findNode = (rootNode: PackerNode, w: number, h: number): PackerNode | null => {
      if (rootNode.used) {
        return findNode(rootNode.right!, w, h) || findNode(rootNode.down!, w, h);
      } else if (w <= rootNode.width && h <= rootNode.height) {
        return rootNode;
      }
      return null;
    };
    
    const splitNode = (node: PackerNode, w: number, h: number) => {
      node.used = true;
      // The area below the placed item, now partitioned to be only as wide as the item.
      node.down = {
        x: node.x,
        y: node.y + h + gutterPx,
        width: w, // Only as wide as the block just placed
        height: node.height - h - gutterPx
      };
      // The area to the right of the placed item, now partitioned to be the full height
      // of the available space, creating a more useful block for the next items.
      node.right = {
        x: node.x + w + gutterPx,
        y: node.y,
        width: node.width - w - gutterPx,
        height: node.height
      };
    };
    
    // Sort images by largest dimension first, then area. This is a robust heuristic.
    const sortedImages = [...imagesToPack].sort((a, b) => {
        const aMax = Math.max(a.width, a.height);
        const bMax = Math.max(b.width, b.height);
        if (bMax !== aMax) return bMax - aMax;
        return (b.width * b.height) - (a.width * a.height);
    });

    for (const image of sortedImages) {
        const imgWidthPx = image.width * PIXELS_PER_INCH_DISPLAY;
        const imgHeightPx = image.height * PIXELS_PER_INCH_DISPLAY;
        
        let node: PackerNode | null = null;
        let isRotated = false;

        // Try to fit original orientation
        node = findNode(root, imgWidthPx, imgHeightPx);

        // If it doesn't fit, and rotation is allowed, try rotated orientation
        if (!node && allowRotation && imgWidthPx !== imgHeightPx) {
            node = findNode(root, imgHeightPx, imgWidthPx);
            if (node) {
                isRotated = true;
            }
        }
        
        if (node) {
            const fitW = isRotated ? imgHeightPx : imgWidthPx;
            const fitH = isRotated ? imgWidthPx : imgHeightPx;
            
            splitNode(node, fitW, fitH);
            
            placedImages.push({
                ...image,
                x: node.x,
                y: node.y,
                rotation: isRotated ? 90 : 0,
            });
        }
    }

    const placedIds = new Set(placedImages.map(p => p.id));
    const unplacedImages = imagesToPack.filter(img => !placedIds.has(img.id));

    return { placedImages, unplacedImages };
  };

  const repackAllImages = (imagesToPack: SheetImage[], allowRotationFlag: boolean) => {
    setIsLoading(true);
    setLoadingMessage('Nesting images across sheets...');
    
    const newSheets: Sheet[] = [];

    // Use a deep copy for manipulation to avoid side-effects
    let imagesToProcess = JSON.parse(JSON.stringify(imagesToPack));

    while (imagesToProcess.length > 0) {
        const sheetSizeForNesting = activeSheet?.sheetSize || SHEET_SIZES[1];
        const { placedImages, unplacedImages } = packOntoSingleSheet(imagesToProcess, sheetSizeForNesting, allowRotationFlag);

        if (placedImages.length === 0 && unplacedImages.length > 0) {
            const oversizedImageNames = unplacedImages.map(img => img.src.substring(0, 30) + '...').join('\n');
            alert(`Could not place some images as they are too large for the sheet:\n${oversizedImageNames}`);
            newSheets.push({
              id: crypto.randomUUID(),
              name: `Sheet ${newSheets.length + 1} (Unplaced)`,
              sheetSize: sheetSizeForNesting,
              images: unplacedImages,
            });
            break; // Avoid infinite loop
        }
        
        if (placedImages.length > 0) {
            newSheets.push({
                id: crypto.randomUUID(),
                name: `Sheet ${newSheets.length + 1}`,
                sheetSize: sheetSizeForNesting,
                images: placedImages,
            });
        }

        imagesToProcess = unplacedImages;
    }

    if (newSheets.length === 0) {
        // Handle case where no images were provided or could be placed
        const currentSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];
        const newSheet = { id: crypto.randomUUID(), name: 'Sheet 1', sheetSize: currentSheet?.sheetSize || SHEET_SIZES[1], images: [] };
        setSheets([newSheet]);
        setActiveSheetId(newSheet.id);
    } else {
        setSheets(newSheets);
        setActiveSheetId(newSheets[0].id);
    }
    
    setSelectedImageIds([]);
    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleAutoNest = () => {
    const allImages = sheets.flatMap(s => s.images);
    if (allImages.length === 0) return;
    repackAllImages(allImages, allowRotation);
  };
  
  const handleBulkUpload = (bulkImages: {src: string; file: File; quantity: number; width: number; height: number; originalWidth: number; originalHeight: number;}[]) => {
    const newImagesToAdd: SheetImage[] = bulkImages.flatMap(img => 
        Array(img.quantity).fill(null).map(() => ({
            id: crypto.randomUUID(),
            src: img.src,
            originalMimeType: img.file.type,
            x: 0, y: 0,
            width: img.width,
            height: img.height,
            rotation: 0,
            zIndex: nextZIndex.current++,
        }))
    );
    repackAllImages(newImagesToAdd, allowRotation);
  };
  
  const removeBackground = async (id: string) => {
    const image = activeSheet.images.find((img) => img.id === id);
    if (!image) return;

    setIsLoading(true);
    setLoadingMessage('AI is removing the background...');
    try {
      const newSrc = await removeBgService(image.src, image.originalMimeType);
      updateImage(id, { src: newSrc });
    } catch (error) {
      console.error("Background removal failed:", error);
      alert("Sorry, the background removal failed. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleExport = useCallback(() => {
    if (!canvasRef.current || !activeSheet) return;

    setIsLoading(true);
    setLoadingMessage('Generating your high-resolution gang sheet...');

    const currentSelected = [...selectedImageIds];
    setSelectedImageIds([]); // Deselect images to hide selection borders during export

    const filter = (node: HTMLElement) => {
      return !node.classList?.contains('export-hidden');
    };

    // Give UI time to update (e.g., hide selection borders)
    setTimeout(() => {
      const canvasElement = canvasRef.current;
      const currentSheet = activeSheet;

      if (!canvasElement || !currentSheet) {
        setIsLoading(false);
        setLoadingMessage('');
        setSelectedImageIds(currentSelected);
        return;
      }
      
      const exportWidth = currentSheet.sheetSize.width * DPI;
      const exportHeight = currentSheet.sheetSize.height * DPI;
      const MAX_DIMENSION = 32767; // Common browser canvas dimension limit
      if (exportWidth > MAX_DIMENSION || exportHeight > MAX_DIMENSION) {
           alert(`Warning: The requested export size (${exportWidth}x${exportHeight}px) is very large and may exceed browser limits. This can cause the export to fail or appear cropped. If you encounter issues, please try a smaller sheet size.`);
      }

      const scale = DPI / PIXELS_PER_INCH_DISPLAY;

      toPng(canvasElement, {
        cacheBust: true,
        filter: filter,
        backgroundColor: 'transparent',
        pixelRatio: scale,
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `gang-sheet-${currentSheet.sheetSize.width}x${currentSheet.sheetSize.height}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Oops, something went wrong!', err);
          alert("Failed to export the image. The sheet dimensions might be too large for your browser to handle. Please try exporting a smaller sheet.");
        })
        .finally(() => {
          setIsLoading(false);
          setLoadingMessage('');
          setSelectedImageIds(currentSelected);
        });
    }, 100);
  }, [canvasRef, activeSheet, selectedImageIds]);

    const handleExportAll = async () => {
        if (!canvasRef.current || sheets.length === 0) return;

        setIsLoading(true);
        setLoadingMessage('Starting batch export...');
        
        const originalActiveSheetId = activeSheetId;
        const currentSelected = [...selectedImageIds];
        setSelectedImageIds([]); // Deselect for export

        try {
            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 100));

            for (const sheet of sheets) {
                const canvasElement = canvasRef.current;
                if (!canvasElement) {
                    throw new Error("Canvas reference lost during export.");
                }

                setLoadingMessage(`Exporting ${sheet.name}...`);
                setActiveSheetId(sheet.id);

                // Wait for React to re-render the canvas with the new sheet's data
                await new Promise(resolve => setTimeout(resolve, 200));

                const scale = DPI / PIXELS_PER_INCH_DISPLAY;
                
                try {
                    const dataUrl = await toPng(canvasElement, {
                        cacheBust: true,
                        filter: (node: HTMLElement) => !node.classList?.contains('export-hidden'),
                        backgroundColor: 'transparent',
                        pixelRatio: scale,
                    });

                    const link = document.createElement('a');
                    link.download = `gang-sheet-${sheet.name.replace(/\s+/g, '_')}-${sheet.sheetSize.width}x${sheet.sheetSize.height}.png`;
                    link.href = dataUrl;
                    link.click();
                    // Small delay between downloads to prevent browser from blocking them
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (err) {
                    console.error(`Failed to export sheet: ${sheet.name}`, err);
                    alert(`Failed to export sheet "${sheet.name}". The sheet dimensions might be too large for your browser. Continuing to next sheet.`);
                }
            }
        } catch(e) {
            console.error("An unexpected error occurred during batch export:", e);
            alert("An unexpected error occurred during the export process.");
        } finally {
            // Restore original state
            setLoadingMessage('Finishing up...');
            setActiveSheetId(originalActiveSheetId);
            setSelectedImageIds(currentSelected);
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

  const addSheet = () => {
    const newSheet: Sheet = {
        id: crypto.randomUUID(),
        name: `Sheet ${sheets.length + 1}`,
        sheetSize: activeSheet?.sheetSize || SHEET_SIZES[1],
        images: [],
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id);
  }

  if (!activeSheet && sheets.length > 0) {
     setActiveSheetId(sheets[0].id);
     return <LoadingModal message="Initializing..." />;
  }

  if (!activeSheet) {
    const newSheet = { id: crypto.randomUUID(), name: 'Sheet 1', sheetSize: SHEET_SIZES[1], images: [] };
    setSheets([newSheet]);
    setActiveSheetId(newSheet.id);
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <LoadingModal message="Initializing..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans text-gray-900 dark:text-gray-100">
      <Header 
        onExport={handleExport} 
        onExportAll={handleExportAll}
        sheetCount={sheets.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar 
            onAddImage={addImage} 
            sheetSize={activeSheet.sheetSize} 
            onSizeChange={(newSize) => updateSheet(activeSheetId, { sheetSize: newSize })}
            padding={padding}
            onPaddingChange={setPadding}
            gutter={gutter}
            onGutterChange={setGutter}
            onAutoNest={handleAutoNest}
            onBulkUpload={() => setIsBulkUploadModalOpen(true)}
            allowRotation={allowRotation}
            onAllowRotationChange={handleAllowRotationChange}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
            <SheetTabs 
                sheets={sheets}
                activeSheetId={activeSheetId}
                onSelectSheet={setActiveSheetId}
                onAddSheet={addSheet}
            />
            <main className="flex-1 bg-gray-200 dark:bg-slate-800 p-8 overflow-auto flex justify-center items-start" onClick={deselectImage}>
                <Canvas
                  ref={canvasRef}
                  sheetSize={activeSheet.sheetSize}
                  images={activeSheet.images}
                  selectedImageIds={selectedImageIds}
                  onSelectImage={handleSelectImage}
                  onUpdateImage={updateImage}
                  isDarkMode={isDarkMode}
                  padding={padding}
                />
            </main>
        </div>
        {primarySelectedImage && (
          <SettingsPanel
            image={primarySelectedImage}
            onUpdate={updateSelectedImages}
            onDelete={deleteSelectedImages}
            onGridFill={handleGridFill}
            onRemoveBackground={removeBackground}
          />
        )}
      </div>
      {isBulkUploadModalOpen && (
        <BulkUploadModal 
            onClose={() => setIsBulkUploadModalOpen(false)}
            onSubmit={handleBulkUpload}
        />
      )}
      {isLoading && <LoadingModal message={loadingMessage} />}
    </div>
  );
};

export default App;
