
export interface SheetSize {
  width: number; // in inches
  height: number; // in inches
}

export interface SheetImage {
  id: string;
  src: string; // base64 data URL
  originalMimeType: string;
  x: number; // position in pixels on canvas
  y: number; // position in pixels on canvas
  width: number; // size in inches
  height: number; // size in inches
  rotation: number; // degrees
  zIndex: number;
}

export interface Pattern {
  imageSrc: string;
  tileSize: number; // inches
  spacing: number; // inches
  rotationJitter: number; // degrees
}

export interface Sheet {
    id: string;
    name: string;
    sheetSize: SheetSize;
    images: SheetImage[];
    pattern?: Pattern | null;
}
