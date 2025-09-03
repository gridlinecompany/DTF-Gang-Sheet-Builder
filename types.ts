
export interface SheetSize {
  name: string;
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

export interface Sheet {
    id: string;
    name: string;
    sheetSize: SheetSize;
    images: SheetImage[];
}
